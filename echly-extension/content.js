"use strict";(()=>{var U1=Object.create;var nm=Object.defineProperty;var F1=Object.getOwnPropertyDescriptor;var B1=Object.getOwnPropertyNames;var q1=Object.getPrototypeOf,z1=Object.prototype.hasOwnProperty;var nT=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,n)=>(typeof require<"u"?require:e)[n]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var H1=(t,e)=>()=>(t&&(e=t(t=0)),e);var Oe=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),G1=(t,e)=>{for(var n in e)nm(t,n,{get:e[n],enumerable:!0})},j1=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of B1(e))!z1.call(t,r)&&r!==n&&nm(t,r,{get:()=>e[r],enumerable:!(a=F1(e,r))||a.enumerable});return t};var he=(t,e,n)=>(n=t!=null?U1(q1(t)):{},j1(e||!t||!t.__esModule?nm(n,"default",{value:t,enumerable:!0}):n,t));var hT=Oe(le=>{"use strict";var sm=Symbol.for("react.transitional.element"),K1=Symbol.for("react.portal"),W1=Symbol.for("react.fragment"),X1=Symbol.for("react.strict_mode"),Q1=Symbol.for("react.profiler"),Y1=Symbol.for("react.consumer"),$1=Symbol.for("react.context"),J1=Symbol.for("react.forward_ref"),Z1=Symbol.for("react.suspense"),ek=Symbol.for("react.memo"),oT=Symbol.for("react.lazy"),tk=Symbol.for("react.activity"),aT=Symbol.iterator;function nk(t){return t===null||typeof t!="object"?null:(t=aT&&t[aT]||t["@@iterator"],typeof t=="function"?t:null)}var uT={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},lT=Object.assign,cT={};function qi(t,e,n){this.props=t,this.context=e,this.refs=cT,this.updater=n||uT}qi.prototype.isReactComponent={};qi.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};qi.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function dT(){}dT.prototype=qi.prototype;function im(t,e,n){this.props=t,this.context=e,this.refs=cT,this.updater=n||uT}var om=im.prototype=new dT;om.constructor=im;lT(om,qi.prototype);om.isPureReactComponent=!0;var rT=Array.isArray;function rm(){}var nt={H:null,A:null,T:null,S:null},fT=Object.prototype.hasOwnProperty;function um(t,e,n){var a=n.ref;return{$$typeof:sm,type:t,key:e,ref:a!==void 0?a:null,props:n}}function ak(t,e){return um(t.type,e,t.props)}function lm(t){return typeof t=="object"&&t!==null&&t.$$typeof===sm}function rk(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var sT=/\/+/g;function am(t,e){return typeof t=="object"&&t!==null&&t.key!=null?rk(""+t.key):e.toString(36)}function sk(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(rm,rm):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function Bi(t,e,n,a,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case sm:case K1:i=!0;break;case oT:return i=t._init,Bi(i(t._payload),e,n,a,r)}}if(i)return r=r(t),i=a===""?"."+am(t,0):a,rT(r)?(n="",i!=null&&(n=i.replace(sT,"$&/")+"/"),Bi(r,e,n,"",function(c){return c})):r!=null&&(lm(r)&&(r=ak(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(sT,"$&/")+"/")+i)),e.push(r)),1;i=0;var u=a===""?".":a+":";if(rT(t))for(var l=0;l<t.length;l++)a=t[l],s=u+am(a,l),i+=Bi(a,e,n,s,r);else if(l=nk(t),typeof l=="function")for(t=l.call(t),l=0;!(a=t.next()).done;)a=a.value,s=u+am(a,l++),i+=Bi(a,e,n,s,r);else if(s==="object"){if(typeof t.then=="function")return Bi(sk(t),e,n,a,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function gd(t,e,n){if(t==null)return t;var a=[],r=0;return Bi(t,a,"","",function(s){return e.call(n,s,r++)}),a}function ik(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var iT=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ok={map:gd,forEach:function(t,e,n){gd(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return gd(t,function(){e++}),e},toArray:function(t){return gd(t,function(e){return e})||[]},only:function(t){if(!lm(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};le.Activity=tk;le.Children=ok;le.Component=qi;le.Fragment=W1;le.Profiler=Q1;le.PureComponent=im;le.StrictMode=X1;le.Suspense=Z1;le.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=nt;le.__COMPILER_RUNTIME={__proto__:null,c:function(t){return nt.H.useMemoCache(t)}};le.cache=function(t){return function(){return t.apply(null,arguments)}};le.cacheSignal=function(){return null};le.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var a=lT({},t.props),r=t.key;if(e!=null)for(s in e.key!==void 0&&(r=""+e.key),e)!fT.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(a[s]=e[s]);var s=arguments.length-2;if(s===1)a.children=n;else if(1<s){for(var i=Array(s),u=0;u<s;u++)i[u]=arguments[u+2];a.children=i}return um(t.type,r,a)};le.createContext=function(t){return t={$$typeof:$1,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:Y1,_context:t},t};le.createElement=function(t,e,n){var a,r={},s=null;if(e!=null)for(a in e.key!==void 0&&(s=""+e.key),e)fT.call(e,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(r[a]=e[a]);var i=arguments.length-2;if(i===1)r.children=n;else if(1<i){for(var u=Array(i),l=0;l<i;l++)u[l]=arguments[l+2];r.children=u}if(t&&t.defaultProps)for(a in i=t.defaultProps,i)r[a]===void 0&&(r[a]=i[a]);return um(t,s,r)};le.createRef=function(){return{current:null}};le.forwardRef=function(t){return{$$typeof:J1,render:t}};le.isValidElement=lm;le.lazy=function(t){return{$$typeof:oT,_payload:{_status:-1,_result:t},_init:ik}};le.memo=function(t,e){return{$$typeof:ek,type:t,compare:e===void 0?null:e}};le.startTransition=function(t){var e=nt.T,n={};nt.T=n;try{var a=t(),r=nt.S;r!==null&&r(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(rm,iT)}catch(s){iT(s)}finally{e!==null&&n.types!==null&&(e.types=n.types),nt.T=e}};le.unstable_useCacheRefresh=function(){return nt.H.useCacheRefresh()};le.use=function(t){return nt.H.use(t)};le.useActionState=function(t,e,n){return nt.H.useActionState(t,e,n)};le.useCallback=function(t,e){return nt.H.useCallback(t,e)};le.useContext=function(t){return nt.H.useContext(t)};le.useDebugValue=function(){};le.useDeferredValue=function(t,e){return nt.H.useDeferredValue(t,e)};le.useEffect=function(t,e){return nt.H.useEffect(t,e)};le.useEffectEvent=function(t){return nt.H.useEffectEvent(t)};le.useId=function(){return nt.H.useId()};le.useImperativeHandle=function(t,e,n){return nt.H.useImperativeHandle(t,e,n)};le.useInsertionEffect=function(t,e){return nt.H.useInsertionEffect(t,e)};le.useLayoutEffect=function(t,e){return nt.H.useLayoutEffect(t,e)};le.useMemo=function(t,e){return nt.H.useMemo(t,e)};le.useOptimistic=function(t,e){return nt.H.useOptimistic(t,e)};le.useReducer=function(t,e,n){return nt.H.useReducer(t,e,n)};le.useRef=function(t){return nt.H.useRef(t)};le.useState=function(t){return nt.H.useState(t)};le.useSyncExternalStore=function(t,e,n){return nt.H.useSyncExternalStore(t,e,n)};le.useTransition=function(){return nt.H.useTransition()};le.version="19.2.3"});var xn=Oe((KF,pT)=>{"use strict";pT.exports=hT()});var ET=Oe(ot=>{"use strict";function hm(t,e){var n=t.length;t.push(e);e:for(;0<n;){var a=n-1>>>1,r=t[a];if(0<yd(r,e))t[a]=e,t[n]=r,n=a;else break e}}function Aa(t){return t.length===0?null:t[0]}function _d(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var a=0,r=t.length,s=r>>>1;a<s;){var i=2*(a+1)-1,u=t[i],l=i+1,c=t[l];if(0>yd(u,n))l<r&&0>yd(c,u)?(t[a]=c,t[l]=n,a=l):(t[a]=u,t[i]=n,a=i);else if(l<r&&0>yd(c,n))t[a]=c,t[l]=n,a=l;else break e}}return e}function yd(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}ot.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(mT=performance,ot.unstable_now=function(){return mT.now()}):(cm=Date,gT=cm.now(),ot.unstable_now=function(){return cm.now()-gT});var mT,cm,gT,ir=[],Jr=[],uk=1,na=null,gn=3,pm=!1,Bu=!1,qu=!1,mm=!1,_T=typeof setTimeout=="function"?setTimeout:null,ST=typeof clearTimeout=="function"?clearTimeout:null,yT=typeof setImmediate<"u"?setImmediate:null;function Id(t){for(var e=Aa(Jr);e!==null;){if(e.callback===null)_d(Jr);else if(e.startTime<=t)_d(Jr),e.sortIndex=e.expirationTime,hm(ir,e);else break;e=Aa(Jr)}}function gm(t){if(qu=!1,Id(t),!Bu)if(Aa(ir)!==null)Bu=!0,Hi||(Hi=!0,zi());else{var e=Aa(Jr);e!==null&&ym(gm,e.startTime-t)}}var Hi=!1,zu=-1,vT=5,TT=-1;function bT(){return mm?!0:!(ot.unstable_now()-TT<vT)}function dm(){if(mm=!1,Hi){var t=ot.unstable_now();TT=t;var e=!0;try{e:{Bu=!1,qu&&(qu=!1,ST(zu),zu=-1),pm=!0;var n=gn;try{t:{for(Id(t),na=Aa(ir);na!==null&&!(na.expirationTime>t&&bT());){var a=na.callback;if(typeof a=="function"){na.callback=null,gn=na.priorityLevel;var r=a(na.expirationTime<=t);if(t=ot.unstable_now(),typeof r=="function"){na.callback=r,Id(t),e=!0;break t}na===Aa(ir)&&_d(ir),Id(t)}else _d(ir);na=Aa(ir)}if(na!==null)e=!0;else{var s=Aa(Jr);s!==null&&ym(gm,s.startTime-t),e=!1}}break e}finally{na=null,gn=n,pm=!1}e=void 0}}finally{e?zi():Hi=!1}}}var zi;typeof yT=="function"?zi=function(){yT(dm)}:typeof MessageChannel<"u"?(fm=new MessageChannel,IT=fm.port2,fm.port1.onmessage=dm,zi=function(){IT.postMessage(null)}):zi=function(){_T(dm,0)};var fm,IT;function ym(t,e){zu=_T(function(){t(ot.unstable_now())},e)}ot.unstable_IdlePriority=5;ot.unstable_ImmediatePriority=1;ot.unstable_LowPriority=4;ot.unstable_NormalPriority=3;ot.unstable_Profiling=null;ot.unstable_UserBlockingPriority=2;ot.unstable_cancelCallback=function(t){t.callback=null};ot.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):vT=0<t?Math.floor(1e3/t):5};ot.unstable_getCurrentPriorityLevel=function(){return gn};ot.unstable_next=function(t){switch(gn){case 1:case 2:case 3:var e=3;break;default:e=gn}var n=gn;gn=e;try{return t()}finally{gn=n}};ot.unstable_requestPaint=function(){mm=!0};ot.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=gn;gn=t;try{return e()}finally{gn=n}};ot.unstable_scheduleCallback=function(t,e,n){var a=ot.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:uk++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>a?(t.sortIndex=n,hm(Jr,t),Aa(ir)===null&&t===Aa(Jr)&&(qu?(ST(zu),zu=-1):qu=!0,ym(gm,n-a))):(t.sortIndex=r,hm(ir,t),Bu||pm||(Bu=!0,Hi||(Hi=!0,zi()))),t};ot.unstable_shouldYield=bT;ot.unstable_wrapCallback=function(t){var e=gn;return function(){var n=gn;gn=e;try{return t.apply(this,arguments)}finally{gn=n}}}});var CT=Oe((XF,wT)=>{"use strict";wT.exports=ET()});var AT=Oe(bn=>{"use strict";var lk=xn();function LT(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Zr(){}var Tn={d:{f:Zr,r:function(){throw Error(LT(522))},D:Zr,C:Zr,L:Zr,m:Zr,X:Zr,S:Zr,M:Zr},p:0,findDOMNode:null},ck=Symbol.for("react.portal");function dk(t,e,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ck,key:a==null?null:""+a,children:t,containerInfo:e,implementation:n}}var Hu=lk.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Sd(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}bn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Tn;bn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(LT(299));return dk(t,e,null,n)};bn.flushSync=function(t){var e=Hu.T,n=Tn.p;try{if(Hu.T=null,Tn.p=2,t)return t()}finally{Hu.T=e,Tn.p=n,Tn.d.f()}};bn.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,Tn.d.C(t,e))};bn.prefetchDNS=function(t){typeof t=="string"&&Tn.d.D(t)};bn.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,a=Sd(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,s=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?Tn.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:a,integrity:r,fetchPriority:s}):n==="script"&&Tn.d.X(t,{crossOrigin:a,integrity:r,fetchPriority:s,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};bn.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Sd(e.as,e.crossOrigin);Tn.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&Tn.d.M(t)};bn.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,a=Sd(n,e.crossOrigin);Tn.d.L(t,n,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};bn.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Sd(e.as,e.crossOrigin);Tn.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else Tn.d.m(t)};bn.requestFormReset=function(t){Tn.d.r(t)};bn.unstable_batchedUpdates=function(t,e){return t(e)};bn.useFormState=function(t,e,n){return Hu.H.useFormState(t,e,n)};bn.useFormStatus=function(){return Hu.H.useHostTransitionStatus()};bn.version="19.2.3"});var vd=Oe((YF,RT)=>{"use strict";function xT(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(xT)}catch(t){console.error(t)}}xT(),RT.exports=AT()});var zC=Oe(Wf=>{"use strict";var qt=CT(),nE=xn(),fk=vd();function V(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function aE(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function xl(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function rE(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function sE(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function kT(t){if(xl(t)!==t)throw Error(V(188))}function hk(t){var e=t.alternate;if(!e){if(e=xl(t),e===null)throw Error(V(188));return e!==t?null:t}for(var n=t,a=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(a=r.return,a!==null){n=a;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return kT(r),t;if(s===a)return kT(r),e;s=s.sibling}throw Error(V(188))}if(n.return!==a.return)n=r,a=s;else{for(var i=!1,u=r.child;u;){if(u===n){i=!0,n=r,a=s;break}if(u===a){i=!0,a=r,n=s;break}u=u.sibling}if(!i){for(u=s.child;u;){if(u===n){i=!0,n=s,a=r;break}if(u===a){i=!0,a=s,n=r;break}u=u.sibling}if(!i)throw Error(V(189))}}if(n.alternate!==a)throw Error(V(190))}if(n.tag!==3)throw Error(V(188));return n.stateNode.current===n?t:e}function iE(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=iE(t),e!==null)return e;t=t.sibling}return null}var st=Object.assign,pk=Symbol.for("react.element"),Td=Symbol.for("react.transitional.element"),$u=Symbol.for("react.portal"),Qi=Symbol.for("react.fragment"),oE=Symbol.for("react.strict_mode"),$m=Symbol.for("react.profiler"),uE=Symbol.for("react.consumer"),pr=Symbol.for("react.context"),Kg=Symbol.for("react.forward_ref"),Jm=Symbol.for("react.suspense"),Zm=Symbol.for("react.suspense_list"),Wg=Symbol.for("react.memo"),es=Symbol.for("react.lazy");Symbol.for("react.scope");var eg=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var mk=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var DT=Symbol.iterator;function Gu(t){return t===null||typeof t!="object"?null:(t=DT&&t[DT]||t["@@iterator"],typeof t=="function"?t:null)}var gk=Symbol.for("react.client.reference");function tg(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===gk?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Qi:return"Fragment";case $m:return"Profiler";case oE:return"StrictMode";case Jm:return"Suspense";case Zm:return"SuspenseList";case eg:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case $u:return"Portal";case pr:return t.displayName||"Context";case uE:return(t._context.displayName||"Context")+".Consumer";case Kg:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Wg:return e=t.displayName||null,e!==null?e:tg(t.type)||"Memo";case es:e=t._payload,t=t._init;try{return tg(t(e))}catch{}}return null}var Ju=Array.isArray,ie=nE.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ve=fk.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Xs={pending:!1,data:null,method:null,action:null},ng=[],Yi=-1;function Pa(t){return{current:t}}function Yt(t){0>Yi||(t.current=ng[Yi],ng[Yi]=null,Yi--)}function Ye(t,e){Yi++,ng[Yi]=t.current,t.current=e}var Da=Pa(null),ml=Pa(null),ds=Pa(null),tf=Pa(null);function nf(t,e){switch(Ye(ds,e),Ye(ml,t),Ye(Da,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?Fb(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=Fb(e),t=AC(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}Yt(Da),Ye(Da,t)}function mo(){Yt(Da),Yt(ml),Yt(ds)}function ag(t){t.memoizedState!==null&&Ye(tf,t);var e=Da.current,n=AC(e,t.type);e!==n&&(Ye(ml,t),Ye(Da,n))}function af(t){ml.current===t&&(Yt(Da),Yt(ml)),tf.current===t&&(Yt(tf),Cl._currentValue=Xs)}var Im,PT;function Gs(t){if(Im===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);Im=e&&e[1]||"",PT=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Im+t+PT}var _m=!1;function Sm(t,e){if(!t||_m)return"";_m=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(e){var m=function(){throw Error()};if(Object.defineProperty(m.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(m,[])}catch(_){var p=_}Reflect.construct(t,[],m)}else{try{m.call()}catch(_){p=_}t.call(m.prototype)}}else{try{throw Error()}catch(_){p=_}(m=t())&&typeof m.catch=="function"&&m.catch(function(){})}}catch(_){if(_&&p&&typeof _.stack=="string")return[_.stack,p.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=a.DetermineComponentFrameRoot(),i=s[0],u=s[1];if(i&&u){var l=i.split(`
`),c=u.split(`
`);for(r=a=0;a<l.length&&!l[a].includes("DetermineComponentFrameRoot");)a++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(a===l.length||r===c.length)for(a=l.length-1,r=c.length-1;1<=a&&0<=r&&l[a]!==c[r];)r--;for(;1<=a&&0<=r;a--,r--)if(l[a]!==c[r]){if(a!==1||r!==1)do if(a--,r--,0>r||l[a]!==c[r]){var f=`
`+l[a].replace(" at new "," at ");return t.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",t.displayName)),f}while(1<=a&&0<=r);break}}}finally{_m=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?Gs(n):""}function yk(t,e){switch(t.tag){case 26:case 27:case 5:return Gs(t.type);case 16:return Gs("Lazy");case 13:return t.child!==e&&e!==null?Gs("Suspense Fallback"):Gs("Suspense");case 19:return Gs("SuspenseList");case 0:case 15:return Sm(t.type,!1);case 11:return Sm(t.type.render,!1);case 1:return Sm(t.type,!0);case 31:return Gs("Activity");default:return""}}function OT(t){try{var e="",n=null;do e+=yk(t,n),n=t,t=t.return;while(t);return e}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var rg=Object.prototype.hasOwnProperty,Xg=qt.unstable_scheduleCallback,vm=qt.unstable_cancelCallback,Ik=qt.unstable_shouldYield,_k=qt.unstable_requestPaint,Qn=qt.unstable_now,Sk=qt.unstable_getCurrentPriorityLevel,lE=qt.unstable_ImmediatePriority,cE=qt.unstable_UserBlockingPriority,rf=qt.unstable_NormalPriority,vk=qt.unstable_LowPriority,dE=qt.unstable_IdlePriority,Tk=qt.log,bk=qt.unstable_setDisableYieldValue,Rl=null,Yn=null;function is(t){if(typeof Tk=="function"&&bk(t),Yn&&typeof Yn.setStrictMode=="function")try{Yn.setStrictMode(Rl,t)}catch{}}var $n=Math.clz32?Math.clz32:Ck,Ek=Math.log,wk=Math.LN2;function Ck(t){return t>>>=0,t===0?32:31-(Ek(t)/wk|0)|0}var bd=256,Ed=262144,wd=4194304;function js(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function kf(t,e,n){var a=t.pendingLanes;if(a===0)return 0;var r=0,s=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var u=a&134217727;return u!==0?(a=u&~s,a!==0?r=js(a):(i&=u,i!==0?r=js(i):n||(n=u&~t,n!==0&&(r=js(n))))):(u=a&~s,u!==0?r=js(u):i!==0?r=js(i):n||(n=a&~t,n!==0&&(r=js(n)))),r===0?0:e!==0&&e!==r&&!(e&s)&&(s=r&-r,n=e&-e,s>=n||s===32&&(n&4194048)!==0)?e:r}function kl(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function Lk(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function fE(){var t=wd;return wd<<=1,!(wd&62914560)&&(wd=4194304),t}function Tm(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Dl(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function Ak(t,e,n,a,r,s){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var u=t.entanglements,l=t.expirationTimes,c=t.hiddenUpdates;for(n=i&~n;0<n;){var f=31-$n(n),m=1<<f;u[f]=0,l[f]=-1;var p=c[f];if(p!==null)for(c[f]=null,f=0;f<p.length;f++){var _=p[f];_!==null&&(_.lane&=-536870913)}n&=~m}a!==0&&hE(t,a,0),s!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=s&~(i&~e))}function hE(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var a=31-$n(e);t.entangledLanes|=e,t.entanglements[a]=t.entanglements[a]|1073741824|n&261930}function pE(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var a=31-$n(n),r=1<<a;r&e|t[a]&e&&(t[a]|=e),n&=~r}}function mE(t,e){var n=e&-e;return n=n&42?1:Qg(n),n&(t.suspendedLanes|e)?0:n}function Qg(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Yg(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function gE(){var t=Ve.p;return t!==0?t:(t=window.event,t===void 0?32:FC(t.type))}function MT(t,e){var n=Ve.p;try{return Ve.p=t,e()}finally{Ve.p=n}}var Es=Math.random().toString(36).slice(2),un="__reactFiber$"+Es,Mn="__reactProps$"+Es,Co="__reactContainer$"+Es,sg="__reactEvents$"+Es,xk="__reactListeners$"+Es,Rk="__reactHandles$"+Es,NT="__reactResources$"+Es,Pl="__reactMarker$"+Es;function $g(t){delete t[un],delete t[Mn],delete t[sg],delete t[xk],delete t[Rk]}function $i(t){var e=t[un];if(e)return e;for(var n=t.parentNode;n;){if(e=n[Co]||n[un]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=Gb(t);t!==null;){if(n=t[un])return n;t=Gb(t)}return e}t=n,n=t.parentNode}return null}function Lo(t){if(t=t[un]||t[Co]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function Zu(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(V(33))}function oo(t){var e=t[NT];return e||(e=t[NT]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Qt(t){t[Pl]=!0}var yE=new Set,IE={};function ri(t,e){go(t,e),go(t+"Capture",e)}function go(t,e){for(IE[t]=e,t=0;t<e.length;t++)yE.add(e[t])}var kk=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),VT={},UT={};function Dk(t){return rg.call(UT,t)?!0:rg.call(VT,t)?!1:kk.test(t)?UT[t]=!0:(VT[t]=!0,!1)}function Bd(t,e,n){if(Dk(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var a=e.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Cd(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function or(t,e,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+a)}}function ra(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function _E(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function Pk(t,e,n){var a=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var r=a.get,s=a.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(i){n=""+i,s.call(this,i)}}),Object.defineProperty(t,e,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function ig(t){if(!t._valueTracker){var e=_E(t)?"checked":"value";t._valueTracker=Pk(t,e,""+t[e])}}function SE(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),a="";return t&&(a=_E(t)?t.checked?"true":"false":t.value),t=a,t!==n?(e.setValue(t),!0):!1}function sf(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var Ok=/[\n"\\]/g;function oa(t){return t.replace(Ok,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function og(t,e,n,a,r,s,i,u){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+ra(e)):t.value!==""+ra(e)&&(t.value=""+ra(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?ug(t,i,ra(e)):n!=null?ug(t,i,ra(n)):a!=null&&t.removeAttribute("value"),r==null&&s!=null&&(t.defaultChecked=!!s),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?t.name=""+ra(u):t.removeAttribute("name")}function vE(t,e,n,a,r,s,i,u){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.type=s),e!=null||n!=null){if(!(s!=="submit"&&s!=="reset"||e!=null)){ig(t);return}n=n!=null?""+ra(n):"",e=e!=null?""+ra(e):n,u||e===t.value||(t.value=e),t.defaultValue=e}a=a??r,a=typeof a!="function"&&typeof a!="symbol"&&!!a,t.checked=u?t.checked:!!a,t.defaultChecked=!!a,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),ig(t)}function ug(t,e,n){e==="number"&&sf(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function uo(t,e,n,a){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&a&&(t[n].defaultSelected=!0)}else{for(n=""+ra(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,a&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function TE(t,e,n){if(e!=null&&(e=""+ra(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+ra(n):""}function bE(t,e,n,a){if(e==null){if(a!=null){if(n!=null)throw Error(V(92));if(Ju(a)){if(1<a.length)throw Error(V(93));a=a[0]}n=a}n==null&&(n=""),e=n}n=ra(e),t.defaultValue=n,a=t.textContent,a===n&&a!==""&&a!==null&&(t.value=a),ig(t)}function yo(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Mk=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function FT(t,e,n){var a=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":a?t.setProperty(e,n):typeof n!="number"||n===0||Mk.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function EE(t,e,n){if(e!=null&&typeof e!="object")throw Error(V(62));if(t=t.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||e!=null&&e.hasOwnProperty(a)||(a.indexOf("--")===0?t.setProperty(a,""):a==="float"?t.cssFloat="":t[a]="");for(var r in e)a=e[r],e.hasOwnProperty(r)&&n[r]!==a&&FT(t,r,a)}else for(var s in e)e.hasOwnProperty(s)&&FT(t,s,e[s])}function Jg(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Nk=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Vk=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function qd(t){return Vk.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function mr(){}var lg=null;function Zg(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Ji=null,lo=null;function BT(t){var e=Lo(t);if(e&&(t=e.stateNode)){var n=t[Mn]||null;e:switch(t=e.stateNode,e.type){case"input":if(og(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+oa(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var a=n[e];if(a!==t&&a.form===t.form){var r=a[Mn]||null;if(!r)throw Error(V(90));og(a,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)a=n[e],a.form===t.form&&SE(a)}break e;case"textarea":TE(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&uo(t,!!n.multiple,e,!1)}}}var bm=!1;function wE(t,e,n){if(bm)return t(e,n);bm=!0;try{var a=t(e);return a}finally{if(bm=!1,(Ji!==null||lo!==null)&&(Hf(),Ji&&(e=Ji,t=lo,lo=Ji=null,BT(e),t)))for(e=0;e<t.length;e++)BT(t[e])}}function gl(t,e){var n=t.stateNode;if(n===null)return null;var a=n[Mn]||null;if(a===null)return null;n=a[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(t=t.type,a=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!a;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(V(231,e,typeof n));return n}var Sr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),cg=!1;if(Sr)try{Gi={},Object.defineProperty(Gi,"passive",{get:function(){cg=!0}}),window.addEventListener("test",Gi,Gi),window.removeEventListener("test",Gi,Gi)}catch{cg=!1}var Gi,os=null,ey=null,zd=null;function CE(){if(zd)return zd;var t,e=ey,n=e.length,a,r="value"in os?os.value:os.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var i=n-t;for(a=1;a<=i&&e[n-a]===r[s-a];a++);return zd=r.slice(t,1<a?1-a:void 0)}function Hd(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Ld(){return!0}function qT(){return!1}function Nn(t){function e(n,a,r,s,i){this._reactName=n,this._targetInst=r,this.type=a,this.nativeEvent=s,this.target=i,this.currentTarget=null;for(var u in t)t.hasOwnProperty(u)&&(n=t[u],this[u]=n?n(s):s[u]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Ld:qT,this.isPropagationStopped=qT,this}return st(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Ld)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Ld)},persist:function(){},isPersistent:Ld}),e}var si={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Df=Nn(si),Ol=st({},si,{view:0,detail:0}),Uk=Nn(Ol),Em,wm,ju,Pf=st({},Ol,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ty,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==ju&&(ju&&t.type==="mousemove"?(Em=t.screenX-ju.screenX,wm=t.screenY-ju.screenY):wm=Em=0,ju=t),Em)},movementY:function(t){return"movementY"in t?t.movementY:wm}}),zT=Nn(Pf),Fk=st({},Pf,{dataTransfer:0}),Bk=Nn(Fk),qk=st({},Ol,{relatedTarget:0}),Cm=Nn(qk),zk=st({},si,{animationName:0,elapsedTime:0,pseudoElement:0}),Hk=Nn(zk),Gk=st({},si,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),jk=Nn(Gk),Kk=st({},si,{data:0}),HT=Nn(Kk),Wk={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Xk={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Qk={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Yk(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Qk[t])?!!e[t]:!1}function ty(){return Yk}var $k=st({},Ol,{key:function(t){if(t.key){var e=Wk[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Hd(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?Xk[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ty,charCode:function(t){return t.type==="keypress"?Hd(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Hd(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Jk=Nn($k),Zk=st({},Pf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),GT=Nn(Zk),eD=st({},Ol,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ty}),tD=Nn(eD),nD=st({},si,{propertyName:0,elapsedTime:0,pseudoElement:0}),aD=Nn(nD),rD=st({},Pf,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),sD=Nn(rD),iD=st({},si,{newState:0,oldState:0}),oD=Nn(iD),uD=[9,13,27,32],ny=Sr&&"CompositionEvent"in window,nl=null;Sr&&"documentMode"in document&&(nl=document.documentMode);var lD=Sr&&"TextEvent"in window&&!nl,LE=Sr&&(!ny||nl&&8<nl&&11>=nl),jT=" ",KT=!1;function AE(t,e){switch(t){case"keyup":return uD.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function xE(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Zi=!1;function cD(t,e){switch(t){case"compositionend":return xE(e);case"keypress":return e.which!==32?null:(KT=!0,jT);case"textInput":return t=e.data,t===jT&&KT?null:t;default:return null}}function dD(t,e){if(Zi)return t==="compositionend"||!ny&&AE(t,e)?(t=CE(),zd=ey=os=null,Zi=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return LE&&e.locale!=="ko"?null:e.data;default:return null}}var fD={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function WT(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!fD[t.type]:e==="textarea"}function RE(t,e,n,a){Ji?lo?lo.push(a):lo=[a]:Ji=a,e=Ef(e,"onChange"),0<e.length&&(n=new Df("onChange","change",null,n,a),t.push({event:n,listeners:e}))}var al=null,yl=null;function hD(t){wC(t,0)}function Of(t){var e=Zu(t);if(SE(e))return t}function XT(t,e){if(t==="change")return e}var kE=!1;Sr&&(Sr?(xd="oninput"in document,xd||(Lm=document.createElement("div"),Lm.setAttribute("oninput","return;"),xd=typeof Lm.oninput=="function"),Ad=xd):Ad=!1,kE=Ad&&(!document.documentMode||9<document.documentMode));var Ad,xd,Lm;function QT(){al&&(al.detachEvent("onpropertychange",DE),yl=al=null)}function DE(t){if(t.propertyName==="value"&&Of(yl)){var e=[];RE(e,yl,t,Zg(t)),wE(hD,e)}}function pD(t,e,n){t==="focusin"?(QT(),al=e,yl=n,al.attachEvent("onpropertychange",DE)):t==="focusout"&&QT()}function mD(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Of(yl)}function gD(t,e){if(t==="click")return Of(e)}function yD(t,e){if(t==="input"||t==="change")return Of(e)}function ID(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Zn=typeof Object.is=="function"?Object.is:ID;function Il(t,e){if(Zn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),a=Object.keys(e);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var r=n[a];if(!rg.call(e,r)||!Zn(t[r],e[r]))return!1}return!0}function YT(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function $T(t,e){var n=YT(t);t=0;for(var a;n;){if(n.nodeType===3){if(a=t+n.textContent.length,t<=e&&a>=e)return{node:n,offset:e-t};t=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=YT(n)}}function PE(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?PE(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function OE(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=sf(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=sf(t.document)}return e}function ay(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var _D=Sr&&"documentMode"in document&&11>=document.documentMode,eo=null,dg=null,rl=null,fg=!1;function JT(t,e,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;fg||eo==null||eo!==sf(a)||(a=eo,"selectionStart"in a&&ay(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),rl&&Il(rl,a)||(rl=a,a=Ef(dg,"onSelect"),0<a.length&&(e=new Df("onSelect","select",null,e,n),t.push({event:e,listeners:a}),e.target=eo)))}function Hs(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var to={animationend:Hs("Animation","AnimationEnd"),animationiteration:Hs("Animation","AnimationIteration"),animationstart:Hs("Animation","AnimationStart"),transitionrun:Hs("Transition","TransitionRun"),transitionstart:Hs("Transition","TransitionStart"),transitioncancel:Hs("Transition","TransitionCancel"),transitionend:Hs("Transition","TransitionEnd")},Am={},ME={};Sr&&(ME=document.createElement("div").style,"AnimationEvent"in window||(delete to.animationend.animation,delete to.animationiteration.animation,delete to.animationstart.animation),"TransitionEvent"in window||delete to.transitionend.transition);function ii(t){if(Am[t])return Am[t];if(!to[t])return t;var e=to[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in ME)return Am[t]=e[n];return t}var NE=ii("animationend"),VE=ii("animationiteration"),UE=ii("animationstart"),SD=ii("transitionrun"),vD=ii("transitionstart"),TD=ii("transitioncancel"),FE=ii("transitionend"),BE=new Map,hg="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");hg.push("scrollEnd");function _a(t,e){BE.set(t,e),ri(e,[t])}var of=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},aa=[],no=0,ry=0;function Mf(){for(var t=no,e=ry=no=0;e<t;){var n=aa[e];aa[e++]=null;var a=aa[e];aa[e++]=null;var r=aa[e];aa[e++]=null;var s=aa[e];if(aa[e++]=null,a!==null&&r!==null){var i=a.pending;i===null?r.next=r:(r.next=i.next,i.next=r),a.pending=r}s!==0&&qE(n,r,s)}}function Nf(t,e,n,a){aa[no++]=t,aa[no++]=e,aa[no++]=n,aa[no++]=a,ry|=a,t.lanes|=a,t=t.alternate,t!==null&&(t.lanes|=a)}function sy(t,e,n,a){return Nf(t,e,n,a),uf(t)}function oi(t,e){return Nf(t,null,null,e),uf(t)}function qE(t,e,n){t.lanes|=n;var a=t.alternate;a!==null&&(a.lanes|=n);for(var r=!1,s=t.return;s!==null;)s.childLanes|=n,a=s.alternate,a!==null&&(a.childLanes|=n),s.tag===22&&(t=s.stateNode,t===null||t._visibility&1||(r=!0)),t=s,s=s.return;return t.tag===3?(s=t.stateNode,r&&e!==null&&(r=31-$n(n),t=s.hiddenUpdates,a=t[r],a===null?t[r]=[e]:a.push(e),e.lane=n|536870912),s):null}function uf(t){if(50<hl)throw hl=0,Og=null,Error(V(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var ao={};function bD(t,e,n,a){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Wn(t,e,n,a){return new bD(t,e,n,a)}function iy(t){return t=t.prototype,!(!t||!t.isReactComponent)}function yr(t,e){var n=t.alternate;return n===null?(n=Wn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function zE(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Gd(t,e,n,a,r,s){var i=0;if(a=t,typeof t=="function")iy(t)&&(i=1);else if(typeof t=="string")i=CP(t,n,Da.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case eg:return t=Wn(31,n,e,r),t.elementType=eg,t.lanes=s,t;case Qi:return Qs(n.children,r,s,e);case oE:i=8,r|=24;break;case $m:return t=Wn(12,n,e,r|2),t.elementType=$m,t.lanes=s,t;case Jm:return t=Wn(13,n,e,r),t.elementType=Jm,t.lanes=s,t;case Zm:return t=Wn(19,n,e,r),t.elementType=Zm,t.lanes=s,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case pr:i=10;break e;case uE:i=9;break e;case Kg:i=11;break e;case Wg:i=14;break e;case es:i=16,a=null;break e}i=29,n=Error(V(130,t===null?"null":typeof t,"")),a=null}return e=Wn(i,n,e,r),e.elementType=t,e.type=a,e.lanes=s,e}function Qs(t,e,n,a){return t=Wn(7,t,a,e),t.lanes=n,t}function xm(t,e,n){return t=Wn(6,t,null,e),t.lanes=n,t}function HE(t){var e=Wn(18,null,null,0);return e.stateNode=t,e}function Rm(t,e,n){return e=Wn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var ZT=new WeakMap;function ua(t,e){if(typeof t=="object"&&t!==null){var n=ZT.get(t);return n!==void 0?n:(e={value:t,source:e,stack:OT(e)},ZT.set(t,e),e)}return{value:t,source:e,stack:OT(e)}}var ro=[],so=0,lf=null,_l=0,sa=[],ia=0,Ss=null,xa=1,Ra="";function fr(t,e){ro[so++]=_l,ro[so++]=lf,lf=t,_l=e}function GE(t,e,n){sa[ia++]=xa,sa[ia++]=Ra,sa[ia++]=Ss,Ss=t;var a=xa;t=Ra;var r=32-$n(a)-1;a&=~(1<<r),n+=1;var s=32-$n(e)+r;if(30<s){var i=r-r%5;s=(a&(1<<i)-1).toString(32),a>>=i,r-=i,xa=1<<32-$n(e)+r|n<<r|a,Ra=s+t}else xa=1<<s|n<<r|a,Ra=t}function oy(t){t.return!==null&&(fr(t,1),GE(t,1,0))}function uy(t){for(;t===lf;)lf=ro[--so],ro[so]=null,_l=ro[--so],ro[so]=null;for(;t===Ss;)Ss=sa[--ia],sa[ia]=null,Ra=sa[--ia],sa[ia]=null,xa=sa[--ia],sa[ia]=null}function jE(t,e){sa[ia++]=xa,sa[ia++]=Ra,sa[ia++]=Ss,xa=e.id,Ra=e.overflow,Ss=t}var ln=null,rt=null,Le=!1,fs=null,la=!1,pg=Error(V(519));function vs(t){var e=Error(V(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Sl(ua(e,t)),pg}function eb(t){var e=t.stateNode,n=t.type,a=t.memoizedProps;switch(e[un]=t,e[Mn]=a,n){case"dialog":Ee("cancel",e),Ee("close",e);break;case"iframe":case"object":case"embed":Ee("load",e);break;case"video":case"audio":for(n=0;n<El.length;n++)Ee(El[n],e);break;case"source":Ee("error",e);break;case"img":case"image":case"link":Ee("error",e),Ee("load",e);break;case"details":Ee("toggle",e);break;case"input":Ee("invalid",e),vE(e,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":Ee("invalid",e);break;case"textarea":Ee("invalid",e),bE(e,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||a.suppressHydrationWarning===!0||LC(e.textContent,n)?(a.popover!=null&&(Ee("beforetoggle",e),Ee("toggle",e)),a.onScroll!=null&&Ee("scroll",e),a.onScrollEnd!=null&&Ee("scrollend",e),a.onClick!=null&&(e.onclick=mr),e=!0):e=!1,e||vs(t,!0)}function tb(t){for(ln=t.return;ln;)switch(ln.tag){case 5:case 31:case 13:la=!1;return;case 27:case 3:la=!0;return;default:ln=ln.return}}function ji(t){if(t!==ln)return!1;if(!Le)return tb(t),Le=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||Fg(t.type,t.memoizedProps)),n=!n),n&&rt&&vs(t),tb(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(317));rt=Hb(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(317));rt=Hb(t)}else e===27?(e=rt,ws(t.type)?(t=Hg,Hg=null,rt=t):rt=e):rt=ln?da(t.stateNode.nextSibling):null;return!0}function Zs(){rt=ln=null,Le=!1}function km(){var t=fs;return t!==null&&(Pn===null?Pn=t:Pn.push.apply(Pn,t),fs=null),t}function Sl(t){fs===null?fs=[t]:fs.push(t)}var mg=Pa(null),ui=null,gr=null;function ns(t,e,n){Ye(mg,e._currentValue),e._currentValue=n}function Ir(t){t._currentValue=mg.current,Yt(mg)}function gg(t,e,n){for(;t!==null;){var a=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,a!==null&&(a.childLanes|=e)):a!==null&&(a.childLanes&e)!==e&&(a.childLanes|=e),t===n)break;t=t.return}}function yg(t,e,n,a){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var s=r.dependencies;if(s!==null){var i=r.child;s=s.firstContext;e:for(;s!==null;){var u=s;s=r;for(var l=0;l<e.length;l++)if(u.context===e[l]){s.lanes|=n,u=s.alternate,u!==null&&(u.lanes|=n),gg(s.return,n,t),a||(i=null);break e}s=u.next}}else if(r.tag===18){if(i=r.return,i===null)throw Error(V(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),gg(i,n,t),i=null}else i=r.child;if(i!==null)i.return=r;else for(i=r;i!==null;){if(i===t){i=null;break}if(r=i.sibling,r!==null){r.return=i.return,i=r;break}i=i.return}r=i}}function Ao(t,e,n,a){t=null;for(var r=e,s=!1;r!==null;){if(!s){if(r.flags&524288)s=!0;else if(r.flags&262144)break}if(r.tag===10){var i=r.alternate;if(i===null)throw Error(V(387));if(i=i.memoizedProps,i!==null){var u=r.type;Zn(r.pendingProps.value,i.value)||(t!==null?t.push(u):t=[u])}}else if(r===tf.current){if(i=r.alternate,i===null)throw Error(V(387));i.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(Cl):t=[Cl])}r=r.return}t!==null&&yg(e,t,n,a),e.flags|=262144}function cf(t){for(t=t.firstContext;t!==null;){if(!Zn(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function ei(t){ui=t,gr=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function cn(t){return KE(ui,t)}function Rd(t,e){return ui===null&&ei(t),KE(t,e)}function KE(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},gr===null){if(t===null)throw Error(V(308));gr=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else gr=gr.next=e;return n}var ED=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,a){t.push(a)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},wD=qt.unstable_scheduleCallback,CD=qt.unstable_NormalPriority,kt={$$typeof:pr,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function ly(){return{controller:new ED,data:new Map,refCount:0}}function Ml(t){t.refCount--,t.refCount===0&&wD(CD,function(){t.controller.abort()})}var sl=null,Ig=0,Io=0,co=null;function LD(t,e){if(sl===null){var n=sl=[];Ig=0,Io=Oy(),co={status:"pending",value:void 0,then:function(a){n.push(a)}}}return Ig++,e.then(nb,nb),e}function nb(){if(--Ig===0&&sl!==null){co!==null&&(co.status="fulfilled");var t=sl;sl=null,Io=0,co=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function AD(t,e){var n=[],a={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){a.status="fulfilled",a.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(a.status="rejected",a.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),a}var ab=ie.S;ie.S=function(t,e){iC=Qn(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&LD(t,e),ab!==null&&ab(t,e)};var Ys=Pa(null);function cy(){var t=Ys.current;return t!==null?t:je.pooledCache}function jd(t,e){e===null?Ye(Ys,Ys.current):Ye(Ys,e.pool)}function WE(){var t=cy();return t===null?null:{parent:kt._currentValue,pool:t}}var xo=Error(V(460)),dy=Error(V(474)),Vf=Error(V(542)),df={then:function(){}};function rb(t){return t=t.status,t==="fulfilled"||t==="rejected"}function XE(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(mr,mr),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,ib(t),t;default:if(typeof e.status=="string")e.then(mr,mr);else{if(t=je,t!==null&&100<t.shellSuspendCounter)throw Error(V(482));t=e,t.status="pending",t.then(function(a){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=a}},function(a){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=a}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,ib(t),t}throw $s=e,xo}}function Ks(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?($s=n,xo):n}}var $s=null;function sb(){if($s===null)throw Error(V(459));var t=$s;return $s=null,t}function ib(t){if(t===xo||t===Vf)throw Error(V(483))}var fo=null,vl=0;function kd(t){var e=vl;return vl+=1,fo===null&&(fo=[]),XE(fo,t,e)}function Ku(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Dd(t,e){throw e.$$typeof===pk?Error(V(525)):(t=Object.prototype.toString.call(e),Error(V(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function QE(t){function e(T,I){if(t){var w=T.deletions;w===null?(T.deletions=[I],T.flags|=16):w.push(I)}}function n(T,I){if(!t)return null;for(;I!==null;)e(T,I),I=I.sibling;return null}function a(T){for(var I=new Map;T!==null;)T.key!==null?I.set(T.key,T):I.set(T.index,T),T=T.sibling;return I}function r(T,I){return T=yr(T,I),T.index=0,T.sibling=null,T}function s(T,I,w){return T.index=w,t?(w=T.alternate,w!==null?(w=w.index,w<I?(T.flags|=67108866,I):w):(T.flags|=67108866,I)):(T.flags|=1048576,I)}function i(T){return t&&T.alternate===null&&(T.flags|=67108866),T}function u(T,I,w,x){return I===null||I.tag!==6?(I=xm(w,T.mode,x),I.return=T,I):(I=r(I,w),I.return=T,I)}function l(T,I,w,x){var H=w.type;return H===Qi?f(T,I,w.props.children,x,w.key):I!==null&&(I.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===es&&Ks(H)===I.type)?(I=r(I,w.props),Ku(I,w),I.return=T,I):(I=Gd(w.type,w.key,w.props,null,T.mode,x),Ku(I,w),I.return=T,I)}function c(T,I,w,x){return I===null||I.tag!==4||I.stateNode.containerInfo!==w.containerInfo||I.stateNode.implementation!==w.implementation?(I=Rm(w,T.mode,x),I.return=T,I):(I=r(I,w.children||[]),I.return=T,I)}function f(T,I,w,x,H){return I===null||I.tag!==7?(I=Qs(w,T.mode,x,H),I.return=T,I):(I=r(I,w),I.return=T,I)}function m(T,I,w){if(typeof I=="string"&&I!==""||typeof I=="number"||typeof I=="bigint")return I=xm(""+I,T.mode,w),I.return=T,I;if(typeof I=="object"&&I!==null){switch(I.$$typeof){case Td:return w=Gd(I.type,I.key,I.props,null,T.mode,w),Ku(w,I),w.return=T,w;case $u:return I=Rm(I,T.mode,w),I.return=T,I;case es:return I=Ks(I),m(T,I,w)}if(Ju(I)||Gu(I))return I=Qs(I,T.mode,w,null),I.return=T,I;if(typeof I.then=="function")return m(T,kd(I),w);if(I.$$typeof===pr)return m(T,Rd(T,I),w);Dd(T,I)}return null}function p(T,I,w,x){var H=I!==null?I.key:null;if(typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint")return H!==null?null:u(T,I,""+w,x);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Td:return w.key===H?l(T,I,w,x):null;case $u:return w.key===H?c(T,I,w,x):null;case es:return w=Ks(w),p(T,I,w,x)}if(Ju(w)||Gu(w))return H!==null?null:f(T,I,w,x,null);if(typeof w.then=="function")return p(T,I,kd(w),x);if(w.$$typeof===pr)return p(T,I,Rd(T,w),x);Dd(T,w)}return null}function _(T,I,w,x,H){if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return T=T.get(w)||null,u(I,T,""+x,H);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Td:return T=T.get(x.key===null?w:x.key)||null,l(I,T,x,H);case $u:return T=T.get(x.key===null?w:x.key)||null,c(I,T,x,H);case es:return x=Ks(x),_(T,I,w,x,H)}if(Ju(x)||Gu(x))return T=T.get(w)||null,f(I,T,x,H,null);if(typeof x.then=="function")return _(T,I,w,kd(x),H);if(x.$$typeof===pr)return _(T,I,w,Rd(I,x),H);Dd(I,x)}return null}function R(T,I,w,x){for(var H=null,j=null,S=I,g=I=0,v=null;S!==null&&g<w.length;g++){S.index>g?(v=S,S=null):v=S.sibling;var b=p(T,S,w[g],x);if(b===null){S===null&&(S=v);break}t&&S&&b.alternate===null&&e(T,S),I=s(b,I,g),j===null?H=b:j.sibling=b,j=b,S=v}if(g===w.length)return n(T,S),Le&&fr(T,g),H;if(S===null){for(;g<w.length;g++)S=m(T,w[g],x),S!==null&&(I=s(S,I,g),j===null?H=S:j.sibling=S,j=S);return Le&&fr(T,g),H}for(S=a(S);g<w.length;g++)v=_(S,T,g,w[g],x),v!==null&&(t&&v.alternate!==null&&S.delete(v.key===null?g:v.key),I=s(v,I,g),j===null?H=v:j.sibling=v,j=v);return t&&S.forEach(function(C){return e(T,C)}),Le&&fr(T,g),H}function D(T,I,w,x){if(w==null)throw Error(V(151));for(var H=null,j=null,S=I,g=I=0,v=null,b=w.next();S!==null&&!b.done;g++,b=w.next()){S.index>g?(v=S,S=null):v=S.sibling;var C=p(T,S,b.value,x);if(C===null){S===null&&(S=v);break}t&&S&&C.alternate===null&&e(T,S),I=s(C,I,g),j===null?H=C:j.sibling=C,j=C,S=v}if(b.done)return n(T,S),Le&&fr(T,g),H;if(S===null){for(;!b.done;g++,b=w.next())b=m(T,b.value,x),b!==null&&(I=s(b,I,g),j===null?H=b:j.sibling=b,j=b);return Le&&fr(T,g),H}for(S=a(S);!b.done;g++,b=w.next())b=_(S,T,g,b.value,x),b!==null&&(t&&b.alternate!==null&&S.delete(b.key===null?g:b.key),I=s(b,I,g),j===null?H=b:j.sibling=b,j=b);return t&&S.forEach(function(A){return e(T,A)}),Le&&fr(T,g),H}function L(T,I,w,x){if(typeof w=="object"&&w!==null&&w.type===Qi&&w.key===null&&(w=w.props.children),typeof w=="object"&&w!==null){switch(w.$$typeof){case Td:e:{for(var H=w.key;I!==null;){if(I.key===H){if(H=w.type,H===Qi){if(I.tag===7){n(T,I.sibling),x=r(I,w.props.children),x.return=T,T=x;break e}}else if(I.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===es&&Ks(H)===I.type){n(T,I.sibling),x=r(I,w.props),Ku(x,w),x.return=T,T=x;break e}n(T,I);break}else e(T,I);I=I.sibling}w.type===Qi?(x=Qs(w.props.children,T.mode,x,w.key),x.return=T,T=x):(x=Gd(w.type,w.key,w.props,null,T.mode,x),Ku(x,w),x.return=T,T=x)}return i(T);case $u:e:{for(H=w.key;I!==null;){if(I.key===H)if(I.tag===4&&I.stateNode.containerInfo===w.containerInfo&&I.stateNode.implementation===w.implementation){n(T,I.sibling),x=r(I,w.children||[]),x.return=T,T=x;break e}else{n(T,I);break}else e(T,I);I=I.sibling}x=Rm(w,T.mode,x),x.return=T,T=x}return i(T);case es:return w=Ks(w),L(T,I,w,x)}if(Ju(w))return R(T,I,w,x);if(Gu(w)){if(H=Gu(w),typeof H!="function")throw Error(V(150));return w=H.call(w),D(T,I,w,x)}if(typeof w.then=="function")return L(T,I,kd(w),x);if(w.$$typeof===pr)return L(T,I,Rd(T,w),x);Dd(T,w)}return typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint"?(w=""+w,I!==null&&I.tag===6?(n(T,I.sibling),x=r(I,w),x.return=T,T=x):(n(T,I),x=xm(w,T.mode,x),x.return=T,T=x),i(T)):n(T,I)}return function(T,I,w,x){try{vl=0;var H=L(T,I,w,x);return fo=null,H}catch(S){if(S===xo||S===Vf)throw S;var j=Wn(29,S,null,T.mode);return j.lanes=x,j.return=T,j}finally{}}}var ti=QE(!0),YE=QE(!1),ts=!1;function fy(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function _g(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function hs(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function ps(t,e,n){var a=t.updateQueue;if(a===null)return null;if(a=a.shared,Ne&2){var r=a.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),a.pending=e,e=uf(t),qE(t,null,n),e}return Nf(t,a,e,n),uf(t)}function il(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,pE(t,n)}}function Dm(t,e){var n=t.updateQueue,a=t.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};s===null?r=s=i:s=s.next=i,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:a.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:a.shared,callbacks:a.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var Sg=!1;function ol(){if(Sg){var t=co;if(t!==null)throw t}}function ul(t,e,n,a){Sg=!1;var r=t.updateQueue;ts=!1;var s=r.firstBaseUpdate,i=r.lastBaseUpdate,u=r.shared.pending;if(u!==null){r.shared.pending=null;var l=u,c=l.next;l.next=null,i===null?s=c:i.next=c,i=l;var f=t.alternate;f!==null&&(f=f.updateQueue,u=f.lastBaseUpdate,u!==i&&(u===null?f.firstBaseUpdate=c:u.next=c,f.lastBaseUpdate=l))}if(s!==null){var m=r.baseState;i=0,f=c=l=null,u=s;do{var p=u.lane&-536870913,_=p!==u.lane;if(_?(Ce&p)===p:(a&p)===p){p!==0&&p===Io&&(Sg=!0),f!==null&&(f=f.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var R=t,D=u;p=e;var L=n;switch(D.tag){case 1:if(R=D.payload,typeof R=="function"){m=R.call(L,m,p);break e}m=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=D.payload,p=typeof R=="function"?R.call(L,m,p):R,p==null)break e;m=st({},m,p);break e;case 2:ts=!0}}p=u.callback,p!==null&&(t.flags|=64,_&&(t.flags|=8192),_=r.callbacks,_===null?r.callbacks=[p]:_.push(p))}else _={lane:p,tag:u.tag,payload:u.payload,callback:u.callback,next:null},f===null?(c=f=_,l=m):f=f.next=_,i|=p;if(u=u.next,u===null){if(u=r.shared.pending,u===null)break;_=u,u=_.next,_.next=null,r.lastBaseUpdate=_,r.shared.pending=null}}while(!0);f===null&&(l=m),r.baseState=l,r.firstBaseUpdate=c,r.lastBaseUpdate=f,s===null&&(r.shared.lanes=0),bs|=i,t.lanes=i,t.memoizedState=m}}function $E(t,e){if(typeof t!="function")throw Error(V(191,t));t.call(e)}function JE(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)$E(n[t],e)}var _o=Pa(null),ff=Pa(0);function ob(t,e){t=Er,Ye(ff,t),Ye(_o,e),Er=t|e.baseLanes}function vg(){Ye(ff,Er),Ye(_o,_o.current)}function hy(){Er=ff.current,Yt(_o),Yt(ff)}var ea=Pa(null),ca=null;function as(t){var e=t.alternate;Ye(Et,Et.current&1),Ye(ea,t),ca===null&&(e===null||_o.current!==null||e.memoizedState!==null)&&(ca=t)}function Tg(t){Ye(Et,Et.current),Ye(ea,t),ca===null&&(ca=t)}function ZE(t){t.tag===22?(Ye(Et,Et.current),Ye(ea,t),ca===null&&(ca=t)):rs(t)}function rs(){Ye(Et,Et.current),Ye(ea,ea.current)}function Kn(t){Yt(ea),ca===t&&(ca=null),Yt(Et)}var Et=Pa(0);function hf(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||qg(n)||zg(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var vr=0,ce=null,ze=null,xt=null,pf=!1,ho=!1,ni=!1,mf=0,Tl=0,po=null,xD=0;function Tt(){throw Error(V(321))}function py(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Zn(t[n],e[n]))return!1;return!0}function my(t,e,n,a,r,s){return vr=s,ce=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,ie.H=t===null||t.memoizedState===null?Rw:Cy,ni=!1,s=n(a,r),ni=!1,ho&&(s=tw(e,n,a,r)),ew(t),s}function ew(t){ie.H=bl;var e=ze!==null&&ze.next!==null;if(vr=0,xt=ze=ce=null,pf=!1,Tl=0,po=null,e)throw Error(V(300));t===null||Dt||(t=t.dependencies,t!==null&&cf(t)&&(Dt=!0))}function tw(t,e,n,a){ce=t;var r=0;do{if(ho&&(po=null),Tl=0,ho=!1,25<=r)throw Error(V(301));if(r+=1,xt=ze=null,t.updateQueue!=null){var s=t.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}ie.H=kw,s=e(n,a)}while(ho);return s}function RD(){var t=ie.H,e=t.useState()[0];return e=typeof e.then=="function"?Nl(e):e,t=t.useState()[0],(ze!==null?ze.memoizedState:null)!==t&&(ce.flags|=1024),e}function gy(){var t=mf!==0;return mf=0,t}function yy(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function Iy(t){if(pf){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}pf=!1}vr=0,xt=ze=ce=null,ho=!1,Tl=mf=0,po=null}function En(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return xt===null?ce.memoizedState=xt=t:xt=xt.next=t,xt}function wt(){if(ze===null){var t=ce.alternate;t=t!==null?t.memoizedState:null}else t=ze.next;var e=xt===null?ce.memoizedState:xt.next;if(e!==null)xt=e,ze=t;else{if(t===null)throw ce.alternate===null?Error(V(467)):Error(V(310));ze=t,t={memoizedState:ze.memoizedState,baseState:ze.baseState,baseQueue:ze.baseQueue,queue:ze.queue,next:null},xt===null?ce.memoizedState=xt=t:xt=xt.next=t}return xt}function Uf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Nl(t){var e=Tl;return Tl+=1,po===null&&(po=[]),t=XE(po,t,e),e=ce,(xt===null?e.memoizedState:xt.next)===null&&(e=e.alternate,ie.H=e===null||e.memoizedState===null?Rw:Cy),t}function Ff(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Nl(t);if(t.$$typeof===pr)return cn(t)}throw Error(V(438,String(t)))}function _y(t){var e=null,n=ce.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var a=ce.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(e={data:a.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Uf(),ce.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),a=0;a<t;a++)n[a]=mk;return e.index++,n}function Tr(t,e){return typeof e=="function"?e(t):e}function Kd(t){var e=wt();return Sy(e,ze,t)}function Sy(t,e,n){var a=t.queue;if(a===null)throw Error(V(311));a.lastRenderedReducer=n;var r=t.baseQueue,s=a.pending;if(s!==null){if(r!==null){var i=r.next;r.next=s.next,s.next=i}e.baseQueue=r=s,a.pending=null}if(s=t.baseState,r===null)t.memoizedState=s;else{e=r.next;var u=i=null,l=null,c=e,f=!1;do{var m=c.lane&-536870913;if(m!==c.lane?(Ce&m)===m:(vr&m)===m){var p=c.revertLane;if(p===0)l!==null&&(l=l.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),m===Io&&(f=!0);else if((vr&p)===p){c=c.next,p===Io&&(f=!0);continue}else m={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=m,i=s):l=l.next=m,ce.lanes|=p,bs|=p;m=c.action,ni&&n(s,m),s=c.hasEagerState?c.eagerState:n(s,m)}else p={lane:m,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},l===null?(u=l=p,i=s):l=l.next=p,ce.lanes|=m,bs|=m;c=c.next}while(c!==null&&c!==e);if(l===null?i=s:l.next=u,!Zn(s,t.memoizedState)&&(Dt=!0,f&&(n=co,n!==null)))throw n;t.memoizedState=s,t.baseState=i,t.baseQueue=l,a.lastRenderedState=s}return r===null&&(a.lanes=0),[t.memoizedState,a.dispatch]}function Pm(t){var e=wt(),n=e.queue;if(n===null)throw Error(V(311));n.lastRenderedReducer=t;var a=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var i=r=r.next;do s=t(s,i.action),i=i.next;while(i!==r);Zn(s,e.memoizedState)||(Dt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,a]}function nw(t,e,n){var a=ce,r=wt(),s=Le;if(s){if(n===void 0)throw Error(V(407));n=n()}else n=e();var i=!Zn((ze||r).memoizedState,n);if(i&&(r.memoizedState=n,Dt=!0),r=r.queue,vy(sw.bind(null,a,r,t),[t]),r.getSnapshot!==e||i||xt!==null&&xt.memoizedState.tag&1){if(a.flags|=2048,So(9,{destroy:void 0},rw.bind(null,a,r,n,e),null),je===null)throw Error(V(349));s||vr&127||aw(a,e,n)}return n}function aw(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=ce.updateQueue,e===null?(e=Uf(),ce.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function rw(t,e,n,a){e.value=n,e.getSnapshot=a,iw(e)&&ow(t)}function sw(t,e,n){return n(function(){iw(e)&&ow(t)})}function iw(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Zn(t,n)}catch{return!0}}function ow(t){var e=oi(t,2);e!==null&&On(e,t,2)}function bg(t){var e=En();if(typeof t=="function"){var n=t;if(t=n(),ni){is(!0);try{n()}finally{is(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Tr,lastRenderedState:t},e}function uw(t,e,n,a){return t.baseState=n,Sy(t,ze,typeof a=="function"?a:Tr)}function kD(t,e,n,a,r){if(qf(t))throw Error(V(485));if(t=e.action,t!==null){var s={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){s.listeners.push(i)}};ie.T!==null?n(!0):s.isTransition=!1,a(s),n=e.pending,n===null?(s.next=e.pending=s,lw(e,s)):(s.next=n.next,e.pending=n.next=s)}}function lw(t,e){var n=e.action,a=e.payload,r=t.state;if(e.isTransition){var s=ie.T,i={};ie.T=i;try{var u=n(r,a),l=ie.S;l!==null&&l(i,u),ub(t,e,u)}catch(c){Eg(t,e,c)}finally{s!==null&&i.types!==null&&(s.types=i.types),ie.T=s}}else try{s=n(r,a),ub(t,e,s)}catch(c){Eg(t,e,c)}}function ub(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){lb(t,e,a)},function(a){return Eg(t,e,a)}):lb(t,e,n)}function lb(t,e,n){e.status="fulfilled",e.value=n,cw(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,lw(t,n)))}function Eg(t,e,n){var a=t.pending;if(t.pending=null,a!==null){a=a.next;do e.status="rejected",e.reason=n,cw(e),e=e.next;while(e!==a)}t.action=null}function cw(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function dw(t,e){return e}function cb(t,e){if(Le){var n=je.formState;if(n!==null){e:{var a=ce;if(Le){if(rt){t:{for(var r=rt,s=la;r.nodeType!==8;){if(!s){r=null;break t}if(r=da(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){rt=da(r.nextSibling),a=r.data==="F!";break e}}vs(a)}a=!1}a&&(e=n[0])}}return n=En(),n.memoizedState=n.baseState=e,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:dw,lastRenderedState:e},n.queue=a,n=Lw.bind(null,ce,a),a.dispatch=n,a=bg(!1),s=wy.bind(null,ce,!1,a.queue),a=En(),r={state:e,dispatch:null,action:t,pending:null},a.queue=r,n=kD.bind(null,ce,r,s,n),r.dispatch=n,a.memoizedState=t,[e,n,!1]}function db(t){var e=wt();return fw(e,ze,t)}function fw(t,e,n){if(e=Sy(t,e,dw)[0],t=Kd(Tr)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var a=Nl(e)}catch(i){throw i===xo?Vf:i}else a=e;e=wt();var r=e.queue,s=r.dispatch;return n!==e.memoizedState&&(ce.flags|=2048,So(9,{destroy:void 0},DD.bind(null,r,n),null)),[a,s,t]}function DD(t,e){t.action=e}function fb(t){var e=wt(),n=ze;if(n!==null)return fw(e,n,t);wt(),e=e.memoizedState,n=wt();var a=n.queue.dispatch;return n.memoizedState=t,[e,a,!1]}function So(t,e,n,a){return t={tag:t,create:n,deps:a,inst:e,next:null},e=ce.updateQueue,e===null&&(e=Uf(),ce.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(a=n.next,n.next=t,t.next=a,e.lastEffect=t),t}function hw(){return wt().memoizedState}function Wd(t,e,n,a){var r=En();ce.flags|=t,r.memoizedState=So(1|e,{destroy:void 0},n,a===void 0?null:a)}function Bf(t,e,n,a){var r=wt();a=a===void 0?null:a;var s=r.memoizedState.inst;ze!==null&&a!==null&&py(a,ze.memoizedState.deps)?r.memoizedState=So(e,s,n,a):(ce.flags|=t,r.memoizedState=So(1|e,s,n,a))}function hb(t,e){Wd(8390656,8,t,e)}function vy(t,e){Bf(2048,8,t,e)}function PD(t){ce.flags|=4;var e=ce.updateQueue;if(e===null)e=Uf(),ce.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function pw(t){var e=wt().memoizedState;return PD({ref:e,nextImpl:t}),function(){if(Ne&2)throw Error(V(440));return e.impl.apply(void 0,arguments)}}function mw(t,e){return Bf(4,2,t,e)}function gw(t,e){return Bf(4,4,t,e)}function yw(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function Iw(t,e,n){n=n!=null?n.concat([t]):null,Bf(4,4,yw.bind(null,e,t),n)}function Ty(){}function _w(t,e){var n=wt();e=e===void 0?null:e;var a=n.memoizedState;return e!==null&&py(e,a[1])?a[0]:(n.memoizedState=[t,e],t)}function Sw(t,e){var n=wt();e=e===void 0?null:e;var a=n.memoizedState;if(e!==null&&py(e,a[1]))return a[0];if(a=t(),ni){is(!0);try{t()}finally{is(!1)}}return n.memoizedState=[a,e],a}function by(t,e,n){return n===void 0||vr&1073741824&&!(Ce&261930)?t.memoizedState=e:(t.memoizedState=n,t=uC(),ce.lanes|=t,bs|=t,n)}function vw(t,e,n,a){return Zn(n,e)?n:_o.current!==null?(t=by(t,n,a),Zn(t,e)||(Dt=!0),t):!(vr&42)||vr&1073741824&&!(Ce&261930)?(Dt=!0,t.memoizedState=n):(t=uC(),ce.lanes|=t,bs|=t,e)}function Tw(t,e,n,a,r){var s=Ve.p;Ve.p=s!==0&&8>s?s:8;var i=ie.T,u={};ie.T=u,wy(t,!1,e,n);try{var l=r(),c=ie.S;if(c!==null&&c(u,l),l!==null&&typeof l=="object"&&typeof l.then=="function"){var f=AD(l,a);ll(t,e,f,Jn(t))}else ll(t,e,a,Jn(t))}catch(m){ll(t,e,{then:function(){},status:"rejected",reason:m},Jn())}finally{Ve.p=s,i!==null&&u.types!==null&&(i.types=u.types),ie.T=i}}function OD(){}function wg(t,e,n,a){if(t.tag!==5)throw Error(V(476));var r=bw(t).queue;Tw(t,r,e,Xs,n===null?OD:function(){return Ew(t),n(a)})}function bw(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Xs,baseState:Xs,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Tr,lastRenderedState:Xs},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Tr,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function Ew(t){var e=bw(t);e.next===null&&(e=t.alternate.memoizedState),ll(t,e.next.queue,{},Jn())}function Ey(){return cn(Cl)}function ww(){return wt().memoizedState}function Cw(){return wt().memoizedState}function MD(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Jn();t=hs(n);var a=ps(e,t,n);a!==null&&(On(a,e,n),il(a,e,n)),e={cache:ly()},t.payload=e;return}e=e.return}}function ND(t,e,n){var a=Jn();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},qf(t)?Aw(e,n):(n=sy(t,e,n,a),n!==null&&(On(n,t,a),xw(n,e,a)))}function Lw(t,e,n){var a=Jn();ll(t,e,n,a)}function ll(t,e,n,a){var r={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(qf(t))Aw(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var i=e.lastRenderedState,u=s(i,n);if(r.hasEagerState=!0,r.eagerState=u,Zn(u,i))return Nf(t,e,r,0),je===null&&Mf(),!1}catch{}finally{}if(n=sy(t,e,r,a),n!==null)return On(n,t,a),xw(n,e,a),!0}return!1}function wy(t,e,n,a){if(a={lane:2,revertLane:Oy(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},qf(t)){if(e)throw Error(V(479))}else e=sy(t,n,a,2),e!==null&&On(e,t,2)}function qf(t){var e=t.alternate;return t===ce||e!==null&&e===ce}function Aw(t,e){ho=pf=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function xw(t,e,n){if(n&4194048){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,pE(t,n)}}var bl={readContext:cn,use:Ff,useCallback:Tt,useContext:Tt,useEffect:Tt,useImperativeHandle:Tt,useLayoutEffect:Tt,useInsertionEffect:Tt,useMemo:Tt,useReducer:Tt,useRef:Tt,useState:Tt,useDebugValue:Tt,useDeferredValue:Tt,useTransition:Tt,useSyncExternalStore:Tt,useId:Tt,useHostTransitionStatus:Tt,useFormState:Tt,useActionState:Tt,useOptimistic:Tt,useMemoCache:Tt,useCacheRefresh:Tt};bl.useEffectEvent=Tt;var Rw={readContext:cn,use:Ff,useCallback:function(t,e){return En().memoizedState=[t,e===void 0?null:e],t},useContext:cn,useEffect:hb,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,Wd(4194308,4,yw.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Wd(4194308,4,t,e)},useInsertionEffect:function(t,e){Wd(4,2,t,e)},useMemo:function(t,e){var n=En();e=e===void 0?null:e;var a=t();if(ni){is(!0);try{t()}finally{is(!1)}}return n.memoizedState=[a,e],a},useReducer:function(t,e,n){var a=En();if(n!==void 0){var r=n(e);if(ni){is(!0);try{n(e)}finally{is(!1)}}}else r=e;return a.memoizedState=a.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},a.queue=t,t=t.dispatch=ND.bind(null,ce,t),[a.memoizedState,t]},useRef:function(t){var e=En();return t={current:t},e.memoizedState=t},useState:function(t){t=bg(t);var e=t.queue,n=Lw.bind(null,ce,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:Ty,useDeferredValue:function(t,e){var n=En();return by(n,t,e)},useTransition:function(){var t=bg(!1);return t=Tw.bind(null,ce,t.queue,!0,!1),En().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var a=ce,r=En();if(Le){if(n===void 0)throw Error(V(407));n=n()}else{if(n=e(),je===null)throw Error(V(349));Ce&127||aw(a,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,hb(sw.bind(null,a,s,t),[t]),a.flags|=2048,So(9,{destroy:void 0},rw.bind(null,a,s,n,e),null),n},useId:function(){var t=En(),e=je.identifierPrefix;if(Le){var n=Ra,a=xa;n=(a&~(1<<32-$n(a)-1)).toString(32)+n,e="_"+e+"R_"+n,n=mf++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=xD++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Ey,useFormState:cb,useActionState:cb,useOptimistic:function(t){var e=En();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=wy.bind(null,ce,!0,n),n.dispatch=e,[t,e]},useMemoCache:_y,useCacheRefresh:function(){return En().memoizedState=MD.bind(null,ce)},useEffectEvent:function(t){var e=En(),n={impl:t};return e.memoizedState=n,function(){if(Ne&2)throw Error(V(440));return n.impl.apply(void 0,arguments)}}},Cy={readContext:cn,use:Ff,useCallback:_w,useContext:cn,useEffect:vy,useImperativeHandle:Iw,useInsertionEffect:mw,useLayoutEffect:gw,useMemo:Sw,useReducer:Kd,useRef:hw,useState:function(){return Kd(Tr)},useDebugValue:Ty,useDeferredValue:function(t,e){var n=wt();return vw(n,ze.memoizedState,t,e)},useTransition:function(){var t=Kd(Tr)[0],e=wt().memoizedState;return[typeof t=="boolean"?t:Nl(t),e]},useSyncExternalStore:nw,useId:ww,useHostTransitionStatus:Ey,useFormState:db,useActionState:db,useOptimistic:function(t,e){var n=wt();return uw(n,ze,t,e)},useMemoCache:_y,useCacheRefresh:Cw};Cy.useEffectEvent=pw;var kw={readContext:cn,use:Ff,useCallback:_w,useContext:cn,useEffect:vy,useImperativeHandle:Iw,useInsertionEffect:mw,useLayoutEffect:gw,useMemo:Sw,useReducer:Pm,useRef:hw,useState:function(){return Pm(Tr)},useDebugValue:Ty,useDeferredValue:function(t,e){var n=wt();return ze===null?by(n,t,e):vw(n,ze.memoizedState,t,e)},useTransition:function(){var t=Pm(Tr)[0],e=wt().memoizedState;return[typeof t=="boolean"?t:Nl(t),e]},useSyncExternalStore:nw,useId:ww,useHostTransitionStatus:Ey,useFormState:fb,useActionState:fb,useOptimistic:function(t,e){var n=wt();return ze!==null?uw(n,ze,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:_y,useCacheRefresh:Cw};kw.useEffectEvent=pw;function Om(t,e,n,a){e=t.memoizedState,n=n(a,e),n=n==null?e:st({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var Cg={enqueueSetState:function(t,e,n){t=t._reactInternals;var a=Jn(),r=hs(a);r.payload=e,n!=null&&(r.callback=n),e=ps(t,r,a),e!==null&&(On(e,t,a),il(e,t,a))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var a=Jn(),r=hs(a);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=ps(t,r,a),e!==null&&(On(e,t,a),il(e,t,a))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Jn(),a=hs(n);a.tag=2,e!=null&&(a.callback=e),e=ps(t,a,n),e!==null&&(On(e,t,n),il(e,t,n))}};function pb(t,e,n,a,r,s,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(a,s,i):e.prototype&&e.prototype.isPureReactComponent?!Il(n,a)||!Il(r,s):!0}function mb(t,e,n,a){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,a),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,a),e.state!==t&&Cg.enqueueReplaceState(e,e.state,null)}function ai(t,e){var n=e;if("ref"in e){n={};for(var a in e)a!=="ref"&&(n[a]=e[a])}if(t=t.defaultProps){n===e&&(n=st({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function Dw(t){of(t)}function Pw(t){console.error(t)}function Ow(t){of(t)}function gf(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(a){setTimeout(function(){throw a})}}function gb(t,e,n){try{var a=t.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Lg(t,e,n){return n=hs(n),n.tag=3,n.payload={element:null},n.callback=function(){gf(t,e)},n}function Mw(t){return t=hs(t),t.tag=3,t}function Nw(t,e,n,a){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var s=a.value;t.payload=function(){return r(s)},t.callback=function(){gb(e,n,a)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){gb(e,n,a),typeof r!="function"&&(ms===null?ms=new Set([this]):ms.add(this));var u=a.stack;this.componentDidCatch(a.value,{componentStack:u!==null?u:""})})}function VD(t,e,n,a,r){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(e=n.alternate,e!==null&&Ao(e,n,r,!0),n=ea.current,n!==null){switch(n.tag){case 31:case 13:return ca===null?vf():n.alternate===null&&bt===0&&(bt=3),n.flags&=-257,n.flags|=65536,n.lanes=r,a===df?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([a]):e.add(a),jm(t,a,r)),!1;case 22:return n.flags|=65536,a===df?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([a]):n.add(a)),jm(t,a,r)),!1}throw Error(V(435,n.tag))}return jm(t,a,r),vf(),!1}if(Le)return e=ea.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,a!==pg&&(t=Error(V(422),{cause:a}),Sl(ua(t,n)))):(a!==pg&&(e=Error(V(423),{cause:a}),Sl(ua(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,a=ua(a,n),r=Lg(t.stateNode,a,r),Dm(t,r),bt!==4&&(bt=2)),!1;var s=Error(V(520),{cause:a});if(s=ua(s,n),fl===null?fl=[s]:fl.push(s),bt!==4&&(bt=2),e===null)return!0;a=ua(a,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=Lg(n.stateNode,a,t),Dm(n,t),!1;case 1:if(e=n.type,s=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(ms===null||!ms.has(s))))return n.flags|=65536,r&=-r,n.lanes|=r,r=Mw(r),Nw(r,t,n,a),Dm(n,r),!1}n=n.return}while(n!==null);return!1}var Ly=Error(V(461)),Dt=!1;function on(t,e,n,a){e.child=t===null?YE(e,null,n,a):ti(e,t.child,n,a)}function yb(t,e,n,a,r){n=n.render;var s=e.ref;if("ref"in a){var i={};for(var u in a)u!=="ref"&&(i[u]=a[u])}else i=a;return ei(e),a=my(t,e,n,i,s,r),u=gy(),t!==null&&!Dt?(yy(t,e,r),br(t,e,r)):(Le&&u&&oy(e),e.flags|=1,on(t,e,a,r),e.child)}function Ib(t,e,n,a,r){if(t===null){var s=n.type;return typeof s=="function"&&!iy(s)&&s.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=s,Vw(t,e,s,a,r)):(t=Gd(n.type,null,a,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!Ay(t,r)){var i=s.memoizedProps;if(n=n.compare,n=n!==null?n:Il,n(i,a)&&t.ref===e.ref)return br(t,e,r)}return e.flags|=1,t=yr(s,a),t.ref=e.ref,t.return=e,e.child=t}function Vw(t,e,n,a,r){if(t!==null){var s=t.memoizedProps;if(Il(s,a)&&t.ref===e.ref)if(Dt=!1,e.pendingProps=a=s,Ay(t,r))t.flags&131072&&(Dt=!0);else return e.lanes=t.lanes,br(t,e,r)}return Ag(t,e,n,a,r)}function Uw(t,e,n,a){var r=a.children,s=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(e.flags&128){if(s=s!==null?s.baseLanes|n:n,t!==null){for(a=e.child=t.child,r=0;a!==null;)r=r|a.lanes|a.childLanes,a=a.sibling;a=r&~s}else a=0,e.child=null;return _b(t,e,s,n,a)}if(n&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&jd(e,s!==null?s.cachePool:null),s!==null?ob(e,s):vg(),ZE(e);else return a=e.lanes=536870912,_b(t,e,s!==null?s.baseLanes|n:n,n,a)}else s!==null?(jd(e,s.cachePool),ob(e,s),rs(e),e.memoizedState=null):(t!==null&&jd(e,null),vg(),rs(e));return on(t,e,r,n),e.child}function el(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function _b(t,e,n,a,r){var s=cy();return s=s===null?null:{parent:kt._currentValue,pool:s},e.memoizedState={baseLanes:n,cachePool:s},t!==null&&jd(e,null),vg(),ZE(e),t!==null&&Ao(t,e,a,!0),e.childLanes=r,null}function Xd(t,e){return e=yf({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function Sb(t,e,n){return ti(e,t.child,null,n),t=Xd(e,e.pendingProps),t.flags|=2,Kn(e),e.memoizedState=null,t}function UD(t,e,n){var a=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(Le){if(a.mode==="hidden")return t=Xd(e,a),e.lanes=536870912,el(null,t);if(Tg(e),(t=rt)?(t=RC(t,la),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ss!==null?{id:xa,overflow:Ra}:null,retryLane:536870912,hydrationErrors:null},n=HE(t),n.return=e,e.child=n,ln=e,rt=null)):t=null,t===null)throw vs(e);return e.lanes=536870912,null}return Xd(e,a)}var s=t.memoizedState;if(s!==null){var i=s.dehydrated;if(Tg(e),r)if(e.flags&256)e.flags&=-257,e=Sb(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(V(558));else if(Dt||Ao(t,e,n,!1),r=(n&t.childLanes)!==0,Dt||r){if(a=je,a!==null&&(i=mE(a,n),i!==0&&i!==s.retryLane))throw s.retryLane=i,oi(t,i),On(a,t,i),Ly;vf(),e=Sb(t,e,n)}else t=s.treeContext,rt=da(i.nextSibling),ln=e,Le=!0,fs=null,la=!1,t!==null&&jE(e,t),e=Xd(e,a),e.flags|=4096;return e}return t=yr(t.child,{mode:a.mode,children:a.children}),t.ref=e.ref,e.child=t,t.return=e,t}function Qd(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(V(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Ag(t,e,n,a,r){return ei(e),n=my(t,e,n,a,void 0,r),a=gy(),t!==null&&!Dt?(yy(t,e,r),br(t,e,r)):(Le&&a&&oy(e),e.flags|=1,on(t,e,n,r),e.child)}function vb(t,e,n,a,r,s){return ei(e),e.updateQueue=null,n=tw(e,a,n,r),ew(t),a=gy(),t!==null&&!Dt?(yy(t,e,s),br(t,e,s)):(Le&&a&&oy(e),e.flags|=1,on(t,e,n,s),e.child)}function Tb(t,e,n,a,r){if(ei(e),e.stateNode===null){var s=ao,i=n.contextType;typeof i=="object"&&i!==null&&(s=cn(i)),s=new n(a,s),e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Cg,e.stateNode=s,s._reactInternals=e,s=e.stateNode,s.props=a,s.state=e.memoizedState,s.refs={},fy(e),i=n.contextType,s.context=typeof i=="object"&&i!==null?cn(i):ao,s.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(Om(e,n,i,a),s.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(i=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),i!==s.state&&Cg.enqueueReplaceState(s,s.state,null),ul(e,a,s,r),ol(),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!0}else if(t===null){s=e.stateNode;var u=e.memoizedProps,l=ai(n,u);s.props=l;var c=s.context,f=n.contextType;i=ao,typeof f=="object"&&f!==null&&(i=cn(f));var m=n.getDerivedStateFromProps;f=typeof m=="function"||typeof s.getSnapshotBeforeUpdate=="function",u=e.pendingProps!==u,f||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(u||c!==i)&&mb(e,s,a,i),ts=!1;var p=e.memoizedState;s.state=p,ul(e,a,s,r),ol(),c=e.memoizedState,u||p!==c||ts?(typeof m=="function"&&(Om(e,n,m,a),c=e.memoizedState),(l=ts||pb(e,n,l,a,p,c,i))?(f||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(e.flags|=4194308)):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=a,e.memoizedState=c),s.props=a,s.state=c,s.context=i,a=l):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!1)}else{s=e.stateNode,_g(t,e),i=e.memoizedProps,f=ai(n,i),s.props=f,m=e.pendingProps,p=s.context,c=n.contextType,l=ao,typeof c=="object"&&c!==null&&(l=cn(c)),u=n.getDerivedStateFromProps,(c=typeof u=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(i!==m||p!==l)&&mb(e,s,a,l),ts=!1,p=e.memoizedState,s.state=p,ul(e,a,s,r),ol();var _=e.memoizedState;i!==m||p!==_||ts||t!==null&&t.dependencies!==null&&cf(t.dependencies)?(typeof u=="function"&&(Om(e,n,u,a),_=e.memoizedState),(f=ts||pb(e,n,f,a,p,_,l)||t!==null&&t.dependencies!==null&&cf(t.dependencies))?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(a,_,l),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(a,_,l)),typeof s.componentDidUpdate=="function"&&(e.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),e.memoizedProps=a,e.memoizedState=_),s.props=a,s.state=_,s.context=l,a=f):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&p===t.memoizedState||(e.flags|=1024),a=!1)}return s=a,Qd(t,e),a=(e.flags&128)!==0,s||a?(s=e.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:s.render(),e.flags|=1,t!==null&&a?(e.child=ti(e,t.child,null,r),e.child=ti(e,null,n,r)):on(t,e,n,r),e.memoizedState=s.state,t=e.child):t=br(t,e,r),t}function bb(t,e,n,a){return Zs(),e.flags|=256,on(t,e,n,a),e.child}var Mm={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Nm(t){return{baseLanes:t,cachePool:WE()}}function Vm(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=Xn),t}function Fw(t,e,n){var a=e.pendingProps,r=!1,s=(e.flags&128)!==0,i;if((i=s)||(i=t!==null&&t.memoizedState===null?!1:(Et.current&2)!==0),i&&(r=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(Le){if(r?as(e):rs(e),(t=rt)?(t=RC(t,la),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:Ss!==null?{id:xa,overflow:Ra}:null,retryLane:536870912,hydrationErrors:null},n=HE(t),n.return=e,e.child=n,ln=e,rt=null)):t=null,t===null)throw vs(e);return zg(t)?e.lanes=32:e.lanes=536870912,null}var u=a.children;return a=a.fallback,r?(rs(e),r=e.mode,u=yf({mode:"hidden",children:u},r),a=Qs(a,r,n,null),u.return=e,a.return=e,u.sibling=a,e.child=u,a=e.child,a.memoizedState=Nm(n),a.childLanes=Vm(t,i,n),e.memoizedState=Mm,el(null,a)):(as(e),xg(e,u))}var l=t.memoizedState;if(l!==null&&(u=l.dehydrated,u!==null)){if(s)e.flags&256?(as(e),e.flags&=-257,e=Um(t,e,n)):e.memoizedState!==null?(rs(e),e.child=t.child,e.flags|=128,e=null):(rs(e),u=a.fallback,r=e.mode,a=yf({mode:"visible",children:a.children},r),u=Qs(u,r,n,null),u.flags|=2,a.return=e,u.return=e,a.sibling=u,e.child=a,ti(e,t.child,null,n),a=e.child,a.memoizedState=Nm(n),a.childLanes=Vm(t,i,n),e.memoizedState=Mm,e=el(null,a));else if(as(e),zg(u)){if(i=u.nextSibling&&u.nextSibling.dataset,i)var c=i.dgst;i=c,a=Error(V(419)),a.stack="",a.digest=i,Sl({value:a,source:null,stack:null}),e=Um(t,e,n)}else if(Dt||Ao(t,e,n,!1),i=(n&t.childLanes)!==0,Dt||i){if(i=je,i!==null&&(a=mE(i,n),a!==0&&a!==l.retryLane))throw l.retryLane=a,oi(t,a),On(i,t,a),Ly;qg(u)||vf(),e=Um(t,e,n)}else qg(u)?(e.flags|=192,e.child=t.child,e=null):(t=l.treeContext,rt=da(u.nextSibling),ln=e,Le=!0,fs=null,la=!1,t!==null&&jE(e,t),e=xg(e,a.children),e.flags|=4096);return e}return r?(rs(e),u=a.fallback,r=e.mode,l=t.child,c=l.sibling,a=yr(l,{mode:"hidden",children:a.children}),a.subtreeFlags=l.subtreeFlags&65011712,c!==null?u=yr(c,u):(u=Qs(u,r,n,null),u.flags|=2),u.return=e,a.return=e,a.sibling=u,e.child=a,el(null,a),a=e.child,u=t.child.memoizedState,u===null?u=Nm(n):(r=u.cachePool,r!==null?(l=kt._currentValue,r=r.parent!==l?{parent:l,pool:l}:r):r=WE(),u={baseLanes:u.baseLanes|n,cachePool:r}),a.memoizedState=u,a.childLanes=Vm(t,i,n),e.memoizedState=Mm,el(t.child,a)):(as(e),n=t.child,t=n.sibling,n=yr(n,{mode:"visible",children:a.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function xg(t,e){return e=yf({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function yf(t,e){return t=Wn(22,t,null,e),t.lanes=0,t}function Um(t,e,n){return ti(e,t.child,null,n),t=xg(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function Eb(t,e,n){t.lanes|=e;var a=t.alternate;a!==null&&(a.lanes|=e),gg(t.return,e,n)}function Fm(t,e,n,a,r,s){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:r,treeForkCount:s}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=a,i.tail=n,i.tailMode=r,i.treeForkCount=s)}function Bw(t,e,n){var a=e.pendingProps,r=a.revealOrder,s=a.tail;a=a.children;var i=Et.current,u=(i&2)!==0;if(u?(i=i&1|2,e.flags|=128):i&=1,Ye(Et,i),on(t,e,a,n),a=Le?_l:0,!u&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&Eb(t,n,e);else if(t.tag===19)Eb(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&hf(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),Fm(e,!1,r,n,s,a);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&hf(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}Fm(e,!0,n,null,s,a);break;case"together":Fm(e,!1,null,null,void 0,a);break;default:e.memoizedState=null}return e.child}function br(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),bs|=e.lanes,!(n&e.childLanes))if(t!==null){if(Ao(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(V(153));if(e.child!==null){for(t=e.child,n=yr(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=yr(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Ay(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&cf(t)))}function FD(t,e,n){switch(e.tag){case 3:nf(e,e.stateNode.containerInfo),ns(e,kt,t.memoizedState.cache),Zs();break;case 27:case 5:ag(e);break;case 4:nf(e,e.stateNode.containerInfo);break;case 10:ns(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,Tg(e),null;break;case 13:var a=e.memoizedState;if(a!==null)return a.dehydrated!==null?(as(e),e.flags|=128,null):n&e.child.childLanes?Fw(t,e,n):(as(e),t=br(t,e,n),t!==null?t.sibling:null);as(e);break;case 19:var r=(t.flags&128)!==0;if(a=(n&e.childLanes)!==0,a||(Ao(t,e,n,!1),a=(n&e.childLanes)!==0),r){if(a)return Bw(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Ye(Et,Et.current),a)break;return null;case 22:return e.lanes=0,Uw(t,e,n,e.pendingProps);case 24:ns(e,kt,t.memoizedState.cache)}return br(t,e,n)}function qw(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)Dt=!0;else{if(!Ay(t,n)&&!(e.flags&128))return Dt=!1,FD(t,e,n);Dt=!!(t.flags&131072)}else Dt=!1,Le&&e.flags&1048576&&GE(e,_l,e.index);switch(e.lanes=0,e.tag){case 16:e:{var a=e.pendingProps;if(t=Ks(e.elementType),e.type=t,typeof t=="function")iy(t)?(a=ai(t,a),e.tag=1,e=Tb(null,e,t,a,n)):(e.tag=0,e=Ag(null,e,t,a,n));else{if(t!=null){var r=t.$$typeof;if(r===Kg){e.tag=11,e=yb(null,e,t,a,n);break e}else if(r===Wg){e.tag=14,e=Ib(null,e,t,a,n);break e}}throw e=tg(t)||t,Error(V(306,e,""))}}return e;case 0:return Ag(t,e,e.type,e.pendingProps,n);case 1:return a=e.type,r=ai(a,e.pendingProps),Tb(t,e,a,r,n);case 3:e:{if(nf(e,e.stateNode.containerInfo),t===null)throw Error(V(387));a=e.pendingProps;var s=e.memoizedState;r=s.element,_g(t,e),ul(e,a,null,n);var i=e.memoizedState;if(a=i.cache,ns(e,kt,a),a!==s.cache&&yg(e,[kt],n,!0),ol(),a=i.element,s.isDehydrated)if(s={element:a,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){e=bb(t,e,a,n);break e}else if(a!==r){r=ua(Error(V(424)),e),Sl(r),e=bb(t,e,a,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(rt=da(t.firstChild),ln=e,Le=!0,fs=null,la=!0,n=YE(e,null,a,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if(Zs(),a===r){e=br(t,e,n);break e}on(t,e,a,n)}e=e.child}return e;case 26:return Qd(t,e),t===null?(n=Kb(e.type,null,e.pendingProps,null))?e.memoizedState=n:Le||(n=e.type,t=e.pendingProps,a=wf(ds.current).createElement(n),a[un]=e,a[Mn]=t,dn(a,n,t),Qt(a),e.stateNode=a):e.memoizedState=Kb(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return ag(e),t===null&&Le&&(a=e.stateNode=kC(e.type,e.pendingProps,ds.current),ln=e,la=!0,r=rt,ws(e.type)?(Hg=r,rt=da(a.firstChild)):rt=r),on(t,e,e.pendingProps.children,n),Qd(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&Le&&((r=a=rt)&&(a=hP(a,e.type,e.pendingProps,la),a!==null?(e.stateNode=a,ln=e,rt=da(a.firstChild),la=!1,r=!0):r=!1),r||vs(e)),ag(e),r=e.type,s=e.pendingProps,i=t!==null?t.memoizedProps:null,a=s.children,Fg(r,s)?a=null:i!==null&&Fg(r,i)&&(e.flags|=32),e.memoizedState!==null&&(r=my(t,e,RD,null,null,n),Cl._currentValue=r),Qd(t,e),on(t,e,a,n),e.child;case 6:return t===null&&Le&&((t=n=rt)&&(n=pP(n,e.pendingProps,la),n!==null?(e.stateNode=n,ln=e,rt=null,t=!0):t=!1),t||vs(e)),null;case 13:return Fw(t,e,n);case 4:return nf(e,e.stateNode.containerInfo),a=e.pendingProps,t===null?e.child=ti(e,null,a,n):on(t,e,a,n),e.child;case 11:return yb(t,e,e.type,e.pendingProps,n);case 7:return on(t,e,e.pendingProps,n),e.child;case 8:return on(t,e,e.pendingProps.children,n),e.child;case 12:return on(t,e,e.pendingProps.children,n),e.child;case 10:return a=e.pendingProps,ns(e,e.type,a.value),on(t,e,a.children,n),e.child;case 9:return r=e.type._context,a=e.pendingProps.children,ei(e),r=cn(r),a=a(r),e.flags|=1,on(t,e,a,n),e.child;case 14:return Ib(t,e,e.type,e.pendingProps,n);case 15:return Vw(t,e,e.type,e.pendingProps,n);case 19:return Bw(t,e,n);case 31:return UD(t,e,n);case 22:return Uw(t,e,n,e.pendingProps);case 24:return ei(e),a=cn(kt),t===null?(r=cy(),r===null&&(r=je,s=ly(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=n),r=s),e.memoizedState={parent:a,cache:r},fy(e),ns(e,kt,r)):(t.lanes&n&&(_g(t,e),ul(e,null,null,n),ol()),r=t.memoizedState,s=e.memoizedState,r.parent!==a?(r={parent:a,cache:a},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),ns(e,kt,a)):(a=s.cache,ns(e,kt,a),a!==r.cache&&yg(e,[kt],n,!0))),on(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(V(156,e.tag))}function ur(t){t.flags|=4}function Bm(t,e,n,a,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(dC())t.flags|=8192;else throw $s=df,dy}else t.flags&=-16777217}function wb(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!OC(e))if(dC())t.flags|=8192;else throw $s=df,dy}function Pd(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?fE():536870912,t.lanes|=e,vo|=e)}function Wu(t,e){if(!Le)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:a.sibling=null}}function at(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,a=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags&65011712,a|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags,a|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=a,t.childLanes=n,e}function BD(t,e,n){var a=e.pendingProps;switch(uy(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return at(e),null;case 1:return at(e),null;case 3:return n=e.stateNode,a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),Ir(kt),mo(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(ji(e)?ur(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,km())),at(e),null;case 26:var r=e.type,s=e.memoizedState;return t===null?(ur(e),s!==null?(at(e),wb(e,s)):(at(e),Bm(e,r,null,a,n))):s?s!==t.memoizedState?(ur(e),at(e),wb(e,s)):(at(e),e.flags&=-16777217):(t=t.memoizedProps,t!==a&&ur(e),at(e),Bm(e,r,t,a,n)),null;case 27:if(af(e),n=ds.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&ur(e);else{if(!a){if(e.stateNode===null)throw Error(V(166));return at(e),null}t=Da.current,ji(e)?eb(e,t):(t=kC(r,a,n),e.stateNode=t,ur(e))}return at(e),null;case 5:if(af(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&ur(e);else{if(!a){if(e.stateNode===null)throw Error(V(166));return at(e),null}if(s=Da.current,ji(e))eb(e,s);else{var i=wf(ds.current);switch(s){case 1:s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=i.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof a.is=="string"?i.createElement("select",{is:a.is}):i.createElement("select"),a.multiple?s.multiple=!0:a.size&&(s.size=a.size);break;default:s=typeof a.is=="string"?i.createElement(r,{is:a.is}):i.createElement(r)}}s[un]=e,s[Mn]=a;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)s.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=s;e:switch(dn(s,r,a),r){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&ur(e)}}return at(e),Bm(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==a&&ur(e);else{if(typeof a!="string"&&e.stateNode===null)throw Error(V(166));if(t=ds.current,ji(e)){if(t=e.stateNode,n=e.memoizedProps,a=null,r=ln,r!==null)switch(r.tag){case 27:case 5:a=r.memoizedProps}t[un]=e,t=!!(t.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||LC(t.nodeValue,n)),t||vs(e,!0)}else t=wf(t).createTextNode(a),t[un]=e,e.stateNode=t}return at(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(a=ji(e),n!==null){if(t===null){if(!a)throw Error(V(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(557));t[un]=e}else Zs(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;at(e),t=!1}else n=km(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(Kn(e),e):(Kn(e),null);if(e.flags&128)throw Error(V(558))}return at(e),null;case 13:if(a=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=ji(e),a!==null&&a.dehydrated!==null){if(t===null){if(!r)throw Error(V(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(V(317));r[un]=e}else Zs(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;at(e),r=!1}else r=km(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(Kn(e),e):(Kn(e),null)}return Kn(e),e.flags&128?(e.lanes=n,e):(n=a!==null,t=t!==null&&t.memoizedState!==null,n&&(a=e.child,r=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(r=a.alternate.memoizedState.cachePool.pool),s=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(s=a.memoizedState.cachePool.pool),s!==r&&(a.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Pd(e,e.updateQueue),at(e),null);case 4:return mo(),t===null&&My(e.stateNode.containerInfo),at(e),null;case 10:return Ir(e.type),at(e),null;case 19:if(Yt(Et),a=e.memoizedState,a===null)return at(e),null;if(r=(e.flags&128)!==0,s=a.rendering,s===null)if(r)Wu(a,!1);else{if(bt!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(s=hf(t),s!==null){for(e.flags|=128,Wu(a,!1),t=s.updateQueue,e.updateQueue=t,Pd(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)zE(n,t),n=n.sibling;return Ye(Et,Et.current&1|2),Le&&fr(e,a.treeForkCount),e.child}t=t.sibling}a.tail!==null&&Qn()>_f&&(e.flags|=128,r=!0,Wu(a,!1),e.lanes=4194304)}else{if(!r)if(t=hf(s),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Pd(e,t),Wu(a,!0),a.tail===null&&a.tailMode==="hidden"&&!s.alternate&&!Le)return at(e),null}else 2*Qn()-a.renderingStartTime>_f&&n!==536870912&&(e.flags|=128,r=!0,Wu(a,!1),e.lanes=4194304);a.isBackwards?(s.sibling=e.child,e.child=s):(t=a.last,t!==null?t.sibling=s:e.child=s,a.last=s)}return a.tail!==null?(t=a.tail,a.rendering=t,a.tail=t.sibling,a.renderingStartTime=Qn(),t.sibling=null,n=Et.current,Ye(Et,r?n&1|2:n&1),Le&&fr(e,a.treeForkCount),t):(at(e),null);case 22:case 23:return Kn(e),hy(),a=e.memoizedState!==null,t!==null?t.memoizedState!==null!==a&&(e.flags|=8192):a&&(e.flags|=8192),a?n&536870912&&!(e.flags&128)&&(at(e),e.subtreeFlags&6&&(e.flags|=8192)):at(e),n=e.updateQueue,n!==null&&Pd(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),a=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),a!==n&&(e.flags|=2048),t!==null&&Yt(Ys),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),Ir(kt),at(e),null;case 25:return null;case 30:return null}throw Error(V(156,e.tag))}function qD(t,e){switch(uy(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return Ir(kt),mo(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return af(e),null;case 31:if(e.memoizedState!==null){if(Kn(e),e.alternate===null)throw Error(V(340));Zs()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(Kn(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(V(340));Zs()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return Yt(Et),null;case 4:return mo(),null;case 10:return Ir(e.type),null;case 22:case 23:return Kn(e),hy(),t!==null&&Yt(Ys),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return Ir(kt),null;case 25:return null;default:return null}}function zw(t,e){switch(uy(e),e.tag){case 3:Ir(kt),mo();break;case 26:case 27:case 5:af(e);break;case 4:mo();break;case 31:e.memoizedState!==null&&Kn(e);break;case 13:Kn(e);break;case 19:Yt(Et);break;case 10:Ir(e.type);break;case 22:case 23:Kn(e),hy(),t!==null&&Yt(Ys);break;case 24:Ir(kt)}}function Vl(t,e){try{var n=e.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var r=a.next;n=r;do{if((n.tag&t)===t){a=void 0;var s=n.create,i=n.inst;a=s(),i.destroy=a}n=n.next}while(n!==r)}}catch(u){Be(e,e.return,u)}}function Ts(t,e,n){try{var a=e.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var s=r.next;a=s;do{if((a.tag&t)===t){var i=a.inst,u=i.destroy;if(u!==void 0){i.destroy=void 0,r=e;var l=n,c=u;try{c()}catch(f){Be(r,l,f)}}}a=a.next}while(a!==s)}}catch(f){Be(e,e.return,f)}}function Hw(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{JE(e,n)}catch(a){Be(t,t.return,a)}}}function Gw(t,e,n){n.props=ai(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(a){Be(t,e,a)}}function cl(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var a=t.stateNode;break;case 30:a=t.stateNode;break;default:a=t.stateNode}typeof n=="function"?t.refCleanup=n(a):n.current=a}}catch(r){Be(t,e,r)}}function ka(t,e){var n=t.ref,a=t.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(r){Be(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){Be(t,e,r)}else n.current=null}function jw(t){var e=t.type,n=t.memoizedProps,a=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(r){Be(t,t.return,r)}}function qm(t,e,n){try{var a=t.stateNode;oP(a,t.type,n,e),a[Mn]=e}catch(r){Be(t,t.return,r)}}function Kw(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&ws(t.type)||t.tag===4}function zm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||Kw(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&ws(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Rg(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=mr));else if(a!==4&&(a===27&&ws(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(Rg(t,e,n),t=t.sibling;t!==null;)Rg(t,e,n),t=t.sibling}function If(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(a!==4&&(a===27&&ws(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(If(t,e,n),t=t.sibling;t!==null;)If(t,e,n),t=t.sibling}function Ww(t){var e=t.stateNode,n=t.memoizedProps;try{for(var a=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);dn(e,a,n),e[un]=t,e[Mn]=n}catch(s){Be(t,t.return,s)}}var hr=!1,Rt=!1,Hm=!1,Cb=typeof WeakSet=="function"?WeakSet:Set,Xt=null;function zD(t,e){if(t=t.containerInfo,Vg=xf,t=OE(t),ay(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var a=n.getSelection&&n.getSelection();if(a&&a.rangeCount!==0){n=a.anchorNode;var r=a.anchorOffset,s=a.focusNode;a=a.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var i=0,u=-1,l=-1,c=0,f=0,m=t,p=null;t:for(;;){for(var _;m!==n||r!==0&&m.nodeType!==3||(u=i+r),m!==s||a!==0&&m.nodeType!==3||(l=i+a),m.nodeType===3&&(i+=m.nodeValue.length),(_=m.firstChild)!==null;)p=m,m=_;for(;;){if(m===t)break t;if(p===n&&++c===r&&(u=i),p===s&&++f===a&&(l=i),(_=m.nextSibling)!==null)break;m=p,p=m.parentNode}m=_}n=u===-1||l===-1?null:{start:u,end:l}}else n=null}n=n||{start:0,end:0}}else n=null;for(Ug={focusedElem:t,selectionRange:n},xf=!1,Xt=e;Xt!==null;)if(e=Xt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Xt=t;else for(;Xt!==null;){switch(e=Xt,s=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&s!==null){t=void 0,n=e,r=s.memoizedProps,s=s.memoizedState,a=n.stateNode;try{var R=ai(n.type,r);t=a.getSnapshotBeforeUpdate(R,s),a.__reactInternalSnapshotBeforeUpdate=t}catch(D){Be(n,n.return,D)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Bg(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Bg(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(V(163))}if(t=e.sibling,t!==null){t.return=e.return,Xt=t;break}Xt=e.return}}function Xw(t,e,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:cr(t,n),a&4&&Vl(5,n);break;case 1:if(cr(t,n),a&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){Be(n,n.return,i)}else{var r=ai(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){Be(n,n.return,i)}}a&64&&Hw(n),a&512&&cl(n,n.return);break;case 3:if(cr(t,n),a&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{JE(t,e)}catch(i){Be(n,n.return,i)}}break;case 27:e===null&&a&4&&Ww(n);case 26:case 5:cr(t,n),e===null&&a&4&&jw(n),a&512&&cl(n,n.return);break;case 12:cr(t,n);break;case 31:cr(t,n),a&4&&$w(t,n);break;case 13:cr(t,n),a&4&&Jw(t,n),a&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=$D.bind(null,n),mP(t,n))));break;case 22:if(a=n.memoizedState!==null||hr,!a){e=e!==null&&e.memoizedState!==null||Rt,r=hr;var s=Rt;hr=a,(Rt=e)&&!s?dr(t,n,(n.subtreeFlags&8772)!==0):cr(t,n),hr=r,Rt=s}break;case 30:break;default:cr(t,n)}}function Qw(t){var e=t.alternate;e!==null&&(t.alternate=null,Qw(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&$g(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var ut=null,Dn=!1;function lr(t,e,n){for(n=n.child;n!==null;)Yw(t,e,n),n=n.sibling}function Yw(t,e,n){if(Yn&&typeof Yn.onCommitFiberUnmount=="function")try{Yn.onCommitFiberUnmount(Rl,n)}catch{}switch(n.tag){case 26:Rt||ka(n,e),lr(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:Rt||ka(n,e);var a=ut,r=Dn;ws(n.type)&&(ut=n.stateNode,Dn=!1),lr(t,e,n),pl(n.stateNode),ut=a,Dn=r;break;case 5:Rt||ka(n,e);case 6:if(a=ut,r=Dn,ut=null,lr(t,e,n),ut=a,Dn=r,ut!==null)if(Dn)try{(ut.nodeType===9?ut.body:ut.nodeName==="HTML"?ut.ownerDocument.body:ut).removeChild(n.stateNode)}catch(s){Be(n,e,s)}else try{ut.removeChild(n.stateNode)}catch(s){Be(n,e,s)}break;case 18:ut!==null&&(Dn?(t=ut,qb(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),wo(t)):qb(ut,n.stateNode));break;case 4:a=ut,r=Dn,ut=n.stateNode.containerInfo,Dn=!0,lr(t,e,n),ut=a,Dn=r;break;case 0:case 11:case 14:case 15:Ts(2,n,e),Rt||Ts(4,n,e),lr(t,e,n);break;case 1:Rt||(ka(n,e),a=n.stateNode,typeof a.componentWillUnmount=="function"&&Gw(n,e,a)),lr(t,e,n);break;case 21:lr(t,e,n);break;case 22:Rt=(a=Rt)||n.memoizedState!==null,lr(t,e,n),Rt=a;break;default:lr(t,e,n)}}function $w(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{wo(t)}catch(n){Be(e,e.return,n)}}}function Jw(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{wo(t)}catch(n){Be(e,e.return,n)}}function HD(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new Cb),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new Cb),e;default:throw Error(V(435,t.tag))}}function Od(t,e){var n=HD(t);e.forEach(function(a){if(!n.has(a)){n.add(a);var r=JD.bind(null,t,a);a.then(r,r)}})}function Rn(t,e){var n=e.deletions;if(n!==null)for(var a=0;a<n.length;a++){var r=n[a],s=t,i=e,u=i;e:for(;u!==null;){switch(u.tag){case 27:if(ws(u.type)){ut=u.stateNode,Dn=!1;break e}break;case 5:ut=u.stateNode,Dn=!1;break e;case 3:case 4:ut=u.stateNode.containerInfo,Dn=!0;break e}u=u.return}if(ut===null)throw Error(V(160));Yw(s,i,r),ut=null,Dn=!1,s=r.alternate,s!==null&&(s.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)Zw(e,t),e=e.sibling}var Ia=null;function Zw(t,e){var n=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Rn(e,t),kn(t),a&4&&(Ts(3,t,t.return),Vl(3,t),Ts(5,t,t.return));break;case 1:Rn(e,t),kn(t),a&512&&(Rt||n===null||ka(n,n.return)),a&64&&hr&&(t=t.updateQueue,t!==null&&(a=t.callbacks,a!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?a:n.concat(a))));break;case 26:var r=Ia;if(Rn(e,t),kn(t),a&512&&(Rt||n===null||ka(n,n.return)),a&4){var s=n!==null?n.memoizedState:null;if(a=t.memoizedState,n===null)if(a===null)if(t.stateNode===null){e:{a=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(a){case"title":s=r.getElementsByTagName("title")[0],(!s||s[Pl]||s[un]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=r.createElement(a),r.head.insertBefore(s,r.querySelector("head > title"))),dn(s,a,n),s[un]=t,Qt(s),a=s;break e;case"link":var i=Xb("link","href",r).get(a+(n.href||""));if(i){for(var u=0;u<i.length;u++)if(s=i[u],s.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&s.getAttribute("rel")===(n.rel==null?null:n.rel)&&s.getAttribute("title")===(n.title==null?null:n.title)&&s.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(u,1);break t}}s=r.createElement(a),dn(s,a,n),r.head.appendChild(s);break;case"meta":if(i=Xb("meta","content",r).get(a+(n.content||""))){for(u=0;u<i.length;u++)if(s=i[u],s.getAttribute("content")===(n.content==null?null:""+n.content)&&s.getAttribute("name")===(n.name==null?null:n.name)&&s.getAttribute("property")===(n.property==null?null:n.property)&&s.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&s.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(u,1);break t}}s=r.createElement(a),dn(s,a,n),r.head.appendChild(s);break;default:throw Error(V(468,a))}s[un]=t,Qt(s),a=s}t.stateNode=a}else Qb(r,t.type,t.stateNode);else t.stateNode=Wb(r,a,t.memoizedProps);else s!==a?(s===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):s.count--,a===null?Qb(r,t.type,t.stateNode):Wb(r,a,t.memoizedProps)):a===null&&t.stateNode!==null&&qm(t,t.memoizedProps,n.memoizedProps)}break;case 27:Rn(e,t),kn(t),a&512&&(Rt||n===null||ka(n,n.return)),n!==null&&a&4&&qm(t,t.memoizedProps,n.memoizedProps);break;case 5:if(Rn(e,t),kn(t),a&512&&(Rt||n===null||ka(n,n.return)),t.flags&32){r=t.stateNode;try{yo(r,"")}catch(R){Be(t,t.return,R)}}a&4&&t.stateNode!=null&&(r=t.memoizedProps,qm(t,r,n!==null?n.memoizedProps:r)),a&1024&&(Hm=!0);break;case 6:if(Rn(e,t),kn(t),a&4){if(t.stateNode===null)throw Error(V(162));a=t.memoizedProps,n=t.stateNode;try{n.nodeValue=a}catch(R){Be(t,t.return,R)}}break;case 3:if(Jd=null,r=Ia,Ia=Cf(e.containerInfo),Rn(e,t),Ia=r,kn(t),a&4&&n!==null&&n.memoizedState.isDehydrated)try{wo(e.containerInfo)}catch(R){Be(t,t.return,R)}Hm&&(Hm=!1,eC(t));break;case 4:a=Ia,Ia=Cf(t.stateNode.containerInfo),Rn(e,t),kn(t),Ia=a;break;case 12:Rn(e,t),kn(t);break;case 31:Rn(e,t),kn(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Od(t,a)));break;case 13:Rn(e,t),kn(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(zf=Qn()),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Od(t,a)));break;case 22:r=t.memoizedState!==null;var l=n!==null&&n.memoizedState!==null,c=hr,f=Rt;if(hr=c||r,Rt=f||l,Rn(e,t),Rt=f,hr=c,kn(t),a&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||l||hr||Rt||Ws(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){l=n=e;try{if(s=l.stateNode,r)i=s.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{u=l.stateNode;var m=l.memoizedProps.style,p=m!=null&&m.hasOwnProperty("display")?m.display:null;u.style.display=p==null||typeof p=="boolean"?"":(""+p).trim()}}catch(R){Be(l,l.return,R)}}}else if(e.tag===6){if(n===null){l=e;try{l.stateNode.nodeValue=r?"":l.memoizedProps}catch(R){Be(l,l.return,R)}}}else if(e.tag===18){if(n===null){l=e;try{var _=l.stateNode;r?zb(_,!0):zb(l.stateNode,!1)}catch(R){Be(l,l.return,R)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}a&4&&(a=t.updateQueue,a!==null&&(n=a.retryQueue,n!==null&&(a.retryQueue=null,Od(t,n))));break;case 19:Rn(e,t),kn(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Od(t,a)));break;case 30:break;case 21:break;default:Rn(e,t),kn(t)}}function kn(t){var e=t.flags;if(e&2){try{for(var n,a=t.return;a!==null;){if(Kw(a)){n=a;break}a=a.return}if(n==null)throw Error(V(160));switch(n.tag){case 27:var r=n.stateNode,s=zm(t);If(t,s,r);break;case 5:var i=n.stateNode;n.flags&32&&(yo(i,""),n.flags&=-33);var u=zm(t);If(t,u,i);break;case 3:case 4:var l=n.stateNode.containerInfo,c=zm(t);Rg(t,c,l);break;default:throw Error(V(161))}}catch(f){Be(t,t.return,f)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function eC(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;eC(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function cr(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)Xw(t,e.alternate,e),e=e.sibling}function Ws(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Ts(4,e,e.return),Ws(e);break;case 1:ka(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&Gw(e,e.return,n),Ws(e);break;case 27:pl(e.stateNode);case 26:case 5:ka(e,e.return),Ws(e);break;case 22:e.memoizedState===null&&Ws(e);break;case 30:Ws(e);break;default:Ws(e)}t=t.sibling}}function dr(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var a=e.alternate,r=t,s=e,i=s.flags;switch(s.tag){case 0:case 11:case 15:dr(r,s,n),Vl(4,s);break;case 1:if(dr(r,s,n),a=s,r=a.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){Be(a,a.return,c)}if(a=s,r=a.updateQueue,r!==null){var u=a.stateNode;try{var l=r.shared.hiddenCallbacks;if(l!==null)for(r.shared.hiddenCallbacks=null,r=0;r<l.length;r++)$E(l[r],u)}catch(c){Be(a,a.return,c)}}n&&i&64&&Hw(s),cl(s,s.return);break;case 27:Ww(s);case 26:case 5:dr(r,s,n),n&&a===null&&i&4&&jw(s),cl(s,s.return);break;case 12:dr(r,s,n);break;case 31:dr(r,s,n),n&&i&4&&$w(r,s);break;case 13:dr(r,s,n),n&&i&4&&Jw(r,s);break;case 22:s.memoizedState===null&&dr(r,s,n),cl(s,s.return);break;case 30:break;default:dr(r,s,n)}e=e.sibling}}function xy(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&Ml(n))}function Ry(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Ml(t))}function ya(t,e,n,a){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)tC(t,e,n,a),e=e.sibling}function tC(t,e,n,a){var r=e.flags;switch(e.tag){case 0:case 11:case 15:ya(t,e,n,a),r&2048&&Vl(9,e);break;case 1:ya(t,e,n,a);break;case 3:ya(t,e,n,a),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Ml(t)));break;case 12:if(r&2048){ya(t,e,n,a),t=e.stateNode;try{var s=e.memoizedProps,i=s.id,u=s.onPostCommit;typeof u=="function"&&u(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(l){Be(e,e.return,l)}}else ya(t,e,n,a);break;case 31:ya(t,e,n,a);break;case 13:ya(t,e,n,a);break;case 23:break;case 22:s=e.stateNode,i=e.alternate,e.memoizedState!==null?s._visibility&2?ya(t,e,n,a):dl(t,e):s._visibility&2?ya(t,e,n,a):(s._visibility|=2,Wi(t,e,n,a,(e.subtreeFlags&10256)!==0||!1)),r&2048&&xy(i,e);break;case 24:ya(t,e,n,a),r&2048&&Ry(e.alternate,e);break;default:ya(t,e,n,a)}}function Wi(t,e,n,a,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var s=t,i=e,u=n,l=a,c=i.flags;switch(i.tag){case 0:case 11:case 15:Wi(s,i,u,l,r),Vl(8,i);break;case 23:break;case 22:var f=i.stateNode;i.memoizedState!==null?f._visibility&2?Wi(s,i,u,l,r):dl(s,i):(f._visibility|=2,Wi(s,i,u,l,r)),r&&c&2048&&xy(i.alternate,i);break;case 24:Wi(s,i,u,l,r),r&&c&2048&&Ry(i.alternate,i);break;default:Wi(s,i,u,l,r)}e=e.sibling}}function dl(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,a=e,r=a.flags;switch(a.tag){case 22:dl(n,a),r&2048&&xy(a.alternate,a);break;case 24:dl(n,a),r&2048&&Ry(a.alternate,a);break;default:dl(n,a)}e=e.sibling}}var tl=8192;function Ki(t,e,n){if(t.subtreeFlags&tl)for(t=t.child;t!==null;)nC(t,e,n),t=t.sibling}function nC(t,e,n){switch(t.tag){case 26:Ki(t,e,n),t.flags&tl&&t.memoizedState!==null&&LP(n,Ia,t.memoizedState,t.memoizedProps);break;case 5:Ki(t,e,n);break;case 3:case 4:var a=Ia;Ia=Cf(t.stateNode.containerInfo),Ki(t,e,n),Ia=a;break;case 22:t.memoizedState===null&&(a=t.alternate,a!==null&&a.memoizedState!==null?(a=tl,tl=16777216,Ki(t,e,n),tl=a):Ki(t,e,n));break;default:Ki(t,e,n)}}function aC(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function Xu(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];Xt=a,sC(a,t)}aC(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)rC(t),t=t.sibling}function rC(t){switch(t.tag){case 0:case 11:case 15:Xu(t),t.flags&2048&&Ts(9,t,t.return);break;case 3:Xu(t);break;case 12:Xu(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,Yd(t)):Xu(t);break;default:Xu(t)}}function Yd(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];Xt=a,sC(a,t)}aC(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Ts(8,e,e.return),Yd(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,Yd(e));break;default:Yd(e)}t=t.sibling}}function sC(t,e){for(;Xt!==null;){var n=Xt;switch(n.tag){case 0:case 11:case 15:Ts(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:Ml(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,Xt=a;else e:for(n=t;Xt!==null;){a=Xt;var r=a.sibling,s=a.return;if(Qw(a),a===n){Xt=null;break e}if(r!==null){r.return=s,Xt=r;break e}Xt=s}}}var GD={getCacheForType:function(t){var e=cn(kt),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return cn(kt).controller.signal}},jD=typeof WeakMap=="function"?WeakMap:Map,Ne=0,je=null,we=null,Ce=0,Fe=0,jn=null,us=!1,Ro=!1,ky=!1,Er=0,bt=0,bs=0,Js=0,Dy=0,Xn=0,vo=0,fl=null,Pn=null,kg=!1,zf=0,iC=0,_f=1/0,Sf=null,ms=null,Bt=0,gs=null,To=null,_r=0,Dg=0,Pg=null,oC=null,hl=0,Og=null;function Jn(){return Ne&2&&Ce!==0?Ce&-Ce:ie.T!==null?Oy():gE()}function uC(){if(Xn===0)if(!(Ce&536870912)||Le){var t=Ed;Ed<<=1,!(Ed&3932160)&&(Ed=262144),Xn=t}else Xn=536870912;return t=ea.current,t!==null&&(t.flags|=32),Xn}function On(t,e,n){(t===je&&(Fe===2||Fe===9)||t.cancelPendingCommit!==null)&&(bo(t,0),ls(t,Ce,Xn,!1)),Dl(t,n),(!(Ne&2)||t!==je)&&(t===je&&(!(Ne&2)&&(Js|=n),bt===4&&ls(t,Ce,Xn,!1)),Oa(t))}function lC(t,e,n){if(Ne&6)throw Error(V(327));var a=!n&&(e&127)===0&&(e&t.expiredLanes)===0||kl(t,e),r=a?XD(t,e):Gm(t,e,!0),s=a;do{if(r===0){Ro&&!a&&ls(t,e,0,!1);break}else{if(n=t.current.alternate,s&&!KD(n)){r=Gm(t,e,!1),s=!1;continue}if(r===2){if(s=e,t.errorRecoveryDisabledLanes&s)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var u=t;r=fl;var l=u.current.memoizedState.isDehydrated;if(l&&(bo(u,i).flags|=256),i=Gm(u,i,!1),i!==2){if(ky&&!l){u.errorRecoveryDisabledLanes|=s,Js|=s,r=4;break e}s=Pn,Pn=r,s!==null&&(Pn===null?Pn=s:Pn.push.apply(Pn,s))}r=i}if(s=!1,r!==2)continue}}if(r===1){bo(t,0),ls(t,e,0,!0);break}e:{switch(a=t,s=r,s){case 0:case 1:throw Error(V(345));case 4:if((e&4194048)!==e)break;case 6:ls(a,e,Xn,!us);break e;case 2:Pn=null;break;case 3:case 5:break;default:throw Error(V(329))}if((e&62914560)===e&&(r=zf+300-Qn(),10<r)){if(ls(a,e,Xn,!us),kf(a,0,!0)!==0)break e;_r=e,a.timeoutHandle=xC(Lb.bind(null,a,n,Pn,Sf,kg,e,Xn,Js,vo,us,s,"Throttled",-0,0),r);break e}Lb(a,n,Pn,Sf,kg,e,Xn,Js,vo,us,s,null,-0,0)}}break}while(!0);Oa(t)}function Lb(t,e,n,a,r,s,i,u,l,c,f,m,p,_){if(t.timeoutHandle=-1,m=e.subtreeFlags,m&8192||(m&16785408)===16785408){m={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:mr},nC(e,s,m);var R=(s&62914560)===s?zf-Qn():(s&4194048)===s?iC-Qn():0;if(R=AP(m,R),R!==null){_r=s,t.cancelPendingCommit=R(xb.bind(null,t,e,s,n,a,r,i,u,l,f,m,null,p,_)),ls(t,s,i,!c);return}}xb(t,e,s,n,a,r,i,u,l)}function KD(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var r=n[a],s=r.getSnapshot;r=r.value;try{if(!Zn(s(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function ls(t,e,n,a){e&=~Dy,e&=~Js,t.suspendedLanes|=e,t.pingedLanes&=~e,a&&(t.warmLanes|=e),a=t.expirationTimes;for(var r=e;0<r;){var s=31-$n(r),i=1<<s;a[s]=-1,r&=~i}n!==0&&hE(t,n,e)}function Hf(){return Ne&6?!0:(Ul(0,!1),!1)}function Py(){if(we!==null){if(Fe===0)var t=we.return;else t=we,gr=ui=null,Iy(t),fo=null,vl=0,t=we;for(;t!==null;)zw(t.alternate,t),t=t.return;we=null}}function bo(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,cP(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),_r=0,Py(),je=t,we=n=yr(t.current,null),Ce=e,Fe=0,jn=null,us=!1,Ro=kl(t,e),ky=!1,vo=Xn=Dy=Js=bs=bt=0,Pn=fl=null,kg=!1,e&8&&(e|=e&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=e;0<a;){var r=31-$n(a),s=1<<r;e|=t[r],a&=~s}return Er=e,Mf(),n}function cC(t,e){ce=null,ie.H=bl,e===xo||e===Vf?(e=sb(),Fe=3):e===dy?(e=sb(),Fe=4):Fe=e===Ly?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,jn=e,we===null&&(bt=1,gf(t,ua(e,t.current)))}function dC(){var t=ea.current;return t===null?!0:(Ce&4194048)===Ce?ca===null:(Ce&62914560)===Ce||Ce&536870912?t===ca:!1}function fC(){var t=ie.H;return ie.H=bl,t===null?bl:t}function hC(){var t=ie.A;return ie.A=GD,t}function vf(){bt=4,us||(Ce&4194048)!==Ce&&ea.current!==null||(Ro=!0),!(bs&134217727)&&!(Js&134217727)||je===null||ls(je,Ce,Xn,!1)}function Gm(t,e,n){var a=Ne;Ne|=2;var r=fC(),s=hC();(je!==t||Ce!==e)&&(Sf=null,bo(t,e)),e=!1;var i=bt;e:do try{if(Fe!==0&&we!==null){var u=we,l=jn;switch(Fe){case 8:Py(),i=6;break e;case 3:case 2:case 9:case 6:ea.current===null&&(e=!0);var c=Fe;if(Fe=0,jn=null,io(t,u,l,c),n&&Ro){i=0;break e}break;default:c=Fe,Fe=0,jn=null,io(t,u,l,c)}}WD(),i=bt;break}catch(f){cC(t,f)}while(!0);return e&&t.shellSuspendCounter++,gr=ui=null,Ne=a,ie.H=r,ie.A=s,we===null&&(je=null,Ce=0,Mf()),i}function WD(){for(;we!==null;)pC(we)}function XD(t,e){var n=Ne;Ne|=2;var a=fC(),r=hC();je!==t||Ce!==e?(Sf=null,_f=Qn()+500,bo(t,e)):Ro=kl(t,e);e:do try{if(Fe!==0&&we!==null){e=we;var s=jn;t:switch(Fe){case 1:Fe=0,jn=null,io(t,e,s,1);break;case 2:case 9:if(rb(s)){Fe=0,jn=null,Ab(e);break}e=function(){Fe!==2&&Fe!==9||je!==t||(Fe=7),Oa(t)},s.then(e,e);break e;case 3:Fe=7;break e;case 4:Fe=5;break e;case 7:rb(s)?(Fe=0,jn=null,Ab(e)):(Fe=0,jn=null,io(t,e,s,7));break;case 5:var i=null;switch(we.tag){case 26:i=we.memoizedState;case 5:case 27:var u=we;if(i?OC(i):u.stateNode.complete){Fe=0,jn=null;var l=u.sibling;if(l!==null)we=l;else{var c=u.return;c!==null?(we=c,Gf(c)):we=null}break t}}Fe=0,jn=null,io(t,e,s,5);break;case 6:Fe=0,jn=null,io(t,e,s,6);break;case 8:Py(),bt=6;break e;default:throw Error(V(462))}}QD();break}catch(f){cC(t,f)}while(!0);return gr=ui=null,ie.H=a,ie.A=r,Ne=n,we!==null?0:(je=null,Ce=0,Mf(),bt)}function QD(){for(;we!==null&&!Ik();)pC(we)}function pC(t){var e=qw(t.alternate,t,Er);t.memoizedProps=t.pendingProps,e===null?Gf(t):we=e}function Ab(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=vb(n,e,e.pendingProps,e.type,void 0,Ce);break;case 11:e=vb(n,e,e.pendingProps,e.type.render,e.ref,Ce);break;case 5:Iy(e);default:zw(n,e),e=we=zE(e,Er),e=qw(n,e,Er)}t.memoizedProps=t.pendingProps,e===null?Gf(t):we=e}function io(t,e,n,a){gr=ui=null,Iy(e),fo=null,vl=0;var r=e.return;try{if(VD(t,r,e,n,Ce)){bt=1,gf(t,ua(n,t.current)),we=null;return}}catch(s){if(r!==null)throw we=r,s;bt=1,gf(t,ua(n,t.current)),we=null;return}e.flags&32768?(Le||a===1?t=!0:Ro||Ce&536870912?t=!1:(us=t=!0,(a===2||a===9||a===3||a===6)&&(a=ea.current,a!==null&&a.tag===13&&(a.flags|=16384))),mC(e,t)):Gf(e)}function Gf(t){var e=t;do{if(e.flags&32768){mC(e,us);return}t=e.return;var n=BD(e.alternate,e,Er);if(n!==null){we=n;return}if(e=e.sibling,e!==null){we=e;return}we=e=t}while(e!==null);bt===0&&(bt=5)}function mC(t,e){do{var n=qD(t.alternate,t);if(n!==null){n.flags&=32767,we=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){we=t;return}we=t=n}while(t!==null);bt=6,we=null}function xb(t,e,n,a,r,s,i,u,l){t.cancelPendingCommit=null;do jf();while(Bt!==0);if(Ne&6)throw Error(V(327));if(e!==null){if(e===t.current)throw Error(V(177));if(s=e.lanes|e.childLanes,s|=ry,Ak(t,n,s,i,u,l),t===je&&(we=je=null,Ce=0),To=e,gs=t,_r=n,Dg=s,Pg=r,oC=a,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,ZD(rf,function(){return SC(),null})):(t.callbackNode=null,t.callbackPriority=0),a=(e.flags&13878)!==0,e.subtreeFlags&13878||a){a=ie.T,ie.T=null,r=Ve.p,Ve.p=2,i=Ne,Ne|=4;try{zD(t,e,n)}finally{Ne=i,Ve.p=r,ie.T=a}}Bt=1,gC(),yC(),IC()}}function gC(){if(Bt===1){Bt=0;var t=gs,e=To,n=(e.flags&13878)!==0;if(e.subtreeFlags&13878||n){n=ie.T,ie.T=null;var a=Ve.p;Ve.p=2;var r=Ne;Ne|=4;try{Zw(e,t);var s=Ug,i=OE(t.containerInfo),u=s.focusedElem,l=s.selectionRange;if(i!==u&&u&&u.ownerDocument&&PE(u.ownerDocument.documentElement,u)){if(l!==null&&ay(u)){var c=l.start,f=l.end;if(f===void 0&&(f=c),"selectionStart"in u)u.selectionStart=c,u.selectionEnd=Math.min(f,u.value.length);else{var m=u.ownerDocument||document,p=m&&m.defaultView||window;if(p.getSelection){var _=p.getSelection(),R=u.textContent.length,D=Math.min(l.start,R),L=l.end===void 0?D:Math.min(l.end,R);!_.extend&&D>L&&(i=L,L=D,D=i);var T=$T(u,D),I=$T(u,L);if(T&&I&&(_.rangeCount!==1||_.anchorNode!==T.node||_.anchorOffset!==T.offset||_.focusNode!==I.node||_.focusOffset!==I.offset)){var w=m.createRange();w.setStart(T.node,T.offset),_.removeAllRanges(),D>L?(_.addRange(w),_.extend(I.node,I.offset)):(w.setEnd(I.node,I.offset),_.addRange(w))}}}}for(m=[],_=u;_=_.parentNode;)_.nodeType===1&&m.push({element:_,left:_.scrollLeft,top:_.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<m.length;u++){var x=m[u];x.element.scrollLeft=x.left,x.element.scrollTop=x.top}}xf=!!Vg,Ug=Vg=null}finally{Ne=r,Ve.p=a,ie.T=n}}t.current=e,Bt=2}}function yC(){if(Bt===2){Bt=0;var t=gs,e=To,n=(e.flags&8772)!==0;if(e.subtreeFlags&8772||n){n=ie.T,ie.T=null;var a=Ve.p;Ve.p=2;var r=Ne;Ne|=4;try{Xw(t,e.alternate,e)}finally{Ne=r,Ve.p=a,ie.T=n}}Bt=3}}function IC(){if(Bt===4||Bt===3){Bt=0,_k();var t=gs,e=To,n=_r,a=oC;e.subtreeFlags&10256||e.flags&10256?Bt=5:(Bt=0,To=gs=null,_C(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(ms=null),Yg(n),e=e.stateNode,Yn&&typeof Yn.onCommitFiberRoot=="function")try{Yn.onCommitFiberRoot(Rl,e,void 0,(e.current.flags&128)===128)}catch{}if(a!==null){e=ie.T,r=Ve.p,Ve.p=2,ie.T=null;try{for(var s=t.onRecoverableError,i=0;i<a.length;i++){var u=a[i];s(u.value,{componentStack:u.stack})}}finally{ie.T=e,Ve.p=r}}_r&3&&jf(),Oa(t),r=t.pendingLanes,n&261930&&r&42?t===Og?hl++:(hl=0,Og=t):hl=0,Ul(0,!1)}}function _C(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,Ml(e)))}function jf(){return gC(),yC(),IC(),SC()}function SC(){if(Bt!==5)return!1;var t=gs,e=Dg;Dg=0;var n=Yg(_r),a=ie.T,r=Ve.p;try{Ve.p=32>n?32:n,ie.T=null,n=Pg,Pg=null;var s=gs,i=_r;if(Bt=0,To=gs=null,_r=0,Ne&6)throw Error(V(331));var u=Ne;if(Ne|=4,rC(s.current),tC(s,s.current,i,n),Ne=u,Ul(0,!1),Yn&&typeof Yn.onPostCommitFiberRoot=="function")try{Yn.onPostCommitFiberRoot(Rl,s)}catch{}return!0}finally{Ve.p=r,ie.T=a,_C(t,e)}}function Rb(t,e,n){e=ua(n,e),e=Lg(t.stateNode,e,2),t=ps(t,e,2),t!==null&&(Dl(t,2),Oa(t))}function Be(t,e,n){if(t.tag===3)Rb(t,t,n);else for(;e!==null;){if(e.tag===3){Rb(e,t,n);break}else if(e.tag===1){var a=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(ms===null||!ms.has(a))){t=ua(n,t),n=Mw(2),a=ps(e,n,2),a!==null&&(Nw(n,a,e,t),Dl(a,2),Oa(a));break}}e=e.return}}function jm(t,e,n){var a=t.pingCache;if(a===null){a=t.pingCache=new jD;var r=new Set;a.set(e,r)}else r=a.get(e),r===void 0&&(r=new Set,a.set(e,r));r.has(n)||(ky=!0,r.add(n),t=YD.bind(null,t,e,n),e.then(t,t))}function YD(t,e,n){var a=t.pingCache;a!==null&&a.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,je===t&&(Ce&n)===n&&(bt===4||bt===3&&(Ce&62914560)===Ce&&300>Qn()-zf?!(Ne&2)&&bo(t,0):Dy|=n,vo===Ce&&(vo=0)),Oa(t)}function vC(t,e){e===0&&(e=fE()),t=oi(t,e),t!==null&&(Dl(t,e),Oa(t))}function $D(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),vC(t,n)}function JD(t,e){var n=0;switch(t.tag){case 31:case 13:var a=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:a=t.stateNode;break;case 22:a=t.stateNode._retryCache;break;default:throw Error(V(314))}a!==null&&a.delete(e),vC(t,n)}function ZD(t,e){return Xg(t,e)}var Tf=null,Xi=null,Mg=!1,bf=!1,Km=!1,cs=0;function Oa(t){t!==Xi&&t.next===null&&(Xi===null?Tf=Xi=t:Xi=Xi.next=t),bf=!0,Mg||(Mg=!0,tP())}function Ul(t,e){if(!Km&&bf){Km=!0;do for(var n=!1,a=Tf;a!==null;){if(!e)if(t!==0){var r=a.pendingLanes;if(r===0)var s=0;else{var i=a.suspendedLanes,u=a.pingedLanes;s=(1<<31-$n(42|t)+1)-1,s&=r&~(i&~u),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(n=!0,kb(a,s))}else s=Ce,s=kf(a,a===je?s:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(s&3)||kl(a,s)||(n=!0,kb(a,s));a=a.next}while(n);Km=!1}}function eP(){TC()}function TC(){bf=Mg=!1;var t=0;cs!==0&&lP()&&(t=cs);for(var e=Qn(),n=null,a=Tf;a!==null;){var r=a.next,s=bC(a,e);s===0?(a.next=null,n===null?Tf=r:n.next=r,r===null&&(Xi=n)):(n=a,(t!==0||s&3)&&(bf=!0)),a=r}Bt!==0&&Bt!==5||Ul(t,!1),cs!==0&&(cs=0)}function bC(t,e){for(var n=t.suspendedLanes,a=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes&-62914561;0<s;){var i=31-$n(s),u=1<<i,l=r[i];l===-1?(!(u&n)||u&a)&&(r[i]=Lk(u,e)):l<=e&&(t.expiredLanes|=u),s&=~u}if(e=je,n=Ce,n=kf(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a=t.callbackNode,n===0||t===e&&(Fe===2||Fe===9)||t.cancelPendingCommit!==null)return a!==null&&a!==null&&vm(a),t.callbackNode=null,t.callbackPriority=0;if(!(n&3)||kl(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(a!==null&&vm(a),Yg(n)){case 2:case 8:n=cE;break;case 32:n=rf;break;case 268435456:n=dE;break;default:n=rf}return a=EC.bind(null,t),n=Xg(n,a),t.callbackPriority=e,t.callbackNode=n,e}return a!==null&&a!==null&&vm(a),t.callbackPriority=2,t.callbackNode=null,2}function EC(t,e){if(Bt!==0&&Bt!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(jf()&&t.callbackNode!==n)return null;var a=Ce;return a=kf(t,t===je?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a===0?null:(lC(t,a,e),bC(t,Qn()),t.callbackNode!=null&&t.callbackNode===n?EC.bind(null,t):null)}function kb(t,e){if(jf())return null;lC(t,e,!0)}function tP(){dP(function(){Ne&6?Xg(lE,eP):TC()})}function Oy(){if(cs===0){var t=Io;t===0&&(t=bd,bd<<=1,!(bd&261888)&&(bd=256)),cs=t}return cs}function Db(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:qd(""+t)}function Pb(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function nP(t,e,n,a,r){if(e==="submit"&&n&&n.stateNode===r){var s=Db((r[Mn]||null).action),i=a.submitter;i&&(e=(e=i[Mn]||null)?Db(e.formAction):i.getAttribute("formAction"),e!==null&&(s=e,i=null));var u=new Df("action","action",null,a,r);t.push({event:u,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(cs!==0){var l=i?Pb(r,i):new FormData(r);wg(n,{pending:!0,data:l,method:r.method,action:s},null,l)}}else typeof s=="function"&&(u.preventDefault(),l=i?Pb(r,i):new FormData(r),wg(n,{pending:!0,data:l,method:r.method,action:s},s,l))},currentTarget:r}]})}}for(Md=0;Md<hg.length;Md++)Nd=hg[Md],Ob=Nd.toLowerCase(),Mb=Nd[0].toUpperCase()+Nd.slice(1),_a(Ob,"on"+Mb);var Nd,Ob,Mb,Md;_a(NE,"onAnimationEnd");_a(VE,"onAnimationIteration");_a(UE,"onAnimationStart");_a("dblclick","onDoubleClick");_a("focusin","onFocus");_a("focusout","onBlur");_a(SD,"onTransitionRun");_a(vD,"onTransitionStart");_a(TD,"onTransitionCancel");_a(FE,"onTransitionEnd");go("onMouseEnter",["mouseout","mouseover"]);go("onMouseLeave",["mouseout","mouseover"]);go("onPointerEnter",["pointerout","pointerover"]);go("onPointerLeave",["pointerout","pointerover"]);ri("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ri("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ri("onBeforeInput",["compositionend","keypress","textInput","paste"]);ri("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ri("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ri("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var El="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),aP=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(El));function wC(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var a=t[n],r=a.event;a=a.listeners;e:{var s=void 0;if(e)for(var i=a.length-1;0<=i;i--){var u=a[i],l=u.instance,c=u.currentTarget;if(u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=c;try{s(r)}catch(f){of(f)}r.currentTarget=null,s=l}else for(i=0;i<a.length;i++){if(u=a[i],l=u.instance,c=u.currentTarget,u=u.listener,l!==s&&r.isPropagationStopped())break e;s=u,r.currentTarget=c;try{s(r)}catch(f){of(f)}r.currentTarget=null,s=l}}}}function Ee(t,e){var n=e[sg];n===void 0&&(n=e[sg]=new Set);var a=t+"__bubble";n.has(a)||(CC(e,t,2,!1),n.add(a))}function Wm(t,e,n){var a=0;e&&(a|=4),CC(n,t,a,e)}var Vd="_reactListening"+Math.random().toString(36).slice(2);function My(t){if(!t[Vd]){t[Vd]=!0,yE.forEach(function(n){n!=="selectionchange"&&(aP.has(n)||Wm(n,!1,t),Wm(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Vd]||(e[Vd]=!0,Wm("selectionchange",!1,e))}}function CC(t,e,n,a){switch(FC(e)){case 2:var r=kP;break;case 8:r=DP;break;default:r=Fy}n=r.bind(null,e,n,t),r=void 0,!cg||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),a?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function Xm(t,e,n,a,r){var s=a;if(!(e&1)&&!(e&2)&&a!==null)e:for(;;){if(a===null)return;var i=a.tag;if(i===3||i===4){var u=a.stateNode.containerInfo;if(u===r)break;if(i===4)for(i=a.return;i!==null;){var l=i.tag;if((l===3||l===4)&&i.stateNode.containerInfo===r)return;i=i.return}for(;u!==null;){if(i=$i(u),i===null)return;if(l=i.tag,l===5||l===6||l===26||l===27){a=s=i;continue e}u=u.parentNode}}a=a.return}wE(function(){var c=s,f=Zg(n),m=[];e:{var p=BE.get(t);if(p!==void 0){var _=Df,R=t;switch(t){case"keypress":if(Hd(n)===0)break e;case"keydown":case"keyup":_=Jk;break;case"focusin":R="focus",_=Cm;break;case"focusout":R="blur",_=Cm;break;case"beforeblur":case"afterblur":_=Cm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":_=zT;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":_=Bk;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":_=tD;break;case NE:case VE:case UE:_=Hk;break;case FE:_=aD;break;case"scroll":case"scrollend":_=Uk;break;case"wheel":_=sD;break;case"copy":case"cut":case"paste":_=jk;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":_=GT;break;case"toggle":case"beforetoggle":_=oD}var D=(e&4)!==0,L=!D&&(t==="scroll"||t==="scrollend"),T=D?p!==null?p+"Capture":null:p;D=[];for(var I=c,w;I!==null;){var x=I;if(w=x.stateNode,x=x.tag,x!==5&&x!==26&&x!==27||w===null||T===null||(x=gl(I,T),x!=null&&D.push(wl(I,x,w))),L)break;I=I.return}0<D.length&&(p=new _(p,R,null,n,f),m.push({event:p,listeners:D}))}}if(!(e&7)){e:{if(p=t==="mouseover"||t==="pointerover",_=t==="mouseout"||t==="pointerout",p&&n!==lg&&(R=n.relatedTarget||n.fromElement)&&($i(R)||R[Co]))break e;if((_||p)&&(p=f.window===f?f:(p=f.ownerDocument)?p.defaultView||p.parentWindow:window,_?(R=n.relatedTarget||n.toElement,_=c,R=R?$i(R):null,R!==null&&(L=xl(R),D=R.tag,R!==L||D!==5&&D!==27&&D!==6)&&(R=null)):(_=null,R=c),_!==R)){if(D=zT,x="onMouseLeave",T="onMouseEnter",I="mouse",(t==="pointerout"||t==="pointerover")&&(D=GT,x="onPointerLeave",T="onPointerEnter",I="pointer"),L=_==null?p:Zu(_),w=R==null?p:Zu(R),p=new D(x,I+"leave",_,n,f),p.target=L,p.relatedTarget=w,x=null,$i(f)===c&&(D=new D(T,I+"enter",R,n,f),D.target=w,D.relatedTarget=L,x=D),L=x,_&&R)t:{for(D=rP,T=_,I=R,w=0,x=T;x;x=D(x))w++;x=0;for(var H=I;H;H=D(H))x++;for(;0<w-x;)T=D(T),w--;for(;0<x-w;)I=D(I),x--;for(;w--;){if(T===I||I!==null&&T===I.alternate){D=T;break t}T=D(T),I=D(I)}D=null}else D=null;_!==null&&Nb(m,p,_,D,!1),R!==null&&L!==null&&Nb(m,L,R,D,!0)}}e:{if(p=c?Zu(c):window,_=p.nodeName&&p.nodeName.toLowerCase(),_==="select"||_==="input"&&p.type==="file")var j=XT;else if(WT(p))if(kE)j=yD;else{j=mD;var S=pD}else _=p.nodeName,!_||_.toLowerCase()!=="input"||p.type!=="checkbox"&&p.type!=="radio"?c&&Jg(c.elementType)&&(j=XT):j=gD;if(j&&(j=j(t,c))){RE(m,j,n,f);break e}S&&S(t,p,c),t==="focusout"&&c&&p.type==="number"&&c.memoizedProps.value!=null&&ug(p,"number",p.value)}switch(S=c?Zu(c):window,t){case"focusin":(WT(S)||S.contentEditable==="true")&&(eo=S,dg=c,rl=null);break;case"focusout":rl=dg=eo=null;break;case"mousedown":fg=!0;break;case"contextmenu":case"mouseup":case"dragend":fg=!1,JT(m,n,f);break;case"selectionchange":if(_D)break;case"keydown":case"keyup":JT(m,n,f)}var g;if(ny)e:{switch(t){case"compositionstart":var v="onCompositionStart";break e;case"compositionend":v="onCompositionEnd";break e;case"compositionupdate":v="onCompositionUpdate";break e}v=void 0}else Zi?AE(t,n)&&(v="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(v="onCompositionStart");v&&(LE&&n.locale!=="ko"&&(Zi||v!=="onCompositionStart"?v==="onCompositionEnd"&&Zi&&(g=CE()):(os=f,ey="value"in os?os.value:os.textContent,Zi=!0)),S=Ef(c,v),0<S.length&&(v=new HT(v,t,null,n,f),m.push({event:v,listeners:S}),g?v.data=g:(g=xE(n),g!==null&&(v.data=g)))),(g=lD?cD(t,n):dD(t,n))&&(v=Ef(c,"onBeforeInput"),0<v.length&&(S=new HT("onBeforeInput","beforeinput",null,n,f),m.push({event:S,listeners:v}),S.data=g)),nP(m,t,c,n,f)}wC(m,e)})}function wl(t,e,n){return{instance:t,listener:e,currentTarget:n}}function Ef(t,e){for(var n=e+"Capture",a=[];t!==null;){var r=t,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=gl(t,n),r!=null&&a.unshift(wl(t,r,s)),r=gl(t,e),r!=null&&a.push(wl(t,r,s))),t.tag===3)return a;t=t.return}return[]}function rP(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function Nb(t,e,n,a,r){for(var s=e._reactName,i=[];n!==null&&n!==a;){var u=n,l=u.alternate,c=u.stateNode;if(u=u.tag,l!==null&&l===a)break;u!==5&&u!==26&&u!==27||c===null||(l=c,r?(c=gl(n,s),c!=null&&i.unshift(wl(n,c,l))):r||(c=gl(n,s),c!=null&&i.push(wl(n,c,l)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var sP=/\r\n?/g,iP=/\u0000|\uFFFD/g;function Vb(t){return(typeof t=="string"?t:""+t).replace(sP,`
`).replace(iP,"")}function LC(t,e){return e=Vb(e),Vb(t)===e}function qe(t,e,n,a,r,s){switch(n){case"children":typeof a=="string"?e==="body"||e==="textarea"&&a===""||yo(t,a):(typeof a=="number"||typeof a=="bigint")&&e!=="body"&&yo(t,""+a);break;case"className":Cd(t,"class",a);break;case"tabIndex":Cd(t,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":Cd(t,n,a);break;case"style":EE(t,a,s);break;case"data":if(e!=="object"){Cd(t,"data",a);break}case"src":case"href":if(a===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=qd(""+a),t.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(n==="formAction"?(e!=="input"&&qe(t,e,"name",r.name,r,null),qe(t,e,"formEncType",r.formEncType,r,null),qe(t,e,"formMethod",r.formMethod,r,null),qe(t,e,"formTarget",r.formTarget,r,null)):(qe(t,e,"encType",r.encType,r,null),qe(t,e,"method",r.method,r,null),qe(t,e,"target",r.target,r,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=qd(""+a),t.setAttribute(n,a);break;case"onClick":a!=null&&(t.onclick=mr);break;case"onScroll":a!=null&&Ee("scroll",t);break;case"onScrollEnd":a!=null&&Ee("scrollend",t);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(V(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(V(60));t.innerHTML=n}}break;case"multiple":t.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":t.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){t.removeAttribute("xlink:href");break}n=qd(""+a),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""+a):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":a===!0?t.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,a):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?t.setAttribute(n,a):t.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?t.removeAttribute(n):t.setAttribute(n,a);break;case"popover":Ee("beforetoggle",t),Ee("toggle",t),Bd(t,"popover",a);break;case"xlinkActuate":or(t,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":or(t,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":or(t,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":or(t,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":or(t,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":or(t,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":or(t,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":or(t,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":or(t,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":Bd(t,"is",a);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=Nk.get(n)||n,Bd(t,n,a))}}function Ng(t,e,n,a,r,s){switch(n){case"style":EE(t,a,s);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(V(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(V(60));t.innerHTML=n}}break;case"children":typeof a=="string"?yo(t,a):(typeof a=="number"||typeof a=="bigint")&&yo(t,""+a);break;case"onScroll":a!=null&&Ee("scroll",t);break;case"onScrollEnd":a!=null&&Ee("scrollend",t);break;case"onClick":a!=null&&(t.onclick=mr);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!IE.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),s=t[Mn]||null,s=s!=null?s[n]:null,typeof s=="function"&&t.removeEventListener(e,s,r),typeof a=="function")){typeof s!="function"&&s!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,a,r);break e}n in t?t[n]=a:a===!0?t.setAttribute(n,""):Bd(t,n,a)}}}function dn(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Ee("error",t),Ee("load",t);var a=!1,r=!1,s;for(s in n)if(n.hasOwnProperty(s)){var i=n[s];if(i!=null)switch(s){case"src":a=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(V(137,e));default:qe(t,e,s,i,n,null)}}r&&qe(t,e,"srcSet",n.srcSet,n,null),a&&qe(t,e,"src",n.src,n,null);return;case"input":Ee("invalid",t);var u=s=i=r=null,l=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":r=f;break;case"type":i=f;break;case"checked":l=f;break;case"defaultChecked":c=f;break;case"value":s=f;break;case"defaultValue":u=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(V(137,e));break;default:qe(t,e,a,f,n,null)}}vE(t,s,u,l,c,i,r,!1);return;case"select":Ee("invalid",t),a=i=s=null;for(r in n)if(n.hasOwnProperty(r)&&(u=n[r],u!=null))switch(r){case"value":s=u;break;case"defaultValue":i=u;break;case"multiple":a=u;default:qe(t,e,r,u,n,null)}e=s,n=i,t.multiple=!!a,e!=null?uo(t,!!a,e,!1):n!=null&&uo(t,!!a,n,!0);return;case"textarea":Ee("invalid",t),s=r=a=null;for(i in n)if(n.hasOwnProperty(i)&&(u=n[i],u!=null))switch(i){case"value":a=u;break;case"defaultValue":r=u;break;case"children":s=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(V(91));break;default:qe(t,e,i,u,n,null)}bE(t,a,r,s);return;case"option":for(l in n)if(n.hasOwnProperty(l)&&(a=n[l],a!=null))switch(l){case"selected":t.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:qe(t,e,l,a,n,null)}return;case"dialog":Ee("beforetoggle",t),Ee("toggle",t),Ee("cancel",t),Ee("close",t);break;case"iframe":case"object":Ee("load",t);break;case"video":case"audio":for(a=0;a<El.length;a++)Ee(El[a],t);break;case"image":Ee("error",t),Ee("load",t);break;case"details":Ee("toggle",t);break;case"embed":case"source":case"link":Ee("error",t),Ee("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(V(137,e));default:qe(t,e,c,a,n,null)}return;default:if(Jg(e)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&Ng(t,e,f,a,n,void 0));return}}for(u in n)n.hasOwnProperty(u)&&(a=n[u],a!=null&&qe(t,e,u,a,n,null))}function oP(t,e,n,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,i=null,u=null,l=null,c=null,f=null;for(_ in n){var m=n[_];if(n.hasOwnProperty(_)&&m!=null)switch(_){case"checked":break;case"value":break;case"defaultValue":l=m;default:a.hasOwnProperty(_)||qe(t,e,_,null,a,m)}}for(var p in a){var _=a[p];if(m=n[p],a.hasOwnProperty(p)&&(_!=null||m!=null))switch(p){case"type":s=_;break;case"name":r=_;break;case"checked":c=_;break;case"defaultChecked":f=_;break;case"value":i=_;break;case"defaultValue":u=_;break;case"children":case"dangerouslySetInnerHTML":if(_!=null)throw Error(V(137,e));break;default:_!==m&&qe(t,e,p,_,a,m)}}og(t,i,u,l,c,f,s,r);return;case"select":_=i=u=p=null;for(s in n)if(l=n[s],n.hasOwnProperty(s)&&l!=null)switch(s){case"value":break;case"multiple":_=l;default:a.hasOwnProperty(s)||qe(t,e,s,null,a,l)}for(r in a)if(s=a[r],l=n[r],a.hasOwnProperty(r)&&(s!=null||l!=null))switch(r){case"value":p=s;break;case"defaultValue":u=s;break;case"multiple":i=s;default:s!==l&&qe(t,e,r,s,a,l)}e=u,n=i,a=_,p!=null?uo(t,!!n,p,!1):!!a!=!!n&&(e!=null?uo(t,!!n,e,!0):uo(t,!!n,n?[]:"",!1));return;case"textarea":_=p=null;for(u in n)if(r=n[u],n.hasOwnProperty(u)&&r!=null&&!a.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:qe(t,e,u,null,a,r)}for(i in a)if(r=a[i],s=n[i],a.hasOwnProperty(i)&&(r!=null||s!=null))switch(i){case"value":p=r;break;case"defaultValue":_=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(V(91));break;default:r!==s&&qe(t,e,i,r,a,s)}TE(t,p,_);return;case"option":for(var R in n)if(p=n[R],n.hasOwnProperty(R)&&p!=null&&!a.hasOwnProperty(R))switch(R){case"selected":t.selected=!1;break;default:qe(t,e,R,null,a,p)}for(l in a)if(p=a[l],_=n[l],a.hasOwnProperty(l)&&p!==_&&(p!=null||_!=null))switch(l){case"selected":t.selected=p&&typeof p!="function"&&typeof p!="symbol";break;default:qe(t,e,l,p,a,_)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var D in n)p=n[D],n.hasOwnProperty(D)&&p!=null&&!a.hasOwnProperty(D)&&qe(t,e,D,null,a,p);for(c in a)if(p=a[c],_=n[c],a.hasOwnProperty(c)&&p!==_&&(p!=null||_!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(p!=null)throw Error(V(137,e));break;default:qe(t,e,c,p,a,_)}return;default:if(Jg(e)){for(var L in n)p=n[L],n.hasOwnProperty(L)&&p!==void 0&&!a.hasOwnProperty(L)&&Ng(t,e,L,void 0,a,p);for(f in a)p=a[f],_=n[f],!a.hasOwnProperty(f)||p===_||p===void 0&&_===void 0||Ng(t,e,f,p,a,_);return}}for(var T in n)p=n[T],n.hasOwnProperty(T)&&p!=null&&!a.hasOwnProperty(T)&&qe(t,e,T,null,a,p);for(m in a)p=a[m],_=n[m],!a.hasOwnProperty(m)||p===_||p==null&&_==null||qe(t,e,m,p,a,_)}function Ub(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function uP(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var r=n[a],s=r.transferSize,i=r.initiatorType,u=r.duration;if(s&&u&&Ub(i)){for(i=0,u=r.responseEnd,a+=1;a<n.length;a++){var l=n[a],c=l.startTime;if(c>u)break;var f=l.transferSize,m=l.initiatorType;f&&Ub(m)&&(l=l.responseEnd,i+=f*(l<u?1:(u-c)/(l-c)))}if(--a,e+=8*(s+i)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Vg=null,Ug=null;function wf(t){return t.nodeType===9?t:t.ownerDocument}function Fb(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function AC(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function Fg(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Qm=null;function lP(){var t=window.event;return t&&t.type==="popstate"?t===Qm?!1:(Qm=t,!0):(Qm=null,!1)}var xC=typeof setTimeout=="function"?setTimeout:void 0,cP=typeof clearTimeout=="function"?clearTimeout:void 0,Bb=typeof Promise=="function"?Promise:void 0,dP=typeof queueMicrotask=="function"?queueMicrotask:typeof Bb<"u"?function(t){return Bb.resolve(null).then(t).catch(fP)}:xC;function fP(t){setTimeout(function(){throw t})}function ws(t){return t==="head"}function qb(t,e){var n=e,a=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(a===0){t.removeChild(r),wo(e);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")pl(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,pl(n);for(var s=n.firstChild;s;){var i=s.nextSibling,u=s.nodeName;s[Pl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&s.rel.toLowerCase()==="stylesheet"||n.removeChild(s),s=i}}else n==="body"&&pl(t.ownerDocument.body);n=r}while(n);wo(e)}function zb(t,e){var n=t;t=0;do{var a=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=a}while(n)}function Bg(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Bg(n),$g(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function hP(t,e,n,a){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!a&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(a){if(!t[Pl])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(s=t.getAttribute("rel"),s==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(s!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(s=t.getAttribute("src"),(s!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===s)return t}else return t;if(t=da(t.nextSibling),t===null)break}return null}function pP(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=da(t.nextSibling),t===null))return null;return t}function RC(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=da(t.nextSibling),t===null))return null;return t}function qg(t){return t.data==="$?"||t.data==="$~"}function zg(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function mP(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var a=function(){e(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),t._reactRetry=a}}function da(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var Hg=null;function Hb(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return da(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function Gb(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function kC(t,e,n){switch(e=wf(n),t){case"html":if(t=e.documentElement,!t)throw Error(V(452));return t;case"head":if(t=e.head,!t)throw Error(V(453));return t;case"body":if(t=e.body,!t)throw Error(V(454));return t;default:throw Error(V(451))}}function pl(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);$g(t)}var fa=new Map,jb=new Set;function Cf(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var wr=Ve.d;Ve.d={f:gP,r:yP,D:IP,C:_P,L:SP,m:vP,X:bP,S:TP,M:EP};function gP(){var t=wr.f(),e=Hf();return t||e}function yP(t){var e=Lo(t);e!==null&&e.tag===5&&e.type==="form"?Ew(e):wr.r(t)}var ko=typeof document>"u"?null:document;function DC(t,e,n){var a=ko;if(a&&typeof e=="string"&&e){var r=oa(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),jb.has(r)||(jb.add(r),t={rel:t,crossOrigin:n,href:e},a.querySelector(r)===null&&(e=a.createElement("link"),dn(e,"link",t),Qt(e),a.head.appendChild(e)))}}function IP(t){wr.D(t),DC("dns-prefetch",t,null)}function _P(t,e){wr.C(t,e),DC("preconnect",t,e)}function SP(t,e,n){wr.L(t,e,n);var a=ko;if(a&&t&&e){var r='link[rel="preload"][as="'+oa(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+oa(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+oa(n.imageSizes)+'"]')):r+='[href="'+oa(t)+'"]';var s=r;switch(e){case"style":s=Eo(t);break;case"script":s=Do(t)}fa.has(s)||(t=st({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),fa.set(s,t),a.querySelector(r)!==null||e==="style"&&a.querySelector(Fl(s))||e==="script"&&a.querySelector(Bl(s))||(e=a.createElement("link"),dn(e,"link",t),Qt(e),a.head.appendChild(e)))}}function vP(t,e){wr.m(t,e);var n=ko;if(n&&t){var a=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+oa(a)+'"][href="'+oa(t)+'"]',s=r;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=Do(t)}if(!fa.has(s)&&(t=st({rel:"modulepreload",href:t},e),fa.set(s,t),n.querySelector(r)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Bl(s)))return}a=n.createElement("link"),dn(a,"link",t),Qt(a),n.head.appendChild(a)}}}function TP(t,e,n){wr.S(t,e,n);var a=ko;if(a&&t){var r=oo(a).hoistableStyles,s=Eo(t);e=e||"default";var i=r.get(s);if(!i){var u={loading:0,preload:null};if(i=a.querySelector(Fl(s)))u.loading=5;else{t=st({rel:"stylesheet",href:t,"data-precedence":e},n),(n=fa.get(s))&&Ny(t,n);var l=i=a.createElement("link");Qt(l),dn(l,"link",t),l._p=new Promise(function(c,f){l.onload=c,l.onerror=f}),l.addEventListener("load",function(){u.loading|=1}),l.addEventListener("error",function(){u.loading|=2}),u.loading|=4,$d(i,e,a)}i={type:"stylesheet",instance:i,count:1,state:u},r.set(s,i)}}}function bP(t,e){wr.X(t,e);var n=ko;if(n&&t){var a=oo(n).hoistableScripts,r=Do(t),s=a.get(r);s||(s=n.querySelector(Bl(r)),s||(t=st({src:t,async:!0},e),(e=fa.get(r))&&Vy(t,e),s=n.createElement("script"),Qt(s),dn(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function EP(t,e){wr.M(t,e);var n=ko;if(n&&t){var a=oo(n).hoistableScripts,r=Do(t),s=a.get(r);s||(s=n.querySelector(Bl(r)),s||(t=st({src:t,async:!0,type:"module"},e),(e=fa.get(r))&&Vy(t,e),s=n.createElement("script"),Qt(s),dn(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function Kb(t,e,n,a){var r=(r=ds.current)?Cf(r):null;if(!r)throw Error(V(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Eo(n.href),n=oo(r).hoistableStyles,a=n.get(e),a||(a={type:"style",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Eo(n.href);var s=oo(r).hoistableStyles,i=s.get(t);if(i||(r=r.ownerDocument||r,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(t,i),(s=r.querySelector(Fl(t)))&&!s._p&&(i.instance=s,i.state.loading=5),fa.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},fa.set(t,n),s||wP(r,t,n,i.state))),e&&a===null)throw Error(V(528,""));return i}if(e&&a!==null)throw Error(V(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=Do(n),n=oo(r).hoistableScripts,a=n.get(e),a||(a={type:"script",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(V(444,t))}}function Eo(t){return'href="'+oa(t)+'"'}function Fl(t){return'link[rel="stylesheet"]['+t+"]"}function PC(t){return st({},t,{"data-precedence":t.precedence,precedence:null})}function wP(t,e,n,a){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?a.loading=1:(e=t.createElement("link"),a.preload=e,e.addEventListener("load",function(){return a.loading|=1}),e.addEventListener("error",function(){return a.loading|=2}),dn(e,"link",n),Qt(e),t.head.appendChild(e))}function Do(t){return'[src="'+oa(t)+'"]'}function Bl(t){return"script[async]"+t}function Wb(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var a=t.querySelector('style[data-href~="'+oa(n.href)+'"]');if(a)return e.instance=a,Qt(a),a;var r=st({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(t.ownerDocument||t).createElement("style"),Qt(a),dn(a,"style",r),$d(a,n.precedence,t),e.instance=a;case"stylesheet":r=Eo(n.href);var s=t.querySelector(Fl(r));if(s)return e.state.loading|=4,e.instance=s,Qt(s),s;a=PC(n),(r=fa.get(r))&&Ny(a,r),s=(t.ownerDocument||t).createElement("link"),Qt(s);var i=s;return i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),dn(s,"link",a),e.state.loading|=4,$d(s,n.precedence,t),e.instance=s;case"script":return s=Do(n.src),(r=t.querySelector(Bl(s)))?(e.instance=r,Qt(r),r):(a=n,(r=fa.get(s))&&(a=st({},n),Vy(a,r)),t=t.ownerDocument||t,r=t.createElement("script"),Qt(r),dn(r,"link",a),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(V(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(a=e.instance,e.state.loading|=4,$d(a,n.precedence,t));return e.instance}function $d(t,e,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=a.length?a[a.length-1]:null,s=r,i=0;i<a.length;i++){var u=a[i];if(u.dataset.precedence===e)s=u;else if(s!==r)break}s?s.parentNode.insertBefore(t,s.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function Ny(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Vy(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var Jd=null;function Xb(t,e,n){if(Jd===null){var a=new Map,r=Jd=new Map;r.set(n,a)}else r=Jd,a=r.get(n),a||(a=new Map,r.set(n,a));if(a.has(t))return a;for(a.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var s=n[r];if(!(s[Pl]||s[un]||t==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var i=s.getAttribute(e)||"";i=t+i;var u=a.get(i);u?u.push(s):a.set(i,[s])}}return a}function Qb(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function CP(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function OC(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function LP(t,e,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(n.state.loading&4)){if(n.instance===null){var r=Eo(a.href),s=e.querySelector(Fl(r));if(s){e=s._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Lf.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=s,Qt(s);return}s=e.ownerDocument||e,a=PC(a),(r=fa.get(r))&&Ny(a,r),s=s.createElement("link"),Qt(s);var i=s;i._p=new Promise(function(u,l){i.onload=u,i.onerror=l}),dn(s,"link",a),n.instance=s}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&!(n.state.loading&3)&&(t.count++,n=Lf.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var Ym=0;function AP(t,e){return t.stylesheets&&t.count===0&&Zd(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var a=setTimeout(function(){if(t.stylesheets&&Zd(t,t.stylesheets),t.unsuspend){var s=t.unsuspend;t.unsuspend=null,s()}},6e4+e);0<t.imgBytes&&Ym===0&&(Ym=62500*uP());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Zd(t,t.stylesheets),t.unsuspend)){var s=t.unsuspend;t.unsuspend=null,s()}},(t.imgBytes>Ym?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(a),clearTimeout(r)}}:null}function Lf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Zd(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Af=null;function Zd(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Af=new Map,e.forEach(xP,t),Af=null,Lf.call(t))}function xP(t,e){if(!(e.state.loading&4)){var n=Af.get(t);if(n)var a=n.get(null);else{n=new Map,Af.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var i=r[s];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),a=i)}a&&n.set(null,a)}r=e.instance,i=r.getAttribute("data-precedence"),s=n.get(i)||a,s===a&&n.set(null,r),n.set(i,r),this.count++,a=Lf.bind(this),r.addEventListener("load",a),r.addEventListener("error",a),s?s.parentNode.insertBefore(r,s.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var Cl={$$typeof:pr,Provider:null,Consumer:null,_currentValue:Xs,_currentValue2:Xs,_threadCount:0};function RP(t,e,n,a,r,s,i,u,l){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Tm(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Tm(0),this.hiddenUpdates=Tm(null),this.identifierPrefix=a,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=l,this.incompleteTransitions=new Map}function MC(t,e,n,a,r,s,i,u,l,c,f,m){return t=new RP(t,e,n,i,l,c,f,m,u),e=1,s===!0&&(e|=24),s=Wn(3,null,null,e),t.current=s,s.stateNode=t,e=ly(),e.refCount++,t.pooledCache=e,e.refCount++,s.memoizedState={element:a,isDehydrated:n,cache:e},fy(s),t}function NC(t){return t?(t=ao,t):ao}function VC(t,e,n,a,r,s){r=NC(r),a.context===null?a.context=r:a.pendingContext=r,a=hs(e),a.payload={element:n},s=s===void 0?null:s,s!==null&&(a.callback=s),n=ps(t,a,e),n!==null&&(On(n,t,e),il(n,t,e))}function Yb(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Uy(t,e){Yb(t,e),(t=t.alternate)&&Yb(t,e)}function UC(t){if(t.tag===13||t.tag===31){var e=oi(t,67108864);e!==null&&On(e,t,67108864),Uy(t,67108864)}}function $b(t){if(t.tag===13||t.tag===31){var e=Jn();e=Qg(e);var n=oi(t,e);n!==null&&On(n,t,e),Uy(t,e)}}var xf=!0;function kP(t,e,n,a){var r=ie.T;ie.T=null;var s=Ve.p;try{Ve.p=2,Fy(t,e,n,a)}finally{Ve.p=s,ie.T=r}}function DP(t,e,n,a){var r=ie.T;ie.T=null;var s=Ve.p;try{Ve.p=8,Fy(t,e,n,a)}finally{Ve.p=s,ie.T=r}}function Fy(t,e,n,a){if(xf){var r=Gg(a);if(r===null)Xm(t,e,a,Rf,n),Jb(t,a);else if(OP(r,t,e,n,a))a.stopPropagation();else if(Jb(t,a),e&4&&-1<PP.indexOf(t)){for(;r!==null;){var s=Lo(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var i=js(s.pendingLanes);if(i!==0){var u=s;for(u.pendingLanes|=2,u.entangledLanes|=2;i;){var l=1<<31-$n(i);u.entanglements[1]|=l,i&=~l}Oa(s),!(Ne&6)&&(_f=Qn()+500,Ul(0,!1))}}break;case 31:case 13:u=oi(s,2),u!==null&&On(u,s,2),Hf(),Uy(s,2)}if(s=Gg(a),s===null&&Xm(t,e,a,Rf,n),s===r)break;r=s}r!==null&&a.stopPropagation()}else Xm(t,e,a,null,n)}}function Gg(t){return t=Zg(t),By(t)}var Rf=null;function By(t){if(Rf=null,t=$i(t),t!==null){var e=xl(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=rE(e),t!==null)return t;t=null}else if(n===31){if(t=sE(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Rf=t,null}function FC(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Sk()){case lE:return 2;case cE:return 8;case rf:case vk:return 32;case dE:return 268435456;default:return 32}default:return 32}}var jg=!1,ys=null,Is=null,_s=null,Ll=new Map,Al=new Map,ss=[],PP="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Jb(t,e){switch(t){case"focusin":case"focusout":ys=null;break;case"dragenter":case"dragleave":Is=null;break;case"mouseover":case"mouseout":_s=null;break;case"pointerover":case"pointerout":Ll.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Al.delete(e.pointerId)}}function Qu(t,e,n,a,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:a,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Lo(e),e!==null&&UC(e)),t):(t.eventSystemFlags|=a,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function OP(t,e,n,a,r){switch(e){case"focusin":return ys=Qu(ys,t,e,n,a,r),!0;case"dragenter":return Is=Qu(Is,t,e,n,a,r),!0;case"mouseover":return _s=Qu(_s,t,e,n,a,r),!0;case"pointerover":var s=r.pointerId;return Ll.set(s,Qu(Ll.get(s)||null,t,e,n,a,r)),!0;case"gotpointercapture":return s=r.pointerId,Al.set(s,Qu(Al.get(s)||null,t,e,n,a,r)),!0}return!1}function BC(t){var e=$i(t.target);if(e!==null){var n=xl(e);if(n!==null){if(e=n.tag,e===13){if(e=rE(n),e!==null){t.blockedOn=e,MT(t.priority,function(){$b(n)});return}}else if(e===31){if(e=sE(n),e!==null){t.blockedOn=e,MT(t.priority,function(){$b(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function ef(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Gg(t.nativeEvent);if(n===null){n=t.nativeEvent;var a=new n.constructor(n.type,n);lg=a,n.target.dispatchEvent(a),lg=null}else return e=Lo(n),e!==null&&UC(e),t.blockedOn=n,!1;e.shift()}return!0}function Zb(t,e,n){ef(t)&&n.delete(e)}function MP(){jg=!1,ys!==null&&ef(ys)&&(ys=null),Is!==null&&ef(Is)&&(Is=null),_s!==null&&ef(_s)&&(_s=null),Ll.forEach(Zb),Al.forEach(Zb)}function Ud(t,e){t.blockedOn===e&&(t.blockedOn=null,jg||(jg=!0,qt.unstable_scheduleCallback(qt.unstable_NormalPriority,MP)))}var Fd=null;function eE(t){Fd!==t&&(Fd=t,qt.unstable_scheduleCallback(qt.unstable_NormalPriority,function(){Fd===t&&(Fd=null);for(var e=0;e<t.length;e+=3){var n=t[e],a=t[e+1],r=t[e+2];if(typeof a!="function"){if(By(a||n)===null)continue;break}var s=Lo(n);s!==null&&(t.splice(e,3),e-=3,wg(s,{pending:!0,data:r,method:n.method,action:a},a,r))}}))}function wo(t){function e(l){return Ud(l,t)}ys!==null&&Ud(ys,t),Is!==null&&Ud(Is,t),_s!==null&&Ud(_s,t),Ll.forEach(e),Al.forEach(e);for(var n=0;n<ss.length;n++){var a=ss[n];a.blockedOn===t&&(a.blockedOn=null)}for(;0<ss.length&&(n=ss[0],n.blockedOn===null);)BC(n),n.blockedOn===null&&ss.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var r=n[a],s=n[a+1],i=r[Mn]||null;if(typeof s=="function")i||eE(n);else if(i){var u=null;if(s&&s.hasAttribute("formAction")){if(r=s,i=s[Mn]||null)u=i.formAction;else if(By(r)!==null)continue}else u=i.action;typeof u=="function"?n[a+1]=u:(n.splice(a,3),a-=3),eE(n)}}}function qC(){function t(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(i){return r=i})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function qy(t){this._internalRoot=t}Kf.prototype.render=qy.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(V(409));var n=e.current,a=Jn();VC(n,a,t,e,null,null)};Kf.prototype.unmount=qy.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;VC(t.current,2,null,t,null,null),Hf(),e[Co]=null}};function Kf(t){this._internalRoot=t}Kf.prototype.unstable_scheduleHydration=function(t){if(t){var e=gE();t={blockedOn:null,target:t,priority:e};for(var n=0;n<ss.length&&e!==0&&e<ss[n].priority;n++);ss.splice(n,0,t),n===0&&BC(t)}};var tE=nE.version;if(tE!=="19.2.3")throw Error(V(527,tE,"19.2.3"));Ve.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(V(188)):(t=Object.keys(t).join(","),Error(V(268,t)));return t=hk(e),t=t!==null?iE(t):null,t=t===null?null:t.stateNode,t};var NP={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:ie,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Yu=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Yu.isDisabled&&Yu.supportsFiber))try{Rl=Yu.inject(NP),Yn=Yu}catch{}var Yu;Wf.createRoot=function(t,e){if(!aE(t))throw Error(V(299));var n=!1,a="",r=Dw,s=Pw,i=Ow;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(a=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(s=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=MC(t,1,!1,null,null,n,a,null,r,s,i,qC),t[Co]=e.current,My(t),new qy(e)};Wf.hydrateRoot=function(t,e,n){if(!aE(t))throw Error(V(299));var a=!1,r="",s=Dw,i=Pw,u=Ow,l=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(s=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(u=n.onRecoverableError),n.formState!==void 0&&(l=n.formState)),e=MC(t,1,!0,e,n??null,a,r,l,s,i,u,qC),e.context=NC(null),n=e.current,a=Jn(),a=Qg(a),r=hs(a),r.callback=null,ps(n,r,a),n=a,e.current.lanes=n,Dl(e,n),Oa(e),t[Co]=e.current,My(t),new Kf(e)};Wf.version="19.2.3"});var jC=Oe((JF,GC)=>{"use strict";function HC(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(HC)}catch(t){console.error(t)}}HC(),GC.exports=zC()});var KC=Oe((tB,Wy)=>{var Ky=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,a=Object.defineProperty||function(M,O,F){M[O]=F.value},r,s=typeof Symbol=="function"?Symbol:{},i=s.iterator||"@@iterator",u=s.asyncIterator||"@@asyncIterator",l=s.toStringTag||"@@toStringTag";function c(M,O,F){return Object.defineProperty(M,O,{value:F,enumerable:!0,configurable:!0,writable:!0}),M[O]}try{c({},"")}catch{c=function(O,F,J){return O[F]=J}}function f(M,O,F,J){var Y=O&&O.prototype instanceof T?O:T,se=Object.create(Y.prototype),$e=new X(J||[]);return a(se,"_invoke",{value:b(M,F,$e)}),se}t.wrap=f;function m(M,O,F){try{return{type:"normal",arg:M.call(O,F)}}catch(J){return{type:"throw",arg:J}}}var p="suspendedStart",_="suspendedYield",R="executing",D="completed",L={};function T(){}function I(){}function w(){}var x={};c(x,i,function(){return this});var H=Object.getPrototypeOf,j=H&&H(H(re([])));j&&j!==e&&n.call(j,i)&&(x=j);var S=w.prototype=T.prototype=Object.create(x);I.prototype=w,a(S,"constructor",{value:w,configurable:!0}),a(w,"constructor",{value:I,configurable:!0}),I.displayName=c(w,l,"GeneratorFunction");function g(M){["next","throw","return"].forEach(function(O){c(M,O,function(F){return this._invoke(O,F)})})}t.isGeneratorFunction=function(M){var O=typeof M=="function"&&M.constructor;return O?O===I||(O.displayName||O.name)==="GeneratorFunction":!1},t.mark=function(M){return Object.setPrototypeOf?Object.setPrototypeOf(M,w):(M.__proto__=w,c(M,l,"GeneratorFunction")),M.prototype=Object.create(S),M},t.awrap=function(M){return{__await:M}};function v(M,O){function F(se,$e,Me,We){var Je=m(M[se],M,$e);if(Je.type==="throw")We(Je.arg);else{var Cn=Je.arg,Sn=Cn.value;return Sn&&typeof Sn=="object"&&n.call(Sn,"__await")?O.resolve(Sn.__await).then(function(an){F("next",an,Me,We)},function(an){F("throw",an,Me,We)}):O.resolve(Sn).then(function(an){Cn.value=an,Me(Cn)},function(an){return F("throw",an,Me,We)})}}var J;function Y(se,$e){function Me(){return new O(function(We,Je){F(se,$e,We,Je)})}return J=J?J.then(Me,Me):Me()}a(this,"_invoke",{value:Y})}g(v.prototype),c(v.prototype,u,function(){return this}),t.AsyncIterator=v,t.async=function(M,O,F,J,Y){Y===void 0&&(Y=Promise);var se=new v(f(M,O,F,J),Y);return t.isGeneratorFunction(O)?se:se.next().then(function($e){return $e.done?$e.value:se.next()})};function b(M,O,F){var J=p;return function(se,$e){if(J===R)throw new Error("Generator is already running");if(J===D){if(se==="throw")throw $e;return nn()}for(F.method=se,F.arg=$e;;){var Me=F.delegate;if(Me){var We=C(Me,F);if(We){if(We===L)continue;return We}}if(F.method==="next")F.sent=F._sent=F.arg;else if(F.method==="throw"){if(J===p)throw J=D,F.arg;F.dispatchException(F.arg)}else F.method==="return"&&F.abrupt("return",F.arg);J=R;var Je=m(M,O,F);if(Je.type==="normal"){if(J=F.done?D:_,Je.arg===L)continue;return{value:Je.arg,done:F.done}}else Je.type==="throw"&&(J=D,F.method="throw",F.arg=Je.arg)}}}function C(M,O){var F=O.method,J=M.iterator[F];if(J===r)return O.delegate=null,F==="throw"&&M.iterator.return&&(O.method="return",O.arg=r,C(M,O),O.method==="throw")||F!=="return"&&(O.method="throw",O.arg=new TypeError("The iterator does not provide a '"+F+"' method")),L;var Y=m(J,M.iterator,O.arg);if(Y.type==="throw")return O.method="throw",O.arg=Y.arg,O.delegate=null,L;var se=Y.arg;if(!se)return O.method="throw",O.arg=new TypeError("iterator result is not an object"),O.delegate=null,L;if(se.done)O[M.resultName]=se.value,O.next=M.nextLoc,O.method!=="return"&&(O.method="next",O.arg=r);else return se;return O.delegate=null,L}g(S),c(S,l,"Generator"),c(S,i,function(){return this}),c(S,"toString",function(){return"[object Generator]"});function A(M){var O={tryLoc:M[0]};1 in M&&(O.catchLoc=M[1]),2 in M&&(O.finallyLoc=M[2],O.afterLoc=M[3]),this.tryEntries.push(O)}function E(M){var O=M.completion||{};O.type="normal",delete O.arg,M.completion=O}function X(M){this.tryEntries=[{tryLoc:"root"}],M.forEach(A,this),this.reset(!0)}t.keys=function(M){var O=Object(M),F=[];for(var J in O)F.push(J);return F.reverse(),function Y(){for(;F.length;){var se=F.pop();if(se in O)return Y.value=se,Y.done=!1,Y}return Y.done=!0,Y}};function re(M){if(M){var O=M[i];if(O)return O.call(M);if(typeof M.next=="function")return M;if(!isNaN(M.length)){var F=-1,J=function Y(){for(;++F<M.length;)if(n.call(M,F))return Y.value=M[F],Y.done=!1,Y;return Y.value=r,Y.done=!0,Y};return J.next=J}}return{next:nn}}t.values=re;function nn(){return{value:r,done:!0}}return X.prototype={constructor:X,reset:function(M){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(E),!M)for(var O in this)O.charAt(0)==="t"&&n.call(this,O)&&!isNaN(+O.slice(1))&&(this[O]=r)},stop:function(){this.done=!0;var M=this.tryEntries[0],O=M.completion;if(O.type==="throw")throw O.arg;return this.rval},dispatchException:function(M){if(this.done)throw M;var O=this;function F(We,Je){return se.type="throw",se.arg=M,O.next=We,Je&&(O.method="next",O.arg=r),!!Je}for(var J=this.tryEntries.length-1;J>=0;--J){var Y=this.tryEntries[J],se=Y.completion;if(Y.tryLoc==="root")return F("end");if(Y.tryLoc<=this.prev){var $e=n.call(Y,"catchLoc"),Me=n.call(Y,"finallyLoc");if($e&&Me){if(this.prev<Y.catchLoc)return F(Y.catchLoc,!0);if(this.prev<Y.finallyLoc)return F(Y.finallyLoc)}else if($e){if(this.prev<Y.catchLoc)return F(Y.catchLoc,!0)}else if(Me){if(this.prev<Y.finallyLoc)return F(Y.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(M,O){for(var F=this.tryEntries.length-1;F>=0;--F){var J=this.tryEntries[F];if(J.tryLoc<=this.prev&&n.call(J,"finallyLoc")&&this.prev<J.finallyLoc){var Y=J;break}}Y&&(M==="break"||M==="continue")&&Y.tryLoc<=O&&O<=Y.finallyLoc&&(Y=null);var se=Y?Y.completion:{};return se.type=M,se.arg=O,Y?(this.method="next",this.next=Y.finallyLoc,L):this.complete(se)},complete:function(M,O){if(M.type==="throw")throw M.arg;return M.type==="break"||M.type==="continue"?this.next=M.arg:M.type==="return"?(this.rval=this.arg=M.arg,this.method="return",this.next="end"):M.type==="normal"&&O&&(this.next=O),L},finish:function(M){for(var O=this.tryEntries.length-1;O>=0;--O){var F=this.tryEntries[O];if(F.finallyLoc===M)return this.complete(F.completion,F.afterLoc),E(F),L}},catch:function(M){for(var O=this.tryEntries.length-1;O>=0;--O){var F=this.tryEntries[O];if(F.tryLoc===M){var J=F.completion;if(J.type==="throw"){var Y=J.arg;E(F)}return Y}}throw new Error("illegal catch attempt")},delegateYield:function(M,O,F){return this.delegate={iterator:re(M),resultName:O,nextLoc:F},this.method==="next"&&(this.arg=r),L}},t}(typeof Wy=="object"?Wy.exports:{});try{regeneratorRuntime=Ky}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=Ky:Function("r","regeneratorRuntime = r")(Ky)}});var Xf=Oe((nB,WC)=>{"use strict";WC.exports=(t,e)=>`${t}-${e}-${Math.random().toString(16).slice(3,8)}`});var Xy=Oe((aB,QC)=>{"use strict";var FP=Xf(),XC=0;QC.exports=({id:t,action:e,payload:n={}})=>{let a=t;return typeof a>"u"&&(a=FP("Job",XC),XC+=1),{id:a,action:e,payload:n}}});var Qf=Oe(ql=>{"use strict";var Qy=!1;ql.logging=Qy;ql.setLogging=t=>{Qy=t};ql.log=(...t)=>Qy?console.log.apply(ql,t):null});var ZC=Oe(($C,JC)=>{"use strict";var BP=Xy(),{log:Yf}=Qf(),qP=Xf(),YC=0;JC.exports=()=>{let t=qP("Scheduler",YC),e={},n={},a=[];YC+=1;let r=()=>a.length,s=()=>Object.keys(e).length,i=()=>{if(a.length!==0){let m=Object.keys(e);for(let p=0;p<m.length;p+=1)if(typeof n[m[p]]>"u"){a[0](e[m[p]]);break}}},u=(m,p)=>new Promise((_,R)=>{let D=BP({action:m,payload:p});a.push(async L=>{a.shift(),n[L.id]=D;try{_(await L[m].apply($C,[...p,D.id]))}catch(T){R(T)}finally{delete n[L.id],i()}}),Yf(`[${t}]: Add ${D.id} to JobQueue`),Yf(`[${t}]: JobQueue length=${a.length}`),i()});return{addWorker:m=>(e[m.id]=m,Yf(`[${t}]: Add ${m.id}`),Yf(`[${t}]: Number of workers=${s()}`),i(),m.id),addJob:async(m,...p)=>{if(s()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return u(m,p)},terminate:async()=>{Object.keys(e).forEach(async m=>{await e[m].terminate()}),a=[]},getQueueLen:r,getNumWorkers:s}}});var tL=Oe((sB,eL)=>{"use strict";eL.exports=t=>{let e={};return typeof WorkerGlobalScope<"u"?e.type="webworker":typeof document=="object"?e.type="browser":typeof process=="object"&&typeof nT=="function"&&(e.type="node"),typeof t>"u"?e:e[t]}});var aL=Oe((oB,nL)=>{"use strict";var zP=tL()("type")==="browser",HP=zP?t=>new URL(t,window.location.href).href:t=>t;nL.exports=t=>{let e={...t};return["corePath","workerPath","langPath"].forEach(n=>{t[n]&&(e[n]=HP(e[n]))}),e}});var Yy=Oe((uB,rL)=>{"use strict";rL.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}});var sL=Oe((lB,GP)=>{GP.exports={name:"tesseract.js",version:"7.0.0",description:"Pure Javascript Multilingual OCR",main:"src/index.js",type:"commonjs",types:"src/index.d.ts",unpkg:"dist/tesseract.min.js",jsdelivr:"dist/tesseract.min.js",scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs","profile:tesseract":"webpack-bundle-analyzer dist/tesseract-stats.json","profile:worker":"webpack-bundle-analyzer dist/worker-stats.json",prepublishOnly:"npm run build",wait:"rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser test:node:all","test:browser":"karma start karma.conf.js","test:node":"nyc mocha --exit --bail --require ./scripts/test-helper.mjs","test:node:all":"npm run test:node -- ./tests/*.test.mjs",lint:"eslint src","lint:fix":"eslint --fix src",postinstall:"opencollective-postinstall || true"},browser:{"./src/worker/node/index.js":"./src/worker/browser/index.js"},author:"",contributors:["jeromewu"],license:"Apache-2.0",devDependencies:{"@babel/core":"^7.21.4","@babel/eslint-parser":"^7.21.3","@babel/preset-env":"^7.21.4","@rollup/plugin-commonjs":"^24.1.0",acorn:"^8.8.2","babel-loader":"^9.1.2",buffer:"^6.0.3",cors:"^2.8.5",eslint:"^7.32.0","eslint-config-airbnb-base":"^14.2.1","eslint-plugin-import":"^2.27.5","expect.js":"^0.3.1",express:"^4.18.2",mocha:"^10.2.0","npm-run-all":"^4.1.5",karma:"^6.4.2","karma-chrome-launcher":"^3.2.0","karma-firefox-launcher":"^2.1.2","karma-mocha":"^2.0.1","karma-webpack":"^5.0.0",nyc:"^15.1.0",rimraf:"^5.0.0",rollup:"^3.20.7","wait-on":"^7.0.1",webpack:"^5.79.0","webpack-bundle-analyzer":"^4.8.0","webpack-cli":"^5.0.1","webpack-dev-middleware":"^6.0.2","rollup-plugin-sourcemaps":"^0.6.3"},dependencies:{"bmp-js":"^0.1.0","idb-keyval":"^6.2.0","is-url":"^1.2.4","node-fetch":"^2.6.9","opencollective-postinstall":"^2.0.3","regenerator-runtime":"^0.13.3","tesseract.js-core":"^7.0.0","wasm-feature-detect":"^1.8.0",zlibjs:"^0.3.1"},overrides:{"@rollup/pluginutils":"^5.0.2"},repository:{type:"git",url:"https://github.com/naptha/tesseract.js.git"},bugs:{url:"https://github.com/naptha/tesseract.js/issues"},homepage:"https://github.com/naptha/tesseract.js",collective:{type:"opencollective",url:"https://opencollective.com/tesseractjs"}}});var oL=Oe((cB,iL)=>{"use strict";iL.exports={workerBlobURL:!0,logger:()=>{}}});var lL=Oe((dB,uL)=>{"use strict";var jP=sL().version,KP=oL();uL.exports={...KP,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${jP}/dist/worker.min.js`}});var dL=Oe((fB,cL)=>{"use strict";cL.exports=({workerPath:t,workerBlobURL:e})=>{let n;if(Blob&&URL&&e){let a=new Blob([`importScripts("${t}");`],{type:"application/javascript"});n=new Worker(URL.createObjectURL(a))}else n=new Worker(t);return n}});var hL=Oe((hB,fL)=>{"use strict";fL.exports=t=>{t.terminate()}});var mL=Oe((pB,pL)=>{"use strict";pL.exports=(t,e)=>{t.onmessage=({data:n})=>{e(n)}}});var yL=Oe((mB,gL)=>{"use strict";gL.exports=async(t,e)=>{t.postMessage(e)}});var _L=Oe((gB,IL)=>{"use strict";var $y=t=>new Promise((e,n)=>{let a=new FileReader;a.onload=()=>{e(a.result)},a.onerror=({target:{error:{code:r}}})=>{n(Error(`File could not be read! Code=${r}`))},a.readAsArrayBuffer(t)}),Jy=async t=>{let e=t;if(typeof t>"u")return"undefined";if(typeof t=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(t)?e=atob(t.split(",")[1]).split("").map(n=>n.charCodeAt(0)):e=await(await fetch(t)).arrayBuffer();else if(typeof HTMLElement<"u"&&t instanceof HTMLElement)t.tagName==="IMG"&&(e=await Jy(t.src)),t.tagName==="VIDEO"&&(e=await Jy(t.poster)),t.tagName==="CANVAS"&&await new Promise(n=>{t.toBlob(async a=>{e=await $y(a),n()})});else if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas){let n=await t.convertToBlob();e=await $y(n)}else(t instanceof File||t instanceof Blob)&&(e=await $y(t));return new Uint8Array(e)};IL.exports=Jy});var vL=Oe((yB,SL)=>{"use strict";var WP=lL(),XP=dL(),QP=hL(),YP=mL(),$P=yL(),JP=_L();SL.exports={defaultOptions:WP,spawnWorker:XP,terminateWorker:QP,onMessage:YP,send:$P,loadImage:JP}});var Zy=Oe((IB,wL)=>{"use strict";var ZP=aL(),Ma=Xy(),{log:TL}=Qf(),eO=Xf(),li=Yy(),{defaultOptions:tO,spawnWorker:nO,terminateWorker:aO,onMessage:rO,loadImage:bL,send:sO}=vL(),EL=0;wL.exports=async(t="eng",e=li.LSTM_ONLY,n={},a={})=>{let r=eO("Worker",EL),{logger:s,errorHandler:i,...u}=ZP({...tO,...n}),l={},c=typeof t=="string"?t.split("+"):t,f=e,m=a,p=[li.DEFAULT,li.LSTM_ONLY].includes(e)&&!u.legacyCore,_,R,D=new Promise((M,O)=>{R=M,_=O}),L=M=>{_(M.message)},T=nO(u);T.onerror=L,EL+=1;let I=({id:M,action:O,payload:F})=>new Promise((J,Y)=>{TL(`[${r}]: Start ${M}, action=${O}`);let se=`${O}-${M}`;l[se]={resolve:J,reject:Y},sO(T,{workerId:r,jobId:M,action:O,payload:F})}),w=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),x=M=>I(Ma({id:M,action:"load",payload:{options:{lstmOnly:p,corePath:u.corePath,logging:u.logging}}})),H=(M,O,F)=>I(Ma({id:F,action:"FS",payload:{method:"writeFile",args:[M,O]}})),j=(M,O)=>I(Ma({id:O,action:"FS",payload:{method:"readFile",args:[M,{encoding:"utf8"}]}})),S=(M,O)=>I(Ma({id:O,action:"FS",payload:{method:"unlink",args:[M]}})),g=(M,O,F)=>I(Ma({id:F,action:"FS",payload:{method:M,args:O}})),v=(M,O)=>I(Ma({id:O,action:"loadLanguage",payload:{langs:M,options:{langPath:u.langPath,dataPath:u.dataPath,cachePath:u.cachePath,cacheMethod:u.cacheMethod,gzip:u.gzip,lstmOnly:[li.DEFAULT,li.LSTM_ONLY].includes(f)&&!u.legacyLang}}})),b=(M,O,F,J)=>I(Ma({id:J,action:"initialize",payload:{langs:M,oem:O,config:F}})),C=(M="eng",O,F,J)=>{if(p&&[li.TESSERACT_ONLY,li.TESSERACT_LSTM_COMBINED].includes(O))throw Error("Legacy model requested but code missing.");let Y=O||f;f=Y;let se=F||m;m=se;let Me=(typeof M=="string"?M.split("+"):M).filter(We=>!c.includes(We));return c.push(...Me),Me.length>0?v(Me,J).then(()=>b(M,Y,se,J)):b(M,Y,se,J)},A=(M={},O)=>I(Ma({id:O,action:"setParameters",payload:{params:M}})),E=async(M,O={},F={text:!0},J)=>I(Ma({id:J,action:"recognize",payload:{image:await bL(M),options:O,output:F}})),X=async(M,O)=>{if(p)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return I(Ma({id:O,action:"detect",payload:{image:await bL(M)}}))},re=async()=>(T!==null&&(aO(T),T=null),Promise.resolve());rO(T,({workerId:M,jobId:O,status:F,action:J,data:Y})=>{let se=`${J}-${O}`;if(F==="resolve")TL(`[${M}]: Complete ${O}`),l[se].resolve({jobId:O,data:Y}),delete l[se];else if(F==="reject")if(l[se].reject(Y),delete l[se],J==="load"&&_(Y),i)i(Y);else throw Error(Y);else F==="progress"&&s({...Y,userJobId:O})});let nn={id:r,worker:T,load:w,writeText:H,readText:j,removeFile:S,FS:g,reinitialize:C,setParameters:A,recognize:E,detect:X,terminate:re};return x().then(()=>v(t)).then(()=>b(t,e,a)).then(()=>R(nn)).catch(()=>{}),D}});var AL=Oe((_B,LL)=>{"use strict";var CL=Zy(),iO=async(t,e,n)=>{let a=await CL(e,1,n);return a.recognize(t).finally(async()=>{await a.terminate()})},oO=async(t,e)=>{let n=await CL("osd",0,e);return n.detect(t).finally(async()=>{await n.terminate()})};LL.exports={recognize:iO,detect:oO}});var RL=Oe((SB,xL)=>{"use strict";xL.exports={AFR:"afr",AMH:"amh",ARA:"ara",ASM:"asm",AZE:"aze",AZE_CYRL:"aze_cyrl",BEL:"bel",BEN:"ben",BOD:"bod",BOS:"bos",BUL:"bul",CAT:"cat",CEB:"ceb",CES:"ces",CHI_SIM:"chi_sim",CHI_TRA:"chi_tra",CHR:"chr",CYM:"cym",DAN:"dan",DEU:"deu",DZO:"dzo",ELL:"ell",ENG:"eng",ENM:"enm",EPO:"epo",EST:"est",EUS:"eus",FAS:"fas",FIN:"fin",FRA:"fra",FRK:"frk",FRM:"frm",GLE:"gle",GLG:"glg",GRC:"grc",GUJ:"guj",HAT:"hat",HEB:"heb",HIN:"hin",HRV:"hrv",HUN:"hun",IKU:"iku",IND:"ind",ISL:"isl",ITA:"ita",ITA_OLD:"ita_old",JAV:"jav",JPN:"jpn",KAN:"kan",KAT:"kat",KAT_OLD:"kat_old",KAZ:"kaz",KHM:"khm",KIR:"kir",KOR:"kor",KUR:"kur",LAO:"lao",LAT:"lat",LAV:"lav",LIT:"lit",MAL:"mal",MAR:"mar",MKD:"mkd",MLT:"mlt",MSA:"msa",MYA:"mya",NEP:"nep",NLD:"nld",NOR:"nor",ORI:"ori",PAN:"pan",POL:"pol",POR:"por",PUS:"pus",RON:"ron",RUS:"rus",SAN:"san",SIN:"sin",SLK:"slk",SLV:"slv",SPA:"spa",SPA_OLD:"spa_old",SQI:"sqi",SRP:"srp",SRP_LATN:"srp_latn",SWA:"swa",SWE:"swe",SYR:"syr",TAM:"tam",TEL:"tel",TGK:"tgk",TGL:"tgl",THA:"tha",TIR:"tir",TUR:"tur",UIG:"uig",UKR:"ukr",URD:"urd",UZB:"uzb",UZB_CYRL:"uzb_cyrl",VIE:"vie",YID:"yid"}});var DL=Oe((vB,kL)=>{"use strict";kL.exports={OSD_ONLY:"0",AUTO_OSD:"1",AUTO_ONLY:"2",AUTO:"3",SINGLE_COLUMN:"4",SINGLE_BLOCK_VERT_TEXT:"5",SINGLE_BLOCK:"6",SINGLE_LINE:"7",SINGLE_WORD:"8",CIRCLE_WORD:"9",SINGLE_CHAR:"10",SPARSE_TEXT:"11",SPARSE_TEXT_OSD:"12",RAW_LINE:"13"}});var OL=Oe((TB,PL)=>{"use strict";KC();var uO=ZC(),lO=Zy(),cO=AL(),dO=RL(),fO=Yy(),hO=DL(),{setLogging:pO}=Qf();PL.exports={languages:dO,OEM:fO,PSM:hO,createScheduler:uO,createWorker:lO,setLogging:pO,...cO}});var HR=Oe(Bp=>{"use strict";var uF=Symbol.for("react.transitional.element"),lF=Symbol.for("react.fragment");function zR(t,e,n){var a=null;if(n!==void 0&&(a=""+n),e.key!==void 0&&(a=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:uF,type:t,key:a,ref:e!==void 0?e:null,props:n}}Bp.Fragment=lF;Bp.jsx=zR;Bp.jsxs=zR});var Ke=Oe((F3,GR)=>{"use strict";GR.exports=HR()});var ZR={};G1(ZR,{captureScreenshot:()=>fF});var fF,e1=H1(()=>{fF=async()=>null});var ve=he(xn()),T1=he(jC());var zy="http://localhost:3000";console.log("[EXTENSION] Using API_BASE:",zy);function VP(t){return typeof t=="string"?t.startsWith("http")?t:zy+t:t instanceof URL?t.href:t.url}function UP(t,e={}){let n=VP(t),a=e.method||"GET",r=e.headers instanceof Headers||Array.isArray(e.headers)?Object.fromEntries(e.headers):{...e.headers},s=e.body??null;return new Promise((i,u)=>{chrome.runtime.sendMessage({type:"echly-api",url:n,method:a,headers:r,body:s},l=>{if(chrome.runtime.lastError){u(new Error(chrome.runtime.lastError.message));return}if(!l){u(new Error("No response from background"));return}let c=new Response(l.body??"",{status:l.status??0,headers:l.headers?new Headers(l.headers):void 0});i(c)})})}async function ft(t,e={}){let n=t.startsWith("http")?t:zy+t;return UP(n,e)}function Hy(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function Gy(){return Hy()}function jy(t,e,n){return new Promise((a,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,screenshotId:n},s=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(s?.error){r(new Error(s.error));return}if(s?.url){a(s.url);return}r(new Error("No URL from background"))})})}async function eI(t){if(!t||typeof t!="string")return"";try{let n=await(await Promise.resolve().then(()=>he(OL()))).createWorker("eng",void 0,{logger:()=>{}}),{data:{text:a}}=await n.recognize(t);return await n.terminate(),!a||typeof a!="string"?"":a.replace(/\s+/g," ").trim().slice(0,2e3)}catch{return""}}var tr=he(xn());var ML=()=>{};var UL=function(t){let e=[],n=0;for(let a=0;a<t.length;a++){let r=t.charCodeAt(a);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&a+1<t.length&&(t.charCodeAt(a+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++a)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},mO=function(t){let e=[],n=0,a=0;for(;n<t.length;){let r=t[n++];if(r<128)e[a++]=String.fromCharCode(r);else if(r>191&&r<224){let s=t[n++];e[a++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){let s=t[n++],i=t[n++],u=t[n++],l=((r&7)<<18|(s&63)<<12|(i&63)<<6|u&63)-65536;e[a++]=String.fromCharCode(55296+(l>>10)),e[a++]=String.fromCharCode(56320+(l&1023))}else{let s=t[n++],i=t[n++];e[a++]=String.fromCharCode((r&15)<<12|(s&63)<<6|i&63)}}return e.join("")},FL={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let r=0;r<t.length;r+=3){let s=t[r],i=r+1<t.length,u=i?t[r+1]:0,l=r+2<t.length,c=l?t[r+2]:0,f=s>>2,m=(s&3)<<4|u>>4,p=(u&15)<<2|c>>6,_=c&63;l||(_=64,i||(p=64)),a.push(n[f],n[m],n[p],n[_])}return a.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(UL(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):mO(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let n=e?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let r=0;r<t.length;){let s=n[t.charAt(r++)],u=r<t.length?n[t.charAt(r)]:0;++r;let c=r<t.length?n[t.charAt(r)]:64;++r;let m=r<t.length?n[t.charAt(r)]:64;if(++r,s==null||u==null||c==null||m==null)throw new nI;let p=s<<2|u>>4;if(a.push(p),c!==64){let _=u<<4&240|c>>2;if(a.push(_),m!==64){let R=c<<6&192|m;a.push(R)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},nI=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},gO=function(t){let e=UL(t);return FL.encodeByteArray(e,!0)},Hl=function(t){return gO(t).replace(/\./g,"")},Jf=function(t){try{return FL.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function BL(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var yO=()=>BL().__FIREBASE_DEFAULTS__,IO=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},_O=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&Jf(t[1]);return e&&JSON.parse(e)},Zf=()=>{try{return ML()||yO()||IO()||_O()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},rI=t=>Zf()?.emulatorHosts?.[t],eh=t=>{let e=rI(t);if(!e)return;let n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let a=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),a]:[e.substring(0,n),a]},sI=()=>Zf()?.config,iI=t=>Zf()?.[`_${t}`];var $f=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,a)=>{n?this.reject(n):this.resolve(a),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,a))}}};function Na(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Po(t){return(await fetch(t,{credentials:"include"})).ok}function th(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let n={alg:"none",type:"JWT"},a=e||"demo-project",r=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let i={iss:`https://securetoken.google.com/${a}`,aud:a,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[Hl(JSON.stringify(n)),Hl(JSON.stringify(i)),""].join(".")}var zl={};function SO(){let t={prod:[],emulator:[]};for(let e of Object.keys(zl))zl[e]?t.emulator.push(e):t.prod.push(e);return t}function vO(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}var NL=!1;function Oo(t,e){if(typeof window>"u"||typeof document>"u"||!Na(window.location.host)||zl[t]===e||zl[t]||NL)return;zl[t]=e;function n(p){return`__firebase__banner__${p}`}let a="__firebase__banner",s=SO().prod.length>0;function i(){let p=document.getElementById(a);p&&p.remove()}function u(p){p.style.display="flex",p.style.background="#7faaf0",p.style.position="fixed",p.style.bottom="5px",p.style.left="5px",p.style.padding=".5em",p.style.borderRadius="5px",p.style.alignItems="center"}function l(p,_){p.setAttribute("width","24"),p.setAttribute("id",_),p.setAttribute("height","24"),p.setAttribute("viewBox","0 0 24 24"),p.setAttribute("fill","none"),p.style.marginLeft="-6px"}function c(){let p=document.createElement("span");return p.style.cursor="pointer",p.style.marginLeft="16px",p.style.fontSize="24px",p.innerHTML=" &times;",p.onclick=()=>{NL=!0,i()},p}function f(p,_){p.setAttribute("id",_),p.innerText="Learn more",p.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",p.setAttribute("target","__blank"),p.style.paddingLeft="5px",p.style.textDecoration="underline"}function m(){let p=vO(a),_=n("text"),R=document.getElementById(_)||document.createElement("span"),D=n("learnmore"),L=document.getElementById(D)||document.createElement("a"),T=n("preprendIcon"),I=document.getElementById(T)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(p.created){let w=p.element;u(w),f(L,D);let x=c();l(I,T),w.append(I,R,L,x),document.body.appendChild(w)}s?(R.innerText="Preview backend disconnected.",I.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
</defs>`,R.innerText="Preview backend running in this workspace."),R.setAttribute("id",_)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",m):m()}function $t(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function qL(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test($t())}function TO(){let t=Zf()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function zL(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function HL(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function GL(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function jL(){let t=$t();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function KL(){return!TO()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function oI(){try{return typeof indexedDB=="object"}catch{return!1}}function WL(){return new Promise((t,e)=>{try{let n=!0,a="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(a);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(a),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(n){e(n)}})}var bO="FirebaseError",wn=class t extends Error{constructor(e,n,a){super(n),this.code=e,this.customData=a,this.name=bO,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Cr.prototype.create)}},Cr=class{constructor(e,n,a){this.service=e,this.serviceName=n,this.errors=a}create(e,...n){let a=n[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?EO(s,a):"Error",u=`${this.serviceName}: ${i} (${r}).`;return new wn(r,u,a)}};function EO(t,e){return t.replace(wO,(n,a)=>{let r=e[a];return r!=null?String(r):`<${a}?>`})}var wO=/\{\$([^}]+)}/g;function XL(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Sa(t,e){if(t===e)return!0;let n=Object.keys(t),a=Object.keys(e);for(let r of n){if(!a.includes(r))return!1;let s=t[r],i=e[r];if(VL(s)&&VL(i)){if(!Sa(s,i))return!1}else if(s!==i)return!1}for(let r of a)if(!n.includes(r))return!1;return!0}function VL(t){return t!==null&&typeof t=="object"}function Mo(t){let e=[];for(let[n,a]of Object.entries(t))Array.isArray(a)?a.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(a));return e.length?"&"+e.join("&"):""}function No(t){let e={};return t.replace(/^\?/,"").split("&").forEach(a=>{if(a){let[r,s]=a.split("=");e[decodeURIComponent(r)]=decodeURIComponent(s)}}),e}function Vo(t){let e=t.indexOf("?");if(!e)return"";let n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function QL(t,e){let n=new aI(t,e);return n.subscribe.bind(n)}var aI=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(a=>{this.error(a)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,a){let r;if(e===void 0&&n===void 0&&a===void 0)throw new Error("Missing Observer.");CO(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:a},r.next===void 0&&(r.next=tI),r.error===void 0&&(r.error=tI),r.complete===void 0&&(r.complete=tI);let s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function CO(t,e){if(typeof t!="object"||t===null)return!1;for(let n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function tI(){}var CB=4*60*60*1e3;function Jt(t){return t&&t._delegate?t._delegate:t}var Vn=class{constructor(e,n,a){this.name=e,this.instanceFactory=n,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var ci="[DEFAULT]";var uI=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){let a=new $f;if(this.instancesDeferred.set(n,a),this.isInitialized(n)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:n});r&&a.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){let n=this.normalizeInstanceIdentifier(e?.identifier),a=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(a)return null;throw r}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(AO(e))try{this.getOrInitializeService({instanceIdentifier:ci})}catch{}for(let[n,a]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(n);try{let s=this.getOrInitializeService({instanceIdentifier:r});a.resolve(s)}catch{}}}}clearInstance(e=ci){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=ci){return this.instances.has(e)}getOptions(e=ci){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:n={}}=e,a=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:a,options:n});for(let[s,i]of this.instancesDeferred.entries()){let u=this.normalizeInstanceIdentifier(s);a===u&&i.resolve(r)}return r}onInit(e,n){let a=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(a)??new Set;r.add(e),this.onInitCallbacks.set(a,r);let s=this.instances.get(a);return s&&e(s,a),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){let a=this.onInitCallbacks.get(n);if(a)for(let r of a)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let a=this.instances.get(e);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:LO(e),options:n}),this.instances.set(e,a),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(a,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,a)}catch{}return a||null}normalizeInstanceIdentifier(e=ci){return this.component?this.component.multipleInstances?e:ci:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function LO(t){return t===ci?void 0:t}function AO(t){return t.instantiationMode==="EAGER"}var nh=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let n=new uI(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};var xO=[],Se;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(Se||(Se={}));var RO={debug:Se.DEBUG,verbose:Se.VERBOSE,info:Se.INFO,warn:Se.WARN,error:Se.ERROR,silent:Se.SILENT},kO=Se.INFO,DO={[Se.DEBUG]:"log",[Se.VERBOSE]:"log",[Se.INFO]:"info",[Se.WARN]:"warn",[Se.ERROR]:"error"},PO=(t,e,...n)=>{if(e<t.logLevel)return;let a=new Date().toISOString(),r=DO[e];if(r)console[r](`[${a}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},Cs=class{constructor(e){this.name=e,this._logLevel=kO,this._logHandler=PO,this._userLogHandler=null,xO.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in Se))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?RO[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,Se.DEBUG,...e),this._logHandler(this,Se.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,Se.VERBOSE,...e),this._logHandler(this,Se.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,Se.INFO,...e),this._logHandler(this,Se.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,Se.WARN,...e),this._logHandler(this,Se.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,Se.ERROR,...e),this._logHandler(this,Se.ERROR,...e)}};var OO=(t,e)=>e.some(n=>t instanceof n),YL,$L;function MO(){return YL||(YL=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function NO(){return $L||($L=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var JL=new WeakMap,cI=new WeakMap,ZL=new WeakMap,lI=new WeakMap,fI=new WeakMap;function VO(t){let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{n(Va(t.result)),r()},i=()=>{a(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(n=>{n instanceof IDBCursor&&JL.set(n,t)}).catch(()=>{}),fI.set(e,t),e}function UO(t){if(cI.has(t))return;let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{n(),r()},i=()=>{a(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});cI.set(t,e)}var dI={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return cI.get(t);if(e==="objectStoreNames")return t.objectStoreNames||ZL.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Va(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function eA(t){dI=t(dI)}function FO(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let a=t.call(ah(this),e,...n);return ZL.set(a,e.sort?e.sort():[e]),Va(a)}:NO().includes(t)?function(...e){return t.apply(ah(this),e),Va(JL.get(this))}:function(...e){return Va(t.apply(ah(this),e))}}function BO(t){return typeof t=="function"?FO(t):(t instanceof IDBTransaction&&UO(t),OO(t,MO())?new Proxy(t,dI):t)}function Va(t){if(t instanceof IDBRequest)return VO(t);if(lI.has(t))return lI.get(t);let e=BO(t);return e!==t&&(lI.set(t,e),fI.set(e,t)),e}var ah=t=>fI.get(t);function nA(t,e,{blocked:n,upgrade:a,blocking:r,terminated:s}={}){let i=indexedDB.open(t,e),u=Va(i);return a&&i.addEventListener("upgradeneeded",l=>{a(Va(i.result),l.oldVersion,l.newVersion,Va(i.transaction),l)}),n&&i.addEventListener("blocked",l=>n(l.oldVersion,l.newVersion,l)),u.then(l=>{s&&l.addEventListener("close",()=>s()),r&&l.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),u}var qO=["get","getKey","getAll","getAllKeys","count"],zO=["put","add","delete","clear"],hI=new Map;function tA(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(hI.get(e))return hI.get(e);let n=e.replace(/FromIndex$/,""),a=e!==n,r=zO.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(r||qO.includes(n)))return;let s=async function(i,...u){let l=this.transaction(i,r?"readwrite":"readonly"),c=l.store;return a&&(c=c.index(u.shift())),(await Promise.all([c[n](...u),r&&l.done]))[0]};return hI.set(e,s),s}eA(t=>({...t,get:(e,n,a)=>tA(e,n)||t.get(e,n,a),has:(e,n)=>!!tA(e,n)||t.has(e,n)}));var mI=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(HO(n)){let a=n.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(n=>n).join(" ")}};function HO(t){return t.getComponent()?.type==="VERSION"}var gI="@firebase/app",aA="0.14.9";var Lr=new Cs("@firebase/app"),GO="@firebase/app-compat",jO="@firebase/analytics-compat",KO="@firebase/analytics",WO="@firebase/app-check-compat",XO="@firebase/app-check",QO="@firebase/auth",YO="@firebase/auth-compat",$O="@firebase/database",JO="@firebase/data-connect",ZO="@firebase/database-compat",eM="@firebase/functions",tM="@firebase/functions-compat",nM="@firebase/installations",aM="@firebase/installations-compat",rM="@firebase/messaging",sM="@firebase/messaging-compat",iM="@firebase/performance",oM="@firebase/performance-compat",uM="@firebase/remote-config",lM="@firebase/remote-config-compat",cM="@firebase/storage",dM="@firebase/storage-compat",fM="@firebase/firestore",hM="@firebase/ai",pM="@firebase/firestore-compat",mM="firebase",gM="12.10.0";var yI="[DEFAULT]",yM={[gI]:"fire-core",[GO]:"fire-core-compat",[KO]:"fire-analytics",[jO]:"fire-analytics-compat",[XO]:"fire-app-check",[WO]:"fire-app-check-compat",[QO]:"fire-auth",[YO]:"fire-auth-compat",[$O]:"fire-rtdb",[JO]:"fire-data-connect",[ZO]:"fire-rtdb-compat",[eM]:"fire-fn",[tM]:"fire-fn-compat",[nM]:"fire-iid",[aM]:"fire-iid-compat",[rM]:"fire-fcm",[sM]:"fire-fcm-compat",[iM]:"fire-perf",[oM]:"fire-perf-compat",[uM]:"fire-rc",[lM]:"fire-rc-compat",[cM]:"fire-gcs",[dM]:"fire-gcs-compat",[fM]:"fire-fst",[pM]:"fire-fst-compat",[hM]:"fire-vertex","fire-js":"fire-js",[mM]:"fire-js-all"};var rh=new Map,IM=new Map,II=new Map;function rA(t,e){try{t.container.addComponent(e)}catch(n){Lr.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Ua(t){let e=t.name;if(II.has(e))return Lr.debug(`There were multiple attempts to register component ${e}.`),!1;II.set(e,t);for(let n of rh.values())rA(n,t);for(let n of IM.values())rA(n,t);return!0}function di(t,e){let n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Fn(t){return t==null?!1:t.settings!==void 0}var _M={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},Ls=new Cr("app","Firebase",_M);var _I=class{constructor(e,n,a){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new Vn("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw Ls.create("app-deleted",{appName:this._name})}};var Fa=gM;function TI(t,e={}){let n=t;typeof e!="object"&&(e={name:e});let a={name:yI,automaticDataCollectionEnabled:!0,...e},r=a.name;if(typeof r!="string"||!r)throw Ls.create("bad-app-name",{appName:String(r)});if(n||(n=sI()),!n)throw Ls.create("no-options");let s=rh.get(r);if(s){if(Sa(n,s.options)&&Sa(a,s.config))return s;throw Ls.create("duplicate-app",{appName:r})}let i=new nh(r);for(let l of II.values())i.addComponent(l);let u=new _I(n,a,i);return rh.set(r,u),u}function Uo(t=yI){let e=rh.get(t);if(!e&&t===yI&&sI())return TI();if(!e)throw Ls.create("no-app",{appName:t});return e}function Un(t,e,n){let a=yM[t]??t;n&&(a+=`-${n}`);let r=a.match(/\s|\//),s=e.match(/\s|\//);if(r||s){let i=[`Unable to register library "${a}" with version "${e}":`];r&&i.push(`library name "${a}" contains illegal characters (whitespace or "/")`),r&&s&&i.push("and"),s&&i.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Lr.warn(i.join(" "));return}Ua(new Vn(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}var SM="firebase-heartbeat-database",vM=1,Gl="firebase-heartbeat-store",pI=null;function uA(){return pI||(pI=nA(SM,vM,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Gl)}catch(n){console.warn(n)}}}}).catch(t=>{throw Ls.create("idb-open",{originalErrorMessage:t.message})})),pI}async function TM(t){try{let n=(await uA()).transaction(Gl),a=await n.objectStore(Gl).get(lA(t));return await n.done,a}catch(e){if(e instanceof wn)Lr.warn(e.message);else{let n=Ls.create("idb-get",{originalErrorMessage:e?.message});Lr.warn(n.message)}}}async function sA(t,e){try{let a=(await uA()).transaction(Gl,"readwrite");await a.objectStore(Gl).put(e,lA(t)),await a.done}catch(n){if(n instanceof wn)Lr.warn(n.message);else{let a=Ls.create("idb-set",{originalErrorMessage:n?.message});Lr.warn(a.message)}}}function lA(t){return`${t.name}!${t.options.appId}`}var bM=1024,EM=30,SI=class{constructor(e){this.container=e,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new vI(n),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=iA();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(r=>r.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:n}),this._heartbeatsCache.heartbeats.length>EM){let r=CM(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Lr.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=iA(),{heartbeatsToSend:n,unsentEntries:a}=wM(this._heartbeatsCache.heartbeats),r=Hl(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return Lr.warn(e),""}}};function iA(){return new Date().toISOString().substring(0,10)}function wM(t,e=bM){let n=[],a=t.slice();for(let r of t){let s=n.find(i=>i.agent===r.agent);if(s){if(s.dates.push(r.date),oA(n)>e){s.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),oA(n)>e){n.pop();break}a=a.slice(1)}return{heartbeatsToSend:n,unsentEntries:a}}var vI=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return oI()?WL().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await TM(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return sA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return sA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}};function oA(t){return Hl(JSON.stringify({version:2,heartbeats:t})).length}function CM(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let a=1;a<t.length;a++)t[a].date<n&&(n=t[a].date,e=a);return e}function LM(t){Ua(new Vn("platform-logger",e=>new mI(e),"PRIVATE")),Ua(new Vn("heartbeat",e=>new SI(e),"PRIVATE")),Un(gI,aA,t),Un(gI,aA,"esm2020"),Un("fire-js","")}LM("");var AM="firebase",xM="12.10.0";Un(AM,xM,"app");function AA(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var xA=AA,RA=new Cr("auth","Firebase",AA());var dh=new Cs("@firebase/auth");function RM(t,...e){dh.logLevel<=Se.WARN&&dh.warn(`Auth (${Fa}): ${t}`,...e)}function ih(t,...e){dh.logLevel<=Se.ERROR&&dh.error(`Auth (${Fa}): ${t}`,...e)}function va(t,...e){throw WI(t,...e)}function qa(t,...e){return WI(t,...e)}function kA(t,e,n){let a={...xA(),[e]:n};return new Cr("auth","Firebase",a).create(e,{appName:t.name})}function fi(t){return kA(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function WI(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return RA.create(t,...e)}function Z(t,e,...n){if(!t)throw WI(e,...n)}function Ba(t){let e="INTERNAL ASSERTION FAILED: "+t;throw ih(e),new Error(e)}function xr(t,e){t||Ba(e)}function AI(){return typeof self<"u"&&self.location?.href||""}function kM(){return cA()==="http:"||cA()==="https:"}function cA(){return typeof self<"u"&&self.location?.protocol||null}function DM(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(kM()||HL()||"connection"in navigator)?navigator.onLine:!0}function PM(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var hi=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,xr(n>e,"Short delay should be less than long delay!"),this.isMobile=qL()||GL()}get(){return DM()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function XI(t,e){xr(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var fh=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Ba("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Ba("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Ba("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var OM={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var MM=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],NM=new hi(3e4,6e4);function Zt(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function yn(t,e,n,a,r={}){return DA(t,r,async()=>{let s={},i={};a&&(e==="GET"?i=a:s={body:JSON.stringify(a)});let u=Mo({key:t.config.apiKey,...i}).slice(1),l=await t._getAdditionalHeaders();l["Content-Type"]="application/json",t.languageCode&&(l["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:l,...s};return zL()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Na(t.emulatorConfig.host)&&(c.credentials="include"),fh.fetch()(await PA(t,t.config.apiHost,n,u),c)})}async function DA(t,e,n){t._canInitEmulator=!1;let a={...OM,...e};try{let r=new xI(t),s=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let i=await s.json();if("needConfirmation"in i)throw Kl(t,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{let u=s.ok?i.errorMessage:i.error.message,[l,c]=u.split(" : ");if(l==="FEDERATED_USER_ID_ALREADY_LINKED")throw Kl(t,"credential-already-in-use",i);if(l==="EMAIL_EXISTS")throw Kl(t,"email-already-in-use",i);if(l==="USER_DISABLED")throw Kl(t,"user-disabled",i);let f=a[l]||l.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw kA(t,f,c);va(t,f)}}catch(r){if(r instanceof wn)throw r;va(t,"network-request-failed",{message:String(r)})}}async function Ii(t,e,n,a,r={}){let s=await yn(t,e,n,a,r);return"mfaPendingCredential"in s&&va(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function PA(t,e,n,a){let r=`${e}${n}?${a}`,s=t,i=s.config.emulator?XI(t.config,r):`${t.config.apiScheme}://${r}`;return MM.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(i).toString():i}function VM(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var xI=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(qa(this.auth,"network-request-failed")),NM.get())})}};function Kl(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=qa(t,e,a);return r.customData._tokenResponse=n,r}function dA(t){return t!==void 0&&t.enterprise!==void 0}var hh=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return VM(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function OA(t,e){return yn(t,"GET","/v2/recaptchaConfig",Zt(t,e))}async function UM(t,e){return yn(t,"POST","/v1/accounts:delete",e)}async function ph(t,e){return yn(t,"POST","/v1/accounts:lookup",e)}function Wl(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function MA(t,e=!1){let n=Jt(t),a=await n.getIdToken(e),r=QI(a);Z(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let s=typeof r.firebase=="object"?r.firebase:void 0,i=s?.sign_in_provider;return{claims:r,token:a,authTime:Wl(bI(r.auth_time)),issuedAtTime:Wl(bI(r.iat)),expirationTime:Wl(bI(r.exp)),signInProvider:i||null,signInSecondFactor:s?.sign_in_second_factor||null}}function bI(t){return Number(t)*1e3}function QI(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return ih("JWT malformed, contained fewer than 3 sections"),null;try{let r=Jf(n);return r?JSON.parse(r):(ih("Failed to decode base64 JWT payload"),null)}catch(r){return ih("Caught error parsing JWT payload as JSON",r?.toString()),null}}function fA(t){let e=QI(t);return Z(e,"internal-error"),Z(typeof e.exp<"u","internal-error"),Z(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function $l(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof wn&&FM(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function FM({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var RI=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var Jl=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Wl(this.lastLoginAt),this.creationTime=Wl(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function mh(t){let e=t.auth,n=await t.getIdToken(),a=await $l(t,ph(e,{idToken:n}));Z(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let s=r.providerUserInfo?.length?VA(r.providerUserInfo):[],i=BM(t.providerData,s),u=t.isAnonymous,l=!(t.email&&r.passwordHash)&&!i?.length,c=u?l:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new Jl(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function NA(t){let e=Jt(t);await mh(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function BM(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function VA(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function qM(t,e){let n=await DA(t,{},async()=>{let a=Mo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,i=await PA(t,r,"/v1/token",`key=${s}`),u=await t._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";let l={method:"POST",headers:u,body:a};return t.emulatorConfig&&Na(t.emulatorConfig.host)&&(l.credentials="include"),fh.fetch()(i,l)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function zM(t,e){return yn(t,"POST","/v2/accounts:revokeToken",Zt(t,e))}var Xl=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){Z(e.idToken,"internal-error"),Z(typeof e.idToken<"u","internal-error"),Z(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):fA(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){Z(e.length!==0,"internal-error");let n=fA(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(Z(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:s}=await qM(e,n);this.updateTokensAndExpiration(a,r,Number(s))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:s}=n,i=new t;return a&&(Z(typeof a=="string","internal-error",{appName:e}),i.refreshToken=a),r&&(Z(typeof r=="string","internal-error",{appName:e}),i.accessToken=r),s&&(Z(typeof s=="number","internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return Ba("not implemented")}};function As(t,e){Z(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var xs=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new RI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Jl(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await $l(this,this.stsTokenManager.getToken(this.auth,e));return Z(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return MA(this,e)}reload(){return NA(this)}_assign(e){this!==e&&(Z(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){Z(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await mh(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Fn(this.auth.app))return Promise.reject(fi(this.auth));let e=await this.getIdToken();return await $l(this,UM(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,s=n.phoneNumber??void 0,i=n.photoURL??void 0,u=n.tenantId??void 0,l=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:m,emailVerified:p,isAnonymous:_,providerData:R,stsTokenManager:D}=n;Z(m&&D,e,"internal-error");let L=Xl.fromJSON(this.name,D);Z(typeof m=="string",e,"internal-error"),As(a,e.name),As(r,e.name),Z(typeof p=="boolean",e,"internal-error"),Z(typeof _=="boolean",e,"internal-error"),As(s,e.name),As(i,e.name),As(u,e.name),As(l,e.name),As(c,e.name),As(f,e.name);let T=new t({uid:m,auth:e,email:r,emailVerified:p,displayName:a,isAnonymous:_,photoURL:i,phoneNumber:s,tenantId:u,stsTokenManager:L,createdAt:c,lastLoginAt:f});return R&&Array.isArray(R)&&(T.providerData=R.map(I=>({...I}))),l&&(T._redirectEventId=l),T}static async _fromIdTokenResponse(e,n,a=!1){let r=new Xl;r.updateFromServerResponse(n);let s=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await mh(s),s}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];Z(r.localId!==void 0,"internal-error");let s=r.providerUserInfo!==void 0?VA(r.providerUserInfo):[],i=!(r.email&&r.passwordHash)&&!s?.length,u=new Xl;u.updateFromIdToken(a);let l=new t({uid:r.localId,auth:e,stsTokenManager:u,isAnonymous:i}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new Jl(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!s?.length};return Object.assign(l,c),l}};var hA=new Map;function Ar(t){xr(t instanceof Function,"Expected a class definition");let e=hA.get(t);return e?(xr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,hA.set(t,e),e)}var gh=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};gh.type="NONE";var kI=gh;function oh(t,e,n){return`firebase:${t}:${e}:${n}`}var yh=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:s}=this.auth;this.fullUserKey=oh(this.userKey,r.apiKey,s),this.fullPersistenceKey=oh("persistence",r.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await ph(this.auth,{idToken:e}).catch(()=>{});return n?xs._fromGetAccountInfoResponse(this.auth,n,e):null}return xs._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(Ar(kI),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),s=r[0]||Ar(kI),i=oh(a,e.config.apiKey,e.name),u=null;for(let c of n)try{let f=await c._get(i);if(f){let m;if(typeof f=="string"){let p=await ph(e,{idToken:f}).catch(()=>{});if(!p)break;m=await xs._fromGetAccountInfoResponse(e,p,f)}else m=xs._fromJSON(e,f);c!==s&&(u=m),s=c;break}}catch{}let l=r.filter(c=>c._shouldAllowMigration);return!s._shouldAllowMigration||!l.length?new t(s,e,a):(s=l[0],u&&await s._set(i,u.toJSON()),await Promise.all(n.map(async c=>{if(c!==s)try{await c._remove(i)}catch{}})),new t(s,e,a))}};function pA(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(qA(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(UA(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(HA(e))return"Blackberry";if(GA(e))return"Webos";if(FA(e))return"Safari";if((e.includes("chrome/")||BA(e))&&!e.includes("edge/"))return"Chrome";if(zA(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function UA(t=$t()){return/firefox\//i.test(t)}function FA(t=$t()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function BA(t=$t()){return/crios\//i.test(t)}function qA(t=$t()){return/iemobile/i.test(t)}function zA(t=$t()){return/android/i.test(t)}function HA(t=$t()){return/blackberry/i.test(t)}function GA(t=$t()){return/webos/i.test(t)}function YI(t=$t()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function HM(t=$t()){return YI(t)&&!!window.navigator?.standalone}function GM(){return jL()&&document.documentMode===10}function jA(t=$t()){return YI(t)||zA(t)||GA(t)||HA(t)||/windows phone/i.test(t)||qA(t)}function KA(t,e=[]){let n;switch(t){case"Browser":n=pA($t());break;case"Worker":n=`${pA($t())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Fa}/${a}`}var DI=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=s=>new Promise((i,u)=>{try{let l=e(s);i(l)}catch(l){u(l)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function jM(t,e={}){return yn(t,"GET","/v2/passwordPolicy",Zt(t,e))}var KM=6,PI=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??KM,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};var OI=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Ih(this),this.idTokenSubscription=new Ih(this),this.beforeStateQueue=new DI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=RA,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=Ar(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await yh.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await ph(this,{idToken:e}),a=await xs._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(Fn(this.app)){let s=this.app.settings.authIdToken;return s?new Promise(i=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(s).then(i,i))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let s=this.redirectUser?._redirectEventId,i=a?._redirectEventId,u=await this.tryRedirectSignIn(e);(!s||s===i)&&u?.user&&(a=u.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(s){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(s))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return Z(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await mh(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=PM()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Fn(this.app))return Promise.reject(fi(this));let n=e?Jt(e):null;return n&&Z(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&Z(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Fn(this.app)?Promise.reject(fi(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Fn(this.app)?Promise.reject(fi(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(Ar(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await jM(this),n=new PI(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Cr("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await zM(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&Ar(e)||this._popupRedirectResolver;Z(n,this,"argument-error"),this.redirectPersistenceManager=await yh.create(this,[Ar(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let s=typeof n=="function"?n:n.next.bind(n),i=!1,u=this._isInitialized?Promise.resolve():this._initializationPromise;if(Z(u,this,"internal-error"),u.then(()=>{i||s(this.currentUser)}),typeof n=="function"){let l=e.addObserver(n,a,r);return()=>{i=!0,l()}}else{let l=e.addObserver(n);return()=>{i=!0,l()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return Z(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=KA(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(Fn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&RM(`Error while retrieving App Check token: ${e.error}`),e?.token}};function qo(t){return Jt(t)}var Ih=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=QL(n=>this.observer=n)}get next(){return Z(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var Nh={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function WM(t){Nh=t}function WA(t){return Nh.loadJS(t)}function XM(){return Nh.recaptchaEnterpriseScript}function QM(){return Nh.gapiScript}function XA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var MI=class{constructor(){this.enterprise=new NI}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},NI=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var YM="recaptcha-enterprise",Ql="NO_RECAPTCHA",_h=class{constructor(e){this.type=YM,this.auth=qo(e)}async verify(e="verify",n=!1){async function a(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(i,u)=>{OA(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(l=>{if(l.recaptchaKey===void 0)u(new Error("recaptcha Enterprise site key undefined"));else{let c=new hh(l);return s.tenantId==null?s._agentRecaptchaConfig=c:s._tenantRecaptchaConfigs[s.tenantId]=c,i(c.siteKey)}}).catch(l=>{u(l)})})}function r(s,i,u){let l=window.grecaptcha;dA(l)?l.enterprise.ready(()=>{l.enterprise.execute(s,{action:e}).then(c=>{i(c)}).catch(()=>{i(Ql)})}):u(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new MI().execute("siteKey",{action:"verify"}):new Promise((s,i)=>{a(this.auth).then(u=>{if(!n&&dA(window.grecaptcha))r(u,s,i);else{if(typeof window>"u"){i(new Error("RecaptchaVerifier is only supported in browser"));return}let l=XM();l.length!==0&&(l+=u),WA(l).then(()=>{r(u,s,i)}).catch(c=>{i(c)})}}).catch(u=>{i(u)})})}};async function jl(t,e,n,a=!1,r=!1){let s=new _h(t),i;if(r)i=Ql;else try{i=await s.verify(n)}catch{i=await s.verify(n,!0)}let u={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in u){let l=u.phoneEnrollmentInfo.phoneNumber,c=u.phoneEnrollmentInfo.recaptchaToken;Object.assign(u,{phoneEnrollmentInfo:{phoneNumber:l,recaptchaToken:c,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in u){let l=u.phoneSignInInfo.recaptchaToken;Object.assign(u,{phoneSignInInfo:{recaptchaToken:l,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return u}return a?Object.assign(u,{captchaResp:i}):Object.assign(u,{captchaResponse:i}),Object.assign(u,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(u,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),u}async function Yl(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let s=await jl(t,e,n,n==="getOobCode");return a(t,s)}else return a(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let i=await jl(t,e,n,n==="getOobCode");return a(t,i)}else return Promise.reject(s)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let s=await jl(t,e,n);return a(t,s).catch(async i=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(i.code==="auth/missing-recaptcha-token"||i.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let u=await jl(t,e,n,!1,!0);return a(t,u)}return Promise.reject(i)})}else{let s=await jl(t,e,n,!1,!0);return a(t,s)}else return Promise.reject(r+" provider is not supported.")}async function $M(t){let e=qo(t),n=await OA(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),a=new hh(n);e.tenantId==null?e._agentRecaptchaConfig=a:e._tenantRecaptchaConfigs[e.tenantId]=a,a.isAnyProviderEnabled()&&new _h(e).verify()}function QA(t,e){let n=di(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),s=n.getOptions();if(Sa(s,e??{}))return r;va(r,"already-initialized")}return n.initialize({options:e})}function JM(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(Ar);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function YA(t,e,n){let a=qo(t);Z(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,s=$A(e),{host:i,port:u}=ZM(e),l=u===null?"":`:${u}`,c={url:`${s}//${i}${l}/`},f=Object.freeze({host:i,port:u,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){Z(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),Z(Sa(c,a.config.emulator)&&Sa(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Na(i)?(Po(`${s}//${i}${l}`),Oo("Auth",!0)):r||e2()}function $A(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function ZM(t){let e=$A(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let s=r[1];return{host:s,port:mA(a.substr(s.length+1))}}else{let[s,i]=a.split(":");return{host:s,port:mA(i)}}}function mA(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function e2(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var pi=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return Ba("not implemented")}_getIdTokenResponse(e){return Ba("not implemented")}_linkToIdToken(e,n){return Ba("not implemented")}_getReauthenticationResolver(e){return Ba("not implemented")}};async function t2(t,e){return yn(t,"POST","/v1/accounts:signUp",e)}async function n2(t,e){return Ii(t,"POST","/v1/accounts:signInWithPassword",Zt(t,e))}async function a2(t,e){return Ii(t,"POST","/v1/accounts:signInWithEmailLink",Zt(t,e))}async function r2(t,e){return Ii(t,"POST","/v1/accounts:signInWithEmailLink",Zt(t,e))}var Zl=class t extends pi{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Yl(e,n,"signInWithPassword",n2,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return a2(e,{email:this._email,oobCode:this._password});default:va(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Yl(e,a,"signUpPassword",t2,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return r2(e,{idToken:n,email:this._email,oobCode:this._password});default:va(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function Fo(t,e){return Ii(t,"POST","/v1/accounts:signInWithIdp",Zt(t,e))}var s2="http://localhost",mi=class t extends pi{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):va("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...s}=n;if(!a||!r)return null;let i=new t(a,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){let n=this.buildRequest();return Fo(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,Fo(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,Fo(e,n)}buildRequest(){let e={requestUri:s2,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Mo(n)}return e}};async function gA(t,e){return yn(t,"POST","/v1/accounts:sendVerificationCode",Zt(t,e))}async function i2(t,e){return Ii(t,"POST","/v1/accounts:signInWithPhoneNumber",Zt(t,e))}async function o2(t,e){let n=await Ii(t,"POST","/v1/accounts:signInWithPhoneNumber",Zt(t,e));if(n.temporaryProof)throw Kl(t,"account-exists-with-different-credential",n);return n}var u2={USER_NOT_FOUND:"user-not-found"};async function l2(t,e){let n={...e,operation:"REAUTH"};return Ii(t,"POST","/v1/accounts:signInWithPhoneNumber",Zt(t,n),u2)}var ec=class t extends pi{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new t({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new t({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return i2(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return o2(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return l2(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:n,verificationId:a,verificationCode:r}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:a,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s}=e;return!a&&!n&&!r&&!s?null:new t({verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s})}};function c2(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function d2(t){let e=No(Vo(t)).link,n=e?No(Vo(e)).deep_link_id:null,a=No(Vo(t)).deep_link_id;return(a?No(Vo(a)).link:null)||a||n||e||t}var Sh=class t{constructor(e){let n=No(Vo(e)),a=n.apiKey??null,r=n.oobCode??null,s=c2(n.mode??null);Z(a&&r&&s,"argument-error"),this.apiKey=a,this.operation=s,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=d2(e);try{return new t(n)}catch{return null}}};var Bo=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return Zl._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=Sh.parseLink(n);return Z(a,"argument-error"),Zl._fromEmailAndCode(e,a.code,a.tenantId)}};Bo.PROVIDER_ID="password";Bo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Bo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var vh=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var gi=class extends vh{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var tc=class t extends gi{constructor(){super("facebook.com")}static credential(e){return mi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};tc.FACEBOOK_SIGN_IN_METHOD="facebook.com";tc.PROVIDER_ID="facebook.com";var nc=class t extends gi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return mi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};nc.GOOGLE_SIGN_IN_METHOD="google.com";nc.PROVIDER_ID="google.com";var ac=class t extends gi{constructor(){super("github.com")}static credential(e){return mi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};ac.GITHUB_SIGN_IN_METHOD="github.com";ac.PROVIDER_ID="github.com";var rc=class t extends gi{constructor(){super("twitter.com")}static credential(e,n){return mi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};rc.TWITTER_SIGN_IN_METHOD="twitter.com";rc.PROVIDER_ID="twitter.com";var sc=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,a,r=!1){let s=await xs._fromIdTokenResponse(e,a,r),i=yA(a);return new t({user:s,providerId:i,_tokenResponse:a,operationType:n})}static async _forOperation(e,n,a){await e._updateTokensIfNecessary(a,!0);let r=yA(a);return new t({user:e,providerId:r,_tokenResponse:a,operationType:n})}};function yA(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var VI=class t extends wn{constructor(e,n,a,r){super(n.code,n.message),this.operationType=a,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:a}}static _fromErrorAndOperation(e,n,a,r){return new t(e,n,a,r)}};function JA(t,e,n,a){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?VI._fromErrorAndOperation(t,s,e,a):s})}async function f2(t,e,n=!1){let a=await $l(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return sc._forOperation(t,"link",a)}async function h2(t,e,n=!1){let{auth:a}=t;if(Fn(a.app))return Promise.reject(fi(a));let r="reauthenticate";try{let s=await $l(t,JA(a,r,e,t),n);Z(s.idToken,a,"internal-error");let i=QI(s.idToken);Z(i,a,"internal-error");let{sub:u}=i;return Z(t.uid===u,a,"user-mismatch"),sc._forOperation(t,r,s)}catch(s){throw s?.code==="auth/user-not-found"&&va(a,"user-mismatch"),s}}async function p2(t,e,n=!1){if(Fn(t.app))return Promise.reject(fi(t));let a="signIn",r=await JA(t,a,e),s=await sc._fromIdTokenResponse(t,a,r);return n||await t._updateCurrentUser(s.user),s}function ZA(t,e,n,a){return Jt(t).onIdTokenChanged(e,n,a)}function ex(t,e,n){return Jt(t).beforeAuthStateChanged(e,n)}function IA(t,e){return yn(t,"POST","/v2/accounts/mfaEnrollment:start",Zt(t,e))}function m2(t,e){return yn(t,"POST","/v2/accounts/mfaEnrollment:finalize",Zt(t,e))}function g2(t,e){return yn(t,"POST","/v2/accounts/mfaEnrollment:start",Zt(t,e))}function y2(t,e){return yn(t,"POST","/v2/accounts/mfaEnrollment:finalize",Zt(t,e))}var Th="__sak";var bh=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Th,"1"),this.storage.removeItem(Th),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){let n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var I2=1e3,_2=10,Eh=class extends bh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=jA(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let n of Object.keys(this.listeners)){let a=this.storage.getItem(n),r=this.localCache[n];a!==r&&e(n,r,a)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((i,u,l)=>{this.notifyListeners(i,l)});return}let a=e.key;n?this.detachListener():this.stopPolling();let r=()=>{let i=this.storage.getItem(a);!n&&this.localCache[a]===i||this.notifyListeners(a,i)},s=this.storage.getItem(a);GM()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,_2):r()}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,a)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:a}),!0)})},I2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){let n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};Eh.type="LOCAL";var tx=Eh;var S2=1e3;function EI(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${e}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function wI(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var UI=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let n=new URL(`${window.location.origin}/__cookies__`);return n.searchParams.set("finalTarget",e),n}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,n){}async _get(e){if(!this._isAvailable())return null;let n=wI(e);return window.cookieStore?(await window.cookieStore.get(n))?.value:EI(n)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let a=wI(e);document.cookie=`${a}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,n){if(!this._isAvailable())return;let a=wI(e);if(window.cookieStore){let u=c=>{let f=c.changed.find(p=>p.name===a);f&&n(f.value),c.deleted.find(p=>p.name===a)&&n(null)},l=()=>window.cookieStore.removeEventListener("change",u);return this.listenerUnsubscribes.set(n,l),window.cookieStore.addEventListener("change",u)}let r=EI(a),s=setInterval(()=>{let u=EI(a);u!==r&&(n(u),r=u)},S2),i=()=>clearInterval(s);this.listenerUnsubscribes.set(n,i)}_removeListener(e,n){let a=this.listenerUnsubscribes.get(n);a&&(a(),this.listenerUnsubscribes.delete(n))}};UI.type="COOKIE";var wh=class extends bh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};wh.type="SESSION";var $I=wh;function v2(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var Ch=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:s}=n.data,i=this.handlersMap[r];if(!i?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let u=Array.from(i).map(async c=>c(n.origin,s)),l=await v2(u);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:l})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Ch.receivers=[];function JI(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var FI=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((u,l)=>{let c=JI("",20);r.port1.start();let f=setTimeout(()=>{l(new Error("unsupported_event"))},a);i={messageChannel:r,onMessage(m){let p=m;if(p.data.eventId===c)switch(p.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{l(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),u(p.data.response);break;default:clearTimeout(f),clearTimeout(s),l(new Error("invalid_response"));break}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}};function za(){return window}function T2(t){za().location.href=t}function nx(){return typeof za().WorkerGlobalScope<"u"&&typeof za().importScripts=="function"}async function b2(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function E2(){return navigator?.serviceWorker?.controller||null}function w2(){return nx()?self:null}var ax="firebaseLocalStorageDb",C2=1,Lh="firebaseLocalStorage",rx="fbase_key",yi=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function Vh(t,e){return t.transaction([Lh],e?"readwrite":"readonly").objectStore(Lh)}function L2(){let t=indexedDB.deleteDatabase(ax);return new yi(t).toPromise()}function BI(){let t=indexedDB.open(ax,C2);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Lh,{keyPath:rx})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Lh)?e(a):(a.close(),await L2(),e(await BI()))})})}async function _A(t,e,n){let a=Vh(t,!0).put({[rx]:e,value:n});return new yi(a).toPromise()}async function A2(t,e){let n=Vh(t,!1).get(e),a=await new yi(n).toPromise();return a===void 0?null:a.value}function SA(t,e){let n=Vh(t,!0).delete(e);return new yi(n).toPromise()}var x2=800,R2=3,Ah=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await BI(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>R2)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return nx()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ch._getInstance(w2()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await b2(),!this.activeServiceWorker)return;this.sender=new FI(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||E2()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await BI();return await _A(e,Th,"1"),await SA(e,Th),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>_A(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>A2(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>SA(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let s=Vh(r,!1).getAll();return new yi(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:s}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),x2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Ah.type="LOCAL";var sx=Ah;function vA(t,e){return yn(t,"POST","/v2/accounts/mfaSignIn:start",Zt(t,e))}function k2(t,e){return yn(t,"POST","/v2/accounts/mfaSignIn:finalize",Zt(t,e))}function D2(t,e){return yn(t,"POST","/v2/accounts/mfaSignIn:finalize",Zt(t,e))}var JB=XA("rcb"),ZB=new hi(3e4,6e4);var uh="recaptcha";async function P2(t,e,n){if(!t._getRecaptchaConfig())try{await $M(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let a;if(typeof e=="string"?a={phoneNumber:e}:a=e,"session"in a){let r=a.session;if("phoneNumber"in a){Z(r.type==="enroll",t,"internal-error");let s={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Yl(t,s,"mfaSmsEnrollment",async(c,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===Ql){Z(n?.type===uh,c,"argument-error");let m=await CI(c,f,n);return IA(c,m)}return IA(c,f)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).phoneSessionInfo.sessionInfo}else{Z(r.type==="signin",t,"internal-error");let s=a.multiFactorHint?.uid||a.multiFactorUid;Z(s,t,"missing-multi-factor-info");let i={mfaPendingCredential:r.credential,mfaEnrollmentId:s,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Yl(t,i,"mfaSmsSignIn",async(f,m)=>{if(m.phoneSignInInfo.captchaResponse===Ql){Z(n?.type===uh,f,"argument-error");let p=await CI(f,m,n);return vA(f,p)}return vA(f,m)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Yl(t,r,"sendVerificationCode",async(l,c)=>{if(c.captchaResponse===Ql){Z(n?.type===uh,l,"argument-error");let f=await CI(l,c,n);return gA(l,f)}return gA(l,c)},"PHONE_PROVIDER").catch(l=>Promise.reject(l))).sessionInfo}}finally{n?._reset()}}async function CI(t,e,n){Z(n.type===uh,t,"argument-error");let a=await n.verify();Z(typeof a=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let s=r.phoneEnrollmentInfo.phoneNumber,i=r.phoneEnrollmentInfo.captchaResponse,u=r.phoneEnrollmentInfo.clientType,l=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:a,captchaResponse:i,clientType:u,recaptchaVersion:l}}),r}else if("phoneSignInInfo"in r){let s=r.phoneSignInInfo.captchaResponse,i=r.phoneSignInInfo.clientType,u=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:a,captchaResponse:s,clientType:i,recaptchaVersion:u}}),r}else return Object.assign(r,{recaptchaToken:a}),r}var ic=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=qo(e)}verifyPhoneNumber(e,n){return P2(this.auth,e,Jt(n))}static credential(e,n){return ec._fromVerification(e,n)}static credentialFromResult(e){let n=e;return t.credentialFromTaggedObject(n)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:n,temporaryProof:a}=e;return n&&a?ec._fromTokenResponse(n,a):null}};ic.PROVIDER_ID="phone";ic.PHONE_SIGN_IN_METHOD="phone";function O2(t,e){return e?Ar(e):(Z(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var oc=class extends pi{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Fo(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Fo(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Fo(e,this._buildIdpRequest())}_buildIdpRequest(e){let n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function M2(t){return p2(t.auth,new oc(t),t.bypassAuthState)}function N2(t){let{auth:e,user:n}=t;return Z(n,e,"internal-error"),h2(n,new oc(t),t.bypassAuthState)}async function V2(t){let{auth:e,user:n}=t;return Z(n,e,"internal-error"),f2(n,new oc(t),t.bypassAuthState)}var xh=class{constructor(e,n,a,r,s=!1){this.auth=e,this.resolver=a,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(a){this.reject(a)}})}async onAuthEvent(e){let{urlResponse:n,sessionId:a,postBody:r,tenantId:s,error:i,type:u}=e;if(i){this.reject(i);return}let l={auth:this.auth,requestUri:n,sessionId:a,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(l))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return M2;case"linkViaPopup":case"linkViaRedirect":return V2;case"reauthViaPopup":case"reauthViaRedirect":return N2;default:va(this.auth,"internal-error")}}resolve(e){xr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){xr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var U2=new hi(2e3,1e4);var qI=class t extends xh{constructor(e,n,a,r,s){super(e,n,r,s),this.provider=a,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return Z(e,this.auth,"internal-error"),e}async onExecution(){xr(this.filter.length===1,"Popup operations only handle one event");let e=JI();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(qa(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(qa(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(qa(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,U2.get())};e()}};qI.currentPopupAction=null;var F2="pendingRedirect",lh=new Map,zI=class extends xh{constructor(e,n,a=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,a),this.eventId=null}async execute(){let e=lh.get(this.auth._key());if(!e){try{let a=await B2(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(a)}catch(n){e=()=>Promise.reject(n)}lh.set(this.auth._key(),e)}return this.bypassAuthState||lh.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function B2(t,e){let n=H2(e),a=z2(t);if(!await a._isAvailable())return!1;let r=await a._get(n)==="true";return await a._remove(n),r}function q2(t,e){lh.set(t._key(),e)}function z2(t){return Ar(t._redirectPersistence)}function H2(t){return oh(F2,t.config.apiKey,t.name)}async function G2(t,e,n=!1){if(Fn(t.app))return Promise.reject(fi(t));let a=qo(t),r=O2(a,e),i=await new zI(a,r,n).execute();return i&&!n&&(delete i.user._redirectEventId,await a._persistUserIfCurrent(i.user),await a._setRedirectUser(null,e)),i}var j2=10*60*1e3,HI=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(a=>{this.isEventForConsumer(e,a)&&(n=!0,this.sendToConsumer(e,a),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!K2(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!ix(e)){let a=e.error.code?.split("auth/")[1]||"internal-error";n.onError(qa(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){let a=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&a}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=j2&&this.cachedEventUids.clear(),this.cachedEventUids.has(TA(e))}saveEventToCache(e){this.cachedEventUids.add(TA(e)),this.lastProcessedEventTime=Date.now()}};function TA(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function ix({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function K2(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return ix(t);default:return!1}}async function W2(t,e={}){return yn(t,"GET","/v1/projects",e)}var X2=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Q2=/^https?/;async function Y2(t){if(t.config.emulator)return;let{authorizedDomains:e}=await W2(t);for(let n of e)try{if($2(n))return}catch{}va(t,"unauthorized-domain")}function $2(t){let e=AI(),{protocol:n,hostname:a}=new URL(e);if(t.startsWith("chrome-extension://")){let i=new URL(t);return i.hostname===""&&a===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&i.hostname===a}if(!Q2.test(n))return!1;if(X2.test(t))return a===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(a)}var J2=new hi(3e4,6e4);function bA(){let t=za().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Z2(t){return new Promise((e,n)=>{function a(){bA(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{bA(),n(qa(t,"network-request-failed"))},timeout:J2.get()})}if(za().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(za().gapi?.load)a();else{let r=XA("iframefcb");return za()[r]=()=>{gapi.load?a():n(qa(t,"network-request-failed"))},WA(`${QM()}?onload=${r}`).catch(s=>n(s))}}).catch(e=>{throw ch=null,e})}var ch=null;function eN(t){return ch=ch||Z2(t),ch}var tN=new hi(5e3,15e3),nN="__/auth/iframe",aN="emulator/auth/iframe",rN={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},sN=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function iN(t){let e=t.config;Z(e.authDomain,t,"auth-domain-config-required");let n=e.emulator?XI(e,aN):`https://${t.config.authDomain}/${nN}`,a={apiKey:e.apiKey,appName:t.name,v:Fa},r=sN.get(t.config.apiHost);r&&(a.eid=r);let s=t._getFrameworks();return s.length&&(a.fw=s.join(",")),`${n}?${Mo(a).slice(1)}`}async function oN(t){let e=await eN(t),n=za().gapi;return Z(n,t,"internal-error"),e.open({where:document.body,url:iN(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:rN,dontclear:!0},a=>new Promise(async(r,s)=>{await a.restyle({setHideOnLeave:!1});let i=qa(t,"network-request-failed"),u=za().setTimeout(()=>{s(i)},tN.get());function l(){za().clearTimeout(u),r(a)}a.ping(l).then(l,()=>{s(i)})}))}var uN={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},lN=500,cN=600,dN="_blank",fN="http://localhost",Rh=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function hN(t,e,n,a=lN,r=cN){let s=Math.max((window.screen.availHeight-r)/2,0).toString(),i=Math.max((window.screen.availWidth-a)/2,0).toString(),u="",l={...uN,width:a.toString(),height:r.toString(),top:s,left:i},c=$t().toLowerCase();n&&(u=BA(c)?dN:n),UA(c)&&(e=e||fN,l.scrollbars="yes");let f=Object.entries(l).reduce((p,[_,R])=>`${p}${_}=${R},`,"");if(HM(c)&&u!=="_self")return pN(e||"",u),new Rh(null);let m=window.open(e||"",u,f);Z(m,t,"popup-blocked");try{m.focus()}catch{}return new Rh(m)}function pN(t,e){let n=document.createElement("a");n.href=t,n.target=e;let a=document.createEvent("MouseEvent");a.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(a)}var mN="__/auth/handler",gN="emulator/auth/handler",yN=encodeURIComponent("fac");async function EA(t,e,n,a,r,s){Z(t.config.authDomain,t,"auth-domain-config-required"),Z(t.config.apiKey,t,"invalid-api-key");let i={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:a,v:Fa,eventId:r};if(e instanceof vh){e.setDefaultLanguage(t.languageCode),i.providerId=e.providerId||"",XL(e.getCustomParameters())||(i.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,m]of Object.entries(s||{}))i[f]=m}if(e instanceof gi){let f=e.getScopes().filter(m=>m!=="");f.length>0&&(i.scopes=f.join(","))}t.tenantId&&(i.tid=t.tenantId);let u=i;for(let f of Object.keys(u))u[f]===void 0&&delete u[f];let l=await t._getAppCheckToken(),c=l?`#${yN}=${encodeURIComponent(l)}`:"";return`${IN(t)}?${Mo(u).slice(1)}${c}`}function IN({config:t}){return t.emulator?XI(t,gN):`https://${t.authDomain}/${mN}`}var LI="webStorageSupport",GI=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=$I,this._completeRedirectFn=G2,this._overrideRedirectResult=q2}async _openPopup(e,n,a,r){xr(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let s=await EA(e,n,a,AI(),r);return hN(e,s,JI())}async _openRedirect(e,n,a,r){await this._originValidation(e);let s=await EA(e,n,a,AI(),r);return T2(s),new Promise(()=>{})}_initialize(e){let n=e._key();if(this.eventManagers[n]){let{manager:r,promise:s}=this.eventManagers[n];return r?Promise.resolve(r):(xr(s,"If manager is not set, promise should be"),s)}let a=this.initAndGetManager(e);return this.eventManagers[n]={promise:a},a.catch(()=>{delete this.eventManagers[n]}),a}async initAndGetManager(e){let n=await oN(e),a=new HI(e);return n.register("authEvent",r=>(Z(r?.authEvent,e,"invalid-auth-event"),{status:a.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:a},this.iframes[e._key()]=n,a}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(LI,{type:LI},r=>{let s=r?.[0]?.[LI];s!==void 0&&n(!!s),va(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Y2(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return jA()||FA()||YI()}},ox=GI,kh=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return Ba("unexpected MultiFactorSessionType")}}},jI=class t extends kh{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,n,a){return m2(e,{idToken:n,displayName:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,n){return k2(e,{mfaPendingCredential:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Dh=class{constructor(){}static assertion(e){return jI._fromCredential(e)}};Dh.FACTOR_ID="phone";var Ph=class{static assertionForEnrollment(e,n){return Oh._fromSecret(e,n)}static assertionForSignIn(e,n){return Oh._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;Z(typeof n.user?.auth<"u","internal-error");let a=await g2(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return Mh._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Ph.FACTOR_ID="totp";var Oh=class t extends kh{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return Z(typeof this.secret<"u",e,"argument-error"),y2(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){Z(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return D2(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},Mh=class t{constructor(e,n,a,r,s,i,u){this.sessionInfo=i,this.auth=u,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(sh(e)||sh(n))&&(a=!0),a&&(sh(e)&&(e=this.auth.currentUser?.email||"unknownuser"),sh(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function sh(t){return typeof t>"u"||t?.length===0}var wA="@firebase/auth",CA="1.12.1";var KI=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){Z(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function _N(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function SN(t){Ua(new Vn("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:u}=a.options;Z(i&&!i.includes(":"),"invalid-api-key",{appName:a.name});let l={apiKey:i,authDomain:u,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:KA(t)},c=new OI(a,r,s,l);return JM(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),Ua(new Vn("auth-internal",e=>{let n=qo(e.getProvider("auth").getImmediate());return(a=>new KI(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Un(wA,CA,_N(t)),Un(wA,CA,"esm2020")}var vN=5*60,TN=iI("authIdTokenMaxAge")||vN,LA=null,bN=t=>async e=>{let n=e&&await e.getIdTokenResult(),a=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(a&&a>TN)return;let r=n?.token;LA!==r&&(LA=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function ZI(t=Uo()){let e=di(t,"auth");if(e.isInitialized())return e.getImmediate();let n=QA(t,{popupRedirectResolver:ox,persistence:[sx,tx,$I]}),a=iI("authTokenSyncURL");if(a&&typeof isSecureContext=="boolean"&&isSecureContext){let s=new URL(a,location.origin);if(location.origin===s.origin){let i=bN(s.toString());ex(n,i,()=>i(n.currentUser)),ZA(n,u=>i(u))}}let r=rI("auth");return r&&YA(n,`http://${r}`),n}function EN(){return document.getElementsByTagName("head")?.[0]??document}WM({loadJS(t){return new Promise((e,n)=>{let a=document.createElement("script");a.setAttribute("src",t),a.onload=e,a.onerror=r=>{let s=qa("internal-error");s.customData=r,n(s)},a.type="text/javascript",a.charset="UTF-8",EN().appendChild(a)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});SN("Browser");var ux=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},lx={};var Rr,e_;(function(){var t;function e(S,g){function v(){}v.prototype=g.prototype,S.F=g.prototype,S.prototype=new v,S.prototype.constructor=S,S.D=function(b,C,A){for(var E=Array(arguments.length-2),X=2;X<arguments.length;X++)E[X-2]=arguments[X];return g.prototype[C].apply(b,E)}}function n(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(a,n),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(S,g,v){v||(v=0);let b=Array(16);if(typeof g=="string")for(var C=0;C<16;++C)b[C]=g.charCodeAt(v++)|g.charCodeAt(v++)<<8|g.charCodeAt(v++)<<16|g.charCodeAt(v++)<<24;else for(C=0;C<16;++C)b[C]=g[v++]|g[v++]<<8|g[v++]<<16|g[v++]<<24;g=S.g[0],v=S.g[1],C=S.g[2];let A=S.g[3],E;E=g+(A^v&(C^A))+b[0]+3614090360&4294967295,g=v+(E<<7&4294967295|E>>>25),E=A+(C^g&(v^C))+b[1]+3905402710&4294967295,A=g+(E<<12&4294967295|E>>>20),E=C+(v^A&(g^v))+b[2]+606105819&4294967295,C=A+(E<<17&4294967295|E>>>15),E=v+(g^C&(A^g))+b[3]+3250441966&4294967295,v=C+(E<<22&4294967295|E>>>10),E=g+(A^v&(C^A))+b[4]+4118548399&4294967295,g=v+(E<<7&4294967295|E>>>25),E=A+(C^g&(v^C))+b[5]+1200080426&4294967295,A=g+(E<<12&4294967295|E>>>20),E=C+(v^A&(g^v))+b[6]+2821735955&4294967295,C=A+(E<<17&4294967295|E>>>15),E=v+(g^C&(A^g))+b[7]+4249261313&4294967295,v=C+(E<<22&4294967295|E>>>10),E=g+(A^v&(C^A))+b[8]+1770035416&4294967295,g=v+(E<<7&4294967295|E>>>25),E=A+(C^g&(v^C))+b[9]+2336552879&4294967295,A=g+(E<<12&4294967295|E>>>20),E=C+(v^A&(g^v))+b[10]+4294925233&4294967295,C=A+(E<<17&4294967295|E>>>15),E=v+(g^C&(A^g))+b[11]+2304563134&4294967295,v=C+(E<<22&4294967295|E>>>10),E=g+(A^v&(C^A))+b[12]+1804603682&4294967295,g=v+(E<<7&4294967295|E>>>25),E=A+(C^g&(v^C))+b[13]+4254626195&4294967295,A=g+(E<<12&4294967295|E>>>20),E=C+(v^A&(g^v))+b[14]+2792965006&4294967295,C=A+(E<<17&4294967295|E>>>15),E=v+(g^C&(A^g))+b[15]+1236535329&4294967295,v=C+(E<<22&4294967295|E>>>10),E=g+(C^A&(v^C))+b[1]+4129170786&4294967295,g=v+(E<<5&4294967295|E>>>27),E=A+(v^C&(g^v))+b[6]+3225465664&4294967295,A=g+(E<<9&4294967295|E>>>23),E=C+(g^v&(A^g))+b[11]+643717713&4294967295,C=A+(E<<14&4294967295|E>>>18),E=v+(A^g&(C^A))+b[0]+3921069994&4294967295,v=C+(E<<20&4294967295|E>>>12),E=g+(C^A&(v^C))+b[5]+3593408605&4294967295,g=v+(E<<5&4294967295|E>>>27),E=A+(v^C&(g^v))+b[10]+38016083&4294967295,A=g+(E<<9&4294967295|E>>>23),E=C+(g^v&(A^g))+b[15]+3634488961&4294967295,C=A+(E<<14&4294967295|E>>>18),E=v+(A^g&(C^A))+b[4]+3889429448&4294967295,v=C+(E<<20&4294967295|E>>>12),E=g+(C^A&(v^C))+b[9]+568446438&4294967295,g=v+(E<<5&4294967295|E>>>27),E=A+(v^C&(g^v))+b[14]+3275163606&4294967295,A=g+(E<<9&4294967295|E>>>23),E=C+(g^v&(A^g))+b[3]+4107603335&4294967295,C=A+(E<<14&4294967295|E>>>18),E=v+(A^g&(C^A))+b[8]+1163531501&4294967295,v=C+(E<<20&4294967295|E>>>12),E=g+(C^A&(v^C))+b[13]+2850285829&4294967295,g=v+(E<<5&4294967295|E>>>27),E=A+(v^C&(g^v))+b[2]+4243563512&4294967295,A=g+(E<<9&4294967295|E>>>23),E=C+(g^v&(A^g))+b[7]+1735328473&4294967295,C=A+(E<<14&4294967295|E>>>18),E=v+(A^g&(C^A))+b[12]+2368359562&4294967295,v=C+(E<<20&4294967295|E>>>12),E=g+(v^C^A)+b[5]+4294588738&4294967295,g=v+(E<<4&4294967295|E>>>28),E=A+(g^v^C)+b[8]+2272392833&4294967295,A=g+(E<<11&4294967295|E>>>21),E=C+(A^g^v)+b[11]+1839030562&4294967295,C=A+(E<<16&4294967295|E>>>16),E=v+(C^A^g)+b[14]+4259657740&4294967295,v=C+(E<<23&4294967295|E>>>9),E=g+(v^C^A)+b[1]+2763975236&4294967295,g=v+(E<<4&4294967295|E>>>28),E=A+(g^v^C)+b[4]+1272893353&4294967295,A=g+(E<<11&4294967295|E>>>21),E=C+(A^g^v)+b[7]+4139469664&4294967295,C=A+(E<<16&4294967295|E>>>16),E=v+(C^A^g)+b[10]+3200236656&4294967295,v=C+(E<<23&4294967295|E>>>9),E=g+(v^C^A)+b[13]+681279174&4294967295,g=v+(E<<4&4294967295|E>>>28),E=A+(g^v^C)+b[0]+3936430074&4294967295,A=g+(E<<11&4294967295|E>>>21),E=C+(A^g^v)+b[3]+3572445317&4294967295,C=A+(E<<16&4294967295|E>>>16),E=v+(C^A^g)+b[6]+76029189&4294967295,v=C+(E<<23&4294967295|E>>>9),E=g+(v^C^A)+b[9]+3654602809&4294967295,g=v+(E<<4&4294967295|E>>>28),E=A+(g^v^C)+b[12]+3873151461&4294967295,A=g+(E<<11&4294967295|E>>>21),E=C+(A^g^v)+b[15]+530742520&4294967295,C=A+(E<<16&4294967295|E>>>16),E=v+(C^A^g)+b[2]+3299628645&4294967295,v=C+(E<<23&4294967295|E>>>9),E=g+(C^(v|~A))+b[0]+4096336452&4294967295,g=v+(E<<6&4294967295|E>>>26),E=A+(v^(g|~C))+b[7]+1126891415&4294967295,A=g+(E<<10&4294967295|E>>>22),E=C+(g^(A|~v))+b[14]+2878612391&4294967295,C=A+(E<<15&4294967295|E>>>17),E=v+(A^(C|~g))+b[5]+4237533241&4294967295,v=C+(E<<21&4294967295|E>>>11),E=g+(C^(v|~A))+b[12]+1700485571&4294967295,g=v+(E<<6&4294967295|E>>>26),E=A+(v^(g|~C))+b[3]+2399980690&4294967295,A=g+(E<<10&4294967295|E>>>22),E=C+(g^(A|~v))+b[10]+4293915773&4294967295,C=A+(E<<15&4294967295|E>>>17),E=v+(A^(C|~g))+b[1]+2240044497&4294967295,v=C+(E<<21&4294967295|E>>>11),E=g+(C^(v|~A))+b[8]+1873313359&4294967295,g=v+(E<<6&4294967295|E>>>26),E=A+(v^(g|~C))+b[15]+4264355552&4294967295,A=g+(E<<10&4294967295|E>>>22),E=C+(g^(A|~v))+b[6]+2734768916&4294967295,C=A+(E<<15&4294967295|E>>>17),E=v+(A^(C|~g))+b[13]+1309151649&4294967295,v=C+(E<<21&4294967295|E>>>11),E=g+(C^(v|~A))+b[4]+4149444226&4294967295,g=v+(E<<6&4294967295|E>>>26),E=A+(v^(g|~C))+b[11]+3174756917&4294967295,A=g+(E<<10&4294967295|E>>>22),E=C+(g^(A|~v))+b[2]+718787259&4294967295,C=A+(E<<15&4294967295|E>>>17),E=v+(A^(C|~g))+b[9]+3951481745&4294967295,S.g[0]=S.g[0]+g&4294967295,S.g[1]=S.g[1]+(C+(E<<21&4294967295|E>>>11))&4294967295,S.g[2]=S.g[2]+C&4294967295,S.g[3]=S.g[3]+A&4294967295}a.prototype.v=function(S,g){g===void 0&&(g=S.length);let v=g-this.blockSize,b=this.C,C=this.h,A=0;for(;A<g;){if(C==0)for(;A<=v;)r(this,S,A),A+=this.blockSize;if(typeof S=="string"){for(;A<g;)if(b[C++]=S.charCodeAt(A++),C==this.blockSize){r(this,b),C=0;break}}else for(;A<g;)if(b[C++]=S[A++],C==this.blockSize){r(this,b),C=0;break}}this.h=C,this.o+=g},a.prototype.A=function(){var S=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);S[0]=128;for(var g=1;g<S.length-8;++g)S[g]=0;g=this.o*8;for(var v=S.length-8;v<S.length;++v)S[v]=g&255,g/=256;for(this.v(S),S=Array(16),g=0,v=0;v<4;++v)for(let b=0;b<32;b+=8)S[g++]=this.g[v]>>>b&255;return S};function s(S,g){var v=u;return Object.prototype.hasOwnProperty.call(v,S)?v[S]:v[S]=g(S)}function i(S,g){this.h=g;let v=[],b=!0;for(let C=S.length-1;C>=0;C--){let A=S[C]|0;b&&A==g||(v[C]=A,b=!1)}this.g=v}var u={};function l(S){return-128<=S&&S<128?s(S,function(g){return new i([g|0],g<0?-1:0)}):new i([S|0],S<0?-1:0)}function c(S){if(isNaN(S)||!isFinite(S))return m;if(S<0)return L(c(-S));let g=[],v=1;for(let b=0;S>=v;b++)g[b]=S/v|0,v*=4294967296;return new i(g,0)}function f(S,g){if(S.length==0)throw Error("number format error: empty string");if(g=g||10,g<2||36<g)throw Error("radix out of range: "+g);if(S.charAt(0)=="-")return L(f(S.substring(1),g));if(S.indexOf("-")>=0)throw Error('number format error: interior "-" character');let v=c(Math.pow(g,8)),b=m;for(let A=0;A<S.length;A+=8){var C=Math.min(8,S.length-A);let E=parseInt(S.substring(A,A+C),g);C<8?(C=c(Math.pow(g,C)),b=b.j(C).add(c(E))):(b=b.j(v),b=b.add(c(E)))}return b}var m=l(0),p=l(1),_=l(16777216);t=i.prototype,t.m=function(){if(D(this))return-L(this).m();let S=0,g=1;for(let v=0;v<this.g.length;v++){let b=this.i(v);S+=(b>=0?b:4294967296+b)*g,g*=4294967296}return S},t.toString=function(S){if(S=S||10,S<2||36<S)throw Error("radix out of range: "+S);if(R(this))return"0";if(D(this))return"-"+L(this).toString(S);let g=c(Math.pow(S,6));var v=this;let b="";for(;;){let C=x(v,g).g;v=T(v,C.j(g));let A=((v.g.length>0?v.g[0]:v.h)>>>0).toString(S);if(v=C,R(v))return A+b;for(;A.length<6;)A="0"+A;b=A+b}},t.i=function(S){return S<0?0:S<this.g.length?this.g[S]:this.h};function R(S){if(S.h!=0)return!1;for(let g=0;g<S.g.length;g++)if(S.g[g]!=0)return!1;return!0}function D(S){return S.h==-1}t.l=function(S){return S=T(this,S),D(S)?-1:R(S)?0:1};function L(S){let g=S.g.length,v=[];for(let b=0;b<g;b++)v[b]=~S.g[b];return new i(v,~S.h).add(p)}t.abs=function(){return D(this)?L(this):this},t.add=function(S){let g=Math.max(this.g.length,S.g.length),v=[],b=0;for(let C=0;C<=g;C++){let A=b+(this.i(C)&65535)+(S.i(C)&65535),E=(A>>>16)+(this.i(C)>>>16)+(S.i(C)>>>16);b=E>>>16,A&=65535,E&=65535,v[C]=E<<16|A}return new i(v,v[v.length-1]&-2147483648?-1:0)};function T(S,g){return S.add(L(g))}t.j=function(S){if(R(this)||R(S))return m;if(D(this))return D(S)?L(this).j(L(S)):L(L(this).j(S));if(D(S))return L(this.j(L(S)));if(this.l(_)<0&&S.l(_)<0)return c(this.m()*S.m());let g=this.g.length+S.g.length,v=[];for(var b=0;b<2*g;b++)v[b]=0;for(b=0;b<this.g.length;b++)for(let C=0;C<S.g.length;C++){let A=this.i(b)>>>16,E=this.i(b)&65535,X=S.i(C)>>>16,re=S.i(C)&65535;v[2*b+2*C]+=E*re,I(v,2*b+2*C),v[2*b+2*C+1]+=A*re,I(v,2*b+2*C+1),v[2*b+2*C+1]+=E*X,I(v,2*b+2*C+1),v[2*b+2*C+2]+=A*X,I(v,2*b+2*C+2)}for(S=0;S<g;S++)v[S]=v[2*S+1]<<16|v[2*S];for(S=g;S<2*g;S++)v[S]=0;return new i(v,0)};function I(S,g){for(;(S[g]&65535)!=S[g];)S[g+1]+=S[g]>>>16,S[g]&=65535,g++}function w(S,g){this.g=S,this.h=g}function x(S,g){if(R(g))throw Error("division by zero");if(R(S))return new w(m,m);if(D(S))return g=x(L(S),g),new w(L(g.g),L(g.h));if(D(g))return g=x(S,L(g)),new w(L(g.g),g.h);if(S.g.length>30){if(D(S)||D(g))throw Error("slowDivide_ only works with positive integers.");for(var v=p,b=g;b.l(S)<=0;)v=H(v),b=H(b);var C=j(v,1),A=j(b,1);for(b=j(b,2),v=j(v,2);!R(b);){var E=A.add(b);E.l(S)<=0&&(C=C.add(v),A=E),b=j(b,1),v=j(v,1)}return g=T(S,C.j(g)),new w(C,g)}for(C=m;S.l(g)>=0;){for(v=Math.max(1,Math.floor(S.m()/g.m())),b=Math.ceil(Math.log(v)/Math.LN2),b=b<=48?1:Math.pow(2,b-48),A=c(v),E=A.j(g);D(E)||E.l(S)>0;)v-=b,A=c(v),E=A.j(g);R(A)&&(A=p),C=C.add(A),S=T(S,E)}return new w(C,S)}t.B=function(S){return x(this,S).h},t.and=function(S){let g=Math.max(this.g.length,S.g.length),v=[];for(let b=0;b<g;b++)v[b]=this.i(b)&S.i(b);return new i(v,this.h&S.h)},t.or=function(S){let g=Math.max(this.g.length,S.g.length),v=[];for(let b=0;b<g;b++)v[b]=this.i(b)|S.i(b);return new i(v,this.h|S.h)},t.xor=function(S){let g=Math.max(this.g.length,S.g.length),v=[];for(let b=0;b<g;b++)v[b]=this.i(b)^S.i(b);return new i(v,this.h^S.h)};function H(S){let g=S.g.length+1,v=[];for(let b=0;b<g;b++)v[b]=S.i(b)<<1|S.i(b-1)>>>31;return new i(v,S.h)}function j(S,g){let v=g>>5;g%=32;let b=S.g.length-v,C=[];for(let A=0;A<b;A++)C[A]=g>0?S.i(A+v)>>>g|S.i(A+v+1)<<32-g:S.i(A+v);return new i(C,S.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,e_=lx.Md5=a,i.prototype.add=i.prototype.add,i.prototype.multiply=i.prototype.j,i.prototype.modulo=i.prototype.B,i.prototype.compare=i.prototype.l,i.prototype.toNumber=i.prototype.m,i.prototype.toString=i.prototype.toString,i.prototype.getBits=i.prototype.i,i.fromNumber=c,i.fromString=f,Rr=lx.Integer=i}).apply(typeof ux<"u"?ux:typeof self<"u"?self:typeof window<"u"?window:{});var Uh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},kr={};var t_,wN,zo,n_,uc,Fh,a_,r_,s_;(function(){var t,e=Object.defineProperty;function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Uh=="object"&&Uh];for(var d=0;d<o.length;++d){var h=o[d];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var a=n(this);function r(o,d){if(d)e:{var h=a;o=o.split(".");for(var y=0;y<o.length-1;y++){var k=o[y];if(!(k in h))break e;h=h[k]}o=o[o.length-1],y=h[o],d=d(y),d!=y&&d!=null&&e(h,o,{configurable:!0,writable:!0,value:d})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(d){var h=[],y;for(y in d)Object.prototype.hasOwnProperty.call(d,y)&&h.push([y,d[y]]);return h}});var s=s||{},i=this||self;function u(o){var d=typeof o;return d=="object"&&o!=null||d=="function"}function l(o,d,h){return o.call.apply(o.bind,arguments)}function c(o,d,h){return c=l,c.apply(null,arguments)}function f(o,d){var h=Array.prototype.slice.call(arguments,1);return function(){var y=h.slice();return y.push.apply(y,arguments),o.apply(this,y)}}function m(o,d){function h(){}h.prototype=d.prototype,o.Z=d.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(y,k,P){for(var G=Array(arguments.length-2),me=2;me<arguments.length;me++)G[me-2]=arguments[me];return d.prototype[k].apply(y,G)}}var p=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function _(o){let d=o.length;if(d>0){let h=Array(d);for(let y=0;y<d;y++)h[y]=o[y];return h}return[]}function R(o,d){for(let y=1;y<arguments.length;y++){let k=arguments[y];var h=typeof k;if(h=h!="object"?h:k?Array.isArray(k)?"array":h:"null",h=="array"||h=="object"&&typeof k.length=="number"){h=o.length||0;let P=k.length||0;o.length=h+P;for(let G=0;G<P;G++)o[h+G]=k[G]}else o.push(k)}}class D{constructor(d,h){this.i=d,this.j=h,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function L(o){i.setTimeout(()=>{throw o},0)}function T(){var o=S;let d=null;return o.g&&(d=o.g,o.g=o.g.next,o.g||(o.h=null),d.next=null),d}class I{constructor(){this.h=this.g=null}add(d,h){let y=w.get();y.set(d,h),this.h?this.h.next=y:this.g=y,this.h=y}}var w=new D(()=>new x,o=>o.reset());class x{constructor(){this.next=this.g=this.h=null}set(d,h){this.h=d,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let H,j=!1,S=new I,g=()=>{let o=Promise.resolve(void 0);H=()=>{o.then(v)}};function v(){for(var o;o=T();){try{o.h.call(o.g)}catch(h){L(h)}var d=w;d.j(o),d.h<100&&(d.h++,o.next=d.g,d.g=o)}j=!1}function b(){this.u=this.u,this.C=this.C}b.prototype.u=!1,b.prototype.dispose=function(){this.u||(this.u=!0,this.N())},b.prototype[Symbol.dispose]=function(){this.dispose()},b.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function C(o,d){this.type=o,this.g=this.target=d,this.defaultPrevented=!1}C.prototype.h=function(){this.defaultPrevented=!0};var A=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var o=!1,d=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let h=()=>{};i.addEventListener("test",h,d),i.removeEventListener("test",h,d)}catch{}return o}();function E(o){return/^[\s\xa0]*$/.test(o)}function X(o,d){C.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,d)}m(X,C),X.prototype.init=function(o,d){let h=this.type=o.type,y=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=d,d=o.relatedTarget,d||(h=="mouseover"?d=o.fromElement:h=="mouseout"&&(d=o.toElement)),this.relatedTarget=d,y?(this.clientX=y.clientX!==void 0?y.clientX:y.pageX,this.clientY=y.clientY!==void 0?y.clientY:y.pageY,this.screenX=y.screenX||0,this.screenY=y.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&X.Z.h.call(this)},X.prototype.h=function(){X.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var re="closure_listenable_"+(Math.random()*1e6|0),nn=0;function M(o,d,h,y,k){this.listener=o,this.proxy=null,this.src=d,this.type=h,this.capture=!!y,this.ha=k,this.key=++nn,this.da=this.fa=!1}function O(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function F(o,d,h){for(let y in o)d.call(h,o[y],y,o)}function J(o,d){for(let h in o)d.call(void 0,o[h],h,o)}function Y(o){let d={};for(let h in o)d[h]=o[h];return d}let se="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function $e(o,d){let h,y;for(let k=1;k<arguments.length;k++){y=arguments[k];for(h in y)o[h]=y[h];for(let P=0;P<se.length;P++)h=se[P],Object.prototype.hasOwnProperty.call(y,h)&&(o[h]=y[h])}}function Me(o){this.src=o,this.g={},this.h=0}Me.prototype.add=function(o,d,h,y,k){let P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);let G=Je(o,d,y,k);return G>-1?(d=o[G],h||(d.fa=!1)):(d=new M(d,this.src,P,!!y,k),d.fa=h,o.push(d)),d};function We(o,d){let h=d.type;if(h in o.g){var y=o.g[h],k=Array.prototype.indexOf.call(y,d,void 0),P;(P=k>=0)&&Array.prototype.splice.call(y,k,1),P&&(O(d),o.g[h].length==0&&(delete o.g[h],o.h--))}}function Je(o,d,h,y){for(let k=0;k<o.length;++k){let P=o[k];if(!P.da&&P.listener==d&&P.capture==!!h&&P.ha==y)return k}return-1}var Cn="closure_lm_"+(Math.random()*1e6|0),Sn={};function an(o,d,h,y,k){if(y&&y.once)return te(o,d,h,y,k);if(Array.isArray(d)){for(let P=0;P<d.length;P++)an(o,d[P],h,y,k);return null}return h=Xe(h),o&&o[re]?o.J(d,h,u(y)?!!y.capture:!!y,k):vn(o,d,h,!1,y,k)}function vn(o,d,h,y,k,P){if(!d)throw Error("Invalid event type");let G=u(k)?!!k.capture:!!k,me=Gt(o);if(me||(o[Cn]=me=new Me(o)),h=me.add(d,h,y,G,P),h.proxy)return h;if(y=N(),h.proxy=y,y.src=o,y.listener=h,o.addEventListener)A||(k=G),k===void 0&&(k=!1),o.addEventListener(d.toString(),y,k);else if(o.attachEvent)o.attachEvent(_e(d.toString()),y);else if(o.addListener&&o.removeListener)o.addListener(y);else throw Error("addEventListener and attachEvent are unavailable.");return h}function N(){function o(h){return d.call(o.src,o.listener,h)}let d=ue;return o}function te(o,d,h,y,k){if(Array.isArray(d)){for(let P=0;P<d.length;P++)te(o,d[P],h,y,k);return null}return h=Xe(h),o&&o[re]?o.K(d,h,u(y)?!!y.capture:!!y,k):vn(o,d,h,!0,y,k)}function ae(o,d,h,y,k){if(Array.isArray(d))for(var P=0;P<d.length;P++)ae(o,d[P],h,y,k);else y=u(y)?!!y.capture:!!y,h=Xe(h),o&&o[re]?(o=o.i,P=String(d).toString(),P in o.g&&(d=o.g[P],h=Je(d,h,y,k),h>-1&&(O(d[h]),Array.prototype.splice.call(d,h,1),d.length==0&&(delete o.g[P],o.h--)))):o&&(o=Gt(o))&&(d=o.g[d.toString()],o=-1,d&&(o=Je(d,h,y,k)),(h=o>-1?d[o]:null)&&fe(h))}function fe(o){if(typeof o!="number"&&o&&!o.da){var d=o.src;if(d&&d[re])We(d.i,o);else{var h=o.type,y=o.proxy;d.removeEventListener?d.removeEventListener(h,y,o.capture):d.detachEvent?d.detachEvent(_e(h),y):d.addListener&&d.removeListener&&d.removeListener(y),(h=Gt(d))?(We(h,o),h.h==0&&(h.src=null,d[Cn]=null)):O(o)}}}function _e(o){return o in Sn?Sn[o]:Sn[o]="on"+o}function ue(o,d){if(o.da)o=!0;else{d=new X(d,this);let h=o.listener,y=o.ha||o.src;o.fa&&fe(o),o=h.call(y,d)}return o}function Gt(o){return o=o[Cn],o instanceof Me?o:null}var Ze="__closure_events_fn_"+(Math.random()*1e9>>>0);function Xe(o){return typeof o=="function"?o:(o[Ze]||(o[Ze]=function(d){return o.handleEvent(d)}),o[Ze])}function ge(){b.call(this),this.i=new Me(this),this.M=this,this.G=null}m(ge,b),ge.prototype[re]=!0,ge.prototype.removeEventListener=function(o,d,h,y){ae(this,o,d,h,y)};function Te(o,d){var h,y=o.G;if(y)for(h=[];y;y=y.G)h.push(y);if(o=o.M,y=d.type||d,typeof d=="string")d=new C(d,o);else if(d instanceof C)d.target=d.target||o;else{var k=d;d=new C(y,o),$e(d,k)}k=!0;let P,G;if(h)for(G=h.length-1;G>=0;G--)P=d.g=h[G],k=Ue(P,y,!0,d)&&k;if(P=d.g=o,k=Ue(P,y,!0,d)&&k,k=Ue(P,y,!1,d)&&k,h)for(G=0;G<h.length;G++)P=d.g=h[G],k=Ue(P,y,!1,d)&&k}ge.prototype.N=function(){if(ge.Z.N.call(this),this.i){var o=this.i;for(let d in o.g){let h=o.g[d];for(let y=0;y<h.length;y++)O(h[y]);delete o.g[d],o.h--}}this.G=null},ge.prototype.J=function(o,d,h,y){return this.i.add(String(o),d,!1,h,y)},ge.prototype.K=function(o,d,h,y){return this.i.add(String(o),d,!0,h,y)};function Ue(o,d,h,y){if(d=o.i.g[String(d)],!d)return!0;d=d.concat();let k=!0;for(let P=0;P<d.length;++P){let G=d[P];if(G&&!G.da&&G.capture==h){let me=G.listener,Ft=G.ha||G.src;G.fa&&We(o.i,G),k=me.call(Ft,y)!==!1&&k}}return k&&!y.defaultPrevented}function et(o,d){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=c(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:i.setTimeout(o,d||0)}function De(o){o.g=et(()=>{o.g=null,o.i&&(o.i=!1,De(o))},o.l);let d=o.h;o.h=null,o.m.apply(null,d)}class Pe extends b{constructor(d,h){super(),this.m=d,this.l=h,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:De(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function Qe(o){b.call(this),this.h=o,this.g={}}m(Qe,b);var rn=[];function dt(o){F(o.g,function(d,h){this.g.hasOwnProperty(h)&&fe(d)},o),o.g={}}Qe.prototype.N=function(){Qe.Z.N.call(this),dt(this)},Qe.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var yt=i.JSON.stringify,tt=i.JSON.parse,hn=class{stringify(o){return i.JSON.stringify(o,void 0)}parse(o){return i.JSON.parse(o,void 0)}};function It(){}function Ln(){}var sn={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function He(){C.call(this,"d")}m(He,C);function pe(){C.call(this,"c")}m(pe,C);var it={},jr=null;function ga(){return jr=jr||new ge}it.Ia="serverreachability";function nr(o){C.call(this,it.Ia,o)}m(nr,C);function jt(o){let d=ga();Te(d,new nr(d))}it.STAT_EVENT="statevent";function wu(o,d){C.call(this,it.STAT_EVENT,o),this.stat=d}m(wu,C);function Kt(o){let d=ga();Te(d,new wu(d,o))}it.Ja="timingevent";function pn(o,d){C.call(this,it.Ja,o),this.size=d}m(pn,C);function ar(o,d){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){o()},d)}function rr(){this.g=!0}rr.prototype.ua=function(){this.g=!1};function Cu(o,d,h,y,k,P){o.info(function(){if(o.g)if(P){var G="",me=P.split("&");for(let Ge=0;Ge<me.length;Ge++){var Ft=me[Ge].split("=");if(Ft.length>1){let Wt=Ft[0];Ft=Ft[1];let La=Wt.split("_");G=La.length>=2&&La[1]=="type"?G+(Wt+"="+Ft+"&"):G+(Wt+"=redacted&")}}}else G=null;else G=P;return"XMLHTTP REQ ("+y+") [attempt "+k+"]: "+d+`
`+h+`
`+G})}function Vs(o,d,h,y,k,P,G){o.info(function(){return"XMLHTTP RESP ("+y+") [ attempt "+k+"]: "+d+`
`+h+`
`+P+" "+G})}function wa(o,d,h,y){o.info(function(){return"XMLHTTP TEXT ("+d+"): "+nd(o,h)+(y?" "+y:"")})}function td(o,d){o.info(function(){return"TIMEOUT: "+d})}rr.prototype.info=function(){};function nd(o,d){if(!o.g)return d;if(!d)return null;try{let P=JSON.parse(d);if(P){for(o=0;o<P.length;o++)if(Array.isArray(P[o])){var h=P[o];if(!(h.length<2)){var y=h[1];if(Array.isArray(y)&&!(y.length<1)){var k=y[0];if(k!="noop"&&k!="stop"&&k!="close")for(let G=1;G<y.length;G++)y[G]=""}}}}return yt(P)}catch{return d}}var Us={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},qn={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},mn;function zn(){}m(zn,It),zn.prototype.g=function(){return new XMLHttpRequest},mn=new zn;function An(o){return encodeURIComponent(String(o))}function ad(o){var d=1;o=o.split(":");let h=[];for(;d>0&&o.length;)h.push(o.shift()),d--;return o.length&&h.push(o.join(":")),h}function Hn(o,d,h,y){this.j=o,this.i=d,this.l=h,this.S=y||1,this.V=new Qe(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Lu}function Lu(){this.i=null,this.g="",this.h=!1}var Au={},ki={};function Di(o,d,h){o.M=1,o.A=Ie(K(d)),o.u=h,o.R=!0,xu(o,null)}function xu(o,d){o.F=Date.now(),Fs(o),o.B=K(o.A);var h=o.B,y=o.S;Array.isArray(y)||(y=[String(y)]),Ov(h.i,"t",y),o.C=0,h=o.j.L,o.h=new Lu,o.g=Jv(o.j,h?d:null,!o.u),o.P>0&&(o.O=new Pe(c(o.Y,o,o.g),o.P)),d=o.V,h=o.g,y=o.ba;var k="readystatechange";Array.isArray(k)||(k&&(rn[0]=k.toString()),k=rn);for(let P=0;P<k.length;P++){let G=an(h,k[P],y||d.handleEvent,!1,d.h||d);if(!G)break;d.g[G.key]=G}d=o.J?Y(o.J):{},o.u?(o.v||(o.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,d)):(o.v="GET",o.g.ea(o.B,o.v,null,d)),jt(),Cu(o.i,o.v,o.B,o.l,o.S,o.u)}Hn.prototype.ba=function(o){o=o.target;let d=this.O;d&&Qr(o)==3?d.j():this.Y(o)},Hn.prototype.Y=function(o){try{if(o==this.g)e:{let me=Qr(this.g),Ft=this.g.ya(),Ge=this.g.ca();if(!(me<3)&&(me!=3||this.g&&(this.h.h||this.g.la()||qv(this.g)))){this.K||me!=4||Ft==7||(Ft==8||Ge<=0?jt(3):jt(2)),Pi(this);var d=this.g.ca();this.X=d;var h=sr(this);if(this.o=d==200,Vs(this.i,this.v,this.B,this.l,this.S,me,d),this.o){if(this.U&&!this.L){t:{if(this.g){var y,k=this.g;if((y=k.g?k.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!E(y)){var P=y;break t}}P=null}if(o=P)wa(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Oi(this,o);else{this.o=!1,this.m=3,Kt(12),Ca(this),Wr(this);break e}}if(this.R){o=!0;let Wt;for(;!this.K&&this.C<h.length;)if(Wt=rd(this,h),Wt==ki){me==4&&(this.m=4,Kt(14),o=!1),wa(this.i,this.l,null,"[Incomplete Response]");break}else if(Wt==Au){this.m=4,Kt(15),wa(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else wa(this.i,this.l,Wt,null),Oi(this,Wt);if(Ru(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),me!=4||h.length!=0||this.h.h||(this.m=1,Kt(16),o=!1),this.o=this.o&&o,!o)wa(this.i,this.l,h,"[Invalid Chunked Response]"),Ca(this),Wr(this);else if(h.length>0&&!this.W){this.W=!0;var G=this.j;G.g==this&&G.aa&&!G.P&&(G.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),em(G),G.P=!0,Kt(11))}}else wa(this.i,this.l,h,null),Oi(this,h);me==4&&Ca(this),this.o&&!this.K&&(me==4?Xv(this.j,this):(this.o=!1,Fs(this)))}else N1(this.g),d==400&&h.indexOf("Unknown SID")>0?(this.m=3,Kt(12)):(this.m=0,Kt(13)),Ca(this),Wr(this)}}}catch{}finally{}};function sr(o){if(!Ru(o))return o.g.la();let d=qv(o.g);if(d==="")return"";let h="",y=d.length,k=Qr(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return Ca(o),Wr(o),"";o.h.i=new i.TextDecoder}for(let P=0;P<y;P++)o.h.h=!0,h+=o.h.i.decode(d[P],{stream:!(k&&P==y-1)});return d.length=0,o.h.g+=h,o.C=0,o.h.g}function Ru(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function rd(o,d){var h=o.C,y=d.indexOf(`
`,h);return y==-1?ki:(h=Number(d.substring(h,y)),isNaN(h)?Au:(y+=1,y+h>d.length?ki:(d=d.slice(y,y+h),o.C=y+h,d)))}Hn.prototype.cancel=function(){this.K=!0,Ca(this)};function Fs(o){o.T=Date.now()+o.H,Kr(o,o.H)}function Kr(o,d){if(o.D!=null)throw Error("WatchDog timer not null");o.D=ar(c(o.aa,o),d)}function Pi(o){o.D&&(i.clearTimeout(o.D),o.D=null)}Hn.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?(td(this.i,this.B),this.M!=2&&(jt(),Kt(17)),Ca(this),this.m=2,Wr(this)):Kr(this,this.T-o)};function Wr(o){o.j.I==0||o.K||Xv(o.j,o)}function Ca(o){Pi(o);var d=o.O;d&&typeof d.dispose=="function"&&d.dispose(),o.O=null,dt(o.V),o.g&&(d=o.g,o.g=null,d.abort(),d.dispose())}function Oi(o,d){try{var h=o.j;if(h.I!=0&&(h.g==o||Mi(h.h,o))){if(!o.L&&Mi(h.h,o)&&h.I==3){try{var y=h.Ba.g.parse(d)}catch{y=null}if(Array.isArray(y)&&y.length==3){var k=y;if(k[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)hd(h),dd(h);else break e;Zp(h),Kt(18)}}else h.xa=k[1],0<h.xa-h.K&&k[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=ar(c(h.Va,h),6e3));Pu(h.h)<=1&&h.ta&&(h.ta=void 0)}else qs(h,11)}else if((o.L||h.g==o)&&hd(h),!E(d))for(k=h.Ba.g.parse(d),d=0;d<k.length;d++){let Ge=k[d],Wt=Ge[0];if(!(Wt<=h.K))if(h.K=Wt,Ge=Ge[1],h.I==2)if(Ge[0]=="c"){h.M=Ge[1],h.ba=Ge[2];let La=Ge[3];La!=null&&(h.ka=La,h.j.info("VER="+h.ka));let zs=Ge[4];zs!=null&&(h.za=zs,h.j.info("SVER="+h.za));let Yr=Ge[5];Yr!=null&&typeof Yr=="number"&&Yr>0&&(y=1.5*Yr,h.O=y,h.j.info("backChannelRequestTimeoutMs_="+y)),y=h;let $r=o.g;if($r){let md=$r.g?$r.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(md){var P=y.h;P.g||md.indexOf("spdy")==-1&&md.indexOf("quic")==-1&&md.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(Ni(P,P.h),P.h=null))}if(y.G){let tm=$r.g?$r.g.getResponseHeader("X-HTTP-Session-Id"):null;tm&&(y.wa=tm,ee(y.J,y.G,tm))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),y=h;var G=o;if(y.na=$v(y,y.L?y.ba:null,y.W),G.L){id(y.h,G);var me=G,Ft=y.O;Ft&&(me.H=Ft),me.D&&(Pi(me),Fs(me)),y.g=G}else Kv(y);h.i.length>0&&fd(h)}else Ge[0]!="stop"&&Ge[0]!="close"||qs(h,7);else h.I==3&&(Ge[0]=="stop"||Ge[0]=="close"?Ge[0]=="stop"?qs(h,7):Jp(h):Ge[0]!="noop"&&h.l&&h.l.qa(Ge),h.A=0)}}jt(4)}catch{}}var sd=class{constructor(o,d){this.g=o,this.map=d}};function ku(o){this.l=o||10,i.PerformanceNavigationTiming?(o=i.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function Du(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Pu(o){return o.h?1:o.g?o.g.size:0}function Mi(o,d){return o.h?o.h==d:o.g?o.g.has(d):!1}function Ni(o,d){o.g?o.g.add(d):o.h=d}function id(o,d){o.h&&o.h==d?o.h=null:o.g&&o.g.has(d)&&o.g.delete(d)}ku.prototype.cancel=function(){if(this.i=Vi(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function Vi(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let d=o.i;for(let h of o.g.values())d=d.concat(h.G);return d}return _(o.i)}var od=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Yp(o,d){if(o){o=o.split("&");for(let h=0;h<o.length;h++){let y=o[h].indexOf("="),k,P=null;y>=0?(k=o[h].substring(0,y),P=o[h].substring(y+1)):k=o[h],d(k,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function U(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;o instanceof U?(this.l=o.l,W(this,o.j),this.o=o.o,this.g=o.g,be(this,o.u),this.h=o.h,ye(this,Mv(o.i)),this.m=o.m):o&&(d=String(o).match(od))?(this.l=!1,W(this,d[1]||"",!0),this.o=_t(d[2]||""),this.g=_t(d[3]||"",!0),be(this,d[4]),this.h=_t(d[5]||"",!0),ye(this,d[6]||"",!0),this.m=_t(d[7]||"")):(this.l=!1,this.i=new Mu(null,this.l))}U.prototype.toString=function(){let o=[];var d=this.j;d&&o.push(St(d,Rv,!0),":");var h=this.g;return(h||d=="file")&&(o.push("//"),(d=this.o)&&o.push(St(d,Rv,!0),"@"),o.push(An(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(St(h,h.charAt(0)=="/"?L1:C1,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",St(h,x1)),o.join("")},U.prototype.resolve=function(o){let d=K(this),h=!!o.j;h?W(d,o.j):h=!!o.o,h?d.o=o.o:h=!!o.g,h?d.g=o.g:h=o.u!=null;var y=o.h;if(h)be(d,o.u);else if(h=!!o.h){if(y.charAt(0)!="/")if(this.g&&!this.h)y="/"+y;else{var k=d.h.lastIndexOf("/");k!=-1&&(y=d.h.slice(0,k+1)+y)}if(k=y,k==".."||k==".")y="";else if(k.indexOf("./")!=-1||k.indexOf("/.")!=-1){y=k.lastIndexOf("/",0)==0,k=k.split("/");let P=[];for(let G=0;G<k.length;){let me=k[G++];me=="."?y&&G==k.length&&P.push(""):me==".."?((P.length>1||P.length==1&&P[0]!="")&&P.pop(),y&&G==k.length&&P.push("")):(P.push(me),y=!0)}y=P.join("/")}else y=k}return h?d.h=y:h=o.i.toString()!=="",h?ye(d,Mv(o.i)):h=!!o.m,h&&(d.m=o.m),d};function K(o){return new U(o)}function W(o,d,h){o.j=h?_t(d,!0):d,o.j&&(o.j=o.j.replace(/:$/,""))}function be(o,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);o.u=d}else o.u=null}function ye(o,d,h){d instanceof Mu?(o.i=d,R1(o.i,o.l)):(h||(d=St(d,A1)),o.i=new Mu(d,o.l))}function ee(o,d,h){o.i.set(d,h)}function Ie(o){return ee(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function _t(o,d){return o?d?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function St(o,d,h){return typeof o=="string"?(o=encodeURI(o).replace(d,Ou),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function Ou(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var Rv=/[#\/\?@]/g,C1=/[#\?:]/g,L1=/[#\?]/g,A1=/[#\?@]/g,x1=/#/g;function Mu(o,d){this.h=this.g=null,this.i=o||null,this.j=!!d}function Bs(o){o.g||(o.g=new Map,o.h=0,o.i&&Yp(o.i,function(d,h){o.add(decodeURIComponent(d.replace(/\+/g," ")),h)}))}t=Mu.prototype,t.add=function(o,d){Bs(this),this.i=null,o=Ui(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(d),this.h+=1,this};function kv(o,d){Bs(o),d=Ui(o,d),o.g.has(d)&&(o.i=null,o.h-=o.g.get(d).length,o.g.delete(d))}function Dv(o,d){return Bs(o),d=Ui(o,d),o.g.has(d)}t.forEach=function(o,d){Bs(this),this.g.forEach(function(h,y){h.forEach(function(k){o.call(d,k,y,this)},this)},this)};function Pv(o,d){Bs(o);let h=[];if(typeof d=="string")Dv(o,d)&&(h=h.concat(o.g.get(Ui(o,d))));else for(o=Array.from(o.g.values()),d=0;d<o.length;d++)h=h.concat(o[d]);return h}t.set=function(o,d){return Bs(this),this.i=null,o=Ui(this,o),Dv(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[d]),this.h+=1,this},t.get=function(o,d){return o?(o=Pv(this,o),o.length>0?String(o[0]):d):d};function Ov(o,d,h){kv(o,d),h.length>0&&(o.i=null,o.g.set(Ui(o,d),_(h)),o.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],d=Array.from(this.g.keys());for(let y=0;y<d.length;y++){var h=d[y];let k=An(h);h=Pv(this,h);for(let P=0;P<h.length;P++){let G=k;h[P]!==""&&(G+="="+An(h[P])),o.push(G)}}return this.i=o.join("&")};function Mv(o){let d=new Mu;return d.i=o.i,o.g&&(d.g=new Map(o.g),d.h=o.h),d}function Ui(o,d){return d=String(d),o.j&&(d=d.toLowerCase()),d}function R1(o,d){d&&!o.j&&(Bs(o),o.i=null,o.g.forEach(function(h,y){let k=y.toLowerCase();y!=k&&(kv(this,y),Ov(this,k,h))},o)),o.j=d}function k1(o,d){let h=new rr;if(i.Image){let y=new Image;y.onload=f(Xr,h,"TestLoadImage: loaded",!0,d,y),y.onerror=f(Xr,h,"TestLoadImage: error",!1,d,y),y.onabort=f(Xr,h,"TestLoadImage: abort",!1,d,y),y.ontimeout=f(Xr,h,"TestLoadImage: timeout",!1,d,y),i.setTimeout(function(){y.ontimeout&&y.ontimeout()},1e4),y.src=o}else d(!1)}function D1(o,d){let h=new rr,y=new AbortController,k=setTimeout(()=>{y.abort(),Xr(h,"TestPingServer: timeout",!1,d)},1e4);fetch(o,{signal:y.signal}).then(P=>{clearTimeout(k),P.ok?Xr(h,"TestPingServer: ok",!0,d):Xr(h,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(k),Xr(h,"TestPingServer: error",!1,d)})}function Xr(o,d,h,y,k){try{k&&(k.onload=null,k.onerror=null,k.onabort=null,k.ontimeout=null),y(h)}catch{}}function P1(){this.g=new hn}function ud(o){this.i=o.Sb||null,this.h=o.ab||!1}m(ud,It),ud.prototype.g=function(){return new ld(this.i,this.h)};function ld(o,d){ge.call(this),this.H=o,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}m(ld,ge),t=ld.prototype,t.open=function(o,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=d,this.readyState=1,Vu(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(d.body=o),(this.H||i).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Nu(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Vu(this)),this.g&&(this.readyState=3,Vu(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof i.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Nv(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Nv(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var d=o.value?o.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!o.done}))&&(this.response=this.responseText+=d)}o.done?Nu(this):Vu(this),this.readyState==3&&Nv(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,Nu(this))},t.Na=function(o){this.g&&(this.response=o,Nu(this))},t.ga=function(){this.g&&Nu(this)};function Nu(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Vu(o)}t.setRequestHeader=function(o,d){this.A.append(o,d)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],d=this.h.entries();for(var h=d.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=d.next();return o.join(`\r
`)};function Vu(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(ld.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Vv(o){let d="";return F(o,function(h,y){d+=y,d+=":",d+=h,d+=`\r
`}),d}function $p(o,d,h){e:{for(y in h){var y=!1;break e}y=!0}y||(h=Vv(h),typeof o=="string"?h!=null&&An(h):ee(o,d,h))}function vt(o){ge.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}m(vt,ge);var O1=/^https?$/i,M1=["POST","PUT"];t=vt.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,d,h,y){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);d=d?d.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():mn.g(),this.g.onreadystatechange=p(c(this.Ca,this));try{this.B=!0,this.g.open(d,String(o),!0),this.B=!1}catch(P){Uv(this,P);return}if(o=h||"",h=new Map(this.headers),y)if(Object.getPrototypeOf(y)===Object.prototype)for(var k in y)h.set(k,y[k]);else if(typeof y.keys=="function"&&typeof y.get=="function")for(let P of y.keys())h.set(P,y.get(P));else throw Error("Unknown input type for opt_headers: "+String(y));y=Array.from(h.keys()).find(P=>P.toLowerCase()=="content-type"),k=i.FormData&&o instanceof i.FormData,!(Array.prototype.indexOf.call(M1,d,void 0)>=0)||y||k||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[P,G]of h)this.g.setRequestHeader(P,G);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(P){Uv(this,P)}};function Uv(o,d){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=d,o.o=5,Fv(o),cd(o)}function Fv(o){o.A||(o.A=!0,Te(o,"complete"),Te(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,Te(this,"complete"),Te(this,"abort"),cd(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),cd(this,!0)),vt.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?Bv(this):this.Xa())},t.Xa=function(){Bv(this)};function Bv(o){if(o.h&&typeof s<"u"){if(o.v&&Qr(o)==4)setTimeout(o.Ca.bind(o),0);else if(Te(o,"readystatechange"),Qr(o)==4){o.h=!1;try{let P=o.ca();e:switch(P){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var h;if(!(h=d)){var y;if(y=P===0){let G=String(o.D).match(od)[1]||null;!G&&i.self&&i.self.location&&(G=i.self.location.protocol.slice(0,-1)),y=!O1.test(G?G.toLowerCase():"")}h=y}if(h)Te(o,"complete"),Te(o,"success");else{o.o=6;try{var k=Qr(o)>2?o.g.statusText:""}catch{k=""}o.l=k+" ["+o.ca()+"]",Fv(o)}}finally{cd(o)}}}}function cd(o,d){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let h=o.g;o.g=null,d||Te(o,"ready");try{h.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function Qr(o){return o.g?o.g.readyState:0}t.ca=function(){try{return Qr(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var d=this.g.responseText;return o&&d.indexOf(o)==0&&(d=d.substring(o.length)),tt(d)}};function qv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function N1(o){let d={};o=(o.g&&Qr(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let y=0;y<o.length;y++){if(E(o[y]))continue;var h=ad(o[y]);let k=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();let P=d[k]||[];d[k]=P,P.push(h)}J(d,function(y){return y.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Uu(o,d,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||d}function zv(o){this.za=0,this.i=[],this.j=new rr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Uu("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Uu("baseRetryDelayMs",5e3,o),this.Za=Uu("retryDelaySeedMs",1e4,o),this.Ta=Uu("forwardChannelMaxRetries",2,o),this.va=Uu("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new ku(o&&o.concurrentRequestLimit),this.Ba=new P1,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=zv.prototype,t.ka=8,t.I=1,t.connect=function(o,d,h,y){Kt(0),this.W=o,this.H=d||{},h&&y!==void 0&&(this.H.OSID=h,this.H.OAID=y),this.F=this.X,this.J=$v(this,null,this.W),fd(this)};function Jp(o){if(Hv(o),o.I==3){var d=o.V++,h=K(o.J);if(ee(h,"SID",o.M),ee(h,"RID",d),ee(h,"TYPE","terminate"),Fu(o,h),d=new Hn(o,o.j,d),d.M=2,d.A=Ie(K(h)),h=!1,i.navigator&&i.navigator.sendBeacon)try{h=i.navigator.sendBeacon(d.A.toString(),"")}catch{}!h&&i.Image&&(new Image().src=d.A,h=!0),h||(d.g=Jv(d.j,null),d.g.ea(d.A)),d.F=Date.now(),Fs(d)}Yv(o)}function dd(o){o.g&&(em(o),o.g.cancel(),o.g=null)}function Hv(o){dd(o),o.v&&(i.clearTimeout(o.v),o.v=null),hd(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&i.clearTimeout(o.m),o.m=null)}function fd(o){if(!Du(o.h)&&!o.m){o.m=!0;var d=o.Ea;H||g(),j||(H(),j=!0),S.add(d,o),o.D=0}}function V1(o,d){return Pu(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=d.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=ar(c(o.Ea,o,d),Qv(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let k=new Hn(this,this.j,o),P=this.o;if(this.U&&(P?(P=Y(P),$e(P,this.U)):P=this.U),this.u!==null||this.R||(k.J=P,P=null),this.S)e:{for(var d=0,h=0;h<this.i.length;h++){t:{var y=this.i[h];if("__data__"in y.map&&(y=y.map.__data__,typeof y=="string")){y=y.length;break t}y=void 0}if(y===void 0)break;if(d+=y,d>4096){d=h;break e}if(d===4096||h===this.i.length-1){d=h+1;break e}}d=1e3}else d=1e3;d=jv(this,k,d),h=K(this.J),ee(h,"RID",o),ee(h,"CVER",22),this.G&&ee(h,"X-HTTP-Session-Id",this.G),Fu(this,h),P&&(this.R?d="headers="+An(Vv(P))+"&"+d:this.u&&$p(h,this.u,P)),Ni(this.h,k),this.Ra&&ee(h,"TYPE","init"),this.S?(ee(h,"$req",d),ee(h,"SID","null"),k.U=!0,Di(k,h,null)):Di(k,h,d),this.I=2}}else this.I==3&&(o?Gv(this,o):this.i.length==0||Du(this.h)||Gv(this))};function Gv(o,d){var h;d?h=d.l:h=o.V++;let y=K(o.J);ee(y,"SID",o.M),ee(y,"RID",h),ee(y,"AID",o.K),Fu(o,y),o.u&&o.o&&$p(y,o.u,o.o),h=new Hn(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),d&&(o.i=d.G.concat(o.i)),d=jv(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Ni(o.h,h),Di(h,y,d)}function Fu(o,d){o.H&&F(o.H,function(h,y){ee(d,y,h)}),o.l&&F({},function(h,y){ee(d,y,h)})}function jv(o,d,h){h=Math.min(o.i.length,h);let y=o.l?c(o.l.Ka,o.l,o):null;e:{var k=o.i;let me=-1;for(;;){let Ft=["count="+h];me==-1?h>0?(me=k[0].g,Ft.push("ofs="+me)):me=0:Ft.push("ofs="+me);let Ge=!0;for(let Wt=0;Wt<h;Wt++){var P=k[Wt].g;let La=k[Wt].map;if(P-=me,P<0)me=Math.max(0,k[Wt].g-100),Ge=!1;else try{P="req"+P+"_"||"";try{var G=La instanceof Map?La:Object.entries(La);for(let[zs,Yr]of G){let $r=Yr;u(Yr)&&($r=yt(Yr)),Ft.push(P+zs+"="+encodeURIComponent($r))}}catch(zs){throw Ft.push(P+"type="+encodeURIComponent("_badmap")),zs}}catch{y&&y(La)}}if(Ge){G=Ft.join("&");break e}}G=void 0}return o=o.i.splice(0,h),d.G=o,G}function Kv(o){if(!o.g&&!o.v){o.Y=1;var d=o.Da;H||g(),j||(H(),j=!0),S.add(d,o),o.A=0}}function Zp(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=ar(c(o.Da,o),Qv(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,Wv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=ar(c(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,Kt(10),dd(this),Wv(this))};function em(o){o.B!=null&&(i.clearTimeout(o.B),o.B=null)}function Wv(o){o.g=new Hn(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var d=K(o.na);ee(d,"RID","rpc"),ee(d,"SID",o.M),ee(d,"AID",o.K),ee(d,"CI",o.F?"0":"1"),!o.F&&o.ia&&ee(d,"TO",o.ia),ee(d,"TYPE","xmlhttp"),Fu(o,d),o.u&&o.o&&$p(d,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=Ie(K(d)),h.u=null,h.R=!0,xu(h,o)}t.Va=function(){this.C!=null&&(this.C=null,dd(this),Zp(this),Kt(19))};function hd(o){o.C!=null&&(i.clearTimeout(o.C),o.C=null)}function Xv(o,d){var h=null;if(o.g==d){hd(o),em(o),o.g=null;var y=2}else if(Mi(o.h,d))h=d.G,id(o.h,d),y=1;else return;if(o.I!=0){if(d.o)if(y==1){h=d.u?d.u.length:0,d=Date.now()-d.F;var k=o.D;y=ga(),Te(y,new pn(y,h)),fd(o)}else Kv(o);else if(k=d.m,k==3||k==0&&d.X>0||!(y==1&&V1(o,d)||y==2&&Zp(o)))switch(h&&h.length>0&&(d=o.h,d.i=d.i.concat(h)),k){case 1:qs(o,5);break;case 4:qs(o,10);break;case 3:qs(o,6);break;default:qs(o,2)}}}function Qv(o,d){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*d}function qs(o,d){if(o.j.info("Error code "+d),d==2){var h=c(o.bb,o),y=o.Ua;let k=!y;y=new U(y||"//www.google.com/images/cleardot.gif"),i.location&&i.location.protocol=="http"||W(y,"https"),Ie(y),k?k1(y.toString(),h):D1(y.toString(),h)}else Kt(2);o.I=0,o.l&&o.l.pa(d),Yv(o),Hv(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),Kt(2)):(this.j.info("Failed to ping google.com"),Kt(1))};function Yv(o){if(o.I=0,o.ja=[],o.l){let d=Vi(o.h);(d.length!=0||o.i.length!=0)&&(R(o.ja,d),R(o.ja,o.i),o.h.i.length=0,_(o.i),o.i.length=0),o.l.oa()}}function $v(o,d,h){var y=h instanceof U?K(h):new U(h);if(y.g!="")d&&(y.g=d+"."+y.g),be(y,y.u);else{var k=i.location;y=k.protocol,d=d?d+"."+k.hostname:k.hostname,k=+k.port;let P=new U(null);y&&W(P,y),d&&(P.g=d),k&&be(P,k),h&&(P.h=h),y=P}return h=o.G,d=o.wa,h&&d&&ee(y,h,d),ee(y,"VER",o.ka),Fu(o,y),y}function Jv(o,d,h){if(d&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=o.Aa&&!o.ma?new vt(new ud({ab:h})):new vt(o.ma),d.Fa(o.L),d}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function Zv(){}t=Zv.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function pd(){}pd.prototype.g=function(o,d){return new Gn(o,d)};function Gn(o,d){ge.call(this),this.g=new zv(d),this.l=o,this.h=d&&d.messageUrlParams||null,o=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(o?o["X-WebChannel-Content-Type"]=d.messageContentType:o={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(o?o["X-WebChannel-Client-Profile"]=d.sa:o={"X-WebChannel-Client-Profile":d.sa}),this.g.U=o,(o=d&&d.Qb)&&!E(o)&&(this.g.u=o),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!E(d)&&(this.g.G=d,o=this.h,o!==null&&d in o&&(o=this.h,d in o&&delete o[d])),this.j=new Fi(this)}m(Gn,ge),Gn.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Gn.prototype.close=function(){Jp(this.g)},Gn.prototype.o=function(o){var d=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=yt(o),o=h);d.i.push(new sd(d.Ya++,o)),d.I==3&&fd(d)},Gn.prototype.N=function(){this.g.l=null,delete this.j,Jp(this.g),delete this.g,Gn.Z.N.call(this)};function eT(o){He.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var d=o.__sm__;if(d){e:{for(let h in d){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,d=d!==null&&o in d?d[o]:void 0),this.data=d}else this.data=o}m(eT,He);function tT(){pe.call(this),this.status=1}m(tT,pe);function Fi(o){this.g=o}m(Fi,Zv),Fi.prototype.ra=function(){Te(this.g,"a")},Fi.prototype.qa=function(o){Te(this.g,new eT(o))},Fi.prototype.pa=function(o){Te(this.g,new tT)},Fi.prototype.oa=function(){Te(this.g,"b")},pd.prototype.createWebChannel=pd.prototype.g,Gn.prototype.send=Gn.prototype.o,Gn.prototype.open=Gn.prototype.m,Gn.prototype.close=Gn.prototype.close,s_=kr.createWebChannelTransport=function(){return new pd},r_=kr.getStatEventTarget=function(){return ga()},a_=kr.Event=it,Fh=kr.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},Us.NO_ERROR=0,Us.TIMEOUT=8,Us.HTTP_ERROR=6,uc=kr.ErrorCode=Us,qn.COMPLETE="complete",n_=kr.EventType=qn,Ln.EventType=sn,sn.OPEN="a",sn.CLOSE="b",sn.ERROR="c",sn.MESSAGE="d",ge.prototype.listen=ge.prototype.J,zo=kr.WebChannel=Ln,wN=kr.FetchXmlHttpFactory=ud,vt.prototype.listenOnce=vt.prototype.K,vt.prototype.getLastError=vt.prototype.Ha,vt.prototype.getLastErrorCode=vt.prototype.ya,vt.prototype.getStatus=vt.prototype.ca,vt.prototype.getResponseJson=vt.prototype.La,vt.prototype.getResponseText=vt.prototype.la,vt.prototype.send=vt.prototype.ea,vt.prototype.setWithCredentials=vt.prototype.Fa,t_=kr.XhrIo=vt}).apply(typeof Uh<"u"?Uh:typeof self<"u"?self:typeof window<"u"?window:{});var en=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};en.UNAUTHENTICATED=new en(null),en.GOOGLE_CREDENTIALS=new en("google-credentials-uid"),en.FIRST_PARTY=new en("first-party-uid"),en.MOCK_USER=new en("mock-user");var du="12.10.0";function Qx(t){du=t}var Ei=new Cs("@firebase/firestore");function Ho(){return Ei.logLevel}function $(t,...e){if(Ei.logLevel<=Se.DEBUG){let n=e.map(PS);Ei.debug(`Firestore (${du}): ${t}`,...n)}}function Or(t,...e){if(Ei.logLevel<=Se.ERROR){let n=e.map(PS);Ei.error(`Firestore (${du}): ${t}`,...n)}}function Mr(t,...e){if(Ei.logLevel<=Se.WARN){let n=e.map(PS);Ei.warn(`Firestore (${du}): ${t}`,...n)}}function PS(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}function oe(t,e,n){let a="Unexpected state";typeof e=="string"?a=e:n=e,Yx(t,a,n)}function Yx(t,e,n){let a=`FIRESTORE (${du}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{a+=" CONTEXT: "+JSON.stringify(n)}catch{a+=" CONTEXT: "+n}throw Or(a),new Error(a)}function ht(t,e,n,a){let r="Unexpected state";typeof n=="string"?r=n:a=n,t||Yx(e,r,a)}function ke(t,e){return t}var B={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},Q=class extends wn{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var Dr=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};var jh=class{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Kh=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(en.UNAUTHENTICATED))}shutdown(){}},f_=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}},Wh=class{constructor(e){this.t=e,this.currentUser=en.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){ht(this.o===void 0,42304);let a=this.i,r=l=>this.i!==a?(a=this.i,n(l)):Promise.resolve(),s=new Dr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Dr,e.enqueueRetryable(()=>r(this.currentUser))};let i=()=>{let l=s;e.enqueueRetryable(async()=>{await l.promise,await r(this.currentUser)})},u=l=>{$("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=l,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(l=>u(l)),setTimeout(()=>{if(!this.auth){let l=this.t.getImmediate({optional:!0});l?u(l):($("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Dr)}},0),i()}getToken(){let e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(a=>this.i!==e?($("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):a?(ht(typeof a.accessToken=="string",31837,{l:a}),new jh(a.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return ht(e===null||typeof e=="string",2055,{h:e}),new en(e)}},h_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a,this.type="FirstParty",this.user=en.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},p_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a}getToken(){return Promise.resolve(new h_(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(en.FIRST_PARTY))}shutdown(){}invalidateToken(){}},Xh=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},Qh=class{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Fn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){ht(this.o===void 0,3512);let a=s=>{s.error!=null&&$("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);let i=s.token!==this.m;return this.m=s.token,$("FirebaseAppCheckTokenProvider",`Received ${i?"new":"existing"} token.`),i?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>a(s))};let r=s=>{$("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>r(s)),setTimeout(()=>{if(!this.appCheck){let s=this.V.getImmediate({optional:!0});s?r(s):$("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Xh(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(ht(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Xh(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function CN(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let a=0;a<t;a++)n[a]=Math.floor(256*Math.random());return n}var $o=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516),a="";for(;a.length<20;){let r=CN(40);for(let s=0;s<r.length;++s)a.length<20&&r[s]<n&&(a+=e.charAt(r[s]%62))}return a}};function Ae(t,e){return t<e?-1:t>e?1:0}function m_(t,e){let n=Math.min(t.length,e.length);for(let a=0;a<n;a++){let r=t.charAt(a),s=e.charAt(a);if(r!==s)return i_(r)===i_(s)?Ae(r,s):i_(r)?1:-1}return Ae(t.length,e.length)}var LN=55296,AN=57343;function i_(t){let e=t.charCodeAt(0);return e>=LN&&e<=AN}function Jo(t,e,n){return t.length===e.length&&t.every((a,r)=>n(a,e[r]))}var cx="__name__",Yh=class t{constructor(e,n,a){n===void 0?n=0:n>e.length&&oe(637,{offset:n,range:e.length}),a===void 0?a=e.length-n:a>e.length-n&&oe(1746,{length:a,range:e.length-n}),this.segments=e,this.offset=n,this.len=a}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let n=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(a=>{n.push(a)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,a=this.limit();n<a;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){let a=Math.min(e.length,n.length);for(let r=0;r<a;r++){let s=t.compareSegments(e.get(r),n.get(r));if(s!==0)return s}return Ae(e.length,n.length)}static compareSegments(e,n){let a=t.isNumericId(e),r=t.isNumericId(n);return a&&!r?-1:!a&&r?1:a&&r?t.extractNumericId(e).compare(t.extractNumericId(n)):m_(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return Rr.fromString(e.substring(4,e.length-2))}},ct=class t extends Yh{construct(e,n,a){return new t(e,n,a)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let n=[];for(let a of e){if(a.indexOf("//")>=0)throw new Q(B.INVALID_ARGUMENT,`Invalid segment (${a}). Paths must not contain // in them.`);n.push(...a.split("/").filter(r=>r.length>0))}return new t(n)}static emptyPath(){return new t([])}},xN=/^[_a-zA-Z][_a-zA-Z0-9]*$/,ta=class t extends Yh{construct(e,n,a){return new t(e,n,a)}static isValidIdentifier(e){return xN.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===cx}static keyField(){return new t([cx])}static fromServerFormat(e){let n=[],a="",r=0,s=()=>{if(a.length===0)throw new Q(B.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(a),a=""},i=!1;for(;r<e.length;){let u=e[r];if(u==="\\"){if(r+1===e.length)throw new Q(B.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let l=e[r+1];if(l!=="\\"&&l!=="."&&l!=="`")throw new Q(B.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);a+=l,r+=2}else u==="`"?(i=!i,r++):u!=="."||i?(a+=u,r++):(s(),r++)}if(s(),i)throw new Q(B.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(n)}static emptyPath(){return new t([])}};var ne=class t{constructor(e){this.path=e}static fromPath(e){return new t(ct.fromString(e))}static fromName(e){return new t(ct.fromString(e).popFirst(5))}static empty(){return new t(ct.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&ct.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return ct.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new ct(e.slice()))}};function RN(t,e,n){if(!n)throw new Q(B.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function $x(t,e,n,a){if(e===!0&&a===!0)throw new Q(B.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function dx(t){if(ne.isDocumentKey(t))throw new Q(B.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function Jx(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function Dc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(a){return a.constructor?a.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":oe(12329,{type:typeof t})}function Pc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new Q(B.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let n=Dc(t);throw new Q(B.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function Zx(t,e){if(e<=0)throw new Q(B.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function Lt(t,e){let n={typeString:t};return e&&(n.value=e),n}function fu(t,e){if(!Jx(t))throw new Q(B.INVALID_ARGUMENT,"JSON must be an object");let n;for(let a in e)if(e[a]){let r=e[a].typeString,s="value"in e[a]?{value:e[a].value}:void 0;if(!(a in t)){n=`JSON missing required field: '${a}'`;break}let i=t[a];if(r&&typeof i!==r){n=`JSON field '${a}' must be a ${r}.`;break}if(s!==void 0&&i!==s.value){n=`Expected '${a}' field to equal '${s.value}'`;break}}if(n)throw new Q(B.INVALID_ARGUMENT,n);return!0}var fx=-62135596800,hx=1e6,Mt=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let n=Math.floor(e/1e3),a=Math.floor((e-1e3*n)*hx);return new t(n,a)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new Q(B.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new Q(B.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<fx)throw new Q(B.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new Q(B.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/hx}_compareTo(e){return this.seconds===e.seconds?Ae(this.nanoseconds,e.nanoseconds):Ae(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(fu(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-fx;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};Mt._jsonSchemaVersion="firestore/timestamp/1.0",Mt._jsonSchema={type:Lt("string",Mt._jsonSchemaVersion),seconds:Lt("number"),nanoseconds:Lt("number")};var de=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new Mt(0,0))}static max(){return new t(new Mt(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var pc=-1,$h=class{constructor(e,n,a,r){this.indexId=e,this.collectionGroup=n,this.fields=a,this.indexState=r}};$h.UNKNOWN_ID=-1;function kN(t,e){let n=t.toTimestamp().seconds,a=t.toTimestamp().nanoseconds+1,r=de.fromTimestamp(a===1e9?new Mt(n+1,0):new Mt(n,a));return new wi(r,ne.empty(),e)}function DN(t){return new wi(t.readTime,t.key,pc)}var wi=class t{constructor(e,n,a){this.readTime=e,this.documentKey=n,this.largestBatchId=a}static min(){return new t(de.min(),ne.empty(),pc)}static max(){return new t(de.max(),ne.empty(),pc)}};function PN(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ne.comparator(t.documentKey,e.documentKey),n!==0?n:Ae(t.largestBatchId,e.largestBatchId))}var ON="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",g_=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function Tp(t){if(t.code!==B.FAILED_PRECONDITION||t.message!==ON)throw t;$("LocalStore","Unexpectedly lost primary lease")}var z=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&oe(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new t((a,r)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(a,r)},this.catchCallback=s=>{this.wrapFailure(n,s).next(a,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{let n=e();return n instanceof t?n:t.resolve(n)}catch(n){return t.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):t.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):t.reject(n)}static resolve(e){return new t((n,a)=>{n(e)})}static reject(e){return new t((n,a)=>{a(e)})}static waitFor(e){return new t((n,a)=>{let r=0,s=0,i=!1;e.forEach(u=>{++r,u.next(()=>{++s,i&&s===r&&n()},l=>a(l))}),i=!0,s===r&&n()})}static or(e){let n=t.resolve(!1);for(let a of e)n=n.next(r=>r?t.resolve(r):a());return n}static forEach(e,n){let a=[];return e.forEach((r,s)=>{a.push(n.call(this,r,s))}),this.waitFor(a)}static mapArray(e,n){return new t((a,r)=>{let s=e.length,i=new Array(s),u=0;for(let l=0;l<s;l++){let c=l;n(e[c]).next(f=>{i[c]=f,++u,u===s&&a(i)},f=>r(f))}})}static doWhile(e,n){return new t((a,r)=>{let s=()=>{e()===!0?n().next(()=>{s()},r):a()};s()})}};function MN(t){let e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function hu(t){return t.name==="IndexedDbTransactionError"}var Zo=class{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=a=>this.ae(a),this.ue=a=>n.writeSequenceNumber(a))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};Zo.ce=-1;var NN=-1;function bp(t){return t==null}function mc(t){return t===0&&1/t==-1/0}function VN(t){return typeof t=="number"&&Number.isInteger(t)&&!mc(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var e0="";function UN(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=px(e)),e=FN(t.get(n),e);return px(e)}function FN(t,e){let n=e,a=t.length;for(let r=0;r<a;r++){let s=t.charAt(r);switch(s){case"\0":n+="";break;case e0:n+="";break;default:n+=s}}return n}function px(t){return t+e0+""}var BN="remoteDocuments",t0="owner";var n0="mutationQueues";var a0="mutations";var r0="documentMutations",qN="remoteDocumentsV14";var s0="remoteDocumentGlobal";var i0="targets";var o0="targetDocuments";var u0="targetGlobal",l0="collectionParents";var c0="clientMetadata";var d0="bundles";var f0="namedQueries";var zN="indexConfiguration";var HN="indexState";var GN="indexEntries";var h0="documentOverlays";var jN="globals";var KN=[n0,a0,r0,BN,i0,t0,u0,o0,c0,s0,l0,d0,f0],E4=[...KN,h0],WN=[n0,a0,r0,qN,i0,t0,u0,o0,c0,s0,l0,d0,f0,h0],XN=WN,QN=[...XN,zN,HN,GN];var w4=[...QN,jN];function mx(t){let e=0;for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function pu(t,e){for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function p0(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var At=class t{constructor(e,n){this.comparator=e,this.root=n||Ga.EMPTY}insert(e,n){return new t(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,Ga.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,Ga.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){let a=this.comparator(e,n.key);if(a===0)return n.value;a<0?n=n.left:a>0&&(n=n.right)}return null}indexOf(e){let n=0,a=this.root;for(;!a.isEmpty();){let r=this.comparator(e,a.key);if(r===0)return n+a.left.size;r<0?a=a.left:(n+=a.left.size+1,a=a.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,a)=>(e(n,a),!1))}toString(){let e=[];return this.inorderTraversal((n,a)=>(e.push(`${n}:${a}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Wo(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Wo(this.root,e,this.comparator,!1)}getReverseIterator(){return new Wo(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Wo(this.root,e,this.comparator,!0)}},Wo=class{constructor(e,n,a,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?a(e.key,n):1,n&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},Ga=class t{constructor(e,n,a,r,s){this.key=e,this.value=n,this.color=a??t.RED,this.left=r??t.EMPTY,this.right=s??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,a,r,s){return new t(e??this.key,n??this.value,a??this.color,r??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,a){let r=this,s=a(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,n,a),null):s===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,a)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let a,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;a=r.right.min(),r=r.copy(a.key,a.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw oe(43730,{key:this.key,value:this.value});if(this.right.isRed())throw oe(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw oe(27949);return e+(this.isRed()?0:1)}};Ga.EMPTY=null,Ga.RED=!0,Ga.BLACK=!1;Ga.EMPTY=new class{constructor(){this.size=0}get key(){throw oe(57766)}get value(){throw oe(16141)}get color(){throw oe(16727)}get left(){throw oe(29726)}get right(){throw oe(36894)}copy(e,n,a,r,s){return this}insert(e,n,a){return new Ga(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var tn=class t{constructor(e){this.comparator=e,this.data=new At(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,a)=>(e(n),!1))}forEachInRange(e,n){let a=this.data.getIteratorFrom(e[0]);for(;a.hasNext();){let r=a.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let a;for(a=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();a.hasNext();)if(!e(a.getNext().key))return}firstAfterOrEqual(e){let n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new Jh(this.data.getIterator())}getIteratorFrom(e){return new Jh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(a=>{n=n.add(a)}),n}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.data.getIterator(),a=e.data.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(this.comparator(r,s)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(n=>{e.push(n)}),e}toString(){let e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){let n=new t(this.comparator);return n.data=e,n}},Jh=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var _i=class t{constructor(e){this.fields=e,e.sort(ta.comparator)}static empty(){return new t([])}unionWith(e){let n=new tn(ta.comparator);for(let a of this.fields)n=n.add(a);for(let a of e)n=n.add(a);return new t(n.toArray())}covers(e){for(let n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return Jo(this.fields,e.fields,(n,a)=>n.isEqual(a))}};var Zh=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var fn=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let n=function(r){try{return atob(r)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new Zh("Invalid base64 string: "+s):s}}(e);return new t(n)}static fromUint8Array(e){let n=function(r){let s="";for(let i=0;i<r.length;++i)s+=String.fromCharCode(r[i]);return s}(e);return new t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ae(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};fn.EMPTY_BYTE_STRING=new fn("");var YN=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Nr(t){if(ht(!!t,39018),typeof t=="string"){let e=0,n=YN.exec(t);if(ht(!!n,46558,{timestamp:t}),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}let a=new Date(t);return{seconds:Math.floor(a.getTime()/1e3),nanos:e}}return{seconds:lt(t.seconds),nanos:lt(t.nanos)}}function lt(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Vr(t){return typeof t=="string"?fn.fromBase64String(t):fn.fromUint8Array(t)}var m0="server_timestamp",g0="__type__",y0="__previous_value__",I0="__local_write_time__";function Oc(t){return(t?.mapValue?.fields||{})[g0]?.stringValue===m0}function Ep(t){let e=t.mapValue.fields[y0];return Oc(e)?Ep(e):e}function gc(t){let e=Nr(t.mapValue.fields[I0].timestampValue);return new Mt(e.seconds,e.nanos)}var y_=class{constructor(e,n,a,r,s,i,u,l,c,f,m){this.databaseId=e,this.appId=n,this.persistenceKey=a,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=u,this.longPollingOptions=l,this.useFetchStreams=c,this.isUsingEmulator=f,this.apiKey=m}},ep="(default)",yc=class t{constructor(e,n){this.projectId=e,this.database=n||ep}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===ep}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function _0(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new Q(B.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new yc(t.options.projectId,e)}var OS="__type__",S0="__max__",Bh={mapValue:{fields:{__type__:{stringValue:S0}}}},MS="__vector__",eu="value";function Rs(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Oc(t)?4:T0(t)?9007199254740991:v0(t)?10:11:oe(28295,{value:t})}function Xa(t,e){if(t===e)return!0;let n=Rs(t);if(n!==Rs(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return gc(t).isEqual(gc(e));case 3:return function(r,s){if(typeof r.timestampValue=="string"&&typeof s.timestampValue=="string"&&r.timestampValue.length===s.timestampValue.length)return r.timestampValue===s.timestampValue;let i=Nr(r.timestampValue),u=Nr(s.timestampValue);return i.seconds===u.seconds&&i.nanos===u.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,s){return Vr(r.bytesValue).isEqual(Vr(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,s){return lt(r.geoPointValue.latitude)===lt(s.geoPointValue.latitude)&&lt(r.geoPointValue.longitude)===lt(s.geoPointValue.longitude)}(t,e);case 2:return function(r,s){if("integerValue"in r&&"integerValue"in s)return lt(r.integerValue)===lt(s.integerValue);if("doubleValue"in r&&"doubleValue"in s){let i=lt(r.doubleValue),u=lt(s.doubleValue);return i===u?mc(i)===mc(u):isNaN(i)&&isNaN(u)}return!1}(t,e);case 9:return Jo(t.arrayValue.values||[],e.arrayValue.values||[],Xa);case 10:case 11:return function(r,s){let i=r.mapValue.fields||{},u=s.mapValue.fields||{};if(mx(i)!==mx(u))return!1;for(let l in i)if(i.hasOwnProperty(l)&&(u[l]===void 0||!Xa(i[l],u[l])))return!1;return!0}(t,e);default:return oe(52216,{left:t})}}function Ic(t,e){return(t.values||[]).find(n=>Xa(n,e))!==void 0}function tu(t,e){if(t===e)return 0;let n=Rs(t),a=Rs(e);if(n!==a)return Ae(n,a);switch(n){case 0:case 9007199254740991:return 0;case 1:return Ae(t.booleanValue,e.booleanValue);case 2:return function(s,i){let u=lt(s.integerValue||s.doubleValue),l=lt(i.integerValue||i.doubleValue);return u<l?-1:u>l?1:u===l?0:isNaN(u)?isNaN(l)?0:-1:1}(t,e);case 3:return gx(t.timestampValue,e.timestampValue);case 4:return gx(gc(t),gc(e));case 5:return m_(t.stringValue,e.stringValue);case 6:return function(s,i){let u=Vr(s),l=Vr(i);return u.compareTo(l)}(t.bytesValue,e.bytesValue);case 7:return function(s,i){let u=s.split("/"),l=i.split("/");for(let c=0;c<u.length&&c<l.length;c++){let f=Ae(u[c],l[c]);if(f!==0)return f}return Ae(u.length,l.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,i){let u=Ae(lt(s.latitude),lt(i.latitude));return u!==0?u:Ae(lt(s.longitude),lt(i.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return yx(t.arrayValue,e.arrayValue);case 10:return function(s,i){let u=s.fields||{},l=i.fields||{},c=u[eu]?.arrayValue,f=l[eu]?.arrayValue,m=Ae(c?.values?.length||0,f?.values?.length||0);return m!==0?m:yx(c,f)}(t.mapValue,e.mapValue);case 11:return function(s,i){if(s===Bh.mapValue&&i===Bh.mapValue)return 0;if(s===Bh.mapValue)return 1;if(i===Bh.mapValue)return-1;let u=s.fields||{},l=Object.keys(u),c=i.fields||{},f=Object.keys(c);l.sort(),f.sort();for(let m=0;m<l.length&&m<f.length;++m){let p=m_(l[m],f[m]);if(p!==0)return p;let _=tu(u[l[m]],c[f[m]]);if(_!==0)return _}return Ae(l.length,f.length)}(t.mapValue,e.mapValue);default:throw oe(23264,{he:n})}}function gx(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Ae(t,e);let n=Nr(t),a=Nr(e),r=Ae(n.seconds,a.seconds);return r!==0?r:Ae(n.nanos,a.nanos)}function yx(t,e){let n=t.values||[],a=e.values||[];for(let r=0;r<n.length&&r<a.length;++r){let s=tu(n[r],a[r]);if(s)return s}return Ae(n.length,a.length)}function nu(t){return I_(t)}function I_(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){let a=Nr(n);return`time(${a.seconds},${a.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Vr(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ne.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let a="[",r=!0;for(let s of n.values||[])r?r=!1:a+=",",a+=I_(s);return a+"]"}(t.arrayValue):"mapValue"in t?function(n){let a=Object.keys(n.fields||{}).sort(),r="{",s=!0;for(let i of a)s?s=!1:r+=",",r+=`${i}:${I_(n.fields[i])}`;return r+"}"}(t.mapValue):oe(61005,{value:t})}function Hh(t){switch(Rs(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=Ep(t);return e?16+Hh(e):16;case 5:return 2*t.stringValue.length;case 6:return Vr(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(a){return(a.values||[]).reduce((r,s)=>r+Hh(s),0)}(t.arrayValue);case 10:case 11:return function(a){let r=0;return pu(a.fields,(s,i)=>{r+=s.length+Hh(i)}),r}(t.mapValue);default:throw oe(13486,{value:t})}}function Mc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function __(t){return!!t&&"integerValue"in t}function NS(t){return!!t&&"arrayValue"in t}function Ix(t){return!!t&&"nullValue"in t}function _x(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function o_(t){return!!t&&"mapValue"in t}function v0(t){return(t?.mapValue?.fields||{})[OS]?.stringValue===MS}function dc(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return pu(t.mapValue.fields,(n,a)=>e.mapValue.fields[n]=dc(a)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=dc(t.arrayValue.values[n]);return e}return{...t}}function T0(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===S0}var L4={mapValue:{fields:{[OS]:{stringValue:MS},[eu]:{arrayValue:{}}}}};var Ha=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let a=0;a<e.length-1;++a)if(n=(n.mapValue.fields||{})[e.get(a)],!o_(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=dc(n)}setAll(e){let n=ta.emptyPath(),a={},r=[];e.forEach((i,u)=>{if(!n.isImmediateParentOf(u)){let l=this.getFieldsMap(n);this.applyChanges(l,a,r),a={},r=[],n=u.popLast()}i?a[u.lastSegment()]=dc(i):r.push(u.lastSegment())});let s=this.getFieldsMap(n);this.applyChanges(s,a,r)}delete(e){let n=this.field(e.popLast());o_(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return Xa(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let a=0;a<e.length;++a){let r=n.mapValue.fields[e.get(a)];o_(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(a)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,a){pu(n,(r,s)=>e[r]=s);for(let r of a)delete e[r]}clone(){return new t(dc(this.value))}};var Ta=class t{constructor(e,n,a,r,s,i,u){this.key=e,this.documentType=n,this.version=a,this.readTime=r,this.createTime=s,this.data=i,this.documentState=u}static newInvalidDocument(e){return new t(e,0,de.min(),de.min(),de.min(),Ha.empty(),0)}static newFoundDocument(e,n,a,r){return new t(e,1,n,de.min(),a,r,0)}static newNoDocument(e,n){return new t(e,2,n,de.min(),de.min(),Ha.empty(),0)}static newUnknownDocument(e,n){return new t(e,3,n,de.min(),de.min(),Ha.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(de.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ha.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ha.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=de.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var Ur=class{constructor(e,n){this.position=e,this.inclusive=n}};function Sx(t,e,n){let a=0;for(let r=0;r<t.position.length;r++){let s=e[r],i=t.position[r];if(s.field.isKeyField()?a=ne.comparator(ne.fromName(i.referenceValue),n.key):a=tu(i,n.data.field(s.field)),s.dir==="desc"&&(a*=-1),a!==0)break}return a}function vx(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!Xa(t.position[n],e.position[n]))return!1;return!0}var ks=class{constructor(e,n="asc"){this.field=e,this.dir=n}};function $N(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var tp=class{},Ct=class t extends tp{constructor(e,n,a){super(),this.field=e,this.op=n,this.value=a}static create(e,n,a){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,a):new v_(e,n,a):n==="array-contains"?new E_(e,a):n==="in"?new w_(e,a):n==="not-in"?new C_(e,a):n==="array-contains-any"?new L_(e,a):new t(e,n,a)}static createKeyFieldInFilter(e,n,a){return n==="in"?new T_(e,a):new b_(e,a)}matches(e){let n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(tu(n,this.value)):n!==null&&Rs(this.value)===Rs(n)&&this.matchesComparison(tu(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return oe(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},pa=class t extends tp{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new t(e,n)}matches(e){return b0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function b0(t){return t.op==="and"}function E0(t){return JN(t)&&b0(t)}function JN(t){for(let e of t.filters)if(e instanceof pa)return!1;return!0}function S_(t){if(t instanceof Ct)return t.field.canonicalString()+t.op.toString()+nu(t.value);if(E0(t))return t.filters.map(e=>S_(e)).join(",");{let e=t.filters.map(n=>S_(n)).join(",");return`${t.op}(${e})`}}function w0(t,e){return t instanceof Ct?function(a,r){return r instanceof Ct&&a.op===r.op&&a.field.isEqual(r.field)&&Xa(a.value,r.value)}(t,e):t instanceof pa?function(a,r){return r instanceof pa&&a.op===r.op&&a.filters.length===r.filters.length?a.filters.reduce((s,i,u)=>s&&w0(i,r.filters[u]),!0):!1}(t,e):void oe(19439)}function C0(t){return t instanceof Ct?function(n){return`${n.field.canonicalString()} ${n.op} ${nu(n.value)}`}(t):t instanceof pa?function(n){return n.op.toString()+" {"+n.getFilters().map(C0).join(" ,")+"}"}(t):"Filter"}var v_=class extends Ct{constructor(e,n,a){super(e,n,a),this.key=ne.fromName(a.referenceValue)}matches(e){let n=ne.comparator(e.key,this.key);return this.matchesComparison(n)}},T_=class extends Ct{constructor(e,n){super(e,"in",n),this.keys=L0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}},b_=class extends Ct{constructor(e,n){super(e,"not-in",n),this.keys=L0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}};function L0(t,e){return(e.arrayValue?.values||[]).map(n=>ne.fromName(n.referenceValue))}var E_=class extends Ct{constructor(e,n){super(e,"array-contains",n)}matches(e){let n=e.data.field(this.field);return NS(n)&&Ic(n.arrayValue,this.value)}},w_=class extends Ct{constructor(e,n){super(e,"in",n)}matches(e){let n=e.data.field(this.field);return n!==null&&Ic(this.value.arrayValue,n)}},C_=class extends Ct{constructor(e,n){super(e,"not-in",n)}matches(e){if(Ic(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Ic(this.value.arrayValue,n)}},L_=class extends Ct{constructor(e,n){super(e,"array-contains-any",n)}matches(e){let n=e.data.field(this.field);return!(!NS(n)||!n.arrayValue.values)&&n.arrayValue.values.some(a=>Ic(this.value.arrayValue,a))}};var A_=class{constructor(e,n=null,a=[],r=[],s=null,i=null,u=null){this.path=e,this.collectionGroup=n,this.orderBy=a,this.filters=r,this.limit=s,this.startAt=i,this.endAt=u,this.Te=null}};function Tx(t,e=null,n=[],a=[],r=null,s=null,i=null){return new A_(t,e,n,a,r,s,i)}function VS(t){let e=ke(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(a=>S_(a)).join(","),n+="|ob:",n+=e.orderBy.map(a=>function(s){return s.field.canonicalString()+s.dir}(a)).join(","),bp(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(a=>nu(a)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(a=>nu(a)).join(",")),e.Te=n}return e.Te}function US(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!$N(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!w0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!vx(t.startAt,e.startAt)&&vx(t.endAt,e.endAt)}function x_(t){return ne.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var Fr=class{constructor(e,n=null,a=[],r=[],s=null,i="F",u=null,l=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=a,this.filters=r,this.limit=s,this.limitType=i,this.startAt=u,this.endAt=l,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function ZN(t,e,n,a,r,s,i,u){return new Fr(t,e,n,a,r,s,i,u)}function FS(t){return new Fr(t)}function bx(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function eV(t){return ne.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function wp(t){return t.collectionGroup!==null}function Ti(t){let e=ke(t);if(e.Ie===null){e.Ie=[];let n=new Set;for(let s of e.explicitOrderBy)e.Ie.push(s),n.add(s.field.canonicalString());let a=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(i){let u=new tn(ta.comparator);return i.filters.forEach(l=>{l.getFlattenedFilters().forEach(c=>{c.isInequality()&&(u=u.add(c.field))})}),u})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new ks(s,a))}),n.has(ta.keyField().canonicalString())||e.Ie.push(new ks(ta.keyField(),a))}return e.Ie}function ja(t){let e=ke(t);return e.Ee||(e.Ee=tV(e,Ti(t))),e.Ee}function tV(t,e){if(t.limitType==="F")return Tx(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let s=r.dir==="desc"?"asc":"desc";return new ks(r.field,s)});let n=t.endAt?new Ur(t.endAt.position,t.endAt.inclusive):null,a=t.startAt?new Ur(t.startAt.position,t.startAt.inclusive):null;return Tx(t.path,t.collectionGroup,e,t.filters,t.limit,n,a)}}function Cp(t,e){let n=t.filters.concat([e]);return new Fr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function A0(t,e){let n=t.explicitOrderBy.concat([e]);return new Fr(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function _c(t,e,n){return new Fr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function x0(t,e){return new Fr(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function Lp(t,e){return US(ja(t),ja(e))&&t.limitType===e.limitType}function R0(t){return`${VS(ja(t))}|lt:${t.limitType}`}function Go(t){return`Query(target=${function(n){let a=n.path.canonicalString();return n.collectionGroup!==null&&(a+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(a+=`, filters: [${n.filters.map(r=>C0(r)).join(", ")}]`),bp(n.limit)||(a+=", limit: "+n.limit),n.orderBy.length>0&&(a+=`, orderBy: [${n.orderBy.map(r=>function(i){return`${i.field.canonicalString()} (${i.dir})`}(r)).join(", ")}]`),n.startAt&&(a+=", startAt: ",a+=n.startAt.inclusive?"b:":"a:",a+=n.startAt.position.map(r=>nu(r)).join(",")),n.endAt&&(a+=", endAt: ",a+=n.endAt.inclusive?"a:":"b:",a+=n.endAt.position.map(r=>nu(r)).join(",")),`Target(${a})`}(ja(t))}; limitType=${t.limitType})`}function Ap(t,e){return e.isFoundDocument()&&function(a,r){let s=r.key.path;return a.collectionGroup!==null?r.key.hasCollectionId(a.collectionGroup)&&a.path.isPrefixOf(s):ne.isDocumentKey(a.path)?a.path.isEqual(s):a.path.isImmediateParentOf(s)}(t,e)&&function(a,r){for(let s of Ti(a))if(!s.field.isKeyField()&&r.data.field(s.field)===null)return!1;return!0}(t,e)&&function(a,r){for(let s of a.filters)if(!s.matches(r))return!1;return!0}(t,e)&&function(a,r){return!(a.startAt&&!function(i,u,l){let c=Sx(i,u,l);return i.inclusive?c<=0:c<0}(a.startAt,Ti(a),r)||a.endAt&&!function(i,u,l){let c=Sx(i,u,l);return i.inclusive?c>=0:c>0}(a.endAt,Ti(a),r))}(t,e)}function nV(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function k0(t){return(e,n)=>{let a=!1;for(let r of Ti(t)){let s=aV(r,e,n);if(s!==0)return s;a=a||r.field.isKeyField()}return 0}}function aV(t,e,n){let a=t.field.isKeyField()?ne.comparator(e.key,n.key):function(s,i,u){let l=i.data.field(s),c=u.data.field(s);return l!==null&&c!==null?tu(l,c):oe(42886)}(t.field,e,n);switch(t.dir){case"asc":return a;case"desc":return-1*a;default:return oe(19790,{direction:t.dir})}}var Br=class{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a!==void 0){for(let[r,s]of a)if(this.equalsFn(r,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){let a=this.mapKeyFn(e),r=this.inner[a];if(r===void 0)return this.inner[a]=[[e,n]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a===void 0)return!1;for(let r=0;r<a.length;r++)if(this.equalsFn(a[r][0],e))return a.length===1?delete this.inner[n]:a.splice(r,1),this.innerSize--,!0;return!1}forEach(e){pu(this.inner,(n,a)=>{for(let[r,s]of a)e(r,s)})}isEmpty(){return p0(this.inner)}size(){return this.innerSize}};var rV=new At(ne.comparator);function Ds(){return rV}var D0=new At(ne.comparator);function cc(...t){let e=D0;for(let n of t)e=e.insert(n.key,n);return e}function sV(t){let e=D0;return t.forEach((n,a)=>e=e.insert(n,a.overlayedDocument)),e}function Si(){return fc()}function P0(){return fc()}function fc(){return new Br(t=>t.toString(),(t,e)=>t.isEqual(e))}var A4=new At(ne.comparator),iV=new tn(ne.comparator);function Re(...t){let e=iV;for(let n of t)e=e.add(n);return e}var oV=new tn(Ae);function uV(){return oV}function BS(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:mc(e)?"-0":e}}function O0(t){return{integerValue:""+t}}function lV(t,e){return VN(e)?O0(e):BS(t,e)}var au=class{constructor(){this._=void 0}};function cV(t,e,n){return t instanceof Sc?function(r,s){let i={fields:{[g0]:{stringValue:m0},[I0]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return s&&Oc(s)&&(s=Ep(s)),s&&(i.fields[y0]=s),{mapValue:i}}(n,e):t instanceof ru?M0(t,e):t instanceof su?N0(t,e):function(r,s){let i=fV(r,s),u=Ex(i)+Ex(r.Ae);return __(i)&&__(r.Ae)?O0(u):BS(r.serializer,u)}(t,e)}function dV(t,e,n){return t instanceof ru?M0(t,e):t instanceof su?N0(t,e):n}function fV(t,e){return t instanceof vc?function(a){return __(a)||function(s){return!!s&&"doubleValue"in s}(a)}(e)?e:{integerValue:0}:null}var Sc=class extends au{},ru=class extends au{constructor(e){super(),this.elements=e}};function M0(t,e){let n=V0(e);for(let a of t.elements)n.some(r=>Xa(r,a))||n.push(a);return{arrayValue:{values:n}}}var su=class extends au{constructor(e){super(),this.elements=e}};function N0(t,e){let n=V0(e);for(let a of t.elements)n=n.filter(r=>!Xa(r,a));return{arrayValue:{values:n}}}var vc=class extends au{constructor(e,n){super(),this.serializer=e,this.Ae=n}};function Ex(t){return lt(t.integerValue||t.doubleValue)}function V0(t){return NS(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function hV(t,e){return t.field.isEqual(e.field)&&function(a,r){return a instanceof ru&&r instanceof ru||a instanceof su&&r instanceof su?Jo(a.elements,r.elements,Xa):a instanceof vc&&r instanceof vc?Xa(a.Ae,r.Ae):a instanceof Sc&&r instanceof Sc}(t.transform,e.transform)}var Xo=class t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function Gh(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var Tc=class{};function U0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new np(t.key,Xo.none()):new bc(t.key,t.data,Xo.none());{let n=t.data,a=Ha.empty(),r=new tn(ta.comparator);for(let s of e.fields)if(!r.has(s)){let i=n.field(s);i===null&&s.length>1&&(s=s.popLast(),i=n.field(s)),i===null?a.delete(s):a.set(s,i),r=r.add(s)}return new iu(t.key,a,new _i(r.toArray()),Xo.none())}}function pV(t,e,n){t instanceof bc?function(r,s,i){let u=r.value.clone(),l=Cx(r.fieldTransforms,s,i.transformResults);u.setAll(l),s.convertToFoundDocument(i.version,u).setHasCommittedMutations()}(t,e,n):t instanceof iu?function(r,s,i){if(!Gh(r.precondition,s))return void s.convertToUnknownDocument(i.version);let u=Cx(r.fieldTransforms,s,i.transformResults),l=s.data;l.setAll(F0(r)),l.setAll(u),s.convertToFoundDocument(i.version,l).setHasCommittedMutations()}(t,e,n):function(r,s,i){s.convertToNoDocument(i.version).setHasCommittedMutations()}(0,e,n)}function hc(t,e,n,a){return t instanceof bc?function(s,i,u,l){if(!Gh(s.precondition,i))return u;let c=s.value.clone(),f=Lx(s.fieldTransforms,l,i);return c.setAll(f),i.convertToFoundDocument(i.version,c).setHasLocalMutations(),null}(t,e,n,a):t instanceof iu?function(s,i,u,l){if(!Gh(s.precondition,i))return u;let c=Lx(s.fieldTransforms,l,i),f=i.data;return f.setAll(F0(s)),f.setAll(c),i.convertToFoundDocument(i.version,f).setHasLocalMutations(),u===null?null:u.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(m=>m.field))}(t,e,n,a):function(s,i,u){return Gh(s.precondition,i)?(i.convertToNoDocument(i.version).setHasLocalMutations(),null):u}(t,e,n)}function wx(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(a,r){return a===void 0&&r===void 0||!(!a||!r)&&Jo(a,r,(s,i)=>hV(s,i))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var bc=class extends Tc{constructor(e,n,a,r=[]){super(),this.key=e,this.value=n,this.precondition=a,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},iu=class extends Tc{constructor(e,n,a,r,s=[]){super(),this.key=e,this.data=n,this.fieldMask=a,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}};function F0(t){let e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){let a=t.data.field(n);e.set(n,a)}}),e}function Cx(t,e,n){let a=new Map;ht(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let r=0;r<n.length;r++){let s=t[r],i=s.transform,u=e.data.field(s.field);a.set(s.field,dV(i,u,n[r]))}return a}function Lx(t,e,n){let a=new Map;for(let r of t){let s=r.transform,i=n.data.field(r.field);a.set(r.field,cV(s,i,e))}return a}var np=class extends Tc{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var R_=class{constructor(e,n,a,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=a,this.mutations=r}applyToRemoteDocument(e,n){let a=n.mutationResults;for(let r=0;r<this.mutations.length;r++){let s=this.mutations[r];s.key.isEqual(e.key)&&pV(s,e,a[r])}}applyToLocalView(e,n){for(let a of this.baseMutations)a.key.isEqual(e.key)&&(n=hc(a,e,n,this.localWriteTime));for(let a of this.mutations)a.key.isEqual(e.key)&&(n=hc(a,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){let a=P0();return this.mutations.forEach(r=>{let s=e.get(r.key),i=s.overlayedDocument,u=this.applyToLocalView(i,s.mutatedFields);u=n.has(r.key)?null:u;let l=U0(i,u);l!==null&&a.set(r.key,l),i.isValidDocument()||i.convertToNoDocument(de.min())}),a}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),Re())}isEqual(e){return this.batchId===e.batchId&&Jo(this.mutations,e.mutations,(n,a)=>wx(n,a))&&Jo(this.baseMutations,e.baseMutations,(n,a)=>wx(n,a))}};var k_=class{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var D_=class{constructor(e,n){this.count=e,this.unchangedNames=n}};var Pt,xe;function B0(t){if(t===void 0)return Or("GRPC error has no .code"),B.UNKNOWN;switch(t){case Pt.OK:return B.OK;case Pt.CANCELLED:return B.CANCELLED;case Pt.UNKNOWN:return B.UNKNOWN;case Pt.DEADLINE_EXCEEDED:return B.DEADLINE_EXCEEDED;case Pt.RESOURCE_EXHAUSTED:return B.RESOURCE_EXHAUSTED;case Pt.INTERNAL:return B.INTERNAL;case Pt.UNAVAILABLE:return B.UNAVAILABLE;case Pt.UNAUTHENTICATED:return B.UNAUTHENTICATED;case Pt.INVALID_ARGUMENT:return B.INVALID_ARGUMENT;case Pt.NOT_FOUND:return B.NOT_FOUND;case Pt.ALREADY_EXISTS:return B.ALREADY_EXISTS;case Pt.PERMISSION_DENIED:return B.PERMISSION_DENIED;case Pt.FAILED_PRECONDITION:return B.FAILED_PRECONDITION;case Pt.ABORTED:return B.ABORTED;case Pt.OUT_OF_RANGE:return B.OUT_OF_RANGE;case Pt.UNIMPLEMENTED:return B.UNIMPLEMENTED;case Pt.DATA_LOSS:return B.DATA_LOSS;default:return oe(39323,{code:t})}}(xe=Pt||(Pt={}))[xe.OK=0]="OK",xe[xe.CANCELLED=1]="CANCELLED",xe[xe.UNKNOWN=2]="UNKNOWN",xe[xe.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",xe[xe.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",xe[xe.NOT_FOUND=5]="NOT_FOUND",xe[xe.ALREADY_EXISTS=6]="ALREADY_EXISTS",xe[xe.PERMISSION_DENIED=7]="PERMISSION_DENIED",xe[xe.UNAUTHENTICATED=16]="UNAUTHENTICATED",xe[xe.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",xe[xe.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",xe[xe.ABORTED=10]="ABORTED",xe[xe.OUT_OF_RANGE=11]="OUT_OF_RANGE",xe[xe.UNIMPLEMENTED=12]="UNIMPLEMENTED",xe[xe.INTERNAL=13]="INTERNAL",xe[xe.UNAVAILABLE=14]="UNAVAILABLE",xe[xe.DATA_LOSS=15]="DATA_LOSS";var mV=null;function gV(){return new TextEncoder}var yV=new Rr([4294967295,4294967295],0);function Ax(t){let e=gV().encode(t),n=new e_;return n.update(e),new Uint8Array(n.digest())}function xx(t){let e=new DataView(t.buffer),n=e.getUint32(0,!0),a=e.getUint32(4,!0),r=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new Rr([n,a],0),new Rr([r,s],0)]}var P_=class t{constructor(e,n,a){if(this.bitmap=e,this.padding=n,this.hashCount=a,n<0||n>=8)throw new vi(`Invalid padding: ${n}`);if(a<0)throw new vi(`Invalid hash count: ${a}`);if(e.length>0&&this.hashCount===0)throw new vi(`Invalid hash count: ${a}`);if(e.length===0&&n!==0)throw new vi(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=Rr.fromNumber(this.ge)}ye(e,n,a){let r=e.add(n.multiply(Rr.fromNumber(a)));return r.compare(yV)===1&&(r=new Rr([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let n=Ax(e),[a,r]=xx(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);if(!this.we(i))return!1}return!0}static create(e,n,a){let r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new t(s,r,n);return a.forEach(u=>i.insert(u)),i}insert(e){if(this.ge===0)return;let n=Ax(e),[a,r]=xx(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);this.be(i)}}be(e){let n=Math.floor(e/8),a=e%8;this.bitmap[n]|=1<<a}},vi=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var ap=class t{constructor(e,n,a,r,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=a,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,a){let r=new Map;return r.set(e,Ec.createSynthesizedTargetChangeForCurrentChange(e,n,a)),new t(de.min(),r,new At(Ae),Ds(),Re())}},Ec=class t{constructor(e,n,a,r,s){this.resumeToken=e,this.current=n,this.addedDocuments=a,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,a){return new t(a,n,Re(),Re(),Re())}};var Qo=class{constructor(e,n,a,r){this.Se=e,this.removedTargetIds=n,this.key=a,this.De=r}},rp=class{constructor(e,n){this.targetId=e,this.Ce=n}},sp=class{constructor(e,n,a=fn.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=a,this.cause=r}},ip=class{constructor(){this.ve=0,this.Fe=Rx(),this.Me=fn.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Re(),n=Re(),a=Re();return this.Fe.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:a=a.add(r);break;default:oe(38017,{changeType:s})}}),new Ec(this.Me,this.xe,e,n,a)}Ke(){this.Oe=!1,this.Fe=Rx()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,ht(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},O_=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=Ds(),this.He=qh(),this.Je=qh(),this.Ze=new At(Ae)}Xe(e){for(let n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(let n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{let a=this.nt(n);switch(e.state){case 0:this.rt(n)&&a.Le(e.resumeToken);break;case 1:a.We(),a.Ne||a.Ke(),a.Le(e.resumeToken);break;case 2:a.We(),a.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(a.Qe(),a.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),a.Le(e.resumeToken));break;default:oe(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((a,r)=>{this.rt(r)&&n(r)})}st(e){let n=e.targetId,a=e.Ce.count,r=this.ot(n);if(r){let s=r.target;if(x_(s))if(a===0){let i=new ne(s.path);this.et(n,i,Ta.newNoDocument(i,de.min()))}else ht(a===1,20013,{expectedCount:a});else{let i=this._t(n);if(i!==a){let u=this.ut(e),l=u?this.ct(u,e,i):1;if(l!==0){this.it(n);let c=l===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,c)}mV?.lt(function(f,m,p,_,R){let D={localCacheCount:f,existenceFilterCount:m.count,databaseId:p.database,projectId:p.projectId},L=m.unchangedNames;return L&&(D.bloomFilter={applied:R===0,hashCount:L?.hashCount??0,bitmapLength:L?.bits?.bitmap?.length??0,padding:L?.bits?.padding??0,mightContain:T=>_?.mightContain(T)??!1}),D}(i,e.Ce,this.Ge.ht(),u,l))}}}}ut(e){let n=e.Ce.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:a="",padding:r=0},hashCount:s=0}=n,i,u;try{i=Vr(a).toUint8Array()}catch(l){if(l instanceof Zh)return Mr("Decoding the base64 bloom filter in existence filter failed ("+l.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw l}try{u=new P_(i,r,s)}catch(l){return Mr(l instanceof vi?"BloomFilter error: ":"Applying bloom filter failed: ",l),null}return u.ge===0?null:u}ct(e,n,a){return n.Ce.count===a-this.Pt(e,n.targetId)?0:2}Pt(e,n){let a=this.Ge.getRemoteKeysForTarget(n),r=0;return a.forEach(s=>{let i=this.Ge.ht(),u=`projects/${i.projectId}/databases/${i.database}/documents/${s.path.canonicalString()}`;e.mightContain(u)||(this.et(n,s,null),r++)}),r}Tt(e){let n=new Map;this.ze.forEach((s,i)=>{let u=this.ot(i);if(u){if(s.current&&x_(u.target)){let l=new ne(u.target.path);this.It(l).has(i)||this.Et(i,l)||this.et(i,l,Ta.newNoDocument(l,e))}s.Be&&(n.set(i,s.ke()),s.Ke())}});let a=Re();this.Je.forEach((s,i)=>{let u=!0;i.forEachWhile(l=>{let c=this.ot(l);return!c||c.purpose==="TargetPurposeLimboResolution"||(u=!1,!1)}),u&&(a=a.add(s))}),this.je.forEach((s,i)=>i.setReadTime(e));let r=new ap(e,n,this.Ze,this.je,a);return this.je=Ds(),this.He=qh(),this.Je=qh(),this.Ze=new At(Ae),r}Ye(e,n){if(!this.rt(e))return;let a=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,a),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,a){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,n)?r.qe(n,1):r.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),a&&(this.je=this.je.insert(n,a))}removeTarget(e){this.ze.delete(e)}_t(e){let n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new ip,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new tn(Ae),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new tn(Ae),this.He=this.He.insert(e,n)),n}rt(e){let n=this.ot(e)!==null;return n||$("WatchChangeAggregator","Detected inactive target",e),n}ot(e){let n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new ip),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}};function qh(){return new At(ne.comparator)}function Rx(){return new At(ne.comparator)}var IV={asc:"ASCENDING",desc:"DESCENDING"},_V={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},SV={and:"AND",or:"OR"},M_=class{constructor(e,n){this.databaseId=e,this.useProto3Json=n}};function N_(t,e){return t.useProto3Json||bp(e)?e:{value:e}}function V_(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function q0(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function Yo(t){return ht(!!t,49232),de.fromTimestamp(function(n){let a=Nr(n);return new Mt(a.seconds,a.nanos)}(t))}function z0(t,e){return U_(t,e).canonicalString()}function U_(t,e){let n=function(r){return new ct(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?n:n.child(e)}function H0(t){let e=ct.fromString(t);return ht(X0(e),10190,{key:e.toString()}),e}function u_(t,e){let n=H0(e);if(n.get(1)!==t.databaseId.projectId)throw new Q(B.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new Q(B.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ne(j0(n))}function G0(t,e){return z0(t.databaseId,e)}function vV(t){let e=H0(t);return e.length===4?ct.emptyPath():j0(e)}function kx(t){return new ct(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function j0(t){return ht(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function TV(t,e){let n;if("targetChange"in e){e.targetChange;let a=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:oe(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],s=function(c,f){return c.useProto3Json?(ht(f===void 0||typeof f=="string",58123),fn.fromBase64String(f||"")):(ht(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),fn.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),i=e.targetChange.cause,u=i&&function(c){let f=c.code===void 0?B.UNKNOWN:B0(c.code);return new Q(f,c.message||"")}(i);n=new sp(a,r,s,u||null)}else if("documentChange"in e){e.documentChange;let a=e.documentChange;a.document,a.document.name,a.document.updateTime;let r=u_(t,a.document.name),s=Yo(a.document.updateTime),i=a.document.createTime?Yo(a.document.createTime):de.min(),u=new Ha({mapValue:{fields:a.document.fields}}),l=Ta.newFoundDocument(r,s,i,u),c=a.targetIds||[],f=a.removedTargetIds||[];n=new Qo(c,f,l.key,l)}else if("documentDelete"in e){e.documentDelete;let a=e.documentDelete;a.document;let r=u_(t,a.document),s=a.readTime?Yo(a.readTime):de.min(),i=Ta.newNoDocument(r,s),u=a.removedTargetIds||[];n=new Qo([],u,i.key,i)}else if("documentRemove"in e){e.documentRemove;let a=e.documentRemove;a.document;let r=u_(t,a.document),s=a.removedTargetIds||[];n=new Qo([],s,r,null)}else{if(!("filter"in e))return oe(11601,{Vt:e});{e.filter;let a=e.filter;a.targetId;let{count:r=0,unchangedNames:s}=a,i=new D_(r,s),u=a.targetId;n=new rp(u,i)}}return n}function bV(t,e){return{documents:[G0(t,e.path)]}}function EV(t,e){let n={structuredQuery:{}},a=e.path,r;e.collectionGroup!==null?(r=a,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=a.popLast(),n.structuredQuery.from=[{collectionId:a.lastSegment()}]),n.parent=G0(t,r);let s=function(c){if(c.length!==0)return W0(pa.create(c,"and"))}(e.filters);s&&(n.structuredQuery.where=s);let i=function(c){if(c.length!==0)return c.map(f=>function(p){return{field:jo(p.field),direction:LV(p.dir)}}(f))}(e.orderBy);i&&(n.structuredQuery.orderBy=i);let u=N_(t,e.limit);return u!==null&&(n.structuredQuery.limit=u),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{ft:n,parent:r}}function wV(t){let e=vV(t.parent),n=t.structuredQuery,a=n.from?n.from.length:0,r=null;if(a>0){ht(a===1,65062);let f=n.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(m){let p=K0(m);return p instanceof pa&&E0(p)?p.getFilters():[p]}(n.where));let i=[];n.orderBy&&(i=function(m){return m.map(p=>function(R){return new ks(Ko(R.field),function(L){switch(L){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(p))}(n.orderBy));let u=null;n.limit&&(u=function(m){let p;return p=typeof m=="object"?m.value:m,bp(p)?null:p}(n.limit));let l=null;n.startAt&&(l=function(m){let p=!!m.before,_=m.values||[];return new Ur(_,p)}(n.startAt));let c=null;return n.endAt&&(c=function(m){let p=!m.before,_=m.values||[];return new Ur(_,p)}(n.endAt)),ZN(e,r,i,s,u,"F",l,c)}function CV(t,e){let n=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return oe(28987,{purpose:r})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function K0(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":let a=Ko(n.unaryFilter.field);return Ct.create(a,"==",{doubleValue:NaN});case"IS_NULL":let r=Ko(n.unaryFilter.field);return Ct.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let s=Ko(n.unaryFilter.field);return Ct.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let i=Ko(n.unaryFilter.field);return Ct.create(i,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return oe(61313);default:return oe(60726)}}(t):t.fieldFilter!==void 0?function(n){return Ct.create(Ko(n.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return oe(58110);default:return oe(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return pa.create(n.compositeFilter.filters.map(a=>K0(a)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return oe(1026)}}(n.compositeFilter.op))}(t):oe(30097,{filter:t})}function LV(t){return IV[t]}function AV(t){return _V[t]}function xV(t){return SV[t]}function jo(t){return{fieldPath:t.canonicalString()}}function Ko(t){return ta.fromServerFormat(t.fieldPath)}function W0(t){return t instanceof Ct?function(n){if(n.op==="=="){if(_x(n.value))return{unaryFilter:{field:jo(n.field),op:"IS_NAN"}};if(Ix(n.value))return{unaryFilter:{field:jo(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(_x(n.value))return{unaryFilter:{field:jo(n.field),op:"IS_NOT_NAN"}};if(Ix(n.value))return{unaryFilter:{field:jo(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:jo(n.field),op:AV(n.op),value:n.value}}}(t):t instanceof pa?function(n){let a=n.getFilters().map(r=>W0(r));return a.length===1?a[0]:{compositeFilter:{op:xV(n.op),filters:a}}}(t):oe(54877,{filter:t})}function X0(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function Q0(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var wc=class t{constructor(e,n,a,r,s=de.min(),i=de.min(),u=fn.EMPTY_BYTE_STRING,l=null){this.target=e,this.targetId=n,this.purpose=a,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=u,this.expectedCount=l}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var F_=class{constructor(e){this.yt=e}};function Y0(t){let e=wV({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?_c(e,e.limit,"L"):e}var op=class{constructor(){}Dt(e,n){this.Ct(e,n),n.vt()}Ct(e,n){if("nullValue"in e)this.Ft(n,5);else if("booleanValue"in e)this.Ft(n,10),n.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(n,15),n.Mt(lt(e.integerValue));else if("doubleValue"in e){let a=lt(e.doubleValue);isNaN(a)?this.Ft(n,13):(this.Ft(n,15),mc(a)?n.Mt(0):n.Mt(a))}else if("timestampValue"in e){let a=e.timestampValue;this.Ft(n,20),typeof a=="string"&&(a=Nr(a)),n.xt(`${a.seconds||""}`),n.Mt(a.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,n),this.Nt(n);else if("bytesValue"in e)this.Ft(n,30),n.Bt(Vr(e.bytesValue)),this.Nt(n);else if("referenceValue"in e)this.Lt(e.referenceValue,n);else if("geoPointValue"in e){let a=e.geoPointValue;this.Ft(n,45),n.Mt(a.latitude||0),n.Mt(a.longitude||0)}else"mapValue"in e?T0(e)?this.Ft(n,Number.MAX_SAFE_INTEGER):v0(e)?this.kt(e.mapValue,n):(this.Kt(e.mapValue,n),this.Nt(n)):"arrayValue"in e?(this.qt(e.arrayValue,n),this.Nt(n)):oe(19022,{Ut:e})}Ot(e,n){this.Ft(n,25),this.$t(e,n)}$t(e,n){n.xt(e)}Kt(e,n){let a=e.fields||{};this.Ft(n,55);for(let r of Object.keys(a))this.Ot(r,n),this.Ct(a[r],n)}kt(e,n){let a=e.fields||{};this.Ft(n,53);let r=eu,s=a[r].arrayValue?.values?.length||0;this.Ft(n,15),n.Mt(lt(s)),this.Ot(r,n),this.Ct(a[r],n)}qt(e,n){let a=e.values||[];this.Ft(n,50);for(let r of a)this.Ct(r,n)}Lt(e,n){this.Ft(n,37),ne.fromName(e).path.forEach(a=>{this.Ft(n,60),this.$t(a,n)})}Ft(e,n){e.Mt(n)}Nt(e){e.Mt(2)}};op.Wt=new op;var B_=class{constructor(){this.Sn=new q_}addToCollectionParentIndex(e,n){return this.Sn.add(n),z.resolve()}getCollectionParents(e,n){return z.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return z.resolve()}deleteFieldIndex(e,n){return z.resolve()}deleteAllFieldIndexes(e){return z.resolve()}createTargetIndexes(e,n){return z.resolve()}getDocumentsMatchingTarget(e,n){return z.resolve(null)}getIndexType(e,n){return z.resolve(0)}getFieldIndexes(e,n){return z.resolve([])}getNextCollectionGroupToUpdate(e){return z.resolve(null)}getMinOffset(e,n){return z.resolve(wi.min())}getMinOffsetFromCollectionGroup(e,n){return z.resolve(wi.min())}updateCollectionGroup(e,n,a){return z.resolve()}updateIndexEntries(e,n){return z.resolve()}},q_=class{constructor(){this.index={}}add(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n]||new tn(ct.comparator),s=!r.has(a);return this.index[n]=r.add(a),s}has(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n];return r&&r.has(a)}getEntries(e){return(this.index[e]||new tn(ct.comparator)).toArray()}};var x4=new Uint8Array(0);var Dx={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},$0=41943040,ha=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,a){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=a}};ha.DEFAULT_COLLECTION_PERCENTILE=10,ha.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,ha.DEFAULT=new ha($0,ha.DEFAULT_COLLECTION_PERCENTILE,ha.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),ha.DISABLED=new ha(-1,0,0);var Cc=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var Px="LruGarbageCollector",RV=1048576;function Ox([t,e],[n,a]){let r=Ae(t,n);return r===0?Ae(e,a):r}var z_=class{constructor(e){this.Pr=e,this.buffer=new tn(Ox),this.Tr=0}Ir(){return++this.Tr}Er(e){let n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{let a=this.buffer.last();Ox(n,a)<0&&(this.buffer=this.buffer.delete(a).add(n))}}get maxValue(){return this.buffer.last()[0]}},H_=class{constructor(e,n,a){this.garbageCollector=e,this.asyncQueue=n,this.localStore=a,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){$(Px,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){hu(n)?$(Px,"Ignoring IndexedDB error during garbage collection: ",n):await Tp(n)}await this.Ar(3e5)})}},G_=class{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(a=>Math.floor(n/100*a))}nthSequenceNumber(e,n){if(n===0)return z.resolve(Zo.ce);let a=new z_(n);return this.Vr.forEachTarget(e,r=>a.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>a.Er(r))).next(()=>a.maxValue)}removeTargets(e,n,a){return this.Vr.removeTargets(e,n,a)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?($("LruGarbageCollector","Garbage collection skipped; disabled"),z.resolve(Dx)):this.getCacheSize(e).next(a=>a<this.params.cacheSizeCollectionThreshold?($("LruGarbageCollector",`Garbage collection skipped; Cache size ${a} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),Dx):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let a,r,s,i,u,l,c,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(m=>(m>this.params.maximumSequenceNumbersToCollect?($("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${m}`),r=this.params.maximumSequenceNumbersToCollect):r=m,i=Date.now(),this.nthSequenceNumber(e,r))).next(m=>(a=m,u=Date.now(),this.removeTargets(e,a,n))).next(m=>(s=m,l=Date.now(),this.removeOrphanedDocuments(e,a))).next(m=>(c=Date.now(),Ho()<=Se.DEBUG&&$("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-f}ms
	Determined least recently used ${r} in `+(u-i)+`ms
	Removed ${s} targets in `+(l-u)+`ms
	Removed ${m} documents in `+(c-l)+`ms
Total Duration: ${c-f}ms`),z.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:m})))}};function kV(t,e){return new G_(t,e)}var j_=class{constructor(){this.changes=new Br(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Ta.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();let a=this.changes.get(n);return a!==void 0?z.resolve(a):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var K_=class{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}};var W_=class{constructor(e,n,a,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=a,this.indexManager=r}getDocument(e,n){let a=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(a=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(a!==null&&hc(a.mutation,r,_i.empty(),Mt.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.getLocalViewOfDocuments(e,a,Re()).next(()=>a))}getLocalViewOfDocuments(e,n,a=Re()){let r=Si();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,a).next(s=>{let i=cc();return s.forEach((u,l)=>{i=i.insert(u,l.overlayedDocument)}),i}))}getOverlayedDocuments(e,n){let a=Si();return this.populateOverlays(e,a,n).next(()=>this.computeViews(e,n,a,Re()))}populateOverlays(e,n,a){let r=[];return a.forEach(s=>{n.has(s)||r.push(s)}),this.documentOverlayCache.getOverlays(e,r).next(s=>{s.forEach((i,u)=>{n.set(i,u)})})}computeViews(e,n,a,r){let s=Ds(),i=fc(),u=function(){return fc()}();return n.forEach((l,c)=>{let f=a.get(c.key);r.has(c.key)&&(f===void 0||f.mutation instanceof iu)?s=s.insert(c.key,c):f!==void 0?(i.set(c.key,f.mutation.getFieldMask()),hc(f.mutation,c,f.mutation.getFieldMask(),Mt.now())):i.set(c.key,_i.empty())}),this.recalculateAndSaveOverlays(e,s).next(l=>(l.forEach((c,f)=>i.set(c,f)),n.forEach((c,f)=>u.set(c,new K_(f,i.get(c)??null))),u))}recalculateAndSaveOverlays(e,n){let a=fc(),r=new At((i,u)=>i-u),s=Re();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(i=>{for(let u of i)u.keys().forEach(l=>{let c=n.get(l);if(c===null)return;let f=a.get(l)||_i.empty();f=u.applyToLocalView(c,f),a.set(l,f);let m=(r.get(u.batchId)||Re()).add(l);r=r.insert(u.batchId,m)})}).next(()=>{let i=[],u=r.getReverseIterator();for(;u.hasNext();){let l=u.getNext(),c=l.key,f=l.value,m=P0();f.forEach(p=>{if(!s.has(p)){let _=U0(n.get(p),a.get(p));_!==null&&m.set(p,_),s=s.add(p)}}),i.push(this.documentOverlayCache.saveOverlays(e,c,m))}return z.waitFor(i)}).next(()=>a)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.recalculateAndSaveOverlays(e,a))}getDocumentsMatchingQuery(e,n,a,r){return eV(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):wp(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,a,r):this.getDocumentsMatchingCollectionQuery(e,n,a,r)}getNextDocuments(e,n,a,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,a,r).next(s=>{let i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,a.largestBatchId,r-s.size):z.resolve(Si()),u=pc,l=s;return i.next(c=>z.forEach(c,(f,m)=>(u<m.largestBatchId&&(u=m.largestBatchId),s.get(f)?z.resolve():this.remoteDocumentCache.getEntry(e,f).next(p=>{l=l.insert(f,p)}))).next(()=>this.populateOverlays(e,c,s)).next(()=>this.computeViews(e,l,c,Re())).next(f=>({batchId:u,changes:sV(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ne(n)).next(a=>{let r=cc();return a.isFoundDocument()&&(r=r.insert(a.key,a)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,a,r){let s=n.collectionGroup,i=cc();return this.indexManager.getCollectionParents(e,s).next(u=>z.forEach(u,l=>{let c=function(m,p){return new Fr(p,null,m.explicitOrderBy.slice(),m.filters.slice(),m.limit,m.limitType,m.startAt,m.endAt)}(n,l.child(s));return this.getDocumentsMatchingCollectionQuery(e,c,a,r).next(f=>{f.forEach((m,p)=>{i=i.insert(m,p)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,n,a,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,a.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,a,s,r))).next(i=>{s.forEach((l,c)=>{let f=c.getKey();i.get(f)===null&&(i=i.insert(f,Ta.newInvalidDocument(f)))});let u=cc();return i.forEach((l,c)=>{let f=s.get(l);f!==void 0&&hc(f.mutation,c,_i.empty(),Mt.now()),Ap(n,c)&&(u=u.insert(l,c))}),u})}};var X_=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return z.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(r){return{id:r.id,version:r.version,createTime:Yo(r.createTime)}}(n)),z.resolve()}getNamedQuery(e,n){return z.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(r){return{name:r.name,query:Y0(r.bundledQuery),readTime:Yo(r.readTime)}}(n)),z.resolve()}};var Q_=class{constructor(){this.overlays=new At(ne.comparator),this.Lr=new Map}getOverlay(e,n){return z.resolve(this.overlays.get(n))}getOverlays(e,n){let a=Si();return z.forEach(n,r=>this.getOverlay(e,r).next(s=>{s!==null&&a.set(r,s)})).next(()=>a)}saveOverlays(e,n,a){return a.forEach((r,s)=>{this.bt(e,n,s)}),z.resolve()}removeOverlaysForBatchId(e,n,a){let r=this.Lr.get(a);return r!==void 0&&(r.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(a)),z.resolve()}getOverlaysForCollection(e,n,a){let r=Si(),s=n.length+1,i=new ne(n.child("")),u=this.overlays.getIteratorFrom(i);for(;u.hasNext();){let l=u.getNext().value,c=l.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===s&&l.largestBatchId>a&&r.set(l.getKey(),l)}return z.resolve(r)}getOverlaysForCollectionGroup(e,n,a,r){let s=new At((c,f)=>c-f),i=this.overlays.getIterator();for(;i.hasNext();){let c=i.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>a){let f=s.get(c.largestBatchId);f===null&&(f=Si(),s=s.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}let u=Si(),l=s.getIterator();for(;l.hasNext()&&(l.getNext().value.forEach((c,f)=>u.set(c,f)),!(u.size()>=r)););return z.resolve(u)}bt(e,n,a){let r=this.overlays.get(a.key);if(r!==null){let i=this.Lr.get(r.largestBatchId).delete(a.key);this.Lr.set(r.largestBatchId,i)}this.overlays=this.overlays.insert(a.key,new k_(n,a));let s=this.Lr.get(n);s===void 0&&(s=Re(),this.Lr.set(n,s)),this.Lr.set(n,s.add(a.key))}};var Y_=class{constructor(){this.sessionToken=fn.EMPTY_BYTE_STRING}getSessionToken(e){return z.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,z.resolve()}};var Lc=class{constructor(){this.kr=new tn(Ot.Kr),this.qr=new tn(Ot.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){let a=new Ot(e,n);this.kr=this.kr.add(a),this.qr=this.qr.add(a)}$r(e,n){e.forEach(a=>this.addReference(a,n))}removeReference(e,n){this.Wr(new Ot(e,n))}Qr(e,n){e.forEach(a=>this.removeReference(a,n))}Gr(e){let n=new ne(new ct([])),a=new Ot(n,e),r=new Ot(n,e+1),s=[];return this.qr.forEachInRange([a,r],i=>{this.Wr(i),s.push(i.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let n=new ne(new ct([])),a=new Ot(n,e),r=new Ot(n,e+1),s=Re();return this.qr.forEachInRange([a,r],i=>{s=s.add(i.key)}),s}containsKey(e){let n=new Ot(e,0),a=this.kr.firstAfterOrEqual(n);return a!==null&&e.isEqual(a.key)}},Ot=class{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return ne.comparator(e.key,n.key)||Ae(e.Hr,n.Hr)}static Ur(e,n){return Ae(e.Hr,n.Hr)||ne.comparator(e.key,n.key)}};var $_=class{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new tn(Ot.Kr)}checkEmpty(e){return z.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,a,r){let s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new R_(s,n,a,r);this.mutationQueue.push(i);for(let u of r)this.Jr=this.Jr.add(new Ot(u.key,s)),this.indexManager.addToCollectionParentIndex(e,u.key.path.popLast());return z.resolve(i)}lookupMutationBatch(e,n){return z.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){let a=n+1,r=this.Xr(a),s=r<0?0:r;return z.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return z.resolve(this.mutationQueue.length===0?NN:this.Yn-1)}getAllMutationBatches(e){return z.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){let a=new Ot(n,0),r=new Ot(n,Number.POSITIVE_INFINITY),s=[];return this.Jr.forEachInRange([a,r],i=>{let u=this.Zr(i.Hr);s.push(u)}),z.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let a=new tn(Ae);return n.forEach(r=>{let s=new Ot(r,0),i=new Ot(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([s,i],u=>{a=a.add(u.Hr)})}),z.resolve(this.Yr(a))}getAllMutationBatchesAffectingQuery(e,n){let a=n.path,r=a.length+1,s=a;ne.isDocumentKey(s)||(s=s.child(""));let i=new Ot(new ne(s),0),u=new tn(Ae);return this.Jr.forEachWhile(l=>{let c=l.key.path;return!!a.isPrefixOf(c)&&(c.length===r&&(u=u.add(l.Hr)),!0)},i),z.resolve(this.Yr(u))}Yr(e){let n=[];return e.forEach(a=>{let r=this.Zr(a);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){ht(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let a=this.Jr;return z.forEach(n.mutations,r=>{let s=new Ot(r.key,n.batchId);return a=a.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=a})}nr(e){}containsKey(e,n){let a=new Ot(n,0),r=this.Jr.firstAfterOrEqual(a);return z.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,z.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}};var J_=class{constructor(e){this.ti=e,this.docs=function(){return new At(ne.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){let a=n.key,r=this.docs.get(a),s=r?r.size:0,i=this.ti(n);return this.docs=this.docs.insert(a,{document:n.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,a.path.popLast())}removeEntry(e){let n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){let a=this.docs.get(n);return z.resolve(a?a.document.mutableCopy():Ta.newInvalidDocument(n))}getEntries(e,n){let a=Ds();return n.forEach(r=>{let s=this.docs.get(r);a=a.insert(r,s?s.document.mutableCopy():Ta.newInvalidDocument(r))}),z.resolve(a)}getDocumentsMatchingQuery(e,n,a,r){let s=Ds(),i=n.path,u=new ne(i.child("__id-9223372036854775808__")),l=this.docs.getIteratorFrom(u);for(;l.hasNext();){let{key:c,value:{document:f}}=l.getNext();if(!i.isPrefixOf(c.path))break;c.path.length>i.length+1||PN(DN(f),a)<=0||(r.has(f.key)||Ap(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return z.resolve(s)}getAllFromCollectionGroup(e,n,a,r){oe(9500)}ni(e,n){return z.forEach(this.docs,a=>n(a))}newChangeBuffer(e){return new Z_(this)}getSize(e){return z.resolve(this.size)}},Z_=class extends j_{constructor(e){super(),this.Mr=e}applyChanges(e){let n=[];return this.changes.forEach((a,r)=>{r.isValidDocument()?n.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(a)}),z.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}};var eS=class{constructor(e){this.persistence=e,this.ri=new Br(n=>VS(n),US),this.lastRemoteSnapshotVersion=de.min(),this.highestTargetId=0,this.ii=0,this.si=new Lc,this.targetCount=0,this.oi=Cc._r()}forEachTarget(e,n){return this.ri.forEach((a,r)=>n(r)),z.resolve()}getLastRemoteSnapshotVersion(e){return z.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return z.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),z.resolve(this.highestTargetId)}setTargetsMetadata(e,n,a){return a&&(this.lastRemoteSnapshotVersion=a),n>this.ii&&(this.ii=n),z.resolve()}lr(e){this.ri.set(e.target,e);let n=e.targetId;n>this.highestTargetId&&(this.oi=new Cc(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,z.resolve()}updateTargetData(e,n){return this.lr(n),z.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,z.resolve()}removeTargets(e,n,a){let r=0,s=[];return this.ri.forEach((i,u)=>{u.sequenceNumber<=n&&a.get(u.targetId)===null&&(this.ri.delete(i),s.push(this.removeMatchingKeysForTargetId(e,u.targetId)),r++)}),z.waitFor(s).next(()=>r)}getTargetCount(e){return z.resolve(this.targetCount)}getTargetData(e,n){let a=this.ri.get(n)||null;return z.resolve(a)}addMatchingKeys(e,n,a){return this.si.$r(n,a),z.resolve()}removeMatchingKeys(e,n,a){this.si.Qr(n,a);let r=this.persistence.referenceDelegate,s=[];return r&&n.forEach(i=>{s.push(r.markPotentiallyOrphaned(e,i))}),z.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),z.resolve()}getMatchingKeysForTargetId(e,n){let a=this.si.jr(n);return z.resolve(a)}containsKey(e,n){return z.resolve(this.si.containsKey(n))}};var up=class{constructor(e,n){this._i={},this.overlays={},this.ai=new Zo(0),this.ui=!1,this.ui=!0,this.ci=new Y_,this.referenceDelegate=e(this),this.li=new eS(this),this.indexManager=new B_,this.remoteDocumentCache=function(r){return new J_(r)}(a=>this.referenceDelegate.hi(a)),this.serializer=new F_(n),this.Pi=new X_(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new Q_,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let a=this._i[e.toKey()];return a||(a=new $_(n,this.referenceDelegate),this._i[e.toKey()]=a),a}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,a){$("MemoryPersistence","Starting transaction:",e);let r=new tS(this.ai.next());return this.referenceDelegate.Ti(),a(r).next(s=>this.referenceDelegate.Ii(r).next(()=>s)).toPromise().then(s=>(r.raiseOnCommittedEvent(),s))}Ei(e,n){return z.or(Object.values(this._i).map(a=>()=>a.containsKey(e,n)))}},tS=class extends g_{constructor(e){super(),this.currentSequenceNumber=e}},nS=class t{constructor(e){this.persistence=e,this.Ri=new Lc,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw oe(60996)}addReference(e,n,a){return this.Ri.addReference(a,n),this.di.delete(a.toString()),z.resolve()}removeReference(e,n,a){return this.Ri.removeReference(a,n),this.di.add(a.toString()),z.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),z.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(r=>this.di.add(r.toString()));let a=this.persistence.getTargetCache();return a.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(s=>this.di.add(s.toString()))}).next(()=>a.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){let n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return z.forEach(this.di,a=>{let r=ne.fromPath(a);return this.mi(e,r).next(s=>{s||n.removeEntry(r,de.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(a=>{a?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return z.or([()=>z.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}},lp=class t{constructor(e,n){this.persistence=e,this.fi=new Br(a=>UN(a.path),(a,r)=>a.isEqual(r)),this.garbageCollector=kV(this,n)}static Vi(e,n){return new t(e,n)}Ti(){}Ii(e){return z.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){let n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(a=>n.next(r=>a+r))}pr(e){let n=0;return this.mr(e,a=>{n++}).next(()=>n)}mr(e,n){return z.forEach(this.fi,(a,r)=>this.wr(e,a,r).next(s=>s?z.resolve():n(r)))}removeTargets(e,n,a){return this.persistence.getTargetCache().removeTargets(e,n,a)}removeOrphanedDocuments(e,n){let a=0,r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ni(e,i=>this.wr(e,i,n).next(u=>{u||(a++,s.removeEntry(i,de.min()))})).next(()=>s.apply(e)).next(()=>a)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),z.resolve()}removeTarget(e,n){let a=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,a)}addReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),z.resolve()}removeReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),z.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),z.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Hh(e.data.value)),n}wr(e,n,a){return z.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{let r=this.fi.get(n);return z.resolve(r!==void 0&&r>a)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var aS=class t{constructor(e,n,a,r){this.targetId=e,this.fromCache=n,this.Ts=a,this.Is=r}static Es(e,n){let a=Re(),r=Re();for(let s of n.docChanges)switch(s.type){case 0:a=a.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new t(e,n.fromCache,a,r)}};var rS=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var sS=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return KL()?8:MN($t())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,a,r){let s={result:null};return this.gs(e,n).next(i=>{s.result=i}).next(()=>{if(!s.result)return this.ps(e,n,r,a).next(i=>{s.result=i})}).next(()=>{if(s.result)return;let i=new rS;return this.ys(e,n,i).next(u=>{if(s.result=u,this.As)return this.ws(e,n,i,u.size)})}).next(()=>s.result)}ws(e,n,a,r){return a.documentReadCount<this.Vs?(Ho()<=Se.DEBUG&&$("QueryEngine","SDK will not create cache indexes for query:",Go(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),z.resolve()):(Ho()<=Se.DEBUG&&$("QueryEngine","Query:",Go(n),"scans",a.documentReadCount,"local documents and returns",r,"documents as results."),a.documentReadCount>this.ds*r?(Ho()<=Se.DEBUG&&$("QueryEngine","The SDK decides to create cache indexes for query:",Go(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,ja(n))):z.resolve())}gs(e,n){if(bx(n))return z.resolve(null);let a=ja(n);return this.indexManager.getIndexType(e,a).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=_c(n,null,"F"),a=ja(n)),this.indexManager.getDocumentsMatchingTarget(e,a).next(s=>{let i=Re(...s);return this.fs.getDocuments(e,i).next(u=>this.indexManager.getMinOffset(e,a).next(l=>{let c=this.bs(n,u);return this.Ss(n,c,i,l.readTime)?this.gs(e,_c(n,null,"F")):this.Ds(e,c,n,l)}))})))}ps(e,n,a,r){return bx(n)||r.isEqual(de.min())?z.resolve(null):this.fs.getDocuments(e,a).next(s=>{let i=this.bs(n,s);return this.Ss(n,i,a,r)?z.resolve(null):(Ho()<=Se.DEBUG&&$("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),Go(n)),this.Ds(e,i,n,kN(r,pc)).next(u=>u))})}bs(e,n){let a=new tn(k0(e));return n.forEach((r,s)=>{Ap(e,s)&&(a=a.add(s))}),a}Ss(e,n,a,r){if(e.limit===null)return!1;if(a.size!==n.size)return!0;let s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ys(e,n,a){return Ho()<=Se.DEBUG&&$("QueryEngine","Using full collection scan to execute query:",Go(n)),this.fs.getDocumentsMatchingQuery(e,n,wi.min(),a)}Ds(e,n,a,r){return this.fs.getDocumentsMatchingQuery(e,a,r).next(s=>(n.forEach(i=>{s=s.insert(i.key,i)}),s))}};var qS="LocalStore",DV=3e8,iS=class{constructor(e,n,a,r){this.persistence=e,this.Cs=n,this.serializer=r,this.vs=new At(Ae),this.Fs=new Br(s=>VS(s),US),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(a)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new W_(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}};function PV(t,e,n,a){return new iS(t,e,n,a)}async function J0(t,e){let n=ke(t);return await n.persistence.runTransaction("Handle user change","readonly",a=>{let r;return n.mutationQueue.getAllMutationBatches(a).next(s=>(r=s,n.Os(e),n.mutationQueue.getAllMutationBatches(a))).next(s=>{let i=[],u=[],l=Re();for(let c of r){i.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}for(let c of s){u.push(c.batchId);for(let f of c.mutations)l=l.add(f.key)}return n.localDocuments.getDocuments(a,l).next(c=>({Ns:c,removedBatchIds:i,addedBatchIds:u}))})})}function Z0(t){let e=ke(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function OV(t,e){let n=ke(t),a=e.snapshotVersion,r=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{let i=n.xs.newChangeBuffer({trackRemovals:!0});r=n.vs;let u=[];e.targetChanges.forEach((f,m)=>{let p=r.get(m);if(!p)return;u.push(n.li.removeMatchingKeys(s,f.removedDocuments,m).next(()=>n.li.addMatchingKeys(s,f.addedDocuments,m)));let _=p.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(m)!==null?_=_.withResumeToken(fn.EMPTY_BYTE_STRING,de.min()).withLastLimboFreeSnapshotVersion(de.min()):f.resumeToken.approximateByteSize()>0&&(_=_.withResumeToken(f.resumeToken,a)),r=r.insert(m,_),function(D,L,T){return D.resumeToken.approximateByteSize()===0||L.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=DV?!0:T.addedDocuments.size+T.modifiedDocuments.size+T.removedDocuments.size>0}(p,_,f)&&u.push(n.li.updateTargetData(s,_))});let l=Ds(),c=Re();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&u.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),u.push(MV(s,i,e.documentUpdates).next(f=>{l=f.Bs,c=f.Ls})),!a.isEqual(de.min())){let f=n.li.getLastRemoteSnapshotVersion(s).next(m=>n.li.setTargetsMetadata(s,s.currentSequenceNumber,a));u.push(f)}return z.waitFor(u).next(()=>i.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,l,c)).next(()=>l)}).then(s=>(n.vs=r,s))}function MV(t,e,n){let a=Re(),r=Re();return n.forEach(s=>a=a.add(s)),e.getEntries(t,a).next(s=>{let i=Ds();return n.forEach((u,l)=>{let c=s.get(u);l.isFoundDocument()!==c.isFoundDocument()&&(r=r.add(u)),l.isNoDocument()&&l.version.isEqual(de.min())?(e.removeEntry(u,l.readTime),i=i.insert(u,l)):!c.isValidDocument()||l.version.compareTo(c.version)>0||l.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(l),i=i.insert(u,l)):$(qS,"Ignoring outdated watch update for ",u,". Current version:",c.version," Watch version:",l.version)}),{Bs:i,Ls:r}})}function NV(t,e){let n=ke(t);return n.persistence.runTransaction("Allocate target","readwrite",a=>{let r;return n.li.getTargetData(a,e).next(s=>s?(r=s,z.resolve(r)):n.li.allocateTargetId(a).next(i=>(r=new wc(e,i,"TargetPurposeListen",a.currentSequenceNumber),n.li.addTargetData(a,r).next(()=>r))))}).then(a=>{let r=n.vs.get(a.targetId);return(r===null||a.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.vs=n.vs.insert(a.targetId,a),n.Fs.set(e,a.targetId)),a})}async function oS(t,e,n){let a=ke(t),r=a.vs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await a.persistence.runTransaction("Release target",s,i=>a.persistence.referenceDelegate.removeTarget(i,r))}catch(i){if(!hu(i))throw i;$(qS,`Failed to update sequence numbers for target ${e}: ${i}`)}a.vs=a.vs.remove(e),a.Fs.delete(r.target)}function Mx(t,e,n){let a=ke(t),r=de.min(),s=Re();return a.persistence.runTransaction("Execute query","readwrite",i=>function(l,c,f){let m=ke(l),p=m.Fs.get(f);return p!==void 0?z.resolve(m.vs.get(p)):m.li.getTargetData(c,f)}(a,i,ja(e)).next(u=>{if(u)return r=u.lastLimboFreeSnapshotVersion,a.li.getMatchingKeysForTargetId(i,u.targetId).next(l=>{s=l})}).next(()=>a.Cs.getDocumentsMatchingQuery(i,e,n?r:de.min(),n?s:Re())).next(u=>(VV(a,nV(e),u),{documents:u,ks:s})))}function VV(t,e,n){let a=t.Ms.get(e)||de.min();n.forEach((r,s)=>{s.readTime.compareTo(a)>0&&(a=s.readTime)}),t.Ms.set(e,a)}var cp=class{constructor(){this.activeTargetIds=uV()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var uS=class{constructor(){this.vo=new cp,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,a){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,a){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new cp,Promise.resolve()}handleUserChange(e,n,a){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var lS=class{Mo(e){}shutdown(){}};var Nx="ConnectivityMonitor",dp=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){$(Nx,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){$(Nx,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var zh=null;function cS(){return zh===null?zh=function(){return 268435456+Math.round(2147483648*Math.random())}():zh++,"0x"+zh.toString(16)}var l_="RestConnection",UV={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},dS=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let n=e.ssl?"https":"http",a=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${a}/databases/${r}`,this.$o=this.databaseId.database===ep?`project_id=${a}`:`project_id=${a}&database_id=${r}`}Wo(e,n,a,r,s){let i=cS(),u=this.Qo(e,n.toUriEncodedString());$(l_,`Sending RPC '${e}' ${i}:`,u,a);let l={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(l,r,s);let{host:c}=new URL(u),f=Na(c);return this.zo(e,u,l,a,f).then(m=>($(l_,`Received RPC '${e}' ${i}: `,m),m),m=>{throw Mr(l_,`RPC '${e}' ${i} failed with error: `,m,"url: ",u,"request:",a),m})}jo(e,n,a,r,s,i){return this.Wo(e,n,a,r,s)}Go(e,n,a){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+du}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,s)=>e[s]=r),a&&a.headers.forEach((r,s)=>e[s]=r)}Qo(e,n){let a=UV[e],r=`${this.qo}/v1/${n}:${a}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var fS=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var In="WebChannelConnection",lc=(t,e,n)=>{t.listen(e,a=>{try{n(a)}catch(r){setTimeout(()=>{throw r},0)}})},fp=class t extends dS{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=r_();lc(e,a_.STAT_EVENT,n=>{n.stat===Fh.PROXY?$(In,"STAT_EVENT: detected buffering proxy"):n.stat===Fh.NOPROXY&&$(In,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,n,a,r,s){let i=cS();return new Promise((u,l)=>{let c=new t_;c.setWithCredentials(!0),c.listenOnce(n_.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case uc.NO_ERROR:let m=c.getResponseJson();$(In,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(m)),u(m);break;case uc.TIMEOUT:$(In,`RPC '${e}' ${i} timed out`),l(new Q(B.DEADLINE_EXCEEDED,"Request time out"));break;case uc.HTTP_ERROR:let p=c.getStatus();if($(In,`RPC '${e}' ${i} failed with status:`,p,"response text:",c.getResponseText()),p>0){let _=c.getResponseJson();Array.isArray(_)&&(_=_[0]);let R=_?.error;if(R&&R.status&&R.message){let D=function(T){let I=T.toLowerCase().replace(/_/g,"-");return Object.values(B).indexOf(I)>=0?I:B.UNKNOWN}(R.status);l(new Q(D,R.message))}else l(new Q(B.UNKNOWN,"Server responded with status "+c.getStatus()))}else l(new Q(B.UNAVAILABLE,"Connection failed."));break;default:oe(9055,{l_:e,streamId:i,h_:c.getLastErrorCode(),P_:c.getLastError()})}}finally{$(In,`RPC '${e}' ${i} completed.`)}});let f=JSON.stringify(r);$(In,`RPC '${e}' ${i} sending request:`,r),c.send(n,"POST",f,a,15)})}T_(e,n,a){let r=cS(),s=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),u={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},l=this.longPollingOptions.timeoutSeconds;l!==void 0&&(u.longPollingTimeout=Math.round(1e3*l)),this.useFetchStreams&&(u.useFetchStreams=!0),this.Go(u.initMessageHeaders,n,a),u.encodeInitMessageHeaders=!0;let c=s.join("");$(In,`Creating RPC '${e}' stream ${r}: ${c}`,u);let f=i.createWebChannel(c,u);this.I_(f);let m=!1,p=!1,_=new fS({Ho:R=>{p?$(In,`Not sending because RPC '${e}' stream ${r} is closed:`,R):(m||($(In,`Opening RPC '${e}' stream ${r} transport.`),f.open(),m=!0),$(In,`RPC '${e}' stream ${r} sending:`,R),f.send(R))},Jo:()=>f.close()});return lc(f,zo.EventType.OPEN,()=>{p||($(In,`RPC '${e}' stream ${r} transport opened.`),_.i_())}),lc(f,zo.EventType.CLOSE,()=>{p||(p=!0,$(In,`RPC '${e}' stream ${r} transport closed`),_.o_(),this.E_(f))}),lc(f,zo.EventType.ERROR,R=>{p||(p=!0,Mr(In,`RPC '${e}' stream ${r} transport errored. Name:`,R.name,"Message:",R.message),_.o_(new Q(B.UNAVAILABLE,"The operation could not be completed")))}),lc(f,zo.EventType.MESSAGE,R=>{if(!p){let D=R.data[0];ht(!!D,16349);let L=D,T=L?.error||L[0]?.error;if(T){$(In,`RPC '${e}' stream ${r} received error:`,T);let I=T.status,w=function(j){let S=Pt[j];if(S!==void 0)return B0(S)}(I),x=T.message;I==="NOT_FOUND"&&x.includes("database")&&x.includes("does not exist")&&x.includes(this.databaseId.database)&&Mr(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),w===void 0&&(w=B.INTERNAL,x="Unknown error status: "+I+" with message "+T.message),p=!0,_.o_(new Q(w,x)),f.close()}else $(In,`RPC '${e}' stream ${r} received:`,D),_.__(D)}}),t.u_(),setTimeout(()=>{_.s_()},0),_}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,a){super.Go(e,n,a),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return s_()}};function FV(t){return new fp(t)}function c_(){return typeof document<"u"?document:null}function Nc(t){return new M_(t,!0)}fp.c_=!1;var hp=class{constructor(e,n,a=1e3,r=1.5,s=6e4){this.Ci=e,this.timerId=n,this.R_=a,this.A_=r,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let n=Math.floor(this.d_+this.y_()),a=Math.max(0,Date.now()-this.f_),r=Math.max(0,n-a);r>0&&$("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${a} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var Vx="PersistentStream",hS=class{constructor(e,n,a,r,s,i,u,l){this.Ci=e,this.b_=a,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=u,this.listener=l,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new hp(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===B.RESOURCE_EXHAUSTED?(Or(n.toString()),Or("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===B.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([a,r])=>{this.D_===n&&this.G_(a,r)},a=>{e(()=>{let r=new Q(B.UNKNOWN,"Fetching auth token failed: "+a.message);return this.z_(r)})})}G_(e,n){let a=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{a(()=>this.listener.Zo())}),this.stream.Yo(()=>{a(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{a(()=>this.z_(r))}),this.stream.onMessage(r=>{a(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return $(Vx,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():($(Vx,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},pS=class extends hS{constructor(e,n,a,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,a,r,i),this.serializer=s}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let n=TV(this.serializer,e),a=function(s){if(!("targetChange"in s))return de.min();let i=s.targetChange;return i.targetIds&&i.targetIds.length?de.min():i.readTime?Yo(i.readTime):de.min()}(e);return this.listener.J_(n,a)}Z_(e){let n={};n.database=kx(this.serializer),n.addTarget=function(s,i){let u,l=i.target;if(u=x_(l)?{documents:bV(s,l)}:{query:EV(s,l).ft},u.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){u.resumeToken=q0(s,i.resumeToken);let c=N_(s,i.expectedCount);c!==null&&(u.expectedCount=c)}else if(i.snapshotVersion.compareTo(de.min())>0){u.readTime=V_(s,i.snapshotVersion.toTimestamp());let c=N_(s,i.expectedCount);c!==null&&(u.expectedCount=c)}return u}(this.serializer,e);let a=CV(this.serializer,e);a&&(n.labels=a),this.K_(n)}X_(e){let n={};n.database=kx(this.serializer),n.removeTarget=e,this.K_(n)}};var mS=class{},gS=class extends mS{constructor(e,n,a,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=a,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new Q(B.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,a,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Wo(e,U_(n,a),r,s,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===B.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new Q(B.UNKNOWN,s.toString())})}jo(e,n,a,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,u])=>this.connection.jo(e,U_(n,a),r,i,u,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===B.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new Q(B.UNKNOWN,i.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function BV(t,e,n,a){return new gS(t,e,n,a)}var yS=class{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Or(n),this.aa=!1):$("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var ou="RemoteStore",IS=class{constructor(e,n,a,r,s){this.localStore=e,this.datastore=n,this.asyncQueue=a,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(i=>{a.enqueueAndForget(async()=>{Uc(this)&&($(ou,"Restarting streams for network reachability change."),await async function(l){let c=ke(l);c.Ea.add(4),await Vc(c),c.Va.set("Unknown"),c.Ea.delete(4),await xp(c)}(this))})}),this.Va=new yS(a,r)}};async function xp(t){if(Uc(t))for(let e of t.Ra)await e(!0)}async function Vc(t){for(let e of t.Ra)await e(!1)}function eR(t,e){let n=ke(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),jS(n)?GS(n):mu(n).O_()&&HS(n,e))}function zS(t,e){let n=ke(t),a=mu(n);n.Ia.delete(e),a.O_()&&tR(n,e),n.Ia.size===0&&(a.O_()?a.L_():Uc(n)&&n.Va.set("Unknown"))}function HS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(de.min())>0){let n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}mu(t).Z_(e)}function tR(t,e){t.da.$e(e),mu(t).X_(e)}function GS(t){t.da=new O_({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),mu(t).start(),t.Va.ua()}function jS(t){return Uc(t)&&!mu(t).x_()&&t.Ia.size>0}function Uc(t){return ke(t).Ea.size===0}function nR(t){t.da=void 0}async function qV(t){t.Va.set("Online")}async function zV(t){t.Ia.forEach((e,n)=>{HS(t,e)})}async function HV(t,e){nR(t),jS(t)?(t.Va.ha(e),GS(t)):t.Va.set("Unknown")}async function GV(t,e,n){if(t.Va.set("Online"),e instanceof sp&&e.state===2&&e.cause)try{await async function(r,s){let i=s.cause;for(let u of s.targetIds)r.Ia.has(u)&&(await r.remoteSyncer.rejectListen(u,i),r.Ia.delete(u),r.da.removeTarget(u))}(t,e)}catch(a){$(ou,"Failed to remove targets %s: %s ",e.targetIds.join(","),a),await Ux(t,a)}else if(e instanceof Qo?t.da.Xe(e):e instanceof rp?t.da.st(e):t.da.tt(e),!n.isEqual(de.min()))try{let a=await Z0(t.localStore);n.compareTo(a)>=0&&await function(s,i){let u=s.da.Tt(i);return u.targetChanges.forEach((l,c)=>{if(l.resumeToken.approximateByteSize()>0){let f=s.Ia.get(c);f&&s.Ia.set(c,f.withResumeToken(l.resumeToken,i))}}),u.targetMismatches.forEach((l,c)=>{let f=s.Ia.get(l);if(!f)return;s.Ia.set(l,f.withResumeToken(fn.EMPTY_BYTE_STRING,f.snapshotVersion)),tR(s,l);let m=new wc(f.target,l,c,f.sequenceNumber);HS(s,m)}),s.remoteSyncer.applyRemoteEvent(u)}(t,n)}catch(a){$(ou,"Failed to raise snapshot:",a),await Ux(t,a)}}async function Ux(t,e,n){if(!hu(e))throw e;t.Ea.add(1),await Vc(t),t.Va.set("Offline"),n||(n=()=>Z0(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{$(ou,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await xp(t)})}async function Fx(t,e){let n=ke(t);n.asyncQueue.verifyOperationInProgress(),$(ou,"RemoteStore received new credentials");let a=Uc(n);n.Ea.add(3),await Vc(n),a&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await xp(n)}async function jV(t,e){let n=ke(t);e?(n.Ea.delete(2),await xp(n)):e||(n.Ea.add(2),await Vc(n),n.Va.set("Unknown"))}function mu(t){return t.ma||(t.ma=function(n,a,r){let s=ke(n);return s.sa(),new pS(a,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,r)}(t.datastore,t.asyncQueue,{Zo:qV.bind(null,t),Yo:zV.bind(null,t),t_:HV.bind(null,t),J_:GV.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),jS(t)?GS(t):t.Va.set("Unknown")):(await t.ma.stop(),nR(t))})),t.ma}var _S=class t{constructor(e,n,a,r,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=a,this.op=r,this.removalCallback=s,this.deferred=new Dr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(i=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,a,r,s){let i=Date.now()+a,u=new t(e,n,i,r,s);return u.start(a),u}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new Q(B.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function aR(t,e){if(Or("AsyncQueue",`${e}: ${t}`),hu(t))return new Q(B.UNAVAILABLE,`${e}: ${t}`);throw t}var Ac=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(n,a)=>e(n,a)||ne.comparator(n.key,a.key):(n,a)=>ne.comparator(n.key,a.key),this.keyedMap=cc(),this.sortedSet=new At(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,a)=>(e(n),!1))}add(e){let n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){let n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.sortedSet.getIterator(),a=e.sortedSet.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(!r.isEqual(s))return!1}return!0}toString(){let e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){let a=new t;return a.comparator=this.comparator,a.keyedMap=e,a.sortedSet=n,a}};var pp=class{constructor(){this.ga=new At(ne.comparator)}track(e){let n=e.doc.key,a=this.ga.get(n);a?e.type!==0&&a.type===3?this.ga=this.ga.insert(n,e):e.type===3&&a.type!==1?this.ga=this.ga.insert(n,{type:a.type,doc:e.doc}):e.type===2&&a.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&a.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&a.type===0?this.ga=this.ga.remove(n):e.type===1&&a.type===2?this.ga=this.ga.insert(n,{type:1,doc:a.doc}):e.type===0&&a.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):oe(63341,{Vt:e,pa:a}):this.ga=this.ga.insert(n,e)}ya(){let e=[];return this.ga.inorderTraversal((n,a)=>{e.push(a)}),e}},Ci=class t{constructor(e,n,a,r,s,i,u,l,c){this.query=e,this.docs=n,this.oldDocs=a,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=u,this.excludesMetadataChanges=l,this.hasCachedResults=c}static fromInitialDocuments(e,n,a,r,s){let i=[];return n.forEach(u=>{i.push({type:0,doc:u})}),new t(e,n,Ac.emptySet(n),i,a,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Lp(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let n=this.docChanges,a=e.docChanges;if(n.length!==a.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==a[r].type||!n[r].doc.isEqual(a[r].doc))return!1;return!0}};var SS=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},vS=class{constructor(){this.queries=Bx(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,a){let r=ke(n),s=r.queries;r.queries=Bx(),s.forEach((i,u)=>{for(let l of u.ba)l.onError(a)})})(this,new Q(B.ABORTED,"Firestore shutting down"))}};function Bx(){return new Br(t=>R0(t),Lp)}async function KV(t,e){let n=ke(t),a=3,r=e.query,s=n.queries.get(r);s?!s.Sa()&&e.Da()&&(a=2):(s=new SS,a=e.Da()?0:1);try{switch(a){case 0:s.wa=await n.onListen(r,!0);break;case 1:s.wa=await n.onListen(r,!1);break;case 2:await n.onFirstRemoteStoreListen(r)}}catch(i){let u=aR(i,`Initialization of query '${Go(e.query)}' failed`);return void e.onError(u)}n.queries.set(r,s),s.ba.push(e),e.va(n.onlineState),s.wa&&e.Fa(s.wa)&&KS(n)}async function WV(t,e){let n=ke(t),a=e.query,r=3,s=n.queries.get(a);if(s){let i=s.ba.indexOf(e);i>=0&&(s.ba.splice(i,1),s.ba.length===0?r=e.Da()?0:1:!s.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return n.queries.delete(a),n.onUnlisten(a,!0);case 1:return n.queries.delete(a),n.onUnlisten(a,!1);case 2:return n.onLastRemoteStoreUnlisten(a);default:return}}function XV(t,e){let n=ke(t),a=!1;for(let r of e){let s=r.query,i=n.queries.get(s);if(i){for(let u of i.ba)u.Fa(r)&&(a=!0);i.wa=r}}a&&KS(n)}function QV(t,e,n){let a=ke(t),r=a.queries.get(e);if(r)for(let s of r.ba)s.onError(n);a.queries.delete(e)}function KS(t){t.Ca.forEach(e=>{e.next()})}var TS,qx;(qx=TS||(TS={})).Ma="default",qx.Cache="cache";var bS=class{constructor(e,n,a){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=a||{}}Fa(e){if(!this.options.includeMetadataChanges){let a=[];for(let r of e.docChanges)r.type!==3&&a.push(r);e=new Ci(e.query,e.docs,e.oldDocs,a,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;let a=n!=="Offline";return(!this.options.Ka||!a)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=Ci.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==TS.Cache}};var mp=class{constructor(e){this.key=e}},gp=class{constructor(e){this.key=e}},ES=class{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Re(),this.mutatedKeys=Re(),this.eu=k0(e),this.tu=new Ac(this.eu)}get nu(){return this.Za}ru(e,n){let a=n?n.iu:new pp,r=n?n.tu:this.tu,s=n?n.mutatedKeys:this.mutatedKeys,i=r,u=!1,l=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,c=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((f,m)=>{let p=r.get(f),_=Ap(this.query,m)?m:null,R=!!p&&this.mutatedKeys.has(p.key),D=!!_&&(_.hasLocalMutations||this.mutatedKeys.has(_.key)&&_.hasCommittedMutations),L=!1;p&&_?p.data.isEqual(_.data)?R!==D&&(a.track({type:3,doc:_}),L=!0):this.su(p,_)||(a.track({type:2,doc:_}),L=!0,(l&&this.eu(_,l)>0||c&&this.eu(_,c)<0)&&(u=!0)):!p&&_?(a.track({type:0,doc:_}),L=!0):p&&!_&&(a.track({type:1,doc:p}),L=!0,(l||c)&&(u=!0)),L&&(_?(i=i.add(_),s=D?s.add(f):s.delete(f)):(i=i.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;i.size>this.query.limit;){let f=this.query.limitType==="F"?i.last():i.first();i=i.delete(f.key),s=s.delete(f.key),a.track({type:1,doc:f})}return{tu:i,iu:a,Ss:u,mutatedKeys:s}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,a,r){let s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let i=e.iu.ya();i.sort((f,m)=>function(_,R){let D=L=>{switch(L){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return oe(20277,{Vt:L})}};return D(_)-D(R)}(f.type,m.type)||this.eu(f.doc,m.doc)),this.ou(a),r=r??!1;let u=n&&!r?this._u():[],l=this.Ya.size===0&&this.current&&!r?1:0,c=l!==this.Xa;return this.Xa=l,i.length!==0||c?{snapshot:new Ci(this.query,e.tu,s,i,e.mutatedKeys,l===0,c,!1,!!a&&a.resumeToken.approximateByteSize()>0),au:u}:{au:u}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new pp,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=Re(),this.tu.forEach(a=>{this.uu(a.key)&&(this.Ya=this.Ya.add(a.key))});let n=[];return e.forEach(a=>{this.Ya.has(a)||n.push(new gp(a))}),this.Ya.forEach(a=>{e.has(a)||n.push(new mp(a))}),n}cu(e){this.Za=e.ks,this.Ya=Re();let n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return Ci.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},WS="SyncEngine",wS=class{constructor(e,n,a){this.query=e,this.targetId=n,this.view=a}},CS=class{constructor(e){this.key=e,this.hu=!1}},LS=class{constructor(e,n,a,r,s,i){this.localStore=e,this.remoteStore=n,this.eventManager=a,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new Br(u=>R0(u),Lp),this.Iu=new Map,this.Eu=new Set,this.Ru=new At(ne.comparator),this.Au=new Map,this.Vu=new Lc,this.du={},this.mu=new Map,this.fu=Cc.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function YV(t,e,n=!0){let a=uR(t),r,s=a.Tu.get(e);return s?(a.sharedClientState.addLocalQueryTarget(s.targetId),r=s.view.lu()):r=await rR(a,e,n,!0),r}async function $V(t,e){let n=uR(t);await rR(n,e,!0,!1)}async function rR(t,e,n,a){let r=await NV(t.localStore,ja(e)),s=r.targetId,i=t.sharedClientState.addLocalQueryTarget(s,n),u;return a&&(u=await JV(t,e,s,i==="current",r.resumeToken)),t.isPrimaryClient&&n&&eR(t.remoteStore,r),u}async function JV(t,e,n,a,r){t.pu=(m,p,_)=>async function(D,L,T,I){let w=L.view.ru(T);w.Ss&&(w=await Mx(D.localStore,L.query,!1).then(({documents:S})=>L.view.ru(S,w)));let x=I&&I.targetChanges.get(L.targetId),H=I&&I.targetMismatches.get(L.targetId)!=null,j=L.view.applyChanges(w,D.isPrimaryClient,x,H);return Hx(D,L.targetId,j.au),j.snapshot}(t,m,p,_);let s=await Mx(t.localStore,e,!0),i=new ES(e,s.ks),u=i.ru(s.documents),l=Ec.createSynthesizedTargetChangeForCurrentChange(n,a&&t.onlineState!=="Offline",r),c=i.applyChanges(u,t.isPrimaryClient,l);Hx(t,n,c.au);let f=new wS(e,n,i);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),c.snapshot}async function ZV(t,e,n){let a=ke(t),r=a.Tu.get(e),s=a.Iu.get(r.targetId);if(s.length>1)return a.Iu.set(r.targetId,s.filter(i=>!Lp(i,e))),void a.Tu.delete(e);a.isPrimaryClient?(a.sharedClientState.removeLocalQueryTarget(r.targetId),a.sharedClientState.isActiveQueryTarget(r.targetId)||await oS(a.localStore,r.targetId,!1).then(()=>{a.sharedClientState.clearQueryState(r.targetId),n&&zS(a.remoteStore,r.targetId),AS(a,r.targetId)}).catch(Tp)):(AS(a,r.targetId),await oS(a.localStore,r.targetId,!0))}async function eU(t,e){let n=ke(t),a=n.Tu.get(e),r=n.Iu.get(a.targetId);n.isPrimaryClient&&r.length===1&&(n.sharedClientState.removeLocalQueryTarget(a.targetId),zS(n.remoteStore,a.targetId))}async function sR(t,e){let n=ke(t);try{let a=await OV(n.localStore,e);e.targetChanges.forEach((r,s)=>{let i=n.Au.get(s);i&&(ht(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?i.hu=!0:r.modifiedDocuments.size>0?ht(i.hu,14607):r.removedDocuments.size>0&&(ht(i.hu,42227),i.hu=!1))}),await oR(n,a,e)}catch(a){await Tp(a)}}function zx(t,e,n){let a=ke(t);if(a.isPrimaryClient&&n===0||!a.isPrimaryClient&&n===1){let r=[];a.Tu.forEach((s,i)=>{let u=i.view.va(e);u.snapshot&&r.push(u.snapshot)}),function(i,u){let l=ke(i);l.onlineState=u;let c=!1;l.queries.forEach((f,m)=>{for(let p of m.ba)p.va(u)&&(c=!0)}),c&&KS(l)}(a.eventManager,e),r.length&&a.Pu.J_(r),a.onlineState=e,a.isPrimaryClient&&a.sharedClientState.setOnlineState(e)}}async function tU(t,e,n){let a=ke(t);a.sharedClientState.updateQueryState(e,"rejected",n);let r=a.Au.get(e),s=r&&r.key;if(s){let i=new At(ne.comparator);i=i.insert(s,Ta.newNoDocument(s,de.min()));let u=Re().add(s),l=new ap(de.min(),new Map,new At(Ae),i,u);await sR(a,l),a.Ru=a.Ru.remove(s),a.Au.delete(e),XS(a)}else await oS(a.localStore,e,!1).then(()=>AS(a,e,n)).catch(Tp)}function AS(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(let a of t.Iu.get(e))t.Tu.delete(a),n&&t.Pu.yu(a,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(a=>{t.Vu.containsKey(a)||iR(t,a)})}function iR(t,e){t.Eu.delete(e.path.canonicalString());let n=t.Ru.get(e);n!==null&&(zS(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),XS(t))}function Hx(t,e,n){for(let a of n)a instanceof mp?(t.Vu.addReference(a.key,e),nU(t,a)):a instanceof gp?($(WS,"Document no longer in limbo: "+a.key),t.Vu.removeReference(a.key,e),t.Vu.containsKey(a.key)||iR(t,a.key)):oe(19791,{wu:a})}function nU(t,e){let n=e.key,a=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(a)||($(WS,"New document in limbo: "+n),t.Eu.add(a),XS(t))}function XS(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let n=new ne(ct.fromString(e)),a=t.fu.next();t.Au.set(a,new CS(n)),t.Ru=t.Ru.insert(n,a),eR(t.remoteStore,new wc(ja(FS(n.path)),a,"TargetPurposeLimboResolution",Zo.ce))}}async function oR(t,e,n){let a=ke(t),r=[],s=[],i=[];a.Tu.isEmpty()||(a.Tu.forEach((u,l)=>{i.push(a.pu(l,e,n).then(c=>{if((c||n)&&a.isPrimaryClient){let f=c?!c.fromCache:n?.targetChanges.get(l.targetId)?.current;a.sharedClientState.updateQueryState(l.targetId,f?"current":"not-current")}if(c){r.push(c);let f=aS.Es(l.targetId,c);s.push(f)}}))}),await Promise.all(i),a.Pu.J_(r),await async function(l,c){let f=ke(l);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",m=>z.forEach(c,p=>z.forEach(p.Ts,_=>f.persistence.referenceDelegate.addReference(m,p.targetId,_)).next(()=>z.forEach(p.Is,_=>f.persistence.referenceDelegate.removeReference(m,p.targetId,_)))))}catch(m){if(!hu(m))throw m;$(qS,"Failed to update sequence numbers: "+m)}for(let m of c){let p=m.targetId;if(!m.fromCache){let _=f.vs.get(p),R=_.snapshotVersion,D=_.withLastLimboFreeSnapshotVersion(R);f.vs=f.vs.insert(p,D)}}}(a.localStore,s))}async function aU(t,e){let n=ke(t);if(!n.currentUser.isEqual(e)){$(WS,"User change. New user:",e.toKey());let a=await J0(n.localStore,e);n.currentUser=e,function(s,i){s.mu.forEach(u=>{u.forEach(l=>{l.reject(new Q(B.CANCELLED,i))})}),s.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,a.removedBatchIds,a.addedBatchIds),await oR(n,a.Ns)}}function rU(t,e){let n=ke(t),a=n.Au.get(e);if(a&&a.hu)return Re().add(a.key);{let r=Re(),s=n.Iu.get(e);if(!s)return r;for(let i of s){let u=n.Tu.get(i);r=r.unionWith(u.view.nu)}return r}}function uR(t){let e=ke(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=sR.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=rU.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=tU.bind(null,e),e.Pu.J_=XV.bind(null,e.eventManager),e.Pu.yu=QV.bind(null,e.eventManager),e}var Li=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Nc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return PV(this.persistence,new sS,e.initialUser,this.serializer)}Cu(e){return new up(nS.Vi,this.serializer)}Du(e){return new uS}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};Li.provider={build:()=>new Li};var yp=class extends Li{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){ht(this.persistence.referenceDelegate instanceof lp,46915);let a=this.persistence.referenceDelegate.garbageCollector;return new H_(a,e.asyncQueue,n)}Cu(e){let n=this.cacheSizeBytes!==void 0?ha.withCacheSize(this.cacheSizeBytes):ha.DEFAULT;return new up(a=>lp.Vi(a,n),this.serializer)}};var uu=class{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=a=>zx(this.syncEngine,a,1),this.remoteStore.remoteSyncer.handleCredentialChange=aU.bind(null,this.syncEngine),await jV(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new vS}()}createDatastore(e){let n=Nc(e.databaseInfo.databaseId),a=FV(e.databaseInfo);return BV(e.authCredentials,e.appCheckCredentials,a,n)}createRemoteStore(e){return function(a,r,s,i,u){return new IS(a,r,s,i,u)}(this.localStore,this.datastore,e.asyncQueue,n=>zx(this.syncEngine,n,0),function(){return dp.v()?new dp:new lS}())}createSyncEngine(e,n){return function(r,s,i,u,l,c,f){let m=new LS(r,s,i,u,l,c);return f&&(m.gu=!0),m}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){await async function(n){let a=ke(n);$(ou,"RemoteStore shutting down."),a.Ea.add(5),await Vc(a),a.Aa.shutdown(),a.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};uu.provider={build:()=>new uu};var xS=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):Or("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}};var Ps="FirestoreClient",RS=class{constructor(e,n,a,r,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=a,this._databaseInfo=r,this.user=en.UNAUTHENTICATED,this.clientId=$o.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(a,async i=>{$(Ps,"Received user=",i.uid),await this.authCredentialListener(i),this.user=i}),this.appCheckCredentials.start(a,i=>($(Ps,"Received new app check token=",i),this.appCheckCredentialListener(i,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new Dr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){let a=aR(n,"Failed to shutdown persistence");e.reject(a)}}),e.promise}};async function d_(t,e){t.asyncQueue.verifyOperationInProgress(),$(Ps,"Initializing OfflineComponentProvider");let n=t.configuration;await e.initialize(n);let a=n.initialUser;t.setCredentialChangeListener(async r=>{a.isEqual(r)||(await J0(e.localStore,r),a=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Gx(t,e){t.asyncQueue.verifyOperationInProgress();let n=await sU(t);$(Ps,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(a=>Fx(e.remoteStore,a)),t.setAppCheckTokenChangeListener((a,r)=>Fx(e.remoteStore,r)),t._onlineComponents=e}async function sU(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){$(Ps,"Using user provided OfflineComponentProvider");try{await d_(t,t._uninitializedComponentsProvider._offline)}catch(e){let n=e;if(!function(r){return r.name==="FirebaseError"?r.code===B.FAILED_PRECONDITION||r.code===B.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(n))throw n;Mr("Error using user provided cache. Falling back to memory cache: "+n),await d_(t,new Li)}}else $(Ps,"Using default OfflineComponentProvider"),await d_(t,new yp(void 0));return t._offlineComponents}async function iU(t){return t._onlineComponents||(t._uninitializedComponentsProvider?($(Ps,"Using user provided OnlineComponentProvider"),await Gx(t,t._uninitializedComponentsProvider._online)):($(Ps,"Using default OnlineComponentProvider"),await Gx(t,new uu))),t._onlineComponents}async function oU(t){let e=await iU(t),n=e.eventManager;return n.onListen=YV.bind(null,e.syncEngine),n.onUnlisten=ZV.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=$V.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=eU.bind(null,e.syncEngine),n}function lR(t,e,n={}){let a=new Dr;return t.asyncQueue.enqueueAndForget(async()=>function(s,i,u,l,c){let f=new xS({next:p=>{f.Nu(),i.enqueueAndForget(()=>WV(s,m)),p.fromCache&&l.source==="server"?c.reject(new Q(B.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(p)},error:p=>c.reject(p)}),m=new bS(u,f,{includeMetadataChanges:!0,Ka:!0});return KV(s,m)}(await oU(t),t.asyncQueue,e,n,a)),a.promise}function cR(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var uU="ComponentProvider",jx=new Map;function lU(t,e,n,a,r){return new y_(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,cR(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,a)}var dR="firestore.googleapis.com",Kx=!0,Ip=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new Q(B.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=dR,this.ssl=Kx}else this.host=e.host,this.ssl=e.ssl??Kx;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=$0;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<RV)throw new Q(B.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}$x("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=cR(e.experimentalLongPollingOptions??{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new Q(B.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new Q(B.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new Q(B.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(a,r){return a.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},xc=class{constructor(e,n,a,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=a,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ip({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new Q(B.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new Q(B.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ip(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(a){if(!a)return new Kh;switch(a.type){case"firstParty":return new p_(a.sessionIndex||"0",a.iamToken||null,a.authTokenFactory||null);case"provider":return a.client;default:throw new Q(B.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){let a=jx.get(n);a&&($(uU,"Removing Datastore"),jx.delete(n),a.terminate())}(this),Promise.resolve()}};function fR(t,e,n,a={}){t=Pc(t,xc);let r=Na(e),s=t._getSettings(),i={...s,emulatorOptions:t._getEmulatorOptions()},u=`${e}:${n}`;r&&(Po(`https://${u}`),Oo("Firestore",!0)),s.host!==dR&&s.host!==u&&Mr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let l={...s,host:u,ssl:r,emulatorOptions:a};if(!Sa(l,i)&&(t._setSettings(l),a.mockUserToken)){let c,f;if(typeof a.mockUserToken=="string")c=a.mockUserToken,f=en.MOCK_USER;else{c=th(a.mockUserToken,t._app?.options.projectId);let m=a.mockUserToken.sub||a.mockUserToken.user_id;if(!m)throw new Q(B.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new en(m)}t._authCredentials=new f_(new jh(c,f))}}var ba=class t{constructor(e,n,a){this.converter=n,this._query=a,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},Bn=class t{constructor(e,n,a){this.converter=n,this._key=a,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new bi(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,a){if(fu(n,t._jsonSchema))return new t(e,a||null,new ne(ct.fromString(n.referencePath)))}};Bn._jsonSchemaVersion="firestore/documentReference/1.0",Bn._jsonSchema={type:Lt("string",Bn._jsonSchemaVersion),referencePath:Lt("string")};var bi=class t extends ba{constructor(e,n,a){super(e,n,FS(a)),this._path=a,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new Bn(this.firestore,null,new ne(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function Fc(t,e,...n){if(t=Jt(t),RN("collection","path",e),t instanceof xc){let a=ct.fromString(e,...n);return dx(a),new bi(t,null,a)}{if(!(t instanceof Bn||t instanceof bi))throw new Q(B.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let a=t._path.child(ct.fromString(e,...n));return dx(a),new bi(t.firestore,null,a)}}var Wx="AsyncQueue",_p=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new hp(this,"async_queue_retry"),this._c=()=>{let a=c_();a&&$(Wx,"Visibility state changed to "+a.visibilityState),this.M_.w_()},this.ac=e;let n=c_();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let n=c_();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let n=new Dr;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!hu(e))throw e;$(Wx,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let n=this.ac.then(()=>(this.rc=!0,e().catch(a=>{throw this.nc=a,this.rc=!1,Or("INTERNAL UNHANDLED ERROR: ",Xx(a)),a}).then(a=>(this.rc=!1,a))));return this.ac=n,n}enqueueAfterDelay(e,n,a){this.uc(),this.oc.indexOf(e)>-1&&(n=0);let r=_S.createAndSchedule(this,e,n,a,s=>this.hc(s));return this.tc.push(r),r}uc(){this.nc&&oe(47125,{Pc:Xx(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,a)=>n.targetTimeMs-a.targetTimeMs);for(let n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let n=this.tc.indexOf(e);this.tc.splice(n,1)}};function Xx(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var lu=class extends xc{constructor(e,n,a,r){super(e,n,a,r),this.type="firestore",this._queue=new _p,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new _p(e),this._firestoreClient=void 0,await e}}};function QS(t,e){let n=typeof t=="object"?t:Uo(),a=typeof t=="string"?t:e||ep,r=di(n,"firestore").getImmediate({identifier:a});if(!r._initialized){let s=eh("firestore");s&&fR(r,...s)}return r}function YS(t){if(t._terminated)throw new Q(B.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||cU(t),t._firestoreClient}function cU(t){let e=t._freezeSettings(),n=lU(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new RS(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(r){let s=r?._online.build();return{_offline:r?._offline.build(s),_online:s}}(t._componentsProvider))}var Ka=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(fn.fromBase64String(e))}catch(n){throw new Q(B.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new t(fn.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(fu(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};Ka._jsonSchemaVersion="firestore/bytes/1.0",Ka._jsonSchema={type:Lt("string",Ka._jsonSchemaVersion),bytes:Lt("string")};var cu=class{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new Q(B.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new ta(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var Rc=class{constructor(e){this._methodName=e}};var Pr=class t{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new Q(B.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new Q(B.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Ae(this._lat,e._lat)||Ae(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(fu(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};Pr._jsonSchemaVersion="firestore/geoPoint/1.0",Pr._jsonSchema={type:Lt("string",Pr._jsonSchemaVersion),latitude:Lt("number"),longitude:Lt("number")};var Wa=class t{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(a,r){if(a.length!==r.length)return!1;for(let s=0;s<a.length;++s)if(a[s]!==r[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(fu(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new t(e.vectorValues);throw new Q(B.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};Wa._jsonSchemaVersion="firestore/vectorValue/1.0",Wa._jsonSchema={type:Lt("string",Wa._jsonSchemaVersion),vectorValues:Lt("object")};var dU=/^__.*__$/;function hR(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw oe(40011,{dataSource:t})}}var kS=class t{constructor(e,n,a,r,s,i){this.settings=e,this.databaseId=n,this.serializer=a,this.ignoreUndefinedProperties=r,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePathSegment(e),a}childContextForFieldPath(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePath(),a}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Sp(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(hR(this.dataSource)&&dU.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},DS=class{constructor(e,n,a){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=a||Nc(e)}createContext(e,n,a,r=!1){return new kS({dataSource:e,methodName:n,targetDoc:a,path:ta.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function $S(t){let e=t._freezeSettings(),n=Nc(t._databaseId);return new DS(t._databaseId,!!e.ignoreUndefinedProperties,n)}function JS(t,e,n,a=!1){return ZS(n,t.createContext(a?4:3,e))}function ZS(t,e){if(pR(t=Jt(t)))return hU("Unsupported field value:",e,t),fU(t,e);if(t instanceof Rc)return function(a,r){if(!hR(r.dataSource))throw r.createError(`${a._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${a._methodName}() is not currently supported inside arrays`);let s=a._toFieldTransform(r);s&&r.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(a,r){let s=[],i=0;for(let u of a){let l=ZS(u,r.childContextForArray(i));l==null&&(l={nullValue:"NULL_VALUE"}),s.push(l),i++}return{arrayValue:{values:s}}}(t,e)}return function(a,r){if((a=Jt(a))===null)return{nullValue:"NULL_VALUE"};if(typeof a=="number")return lV(r.serializer,a);if(typeof a=="boolean")return{booleanValue:a};if(typeof a=="string")return{stringValue:a};if(a instanceof Date){let s=Mt.fromDate(a);return{timestampValue:V_(r.serializer,s)}}if(a instanceof Mt){let s=new Mt(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:V_(r.serializer,s)}}if(a instanceof Pr)return{geoPointValue:{latitude:a.latitude,longitude:a.longitude}};if(a instanceof Ka)return{bytesValue:q0(r.serializer,a._byteString)};if(a instanceof Bn){let s=r.databaseId,i=a.firestore._databaseId;if(!i.isEqual(s))throw r.createError(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:z0(a.firestore._databaseId||r.databaseId,a._key.path)}}if(a instanceof Wa)return function(i,u){let l=i instanceof Wa?i.toArray():i;return{mapValue:{fields:{[OS]:{stringValue:MS},[eu]:{arrayValue:{values:l.map(f=>{if(typeof f!="number")throw u.createError("VectorValues must only contain numeric values.");return BS(u.serializer,f)})}}}}}}(a,r);if(Q0(a))return a._toProto(r.serializer);throw r.createError(`Unsupported field value: ${Dc(a)}`)}(t,e)}function fU(t,e){let n={};return p0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):pu(t,(a,r)=>{let s=ZS(r,e.childContextForField(a));s!=null&&(n[a]=s)}),{mapValue:{fields:n}}}function pR(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof Mt||t instanceof Pr||t instanceof Ka||t instanceof Bn||t instanceof Rc||t instanceof Wa||Q0(t))}function hU(t,e,n){if(!pR(n)||!Jx(n)){let a=Dc(n);throw a==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+a)}}function Bc(t,e,n){if((e=Jt(e))instanceof cu)return e._internalPath;if(typeof e=="string")return mR(t,e);throw Sp("Field path arguments must be of type string or ",t,!1,void 0,n)}var pU=new RegExp("[~\\*/\\[\\]]");function mR(t,e,n){if(e.search(pU)>=0)throw Sp(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new cu(...e.split("."))._internalPath}catch{throw Sp(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Sp(t,e,n,a,r){let s=a&&!a.isEmpty(),i=r!==void 0,u=`Function ${e}() called with invalid data`;n&&(u+=" (via `toFirestore()`)"),u+=". ";let l="";return(s||i)&&(l+=" (found",s&&(l+=` in field ${a}`),i&&(l+=` in document ${r}`),l+=")"),new Q(B.INVALID_ARGUMENT,u+t+l)}var kc=class{convertValue(e,n="none"){switch(Rs(e)){case 0:return null;case 1:return e.booleanValue;case 2:return lt(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Vr(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw oe(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){let a={};return pu(e,(r,s)=>{a[r]=this.convertValue(s,n)}),a}convertVectorValue(e){let n=e.fields?.[eu].arrayValue?.values?.map(a=>lt(a.doubleValue));return new Wa(n)}convertGeoPoint(e){return new Pr(lt(e.latitude),lt(e.longitude))}convertArray(e,n){return(e.values||[]).map(a=>this.convertValue(a,n))}convertServerTimestamp(e,n){switch(n){case"previous":let a=Ep(e);return a==null?null:this.convertValue(a,n);case"estimate":return this.convertTimestamp(gc(e));default:return null}}convertTimestamp(e){let n=Nr(e);return new Mt(n.seconds,n.nanos)}convertDocumentKey(e,n){let a=ct.fromString(e);ht(X0(a),9688,{name:e});let r=new yc(a.get(1),a.get(3)),s=new ne(a.popFirst(5));return r.isEqual(n)||Or(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}};var vp=class extends kc{constructor(e){super(),this.firestore=e}convertBytes(e){return new Ka(e)}convertReference(e){let n=this.convertDocumentKey(e,this.firestore._databaseId);return new Bn(this.firestore,null,n)}};var gR="@firebase/firestore",yR="4.12.0";var qc=class{constructor(e,n,a,r,s){this._firestore=e,this._userDataWriter=n,this._key=a,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Bn(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new ev(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let n=this._document.data.field(Bc("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}},ev=class extends qc{data(){return super.data()}};function IU(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new Q(B.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var zc=class{},Su=class extends zc{};function Hc(t,e,...n){let a=[];e instanceof zc&&a.push(e),a=a.concat(n),function(s){let i=s.filter(l=>l instanceof tv).length,u=s.filter(l=>l instanceof Rp).length;if(i>1||i>0&&u>0)throw new Q(B.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(a);for(let r of a)t=r._apply(t);return t}var Rp=class t extends Su{constructor(e,n,a){super(),this._field=e,this._op=n,this._value=a,this.type="where"}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=this._parse(e);return TR(e._query,n),new ba(e.firestore,e.converter,Cp(e._query,n))}_parse(e){let n=$S(e.firestore);return function(s,i,u,l,c,f,m){let p;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new Q(B.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){_R(m,f);let R=[];for(let D of m)R.push(IR(l,s,D));p={arrayValue:{values:R}}}else p=IR(l,s,m)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||_R(m,f),p=JS(u,i,m,f==="in"||f==="not-in");return Ct.create(c,f,p)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}};function Gc(t,e,n){let a=e,r=Bc("where",t);return Rp._create(r,a,n)}var tv=class t extends zc{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new t(e,n)}_parse(e){let n=this._queryConstraints.map(a=>a._parse(e)).filter(a=>a.getFilters().length>0);return n.length===1?n[0]:pa.create(n,this._getOperator())}_apply(e){let n=this._parse(e);return n.getFilters().length===0?e:(function(r,s){let i=r,u=s.getFlattenedFilters();for(let l of u)TR(i,l),i=Cp(i,l)}(e._query,n),new ba(e.firestore,e.converter,Cp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var nv=class t extends Su{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new t(e,n)}_apply(e){let n=function(r,s,i){if(r.startAt!==null)throw new Q(B.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new Q(B.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new ks(s,i)}(e._query,this._field,this._direction);return new ba(e.firestore,e.converter,A0(e._query,n))}};function jc(t,e="asc"){let n=e,a=Bc("orderBy",t);return nv._create(a,n)}var av=class t extends Su{constructor(e,n,a){super(),this.type=e,this._limit=n,this._limitType=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){return new ba(e.firestore,e.converter,_c(e._query,this._limit,this._limitType))}};function Kc(t){return Zx("limit",t),av._create("limit",t,"F")}var rv=class t extends Su{constructor(e,n,a){super(),this.type=e,this._docOrFields=n,this._inclusive=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=_U(e,this.type,this._docOrFields,this._inclusive);return new ba(e.firestore,e.converter,x0(e._query,n))}};function vR(...t){return rv._create("startAfter",t,!1)}function _U(t,e,n,a){if(n[0]=Jt(n[0]),n[0]instanceof qc)return function(s,i,u,l,c){if(!l)throw new Q(B.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${u}().`);let f=[];for(let m of Ti(s))if(m.field.isKeyField())f.push(Mc(i,l.key));else{let p=l.data.field(m.field);if(Oc(p))throw new Q(B.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+m.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(p===null){let _=m.field.canonicalString();throw new Q(B.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${_}' (used as the orderBy) does not exist.`)}f.push(p)}return new Ur(f,c)}(t._query,t.firestore._databaseId,e,n[0]._document,a);{let r=$S(t.firestore);return function(i,u,l,c,f,m){let p=i.explicitOrderBy;if(f.length>p.length)throw new Q(B.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let _=[];for(let R=0;R<f.length;R++){let D=f[R];if(p[R].field.isKeyField()){if(typeof D!="string")throw new Q(B.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof D}`);if(!wp(i)&&D.indexOf("/")!==-1)throw new Q(B.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${D}' contains a slash.`);let L=i.path.child(ct.fromString(D));if(!ne.isDocumentKey(L))throw new Q(B.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${L}' is not because it contains an odd number of segments.`);let T=new ne(L);_.push(Mc(u,T))}else{let L=JS(l,c,D);_.push(L)}}return new Ur(_,m)}(t._query,t.firestore._databaseId,r,e,n,a)}}function IR(t,e,n){if(typeof(n=Jt(n))=="string"){if(n==="")throw new Q(B.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!wp(e)&&n.indexOf("/")!==-1)throw new Q(B.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);let a=e.path.child(ct.fromString(n));if(!ne.isDocumentKey(a))throw new Q(B.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${a}' is not because it has an odd number of segments (${a.length}).`);return Mc(t,new ne(a))}if(n instanceof Bn)return Mc(t,n._key);throw new Q(B.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Dc(n)}.`)}function _R(t,e){if(!Array.isArray(t)||t.length===0)throw new Q(B.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function TR(t,e){let n=function(r,s){for(let i of r)for(let u of i.getFlattenedFilters())if(s.indexOf(u.op)>=0)return u.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new Q(B.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new Q(B.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}var gu=class{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},yu=class t extends qc{constructor(e,n,a,r,s,i){super(e,n,a,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let n=new Iu(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){let a=this._document.data.field(Bc("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new Q(B.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,n={};return n.type=t._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}};yu._jsonSchemaVersion="firestore/documentSnapshot/1.0",yu._jsonSchema={type:Lt("string",yu._jsonSchemaVersion),bundleSource:Lt("string","DocumentSnapshot"),bundleName:Lt("string"),bundle:Lt("string")};var Iu=class extends yu{data(e={}){return super.data(e)}},_u=class t{constructor(e,n,a,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new gu(r.hasPendingWrites,r.fromCache),this.query=a}get docs(){let e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(a=>{e.call(n,new Iu(this._firestore,this._userDataWriter,a.key,a,new gu(this._snapshot.mutatedKeys.has(a.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new Q(B.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(r,s){if(r._snapshot.oldDocs.isEmpty()){let i=0;return r._snapshot.docChanges.map(u=>{let l=new Iu(r._firestore,r._userDataWriter,u.doc.key,u.doc,new gu(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter);return u.doc,{type:"added",doc:l,oldIndex:-1,newIndex:i++}})}{let i=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(u=>s||u.type!==3).map(u=>{let l=new Iu(r._firestore,r._userDataWriter,u.doc.key,u.doc,new gu(r._snapshot.mutatedKeys.has(u.doc.key),r._snapshot.fromCache),r.query.converter),c=-1,f=-1;return u.type!==0&&(c=i.indexOf(u.doc.key),i=i.delete(u.doc.key)),u.type!==1&&(i=i.add(u.doc),f=i.indexOf(u.doc.key)),{type:SU(u.type),doc:l,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new Q(B.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=$o.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let n=[],a=[],r=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),a.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),r.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function SU(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return oe(61501,{type:t})}}_u._jsonSchemaVersion="firestore/querySnapshot/1.0",_u._jsonSchema={type:Lt("string",_u._jsonSchemaVersion),bundleSource:Lt("string","QuerySnapshot"),bundleName:Lt("string"),bundle:Lt("string")};function Dp(t){t=Pc(t,ba);let e=Pc(t.firestore,lu),n=YS(e),a=new vp(e);return IU(t._query),lR(n,t._query).then(r=>new _u(e,a,t,r))}(function(e,n=!0){Qx(Fa),Ua(new Vn("firestore",(a,{instanceIdentifier:r,options:s})=>{let i=a.getProvider("app").getImmediate(),u=new lu(new Wh(a.getProvider("auth-internal")),new Qh(i,a.getProvider("app-check-internal")),_0(i,r),i);return s={useFetchStreams:n,...s},u._setSettings(s),u},"PUBLIC").setMultipleInstances(!0)),Un(gR,yR,e),Un(gR,yR,"esm2020")})();var AR="firebasestorage.googleapis.com",vU="storageBucket",TU=2*60*1e3,bU=10*60*1e3;var Qa=class t extends wn{constructor(e,n,a=0){super(iv(e),`Firebase Storage: ${n} (${iv(e)})`),this.status_=a,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return iv(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},Ya;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(Ya||(Ya={}));function iv(t){return"storage/"+t}function EU(){let t="An unknown error occurred, please check the error payload for server response.";return new Qa(Ya.UNKNOWN,t)}function wU(){return new Qa(Ya.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function CU(){return new Qa(Ya.CANCELED,"User canceled the upload/download.")}function LU(t){return new Qa(Ya.INVALID_URL,"Invalid URL '"+t+"'.")}function AU(t){return new Qa(Ya.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function bR(t){return new Qa(Ya.INVALID_ARGUMENT,t)}function xR(){return new Qa(Ya.APP_DELETED,"The Firebase app was deleted.")}function xU(t){return new Qa(Ya.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}var qr=class t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let a;try{a=t.makeFromUrl(e,n)}catch{return new t(e,"")}if(a.path==="")return a;throw AU(e)}static makeFromUrl(e,n){let a=null,r="([A-Za-z0-9.\\-_]+)";function s(x){x.path.charAt(x.path.length-1)==="/"&&(x.path_=x.path_.slice(0,-1))}let i="(/(.*))?$",u=new RegExp("^gs://"+r+i,"i"),l={bucket:1,path:3};function c(x){x.path_=decodeURIComponent(x.path)}let f="v[A-Za-z0-9_]+",m=n.replace(/[.]/g,"\\."),p="(/([^?#]*).*)?$",_=new RegExp(`^https?://${m}/${f}/b/${r}/o${p}`,"i"),R={bucket:1,path:3},D=n===AR?"(?:storage.googleapis.com|storage.cloud.google.com)":n,L="([^?#]*)",T=new RegExp(`^https?://${D}/${r}/${L}`,"i"),w=[{regex:u,indices:l,postModify:s},{regex:_,indices:R,postModify:c},{regex:T,indices:{bucket:1,path:2},postModify:c}];for(let x=0;x<w.length;x++){let H=w[x],j=H.regex.exec(e);if(j){let S=j[H.indices.bucket],g=j[H.indices.path];g||(g=""),a=new t(S,g),H.postModify(a);break}}if(a==null)throw LU(e);return a}},ov=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function RU(t,e,n){let a=1,r=null,s=null,i=!1,u=0;function l(){return u===2}let c=!1;function f(...L){c||(c=!0,e.apply(null,L))}function m(L){r=setTimeout(()=>{r=null,t(_,l())},L)}function p(){s&&clearTimeout(s)}function _(L,...T){if(c){p();return}if(L){p(),f.call(null,L,...T);return}if(l()||i){p(),f.call(null,L,...T);return}a<64&&(a*=2);let w;u===1?(u=2,w=0):w=(a+Math.random())*1e3,m(w)}let R=!1;function D(L){R||(R=!0,p(),!c&&(r!==null?(L||(u=2),clearTimeout(r),m(0)):L||(u=1)))}return m(0),s=setTimeout(()=>{i=!0,D(!0)},n),D}function kU(t){t(!1)}function DU(t){return t!==void 0}function ER(t,e,n,a){if(a<e)throw bR(`Invalid value for '${t}'. Expected ${e} or greater.`);if(a>n)throw bR(`Invalid value for '${t}'. Expected ${n} or less.`)}function PU(t){let e=encodeURIComponent,n="?";for(let a in t)if(t.hasOwnProperty(a)){let r=e(a)+"="+e(t[a]);n=n+r+"&"}return n=n.slice(0,-1),n}var Pp;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Pp||(Pp={}));function OU(t,e){let n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return n||r||s}var uv=class{constructor(e,n,a,r,s,i,u,l,c,f,m,p=!0,_=!1){this.url_=e,this.method_=n,this.headers_=a,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=i,this.callback_=u,this.errorCallback_=l,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=m,this.retry=p,this.isUsingEmulator=_,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,D)=>{this.resolve_=R,this.reject_=D,this.start_()})}start_(){let e=(a,r)=>{if(r){a(!1,new vu(!1,null,!0));return}let s=this.connectionFactory_();this.pendingConnection_=s;let i=u=>{let l=u.loaded,c=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(l,c)};this.progressCallback_!==null&&s.addUploadProgressListener(i),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(i),this.pendingConnection_=null;let u=s.getErrorCode()===Pp.NO_ERROR,l=s.getStatus();if(!u||OU(l,this.additionalRetryCodes_)&&this.retry){let f=s.getErrorCode()===Pp.ABORT;a(!1,new vu(!1,null,f));return}let c=this.successCodes_.indexOf(l)!==-1;a(!0,new vu(c,s))})},n=(a,r)=>{let s=this.resolve_,i=this.reject_,u=r.connection;if(r.wasSuccessCode)try{let l=this.callback_(u,u.getResponse());DU(l)?s(l):s()}catch(l){i(l)}else if(u!==null){let l=EU();l.serverResponse=u.getErrorText(),this.errorCallback_?i(this.errorCallback_(u,l)):i(l)}else if(r.canceled){let l=this.appDelete_?xR():CU();i(l)}else{let l=wU();i(l)}};this.canceled_?n(!1,new vu(!1,null,!0)):this.backoffId_=RU(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&kU(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},vu=class{constructor(e,n,a){this.wasSuccessCode=e,this.connection=n,this.canceled=!!a}};function MU(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function NU(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function VU(t,e){e&&(t["X-Firebase-GMPID"]=e)}function UU(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function FU(t,e,n,a,r,s,i=!0,u=!1){let l=PU(t.urlParams),c=t.url+l,f=Object.assign({},t.headers);return VU(f,e),MU(f,n),NU(f,s),UU(f,a),new uv(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,i,u)}function BU(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function qU(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}var F6=256*1024;var lv=class t{constructor(e,n){this._service=e,n instanceof qr?this._location=n:this._location=qr.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new t(e,n)}get root(){let e=new qr(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return qU(this._location.path)}get storage(){return this._service}get parent(){let e=BU(this._location.path);if(e===null)return null;let n=new qr(this._location.bucket,e);return new t(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw xU(e)}};function wR(t,e){let n=e?.[vU];return n==null?null:qr.makeFromBucketSpec(n,t)}function zU(t,e,n,a={}){t.host=`${e}:${n}`;let r=Na(e);r&&(Po(`https://${t.host}/b`),Oo("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:s}=a;s&&(t._overrideAuthToken=typeof s=="string"?s:th(s,t.app.options.projectId))}var cv=class{constructor(e,n,a,r,s,i=!1){this.app=e,this._authProvider=n,this._appCheckProvider=a,this._url=r,this._firebaseVersion=s,this._isUsingEmulator=i,this._bucket=null,this._host=AR,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=TU,this._maxUploadRetryTime=bU,this._requests=new Set,r!=null?this._bucket=qr.makeFromBucketSpec(r,this._host):this._bucket=wR(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=qr.makeFromBucketSpec(this._url,e):this._bucket=wR(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){ER("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){ER("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Fn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new lv(this,e)}_makeRequest(e,n,a,r,s=!0){if(this._deleted)return new ov(xR());{let i=FU(e,this._appId,a,r,n,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(e,n){let[a,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,a,r).getPromise()}},CR="@firebase/storage",LR="0.14.1";var RR="storage";function kR(t=Uo(),e){t=Jt(t);let a=di(t,RR).getImmediate({identifier:e}),r=eh("storage");return r&&HU(a,...r),a}function HU(t,e,n,a={}){zU(t,e,n,a)}function GU(t,{instanceIdentifier:e}){let n=t.getProvider("app").getImmediate(),a=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new cv(n,a,r,e,Fa)}function jU(){Ua(new Vn(RR,GU,"PUBLIC").setMultipleInstances(!0)),Un(CR,LR,""),Un(CR,LR,"esm2020")}jU();var DR={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var dv=TI(DR),PR=ZI(dv),Op=QS(dv),Q6=kR(dv);var fv=null,hv=null;async function KU(t){let e=Date.now();if(fv&&hv&&e<hv)return fv;let n=await t.getIdToken(),a=await t.getIdTokenResult();return fv=n,hv=a.expirationTime?new Date(a.expirationTime).getTime()-6e4:e+6e4,n}function WU(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let n=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return n.startsWith("http")?t:e+n}var XU=25e3;async function OR(t,e={}){let n=PR.currentUser;if(!n)throw new Error("User not authenticated");let a=await KU(n),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${a}`);let s=e.timeout!==void 0?e.timeout:XU,{timeout:i,...u}=e,l=u.signal,c=null,f=null;s>0&&(c=new AbortController,f=setTimeout(()=>{console.warn("[authFetch] Request exceeded timeout threshold:",s,"ms"),c.abort()},s),l=u.signal?(()=>{let m=new AbortController;return u.signal?.addEventListener("abort",()=>{clearTimeout(f),m.abort()}),c.signal.addEventListener("abort",()=>m.abort()),m.signal})():c.signal);try{let m=await fetch(WU(t),{...u,headers:r,signal:l??u.signal});return f&&clearTimeout(f),m}catch(m){throw f&&clearTimeout(f),m instanceof Error&&m.name==="AbortError"&&c?.signal.aborted?new Error("Request timed out"):m}}var pv=null;function QU(){if(typeof window>"u")return null;if(!pv)try{pv=new AudioContext}catch{return null}return pv}function MR(){let t=QU();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(400,e+.02),n.type="sine",a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.05),n.start(e),n.stop(e+.05)}var q=he(xn());var YU=typeof process<"u"&&!1;function Mp(t,e){if(YU&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var ZU=20;function eF(t){let e=t.data(),n=e.status??"open",a=e.isResolved===!0||n==="resolved"||n==="done",r=n==="skipped";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:a,isSkipped:r||void 0,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null,clarityScore:e.clarityScore??null,clarityStatus:e.clarityStatus??null,clarityIssues:e.clarityIssues??null,clarityConfidence:e.clarityConfidence??null,clarityCheckedAt:e.clarityCheckedAt??null}}async function FR(t,e=ZU,n){Mp(e,"getSessionFeedbackPageRepo");let a=Fc(Op,"feedback"),r=n!=null?Hc(a,Gc("sessionId","==",t),jc("createdAt","desc"),Kc(e),vR(n)):Hc(a,Gc("sessionId","==",t),jc("createdAt","desc"),Kc(e)),i=(await Dp(r)).docs,u=i.map(eF),l=i.length>0?i[i.length-1]:null,c=i.length===e;return{feedback:u,lastVisibleDoc:l,hasMore:c}}async function BR(t,e=50){let{feedback:n}=await FR(t,e);return n}var qR=new Set(["script","style","noscript","iframe","svg"]);function Nt(t){if(!t)return!1;let e=t instanceof Element?t:t.parentElement;if(!e)return!1;let n=t instanceof Element?t:e;if(n.id&&String(n.id).toLowerCase().startsWith("echly"))return!0;let a=n.className;if(a&&typeof a=="string"&&a.includes("echly")||n instanceof Element&&n.getAttribute?.("data-echly-ui")!=null||n instanceof Element&&n.closest?.("[data-echly-ui]"))return!0;let r=n.getRootNode?.();return!!(r&&r instanceof ShadowRoot&&Nt(r.host))}function Np(t){if(!(t instanceof HTMLElement)||t.getAttribute?.("aria-hidden")==="true")return!0;let e=t.ownerDocument?.defaultView?.getComputedStyle?.(t);return e?e.display==="none"||e.visibility==="hidden":!1}function nF(t){if(!t?.getRootNode||Nt(t))return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let n=[],a=t;for(;a&&a!==e.body&&n.length<12;){let s=a.tagName.toLowerCase(),i=a.id?.trim();if(i&&/^[a-zA-Z][\w-]*$/.test(i)&&!i.includes(" ")){s+=`#${i}`,n.unshift(s);break}let u=a.getAttribute?.("class")?.trim();if(u){let m=u.split(/\s+/).find(p=>p.length>0&&/^[a-zA-Z_][\w-]*$/.test(p));m&&(s+=`.${m}`)}let l=a.parentElement;if(!l)break;let c=l.children,f=0;for(let m=0;m<c.length;m++)if(c[m]===a){f=m+1;break}s+=`:nth-child(${f})`,n.unshift(s),a=l}return n.length===0?null:n.join(" > ")}function aF(t){if(!t||Nt(t))return null;let e=[],n=t.ownerDocument.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode(i){let u=i.parentElement;if(!u||Nt(u))return NodeFilter.FILTER_REJECT;let l=u.getRootNode?.();if(l&&l instanceof ShadowRoot&&Nt(l.host))return NodeFilter.FILTER_REJECT;let c=u.tagName.toLowerCase();return qR.has(c)||Np(u)?NodeFilter.FILTER_REJECT:(i.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),a=0,r=n.nextNode();for(;r&&a<2e3;){let i=(r.textContent??"").trim();if(i.length>0){let u=i.slice(0,2e3-a);e.push(u),a+=u.length}r=n.nextNode()}return e.length===0?null:e.join(" ").replace(/\s+/g," ").trim().slice(0,2e3)||null}function rF(t){if(!t||Nt(t))return null;let e=[];function n(i){if(!i||Nt(i)||Np(i))return;let l=(i.innerText??i.textContent??"").replace(/\s+/g," ").trim().slice(0,200);l.length>0&&e.push(l)}let a=t.getAttribute?.("aria-label")||t.placeholder||(t.innerText??t.textContent??"").trim();a&&e.push(String(a).slice(0,120));let r=t.parentElement;if(r&&!Nt(r)&&!Np(r)&&n(r),r)for(let i=0;i<r.children.length;i++){let u=r.children[i];u!==t&&!Nt(u)&&n(u)}for(let i=0;i<t.children.length;i++)Nt(t.children[i])||n(t.children[i]);let s=e.filter(Boolean).join(" ").replace(/\s+/g," ").trim();return s?s.length>800?s.slice(0,800)+"\u2026":s:null}function sF(t){if(!t?.document?.body)return null;let e=t.document,n=e.body,a=[],r=e.createTreeWalker(n,NodeFilter.SHOW_TEXT,{acceptNode(l){let c=l.parentElement;if(!c||Nt(c))return NodeFilter.FILTER_REJECT;let f=c.getRootNode?.();if(f&&f instanceof ShadowRoot&&Nt(f.host))return NodeFilter.FILTER_REJECT;let m=c.tagName.toLowerCase();if(qR.has(m)||Np(c))return NodeFilter.FILTER_REJECT;let p=c.getBoundingClientRect?.();return p&&(p.top>=t.innerHeight||p.bottom<=0||p.left>=t.innerWidth||p.right<=0)?NodeFilter.FILTER_REJECT:(l.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),s=0,i=r.nextNode();for(;i&&s<1500;){let l=(i.textContent??"").trim();if(l.length>0){let c=l.slice(0,1500-s);a.push(c),s+=c.length}i=r.nextNode()}return a.length===0?null:a.join(" ").replace(/\s+/g," ").trim().slice(0,1500)||null}function $a(t,e){try{typeof console<"u"&&console.log&&console.log(`ECHLY DEBUG \u2014 ${t}`,e)}catch{}}function Vp(t,e){let n=e;for(;n&&Nt(n);)n=n.parentElement;let a=n?nF(n):null,r=n?aF(n):null,s=n?rF(n):null,i=sF(t);if(n&&!Nt(n)&&n!==t.document?.body){if(!r?.trim()){let c=(n.innerText??n.textContent??"").replace(/\s+/g," ").trim().slice(0,2e3)||null;c&&(r=c),r&&$a("SUBTREE TEXT FALLBACK USED","element.innerText")}!s?.trim()&&n.parentElement&&!Nt(n.parentElement)&&(s=(n.parentElement.innerText??n.parentElement.textContent??"").replace(/\s+/g," ").trim().slice(0,800)||null,s&&$a("NEARBY TEXT FALLBACK USED","parent.innerText"))}i?.trim()||$a("VISIBLE TEXT FALLBACK USED","(skipped to avoid Echly UI)");let u={url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:a,nearbyText:s??null,subtreeText:r??null,visibleText:i??null,capturedAt:Date.now()};return $a("DOM PATH",u.domPath??"(none)"),$a("SUBTREE TEXT SIZE",u.subtreeText?.length??0),$a("NEARBY TEXT SIZE",u.nearbyText?.length??0),$a("VISIBLE TEXT SIZE",u.visibleText?.length??0),$a("DOM SCOPE SAMPLE",(u.subtreeText??"").slice(0,200)||"(empty)"),$a("NEARBY SCOPE SAMPLE",(u.nearbyText??"").slice(0,200)||"(empty)"),$a("VISIBLE TEXT SAMPLE",(u.visibleText??"").slice(0,200)||"(empty)"),u}var mv=null;function iF(){if(typeof window>"u")return null;if(!mv)try{mv=new AudioContext}catch{return null}return mv}function Up(){let t=iF();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(600,e+.04),n.type="sine",a.gain.setValueAtTime(.04,e),a.gain.exponentialRampToValueAtTime(.001,e+.06),n.start(e),n.stop(e+.06)}var oF="[SESSION]";function Os(t){typeof console<"u"&&console.debug&&console.debug(`${oF} ${t}`)}function Fp(t){if(!t||t===document.body||Nt(t))return!1;let e=document.getElementById("echly-shadow-host");if(e&&e.contains(t))return!1;let n=t.tagName?.toLowerCase();if(n==="input"||n==="textarea"||n==="select")return!1;let a=t.getAttribute?.("contenteditable");return!(a==="true"||a==="")}var zt=he(xn());var zr=he(Ke()),Tu=24,qp="cubic-bezier(0.22, 0.61, 0.36, 1)";async function gv(t,e,n){return new Promise((a,r)=>{let s=new Image;s.crossOrigin="anonymous",s.onload=()=>{let i=Math.round(e.x*n),u=Math.round(e.y*n),l=Math.round(e.w*n),c=Math.round(e.h*n),f=document.createElement("canvas");f.width=l,f.height=c;let m=f.getContext("2d");if(!m){r(new Error("No canvas context"));return}m.drawImage(s,i,u,l,c,0,0,l,c);try{a(f.toDataURL("image/png"))}catch(p){r(p)}},s.onerror=()=>r(new Error("Image load failed")),s.src=t})}function jR({getFullTabImage:t,onAddVoice:e,onCancel:n,onSelectionStart:a}){let[r,s]=(0,zt.useState)(null),[i,u]=(0,zt.useState)(null),[l,c]=(0,zt.useState)(!1),[f,m]=(0,zt.useState)(!1),p=(0,zt.useRef)(null),_=(0,zt.useRef)(null),R=(0,zt.useCallback)(()=>{s(null),u(null),p.current=null,_.current=null,setTimeout(()=>n(),120)},[n]);(0,zt.useEffect)(()=>{let g=v=>{v.key==="Escape"&&(v.preventDefault(),i?(u(null),s(null),_.current=null,p.current=null):R())};return document.addEventListener("keydown",g),()=>document.removeEventListener("keydown",g)},[R,i]),(0,zt.useEffect)(()=>{let g=()=>{document.visibilityState==="hidden"&&R()};return document.addEventListener("visibilitychange",g),()=>document.removeEventListener("visibilitychange",g)},[R]);let D=(0,zt.useCallback)(async g=>{if(l)return;c(!0),Up(),m(!0),setTimeout(()=>m(!1),150),await new Promise(nn=>setTimeout(nn,200));let v=null;try{v=await t()}catch{c(!1),n();return}if(!v){c(!1),n();return}let b=typeof window<"u"&&window.devicePixelRatio||1,C;try{C=await gv(v,g,b)}catch{c(!1),n();return}let A=g.x+g.w/2,E=g.y+g.h/2,X=null;if(typeof document<"u"&&document.elementsFromPoint)for(X=document.elementsFromPoint(A,E).find(M=>!Nt(M))??document.elementFromPoint(A,E)??document.elementFromPoint(g.x+2,g.y+2);X&&Nt(X);)X=X.parentElement;let re=typeof window<"u"?Vp(window,X):null;e(C,re),c(!1),u(null)},[t,e,n,l]),L=(0,zt.useCallback)(()=>{u(null),s(null),_.current=null,p.current=null},[]),T=(0,zt.useCallback)(g=>{if(g.button!==0||i)return;g.preventDefault(),a?.();let v=g.clientX,b=g.clientY;p.current={x:v,y:b},s({x:v,y:b,w:0,h:0})},[a,i]),I=(0,zt.useCallback)(g=>{if(g.button!==0)return;g.preventDefault();let v=_.current,b=p.current;if(p.current=null,!b||!v||v.w<Tu||v.h<Tu){s(null);return}s(null),_.current=null,u({x:v.x,y:v.y,w:v.w,h:v.h})},[]),w=(0,zt.useCallback)(g=>{if(!p.current||i)return;let v=p.current.x,b=p.current.y,C=Math.min(v,g.clientX),A=Math.min(b,g.clientY),E=Math.abs(g.clientX-v),X=Math.abs(g.clientY-b),re={x:C,y:A,w:E,h:X};_.current=re,s(re)},[i]);(0,zt.useEffect)(()=>{let g=v=>{if(v.button!==0||!p.current||i)return;let b=_.current,C=p.current;if(p.current=null,!C||!b||b.w<Tu||b.h<Tu){s(null),_.current=null;return}s(null),_.current=null,u({x:b.x,y:b.y,w:b.w,h:b.h})};return window.addEventListener("mouseup",g),()=>window.removeEventListener("mouseup",g)},[i]);let x=!!r&&(r.w>=Tu||r.h>=Tu),H=i!==null,j=x&&r||H&&i,S=H?i:r;return(0,zr.jsxs)("div",{id:"echly-overlay",role:"presentation","aria-hidden":!0,className:"echly-region-overlay","data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,zr.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:j?"transparent":"rgba(0,0,0,0.35)",pointerEvents:i?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${qp}`},onMouseDown:T,onMouseMove:w,onMouseUp:I,onMouseLeave:()=>{!p.current||i||(s(null),p.current=null,_.current=null)}}),(0,zr.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",fontSize:13,color:"rgba(255,255,255,0.8)",zIndex:2147483647,pointerEvents:"none",opacity:i?0:1,transition:`opacity 180ms ${qp}`},children:"Drag to capture area \u2014 ESC to cancel"}),j&&S&&(0,zr.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:S.x,top:S.y,width:Math.max(S.w,1),height:Math.max(S.h,1),borderRadius:6,border:`2px solid ${f?"#FFFFFF":"#5B8CFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.35)",pointerEvents:"none",zIndex:2147483646,transition:f?"none":`border-color 150ms ${qp}`}}),H&&i&&(0,zr.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:i.x+i.w/2,bottom:Math.max(12,i.y+i.h-48),transform:"translate(-50%, 100%)",display:"flex",gap:8,padding:"8px 12px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${qp} forwards`},children:[(0,zr.jsx)("button",{type:"button",onClick:L,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Retake"}),(0,zr.jsx)("button",{type:"button",onClick:()=>D(i),disabled:l,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"linear-gradient(135deg, #5B8CFF, #466EFF)",color:"#fff",fontSize:13,fontWeight:600,cursor:l?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var KR=40;function cF(t,e=KR,n,a){let r=t.getBoundingClientRect(),s=n??(typeof window<"u"?window.innerWidth:0),i=a??(typeof window<"u"?window.innerHeight:0),u=Math.max(0,r.left-e),l=Math.max(0,r.top-e),c=s-u,f=i-l,m=Math.min(r.width+e*2,c),p=Math.min(r.height+e*2,f);return{x:u,y:l,w:Math.max(1,m),h:Math.max(1,p)}}async function WR(t,e,n=KR){let a=typeof window<"u"&&window.devicePixelRatio||1,r=cF(e,n);return gv(t,r,a)}var yv="[SESSION]",Iv=null,Ea=[],bu=null,Eu=null;function QR(t){let e=t.getBoundingClientRect();return{x:e.left+e.width/2,y:e.top+e.height/2}}function YR(t,e,n){t.style.left=`${e}px`,t.style.top=`${n}px`,t.style.transform="translate(-50%, -50%)"}function dF(){bu&&Eu||(bu=()=>XR(),Eu=()=>XR(),window.addEventListener("scroll",bu,{passive:!0,capture:!0}),window.addEventListener("resize",Eu))}function $R(){bu&&(window.removeEventListener("scroll",bu,{capture:!0}),bu=null),Eu&&(window.removeEventListener("resize",Eu),Eu=null)}function _v(t,e,n={}){let{onMarkerClick:a,getSessionPaused:r}=n;if(!t)return;let s=document.getElementById("echly-marker-layer");if(!s)return;Iv=s;let i=Ea.length+1,u=e.x,l=e.y;if(e.element){let m=QR(e.element);u=m.x,l=m.y}let c=document.createElement("div");c.className="echly-feedback-marker",c.setAttribute("data-echly-ui","true"),c.setAttribute("aria-label",`Feedback ${i}`),c.textContent=String(i),c.title=e.title??`Feedback #${i}`,c.style.cssText=["width:22px","height:22px","border-radius:50%","background:#2563eb","color:white","font-size:12px","font-weight:600","display:flex","align-items:center","justify-content:center","position:fixed","z-index:2147483646","box-shadow:0 4px 12px rgba(0,0,0,0.15)","cursor:pointer","pointer-events:auto","box-sizing:border-box"].join(";"),YR(c,u,l);let f={...e,x:u,y:l,index:i,domElement:c};Ea.push(f),c.addEventListener("click",m=>{m.preventDefault(),m.stopPropagation(),!r?.()&&(console.log(`${yv} marker clicked`,f.id),a?.({id:f.id,x:f.x,y:f.y,element:f.element,title:f.title,index:f.index}))}),Iv.appendChild(c),Ea.length===1&&dF(),console.log(`${yv} marker created`,f.id,i)}function Sv(t,e){let n=Ea.find(a=>a.id===t);n&&(e.id!=null&&(n.id=e.id),e.title!=null&&(n.title=e.title),n.domElement.title=n.title??`Feedback #${n.index}`)}function vv(t){let e=Ea.findIndex(a=>a.id===t);if(e===-1)return;Ea[e].domElement.remove(),Ea.splice(e,1),Ea.length===0&&$R()}function XR(){for(let t of Ea)if(t.element&&t.element.isConnected){let{x:e,y:n}=QR(t.element);t.x=e,t.y=n,YR(t.domElement,e,n)}}function JR(){let t=document.getElementById("echly-marker-layer");if(t)for(;t.firstChild;)t.removeChild(t.firstChild);for(let e of Ea)console.log(`${yv} marker removed`,e.id);Ea.length=0,Iv=null,$R()}var zp=24;function hF(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let n=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),a=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(n&&!a)return"negative";if(a&&!n)return"positive";if(n&&a){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,s=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>s?"negative":s>r?"positive":"neutral"}return"neutral"}function Tv(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}var Hp=["focus_mode","region_selecting","voice_listening","processing"],pF=1800,mF=12;function t1({sessionId:t,extensionMode:e=!1,initialPointers:n,onComplete:a,onDelete:r,onRecordingChange:s,liveStructureFetch:i,loadSessionWithPointers:u,onSessionLoaded:l,onCreateSession:c,onActiveSessionChange:f,globalSessionModeActive:m,globalSessionPaused:p,onSessionModeStart:_,onSessionModePause:R,onSessionModeResume:D,onSessionModeEnd:L}){let[T,I]=(0,q.useState)([]),[w,x]=(0,q.useState)(null),[H,j]=(0,q.useState)(!1),[S,g]=(0,q.useState)("idle"),[v,b]=(0,q.useState)(null),[C,A]=(0,q.useState)(n??[]),[E,X]=(0,q.useState)(null),[re,nn]=(0,q.useState)(null),[M,O]=(0,q.useState)(""),[F,J]=(0,q.useState)(""),[Y,se]=(0,q.useState)(!1),[$e,Me]=(0,q.useState)(null),[We,Je]=(0,q.useState)(!1),[Cn,Sn]=(0,q.useState)(null),[an,vn]=(0,q.useState)(null),[N,te]=(0,q.useState)(0),[ae,fe]=(0,q.useState)(!0),[_e,ue]=(0,q.useState)(null),[Gt,Ze]=(0,q.useState)(!1),[Xe,ge]=(0,q.useState)(!1),[Te,Ue]=(0,q.useState)(null),[et,De]=(0,q.useState)(!1),[Pe,Qe]=(0,q.useState)(!1),[rn,dt]=(0,q.useState)(!1),[yt,tt]=(0,q.useState)(null),hn=(0,q.useRef)(!1),It=(0,q.useRef)(!1),Ln=(0,q.useRef)(null);(0,q.useEffect)(()=>{hn.current=Pe},[Pe]),(0,q.useEffect)(()=>{It.current=rn},[rn]);let sn=(0,q.useRef)({x:0,y:0}),He=(0,q.useRef)(null),pe=(0,q.useRef)(null),it=(0,q.useRef)(null),jr=(0,q.useRef)(null),ga=(0,q.useRef)(null),nr=(0,q.useRef)(T),jt=(0,q.useRef)(S),wu=(0,q.useRef)(null),Kt=(0,q.useRef)(!1),pn=(0,q.useRef)(null),ar=(0,q.useRef)(null),rr=(0,q.useRef)(null),Cu=(0,q.useRef)(null),Vs=(0,q.useRef)(null);(0,q.useEffect)(()=>{jt.current=S},[S]),(0,q.useEffect)(()=>(S==="focus_mode"||S==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[S]),(0,q.useEffect)(()=>{if(S!=="voice_listening"){Vs.current!=null&&(cancelAnimationFrame(Vs.current),Vs.current=null),ar.current?.getTracks().forEach(ye=>ye.stop()),ar.current=null,rr.current?.close().catch(()=>{}),rr.current=null,Cu.current=null,te(0);return}let U=Cu.current;if(!U)return;let K=new Uint8Array(U.frequencyBinCount),W,be=()=>{U.getByteFrequencyData(K);let ye=K.reduce((_t,St)=>_t+St,0),ee=K.length?ye/K.length:0,Ie=Math.min(1,ee/128);te(Ie),W=requestAnimationFrame(be)};return W=requestAnimationFrame(be),Vs.current=W,()=>{cancelAnimationFrame(W),Vs.current=null}},[S]),(0,q.useEffect)(()=>{wu.current=re},[re]),(0,q.useEffect)(()=>{Kt.current=Hp.includes(S)},[S]);let wa=(0,q.useRef)(!1);(0,q.useEffect)(()=>{if(!s)return;Hp.includes(S)?(wa.current=!0,s(!0)):wa.current&&(wa.current=!1,s(!1))},[S,s]),(0,q.useEffect)(()=>{if(S!=="voice_listening"||!i||!w){vn(null),pn.current&&(clearTimeout(pn.current),pn.current=null);return}let K=(T.find(W=>W.id===w)?.transcript??"").trim();if(K.length<mF){pn.current&&(clearTimeout(pn.current),pn.current=null);return}return pn.current&&clearTimeout(pn.current),pn.current=setTimeout(()=>{pn.current=null,i(K).then(W=>{W&&jt.current==="voice_listening"&&vn(W)}).catch(()=>{})},pF),()=>{pn.current&&(clearTimeout(pn.current),pn.current=null)}},[S,w,T,i]);let td=(0,q.useCallback)(U=>{U===!1&&(Kt.current||e||Hp.includes(jt.current)||wu.current)||j(U)},[e]),nd=(0,q.useCallback)(()=>{j(U=>!U)},[]);(0,q.useEffect)(()=>{ga.current=w},[w]),(0,q.useEffect)(()=>{nr.current=T},[T]),(0,q.useEffect)(()=>{let U=W=>{if(!We||!He.current)return;W.preventDefault();let be=He.current.offsetWidth,ye=He.current.offsetHeight,ee=W.clientX-sn.current.x,Ie=W.clientY-sn.current.y,_t=window.innerWidth-be-zp,St=window.innerHeight-ye-zp;ee=Math.max(zp,Math.min(ee,_t)),Ie=Math.max(zp,Math.min(Ie,St)),Me({x:ee,y:Ie})},K=()=>{We&&(Je(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",U),window.addEventListener("mouseup",K),()=>{window.removeEventListener("mousemove",U),window.removeEventListener("mouseup",K)}},[We]);let Us=(0,q.useCallback)(U=>{if(U.button!==0||!He.current)return;let K=He.current.getBoundingClientRect();Je(!0),document.body.style.userSelect="none",sn.current={x:U.clientX-K.left,y:U.clientY-K.top},Me({x:K.left,y:K.top})},[]),qn=(0,q.useCallback)(()=>{if(pe.current)return;tt(null);let U=document.createElement("div");U.id="echly-capture-root",document.body.appendChild(U),pe.current=U,Ue(U),ge(!0)},[]);(0,q.useEffect)(()=>{let U=document.getElementById("echly-capture-root");if(!U||U.querySelector("#echly-marker-layer"))return;let K=document.createElement("div");K.id="echly-marker-layer",K.style.cssText=["position:fixed","top:0","left:0","width:100%","height:100%","pointer-events:none","z-index:2147483646"].join(";"),U.appendChild(K)},[Te]);let mn=(0,q.useCallback)(()=>{if(pe.current){try{document.body.removeChild(pe.current)}catch(U){console.error("CaptureWidget error:",U)}pe.current=null}Ue(null),ge(!1)},[]),zn=(0,q.useCallback)(()=>{g("idle"),j(ae)},[ae]);(0,q.useEffect)(()=>{if(n!=null){A(n);return}if(!t)return;(async()=>{let K=await BR(t);A(K.map(W=>({id:W.id,title:W.title,description:W.description,type:W.type})))})()},[t,n]),(0,q.useEffect)(()=>{let U=window.SpeechRecognition||window.webkitSpeechRecognition;if(!U)return;let K=new U;return K.continuous=!0,K.interimResults=!0,K.lang="en-US",K.onresult=W=>{let be="";for(let ee=W.resultIndex;ee<W.results.length;++ee){let Ie=W.results[ee];Ie&&Ie[0]&&(be+=Ie[0].transcript)}let ye=ga.current;ye&&I(ee=>ee.map(Ie=>Ie.id===ye?{...Ie,transcript:be}:Ie))},K.onend=()=>{let W=jt.current;W==="processing"||W==="success"||g("idle")},it.current=K,()=>{try{K.stop()}catch(W){console.error("CaptureWidget error:",W)}}},[]);let An=(0,q.useCallback)(async()=>{try{let U=await navigator.mediaDevices.getUserMedia({audio:!0});ar.current=U;let K=new AudioContext,W=K.createAnalyser();W.fftSize=256,W.smoothingTimeConstant=.7,K.createMediaStreamSource(U).connect(W),rr.current=K,Cu.current=W,it.current?.start(),g("voice_listening"),te(0)}catch(U){console.error("Microphone permission denied:",U),b("Microphone permission denied."),g("error"),mn(),zn()}},[]),ad=(0,q.useCallback)(async()=>{typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),MR(),it.current?.stop();let U=ga.current;if(!U){g("idle");return}let W=nr.current.find(ye=>ye.id===U),be=W?.transcript?.trim()??"";if(!W||be.length===0){tt(null),Ln.current=null,g("idle");return}if(e){if(hn.current){let ee=pe.current,Ie=Ln.current??void 0,_t=`pending-${Date.now()}`;ee&&_v(ee,{id:_t,x:0,y:0,element:Ie,title:"Saving feedback\u2026"},{getSessionPaused:()=>It.current,onMarkerClick:St=>{ue(St.id),X(St.id)}}),tt(null),I(St=>St.filter(Ou=>Ou.id!==U)),x(null),g("idle"),Ln.current=null,a(W.transcript,W.screenshot,{onSuccess:St=>{ee&&Sv(_t,{id:St.id,title:St.title}),A(Ou=>[{id:St.id,title:St.title,description:St.description,type:St.type},...Ou]),ue(St.id),setTimeout(()=>ue(null),1200)},onError:()=>{ee&&vv(_t),b("AI processing failed.")}},W.context??void 0,{sessionMode:!0});return}g("processing"),a(W.transcript,W.screenshot,{onSuccess:ee=>{A(Ie=>[{id:ee.id,title:ee.title,description:ee.description,type:ee.type},...Ie]),I(Ie=>Ie.filter(_t=>_t.id!==U)),x(null),ue(ee.id),setTimeout(()=>ue(null),1200),De(!0),setTimeout(()=>De(!1),200),Ze(!0),setTimeout(()=>{mn(),zn(),Ze(!1)},120)},onError:()=>{b("AI processing failed."),g("voice_listening")}},W.context??void 0);return}g("processing");try{let ye=await a(W.transcript,W.screenshot);if(!ye){g("idle"),mn(),zn();return}A(ee=>[{id:ye.id,title:ye.title,description:ye.description,type:ye.type},...ee]),I(ee=>ee.filter(Ie=>Ie.id!==U)),x(null),ue(ye.id),setTimeout(()=>ue(null),1200),De(!0),setTimeout(()=>De(!1),200),Ze(!0),setTimeout(()=>{mn(),zn(),Ze(!1)},120)}catch(ye){console.error(ye),b("AI processing failed."),g("voice_listening")}},[a,e,mn,zn]),Hn=(0,q.useCallback)(()=>{it.current?.stop();let U=ga.current;I(K=>K.filter(W=>W.id!==U)),x(null),g("cancelled"),mn(),zn()},[mn,zn]);(0,q.useEffect)(()=>{if(!Xe)return;let U=K=>{K.key==="Escape"&&(K.preventDefault(),Hp.includes(jt.current)&&Hn())};return document.addEventListener("keydown",U),()=>document.removeEventListener("keydown",U)},[Xe,Hn]);let Lu=(0,q.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),Au=(0,q.useCallback)(()=>{A([]),I([]),x(null),g("idle"),X(null),nn(null),se(!1)},[]);(0,q.useEffect)(()=>{if(e)return;let U=K=>{let W=K.target;jr.current&&W&&!jr.current.contains(W)&&se(!1)};return document.addEventListener("mousedown",U),()=>document.removeEventListener("mousedown",U)},[e]);let ki=(0,q.useCallback)(async U=>{try{await r(U),A(K=>K.filter(W=>W.id!==U))}catch(K){console.error("Delete failed:",K)}},[r]),Di=(0,q.useCallback)(U=>{nn(U.id),O(U.title),J(U.description)},[]),xu=(0,q.useCallback)(async U=>{let K=M.trim()||M,W=F;A(be=>be.map(ye=>ye.id===U?{...ye,title:K||ye.title,description:W}:ye)),nn(null);try{let be=await OR(`/api/tickets/${U}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:K||M,description:W})}),ye=await be.json();if(be.ok&&ye.success&&ye.ticket){let ee=ye.ticket;A(Ie=>Ie.map(_t=>_t.id===U?{..._t,title:ee.title,description:ee.description,type:ee.type??_t.type}:_t))}}catch(be){console.error("Save edit failed:",be)}},[M,F]),sr=(0,q.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?new Promise((U,K)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},W=>{!W||!W.success?K(new Error("Capture failed")):U(W.screenshot??null)})}):Promise.resolve(null),[]),Ru=(0,q.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return sr();let{captureScreenshot:U}=await Promise.resolve().then(()=>(e1(),ZR));return U()},[sr]),rd=(0,q.useCallback)(()=>{g("region_selecting")},[]),Fs=(0,q.useCallback)((U,K)=>{let W=Tv(),be={id:W,screenshot:U,transcript:"",structuredOutput:null,context:K??null,createdAt:Date.now()};I(ye=>[...ye,be]),x(W),An()},[An]),Kr=(0,q.useCallback)(()=>{g("cancelled"),mn(),zn()},[mn,zn]),Pi=(0,q.useCallback)(U=>{let K=ga.current;K&&I(W=>W.map(be=>be.id===K?{...be,transcript:U}:be))},[]),Wr=(0,q.useCallback)(async()=>{if(!(jt.current!=="idle"||hn.current)){if(console.log("[Echly] Start New Feedback Session clicked"),Os("start"),e&&c&&f){let U=await c();if(!U?.id)return;f(U.id),A([]),_?.()}Qe(!0),dt(!1),tt(null),qn()}},[e,c,f,_,qn]),Ca=(0,q.useCallback)(()=>{hn.current&&(Os("pause"),dt(!0),R?.())},[R]),Oi=(0,q.useCallback)(()=>{hn.current&&(Os("resume"),dt(!1),D?.())},[D]),sd=(0,q.useCallback)(()=>{hn.current&&(Os("end"),L?.(),JR(),Qe(!1),dt(!1),tt(null),mn())},[L,mn]);(0,q.useEffect)(()=>{!e||m===void 0||(m===!0&&(Qe(!0),dt(p??!1),tt(null),pe.current||qn()),p===!0&&dt(!0),m===!1&&(Qe(!1),dt(!1),mn()))},[e,m,p,qn,mn]),(0,q.useEffect)(()=>{e&&m&&p!==void 0&&dt(p)},[e,m,p]),(0,q.useEffect)(()=>{if(!e||m!==!0)return;let U=()=>{document.hidden||!m||pe.current||(Qe(!0),dt(p??!1),tt(null),qn())};return document.addEventListener("visibilitychange",U),()=>document.removeEventListener("visibilitychange",U)},[e,m,p,qn]),(0,q.useEffect)(()=>{!e||!u?.sessionId||(A(u.pointers??[]),Qe(!0),dt(!1),tt(null),qn(),l?.())},[e,u,qn,l]);let ku=(0,q.useCallback)(async U=>{if(yt&&!pe.current){tt(null);return}if(!sr||yt!=null)return;Os("element clicked"),Up();let K=null;try{K=await sr()}catch{return}if(!K)return;let W;try{W=await WR(K,U)}catch{return}let be=Vp(window,U);Ln.current=U instanceof HTMLElement?U:null,tt({screenshot:W,context:be})},[sr,yt]),Du=(0,q.useCallback)(U=>{let K=yt;if(!K||!U||U.trim().length===0){tt(null);return}let W=pe.current,be=Ln.current??void 0,ye=`pending-${Date.now()}`;W&&_v(W,{id:ye,x:0,y:0,element:be??void 0,title:"Saving feedback\u2026"},{getSessionPaused:()=>It.current,onMarkerClick:Ie=>{ue(Ie.id),X(Ie.id)}}),tt(null),g("idle"),Ln.current=null,a(U,K.screenshot,{onSuccess:Ie=>{W&&Sv(ye,{id:Ie.id,title:Ie.title}),A(_t=>[{id:Ie.id,title:Ie.title,description:Ie.description,type:Ie.type},..._t]),ue(Ie.id),setTimeout(()=>ue(null),1200)},onError:()=>{W&&vv(ye),b("AI processing failed.")}},K.context??void 0,{sessionMode:!0})},[yt,a]),Pu=(0,q.useCallback)(()=>{tt(null)},[]),Mi=(0,q.useCallback)(()=>{let U=yt;if(!U)return;let K=Tv(),W={id:K,screenshot:U.screenshot,transcript:"",structuredOutput:null,context:U.context??null,createdAt:Date.now()};I(be=>[...be,W]),x(K),An()},[yt,An]),Ni=(0,q.useCallback)(async()=>{if(jt.current==="idle"&&(b(null),it.current?.stop(),fe(H),j(!1),qn(),g("focus_mode"),!e))try{let U=await Ru();if(!U){Kr();return}let K=Tv(),W={id:K,screenshot:U,transcript:"",structuredOutput:null,createdAt:Date.now()};I(be=>[...be,W]),x(K),An()}catch(U){console.error(U),b("Screen capture failed."),g("error"),Kr()}},[e,H,Ru,An,qn,Kr]),id=(0,q.useMemo)(()=>({setIsOpen:td,toggleOpen:nd,startDrag:Us,handleShare:Lu,setShowMenu:se,resetSession:Au,startListening:An,finishListening:ad,discardListening:Hn,deletePointer:ki,startEditing:Di,saveEdit:xu,setExpandedId:X,setEditedTitle:O,setEditedDescription:J,handleAddFeedback:Ni,handleRegionCaptured:Fs,handleRegionSelectStart:rd,handleCancelCapture:Kr,getFullTabImage:sr,setActiveRecordingTranscript:Pi,startSession:Wr,pauseSession:Ca,resumeSession:Oi,endSession:sd,handleSessionElementClicked:ku,handleSessionFeedbackSubmit:Du,handleSessionFeedbackCancel:Pu,handleSessionStartVoice:Mi}),[td,nd,Us,Lu,Au,An,ad,Hn,ki,Di,xu,X,O,J,Ni,Fs,rd,Kr,sr,Pi,Wr,Ca,Oi,sd,ku,Du,Pu,Mi]),Vi=(0,q.useMemo)(()=>w?T.find(U=>U.id===w):null,[w,T]),od=(0,q.useMemo)(()=>S!=="voice_listening"?"neutral":hF(Vi?.transcript??""),[S,Vi?.transcript]),Yp=Vi?.transcript?.trim()??"";return{state:{isOpen:H,state:S,errorMessage:v,pointers:C,expandedId:E,editingId:re,editedTitle:M,editedDescription:F,showMenu:Y,position:$e,liveStructured:an,liveTranscript:Yp,listeningAudioLevel:N,listeningSentiment:od,highlightTicketId:_e,pillExiting:Gt,orbSuccess:et,sessionMode:Pe,sessionPaused:rn,sessionFeedbackPending:yt},handlers:id,refs:{widgetRef:He,menuRef:jr,captureRootRef:pe},captureRootReady:Xe,captureRootEl:Te}}var jp=he(xn());var Gp=(...t)=>t.filter((e,n,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===n).join(" ").trim();var n1=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var a1=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,a)=>a?a.toUpperCase():n.toLowerCase());var bv=t=>{let e=a1(t);return e.charAt(0).toUpperCase()+e.slice(1)};var Wc=he(xn());var r1={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var s1=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var i1=(0,Wc.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:r="",children:s,iconNode:i,...u},l)=>(0,Wc.createElement)("svg",{ref:l,...r1,width:e,height:e,stroke:t,strokeWidth:a?Number(n)*24/Number(e):n,className:Gp("lucide",r),...!s&&!s1(u)&&{"aria-hidden":"true"},...u},[...i.map(([c,f])=>(0,Wc.createElement)(c,f)),...Array.isArray(s)?s:[s]]));var Ja=(t,e)=>{let n=(0,jp.forwardRef)(({className:a,...r},s)=>(0,jp.createElement)(i1,{ref:s,iconNode:e,className:Gp(`lucide-${n1(bv(t))}`,`lucide-${t}`,a),...r}));return n.displayName=bv(t),n};var gF=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Xc=Ja("check",gF);var yF=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],Qc=Ja("expand",yF);var IF=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],Yc=Ja("pencil",IF);var _F=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],$c=Ja("trash-2",_F);var SF=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Jc=Ja("x",SF);var _n=he(Ke()),vF=()=>(0,_n.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,_n.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,_n.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),TF=()=>(0,_n.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,_n.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function Ev({onClose:t,summary:e=null,theme:n="dark",onThemeToggle:a}){return(0,_n.jsxs)("div",{className:"echly-sidebar-header",children:[(0,_n.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,_n.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,_n.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),a&&(0,_n.jsx)("button",{type:"button",id:"theme-toggle",onClick:a,className:"echly-theme-toggle","aria-label":n==="dark"?"Switch to light mode":"Switch to dark mode",children:n==="dark"?(0,_n.jsx)(vF,{}):(0,_n.jsx)(TF,{})}),(0,_n.jsx)("button",{type:"button",onClick:t,className:"echly-sidebar-close","aria-label":"Close",children:(0,_n.jsx)(Jc,{size:16,strokeWidth:1.5})})]})}var Hr=he(xn());var pt=he(Ke());function bF(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function EF({item:t,expandedId:e,editingId:n,editedTitle:a,editedDescription:r,onExpand:s,onStartEdit:i,onSaveEdit:u,onDelete:l,onEditedTitleChange:c,onEditedDescriptionChange:f,highlightTicketId:m=null}){let p=e===t.id,_=n===t.id,R=m===t.id,D=bF(t.type),[L,T]=(0,Hr.useState)(!1),I=(0,Hr.useCallback)(()=>{s(p?null:t.id)},[p,t.id,s]),w=(0,Hr.useCallback)(()=>{i(t)},[t,i]),x=(0,Hr.useCallback)(()=>{u(t.id),T(!0),setTimeout(()=>T(!1),220)},[t.id,u]),H=(0,Hr.useCallback)(()=>{l(t.id)},[t.id,l]);return(0,pt.jsxs)("div",{className:`echly-feedback-item ${R?"echly-ticket-highlight":""}`,"data-priority":D,children:[(0,pt.jsx)("span",{className:"echly-priority-dot","aria-hidden":!0}),(0,pt.jsxs)("div",{className:"echly-feedback-item-inner",children:[(0,pt.jsx)("div",{className:"echly-feedback-item-content",children:_?(0,pt.jsxs)(pt.Fragment,{children:[(0,pt.jsx)("input",{value:a,onChange:j=>c(j.target.value),className:"echly-widget-input echly-feedback-item-input"}),(0,pt.jsx)("textarea",{value:r,onChange:j=>f(j.target.value),rows:3,className:"echly-widget-input echly-feedback-item-textarea"})]}):(0,pt.jsx)(pt.Fragment,{children:(0,pt.jsx)("h3",{className:"echly-widget-item-title",children:t.title})})}),(0,pt.jsxs)("div",{className:"echly-feedback-item-actions",children:[(0,pt.jsx)("button",{type:"button",onClick:I,className:"echly-widget-action-icon","aria-label":p?"Collapse":"Expand",children:(0,pt.jsx)(Qc,{size:16,strokeWidth:1.5})}),_?(0,pt.jsx)("button",{type:"button",onClick:x,className:`echly-widget-action-icon echly-widget-action-icon--confirm ${L?"echly-widget-action-icon--confirm-success":""}`,"aria-label":"Save",children:(0,pt.jsx)(Xc,{size:16,strokeWidth:1.5})}):(0,pt.jsx)("button",{type:"button",onClick:w,className:"echly-widget-action-icon","aria-label":"Edit",children:(0,pt.jsx)(Yc,{size:16,strokeWidth:1.5})}),(0,pt.jsx)("button",{type:"button",onClick:H,className:"echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,pt.jsx)($c,{size:16,strokeWidth:1.5})})]})]})]})}var o1=Hr.default.memo(EF,(t,e)=>t.item===e.item&&t.expandedId===e.expandedId&&t.editingId===e.editingId&&t.editedTitle===e.editedTitle&&t.editedDescription===e.editedDescription&&t.highlightTicketId===e.highlightTicketId);var Ai=he(Ke());function wv({isIdle:t,onAddFeedback:e,extensionMode:n=!1,onStartSession:a,onResumeSession:r,captureDisabled:s=!1}){let i=!t||s;return n?(0,Ai.jsxs)("div",{className:"echly-add-insight-wrap",children:[(0,Ai.jsx)("button",{type:"button",onClick:i?void 0:a,disabled:i,className:`echly-add-insight-btn ${i?"echly-add-insight-btn--disabled":""}`,"aria-label":"Start New Feedback Session",children:"Start New Feedback Session"}),r&&(0,Ai.jsx)("button",{type:"button",onClick:i?void 0:r,disabled:i,className:"echly-add-insight-btn echly-add-insight-btn--secondary","aria-label":"Resume Feedback Session",style:{marginTop:8,background:"rgba(37, 99, 235, 0.15)",color:"#2563eb",border:"1px solid rgba(37, 99, 235, 0.4)"},children:"Resume Feedback Session"})]}):(0,Ai.jsx)("div",{className:"echly-add-insight-wrap",children:(0,Ai.jsx)("button",{type:"button",onClick:i?void 0:e,disabled:i,className:`echly-add-insight-btn ${i?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var y1=he(vd());var Ms=he(xn()),m1=he(vd());var u1={outline:"2px solid #2563eb",background:"rgba(37,99,235,0.1)"},Vt=null,Zc=null,Kp=null;function wF(t,e){if(typeof document.elementsFromPoint!="function")return document.elementFromPoint(t,e);let n=document.elementsFromPoint(t,e);for(let a of n)if(Fp(a))return a;return null}function l1(t){if(Vt){if(!t||t.width===0||t.height===0){Vt.style.display="none";return}Vt.style.display="block",Vt.style.left=`${t.left}px`,Vt.style.top=`${t.top}px`,Vt.style.width=`${t.width}px`,Vt.style.height=`${t.height}px`}}function CF(t,e){if(!e()){Vt&&(Vt.style.display="none"),Kp=null;return}let n=wF(t.clientX,t.clientY);if(n!==Kp){if(Kp=n,!n){l1(null);return}let a=n.getBoundingClientRect();l1(a)}}function c1(t,e){return Vt&&Vt.parentNode&&Wp(),Vt=document.createElement("div"),Vt.setAttribute("aria-hidden","true"),Vt.setAttribute("data-echly-ui","true"),Vt.style.cssText=["position:fixed","pointer-events:none","z-index:2147483646","box-sizing:border-box","border-radius:4px",`outline:${u1.outline}`,`background:${u1.background}`,"display:none"].join(";"),t.appendChild(Vt),Zc=n=>CF(n,e.getActive),document.addEventListener("mousemove",Zc,{passive:!0}),()=>Wp()}function Wp(){Zc&&(document.removeEventListener("mousemove",Zc),Zc=null),Kp=null,Vt?.parentNode&&Vt.parentNode.removeChild(Vt),Vt=null}var xi=null,Cv=()=>!1,Lv=()=>{};function LF(t){if(t.button!==0||!Cv())return;let e=t.target;!e||!Fp(e)||(t.preventDefault(),t.stopPropagation(),Os("element clicked"),Lv(e))}function d1(t,e){return Cv=e.enabled,Lv=e.onElementClicked,xi&&document.removeEventListener("click",xi,!0),xi=LF,document.addEventListener("click",xi,!0),()=>Av()}function Av(){xi&&(document.removeEventListener("click",xi,!0),xi=null),Cv=()=>!1,Lv=()=>{}}var Ri=he(Ke());function f1({sessionPaused:t,onPause:e,onResume:n,onEnd:a}){return(0,Ri.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.3)",zIndex:2147483647,border:"1px solid rgba(255,255,255,0.08)"},children:[(0,Ri.jsx)("span",{style:{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"},children:t?"Session paused":"Recording Session"}),t?(0,Ri.jsx)("button",{type:"button",onClick:n,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg, #2563eb, #1d4ed8)",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Resume Feedback Session"}):(0,Ri.jsx)("button",{type:"button",onClick:e,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Pause"}),(0,Ri.jsx)("button",{type:"button",onClick:a,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"rgba(239,68,68,0.9)",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"},children:"End"})]})}var xv=he(xn()),Ht=he(Ke());function h1({screenshot:t,isVoiceListening:e,onRecordVoice:n,onDoneVoice:a,onSaveText:r,onCancel:s}){let[i,u]=(0,xv.useState)("choose"),[l,c]=(0,xv.useState)("");return(0,Ht.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"min(380px, 92vw)",borderRadius:16,background:"rgba(20,22,28,0.98)",backdropFilter:"blur(16px)",boxShadow:"0 24px 48px rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",zIndex:2147483647,overflow:"hidden",display:"flex",flexDirection:"column"},children:[(0,Ht.jsxs)("div",{style:{padding:16,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,Ht.jsx)("div",{style:{borderRadius:8,overflow:"hidden",background:"#111",aspectRatio:"16/10",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,Ht.jsx)("img",{src:t,alt:"Capture",style:{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}})}),(0,Ht.jsx)("p",{style:{margin:"12px 0 0",fontSize:13,color:"rgba(255,255,255,0.7)"},children:"Speak or type feedback"})]}),(0,Ht.jsxs)("div",{style:{padding:16,display:"flex",flexDirection:"column",gap:10},children:[i==="choose"&&(0,Ht.jsxs)(Ht.Fragment,{children:[(0,Ht.jsx)("button",{type:"button",onClick:()=>{u("voice"),n()},style:{padding:"12px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg, #2563eb, #1d4ed8)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"},children:"Describe the change"}),(0,Ht.jsx)("button",{type:"button",onClick:()=>{u("text")},style:{padding:"12px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.9)",fontSize:14,fontWeight:500,cursor:"pointer"},children:"Type feedback"})]}),i==="voice"&&(0,Ht.jsx)("button",{type:"button",onClick:a,disabled:!e,style:{padding:"12px 16px",borderRadius:10,border:"none",background:e?"linear-gradient(135deg, #2563eb, #1d4ed8)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:14,fontWeight:600,cursor:e?"pointer":"default"},children:e?"Save feedback":"Saving feedback\u2026"}),i==="text"&&(0,Ht.jsxs)(Ht.Fragment,{children:[(0,Ht.jsx)("textarea",{value:l,onChange:_=>c(_.target.value),placeholder:"Describe feedback","aria-label":"Feedback text",rows:3,style:{width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.95)",fontSize:14,resize:"vertical",minHeight:80}}),(0,Ht.jsx)("button",{type:"button",onClick:()=>{let _=l.trim();_&&r(_)},disabled:!l.trim(),style:{padding:"12px 16px",borderRadius:10,border:"none",background:l.trim()?"linear-gradient(135deg, #2563eb, #1d4ed8)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:14,fontWeight:600,cursor:l.trim()?"pointer":"default"},children:"Save feedback"})]}),s&&i==="choose"&&(0,Ht.jsx)("button",{type:"button",onClick:s,style:{padding:"8px 12px",border:"none",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:13,cursor:"pointer",alignSelf:"flex-start"},children:"Discard"})]})]})}var Ns=he(Ke()),p1=12;function g1({captureRoot:t,sessionMode:e,sessionPaused:n,sessionFeedbackPending:a,state:r,onElementClicked:s,onPause:i,onResume:u,onEnd:l,onRecordVoice:c,onDoneVoice:f,onSaveText:m,onCancel:p}){let _=(0,Ms.useRef)([]),[R,D]=(0,Ms.useState)(null),L=e&&!n&&a==null;if((0,Ms.useEffect)(()=>{if(!e||!t)return;let I=()=>e&&!n&&a==null;return _.current.push(c1(t,{getActive:I})),_.current.push(d1(t,{enabled:I,onElementClicked:s})),()=>{_.current.forEach(w=>w()),_.current=[],Wp(),Av()}},[e,t,n,a,s]),(0,Ms.useEffect)(()=>{if(!(!L||!t?.isConnected))return document.body.style.cursor="pointer",()=>{document.body.style.cursor=""}},[L,t]),(0,Ms.useEffect)(()=>{if(!L){D(null);return}let I=w=>{D({x:w.clientX+p1,y:w.clientY+p1})};return window.addEventListener("mousemove",I,{passive:!0}),()=>window.removeEventListener("mousemove",I)},[L]),!e||!t)return null;let T=(0,Ns.jsxs)(Ns.Fragment,{children:[(0,Ns.jsx)(f1,{sessionPaused:n,onPause:i,onResume:u,onEnd:l}),L&&R!=null&&(0,Ns.jsx)("div",{"aria-hidden":!0,className:"echly-capture-tooltip",style:{position:"fixed",left:R.x,top:R.y,pointerEvents:"none",zIndex:2147483646,padding:"6px 10px",fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.95)",background:"rgba(0,0,0,0.75)",borderRadius:6,whiteSpace:"nowrap",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"},children:"Click to add feedback"}),a&&(0,Ns.jsx)(h1,{screenshot:a.screenshot,isVoiceListening:r==="voice_listening",onRecordVoice:c,onDoneVoice:f,onSaveText:m,onCancel:p})]});return(0,m1.createPortal)(T,t)}var Za=he(Ke());function I1({captureRoot:t,extensionMode:e,state:n,getFullTabImage:a,onRegionCaptured:r,onRegionSelectStart:s,onCancelCapture:i,sessionMode:u=!1,sessionPaused:l=!1,sessionFeedbackPending:c=null,onSessionElementClicked:f,onSessionPause:m,onSessionResume:p,onSessionEnd:_,onSessionRecordVoice:R,onSessionDoneVoice:D,onSessionSaveText:L,onSessionFeedbackCancel:T=()=>{}}){let I=u&&e;return(0,Za.jsx)(Za.Fragment,{children:(0,y1.createPortal)((0,Za.jsxs)(Za.Fragment,{children:[I&&f&&m&&p&&_&&R&&D&&L&&(0,Za.jsx)(g1,{captureRoot:t,sessionMode:u,sessionPaused:l,sessionFeedbackPending:c??null,state:n,onElementClicked:f,onPause:m,onResume:p,onEnd:_,onRecordVoice:R,onDoneVoice:D,onSaveText:L,onCancel:T}),!I&&(n==="focus_mode"||n==="region_selecting")&&(0,Za.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.04)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),!I&&e&&(n==="focus_mode"||n==="region_selecting")&&(0,Za.jsx)(jR,{getFullTabImage:a,onAddVoice:r,onCancel:i,onSelectionStart:s})]}),t)})}var Xp=he(xn());var Gr=he(Ke());function AF(){return(0,Gr.jsxs)("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,Gr.jsx)("path",{d:"M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"}),(0,Gr.jsx)("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2"}),(0,Gr.jsx)("line",{x1:"12",x2:"12",y1:"19",y2:"22"})]})}function _1({isRecording:t,isProcessing:e,audioLevel:n}){let a=t&&!e?1+Math.min(.1,n*.1):1;return(0,Gr.jsx)("div",{className:["echly-recording-orb-inner",e?"echly-recording-orb-inner--processing":"",t&&!e?"echly-recording-orb-inner--listening":""].filter(Boolean).join(" "),style:t&&!e?{transform:`scale(${a})`}:void 0,"aria-hidden":!0,children:(0,Gr.jsx)("span",{className:"echly-recording-orb-icon",style:{color:"#FFFFFF"},children:(0,Gr.jsx)(AF,{})})})}var ma=he(Ke());function S1({visible:t,isActive:e,isProcessing:n,isExiting:a=!1,audioLevel:r,onDone:s,onCancel:i}){let[u,l]=(0,Xp.useState)(!1);(0,Xp.useEffect)(()=>{if(e||n){let p=requestAnimationFrame(()=>{requestAnimationFrame(()=>l(!0))});return()=>cancelAnimationFrame(p)}let m=requestAnimationFrame(()=>l(!1));return()=>cancelAnimationFrame(m)},[e,n]);let c=n?"Saving feedback\u2026":e?"Listening\u2026":"Tell us what's happening \u2014 we'll structure it.",f=e&&!n;return t?(0,ma.jsx)("div",{className:"echly-recording-row","aria-live":"polite",role:"status",children:(0,ma.jsxs)("div",{className:["echly-recording-capsule",u?"echly-recording-capsule--expanded":"",n?"echly-recording-capsule--processing":"",a?"echly-recording-capsule--exiting":"",e&&!n?"echly-recording-capsule--recording":""].filter(Boolean).join(" "),children:[(0,ma.jsx)("div",{className:"echly-recording-orb",children:(0,ma.jsx)(_1,{isRecording:e,isProcessing:n,audioLevel:r})}),(0,ma.jsxs)("div",{className:"echly-recording-center",children:[(0,ma.jsx)("span",{className:"echly-recording-status",children:c}),f&&(0,ma.jsx)("span",{className:"echly-recording-esc-hint",children:"Press Esc to cancel"}),(0,ma.jsxs)("div",{className:"echly-recording-action-row",children:[(0,ma.jsx)("button",{type:"button",onClick:i,className:"echly-recording-cancel-pill","aria-label":"Discard",children:"Discard"}),e&&!n&&(0,ma.jsx)("button",{type:"button",className:"echly-recording-done",onClick:s,"aria-label":"Save feedback",children:"Save feedback"})]})]})]})}):null}var er=he(xn()),Ut=he(Ke());function xF(t,e){if(e==="all")return t;let n=Date.now(),a={today:24*60*60*1e3,"7days":7*24*60*60*1e3,"30days":30*24*60*60*1e3},r=n-a[e];return t.filter(s=>(s.updatedAt?new Date(s.updatedAt).getTime():0)>=r)}function RF(t){if(!t)return"\u2014";let e=new Date(t),a=new Date().getTime()-e.getTime(),r=Math.floor(a/6e4);if(r<1)return"Just now";if(r<60)return`${r}m ago`;let s=Math.floor(r/60);if(s<24)return`${s}h ago`;let i=Math.floor(s/24);return i<7?`${i}d ago`:e.toLocaleDateString()}function v1({open:t,onClose:e,fetchSessions:n,onSelectSession:a}){let[r,s]=(0,er.useState)([]),[i,u]=(0,er.useState)(!1),[l,c]=(0,er.useState)(null),[f,m]=(0,er.useState)(""),[p,_]=(0,er.useState)("all");(0,er.useEffect)(()=>{t&&(m(""),_("all"),c(null),u(!0),n().then(L=>{console.log("[Echly] Sessions returned:",L),s(L)}).catch(L=>c(L instanceof Error?L.message:"Failed to load sessions")).finally(()=>u(!1)))},[t,n]);let R=(0,er.useMemo)(()=>{let L=xF(r,p);if(f.trim()){let T=f.trim().toLowerCase();L=L.filter(I=>(I.title??"").toLowerCase().includes(T)||(I.id??"").toLowerCase().includes(T))}return L},[r,p,f]),D=L=>{if(typeof L.feedbackCount=="number")return L.feedbackCount;let T=typeof L.openCount=="number"?L.openCount:0,I=typeof L.resolvedCount=="number"?L.resolvedCount:0,w=typeof L.skippedCount=="number"?L.skippedCount:0;return T+I+w};return t?(0,Ut.jsx)("div",{"data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:24},onClick:L=>L.target===L.currentTarget&&e(),role:"dialog","aria-modal":"true","aria-labelledby":"resume-session-modal-title",children:(0,Ut.jsxs)("div",{style:{width:"min(420px, 100%)",maxHeight:"85vh",borderRadius:16,background:"rgba(20,22,28,0.98)",backdropFilter:"blur(16px)",boxShadow:"0 24px 48px rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",overflow:"hidden",display:"flex",flexDirection:"column"},onClick:L=>L.stopPropagation(),children:[(0,Ut.jsxs)("div",{style:{padding:16,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,Ut.jsx)("h2",{id:"resume-session-modal-title",style:{margin:"0 0 12px",fontSize:18,fontWeight:600,color:"rgba(255,255,255,0.95)"},children:"Resume Feedback Session"}),(0,Ut.jsx)("input",{type:"search",placeholder:"Search sessions",value:f,onChange:L=>m(L.target.value),"aria-label":"Search sessions",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.95)",fontSize:14}}),(0,Ut.jsx)("div",{style:{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"},children:["today","7days","30days","all"].map(L=>(0,Ut.jsx)("button",{type:"button",onClick:()=>_(L),style:{padding:"6px 10px",borderRadius:6,border:"none",background:p===L?"rgba(37, 99, 235, 0.4)":"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:500,cursor:"pointer"},children:L==="today"?"Today":L==="7days"?"Last 7 days":L==="30days"?"Last 30 days":"All sessions"},L))})]}),(0,Ut.jsxs)("div",{style:{flex:1,overflow:"auto",minHeight:200,maxHeight:360},children:[i&&(0,Ut.jsx)("div",{style:{padding:24,textAlign:"center",color:"rgba(255,255,255,0.6)"},children:"Loading sessions\u2026"}),l&&(0,Ut.jsx)("div",{style:{padding:24,color:"#ef4444",fontSize:14},children:l}),!i&&!l&&R.length===0&&(0,Ut.jsx)("div",{style:{padding:24,textAlign:"center",color:"rgba(255,255,255,0.6)"},children:"No sessions match."}),!i&&!l&&R.length>0&&(0,Ut.jsx)("ul",{style:{listStyle:"none",margin:0,padding:8},children:R.map(L=>(0,Ut.jsx)("li",{children:(0,Ut.jsxs)("button",{type:"button",onClick:()=>{a(L.id),e()},style:{width:"100%",textAlign:"left",padding:"12px 14px",borderRadius:10,border:"none",background:"transparent",color:"rgba(255,255,255,0.9)",fontSize:14,cursor:"pointer",marginBottom:4},onMouseEnter:T=>{T.currentTarget.style.background="rgba(255,255,255,0.08)"},onMouseLeave:T=>{T.currentTarget.style.background="transparent"},children:[(0,Ut.jsx)("div",{style:{fontWeight:600},children:L.title?.trim()||"Untitled Session"}),(0,Ut.jsxs)("div",{style:{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4},children:[D(L)," feedback items \xB7 ",RF(L.updatedAt)]})]})},L.id))})]}),(0,Ut.jsx)("div",{style:{padding:12,borderTop:"1px solid rgba(255,255,255,0.08)"},children:(0,Ut.jsx)("button",{type:"button",onClick:e,style:{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.8)",fontSize:13,cursor:"pointer"},children:"Cancel"})})]})}):null}var mt=he(Ke()),kF=["focus_mode","region_selecting","voice_listening","processing"],DF=["voice_listening","processing"];function Qp({sessionId:t,userId:e,extensionMode:n=!1,initialPointers:a,onComplete:r,onDelete:s,widgetToggleRef:i,onRecordingChange:u,expanded:l,onExpandRequest:c,onCollapseRequest:f,liveStructureFetch:m,captureDisabled:p=!1,theme:_="dark",onThemeToggle:R,fetchSessions:D,onResumeSessionSelect:L,loadSessionWithPointers:T,onSessionLoaded:I,onSessionEnd:w,onCreateSession:x,onActiveSessionChange:H,globalSessionModeActive:j,globalSessionPaused:S,onSessionModeStart:g,onSessionModePause:v,onSessionModeResume:b,onSessionModeEnd:C}){let[A,E]=(0,tr.useState)(!1),{state:X,handlers:re,refs:nn,captureRootEl:M}=t1({sessionId:t,userId:e,extensionMode:n,initialPointers:a,onComplete:r,onDelete:s,onRecordingChange:u,liveStructureFetch:m,loadSessionWithPointers:T,onSessionLoaded:I,onCreateSession:x,onActiveSessionChange:H,globalSessionModeActive:j,globalSessionPaused:S,onSessionModeStart:g,onSessionModePause:v,onSessionModeResume:b,onSessionModeEnd:C}),F=l!==void 0?l:X.isOpen,J=(0,tr.useRef)(null),Y=kF.includes(X.state)||X.pillExiting,se=(DF.includes(X.state)||X.pillExiting)&&!X.sessionFeedbackPending,$e=!Y&&!X.sessionMode,Me=X.sessionMode&&X.sessionPaused,We=!F&&$e&&!Me,Je=F&&$e||Me,Cn=(0,tr.useRef)(!1);(0,tr.useEffect)(()=>{if(!Y){Cn.current=!1;return}Cn.current||(Cn.current=!0,f?.())},[Y,f]);let Sn=X.pointers.length,an=X.pointers.filter(N=>/critical|bug|high|urgent/i.test(N.type||"")).length,vn=Sn>0?an>0?`${Sn} insights \u2022 ${an} need attention`:`${Sn} insights`:null;return(0,tr.useEffect)(()=>{X.highlightTicketId&&J.current&&J.current.scrollTo({top:0,behavior:"smooth"})},[X.highlightTicketId]),tr.default.useEffect(()=>{if(i)return i.current=re.toggleOpen,()=>{i.current=null}},[re,i]),(0,mt.jsxs)(mt.Fragment,{children:[n&&D&&L&&(0,mt.jsx)(v1,{open:A,onClose:()=>E(!1),fetchSessions:D,onSelectSession:N=>{L(N),E(!1)}}),M&&(0,mt.jsx)(I1,{captureRoot:M,extensionMode:n,state:X.state,getFullTabImage:re.getFullTabImage,onRegionCaptured:re.handleRegionCaptured,onRegionSelectStart:re.handleRegionSelectStart,onCancelCapture:re.handleCancelCapture,sessionMode:X.sessionMode,sessionPaused:X.sessionPaused,sessionFeedbackPending:X.sessionFeedbackPending,onSessionElementClicked:re.handleSessionElementClicked,onSessionPause:()=>{re.pauseSession(),c?.()},onSessionResume:()=>{re.resumeSession(),f?.()},onSessionEnd:()=>{re.endSession(),w?.()},onSessionRecordVoice:re.handleSessionStartVoice,onSessionDoneVoice:re.finishListening,onSessionSaveText:re.handleSessionFeedbackSubmit,onSessionFeedbackCancel:re.handleSessionFeedbackCancel}),se&&(0,mt.jsx)(mt.Fragment,{children:(0,mt.jsx)(S1,{visible:!0,isActive:X.state==="voice_listening",isProcessing:X.state==="processing"||X.pillExiting,isExiting:X.pillExiting,audioLevel:X.listeningAudioLevel??0,sentiment:X.listeningSentiment??"neutral",liveTranscript:X.liveTranscript??"",onDone:re.finishListening,onCancel:re.handleCancelCapture})}),We&&(0,mt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,mt.jsx)("button",{type:"button",onClick:()=>c?c():re.setIsOpen(!0),className:"echly-floating-trigger",children:n?"Echly":"Capture feedback"})}),Je&&(0,mt.jsxs)(mt.Fragment,{children:[!n&&(0,mt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,mt.jsx)("div",{ref:nn.widgetRef,className:"echly-sidebar-container",style:n?{position:"fixed",...X.position?{left:X.position.x,top:X.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,mt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,mt.jsx)(Ev,{onClose:()=>f?f():re.setIsOpen(!1),summary:vn,theme:_,onThemeToggle:R}),(0,mt.jsxs)("div",{ref:J,className:"echly-sidebar-body",children:[(0,mt.jsx)("div",{className:"echly-feedback-list",children:X.pointers.map(N=>(0,mt.jsx)(o1,{item:N,expandedId:X.expandedId,editingId:X.editingId,editedTitle:X.editedTitle,editedDescription:X.editedDescription,onExpand:re.setExpandedId,onStartEdit:re.startEditing,onSaveEdit:re.saveEdit,onDelete:re.deletePointer,onEditedTitleChange:re.setEditedTitle,onEditedDescriptionChange:re.setEditedDescription,highlightTicketId:X.highlightTicketId},N.id))}),X.errorMessage&&(0,mt.jsx)("div",{className:"echly-sidebar-error",children:X.errorMessage}),X.state==="idle"&&(0,mt.jsx)(wv,{isIdle:!0,onAddFeedback:re.handleAddFeedback,extensionMode:n,onStartSession:n?re.startSession:void 0,onResumeSession:n&&D&&L?()=>E(!0):void 0,captureDisabled:p})]})]})})]})]})}var gt=he(Ke()),PF="echly-root",ed="echly-shadow-host",b1="widget-theme";function OF(){try{let t=localStorage.getItem(b1);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function MF(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem(b1,e)}catch{}}function NF(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function VF({widgetRoot:t,initialTheme:e}){let[n,a]=ve.default.useState(null),[r,s]=ve.default.useState(null),[i,u]=ve.default.useState(!1),[l,c]=ve.default.useState(e),[f,m]=ve.default.useState({visible:!1,expanded:!1,isRecording:!1,sessionId:null,sessionModeActive:!1,sessionPaused:!1}),[p,_]=ve.default.useState(null),[R,D]=ve.default.useState(null),L=p??f.sessionId,T=ve.default.useRef(null),I=ve.default.useRef(!1),[w,x]=ve.default.useState(null),[H,j]=ve.default.useState(!1),[S,g]=ve.default.useState(!1),[v,b]=ve.default.useState(""),C=ve.default.useRef(null),A=ve.default.useRef(!1),[E,X]=ve.default.useState(!1),re=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";ve.default.useEffect(()=>{let N=()=>{T.current?.()};return window.addEventListener("ECHLY_TOGGLE_WIDGET",N),()=>{window.removeEventListener("ECHLY_TOGGLE_WIDGET",N)}},[]),ve.default.useEffect(()=>{let N=te=>{let ae=te.detail?.state;ae&&m(ae)};return window.addEventListener("ECHLY_GLOBAL_STATE",N),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",N)},[]),ve.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},N=>{let te=E1(N);if(!te)return;let ae=document.getElementById(ed);ae&&(ae.style.display=te.visible?"block":"none"),w1(te)})},[]),ve.default.useEffect(()=>{if(!f.sessionModeActive||!f.sessionId)return;let N=!1;return(async()=>{try{let te=await ft(`/api/feedback?sessionId=${encodeURIComponent(f.sessionId)}&limit=50`);if(N)return;let _e=((await te.json()).feedback??[]).map(ue=>({id:ue.id,title:ue.title??"",description:ue.description??"",type:ue.type??"Feedback"}));if(N)return;D({sessionId:f.sessionId,pointers:_e})}catch(te){N||(console.error("[Echly] Failed to load session feedback for markers:",te),D({sessionId:f.sessionId,pointers:[]}))}})(),()=>{N=!0}},[f.sessionModeActive,f.sessionId]),ve.default.useEffect(()=>{let N=()=>{let ae=window.location.origin;if(!(ae==="https://echly-web.vercel.app"||ae==="http://localhost:3000"))return;let _e=window.location.pathname.split("/").filter(Boolean);_e[0]==="dashboard"&&_e[1]&&chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:_e[1]},()=>{})};N(),window.addEventListener("popstate",N);let te=setInterval(N,2e3);return()=>{window.removeEventListener("popstate",N),clearInterval(te)}},[]);let nn=ve.default.useCallback(N=>{N?chrome.runtime.sendMessage({type:"START_RECORDING"},te=>{if(chrome.runtime.lastError){s(chrome.runtime.lastError.message||"Failed to start recording");return}te?.ok||s(te?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),M=ve.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{})},[]),O=ve.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{})},[]),F=ve.default.useCallback(()=>{let N=l==="dark"?"light":"dark";c(N),MF(t,N)},[l,t]);ve.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},N=>{N?.authenticated&&N.user?.uid?a({uid:N.user.uid,name:N.user.name??null,email:N.user.email??null,photoURL:N.user.photoURL??null}):a(null),u(!0)})},[]);let J=ve.default.useCallback(async(N,te,ae,fe,_e)=>{if(!I.current){if(I.current=!0,!L||!n){ae?.onError(),I.current=!1;return}if(ae){(async()=>{let ue=eI(te??null),Gt=Hy(),Ze=Gy(),Xe=te?jy(te,L,Ze):Promise.resolve(null),ge=await ue;console.log("[OCR] Extracted visibleText:",ge);let Te=typeof window<"u"?window.location.href:"",Ue={...fe??{},visibleText:ge?.trim()&&ge||fe?.visibleText||null,url:fe?.url??Te},et={transcript:N,context:Ue};try{let Pe=await(await ft("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(et)})).json(),Qe=Array.isArray(Pe.tickets)?Pe.tickets:[],rn=typeof Pe.clarityScore=="number"?Pe.clarityScore:Pe.clarityScore!=null?Number(Pe.clarityScore):100,dt=Pe.clarityIssues??[],yt=Pe.suggestedRewrite??null,tt=Pe.confidence??.5;if(!!!_e?.sessionMode){if(Pe.success&&rn<=20){console.log("CLARITY GUARD TRIGGERED",rn),x({tickets:Qe,screenshotUrl:null,screenshotId:Ze,uploadPromise:Xe,transcript:N,screenshot:te,firstFeedbackId:Gt,clarityScore:rn,clarityIssues:dt,suggestedRewrite:yt,confidence:tt,callbacks:ae,context:Ue}),b(N),g(!1),A.current=!1,X(!1),j(!0),I.current=!1;return}let He=!!Pe.needsClarification,pe=Pe.verificationIssues??[];if(Pe.success&&He&&Qe.length===0){console.log("PIPELINE NEEDS CLARIFICATION",pe),x({tickets:[],screenshotUrl:null,screenshotId:Ze,uploadPromise:Xe,transcript:N,screenshot:te,firstFeedbackId:Gt,clarityScore:rn,clarityIssues:pe.length>0?pe:dt,suggestedRewrite:yt,confidence:tt,callbacks:ae,context:Ue}),b(N),g(!1),A.current=!1,X(!1),j(!0),I.current=!1;return}}if(!Pe.success||Qe.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N,screenshotUrl:null,screenshotId:Ze,sessionId:L,context:Ue}},He=>{if(I.current=!1,chrome.runtime.lastError){ae.onError();return}if(He?.success&&He.ticket){let pe=He.ticket.id;ae.onSuccess({id:pe,title:He.ticket.title,description:He.ticket.description,type:He.ticket.type??"Feedback"}),Xe.then(it=>{it&&ft(`/api/tickets/${pe}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:it})}).catch(()=>{})}).catch(()=>{})}else ae.onError()});return}let It=rn>=85?"clear":rn>=60?"needs_improvement":"unclear",Ln={clarityScore:rn,clarityIssues:dt,clarityConfidence:tt,clarityStatus:It},sn;for(let He=0;He<Qe.length;He++){let pe=Qe[He],it=typeof pe.description=="string"?pe.description:pe.title??"",jr={sessionId:L,title:pe.title??"",description:it,type:Array.isArray(pe.suggestedTags)&&pe.suggestedTags[0]?pe.suggestedTags[0]:"Feedback",contextSummary:it,actionSteps:Array.isArray(pe.actionSteps)?pe.actionSteps:[],suggestedTags:pe.suggestedTags,screenshotUrl:null,screenshotId:He===0?Ze:void 0,metadata:{clientTimestamp:Date.now()},...Ln},nr=await(await ft("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(jr)})).json();if(nr.success&&nr.ticket){let jt=nr.ticket;sn||(sn={id:jt.id,title:jt.title,description:jt.description,type:jt.type??"Feedback"})}}if(I.current=!1,sn){let He=sn.id;Xe.then(pe=>{pe&&ft(`/api/tickets/${He}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:pe})}).catch(()=>{})}).catch(()=>{}),ae.onSuccess(sn)}else ae.onError()}catch(De){console.error("[Echly] Structure or submit failed:",De),I.current=!1,ae.onError()}})();return}try{let ue=Gy(),Gt=te?jy(te,L,ue):Promise.resolve(null),Ze=await eI(te??null);console.log("[OCR] Extracted visibleText:",Ze);let Xe=typeof window<"u"?window.location.href:"",ge={transcript:N,context:{...fe??{},visibleText:Ze?.trim()&&Ze||fe?.visibleText||null,url:fe?.url??Xe}},Ue=await(await ft("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ge)})).json(),et=Array.isArray(Ue.tickets)?Ue.tickets:[],De=Ue.clarityScore??100,Pe=Ue.clarityIssues??[],Qe=Ue.suggestedRewrite??null,rn=Ue.confidence??.5;if(!Ue.success||et.length===0)return;let dt=De>=85?"clear":De>=60?"needs_improvement":"unclear",yt={clarityScore:De,clarityIssues:Pe,clarityConfidence:rn,clarityStatus:dt},tt;for(let hn=0;hn<et.length;hn++){let It=et[hn],Ln=typeof It.description=="string"?It.description:It.title??"",sn={sessionId:L,title:It.title??"",description:Ln,type:Array.isArray(It.suggestedTags)&&It.suggestedTags[0]?It.suggestedTags[0]:"Feedback",contextSummary:Ln,actionSteps:Array.isArray(It.actionSteps)?It.actionSteps:[],suggestedTags:It.suggestedTags,screenshotUrl:null,screenshotId:hn===0?ue:void 0,metadata:{clientTimestamp:Date.now()},...yt},pe=await(await ft("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(sn)})).json();if(pe.success&&pe.ticket){let it=pe.ticket;tt||(tt={id:it.id,title:it.title,description:it.description,type:it.type??"Feedback"})}}if(tt){let hn=tt.id;Gt.then(It=>{It&&ft(`/api/tickets/${hn}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:It})}).catch(()=>{})}).catch(()=>{})}return tt}finally{I.current=!1}}},[L,n]),Y=ve.default.useCallback(async N=>{},[]),se=ve.default.useCallback(async()=>{let N=await ft("/api/sessions"),te=await N.json(),ae=te.sessions??[];return console.log("[Echly] Sessions returned:",{ok:N.ok,status:N.status,success:te.success,count:ae.length,sessions:ae}),!N.ok||!te.success?[]:ae},[]),$e=ve.default.useCallback(async()=>{console.log("[Echly] Creating session");try{let N=await ft("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),te=await N.json();return console.log("[Echly] Create session response:",{ok:N.ok,status:N.status,success:te.success,sessionId:te.session?.id}),!N.ok||!te.success||!te.session?.id?null:{id:te.session.id}}catch(N){return console.error("[Echly] Failed to create session:",N),null}},[]),Me=ve.default.useCallback(N=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:N},()=>{}),_(N)},[]),We=ve.default.useCallback(async N=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:N},()=>{}),_(N);try{let _e=((await(await ft(`/api/feedback?sessionId=${encodeURIComponent(N)}&limit=50`)).json()).feedback??[]).map(ue=>({id:ue.id,title:ue.title??"",description:ue.description??"",type:ue.type??"Feedback"}));D({sessionId:N,pointers:_e})}catch(te){console.error("[Echly] Failed to load session feedback:",te),D({sessionId:N,pointers:[]})}},[]),Je=ve.default.useCallback(async N=>{if(!L)return;if(N.tickets.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N.transcript,screenshotUrl:null,screenshotId:N.screenshotId,sessionId:L,context:N.context??{}}},fe=>{if(chrome.runtime.lastError){console.error("[Echly] Submit anyway failed:",chrome.runtime.lastError.message),N.callbacks.onError();return}if(fe?.success&&fe.ticket){let _e=fe.ticket.id;N.callbacks.onSuccess({id:_e,title:fe.ticket.title,description:fe.ticket.description,type:fe.ticket.type??"Feedback"}),N.uploadPromise.then(ue=>{ue&&ft(`/api/tickets/${_e}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ue})}).catch(()=>{})}).catch(()=>{})}else N.callbacks.onError()});return}let te={clarityScore:N.clarityScore,clarityIssues:N.clarityIssues,clarityConfidence:N.confidence,clarityStatus:N.clarityScore>=85?"clear":N.clarityScore>=60?"needs_improvement":"unclear"},ae;for(let fe=0;fe<N.tickets.length;fe++){let _e=N.tickets[fe],ue=typeof _e.description=="string"?_e.description:_e.title??"",Gt={sessionId:L,title:_e.title??"",description:ue,type:Array.isArray(_e.suggestedTags)&&_e.suggestedTags[0]?_e.suggestedTags[0]:"Feedback",contextSummary:ue,actionSteps:Array.isArray(_e.actionSteps)?_e.actionSteps:[],suggestedTags:_e.suggestedTags,screenshotUrl:null,screenshotId:fe===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...te},Xe=await(await ft("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Gt)})).json();if(Xe.success&&Xe.ticket){let ge=Xe.ticket;ae||(ae={id:ge.id,title:ge.title,description:ge.description,type:ge.type??"Feedback"})}}if(ae){let fe=ae.id;N.uploadPromise.then(_e=>{_e&&ft(`/api/tickets/${fe}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:_e})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(ae)}else N.callbacks.onError()},[L]),Cn=ve.default.useCallback(async(N,te)=>{if(!L)return;let ae=te.trim();try{let fe={transcript:ae,context:N.context??{}},ue=await(await ft("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(fe)})).json(),Gt=Array.isArray(ue.tickets)?ue.tickets:[],Ze=ue.clarityScore??100,Xe=ue.confidence??.5,ge=Ze>=85?"clear":Ze>=60?"needs_improvement":"unclear",Te={clarityScore:Ze,clarityIssues:ue.clarityIssues??[],clarityConfidence:Xe,clarityStatus:ge};if(Gt.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:ae,screenshotUrl:null,screenshotId:N.screenshotId,sessionId:L,context:N.context??{}}},et=>{if(chrome.runtime.lastError){console.error("[Echly] Submit edited feedback failed:",chrome.runtime.lastError.message),N.callbacks.onError();return}if(et?.success&&et.ticket){let De=et.ticket.id;N.callbacks.onSuccess({id:De,title:et.ticket.title,description:et.ticket.description,type:et.ticket.type??"Feedback"}),N.uploadPromise.then(Pe=>{Pe&&ft(`/api/tickets/${De}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Pe})}).catch(()=>{})}).catch(()=>{})}else N.callbacks.onError()});return}let Ue;for(let et=0;et<Gt.length;et++){let De=Gt[et],Pe=typeof De.description=="string"?De.description:De.title??"",Qe={sessionId:L,title:De.title??"",description:Pe,type:Array.isArray(De.suggestedTags)&&De.suggestedTags[0]?De.suggestedTags[0]:"Feedback",contextSummary:Pe,actionSteps:Array.isArray(De.actionSteps)?De.actionSteps:[],suggestedTags:De.suggestedTags,screenshotUrl:null,screenshotId:et===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...Te},dt=await(await ft("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Qe)})).json();if(dt.success&&dt.ticket){let yt=dt.ticket;Ue||(Ue={id:yt.id,title:yt.title,description:yt.description,type:yt.type??"Feedback"})}}if(Ue){let et=Ue.id;N.uploadPromise.then(De=>{De&&ft(`/api/tickets/${et}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:De})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(Ue)}else N.callbacks.onError()}catch(fe){console.error("[Echly] Submit edited feedback failed:",fe),N.callbacks.onError()}},[L]),Sn=ve.default.useCallback(async()=>{let N=w;if(!(!N?.suggestedRewrite?.trim()||!L)){x(null);try{let ae=await(await ft("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:N.suggestedRewrite.trim()})})).json(),fe=Array.isArray(ae.tickets)?ae.tickets:[],_e=ae.clarityScore??100,ue=ae.confidence??.5,Gt=_e>=85?"clear":_e>=60?"needs_improvement":"unclear",Ze={clarityScore:_e,clarityIssues:ae.clarityIssues??[],clarityConfidence:ue,clarityStatus:Gt},Xe;for(let ge=0;ge<fe.length;ge++){let Te=fe[ge],Ue=typeof Te.description=="string"?Te.description:Te.title??"",et={sessionId:L,title:Te.title??"",description:Ue,type:Array.isArray(Te.suggestedTags)&&Te.suggestedTags[0]?Te.suggestedTags[0]:"Feedback",contextSummary:Ue,actionSteps:Array.isArray(Te.actionSteps)?Te.actionSteps:[],suggestedTags:Te.suggestedTags,screenshotUrl:null,screenshotId:ge===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...Ze},Pe=await(await ft("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(et)})).json();if(Pe.success&&Pe.ticket){let Qe=Pe.ticket;Xe||(Xe={id:Qe.id,title:Qe.title,description:Qe.description,type:Qe.type??"Feedback"})}}if(Xe){let ge=Xe.id;N.uploadPromise.then(Te=>{Te&&ft(`/api/tickets/${ge}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Te})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(Xe)}else N.callbacks.onError()}catch(te){console.error("[Echly] Use suggestion failed:",te),N.callbacks.onError()}}},[w,L]);ve.default.useEffect(()=>{S&&C.current&&C.current.focus()},[S]);let an=ve.default.useCallback(async N=>{try{let ae=await(await ft("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:N.trim()})})).json();if(!ae.success||!Array.isArray(ae.tickets)||ae.tickets.length===0)return null;let fe=ae.tickets[0],_e=typeof fe.title=="string"?fe.title:"",ue=Array.isArray(fe.suggestedTags)?fe.suggestedTags:[];return{title:_e,tags:ue,priority:"medium"}}catch{return null}},[]);if(!i)return null;if(!n)return(0,gt.jsx)("div",{style:{pointerEvents:"auto"},children:(0,gt.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:NF,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,gt.jsx)("img",{src:re,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})});let vn=w;return(0,gt.jsxs)(gt.Fragment,{children:[H&&vn&&(0,gt.jsx)("div",{style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.15)",zIndex:999999,fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif'},children:(0,gt.jsxs)("div",{style:{maxWidth:420,width:"90%",background:"#F8FBFF",borderRadius:12,padding:20,boxShadow:"0 12px 32px rgba(0,0,0,0.12)",border:"1px solid #E6F0FF",animation:"echly-clarity-card-in 150ms ease-out"},children:[(0,gt.jsx)("div",{style:{fontWeight:600,fontSize:15,marginBottom:6,color:"#111"},children:"Quick suggestion"}),(0,gt.jsx)("div",{style:{fontSize:14,color:"#374151",marginBottom:8},children:"Your feedback may be unclear."}),(0,gt.jsx)("div",{style:{fontSize:13,color:"#6b7280",marginBottom:10},children:"Try specifying what looks wrong and what change you want."}),vn.suggestedRewrite&&(0,gt.jsxs)("div",{style:{fontSize:13,fontStyle:"italic",color:"#4b5563",marginBottom:12,opacity:.9},children:['Example: "',vn.suggestedRewrite,'"']}),(0,gt.jsx)("textarea",{ref:C,value:v,onChange:N=>b(N.target.value),disabled:!S,rows:3,placeholder:"Your feedback","aria-label":"Feedback message",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid #E6F0FF",fontSize:14,resize:"vertical",minHeight:72,marginBottom:16,background:S?"#fff":"#f3f4f6",color:"#111"}}),(0,gt.jsx)("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:S?(0,gt.jsx)("button",{type:"button",disabled:E,onClick:()=>{if(A.current||!vn)return;A.current=!0,X(!0),j(!1),x(null),g(!1),Cn(vn,v).catch(ae=>console.error("[Echly] Done submission failed:",ae)).finally(()=>{A.current=!1,X(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:E?"default":"pointer",opacity:E?.8:1},children:"Done"}):(0,gt.jsxs)(gt.Fragment,{children:[(0,gt.jsx)("button",{type:"button",disabled:E,onClick:()=>g(!0),style:{background:"transparent",border:"1px solid #E6F0FF",borderRadius:8,padding:"8px 14px",fontSize:14,color:"#374151",cursor:E?"default":"pointer",opacity:E?.7:1},children:"Edit feedback"}),(0,gt.jsx)("button",{type:"button",disabled:E,onClick:()=>{if(A.current||!vn)return;A.current=!0,X(!0),j(!1),x(null),g(!1),Je(vn).catch(te=>console.error("[Echly] Submit anyway failed:",te)).finally(()=>{A.current=!1,X(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:E?"default":"pointer",opacity:E?.8:1},children:"Submit anyway"})]})})]})}),(0,gt.jsx)(Qp,{sessionId:L??"",userId:n.uid,extensionMode:!0,onComplete:J,onDelete:Y,widgetToggleRef:T,onRecordingChange:nn,expanded:f.expanded,onExpandRequest:M,onCollapseRequest:O,liveStructureFetch:an,captureDisabled:!1,theme:l,onThemeToggle:F,fetchSessions:se,onResumeSessionSelect:We,loadSessionWithPointers:R,onSessionLoaded:()=>D(null),onSessionEnd:()=>_(null),onCreateSession:$e,onActiveSessionChange:Me,globalSessionModeActive:f.sessionModeActive??!1,globalSessionPaused:f.sessionPaused??!1,onSessionModeStart:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{}),onSessionModePause:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_PAUSE"}).catch(()=>{}),onSessionModeResume:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_RESUME"}).catch(()=>{}),onSessionModeEnd:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_END"}).catch(()=>{})})]})}var UF=`
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif;
  }
  #echly-root * { box-sizing: border-box; }
`;function FF(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let n=document.createElement("style");n.id="echly-reset",n.textContent=UF,t.appendChild(n)}function BF(t){let e=t.attachShadow({mode:"open"});FF(e);let n=document.createElement("div");n.id=PF,n.setAttribute("data-echly-ui","true"),n.style.all="initial",n.style.boxSizing="border-box",n.style.pointerEvents="auto",n.style.width="auto",n.style.height="auto";let a=OF();n.setAttribute("data-theme",a),e.appendChild(n),(0,T1.createRoot)(n).render((0,gt.jsx)(VF,{widgetRoot:n,initialTheme:a}))}function E1(t){return t?{visible:t.visible??!1,expanded:t.expanded??!1,isRecording:t.isRecording??!1,sessionId:t.sessionId??null,sessionModeActive:t.sessionModeActive??!1,sessionPaused:t.sessionPaused??!1}:null}function w1(t){window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:t}}))}function qF(){document.addEventListener("visibilitychange",()=>{document.hidden||chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},t=>{let e=E1(t);if(!e)return;let n=document.getElementById(ed);n&&(n.style.display=e.visible?"block":"none"),w1(e)})})}function zF(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(n=>{if(n.type==="ECHLY_FEEDBACK_CREATED"&&n.ticket&&n.sessionId){window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:n.ticket,sessionId:n.sessionId}}));return}let a=document.getElementById(ed);a&&(n.type==="ECHLY_GLOBAL_STATE"&&n.state&&(a.style.display=n.state.visible?"block":"none",window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:n.state}}))),n.type==="ECHLY_TOGGLE"&&window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET")))}))}function HF(){let t=document.getElementById(ed);t||(t=document.createElement("div"),t.id=ed,t.setAttribute("data-echly-ui","true"),t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),BF(t)),zF(t),qF()}HF();})();
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
