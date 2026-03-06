"use strict";(()=>{var U1=Object.create;var tm=Object.defineProperty;var F1=Object.getOwnPropertyDescriptor;var B1=Object.getOwnPropertyNames;var q1=Object.getPrototypeOf,z1=Object.prototype.hasOwnProperty;var tT=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,n)=>(typeof require<"u"?require:e)[n]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')});var H1=(t,e)=>()=>(t&&(e=t(t=0)),e);var Pe=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),G1=(t,e)=>{for(var n in e)tm(t,n,{get:e[n],enumerable:!0})},j1=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of B1(e))!z1.call(t,r)&&r!==n&&tm(t,r,{get:()=>e[r],enumerable:!(a=F1(e,r))||a.enumerable});return t};var pe=(t,e,n)=>(n=t!=null?U1(q1(t)):{},j1(e||!t||!t.__esModule?tm(n,"default",{value:t,enumerable:!0}):n,t));var fT=Pe(ce=>{"use strict";var rm=Symbol.for("react.transitional.element"),K1=Symbol.for("react.portal"),W1=Symbol.for("react.fragment"),X1=Symbol.for("react.strict_mode"),Q1=Symbol.for("react.profiler"),Y1=Symbol.for("react.consumer"),$1=Symbol.for("react.context"),J1=Symbol.for("react.forward_ref"),Z1=Symbol.for("react.suspense"),ek=Symbol.for("react.memo"),iT=Symbol.for("react.lazy"),tk=Symbol.for("react.activity"),nT=Symbol.iterator;function nk(t){return t===null||typeof t!="object"?null:(t=nT&&t[nT]||t["@@iterator"],typeof t=="function"?t:null)}var oT={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},lT=Object.assign,uT={};function Bi(t,e,n){this.props=t,this.context=e,this.refs=uT,this.updater=n||oT}Bi.prototype.isReactComponent={};Bi.prototype.setState=function(t,e){if(typeof t!="object"&&typeof t!="function"&&t!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,t,e,"setState")};Bi.prototype.forceUpdate=function(t){this.updater.enqueueForceUpdate(this,t,"forceUpdate")};function cT(){}cT.prototype=Bi.prototype;function sm(t,e,n){this.props=t,this.context=e,this.refs=uT,this.updater=n||oT}var im=sm.prototype=new cT;im.constructor=sm;lT(im,Bi.prototype);im.isPureReactComponent=!0;var aT=Array.isArray;function am(){}var at={H:null,A:null,T:null,S:null},dT=Object.prototype.hasOwnProperty;function om(t,e,n){var a=n.ref;return{$$typeof:rm,type:t,key:e,ref:a!==void 0?a:null,props:n}}function ak(t,e){return om(t.type,e,t.props)}function lm(t){return typeof t=="object"&&t!==null&&t.$$typeof===rm}function rk(t){var e={"=":"=0",":":"=2"};return"$"+t.replace(/[=:]/g,function(n){return e[n]})}var rT=/\/+/g;function nm(t,e){return typeof t=="object"&&t!==null&&t.key!=null?rk(""+t.key):e.toString(36)}function sk(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:switch(typeof t.status=="string"?t.then(am,am):(t.status="pending",t.then(function(e){t.status==="pending"&&(t.status="fulfilled",t.value=e)},function(e){t.status==="pending"&&(t.status="rejected",t.reason=e)})),t.status){case"fulfilled":return t.value;case"rejected":throw t.reason}}throw t}function Fi(t,e,n,a,r){var s=typeof t;(s==="undefined"||s==="boolean")&&(t=null);var i=!1;if(t===null)i=!0;else switch(s){case"bigint":case"string":case"number":i=!0;break;case"object":switch(t.$$typeof){case rm:case K1:i=!0;break;case iT:return i=t._init,Fi(i(t._payload),e,n,a,r)}}if(i)return r=r(t),i=a===""?"."+nm(t,0):a,aT(r)?(n="",i!=null&&(n=i.replace(rT,"$&/")+"/"),Fi(r,e,n,"",function(c){return c})):r!=null&&(lm(r)&&(r=ak(r,n+(r.key==null||t&&t.key===r.key?"":(""+r.key).replace(rT,"$&/")+"/")+i)),e.push(r)),1;i=0;var l=a===""?".":a+":";if(aT(t))for(var u=0;u<t.length;u++)a=t[u],s=l+nm(a,u),i+=Fi(a,e,n,s,r);else if(u=nk(t),typeof u=="function")for(t=u.call(t),u=0;!(a=t.next()).done;)a=a.value,s=l+nm(a,u++),i+=Fi(a,e,n,s,r);else if(s==="object"){if(typeof t.then=="function")return Fi(sk(t),e,n,a,r);throw e=String(t),Error("Objects are not valid as a React child (found: "+(e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)+"). If you meant to render a collection of children, use an array instead.")}return i}function gd(t,e,n){if(t==null)return t;var a=[],r=0;return Fi(t,a,"","",function(s){return e.call(n,s,r++)}),a}function ik(t){if(t._status===-1){var e=t._result;e=e(),e.then(function(n){(t._status===0||t._status===-1)&&(t._status=1,t._result=n)},function(n){(t._status===0||t._status===-1)&&(t._status=2,t._result=n)}),t._status===-1&&(t._status=0,t._result=e)}if(t._status===1)return t._result.default;throw t._result}var sT=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ok={map:gd,forEach:function(t,e,n){gd(t,function(){e.apply(this,arguments)},n)},count:function(t){var e=0;return gd(t,function(){e++}),e},toArray:function(t){return gd(t,function(e){return e})||[]},only:function(t){if(!lm(t))throw Error("React.Children.only expected to receive a single React element child.");return t}};ce.Activity=tk;ce.Children=ok;ce.Component=Bi;ce.Fragment=W1;ce.Profiler=Q1;ce.PureComponent=sm;ce.StrictMode=X1;ce.Suspense=Z1;ce.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=at;ce.__COMPILER_RUNTIME={__proto__:null,c:function(t){return at.H.useMemoCache(t)}};ce.cache=function(t){return function(){return t.apply(null,arguments)}};ce.cacheSignal=function(){return null};ce.cloneElement=function(t,e,n){if(t==null)throw Error("The argument must be a React element, but you passed "+t+".");var a=lT({},t.props),r=t.key;if(e!=null)for(s in e.key!==void 0&&(r=""+e.key),e)!dT.call(e,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&e.ref===void 0||(a[s]=e[s]);var s=arguments.length-2;if(s===1)a.children=n;else if(1<s){for(var i=Array(s),l=0;l<s;l++)i[l]=arguments[l+2];a.children=i}return om(t.type,r,a)};ce.createContext=function(t){return t={$$typeof:$1,_currentValue:t,_currentValue2:t,_threadCount:0,Provider:null,Consumer:null},t.Provider=t,t.Consumer={$$typeof:Y1,_context:t},t};ce.createElement=function(t,e,n){var a,r={},s=null;if(e!=null)for(a in e.key!==void 0&&(s=""+e.key),e)dT.call(e,a)&&a!=="key"&&a!=="__self"&&a!=="__source"&&(r[a]=e[a]);var i=arguments.length-2;if(i===1)r.children=n;else if(1<i){for(var l=Array(i),u=0;u<i;u++)l[u]=arguments[u+2];r.children=l}if(t&&t.defaultProps)for(a in i=t.defaultProps,i)r[a]===void 0&&(r[a]=i[a]);return om(t,s,r)};ce.createRef=function(){return{current:null}};ce.forwardRef=function(t){return{$$typeof:J1,render:t}};ce.isValidElement=lm;ce.lazy=function(t){return{$$typeof:iT,_payload:{_status:-1,_result:t},_init:ik}};ce.memo=function(t,e){return{$$typeof:ek,type:t,compare:e===void 0?null:e}};ce.startTransition=function(t){var e=at.T,n={};at.T=n;try{var a=t(),r=at.S;r!==null&&r(n,a),typeof a=="object"&&a!==null&&typeof a.then=="function"&&a.then(am,sT)}catch(s){sT(s)}finally{e!==null&&n.types!==null&&(e.types=n.types),at.T=e}};ce.unstable_useCacheRefresh=function(){return at.H.useCacheRefresh()};ce.use=function(t){return at.H.use(t)};ce.useActionState=function(t,e,n){return at.H.useActionState(t,e,n)};ce.useCallback=function(t,e){return at.H.useCallback(t,e)};ce.useContext=function(t){return at.H.useContext(t)};ce.useDebugValue=function(){};ce.useDeferredValue=function(t,e){return at.H.useDeferredValue(t,e)};ce.useEffect=function(t,e){return at.H.useEffect(t,e)};ce.useEffectEvent=function(t){return at.H.useEffectEvent(t)};ce.useId=function(){return at.H.useId()};ce.useImperativeHandle=function(t,e,n){return at.H.useImperativeHandle(t,e,n)};ce.useInsertionEffect=function(t,e){return at.H.useInsertionEffect(t,e)};ce.useLayoutEffect=function(t,e){return at.H.useLayoutEffect(t,e)};ce.useMemo=function(t,e){return at.H.useMemo(t,e)};ce.useOptimistic=function(t,e){return at.H.useOptimistic(t,e)};ce.useReducer=function(t,e,n){return at.H.useReducer(t,e,n)};ce.useRef=function(t){return at.H.useRef(t)};ce.useState=function(t){return at.H.useState(t)};ce.useSyncExternalStore=function(t,e,n){return at.H.useSyncExternalStore(t,e,n)};ce.useTransition=function(){return at.H.useTransition()};ce.version="19.2.3"});var Cn=Pe((GF,hT)=>{"use strict";hT.exports=fT()});var ET=Pe(lt=>{"use strict";function fm(t,e){var n=t.length;t.push(e);e:for(;0<n;){var a=n-1>>>1,r=t[a];if(0<yd(r,e))t[a]=e,t[n]=r,n=a;else break e}}function xa(t){return t.length===0?null:t[0]}function _d(t){if(t.length===0)return null;var e=t[0],n=t.pop();if(n!==e){t[0]=n;e:for(var a=0,r=t.length,s=r>>>1;a<s;){var i=2*(a+1)-1,l=t[i],u=i+1,c=t[u];if(0>yd(l,n))u<r&&0>yd(c,l)?(t[a]=c,t[u]=n,a=u):(t[a]=l,t[i]=n,a=i);else if(u<r&&0>yd(c,n))t[a]=c,t[u]=n,a=u;else break e}}return e}function yd(t,e){var n=t.sortIndex-e.sortIndex;return n!==0?n:t.id-e.id}lt.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(pT=performance,lt.unstable_now=function(){return pT.now()}):(um=Date,mT=um.now(),lt.unstable_now=function(){return um.now()-mT});var pT,um,mT,or=[],Zr=[],lk=1,Zn=null,hn=3,hm=!1,Bl=!1,ql=!1,pm=!1,IT=typeof setTimeout=="function"?setTimeout:null,_T=typeof clearTimeout=="function"?clearTimeout:null,gT=typeof setImmediate<"u"?setImmediate:null;function Id(t){for(var e=xa(Zr);e!==null;){if(e.callback===null)_d(Zr);else if(e.startTime<=t)_d(Zr),e.sortIndex=e.expirationTime,fm(or,e);else break;e=xa(Zr)}}function mm(t){if(ql=!1,Id(t),!Bl)if(xa(or)!==null)Bl=!0,zi||(zi=!0,qi());else{var e=xa(Zr);e!==null&&gm(mm,e.startTime-t)}}var zi=!1,zl=-1,ST=5,vT=-1;function TT(){return pm?!0:!(lt.unstable_now()-vT<ST)}function cm(){if(pm=!1,zi){var t=lt.unstable_now();vT=t;var e=!0;try{e:{Bl=!1,ql&&(ql=!1,_T(zl),zl=-1),hm=!0;var n=hn;try{t:{for(Id(t),Zn=xa(or);Zn!==null&&!(Zn.expirationTime>t&&TT());){var a=Zn.callback;if(typeof a=="function"){Zn.callback=null,hn=Zn.priorityLevel;var r=a(Zn.expirationTime<=t);if(t=lt.unstable_now(),typeof r=="function"){Zn.callback=r,Id(t),e=!0;break t}Zn===xa(or)&&_d(or),Id(t)}else _d(or);Zn=xa(or)}if(Zn!==null)e=!0;else{var s=xa(Zr);s!==null&&gm(mm,s.startTime-t),e=!1}}break e}finally{Zn=null,hn=n,hm=!1}e=void 0}}finally{e?qi():zi=!1}}}var qi;typeof gT=="function"?qi=function(){gT(cm)}:typeof MessageChannel<"u"?(dm=new MessageChannel,yT=dm.port2,dm.port1.onmessage=cm,qi=function(){yT.postMessage(null)}):qi=function(){IT(cm,0)};var dm,yT;function gm(t,e){zl=IT(function(){t(lt.unstable_now())},e)}lt.unstable_IdlePriority=5;lt.unstable_ImmediatePriority=1;lt.unstable_LowPriority=4;lt.unstable_NormalPriority=3;lt.unstable_Profiling=null;lt.unstable_UserBlockingPriority=2;lt.unstable_cancelCallback=function(t){t.callback=null};lt.unstable_forceFrameRate=function(t){0>t||125<t?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):ST=0<t?Math.floor(1e3/t):5};lt.unstable_getCurrentPriorityLevel=function(){return hn};lt.unstable_next=function(t){switch(hn){case 1:case 2:case 3:var e=3;break;default:e=hn}var n=hn;hn=e;try{return t()}finally{hn=n}};lt.unstable_requestPaint=function(){pm=!0};lt.unstable_runWithPriority=function(t,e){switch(t){case 1:case 2:case 3:case 4:case 5:break;default:t=3}var n=hn;hn=t;try{return e()}finally{hn=n}};lt.unstable_scheduleCallback=function(t,e,n){var a=lt.unstable_now();switch(typeof n=="object"&&n!==null?(n=n.delay,n=typeof n=="number"&&0<n?a+n:a):n=a,t){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=n+r,t={id:lk++,callback:e,priorityLevel:t,startTime:n,expirationTime:r,sortIndex:-1},n>a?(t.sortIndex=n,fm(Zr,t),xa(or)===null&&t===xa(Zr)&&(ql?(_T(zl),zl=-1):ql=!0,gm(mm,n-a))):(t.sortIndex=r,fm(or,t),Bl||hm||(Bl=!0,zi||(zi=!0,qi()))),t};lt.unstable_shouldYield=TT;lt.unstable_wrapCallback=function(t){var e=hn;return function(){var n=hn;hn=e;try{return t.apply(this,arguments)}finally{hn=n}}}});var wT=Pe((KF,bT)=>{"use strict";bT.exports=ET()});var LT=Pe(vn=>{"use strict";var uk=Cn();function CT(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function es(){}var Sn={d:{f:es,r:function(){throw Error(CT(522))},D:es,C:es,L:es,m:es,X:es,S:es,M:es},p:0,findDOMNode:null},ck=Symbol.for("react.portal");function dk(t,e,n){var a=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ck,key:a==null?null:""+a,children:t,containerInfo:e,implementation:n}}var Hl=uk.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Sd(t,e){if(t==="font")return"";if(typeof e=="string")return e==="use-credentials"?e:""}vn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Sn;vn.createPortal=function(t,e){var n=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)throw Error(CT(299));return dk(t,e,null,n)};vn.flushSync=function(t){var e=Hl.T,n=Sn.p;try{if(Hl.T=null,Sn.p=2,t)return t()}finally{Hl.T=e,Sn.p=n,Sn.d.f()}};vn.preconnect=function(t,e){typeof t=="string"&&(e?(e=e.crossOrigin,e=typeof e=="string"?e==="use-credentials"?e:"":void 0):e=null,Sn.d.C(t,e))};vn.prefetchDNS=function(t){typeof t=="string"&&Sn.d.D(t)};vn.preinit=function(t,e){if(typeof t=="string"&&e&&typeof e.as=="string"){var n=e.as,a=Sd(n,e.crossOrigin),r=typeof e.integrity=="string"?e.integrity:void 0,s=typeof e.fetchPriority=="string"?e.fetchPriority:void 0;n==="style"?Sn.d.S(t,typeof e.precedence=="string"?e.precedence:void 0,{crossOrigin:a,integrity:r,fetchPriority:s}):n==="script"&&Sn.d.X(t,{crossOrigin:a,integrity:r,fetchPriority:s,nonce:typeof e.nonce=="string"?e.nonce:void 0})}};vn.preinitModule=function(t,e){if(typeof t=="string")if(typeof e=="object"&&e!==null){if(e.as==null||e.as==="script"){var n=Sd(e.as,e.crossOrigin);Sn.d.M(t,{crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0})}}else e==null&&Sn.d.M(t)};vn.preload=function(t,e){if(typeof t=="string"&&typeof e=="object"&&e!==null&&typeof e.as=="string"){var n=e.as,a=Sd(n,e.crossOrigin);Sn.d.L(t,n,{crossOrigin:a,integrity:typeof e.integrity=="string"?e.integrity:void 0,nonce:typeof e.nonce=="string"?e.nonce:void 0,type:typeof e.type=="string"?e.type:void 0,fetchPriority:typeof e.fetchPriority=="string"?e.fetchPriority:void 0,referrerPolicy:typeof e.referrerPolicy=="string"?e.referrerPolicy:void 0,imageSrcSet:typeof e.imageSrcSet=="string"?e.imageSrcSet:void 0,imageSizes:typeof e.imageSizes=="string"?e.imageSizes:void 0,media:typeof e.media=="string"?e.media:void 0})}};vn.preloadModule=function(t,e){if(typeof t=="string")if(e){var n=Sd(e.as,e.crossOrigin);Sn.d.m(t,{as:typeof e.as=="string"&&e.as!=="script"?e.as:void 0,crossOrigin:n,integrity:typeof e.integrity=="string"?e.integrity:void 0})}else Sn.d.m(t)};vn.requestFormReset=function(t){Sn.d.r(t)};vn.unstable_batchedUpdates=function(t,e){return t(e)};vn.useFormState=function(t,e,n){return Hl.H.useFormState(t,e,n)};vn.useFormStatus=function(){return Hl.H.useHostTransitionStatus()};vn.version="19.2.3"});var vd=Pe((XF,xT)=>{"use strict";function AT(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(AT)}catch(t){console.error(t)}}AT(),xT.exports=LT()});var qC=Pe(Wf=>{"use strict";var Gt=wT(),tb=Cn(),fk=vd();function V(t){var e="https://react.dev/errors/"+t;if(1<arguments.length){e+="?args[]="+encodeURIComponent(arguments[1]);for(var n=2;n<arguments.length;n++)e+="&args[]="+encodeURIComponent(arguments[n])}return"Minified React error #"+t+"; visit "+e+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function nb(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function xu(t){var e=t,n=t;if(t.alternate)for(;e.return;)e=e.return;else{t=e;do e=t,e.flags&4098&&(n=e.return),t=e.return;while(t)}return e.tag===3?n:null}function ab(t){if(t.tag===13){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function rb(t){if(t.tag===31){var e=t.memoizedState;if(e===null&&(t=t.alternate,t!==null&&(e=t.memoizedState)),e!==null)return e.dehydrated}return null}function RT(t){if(xu(t)!==t)throw Error(V(188))}function hk(t){var e=t.alternate;if(!e){if(e=xu(t),e===null)throw Error(V(188));return e!==t?null:t}for(var n=t,a=e;;){var r=n.return;if(r===null)break;var s=r.alternate;if(s===null){if(a=r.return,a!==null){n=a;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===n)return RT(r),t;if(s===a)return RT(r),e;s=s.sibling}throw Error(V(188))}if(n.return!==a.return)n=r,a=s;else{for(var i=!1,l=r.child;l;){if(l===n){i=!0,n=r,a=s;break}if(l===a){i=!0,a=r,n=s;break}l=l.sibling}if(!i){for(l=s.child;l;){if(l===n){i=!0,n=s,a=r;break}if(l===a){i=!0,a=s,n=r;break}l=l.sibling}if(!i)throw Error(V(189))}}if(n.alternate!==a)throw Error(V(190))}if(n.tag!==3)throw Error(V(188));return n.stateNode.current===n?t:e}function sb(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t;for(t=t.child;t!==null;){if(e=sb(t),e!==null)return e;t=t.sibling}return null}var it=Object.assign,pk=Symbol.for("react.element"),Td=Symbol.for("react.transitional.element"),$l=Symbol.for("react.portal"),Xi=Symbol.for("react.fragment"),ib=Symbol.for("react.strict_mode"),Ym=Symbol.for("react.profiler"),ob=Symbol.for("react.consumer"),mr=Symbol.for("react.context"),jg=Symbol.for("react.forward_ref"),$m=Symbol.for("react.suspense"),Jm=Symbol.for("react.suspense_list"),Kg=Symbol.for("react.memo"),ts=Symbol.for("react.lazy");Symbol.for("react.scope");var Zm=Symbol.for("react.activity");Symbol.for("react.legacy_hidden");Symbol.for("react.tracing_marker");var mk=Symbol.for("react.memo_cache_sentinel");Symbol.for("react.view_transition");var kT=Symbol.iterator;function Gl(t){return t===null||typeof t!="object"?null:(t=kT&&t[kT]||t["@@iterator"],typeof t=="function"?t:null)}var gk=Symbol.for("react.client.reference");function eg(t){if(t==null)return null;if(typeof t=="function")return t.$$typeof===gk?null:t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case Xi:return"Fragment";case Ym:return"Profiler";case ib:return"StrictMode";case $m:return"Suspense";case Jm:return"SuspenseList";case Zm:return"Activity"}if(typeof t=="object")switch(t.$$typeof){case $l:return"Portal";case mr:return t.displayName||"Context";case ob:return(t._context.displayName||"Context")+".Consumer";case jg:var e=t.render;return t=t.displayName,t||(t=e.displayName||e.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case Kg:return e=t.displayName||null,e!==null?e:eg(t.type)||"Memo";case ts:e=t._payload,t=t._init;try{return eg(t(e))}catch{}}return null}var Jl=Array.isArray,se=tb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ne=fk.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ks={pending:!1,data:null,method:null,action:null},tg=[],Qi=-1;function Oa(t){return{current:t}}function $t(t){0>Qi||(t.current=tg[Qi],tg[Qi]=null,Qi--)}function Ye(t,e){Qi++,tg[Qi]=t.current,t.current=e}var Pa=Oa(null),mu=Oa(null),fs=Oa(null),tf=Oa(null);function nf(t,e){switch(Ye(fs,e),Ye(mu,t),Ye(Pa,null),e.nodeType){case 9:case 11:t=(t=e.documentElement)&&(t=t.namespaceURI)?UE(t):0;break;default:if(t=e.tagName,e=e.namespaceURI)e=UE(e),t=LC(e,t);else switch(t){case"svg":t=1;break;case"math":t=2;break;default:t=0}}$t(Pa),Ye(Pa,t)}function po(){$t(Pa),$t(mu),$t(fs)}function ng(t){t.memoizedState!==null&&Ye(tf,t);var e=Pa.current,n=LC(e,t.type);e!==n&&(Ye(mu,t),Ye(Pa,n))}function af(t){mu.current===t&&($t(Pa),$t(mu)),tf.current===t&&($t(tf),Cu._currentValue=Ks)}var ym,DT;function zs(t){if(ym===void 0)try{throw Error()}catch(n){var e=n.stack.trim().match(/\n( *(at )?)/);ym=e&&e[1]||"",DT=-1<n.stack.indexOf(`
    at`)?" (<anonymous>)":-1<n.stack.indexOf("@")?"@unknown:0:0":""}return`
`+ym+t+DT}var Im=!1;function _m(t,e){if(!t||Im)return"";Im=!0;var n=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var a={DetermineComponentFrameRoot:function(){try{if(e){var p=function(){throw Error()};if(Object.defineProperty(p.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(p,[])}catch(S){var m=S}Reflect.construct(t,[],p)}else{try{p.call()}catch(S){m=S}t.call(p.prototype)}}else{try{throw Error()}catch(S){m=S}(p=t())&&typeof p.catch=="function"&&p.catch(function(){})}}catch(S){if(S&&m&&typeof S.stack=="string")return[S.stack,m.stack]}return[null,null]}};a.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(a.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(a.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=a.DetermineComponentFrameRoot(),i=s[0],l=s[1];if(i&&l){var u=i.split(`
`),c=l.split(`
`);for(r=a=0;a<u.length&&!u[a].includes("DetermineComponentFrameRoot");)a++;for(;r<c.length&&!c[r].includes("DetermineComponentFrameRoot");)r++;if(a===u.length||r===c.length)for(a=u.length-1,r=c.length-1;1<=a&&0<=r&&u[a]!==c[r];)r--;for(;1<=a&&0<=r;a--,r--)if(u[a]!==c[r]){if(a!==1||r!==1)do if(a--,r--,0>r||u[a]!==c[r]){var f=`
`+u[a].replace(" at new "," at ");return t.displayName&&f.includes("<anonymous>")&&(f=f.replace("<anonymous>",t.displayName)),f}while(1<=a&&0<=r);break}}}finally{Im=!1,Error.prepareStackTrace=n}return(n=t?t.displayName||t.name:"")?zs(n):""}function yk(t,e){switch(t.tag){case 26:case 27:case 5:return zs(t.type);case 16:return zs("Lazy");case 13:return t.child!==e&&e!==null?zs("Suspense Fallback"):zs("Suspense");case 19:return zs("SuspenseList");case 0:case 15:return _m(t.type,!1);case 11:return _m(t.type.render,!1);case 1:return _m(t.type,!0);case 31:return zs("Activity");default:return""}}function PT(t){try{var e="",n=null;do e+=yk(t,n),n=t,t=t.return;while(t);return e}catch(a){return`
Error generating stack: `+a.message+`
`+a.stack}}var ag=Object.prototype.hasOwnProperty,Wg=Gt.unstable_scheduleCallback,Sm=Gt.unstable_cancelCallback,Ik=Gt.unstable_shouldYield,_k=Gt.unstable_requestPaint,Hn=Gt.unstable_now,Sk=Gt.unstable_getCurrentPriorityLevel,lb=Gt.unstable_ImmediatePriority,ub=Gt.unstable_UserBlockingPriority,rf=Gt.unstable_NormalPriority,vk=Gt.unstable_LowPriority,cb=Gt.unstable_IdlePriority,Tk=Gt.log,Ek=Gt.unstable_setDisableYieldValue,Ru=null,Gn=null;function os(t){if(typeof Tk=="function"&&Ek(t),Gn&&typeof Gn.setStrictMode=="function")try{Gn.setStrictMode(Ru,t)}catch{}}var jn=Math.clz32?Math.clz32:Ck,bk=Math.log,wk=Math.LN2;function Ck(t){return t>>>=0,t===0?32:31-(bk(t)/wk|0)|0}var Ed=256,bd=262144,wd=4194304;function Hs(t){var e=t&42;if(e!==0)return e;switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return t&261888;case 262144:case 524288:case 1048576:case 2097152:return t&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return t&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return t}}function kf(t,e,n){var a=t.pendingLanes;if(a===0)return 0;var r=0,s=t.suspendedLanes,i=t.pingedLanes;t=t.warmLanes;var l=a&134217727;return l!==0?(a=l&~s,a!==0?r=Hs(a):(i&=l,i!==0?r=Hs(i):n||(n=l&~t,n!==0&&(r=Hs(n))))):(l=a&~s,l!==0?r=Hs(l):i!==0?r=Hs(i):n||(n=a&~t,n!==0&&(r=Hs(n)))),r===0?0:e!==0&&e!==r&&!(e&s)&&(s=r&-r,n=e&-e,s>=n||s===32&&(n&4194048)!==0)?e:r}function ku(t,e){return(t.pendingLanes&~(t.suspendedLanes&~t.pingedLanes)&e)===0}function Lk(t,e){switch(t){case 1:case 2:case 4:case 8:case 64:return e+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function db(){var t=wd;return wd<<=1,!(wd&62914560)&&(wd=4194304),t}function vm(t){for(var e=[],n=0;31>n;n++)e.push(t);return e}function Du(t,e){t.pendingLanes|=e,e!==268435456&&(t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0)}function Ak(t,e,n,a,r,s){var i=t.pendingLanes;t.pendingLanes=n,t.suspendedLanes=0,t.pingedLanes=0,t.warmLanes=0,t.expiredLanes&=n,t.entangledLanes&=n,t.errorRecoveryDisabledLanes&=n,t.shellSuspendCounter=0;var l=t.entanglements,u=t.expirationTimes,c=t.hiddenUpdates;for(n=i&~n;0<n;){var f=31-jn(n),p=1<<f;l[f]=0,u[f]=-1;var m=c[f];if(m!==null)for(c[f]=null,f=0;f<m.length;f++){var S=m[f];S!==null&&(S.lane&=-536870913)}n&=~p}a!==0&&fb(t,a,0),s!==0&&r===0&&t.tag!==0&&(t.suspendedLanes|=s&~(i&~e))}function fb(t,e,n){t.pendingLanes|=e,t.suspendedLanes&=~e;var a=31-jn(e);t.entangledLanes|=e,t.entanglements[a]=t.entanglements[a]|1073741824|n&261930}function hb(t,e){var n=t.entangledLanes|=e;for(t=t.entanglements;n;){var a=31-jn(n),r=1<<a;r&e|t[a]&e&&(t[a]|=e),n&=~r}}function pb(t,e){var n=e&-e;return n=n&42?1:Xg(n),n&(t.suspendedLanes|e)?0:n}function Xg(t){switch(t){case 2:t=1;break;case 8:t=4;break;case 32:t=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:t=128;break;case 268435456:t=134217728;break;default:t=0}return t}function Qg(t){return t&=-t,2<t?8<t?t&134217727?32:268435456:8:2}function mb(){var t=Ne.p;return t!==0?t:(t=window.event,t===void 0?32:UC(t.type))}function OT(t,e){var n=Ne.p;try{return Ne.p=t,e()}finally{Ne.p=n}}var ws=Math.random().toString(36).slice(2),sn="__reactFiber$"+ws,Dn="__reactProps$"+ws,wo="__reactContainer$"+ws,rg="__reactEvents$"+ws,xk="__reactListeners$"+ws,Rk="__reactHandles$"+ws,MT="__reactResources$"+ws,Pu="__reactMarker$"+ws;function Yg(t){delete t[sn],delete t[Dn],delete t[rg],delete t[xk],delete t[Rk]}function Yi(t){var e=t[sn];if(e)return e;for(var n=t.parentNode;n;){if(e=n[wo]||n[sn]){if(n=e.alternate,e.child!==null||n!==null&&n.child!==null)for(t=HE(t);t!==null;){if(n=t[sn])return n;t=HE(t)}return e}t=n,n=t.parentNode}return null}function Co(t){if(t=t[sn]||t[wo]){var e=t.tag;if(e===5||e===6||e===13||e===31||e===26||e===27||e===3)return t}return null}function Zl(t){var e=t.tag;if(e===5||e===26||e===27||e===6)return t.stateNode;throw Error(V(33))}function io(t){var e=t[MT];return e||(e=t[MT]={hoistableStyles:new Map,hoistableScripts:new Map}),e}function Yt(t){t[Pu]=!0}var gb=new Set,yb={};function ni(t,e){mo(t,e),mo(t+"Capture",e)}function mo(t,e){for(yb[t]=e,t=0;t<e.length;t++)gb.add(e[t])}var kk=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),NT={},VT={};function Dk(t){return ag.call(VT,t)?!0:ag.call(NT,t)?!1:kk.test(t)?VT[t]=!0:(NT[t]=!0,!1)}function Bd(t,e,n){if(Dk(e))if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":t.removeAttribute(e);return;case"boolean":var a=e.toLowerCase().slice(0,5);if(a!=="data-"&&a!=="aria-"){t.removeAttribute(e);return}}t.setAttribute(e,""+n)}}function Cd(t,e,n){if(n===null)t.removeAttribute(e);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(e);return}t.setAttribute(e,""+n)}}function lr(t,e,n,a){if(a===null)t.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":t.removeAttribute(n);return}t.setAttributeNS(e,n,""+a)}}function ta(t){switch(typeof t){case"bigint":case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Ib(t){var e=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(e==="checkbox"||e==="radio")}function Pk(t,e,n){var a=Object.getOwnPropertyDescriptor(t.constructor.prototype,e);if(!t.hasOwnProperty(e)&&typeof a<"u"&&typeof a.get=="function"&&typeof a.set=="function"){var r=a.get,s=a.set;return Object.defineProperty(t,e,{configurable:!0,get:function(){return r.call(this)},set:function(i){n=""+i,s.call(this,i)}}),Object.defineProperty(t,e,{enumerable:a.enumerable}),{getValue:function(){return n},setValue:function(i){n=""+i},stopTracking:function(){t._valueTracker=null,delete t[e]}}}}function sg(t){if(!t._valueTracker){var e=Ib(t)?"checked":"value";t._valueTracker=Pk(t,e,""+t[e])}}function _b(t){if(!t)return!1;var e=t._valueTracker;if(!e)return!0;var n=e.getValue(),a="";return t&&(a=Ib(t)?t.checked?"true":"false":t.value),t=a,t!==n?(e.setValue(t),!0):!1}function sf(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}var Ok=/[\n"\\]/g;function ra(t){return t.replace(Ok,function(e){return"\\"+e.charCodeAt(0).toString(16)+" "})}function ig(t,e,n,a,r,s,i,l){t.name="",i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"?t.type=i:t.removeAttribute("type"),e!=null?i==="number"?(e===0&&t.value===""||t.value!=e)&&(t.value=""+ta(e)):t.value!==""+ta(e)&&(t.value=""+ta(e)):i!=="submit"&&i!=="reset"||t.removeAttribute("value"),e!=null?og(t,i,ta(e)):n!=null?og(t,i,ta(n)):a!=null&&t.removeAttribute("value"),r==null&&s!=null&&(t.defaultChecked=!!s),r!=null&&(t.checked=r&&typeof r!="function"&&typeof r!="symbol"),l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"?t.name=""+ta(l):t.removeAttribute("name")}function Sb(t,e,n,a,r,s,i,l){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(t.type=s),e!=null||n!=null){if(!(s!=="submit"&&s!=="reset"||e!=null)){sg(t);return}n=n!=null?""+ta(n):"",e=e!=null?""+ta(e):n,l||e===t.value||(t.value=e),t.defaultValue=e}a=a??r,a=typeof a!="function"&&typeof a!="symbol"&&!!a,t.checked=l?t.checked:!!a,t.defaultChecked=!!a,i!=null&&typeof i!="function"&&typeof i!="symbol"&&typeof i!="boolean"&&(t.name=i),sg(t)}function og(t,e,n){e==="number"&&sf(t.ownerDocument)===t||t.defaultValue===""+n||(t.defaultValue=""+n)}function oo(t,e,n,a){if(t=t.options,e){e={};for(var r=0;r<n.length;r++)e["$"+n[r]]=!0;for(n=0;n<t.length;n++)r=e.hasOwnProperty("$"+t[n].value),t[n].selected!==r&&(t[n].selected=r),r&&a&&(t[n].defaultSelected=!0)}else{for(n=""+ta(n),e=null,r=0;r<t.length;r++){if(t[r].value===n){t[r].selected=!0,a&&(t[r].defaultSelected=!0);return}e!==null||t[r].disabled||(e=t[r])}e!==null&&(e.selected=!0)}}function vb(t,e,n){if(e!=null&&(e=""+ta(e),e!==t.value&&(t.value=e),n==null)){t.defaultValue!==e&&(t.defaultValue=e);return}t.defaultValue=n!=null?""+ta(n):""}function Tb(t,e,n,a){if(e==null){if(a!=null){if(n!=null)throw Error(V(92));if(Jl(a)){if(1<a.length)throw Error(V(93));a=a[0]}n=a}n==null&&(n=""),e=n}n=ta(e),t.defaultValue=n,a=t.textContent,a===n&&a!==""&&a!==null&&(t.value=a),sg(t)}function go(t,e){if(e){var n=t.firstChild;if(n&&n===t.lastChild&&n.nodeType===3){n.nodeValue=e;return}}t.textContent=e}var Mk=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function UT(t,e,n){var a=e.indexOf("--")===0;n==null||typeof n=="boolean"||n===""?a?t.setProperty(e,""):e==="float"?t.cssFloat="":t[e]="":a?t.setProperty(e,n):typeof n!="number"||n===0||Mk.has(e)?e==="float"?t.cssFloat=n:t[e]=(""+n).trim():t[e]=n+"px"}function Eb(t,e,n){if(e!=null&&typeof e!="object")throw Error(V(62));if(t=t.style,n!=null){for(var a in n)!n.hasOwnProperty(a)||e!=null&&e.hasOwnProperty(a)||(a.indexOf("--")===0?t.setProperty(a,""):a==="float"?t.cssFloat="":t[a]="");for(var r in e)a=e[r],e.hasOwnProperty(r)&&n[r]!==a&&UT(t,r,a)}else for(var s in e)e.hasOwnProperty(s)&&UT(t,s,e[s])}function $g(t){if(t.indexOf("-")===-1)return!1;switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Nk=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Vk=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function qd(t){return Vk.test(""+t)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":t}function gr(){}var lg=null;function Jg(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var $i=null,lo=null;function FT(t){var e=Co(t);if(e&&(t=e.stateNode)){var n=t[Dn]||null;e:switch(t=e.stateNode,e.type){case"input":if(ig(t,n.value,n.defaultValue,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name),e=n.name,n.type==="radio"&&e!=null){for(n=t;n.parentNode;)n=n.parentNode;for(n=n.querySelectorAll('input[name="'+ra(""+e)+'"][type="radio"]'),e=0;e<n.length;e++){var a=n[e];if(a!==t&&a.form===t.form){var r=a[Dn]||null;if(!r)throw Error(V(90));ig(a,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(e=0;e<n.length;e++)a=n[e],a.form===t.form&&_b(a)}break e;case"textarea":vb(t,n.value,n.defaultValue);break e;case"select":e=n.value,e!=null&&oo(t,!!n.multiple,e,!1)}}}var Tm=!1;function bb(t,e,n){if(Tm)return t(e,n);Tm=!0;try{var a=t(e);return a}finally{if(Tm=!1,($i!==null||lo!==null)&&(Hf(),$i&&(e=$i,t=lo,lo=$i=null,FT(e),t)))for(e=0;e<t.length;e++)FT(t[e])}}function gu(t,e){var n=t.stateNode;if(n===null)return null;var a=n[Dn]||null;if(a===null)return null;n=a[e];e:switch(e){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(a=!a.disabled)||(t=t.type,a=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!a;break e;default:t=!1}if(t)return null;if(n&&typeof n!="function")throw Error(V(231,e,typeof n));return n}var vr=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),ug=!1;if(vr)try{Hi={},Object.defineProperty(Hi,"passive",{get:function(){ug=!0}}),window.addEventListener("test",Hi,Hi),window.removeEventListener("test",Hi,Hi)}catch{ug=!1}var Hi,ls=null,Zg=null,zd=null;function wb(){if(zd)return zd;var t,e=Zg,n=e.length,a,r="value"in ls?ls.value:ls.textContent,s=r.length;for(t=0;t<n&&e[t]===r[t];t++);var i=n-t;for(a=1;a<=i&&e[n-a]===r[s-a];a++);return zd=r.slice(t,1<a?1-a:void 0)}function Hd(t){var e=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&e===13&&(t=13)):t=e,t===10&&(t=13),32<=t||t===13?t:0}function Ld(){return!0}function BT(){return!1}function Pn(t){function e(n,a,r,s,i){this._reactName=n,this._targetInst=r,this.type=a,this.nativeEvent=s,this.target=i,this.currentTarget=null;for(var l in t)t.hasOwnProperty(l)&&(n=t[l],this[l]=n?n(s):s[l]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Ld:BT,this.isPropagationStopped=BT,this}return it(e.prototype,{preventDefault:function(){this.defaultPrevented=!0;var n=this.nativeEvent;n&&(n.preventDefault?n.preventDefault():typeof n.returnValue!="unknown"&&(n.returnValue=!1),this.isDefaultPrevented=Ld)},stopPropagation:function(){var n=this.nativeEvent;n&&(n.stopPropagation?n.stopPropagation():typeof n.cancelBubble!="unknown"&&(n.cancelBubble=!0),this.isPropagationStopped=Ld)},persist:function(){},isPersistent:Ld}),e}var ai={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},Df=Pn(ai),Ou=it({},ai,{view:0,detail:0}),Uk=Pn(Ou),Em,bm,jl,Pf=it({},Ou,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:ey,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==jl&&(jl&&t.type==="mousemove"?(Em=t.screenX-jl.screenX,bm=t.screenY-jl.screenY):bm=Em=0,jl=t),Em)},movementY:function(t){return"movementY"in t?t.movementY:bm}}),qT=Pn(Pf),Fk=it({},Pf,{dataTransfer:0}),Bk=Pn(Fk),qk=it({},Ou,{relatedTarget:0}),wm=Pn(qk),zk=it({},ai,{animationName:0,elapsedTime:0,pseudoElement:0}),Hk=Pn(zk),Gk=it({},ai,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),jk=Pn(Gk),Kk=it({},ai,{data:0}),zT=Pn(Kk),Wk={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Xk={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Qk={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Yk(t){var e=this.nativeEvent;return e.getModifierState?e.getModifierState(t):(t=Qk[t])?!!e[t]:!1}function ey(){return Yk}var $k=it({},Ou,{key:function(t){if(t.key){var e=Wk[t.key]||t.key;if(e!=="Unidentified")return e}return t.type==="keypress"?(t=Hd(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?Xk[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:ey,charCode:function(t){return t.type==="keypress"?Hd(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?Hd(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Jk=Pn($k),Zk=it({},Pf,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),HT=Pn(Zk),eD=it({},Ou,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:ey}),tD=Pn(eD),nD=it({},ai,{propertyName:0,elapsedTime:0,pseudoElement:0}),aD=Pn(nD),rD=it({},Pf,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),sD=Pn(rD),iD=it({},ai,{newState:0,oldState:0}),oD=Pn(iD),lD=[9,13,27,32],ty=vr&&"CompositionEvent"in window,nu=null;vr&&"documentMode"in document&&(nu=document.documentMode);var uD=vr&&"TextEvent"in window&&!nu,Cb=vr&&(!ty||nu&&8<nu&&11>=nu),GT=" ",jT=!1;function Lb(t,e){switch(t){case"keyup":return lD.indexOf(e.keyCode)!==-1;case"keydown":return e.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Ab(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var Ji=!1;function cD(t,e){switch(t){case"compositionend":return Ab(e);case"keypress":return e.which!==32?null:(jT=!0,GT);case"textInput":return t=e.data,t===GT&&jT?null:t;default:return null}}function dD(t,e){if(Ji)return t==="compositionend"||!ty&&Lb(t,e)?(t=wb(),zd=Zg=ls=null,Ji=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(e.ctrlKey||e.altKey||e.metaKey)||e.ctrlKey&&e.altKey){if(e.char&&1<e.char.length)return e.char;if(e.which)return String.fromCharCode(e.which)}return null;case"compositionend":return Cb&&e.locale!=="ko"?null:e.data;default:return null}}var fD={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function KT(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e==="input"?!!fD[t.type]:e==="textarea"}function xb(t,e,n,a){$i?lo?lo.push(a):lo=[a]:$i=a,e=bf(e,"onChange"),0<e.length&&(n=new Df("onChange","change",null,n,a),t.push({event:n,listeners:e}))}var au=null,yu=null;function hD(t){bC(t,0)}function Of(t){var e=Zl(t);if(_b(e))return t}function WT(t,e){if(t==="change")return e}var Rb=!1;vr&&(vr?(xd="oninput"in document,xd||(Cm=document.createElement("div"),Cm.setAttribute("oninput","return;"),xd=typeof Cm.oninput=="function"),Ad=xd):Ad=!1,Rb=Ad&&(!document.documentMode||9<document.documentMode));var Ad,xd,Cm;function XT(){au&&(au.detachEvent("onpropertychange",kb),yu=au=null)}function kb(t){if(t.propertyName==="value"&&Of(yu)){var e=[];xb(e,yu,t,Jg(t)),bb(hD,e)}}function pD(t,e,n){t==="focusin"?(XT(),au=e,yu=n,au.attachEvent("onpropertychange",kb)):t==="focusout"&&XT()}function mD(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return Of(yu)}function gD(t,e){if(t==="click")return Of(e)}function yD(t,e){if(t==="input"||t==="change")return Of(e)}function ID(t,e){return t===e&&(t!==0||1/t===1/e)||t!==t&&e!==e}var Wn=typeof Object.is=="function"?Object.is:ID;function Iu(t,e){if(Wn(t,e))return!0;if(typeof t!="object"||t===null||typeof e!="object"||e===null)return!1;var n=Object.keys(t),a=Object.keys(e);if(n.length!==a.length)return!1;for(a=0;a<n.length;a++){var r=n[a];if(!ag.call(e,r)||!Wn(t[r],e[r]))return!1}return!0}function QT(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function YT(t,e){var n=QT(t);t=0;for(var a;n;){if(n.nodeType===3){if(a=t+n.textContent.length,t<=e&&a>=e)return{node:n,offset:e-t};t=a}e:{for(;n;){if(n.nextSibling){n=n.nextSibling;break e}n=n.parentNode}n=void 0}n=QT(n)}}function Db(t,e){return t&&e?t===e?!0:t&&t.nodeType===3?!1:e&&e.nodeType===3?Db(t,e.parentNode):"contains"in t?t.contains(e):t.compareDocumentPosition?!!(t.compareDocumentPosition(e)&16):!1:!1}function Pb(t){t=t!=null&&t.ownerDocument!=null&&t.ownerDocument.defaultView!=null?t.ownerDocument.defaultView:window;for(var e=sf(t.document);e instanceof t.HTMLIFrameElement;){try{var n=typeof e.contentWindow.location.href=="string"}catch{n=!1}if(n)t=e.contentWindow;else break;e=sf(t.document)}return e}function ny(t){var e=t&&t.nodeName&&t.nodeName.toLowerCase();return e&&(e==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||e==="textarea"||t.contentEditable==="true")}var _D=vr&&"documentMode"in document&&11>=document.documentMode,Zi=null,cg=null,ru=null,dg=!1;function $T(t,e,n){var a=n.window===n?n.document:n.nodeType===9?n:n.ownerDocument;dg||Zi==null||Zi!==sf(a)||(a=Zi,"selectionStart"in a&&ny(a)?a={start:a.selectionStart,end:a.selectionEnd}:(a=(a.ownerDocument&&a.ownerDocument.defaultView||window).getSelection(),a={anchorNode:a.anchorNode,anchorOffset:a.anchorOffset,focusNode:a.focusNode,focusOffset:a.focusOffset}),ru&&Iu(ru,a)||(ru=a,a=bf(cg,"onSelect"),0<a.length&&(e=new Df("onSelect","select",null,e,n),t.push({event:e,listeners:a}),e.target=Zi)))}function qs(t,e){var n={};return n[t.toLowerCase()]=e.toLowerCase(),n["Webkit"+t]="webkit"+e,n["Moz"+t]="moz"+e,n}var eo={animationend:qs("Animation","AnimationEnd"),animationiteration:qs("Animation","AnimationIteration"),animationstart:qs("Animation","AnimationStart"),transitionrun:qs("Transition","TransitionRun"),transitionstart:qs("Transition","TransitionStart"),transitioncancel:qs("Transition","TransitionCancel"),transitionend:qs("Transition","TransitionEnd")},Lm={},Ob={};vr&&(Ob=document.createElement("div").style,"AnimationEvent"in window||(delete eo.animationend.animation,delete eo.animationiteration.animation,delete eo.animationstart.animation),"TransitionEvent"in window||delete eo.transitionend.transition);function ri(t){if(Lm[t])return Lm[t];if(!eo[t])return t;var e=eo[t],n;for(n in e)if(e.hasOwnProperty(n)&&n in Ob)return Lm[t]=e[n];return t}var Mb=ri("animationend"),Nb=ri("animationiteration"),Vb=ri("animationstart"),SD=ri("transitionrun"),vD=ri("transitionstart"),TD=ri("transitioncancel"),Ub=ri("transitionend"),Fb=new Map,fg="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");fg.push("scrollEnd");function ya(t,e){Fb.set(t,e),ni(e,[t])}var of=typeof reportError=="function"?reportError:function(t){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var e=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof t=="object"&&t!==null&&typeof t.message=="string"?String(t.message):String(t),error:t});if(!window.dispatchEvent(e))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",t);return}console.error(t)},ea=[],to=0,ay=0;function Mf(){for(var t=to,e=ay=to=0;e<t;){var n=ea[e];ea[e++]=null;var a=ea[e];ea[e++]=null;var r=ea[e];ea[e++]=null;var s=ea[e];if(ea[e++]=null,a!==null&&r!==null){var i=a.pending;i===null?r.next=r:(r.next=i.next,i.next=r),a.pending=r}s!==0&&Bb(n,r,s)}}function Nf(t,e,n,a){ea[to++]=t,ea[to++]=e,ea[to++]=n,ea[to++]=a,ay|=a,t.lanes|=a,t=t.alternate,t!==null&&(t.lanes|=a)}function ry(t,e,n,a){return Nf(t,e,n,a),lf(t)}function si(t,e){return Nf(t,null,null,e),lf(t)}function Bb(t,e,n){t.lanes|=n;var a=t.alternate;a!==null&&(a.lanes|=n);for(var r=!1,s=t.return;s!==null;)s.childLanes|=n,a=s.alternate,a!==null&&(a.childLanes|=n),s.tag===22&&(t=s.stateNode,t===null||t._visibility&1||(r=!0)),t=s,s=s.return;return t.tag===3?(s=t.stateNode,r&&e!==null&&(r=31-jn(n),t=s.hiddenUpdates,a=t[r],a===null?t[r]=[e]:a.push(e),e.lane=n|536870912),s):null}function lf(t){if(50<hu)throw hu=0,Pg=null,Error(V(185));for(var e=t.return;e!==null;)t=e,e=t.return;return t.tag===3?t.stateNode:null}var no={};function ED(t,e,n,a){this.tag=t,this.key=n,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=e,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=a,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function qn(t,e,n,a){return new ED(t,e,n,a)}function sy(t){return t=t.prototype,!(!t||!t.isReactComponent)}function Ir(t,e){var n=t.alternate;return n===null?(n=qn(t.tag,e,t.key,t.mode),n.elementType=t.elementType,n.type=t.type,n.stateNode=t.stateNode,n.alternate=t,t.alternate=n):(n.pendingProps=e,n.type=t.type,n.flags=0,n.subtreeFlags=0,n.deletions=null),n.flags=t.flags&65011712,n.childLanes=t.childLanes,n.lanes=t.lanes,n.child=t.child,n.memoizedProps=t.memoizedProps,n.memoizedState=t.memoizedState,n.updateQueue=t.updateQueue,e=t.dependencies,n.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext},n.sibling=t.sibling,n.index=t.index,n.ref=t.ref,n.refCleanup=t.refCleanup,n}function qb(t,e){t.flags&=65011714;var n=t.alternate;return n===null?(t.childLanes=0,t.lanes=e,t.child=null,t.subtreeFlags=0,t.memoizedProps=null,t.memoizedState=null,t.updateQueue=null,t.dependencies=null,t.stateNode=null):(t.childLanes=n.childLanes,t.lanes=n.lanes,t.child=n.child,t.subtreeFlags=0,t.deletions=null,t.memoizedProps=n.memoizedProps,t.memoizedState=n.memoizedState,t.updateQueue=n.updateQueue,t.type=n.type,e=n.dependencies,t.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t}function Gd(t,e,n,a,r,s){var i=0;if(a=t,typeof t=="function")sy(t)&&(i=1);else if(typeof t=="string")i=CP(t,n,Pa.current)?26:t==="html"||t==="head"||t==="body"?27:5;else e:switch(t){case Zm:return t=qn(31,n,e,r),t.elementType=Zm,t.lanes=s,t;case Xi:return Ws(n.children,r,s,e);case ib:i=8,r|=24;break;case Ym:return t=qn(12,n,e,r|2),t.elementType=Ym,t.lanes=s,t;case $m:return t=qn(13,n,e,r),t.elementType=$m,t.lanes=s,t;case Jm:return t=qn(19,n,e,r),t.elementType=Jm,t.lanes=s,t;default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case mr:i=10;break e;case ob:i=9;break e;case jg:i=11;break e;case Kg:i=14;break e;case ts:i=16,a=null;break e}i=29,n=Error(V(130,t===null?"null":typeof t,"")),a=null}return e=qn(i,n,e,r),e.elementType=t,e.type=a,e.lanes=s,e}function Ws(t,e,n,a){return t=qn(7,t,a,e),t.lanes=n,t}function Am(t,e,n){return t=qn(6,t,null,e),t.lanes=n,t}function zb(t){var e=qn(18,null,null,0);return e.stateNode=t,e}function xm(t,e,n){return e=qn(4,t.children!==null?t.children:[],t.key,e),e.lanes=n,e.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},e}var JT=new WeakMap;function sa(t,e){if(typeof t=="object"&&t!==null){var n=JT.get(t);return n!==void 0?n:(e={value:t,source:e,stack:PT(e)},JT.set(t,e),e)}return{value:t,source:e,stack:PT(e)}}var ao=[],ro=0,uf=null,_u=0,na=[],aa=0,vs=null,Ra=1,ka="";function hr(t,e){ao[ro++]=_u,ao[ro++]=uf,uf=t,_u=e}function Hb(t,e,n){na[aa++]=Ra,na[aa++]=ka,na[aa++]=vs,vs=t;var a=Ra;t=ka;var r=32-jn(a)-1;a&=~(1<<r),n+=1;var s=32-jn(e)+r;if(30<s){var i=r-r%5;s=(a&(1<<i)-1).toString(32),a>>=i,r-=i,Ra=1<<32-jn(e)+r|n<<r|a,ka=s+t}else Ra=1<<s|n<<r|a,ka=t}function iy(t){t.return!==null&&(hr(t,1),Hb(t,1,0))}function oy(t){for(;t===uf;)uf=ao[--ro],ao[ro]=null,_u=ao[--ro],ao[ro]=null;for(;t===vs;)vs=na[--aa],na[aa]=null,ka=na[--aa],na[aa]=null,Ra=na[--aa],na[aa]=null}function Gb(t,e){na[aa++]=Ra,na[aa++]=ka,na[aa++]=vs,Ra=e.id,ka=e.overflow,vs=t}var on=null,st=null,we=!1,hs=null,ia=!1,hg=Error(V(519));function Ts(t){var e=Error(V(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Su(sa(e,t)),hg}function ZT(t){var e=t.stateNode,n=t.type,a=t.memoizedProps;switch(e[sn]=t,e[Dn]=a,n){case"dialog":_e("cancel",e),_e("close",e);break;case"iframe":case"object":case"embed":_e("load",e);break;case"video":case"audio":for(n=0;n<bu.length;n++)_e(bu[n],e);break;case"source":_e("error",e);break;case"img":case"image":case"link":_e("error",e),_e("load",e);break;case"details":_e("toggle",e);break;case"input":_e("invalid",e),Sb(e,a.value,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name,!0);break;case"select":_e("invalid",e);break;case"textarea":_e("invalid",e),Tb(e,a.value,a.defaultValue,a.children)}n=a.children,typeof n!="string"&&typeof n!="number"&&typeof n!="bigint"||e.textContent===""+n||a.suppressHydrationWarning===!0||CC(e.textContent,n)?(a.popover!=null&&(_e("beforetoggle",e),_e("toggle",e)),a.onScroll!=null&&_e("scroll",e),a.onScrollEnd!=null&&_e("scrollend",e),a.onClick!=null&&(e.onclick=gr),e=!0):e=!1,e||Ts(t,!0)}function eE(t){for(on=t.return;on;)switch(on.tag){case 5:case 31:case 13:ia=!1;return;case 27:case 3:ia=!0;return;default:on=on.return}}function Gi(t){if(t!==on)return!1;if(!we)return eE(t),we=!0,!1;var e=t.tag,n;if((n=e!==3&&e!==27)&&((n=e===5)&&(n=t.type,n=!(n!=="form"&&n!=="button")||Ug(t.type,t.memoizedProps)),n=!n),n&&st&&Ts(t),eE(t),e===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(317));st=zE(t)}else if(e===31){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(317));st=zE(t)}else e===27?(e=st,Cs(t.type)?(t=zg,zg=null,st=t):st=e):st=on?la(t.stateNode.nextSibling):null;return!0}function $s(){st=on=null,we=!1}function Rm(){var t=hs;return t!==null&&(Rn===null?Rn=t:Rn.push.apply(Rn,t),hs=null),t}function Su(t){hs===null?hs=[t]:hs.push(t)}var pg=Oa(null),ii=null,yr=null;function as(t,e,n){Ye(pg,e._currentValue),e._currentValue=n}function _r(t){t._currentValue=pg.current,$t(pg)}function mg(t,e,n){for(;t!==null;){var a=t.alternate;if((t.childLanes&e)!==e?(t.childLanes|=e,a!==null&&(a.childLanes|=e)):a!==null&&(a.childLanes&e)!==e&&(a.childLanes|=e),t===n)break;t=t.return}}function gg(t,e,n,a){var r=t.child;for(r!==null&&(r.return=t);r!==null;){var s=r.dependencies;if(s!==null){var i=r.child;s=s.firstContext;e:for(;s!==null;){var l=s;s=r;for(var u=0;u<e.length;u++)if(l.context===e[u]){s.lanes|=n,l=s.alternate,l!==null&&(l.lanes|=n),mg(s.return,n,t),a||(i=null);break e}s=l.next}}else if(r.tag===18){if(i=r.return,i===null)throw Error(V(341));i.lanes|=n,s=i.alternate,s!==null&&(s.lanes|=n),mg(i,n,t),i=null}else i=r.child;if(i!==null)i.return=r;else for(i=r;i!==null;){if(i===t){i=null;break}if(r=i.sibling,r!==null){r.return=i.return,i=r;break}i=i.return}r=i}}function Lo(t,e,n,a){t=null;for(var r=e,s=!1;r!==null;){if(!s){if(r.flags&524288)s=!0;else if(r.flags&262144)break}if(r.tag===10){var i=r.alternate;if(i===null)throw Error(V(387));if(i=i.memoizedProps,i!==null){var l=r.type;Wn(r.pendingProps.value,i.value)||(t!==null?t.push(l):t=[l])}}else if(r===tf.current){if(i=r.alternate,i===null)throw Error(V(387));i.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(t!==null?t.push(Cu):t=[Cu])}r=r.return}t!==null&&gg(e,t,n,a),e.flags|=262144}function cf(t){for(t=t.firstContext;t!==null;){if(!Wn(t.context._currentValue,t.memoizedValue))return!0;t=t.next}return!1}function Js(t){ii=t,yr=null,t=t.dependencies,t!==null&&(t.firstContext=null)}function ln(t){return jb(ii,t)}function Rd(t,e){return ii===null&&Js(t),jb(t,e)}function jb(t,e){var n=e._currentValue;if(e={context:e,memoizedValue:n,next:null},yr===null){if(t===null)throw Error(V(308));yr=e,t.dependencies={lanes:0,firstContext:e},t.flags|=524288}else yr=yr.next=e;return n}var bD=typeof AbortController<"u"?AbortController:function(){var t=[],e=this.signal={aborted:!1,addEventListener:function(n,a){t.push(a)}};this.abort=function(){e.aborted=!0,t.forEach(function(n){return n()})}},wD=Gt.unstable_scheduleCallback,CD=Gt.unstable_NormalPriority,Dt={$$typeof:mr,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function ly(){return{controller:new bD,data:new Map,refCount:0}}function Mu(t){t.refCount--,t.refCount===0&&wD(CD,function(){t.controller.abort()})}var su=null,yg=0,yo=0,uo=null;function LD(t,e){if(su===null){var n=su=[];yg=0,yo=Py(),uo={status:"pending",value:void 0,then:function(a){n.push(a)}}}return yg++,e.then(tE,tE),e}function tE(){if(--yg===0&&su!==null){uo!==null&&(uo.status="fulfilled");var t=su;su=null,yo=0,uo=null;for(var e=0;e<t.length;e++)(0,t[e])()}}function AD(t,e){var n=[],a={status:"pending",value:null,reason:null,then:function(r){n.push(r)}};return t.then(function(){a.status="fulfilled",a.value=e;for(var r=0;r<n.length;r++)(0,n[r])(e)},function(r){for(a.status="rejected",a.reason=r,r=0;r<n.length;r++)(0,n[r])(void 0)}),a}var nE=se.S;se.S=function(t,e){sC=Hn(),typeof e=="object"&&e!==null&&typeof e.then=="function"&&LD(t,e),nE!==null&&nE(t,e)};var Xs=Oa(null);function uy(){var t=Xs.current;return t!==null?t:je.pooledCache}function jd(t,e){e===null?Ye(Xs,Xs.current):Ye(Xs,e.pool)}function Kb(){var t=uy();return t===null?null:{parent:Dt._currentValue,pool:t}}var Ao=Error(V(460)),cy=Error(V(474)),Vf=Error(V(542)),df={then:function(){}};function aE(t){return t=t.status,t==="fulfilled"||t==="rejected"}function Wb(t,e,n){switch(n=t[n],n===void 0?t.push(e):n!==e&&(e.then(gr,gr),e=n),e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,sE(t),t;default:if(typeof e.status=="string")e.then(gr,gr);else{if(t=je,t!==null&&100<t.shellSuspendCounter)throw Error(V(482));t=e,t.status="pending",t.then(function(a){if(e.status==="pending"){var r=e;r.status="fulfilled",r.value=a}},function(a){if(e.status==="pending"){var r=e;r.status="rejected",r.reason=a}})}switch(e.status){case"fulfilled":return e.value;case"rejected":throw t=e.reason,sE(t),t}throw Qs=e,Ao}}function Gs(t){try{var e=t._init;return e(t._payload)}catch(n){throw n!==null&&typeof n=="object"&&typeof n.then=="function"?(Qs=n,Ao):n}}var Qs=null;function rE(){if(Qs===null)throw Error(V(459));var t=Qs;return Qs=null,t}function sE(t){if(t===Ao||t===Vf)throw Error(V(483))}var co=null,vu=0;function kd(t){var e=vu;return vu+=1,co===null&&(co=[]),Wb(co,t,e)}function Kl(t,e){e=e.props.ref,t.ref=e!==void 0?e:null}function Dd(t,e){throw e.$$typeof===pk?Error(V(525)):(t=Object.prototype.toString.call(e),Error(V(31,t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)))}function Xb(t){function e(E,v){if(t){var C=E.deletions;C===null?(E.deletions=[v],E.flags|=16):C.push(v)}}function n(E,v){if(!t)return null;for(;v!==null;)e(E,v),v=v.sibling;return null}function a(E){for(var v=new Map;E!==null;)E.key!==null?v.set(E.key,E):v.set(E.index,E),E=E.sibling;return v}function r(E,v){return E=Ir(E,v),E.index=0,E.sibling=null,E}function s(E,v,C){return E.index=C,t?(C=E.alternate,C!==null?(C=C.index,C<v?(E.flags|=67108866,v):C):(E.flags|=67108866,v)):(E.flags|=1048576,v)}function i(E){return t&&E.alternate===null&&(E.flags|=67108866),E}function l(E,v,C,x){return v===null||v.tag!==6?(v=Am(C,E.mode,x),v.return=E,v):(v=r(v,C),v.return=E,v)}function u(E,v,C,x){var H=C.type;return H===Xi?f(E,v,C.props.children,x,C.key):v!==null&&(v.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===ts&&Gs(H)===v.type)?(v=r(v,C.props),Kl(v,C),v.return=E,v):(v=Gd(C.type,C.key,C.props,null,E.mode,x),Kl(v,C),v.return=E,v)}function c(E,v,C,x){return v===null||v.tag!==4||v.stateNode.containerInfo!==C.containerInfo||v.stateNode.implementation!==C.implementation?(v=xm(C,E.mode,x),v.return=E,v):(v=r(v,C.children||[]),v.return=E,v)}function f(E,v,C,x,H){return v===null||v.tag!==7?(v=Ws(C,E.mode,x,H),v.return=E,v):(v=r(v,C),v.return=E,v)}function p(E,v,C){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Am(""+v,E.mode,C),v.return=E,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Td:return C=Gd(v.type,v.key,v.props,null,E.mode,C),Kl(C,v),C.return=E,C;case $l:return v=xm(v,E.mode,C),v.return=E,v;case ts:return v=Gs(v),p(E,v,C)}if(Jl(v)||Gl(v))return v=Ws(v,E.mode,C,null),v.return=E,v;if(typeof v.then=="function")return p(E,kd(v),C);if(v.$$typeof===mr)return p(E,Rd(E,v),C);Dd(E,v)}return null}function m(E,v,C,x){var H=v!==null?v.key:null;if(typeof C=="string"&&C!==""||typeof C=="number"||typeof C=="bigint")return H!==null?null:l(E,v,""+C,x);if(typeof C=="object"&&C!==null){switch(C.$$typeof){case Td:return C.key===H?u(E,v,C,x):null;case $l:return C.key===H?c(E,v,C,x):null;case ts:return C=Gs(C),m(E,v,C,x)}if(Jl(C)||Gl(C))return H!==null?null:f(E,v,C,x,null);if(typeof C.then=="function")return m(E,v,kd(C),x);if(C.$$typeof===mr)return m(E,v,Rd(E,C),x);Dd(E,C)}return null}function S(E,v,C,x,H){if(typeof x=="string"&&x!==""||typeof x=="number"||typeof x=="bigint")return E=E.get(C)||null,l(v,E,""+x,H);if(typeof x=="object"&&x!==null){switch(x.$$typeof){case Td:return E=E.get(x.key===null?C:x.key)||null,u(v,E,x,H);case $l:return E=E.get(x.key===null?C:x.key)||null,c(v,E,x,H);case ts:return x=Gs(x),S(E,v,C,x,H)}if(Jl(x)||Gl(x))return E=E.get(C)||null,f(v,E,x,H,null);if(typeof x.then=="function")return S(E,v,C,kd(x),H);if(x.$$typeof===mr)return S(E,v,C,Rd(v,x),H);Dd(v,x)}return null}function R(E,v,C,x){for(var H=null,G=null,_=v,y=v=0,I=null;_!==null&&y<C.length;y++){_.index>y?(I=_,_=null):I=_.sibling;var b=m(E,_,C[y],x);if(b===null){_===null&&(_=I);break}t&&_&&b.alternate===null&&e(E,_),v=s(b,v,y),G===null?H=b:G.sibling=b,G=b,_=I}if(y===C.length)return n(E,_),we&&hr(E,y),H;if(_===null){for(;y<C.length;y++)_=p(E,C[y],x),_!==null&&(v=s(_,v,y),G===null?H=_:G.sibling=_,G=_);return we&&hr(E,y),H}for(_=a(_);y<C.length;y++)I=S(_,E,y,C[y],x),I!==null&&(t&&I.alternate!==null&&_.delete(I.key===null?y:I.key),v=s(I,v,y),G===null?H=I:G.sibling=I,G=I);return t&&_.forEach(function(w){return e(E,w)}),we&&hr(E,y),H}function D(E,v,C,x){if(C==null)throw Error(V(151));for(var H=null,G=null,_=v,y=v=0,I=null,b=C.next();_!==null&&!b.done;y++,b=C.next()){_.index>y?(I=_,_=null):I=_.sibling;var w=m(E,_,b.value,x);if(w===null){_===null&&(_=I);break}t&&_&&w.alternate===null&&e(E,_),v=s(w,v,y),G===null?H=w:G.sibling=w,G=w,_=I}if(b.done)return n(E,_),we&&hr(E,y),H;if(_===null){for(;!b.done;y++,b=C.next())b=p(E,b.value,x),b!==null&&(v=s(b,v,y),G===null?H=b:G.sibling=b,G=b);return we&&hr(E,y),H}for(_=a(_);!b.done;y++,b=C.next())b=S(_,E,y,b.value,x),b!==null&&(t&&b.alternate!==null&&_.delete(b.key===null?y:b.key),v=s(b,v,y),G===null?H=b:G.sibling=b,G=b);return t&&_.forEach(function(A){return e(E,A)}),we&&hr(E,y),H}function L(E,v,C,x){if(typeof C=="object"&&C!==null&&C.type===Xi&&C.key===null&&(C=C.props.children),typeof C=="object"&&C!==null){switch(C.$$typeof){case Td:e:{for(var H=C.key;v!==null;){if(v.key===H){if(H=C.type,H===Xi){if(v.tag===7){n(E,v.sibling),x=r(v,C.props.children),x.return=E,E=x;break e}}else if(v.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===ts&&Gs(H)===v.type){n(E,v.sibling),x=r(v,C.props),Kl(x,C),x.return=E,E=x;break e}n(E,v);break}else e(E,v);v=v.sibling}C.type===Xi?(x=Ws(C.props.children,E.mode,x,C.key),x.return=E,E=x):(x=Gd(C.type,C.key,C.props,null,E.mode,x),Kl(x,C),x.return=E,E=x)}return i(E);case $l:e:{for(H=C.key;v!==null;){if(v.key===H)if(v.tag===4&&v.stateNode.containerInfo===C.containerInfo&&v.stateNode.implementation===C.implementation){n(E,v.sibling),x=r(v,C.children||[]),x.return=E,E=x;break e}else{n(E,v);break}else e(E,v);v=v.sibling}x=xm(C,E.mode,x),x.return=E,E=x}return i(E);case ts:return C=Gs(C),L(E,v,C,x)}if(Jl(C))return R(E,v,C,x);if(Gl(C)){if(H=Gl(C),typeof H!="function")throw Error(V(150));return C=H.call(C),D(E,v,C,x)}if(typeof C.then=="function")return L(E,v,kd(C),x);if(C.$$typeof===mr)return L(E,v,Rd(E,C),x);Dd(E,C)}return typeof C=="string"&&C!==""||typeof C=="number"||typeof C=="bigint"?(C=""+C,v!==null&&v.tag===6?(n(E,v.sibling),x=r(v,C),x.return=E,E=x):(n(E,v),x=Am(C,E.mode,x),x.return=E,E=x),i(E)):n(E,v)}return function(E,v,C,x){try{vu=0;var H=L(E,v,C,x);return co=null,H}catch(_){if(_===Ao||_===Vf)throw _;var G=qn(29,_,null,E.mode);return G.lanes=x,G.return=E,G}finally{}}}var Zs=Xb(!0),Qb=Xb(!1),ns=!1;function dy(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Ig(t,e){t=t.updateQueue,e.updateQueue===t&&(e.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,callbacks:null})}function ps(t){return{lane:t,tag:0,payload:null,callback:null,next:null}}function ms(t,e,n){var a=t.updateQueue;if(a===null)return null;if(a=a.shared,Me&2){var r=a.pending;return r===null?e.next=e:(e.next=r.next,r.next=e),a.pending=e,e=lf(t),Bb(t,null,n),e}return Nf(t,a,e,n),lf(t)}function iu(t,e,n){if(e=e.updateQueue,e!==null&&(e=e.shared,(n&4194048)!==0)){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,hb(t,n)}}function km(t,e){var n=t.updateQueue,a=t.alternate;if(a!==null&&(a=a.updateQueue,n===a)){var r=null,s=null;if(n=n.firstBaseUpdate,n!==null){do{var i={lane:n.lane,tag:n.tag,payload:n.payload,callback:null,next:null};s===null?r=s=i:s=s.next=i,n=n.next}while(n!==null);s===null?r=s=e:s=s.next=e}else r=s=e;n={baseState:a.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:a.shared,callbacks:a.callbacks},t.updateQueue=n;return}t=n.lastBaseUpdate,t===null?n.firstBaseUpdate=e:t.next=e,n.lastBaseUpdate=e}var _g=!1;function ou(){if(_g){var t=uo;if(t!==null)throw t}}function lu(t,e,n,a){_g=!1;var r=t.updateQueue;ns=!1;var s=r.firstBaseUpdate,i=r.lastBaseUpdate,l=r.shared.pending;if(l!==null){r.shared.pending=null;var u=l,c=u.next;u.next=null,i===null?s=c:i.next=c,i=u;var f=t.alternate;f!==null&&(f=f.updateQueue,l=f.lastBaseUpdate,l!==i&&(l===null?f.firstBaseUpdate=c:l.next=c,f.lastBaseUpdate=u))}if(s!==null){var p=r.baseState;i=0,f=c=u=null,l=s;do{var m=l.lane&-536870913,S=m!==l.lane;if(S?(be&m)===m:(a&m)===m){m!==0&&m===yo&&(_g=!0),f!==null&&(f=f.next={lane:0,tag:l.tag,payload:l.payload,callback:null,next:null});e:{var R=t,D=l;m=e;var L=n;switch(D.tag){case 1:if(R=D.payload,typeof R=="function"){p=R.call(L,p,m);break e}p=R;break e;case 3:R.flags=R.flags&-65537|128;case 0:if(R=D.payload,m=typeof R=="function"?R.call(L,p,m):R,m==null)break e;p=it({},p,m);break e;case 2:ns=!0}}m=l.callback,m!==null&&(t.flags|=64,S&&(t.flags|=8192),S=r.callbacks,S===null?r.callbacks=[m]:S.push(m))}else S={lane:m,tag:l.tag,payload:l.payload,callback:l.callback,next:null},f===null?(c=f=S,u=p):f=f.next=S,i|=m;if(l=l.next,l===null){if(l=r.shared.pending,l===null)break;S=l,l=S.next,S.next=null,r.lastBaseUpdate=S,r.shared.pending=null}}while(!0);f===null&&(u=p),r.baseState=u,r.firstBaseUpdate=c,r.lastBaseUpdate=f,s===null&&(r.shared.lanes=0),bs|=i,t.lanes=i,t.memoizedState=p}}function Yb(t,e){if(typeof t!="function")throw Error(V(191,t));t.call(e)}function $b(t,e){var n=t.callbacks;if(n!==null)for(t.callbacks=null,t=0;t<n.length;t++)Yb(n[t],e)}var Io=Oa(null),ff=Oa(0);function iE(t,e){t=wr,Ye(ff,t),Ye(Io,e),wr=t|e.baseLanes}function Sg(){Ye(ff,wr),Ye(Io,Io.current)}function fy(){wr=ff.current,$t(Io),$t(ff)}var Xn=Oa(null),oa=null;function rs(t){var e=t.alternate;Ye(Et,Et.current&1),Ye(Xn,t),oa===null&&(e===null||Io.current!==null||e.memoizedState!==null)&&(oa=t)}function vg(t){Ye(Et,Et.current),Ye(Xn,t),oa===null&&(oa=t)}function Jb(t){t.tag===22?(Ye(Et,Et.current),Ye(Xn,t),oa===null&&(oa=t)):ss(t)}function ss(){Ye(Et,Et.current),Ye(Xn,Xn.current)}function Bn(t){$t(Xn),oa===t&&(oa=null),$t(Et)}var Et=Oa(0);function hf(t){for(var e=t;e!==null;){if(e.tag===13){var n=e.memoizedState;if(n!==null&&(n=n.dehydrated,n===null||Bg(n)||qg(n)))return e}else if(e.tag===19&&(e.memoizedProps.revealOrder==="forwards"||e.memoizedProps.revealOrder==="backwards"||e.memoizedProps.revealOrder==="unstable_legacy-backwards"||e.memoizedProps.revealOrder==="together")){if(e.flags&128)return e}else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return null;e=e.return}e.sibling.return=e.return,e=e.sibling}return null}var Tr=0,fe=null,ze=null,Rt=null,pf=!1,fo=!1,ei=!1,mf=0,Tu=0,ho=null,xD=0;function _t(){throw Error(V(321))}function hy(t,e){if(e===null)return!1;for(var n=0;n<e.length&&n<t.length;n++)if(!Wn(t[n],e[n]))return!1;return!0}function py(t,e,n,a,r,s){return Tr=s,fe=e,e.memoizedState=null,e.updateQueue=null,e.lanes=0,se.H=t===null||t.memoizedState===null?xw:wy,ei=!1,s=n(a,r),ei=!1,fo&&(s=ew(e,n,a,r)),Zb(t),s}function Zb(t){se.H=Eu;var e=ze!==null&&ze.next!==null;if(Tr=0,Rt=ze=fe=null,pf=!1,Tu=0,ho=null,e)throw Error(V(300));t===null||Pt||(t=t.dependencies,t!==null&&cf(t)&&(Pt=!0))}function ew(t,e,n,a){fe=t;var r=0;do{if(fo&&(ho=null),Tu=0,fo=!1,25<=r)throw Error(V(301));if(r+=1,Rt=ze=null,t.updateQueue!=null){var s=t.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}se.H=Rw,s=e(n,a)}while(fo);return s}function RD(){var t=se.H,e=t.useState()[0];return e=typeof e.then=="function"?Nu(e):e,t=t.useState()[0],(ze!==null?ze.memoizedState:null)!==t&&(fe.flags|=1024),e}function my(){var t=mf!==0;return mf=0,t}function gy(t,e,n){e.updateQueue=t.updateQueue,e.flags&=-2053,t.lanes&=~n}function yy(t){if(pf){for(t=t.memoizedState;t!==null;){var e=t.queue;e!==null&&(e.pending=null),t=t.next}pf=!1}Tr=0,Rt=ze=fe=null,fo=!1,Tu=mf=0,ho=null}function Tn(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Rt===null?fe.memoizedState=Rt=t:Rt=Rt.next=t,Rt}function bt(){if(ze===null){var t=fe.alternate;t=t!==null?t.memoizedState:null}else t=ze.next;var e=Rt===null?fe.memoizedState:Rt.next;if(e!==null)Rt=e,ze=t;else{if(t===null)throw fe.alternate===null?Error(V(467)):Error(V(310));ze=t,t={memoizedState:ze.memoizedState,baseState:ze.baseState,baseQueue:ze.baseQueue,queue:ze.queue,next:null},Rt===null?fe.memoizedState=Rt=t:Rt=Rt.next=t}return Rt}function Uf(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Nu(t){var e=Tu;return Tu+=1,ho===null&&(ho=[]),t=Wb(ho,t,e),e=fe,(Rt===null?e.memoizedState:Rt.next)===null&&(e=e.alternate,se.H=e===null||e.memoizedState===null?xw:wy),t}function Ff(t){if(t!==null&&typeof t=="object"){if(typeof t.then=="function")return Nu(t);if(t.$$typeof===mr)return ln(t)}throw Error(V(438,String(t)))}function Iy(t){var e=null,n=fe.updateQueue;if(n!==null&&(e=n.memoCache),e==null){var a=fe.alternate;a!==null&&(a=a.updateQueue,a!==null&&(a=a.memoCache,a!=null&&(e={data:a.data.map(function(r){return r.slice()}),index:0})))}if(e==null&&(e={data:[],index:0}),n===null&&(n=Uf(),fe.updateQueue=n),n.memoCache=e,n=e.data[e.index],n===void 0)for(n=e.data[e.index]=Array(t),a=0;a<t;a++)n[a]=mk;return e.index++,n}function Er(t,e){return typeof e=="function"?e(t):e}function Kd(t){var e=bt();return _y(e,ze,t)}function _y(t,e,n){var a=t.queue;if(a===null)throw Error(V(311));a.lastRenderedReducer=n;var r=t.baseQueue,s=a.pending;if(s!==null){if(r!==null){var i=r.next;r.next=s.next,s.next=i}e.baseQueue=r=s,a.pending=null}if(s=t.baseState,r===null)t.memoizedState=s;else{e=r.next;var l=i=null,u=null,c=e,f=!1;do{var p=c.lane&-536870913;if(p!==c.lane?(be&p)===p:(Tr&p)===p){var m=c.revertLane;if(m===0)u!==null&&(u=u.next={lane:0,revertLane:0,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),p===yo&&(f=!0);else if((Tr&m)===m){c=c.next,m===yo&&(f=!0);continue}else p={lane:0,revertLane:c.revertLane,gesture:null,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},u===null?(l=u=p,i=s):u=u.next=p,fe.lanes|=m,bs|=m;p=c.action,ei&&n(s,p),s=c.hasEagerState?c.eagerState:n(s,p)}else m={lane:p,revertLane:c.revertLane,gesture:c.gesture,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null},u===null?(l=u=m,i=s):u=u.next=m,fe.lanes|=p,bs|=p;c=c.next}while(c!==null&&c!==e);if(u===null?i=s:u.next=l,!Wn(s,t.memoizedState)&&(Pt=!0,f&&(n=uo,n!==null)))throw n;t.memoizedState=s,t.baseState=i,t.baseQueue=u,a.lastRenderedState=s}return r===null&&(a.lanes=0),[t.memoizedState,a.dispatch]}function Dm(t){var e=bt(),n=e.queue;if(n===null)throw Error(V(311));n.lastRenderedReducer=t;var a=n.dispatch,r=n.pending,s=e.memoizedState;if(r!==null){n.pending=null;var i=r=r.next;do s=t(s,i.action),i=i.next;while(i!==r);Wn(s,e.memoizedState)||(Pt=!0),e.memoizedState=s,e.baseQueue===null&&(e.baseState=s),n.lastRenderedState=s}return[s,a]}function tw(t,e,n){var a=fe,r=bt(),s=we;if(s){if(n===void 0)throw Error(V(407));n=n()}else n=e();var i=!Wn((ze||r).memoizedState,n);if(i&&(r.memoizedState=n,Pt=!0),r=r.queue,Sy(rw.bind(null,a,r,t),[t]),r.getSnapshot!==e||i||Rt!==null&&Rt.memoizedState.tag&1){if(a.flags|=2048,_o(9,{destroy:void 0},aw.bind(null,a,r,n,e),null),je===null)throw Error(V(349));s||Tr&127||nw(a,e,n)}return n}function nw(t,e,n){t.flags|=16384,t={getSnapshot:e,value:n},e=fe.updateQueue,e===null?(e=Uf(),fe.updateQueue=e,e.stores=[t]):(n=e.stores,n===null?e.stores=[t]:n.push(t))}function aw(t,e,n,a){e.value=n,e.getSnapshot=a,sw(e)&&iw(t)}function rw(t,e,n){return n(function(){sw(e)&&iw(t)})}function sw(t){var e=t.getSnapshot;t=t.value;try{var n=e();return!Wn(t,n)}catch{return!0}}function iw(t){var e=si(t,2);e!==null&&kn(e,t,2)}function Tg(t){var e=Tn();if(typeof t=="function"){var n=t;if(t=n(),ei){os(!0);try{n()}finally{os(!1)}}}return e.memoizedState=e.baseState=t,e.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Er,lastRenderedState:t},e}function ow(t,e,n,a){return t.baseState=n,_y(t,ze,typeof a=="function"?a:Er)}function kD(t,e,n,a,r){if(qf(t))throw Error(V(485));if(t=e.action,t!==null){var s={payload:r,action:t,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(i){s.listeners.push(i)}};se.T!==null?n(!0):s.isTransition=!1,a(s),n=e.pending,n===null?(s.next=e.pending=s,lw(e,s)):(s.next=n.next,e.pending=n.next=s)}}function lw(t,e){var n=e.action,a=e.payload,r=t.state;if(e.isTransition){var s=se.T,i={};se.T=i;try{var l=n(r,a),u=se.S;u!==null&&u(i,l),oE(t,e,l)}catch(c){Eg(t,e,c)}finally{s!==null&&i.types!==null&&(s.types=i.types),se.T=s}}else try{s=n(r,a),oE(t,e,s)}catch(c){Eg(t,e,c)}}function oE(t,e,n){n!==null&&typeof n=="object"&&typeof n.then=="function"?n.then(function(a){lE(t,e,a)},function(a){return Eg(t,e,a)}):lE(t,e,n)}function lE(t,e,n){e.status="fulfilled",e.value=n,uw(e),t.state=n,e=t.pending,e!==null&&(n=e.next,n===e?t.pending=null:(n=n.next,e.next=n,lw(t,n)))}function Eg(t,e,n){var a=t.pending;if(t.pending=null,a!==null){a=a.next;do e.status="rejected",e.reason=n,uw(e),e=e.next;while(e!==a)}t.action=null}function uw(t){t=t.listeners;for(var e=0;e<t.length;e++)(0,t[e])()}function cw(t,e){return e}function uE(t,e){if(we){var n=je.formState;if(n!==null){e:{var a=fe;if(we){if(st){t:{for(var r=st,s=ia;r.nodeType!==8;){if(!s){r=null;break t}if(r=la(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){st=la(r.nextSibling),a=r.data==="F!";break e}}Ts(a)}a=!1}a&&(e=n[0])}}return n=Tn(),n.memoizedState=n.baseState=e,a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:cw,lastRenderedState:e},n.queue=a,n=Cw.bind(null,fe,a),a.dispatch=n,a=Tg(!1),s=by.bind(null,fe,!1,a.queue),a=Tn(),r={state:e,dispatch:null,action:t,pending:null},a.queue=r,n=kD.bind(null,fe,r,s,n),r.dispatch=n,a.memoizedState=t,[e,n,!1]}function cE(t){var e=bt();return dw(e,ze,t)}function dw(t,e,n){if(e=_y(t,e,cw)[0],t=Kd(Er)[0],typeof e=="object"&&e!==null&&typeof e.then=="function")try{var a=Nu(e)}catch(i){throw i===Ao?Vf:i}else a=e;e=bt();var r=e.queue,s=r.dispatch;return n!==e.memoizedState&&(fe.flags|=2048,_o(9,{destroy:void 0},DD.bind(null,r,n),null)),[a,s,t]}function DD(t,e){t.action=e}function dE(t){var e=bt(),n=ze;if(n!==null)return dw(e,n,t);bt(),e=e.memoizedState,n=bt();var a=n.queue.dispatch;return n.memoizedState=t,[e,a,!1]}function _o(t,e,n,a){return t={tag:t,create:n,deps:a,inst:e,next:null},e=fe.updateQueue,e===null&&(e=Uf(),fe.updateQueue=e),n=e.lastEffect,n===null?e.lastEffect=t.next=t:(a=n.next,n.next=t,t.next=a,e.lastEffect=t),t}function fw(){return bt().memoizedState}function Wd(t,e,n,a){var r=Tn();fe.flags|=t,r.memoizedState=_o(1|e,{destroy:void 0},n,a===void 0?null:a)}function Bf(t,e,n,a){var r=bt();a=a===void 0?null:a;var s=r.memoizedState.inst;ze!==null&&a!==null&&hy(a,ze.memoizedState.deps)?r.memoizedState=_o(e,s,n,a):(fe.flags|=t,r.memoizedState=_o(1|e,s,n,a))}function fE(t,e){Wd(8390656,8,t,e)}function Sy(t,e){Bf(2048,8,t,e)}function PD(t){fe.flags|=4;var e=fe.updateQueue;if(e===null)e=Uf(),fe.updateQueue=e,e.events=[t];else{var n=e.events;n===null?e.events=[t]:n.push(t)}}function hw(t){var e=bt().memoizedState;return PD({ref:e,nextImpl:t}),function(){if(Me&2)throw Error(V(440));return e.impl.apply(void 0,arguments)}}function pw(t,e){return Bf(4,2,t,e)}function mw(t,e){return Bf(4,4,t,e)}function gw(t,e){if(typeof e=="function"){t=t();var n=e(t);return function(){typeof n=="function"?n():e(null)}}if(e!=null)return t=t(),e.current=t,function(){e.current=null}}function yw(t,e,n){n=n!=null?n.concat([t]):null,Bf(4,4,gw.bind(null,e,t),n)}function vy(){}function Iw(t,e){var n=bt();e=e===void 0?null:e;var a=n.memoizedState;return e!==null&&hy(e,a[1])?a[0]:(n.memoizedState=[t,e],t)}function _w(t,e){var n=bt();e=e===void 0?null:e;var a=n.memoizedState;if(e!==null&&hy(e,a[1]))return a[0];if(a=t(),ei){os(!0);try{t()}finally{os(!1)}}return n.memoizedState=[a,e],a}function Ty(t,e,n){return n===void 0||Tr&1073741824&&!(be&261930)?t.memoizedState=e:(t.memoizedState=n,t=oC(),fe.lanes|=t,bs|=t,n)}function Sw(t,e,n,a){return Wn(n,e)?n:Io.current!==null?(t=Ty(t,n,a),Wn(t,e)||(Pt=!0),t):!(Tr&42)||Tr&1073741824&&!(be&261930)?(Pt=!0,t.memoizedState=n):(t=oC(),fe.lanes|=t,bs|=t,e)}function vw(t,e,n,a,r){var s=Ne.p;Ne.p=s!==0&&8>s?s:8;var i=se.T,l={};se.T=l,by(t,!1,e,n);try{var u=r(),c=se.S;if(c!==null&&c(l,u),u!==null&&typeof u=="object"&&typeof u.then=="function"){var f=AD(u,a);uu(t,e,f,Kn(t))}else uu(t,e,a,Kn(t))}catch(p){uu(t,e,{then:function(){},status:"rejected",reason:p},Kn())}finally{Ne.p=s,i!==null&&l.types!==null&&(i.types=l.types),se.T=i}}function OD(){}function bg(t,e,n,a){if(t.tag!==5)throw Error(V(476));var r=Tw(t).queue;vw(t,r,e,Ks,n===null?OD:function(){return Ew(t),n(a)})}function Tw(t){var e=t.memoizedState;if(e!==null)return e;e={memoizedState:Ks,baseState:Ks,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Er,lastRenderedState:Ks},next:null};var n={};return e.next={memoizedState:n,baseState:n,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Er,lastRenderedState:n},next:null},t.memoizedState=e,t=t.alternate,t!==null&&(t.memoizedState=e),e}function Ew(t){var e=Tw(t);e.next===null&&(e=t.alternate.memoizedState),uu(t,e.next.queue,{},Kn())}function Ey(){return ln(Cu)}function bw(){return bt().memoizedState}function ww(){return bt().memoizedState}function MD(t){for(var e=t.return;e!==null;){switch(e.tag){case 24:case 3:var n=Kn();t=ps(n);var a=ms(e,t,n);a!==null&&(kn(a,e,n),iu(a,e,n)),e={cache:ly()},t.payload=e;return}e=e.return}}function ND(t,e,n){var a=Kn();n={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},qf(t)?Lw(e,n):(n=ry(t,e,n,a),n!==null&&(kn(n,t,a),Aw(n,e,a)))}function Cw(t,e,n){var a=Kn();uu(t,e,n,a)}function uu(t,e,n,a){var r={lane:a,revertLane:0,gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null};if(qf(t))Lw(e,r);else{var s=t.alternate;if(t.lanes===0&&(s===null||s.lanes===0)&&(s=e.lastRenderedReducer,s!==null))try{var i=e.lastRenderedState,l=s(i,n);if(r.hasEagerState=!0,r.eagerState=l,Wn(l,i))return Nf(t,e,r,0),je===null&&Mf(),!1}catch{}finally{}if(n=ry(t,e,r,a),n!==null)return kn(n,t,a),Aw(n,e,a),!0}return!1}function by(t,e,n,a){if(a={lane:2,revertLane:Py(),gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},qf(t)){if(e)throw Error(V(479))}else e=ry(t,n,a,2),e!==null&&kn(e,t,2)}function qf(t){var e=t.alternate;return t===fe||e!==null&&e===fe}function Lw(t,e){fo=pf=!0;var n=t.pending;n===null?e.next=e:(e.next=n.next,n.next=e),t.pending=e}function Aw(t,e,n){if(n&4194048){var a=e.lanes;a&=t.pendingLanes,n|=a,e.lanes=n,hb(t,n)}}var Eu={readContext:ln,use:Ff,useCallback:_t,useContext:_t,useEffect:_t,useImperativeHandle:_t,useLayoutEffect:_t,useInsertionEffect:_t,useMemo:_t,useReducer:_t,useRef:_t,useState:_t,useDebugValue:_t,useDeferredValue:_t,useTransition:_t,useSyncExternalStore:_t,useId:_t,useHostTransitionStatus:_t,useFormState:_t,useActionState:_t,useOptimistic:_t,useMemoCache:_t,useCacheRefresh:_t};Eu.useEffectEvent=_t;var xw={readContext:ln,use:Ff,useCallback:function(t,e){return Tn().memoizedState=[t,e===void 0?null:e],t},useContext:ln,useEffect:fE,useImperativeHandle:function(t,e,n){n=n!=null?n.concat([t]):null,Wd(4194308,4,gw.bind(null,e,t),n)},useLayoutEffect:function(t,e){return Wd(4194308,4,t,e)},useInsertionEffect:function(t,e){Wd(4,2,t,e)},useMemo:function(t,e){var n=Tn();e=e===void 0?null:e;var a=t();if(ei){os(!0);try{t()}finally{os(!1)}}return n.memoizedState=[a,e],a},useReducer:function(t,e,n){var a=Tn();if(n!==void 0){var r=n(e);if(ei){os(!0);try{n(e)}finally{os(!1)}}}else r=e;return a.memoizedState=a.baseState=r,t={pending:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:r},a.queue=t,t=t.dispatch=ND.bind(null,fe,t),[a.memoizedState,t]},useRef:function(t){var e=Tn();return t={current:t},e.memoizedState=t},useState:function(t){t=Tg(t);var e=t.queue,n=Cw.bind(null,fe,e);return e.dispatch=n,[t.memoizedState,n]},useDebugValue:vy,useDeferredValue:function(t,e){var n=Tn();return Ty(n,t,e)},useTransition:function(){var t=Tg(!1);return t=vw.bind(null,fe,t.queue,!0,!1),Tn().memoizedState=t,[!1,t]},useSyncExternalStore:function(t,e,n){var a=fe,r=Tn();if(we){if(n===void 0)throw Error(V(407));n=n()}else{if(n=e(),je===null)throw Error(V(349));be&127||nw(a,e,n)}r.memoizedState=n;var s={value:n,getSnapshot:e};return r.queue=s,fE(rw.bind(null,a,s,t),[t]),a.flags|=2048,_o(9,{destroy:void 0},aw.bind(null,a,s,n,e),null),n},useId:function(){var t=Tn(),e=je.identifierPrefix;if(we){var n=ka,a=Ra;n=(a&~(1<<32-jn(a)-1)).toString(32)+n,e="_"+e+"R_"+n,n=mf++,0<n&&(e+="H"+n.toString(32)),e+="_"}else n=xD++,e="_"+e+"r_"+n.toString(32)+"_";return t.memoizedState=e},useHostTransitionStatus:Ey,useFormState:uE,useActionState:uE,useOptimistic:function(t){var e=Tn();e.memoizedState=e.baseState=t;var n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return e.queue=n,e=by.bind(null,fe,!0,n),n.dispatch=e,[t,e]},useMemoCache:Iy,useCacheRefresh:function(){return Tn().memoizedState=MD.bind(null,fe)},useEffectEvent:function(t){var e=Tn(),n={impl:t};return e.memoizedState=n,function(){if(Me&2)throw Error(V(440));return n.impl.apply(void 0,arguments)}}},wy={readContext:ln,use:Ff,useCallback:Iw,useContext:ln,useEffect:Sy,useImperativeHandle:yw,useInsertionEffect:pw,useLayoutEffect:mw,useMemo:_w,useReducer:Kd,useRef:fw,useState:function(){return Kd(Er)},useDebugValue:vy,useDeferredValue:function(t,e){var n=bt();return Sw(n,ze.memoizedState,t,e)},useTransition:function(){var t=Kd(Er)[0],e=bt().memoizedState;return[typeof t=="boolean"?t:Nu(t),e]},useSyncExternalStore:tw,useId:bw,useHostTransitionStatus:Ey,useFormState:cE,useActionState:cE,useOptimistic:function(t,e){var n=bt();return ow(n,ze,t,e)},useMemoCache:Iy,useCacheRefresh:ww};wy.useEffectEvent=hw;var Rw={readContext:ln,use:Ff,useCallback:Iw,useContext:ln,useEffect:Sy,useImperativeHandle:yw,useInsertionEffect:pw,useLayoutEffect:mw,useMemo:_w,useReducer:Dm,useRef:fw,useState:function(){return Dm(Er)},useDebugValue:vy,useDeferredValue:function(t,e){var n=bt();return ze===null?Ty(n,t,e):Sw(n,ze.memoizedState,t,e)},useTransition:function(){var t=Dm(Er)[0],e=bt().memoizedState;return[typeof t=="boolean"?t:Nu(t),e]},useSyncExternalStore:tw,useId:bw,useHostTransitionStatus:Ey,useFormState:dE,useActionState:dE,useOptimistic:function(t,e){var n=bt();return ze!==null?ow(n,ze,t,e):(n.baseState=t,[t,n.queue.dispatch])},useMemoCache:Iy,useCacheRefresh:ww};Rw.useEffectEvent=hw;function Pm(t,e,n,a){e=t.memoizedState,n=n(a,e),n=n==null?e:it({},e,n),t.memoizedState=n,t.lanes===0&&(t.updateQueue.baseState=n)}var wg={enqueueSetState:function(t,e,n){t=t._reactInternals;var a=Kn(),r=ps(a);r.payload=e,n!=null&&(r.callback=n),e=ms(t,r,a),e!==null&&(kn(e,t,a),iu(e,t,a))},enqueueReplaceState:function(t,e,n){t=t._reactInternals;var a=Kn(),r=ps(a);r.tag=1,r.payload=e,n!=null&&(r.callback=n),e=ms(t,r,a),e!==null&&(kn(e,t,a),iu(e,t,a))},enqueueForceUpdate:function(t,e){t=t._reactInternals;var n=Kn(),a=ps(n);a.tag=2,e!=null&&(a.callback=e),e=ms(t,a,n),e!==null&&(kn(e,t,n),iu(e,t,n))}};function hE(t,e,n,a,r,s,i){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(a,s,i):e.prototype&&e.prototype.isPureReactComponent?!Iu(n,a)||!Iu(r,s):!0}function pE(t,e,n,a){t=e.state,typeof e.componentWillReceiveProps=="function"&&e.componentWillReceiveProps(n,a),typeof e.UNSAFE_componentWillReceiveProps=="function"&&e.UNSAFE_componentWillReceiveProps(n,a),e.state!==t&&wg.enqueueReplaceState(e,e.state,null)}function ti(t,e){var n=e;if("ref"in e){n={};for(var a in e)a!=="ref"&&(n[a]=e[a])}if(t=t.defaultProps){n===e&&(n=it({},n));for(var r in t)n[r]===void 0&&(n[r]=t[r])}return n}function kw(t){of(t)}function Dw(t){console.error(t)}function Pw(t){of(t)}function gf(t,e){try{var n=t.onUncaughtError;n(e.value,{componentStack:e.stack})}catch(a){setTimeout(function(){throw a})}}function mE(t,e,n){try{var a=t.onCaughtError;a(n.value,{componentStack:n.stack,errorBoundary:e.tag===1?e.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Cg(t,e,n){return n=ps(n),n.tag=3,n.payload={element:null},n.callback=function(){gf(t,e)},n}function Ow(t){return t=ps(t),t.tag=3,t}function Mw(t,e,n,a){var r=n.type.getDerivedStateFromError;if(typeof r=="function"){var s=a.value;t.payload=function(){return r(s)},t.callback=function(){mE(e,n,a)}}var i=n.stateNode;i!==null&&typeof i.componentDidCatch=="function"&&(t.callback=function(){mE(e,n,a),typeof r!="function"&&(gs===null?gs=new Set([this]):gs.add(this));var l=a.stack;this.componentDidCatch(a.value,{componentStack:l!==null?l:""})})}function VD(t,e,n,a,r){if(n.flags|=32768,a!==null&&typeof a=="object"&&typeof a.then=="function"){if(e=n.alternate,e!==null&&Lo(e,n,r,!0),n=Xn.current,n!==null){switch(n.tag){case 31:case 13:return oa===null?vf():n.alternate===null&&St===0&&(St=3),n.flags&=-257,n.flags|=65536,n.lanes=r,a===df?n.flags|=16384:(e=n.updateQueue,e===null?n.updateQueue=new Set([a]):e.add(a),Gm(t,a,r)),!1;case 22:return n.flags|=65536,a===df?n.flags|=16384:(e=n.updateQueue,e===null?(e={transitions:null,markerInstances:null,retryQueue:new Set([a])},n.updateQueue=e):(n=e.retryQueue,n===null?e.retryQueue=new Set([a]):n.add(a)),Gm(t,a,r)),!1}throw Error(V(435,n.tag))}return Gm(t,a,r),vf(),!1}if(we)return e=Xn.current,e!==null?(!(e.flags&65536)&&(e.flags|=256),e.flags|=65536,e.lanes=r,a!==hg&&(t=Error(V(422),{cause:a}),Su(sa(t,n)))):(a!==hg&&(e=Error(V(423),{cause:a}),Su(sa(e,n))),t=t.current.alternate,t.flags|=65536,r&=-r,t.lanes|=r,a=sa(a,n),r=Cg(t.stateNode,a,r),km(t,r),St!==4&&(St=2)),!1;var s=Error(V(520),{cause:a});if(s=sa(s,n),fu===null?fu=[s]:fu.push(s),St!==4&&(St=2),e===null)return!0;a=sa(a,n),n=e;do{switch(n.tag){case 3:return n.flags|=65536,t=r&-r,n.lanes|=t,t=Cg(n.stateNode,a,t),km(n,t),!1;case 1:if(e=n.type,s=n.stateNode,(n.flags&128)===0&&(typeof e.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(gs===null||!gs.has(s))))return n.flags|=65536,r&=-r,n.lanes|=r,r=Ow(r),Mw(r,t,n,a),km(n,r),!1}n=n.return}while(n!==null);return!1}var Cy=Error(V(461)),Pt=!1;function rn(t,e,n,a){e.child=t===null?Qb(e,null,n,a):Zs(e,t.child,n,a)}function gE(t,e,n,a,r){n=n.render;var s=e.ref;if("ref"in a){var i={};for(var l in a)l!=="ref"&&(i[l]=a[l])}else i=a;return Js(e),a=py(t,e,n,i,s,r),l=my(),t!==null&&!Pt?(gy(t,e,r),br(t,e,r)):(we&&l&&iy(e),e.flags|=1,rn(t,e,a,r),e.child)}function yE(t,e,n,a,r){if(t===null){var s=n.type;return typeof s=="function"&&!sy(s)&&s.defaultProps===void 0&&n.compare===null?(e.tag=15,e.type=s,Nw(t,e,s,a,r)):(t=Gd(n.type,null,a,e,e.mode,r),t.ref=e.ref,t.return=e,e.child=t)}if(s=t.child,!Ly(t,r)){var i=s.memoizedProps;if(n=n.compare,n=n!==null?n:Iu,n(i,a)&&t.ref===e.ref)return br(t,e,r)}return e.flags|=1,t=Ir(s,a),t.ref=e.ref,t.return=e,e.child=t}function Nw(t,e,n,a,r){if(t!==null){var s=t.memoizedProps;if(Iu(s,a)&&t.ref===e.ref)if(Pt=!1,e.pendingProps=a=s,Ly(t,r))t.flags&131072&&(Pt=!0);else return e.lanes=t.lanes,br(t,e,r)}return Lg(t,e,n,a,r)}function Vw(t,e,n,a){var r=a.children,s=t!==null?t.memoizedState:null;if(t===null&&e.stateNode===null&&(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),a.mode==="hidden"){if(e.flags&128){if(s=s!==null?s.baseLanes|n:n,t!==null){for(a=e.child=t.child,r=0;a!==null;)r=r|a.lanes|a.childLanes,a=a.sibling;a=r&~s}else a=0,e.child=null;return IE(t,e,s,n,a)}if(n&536870912)e.memoizedState={baseLanes:0,cachePool:null},t!==null&&jd(e,s!==null?s.cachePool:null),s!==null?iE(e,s):Sg(),Jb(e);else return a=e.lanes=536870912,IE(t,e,s!==null?s.baseLanes|n:n,n,a)}else s!==null?(jd(e,s.cachePool),iE(e,s),ss(e),e.memoizedState=null):(t!==null&&jd(e,null),Sg(),ss(e));return rn(t,e,r,n),e.child}function eu(t,e){return t!==null&&t.tag===22||e.stateNode!==null||(e.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),e.sibling}function IE(t,e,n,a,r){var s=uy();return s=s===null?null:{parent:Dt._currentValue,pool:s},e.memoizedState={baseLanes:n,cachePool:s},t!==null&&jd(e,null),Sg(),Jb(e),t!==null&&Lo(t,e,a,!0),e.childLanes=r,null}function Xd(t,e){return e=yf({mode:e.mode,children:e.children},t.mode),e.ref=t.ref,t.child=e,e.return=t,e}function _E(t,e,n){return Zs(e,t.child,null,n),t=Xd(e,e.pendingProps),t.flags|=2,Bn(e),e.memoizedState=null,t}function UD(t,e,n){var a=e.pendingProps,r=(e.flags&128)!==0;if(e.flags&=-129,t===null){if(we){if(a.mode==="hidden")return t=Xd(e,a),e.lanes=536870912,eu(null,t);if(vg(e),(t=st)?(t=xC(t,ia),t=t!==null&&t.data==="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:vs!==null?{id:Ra,overflow:ka}:null,retryLane:536870912,hydrationErrors:null},n=zb(t),n.return=e,e.child=n,on=e,st=null)):t=null,t===null)throw Ts(e);return e.lanes=536870912,null}return Xd(e,a)}var s=t.memoizedState;if(s!==null){var i=s.dehydrated;if(vg(e),r)if(e.flags&256)e.flags&=-257,e=_E(t,e,n);else if(e.memoizedState!==null)e.child=t.child,e.flags|=128,e=null;else throw Error(V(558));else if(Pt||Lo(t,e,n,!1),r=(n&t.childLanes)!==0,Pt||r){if(a=je,a!==null&&(i=pb(a,n),i!==0&&i!==s.retryLane))throw s.retryLane=i,si(t,i),kn(a,t,i),Cy;vf(),e=_E(t,e,n)}else t=s.treeContext,st=la(i.nextSibling),on=e,we=!0,hs=null,ia=!1,t!==null&&Gb(e,t),e=Xd(e,a),e.flags|=4096;return e}return t=Ir(t.child,{mode:a.mode,children:a.children}),t.ref=e.ref,e.child=t,t.return=e,t}function Qd(t,e){var n=e.ref;if(n===null)t!==null&&t.ref!==null&&(e.flags|=4194816);else{if(typeof n!="function"&&typeof n!="object")throw Error(V(284));(t===null||t.ref!==n)&&(e.flags|=4194816)}}function Lg(t,e,n,a,r){return Js(e),n=py(t,e,n,a,void 0,r),a=my(),t!==null&&!Pt?(gy(t,e,r),br(t,e,r)):(we&&a&&iy(e),e.flags|=1,rn(t,e,n,r),e.child)}function SE(t,e,n,a,r,s){return Js(e),e.updateQueue=null,n=ew(e,a,n,r),Zb(t),a=my(),t!==null&&!Pt?(gy(t,e,s),br(t,e,s)):(we&&a&&iy(e),e.flags|=1,rn(t,e,n,s),e.child)}function vE(t,e,n,a,r){if(Js(e),e.stateNode===null){var s=no,i=n.contextType;typeof i=="object"&&i!==null&&(s=ln(i)),s=new n(a,s),e.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=wg,e.stateNode=s,s._reactInternals=e,s=e.stateNode,s.props=a,s.state=e.memoizedState,s.refs={},dy(e),i=n.contextType,s.context=typeof i=="object"&&i!==null?ln(i):no,s.state=e.memoizedState,i=n.getDerivedStateFromProps,typeof i=="function"&&(Pm(e,n,i,a),s.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(i=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),i!==s.state&&wg.enqueueReplaceState(s,s.state,null),lu(e,a,s,r),ou(),s.state=e.memoizedState),typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!0}else if(t===null){s=e.stateNode;var l=e.memoizedProps,u=ti(n,l);s.props=u;var c=s.context,f=n.contextType;i=no,typeof f=="object"&&f!==null&&(i=ln(f));var p=n.getDerivedStateFromProps;f=typeof p=="function"||typeof s.getSnapshotBeforeUpdate=="function",l=e.pendingProps!==l,f||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(l||c!==i)&&pE(e,s,a,i),ns=!1;var m=e.memoizedState;s.state=m,lu(e,a,s,r),ou(),c=e.memoizedState,l||m!==c||ns?(typeof p=="function"&&(Pm(e,n,p,a),c=e.memoizedState),(u=ns||hE(e,n,u,a,m,c,i))?(f||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(e.flags|=4194308)):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),e.memoizedProps=a,e.memoizedState=c),s.props=a,s.state=c,s.context=i,a=u):(typeof s.componentDidMount=="function"&&(e.flags|=4194308),a=!1)}else{s=e.stateNode,Ig(t,e),i=e.memoizedProps,f=ti(n,i),s.props=f,p=e.pendingProps,m=s.context,c=n.contextType,u=no,typeof c=="object"&&c!==null&&(u=ln(c)),l=n.getDerivedStateFromProps,(c=typeof l=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(i!==p||m!==u)&&pE(e,s,a,u),ns=!1,m=e.memoizedState,s.state=m,lu(e,a,s,r),ou();var S=e.memoizedState;i!==p||m!==S||ns||t!==null&&t.dependencies!==null&&cf(t.dependencies)?(typeof l=="function"&&(Pm(e,n,l,a),S=e.memoizedState),(f=ns||hE(e,n,f,a,m,S,u)||t!==null&&t.dependencies!==null&&cf(t.dependencies))?(c||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(a,S,u),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(a,S,u)),typeof s.componentDidUpdate=="function"&&(e.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(e.flags|=1024)):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),e.memoizedProps=a,e.memoizedState=S),s.props=a,s.state=S,s.context=u,a=f):(typeof s.componentDidUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||i===t.memoizedProps&&m===t.memoizedState||(e.flags|=1024),a=!1)}return s=a,Qd(t,e),a=(e.flags&128)!==0,s||a?(s=e.stateNode,n=a&&typeof n.getDerivedStateFromError!="function"?null:s.render(),e.flags|=1,t!==null&&a?(e.child=Zs(e,t.child,null,r),e.child=Zs(e,null,n,r)):rn(t,e,n,r),e.memoizedState=s.state,t=e.child):t=br(t,e,r),t}function TE(t,e,n,a){return $s(),e.flags|=256,rn(t,e,n,a),e.child}var Om={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Mm(t){return{baseLanes:t,cachePool:Kb()}}function Nm(t,e,n){return t=t!==null?t.childLanes&~n:0,e&&(t|=zn),t}function Uw(t,e,n){var a=e.pendingProps,r=!1,s=(e.flags&128)!==0,i;if((i=s)||(i=t!==null&&t.memoizedState===null?!1:(Et.current&2)!==0),i&&(r=!0,e.flags&=-129),i=(e.flags&32)!==0,e.flags&=-33,t===null){if(we){if(r?rs(e):ss(e),(t=st)?(t=xC(t,ia),t=t!==null&&t.data!=="&"?t:null,t!==null&&(e.memoizedState={dehydrated:t,treeContext:vs!==null?{id:Ra,overflow:ka}:null,retryLane:536870912,hydrationErrors:null},n=zb(t),n.return=e,e.child=n,on=e,st=null)):t=null,t===null)throw Ts(e);return qg(t)?e.lanes=32:e.lanes=536870912,null}var l=a.children;return a=a.fallback,r?(ss(e),r=e.mode,l=yf({mode:"hidden",children:l},r),a=Ws(a,r,n,null),l.return=e,a.return=e,l.sibling=a,e.child=l,a=e.child,a.memoizedState=Mm(n),a.childLanes=Nm(t,i,n),e.memoizedState=Om,eu(null,a)):(rs(e),Ag(e,l))}var u=t.memoizedState;if(u!==null&&(l=u.dehydrated,l!==null)){if(s)e.flags&256?(rs(e),e.flags&=-257,e=Vm(t,e,n)):e.memoizedState!==null?(ss(e),e.child=t.child,e.flags|=128,e=null):(ss(e),l=a.fallback,r=e.mode,a=yf({mode:"visible",children:a.children},r),l=Ws(l,r,n,null),l.flags|=2,a.return=e,l.return=e,a.sibling=l,e.child=a,Zs(e,t.child,null,n),a=e.child,a.memoizedState=Mm(n),a.childLanes=Nm(t,i,n),e.memoizedState=Om,e=eu(null,a));else if(rs(e),qg(l)){if(i=l.nextSibling&&l.nextSibling.dataset,i)var c=i.dgst;i=c,a=Error(V(419)),a.stack="",a.digest=i,Su({value:a,source:null,stack:null}),e=Vm(t,e,n)}else if(Pt||Lo(t,e,n,!1),i=(n&t.childLanes)!==0,Pt||i){if(i=je,i!==null&&(a=pb(i,n),a!==0&&a!==u.retryLane))throw u.retryLane=a,si(t,a),kn(i,t,a),Cy;Bg(l)||vf(),e=Vm(t,e,n)}else Bg(l)?(e.flags|=192,e.child=t.child,e=null):(t=u.treeContext,st=la(l.nextSibling),on=e,we=!0,hs=null,ia=!1,t!==null&&Gb(e,t),e=Ag(e,a.children),e.flags|=4096);return e}return r?(ss(e),l=a.fallback,r=e.mode,u=t.child,c=u.sibling,a=Ir(u,{mode:"hidden",children:a.children}),a.subtreeFlags=u.subtreeFlags&65011712,c!==null?l=Ir(c,l):(l=Ws(l,r,n,null),l.flags|=2),l.return=e,a.return=e,a.sibling=l,e.child=a,eu(null,a),a=e.child,l=t.child.memoizedState,l===null?l=Mm(n):(r=l.cachePool,r!==null?(u=Dt._currentValue,r=r.parent!==u?{parent:u,pool:u}:r):r=Kb(),l={baseLanes:l.baseLanes|n,cachePool:r}),a.memoizedState=l,a.childLanes=Nm(t,i,n),e.memoizedState=Om,eu(t.child,a)):(rs(e),n=t.child,t=n.sibling,n=Ir(n,{mode:"visible",children:a.children}),n.return=e,n.sibling=null,t!==null&&(i=e.deletions,i===null?(e.deletions=[t],e.flags|=16):i.push(t)),e.child=n,e.memoizedState=null,n)}function Ag(t,e){return e=yf({mode:"visible",children:e},t.mode),e.return=t,t.child=e}function yf(t,e){return t=qn(22,t,null,e),t.lanes=0,t}function Vm(t,e,n){return Zs(e,t.child,null,n),t=Ag(e,e.pendingProps.children),t.flags|=2,e.memoizedState=null,t}function EE(t,e,n){t.lanes|=e;var a=t.alternate;a!==null&&(a.lanes|=e),mg(t.return,e,n)}function Um(t,e,n,a,r,s){var i=t.memoizedState;i===null?t.memoizedState={isBackwards:e,rendering:null,renderingStartTime:0,last:a,tail:n,tailMode:r,treeForkCount:s}:(i.isBackwards=e,i.rendering=null,i.renderingStartTime=0,i.last=a,i.tail=n,i.tailMode=r,i.treeForkCount=s)}function Fw(t,e,n){var a=e.pendingProps,r=a.revealOrder,s=a.tail;a=a.children;var i=Et.current,l=(i&2)!==0;if(l?(i=i&1|2,e.flags|=128):i&=1,Ye(Et,i),rn(t,e,a,n),a=we?_u:0,!l&&t!==null&&t.flags&128)e:for(t=e.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&EE(t,n,e);else if(t.tag===19)EE(t,n,e);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break e;for(;t.sibling===null;){if(t.return===null||t.return===e)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}switch(r){case"forwards":for(n=e.child,r=null;n!==null;)t=n.alternate,t!==null&&hf(t)===null&&(r=n),n=n.sibling;n=r,n===null?(r=e.child,e.child=null):(r=n.sibling,n.sibling=null),Um(e,!1,r,n,s,a);break;case"backwards":case"unstable_legacy-backwards":for(n=null,r=e.child,e.child=null;r!==null;){if(t=r.alternate,t!==null&&hf(t)===null){e.child=r;break}t=r.sibling,r.sibling=n,n=r,r=t}Um(e,!0,n,null,s,a);break;case"together":Um(e,!1,null,null,void 0,a);break;default:e.memoizedState=null}return e.child}function br(t,e,n){if(t!==null&&(e.dependencies=t.dependencies),bs|=e.lanes,!(n&e.childLanes))if(t!==null){if(Lo(t,e,n,!1),(n&e.childLanes)===0)return null}else return null;if(t!==null&&e.child!==t.child)throw Error(V(153));if(e.child!==null){for(t=e.child,n=Ir(t,t.pendingProps),e.child=n,n.return=e;t.sibling!==null;)t=t.sibling,n=n.sibling=Ir(t,t.pendingProps),n.return=e;n.sibling=null}return e.child}function Ly(t,e){return t.lanes&e?!0:(t=t.dependencies,!!(t!==null&&cf(t)))}function FD(t,e,n){switch(e.tag){case 3:nf(e,e.stateNode.containerInfo),as(e,Dt,t.memoizedState.cache),$s();break;case 27:case 5:ng(e);break;case 4:nf(e,e.stateNode.containerInfo);break;case 10:as(e,e.type,e.memoizedProps.value);break;case 31:if(e.memoizedState!==null)return e.flags|=128,vg(e),null;break;case 13:var a=e.memoizedState;if(a!==null)return a.dehydrated!==null?(rs(e),e.flags|=128,null):n&e.child.childLanes?Uw(t,e,n):(rs(e),t=br(t,e,n),t!==null?t.sibling:null);rs(e);break;case 19:var r=(t.flags&128)!==0;if(a=(n&e.childLanes)!==0,a||(Lo(t,e,n,!1),a=(n&e.childLanes)!==0),r){if(a)return Fw(t,e,n);e.flags|=128}if(r=e.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Ye(Et,Et.current),a)break;return null;case 22:return e.lanes=0,Vw(t,e,n,e.pendingProps);case 24:as(e,Dt,t.memoizedState.cache)}return br(t,e,n)}function Bw(t,e,n){if(t!==null)if(t.memoizedProps!==e.pendingProps)Pt=!0;else{if(!Ly(t,n)&&!(e.flags&128))return Pt=!1,FD(t,e,n);Pt=!!(t.flags&131072)}else Pt=!1,we&&e.flags&1048576&&Hb(e,_u,e.index);switch(e.lanes=0,e.tag){case 16:e:{var a=e.pendingProps;if(t=Gs(e.elementType),e.type=t,typeof t=="function")sy(t)?(a=ti(t,a),e.tag=1,e=vE(null,e,t,a,n)):(e.tag=0,e=Lg(null,e,t,a,n));else{if(t!=null){var r=t.$$typeof;if(r===jg){e.tag=11,e=gE(null,e,t,a,n);break e}else if(r===Kg){e.tag=14,e=yE(null,e,t,a,n);break e}}throw e=eg(t)||t,Error(V(306,e,""))}}return e;case 0:return Lg(t,e,e.type,e.pendingProps,n);case 1:return a=e.type,r=ti(a,e.pendingProps),vE(t,e,a,r,n);case 3:e:{if(nf(e,e.stateNode.containerInfo),t===null)throw Error(V(387));a=e.pendingProps;var s=e.memoizedState;r=s.element,Ig(t,e),lu(e,a,null,n);var i=e.memoizedState;if(a=i.cache,as(e,Dt,a),a!==s.cache&&gg(e,[Dt],n,!0),ou(),a=i.element,s.isDehydrated)if(s={element:a,isDehydrated:!1,cache:i.cache},e.updateQueue.baseState=s,e.memoizedState=s,e.flags&256){e=TE(t,e,a,n);break e}else if(a!==r){r=sa(Error(V(424)),e),Su(r),e=TE(t,e,a,n);break e}else{switch(t=e.stateNode.containerInfo,t.nodeType){case 9:t=t.body;break;default:t=t.nodeName==="HTML"?t.ownerDocument.body:t}for(st=la(t.firstChild),on=e,we=!0,hs=null,ia=!0,n=Qb(e,null,a,n),e.child=n;n;)n.flags=n.flags&-3|4096,n=n.sibling}else{if($s(),a===r){e=br(t,e,n);break e}rn(t,e,a,n)}e=e.child}return e;case 26:return Qd(t,e),t===null?(n=jE(e.type,null,e.pendingProps,null))?e.memoizedState=n:we||(n=e.type,t=e.pendingProps,a=wf(fs.current).createElement(n),a[sn]=e,a[Dn]=t,un(a,n,t),Yt(a),e.stateNode=a):e.memoizedState=jE(e.type,t.memoizedProps,e.pendingProps,t.memoizedState),null;case 27:return ng(e),t===null&&we&&(a=e.stateNode=RC(e.type,e.pendingProps,fs.current),on=e,ia=!0,r=st,Cs(e.type)?(zg=r,st=la(a.firstChild)):st=r),rn(t,e,e.pendingProps.children,n),Qd(t,e),t===null&&(e.flags|=4194304),e.child;case 5:return t===null&&we&&((r=a=st)&&(a=hP(a,e.type,e.pendingProps,ia),a!==null?(e.stateNode=a,on=e,st=la(a.firstChild),ia=!1,r=!0):r=!1),r||Ts(e)),ng(e),r=e.type,s=e.pendingProps,i=t!==null?t.memoizedProps:null,a=s.children,Ug(r,s)?a=null:i!==null&&Ug(r,i)&&(e.flags|=32),e.memoizedState!==null&&(r=py(t,e,RD,null,null,n),Cu._currentValue=r),Qd(t,e),rn(t,e,a,n),e.child;case 6:return t===null&&we&&((t=n=st)&&(n=pP(n,e.pendingProps,ia),n!==null?(e.stateNode=n,on=e,st=null,t=!0):t=!1),t||Ts(e)),null;case 13:return Uw(t,e,n);case 4:return nf(e,e.stateNode.containerInfo),a=e.pendingProps,t===null?e.child=Zs(e,null,a,n):rn(t,e,a,n),e.child;case 11:return gE(t,e,e.type,e.pendingProps,n);case 7:return rn(t,e,e.pendingProps,n),e.child;case 8:return rn(t,e,e.pendingProps.children,n),e.child;case 12:return rn(t,e,e.pendingProps.children,n),e.child;case 10:return a=e.pendingProps,as(e,e.type,a.value),rn(t,e,a.children,n),e.child;case 9:return r=e.type._context,a=e.pendingProps.children,Js(e),r=ln(r),a=a(r),e.flags|=1,rn(t,e,a,n),e.child;case 14:return yE(t,e,e.type,e.pendingProps,n);case 15:return Nw(t,e,e.type,e.pendingProps,n);case 19:return Fw(t,e,n);case 31:return UD(t,e,n);case 22:return Vw(t,e,n,e.pendingProps);case 24:return Js(e),a=ln(Dt),t===null?(r=uy(),r===null&&(r=je,s=ly(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=n),r=s),e.memoizedState={parent:a,cache:r},dy(e),as(e,Dt,r)):(t.lanes&n&&(Ig(t,e),lu(e,null,null,n),ou()),r=t.memoizedState,s=e.memoizedState,r.parent!==a?(r={parent:a,cache:a},e.memoizedState=r,e.lanes===0&&(e.memoizedState=e.updateQueue.baseState=r),as(e,Dt,a)):(a=s.cache,as(e,Dt,a),a!==r.cache&&gg(e,[Dt],n,!0))),rn(t,e,e.pendingProps.children,n),e.child;case 29:throw e.pendingProps}throw Error(V(156,e.tag))}function ur(t){t.flags|=4}function Fm(t,e,n,a,r){if((e=(t.mode&32)!==0)&&(e=!1),e){if(t.flags|=16777216,(r&335544128)===r)if(t.stateNode.complete)t.flags|=8192;else if(cC())t.flags|=8192;else throw Qs=df,cy}else t.flags&=-16777217}function bE(t,e){if(e.type!=="stylesheet"||e.state.loading&4)t.flags&=-16777217;else if(t.flags|=16777216,!PC(e))if(cC())t.flags|=8192;else throw Qs=df,cy}function Pd(t,e){e!==null&&(t.flags|=4),t.flags&16384&&(e=t.tag!==22?db():536870912,t.lanes|=e,So|=e)}function Wl(t,e){if(!we)switch(t.tailMode){case"hidden":e=t.tail;for(var n=null;e!==null;)e.alternate!==null&&(n=e),e=e.sibling;n===null?t.tail=null:n.sibling=null;break;case"collapsed":n=t.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e||t.tail===null?t.tail=null:t.tail.sibling=null:a.sibling=null}}function rt(t){var e=t.alternate!==null&&t.alternate.child===t.child,n=0,a=0;if(e)for(var r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags&65011712,a|=r.flags&65011712,r.return=t,r=r.sibling;else for(r=t.child;r!==null;)n|=r.lanes|r.childLanes,a|=r.subtreeFlags,a|=r.flags,r.return=t,r=r.sibling;return t.subtreeFlags|=a,t.childLanes=n,e}function BD(t,e,n){var a=e.pendingProps;switch(oy(e),e.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return rt(e),null;case 1:return rt(e),null;case 3:return n=e.stateNode,a=null,t!==null&&(a=t.memoizedState.cache),e.memoizedState.cache!==a&&(e.flags|=2048),_r(Dt),po(),n.pendingContext&&(n.context=n.pendingContext,n.pendingContext=null),(t===null||t.child===null)&&(Gi(e)?ur(e):t===null||t.memoizedState.isDehydrated&&!(e.flags&256)||(e.flags|=1024,Rm())),rt(e),null;case 26:var r=e.type,s=e.memoizedState;return t===null?(ur(e),s!==null?(rt(e),bE(e,s)):(rt(e),Fm(e,r,null,a,n))):s?s!==t.memoizedState?(ur(e),rt(e),bE(e,s)):(rt(e),e.flags&=-16777217):(t=t.memoizedProps,t!==a&&ur(e),rt(e),Fm(e,r,t,a,n)),null;case 27:if(af(e),n=fs.current,r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&ur(e);else{if(!a){if(e.stateNode===null)throw Error(V(166));return rt(e),null}t=Pa.current,Gi(e)?ZT(e,t):(t=RC(r,a,n),e.stateNode=t,ur(e))}return rt(e),null;case 5:if(af(e),r=e.type,t!==null&&e.stateNode!=null)t.memoizedProps!==a&&ur(e);else{if(!a){if(e.stateNode===null)throw Error(V(166));return rt(e),null}if(s=Pa.current,Gi(e))ZT(e,s);else{var i=wf(fs.current);switch(s){case 1:s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=i.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=i.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=i.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof a.is=="string"?i.createElement("select",{is:a.is}):i.createElement("select"),a.multiple?s.multiple=!0:a.size&&(s.size=a.size);break;default:s=typeof a.is=="string"?i.createElement(r,{is:a.is}):i.createElement(r)}}s[sn]=e,s[Dn]=a;e:for(i=e.child;i!==null;){if(i.tag===5||i.tag===6)s.appendChild(i.stateNode);else if(i.tag!==4&&i.tag!==27&&i.child!==null){i.child.return=i,i=i.child;continue}if(i===e)break e;for(;i.sibling===null;){if(i.return===null||i.return===e)break e;i=i.return}i.sibling.return=i.return,i=i.sibling}e.stateNode=s;e:switch(un(s,r,a),r){case"button":case"input":case"select":case"textarea":a=!!a.autoFocus;break e;case"img":a=!0;break e;default:a=!1}a&&ur(e)}}return rt(e),Fm(e,e.type,t===null?null:t.memoizedProps,e.pendingProps,n),null;case 6:if(t&&e.stateNode!=null)t.memoizedProps!==a&&ur(e);else{if(typeof a!="string"&&e.stateNode===null)throw Error(V(166));if(t=fs.current,Gi(e)){if(t=e.stateNode,n=e.memoizedProps,a=null,r=on,r!==null)switch(r.tag){case 27:case 5:a=r.memoizedProps}t[sn]=e,t=!!(t.nodeValue===n||a!==null&&a.suppressHydrationWarning===!0||CC(t.nodeValue,n)),t||Ts(e,!0)}else t=wf(t).createTextNode(a),t[sn]=e,e.stateNode=t}return rt(e),null;case 31:if(n=e.memoizedState,t===null||t.memoizedState!==null){if(a=Gi(e),n!==null){if(t===null){if(!a)throw Error(V(318));if(t=e.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(V(557));t[sn]=e}else $s(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;rt(e),t=!1}else n=Rm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=n),t=!0;if(!t)return e.flags&256?(Bn(e),e):(Bn(e),null);if(e.flags&128)throw Error(V(558))}return rt(e),null;case 13:if(a=e.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(r=Gi(e),a!==null&&a.dehydrated!==null){if(t===null){if(!r)throw Error(V(318));if(r=e.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(V(317));r[sn]=e}else $s(),!(e.flags&128)&&(e.memoizedState=null),e.flags|=4;rt(e),r=!1}else r=Rm(),t!==null&&t.memoizedState!==null&&(t.memoizedState.hydrationErrors=r),r=!0;if(!r)return e.flags&256?(Bn(e),e):(Bn(e),null)}return Bn(e),e.flags&128?(e.lanes=n,e):(n=a!==null,t=t!==null&&t.memoizedState!==null,n&&(a=e.child,r=null,a.alternate!==null&&a.alternate.memoizedState!==null&&a.alternate.memoizedState.cachePool!==null&&(r=a.alternate.memoizedState.cachePool.pool),s=null,a.memoizedState!==null&&a.memoizedState.cachePool!==null&&(s=a.memoizedState.cachePool.pool),s!==r&&(a.flags|=2048)),n!==t&&n&&(e.child.flags|=8192),Pd(e,e.updateQueue),rt(e),null);case 4:return po(),t===null&&Oy(e.stateNode.containerInfo),rt(e),null;case 10:return _r(e.type),rt(e),null;case 19:if($t(Et),a=e.memoizedState,a===null)return rt(e),null;if(r=(e.flags&128)!==0,s=a.rendering,s===null)if(r)Wl(a,!1);else{if(St!==0||t!==null&&t.flags&128)for(t=e.child;t!==null;){if(s=hf(t),s!==null){for(e.flags|=128,Wl(a,!1),t=s.updateQueue,e.updateQueue=t,Pd(e,t),e.subtreeFlags=0,t=n,n=e.child;n!==null;)qb(n,t),n=n.sibling;return Ye(Et,Et.current&1|2),we&&hr(e,a.treeForkCount),e.child}t=t.sibling}a.tail!==null&&Hn()>_f&&(e.flags|=128,r=!0,Wl(a,!1),e.lanes=4194304)}else{if(!r)if(t=hf(s),t!==null){if(e.flags|=128,r=!0,t=t.updateQueue,e.updateQueue=t,Pd(e,t),Wl(a,!0),a.tail===null&&a.tailMode==="hidden"&&!s.alternate&&!we)return rt(e),null}else 2*Hn()-a.renderingStartTime>_f&&n!==536870912&&(e.flags|=128,r=!0,Wl(a,!1),e.lanes=4194304);a.isBackwards?(s.sibling=e.child,e.child=s):(t=a.last,t!==null?t.sibling=s:e.child=s,a.last=s)}return a.tail!==null?(t=a.tail,a.rendering=t,a.tail=t.sibling,a.renderingStartTime=Hn(),t.sibling=null,n=Et.current,Ye(Et,r?n&1|2:n&1),we&&hr(e,a.treeForkCount),t):(rt(e),null);case 22:case 23:return Bn(e),fy(),a=e.memoizedState!==null,t!==null?t.memoizedState!==null!==a&&(e.flags|=8192):a&&(e.flags|=8192),a?n&536870912&&!(e.flags&128)&&(rt(e),e.subtreeFlags&6&&(e.flags|=8192)):rt(e),n=e.updateQueue,n!==null&&Pd(e,n.retryQueue),n=null,t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),a=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),a!==n&&(e.flags|=2048),t!==null&&$t(Xs),null;case 24:return n=null,t!==null&&(n=t.memoizedState.cache),e.memoizedState.cache!==n&&(e.flags|=2048),_r(Dt),rt(e),null;case 25:return null;case 30:return null}throw Error(V(156,e.tag))}function qD(t,e){switch(oy(e),e.tag){case 1:return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 3:return _r(Dt),po(),t=e.flags,t&65536&&!(t&128)?(e.flags=t&-65537|128,e):null;case 26:case 27:case 5:return af(e),null;case 31:if(e.memoizedState!==null){if(Bn(e),e.alternate===null)throw Error(V(340));$s()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 13:if(Bn(e),t=e.memoizedState,t!==null&&t.dehydrated!==null){if(e.alternate===null)throw Error(V(340));$s()}return t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 19:return $t(Et),null;case 4:return po(),null;case 10:return _r(e.type),null;case 22:case 23:return Bn(e),fy(),t!==null&&$t(Xs),t=e.flags,t&65536?(e.flags=t&-65537|128,e):null;case 24:return _r(Dt),null;case 25:return null;default:return null}}function qw(t,e){switch(oy(e),e.tag){case 3:_r(Dt),po();break;case 26:case 27:case 5:af(e);break;case 4:po();break;case 31:e.memoizedState!==null&&Bn(e);break;case 13:Bn(e);break;case 19:$t(Et);break;case 10:_r(e.type);break;case 22:case 23:Bn(e),fy(),t!==null&&$t(Xs);break;case 24:_r(Dt)}}function Vu(t,e){try{var n=e.updateQueue,a=n!==null?n.lastEffect:null;if(a!==null){var r=a.next;n=r;do{if((n.tag&t)===t){a=void 0;var s=n.create,i=n.inst;a=s(),i.destroy=a}n=n.next}while(n!==r)}}catch(l){Fe(e,e.return,l)}}function Es(t,e,n){try{var a=e.updateQueue,r=a!==null?a.lastEffect:null;if(r!==null){var s=r.next;a=s;do{if((a.tag&t)===t){var i=a.inst,l=i.destroy;if(l!==void 0){i.destroy=void 0,r=e;var u=n,c=l;try{c()}catch(f){Fe(r,u,f)}}}a=a.next}while(a!==s)}}catch(f){Fe(e,e.return,f)}}function zw(t){var e=t.updateQueue;if(e!==null){var n=t.stateNode;try{$b(e,n)}catch(a){Fe(t,t.return,a)}}}function Hw(t,e,n){n.props=ti(t.type,t.memoizedProps),n.state=t.memoizedState;try{n.componentWillUnmount()}catch(a){Fe(t,e,a)}}function cu(t,e){try{var n=t.ref;if(n!==null){switch(t.tag){case 26:case 27:case 5:var a=t.stateNode;break;case 30:a=t.stateNode;break;default:a=t.stateNode}typeof n=="function"?t.refCleanup=n(a):n.current=a}}catch(r){Fe(t,e,r)}}function Da(t,e){var n=t.ref,a=t.refCleanup;if(n!==null)if(typeof a=="function")try{a()}catch(r){Fe(t,e,r)}finally{t.refCleanup=null,t=t.alternate,t!=null&&(t.refCleanup=null)}else if(typeof n=="function")try{n(null)}catch(r){Fe(t,e,r)}else n.current=null}function Gw(t){var e=t.type,n=t.memoizedProps,a=t.stateNode;try{e:switch(e){case"button":case"input":case"select":case"textarea":n.autoFocus&&a.focus();break e;case"img":n.src?a.src=n.src:n.srcSet&&(a.srcset=n.srcSet)}}catch(r){Fe(t,t.return,r)}}function Bm(t,e,n){try{var a=t.stateNode;oP(a,t.type,n,e),a[Dn]=e}catch(r){Fe(t,t.return,r)}}function jw(t){return t.tag===5||t.tag===3||t.tag===26||t.tag===27&&Cs(t.type)||t.tag===4}function qm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||jw(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.tag===27&&Cs(t.type)||t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function xg(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?(n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n).insertBefore(t,e):(e=n.nodeType===9?n.body:n.nodeName==="HTML"?n.ownerDocument.body:n,e.appendChild(t),n=n._reactRootContainer,n!=null||e.onclick!==null||(e.onclick=gr));else if(a!==4&&(a===27&&Cs(t.type)&&(n=t.stateNode,e=null),t=t.child,t!==null))for(xg(t,e,n),t=t.sibling;t!==null;)xg(t,e,n),t=t.sibling}function If(t,e,n){var a=t.tag;if(a===5||a===6)t=t.stateNode,e?n.insertBefore(t,e):n.appendChild(t);else if(a!==4&&(a===27&&Cs(t.type)&&(n=t.stateNode),t=t.child,t!==null))for(If(t,e,n),t=t.sibling;t!==null;)If(t,e,n),t=t.sibling}function Kw(t){var e=t.stateNode,n=t.memoizedProps;try{for(var a=t.type,r=e.attributes;r.length;)e.removeAttributeNode(r[0]);un(e,a,n),e[sn]=t,e[Dn]=n}catch(s){Fe(t,t.return,s)}}var pr=!1,kt=!1,zm=!1,wE=typeof WeakSet=="function"?WeakSet:Set,Qt=null;function zD(t,e){if(t=t.containerInfo,Ng=xf,t=Pb(t),ny(t)){if("selectionStart"in t)var n={start:t.selectionStart,end:t.selectionEnd};else e:{n=(n=t.ownerDocument)&&n.defaultView||window;var a=n.getSelection&&n.getSelection();if(a&&a.rangeCount!==0){n=a.anchorNode;var r=a.anchorOffset,s=a.focusNode;a=a.focusOffset;try{n.nodeType,s.nodeType}catch{n=null;break e}var i=0,l=-1,u=-1,c=0,f=0,p=t,m=null;t:for(;;){for(var S;p!==n||r!==0&&p.nodeType!==3||(l=i+r),p!==s||a!==0&&p.nodeType!==3||(u=i+a),p.nodeType===3&&(i+=p.nodeValue.length),(S=p.firstChild)!==null;)m=p,p=S;for(;;){if(p===t)break t;if(m===n&&++c===r&&(l=i),m===s&&++f===a&&(u=i),(S=p.nextSibling)!==null)break;p=m,m=p.parentNode}p=S}n=l===-1||u===-1?null:{start:l,end:u}}else n=null}n=n||{start:0,end:0}}else n=null;for(Vg={focusedElem:t,selectionRange:n},xf=!1,Qt=e;Qt!==null;)if(e=Qt,t=e.child,(e.subtreeFlags&1028)!==0&&t!==null)t.return=e,Qt=t;else for(;Qt!==null;){switch(e=Qt,s=e.alternate,t=e.flags,e.tag){case 0:if(t&4&&(t=e.updateQueue,t=t!==null?t.events:null,t!==null))for(n=0;n<t.length;n++)r=t[n],r.ref.impl=r.nextImpl;break;case 11:case 15:break;case 1:if(t&1024&&s!==null){t=void 0,n=e,r=s.memoizedProps,s=s.memoizedState,a=n.stateNode;try{var R=ti(n.type,r);t=a.getSnapshotBeforeUpdate(R,s),a.__reactInternalSnapshotBeforeUpdate=t}catch(D){Fe(n,n.return,D)}}break;case 3:if(t&1024){if(t=e.stateNode.containerInfo,n=t.nodeType,n===9)Fg(t);else if(n===1)switch(t.nodeName){case"HEAD":case"HTML":case"BODY":Fg(t);break;default:t.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if(t&1024)throw Error(V(163))}if(t=e.sibling,t!==null){t.return=e.return,Qt=t;break}Qt=e.return}}function Ww(t,e,n){var a=n.flags;switch(n.tag){case 0:case 11:case 15:dr(t,n),a&4&&Vu(5,n);break;case 1:if(dr(t,n),a&4)if(t=n.stateNode,e===null)try{t.componentDidMount()}catch(i){Fe(n,n.return,i)}else{var r=ti(n.type,e.memoizedProps);e=e.memoizedState;try{t.componentDidUpdate(r,e,t.__reactInternalSnapshotBeforeUpdate)}catch(i){Fe(n,n.return,i)}}a&64&&zw(n),a&512&&cu(n,n.return);break;case 3:if(dr(t,n),a&64&&(t=n.updateQueue,t!==null)){if(e=null,n.child!==null)switch(n.child.tag){case 27:case 5:e=n.child.stateNode;break;case 1:e=n.child.stateNode}try{$b(t,e)}catch(i){Fe(n,n.return,i)}}break;case 27:e===null&&a&4&&Kw(n);case 26:case 5:dr(t,n),e===null&&a&4&&Gw(n),a&512&&cu(n,n.return);break;case 12:dr(t,n);break;case 31:dr(t,n),a&4&&Yw(t,n);break;case 13:dr(t,n),a&4&&$w(t,n),a&64&&(t=n.memoizedState,t!==null&&(t=t.dehydrated,t!==null&&(n=$D.bind(null,n),mP(t,n))));break;case 22:if(a=n.memoizedState!==null||pr,!a){e=e!==null&&e.memoizedState!==null||kt,r=pr;var s=kt;pr=a,(kt=e)&&!s?fr(t,n,(n.subtreeFlags&8772)!==0):dr(t,n),pr=r,kt=s}break;case 30:break;default:dr(t,n)}}function Xw(t){var e=t.alternate;e!==null&&(t.alternate=null,Xw(e)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(e=t.stateNode,e!==null&&Yg(e)),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}var ut=null,xn=!1;function cr(t,e,n){for(n=n.child;n!==null;)Qw(t,e,n),n=n.sibling}function Qw(t,e,n){if(Gn&&typeof Gn.onCommitFiberUnmount=="function")try{Gn.onCommitFiberUnmount(Ru,n)}catch{}switch(n.tag){case 26:kt||Da(n,e),cr(t,e,n),n.memoizedState?n.memoizedState.count--:n.stateNode&&(n=n.stateNode,n.parentNode.removeChild(n));break;case 27:kt||Da(n,e);var a=ut,r=xn;Cs(n.type)&&(ut=n.stateNode,xn=!1),cr(t,e,n),pu(n.stateNode),ut=a,xn=r;break;case 5:kt||Da(n,e);case 6:if(a=ut,r=xn,ut=null,cr(t,e,n),ut=a,xn=r,ut!==null)if(xn)try{(ut.nodeType===9?ut.body:ut.nodeName==="HTML"?ut.ownerDocument.body:ut).removeChild(n.stateNode)}catch(s){Fe(n,e,s)}else try{ut.removeChild(n.stateNode)}catch(s){Fe(n,e,s)}break;case 18:ut!==null&&(xn?(t=ut,BE(t.nodeType===9?t.body:t.nodeName==="HTML"?t.ownerDocument.body:t,n.stateNode),bo(t)):BE(ut,n.stateNode));break;case 4:a=ut,r=xn,ut=n.stateNode.containerInfo,xn=!0,cr(t,e,n),ut=a,xn=r;break;case 0:case 11:case 14:case 15:Es(2,n,e),kt||Es(4,n,e),cr(t,e,n);break;case 1:kt||(Da(n,e),a=n.stateNode,typeof a.componentWillUnmount=="function"&&Hw(n,e,a)),cr(t,e,n);break;case 21:cr(t,e,n);break;case 22:kt=(a=kt)||n.memoizedState!==null,cr(t,e,n),kt=a;break;default:cr(t,e,n)}}function Yw(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null))){t=t.dehydrated;try{bo(t)}catch(n){Fe(e,e.return,n)}}}function $w(t,e){if(e.memoizedState===null&&(t=e.alternate,t!==null&&(t=t.memoizedState,t!==null&&(t=t.dehydrated,t!==null))))try{bo(t)}catch(n){Fe(e,e.return,n)}}function HD(t){switch(t.tag){case 31:case 13:case 19:var e=t.stateNode;return e===null&&(e=t.stateNode=new wE),e;case 22:return t=t.stateNode,e=t._retryCache,e===null&&(e=t._retryCache=new wE),e;default:throw Error(V(435,t.tag))}}function Od(t,e){var n=HD(t);e.forEach(function(a){if(!n.has(a)){n.add(a);var r=JD.bind(null,t,a);a.then(r,r)}})}function Ln(t,e){var n=e.deletions;if(n!==null)for(var a=0;a<n.length;a++){var r=n[a],s=t,i=e,l=i;e:for(;l!==null;){switch(l.tag){case 27:if(Cs(l.type)){ut=l.stateNode,xn=!1;break e}break;case 5:ut=l.stateNode,xn=!1;break e;case 3:case 4:ut=l.stateNode.containerInfo,xn=!0;break e}l=l.return}if(ut===null)throw Error(V(160));Qw(s,i,r),ut=null,xn=!1,s=r.alternate,s!==null&&(s.return=null),r.return=null}if(e.subtreeFlags&13886)for(e=e.child;e!==null;)Jw(e,t),e=e.sibling}var ga=null;function Jw(t,e){var n=t.alternate,a=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:Ln(e,t),An(t),a&4&&(Es(3,t,t.return),Vu(3,t),Es(5,t,t.return));break;case 1:Ln(e,t),An(t),a&512&&(kt||n===null||Da(n,n.return)),a&64&&pr&&(t=t.updateQueue,t!==null&&(a=t.callbacks,a!==null&&(n=t.shared.hiddenCallbacks,t.shared.hiddenCallbacks=n===null?a:n.concat(a))));break;case 26:var r=ga;if(Ln(e,t),An(t),a&512&&(kt||n===null||Da(n,n.return)),a&4){var s=n!==null?n.memoizedState:null;if(a=t.memoizedState,n===null)if(a===null)if(t.stateNode===null){e:{a=t.type,n=t.memoizedProps,r=r.ownerDocument||r;t:switch(a){case"title":s=r.getElementsByTagName("title")[0],(!s||s[Pu]||s[sn]||s.namespaceURI==="http://www.w3.org/2000/svg"||s.hasAttribute("itemprop"))&&(s=r.createElement(a),r.head.insertBefore(s,r.querySelector("head > title"))),un(s,a,n),s[sn]=t,Yt(s),a=s;break e;case"link":var i=WE("link","href",r).get(a+(n.href||""));if(i){for(var l=0;l<i.length;l++)if(s=i[l],s.getAttribute("href")===(n.href==null||n.href===""?null:n.href)&&s.getAttribute("rel")===(n.rel==null?null:n.rel)&&s.getAttribute("title")===(n.title==null?null:n.title)&&s.getAttribute("crossorigin")===(n.crossOrigin==null?null:n.crossOrigin)){i.splice(l,1);break t}}s=r.createElement(a),un(s,a,n),r.head.appendChild(s);break;case"meta":if(i=WE("meta","content",r).get(a+(n.content||""))){for(l=0;l<i.length;l++)if(s=i[l],s.getAttribute("content")===(n.content==null?null:""+n.content)&&s.getAttribute("name")===(n.name==null?null:n.name)&&s.getAttribute("property")===(n.property==null?null:n.property)&&s.getAttribute("http-equiv")===(n.httpEquiv==null?null:n.httpEquiv)&&s.getAttribute("charset")===(n.charSet==null?null:n.charSet)){i.splice(l,1);break t}}s=r.createElement(a),un(s,a,n),r.head.appendChild(s);break;default:throw Error(V(468,a))}s[sn]=t,Yt(s),a=s}t.stateNode=a}else XE(r,t.type,t.stateNode);else t.stateNode=KE(r,a,t.memoizedProps);else s!==a?(s===null?n.stateNode!==null&&(n=n.stateNode,n.parentNode.removeChild(n)):s.count--,a===null?XE(r,t.type,t.stateNode):KE(r,a,t.memoizedProps)):a===null&&t.stateNode!==null&&Bm(t,t.memoizedProps,n.memoizedProps)}break;case 27:Ln(e,t),An(t),a&512&&(kt||n===null||Da(n,n.return)),n!==null&&a&4&&Bm(t,t.memoizedProps,n.memoizedProps);break;case 5:if(Ln(e,t),An(t),a&512&&(kt||n===null||Da(n,n.return)),t.flags&32){r=t.stateNode;try{go(r,"")}catch(R){Fe(t,t.return,R)}}a&4&&t.stateNode!=null&&(r=t.memoizedProps,Bm(t,r,n!==null?n.memoizedProps:r)),a&1024&&(zm=!0);break;case 6:if(Ln(e,t),An(t),a&4){if(t.stateNode===null)throw Error(V(162));a=t.memoizedProps,n=t.stateNode;try{n.nodeValue=a}catch(R){Fe(t,t.return,R)}}break;case 3:if(Jd=null,r=ga,ga=Cf(e.containerInfo),Ln(e,t),ga=r,An(t),a&4&&n!==null&&n.memoizedState.isDehydrated)try{bo(e.containerInfo)}catch(R){Fe(t,t.return,R)}zm&&(zm=!1,Zw(t));break;case 4:a=ga,ga=Cf(t.stateNode.containerInfo),Ln(e,t),An(t),ga=a;break;case 12:Ln(e,t),An(t);break;case 31:Ln(e,t),An(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Od(t,a)));break;case 13:Ln(e,t),An(t),t.child.flags&8192&&t.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(zf=Hn()),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Od(t,a)));break;case 22:r=t.memoizedState!==null;var u=n!==null&&n.memoizedState!==null,c=pr,f=kt;if(pr=c||r,kt=f||u,Ln(e,t),kt=f,pr=c,An(t),a&8192)e:for(e=t.stateNode,e._visibility=r?e._visibility&-2:e._visibility|1,r&&(n===null||u||pr||kt||js(t)),n=null,e=t;;){if(e.tag===5||e.tag===26){if(n===null){u=n=e;try{if(s=u.stateNode,r)i=s.style,typeof i.setProperty=="function"?i.setProperty("display","none","important"):i.display="none";else{l=u.stateNode;var p=u.memoizedProps.style,m=p!=null&&p.hasOwnProperty("display")?p.display:null;l.style.display=m==null||typeof m=="boolean"?"":(""+m).trim()}}catch(R){Fe(u,u.return,R)}}}else if(e.tag===6){if(n===null){u=e;try{u.stateNode.nodeValue=r?"":u.memoizedProps}catch(R){Fe(u,u.return,R)}}}else if(e.tag===18){if(n===null){u=e;try{var S=u.stateNode;r?qE(S,!0):qE(u.stateNode,!1)}catch(R){Fe(u,u.return,R)}}}else if((e.tag!==22&&e.tag!==23||e.memoizedState===null||e===t)&&e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;n===e&&(n=null),e=e.return}n===e&&(n=null),e.sibling.return=e.return,e=e.sibling}a&4&&(a=t.updateQueue,a!==null&&(n=a.retryQueue,n!==null&&(a.retryQueue=null,Od(t,n))));break;case 19:Ln(e,t),An(t),a&4&&(a=t.updateQueue,a!==null&&(t.updateQueue=null,Od(t,a)));break;case 30:break;case 21:break;default:Ln(e,t),An(t)}}function An(t){var e=t.flags;if(e&2){try{for(var n,a=t.return;a!==null;){if(jw(a)){n=a;break}a=a.return}if(n==null)throw Error(V(160));switch(n.tag){case 27:var r=n.stateNode,s=qm(t);If(t,s,r);break;case 5:var i=n.stateNode;n.flags&32&&(go(i,""),n.flags&=-33);var l=qm(t);If(t,l,i);break;case 3:case 4:var u=n.stateNode.containerInfo,c=qm(t);xg(t,c,u);break;default:throw Error(V(161))}}catch(f){Fe(t,t.return,f)}t.flags&=-3}e&4096&&(t.flags&=-4097)}function Zw(t){if(t.subtreeFlags&1024)for(t=t.child;t!==null;){var e=t;Zw(e),e.tag===5&&e.flags&1024&&e.stateNode.reset(),t=t.sibling}}function dr(t,e){if(e.subtreeFlags&8772)for(e=e.child;e!==null;)Ww(t,e.alternate,e),e=e.sibling}function js(t){for(t=t.child;t!==null;){var e=t;switch(e.tag){case 0:case 11:case 14:case 15:Es(4,e,e.return),js(e);break;case 1:Da(e,e.return);var n=e.stateNode;typeof n.componentWillUnmount=="function"&&Hw(e,e.return,n),js(e);break;case 27:pu(e.stateNode);case 26:case 5:Da(e,e.return),js(e);break;case 22:e.memoizedState===null&&js(e);break;case 30:js(e);break;default:js(e)}t=t.sibling}}function fr(t,e,n){for(n=n&&(e.subtreeFlags&8772)!==0,e=e.child;e!==null;){var a=e.alternate,r=t,s=e,i=s.flags;switch(s.tag){case 0:case 11:case 15:fr(r,s,n),Vu(4,s);break;case 1:if(fr(r,s,n),a=s,r=a.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(c){Fe(a,a.return,c)}if(a=s,r=a.updateQueue,r!==null){var l=a.stateNode;try{var u=r.shared.hiddenCallbacks;if(u!==null)for(r.shared.hiddenCallbacks=null,r=0;r<u.length;r++)Yb(u[r],l)}catch(c){Fe(a,a.return,c)}}n&&i&64&&zw(s),cu(s,s.return);break;case 27:Kw(s);case 26:case 5:fr(r,s,n),n&&a===null&&i&4&&Gw(s),cu(s,s.return);break;case 12:fr(r,s,n);break;case 31:fr(r,s,n),n&&i&4&&Yw(r,s);break;case 13:fr(r,s,n),n&&i&4&&$w(r,s);break;case 22:s.memoizedState===null&&fr(r,s,n),cu(s,s.return);break;case 30:break;default:fr(r,s,n)}e=e.sibling}}function Ay(t,e){var n=null;t!==null&&t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),t=null,e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(t=e.memoizedState.cachePool.pool),t!==n&&(t!=null&&t.refCount++,n!=null&&Mu(n))}function xy(t,e){t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Mu(t))}function ma(t,e,n,a){if(e.subtreeFlags&10256)for(e=e.child;e!==null;)eC(t,e,n,a),e=e.sibling}function eC(t,e,n,a){var r=e.flags;switch(e.tag){case 0:case 11:case 15:ma(t,e,n,a),r&2048&&Vu(9,e);break;case 1:ma(t,e,n,a);break;case 3:ma(t,e,n,a),r&2048&&(t=null,e.alternate!==null&&(t=e.alternate.memoizedState.cache),e=e.memoizedState.cache,e!==t&&(e.refCount++,t!=null&&Mu(t)));break;case 12:if(r&2048){ma(t,e,n,a),t=e.stateNode;try{var s=e.memoizedProps,i=s.id,l=s.onPostCommit;typeof l=="function"&&l(i,e.alternate===null?"mount":"update",t.passiveEffectDuration,-0)}catch(u){Fe(e,e.return,u)}}else ma(t,e,n,a);break;case 31:ma(t,e,n,a);break;case 13:ma(t,e,n,a);break;case 23:break;case 22:s=e.stateNode,i=e.alternate,e.memoizedState!==null?s._visibility&2?ma(t,e,n,a):du(t,e):s._visibility&2?ma(t,e,n,a):(s._visibility|=2,Ki(t,e,n,a,(e.subtreeFlags&10256)!==0||!1)),r&2048&&Ay(i,e);break;case 24:ma(t,e,n,a),r&2048&&xy(e.alternate,e);break;default:ma(t,e,n,a)}}function Ki(t,e,n,a,r){for(r=r&&((e.subtreeFlags&10256)!==0||!1),e=e.child;e!==null;){var s=t,i=e,l=n,u=a,c=i.flags;switch(i.tag){case 0:case 11:case 15:Ki(s,i,l,u,r),Vu(8,i);break;case 23:break;case 22:var f=i.stateNode;i.memoizedState!==null?f._visibility&2?Ki(s,i,l,u,r):du(s,i):(f._visibility|=2,Ki(s,i,l,u,r)),r&&c&2048&&Ay(i.alternate,i);break;case 24:Ki(s,i,l,u,r),r&&c&2048&&xy(i.alternate,i);break;default:Ki(s,i,l,u,r)}e=e.sibling}}function du(t,e){if(e.subtreeFlags&10256)for(e=e.child;e!==null;){var n=t,a=e,r=a.flags;switch(a.tag){case 22:du(n,a),r&2048&&Ay(a.alternate,a);break;case 24:du(n,a),r&2048&&xy(a.alternate,a);break;default:du(n,a)}e=e.sibling}}var tu=8192;function ji(t,e,n){if(t.subtreeFlags&tu)for(t=t.child;t!==null;)tC(t,e,n),t=t.sibling}function tC(t,e,n){switch(t.tag){case 26:ji(t,e,n),t.flags&tu&&t.memoizedState!==null&&LP(n,ga,t.memoizedState,t.memoizedProps);break;case 5:ji(t,e,n);break;case 3:case 4:var a=ga;ga=Cf(t.stateNode.containerInfo),ji(t,e,n),ga=a;break;case 22:t.memoizedState===null&&(a=t.alternate,a!==null&&a.memoizedState!==null?(a=tu,tu=16777216,ji(t,e,n),tu=a):ji(t,e,n));break;default:ji(t,e,n)}}function nC(t){var e=t.alternate;if(e!==null&&(t=e.child,t!==null)){e.child=null;do e=t.sibling,t.sibling=null,t=e;while(t!==null)}}function Xl(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];Qt=a,rC(a,t)}nC(t)}if(t.subtreeFlags&10256)for(t=t.child;t!==null;)aC(t),t=t.sibling}function aC(t){switch(t.tag){case 0:case 11:case 15:Xl(t),t.flags&2048&&Es(9,t,t.return);break;case 3:Xl(t);break;case 12:Xl(t);break;case 22:var e=t.stateNode;t.memoizedState!==null&&e._visibility&2&&(t.return===null||t.return.tag!==13)?(e._visibility&=-3,Yd(t)):Xl(t);break;default:Xl(t)}}function Yd(t){var e=t.deletions;if(t.flags&16){if(e!==null)for(var n=0;n<e.length;n++){var a=e[n];Qt=a,rC(a,t)}nC(t)}for(t=t.child;t!==null;){switch(e=t,e.tag){case 0:case 11:case 15:Es(8,e,e.return),Yd(e);break;case 22:n=e.stateNode,n._visibility&2&&(n._visibility&=-3,Yd(e));break;default:Yd(e)}t=t.sibling}}function rC(t,e){for(;Qt!==null;){var n=Qt;switch(n.tag){case 0:case 11:case 15:Es(8,n,e);break;case 23:case 22:if(n.memoizedState!==null&&n.memoizedState.cachePool!==null){var a=n.memoizedState.cachePool.pool;a!=null&&a.refCount++}break;case 24:Mu(n.memoizedState.cache)}if(a=n.child,a!==null)a.return=n,Qt=a;else e:for(n=t;Qt!==null;){a=Qt;var r=a.sibling,s=a.return;if(Xw(a),a===n){Qt=null;break e}if(r!==null){r.return=s,Qt=r;break e}Qt=s}}}var GD={getCacheForType:function(t){var e=ln(Dt),n=e.data.get(t);return n===void 0&&(n=t(),e.data.set(t,n)),n},cacheSignal:function(){return ln(Dt).controller.signal}},jD=typeof WeakMap=="function"?WeakMap:Map,Me=0,je=null,Se=null,be=0,Ue=0,Fn=null,us=!1,xo=!1,Ry=!1,wr=0,St=0,bs=0,Ys=0,ky=0,zn=0,So=0,fu=null,Rn=null,Rg=!1,zf=0,sC=0,_f=1/0,Sf=null,gs=null,Ht=0,ys=null,vo=null,Sr=0,kg=0,Dg=null,iC=null,hu=0,Pg=null;function Kn(){return Me&2&&be!==0?be&-be:se.T!==null?Py():mb()}function oC(){if(zn===0)if(!(be&536870912)||we){var t=bd;bd<<=1,!(bd&3932160)&&(bd=262144),zn=t}else zn=536870912;return t=Xn.current,t!==null&&(t.flags|=32),zn}function kn(t,e,n){(t===je&&(Ue===2||Ue===9)||t.cancelPendingCommit!==null)&&(To(t,0),cs(t,be,zn,!1)),Du(t,n),(!(Me&2)||t!==je)&&(t===je&&(!(Me&2)&&(Ys|=n),St===4&&cs(t,be,zn,!1)),Ma(t))}function lC(t,e,n){if(Me&6)throw Error(V(327));var a=!n&&(e&127)===0&&(e&t.expiredLanes)===0||ku(t,e),r=a?XD(t,e):Hm(t,e,!0),s=a;do{if(r===0){xo&&!a&&cs(t,e,0,!1);break}else{if(n=t.current.alternate,s&&!KD(n)){r=Hm(t,e,!1),s=!1;continue}if(r===2){if(s=e,t.errorRecoveryDisabledLanes&s)var i=0;else i=t.pendingLanes&-536870913,i=i!==0?i:i&536870912?536870912:0;if(i!==0){e=i;e:{var l=t;r=fu;var u=l.current.memoizedState.isDehydrated;if(u&&(To(l,i).flags|=256),i=Hm(l,i,!1),i!==2){if(Ry&&!u){l.errorRecoveryDisabledLanes|=s,Ys|=s,r=4;break e}s=Rn,Rn=r,s!==null&&(Rn===null?Rn=s:Rn.push.apply(Rn,s))}r=i}if(s=!1,r!==2)continue}}if(r===1){To(t,0),cs(t,e,0,!0);break}e:{switch(a=t,s=r,s){case 0:case 1:throw Error(V(345));case 4:if((e&4194048)!==e)break;case 6:cs(a,e,zn,!us);break e;case 2:Rn=null;break;case 3:case 5:break;default:throw Error(V(329))}if((e&62914560)===e&&(r=zf+300-Hn(),10<r)){if(cs(a,e,zn,!us),kf(a,0,!0)!==0)break e;Sr=e,a.timeoutHandle=AC(CE.bind(null,a,n,Rn,Sf,Rg,e,zn,Ys,So,us,s,"Throttled",-0,0),r);break e}CE(a,n,Rn,Sf,Rg,e,zn,Ys,So,us,s,null,-0,0)}}break}while(!0);Ma(t)}function CE(t,e,n,a,r,s,i,l,u,c,f,p,m,S){if(t.timeoutHandle=-1,p=e.subtreeFlags,p&8192||(p&16785408)===16785408){p={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:gr},tC(e,s,p);var R=(s&62914560)===s?zf-Hn():(s&4194048)===s?sC-Hn():0;if(R=AP(p,R),R!==null){Sr=s,t.cancelPendingCommit=R(AE.bind(null,t,e,s,n,a,r,i,l,u,f,p,null,m,S)),cs(t,s,i,!c);return}}AE(t,e,s,n,a,r,i,l,u)}function KD(t){for(var e=t;;){var n=e.tag;if((n===0||n===11||n===15)&&e.flags&16384&&(n=e.updateQueue,n!==null&&(n=n.stores,n!==null)))for(var a=0;a<n.length;a++){var r=n[a],s=r.getSnapshot;r=r.value;try{if(!Wn(s(),r))return!1}catch{return!1}}if(n=e.child,e.subtreeFlags&16384&&n!==null)n.return=e,e=n;else{if(e===t)break;for(;e.sibling===null;){if(e.return===null||e.return===t)return!0;e=e.return}e.sibling.return=e.return,e=e.sibling}}return!0}function cs(t,e,n,a){e&=~ky,e&=~Ys,t.suspendedLanes|=e,t.pingedLanes&=~e,a&&(t.warmLanes|=e),a=t.expirationTimes;for(var r=e;0<r;){var s=31-jn(r),i=1<<s;a[s]=-1,r&=~i}n!==0&&fb(t,n,e)}function Hf(){return Me&6?!0:(Uu(0,!1),!1)}function Dy(){if(Se!==null){if(Ue===0)var t=Se.return;else t=Se,yr=ii=null,yy(t),co=null,vu=0,t=Se;for(;t!==null;)qw(t.alternate,t),t=t.return;Se=null}}function To(t,e){var n=t.timeoutHandle;n!==-1&&(t.timeoutHandle=-1,cP(n)),n=t.cancelPendingCommit,n!==null&&(t.cancelPendingCommit=null,n()),Sr=0,Dy(),je=t,Se=n=Ir(t.current,null),be=e,Ue=0,Fn=null,us=!1,xo=ku(t,e),Ry=!1,So=zn=ky=Ys=bs=St=0,Rn=fu=null,Rg=!1,e&8&&(e|=e&32);var a=t.entangledLanes;if(a!==0)for(t=t.entanglements,a&=e;0<a;){var r=31-jn(a),s=1<<r;e|=t[r],a&=~s}return wr=e,Mf(),n}function uC(t,e){fe=null,se.H=Eu,e===Ao||e===Vf?(e=rE(),Ue=3):e===cy?(e=rE(),Ue=4):Ue=e===Cy?8:e!==null&&typeof e=="object"&&typeof e.then=="function"?6:1,Fn=e,Se===null&&(St=1,gf(t,sa(e,t.current)))}function cC(){var t=Xn.current;return t===null?!0:(be&4194048)===be?oa===null:(be&62914560)===be||be&536870912?t===oa:!1}function dC(){var t=se.H;return se.H=Eu,t===null?Eu:t}function fC(){var t=se.A;return se.A=GD,t}function vf(){St=4,us||(be&4194048)!==be&&Xn.current!==null||(xo=!0),!(bs&134217727)&&!(Ys&134217727)||je===null||cs(je,be,zn,!1)}function Hm(t,e,n){var a=Me;Me|=2;var r=dC(),s=fC();(je!==t||be!==e)&&(Sf=null,To(t,e)),e=!1;var i=St;e:do try{if(Ue!==0&&Se!==null){var l=Se,u=Fn;switch(Ue){case 8:Dy(),i=6;break e;case 3:case 2:case 9:case 6:Xn.current===null&&(e=!0);var c=Ue;if(Ue=0,Fn=null,so(t,l,u,c),n&&xo){i=0;break e}break;default:c=Ue,Ue=0,Fn=null,so(t,l,u,c)}}WD(),i=St;break}catch(f){uC(t,f)}while(!0);return e&&t.shellSuspendCounter++,yr=ii=null,Me=a,se.H=r,se.A=s,Se===null&&(je=null,be=0,Mf()),i}function WD(){for(;Se!==null;)hC(Se)}function XD(t,e){var n=Me;Me|=2;var a=dC(),r=fC();je!==t||be!==e?(Sf=null,_f=Hn()+500,To(t,e)):xo=ku(t,e);e:do try{if(Ue!==0&&Se!==null){e=Se;var s=Fn;t:switch(Ue){case 1:Ue=0,Fn=null,so(t,e,s,1);break;case 2:case 9:if(aE(s)){Ue=0,Fn=null,LE(e);break}e=function(){Ue!==2&&Ue!==9||je!==t||(Ue=7),Ma(t)},s.then(e,e);break e;case 3:Ue=7;break e;case 4:Ue=5;break e;case 7:aE(s)?(Ue=0,Fn=null,LE(e)):(Ue=0,Fn=null,so(t,e,s,7));break;case 5:var i=null;switch(Se.tag){case 26:i=Se.memoizedState;case 5:case 27:var l=Se;if(i?PC(i):l.stateNode.complete){Ue=0,Fn=null;var u=l.sibling;if(u!==null)Se=u;else{var c=l.return;c!==null?(Se=c,Gf(c)):Se=null}break t}}Ue=0,Fn=null,so(t,e,s,5);break;case 6:Ue=0,Fn=null,so(t,e,s,6);break;case 8:Dy(),St=6;break e;default:throw Error(V(462))}}QD();break}catch(f){uC(t,f)}while(!0);return yr=ii=null,se.H=a,se.A=r,Me=n,Se!==null?0:(je=null,be=0,Mf(),St)}function QD(){for(;Se!==null&&!Ik();)hC(Se)}function hC(t){var e=Bw(t.alternate,t,wr);t.memoizedProps=t.pendingProps,e===null?Gf(t):Se=e}function LE(t){var e=t,n=e.alternate;switch(e.tag){case 15:case 0:e=SE(n,e,e.pendingProps,e.type,void 0,be);break;case 11:e=SE(n,e,e.pendingProps,e.type.render,e.ref,be);break;case 5:yy(e);default:qw(n,e),e=Se=qb(e,wr),e=Bw(n,e,wr)}t.memoizedProps=t.pendingProps,e===null?Gf(t):Se=e}function so(t,e,n,a){yr=ii=null,yy(e),co=null,vu=0;var r=e.return;try{if(VD(t,r,e,n,be)){St=1,gf(t,sa(n,t.current)),Se=null;return}}catch(s){if(r!==null)throw Se=r,s;St=1,gf(t,sa(n,t.current)),Se=null;return}e.flags&32768?(we||a===1?t=!0:xo||be&536870912?t=!1:(us=t=!0,(a===2||a===9||a===3||a===6)&&(a=Xn.current,a!==null&&a.tag===13&&(a.flags|=16384))),pC(e,t)):Gf(e)}function Gf(t){var e=t;do{if(e.flags&32768){pC(e,us);return}t=e.return;var n=BD(e.alternate,e,wr);if(n!==null){Se=n;return}if(e=e.sibling,e!==null){Se=e;return}Se=e=t}while(e!==null);St===0&&(St=5)}function pC(t,e){do{var n=qD(t.alternate,t);if(n!==null){n.flags&=32767,Se=n;return}if(n=t.return,n!==null&&(n.flags|=32768,n.subtreeFlags=0,n.deletions=null),!e&&(t=t.sibling,t!==null)){Se=t;return}Se=t=n}while(t!==null);St=6,Se=null}function AE(t,e,n,a,r,s,i,l,u){t.cancelPendingCommit=null;do jf();while(Ht!==0);if(Me&6)throw Error(V(327));if(e!==null){if(e===t.current)throw Error(V(177));if(s=e.lanes|e.childLanes,s|=ay,Ak(t,n,s,i,l,u),t===je&&(Se=je=null,be=0),vo=e,ys=t,Sr=n,kg=s,Dg=r,iC=a,e.subtreeFlags&10256||e.flags&10256?(t.callbackNode=null,t.callbackPriority=0,ZD(rf,function(){return _C(),null})):(t.callbackNode=null,t.callbackPriority=0),a=(e.flags&13878)!==0,e.subtreeFlags&13878||a){a=se.T,se.T=null,r=Ne.p,Ne.p=2,i=Me,Me|=4;try{zD(t,e,n)}finally{Me=i,Ne.p=r,se.T=a}}Ht=1,mC(),gC(),yC()}}function mC(){if(Ht===1){Ht=0;var t=ys,e=vo,n=(e.flags&13878)!==0;if(e.subtreeFlags&13878||n){n=se.T,se.T=null;var a=Ne.p;Ne.p=2;var r=Me;Me|=4;try{Jw(e,t);var s=Vg,i=Pb(t.containerInfo),l=s.focusedElem,u=s.selectionRange;if(i!==l&&l&&l.ownerDocument&&Db(l.ownerDocument.documentElement,l)){if(u!==null&&ny(l)){var c=u.start,f=u.end;if(f===void 0&&(f=c),"selectionStart"in l)l.selectionStart=c,l.selectionEnd=Math.min(f,l.value.length);else{var p=l.ownerDocument||document,m=p&&p.defaultView||window;if(m.getSelection){var S=m.getSelection(),R=l.textContent.length,D=Math.min(u.start,R),L=u.end===void 0?D:Math.min(u.end,R);!S.extend&&D>L&&(i=L,L=D,D=i);var E=YT(l,D),v=YT(l,L);if(E&&v&&(S.rangeCount!==1||S.anchorNode!==E.node||S.anchorOffset!==E.offset||S.focusNode!==v.node||S.focusOffset!==v.offset)){var C=p.createRange();C.setStart(E.node,E.offset),S.removeAllRanges(),D>L?(S.addRange(C),S.extend(v.node,v.offset)):(C.setEnd(v.node,v.offset),S.addRange(C))}}}}for(p=[],S=l;S=S.parentNode;)S.nodeType===1&&p.push({element:S,left:S.scrollLeft,top:S.scrollTop});for(typeof l.focus=="function"&&l.focus(),l=0;l<p.length;l++){var x=p[l];x.element.scrollLeft=x.left,x.element.scrollTop=x.top}}xf=!!Ng,Vg=Ng=null}finally{Me=r,Ne.p=a,se.T=n}}t.current=e,Ht=2}}function gC(){if(Ht===2){Ht=0;var t=ys,e=vo,n=(e.flags&8772)!==0;if(e.subtreeFlags&8772||n){n=se.T,se.T=null;var a=Ne.p;Ne.p=2;var r=Me;Me|=4;try{Ww(t,e.alternate,e)}finally{Me=r,Ne.p=a,se.T=n}}Ht=3}}function yC(){if(Ht===4||Ht===3){Ht=0,_k();var t=ys,e=vo,n=Sr,a=iC;e.subtreeFlags&10256||e.flags&10256?Ht=5:(Ht=0,vo=ys=null,IC(t,t.pendingLanes));var r=t.pendingLanes;if(r===0&&(gs=null),Qg(n),e=e.stateNode,Gn&&typeof Gn.onCommitFiberRoot=="function")try{Gn.onCommitFiberRoot(Ru,e,void 0,(e.current.flags&128)===128)}catch{}if(a!==null){e=se.T,r=Ne.p,Ne.p=2,se.T=null;try{for(var s=t.onRecoverableError,i=0;i<a.length;i++){var l=a[i];s(l.value,{componentStack:l.stack})}}finally{se.T=e,Ne.p=r}}Sr&3&&jf(),Ma(t),r=t.pendingLanes,n&261930&&r&42?t===Pg?hu++:(hu=0,Pg=t):hu=0,Uu(0,!1)}}function IC(t,e){(t.pooledCacheLanes&=e)===0&&(e=t.pooledCache,e!=null&&(t.pooledCache=null,Mu(e)))}function jf(){return mC(),gC(),yC(),_C()}function _C(){if(Ht!==5)return!1;var t=ys,e=kg;kg=0;var n=Qg(Sr),a=se.T,r=Ne.p;try{Ne.p=32>n?32:n,se.T=null,n=Dg,Dg=null;var s=ys,i=Sr;if(Ht=0,vo=ys=null,Sr=0,Me&6)throw Error(V(331));var l=Me;if(Me|=4,aC(s.current),eC(s,s.current,i,n),Me=l,Uu(0,!1),Gn&&typeof Gn.onPostCommitFiberRoot=="function")try{Gn.onPostCommitFiberRoot(Ru,s)}catch{}return!0}finally{Ne.p=r,se.T=a,IC(t,e)}}function xE(t,e,n){e=sa(n,e),e=Cg(t.stateNode,e,2),t=ms(t,e,2),t!==null&&(Du(t,2),Ma(t))}function Fe(t,e,n){if(t.tag===3)xE(t,t,n);else for(;e!==null;){if(e.tag===3){xE(e,t,n);break}else if(e.tag===1){var a=e.stateNode;if(typeof e.type.getDerivedStateFromError=="function"||typeof a.componentDidCatch=="function"&&(gs===null||!gs.has(a))){t=sa(n,t),n=Ow(2),a=ms(e,n,2),a!==null&&(Mw(n,a,e,t),Du(a,2),Ma(a));break}}e=e.return}}function Gm(t,e,n){var a=t.pingCache;if(a===null){a=t.pingCache=new jD;var r=new Set;a.set(e,r)}else r=a.get(e),r===void 0&&(r=new Set,a.set(e,r));r.has(n)||(Ry=!0,r.add(n),t=YD.bind(null,t,e,n),e.then(t,t))}function YD(t,e,n){var a=t.pingCache;a!==null&&a.delete(e),t.pingedLanes|=t.suspendedLanes&n,t.warmLanes&=~n,je===t&&(be&n)===n&&(St===4||St===3&&(be&62914560)===be&&300>Hn()-zf?!(Me&2)&&To(t,0):ky|=n,So===be&&(So=0)),Ma(t)}function SC(t,e){e===0&&(e=db()),t=si(t,e),t!==null&&(Du(t,e),Ma(t))}function $D(t){var e=t.memoizedState,n=0;e!==null&&(n=e.retryLane),SC(t,n)}function JD(t,e){var n=0;switch(t.tag){case 31:case 13:var a=t.stateNode,r=t.memoizedState;r!==null&&(n=r.retryLane);break;case 19:a=t.stateNode;break;case 22:a=t.stateNode._retryCache;break;default:throw Error(V(314))}a!==null&&a.delete(e),SC(t,n)}function ZD(t,e){return Wg(t,e)}var Tf=null,Wi=null,Og=!1,Ef=!1,jm=!1,ds=0;function Ma(t){t!==Wi&&t.next===null&&(Wi===null?Tf=Wi=t:Wi=Wi.next=t),Ef=!0,Og||(Og=!0,tP())}function Uu(t,e){if(!jm&&Ef){jm=!0;do for(var n=!1,a=Tf;a!==null;){if(!e)if(t!==0){var r=a.pendingLanes;if(r===0)var s=0;else{var i=a.suspendedLanes,l=a.pingedLanes;s=(1<<31-jn(42|t)+1)-1,s&=r&~(i&~l),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(n=!0,RE(a,s))}else s=be,s=kf(a,a===je?s:0,a.cancelPendingCommit!==null||a.timeoutHandle!==-1),!(s&3)||ku(a,s)||(n=!0,RE(a,s));a=a.next}while(n);jm=!1}}function eP(){vC()}function vC(){Ef=Og=!1;var t=0;ds!==0&&uP()&&(t=ds);for(var e=Hn(),n=null,a=Tf;a!==null;){var r=a.next,s=TC(a,e);s===0?(a.next=null,n===null?Tf=r:n.next=r,r===null&&(Wi=n)):(n=a,(t!==0||s&3)&&(Ef=!0)),a=r}Ht!==0&&Ht!==5||Uu(t,!1),ds!==0&&(ds=0)}function TC(t,e){for(var n=t.suspendedLanes,a=t.pingedLanes,r=t.expirationTimes,s=t.pendingLanes&-62914561;0<s;){var i=31-jn(s),l=1<<i,u=r[i];u===-1?(!(l&n)||l&a)&&(r[i]=Lk(l,e)):u<=e&&(t.expiredLanes|=l),s&=~l}if(e=je,n=be,n=kf(t,t===e?n:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a=t.callbackNode,n===0||t===e&&(Ue===2||Ue===9)||t.cancelPendingCommit!==null)return a!==null&&a!==null&&Sm(a),t.callbackNode=null,t.callbackPriority=0;if(!(n&3)||ku(t,n)){if(e=n&-n,e===t.callbackPriority)return e;switch(a!==null&&Sm(a),Qg(n)){case 2:case 8:n=ub;break;case 32:n=rf;break;case 268435456:n=cb;break;default:n=rf}return a=EC.bind(null,t),n=Wg(n,a),t.callbackPriority=e,t.callbackNode=n,e}return a!==null&&a!==null&&Sm(a),t.callbackPriority=2,t.callbackNode=null,2}function EC(t,e){if(Ht!==0&&Ht!==5)return t.callbackNode=null,t.callbackPriority=0,null;var n=t.callbackNode;if(jf()&&t.callbackNode!==n)return null;var a=be;return a=kf(t,t===je?a:0,t.cancelPendingCommit!==null||t.timeoutHandle!==-1),a===0?null:(lC(t,a,e),TC(t,Hn()),t.callbackNode!=null&&t.callbackNode===n?EC.bind(null,t):null)}function RE(t,e){if(jf())return null;lC(t,e,!0)}function tP(){dP(function(){Me&6?Wg(lb,eP):vC()})}function Py(){if(ds===0){var t=yo;t===0&&(t=Ed,Ed<<=1,!(Ed&261888)&&(Ed=256)),ds=t}return ds}function kE(t){return t==null||typeof t=="symbol"||typeof t=="boolean"?null:typeof t=="function"?t:qd(""+t)}function DE(t,e){var n=e.ownerDocument.createElement("input");return n.name=e.name,n.value=e.value,t.id&&n.setAttribute("form",t.id),e.parentNode.insertBefore(n,e),t=new FormData(t),n.parentNode.removeChild(n),t}function nP(t,e,n,a,r){if(e==="submit"&&n&&n.stateNode===r){var s=kE((r[Dn]||null).action),i=a.submitter;i&&(e=(e=i[Dn]||null)?kE(e.formAction):i.getAttribute("formAction"),e!==null&&(s=e,i=null));var l=new Df("action","action",null,a,r);t.push({event:l,listeners:[{instance:null,listener:function(){if(a.defaultPrevented){if(ds!==0){var u=i?DE(r,i):new FormData(r);bg(n,{pending:!0,data:u,method:r.method,action:s},null,u)}}else typeof s=="function"&&(l.preventDefault(),u=i?DE(r,i):new FormData(r),bg(n,{pending:!0,data:u,method:r.method,action:s},s,u))},currentTarget:r}]})}}for(Md=0;Md<fg.length;Md++)Nd=fg[Md],PE=Nd.toLowerCase(),OE=Nd[0].toUpperCase()+Nd.slice(1),ya(PE,"on"+OE);var Nd,PE,OE,Md;ya(Mb,"onAnimationEnd");ya(Nb,"onAnimationIteration");ya(Vb,"onAnimationStart");ya("dblclick","onDoubleClick");ya("focusin","onFocus");ya("focusout","onBlur");ya(SD,"onTransitionRun");ya(vD,"onTransitionStart");ya(TD,"onTransitionCancel");ya(Ub,"onTransitionEnd");mo("onMouseEnter",["mouseout","mouseover"]);mo("onMouseLeave",["mouseout","mouseover"]);mo("onPointerEnter",["pointerout","pointerover"]);mo("onPointerLeave",["pointerout","pointerover"]);ni("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ni("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ni("onBeforeInput",["compositionend","keypress","textInput","paste"]);ni("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ni("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ni("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var bu="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),aP=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(bu));function bC(t,e){e=(e&4)!==0;for(var n=0;n<t.length;n++){var a=t[n],r=a.event;a=a.listeners;e:{var s=void 0;if(e)for(var i=a.length-1;0<=i;i--){var l=a[i],u=l.instance,c=l.currentTarget;if(l=l.listener,u!==s&&r.isPropagationStopped())break e;s=l,r.currentTarget=c;try{s(r)}catch(f){of(f)}r.currentTarget=null,s=u}else for(i=0;i<a.length;i++){if(l=a[i],u=l.instance,c=l.currentTarget,l=l.listener,u!==s&&r.isPropagationStopped())break e;s=l,r.currentTarget=c;try{s(r)}catch(f){of(f)}r.currentTarget=null,s=u}}}}function _e(t,e){var n=e[rg];n===void 0&&(n=e[rg]=new Set);var a=t+"__bubble";n.has(a)||(wC(e,t,2,!1),n.add(a))}function Km(t,e,n){var a=0;e&&(a|=4),wC(n,t,a,e)}var Vd="_reactListening"+Math.random().toString(36).slice(2);function Oy(t){if(!t[Vd]){t[Vd]=!0,gb.forEach(function(n){n!=="selectionchange"&&(aP.has(n)||Km(n,!1,t),Km(n,!0,t))});var e=t.nodeType===9?t:t.ownerDocument;e===null||e[Vd]||(e[Vd]=!0,Km("selectionchange",!1,e))}}function wC(t,e,n,a){switch(UC(e)){case 2:var r=kP;break;case 8:r=DP;break;default:r=Uy}n=r.bind(null,e,n,t),r=void 0,!ug||e!=="touchstart"&&e!=="touchmove"&&e!=="wheel"||(r=!0),a?r!==void 0?t.addEventListener(e,n,{capture:!0,passive:r}):t.addEventListener(e,n,!0):r!==void 0?t.addEventListener(e,n,{passive:r}):t.addEventListener(e,n,!1)}function Wm(t,e,n,a,r){var s=a;if(!(e&1)&&!(e&2)&&a!==null)e:for(;;){if(a===null)return;var i=a.tag;if(i===3||i===4){var l=a.stateNode.containerInfo;if(l===r)break;if(i===4)for(i=a.return;i!==null;){var u=i.tag;if((u===3||u===4)&&i.stateNode.containerInfo===r)return;i=i.return}for(;l!==null;){if(i=Yi(l),i===null)return;if(u=i.tag,u===5||u===6||u===26||u===27){a=s=i;continue e}l=l.parentNode}}a=a.return}bb(function(){var c=s,f=Jg(n),p=[];e:{var m=Fb.get(t);if(m!==void 0){var S=Df,R=t;switch(t){case"keypress":if(Hd(n)===0)break e;case"keydown":case"keyup":S=Jk;break;case"focusin":R="focus",S=wm;break;case"focusout":R="blur",S=wm;break;case"beforeblur":case"afterblur":S=wm;break;case"click":if(n.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":S=qT;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":S=Bk;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":S=tD;break;case Mb:case Nb:case Vb:S=Hk;break;case Ub:S=aD;break;case"scroll":case"scrollend":S=Uk;break;case"wheel":S=sD;break;case"copy":case"cut":case"paste":S=jk;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":S=HT;break;case"toggle":case"beforetoggle":S=oD}var D=(e&4)!==0,L=!D&&(t==="scroll"||t==="scrollend"),E=D?m!==null?m+"Capture":null:m;D=[];for(var v=c,C;v!==null;){var x=v;if(C=x.stateNode,x=x.tag,x!==5&&x!==26&&x!==27||C===null||E===null||(x=gu(v,E),x!=null&&D.push(wu(v,x,C))),L)break;v=v.return}0<D.length&&(m=new S(m,R,null,n,f),p.push({event:m,listeners:D}))}}if(!(e&7)){e:{if(m=t==="mouseover"||t==="pointerover",S=t==="mouseout"||t==="pointerout",m&&n!==lg&&(R=n.relatedTarget||n.fromElement)&&(Yi(R)||R[wo]))break e;if((S||m)&&(m=f.window===f?f:(m=f.ownerDocument)?m.defaultView||m.parentWindow:window,S?(R=n.relatedTarget||n.toElement,S=c,R=R?Yi(R):null,R!==null&&(L=xu(R),D=R.tag,R!==L||D!==5&&D!==27&&D!==6)&&(R=null)):(S=null,R=c),S!==R)){if(D=qT,x="onMouseLeave",E="onMouseEnter",v="mouse",(t==="pointerout"||t==="pointerover")&&(D=HT,x="onPointerLeave",E="onPointerEnter",v="pointer"),L=S==null?m:Zl(S),C=R==null?m:Zl(R),m=new D(x,v+"leave",S,n,f),m.target=L,m.relatedTarget=C,x=null,Yi(f)===c&&(D=new D(E,v+"enter",R,n,f),D.target=C,D.relatedTarget=L,x=D),L=x,S&&R)t:{for(D=rP,E=S,v=R,C=0,x=E;x;x=D(x))C++;x=0;for(var H=v;H;H=D(H))x++;for(;0<C-x;)E=D(E),C--;for(;0<x-C;)v=D(v),x--;for(;C--;){if(E===v||v!==null&&E===v.alternate){D=E;break t}E=D(E),v=D(v)}D=null}else D=null;S!==null&&ME(p,m,S,D,!1),R!==null&&L!==null&&ME(p,L,R,D,!0)}}e:{if(m=c?Zl(c):window,S=m.nodeName&&m.nodeName.toLowerCase(),S==="select"||S==="input"&&m.type==="file")var G=WT;else if(KT(m))if(Rb)G=yD;else{G=mD;var _=pD}else S=m.nodeName,!S||S.toLowerCase()!=="input"||m.type!=="checkbox"&&m.type!=="radio"?c&&$g(c.elementType)&&(G=WT):G=gD;if(G&&(G=G(t,c))){xb(p,G,n,f);break e}_&&_(t,m,c),t==="focusout"&&c&&m.type==="number"&&c.memoizedProps.value!=null&&og(m,"number",m.value)}switch(_=c?Zl(c):window,t){case"focusin":(KT(_)||_.contentEditable==="true")&&(Zi=_,cg=c,ru=null);break;case"focusout":ru=cg=Zi=null;break;case"mousedown":dg=!0;break;case"contextmenu":case"mouseup":case"dragend":dg=!1,$T(p,n,f);break;case"selectionchange":if(_D)break;case"keydown":case"keyup":$T(p,n,f)}var y;if(ty)e:{switch(t){case"compositionstart":var I="onCompositionStart";break e;case"compositionend":I="onCompositionEnd";break e;case"compositionupdate":I="onCompositionUpdate";break e}I=void 0}else Ji?Lb(t,n)&&(I="onCompositionEnd"):t==="keydown"&&n.keyCode===229&&(I="onCompositionStart");I&&(Cb&&n.locale!=="ko"&&(Ji||I!=="onCompositionStart"?I==="onCompositionEnd"&&Ji&&(y=wb()):(ls=f,Zg="value"in ls?ls.value:ls.textContent,Ji=!0)),_=bf(c,I),0<_.length&&(I=new zT(I,t,null,n,f),p.push({event:I,listeners:_}),y?I.data=y:(y=Ab(n),y!==null&&(I.data=y)))),(y=uD?cD(t,n):dD(t,n))&&(I=bf(c,"onBeforeInput"),0<I.length&&(_=new zT("onBeforeInput","beforeinput",null,n,f),p.push({event:_,listeners:I}),_.data=y)),nP(p,t,c,n,f)}bC(p,e)})}function wu(t,e,n){return{instance:t,listener:e,currentTarget:n}}function bf(t,e){for(var n=e+"Capture",a=[];t!==null;){var r=t,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=gu(t,n),r!=null&&a.unshift(wu(t,r,s)),r=gu(t,e),r!=null&&a.push(wu(t,r,s))),t.tag===3)return a;t=t.return}return[]}function rP(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5&&t.tag!==27);return t||null}function ME(t,e,n,a,r){for(var s=e._reactName,i=[];n!==null&&n!==a;){var l=n,u=l.alternate,c=l.stateNode;if(l=l.tag,u!==null&&u===a)break;l!==5&&l!==26&&l!==27||c===null||(u=c,r?(c=gu(n,s),c!=null&&i.unshift(wu(n,c,u))):r||(c=gu(n,s),c!=null&&i.push(wu(n,c,u)))),n=n.return}i.length!==0&&t.push({event:e,listeners:i})}var sP=/\r\n?/g,iP=/\u0000|\uFFFD/g;function NE(t){return(typeof t=="string"?t:""+t).replace(sP,`
`).replace(iP,"")}function CC(t,e){return e=NE(e),NE(t)===e}function qe(t,e,n,a,r,s){switch(n){case"children":typeof a=="string"?e==="body"||e==="textarea"&&a===""||go(t,a):(typeof a=="number"||typeof a=="bigint")&&e!=="body"&&go(t,""+a);break;case"className":Cd(t,"class",a);break;case"tabIndex":Cd(t,"tabindex",a);break;case"dir":case"role":case"viewBox":case"width":case"height":Cd(t,n,a);break;case"style":Eb(t,a,s);break;case"data":if(e!=="object"){Cd(t,"data",a);break}case"src":case"href":if(a===""&&(e!=="a"||n!=="href")){t.removeAttribute(n);break}if(a==null||typeof a=="function"||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=qd(""+a),t.setAttribute(n,a);break;case"action":case"formAction":if(typeof a=="function"){t.setAttribute(n,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(n==="formAction"?(e!=="input"&&qe(t,e,"name",r.name,r,null),qe(t,e,"formEncType",r.formEncType,r,null),qe(t,e,"formMethod",r.formMethod,r,null),qe(t,e,"formTarget",r.formTarget,r,null)):(qe(t,e,"encType",r.encType,r,null),qe(t,e,"method",r.method,r,null),qe(t,e,"target",r.target,r,null)));if(a==null||typeof a=="symbol"||typeof a=="boolean"){t.removeAttribute(n);break}a=qd(""+a),t.setAttribute(n,a);break;case"onClick":a!=null&&(t.onclick=gr);break;case"onScroll":a!=null&&_e("scroll",t);break;case"onScrollEnd":a!=null&&_e("scrollend",t);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(V(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(V(60));t.innerHTML=n}}break;case"multiple":t.multiple=a&&typeof a!="function"&&typeof a!="symbol";break;case"muted":t.muted=a&&typeof a!="function"&&typeof a!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(a==null||typeof a=="function"||typeof a=="boolean"||typeof a=="symbol"){t.removeAttribute("xlink:href");break}n=qd(""+a),t.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",n);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""+a):t.removeAttribute(n);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":a&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,""):t.removeAttribute(n);break;case"capture":case"download":a===!0?t.setAttribute(n,""):a!==!1&&a!=null&&typeof a!="function"&&typeof a!="symbol"?t.setAttribute(n,a):t.removeAttribute(n);break;case"cols":case"rows":case"size":case"span":a!=null&&typeof a!="function"&&typeof a!="symbol"&&!isNaN(a)&&1<=a?t.setAttribute(n,a):t.removeAttribute(n);break;case"rowSpan":case"start":a==null||typeof a=="function"||typeof a=="symbol"||isNaN(a)?t.removeAttribute(n):t.setAttribute(n,a);break;case"popover":_e("beforetoggle",t),_e("toggle",t),Bd(t,"popover",a);break;case"xlinkActuate":lr(t,"http://www.w3.org/1999/xlink","xlink:actuate",a);break;case"xlinkArcrole":lr(t,"http://www.w3.org/1999/xlink","xlink:arcrole",a);break;case"xlinkRole":lr(t,"http://www.w3.org/1999/xlink","xlink:role",a);break;case"xlinkShow":lr(t,"http://www.w3.org/1999/xlink","xlink:show",a);break;case"xlinkTitle":lr(t,"http://www.w3.org/1999/xlink","xlink:title",a);break;case"xlinkType":lr(t,"http://www.w3.org/1999/xlink","xlink:type",a);break;case"xmlBase":lr(t,"http://www.w3.org/XML/1998/namespace","xml:base",a);break;case"xmlLang":lr(t,"http://www.w3.org/XML/1998/namespace","xml:lang",a);break;case"xmlSpace":lr(t,"http://www.w3.org/XML/1998/namespace","xml:space",a);break;case"is":Bd(t,"is",a);break;case"innerText":case"textContent":break;default:(!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(n=Nk.get(n)||n,Bd(t,n,a))}}function Mg(t,e,n,a,r,s){switch(n){case"style":Eb(t,a,s);break;case"dangerouslySetInnerHTML":if(a!=null){if(typeof a!="object"||!("__html"in a))throw Error(V(61));if(n=a.__html,n!=null){if(r.children!=null)throw Error(V(60));t.innerHTML=n}}break;case"children":typeof a=="string"?go(t,a):(typeof a=="number"||typeof a=="bigint")&&go(t,""+a);break;case"onScroll":a!=null&&_e("scroll",t);break;case"onScrollEnd":a!=null&&_e("scrollend",t);break;case"onClick":a!=null&&(t.onclick=gr);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!yb.hasOwnProperty(n))e:{if(n[0]==="o"&&n[1]==="n"&&(r=n.endsWith("Capture"),e=n.slice(2,r?n.length-7:void 0),s=t[Dn]||null,s=s!=null?s[n]:null,typeof s=="function"&&t.removeEventListener(e,s,r),typeof a=="function")){typeof s!="function"&&s!==null&&(n in t?t[n]=null:t.hasAttribute(n)&&t.removeAttribute(n)),t.addEventListener(e,a,r);break e}n in t?t[n]=a:a===!0?t.setAttribute(n,""):Bd(t,n,a)}}}function un(t,e,n){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":_e("error",t),_e("load",t);var a=!1,r=!1,s;for(s in n)if(n.hasOwnProperty(s)){var i=n[s];if(i!=null)switch(s){case"src":a=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(V(137,e));default:qe(t,e,s,i,n,null)}}r&&qe(t,e,"srcSet",n.srcSet,n,null),a&&qe(t,e,"src",n.src,n,null);return;case"input":_e("invalid",t);var l=s=i=r=null,u=null,c=null;for(a in n)if(n.hasOwnProperty(a)){var f=n[a];if(f!=null)switch(a){case"name":r=f;break;case"type":i=f;break;case"checked":u=f;break;case"defaultChecked":c=f;break;case"value":s=f;break;case"defaultValue":l=f;break;case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(V(137,e));break;default:qe(t,e,a,f,n,null)}}Sb(t,s,l,u,c,i,r,!1);return;case"select":_e("invalid",t),a=i=s=null;for(r in n)if(n.hasOwnProperty(r)&&(l=n[r],l!=null))switch(r){case"value":s=l;break;case"defaultValue":i=l;break;case"multiple":a=l;default:qe(t,e,r,l,n,null)}e=s,n=i,t.multiple=!!a,e!=null?oo(t,!!a,e,!1):n!=null&&oo(t,!!a,n,!0);return;case"textarea":_e("invalid",t),s=r=a=null;for(i in n)if(n.hasOwnProperty(i)&&(l=n[i],l!=null))switch(i){case"value":a=l;break;case"defaultValue":r=l;break;case"children":s=l;break;case"dangerouslySetInnerHTML":if(l!=null)throw Error(V(91));break;default:qe(t,e,i,l,n,null)}Tb(t,a,r,s);return;case"option":for(u in n)if(n.hasOwnProperty(u)&&(a=n[u],a!=null))switch(u){case"selected":t.selected=a&&typeof a!="function"&&typeof a!="symbol";break;default:qe(t,e,u,a,n,null)}return;case"dialog":_e("beforetoggle",t),_e("toggle",t),_e("cancel",t),_e("close",t);break;case"iframe":case"object":_e("load",t);break;case"video":case"audio":for(a=0;a<bu.length;a++)_e(bu[a],t);break;case"image":_e("error",t),_e("load",t);break;case"details":_e("toggle",t);break;case"embed":case"source":case"link":_e("error",t),_e("load",t);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(c in n)if(n.hasOwnProperty(c)&&(a=n[c],a!=null))switch(c){case"children":case"dangerouslySetInnerHTML":throw Error(V(137,e));default:qe(t,e,c,a,n,null)}return;default:if($g(e)){for(f in n)n.hasOwnProperty(f)&&(a=n[f],a!==void 0&&Mg(t,e,f,a,n,void 0));return}}for(l in n)n.hasOwnProperty(l)&&(a=n[l],a!=null&&qe(t,e,l,a,n,null))}function oP(t,e,n,a){switch(e){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,i=null,l=null,u=null,c=null,f=null;for(S in n){var p=n[S];if(n.hasOwnProperty(S)&&p!=null)switch(S){case"checked":break;case"value":break;case"defaultValue":u=p;default:a.hasOwnProperty(S)||qe(t,e,S,null,a,p)}}for(var m in a){var S=a[m];if(p=n[m],a.hasOwnProperty(m)&&(S!=null||p!=null))switch(m){case"type":s=S;break;case"name":r=S;break;case"checked":c=S;break;case"defaultChecked":f=S;break;case"value":i=S;break;case"defaultValue":l=S;break;case"children":case"dangerouslySetInnerHTML":if(S!=null)throw Error(V(137,e));break;default:S!==p&&qe(t,e,m,S,a,p)}}ig(t,i,l,u,c,f,s,r);return;case"select":S=i=l=m=null;for(s in n)if(u=n[s],n.hasOwnProperty(s)&&u!=null)switch(s){case"value":break;case"multiple":S=u;default:a.hasOwnProperty(s)||qe(t,e,s,null,a,u)}for(r in a)if(s=a[r],u=n[r],a.hasOwnProperty(r)&&(s!=null||u!=null))switch(r){case"value":m=s;break;case"defaultValue":l=s;break;case"multiple":i=s;default:s!==u&&qe(t,e,r,s,a,u)}e=l,n=i,a=S,m!=null?oo(t,!!n,m,!1):!!a!=!!n&&(e!=null?oo(t,!!n,e,!0):oo(t,!!n,n?[]:"",!1));return;case"textarea":S=m=null;for(l in n)if(r=n[l],n.hasOwnProperty(l)&&r!=null&&!a.hasOwnProperty(l))switch(l){case"value":break;case"children":break;default:qe(t,e,l,null,a,r)}for(i in a)if(r=a[i],s=n[i],a.hasOwnProperty(i)&&(r!=null||s!=null))switch(i){case"value":m=r;break;case"defaultValue":S=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(V(91));break;default:r!==s&&qe(t,e,i,r,a,s)}vb(t,m,S);return;case"option":for(var R in n)if(m=n[R],n.hasOwnProperty(R)&&m!=null&&!a.hasOwnProperty(R))switch(R){case"selected":t.selected=!1;break;default:qe(t,e,R,null,a,m)}for(u in a)if(m=a[u],S=n[u],a.hasOwnProperty(u)&&m!==S&&(m!=null||S!=null))switch(u){case"selected":t.selected=m&&typeof m!="function"&&typeof m!="symbol";break;default:qe(t,e,u,m,a,S)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var D in n)m=n[D],n.hasOwnProperty(D)&&m!=null&&!a.hasOwnProperty(D)&&qe(t,e,D,null,a,m);for(c in a)if(m=a[c],S=n[c],a.hasOwnProperty(c)&&m!==S&&(m!=null||S!=null))switch(c){case"children":case"dangerouslySetInnerHTML":if(m!=null)throw Error(V(137,e));break;default:qe(t,e,c,m,a,S)}return;default:if($g(e)){for(var L in n)m=n[L],n.hasOwnProperty(L)&&m!==void 0&&!a.hasOwnProperty(L)&&Mg(t,e,L,void 0,a,m);for(f in a)m=a[f],S=n[f],!a.hasOwnProperty(f)||m===S||m===void 0&&S===void 0||Mg(t,e,f,m,a,S);return}}for(var E in n)m=n[E],n.hasOwnProperty(E)&&m!=null&&!a.hasOwnProperty(E)&&qe(t,e,E,null,a,m);for(p in a)m=a[p],S=n[p],!a.hasOwnProperty(p)||m===S||m==null&&S==null||qe(t,e,p,m,a,S)}function VE(t){switch(t){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function lP(){if(typeof performance.getEntriesByType=="function"){for(var t=0,e=0,n=performance.getEntriesByType("resource"),a=0;a<n.length;a++){var r=n[a],s=r.transferSize,i=r.initiatorType,l=r.duration;if(s&&l&&VE(i)){for(i=0,l=r.responseEnd,a+=1;a<n.length;a++){var u=n[a],c=u.startTime;if(c>l)break;var f=u.transferSize,p=u.initiatorType;f&&VE(p)&&(u=u.responseEnd,i+=f*(u<l?1:(l-c)/(u-c)))}if(--a,e+=8*(s+i)/(r.duration/1e3),t++,10<t)break}}if(0<t)return e/t/1e6}return navigator.connection&&(t=navigator.connection.downlink,typeof t=="number")?t:5}var Ng=null,Vg=null;function wf(t){return t.nodeType===9?t:t.ownerDocument}function UE(t){switch(t){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function LC(t,e){if(t===0)switch(e){case"svg":return 1;case"math":return 2;default:return 0}return t===1&&e==="foreignObject"?0:t}function Ug(t,e){return t==="textarea"||t==="noscript"||typeof e.children=="string"||typeof e.children=="number"||typeof e.children=="bigint"||typeof e.dangerouslySetInnerHTML=="object"&&e.dangerouslySetInnerHTML!==null&&e.dangerouslySetInnerHTML.__html!=null}var Xm=null;function uP(){var t=window.event;return t&&t.type==="popstate"?t===Xm?!1:(Xm=t,!0):(Xm=null,!1)}var AC=typeof setTimeout=="function"?setTimeout:void 0,cP=typeof clearTimeout=="function"?clearTimeout:void 0,FE=typeof Promise=="function"?Promise:void 0,dP=typeof queueMicrotask=="function"?queueMicrotask:typeof FE<"u"?function(t){return FE.resolve(null).then(t).catch(fP)}:AC;function fP(t){setTimeout(function(){throw t})}function Cs(t){return t==="head"}function BE(t,e){var n=e,a=0;do{var r=n.nextSibling;if(t.removeChild(n),r&&r.nodeType===8)if(n=r.data,n==="/$"||n==="/&"){if(a===0){t.removeChild(r),bo(e);return}a--}else if(n==="$"||n==="$?"||n==="$~"||n==="$!"||n==="&")a++;else if(n==="html")pu(t.ownerDocument.documentElement);else if(n==="head"){n=t.ownerDocument.head,pu(n);for(var s=n.firstChild;s;){var i=s.nextSibling,l=s.nodeName;s[Pu]||l==="SCRIPT"||l==="STYLE"||l==="LINK"&&s.rel.toLowerCase()==="stylesheet"||n.removeChild(s),s=i}}else n==="body"&&pu(t.ownerDocument.body);n=r}while(n);bo(e)}function qE(t,e){var n=t;t=0;do{var a=n.nextSibling;if(n.nodeType===1?e?(n._stashedDisplay=n.style.display,n.style.display="none"):(n.style.display=n._stashedDisplay||"",n.getAttribute("style")===""&&n.removeAttribute("style")):n.nodeType===3&&(e?(n._stashedText=n.nodeValue,n.nodeValue=""):n.nodeValue=n._stashedText||""),a&&a.nodeType===8)if(n=a.data,n==="/$"){if(t===0)break;t--}else n!=="$"&&n!=="$?"&&n!=="$~"&&n!=="$!"||t++;n=a}while(n)}function Fg(t){var e=t.firstChild;for(e&&e.nodeType===10&&(e=e.nextSibling);e;){var n=e;switch(e=e.nextSibling,n.nodeName){case"HTML":case"HEAD":case"BODY":Fg(n),Yg(n);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(n.rel.toLowerCase()==="stylesheet")continue}t.removeChild(n)}}function hP(t,e,n,a){for(;t.nodeType===1;){var r=n;if(t.nodeName.toLowerCase()!==e.toLowerCase()){if(!a&&(t.nodeName!=="INPUT"||t.type!=="hidden"))break}else if(a){if(!t[Pu])switch(e){case"meta":if(!t.hasAttribute("itemprop"))break;return t;case"link":if(s=t.getAttribute("rel"),s==="stylesheet"&&t.hasAttribute("data-precedence"))break;if(s!==r.rel||t.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||t.getAttribute("title")!==(r.title==null?null:r.title))break;return t;case"style":if(t.hasAttribute("data-precedence"))break;return t;case"script":if(s=t.getAttribute("src"),(s!==(r.src==null?null:r.src)||t.getAttribute("type")!==(r.type==null?null:r.type)||t.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&t.hasAttribute("async")&&!t.hasAttribute("itemprop"))break;return t;default:return t}}else if(e==="input"&&t.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&t.getAttribute("name")===s)return t}else return t;if(t=la(t.nextSibling),t===null)break}return null}function pP(t,e,n){if(e==="")return null;for(;t.nodeType!==3;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!n||(t=la(t.nextSibling),t===null))return null;return t}function xC(t,e){for(;t.nodeType!==8;)if((t.nodeType!==1||t.nodeName!=="INPUT"||t.type!=="hidden")&&!e||(t=la(t.nextSibling),t===null))return null;return t}function Bg(t){return t.data==="$?"||t.data==="$~"}function qg(t){return t.data==="$!"||t.data==="$?"&&t.ownerDocument.readyState!=="loading"}function mP(t,e){var n=t.ownerDocument;if(t.data==="$~")t._reactRetry=e;else if(t.data!=="$?"||n.readyState!=="loading")e();else{var a=function(){e(),n.removeEventListener("DOMContentLoaded",a)};n.addEventListener("DOMContentLoaded",a),t._reactRetry=a}}function la(t){for(;t!=null;t=t.nextSibling){var e=t.nodeType;if(e===1||e===3)break;if(e===8){if(e=t.data,e==="$"||e==="$!"||e==="$?"||e==="$~"||e==="&"||e==="F!"||e==="F")break;if(e==="/$"||e==="/&")return null}}return t}var zg=null;function zE(t){t=t.nextSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="/$"||n==="/&"){if(e===0)return la(t.nextSibling);e--}else n!=="$"&&n!=="$!"&&n!=="$?"&&n!=="$~"&&n!=="&"||e++}t=t.nextSibling}return null}function HE(t){t=t.previousSibling;for(var e=0;t;){if(t.nodeType===8){var n=t.data;if(n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"){if(e===0)return t;e--}else n!=="/$"&&n!=="/&"||e++}t=t.previousSibling}return null}function RC(t,e,n){switch(e=wf(n),t){case"html":if(t=e.documentElement,!t)throw Error(V(452));return t;case"head":if(t=e.head,!t)throw Error(V(453));return t;case"body":if(t=e.body,!t)throw Error(V(454));return t;default:throw Error(V(451))}}function pu(t){for(var e=t.attributes;e.length;)t.removeAttributeNode(e[0]);Yg(t)}var ua=new Map,GE=new Set;function Cf(t){return typeof t.getRootNode=="function"?t.getRootNode():t.nodeType===9?t:t.ownerDocument}var Cr=Ne.d;Ne.d={f:gP,r:yP,D:IP,C:_P,L:SP,m:vP,X:EP,S:TP,M:bP};function gP(){var t=Cr.f(),e=Hf();return t||e}function yP(t){var e=Co(t);e!==null&&e.tag===5&&e.type==="form"?Ew(e):Cr.r(t)}var Ro=typeof document>"u"?null:document;function kC(t,e,n){var a=Ro;if(a&&typeof e=="string"&&e){var r=ra(e);r='link[rel="'+t+'"][href="'+r+'"]',typeof n=="string"&&(r+='[crossorigin="'+n+'"]'),GE.has(r)||(GE.add(r),t={rel:t,crossOrigin:n,href:e},a.querySelector(r)===null&&(e=a.createElement("link"),un(e,"link",t),Yt(e),a.head.appendChild(e)))}}function IP(t){Cr.D(t),kC("dns-prefetch",t,null)}function _P(t,e){Cr.C(t,e),kC("preconnect",t,e)}function SP(t,e,n){Cr.L(t,e,n);var a=Ro;if(a&&t&&e){var r='link[rel="preload"][as="'+ra(e)+'"]';e==="image"&&n&&n.imageSrcSet?(r+='[imagesrcset="'+ra(n.imageSrcSet)+'"]',typeof n.imageSizes=="string"&&(r+='[imagesizes="'+ra(n.imageSizes)+'"]')):r+='[href="'+ra(t)+'"]';var s=r;switch(e){case"style":s=Eo(t);break;case"script":s=ko(t)}ua.has(s)||(t=it({rel:"preload",href:e==="image"&&n&&n.imageSrcSet?void 0:t,as:e},n),ua.set(s,t),a.querySelector(r)!==null||e==="style"&&a.querySelector(Fu(s))||e==="script"&&a.querySelector(Bu(s))||(e=a.createElement("link"),un(e,"link",t),Yt(e),a.head.appendChild(e)))}}function vP(t,e){Cr.m(t,e);var n=Ro;if(n&&t){var a=e&&typeof e.as=="string"?e.as:"script",r='link[rel="modulepreload"][as="'+ra(a)+'"][href="'+ra(t)+'"]',s=r;switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=ko(t)}if(!ua.has(s)&&(t=it({rel:"modulepreload",href:t},e),ua.set(s,t),n.querySelector(r)===null)){switch(a){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(n.querySelector(Bu(s)))return}a=n.createElement("link"),un(a,"link",t),Yt(a),n.head.appendChild(a)}}}function TP(t,e,n){Cr.S(t,e,n);var a=Ro;if(a&&t){var r=io(a).hoistableStyles,s=Eo(t);e=e||"default";var i=r.get(s);if(!i){var l={loading:0,preload:null};if(i=a.querySelector(Fu(s)))l.loading=5;else{t=it({rel:"stylesheet",href:t,"data-precedence":e},n),(n=ua.get(s))&&My(t,n);var u=i=a.createElement("link");Yt(u),un(u,"link",t),u._p=new Promise(function(c,f){u.onload=c,u.onerror=f}),u.addEventListener("load",function(){l.loading|=1}),u.addEventListener("error",function(){l.loading|=2}),l.loading|=4,$d(i,e,a)}i={type:"stylesheet",instance:i,count:1,state:l},r.set(s,i)}}}function EP(t,e){Cr.X(t,e);var n=Ro;if(n&&t){var a=io(n).hoistableScripts,r=ko(t),s=a.get(r);s||(s=n.querySelector(Bu(r)),s||(t=it({src:t,async:!0},e),(e=ua.get(r))&&Ny(t,e),s=n.createElement("script"),Yt(s),un(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function bP(t,e){Cr.M(t,e);var n=Ro;if(n&&t){var a=io(n).hoistableScripts,r=ko(t),s=a.get(r);s||(s=n.querySelector(Bu(r)),s||(t=it({src:t,async:!0,type:"module"},e),(e=ua.get(r))&&Ny(t,e),s=n.createElement("script"),Yt(s),un(s,"link",t),n.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},a.set(r,s))}}function jE(t,e,n,a){var r=(r=fs.current)?Cf(r):null;if(!r)throw Error(V(446));switch(t){case"meta":case"title":return null;case"style":return typeof n.precedence=="string"&&typeof n.href=="string"?(e=Eo(n.href),n=io(r).hoistableStyles,a=n.get(e),a||(a={type:"style",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};case"link":if(n.rel==="stylesheet"&&typeof n.href=="string"&&typeof n.precedence=="string"){t=Eo(n.href);var s=io(r).hoistableStyles,i=s.get(t);if(i||(r=r.ownerDocument||r,i={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(t,i),(s=r.querySelector(Fu(t)))&&!s._p&&(i.instance=s,i.state.loading=5),ua.has(t)||(n={rel:"preload",as:"style",href:n.href,crossOrigin:n.crossOrigin,integrity:n.integrity,media:n.media,hrefLang:n.hrefLang,referrerPolicy:n.referrerPolicy},ua.set(t,n),s||wP(r,t,n,i.state))),e&&a===null)throw Error(V(528,""));return i}if(e&&a!==null)throw Error(V(529,""));return null;case"script":return e=n.async,n=n.src,typeof n=="string"&&e&&typeof e!="function"&&typeof e!="symbol"?(e=ko(n),n=io(r).hoistableScripts,a=n.get(e),a||(a={type:"script",instance:null,count:0,state:null},n.set(e,a)),a):{type:"void",instance:null,count:0,state:null};default:throw Error(V(444,t))}}function Eo(t){return'href="'+ra(t)+'"'}function Fu(t){return'link[rel="stylesheet"]['+t+"]"}function DC(t){return it({},t,{"data-precedence":t.precedence,precedence:null})}function wP(t,e,n,a){t.querySelector('link[rel="preload"][as="style"]['+e+"]")?a.loading=1:(e=t.createElement("link"),a.preload=e,e.addEventListener("load",function(){return a.loading|=1}),e.addEventListener("error",function(){return a.loading|=2}),un(e,"link",n),Yt(e),t.head.appendChild(e))}function ko(t){return'[src="'+ra(t)+'"]'}function Bu(t){return"script[async]"+t}function KE(t,e,n){if(e.count++,e.instance===null)switch(e.type){case"style":var a=t.querySelector('style[data-href~="'+ra(n.href)+'"]');if(a)return e.instance=a,Yt(a),a;var r=it({},n,{"data-href":n.href,"data-precedence":n.precedence,href:null,precedence:null});return a=(t.ownerDocument||t).createElement("style"),Yt(a),un(a,"style",r),$d(a,n.precedence,t),e.instance=a;case"stylesheet":r=Eo(n.href);var s=t.querySelector(Fu(r));if(s)return e.state.loading|=4,e.instance=s,Yt(s),s;a=DC(n),(r=ua.get(r))&&My(a,r),s=(t.ownerDocument||t).createElement("link"),Yt(s);var i=s;return i._p=new Promise(function(l,u){i.onload=l,i.onerror=u}),un(s,"link",a),e.state.loading|=4,$d(s,n.precedence,t),e.instance=s;case"script":return s=ko(n.src),(r=t.querySelector(Bu(s)))?(e.instance=r,Yt(r),r):(a=n,(r=ua.get(s))&&(a=it({},n),Ny(a,r)),t=t.ownerDocument||t,r=t.createElement("script"),Yt(r),un(r,"link",a),t.head.appendChild(r),e.instance=r);case"void":return null;default:throw Error(V(443,e.type))}else e.type==="stylesheet"&&!(e.state.loading&4)&&(a=e.instance,e.state.loading|=4,$d(a,n.precedence,t));return e.instance}function $d(t,e,n){for(var a=n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=a.length?a[a.length-1]:null,s=r,i=0;i<a.length;i++){var l=a[i];if(l.dataset.precedence===e)s=l;else if(s!==r)break}s?s.parentNode.insertBefore(t,s.nextSibling):(e=n.nodeType===9?n.head:n,e.insertBefore(t,e.firstChild))}function My(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.title==null&&(t.title=e.title)}function Ny(t,e){t.crossOrigin==null&&(t.crossOrigin=e.crossOrigin),t.referrerPolicy==null&&(t.referrerPolicy=e.referrerPolicy),t.integrity==null&&(t.integrity=e.integrity)}var Jd=null;function WE(t,e,n){if(Jd===null){var a=new Map,r=Jd=new Map;r.set(n,a)}else r=Jd,a=r.get(n),a||(a=new Map,r.set(n,a));if(a.has(t))return a;for(a.set(t,null),n=n.getElementsByTagName(t),r=0;r<n.length;r++){var s=n[r];if(!(s[Pu]||s[sn]||t==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var i=s.getAttribute(e)||"";i=t+i;var l=a.get(i);l?l.push(s):a.set(i,[s])}}return a}function XE(t,e,n){t=t.ownerDocument||t,t.head.insertBefore(n,e==="title"?t.querySelector("head > title"):null)}function CP(t,e,n){if(n===1||e.itemProp!=null)return!1;switch(t){case"meta":case"title":return!0;case"style":if(typeof e.precedence!="string"||typeof e.href!="string"||e.href==="")break;return!0;case"link":if(typeof e.rel!="string"||typeof e.href!="string"||e.href===""||e.onLoad||e.onError)break;switch(e.rel){case"stylesheet":return t=e.disabled,typeof e.precedence=="string"&&t==null;default:return!0}case"script":if(e.async&&typeof e.async!="function"&&typeof e.async!="symbol"&&!e.onLoad&&!e.onError&&e.src&&typeof e.src=="string")return!0}return!1}function PC(t){return!(t.type==="stylesheet"&&!(t.state.loading&3))}function LP(t,e,n,a){if(n.type==="stylesheet"&&(typeof a.media!="string"||matchMedia(a.media).matches!==!1)&&!(n.state.loading&4)){if(n.instance===null){var r=Eo(a.href),s=e.querySelector(Fu(r));if(s){e=s._p,e!==null&&typeof e=="object"&&typeof e.then=="function"&&(t.count++,t=Lf.bind(t),e.then(t,t)),n.state.loading|=4,n.instance=s,Yt(s);return}s=e.ownerDocument||e,a=DC(a),(r=ua.get(r))&&My(a,r),s=s.createElement("link"),Yt(s);var i=s;i._p=new Promise(function(l,u){i.onload=l,i.onerror=u}),un(s,"link",a),n.instance=s}t.stylesheets===null&&(t.stylesheets=new Map),t.stylesheets.set(n,e),(e=n.state.preload)&&!(n.state.loading&3)&&(t.count++,n=Lf.bind(t),e.addEventListener("load",n),e.addEventListener("error",n))}}var Qm=0;function AP(t,e){return t.stylesheets&&t.count===0&&Zd(t,t.stylesheets),0<t.count||0<t.imgCount?function(n){var a=setTimeout(function(){if(t.stylesheets&&Zd(t,t.stylesheets),t.unsuspend){var s=t.unsuspend;t.unsuspend=null,s()}},6e4+e);0<t.imgBytes&&Qm===0&&(Qm=62500*lP());var r=setTimeout(function(){if(t.waitingForImages=!1,t.count===0&&(t.stylesheets&&Zd(t,t.stylesheets),t.unsuspend)){var s=t.unsuspend;t.unsuspend=null,s()}},(t.imgBytes>Qm?50:800)+e);return t.unsuspend=n,function(){t.unsuspend=null,clearTimeout(a),clearTimeout(r)}}:null}function Lf(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)Zd(this,this.stylesheets);else if(this.unsuspend){var t=this.unsuspend;this.unsuspend=null,t()}}}var Af=null;function Zd(t,e){t.stylesheets=null,t.unsuspend!==null&&(t.count++,Af=new Map,e.forEach(xP,t),Af=null,Lf.call(t))}function xP(t,e){if(!(e.state.loading&4)){var n=Af.get(t);if(n)var a=n.get(null);else{n=new Map,Af.set(t,n);for(var r=t.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var i=r[s];(i.nodeName==="LINK"||i.getAttribute("media")!=="not all")&&(n.set(i.dataset.precedence,i),a=i)}a&&n.set(null,a)}r=e.instance,i=r.getAttribute("data-precedence"),s=n.get(i)||a,s===a&&n.set(null,r),n.set(i,r),this.count++,a=Lf.bind(this),r.addEventListener("load",a),r.addEventListener("error",a),s?s.parentNode.insertBefore(r,s.nextSibling):(t=t.nodeType===9?t.head:t,t.insertBefore(r,t.firstChild)),e.state.loading|=4}}var Cu={$$typeof:mr,Provider:null,Consumer:null,_currentValue:Ks,_currentValue2:Ks,_threadCount:0};function RP(t,e,n,a,r,s,i,l,u){this.tag=1,this.containerInfo=t,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=vm(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=vm(0),this.hiddenUpdates=vm(null),this.identifierPrefix=a,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=i,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=u,this.incompleteTransitions=new Map}function OC(t,e,n,a,r,s,i,l,u,c,f,p){return t=new RP(t,e,n,i,u,c,f,p,l),e=1,s===!0&&(e|=24),s=qn(3,null,null,e),t.current=s,s.stateNode=t,e=ly(),e.refCount++,t.pooledCache=e,e.refCount++,s.memoizedState={element:a,isDehydrated:n,cache:e},dy(s),t}function MC(t){return t?(t=no,t):no}function NC(t,e,n,a,r,s){r=MC(r),a.context===null?a.context=r:a.pendingContext=r,a=ps(e),a.payload={element:n},s=s===void 0?null:s,s!==null&&(a.callback=s),n=ms(t,a,e),n!==null&&(kn(n,t,e),iu(n,t,e))}function QE(t,e){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var n=t.retryLane;t.retryLane=n!==0&&n<e?n:e}}function Vy(t,e){QE(t,e),(t=t.alternate)&&QE(t,e)}function VC(t){if(t.tag===13||t.tag===31){var e=si(t,67108864);e!==null&&kn(e,t,67108864),Vy(t,67108864)}}function YE(t){if(t.tag===13||t.tag===31){var e=Kn();e=Xg(e);var n=si(t,e);n!==null&&kn(n,t,e),Vy(t,e)}}var xf=!0;function kP(t,e,n,a){var r=se.T;se.T=null;var s=Ne.p;try{Ne.p=2,Uy(t,e,n,a)}finally{Ne.p=s,se.T=r}}function DP(t,e,n,a){var r=se.T;se.T=null;var s=Ne.p;try{Ne.p=8,Uy(t,e,n,a)}finally{Ne.p=s,se.T=r}}function Uy(t,e,n,a){if(xf){var r=Hg(a);if(r===null)Wm(t,e,a,Rf,n),$E(t,a);else if(OP(r,t,e,n,a))a.stopPropagation();else if($E(t,a),e&4&&-1<PP.indexOf(t)){for(;r!==null;){var s=Co(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var i=Hs(s.pendingLanes);if(i!==0){var l=s;for(l.pendingLanes|=2,l.entangledLanes|=2;i;){var u=1<<31-jn(i);l.entanglements[1]|=u,i&=~u}Ma(s),!(Me&6)&&(_f=Hn()+500,Uu(0,!1))}}break;case 31:case 13:l=si(s,2),l!==null&&kn(l,s,2),Hf(),Vy(s,2)}if(s=Hg(a),s===null&&Wm(t,e,a,Rf,n),s===r)break;r=s}r!==null&&a.stopPropagation()}else Wm(t,e,a,null,n)}}function Hg(t){return t=Jg(t),Fy(t)}var Rf=null;function Fy(t){if(Rf=null,t=Yi(t),t!==null){var e=xu(t);if(e===null)t=null;else{var n=e.tag;if(n===13){if(t=ab(e),t!==null)return t;t=null}else if(n===31){if(t=rb(e),t!==null)return t;t=null}else if(n===3){if(e.stateNode.current.memoizedState.isDehydrated)return e.tag===3?e.stateNode.containerInfo:null;t=null}else e!==t&&(t=null)}}return Rf=t,null}function UC(t){switch(t){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Sk()){case lb:return 2;case ub:return 8;case rf:case vk:return 32;case cb:return 268435456;default:return 32}default:return 32}}var Gg=!1,Is=null,_s=null,Ss=null,Lu=new Map,Au=new Map,is=[],PP="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function $E(t,e){switch(t){case"focusin":case"focusout":Is=null;break;case"dragenter":case"dragleave":_s=null;break;case"mouseover":case"mouseout":Ss=null;break;case"pointerover":case"pointerout":Lu.delete(e.pointerId);break;case"gotpointercapture":case"lostpointercapture":Au.delete(e.pointerId)}}function Ql(t,e,n,a,r,s){return t===null||t.nativeEvent!==s?(t={blockedOn:e,domEventName:n,eventSystemFlags:a,nativeEvent:s,targetContainers:[r]},e!==null&&(e=Co(e),e!==null&&VC(e)),t):(t.eventSystemFlags|=a,e=t.targetContainers,r!==null&&e.indexOf(r)===-1&&e.push(r),t)}function OP(t,e,n,a,r){switch(e){case"focusin":return Is=Ql(Is,t,e,n,a,r),!0;case"dragenter":return _s=Ql(_s,t,e,n,a,r),!0;case"mouseover":return Ss=Ql(Ss,t,e,n,a,r),!0;case"pointerover":var s=r.pointerId;return Lu.set(s,Ql(Lu.get(s)||null,t,e,n,a,r)),!0;case"gotpointercapture":return s=r.pointerId,Au.set(s,Ql(Au.get(s)||null,t,e,n,a,r)),!0}return!1}function FC(t){var e=Yi(t.target);if(e!==null){var n=xu(e);if(n!==null){if(e=n.tag,e===13){if(e=ab(n),e!==null){t.blockedOn=e,OT(t.priority,function(){YE(n)});return}}else if(e===31){if(e=rb(n),e!==null){t.blockedOn=e,OT(t.priority,function(){YE(n)});return}}else if(e===3&&n.stateNode.current.memoizedState.isDehydrated){t.blockedOn=n.tag===3?n.stateNode.containerInfo:null;return}}}t.blockedOn=null}function ef(t){if(t.blockedOn!==null)return!1;for(var e=t.targetContainers;0<e.length;){var n=Hg(t.nativeEvent);if(n===null){n=t.nativeEvent;var a=new n.constructor(n.type,n);lg=a,n.target.dispatchEvent(a),lg=null}else return e=Co(n),e!==null&&VC(e),t.blockedOn=n,!1;e.shift()}return!0}function JE(t,e,n){ef(t)&&n.delete(e)}function MP(){Gg=!1,Is!==null&&ef(Is)&&(Is=null),_s!==null&&ef(_s)&&(_s=null),Ss!==null&&ef(Ss)&&(Ss=null),Lu.forEach(JE),Au.forEach(JE)}function Ud(t,e){t.blockedOn===e&&(t.blockedOn=null,Gg||(Gg=!0,Gt.unstable_scheduleCallback(Gt.unstable_NormalPriority,MP)))}var Fd=null;function ZE(t){Fd!==t&&(Fd=t,Gt.unstable_scheduleCallback(Gt.unstable_NormalPriority,function(){Fd===t&&(Fd=null);for(var e=0;e<t.length;e+=3){var n=t[e],a=t[e+1],r=t[e+2];if(typeof a!="function"){if(Fy(a||n)===null)continue;break}var s=Co(n);s!==null&&(t.splice(e,3),e-=3,bg(s,{pending:!0,data:r,method:n.method,action:a},a,r))}}))}function bo(t){function e(u){return Ud(u,t)}Is!==null&&Ud(Is,t),_s!==null&&Ud(_s,t),Ss!==null&&Ud(Ss,t),Lu.forEach(e),Au.forEach(e);for(var n=0;n<is.length;n++){var a=is[n];a.blockedOn===t&&(a.blockedOn=null)}for(;0<is.length&&(n=is[0],n.blockedOn===null);)FC(n),n.blockedOn===null&&is.shift();if(n=(t.ownerDocument||t).$$reactFormReplay,n!=null)for(a=0;a<n.length;a+=3){var r=n[a],s=n[a+1],i=r[Dn]||null;if(typeof s=="function")i||ZE(n);else if(i){var l=null;if(s&&s.hasAttribute("formAction")){if(r=s,i=s[Dn]||null)l=i.formAction;else if(Fy(r)!==null)continue}else l=i.action;typeof l=="function"?n[a+1]=l:(n.splice(a,3),a-=3),ZE(n)}}}function BC(){function t(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(i){return r=i})},focusReset:"manual",scroll:"manual"})}function e(){r!==null&&(r(),r=null),a||setTimeout(n,20)}function n(){if(!a&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var a=!1,r=null;return navigation.addEventListener("navigate",t),navigation.addEventListener("navigatesuccess",e),navigation.addEventListener("navigateerror",e),setTimeout(n,100),function(){a=!0,navigation.removeEventListener("navigate",t),navigation.removeEventListener("navigatesuccess",e),navigation.removeEventListener("navigateerror",e),r!==null&&(r(),r=null)}}}function By(t){this._internalRoot=t}Kf.prototype.render=By.prototype.render=function(t){var e=this._internalRoot;if(e===null)throw Error(V(409));var n=e.current,a=Kn();NC(n,a,t,e,null,null)};Kf.prototype.unmount=By.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var e=t.containerInfo;NC(t.current,2,null,t,null,null),Hf(),e[wo]=null}};function Kf(t){this._internalRoot=t}Kf.prototype.unstable_scheduleHydration=function(t){if(t){var e=mb();t={blockedOn:null,target:t,priority:e};for(var n=0;n<is.length&&e!==0&&e<is[n].priority;n++);is.splice(n,0,t),n===0&&FC(t)}};var eb=tb.version;if(eb!=="19.2.3")throw Error(V(527,eb,"19.2.3"));Ne.findDOMNode=function(t){var e=t._reactInternals;if(e===void 0)throw typeof t.render=="function"?Error(V(188)):(t=Object.keys(t).join(","),Error(V(268,t)));return t=hk(e),t=t!==null?sb(t):null,t=t===null?null:t.stateNode,t};var NP={bundleType:0,version:"19.2.3",rendererPackageName:"react-dom",currentDispatcherRef:se,reconcilerVersion:"19.2.3"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Yl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Yl.isDisabled&&Yl.supportsFiber))try{Ru=Yl.inject(NP),Gn=Yl}catch{}var Yl;Wf.createRoot=function(t,e){if(!nb(t))throw Error(V(299));var n=!1,a="",r=kw,s=Dw,i=Pw;return e!=null&&(e.unstable_strictMode===!0&&(n=!0),e.identifierPrefix!==void 0&&(a=e.identifierPrefix),e.onUncaughtError!==void 0&&(r=e.onUncaughtError),e.onCaughtError!==void 0&&(s=e.onCaughtError),e.onRecoverableError!==void 0&&(i=e.onRecoverableError)),e=OC(t,1,!1,null,null,n,a,null,r,s,i,BC),t[wo]=e.current,Oy(t),new By(e)};Wf.hydrateRoot=function(t,e,n){if(!nb(t))throw Error(V(299));var a=!1,r="",s=kw,i=Dw,l=Pw,u=null;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onUncaughtError!==void 0&&(s=n.onUncaughtError),n.onCaughtError!==void 0&&(i=n.onCaughtError),n.onRecoverableError!==void 0&&(l=n.onRecoverableError),n.formState!==void 0&&(u=n.formState)),e=OC(t,1,!0,e,n??null,a,r,u,s,i,l,BC),e.context=MC(null),n=e.current,a=Kn(),a=Xg(a),r=ps(a),r.callback=null,ms(n,r,a),n=a,e.current.lanes=n,Du(e,n),Ma(e),t[wo]=e.current,Oy(t),new Kf(e)};Wf.version="19.2.3"});var GC=Pe((YF,HC)=>{"use strict";function zC(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(zC)}catch(t){console.error(t)}}zC(),HC.exports=qC()});var jC=Pe((ZF,Ky)=>{var jy=function(t){"use strict";var e=Object.prototype,n=e.hasOwnProperty,a=Object.defineProperty||function(M,O,U){M[O]=U.value},r,s=typeof Symbol=="function"?Symbol:{},i=s.iterator||"@@iterator",l=s.asyncIterator||"@@asyncIterator",u=s.toStringTag||"@@toStringTag";function c(M,O,U){return Object.defineProperty(M,O,{value:U,enumerable:!0,configurable:!0,writable:!0}),M[O]}try{c({},"")}catch{c=function(O,U,J){return O[U]=J}}function f(M,O,U,J){var Q=O&&O.prototype instanceof E?O:E,re=Object.create(Q.prototype),We=new $(J||[]);return a(re,"_invoke",{value:b(M,U,We)}),re}t.wrap=f;function p(M,O,U){try{return{type:"normal",arg:M.call(O,U)}}catch(J){return{type:"throw",arg:J}}}var m="suspendedStart",S="suspendedYield",R="executing",D="completed",L={};function E(){}function v(){}function C(){}var x={};c(x,i,function(){return this});var H=Object.getPrototypeOf,G=H&&H(H(He([])));G&&G!==e&&n.call(G,i)&&(x=G);var _=C.prototype=E.prototype=Object.create(x);v.prototype=C,a(_,"constructor",{value:C,configurable:!0}),a(C,"constructor",{value:v,configurable:!0}),v.displayName=c(C,u,"GeneratorFunction");function y(M){["next","throw","return"].forEach(function(O){c(M,O,function(U){return this._invoke(O,U)})})}t.isGeneratorFunction=function(M){var O=typeof M=="function"&&M.constructor;return O?O===v||(O.displayName||O.name)==="GeneratorFunction":!1},t.mark=function(M){return Object.setPrototypeOf?Object.setPrototypeOf(M,C):(M.__proto__=C,c(M,u,"GeneratorFunction")),M.prototype=Object.create(_),M},t.awrap=function(M){return{__await:M}};function I(M,O){function U(re,We,Oe,$e){var Je=p(M[re],M,We);if(Je.type==="throw")$e(Je.arg);else{var bn=Je.arg,yn=bn.value;return yn&&typeof yn=="object"&&n.call(yn,"__await")?O.resolve(yn.__await).then(function(ot){U("next",ot,Oe,$e)},function(ot){U("throw",ot,Oe,$e)}):O.resolve(yn).then(function(ot){bn.value=ot,Oe(bn)},function(ot){return U("throw",ot,Oe,$e)})}}var J;function Q(re,We){function Oe(){return new O(function($e,Je){U(re,We,$e,Je)})}return J=J?J.then(Oe,Oe):Oe()}a(this,"_invoke",{value:Q})}y(I.prototype),c(I.prototype,l,function(){return this}),t.AsyncIterator=I,t.async=function(M,O,U,J,Q){Q===void 0&&(Q=Promise);var re=new I(f(M,O,U,J),Q);return t.isGeneratorFunction(O)?re:re.next().then(function(We){return We.done?We.value:re.next()})};function b(M,O,U){var J=m;return function(re,We){if(J===R)throw new Error("Generator is already running");if(J===D){if(re==="throw")throw We;return At()}for(U.method=re,U.arg=We;;){var Oe=U.delegate;if(Oe){var $e=w(Oe,U);if($e){if($e===L)continue;return $e}}if(U.method==="next")U.sent=U._sent=U.arg;else if(U.method==="throw"){if(J===m)throw J=D,U.arg;U.dispatchException(U.arg)}else U.method==="return"&&U.abrupt("return",U.arg);J=R;var Je=p(M,O,U);if(Je.type==="normal"){if(J=U.done?D:S,Je.arg===L)continue;return{value:Je.arg,done:U.done}}else Je.type==="throw"&&(J=D,U.method="throw",U.arg=Je.arg)}}}function w(M,O){var U=O.method,J=M.iterator[U];if(J===r)return O.delegate=null,U==="throw"&&M.iterator.return&&(O.method="return",O.arg=r,w(M,O),O.method==="throw")||U!=="return"&&(O.method="throw",O.arg=new TypeError("The iterator does not provide a '"+U+"' method")),L;var Q=p(J,M.iterator,O.arg);if(Q.type==="throw")return O.method="throw",O.arg=Q.arg,O.delegate=null,L;var re=Q.arg;if(!re)return O.method="throw",O.arg=new TypeError("iterator result is not an object"),O.delegate=null,L;if(re.done)O[M.resultName]=re.value,O.next=M.nextLoc,O.method!=="return"&&(O.method="next",O.arg=r);else return re;return O.delegate=null,L}y(_),c(_,u,"Generator"),c(_,i,function(){return this}),c(_,"toString",function(){return"[object Generator]"});function A(M){var O={tryLoc:M[0]};1 in M&&(O.catchLoc=M[1]),2 in M&&(O.finallyLoc=M[2],O.afterLoc=M[3]),this.tryEntries.push(O)}function T(M){var O=M.completion||{};O.type="normal",delete O.arg,M.completion=O}function $(M){this.tryEntries=[{tryLoc:"root"}],M.forEach(A,this),this.reset(!0)}t.keys=function(M){var O=Object(M),U=[];for(var J in O)U.push(J);return U.reverse(),function Q(){for(;U.length;){var re=U.pop();if(re in O)return Q.value=re,Q.done=!1,Q}return Q.done=!0,Q}};function He(M){if(M){var O=M[i];if(O)return O.call(M);if(typeof M.next=="function")return M;if(!isNaN(M.length)){var U=-1,J=function Q(){for(;++U<M.length;)if(n.call(M,U))return Q.value=M[U],Q.done=!1,Q;return Q.value=r,Q.done=!0,Q};return J.next=J}}return{next:At}}t.values=He;function At(){return{value:r,done:!0}}return $.prototype={constructor:$,reset:function(M){if(this.prev=0,this.next=0,this.sent=this._sent=r,this.done=!1,this.delegate=null,this.method="next",this.arg=r,this.tryEntries.forEach(T),!M)for(var O in this)O.charAt(0)==="t"&&n.call(this,O)&&!isNaN(+O.slice(1))&&(this[O]=r)},stop:function(){this.done=!0;var M=this.tryEntries[0],O=M.completion;if(O.type==="throw")throw O.arg;return this.rval},dispatchException:function(M){if(this.done)throw M;var O=this;function U($e,Je){return re.type="throw",re.arg=M,O.next=$e,Je&&(O.method="next",O.arg=r),!!Je}for(var J=this.tryEntries.length-1;J>=0;--J){var Q=this.tryEntries[J],re=Q.completion;if(Q.tryLoc==="root")return U("end");if(Q.tryLoc<=this.prev){var We=n.call(Q,"catchLoc"),Oe=n.call(Q,"finallyLoc");if(We&&Oe){if(this.prev<Q.catchLoc)return U(Q.catchLoc,!0);if(this.prev<Q.finallyLoc)return U(Q.finallyLoc)}else if(We){if(this.prev<Q.catchLoc)return U(Q.catchLoc,!0)}else if(Oe){if(this.prev<Q.finallyLoc)return U(Q.finallyLoc)}else throw new Error("try statement without catch or finally")}}},abrupt:function(M,O){for(var U=this.tryEntries.length-1;U>=0;--U){var J=this.tryEntries[U];if(J.tryLoc<=this.prev&&n.call(J,"finallyLoc")&&this.prev<J.finallyLoc){var Q=J;break}}Q&&(M==="break"||M==="continue")&&Q.tryLoc<=O&&O<=Q.finallyLoc&&(Q=null);var re=Q?Q.completion:{};return re.type=M,re.arg=O,Q?(this.method="next",this.next=Q.finallyLoc,L):this.complete(re)},complete:function(M,O){if(M.type==="throw")throw M.arg;return M.type==="break"||M.type==="continue"?this.next=M.arg:M.type==="return"?(this.rval=this.arg=M.arg,this.method="return",this.next="end"):M.type==="normal"&&O&&(this.next=O),L},finish:function(M){for(var O=this.tryEntries.length-1;O>=0;--O){var U=this.tryEntries[O];if(U.finallyLoc===M)return this.complete(U.completion,U.afterLoc),T(U),L}},catch:function(M){for(var O=this.tryEntries.length-1;O>=0;--O){var U=this.tryEntries[O];if(U.tryLoc===M){var J=U.completion;if(J.type==="throw"){var Q=J.arg;T(U)}return Q}}throw new Error("illegal catch attempt")},delegateYield:function(M,O,U){return this.delegate={iterator:He(M),resultName:O,nextLoc:U},this.method==="next"&&(this.arg=r),L}},t}(typeof Ky=="object"?Ky.exports:{});try{regeneratorRuntime=jy}catch{typeof globalThis=="object"?globalThis.regeneratorRuntime=jy:Function("r","regeneratorRuntime = r")(jy)}});var Xf=Pe((eB,KC)=>{"use strict";KC.exports=(t,e)=>`${t}-${e}-${Math.random().toString(16).slice(3,8)}`});var Wy=Pe((tB,XC)=>{"use strict";var FP=Xf(),WC=0;XC.exports=({id:t,action:e,payload:n={}})=>{let a=t;return typeof a>"u"&&(a=FP("Job",WC),WC+=1),{id:a,action:e,payload:n}}});var Qf=Pe(qu=>{"use strict";var Xy=!1;qu.logging=Xy;qu.setLogging=t=>{Xy=t};qu.log=(...t)=>Xy?console.log.apply(qu,t):null});var JC=Pe((YC,$C)=>{"use strict";var BP=Wy(),{log:Yf}=Qf(),qP=Xf(),QC=0;$C.exports=()=>{let t=qP("Scheduler",QC),e={},n={},a=[];QC+=1;let r=()=>a.length,s=()=>Object.keys(e).length,i=()=>{if(a.length!==0){let p=Object.keys(e);for(let m=0;m<p.length;m+=1)if(typeof n[p[m]]>"u"){a[0](e[p[m]]);break}}},l=(p,m)=>new Promise((S,R)=>{let D=BP({action:p,payload:m});a.push(async L=>{a.shift(),n[L.id]=D;try{S(await L[p].apply(YC,[...m,D.id]))}catch(E){R(E)}finally{delete n[L.id],i()}}),Yf(`[${t}]: Add ${D.id} to JobQueue`),Yf(`[${t}]: JobQueue length=${a.length}`),i()});return{addWorker:p=>(e[p.id]=p,Yf(`[${t}]: Add ${p.id}`),Yf(`[${t}]: Number of workers=${s()}`),i(),p.id),addJob:async(p,...m)=>{if(s()===0)throw Error(`[${t}]: You need to have at least one worker before adding jobs`);return l(p,m)},terminate:async()=>{Object.keys(e).forEach(async p=>{await e[p].terminate()}),a=[]},getQueueLen:r,getNumWorkers:s}}});var eL=Pe((aB,ZC)=>{"use strict";ZC.exports=t=>{let e={};return typeof WorkerGlobalScope<"u"?e.type="webworker":typeof document=="object"?e.type="browser":typeof process=="object"&&typeof tT=="function"&&(e.type="node"),typeof t>"u"?e:e[t]}});var nL=Pe((sB,tL)=>{"use strict";var zP=eL()("type")==="browser",HP=zP?t=>new URL(t,window.location.href).href:t=>t;tL.exports=t=>{let e={...t};return["corePath","workerPath","langPath"].forEach(n=>{t[n]&&(e[n]=HP(e[n]))}),e}});var Qy=Pe((iB,aL)=>{"use strict";aL.exports={TESSERACT_ONLY:0,LSTM_ONLY:1,TESSERACT_LSTM_COMBINED:2,DEFAULT:3}});var rL=Pe((oB,GP)=>{GP.exports={name:"tesseract.js",version:"7.0.0",description:"Pure Javascript Multilingual OCR",main:"src/index.js",type:"commonjs",types:"src/index.d.ts",unpkg:"dist/tesseract.min.js",jsdelivr:"dist/tesseract.min.js",scripts:{start:"node scripts/server.js",build:"rimraf dist && webpack --config scripts/webpack.config.prod.js && rollup -c scripts/rollup.esm.mjs","profile:tesseract":"webpack-bundle-analyzer dist/tesseract-stats.json","profile:worker":"webpack-bundle-analyzer dist/worker-stats.json",prepublishOnly:"npm run build",wait:"rimraf dist && wait-on http://localhost:3000/dist/tesseract.min.js",test:"npm-run-all -p -r start test:all","test:all":"npm-run-all wait test:browser test:node:all","test:browser":"karma start karma.conf.js","test:node":"nyc mocha --exit --bail --require ./scripts/test-helper.mjs","test:node:all":"npm run test:node -- ./tests/*.test.mjs",lint:"eslint src","lint:fix":"eslint --fix src",postinstall:"opencollective-postinstall || true"},browser:{"./src/worker/node/index.js":"./src/worker/browser/index.js"},author:"",contributors:["jeromewu"],license:"Apache-2.0",devDependencies:{"@babel/core":"^7.21.4","@babel/eslint-parser":"^7.21.3","@babel/preset-env":"^7.21.4","@rollup/plugin-commonjs":"^24.1.0",acorn:"^8.8.2","babel-loader":"^9.1.2",buffer:"^6.0.3",cors:"^2.8.5",eslint:"^7.32.0","eslint-config-airbnb-base":"^14.2.1","eslint-plugin-import":"^2.27.5","expect.js":"^0.3.1",express:"^4.18.2",mocha:"^10.2.0","npm-run-all":"^4.1.5",karma:"^6.4.2","karma-chrome-launcher":"^3.2.0","karma-firefox-launcher":"^2.1.2","karma-mocha":"^2.0.1","karma-webpack":"^5.0.0",nyc:"^15.1.0",rimraf:"^5.0.0",rollup:"^3.20.7","wait-on":"^7.0.1",webpack:"^5.79.0","webpack-bundle-analyzer":"^4.8.0","webpack-cli":"^5.0.1","webpack-dev-middleware":"^6.0.2","rollup-plugin-sourcemaps":"^0.6.3"},dependencies:{"bmp-js":"^0.1.0","idb-keyval":"^6.2.0","is-url":"^1.2.4","node-fetch":"^2.6.9","opencollective-postinstall":"^2.0.3","regenerator-runtime":"^0.13.3","tesseract.js-core":"^7.0.0","wasm-feature-detect":"^1.8.0",zlibjs:"^0.3.1"},overrides:{"@rollup/pluginutils":"^5.0.2"},repository:{type:"git",url:"https://github.com/naptha/tesseract.js.git"},bugs:{url:"https://github.com/naptha/tesseract.js/issues"},homepage:"https://github.com/naptha/tesseract.js",collective:{type:"opencollective",url:"https://opencollective.com/tesseractjs"}}});var iL=Pe((lB,sL)=>{"use strict";sL.exports={workerBlobURL:!0,logger:()=>{}}});var lL=Pe((uB,oL)=>{"use strict";var jP=rL().version,KP=iL();oL.exports={...KP,workerPath:`https://cdn.jsdelivr.net/npm/tesseract.js@v${jP}/dist/worker.min.js`}});var cL=Pe((cB,uL)=>{"use strict";uL.exports=({workerPath:t,workerBlobURL:e})=>{let n;if(Blob&&URL&&e){let a=new Blob([`importScripts("${t}");`],{type:"application/javascript"});n=new Worker(URL.createObjectURL(a))}else n=new Worker(t);return n}});var fL=Pe((dB,dL)=>{"use strict";dL.exports=t=>{t.terminate()}});var pL=Pe((fB,hL)=>{"use strict";hL.exports=(t,e)=>{t.onmessage=({data:n})=>{e(n)}}});var gL=Pe((hB,mL)=>{"use strict";mL.exports=async(t,e)=>{t.postMessage(e)}});var IL=Pe((pB,yL)=>{"use strict";var Yy=t=>new Promise((e,n)=>{let a=new FileReader;a.onload=()=>{e(a.result)},a.onerror=({target:{error:{code:r}}})=>{n(Error(`File could not be read! Code=${r}`))},a.readAsArrayBuffer(t)}),$y=async t=>{let e=t;if(typeof t>"u")return"undefined";if(typeof t=="string")/data:image\/([a-zA-Z]*);base64,([^"]*)/.test(t)?e=atob(t.split(",")[1]).split("").map(n=>n.charCodeAt(0)):e=await(await fetch(t)).arrayBuffer();else if(typeof HTMLElement<"u"&&t instanceof HTMLElement)t.tagName==="IMG"&&(e=await $y(t.src)),t.tagName==="VIDEO"&&(e=await $y(t.poster)),t.tagName==="CANVAS"&&await new Promise(n=>{t.toBlob(async a=>{e=await Yy(a),n()})});else if(typeof OffscreenCanvas<"u"&&t instanceof OffscreenCanvas){let n=await t.convertToBlob();e=await Yy(n)}else(t instanceof File||t instanceof Blob)&&(e=await Yy(t));return new Uint8Array(e)};yL.exports=$y});var SL=Pe((mB,_L)=>{"use strict";var WP=lL(),XP=cL(),QP=fL(),YP=pL(),$P=gL(),JP=IL();_L.exports={defaultOptions:WP,spawnWorker:XP,terminateWorker:QP,onMessage:YP,send:$P,loadImage:JP}});var Jy=Pe((gB,bL)=>{"use strict";var ZP=nL(),Na=Wy(),{log:vL}=Qf(),eO=Xf(),oi=Qy(),{defaultOptions:tO,spawnWorker:nO,terminateWorker:aO,onMessage:rO,loadImage:TL,send:sO}=SL(),EL=0;bL.exports=async(t="eng",e=oi.LSTM_ONLY,n={},a={})=>{let r=eO("Worker",EL),{logger:s,errorHandler:i,...l}=ZP({...tO,...n}),u={},c=typeof t=="string"?t.split("+"):t,f=e,p=a,m=[oi.DEFAULT,oi.LSTM_ONLY].includes(e)&&!l.legacyCore,S,R,D=new Promise((M,O)=>{R=M,S=O}),L=M=>{S(M.message)},E=nO(l);E.onerror=L,EL+=1;let v=({id:M,action:O,payload:U})=>new Promise((J,Q)=>{vL(`[${r}]: Start ${M}, action=${O}`);let re=`${O}-${M}`;u[re]={resolve:J,reject:Q},sO(E,{workerId:r,jobId:M,action:O,payload:U})}),C=()=>console.warn("`load` is depreciated and should be removed from code (workers now come pre-loaded)"),x=M=>v(Na({id:M,action:"load",payload:{options:{lstmOnly:m,corePath:l.corePath,logging:l.logging}}})),H=(M,O,U)=>v(Na({id:U,action:"FS",payload:{method:"writeFile",args:[M,O]}})),G=(M,O)=>v(Na({id:O,action:"FS",payload:{method:"readFile",args:[M,{encoding:"utf8"}]}})),_=(M,O)=>v(Na({id:O,action:"FS",payload:{method:"unlink",args:[M]}})),y=(M,O,U)=>v(Na({id:U,action:"FS",payload:{method:M,args:O}})),I=(M,O)=>v(Na({id:O,action:"loadLanguage",payload:{langs:M,options:{langPath:l.langPath,dataPath:l.dataPath,cachePath:l.cachePath,cacheMethod:l.cacheMethod,gzip:l.gzip,lstmOnly:[oi.DEFAULT,oi.LSTM_ONLY].includes(f)&&!l.legacyLang}}})),b=(M,O,U,J)=>v(Na({id:J,action:"initialize",payload:{langs:M,oem:O,config:U}})),w=(M="eng",O,U,J)=>{if(m&&[oi.TESSERACT_ONLY,oi.TESSERACT_LSTM_COMBINED].includes(O))throw Error("Legacy model requested but code missing.");let Q=O||f;f=Q;let re=U||p;p=re;let Oe=(typeof M=="string"?M.split("+"):M).filter($e=>!c.includes($e));return c.push(...Oe),Oe.length>0?I(Oe,J).then(()=>b(M,Q,re,J)):b(M,Q,re,J)},A=(M={},O)=>v(Na({id:O,action:"setParameters",payload:{params:M}})),T=async(M,O={},U={text:!0},J)=>v(Na({id:J,action:"recognize",payload:{image:await TL(M),options:O,output:U}})),$=async(M,O)=>{if(m)throw Error("`worker.detect` requires Legacy model, which was not loaded.");return v(Na({id:O,action:"detect",payload:{image:await TL(M)}}))},He=async()=>(E!==null&&(aO(E),E=null),Promise.resolve());rO(E,({workerId:M,jobId:O,status:U,action:J,data:Q})=>{let re=`${J}-${O}`;if(U==="resolve")vL(`[${M}]: Complete ${O}`),u[re].resolve({jobId:O,data:Q}),delete u[re];else if(U==="reject")if(u[re].reject(Q),delete u[re],J==="load"&&S(Q),i)i(Q);else throw Error(Q);else U==="progress"&&s({...Q,userJobId:O})});let At={id:r,worker:E,load:C,writeText:H,readText:G,removeFile:_,FS:y,reinitialize:w,setParameters:A,recognize:T,detect:$,terminate:He};return x().then(()=>I(t)).then(()=>b(t,e,a)).then(()=>R(At)).catch(()=>{}),D}});var LL=Pe((yB,CL)=>{"use strict";var wL=Jy(),iO=async(t,e,n)=>{let a=await wL(e,1,n);return a.recognize(t).finally(async()=>{await a.terminate()})},oO=async(t,e)=>{let n=await wL("osd",0,e);return n.detect(t).finally(async()=>{await n.terminate()})};CL.exports={recognize:iO,detect:oO}});var xL=Pe((IB,AL)=>{"use strict";AL.exports={AFR:"afr",AMH:"amh",ARA:"ara",ASM:"asm",AZE:"aze",AZE_CYRL:"aze_cyrl",BEL:"bel",BEN:"ben",BOD:"bod",BOS:"bos",BUL:"bul",CAT:"cat",CEB:"ceb",CES:"ces",CHI_SIM:"chi_sim",CHI_TRA:"chi_tra",CHR:"chr",CYM:"cym",DAN:"dan",DEU:"deu",DZO:"dzo",ELL:"ell",ENG:"eng",ENM:"enm",EPO:"epo",EST:"est",EUS:"eus",FAS:"fas",FIN:"fin",FRA:"fra",FRK:"frk",FRM:"frm",GLE:"gle",GLG:"glg",GRC:"grc",GUJ:"guj",HAT:"hat",HEB:"heb",HIN:"hin",HRV:"hrv",HUN:"hun",IKU:"iku",IND:"ind",ISL:"isl",ITA:"ita",ITA_OLD:"ita_old",JAV:"jav",JPN:"jpn",KAN:"kan",KAT:"kat",KAT_OLD:"kat_old",KAZ:"kaz",KHM:"khm",KIR:"kir",KOR:"kor",KUR:"kur",LAO:"lao",LAT:"lat",LAV:"lav",LIT:"lit",MAL:"mal",MAR:"mar",MKD:"mkd",MLT:"mlt",MSA:"msa",MYA:"mya",NEP:"nep",NLD:"nld",NOR:"nor",ORI:"ori",PAN:"pan",POL:"pol",POR:"por",PUS:"pus",RON:"ron",RUS:"rus",SAN:"san",SIN:"sin",SLK:"slk",SLV:"slv",SPA:"spa",SPA_OLD:"spa_old",SQI:"sqi",SRP:"srp",SRP_LATN:"srp_latn",SWA:"swa",SWE:"swe",SYR:"syr",TAM:"tam",TEL:"tel",TGK:"tgk",TGL:"tgl",THA:"tha",TIR:"tir",TUR:"tur",UIG:"uig",UKR:"ukr",URD:"urd",UZB:"uzb",UZB_CYRL:"uzb_cyrl",VIE:"vie",YID:"yid"}});var kL=Pe((_B,RL)=>{"use strict";RL.exports={OSD_ONLY:"0",AUTO_OSD:"1",AUTO_ONLY:"2",AUTO:"3",SINGLE_COLUMN:"4",SINGLE_BLOCK_VERT_TEXT:"5",SINGLE_BLOCK:"6",SINGLE_LINE:"7",SINGLE_WORD:"8",CIRCLE_WORD:"9",SINGLE_CHAR:"10",SPARSE_TEXT:"11",SPARSE_TEXT_OSD:"12",RAW_LINE:"13"}});var PL=Pe((SB,DL)=>{"use strict";jC();var lO=JC(),uO=Jy(),cO=LL(),dO=xL(),fO=Qy(),hO=kL(),{setLogging:pO}=Qf();DL.exports={languages:dO,OEM:fO,PSM:hO,createScheduler:lO,createWorker:uO,setLogging:pO,...cO}});var zR=Pe(Bp=>{"use strict";var lF=Symbol.for("react.transitional.element"),uF=Symbol.for("react.fragment");function qR(t,e,n){var a=null;if(n!==void 0&&(a=""+n),e.key!==void 0&&(a=""+e.key),"key"in e){n={};for(var r in e)r!=="key"&&(n[r]=e[r])}else n=e;return e=n.ref,{$$typeof:lF,type:t,key:a,ref:e!==void 0?e:null,props:n}}Bp.Fragment=uF;Bp.jsx=qR;Bp.jsxs=qR});var Ke=Pe((N3,HR)=>{"use strict";HR.exports=zR()});var JR={};G1(JR,{captureScreenshot:()=>fF});var fF,ZR=H1(()=>{fF=async()=>null});var ve=pe(Cn()),v1=pe(GC());var qy="http://localhost:3000";console.log("[EXTENSION] Using API_BASE:",qy);function VP(t){return typeof t=="string"?t.startsWith("http")?t:qy+t:t instanceof URL?t.href:t.url}function UP(t,e={}){let n=VP(t),a=e.method||"GET",r=e.headers instanceof Headers||Array.isArray(e.headers)?Object.fromEntries(e.headers):{...e.headers},s=e.body??null;return new Promise((i,l)=>{chrome.runtime.sendMessage({type:"echly-api",url:n,method:a,headers:r,body:s},u=>{if(chrome.runtime.lastError){l(new Error(chrome.runtime.lastError.message));return}if(!u){l(new Error("No response from background"));return}let c=new Response(u.body??"",{status:u.status??0,headers:u.headers?new Headers(u.headers):void 0});i(c)})})}async function vt(t,e={}){let n=t.startsWith("http")?t:qy+t;return UP(n,e)}function zy(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`fb-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}function Hy(){return zy()}function Gy(t,e,n){return new Promise((a,r)=>{chrome.runtime.sendMessage({type:"ECHLY_UPLOAD_SCREENSHOT",imageDataUrl:t,sessionId:e,screenshotId:n},s=>{if(chrome.runtime.lastError){r(new Error(chrome.runtime.lastError.message));return}if(s?.error){r(new Error(s.error));return}if(s?.url){a(s.url);return}r(new Error("No URL from background"))})})}async function Zy(t){if(!t||typeof t!="string")return"";try{let n=await(await Promise.resolve().then(()=>pe(PL()))).createWorker("eng",void 0,{logger:()=>{}}),{data:{text:a}}=await n.recognize(t);return await n.terminate(),!a||typeof a!="string"?"":a.replace(/\s+/g," ").trim().slice(0,2e3)}catch{return""}}var nr=pe(Cn());var OL=()=>{};var VL=function(t){let e=[],n=0;for(let a=0;a<t.length;a++){let r=t.charCodeAt(a);r<128?e[n++]=r:r<2048?(e[n++]=r>>6|192,e[n++]=r&63|128):(r&64512)===55296&&a+1<t.length&&(t.charCodeAt(a+1)&64512)===56320?(r=65536+((r&1023)<<10)+(t.charCodeAt(++a)&1023),e[n++]=r>>18|240,e[n++]=r>>12&63|128,e[n++]=r>>6&63|128,e[n++]=r&63|128):(e[n++]=r>>12|224,e[n++]=r>>6&63|128,e[n++]=r&63|128)}return e},mO=function(t){let e=[],n=0,a=0;for(;n<t.length;){let r=t[n++];if(r<128)e[a++]=String.fromCharCode(r);else if(r>191&&r<224){let s=t[n++];e[a++]=String.fromCharCode((r&31)<<6|s&63)}else if(r>239&&r<365){let s=t[n++],i=t[n++],l=t[n++],u=((r&7)<<18|(s&63)<<12|(i&63)<<6|l&63)-65536;e[a++]=String.fromCharCode(55296+(u>>10)),e[a++]=String.fromCharCode(56320+(u&1023))}else{let s=t[n++],i=t[n++];e[a++]=String.fromCharCode((r&15)<<12|(s&63)<<6|i&63)}}return e.join("")},UL={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(t,e){if(!Array.isArray(t))throw Error("encodeByteArray takes an array as a parameter");this.init_();let n=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,a=[];for(let r=0;r<t.length;r+=3){let s=t[r],i=r+1<t.length,l=i?t[r+1]:0,u=r+2<t.length,c=u?t[r+2]:0,f=s>>2,p=(s&3)<<4|l>>4,m=(l&15)<<2|c>>6,S=c&63;u||(S=64,i||(m=64)),a.push(n[f],n[p],n[m],n[S])}return a.join("")},encodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(t):this.encodeByteArray(VL(t),e)},decodeString(t,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(t):mO(this.decodeStringToByteArray(t,e))},decodeStringToByteArray(t,e){this.init_();let n=e?this.charToByteMapWebSafe_:this.charToByteMap_,a=[];for(let r=0;r<t.length;){let s=n[t.charAt(r++)],l=r<t.length?n[t.charAt(r)]:0;++r;let c=r<t.length?n[t.charAt(r)]:64;++r;let p=r<t.length?n[t.charAt(r)]:64;if(++r,s==null||l==null||c==null||p==null)throw new tI;let m=s<<2|l>>4;if(a.push(m),c!==64){let S=l<<4&240|c>>2;if(a.push(S),p!==64){let R=c<<6&192|p;a.push(R)}}}return a},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let t=0;t<this.ENCODED_VALS.length;t++)this.byteToCharMap_[t]=this.ENCODED_VALS.charAt(t),this.charToByteMap_[this.byteToCharMap_[t]]=t,this.byteToCharMapWebSafe_[t]=this.ENCODED_VALS_WEBSAFE.charAt(t),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]]=t,t>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)]=t,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)]=t)}}},tI=class extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}},gO=function(t){let e=VL(t);return UL.encodeByteArray(e,!0)},Hu=function(t){return gO(t).replace(/\./g,"")},Jf=function(t){try{return UL.decodeString(t,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};function FL(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}var yO=()=>FL().__FIREBASE_DEFAULTS__,IO=()=>{if(typeof process>"u"||typeof process.env>"u")return;let t=process.env.__FIREBASE_DEFAULTS__;if(t)return JSON.parse(t)},_O=()=>{if(typeof document>"u")return;let t;try{t=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}let e=t&&Jf(t[1]);return e&&JSON.parse(e)},Zf=()=>{try{return OL()||yO()||IO()||_O()}catch(t){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);return}},aI=t=>Zf()?.emulatorHosts?.[t],eh=t=>{let e=aI(t);if(!e)return;let n=e.lastIndexOf(":");if(n<=0||n+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);let a=parseInt(e.substring(n+1),10);return e[0]==="["?[e.substring(1,n-1),a]:[e.substring(0,n),a]},rI=()=>Zf()?.config,sI=t=>Zf()?.[`_${t}`];var $f=class{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}wrapCallback(e){return(n,a)=>{n?this.reject(n):this.resolve(a),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(n):e(n,a))}}};function Va(t){try{return(t.startsWith("http://")||t.startsWith("https://")?new URL(t).hostname:t).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Do(t){return(await fetch(t,{credentials:"include"})).ok}function th(t,e){if(t.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');let n={alg:"none",type:"JWT"},a=e||"demo-project",r=t.iat||0,s=t.sub||t.user_id;if(!s)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");let i={iss:`https://securetoken.google.com/${a}`,aud:a,iat:r,exp:r+3600,auth_time:r,sub:s,user_id:s,firebase:{sign_in_provider:"custom",identities:{}},...t};return[Hu(JSON.stringify(n)),Hu(JSON.stringify(i)),""].join(".")}var zu={};function SO(){let t={prod:[],emulator:[]};for(let e of Object.keys(zu))zu[e]?t.emulator.push(e):t.prod.push(e);return t}function vO(t){let e=document.getElementById(t),n=!1;return e||(e=document.createElement("div"),e.setAttribute("id",t),n=!0),{created:n,element:e}}var ML=!1;function Po(t,e){if(typeof window>"u"||typeof document>"u"||!Va(window.location.host)||zu[t]===e||zu[t]||ML)return;zu[t]=e;function n(m){return`__firebase__banner__${m}`}let a="__firebase__banner",s=SO().prod.length>0;function i(){let m=document.getElementById(a);m&&m.remove()}function l(m){m.style.display="flex",m.style.background="#7faaf0",m.style.position="fixed",m.style.bottom="5px",m.style.left="5px",m.style.padding=".5em",m.style.borderRadius="5px",m.style.alignItems="center"}function u(m,S){m.setAttribute("width","24"),m.setAttribute("id",S),m.setAttribute("height","24"),m.setAttribute("viewBox","0 0 24 24"),m.setAttribute("fill","none"),m.style.marginLeft="-6px"}function c(){let m=document.createElement("span");return m.style.cursor="pointer",m.style.marginLeft="16px",m.style.fontSize="24px",m.innerHTML=" &times;",m.onclick=()=>{ML=!0,i()},m}function f(m,S){m.setAttribute("id",S),m.innerText="Learn more",m.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",m.setAttribute("target","__blank"),m.style.paddingLeft="5px",m.style.textDecoration="underline"}function p(){let m=vO(a),S=n("text"),R=document.getElementById(S)||document.createElement("span"),D=n("learnmore"),L=document.getElementById(D)||document.createElement("a"),E=n("preprendIcon"),v=document.getElementById(E)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(m.created){let C=m.element;l(C),f(L,D);let x=c();u(v,E),C.append(v,R,L,x),document.body.appendChild(C)}s?(R.innerText="Preview backend disconnected.",v.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
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
</defs>`,R.innerText="Preview backend running in this workspace."),R.setAttribute("id",S)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",p):p()}function Jt(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function BL(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Jt())}function TO(){let t=Zf()?.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function qL(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function zL(){let t=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof t=="object"&&t.id!==void 0}function HL(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function GL(){let t=Jt();return t.indexOf("MSIE ")>=0||t.indexOf("Trident/")>=0}function jL(){return!TO()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function iI(){try{return typeof indexedDB=="object"}catch{return!1}}function KL(){return new Promise((t,e)=>{try{let n=!0,a="validate-browser-context-for-indexeddb-analytics-module",r=self.indexedDB.open(a);r.onsuccess=()=>{r.result.close(),n||self.indexedDB.deleteDatabase(a),t(!0)},r.onupgradeneeded=()=>{n=!1},r.onerror=()=>{e(r.error?.message||"")}}catch(n){e(n)}})}var EO="FirebaseError",En=class t extends Error{constructor(e,n,a){super(n),this.code=e,this.customData=a,this.name=EO,Object.setPrototypeOf(this,t.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Lr.prototype.create)}},Lr=class{constructor(e,n,a){this.service=e,this.serviceName=n,this.errors=a}create(e,...n){let a=n[0]||{},r=`${this.service}/${e}`,s=this.errors[e],i=s?bO(s,a):"Error",l=`${this.serviceName}: ${i} (${r}).`;return new En(r,l,a)}};function bO(t,e){return t.replace(wO,(n,a)=>{let r=e[a];return r!=null?String(r):`<${a}?>`})}var wO=/\{\$([^}]+)}/g;function WL(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}function Ia(t,e){if(t===e)return!0;let n=Object.keys(t),a=Object.keys(e);for(let r of n){if(!a.includes(r))return!1;let s=t[r],i=e[r];if(NL(s)&&NL(i)){if(!Ia(s,i))return!1}else if(s!==i)return!1}for(let r of a)if(!n.includes(r))return!1;return!0}function NL(t){return t!==null&&typeof t=="object"}function Oo(t){let e=[];for(let[n,a]of Object.entries(t))Array.isArray(a)?a.forEach(r=>{e.push(encodeURIComponent(n)+"="+encodeURIComponent(r))}):e.push(encodeURIComponent(n)+"="+encodeURIComponent(a));return e.length?"&"+e.join("&"):""}function Mo(t){let e={};return t.replace(/^\?/,"").split("&").forEach(a=>{if(a){let[r,s]=a.split("=");e[decodeURIComponent(r)]=decodeURIComponent(s)}}),e}function No(t){let e=t.indexOf("?");if(!e)return"";let n=t.indexOf("#",e);return t.substring(e,n>0?n:void 0)}function XL(t,e){let n=new nI(t,e);return n.subscribe.bind(n)}var nI=class{constructor(e,n){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=n,this.task.then(()=>{e(this)}).catch(a=>{this.error(a)})}next(e){this.forEachObserver(n=>{n.next(e)})}error(e){this.forEachObserver(n=>{n.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,n,a){let r;if(e===void 0&&n===void 0&&a===void 0)throw new Error("Missing Observer.");CO(e,["next","error","complete"])?r=e:r={next:e,error:n,complete:a},r.next===void 0&&(r.next=eI),r.error===void 0&&(r.error=eI),r.complete===void 0&&(r.complete=eI);let s=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?r.error(this.finalError):r.complete()}catch{}}),this.observers.push(r),s}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let n=0;n<this.observers.length;n++)this.sendOne(n,e)}sendOne(e,n){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{n(this.observers[e])}catch(a){typeof console<"u"&&console.error&&console.error(a)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}};function CO(t,e){if(typeof t!="object"||t===null)return!1;for(let n of e)if(n in t&&typeof t[n]=="function")return!0;return!1}function eI(){}var bB=4*60*60*1e3;function Zt(t){return t&&t._delegate?t._delegate:t}var On=class{constructor(e,n,a){this.name=e,this.instanceFactory=n,this.type=a,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}};var li="[DEFAULT]";var oI=class{constructor(e,n){this.name=e,this.container=n,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){let n=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(n)){let a=new $f;if(this.instancesDeferred.set(n,a),this.isInitialized(n)||this.shouldAutoInitialize())try{let r=this.getOrInitializeService({instanceIdentifier:n});r&&a.resolve(r)}catch{}}return this.instancesDeferred.get(n).promise}getImmediate(e){let n=this.normalizeInstanceIdentifier(e?.identifier),a=e?.optional??!1;if(this.isInitialized(n)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:n})}catch(r){if(a)return null;throw r}else{if(a)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(AO(e))try{this.getOrInitializeService({instanceIdentifier:li})}catch{}for(let[n,a]of this.instancesDeferred.entries()){let r=this.normalizeInstanceIdentifier(n);try{let s=this.getOrInitializeService({instanceIdentifier:r});a.resolve(s)}catch{}}}}clearInstance(e=li){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){let e=Array.from(this.instances.values());await Promise.all([...e.filter(n=>"INTERNAL"in n).map(n=>n.INTERNAL.delete()),...e.filter(n=>"_delete"in n).map(n=>n._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=li){return this.instances.has(e)}getOptions(e=li){return this.instancesOptions.get(e)||{}}initialize(e={}){let{options:n={}}=e,a=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(a))throw Error(`${this.name}(${a}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);let r=this.getOrInitializeService({instanceIdentifier:a,options:n});for(let[s,i]of this.instancesDeferred.entries()){let l=this.normalizeInstanceIdentifier(s);a===l&&i.resolve(r)}return r}onInit(e,n){let a=this.normalizeInstanceIdentifier(n),r=this.onInitCallbacks.get(a)??new Set;r.add(e),this.onInitCallbacks.set(a,r);let s=this.instances.get(a);return s&&e(s,a),()=>{r.delete(e)}}invokeOnInitCallbacks(e,n){let a=this.onInitCallbacks.get(n);if(a)for(let r of a)try{r(e,n)}catch{}}getOrInitializeService({instanceIdentifier:e,options:n={}}){let a=this.instances.get(e);if(!a&&this.component&&(a=this.component.instanceFactory(this.container,{instanceIdentifier:LO(e),options:n}),this.instances.set(e,a),this.instancesOptions.set(e,n),this.invokeOnInitCallbacks(a,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,a)}catch{}return a||null}normalizeInstanceIdentifier(e=li){return this.component?this.component.multipleInstances?e:li:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}};function LO(t){return t===li?void 0:t}function AO(t){return t.instantiationMode==="EAGER"}var nh=class{constructor(e){this.name=e,this.providers=new Map}addComponent(e){let n=this.getProvider(e.name);if(n.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);n.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);let n=new oI(e,this);return this.providers.set(e,n),n}getProviders(){return Array.from(this.providers.values())}};var xO=[],ge;(function(t){t[t.DEBUG=0]="DEBUG",t[t.VERBOSE=1]="VERBOSE",t[t.INFO=2]="INFO",t[t.WARN=3]="WARN",t[t.ERROR=4]="ERROR",t[t.SILENT=5]="SILENT"})(ge||(ge={}));var RO={debug:ge.DEBUG,verbose:ge.VERBOSE,info:ge.INFO,warn:ge.WARN,error:ge.ERROR,silent:ge.SILENT},kO=ge.INFO,DO={[ge.DEBUG]:"log",[ge.VERBOSE]:"log",[ge.INFO]:"info",[ge.WARN]:"warn",[ge.ERROR]:"error"},PO=(t,e,...n)=>{if(e<t.logLevel)return;let a=new Date().toISOString(),r=DO[e];if(r)console[r](`[${a}]  ${t.name}:`,...n);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)},Ls=class{constructor(e){this.name=e,this._logLevel=kO,this._logHandler=PO,this._userLogHandler=null,xO.push(this)}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in ge))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?RO[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,ge.DEBUG,...e),this._logHandler(this,ge.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,ge.VERBOSE,...e),this._logHandler(this,ge.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,ge.INFO,...e),this._logHandler(this,ge.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,ge.WARN,...e),this._logHandler(this,ge.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,ge.ERROR,...e),this._logHandler(this,ge.ERROR,...e)}};var OO=(t,e)=>e.some(n=>t instanceof n),QL,YL;function MO(){return QL||(QL=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function NO(){return YL||(YL=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var $L=new WeakMap,uI=new WeakMap,JL=new WeakMap,lI=new WeakMap,dI=new WeakMap;function VO(t){let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{n(Ua(t.result)),r()},i=()=>{a(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(n=>{n instanceof IDBCursor&&$L.set(n,t)}).catch(()=>{}),dI.set(e,t),e}function UO(t){if(uI.has(t))return;let e=new Promise((n,a)=>{let r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{n(),r()},i=()=>{a(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});uI.set(t,e)}var cI={get(t,e,n){if(t instanceof IDBTransaction){if(e==="done")return uI.get(t);if(e==="objectStoreNames")return t.objectStoreNames||JL.get(t);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return Ua(t[e])},set(t,e,n){return t[e]=n,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function ZL(t){cI=t(cI)}function FO(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let a=t.call(ah(this),e,...n);return JL.set(a,e.sort?e.sort():[e]),Ua(a)}:NO().includes(t)?function(...e){return t.apply(ah(this),e),Ua($L.get(this))}:function(...e){return Ua(t.apply(ah(this),e))}}function BO(t){return typeof t=="function"?FO(t):(t instanceof IDBTransaction&&UO(t),OO(t,MO())?new Proxy(t,cI):t)}function Ua(t){if(t instanceof IDBRequest)return VO(t);if(lI.has(t))return lI.get(t);let e=BO(t);return e!==t&&(lI.set(t,e),dI.set(e,t)),e}var ah=t=>dI.get(t);function tA(t,e,{blocked:n,upgrade:a,blocking:r,terminated:s}={}){let i=indexedDB.open(t,e),l=Ua(i);return a&&i.addEventListener("upgradeneeded",u=>{a(Ua(i.result),u.oldVersion,u.newVersion,Ua(i.transaction),u)}),n&&i.addEventListener("blocked",u=>n(u.oldVersion,u.newVersion,u)),l.then(u=>{s&&u.addEventListener("close",()=>s()),r&&u.addEventListener("versionchange",c=>r(c.oldVersion,c.newVersion,c))}).catch(()=>{}),l}var qO=["get","getKey","getAll","getAllKeys","count"],zO=["put","add","delete","clear"],fI=new Map;function eA(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(fI.get(e))return fI.get(e);let n=e.replace(/FromIndex$/,""),a=e!==n,r=zO.includes(n);if(!(n in(a?IDBIndex:IDBObjectStore).prototype)||!(r||qO.includes(n)))return;let s=async function(i,...l){let u=this.transaction(i,r?"readwrite":"readonly"),c=u.store;return a&&(c=c.index(l.shift())),(await Promise.all([c[n](...l),r&&u.done]))[0]};return fI.set(e,s),s}ZL(t=>({...t,get:(e,n,a)=>eA(e,n)||t.get(e,n,a),has:(e,n)=>!!eA(e,n)||t.has(e,n)}));var pI=class{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(n=>{if(HO(n)){let a=n.getImmediate();return`${a.library}/${a.version}`}else return null}).filter(n=>n).join(" ")}};function HO(t){return t.getComponent()?.type==="VERSION"}var mI="@firebase/app",nA="0.14.9";var Ar=new Ls("@firebase/app"),GO="@firebase/app-compat",jO="@firebase/analytics-compat",KO="@firebase/analytics",WO="@firebase/app-check-compat",XO="@firebase/app-check",QO="@firebase/auth",YO="@firebase/auth-compat",$O="@firebase/database",JO="@firebase/data-connect",ZO="@firebase/database-compat",eM="@firebase/functions",tM="@firebase/functions-compat",nM="@firebase/installations",aM="@firebase/installations-compat",rM="@firebase/messaging",sM="@firebase/messaging-compat",iM="@firebase/performance",oM="@firebase/performance-compat",lM="@firebase/remote-config",uM="@firebase/remote-config-compat",cM="@firebase/storage",dM="@firebase/storage-compat",fM="@firebase/firestore",hM="@firebase/ai",pM="@firebase/firestore-compat",mM="firebase",gM="12.10.0";var gI="[DEFAULT]",yM={[mI]:"fire-core",[GO]:"fire-core-compat",[KO]:"fire-analytics",[jO]:"fire-analytics-compat",[XO]:"fire-app-check",[WO]:"fire-app-check-compat",[QO]:"fire-auth",[YO]:"fire-auth-compat",[$O]:"fire-rtdb",[JO]:"fire-data-connect",[ZO]:"fire-rtdb-compat",[eM]:"fire-fn",[tM]:"fire-fn-compat",[nM]:"fire-iid",[aM]:"fire-iid-compat",[rM]:"fire-fcm",[sM]:"fire-fcm-compat",[iM]:"fire-perf",[oM]:"fire-perf-compat",[lM]:"fire-rc",[uM]:"fire-rc-compat",[cM]:"fire-gcs",[dM]:"fire-gcs-compat",[fM]:"fire-fst",[pM]:"fire-fst-compat",[hM]:"fire-vertex","fire-js":"fire-js",[mM]:"fire-js-all"};var rh=new Map,IM=new Map,yI=new Map;function aA(t,e){try{t.container.addComponent(e)}catch(n){Ar.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`,n)}}function Fa(t){let e=t.name;if(yI.has(e))return Ar.debug(`There were multiple attempts to register component ${e}.`),!1;yI.set(e,t);for(let n of rh.values())aA(n,t);for(let n of IM.values())aA(n,t);return!0}function ui(t,e){let n=t.container.getProvider("heartbeat").getImmediate({optional:!0});return n&&n.triggerHeartbeat(),t.container.getProvider(e)}function Nn(t){return t==null?!1:t.settings!==void 0}var _M={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},As=new Lr("app","Firebase",_M);var II=class{constructor(e,n,a){this._isDeleted=!1,this._options={...e},this._config={...n},this._name=n.name,this._automaticDataCollectionEnabled=n.automaticDataCollectionEnabled,this._container=a,this.container.addComponent(new On("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw As.create("app-deleted",{appName:this._name})}};var Ba=gM;function vI(t,e={}){let n=t;typeof e!="object"&&(e={name:e});let a={name:gI,automaticDataCollectionEnabled:!0,...e},r=a.name;if(typeof r!="string"||!r)throw As.create("bad-app-name",{appName:String(r)});if(n||(n=rI()),!n)throw As.create("no-options");let s=rh.get(r);if(s){if(Ia(n,s.options)&&Ia(a,s.config))return s;throw As.create("duplicate-app",{appName:r})}let i=new nh(r);for(let u of yI.values())i.addComponent(u);let l=new II(n,a,i);return rh.set(r,l),l}function Vo(t=gI){let e=rh.get(t);if(!e&&t===gI&&rI())return vI();if(!e)throw As.create("no-app",{appName:t});return e}function Mn(t,e,n){let a=yM[t]??t;n&&(a+=`-${n}`);let r=a.match(/\s|\//),s=e.match(/\s|\//);if(r||s){let i=[`Unable to register library "${a}" with version "${e}":`];r&&i.push(`library name "${a}" contains illegal characters (whitespace or "/")`),r&&s&&i.push("and"),s&&i.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ar.warn(i.join(" "));return}Fa(new On(`${a}-version`,()=>({library:a,version:e}),"VERSION"))}var SM="firebase-heartbeat-database",vM=1,Gu="firebase-heartbeat-store",hI=null;function oA(){return hI||(hI=tA(SM,vM,{upgrade:(t,e)=>{switch(e){case 0:try{t.createObjectStore(Gu)}catch(n){console.warn(n)}}}}).catch(t=>{throw As.create("idb-open",{originalErrorMessage:t.message})})),hI}async function TM(t){try{let n=(await oA()).transaction(Gu),a=await n.objectStore(Gu).get(lA(t));return await n.done,a}catch(e){if(e instanceof En)Ar.warn(e.message);else{let n=As.create("idb-get",{originalErrorMessage:e?.message});Ar.warn(n.message)}}}async function rA(t,e){try{let a=(await oA()).transaction(Gu,"readwrite");await a.objectStore(Gu).put(e,lA(t)),await a.done}catch(n){if(n instanceof En)Ar.warn(n.message);else{let a=As.create("idb-set",{originalErrorMessage:n?.message});Ar.warn(a.message)}}}function lA(t){return`${t.name}!${t.options.appId}`}var EM=1024,bM=30,_I=class{constructor(e){this.container=e,this._heartbeatsCache=null;let n=this.container.getProvider("app").getImmediate();this._storage=new SI(n),this._heartbeatsCachePromise=this._storage.read().then(a=>(this._heartbeatsCache=a,a))}async triggerHeartbeat(){try{let n=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=sA();if(this._heartbeatsCache?.heartbeats==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(r=>r.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:n}),this._heartbeatsCache.heartbeats.length>bM){let r=CM(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(r,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(e){Ar.warn(e)}}async getHeartbeatsHeader(){try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,this._heartbeatsCache?.heartbeats==null||this._heartbeatsCache.heartbeats.length===0)return"";let e=sA(),{heartbeatsToSend:n,unsentEntries:a}=wM(this._heartbeatsCache.heartbeats),r=Hu(JSON.stringify({version:2,heartbeats:n}));return this._heartbeatsCache.lastSentHeartbeatDate=e,a.length>0?(this._heartbeatsCache.heartbeats=a,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),r}catch(e){return Ar.warn(e),""}}};function sA(){return new Date().toISOString().substring(0,10)}function wM(t,e=EM){let n=[],a=t.slice();for(let r of t){let s=n.find(i=>i.agent===r.agent);if(s){if(s.dates.push(r.date),iA(n)>e){s.dates.pop();break}}else if(n.push({agent:r.agent,dates:[r.date]}),iA(n)>e){n.pop();break}a=a.slice(1)}return{heartbeatsToSend:n,unsentEntries:a}}var SI=class{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return iI()?KL().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){let n=await TM(this.app);return n?.heartbeats?n:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return rA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){if(await this._canUseIndexedDBPromise){let a=await this.read();return rA(this.app,{lastSentHeartbeatDate:e.lastSentHeartbeatDate??a.lastSentHeartbeatDate,heartbeats:[...a.heartbeats,...e.heartbeats]})}else return}};function iA(t){return Hu(JSON.stringify({version:2,heartbeats:t})).length}function CM(t){if(t.length===0)return-1;let e=0,n=t[0].date;for(let a=1;a<t.length;a++)t[a].date<n&&(n=t[a].date,e=a);return e}function LM(t){Fa(new On("platform-logger",e=>new pI(e),"PRIVATE")),Fa(new On("heartbeat",e=>new _I(e),"PRIVATE")),Mn(mI,nA,t),Mn(mI,nA,"esm2020"),Mn("fire-js","")}LM("");var AM="firebase",xM="12.10.0";Mn(AM,xM,"app");function LA(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}var AA=LA,xA=new Lr("auth","Firebase",LA());var dh=new Ls("@firebase/auth");function RM(t,...e){dh.logLevel<=ge.WARN&&dh.warn(`Auth (${Ba}): ${t}`,...e)}function ih(t,...e){dh.logLevel<=ge.ERROR&&dh.error(`Auth (${Ba}): ${t}`,...e)}function _a(t,...e){throw KI(t,...e)}function za(t,...e){return KI(t,...e)}function RA(t,e,n){let a={...AA(),[e]:n};return new Lr("auth","Firebase",a).create(e,{appName:t.name})}function ci(t){return RA(t,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function KI(t,...e){if(typeof t!="string"){let n=e[0],a=[...e.slice(1)];return a[0]&&(a[0].appName=t.name),t._errorFactory.create(n,...a)}return xA.create(t,...e)}function ee(t,e,...n){if(!t)throw KI(e,...n)}function qa(t){let e="INTERNAL ASSERTION FAILED: "+t;throw ih(e),new Error(e)}function Rr(t,e){t||qa(e)}function LI(){return typeof self<"u"&&self.location?.href||""}function kM(){return uA()==="http:"||uA()==="https:"}function uA(){return typeof self<"u"&&self.location?.protocol||null}function DM(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(kM()||zL()||"connection"in navigator)?navigator.onLine:!0}function PM(){if(typeof navigator>"u")return null;let t=navigator;return t.languages&&t.languages[0]||t.language||null}var di=class{constructor(e,n){this.shortDelay=e,this.longDelay=n,Rr(n>e,"Short delay should be less than long delay!"),this.isMobile=BL()||HL()}get(){return DM()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}};function WI(t,e){Rr(t.emulator,"Emulator should always be set here");let{url:n}=t.emulator;return e?`${n}${e.startsWith("/")?e.slice(1):e}`:n}var fh=class{static initialize(e,n,a){this.fetchImpl=e,n&&(this.headersImpl=n),a&&(this.responseImpl=a)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;qa("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;qa("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;qa("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}};var OM={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};var MM=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],NM=new di(3e4,6e4);function en(t,e){return t.tenantId&&!e.tenantId?{...e,tenantId:t.tenantId}:e}async function pn(t,e,n,a,r={}){return kA(t,r,async()=>{let s={},i={};a&&(e==="GET"?i=a:s={body:JSON.stringify(a)});let l=Oo({key:t.config.apiKey,...i}).slice(1),u=await t._getAdditionalHeaders();u["Content-Type"]="application/json",t.languageCode&&(u["X-Firebase-Locale"]=t.languageCode);let c={method:e,headers:u,...s};return qL()||(c.referrerPolicy="no-referrer"),t.emulatorConfig&&Va(t.emulatorConfig.host)&&(c.credentials="include"),fh.fetch()(await DA(t,t.config.apiHost,n,l),c)})}async function kA(t,e,n){t._canInitEmulator=!1;let a={...OM,...e};try{let r=new AI(t),s=await Promise.race([n(),r.promise]);r.clearNetworkTimeout();let i=await s.json();if("needConfirmation"in i)throw Ku(t,"account-exists-with-different-credential",i);if(s.ok&&!("errorMessage"in i))return i;{let l=s.ok?i.errorMessage:i.error.message,[u,c]=l.split(" : ");if(u==="FEDERATED_USER_ID_ALREADY_LINKED")throw Ku(t,"credential-already-in-use",i);if(u==="EMAIL_EXISTS")throw Ku(t,"email-already-in-use",i);if(u==="USER_DISABLED")throw Ku(t,"user-disabled",i);let f=a[u]||u.toLowerCase().replace(/[_\s]+/g,"-");if(c)throw RA(t,f,c);_a(t,f)}}catch(r){if(r instanceof En)throw r;_a(t,"network-request-failed",{message:String(r)})}}async function gi(t,e,n,a,r={}){let s=await pn(t,e,n,a,r);return"mfaPendingCredential"in s&&_a(t,"multi-factor-auth-required",{_serverResponse:s}),s}async function DA(t,e,n,a){let r=`${e}${n}?${a}`,s=t,i=s.config.emulator?WI(t.config,r):`${t.config.apiScheme}://${r}`;return MM.includes(n)&&(await s._persistenceManagerAvailable,s._getPersistenceType()==="COOKIE")?s._getPersistence()._getFinalTarget(i).toString():i}function VM(t){switch(t){case"ENFORCE":return"ENFORCE";case"AUDIT":return"AUDIT";case"OFF":return"OFF";default:return"ENFORCEMENT_STATE_UNSPECIFIED"}}var AI=class{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((n,a)=>{this.timer=setTimeout(()=>a(za(this.auth,"network-request-failed")),NM.get())})}};function Ku(t,e,n){let a={appName:t.name};n.email&&(a.email=n.email),n.phoneNumber&&(a.phoneNumber=n.phoneNumber);let r=za(t,e,a);return r.customData._tokenResponse=n,r}function cA(t){return t!==void 0&&t.enterprise!==void 0}var hh=class{constructor(e){if(this.siteKey="",this.recaptchaEnforcementState=[],e.recaptchaKey===void 0)throw new Error("recaptchaKey undefined");this.siteKey=e.recaptchaKey.split("/")[3],this.recaptchaEnforcementState=e.recaptchaEnforcementState}getProviderEnforcementState(e){if(!this.recaptchaEnforcementState||this.recaptchaEnforcementState.length===0)return null;for(let n of this.recaptchaEnforcementState)if(n.provider&&n.provider===e)return VM(n.enforcementState);return null}isProviderEnabled(e){return this.getProviderEnforcementState(e)==="ENFORCE"||this.getProviderEnforcementState(e)==="AUDIT"}isAnyProviderEnabled(){return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")||this.isProviderEnabled("PHONE_PROVIDER")}};async function PA(t,e){return pn(t,"GET","/v2/recaptchaConfig",en(t,e))}async function UM(t,e){return pn(t,"POST","/v1/accounts:delete",e)}async function ph(t,e){return pn(t,"POST","/v1/accounts:lookup",e)}function Wu(t){if(t)try{let e=new Date(Number(t));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function OA(t,e=!1){let n=Zt(t),a=await n.getIdToken(e),r=XI(a);ee(r&&r.exp&&r.auth_time&&r.iat,n.auth,"internal-error");let s=typeof r.firebase=="object"?r.firebase:void 0,i=s?.sign_in_provider;return{claims:r,token:a,authTime:Wu(TI(r.auth_time)),issuedAtTime:Wu(TI(r.iat)),expirationTime:Wu(TI(r.exp)),signInProvider:i||null,signInSecondFactor:s?.sign_in_second_factor||null}}function TI(t){return Number(t)*1e3}function XI(t){let[e,n,a]=t.split(".");if(e===void 0||n===void 0||a===void 0)return ih("JWT malformed, contained fewer than 3 sections"),null;try{let r=Jf(n);return r?JSON.parse(r):(ih("Failed to decode base64 JWT payload"),null)}catch(r){return ih("Caught error parsing JWT payload as JSON",r?.toString()),null}}function dA(t){let e=XI(t);return ee(e,"internal-error"),ee(typeof e.exp<"u","internal-error"),ee(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}async function $u(t,e,n=!1){if(n)return e;try{return await e}catch(a){throw a instanceof En&&FM(a)&&t.auth.currentUser===t&&await t.auth.signOut(),a}}function FM({code:t}){return t==="auth/user-disabled"||t==="auth/user-token-expired"}var xI=class{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){if(e){let n=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),n}else{this.errorBackoff=3e4;let a=(this.user.stsTokenManager.expirationTime??0)-Date.now()-3e5;return Math.max(0,a)}}schedule(e=!1){if(!this.isRunning)return;let n=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},n)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){e?.code==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}};var Ju=class{constructor(e,n){this.createdAt=e,this.lastLoginAt=n,this._initializeTime()}_initializeTime(){this.lastSignInTime=Wu(this.lastLoginAt),this.creationTime=Wu(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}};async function mh(t){let e=t.auth,n=await t.getIdToken(),a=await $u(t,ph(e,{idToken:n}));ee(a?.users.length,e,"internal-error");let r=a.users[0];t._notifyReloadListener(r);let s=r.providerUserInfo?.length?NA(r.providerUserInfo):[],i=BM(t.providerData,s),l=t.isAnonymous,u=!(t.email&&r.passwordHash)&&!i?.length,c=l?u:!1,f={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:i,metadata:new Ju(r.createdAt,r.lastLoginAt),isAnonymous:c};Object.assign(t,f)}async function MA(t){let e=Zt(t);await mh(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function BM(t,e){return[...t.filter(a=>!e.some(r=>r.providerId===a.providerId)),...e]}function NA(t){return t.map(({providerId:e,...n})=>({providerId:e,uid:n.rawId||"",displayName:n.displayName||null,email:n.email||null,phoneNumber:n.phoneNumber||null,photoURL:n.photoUrl||null}))}async function qM(t,e){let n=await kA(t,{},async()=>{let a=Oo({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:r,apiKey:s}=t.config,i=await DA(t,r,"/v1/token",`key=${s}`),l=await t._getAdditionalHeaders();l["Content-Type"]="application/x-www-form-urlencoded";let u={method:"POST",headers:l,body:a};return t.emulatorConfig&&Va(t.emulatorConfig.host)&&(u.credentials="include"),fh.fetch()(i,u)});return{accessToken:n.access_token,expiresIn:n.expires_in,refreshToken:n.refresh_token}}async function zM(t,e){return pn(t,"POST","/v2/accounts:revokeToken",en(t,e))}var Xu=class t{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){ee(e.idToken,"internal-error"),ee(typeof e.idToken<"u","internal-error"),ee(typeof e.refreshToken<"u","internal-error");let n="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):dA(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,n)}updateFromIdToken(e){ee(e.length!==0,"internal-error");let n=dA(e);this.updateTokensAndExpiration(e,null,n)}async getToken(e,n=!1){return!n&&this.accessToken&&!this.isExpired?this.accessToken:(ee(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,n){let{accessToken:a,refreshToken:r,expiresIn:s}=await qM(e,n);this.updateTokensAndExpiration(a,r,Number(s))}updateTokensAndExpiration(e,n,a){this.refreshToken=n||null,this.accessToken=e||null,this.expirationTime=Date.now()+a*1e3}static fromJSON(e,n){let{refreshToken:a,accessToken:r,expirationTime:s}=n,i=new t;return a&&(ee(typeof a=="string","internal-error",{appName:e}),i.refreshToken=a),r&&(ee(typeof r=="string","internal-error",{appName:e}),i.accessToken=r),s&&(ee(typeof s=="number","internal-error",{appName:e}),i.expirationTime=s),i}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new t,this.toJSON())}_performRefresh(){return qa("not implemented")}};function xs(t,e){ee(typeof t=="string"||typeof t>"u","internal-error",{appName:e})}var Rs=class t{constructor({uid:e,auth:n,stsTokenManager:a,...r}){this.providerId="firebase",this.proactiveRefresh=new xI(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=e,this.auth=n,this.stsTokenManager=a,this.accessToken=a.accessToken,this.displayName=r.displayName||null,this.email=r.email||null,this.emailVerified=r.emailVerified||!1,this.phoneNumber=r.phoneNumber||null,this.photoURL=r.photoURL||null,this.isAnonymous=r.isAnonymous||!1,this.tenantId=r.tenantId||null,this.providerData=r.providerData?[...r.providerData]:[],this.metadata=new Ju(r.createdAt||void 0,r.lastLoginAt||void 0)}async getIdToken(e){let n=await $u(this,this.stsTokenManager.getToken(this.auth,e));return ee(n,this.auth,"internal-error"),this.accessToken!==n&&(this.accessToken=n,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),n}getIdTokenResult(e){return OA(this,e)}reload(){return MA(this)}_assign(e){this!==e&&(ee(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(n=>({...n})),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){let n=new t({...this,auth:e,stsTokenManager:this.stsTokenManager._clone()});return n.metadata._copy(this.metadata),n}_onReload(e){ee(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,n=!1){let a=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),a=!0),n&&await mh(this),await this.auth._persistUserIfCurrent(this),a&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(Nn(this.auth.app))return Promise.reject(ci(this.auth));let e=await this.getIdToken();return await $u(this,UM(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return{uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>({...e})),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId,...this.metadata.toJSON(),apiKey:this.auth.config.apiKey,appName:this.auth.name}}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,n){let a=n.displayName??void 0,r=n.email??void 0,s=n.phoneNumber??void 0,i=n.photoURL??void 0,l=n.tenantId??void 0,u=n._redirectEventId??void 0,c=n.createdAt??void 0,f=n.lastLoginAt??void 0,{uid:p,emailVerified:m,isAnonymous:S,providerData:R,stsTokenManager:D}=n;ee(p&&D,e,"internal-error");let L=Xu.fromJSON(this.name,D);ee(typeof p=="string",e,"internal-error"),xs(a,e.name),xs(r,e.name),ee(typeof m=="boolean",e,"internal-error"),ee(typeof S=="boolean",e,"internal-error"),xs(s,e.name),xs(i,e.name),xs(l,e.name),xs(u,e.name),xs(c,e.name),xs(f,e.name);let E=new t({uid:p,auth:e,email:r,emailVerified:m,displayName:a,isAnonymous:S,photoURL:i,phoneNumber:s,tenantId:l,stsTokenManager:L,createdAt:c,lastLoginAt:f});return R&&Array.isArray(R)&&(E.providerData=R.map(v=>({...v}))),u&&(E._redirectEventId=u),E}static async _fromIdTokenResponse(e,n,a=!1){let r=new Xu;r.updateFromServerResponse(n);let s=new t({uid:n.localId,auth:e,stsTokenManager:r,isAnonymous:a});return await mh(s),s}static async _fromGetAccountInfoResponse(e,n,a){let r=n.users[0];ee(r.localId!==void 0,"internal-error");let s=r.providerUserInfo!==void 0?NA(r.providerUserInfo):[],i=!(r.email&&r.passwordHash)&&!s?.length,l=new Xu;l.updateFromIdToken(a);let u=new t({uid:r.localId,auth:e,stsTokenManager:l,isAnonymous:i}),c={uid:r.localId,displayName:r.displayName||null,photoURL:r.photoUrl||null,email:r.email||null,emailVerified:r.emailVerified||!1,phoneNumber:r.phoneNumber||null,tenantId:r.tenantId||null,providerData:s,metadata:new Ju(r.createdAt,r.lastLoginAt),isAnonymous:!(r.email&&r.passwordHash)&&!s?.length};return Object.assign(u,c),u}};var fA=new Map;function xr(t){Rr(t instanceof Function,"Expected a class definition");let e=fA.get(t);return e?(Rr(e instanceof t,"Instance stored in cache mismatched with class"),e):(e=new t,fA.set(t,e),e)}var gh=class{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,n){this.storage[e]=n}async _get(e){let n=this.storage[e];return n===void 0?null:n}async _remove(e){delete this.storage[e]}_addListener(e,n){}_removeListener(e,n){}};gh.type="NONE";var RI=gh;function oh(t,e,n){return`firebase:${t}:${e}:${n}`}var yh=class t{constructor(e,n,a){this.persistence=e,this.auth=n,this.userKey=a;let{config:r,name:s}=this.auth;this.fullUserKey=oh(this.userKey,r.apiKey,s),this.fullPersistenceKey=oh("persistence",r.apiKey,s),this.boundEventHandler=n._onStorageEvent.bind(n),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){let e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){let n=await ph(this.auth,{idToken:e}).catch(()=>{});return n?Rs._fromGetAccountInfoResponse(this.auth,n,e):null}return Rs._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;let n=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,n)return this.setCurrentUser(n)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,n,a="authUser"){if(!n.length)return new t(xr(RI),e,a);let r=(await Promise.all(n.map(async c=>{if(await c._isAvailable())return c}))).filter(c=>c),s=r[0]||xr(RI),i=oh(a,e.config.apiKey,e.name),l=null;for(let c of n)try{let f=await c._get(i);if(f){let p;if(typeof f=="string"){let m=await ph(e,{idToken:f}).catch(()=>{});if(!m)break;p=await Rs._fromGetAccountInfoResponse(e,m,f)}else p=Rs._fromJSON(e,f);c!==s&&(l=p),s=c;break}}catch{}let u=r.filter(c=>c._shouldAllowMigration);return!s._shouldAllowMigration||!u.length?new t(s,e,a):(s=u[0],l&&await s._set(i,l.toJSON()),await Promise.all(n.map(async c=>{if(c!==s)try{await c._remove(i)}catch{}})),new t(s,e,a))}};function hA(t){let e=t.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(BA(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(VA(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(zA(e))return"Blackberry";if(HA(e))return"Webos";if(UA(e))return"Safari";if((e.includes("chrome/")||FA(e))&&!e.includes("edge/"))return"Chrome";if(qA(e))return"Android";{let n=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,a=t.match(n);if(a?.length===2)return a[1]}return"Other"}function VA(t=Jt()){return/firefox\//i.test(t)}function UA(t=Jt()){let e=t.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function FA(t=Jt()){return/crios\//i.test(t)}function BA(t=Jt()){return/iemobile/i.test(t)}function qA(t=Jt()){return/android/i.test(t)}function zA(t=Jt()){return/blackberry/i.test(t)}function HA(t=Jt()){return/webos/i.test(t)}function QI(t=Jt()){return/iphone|ipad|ipod/i.test(t)||/macintosh/i.test(t)&&/mobile/i.test(t)}function HM(t=Jt()){return QI(t)&&!!window.navigator?.standalone}function GM(){return GL()&&document.documentMode===10}function GA(t=Jt()){return QI(t)||qA(t)||HA(t)||zA(t)||/windows phone/i.test(t)||BA(t)}function jA(t,e=[]){let n;switch(t){case"Browser":n=hA(Jt());break;case"Worker":n=`${hA(Jt())}-${t}`;break;default:n=t}let a=e.length?e.join(","):"FirebaseCore-web";return`${n}/JsCore/${Ba}/${a}`}var kI=class{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,n){let a=s=>new Promise((i,l)=>{try{let u=e(s);i(u)}catch(u){l(u)}});a.onAbort=n,this.queue.push(a);let r=this.queue.length-1;return()=>{this.queue[r]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;let n=[];try{for(let a of this.queue)await a(e),a.onAbort&&n.push(a.onAbort)}catch(a){n.reverse();for(let r of n)try{r()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:a?.message})}}};async function jM(t,e={}){return pn(t,"GET","/v2/passwordPolicy",en(t,e))}var KM=6,DI=class{constructor(e){let n=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=n.minPasswordLength??KM,n.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=n.maxPasswordLength),n.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=n.containsLowercaseCharacter),n.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=n.containsUppercaseCharacter),n.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=n.containsNumericCharacter),n.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=n.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=e.allowedNonAlphanumericCharacters?.join("")??"",this.forceUpgradeOnSignin=e.forceUpgradeOnSignin??!1,this.schemaVersion=e.schemaVersion}validatePassword(e){let n={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,n),this.validatePasswordCharacterOptions(e,n),n.isValid&&(n.isValid=n.meetsMinPasswordLength??!0),n.isValid&&(n.isValid=n.meetsMaxPasswordLength??!0),n.isValid&&(n.isValid=n.containsLowercaseLetter??!0),n.isValid&&(n.isValid=n.containsUppercaseLetter??!0),n.isValid&&(n.isValid=n.containsNumericCharacter??!0),n.isValid&&(n.isValid=n.containsNonAlphanumericCharacter??!0),n}validatePasswordLengthOptions(e,n){let a=this.customStrengthOptions.minPasswordLength,r=this.customStrengthOptions.maxPasswordLength;a&&(n.meetsMinPasswordLength=e.length>=a),r&&(n.meetsMaxPasswordLength=e.length<=r)}validatePasswordCharacterOptions(e,n){this.updatePasswordCharacterOptionsStatuses(n,!1,!1,!1,!1);let a;for(let r=0;r<e.length;r++)a=e.charAt(r),this.updatePasswordCharacterOptionsStatuses(n,a>="a"&&a<="z",a>="A"&&a<="Z",a>="0"&&a<="9",this.allowedNonAlphanumericCharacters.includes(a))}updatePasswordCharacterOptionsStatuses(e,n,a,r,s){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=n)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=a)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=r)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=s))}};var PI=class{constructor(e,n,a,r){this.app=e,this.heartbeatServiceProvider=n,this.appCheckServiceProvider=a,this.config=r,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new Ih(this),this.idTokenSubscription=new Ih(this),this.beforeStateQueue=new kI(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=xA,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=r.sdkClientVersion,this._persistenceManagerAvailable=new Promise(s=>this._resolvePersistenceManagerAvailable=s)}_initializeWithPersistence(e,n){return n&&(this._popupRedirectResolver=xr(n)),this._initializationPromise=this.queue(async()=>{if(!this._deleted&&(this.persistenceManager=await yh.create(this,e),this._resolvePersistenceManagerAvailable?.(),!this._deleted)){if(this._popupRedirectResolver?._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(n),this.lastNotifiedUid=this.currentUser?.uid||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;let e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{let n=await ph(this,{idToken:e}),a=await Rs._fromGetAccountInfoResponse(this,n,e);await this.directlySetCurrentUser(a)}catch(n){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",n),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){if(Nn(this.app)){let s=this.app.settings.authIdToken;return s?new Promise(i=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(s).then(i,i))}):this.directlySetCurrentUser(null)}let n=await this.assertedPersistence.getCurrentUser(),a=n,r=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();let s=this.redirectUser?._redirectEventId,i=a?._redirectEventId,l=await this.tryRedirectSignIn(e);(!s||s===i)&&l?.user&&(a=l.user,r=!0)}if(!a)return this.directlySetCurrentUser(null);if(!a._redirectEventId){if(r)try{await this.beforeStateQueue.runMiddleware(a)}catch(s){a=n,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(s))}return a?this.reloadAndSetCurrentUserOrClear(a):this.directlySetCurrentUser(null)}return ee(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===a._redirectEventId?this.directlySetCurrentUser(a):this.reloadAndSetCurrentUserOrClear(a)}async tryRedirectSignIn(e){let n=null;try{n=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return n}async reloadAndSetCurrentUserOrClear(e){try{await mh(e)}catch(n){if(n?.code!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=PM()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(Nn(this.app))return Promise.reject(ci(this));let n=e?Zt(e):null;return n&&ee(n.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(n&&n._clone(this))}async _updateCurrentUser(e,n=!1){if(!this._deleted)return e&&ee(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),n||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return Nn(this.app)?Promise.reject(ci(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return Nn(this.app)?Promise.reject(ci(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(xr(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();let n=this._getPasswordPolicyInternal();return n.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):n.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){let e=await jM(this),n=new DI(e);this.tenantId===null?this._projectPasswordPolicy=n:this._tenantPasswordPolicies[this.tenantId]=n}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new Lr("auth","Firebase",e())}onAuthStateChanged(e,n,a){return this.registerStateListener(this.authStateSubscription,e,n,a)}beforeAuthStateChanged(e,n){return this.beforeStateQueue.pushCallback(e,n)}onIdTokenChanged(e,n,a){return this.registerStateListener(this.idTokenSubscription,e,n,a)}authStateReady(){return new Promise((e,n)=>{if(this.currentUser)e();else{let a=this.onAuthStateChanged(()=>{a(),e()},n)}})}async revokeAccessToken(e){if(this.currentUser){let n=await this.currentUser.getIdToken(),a={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:n};this.tenantId!=null&&(a.tenantId=this.tenantId),await zM(this,a)}}toJSON(){return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:this._currentUser?.toJSON()}}async _setRedirectUser(e,n){let a=await this.getOrInitRedirectPersistenceManager(n);return e===null?a.removeCurrentUser():a.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){let n=e&&xr(e)||this._popupRedirectResolver;ee(n,this,"argument-error"),this.redirectPersistenceManager=await yh.create(this,[xr(n._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){return this._isInitialized&&await this.queue(async()=>{}),this._currentUser?._redirectEventId===e?this._currentUser:this.redirectUser?._redirectEventId===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);let e=this.currentUser?.uid??null;this.lastNotifiedUid!==e&&(this.lastNotifiedUid=e,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,n,a,r){if(this._deleted)return()=>{};let s=typeof n=="function"?n:n.next.bind(n),i=!1,l=this._isInitialized?Promise.resolve():this._initializationPromise;if(ee(l,this,"internal-error"),l.then(()=>{i||s(this.currentUser)}),typeof n=="function"){let u=e.addObserver(n,a,r);return()=>{i=!0,u()}}else{let u=e.addObserver(n);return()=>{i=!0,u()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return ee(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=jA(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){let e={"X-Client-Version":this.clientVersion};this.app.options.appId&&(e["X-Firebase-gmpid"]=this.app.options.appId);let n=await this.heartbeatServiceProvider.getImmediate({optional:!0})?.getHeartbeatsHeader();n&&(e["X-Firebase-Client"]=n);let a=await this._getAppCheckToken();return a&&(e["X-Firebase-AppCheck"]=a),e}async _getAppCheckToken(){if(Nn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=await this.appCheckServiceProvider.getImmediate({optional:!0})?.getToken();return e?.error&&RM(`Error while retrieving App Check token: ${e.error}`),e?.token}};function Bo(t){return Zt(t)}var Ih=class{constructor(e){this.auth=e,this.observer=null,this.addObserver=XL(n=>this.observer=n)}get next(){return ee(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}};var Nh={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function WM(t){Nh=t}function KA(t){return Nh.loadJS(t)}function XM(){return Nh.recaptchaEnterpriseScript}function QM(){return Nh.gapiScript}function WA(t){return`__${t}${Math.floor(Math.random()*1e6)}`}var OI=class{constructor(){this.enterprise=new MI}ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}},MI=class{ready(e){e()}execute(e,n){return Promise.resolve("token")}render(e,n){return""}};var YM="recaptcha-enterprise",Qu="NO_RECAPTCHA",_h=class{constructor(e){this.type=YM,this.auth=Bo(e)}async verify(e="verify",n=!1){async function a(s){if(!n){if(s.tenantId==null&&s._agentRecaptchaConfig!=null)return s._agentRecaptchaConfig.siteKey;if(s.tenantId!=null&&s._tenantRecaptchaConfigs[s.tenantId]!==void 0)return s._tenantRecaptchaConfigs[s.tenantId].siteKey}return new Promise(async(i,l)=>{PA(s,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}).then(u=>{if(u.recaptchaKey===void 0)l(new Error("recaptcha Enterprise site key undefined"));else{let c=new hh(u);return s.tenantId==null?s._agentRecaptchaConfig=c:s._tenantRecaptchaConfigs[s.tenantId]=c,i(c.siteKey)}}).catch(u=>{l(u)})})}function r(s,i,l){let u=window.grecaptcha;cA(u)?u.enterprise.ready(()=>{u.enterprise.execute(s,{action:e}).then(c=>{i(c)}).catch(()=>{i(Qu)})}):l(Error("No reCAPTCHA enterprise script loaded."))}return this.auth.settings.appVerificationDisabledForTesting?new OI().execute("siteKey",{action:"verify"}):new Promise((s,i)=>{a(this.auth).then(l=>{if(!n&&cA(window.grecaptcha))r(l,s,i);else{if(typeof window>"u"){i(new Error("RecaptchaVerifier is only supported in browser"));return}let u=XM();u.length!==0&&(u+=l),KA(u).then(()=>{r(l,s,i)}).catch(c=>{i(c)})}}).catch(l=>{i(l)})})}};async function ju(t,e,n,a=!1,r=!1){let s=new _h(t),i;if(r)i=Qu;else try{i=await s.verify(n)}catch{i=await s.verify(n,!0)}let l={...e};if(n==="mfaSmsEnrollment"||n==="mfaSmsSignIn"){if("phoneEnrollmentInfo"in l){let u=l.phoneEnrollmentInfo.phoneNumber,c=l.phoneEnrollmentInfo.recaptchaToken;Object.assign(l,{phoneEnrollmentInfo:{phoneNumber:u,recaptchaToken:c,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}else if("phoneSignInInfo"in l){let u=l.phoneSignInInfo.recaptchaToken;Object.assign(l,{phoneSignInInfo:{recaptchaToken:u,captchaResponse:i,clientType:"CLIENT_TYPE_WEB",recaptchaVersion:"RECAPTCHA_ENTERPRISE"}})}return l}return a?Object.assign(l,{captchaResp:i}):Object.assign(l,{captchaResponse:i}),Object.assign(l,{clientType:"CLIENT_TYPE_WEB"}),Object.assign(l,{recaptchaVersion:"RECAPTCHA_ENTERPRISE"}),l}async function Yu(t,e,n,a,r){if(r==="EMAIL_PASSWORD_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER")){let s=await ju(t,e,n,n==="getOobCode");return a(t,s)}else return a(t,e).catch(async s=>{if(s.code==="auth/missing-recaptcha-token"){console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`);let i=await ju(t,e,n,n==="getOobCode");return a(t,i)}else return Promise.reject(s)});else if(r==="PHONE_PROVIDER")if(t._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER")){let s=await ju(t,e,n);return a(t,s).catch(async i=>{if(t._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER")==="AUDIT"&&(i.code==="auth/missing-recaptcha-token"||i.code==="auth/invalid-app-credential")){console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`);let l=await ju(t,e,n,!1,!0);return a(t,l)}return Promise.reject(i)})}else{let s=await ju(t,e,n,!1,!0);return a(t,s)}else return Promise.reject(r+" provider is not supported.")}async function $M(t){let e=Bo(t),n=await PA(e,{clientType:"CLIENT_TYPE_WEB",version:"RECAPTCHA_ENTERPRISE"}),a=new hh(n);e.tenantId==null?e._agentRecaptchaConfig=a:e._tenantRecaptchaConfigs[e.tenantId]=a,a.isAnyProviderEnabled()&&new _h(e).verify()}function XA(t,e){let n=ui(t,"auth");if(n.isInitialized()){let r=n.getImmediate(),s=n.getOptions();if(Ia(s,e??{}))return r;_a(r,"already-initialized")}return n.initialize({options:e})}function JM(t,e){let n=e?.persistence||[],a=(Array.isArray(n)?n:[n]).map(xr);e?.errorMap&&t._updateErrorMap(e.errorMap),t._initializeWithPersistence(a,e?.popupRedirectResolver)}function QA(t,e,n){let a=Bo(t);ee(/^https?:\/\//.test(e),a,"invalid-emulator-scheme");let r=!!n?.disableWarnings,s=YA(e),{host:i,port:l}=ZM(e),u=l===null?"":`:${l}`,c={url:`${s}//${i}${u}/`},f=Object.freeze({host:i,port:l,protocol:s.replace(":",""),options:Object.freeze({disableWarnings:r})});if(!a._canInitEmulator){ee(a.config.emulator&&a.emulatorConfig,a,"emulator-config-failed"),ee(Ia(c,a.config.emulator)&&Ia(f,a.emulatorConfig),a,"emulator-config-failed");return}a.config.emulator=c,a.emulatorConfig=f,a.settings.appVerificationDisabledForTesting=!0,Va(i)?(Do(`${s}//${i}${u}`),Po("Auth",!0)):r||e2()}function YA(t){let e=t.indexOf(":");return e<0?"":t.substr(0,e+1)}function ZM(t){let e=YA(t),n=/(\/\/)?([^?#/]+)/.exec(t.substr(e.length));if(!n)return{host:"",port:null};let a=n[2].split("@").pop()||"",r=/^(\[[^\]]+\])(:|$)/.exec(a);if(r){let s=r[1];return{host:s,port:pA(a.substr(s.length+1))}}else{let[s,i]=a.split(":");return{host:s,port:pA(i)}}}function pA(t){if(!t)return null;let e=Number(t);return isNaN(e)?null:e}function e2(){function t(){let e=document.createElement("p"),n=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",n.position="fixed",n.width="100%",n.backgroundColor="#ffffff",n.border=".1em solid #000000",n.color="#b50000",n.bottom="0px",n.left="0px",n.margin="0px",n.zIndex="10000",n.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",t):t())}var fi=class{constructor(e,n){this.providerId=e,this.signInMethod=n}toJSON(){return qa("not implemented")}_getIdTokenResponse(e){return qa("not implemented")}_linkToIdToken(e,n){return qa("not implemented")}_getReauthenticationResolver(e){return qa("not implemented")}};async function t2(t,e){return pn(t,"POST","/v1/accounts:signUp",e)}async function n2(t,e){return gi(t,"POST","/v1/accounts:signInWithPassword",en(t,e))}async function a2(t,e){return gi(t,"POST","/v1/accounts:signInWithEmailLink",en(t,e))}async function r2(t,e){return gi(t,"POST","/v1/accounts:signInWithEmailLink",en(t,e))}var Zu=class t extends fi{constructor(e,n,a,r=null){super("password",a),this._email=e,this._password=n,this._tenantId=r}static _fromEmailAndPassword(e,n){return new t(e,n,"password")}static _fromEmailAndCode(e,n,a=null){return new t(e,n,"emailLink",a)}toJSON(){return{email:this._email,password:this._password,signInMethod:this.signInMethod,tenantId:this._tenantId}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e;if(n?.email&&n?.password){if(n.signInMethod==="password")return this._fromEmailAndPassword(n.email,n.password);if(n.signInMethod==="emailLink")return this._fromEmailAndCode(n.email,n.password,n.tenantId)}return null}async _getIdTokenResponse(e){switch(this.signInMethod){case"password":let n={returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Yu(e,n,"signInWithPassword",n2,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return a2(e,{email:this._email,oobCode:this._password});default:_a(e,"internal-error")}}async _linkToIdToken(e,n){switch(this.signInMethod){case"password":let a={idToken:n,returnSecureToken:!0,email:this._email,password:this._password,clientType:"CLIENT_TYPE_WEB"};return Yu(e,a,"signUpPassword",t2,"EMAIL_PASSWORD_PROVIDER");case"emailLink":return r2(e,{idToken:n,email:this._email,oobCode:this._password});default:_a(e,"internal-error")}}_getReauthenticationResolver(e){return this._getIdTokenResponse(e)}};async function Uo(t,e){return gi(t,"POST","/v1/accounts:signInWithIdp",en(t,e))}var s2="http://localhost",hi=class t extends fi{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){let n=new t(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(n.idToken=e.idToken),e.accessToken&&(n.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(n.nonce=e.nonce),e.pendingToken&&(n.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(n.accessToken=e.oauthToken,n.secret=e.oauthTokenSecret):_a("argument-error"),n}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){let n=typeof e=="string"?JSON.parse(e):e,{providerId:a,signInMethod:r,...s}=n;if(!a||!r)return null;let i=new t(a,r);return i.idToken=s.idToken||void 0,i.accessToken=s.accessToken||void 0,i.secret=s.secret,i.nonce=s.nonce,i.pendingToken=s.pendingToken||null,i}_getIdTokenResponse(e){let n=this.buildRequest();return Uo(e,n)}_linkToIdToken(e,n){let a=this.buildRequest();return a.idToken=n,Uo(e,a)}_getReauthenticationResolver(e){let n=this.buildRequest();return n.autoCreate=!1,Uo(e,n)}buildRequest(){let e={requestUri:s2,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{let n={};this.idToken&&(n.id_token=this.idToken),this.accessToken&&(n.access_token=this.accessToken),this.secret&&(n.oauth_token_secret=this.secret),n.providerId=this.providerId,this.nonce&&!this.pendingToken&&(n.nonce=this.nonce),e.postBody=Oo(n)}return e}};async function mA(t,e){return pn(t,"POST","/v1/accounts:sendVerificationCode",en(t,e))}async function i2(t,e){return gi(t,"POST","/v1/accounts:signInWithPhoneNumber",en(t,e))}async function o2(t,e){let n=await gi(t,"POST","/v1/accounts:signInWithPhoneNumber",en(t,e));if(n.temporaryProof)throw Ku(t,"account-exists-with-different-credential",n);return n}var l2={USER_NOT_FOUND:"user-not-found"};async function u2(t,e){let n={...e,operation:"REAUTH"};return gi(t,"POST","/v1/accounts:signInWithPhoneNumber",en(t,n),l2)}var ec=class t extends fi{constructor(e){super("phone","phone"),this.params=e}static _fromVerification(e,n){return new t({verificationId:e,verificationCode:n})}static _fromTokenResponse(e,n){return new t({phoneNumber:e,temporaryProof:n})}_getIdTokenResponse(e){return i2(e,this._makeVerificationRequest())}_linkToIdToken(e,n){return o2(e,{idToken:n,...this._makeVerificationRequest()})}_getReauthenticationResolver(e){return u2(e,this._makeVerificationRequest())}_makeVerificationRequest(){let{temporaryProof:e,phoneNumber:n,verificationId:a,verificationCode:r}=this.params;return e&&n?{temporaryProof:e,phoneNumber:n}:{sessionInfo:a,code:r}}toJSON(){let e={providerId:this.providerId};return this.params.phoneNumber&&(e.phoneNumber=this.params.phoneNumber),this.params.temporaryProof&&(e.temporaryProof=this.params.temporaryProof),this.params.verificationCode&&(e.verificationCode=this.params.verificationCode),this.params.verificationId&&(e.verificationId=this.params.verificationId),e}static fromJSON(e){typeof e=="string"&&(e=JSON.parse(e));let{verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s}=e;return!a&&!n&&!r&&!s?null:new t({verificationId:n,verificationCode:a,phoneNumber:r,temporaryProof:s})}};function c2(t){switch(t){case"recoverEmail":return"RECOVER_EMAIL";case"resetPassword":return"PASSWORD_RESET";case"signIn":return"EMAIL_SIGNIN";case"verifyEmail":return"VERIFY_EMAIL";case"verifyAndChangeEmail":return"VERIFY_AND_CHANGE_EMAIL";case"revertSecondFactorAddition":return"REVERT_SECOND_FACTOR_ADDITION";default:return null}}function d2(t){let e=Mo(No(t)).link,n=e?Mo(No(e)).deep_link_id:null,a=Mo(No(t)).deep_link_id;return(a?Mo(No(a)).link:null)||a||n||e||t}var Sh=class t{constructor(e){let n=Mo(No(e)),a=n.apiKey??null,r=n.oobCode??null,s=c2(n.mode??null);ee(a&&r&&s,"argument-error"),this.apiKey=a,this.operation=s,this.code=r,this.continueUrl=n.continueUrl??null,this.languageCode=n.lang??null,this.tenantId=n.tenantId??null}static parseLink(e){let n=d2(e);try{return new t(n)}catch{return null}}};var Fo=class t{constructor(){this.providerId=t.PROVIDER_ID}static credential(e,n){return Zu._fromEmailAndPassword(e,n)}static credentialWithLink(e,n){let a=Sh.parseLink(n);return ee(a,"argument-error"),Zu._fromEmailAndCode(e,a.code,a.tenantId)}};Fo.PROVIDER_ID="password";Fo.EMAIL_PASSWORD_SIGN_IN_METHOD="password";Fo.EMAIL_LINK_SIGN_IN_METHOD="emailLink";var vh=class{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}};var pi=class extends vh{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}};var tc=class t extends pi{constructor(){super("facebook.com")}static credential(e){return hi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};tc.FACEBOOK_SIGN_IN_METHOD="facebook.com";tc.PROVIDER_ID="facebook.com";var nc=class t extends pi{constructor(){super("google.com"),this.addScope("profile")}static credential(e,n){return hi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthIdToken:n,oauthAccessToken:a}=e;if(!n&&!a)return null;try{return t.credential(n,a)}catch{return null}}};nc.GOOGLE_SIGN_IN_METHOD="google.com";nc.PROVIDER_ID="google.com";var ac=class t extends pi{constructor(){super("github.com")}static credential(e){return hi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return t.credential(e.oauthAccessToken)}catch{return null}}};ac.GITHUB_SIGN_IN_METHOD="github.com";ac.PROVIDER_ID="github.com";var rc=class t extends pi{constructor(){super("twitter.com")}static credential(e,n){return hi._fromParams({providerId:t.PROVIDER_ID,signInMethod:t.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:n})}static credentialFromResult(e){return t.credentialFromTaggedObject(e)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{oauthAccessToken:n,oauthTokenSecret:a}=e;if(!n||!a)return null;try{return t.credential(n,a)}catch{return null}}};rc.TWITTER_SIGN_IN_METHOD="twitter.com";rc.PROVIDER_ID="twitter.com";var sc=class t{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,n,a,r=!1){let s=await Rs._fromIdTokenResponse(e,a,r),i=gA(a);return new t({user:s,providerId:i,_tokenResponse:a,operationType:n})}static async _forOperation(e,n,a){await e._updateTokensIfNecessary(a,!0);let r=gA(a);return new t({user:e,providerId:r,_tokenResponse:a,operationType:n})}};function gA(t){return t.providerId?t.providerId:"phoneNumber"in t?"phone":null}var NI=class t extends En{constructor(e,n,a,r){super(n.code,n.message),this.operationType=a,this.user=r,Object.setPrototypeOf(this,t.prototype),this.customData={appName:e.name,tenantId:e.tenantId??void 0,_serverResponse:n.customData._serverResponse,operationType:a}}static _fromErrorAndOperation(e,n,a,r){return new t(e,n,a,r)}};function $A(t,e,n,a){return(e==="reauthenticate"?n._getReauthenticationResolver(t):n._getIdTokenResponse(t)).catch(s=>{throw s.code==="auth/multi-factor-auth-required"?NI._fromErrorAndOperation(t,s,e,a):s})}async function f2(t,e,n=!1){let a=await $u(t,e._linkToIdToken(t.auth,await t.getIdToken()),n);return sc._forOperation(t,"link",a)}async function h2(t,e,n=!1){let{auth:a}=t;if(Nn(a.app))return Promise.reject(ci(a));let r="reauthenticate";try{let s=await $u(t,$A(a,r,e,t),n);ee(s.idToken,a,"internal-error");let i=XI(s.idToken);ee(i,a,"internal-error");let{sub:l}=i;return ee(t.uid===l,a,"user-mismatch"),sc._forOperation(t,r,s)}catch(s){throw s?.code==="auth/user-not-found"&&_a(a,"user-mismatch"),s}}async function p2(t,e,n=!1){if(Nn(t.app))return Promise.reject(ci(t));let a="signIn",r=await $A(t,a,e),s=await sc._fromIdTokenResponse(t,a,r);return n||await t._updateCurrentUser(s.user),s}function JA(t,e,n,a){return Zt(t).onIdTokenChanged(e,n,a)}function ZA(t,e,n){return Zt(t).beforeAuthStateChanged(e,n)}function yA(t,e){return pn(t,"POST","/v2/accounts/mfaEnrollment:start",en(t,e))}function m2(t,e){return pn(t,"POST","/v2/accounts/mfaEnrollment:finalize",en(t,e))}function g2(t,e){return pn(t,"POST","/v2/accounts/mfaEnrollment:start",en(t,e))}function y2(t,e){return pn(t,"POST","/v2/accounts/mfaEnrollment:finalize",en(t,e))}var Th="__sak";var Eh=class{constructor(e,n){this.storageRetriever=e,this.type=n}_isAvailable(){try{return this.storage?(this.storage.setItem(Th,"1"),this.storage.removeItem(Th),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,n){return this.storage.setItem(e,JSON.stringify(n)),Promise.resolve()}_get(e){let n=this.storage.getItem(e);return Promise.resolve(n?JSON.parse(n):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}};var I2=1e3,_2=10,bh=class extends Eh{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,n)=>this.onStorageEvent(e,n),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=GA(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(let n of Object.keys(this.listeners)){let a=this.storage.getItem(n),r=this.localCache[n];a!==r&&e(n,r,a)}}onStorageEvent(e,n=!1){if(!e.key){this.forAllChangedKeys((i,l,u)=>{this.notifyListeners(i,u)});return}let a=e.key;n?this.detachListener():this.stopPolling();let r=()=>{let i=this.storage.getItem(a);!n&&this.localCache[a]===i||this.notifyListeners(a,i)},s=this.storage.getItem(a);GM()&&s!==e.newValue&&e.newValue!==e.oldValue?setTimeout(r,_2):r()}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n&&JSON.parse(n))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,n,a)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:n,newValue:a}),!0)})},I2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,n){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,n){await super._set(e,n),this.localCache[e]=JSON.stringify(n)}async _get(e){let n=await super._get(e);return this.localCache[e]=JSON.stringify(n),n}async _remove(e){await super._remove(e),delete this.localCache[e]}};bh.type="LOCAL";var ex=bh;var S2=1e3;function EI(t){let e=t.replace(/[\\^$.*+?()[\]{}|]/g,"\\$&"),n=RegExp(`${e}=([^;]+)`);return document.cookie.match(n)?.[1]??null}function bI(t){return`${window.location.protocol==="http:"?"__dev_":"__HOST-"}FIREBASE_${t.split(":")[3]}`}var VI=class{constructor(){this.type="COOKIE",this.listenerUnsubscribes=new Map}_getFinalTarget(e){if(typeof window===void 0)return e;let n=new URL(`${window.location.origin}/__cookies__`);return n.searchParams.set("finalTarget",e),n}async _isAvailable(){return typeof isSecureContext=="boolean"&&!isSecureContext||typeof navigator>"u"||typeof document>"u"?!1:navigator.cookieEnabled??!0}async _set(e,n){}async _get(e){if(!this._isAvailable())return null;let n=bI(e);return window.cookieStore?(await window.cookieStore.get(n))?.value:EI(n)}async _remove(e){if(!this._isAvailable()||!await this._get(e))return;let a=bI(e);document.cookie=`${a}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`,await fetch("/__cookies__",{method:"DELETE"}).catch(()=>{})}_addListener(e,n){if(!this._isAvailable())return;let a=bI(e);if(window.cookieStore){let l=c=>{let f=c.changed.find(m=>m.name===a);f&&n(f.value),c.deleted.find(m=>m.name===a)&&n(null)},u=()=>window.cookieStore.removeEventListener("change",l);return this.listenerUnsubscribes.set(n,u),window.cookieStore.addEventListener("change",l)}let r=EI(a),s=setInterval(()=>{let l=EI(a);l!==r&&(n(l),r=l)},S2),i=()=>clearInterval(s);this.listenerUnsubscribes.set(n,i)}_removeListener(e,n){let a=this.listenerUnsubscribes.get(n);a&&(a(),this.listenerUnsubscribes.delete(n))}};VI.type="COOKIE";var wh=class extends Eh{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,n){}_removeListener(e,n){}};wh.type="SESSION";var YI=wh;function v2(t){return Promise.all(t.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(n){return{fulfilled:!1,reason:n}}}))}var Ch=class t{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){let n=this.receivers.find(r=>r.isListeningto(e));if(n)return n;let a=new t(e);return this.receivers.push(a),a}isListeningto(e){return this.eventTarget===e}async handleEvent(e){let n=e,{eventId:a,eventType:r,data:s}=n.data,i=this.handlersMap[r];if(!i?.size)return;n.ports[0].postMessage({status:"ack",eventId:a,eventType:r});let l=Array.from(i).map(async c=>c(n.origin,s)),u=await v2(l);n.ports[0].postMessage({status:"done",eventId:a,eventType:r,response:u})}_subscribe(e,n){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(n)}_unsubscribe(e,n){this.handlersMap[e]&&n&&this.handlersMap[e].delete(n),(!n||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}};Ch.receivers=[];function $I(t="",e=10){let n="";for(let a=0;a<e;a++)n+=Math.floor(Math.random()*10);return t+n}var UI=class{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,n,a=50){let r=typeof MessageChannel<"u"?new MessageChannel:null;if(!r)throw new Error("connection_unavailable");let s,i;return new Promise((l,u)=>{let c=$I("",20);r.port1.start();let f=setTimeout(()=>{u(new Error("unsupported_event"))},a);i={messageChannel:r,onMessage(p){let m=p;if(m.data.eventId===c)switch(m.data.status){case"ack":clearTimeout(f),s=setTimeout(()=>{u(new Error("timeout"))},3e3);break;case"done":clearTimeout(s),l(m.data.response);break;default:clearTimeout(f),clearTimeout(s),u(new Error("invalid_response"));break}}},this.handlers.add(i),r.port1.addEventListener("message",i.onMessage),this.target.postMessage({eventType:e,eventId:c,data:n},[r.port2])}).finally(()=>{i&&this.removeMessageHandler(i)})}};function Ha(){return window}function T2(t){Ha().location.href=t}function tx(){return typeof Ha().WorkerGlobalScope<"u"&&typeof Ha().importScripts=="function"}async function E2(){if(!navigator?.serviceWorker)return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function b2(){return navigator?.serviceWorker?.controller||null}function w2(){return tx()?self:null}var nx="firebaseLocalStorageDb",C2=1,Lh="firebaseLocalStorage",ax="fbase_key",mi=class{constructor(e){this.request=e}toPromise(){return new Promise((e,n)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{n(this.request.error)})})}};function Vh(t,e){return t.transaction([Lh],e?"readwrite":"readonly").objectStore(Lh)}function L2(){let t=indexedDB.deleteDatabase(nx);return new mi(t).toPromise()}function FI(){let t=indexedDB.open(nx,C2);return new Promise((e,n)=>{t.addEventListener("error",()=>{n(t.error)}),t.addEventListener("upgradeneeded",()=>{let a=t.result;try{a.createObjectStore(Lh,{keyPath:ax})}catch(r){n(r)}}),t.addEventListener("success",async()=>{let a=t.result;a.objectStoreNames.contains(Lh)?e(a):(a.close(),await L2(),e(await FI()))})})}async function IA(t,e,n){let a=Vh(t,!0).put({[ax]:e,value:n});return new mi(a).toPromise()}async function A2(t,e){let n=Vh(t,!1).get(e),a=await new mi(n).toPromise();return a===void 0?null:a.value}function _A(t,e){let n=Vh(t,!0).delete(e);return new mi(n).toPromise()}var x2=800,R2=3,Ah=class{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await FI(),this.db)}async _withRetries(e){let n=0;for(;;)try{let a=await this._openDb();return await e(a)}catch(a){if(n++>R2)throw a;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return tx()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Ch._getInstance(w2()),this.receiver._subscribe("keyChanged",async(e,n)=>({keyProcessed:(await this._poll()).includes(n.key)})),this.receiver._subscribe("ping",async(e,n)=>["keyChanged"])}async initializeSender(){if(this.activeServiceWorker=await E2(),!this.activeServiceWorker)return;this.sender=new UI(this.activeServiceWorker);let e=await this.sender._send("ping",{},800);e&&e[0]?.fulfilled&&e[0]?.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||b2()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;let e=await FI();return await IA(e,Th,"1"),await _A(e,Th),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,n){return this._withPendingWrite(async()=>(await this._withRetries(a=>IA(a,e,n)),this.localCache[e]=n,this.notifyServiceWorker(e)))}async _get(e){let n=await this._withRetries(a=>A2(a,e));return this.localCache[e]=n,n}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(n=>_A(n,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){let e=await this._withRetries(r=>{let s=Vh(r,!1).getAll();return new mi(s).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];let n=[],a=new Set;if(e.length!==0)for(let{fbase_key:r,value:s}of e)a.add(r),JSON.stringify(this.localCache[r])!==JSON.stringify(s)&&(this.notifyListeners(r,s),n.push(r));for(let r of Object.keys(this.localCache))this.localCache[r]&&!a.has(r)&&(this.notifyListeners(r,null),n.push(r));return n}notifyListeners(e,n){this.localCache[e]=n;let a=this.listeners[e];if(a)for(let r of Array.from(a))r(n)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),x2)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,n){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(n)}_removeListener(e,n){this.listeners[e]&&(this.listeners[e].delete(n),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}};Ah.type="LOCAL";var rx=Ah;function SA(t,e){return pn(t,"POST","/v2/accounts/mfaSignIn:start",en(t,e))}function k2(t,e){return pn(t,"POST","/v2/accounts/mfaSignIn:finalize",en(t,e))}function D2(t,e){return pn(t,"POST","/v2/accounts/mfaSignIn:finalize",en(t,e))}var YB=WA("rcb"),$B=new di(3e4,6e4);var lh="recaptcha";async function P2(t,e,n){if(!t._getRecaptchaConfig())try{await $M(t)}catch{console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.")}try{let a;if(typeof e=="string"?a={phoneNumber:e}:a=e,"session"in a){let r=a.session;if("phoneNumber"in a){ee(r.type==="enroll",t,"internal-error");let s={idToken:r.credential,phoneEnrollmentInfo:{phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"}};return(await Yu(t,s,"mfaSmsEnrollment",async(c,f)=>{if(f.phoneEnrollmentInfo.captchaResponse===Qu){ee(n?.type===lh,c,"argument-error");let p=await wI(c,f,n);return yA(c,p)}return yA(c,f)},"PHONE_PROVIDER").catch(c=>Promise.reject(c))).phoneSessionInfo.sessionInfo}else{ee(r.type==="signin",t,"internal-error");let s=a.multiFactorHint?.uid||a.multiFactorUid;ee(s,t,"missing-multi-factor-info");let i={mfaPendingCredential:r.credential,mfaEnrollmentId:s,phoneSignInInfo:{clientType:"CLIENT_TYPE_WEB"}};return(await Yu(t,i,"mfaSmsSignIn",async(f,p)=>{if(p.phoneSignInInfo.captchaResponse===Qu){ee(n?.type===lh,f,"argument-error");let m=await wI(f,p,n);return SA(f,m)}return SA(f,p)},"PHONE_PROVIDER").catch(f=>Promise.reject(f))).phoneResponseInfo.sessionInfo}}else{let r={phoneNumber:a.phoneNumber,clientType:"CLIENT_TYPE_WEB"};return(await Yu(t,r,"sendVerificationCode",async(u,c)=>{if(c.captchaResponse===Qu){ee(n?.type===lh,u,"argument-error");let f=await wI(u,c,n);return mA(u,f)}return mA(u,c)},"PHONE_PROVIDER").catch(u=>Promise.reject(u))).sessionInfo}}finally{n?._reset()}}async function wI(t,e,n){ee(n.type===lh,t,"argument-error");let a=await n.verify();ee(typeof a=="string",t,"argument-error");let r={...e};if("phoneEnrollmentInfo"in r){let s=r.phoneEnrollmentInfo.phoneNumber,i=r.phoneEnrollmentInfo.captchaResponse,l=r.phoneEnrollmentInfo.clientType,u=r.phoneEnrollmentInfo.recaptchaVersion;return Object.assign(r,{phoneEnrollmentInfo:{phoneNumber:s,recaptchaToken:a,captchaResponse:i,clientType:l,recaptchaVersion:u}}),r}else if("phoneSignInInfo"in r){let s=r.phoneSignInInfo.captchaResponse,i=r.phoneSignInInfo.clientType,l=r.phoneSignInInfo.recaptchaVersion;return Object.assign(r,{phoneSignInInfo:{recaptchaToken:a,captchaResponse:s,clientType:i,recaptchaVersion:l}}),r}else return Object.assign(r,{recaptchaToken:a}),r}var ic=class t{constructor(e){this.providerId=t.PROVIDER_ID,this.auth=Bo(e)}verifyPhoneNumber(e,n){return P2(this.auth,e,Zt(n))}static credential(e,n){return ec._fromVerification(e,n)}static credentialFromResult(e){let n=e;return t.credentialFromTaggedObject(n)}static credentialFromError(e){return t.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;let{phoneNumber:n,temporaryProof:a}=e;return n&&a?ec._fromTokenResponse(n,a):null}};ic.PROVIDER_ID="phone";ic.PHONE_SIGN_IN_METHOD="phone";function O2(t,e){return e?xr(e):(ee(t._popupRedirectResolver,t,"argument-error"),t._popupRedirectResolver)}var oc=class extends fi{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return Uo(e,this._buildIdpRequest())}_linkToIdToken(e,n){return Uo(e,this._buildIdpRequest(n))}_getReauthenticationResolver(e){return Uo(e,this._buildIdpRequest())}_buildIdpRequest(e){let n={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(n.idToken=e),n}};function M2(t){return p2(t.auth,new oc(t),t.bypassAuthState)}function N2(t){let{auth:e,user:n}=t;return ee(n,e,"internal-error"),h2(n,new oc(t),t.bypassAuthState)}async function V2(t){let{auth:e,user:n}=t;return ee(n,e,"internal-error"),f2(n,new oc(t),t.bypassAuthState)}var xh=class{constructor(e,n,a,r,s=!1){this.auth=e,this.resolver=a,this.user=r,this.bypassAuthState=s,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(n)?n:[n]}execute(){return new Promise(async(e,n)=>{this.pendingPromise={resolve:e,reject:n};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(a){this.reject(a)}})}async onAuthEvent(e){let{urlResponse:n,sessionId:a,postBody:r,tenantId:s,error:i,type:l}=e;if(i){this.reject(i);return}let u={auth:this.auth,requestUri:n,sessionId:a,tenantId:s||void 0,postBody:r||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(l)(u))}catch(c){this.reject(c)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return M2;case"linkViaPopup":case"linkViaRedirect":return V2;case"reauthViaPopup":case"reauthViaRedirect":return N2;default:_a(this.auth,"internal-error")}}resolve(e){Rr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Rr(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}};var U2=new di(2e3,1e4);var BI=class t extends xh{constructor(e,n,a,r,s){super(e,n,r,s),this.provider=a,this.authWindow=null,this.pollId=null,t.currentPopupAction&&t.currentPopupAction.cancel(),t.currentPopupAction=this}async executeNotNull(){let e=await this.execute();return ee(e,this.auth,"internal-error"),e}async onExecution(){Rr(this.filter.length===1,"Popup operations only handle one event");let e=$I();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(n=>{this.reject(n)}),this.resolver._isIframeWebStorageSupported(this.auth,n=>{n||this.reject(za(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){return this.authWindow?.associatedEvent||null}cancel(){this.reject(za(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,t.currentPopupAction=null}pollUserCancellation(){let e=()=>{if(this.authWindow?.window?.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(za(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,U2.get())};e()}};BI.currentPopupAction=null;var F2="pendingRedirect",uh=new Map,qI=class extends xh{constructor(e,n,a=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],n,void 0,a),this.eventId=null}async execute(){let e=uh.get(this.auth._key());if(!e){try{let a=await B2(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(a)}catch(n){e=()=>Promise.reject(n)}uh.set(this.auth._key(),e)}return this.bypassAuthState||uh.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){let n=await this.auth._redirectUserForId(e.eventId);if(n)return this.user=n,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}};async function B2(t,e){let n=H2(e),a=z2(t);if(!await a._isAvailable())return!1;let r=await a._get(n)==="true";return await a._remove(n),r}function q2(t,e){uh.set(t._key(),e)}function z2(t){return xr(t._redirectPersistence)}function H2(t){return oh(F2,t.config.apiKey,t.name)}async function G2(t,e,n=!1){if(Nn(t.app))return Promise.reject(ci(t));let a=Bo(t),r=O2(a,e),i=await new qI(a,r,n).execute();return i&&!n&&(delete i.user._redirectEventId,await a._persistUserIfCurrent(i.user),await a._setRedirectUser(null,e)),i}var j2=10*60*1e3,zI=class{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let n=!1;return this.consumers.forEach(a=>{this.isEventForConsumer(e,a)&&(n=!0,this.sendToConsumer(e,a),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!K2(e)||(this.hasHandledPotentialRedirect=!0,n||(this.queuedRedirectEvent=e,n=!0)),n}sendToConsumer(e,n){if(e.error&&!sx(e)){let a=e.error.code?.split("auth/")[1]||"internal-error";n.onError(za(this.auth,a))}else n.onAuthEvent(e)}isEventForConsumer(e,n){let a=n.eventId===null||!!e.eventId&&e.eventId===n.eventId;return n.filter.includes(e.type)&&a}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=j2&&this.cachedEventUids.clear(),this.cachedEventUids.has(vA(e))}saveEventToCache(e){this.cachedEventUids.add(vA(e)),this.lastProcessedEventTime=Date.now()}};function vA(t){return[t.type,t.eventId,t.sessionId,t.tenantId].filter(e=>e).join("-")}function sx({type:t,error:e}){return t==="unknown"&&e?.code==="auth/no-auth-event"}function K2(t){switch(t.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return sx(t);default:return!1}}async function W2(t,e={}){return pn(t,"GET","/v1/projects",e)}var X2=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Q2=/^https?/;async function Y2(t){if(t.config.emulator)return;let{authorizedDomains:e}=await W2(t);for(let n of e)try{if($2(n))return}catch{}_a(t,"unauthorized-domain")}function $2(t){let e=LI(),{protocol:n,hostname:a}=new URL(e);if(t.startsWith("chrome-extension://")){let i=new URL(t);return i.hostname===""&&a===""?n==="chrome-extension:"&&t.replace("chrome-extension://","")===e.replace("chrome-extension://",""):n==="chrome-extension:"&&i.hostname===a}if(!Q2.test(n))return!1;if(X2.test(t))return a===t;let r=t.replace(/\./g,"\\.");return new RegExp("^(.+\\."+r+"|"+r+")$","i").test(a)}var J2=new di(3e4,6e4);function TA(){let t=Ha().___jsl;if(t?.H){for(let e of Object.keys(t.H))if(t.H[e].r=t.H[e].r||[],t.H[e].L=t.H[e].L||[],t.H[e].r=[...t.H[e].L],t.CP)for(let n=0;n<t.CP.length;n++)t.CP[n]=null}}function Z2(t){return new Promise((e,n)=>{function a(){TA(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{TA(),n(za(t,"network-request-failed"))},timeout:J2.get()})}if(Ha().gapi?.iframes?.Iframe)e(gapi.iframes.getContext());else if(Ha().gapi?.load)a();else{let r=WA("iframefcb");return Ha()[r]=()=>{gapi.load?a():n(za(t,"network-request-failed"))},KA(`${QM()}?onload=${r}`).catch(s=>n(s))}}).catch(e=>{throw ch=null,e})}var ch=null;function eN(t){return ch=ch||Z2(t),ch}var tN=new di(5e3,15e3),nN="__/auth/iframe",aN="emulator/auth/iframe",rN={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},sN=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function iN(t){let e=t.config;ee(e.authDomain,t,"auth-domain-config-required");let n=e.emulator?WI(e,aN):`https://${t.config.authDomain}/${nN}`,a={apiKey:e.apiKey,appName:t.name,v:Ba},r=sN.get(t.config.apiHost);r&&(a.eid=r);let s=t._getFrameworks();return s.length&&(a.fw=s.join(",")),`${n}?${Oo(a).slice(1)}`}async function oN(t){let e=await eN(t),n=Ha().gapi;return ee(n,t,"internal-error"),e.open({where:document.body,url:iN(t),messageHandlersFilter:n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:rN,dontclear:!0},a=>new Promise(async(r,s)=>{await a.restyle({setHideOnLeave:!1});let i=za(t,"network-request-failed"),l=Ha().setTimeout(()=>{s(i)},tN.get());function u(){Ha().clearTimeout(l),r(a)}a.ping(u).then(u,()=>{s(i)})}))}var lN={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},uN=500,cN=600,dN="_blank",fN="http://localhost",Rh=class{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}};function hN(t,e,n,a=uN,r=cN){let s=Math.max((window.screen.availHeight-r)/2,0).toString(),i=Math.max((window.screen.availWidth-a)/2,0).toString(),l="",u={...lN,width:a.toString(),height:r.toString(),top:s,left:i},c=Jt().toLowerCase();n&&(l=FA(c)?dN:n),VA(c)&&(e=e||fN,u.scrollbars="yes");let f=Object.entries(u).reduce((m,[S,R])=>`${m}${S}=${R},`,"");if(HM(c)&&l!=="_self")return pN(e||"",l),new Rh(null);let p=window.open(e||"",l,f);ee(p,t,"popup-blocked");try{p.focus()}catch{}return new Rh(p)}function pN(t,e){let n=document.createElement("a");n.href=t,n.target=e;let a=document.createEvent("MouseEvent");a.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),n.dispatchEvent(a)}var mN="__/auth/handler",gN="emulator/auth/handler",yN=encodeURIComponent("fac");async function EA(t,e,n,a,r,s){ee(t.config.authDomain,t,"auth-domain-config-required"),ee(t.config.apiKey,t,"invalid-api-key");let i={apiKey:t.config.apiKey,appName:t.name,authType:n,redirectUrl:a,v:Ba,eventId:r};if(e instanceof vh){e.setDefaultLanguage(t.languageCode),i.providerId=e.providerId||"",WL(e.getCustomParameters())||(i.customParameters=JSON.stringify(e.getCustomParameters()));for(let[f,p]of Object.entries(s||{}))i[f]=p}if(e instanceof pi){let f=e.getScopes().filter(p=>p!=="");f.length>0&&(i.scopes=f.join(","))}t.tenantId&&(i.tid=t.tenantId);let l=i;for(let f of Object.keys(l))l[f]===void 0&&delete l[f];let u=await t._getAppCheckToken(),c=u?`#${yN}=${encodeURIComponent(u)}`:"";return`${IN(t)}?${Oo(l).slice(1)}${c}`}function IN({config:t}){return t.emulator?WI(t,gN):`https://${t.authDomain}/${mN}`}var CI="webStorageSupport",HI=class{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=YI,this._completeRedirectFn=G2,this._overrideRedirectResult=q2}async _openPopup(e,n,a,r){Rr(this.eventManagers[e._key()]?.manager,"_initialize() not called before _openPopup()");let s=await EA(e,n,a,LI(),r);return hN(e,s,$I())}async _openRedirect(e,n,a,r){await this._originValidation(e);let s=await EA(e,n,a,LI(),r);return T2(s),new Promise(()=>{})}_initialize(e){let n=e._key();if(this.eventManagers[n]){let{manager:r,promise:s}=this.eventManagers[n];return r?Promise.resolve(r):(Rr(s,"If manager is not set, promise should be"),s)}let a=this.initAndGetManager(e);return this.eventManagers[n]={promise:a},a.catch(()=>{delete this.eventManagers[n]}),a}async initAndGetManager(e){let n=await oN(e),a=new zI(e);return n.register("authEvent",r=>(ee(r?.authEvent,e,"invalid-auth-event"),{status:a.onEvent(r.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:a},this.iframes[e._key()]=n,a}_isIframeWebStorageSupported(e,n){this.iframes[e._key()].send(CI,{type:CI},r=>{let s=r?.[0]?.[CI];s!==void 0&&n(!!s),_a(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){let n=e._key();return this.originValidationPromises[n]||(this.originValidationPromises[n]=Y2(e)),this.originValidationPromises[n]}get _shouldInitProactively(){return GA()||UA()||QI()}},ix=HI,kh=class{constructor(e){this.factorId=e}_process(e,n,a){switch(n.type){case"enroll":return this._finalizeEnroll(e,n.credential,a);case"signin":return this._finalizeSignIn(e,n.credential);default:return qa("unexpected MultiFactorSessionType")}}},GI=class t extends kh{constructor(e){super("phone"),this.credential=e}static _fromCredential(e){return new t(e)}_finalizeEnroll(e,n,a){return m2(e,{idToken:n,displayName:a,phoneVerificationInfo:this.credential._makeVerificationRequest()})}_finalizeSignIn(e,n){return k2(e,{mfaPendingCredential:n,phoneVerificationInfo:this.credential._makeVerificationRequest()})}},Dh=class{constructor(){}static assertion(e){return GI._fromCredential(e)}};Dh.FACTOR_ID="phone";var Ph=class{static assertionForEnrollment(e,n){return Oh._fromSecret(e,n)}static assertionForSignIn(e,n){return Oh._fromEnrollmentId(e,n)}static async generateSecret(e){let n=e;ee(typeof n.user?.auth<"u","internal-error");let a=await g2(n.user.auth,{idToken:n.credential,totpEnrollmentInfo:{}});return Mh._fromStartTotpMfaEnrollmentResponse(a,n.user.auth)}};Ph.FACTOR_ID="totp";var Oh=class t extends kh{constructor(e,n,a){super("totp"),this.otp=e,this.enrollmentId=n,this.secret=a}static _fromSecret(e,n){return new t(n,void 0,e)}static _fromEnrollmentId(e,n){return new t(n,e)}async _finalizeEnroll(e,n,a){return ee(typeof this.secret<"u",e,"argument-error"),y2(e,{idToken:n,displayName:a,totpVerificationInfo:this.secret._makeTotpVerificationInfo(this.otp)})}async _finalizeSignIn(e,n){ee(this.enrollmentId!==void 0&&this.otp!==void 0,e,"argument-error");let a={verificationCode:this.otp};return D2(e,{mfaPendingCredential:n,mfaEnrollmentId:this.enrollmentId,totpVerificationInfo:a})}},Mh=class t{constructor(e,n,a,r,s,i,l){this.sessionInfo=i,this.auth=l,this.secretKey=e,this.hashingAlgorithm=n,this.codeLength=a,this.codeIntervalSeconds=r,this.enrollmentCompletionDeadline=s}static _fromStartTotpMfaEnrollmentResponse(e,n){return new t(e.totpSessionInfo.sharedSecretKey,e.totpSessionInfo.hashingAlgorithm,e.totpSessionInfo.verificationCodeLength,e.totpSessionInfo.periodSec,new Date(e.totpSessionInfo.finalizeEnrollmentTime).toUTCString(),e.totpSessionInfo.sessionInfo,n)}_makeTotpVerificationInfo(e){return{sessionInfo:this.sessionInfo,verificationCode:e}}generateQrCodeUrl(e,n){let a=!1;return(sh(e)||sh(n))&&(a=!0),a&&(sh(e)&&(e=this.auth.currentUser?.email||"unknownuser"),sh(n)&&(n=this.auth.name)),`otpauth://totp/${n}:${e}?secret=${this.secretKey}&issuer=${n}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`}};function sh(t){return typeof t>"u"||t?.length===0}var bA="@firebase/auth",wA="1.12.1";var jI=class{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){return this.assertAuthConfigured(),this.auth.currentUser?.uid||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;let n=this.auth.onIdTokenChanged(a=>{e(a?.stsTokenManager.accessToken||null)});this.internalListeners.set(e,n),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();let n=this.internalListeners.get(e);n&&(this.internalListeners.delete(e),n(),this.updateProactiveRefresh())}assertAuthConfigured(){ee(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}};function _N(t){switch(t){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function SN(t){Fa(new On("auth",(e,{options:n})=>{let a=e.getProvider("app").getImmediate(),r=e.getProvider("heartbeat"),s=e.getProvider("app-check-internal"),{apiKey:i,authDomain:l}=a.options;ee(i&&!i.includes(":"),"invalid-api-key",{appName:a.name});let u={apiKey:i,authDomain:l,clientPlatform:t,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:jA(t)},c=new PI(a,r,s,u);return JM(c,n),c},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,n,a)=>{e.getProvider("auth-internal").initialize()})),Fa(new On("auth-internal",e=>{let n=Bo(e.getProvider("auth").getImmediate());return(a=>new jI(a))(n)},"PRIVATE").setInstantiationMode("EXPLICIT")),Mn(bA,wA,_N(t)),Mn(bA,wA,"esm2020")}var vN=5*60,TN=sI("authIdTokenMaxAge")||vN,CA=null,EN=t=>async e=>{let n=e&&await e.getIdTokenResult(),a=n&&(new Date().getTime()-Date.parse(n.issuedAtTime))/1e3;if(a&&a>TN)return;let r=n?.token;CA!==r&&(CA=r,await fetch(t,{method:r?"POST":"DELETE",headers:r?{Authorization:`Bearer ${r}`}:{}}))};function JI(t=Vo()){let e=ui(t,"auth");if(e.isInitialized())return e.getImmediate();let n=XA(t,{popupRedirectResolver:ix,persistence:[rx,ex,YI]}),a=sI("authTokenSyncURL");if(a&&typeof isSecureContext=="boolean"&&isSecureContext){let s=new URL(a,location.origin);if(location.origin===s.origin){let i=EN(s.toString());ZA(n,i,()=>i(n.currentUser)),JA(n,l=>i(l))}}let r=aI("auth");return r&&QA(n,`http://${r}`),n}function bN(){return document.getElementsByTagName("head")?.[0]??document}WM({loadJS(t){return new Promise((e,n)=>{let a=document.createElement("script");a.setAttribute("src",t),a.onload=e,a.onerror=r=>{let s=za("internal-error");s.customData=r,n(s)},a.type="text/javascript",a.charset="UTF-8",bN().appendChild(a)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});SN("Browser");var ox=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},lx={};var kr,ZI;(function(){var t;function e(_,y){function I(){}I.prototype=y.prototype,_.F=y.prototype,_.prototype=new I,_.prototype.constructor=_,_.D=function(b,w,A){for(var T=Array(arguments.length-2),$=2;$<arguments.length;$++)T[$-2]=arguments[$];return y.prototype[w].apply(b,T)}}function n(){this.blockSize=-1}function a(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.C=Array(this.blockSize),this.o=this.h=0,this.u()}e(a,n),a.prototype.u=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function r(_,y,I){I||(I=0);let b=Array(16);if(typeof y=="string")for(var w=0;w<16;++w)b[w]=y.charCodeAt(I++)|y.charCodeAt(I++)<<8|y.charCodeAt(I++)<<16|y.charCodeAt(I++)<<24;else for(w=0;w<16;++w)b[w]=y[I++]|y[I++]<<8|y[I++]<<16|y[I++]<<24;y=_.g[0],I=_.g[1],w=_.g[2];let A=_.g[3],T;T=y+(A^I&(w^A))+b[0]+3614090360&4294967295,y=I+(T<<7&4294967295|T>>>25),T=A+(w^y&(I^w))+b[1]+3905402710&4294967295,A=y+(T<<12&4294967295|T>>>20),T=w+(I^A&(y^I))+b[2]+606105819&4294967295,w=A+(T<<17&4294967295|T>>>15),T=I+(y^w&(A^y))+b[3]+3250441966&4294967295,I=w+(T<<22&4294967295|T>>>10),T=y+(A^I&(w^A))+b[4]+4118548399&4294967295,y=I+(T<<7&4294967295|T>>>25),T=A+(w^y&(I^w))+b[5]+1200080426&4294967295,A=y+(T<<12&4294967295|T>>>20),T=w+(I^A&(y^I))+b[6]+2821735955&4294967295,w=A+(T<<17&4294967295|T>>>15),T=I+(y^w&(A^y))+b[7]+4249261313&4294967295,I=w+(T<<22&4294967295|T>>>10),T=y+(A^I&(w^A))+b[8]+1770035416&4294967295,y=I+(T<<7&4294967295|T>>>25),T=A+(w^y&(I^w))+b[9]+2336552879&4294967295,A=y+(T<<12&4294967295|T>>>20),T=w+(I^A&(y^I))+b[10]+4294925233&4294967295,w=A+(T<<17&4294967295|T>>>15),T=I+(y^w&(A^y))+b[11]+2304563134&4294967295,I=w+(T<<22&4294967295|T>>>10),T=y+(A^I&(w^A))+b[12]+1804603682&4294967295,y=I+(T<<7&4294967295|T>>>25),T=A+(w^y&(I^w))+b[13]+4254626195&4294967295,A=y+(T<<12&4294967295|T>>>20),T=w+(I^A&(y^I))+b[14]+2792965006&4294967295,w=A+(T<<17&4294967295|T>>>15),T=I+(y^w&(A^y))+b[15]+1236535329&4294967295,I=w+(T<<22&4294967295|T>>>10),T=y+(w^A&(I^w))+b[1]+4129170786&4294967295,y=I+(T<<5&4294967295|T>>>27),T=A+(I^w&(y^I))+b[6]+3225465664&4294967295,A=y+(T<<9&4294967295|T>>>23),T=w+(y^I&(A^y))+b[11]+643717713&4294967295,w=A+(T<<14&4294967295|T>>>18),T=I+(A^y&(w^A))+b[0]+3921069994&4294967295,I=w+(T<<20&4294967295|T>>>12),T=y+(w^A&(I^w))+b[5]+3593408605&4294967295,y=I+(T<<5&4294967295|T>>>27),T=A+(I^w&(y^I))+b[10]+38016083&4294967295,A=y+(T<<9&4294967295|T>>>23),T=w+(y^I&(A^y))+b[15]+3634488961&4294967295,w=A+(T<<14&4294967295|T>>>18),T=I+(A^y&(w^A))+b[4]+3889429448&4294967295,I=w+(T<<20&4294967295|T>>>12),T=y+(w^A&(I^w))+b[9]+568446438&4294967295,y=I+(T<<5&4294967295|T>>>27),T=A+(I^w&(y^I))+b[14]+3275163606&4294967295,A=y+(T<<9&4294967295|T>>>23),T=w+(y^I&(A^y))+b[3]+4107603335&4294967295,w=A+(T<<14&4294967295|T>>>18),T=I+(A^y&(w^A))+b[8]+1163531501&4294967295,I=w+(T<<20&4294967295|T>>>12),T=y+(w^A&(I^w))+b[13]+2850285829&4294967295,y=I+(T<<5&4294967295|T>>>27),T=A+(I^w&(y^I))+b[2]+4243563512&4294967295,A=y+(T<<9&4294967295|T>>>23),T=w+(y^I&(A^y))+b[7]+1735328473&4294967295,w=A+(T<<14&4294967295|T>>>18),T=I+(A^y&(w^A))+b[12]+2368359562&4294967295,I=w+(T<<20&4294967295|T>>>12),T=y+(I^w^A)+b[5]+4294588738&4294967295,y=I+(T<<4&4294967295|T>>>28),T=A+(y^I^w)+b[8]+2272392833&4294967295,A=y+(T<<11&4294967295|T>>>21),T=w+(A^y^I)+b[11]+1839030562&4294967295,w=A+(T<<16&4294967295|T>>>16),T=I+(w^A^y)+b[14]+4259657740&4294967295,I=w+(T<<23&4294967295|T>>>9),T=y+(I^w^A)+b[1]+2763975236&4294967295,y=I+(T<<4&4294967295|T>>>28),T=A+(y^I^w)+b[4]+1272893353&4294967295,A=y+(T<<11&4294967295|T>>>21),T=w+(A^y^I)+b[7]+4139469664&4294967295,w=A+(T<<16&4294967295|T>>>16),T=I+(w^A^y)+b[10]+3200236656&4294967295,I=w+(T<<23&4294967295|T>>>9),T=y+(I^w^A)+b[13]+681279174&4294967295,y=I+(T<<4&4294967295|T>>>28),T=A+(y^I^w)+b[0]+3936430074&4294967295,A=y+(T<<11&4294967295|T>>>21),T=w+(A^y^I)+b[3]+3572445317&4294967295,w=A+(T<<16&4294967295|T>>>16),T=I+(w^A^y)+b[6]+76029189&4294967295,I=w+(T<<23&4294967295|T>>>9),T=y+(I^w^A)+b[9]+3654602809&4294967295,y=I+(T<<4&4294967295|T>>>28),T=A+(y^I^w)+b[12]+3873151461&4294967295,A=y+(T<<11&4294967295|T>>>21),T=w+(A^y^I)+b[15]+530742520&4294967295,w=A+(T<<16&4294967295|T>>>16),T=I+(w^A^y)+b[2]+3299628645&4294967295,I=w+(T<<23&4294967295|T>>>9),T=y+(w^(I|~A))+b[0]+4096336452&4294967295,y=I+(T<<6&4294967295|T>>>26),T=A+(I^(y|~w))+b[7]+1126891415&4294967295,A=y+(T<<10&4294967295|T>>>22),T=w+(y^(A|~I))+b[14]+2878612391&4294967295,w=A+(T<<15&4294967295|T>>>17),T=I+(A^(w|~y))+b[5]+4237533241&4294967295,I=w+(T<<21&4294967295|T>>>11),T=y+(w^(I|~A))+b[12]+1700485571&4294967295,y=I+(T<<6&4294967295|T>>>26),T=A+(I^(y|~w))+b[3]+2399980690&4294967295,A=y+(T<<10&4294967295|T>>>22),T=w+(y^(A|~I))+b[10]+4293915773&4294967295,w=A+(T<<15&4294967295|T>>>17),T=I+(A^(w|~y))+b[1]+2240044497&4294967295,I=w+(T<<21&4294967295|T>>>11),T=y+(w^(I|~A))+b[8]+1873313359&4294967295,y=I+(T<<6&4294967295|T>>>26),T=A+(I^(y|~w))+b[15]+4264355552&4294967295,A=y+(T<<10&4294967295|T>>>22),T=w+(y^(A|~I))+b[6]+2734768916&4294967295,w=A+(T<<15&4294967295|T>>>17),T=I+(A^(w|~y))+b[13]+1309151649&4294967295,I=w+(T<<21&4294967295|T>>>11),T=y+(w^(I|~A))+b[4]+4149444226&4294967295,y=I+(T<<6&4294967295|T>>>26),T=A+(I^(y|~w))+b[11]+3174756917&4294967295,A=y+(T<<10&4294967295|T>>>22),T=w+(y^(A|~I))+b[2]+718787259&4294967295,w=A+(T<<15&4294967295|T>>>17),T=I+(A^(w|~y))+b[9]+3951481745&4294967295,_.g[0]=_.g[0]+y&4294967295,_.g[1]=_.g[1]+(w+(T<<21&4294967295|T>>>11))&4294967295,_.g[2]=_.g[2]+w&4294967295,_.g[3]=_.g[3]+A&4294967295}a.prototype.v=function(_,y){y===void 0&&(y=_.length);let I=y-this.blockSize,b=this.C,w=this.h,A=0;for(;A<y;){if(w==0)for(;A<=I;)r(this,_,A),A+=this.blockSize;if(typeof _=="string"){for(;A<y;)if(b[w++]=_.charCodeAt(A++),w==this.blockSize){r(this,b),w=0;break}}else for(;A<y;)if(b[w++]=_[A++],w==this.blockSize){r(this,b),w=0;break}}this.h=w,this.o+=y},a.prototype.A=function(){var _=Array((this.h<56?this.blockSize:this.blockSize*2)-this.h);_[0]=128;for(var y=1;y<_.length-8;++y)_[y]=0;y=this.o*8;for(var I=_.length-8;I<_.length;++I)_[I]=y&255,y/=256;for(this.v(_),_=Array(16),y=0,I=0;I<4;++I)for(let b=0;b<32;b+=8)_[y++]=this.g[I]>>>b&255;return _};function s(_,y){var I=l;return Object.prototype.hasOwnProperty.call(I,_)?I[_]:I[_]=y(_)}function i(_,y){this.h=y;let I=[],b=!0;for(let w=_.length-1;w>=0;w--){let A=_[w]|0;b&&A==y||(I[w]=A,b=!1)}this.g=I}var l={};function u(_){return-128<=_&&_<128?s(_,function(y){return new i([y|0],y<0?-1:0)}):new i([_|0],_<0?-1:0)}function c(_){if(isNaN(_)||!isFinite(_))return p;if(_<0)return L(c(-_));let y=[],I=1;for(let b=0;_>=I;b++)y[b]=_/I|0,I*=4294967296;return new i(y,0)}function f(_,y){if(_.length==0)throw Error("number format error: empty string");if(y=y||10,y<2||36<y)throw Error("radix out of range: "+y);if(_.charAt(0)=="-")return L(f(_.substring(1),y));if(_.indexOf("-")>=0)throw Error('number format error: interior "-" character');let I=c(Math.pow(y,8)),b=p;for(let A=0;A<_.length;A+=8){var w=Math.min(8,_.length-A);let T=parseInt(_.substring(A,A+w),y);w<8?(w=c(Math.pow(y,w)),b=b.j(w).add(c(T))):(b=b.j(I),b=b.add(c(T)))}return b}var p=u(0),m=u(1),S=u(16777216);t=i.prototype,t.m=function(){if(D(this))return-L(this).m();let _=0,y=1;for(let I=0;I<this.g.length;I++){let b=this.i(I);_+=(b>=0?b:4294967296+b)*y,y*=4294967296}return _},t.toString=function(_){if(_=_||10,_<2||36<_)throw Error("radix out of range: "+_);if(R(this))return"0";if(D(this))return"-"+L(this).toString(_);let y=c(Math.pow(_,6));var I=this;let b="";for(;;){let w=x(I,y).g;I=E(I,w.j(y));let A=((I.g.length>0?I.g[0]:I.h)>>>0).toString(_);if(I=w,R(I))return A+b;for(;A.length<6;)A="0"+A;b=A+b}},t.i=function(_){return _<0?0:_<this.g.length?this.g[_]:this.h};function R(_){if(_.h!=0)return!1;for(let y=0;y<_.g.length;y++)if(_.g[y]!=0)return!1;return!0}function D(_){return _.h==-1}t.l=function(_){return _=E(this,_),D(_)?-1:R(_)?0:1};function L(_){let y=_.g.length,I=[];for(let b=0;b<y;b++)I[b]=~_.g[b];return new i(I,~_.h).add(m)}t.abs=function(){return D(this)?L(this):this},t.add=function(_){let y=Math.max(this.g.length,_.g.length),I=[],b=0;for(let w=0;w<=y;w++){let A=b+(this.i(w)&65535)+(_.i(w)&65535),T=(A>>>16)+(this.i(w)>>>16)+(_.i(w)>>>16);b=T>>>16,A&=65535,T&=65535,I[w]=T<<16|A}return new i(I,I[I.length-1]&-2147483648?-1:0)};function E(_,y){return _.add(L(y))}t.j=function(_){if(R(this)||R(_))return p;if(D(this))return D(_)?L(this).j(L(_)):L(L(this).j(_));if(D(_))return L(this.j(L(_)));if(this.l(S)<0&&_.l(S)<0)return c(this.m()*_.m());let y=this.g.length+_.g.length,I=[];for(var b=0;b<2*y;b++)I[b]=0;for(b=0;b<this.g.length;b++)for(let w=0;w<_.g.length;w++){let A=this.i(b)>>>16,T=this.i(b)&65535,$=_.i(w)>>>16,He=_.i(w)&65535;I[2*b+2*w]+=T*He,v(I,2*b+2*w),I[2*b+2*w+1]+=A*He,v(I,2*b+2*w+1),I[2*b+2*w+1]+=T*$,v(I,2*b+2*w+1),I[2*b+2*w+2]+=A*$,v(I,2*b+2*w+2)}for(_=0;_<y;_++)I[_]=I[2*_+1]<<16|I[2*_];for(_=y;_<2*y;_++)I[_]=0;return new i(I,0)};function v(_,y){for(;(_[y]&65535)!=_[y];)_[y+1]+=_[y]>>>16,_[y]&=65535,y++}function C(_,y){this.g=_,this.h=y}function x(_,y){if(R(y))throw Error("division by zero");if(R(_))return new C(p,p);if(D(_))return y=x(L(_),y),new C(L(y.g),L(y.h));if(D(y))return y=x(_,L(y)),new C(L(y.g),y.h);if(_.g.length>30){if(D(_)||D(y))throw Error("slowDivide_ only works with positive integers.");for(var I=m,b=y;b.l(_)<=0;)I=H(I),b=H(b);var w=G(I,1),A=G(b,1);for(b=G(b,2),I=G(I,2);!R(b);){var T=A.add(b);T.l(_)<=0&&(w=w.add(I),A=T),b=G(b,1),I=G(I,1)}return y=E(_,w.j(y)),new C(w,y)}for(w=p;_.l(y)>=0;){for(I=Math.max(1,Math.floor(_.m()/y.m())),b=Math.ceil(Math.log(I)/Math.LN2),b=b<=48?1:Math.pow(2,b-48),A=c(I),T=A.j(y);D(T)||T.l(_)>0;)I-=b,A=c(I),T=A.j(y);R(A)&&(A=m),w=w.add(A),_=E(_,T)}return new C(w,_)}t.B=function(_){return x(this,_).h},t.and=function(_){let y=Math.max(this.g.length,_.g.length),I=[];for(let b=0;b<y;b++)I[b]=this.i(b)&_.i(b);return new i(I,this.h&_.h)},t.or=function(_){let y=Math.max(this.g.length,_.g.length),I=[];for(let b=0;b<y;b++)I[b]=this.i(b)|_.i(b);return new i(I,this.h|_.h)},t.xor=function(_){let y=Math.max(this.g.length,_.g.length),I=[];for(let b=0;b<y;b++)I[b]=this.i(b)^_.i(b);return new i(I,this.h^_.h)};function H(_){let y=_.g.length+1,I=[];for(let b=0;b<y;b++)I[b]=_.i(b)<<1|_.i(b-1)>>>31;return new i(I,_.h)}function G(_,y){let I=y>>5;y%=32;let b=_.g.length-I,w=[];for(let A=0;A<b;A++)w[A]=y>0?_.i(A+I)>>>y|_.i(A+I+1)<<32-y:_.i(A+I);return new i(w,_.h)}a.prototype.digest=a.prototype.A,a.prototype.reset=a.prototype.u,a.prototype.update=a.prototype.v,ZI=lx.Md5=a,i.prototype.add=i.prototype.add,i.prototype.multiply=i.prototype.j,i.prototype.modulo=i.prototype.B,i.prototype.compare=i.prototype.l,i.prototype.toNumber=i.prototype.m,i.prototype.toString=i.prototype.toString,i.prototype.getBits=i.prototype.i,i.fromNumber=c,i.fromString=f,kr=lx.Integer=i}).apply(typeof ox<"u"?ox:typeof self<"u"?self:typeof window<"u"?window:{});var Uh=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Dr={};var e_,wN,qo,t_,lc,Fh,n_,a_,r_;(function(){var t,e=Object.defineProperty;function n(o){o=[typeof globalThis=="object"&&globalThis,o,typeof window=="object"&&window,typeof self=="object"&&self,typeof Uh=="object"&&Uh];for(var d=0;d<o.length;++d){var h=o[d];if(h&&h.Math==Math)return h}throw Error("Cannot find global object")}var a=n(this);function r(o,d){if(d)e:{var h=a;o=o.split(".");for(var g=0;g<o.length-1;g++){var k=o[g];if(!(k in h))break e;h=h[k]}o=o[o.length-1],g=h[o],d=d(g),d!=g&&d!=null&&e(h,o,{configurable:!0,writable:!0,value:d})}}r("Symbol.dispose",function(o){return o||Symbol("Symbol.dispose")}),r("Array.prototype.values",function(o){return o||function(){return this[Symbol.iterator]()}}),r("Object.entries",function(o){return o||function(d){var h=[],g;for(g in d)Object.prototype.hasOwnProperty.call(d,g)&&h.push([g,d[g]]);return h}});var s=s||{},i=this||self;function l(o){var d=typeof o;return d=="object"&&o!=null||d=="function"}function u(o,d,h){return o.call.apply(o.bind,arguments)}function c(o,d,h){return c=u,c.apply(null,arguments)}function f(o,d){var h=Array.prototype.slice.call(arguments,1);return function(){var g=h.slice();return g.push.apply(g,arguments),o.apply(this,g)}}function p(o,d){function h(){}h.prototype=d.prototype,o.Z=d.prototype,o.prototype=new h,o.prototype.constructor=o,o.Ob=function(g,k,P){for(var K=Array(arguments.length-2),me=2;me<arguments.length;me++)K[me-2]=arguments[me];return d.prototype[k].apply(g,K)}}var m=typeof AsyncContext<"u"&&typeof AsyncContext.Snapshot=="function"?o=>o&&AsyncContext.Snapshot.wrap(o):o=>o;function S(o){let d=o.length;if(d>0){let h=Array(d);for(let g=0;g<d;g++)h[g]=o[g];return h}return[]}function R(o,d){for(let g=1;g<arguments.length;g++){let k=arguments[g];var h=typeof k;if(h=h!="object"?h:k?Array.isArray(k)?"array":h:"null",h=="array"||h=="object"&&typeof k.length=="number"){h=o.length||0;let P=k.length||0;o.length=h+P;for(let K=0;K<P;K++)o[h+K]=k[K]}else o.push(k)}}class D{constructor(d,h){this.i=d,this.j=h,this.h=0,this.g=null}get(){let d;return this.h>0?(this.h--,d=this.g,this.g=d.next,d.next=null):d=this.i(),d}}function L(o){i.setTimeout(()=>{throw o},0)}function E(){var o=_;let d=null;return o.g&&(d=o.g,o.g=o.g.next,o.g||(o.h=null),d.next=null),d}class v{constructor(){this.h=this.g=null}add(d,h){let g=C.get();g.set(d,h),this.h?this.h.next=g:this.g=g,this.h=g}}var C=new D(()=>new x,o=>o.reset());class x{constructor(){this.next=this.g=this.h=null}set(d,h){this.h=d,this.g=h,this.next=null}reset(){this.next=this.g=this.h=null}}let H,G=!1,_=new v,y=()=>{let o=Promise.resolve(void 0);H=()=>{o.then(I)}};function I(){for(var o;o=E();){try{o.h.call(o.g)}catch(h){L(h)}var d=C;d.j(o),d.h<100&&(d.h++,o.next=d.g,d.g=o)}G=!1}function b(){this.u=this.u,this.C=this.C}b.prototype.u=!1,b.prototype.dispose=function(){this.u||(this.u=!0,this.N())},b.prototype[Symbol.dispose]=function(){this.dispose()},b.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function w(o,d){this.type=o,this.g=this.target=d,this.defaultPrevented=!1}w.prototype.h=function(){this.defaultPrevented=!0};var A=function(){if(!i.addEventListener||!Object.defineProperty)return!1;var o=!1,d=Object.defineProperty({},"passive",{get:function(){o=!0}});try{let h=()=>{};i.addEventListener("test",h,d),i.removeEventListener("test",h,d)}catch{}return o}();function T(o){return/^[\s\xa0]*$/.test(o)}function $(o,d){w.call(this,o?o.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,o&&this.init(o,d)}p($,w),$.prototype.init=function(o,d){let h=this.type=o.type,g=o.changedTouches&&o.changedTouches.length?o.changedTouches[0]:null;this.target=o.target||o.srcElement,this.g=d,d=o.relatedTarget,d||(h=="mouseover"?d=o.fromElement:h=="mouseout"&&(d=o.toElement)),this.relatedTarget=d,g?(this.clientX=g.clientX!==void 0?g.clientX:g.pageX,this.clientY=g.clientY!==void 0?g.clientY:g.pageY,this.screenX=g.screenX||0,this.screenY=g.screenY||0):(this.clientX=o.clientX!==void 0?o.clientX:o.pageX,this.clientY=o.clientY!==void 0?o.clientY:o.pageY,this.screenX=o.screenX||0,this.screenY=o.screenY||0),this.button=o.button,this.key=o.key||"",this.ctrlKey=o.ctrlKey,this.altKey=o.altKey,this.shiftKey=o.shiftKey,this.metaKey=o.metaKey,this.pointerId=o.pointerId||0,this.pointerType=o.pointerType,this.state=o.state,this.i=o,o.defaultPrevented&&$.Z.h.call(this)},$.prototype.h=function(){$.Z.h.call(this);let o=this.i;o.preventDefault?o.preventDefault():o.returnValue=!1};var He="closure_listenable_"+(Math.random()*1e6|0),At=0;function M(o,d,h,g,k){this.listener=o,this.proxy=null,this.src=d,this.type=h,this.capture=!!g,this.ha=k,this.key=++At,this.da=this.fa=!1}function O(o){o.da=!0,o.listener=null,o.proxy=null,o.src=null,o.ha=null}function U(o,d,h){for(let g in o)d.call(h,o[g],g,o)}function J(o,d){for(let h in o)d.call(void 0,o[h],h,o)}function Q(o){let d={};for(let h in o)d[h]=o[h];return d}let re="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function We(o,d){let h,g;for(let k=1;k<arguments.length;k++){g=arguments[k];for(h in g)o[h]=g[h];for(let P=0;P<re.length;P++)h=re[P],Object.prototype.hasOwnProperty.call(g,h)&&(o[h]=g[h])}}function Oe(o){this.src=o,this.g={},this.h=0}Oe.prototype.add=function(o,d,h,g,k){let P=o.toString();o=this.g[P],o||(o=this.g[P]=[],this.h++);let K=Je(o,d,g,k);return K>-1?(d=o[K],h||(d.fa=!1)):(d=new M(d,this.src,P,!!g,k),d.fa=h,o.push(d)),d};function $e(o,d){let h=d.type;if(h in o.g){var g=o.g[h],k=Array.prototype.indexOf.call(g,d,void 0),P;(P=k>=0)&&Array.prototype.splice.call(g,k,1),P&&(O(d),o.g[h].length==0&&(delete o.g[h],o.h--))}}function Je(o,d,h,g){for(let k=0;k<o.length;++k){let P=o[k];if(!P.da&&P.listener==d&&P.capture==!!h&&P.ha==g)return k}return-1}var bn="closure_lm_"+(Math.random()*1e6|0),yn={};function ot(o,d,h,g,k){if(g&&g.once)return ie(o,d,h,g,k);if(Array.isArray(d)){for(let P=0;P<d.length;P++)ot(o,d[P],h,g,k);return null}return h=Xe(h),o&&o[He]?o.J(d,h,l(g)?!!g.capture:!!g,k):N(o,d,h,!1,g,k)}function N(o,d,h,g,k,P){if(!d)throw Error("Invalid event type");let K=l(k)?!!k.capture:!!k,me=ft(o);if(me||(o[bn]=me=new Oe(o)),h=me.add(d,h,g,K,P),h.proxy)return h;if(g=ae(),h.proxy=g,g.src=o,g.listener=h,o.addEventListener)A||(k=K),k===void 0&&(k=!1),o.addEventListener(d.toString(),g,k);else if(o.attachEvent)o.attachEvent(Te(d.toString()),g);else if(o.addListener&&o.removeListener)o.addListener(g);else throw Error("addEventListener and attachEvent are unavailable.");return h}function ae(){function o(h){return d.call(o.src,o.listener,h)}let d=Wt;return o}function ie(o,d,h,g,k){if(Array.isArray(d)){for(let P=0;P<d.length;P++)ie(o,d[P],h,g,k);return null}return h=Xe(h),o&&o[He]?o.K(d,h,l(g)?!!g.capture:!!g,k):N(o,d,h,!0,g,k)}function ue(o,d,h,g,k){if(Array.isArray(d))for(var P=0;P<d.length;P++)ue(o,d[P],h,g,k);else g=l(g)?!!g.capture:!!g,h=Xe(h),o&&o[He]?(o=o.i,P=String(d).toString(),P in o.g&&(d=o.g[P],h=Je(d,h,g,k),h>-1&&(O(d[h]),Array.prototype.splice.call(d,h,1),d.length==0&&(delete o.g[P],o.h--)))):o&&(o=ft(o))&&(d=o.g[d.toString()],o=-1,d&&(o=Je(d,h,g,k)),(h=o>-1?d[o]:null)&&ye(h))}function ye(o){if(typeof o!="number"&&o&&!o.da){var d=o.src;if(d&&d[He])$e(d.i,o);else{var h=o.type,g=o.proxy;d.removeEventListener?d.removeEventListener(h,g,o.capture):d.detachEvent?d.detachEvent(Te(h),g):d.addListener&&d.removeListener&&d.removeListener(g),(h=ft(d))?($e(h,o),h.h==0&&(h.src=null,d[bn]=null)):O(o)}}}function Te(o){return o in yn?yn[o]:yn[o]="on"+o}function Wt(o,d){if(o.da)o=!0;else{d=new $(d,this);let h=o.listener,g=o.ha||o.src;o.fa&&ye(o),o=h.call(g,d)}return o}function ft(o){return o=o[bn],o instanceof Oe?o:null}var Ze="__closure_events_fn_"+(Math.random()*1e9>>>0);function Xe(o){return typeof o=="function"?o:(o[Ze]||(o[Ze]=function(d){return o.handleEvent(d)}),o[Ze])}function Ie(){b.call(this),this.i=new Oe(this),this.M=this,this.G=null}p(Ie,b),Ie.prototype[He]=!0,Ie.prototype.removeEventListener=function(o,d,h,g){ue(this,o,d,h,g)};function de(o,d){var h,g=o.G;if(g)for(h=[];g;g=g.G)h.push(g);if(o=o.M,g=d.type||d,typeof d=="string")d=new w(d,o);else if(d instanceof w)d.target=d.target||o;else{var k=d;d=new w(g,o),We(d,k)}k=!0;let P,K;if(h)for(K=h.length-1;K>=0;K--)P=d.g=h[K],k=Ve(P,g,!0,d)&&k;if(P=d.g=o,k=Ve(P,g,!0,d)&&k,k=Ve(P,g,!1,d)&&k,h)for(K=0;K<h.length;K++)P=d.g=h[K],k=Ve(P,g,!1,d)&&k}Ie.prototype.N=function(){if(Ie.Z.N.call(this),this.i){var o=this.i;for(let d in o.g){let h=o.g[d];for(let g=0;g<h.length;g++)O(h[g]);delete o.g[d],o.h--}}this.G=null},Ie.prototype.J=function(o,d,h,g){return this.i.add(String(o),d,!1,h,g)},Ie.prototype.K=function(o,d,h,g){return this.i.add(String(o),d,!0,h,g)};function Ve(o,d,h,g){if(d=o.i.g[String(d)],!d)return!0;d=d.concat();let k=!0;for(let P=0;P<d.length;++P){let K=d[P];if(K&&!K.da&&K.capture==h){let me=K.listener,zt=K.ha||K.src;K.fa&&$e(o.i,K),k=me.call(zt,g)!==!1&&k}}return k&&!g.defaultPrevented}function Re(o,d){if(typeof o!="function")if(o&&typeof o.handleEvent=="function")o=c(o.handleEvent,o);else throw Error("Invalid listener argument");return Number(d)>2147483647?-1:i.setTimeout(o,d||0)}function ke(o){o.g=Re(()=>{o.g=null,o.i&&(o.i=!1,ke(o))},o.l);let d=o.h;o.h=null,o.m.apply(null,d)}class Qe extends b{constructor(d,h){super(),this.m=d,this.l=h,this.h=null,this.i=!1,this.g=null}j(d){this.h=arguments,this.g?this.i=!0:ke(this)}N(){super.N(),this.g&&(i.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function et(o){b.call(this),this.h=o,this.g={}}p(et,b);var tt=[];function Bt(o){U(o.g,function(d,h){this.g.hasOwnProperty(h)&&ye(d)},o),o.g={}}et.prototype.N=function(){et.Z.N.call(this),Bt(this)},et.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var an=i.JSON.stringify,In=i.JSON.parse,Tt=class{stringify(o){return i.JSON.stringify(o,void 0)}parse(o){return i.JSON.parse(o,void 0)}};function wn(){}function yt(){}var Be={OPEN:"a",hb:"b",ERROR:"c",tb:"d"};function De(){w.call(this,"d")}p(De,w);function xt(){w.call(this,"c")}p(xt,w);var Yn={},Ea=null;function ha(){return Ea=Ea||new Ie}Yn.Ia="serverreachability";function ba(o){w.call(this,Yn.Ia,o)}p(ba,w);function ar(o){let d=ha();de(d,new ba(d))}Yn.STAT_EVENT="statevent";function xi(o,d){w.call(this,Yn.STAT_EVENT,o),this.stat=d}p(xi,w);function qt(o){let d=ha();de(d,new xi(d,o))}Yn.Ja="timingevent";function Kr(o,d){w.call(this,Yn.Ja,o),this.size=d}p(Kr,w);function rr(o,d){if(typeof o!="function")throw Error("Fn must not be null and must be a function");return i.setTimeout(function(){o()},d)}function sr(){this.g=!0}sr.prototype.ua=function(){this.g=!1};function bl(o,d,h,g,k,P){o.info(function(){if(o.g)if(P){var K="",me=P.split("&");for(let Ge=0;Ge<me.length;Ge++){var zt=me[Ge].split("=");if(zt.length>1){let Xt=zt[0];zt=zt[1];let Aa=Xt.split("_");K=Aa.length>=2&&Aa[1]=="type"?K+(Xt+"="+zt+"&"):K+(Xt+"=redacted&")}}}else K=null;else K=P;return"XMLHTTP REQ ("+g+") [attempt "+k+"]: "+d+`
`+h+`
`+K})}function wl(o,d,h,g,k,P,K){o.info(function(){return"XMLHTTP RESP ("+g+") [ attempt "+k+"]: "+d+`
`+h+`
`+P+" "+K})}function ir(o,d,h,g){o.info(function(){return"XMLHTTP TEXT ("+d+"): "+nd(o,h)+(g?" "+g:"")})}function td(o,d){o.info(function(){return"TIMEOUT: "+d})}sr.prototype.info=function(){};function nd(o,d){if(!o.g)return d;if(!d)return null;try{let P=JSON.parse(d);if(P){for(o=0;o<P.length;o++)if(Array.isArray(P[o])){var h=P[o];if(!(h.length<2)){var g=h[1];if(Array.isArray(g)&&!(g.length<1)){var k=g[0];if(k!="noop"&&k!="stop"&&k!="close")for(let K=1;K<g.length;K++)g[K]=""}}}}return an(P)}catch{return d}}var _n={NO_ERROR:0,cb:1,qb:2,pb:3,kb:4,ob:5,rb:6,Ga:7,TIMEOUT:8,ub:9},dn={ib:"complete",Fb:"success",ERROR:"error",Ga:"abort",xb:"ready",yb:"readystatechange",TIMEOUT:"timeout",sb:"incrementaldata",wb:"progress",lb:"downloadprogress",Nb:"uploadprogress"},$n;function Jn(){}p(Jn,wn),Jn.prototype.g=function(){return new XMLHttpRequest},$n=new Jn;function Wr(o){return encodeURIComponent(String(o))}function Ri(o){var d=1;o=o.split(":");let h=[];for(;d>0&&o.length;)h.push(o.shift()),d--;return o.length&&h.push(o.join(":")),h}function pa(o,d,h,g){this.j=o,this.i=d,this.l=h,this.S=g||1,this.V=new et(this),this.H=45e3,this.J=null,this.o=!1,this.u=this.B=this.A=this.M=this.F=this.T=this.D=null,this.G=[],this.g=null,this.C=0,this.m=this.v=null,this.X=-1,this.K=!1,this.P=0,this.O=null,this.W=this.L=this.U=this.R=!1,this.h=new Cl}function Cl(){this.i=null,this.g="",this.h=!1}var Ll={},ki={};function Di(o,d,h){o.M=1,o.A=Ee(j(d)),o.u=h,o.R=!0,wa(o,null)}function wa(o,d){o.F=Date.now(),Ca(o),o.B=j(o.A);var h=o.B,g=o.S;Array.isArray(g)||(g=[String(g)]),Pv(h.i,"t",g),o.C=0,h=o.j.L,o.h=new Cl,o.g=$v(o.j,h?d:null,!o.u),o.P>0&&(o.O=new Qe(c(o.Y,o,o.g),o.P)),d=o.V,h=o.g,g=o.ba;var k="readystatechange";Array.isArray(k)||(k&&(tt[0]=k.toString()),k=tt);for(let P=0;P<k.length;P++){let K=ot(h,k[P],g||d.handleEvent,!1,d.h||d);if(!K)break;d.g[K.key]=K}d=o.J?Q(o.J):{},o.u?(o.v||(o.v="POST"),d["Content-Type"]="application/x-www-form-urlencoded",o.g.ea(o.B,o.v,o.u,d)):(o.v="GET",o.g.ea(o.B,o.v,null,d)),ar(),bl(o.i,o.v,o.B,o.l,o.S,o.u)}pa.prototype.ba=function(o){o=o.target;let d=this.O;d&&Yr(o)==3?d.j():this.Y(o)},pa.prototype.Y=function(o){try{if(o==this.g)e:{let me=Yr(this.g),zt=this.g.ya(),Ge=this.g.ca();if(!(me<3)&&(me!=3||this.g&&(this.h.h||this.g.la()||Bv(this.g)))){this.K||me!=4||zt==7||(zt==8||Ge<=0?ar(3):ar(2)),Pi(this);var d=this.g.ca();this.X=d;var h=ad(this);if(this.o=d==200,wl(this.i,this.v,this.B,this.l,this.S,me,d),this.o){if(this.U&&!this.L){t:{if(this.g){var g,k=this.g;if((g=k.g?k.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!T(g)){var P=g;break t}}P=null}if(o=P)ir(this.i,this.l,o,"Initial handshake response via X-HTTP-Initial-Response"),this.L=!0,Oi(this,o);else{this.o=!1,this.m=3,qt(12),La(this),Xr(this);break e}}if(this.R){o=!0;let Xt;for(;!this.K&&this.C<h.length;)if(Xt=rd(this,h),Xt==ki){me==4&&(this.m=4,qt(14),o=!1),ir(this.i,this.l,null,"[Incomplete Response]");break}else if(Xt==Ll){this.m=4,qt(15),ir(this.i,this.l,h,"[Invalid Chunk]"),o=!1;break}else ir(this.i,this.l,Xt,null),Oi(this,Xt);if(Al(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),me!=4||h.length!=0||this.h.h||(this.m=1,qt(16),o=!1),this.o=this.o&&o,!o)ir(this.i,this.l,h,"[Invalid Chunked Response]"),La(this),Xr(this);else if(h.length>0&&!this.W){this.W=!0;var K=this.j;K.g==this&&K.aa&&!K.P&&(K.j.info("Great, no buffering proxy detected. Bytes received: "+h.length),Zp(K),K.P=!0,qt(11))}}else ir(this.i,this.l,h,null),Oi(this,h);me==4&&La(this),this.o&&!this.K&&(me==4?Wv(this.j,this):(this.o=!1,Ca(this)))}else N1(this.g),d==400&&h.indexOf("Unknown SID")>0?(this.m=3,qt(12)):(this.m=0,qt(13)),La(this),Xr(this)}}}catch{}finally{}};function ad(o){if(!Al(o))return o.g.la();let d=Bv(o.g);if(d==="")return"";let h="",g=d.length,k=Yr(o.g)==4;if(!o.h.i){if(typeof TextDecoder>"u")return La(o),Xr(o),"";o.h.i=new i.TextDecoder}for(let P=0;P<g;P++)o.h.h=!0,h+=o.h.i.decode(d[P],{stream:!(k&&P==g-1)});return d.length=0,o.h.g+=h,o.C=0,o.h.g}function Al(o){return o.g?o.v=="GET"&&o.M!=2&&o.j.Aa:!1}function rd(o,d){var h=o.C,g=d.indexOf(`
`,h);return g==-1?ki:(h=Number(d.substring(h,g)),isNaN(h)?Ll:(g+=1,g+h>d.length?ki:(d=d.slice(g,g+h),o.C=g+h,d)))}pa.prototype.cancel=function(){this.K=!0,La(this)};function Ca(o){o.T=Date.now()+o.H,xl(o,o.H)}function xl(o,d){if(o.D!=null)throw Error("WatchDog timer not null");o.D=rr(c(o.aa,o),d)}function Pi(o){o.D&&(i.clearTimeout(o.D),o.D=null)}pa.prototype.aa=function(){this.D=null;let o=Date.now();o-this.T>=0?(td(this.i,this.B),this.M!=2&&(ar(),qt(17)),La(this),this.m=2,Xr(this)):xl(this,this.T-o)};function Xr(o){o.j.I==0||o.K||Wv(o.j,o)}function La(o){Pi(o);var d=o.O;d&&typeof d.dispose=="function"&&d.dispose(),o.O=null,Bt(o.V),o.g&&(d=o.g,o.g=null,d.abort(),d.dispose())}function Oi(o,d){try{var h=o.j;if(h.I!=0&&(h.g==o||Mi(h.h,o))){if(!o.L&&Mi(h.h,o)&&h.I==3){try{var g=h.Ba.g.parse(d)}catch{g=null}if(Array.isArray(g)&&g.length==3){var k=g;if(k[0]==0){e:if(!h.v){if(h.g)if(h.g.F+3e3<o.F)hd(h),dd(h);else break e;Jp(h),qt(18)}}else h.xa=k[1],0<h.xa-h.K&&k[2]<37500&&h.F&&h.A==0&&!h.C&&(h.C=rr(c(h.Va,h),6e3));Dl(h.h)<=1&&h.ta&&(h.ta=void 0)}else Fs(h,11)}else if((o.L||h.g==o)&&hd(h),!T(d))for(k=h.Ba.g.parse(d),d=0;d<k.length;d++){let Ge=k[d],Xt=Ge[0];if(!(Xt<=h.K))if(h.K=Xt,Ge=Ge[1],h.I==2)if(Ge[0]=="c"){h.M=Ge[1],h.ba=Ge[2];let Aa=Ge[3];Aa!=null&&(h.ka=Aa,h.j.info("VER="+h.ka));let Bs=Ge[4];Bs!=null&&(h.za=Bs,h.j.info("SVER="+h.za));let $r=Ge[5];$r!=null&&typeof $r=="number"&&$r>0&&(g=1.5*$r,h.O=g,h.j.info("backChannelRequestTimeoutMs_="+g)),g=h;let Jr=o.g;if(Jr){let md=Jr.g?Jr.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(md){var P=g.h;P.g||md.indexOf("spdy")==-1&&md.indexOf("quic")==-1&&md.indexOf("h2")==-1||(P.j=P.l,P.g=new Set,P.h&&(Pl(P,P.h),P.h=null))}if(g.G){let em=Jr.g?Jr.g.getResponseHeader("X-HTTP-Session-Id"):null;em&&(g.wa=em,te(g.J,g.G,em))}}h.I=3,h.l&&h.l.ra(),h.aa&&(h.T=Date.now()-o.F,h.j.info("Handshake RTT: "+h.T+"ms")),g=h;var K=o;if(g.na=Yv(g,g.L?g.ba:null,g.W),K.L){Ni(g.h,K);var me=K,zt=g.O;zt&&(me.H=zt),me.D&&(Pi(me),Ca(me)),g.g=K}else jv(g);h.i.length>0&&fd(h)}else Ge[0]!="stop"&&Ge[0]!="close"||Fs(h,7);else h.I==3&&(Ge[0]=="stop"||Ge[0]=="close"?Ge[0]=="stop"?Fs(h,7):$p(h):Ge[0]!="noop"&&h.l&&h.l.qa(Ge),h.A=0)}}ar(4)}catch{}}var sd=class{constructor(o,d){this.g=o,this.map=d}};function Rl(o){this.l=o||10,i.PerformanceNavigationTiming?(o=i.performance.getEntriesByType("navigation"),o=o.length>0&&(o[0].nextHopProtocol=="hq"||o[0].nextHopProtocol=="h2")):o=!!(i.chrome&&i.chrome.loadTimes&&i.chrome.loadTimes()&&i.chrome.loadTimes().wasFetchedViaSpdy),this.j=o?this.l:1,this.g=null,this.j>1&&(this.g=new Set),this.h=null,this.i=[]}function kl(o){return o.h?!0:o.g?o.g.size>=o.j:!1}function Dl(o){return o.h?1:o.g?o.g.size:0}function Mi(o,d){return o.h?o.h==d:o.g?o.g.has(d):!1}function Pl(o,d){o.g?o.g.add(d):o.h=d}function Ni(o,d){o.h&&o.h==d?o.h=null:o.g&&o.g.has(d)&&o.g.delete(d)}Rl.prototype.cancel=function(){if(this.i=id(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(let o of this.g.values())o.cancel();this.g.clear()}};function id(o){if(o.h!=null)return o.i.concat(o.h.G);if(o.g!=null&&o.g.size!==0){let d=o.i;for(let h of o.g.values())d=d.concat(h.G);return d}return S(o.i)}var od=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function z(o,d){if(o){o=o.split("&");for(let h=0;h<o.length;h++){let g=o[h].indexOf("="),k,P=null;g>=0?(k=o[h].substring(0,g),P=o[h].substring(g+1)):k=o[h],d(k,P?decodeURIComponent(P.replace(/\+/g," ")):"")}}}function W(o){this.g=this.o=this.j="",this.u=null,this.m=this.h="",this.l=!1;let d;o instanceof W?(this.l=o.l,Z(this,o.j),this.o=o.o,this.g=o.g,oe(this,o.u),this.h=o.h,nt(this,Ov(o.i)),this.m=o.m):o&&(d=String(o).match(od))?(this.l=!1,Z(this,d[1]||"",!0),this.o=fn(d[2]||""),this.g=fn(d[3]||"",!0),oe(this,d[4]),this.h=fn(d[5]||"",!0),nt(this,d[6]||"",!0),this.m=fn(d[7]||"")):(this.l=!1,this.i=new Ml(null,this.l))}W.prototype.toString=function(){let o=[];var d=this.j;d&&o.push(Ol(d,xv,!0),":");var h=this.g;return(h||d=="file")&&(o.push("//"),(d=this.o)&&o.push(Ol(d,xv,!0),"@"),o.push(Wr(h).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),h=this.u,h!=null&&o.push(":",String(h))),(h=this.h)&&(this.g&&h.charAt(0)!="/"&&o.push("/"),o.push(Ol(h,h.charAt(0)=="/"?L1:C1,!0))),(h=this.i.toString())&&o.push("?",h),(h=this.m)&&o.push("#",Ol(h,x1)),o.join("")},W.prototype.resolve=function(o){let d=j(this),h=!!o.j;h?Z(d,o.j):h=!!o.o,h?d.o=o.o:h=!!o.g,h?d.g=o.g:h=o.u!=null;var g=o.h;if(h)oe(d,o.u);else if(h=!!o.h){if(g.charAt(0)!="/")if(this.g&&!this.h)g="/"+g;else{var k=d.h.lastIndexOf("/");k!=-1&&(g=d.h.slice(0,k+1)+g)}if(k=g,k==".."||k==".")g="";else if(k.indexOf("./")!=-1||k.indexOf("/.")!=-1){g=k.lastIndexOf("/",0)==0,k=k.split("/");let P=[];for(let K=0;K<k.length;){let me=k[K++];me=="."?g&&K==k.length&&P.push(""):me==".."?((P.length>1||P.length==1&&P[0]!="")&&P.pop(),g&&K==k.length&&P.push("")):(P.push(me),g=!0)}g=P.join("/")}else g=k}return h?d.h=g:h=o.i.toString()!=="",h?nt(d,Ov(o.i)):h=!!o.m,h&&(d.m=o.m),d};function j(o){return new W(o)}function Z(o,d,h){o.j=h?fn(d,!0):d,o.j&&(o.j=o.j.replace(/:$/,""))}function oe(o,d){if(d){if(d=Number(d),isNaN(d)||d<0)throw Error("Bad port number "+d);o.u=d}else o.u=null}function nt(o,d,h){d instanceof Ml?(o.i=d,R1(o.i,o.l)):(h||(d=Ol(d,A1)),o.i=new Ml(d,o.l))}function te(o,d,h){o.i.set(d,h)}function Ee(o){return te(o,"zx",Math.floor(Math.random()*2147483648).toString(36)+Math.abs(Math.floor(Math.random()*2147483648)^Date.now()).toString(36)),o}function fn(o,d){return o?d?decodeURI(o.replace(/%25/g,"%2525")):decodeURIComponent(o):""}function Ol(o,d,h){return typeof o=="string"?(o=encodeURI(o).replace(d,w1),h&&(o=o.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),o):null}function w1(o){return o=o.charCodeAt(0),"%"+(o>>4&15).toString(16)+(o&15).toString(16)}var xv=/[#\/\?@]/g,C1=/[#\?:]/g,L1=/[#\?]/g,A1=/[#\?@]/g,x1=/#/g;function Ml(o,d){this.h=this.g=null,this.i=o||null,this.j=!!d}function Us(o){o.g||(o.g=new Map,o.h=0,o.i&&z(o.i,function(d,h){o.add(decodeURIComponent(d.replace(/\+/g," ")),h)}))}t=Ml.prototype,t.add=function(o,d){Us(this),this.i=null,o=Vi(this,o);let h=this.g.get(o);return h||this.g.set(o,h=[]),h.push(d),this.h+=1,this};function Rv(o,d){Us(o),d=Vi(o,d),o.g.has(d)&&(o.i=null,o.h-=o.g.get(d).length,o.g.delete(d))}function kv(o,d){return Us(o),d=Vi(o,d),o.g.has(d)}t.forEach=function(o,d){Us(this),this.g.forEach(function(h,g){h.forEach(function(k){o.call(d,k,g,this)},this)},this)};function Dv(o,d){Us(o);let h=[];if(typeof d=="string")kv(o,d)&&(h=h.concat(o.g.get(Vi(o,d))));else for(o=Array.from(o.g.values()),d=0;d<o.length;d++)h=h.concat(o[d]);return h}t.set=function(o,d){return Us(this),this.i=null,o=Vi(this,o),kv(this,o)&&(this.h-=this.g.get(o).length),this.g.set(o,[d]),this.h+=1,this},t.get=function(o,d){return o?(o=Dv(this,o),o.length>0?String(o[0]):d):d};function Pv(o,d,h){Rv(o,d),h.length>0&&(o.i=null,o.g.set(Vi(o,d),S(h)),o.h+=h.length)}t.toString=function(){if(this.i)return this.i;if(!this.g)return"";let o=[],d=Array.from(this.g.keys());for(let g=0;g<d.length;g++){var h=d[g];let k=Wr(h);h=Dv(this,h);for(let P=0;P<h.length;P++){let K=k;h[P]!==""&&(K+="="+Wr(h[P])),o.push(K)}}return this.i=o.join("&")};function Ov(o){let d=new Ml;return d.i=o.i,o.g&&(d.g=new Map(o.g),d.h=o.h),d}function Vi(o,d){return d=String(d),o.j&&(d=d.toLowerCase()),d}function R1(o,d){d&&!o.j&&(Us(o),o.i=null,o.g.forEach(function(h,g){let k=g.toLowerCase();g!=k&&(Rv(this,g),Pv(this,k,h))},o)),o.j=d}function k1(o,d){let h=new sr;if(i.Image){let g=new Image;g.onload=f(Qr,h,"TestLoadImage: loaded",!0,d,g),g.onerror=f(Qr,h,"TestLoadImage: error",!1,d,g),g.onabort=f(Qr,h,"TestLoadImage: abort",!1,d,g),g.ontimeout=f(Qr,h,"TestLoadImage: timeout",!1,d,g),i.setTimeout(function(){g.ontimeout&&g.ontimeout()},1e4),g.src=o}else d(!1)}function D1(o,d){let h=new sr,g=new AbortController,k=setTimeout(()=>{g.abort(),Qr(h,"TestPingServer: timeout",!1,d)},1e4);fetch(o,{signal:g.signal}).then(P=>{clearTimeout(k),P.ok?Qr(h,"TestPingServer: ok",!0,d):Qr(h,"TestPingServer: server error",!1,d)}).catch(()=>{clearTimeout(k),Qr(h,"TestPingServer: error",!1,d)})}function Qr(o,d,h,g,k){try{k&&(k.onload=null,k.onerror=null,k.onabort=null,k.ontimeout=null),g(h)}catch{}}function P1(){this.g=new Tt}function ld(o){this.i=o.Sb||null,this.h=o.ab||!1}p(ld,wn),ld.prototype.g=function(){return new ud(this.i,this.h)};function ud(o,d){Ie.call(this),this.H=o,this.o=d,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.A=new Headers,this.h=null,this.F="GET",this.D="",this.g=!1,this.B=this.j=this.l=null,this.v=new AbortController}p(ud,Ie),t=ud.prototype,t.open=function(o,d){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.F=o,this.D=d,this.readyState=1,Vl(this)},t.send=function(o){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");if(this.v.signal.aborted)throw this.abort(),Error("Request was aborted.");this.g=!0;let d={headers:this.A,method:this.F,credentials:this.m,cache:void 0,signal:this.v.signal};o&&(d.body=o),(this.H||i).fetch(new Request(this.D,d)).then(this.Pa.bind(this),this.ga.bind(this))},t.abort=function(){this.response=this.responseText="",this.A=new Headers,this.status=0,this.v.abort(),this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),this.readyState>=1&&this.g&&this.readyState!=4&&(this.g=!1,Nl(this)),this.readyState=0},t.Pa=function(o){if(this.g&&(this.l=o,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=o.headers,this.readyState=2,Vl(this)),this.g&&(this.readyState=3,Vl(this),this.g)))if(this.responseType==="arraybuffer")o.arrayBuffer().then(this.Na.bind(this),this.ga.bind(this));else if(typeof i.ReadableStream<"u"&&"body"in o){if(this.j=o.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.B=new TextDecoder;Mv(this)}else o.text().then(this.Oa.bind(this),this.ga.bind(this))};function Mv(o){o.j.read().then(o.Ma.bind(o)).catch(o.ga.bind(o))}t.Ma=function(o){if(this.g){if(this.o&&o.value)this.response.push(o.value);else if(!this.o){var d=o.value?o.value:new Uint8Array(0);(d=this.B.decode(d,{stream:!o.done}))&&(this.response=this.responseText+=d)}o.done?Nl(this):Vl(this),this.readyState==3&&Mv(this)}},t.Oa=function(o){this.g&&(this.response=this.responseText=o,Nl(this))},t.Na=function(o){this.g&&(this.response=o,Nl(this))},t.ga=function(){this.g&&Nl(this)};function Nl(o){o.readyState=4,o.l=null,o.j=null,o.B=null,Vl(o)}t.setRequestHeader=function(o,d){this.A.append(o,d)},t.getResponseHeader=function(o){return this.h&&this.h.get(o.toLowerCase())||""},t.getAllResponseHeaders=function(){if(!this.h)return"";let o=[],d=this.h.entries();for(var h=d.next();!h.done;)h=h.value,o.push(h[0]+": "+h[1]),h=d.next();return o.join(`\r
`)};function Vl(o){o.onreadystatechange&&o.onreadystatechange.call(o)}Object.defineProperty(ud.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(o){this.m=o?"include":"same-origin"}});function Nv(o){let d="";return U(o,function(h,g){d+=g,d+=":",d+=h,d+=`\r
`}),d}function Yp(o,d,h){e:{for(g in h){var g=!1;break e}g=!0}g||(h=Nv(h),typeof o=="string"?h!=null&&Wr(h):te(o,d,h))}function It(o){Ie.call(this),this.headers=new Map,this.L=o||null,this.h=!1,this.g=null,this.D="",this.o=0,this.l="",this.j=this.B=this.v=this.A=!1,this.m=null,this.F="",this.H=!1}p(It,Ie);var O1=/^https?$/i,M1=["POST","PUT"];t=It.prototype,t.Fa=function(o){this.H=o},t.ea=function(o,d,h,g){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+o);d=d?d.toUpperCase():"GET",this.D=o,this.l="",this.o=0,this.A=!1,this.h=!0,this.g=this.L?this.L.g():$n.g(),this.g.onreadystatechange=m(c(this.Ca,this));try{this.B=!0,this.g.open(d,String(o),!0),this.B=!1}catch(P){Vv(this,P);return}if(o=h||"",h=new Map(this.headers),g)if(Object.getPrototypeOf(g)===Object.prototype)for(var k in g)h.set(k,g[k]);else if(typeof g.keys=="function"&&typeof g.get=="function")for(let P of g.keys())h.set(P,g.get(P));else throw Error("Unknown input type for opt_headers: "+String(g));g=Array.from(h.keys()).find(P=>P.toLowerCase()=="content-type"),k=i.FormData&&o instanceof i.FormData,!(Array.prototype.indexOf.call(M1,d,void 0)>=0)||g||k||h.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(let[P,K]of h)this.g.setRequestHeader(P,K);this.F&&(this.g.responseType=this.F),"withCredentials"in this.g&&this.g.withCredentials!==this.H&&(this.g.withCredentials=this.H);try{this.m&&(clearTimeout(this.m),this.m=null),this.v=!0,this.g.send(o),this.v=!1}catch(P){Vv(this,P)}};function Vv(o,d){o.h=!1,o.g&&(o.j=!0,o.g.abort(),o.j=!1),o.l=d,o.o=5,Uv(o),cd(o)}function Uv(o){o.A||(o.A=!0,de(o,"complete"),de(o,"error"))}t.abort=function(o){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.o=o||7,de(this,"complete"),de(this,"abort"),cd(this))},t.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),cd(this,!0)),It.Z.N.call(this)},t.Ca=function(){this.u||(this.B||this.v||this.j?Fv(this):this.Xa())},t.Xa=function(){Fv(this)};function Fv(o){if(o.h&&typeof s<"u"){if(o.v&&Yr(o)==4)setTimeout(o.Ca.bind(o),0);else if(de(o,"readystatechange"),Yr(o)==4){o.h=!1;try{let P=o.ca();e:switch(P){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var d=!0;break e;default:d=!1}var h;if(!(h=d)){var g;if(g=P===0){let K=String(o.D).match(od)[1]||null;!K&&i.self&&i.self.location&&(K=i.self.location.protocol.slice(0,-1)),g=!O1.test(K?K.toLowerCase():"")}h=g}if(h)de(o,"complete"),de(o,"success");else{o.o=6;try{var k=Yr(o)>2?o.g.statusText:""}catch{k=""}o.l=k+" ["+o.ca()+"]",Uv(o)}}finally{cd(o)}}}}function cd(o,d){if(o.g){o.m&&(clearTimeout(o.m),o.m=null);let h=o.g;o.g=null,d||de(o,"ready");try{h.onreadystatechange=null}catch{}}}t.isActive=function(){return!!this.g};function Yr(o){return o.g?o.g.readyState:0}t.ca=function(){try{return Yr(this)>2?this.g.status:-1}catch{return-1}},t.la=function(){try{return this.g?this.g.responseText:""}catch{return""}},t.La=function(o){if(this.g){var d=this.g.responseText;return o&&d.indexOf(o)==0&&(d=d.substring(o.length)),In(d)}};function Bv(o){try{if(!o.g)return null;if("response"in o.g)return o.g.response;switch(o.F){case"":case"text":return o.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in o.g)return o.g.mozResponseArrayBuffer}return null}catch{return null}}function N1(o){let d={};o=(o.g&&Yr(o)>=2&&o.g.getAllResponseHeaders()||"").split(`\r
`);for(let g=0;g<o.length;g++){if(T(o[g]))continue;var h=Ri(o[g]);let k=h[0];if(h=h[1],typeof h!="string")continue;h=h.trim();let P=d[k]||[];d[k]=P,P.push(h)}J(d,function(g){return g.join(", ")})}t.ya=function(){return this.o},t.Ha=function(){return typeof this.l=="string"?this.l:String(this.l)};function Ul(o,d,h){return h&&h.internalChannelParams&&h.internalChannelParams[o]||d}function qv(o){this.za=0,this.i=[],this.j=new sr,this.ba=this.na=this.J=this.W=this.g=this.wa=this.G=this.H=this.u=this.U=this.o=null,this.Ya=this.V=0,this.Sa=Ul("failFast",!1,o),this.F=this.C=this.v=this.m=this.l=null,this.X=!0,this.xa=this.K=-1,this.Y=this.A=this.D=0,this.Qa=Ul("baseRetryDelayMs",5e3,o),this.Za=Ul("retryDelaySeedMs",1e4,o),this.Ta=Ul("forwardChannelMaxRetries",2,o),this.va=Ul("forwardChannelRequestTimeoutMs",2e4,o),this.ma=o&&o.xmlHttpFactory||void 0,this.Ua=o&&o.Rb||void 0,this.Aa=o&&o.useFetchStreams||!1,this.O=void 0,this.L=o&&o.supportsCrossDomainXhr||!1,this.M="",this.h=new Rl(o&&o.concurrentRequestLimit),this.Ba=new P1,this.S=o&&o.fastHandshake||!1,this.R=o&&o.encodeInitMessageHeaders||!1,this.S&&this.R&&(this.R=!1),this.Ra=o&&o.Pb||!1,o&&o.ua&&this.j.ua(),o&&o.forceLongPolling&&(this.X=!1),this.aa=!this.S&&this.X&&o&&o.detectBufferingProxy||!1,this.ia=void 0,o&&o.longPollingTimeout&&o.longPollingTimeout>0&&(this.ia=o.longPollingTimeout),this.ta=void 0,this.T=0,this.P=!1,this.ja=this.B=null}t=qv.prototype,t.ka=8,t.I=1,t.connect=function(o,d,h,g){qt(0),this.W=o,this.H=d||{},h&&g!==void 0&&(this.H.OSID=h,this.H.OAID=g),this.F=this.X,this.J=Yv(this,null,this.W),fd(this)};function $p(o){if(zv(o),o.I==3){var d=o.V++,h=j(o.J);if(te(h,"SID",o.M),te(h,"RID",d),te(h,"TYPE","terminate"),Fl(o,h),d=new pa(o,o.j,d),d.M=2,d.A=Ee(j(h)),h=!1,i.navigator&&i.navigator.sendBeacon)try{h=i.navigator.sendBeacon(d.A.toString(),"")}catch{}!h&&i.Image&&(new Image().src=d.A,h=!0),h||(d.g=$v(d.j,null),d.g.ea(d.A)),d.F=Date.now(),Ca(d)}Qv(o)}function dd(o){o.g&&(Zp(o),o.g.cancel(),o.g=null)}function zv(o){dd(o),o.v&&(i.clearTimeout(o.v),o.v=null),hd(o),o.h.cancel(),o.m&&(typeof o.m=="number"&&i.clearTimeout(o.m),o.m=null)}function fd(o){if(!kl(o.h)&&!o.m){o.m=!0;var d=o.Ea;H||y(),G||(H(),G=!0),_.add(d,o),o.D=0}}function V1(o,d){return Dl(o.h)>=o.h.j-(o.m?1:0)?!1:o.m?(o.i=d.G.concat(o.i),!0):o.I==1||o.I==2||o.D>=(o.Sa?0:o.Ta)?!1:(o.m=rr(c(o.Ea,o,d),Xv(o,o.D)),o.D++,!0)}t.Ea=function(o){if(this.m)if(this.m=null,this.I==1){if(!o){this.V=Math.floor(Math.random()*1e5),o=this.V++;let k=new pa(this,this.j,o),P=this.o;if(this.U&&(P?(P=Q(P),We(P,this.U)):P=this.U),this.u!==null||this.R||(k.J=P,P=null),this.S)e:{for(var d=0,h=0;h<this.i.length;h++){t:{var g=this.i[h];if("__data__"in g.map&&(g=g.map.__data__,typeof g=="string")){g=g.length;break t}g=void 0}if(g===void 0)break;if(d+=g,d>4096){d=h;break e}if(d===4096||h===this.i.length-1){d=h+1;break e}}d=1e3}else d=1e3;d=Gv(this,k,d),h=j(this.J),te(h,"RID",o),te(h,"CVER",22),this.G&&te(h,"X-HTTP-Session-Id",this.G),Fl(this,h),P&&(this.R?d="headers="+Wr(Nv(P))+"&"+d:this.u&&Yp(h,this.u,P)),Pl(this.h,k),this.Ra&&te(h,"TYPE","init"),this.S?(te(h,"$req",d),te(h,"SID","null"),k.U=!0,Di(k,h,null)):Di(k,h,d),this.I=2}}else this.I==3&&(o?Hv(this,o):this.i.length==0||kl(this.h)||Hv(this))};function Hv(o,d){var h;d?h=d.l:h=o.V++;let g=j(o.J);te(g,"SID",o.M),te(g,"RID",h),te(g,"AID",o.K),Fl(o,g),o.u&&o.o&&Yp(g,o.u,o.o),h=new pa(o,o.j,h,o.D+1),o.u===null&&(h.J=o.o),d&&(o.i=d.G.concat(o.i)),d=Gv(o,h,1e3),h.H=Math.round(o.va*.5)+Math.round(o.va*.5*Math.random()),Pl(o.h,h),Di(h,g,d)}function Fl(o,d){o.H&&U(o.H,function(h,g){te(d,g,h)}),o.l&&U({},function(h,g){te(d,g,h)})}function Gv(o,d,h){h=Math.min(o.i.length,h);let g=o.l?c(o.l.Ka,o.l,o):null;e:{var k=o.i;let me=-1;for(;;){let zt=["count="+h];me==-1?h>0?(me=k[0].g,zt.push("ofs="+me)):me=0:zt.push("ofs="+me);let Ge=!0;for(let Xt=0;Xt<h;Xt++){var P=k[Xt].g;let Aa=k[Xt].map;if(P-=me,P<0)me=Math.max(0,k[Xt].g-100),Ge=!1;else try{P="req"+P+"_"||"";try{var K=Aa instanceof Map?Aa:Object.entries(Aa);for(let[Bs,$r]of K){let Jr=$r;l($r)&&(Jr=an($r)),zt.push(P+Bs+"="+encodeURIComponent(Jr))}}catch(Bs){throw zt.push(P+"type="+encodeURIComponent("_badmap")),Bs}}catch{g&&g(Aa)}}if(Ge){K=zt.join("&");break e}}K=void 0}return o=o.i.splice(0,h),d.G=o,K}function jv(o){if(!o.g&&!o.v){o.Y=1;var d=o.Da;H||y(),G||(H(),G=!0),_.add(d,o),o.A=0}}function Jp(o){return o.g||o.v||o.A>=3?!1:(o.Y++,o.v=rr(c(o.Da,o),Xv(o,o.A)),o.A++,!0)}t.Da=function(){if(this.v=null,Kv(this),this.aa&&!(this.P||this.g==null||this.T<=0)){var o=4*this.T;this.j.info("BP detection timer enabled: "+o),this.B=rr(c(this.Wa,this),o)}},t.Wa=function(){this.B&&(this.B=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.P=!0,qt(10),dd(this),Kv(this))};function Zp(o){o.B!=null&&(i.clearTimeout(o.B),o.B=null)}function Kv(o){o.g=new pa(o,o.j,"rpc",o.Y),o.u===null&&(o.g.J=o.o),o.g.P=0;var d=j(o.na);te(d,"RID","rpc"),te(d,"SID",o.M),te(d,"AID",o.K),te(d,"CI",o.F?"0":"1"),!o.F&&o.ia&&te(d,"TO",o.ia),te(d,"TYPE","xmlhttp"),Fl(o,d),o.u&&o.o&&Yp(d,o.u,o.o),o.O&&(o.g.H=o.O);var h=o.g;o=o.ba,h.M=1,h.A=Ee(j(d)),h.u=null,h.R=!0,wa(h,o)}t.Va=function(){this.C!=null&&(this.C=null,dd(this),Jp(this),qt(19))};function hd(o){o.C!=null&&(i.clearTimeout(o.C),o.C=null)}function Wv(o,d){var h=null;if(o.g==d){hd(o),Zp(o),o.g=null;var g=2}else if(Mi(o.h,d))h=d.G,Ni(o.h,d),g=1;else return;if(o.I!=0){if(d.o)if(g==1){h=d.u?d.u.length:0,d=Date.now()-d.F;var k=o.D;g=ha(),de(g,new Kr(g,h)),fd(o)}else jv(o);else if(k=d.m,k==3||k==0&&d.X>0||!(g==1&&V1(o,d)||g==2&&Jp(o)))switch(h&&h.length>0&&(d=o.h,d.i=d.i.concat(h)),k){case 1:Fs(o,5);break;case 4:Fs(o,10);break;case 3:Fs(o,6);break;default:Fs(o,2)}}}function Xv(o,d){let h=o.Qa+Math.floor(Math.random()*o.Za);return o.isActive()||(h*=2),h*d}function Fs(o,d){if(o.j.info("Error code "+d),d==2){var h=c(o.bb,o),g=o.Ua;let k=!g;g=new W(g||"//www.google.com/images/cleardot.gif"),i.location&&i.location.protocol=="http"||Z(g,"https"),Ee(g),k?k1(g.toString(),h):D1(g.toString(),h)}else qt(2);o.I=0,o.l&&o.l.pa(d),Qv(o),zv(o)}t.bb=function(o){o?(this.j.info("Successfully pinged google.com"),qt(2)):(this.j.info("Failed to ping google.com"),qt(1))};function Qv(o){if(o.I=0,o.ja=[],o.l){let d=id(o.h);(d.length!=0||o.i.length!=0)&&(R(o.ja,d),R(o.ja,o.i),o.h.i.length=0,S(o.i),o.i.length=0),o.l.oa()}}function Yv(o,d,h){var g=h instanceof W?j(h):new W(h);if(g.g!="")d&&(g.g=d+"."+g.g),oe(g,g.u);else{var k=i.location;g=k.protocol,d=d?d+"."+k.hostname:k.hostname,k=+k.port;let P=new W(null);g&&Z(P,g),d&&(P.g=d),k&&oe(P,k),h&&(P.h=h),g=P}return h=o.G,d=o.wa,h&&d&&te(g,h,d),te(g,"VER",o.ka),Fl(o,g),g}function $v(o,d,h){if(d&&!o.L)throw Error("Can't create secondary domain capable XhrIo object.");return d=o.Aa&&!o.ma?new It(new ld({ab:h})):new It(o.ma),d.Fa(o.L),d}t.isActive=function(){return!!this.l&&this.l.isActive(this)};function Jv(){}t=Jv.prototype,t.ra=function(){},t.qa=function(){},t.pa=function(){},t.oa=function(){},t.isActive=function(){return!0},t.Ka=function(){};function pd(){}pd.prototype.g=function(o,d){return new Un(o,d)};function Un(o,d){Ie.call(this),this.g=new qv(d),this.l=o,this.h=d&&d.messageUrlParams||null,o=d&&d.messageHeaders||null,d&&d.clientProtocolHeaderRequired&&(o?o["X-Client-Protocol"]="webchannel":o={"X-Client-Protocol":"webchannel"}),this.g.o=o,o=d&&d.initMessageHeaders||null,d&&d.messageContentType&&(o?o["X-WebChannel-Content-Type"]=d.messageContentType:o={"X-WebChannel-Content-Type":d.messageContentType}),d&&d.sa&&(o?o["X-WebChannel-Client-Profile"]=d.sa:o={"X-WebChannel-Client-Profile":d.sa}),this.g.U=o,(o=d&&d.Qb)&&!T(o)&&(this.g.u=o),this.A=d&&d.supportsCrossDomainXhr||!1,this.v=d&&d.sendRawJson||!1,(d=d&&d.httpSessionIdParam)&&!T(d)&&(this.g.G=d,o=this.h,o!==null&&d in o&&(o=this.h,d in o&&delete o[d])),this.j=new Ui(this)}p(Un,Ie),Un.prototype.m=function(){this.g.l=this.j,this.A&&(this.g.L=!0),this.g.connect(this.l,this.h||void 0)},Un.prototype.close=function(){$p(this.g)},Un.prototype.o=function(o){var d=this.g;if(typeof o=="string"){var h={};h.__data__=o,o=h}else this.v&&(h={},h.__data__=an(o),o=h);d.i.push(new sd(d.Ya++,o)),d.I==3&&fd(d)},Un.prototype.N=function(){this.g.l=null,delete this.j,$p(this.g),delete this.g,Un.Z.N.call(this)};function Zv(o){De.call(this),o.__headers__&&(this.headers=o.__headers__,this.statusCode=o.__status__,delete o.__headers__,delete o.__status__);var d=o.__sm__;if(d){e:{for(let h in d){o=h;break e}o=void 0}(this.i=o)&&(o=this.i,d=d!==null&&o in d?d[o]:void 0),this.data=d}else this.data=o}p(Zv,De);function eT(){xt.call(this),this.status=1}p(eT,xt);function Ui(o){this.g=o}p(Ui,Jv),Ui.prototype.ra=function(){de(this.g,"a")},Ui.prototype.qa=function(o){de(this.g,new Zv(o))},Ui.prototype.pa=function(o){de(this.g,new eT)},Ui.prototype.oa=function(){de(this.g,"b")},pd.prototype.createWebChannel=pd.prototype.g,Un.prototype.send=Un.prototype.o,Un.prototype.open=Un.prototype.m,Un.prototype.close=Un.prototype.close,r_=Dr.createWebChannelTransport=function(){return new pd},a_=Dr.getStatEventTarget=function(){return ha()},n_=Dr.Event=Yn,Fh=Dr.Stat={jb:0,mb:1,nb:2,Hb:3,Mb:4,Jb:5,Kb:6,Ib:7,Gb:8,Lb:9,PROXY:10,NOPROXY:11,Eb:12,Ab:13,Bb:14,zb:15,Cb:16,Db:17,fb:18,eb:19,gb:20},_n.NO_ERROR=0,_n.TIMEOUT=8,_n.HTTP_ERROR=6,lc=Dr.ErrorCode=_n,dn.COMPLETE="complete",t_=Dr.EventType=dn,yt.EventType=Be,Be.OPEN="a",Be.CLOSE="b",Be.ERROR="c",Be.MESSAGE="d",Ie.prototype.listen=Ie.prototype.J,qo=Dr.WebChannel=yt,wN=Dr.FetchXmlHttpFactory=ld,It.prototype.listenOnce=It.prototype.K,It.prototype.getLastError=It.prototype.Ha,It.prototype.getLastErrorCode=It.prototype.ya,It.prototype.getStatus=It.prototype.ca,It.prototype.getResponseJson=It.prototype.La,It.prototype.getResponseText=It.prototype.la,It.prototype.send=It.prototype.ea,It.prototype.setWithCredentials=It.prototype.Fa,e_=Dr.XhrIo=It}).apply(typeof Uh<"u"?Uh:typeof self<"u"?self:typeof window<"u"?window:{});var tn=class{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}};tn.UNAUTHENTICATED=new tn(null),tn.GOOGLE_CREDENTIALS=new tn("google-credentials-uid"),tn.FIRST_PARTY=new tn("first-party-uid"),tn.MOCK_USER=new tn("mock-user");var cl="12.10.0";function Xx(t){cl=t}var Ti=new Ls("@firebase/firestore");function zo(){return Ti.logLevel}function Y(t,...e){if(Ti.logLevel<=ge.DEBUG){let n=e.map(DS);Ti.debug(`Firestore (${cl}): ${t}`,...n)}}function Mr(t,...e){if(Ti.logLevel<=ge.ERROR){let n=e.map(DS);Ti.error(`Firestore (${cl}): ${t}`,...n)}}function Nr(t,...e){if(Ti.logLevel<=ge.WARN){let n=e.map(DS);Ti.warn(`Firestore (${cl}): ${t}`,...n)}}function DS(t){if(typeof t=="string")return t;try{return function(n){return JSON.stringify(n)}(t)}catch{return t}}function le(t,e,n){let a="Unexpected state";typeof e=="string"?a=e:n=e,Qx(t,a,n)}function Qx(t,e,n){let a=`FIRESTORE (${cl}) INTERNAL ASSERTION FAILED: ${e} (ID: ${t.toString(16)})`;if(n!==void 0)try{a+=" CONTEXT: "+JSON.stringify(n)}catch{a+=" CONTEXT: "+n}throw Mr(a),new Error(a)}function ht(t,e,n,a){let r="Unexpected state";typeof n=="string"?r=n:a=n,t||Qx(e,r,a)}function xe(t,e){return t}var F={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"},X=class extends En{constructor(e,n){super(e,n),this.code=e,this.message=n,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}};var Pr=class{constructor(){this.promise=new Promise((e,n)=>{this.resolve=e,this.reject=n})}};var jh=class{constructor(e,n){this.user=n,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}},Kh=class{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,n){e.enqueueRetryable(()=>n(tn.UNAUTHENTICATED))}shutdown(){}},d_=class{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,n){this.changeListener=n,e.enqueueRetryable(()=>n(this.token.user))}shutdown(){this.changeListener=null}},Wh=class{constructor(e){this.t=e,this.currentUser=tn.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,n){ht(this.o===void 0,42304);let a=this.i,r=u=>this.i!==a?(a=this.i,n(u)):Promise.resolve(),s=new Pr;this.o=()=>{this.i++,this.currentUser=this.u(),s.resolve(),s=new Pr,e.enqueueRetryable(()=>r(this.currentUser))};let i=()=>{let u=s;e.enqueueRetryable(async()=>{await u.promise,await r(this.currentUser)})},l=u=>{Y("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=u,this.o&&(this.auth.addAuthTokenListener(this.o),i())};this.t.onInit(u=>l(u)),setTimeout(()=>{if(!this.auth){let u=this.t.getImmediate({optional:!0});u?l(u):(Y("FirebaseAuthCredentialsProvider","Auth not yet detected"),s.resolve(),s=new Pr)}},0),i()}getToken(){let e=this.i,n=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(n).then(a=>this.i!==e?(Y("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):a?(ht(typeof a.accessToken=="string",31837,{l:a}),new jh(a.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){let e=this.auth&&this.auth.getUid();return ht(e===null||typeof e=="string",2055,{h:e}),new tn(e)}},f_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a,this.type="FirstParty",this.user=tn.FIRST_PARTY,this.R=new Map}A(){return this.I?this.I():null}get headers(){this.R.set("X-Goog-AuthUser",this.P);let e=this.A();return e&&this.R.set("Authorization",e),this.T&&this.R.set("X-Goog-Iam-Authorization-Token",this.T),this.R}},h_=class{constructor(e,n,a){this.P=e,this.T=n,this.I=a}getToken(){return Promise.resolve(new f_(this.P,this.T,this.I))}start(e,n){e.enqueueRetryable(()=>n(tn.FIRST_PARTY))}shutdown(){}invalidateToken(){}},Xh=class{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}},Qh=class{constructor(e,n){this.V=n,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Nn(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,n){ht(this.o===void 0,3512);let a=s=>{s.error!=null&&Y("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${s.error.message}`);let i=s.token!==this.m;return this.m=s.token,Y("FirebaseAppCheckTokenProvider",`Received ${i?"new":"existing"} token.`),i?n(s.token):Promise.resolve()};this.o=s=>{e.enqueueRetryable(()=>a(s))};let r=s=>{Y("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=s,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(s=>r(s)),setTimeout(()=>{if(!this.appCheck){let s=this.V.getImmediate({optional:!0});s?r(s):Y("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Xh(this.p));let e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then(n=>n?(ht(typeof n.token=="string",44558,{tokenResult:n}),this.m=n.token,new Xh(n.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}};function CN(t){let e=typeof self<"u"&&(self.crypto||self.msCrypto),n=new Uint8Array(t);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(n);else for(let a=0;a<t;a++)n[a]=Math.floor(256*Math.random());return n}var Yo=class{static newId(){let e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",n=62*Math.floor(4.129032258064516),a="";for(;a.length<20;){let r=CN(40);for(let s=0;s<r.length;++s)a.length<20&&r[s]<n&&(a+=e.charAt(r[s]%62))}return a}};function Ce(t,e){return t<e?-1:t>e?1:0}function p_(t,e){let n=Math.min(t.length,e.length);for(let a=0;a<n;a++){let r=t.charAt(a),s=e.charAt(a);if(r!==s)return s_(r)===s_(s)?Ce(r,s):s_(r)?1:-1}return Ce(t.length,e.length)}var LN=55296,AN=57343;function s_(t){let e=t.charCodeAt(0);return e>=LN&&e<=AN}function $o(t,e,n){return t.length===e.length&&t.every((a,r)=>n(a,e[r]))}var ux="__name__",Yh=class t{constructor(e,n,a){n===void 0?n=0:n>e.length&&le(637,{offset:n,range:e.length}),a===void 0?a=e.length-n:a>e.length-n&&le(1746,{length:a,range:e.length-n}),this.segments=e,this.offset=n,this.len=a}get length(){return this.len}isEqual(e){return t.comparator(this,e)===0}child(e){let n=this.segments.slice(this.offset,this.limit());return e instanceof t?e.forEach(a=>{n.push(a)}):n.push(e),this.construct(n)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let n=0;n<this.length;n++)if(this.get(n)!==e.get(n))return!1;return!0}forEach(e){for(let n=this.offset,a=this.limit();n<a;n++)e(this.segments[n])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,n){let a=Math.min(e.length,n.length);for(let r=0;r<a;r++){let s=t.compareSegments(e.get(r),n.get(r));if(s!==0)return s}return Ce(e.length,n.length)}static compareSegments(e,n){let a=t.isNumericId(e),r=t.isNumericId(n);return a&&!r?-1:!a&&r?1:a&&r?t.extractNumericId(e).compare(t.extractNumericId(n)):p_(e,n)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return kr.fromString(e.substring(4,e.length-2))}},dt=class t extends Yh{construct(e,n,a){return new t(e,n,a)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){let n=[];for(let a of e){if(a.indexOf("//")>=0)throw new X(F.INVALID_ARGUMENT,`Invalid segment (${a}). Paths must not contain // in them.`);n.push(...a.split("/").filter(r=>r.length>0))}return new t(n)}static emptyPath(){return new t([])}},xN=/^[_a-zA-Z][_a-zA-Z0-9]*$/,Qn=class t extends Yh{construct(e,n,a){return new t(e,n,a)}static isValidIdentifier(e){return xN.test(e)}canonicalString(){return this.toArray().map(e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),t.isValidIdentifier(e)||(e="`"+e+"`"),e)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===ux}static keyField(){return new t([ux])}static fromServerFormat(e){let n=[],a="",r=0,s=()=>{if(a.length===0)throw new X(F.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);n.push(a),a=""},i=!1;for(;r<e.length;){let l=e[r];if(l==="\\"){if(r+1===e.length)throw new X(F.INVALID_ARGUMENT,"Path has trailing escape character: "+e);let u=e[r+1];if(u!=="\\"&&u!=="."&&u!=="`")throw new X(F.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);a+=u,r+=2}else l==="`"?(i=!i,r++):l!=="."||i?(a+=l,r++):(s(),r++)}if(s(),i)throw new X(F.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new t(n)}static emptyPath(){return new t([])}};var ne=class t{constructor(e){this.path=e}static fromPath(e){return new t(dt.fromString(e))}static fromName(e){return new t(dt.fromString(e).popFirst(5))}static empty(){return new t(dt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&dt.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,n){return dt.comparator(e.path,n.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new t(new dt(e.slice()))}};function RN(t,e,n){if(!n)throw new X(F.INVALID_ARGUMENT,`Function ${t}() cannot be called with an empty ${e}.`)}function Yx(t,e,n,a){if(e===!0&&a===!0)throw new X(F.INVALID_ARGUMENT,`${t} and ${n} cannot be used together.`)}function cx(t){if(ne.isDocumentKey(t))throw new X(F.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${t} has ${t.length}.`)}function $x(t){return typeof t=="object"&&t!==null&&(Object.getPrototypeOf(t)===Object.prototype||Object.getPrototypeOf(t)===null)}function Dc(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="string")return t.length>20&&(t=`${t.substring(0,20)}...`),JSON.stringify(t);if(typeof t=="number"||typeof t=="boolean")return""+t;if(typeof t=="object"){if(t instanceof Array)return"an array";{let e=function(a){return a.constructor?a.constructor.name:null}(t);return e?`a custom ${e} object`:"an object"}}return typeof t=="function"?"a function":le(12329,{type:typeof t})}function Pc(t,e){if("_delegate"in t&&(t=t._delegate),!(t instanceof e)){if(e.name===t.constructor.name)throw new X(F.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{let n=Dc(t);throw new X(F.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${n}`)}}return t}function Jx(t,e){if(e<=0)throw new X(F.INVALID_ARGUMENT,`Function ${t}() requires a positive number, but it was: ${e}.`)}function Ct(t,e){let n={typeString:t};return e&&(n.value=e),n}function dl(t,e){if(!$x(t))throw new X(F.INVALID_ARGUMENT,"JSON must be an object");let n;for(let a in e)if(e[a]){let r=e[a].typeString,s="value"in e[a]?{value:e[a].value}:void 0;if(!(a in t)){n=`JSON missing required field: '${a}'`;break}let i=t[a];if(r&&typeof i!==r){n=`JSON field '${a}' must be a ${r}.`;break}if(s!==void 0&&i!==s.value){n=`Expected '${a}' field to equal '${s.value}'`;break}}if(n)throw new X(F.INVALID_ARGUMENT,n);return!0}var dx=-62135596800,fx=1e6,Nt=class t{static now(){return t.fromMillis(Date.now())}static fromDate(e){return t.fromMillis(e.getTime())}static fromMillis(e){let n=Math.floor(e/1e3),a=Math.floor((e-1e3*n)*fx);return new t(n,a)}constructor(e,n){if(this.seconds=e,this.nanoseconds=n,n<0)throw new X(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(n>=1e9)throw new X(F.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+n);if(e<dx)throw new X(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new X(F.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/fx}_compareTo(e){return this.seconds===e.seconds?Ce(this.nanoseconds,e.nanoseconds):Ce(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:t._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(dl(e,t._jsonSchema))return new t(e.seconds,e.nanoseconds)}valueOf(){let e=this.seconds-dx;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}};Nt._jsonSchemaVersion="firestore/timestamp/1.0",Nt._jsonSchema={type:Ct("string",Nt._jsonSchemaVersion),seconds:Ct("number"),nanoseconds:Ct("number")};var he=class t{static fromTimestamp(e){return new t(e)}static min(){return new t(new Nt(0,0))}static max(){return new t(new Nt(253402300799,999999999))}constructor(e){this.timestamp=e}compareTo(e){return this.timestamp._compareTo(e.timestamp)}isEqual(e){return this.timestamp.isEqual(e.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}};var pc=-1,$h=class{constructor(e,n,a,r){this.indexId=e,this.collectionGroup=n,this.fields=a,this.indexState=r}};$h.UNKNOWN_ID=-1;function kN(t,e){let n=t.toTimestamp().seconds,a=t.toTimestamp().nanoseconds+1,r=he.fromTimestamp(a===1e9?new Nt(n+1,0):new Nt(n,a));return new Ei(r,ne.empty(),e)}function DN(t){return new Ei(t.readTime,t.key,pc)}var Ei=class t{constructor(e,n,a){this.readTime=e,this.documentKey=n,this.largestBatchId=a}static min(){return new t(he.min(),ne.empty(),pc)}static max(){return new t(he.max(),ne.empty(),pc)}};function PN(t,e){let n=t.readTime.compareTo(e.readTime);return n!==0?n:(n=ne.comparator(t.documentKey,e.documentKey),n!==0?n:Ce(t.largestBatchId,e.largestBatchId))}var ON="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.",m_=class{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(e){this.onCommittedListeners.push(e)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(e=>e())}};async function Tp(t){if(t.code!==F.FAILED_PRECONDITION||t.message!==ON)throw t;Y("LocalStore","Unexpectedly lost primary lease")}var q=class t{constructor(e){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,e(n=>{this.isDone=!0,this.result=n,this.nextCallback&&this.nextCallback(n)},n=>{this.isDone=!0,this.error=n,this.catchCallback&&this.catchCallback(n)})}catch(e){return this.next(void 0,e)}next(e,n){return this.callbackAttached&&le(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(n,this.error):this.wrapSuccess(e,this.result):new t((a,r)=>{this.nextCallback=s=>{this.wrapSuccess(e,s).next(a,r)},this.catchCallback=s=>{this.wrapFailure(n,s).next(a,r)}})}toPromise(){return new Promise((e,n)=>{this.next(e,n)})}wrapUserFunction(e){try{let n=e();return n instanceof t?n:t.resolve(n)}catch(n){return t.reject(n)}}wrapSuccess(e,n){return e?this.wrapUserFunction(()=>e(n)):t.resolve(n)}wrapFailure(e,n){return e?this.wrapUserFunction(()=>e(n)):t.reject(n)}static resolve(e){return new t((n,a)=>{n(e)})}static reject(e){return new t((n,a)=>{a(e)})}static waitFor(e){return new t((n,a)=>{let r=0,s=0,i=!1;e.forEach(l=>{++r,l.next(()=>{++s,i&&s===r&&n()},u=>a(u))}),i=!0,s===r&&n()})}static or(e){let n=t.resolve(!1);for(let a of e)n=n.next(r=>r?t.resolve(r):a());return n}static forEach(e,n){let a=[];return e.forEach((r,s)=>{a.push(n.call(this,r,s))}),this.waitFor(a)}static mapArray(e,n){return new t((a,r)=>{let s=e.length,i=new Array(s),l=0;for(let u=0;u<s;u++){let c=u;n(e[c]).next(f=>{i[c]=f,++l,l===s&&a(i)},f=>r(f))}})}static doWhile(e,n){return new t((a,r)=>{let s=()=>{e()===!0?n().next(()=>{s()},r):a()};s()})}};function MN(t){let e=t.match(/Android ([\d.]+)/i),n=e?e[1].split(".").slice(0,2).join("."):"-1";return Number(n)}function fl(t){return t.name==="IndexedDbTransactionError"}var Jo=class{constructor(e,n){this.previousValue=e,n&&(n.sequenceNumberHandler=a=>this.ae(a),this.ue=a=>n.writeSequenceNumber(a))}ae(e){return this.previousValue=Math.max(e,this.previousValue),this.previousValue}next(){let e=++this.previousValue;return this.ue&&this.ue(e),e}};Jo.ce=-1;var NN=-1;function Ep(t){return t==null}function mc(t){return t===0&&1/t==-1/0}function VN(t){return typeof t=="number"&&Number.isInteger(t)&&!mc(t)&&t<=Number.MAX_SAFE_INTEGER&&t>=Number.MIN_SAFE_INTEGER}var Zx="";function UN(t){let e="";for(let n=0;n<t.length;n++)e.length>0&&(e=hx(e)),e=FN(t.get(n),e);return hx(e)}function FN(t,e){let n=e,a=t.length;for(let r=0;r<a;r++){let s=t.charAt(r);switch(s){case"\0":n+="";break;case Zx:n+="";break;default:n+=s}}return n}function hx(t){return t+Zx+""}var BN="remoteDocuments",e0="owner";var t0="mutationQueues";var n0="mutations";var a0="documentMutations",qN="remoteDocumentsV14";var r0="remoteDocumentGlobal";var s0="targets";var i0="targetDocuments";var o0="targetGlobal",l0="collectionParents";var u0="clientMetadata";var c0="bundles";var d0="namedQueries";var zN="indexConfiguration";var HN="indexState";var GN="indexEntries";var f0="documentOverlays";var jN="globals";var KN=[t0,n0,a0,BN,s0,e0,o0,i0,u0,r0,l0,c0,d0],T4=[...KN,f0],WN=[t0,n0,a0,qN,s0,e0,o0,i0,u0,r0,l0,c0,d0,f0],XN=WN,QN=[...XN,zN,HN,GN];var E4=[...QN,jN];function px(t){let e=0;for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e++;return e}function hl(t,e){for(let n in t)Object.prototype.hasOwnProperty.call(t,n)&&e(n,t[n])}function h0(t){for(let e in t)if(Object.prototype.hasOwnProperty.call(t,e))return!1;return!0}var Lt=class t{constructor(e,n){this.comparator=e,this.root=n||ja.EMPTY}insert(e,n){return new t(this.comparator,this.root.insert(e,n,this.comparator).copy(null,null,ja.BLACK,null,null))}remove(e){return new t(this.comparator,this.root.remove(e,this.comparator).copy(null,null,ja.BLACK,null,null))}get(e){let n=this.root;for(;!n.isEmpty();){let a=this.comparator(e,n.key);if(a===0)return n.value;a<0?n=n.left:a>0&&(n=n.right)}return null}indexOf(e){let n=0,a=this.root;for(;!a.isEmpty();){let r=this.comparator(e,a.key);if(r===0)return n+a.left.size;r<0?a=a.left:(n+=a.left.size+1,a=a.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(e){return this.root.inorderTraversal(e)}forEach(e){this.inorderTraversal((n,a)=>(e(n,a),!1))}toString(){let e=[];return this.inorderTraversal((n,a)=>(e.push(`${n}:${a}`),!1)),`{${e.join(", ")}}`}reverseTraversal(e){return this.root.reverseTraversal(e)}getIterator(){return new Ko(this.root,null,this.comparator,!1)}getIteratorFrom(e){return new Ko(this.root,e,this.comparator,!1)}getReverseIterator(){return new Ko(this.root,null,this.comparator,!0)}getReverseIteratorFrom(e){return new Ko(this.root,e,this.comparator,!0)}},Ko=class{constructor(e,n,a,r){this.isReverse=r,this.nodeStack=[];let s=1;for(;!e.isEmpty();)if(s=n?a(e.key,n):1,n&&r&&(s*=-1),s<0)e=this.isReverse?e.left:e.right;else{if(s===0){this.nodeStack.push(e);break}this.nodeStack.push(e),e=this.isReverse?e.right:e.left}}getNext(){let e=this.nodeStack.pop(),n={key:e.key,value:e.value};if(this.isReverse)for(e=e.left;!e.isEmpty();)this.nodeStack.push(e),e=e.right;else for(e=e.right;!e.isEmpty();)this.nodeStack.push(e),e=e.left;return n}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;let e=this.nodeStack[this.nodeStack.length-1];return{key:e.key,value:e.value}}},ja=class t{constructor(e,n,a,r,s){this.key=e,this.value=n,this.color=a??t.RED,this.left=r??t.EMPTY,this.right=s??t.EMPTY,this.size=this.left.size+1+this.right.size}copy(e,n,a,r,s){return new t(e??this.key,n??this.value,a??this.color,r??this.left,s??this.right)}isEmpty(){return!1}inorderTraversal(e){return this.left.inorderTraversal(e)||e(this.key,this.value)||this.right.inorderTraversal(e)}reverseTraversal(e){return this.right.reverseTraversal(e)||e(this.key,this.value)||this.left.reverseTraversal(e)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(e,n,a){let r=this,s=a(e,r.key);return r=s<0?r.copy(null,null,null,r.left.insert(e,n,a),null):s===0?r.copy(null,n,null,null,null):r.copy(null,null,null,null,r.right.insert(e,n,a)),r.fixUp()}removeMin(){if(this.left.isEmpty())return t.EMPTY;let e=this;return e.left.isRed()||e.left.left.isRed()||(e=e.moveRedLeft()),e=e.copy(null,null,null,e.left.removeMin(),null),e.fixUp()}remove(e,n){let a,r=this;if(n(e,r.key)<0)r.left.isEmpty()||r.left.isRed()||r.left.left.isRed()||(r=r.moveRedLeft()),r=r.copy(null,null,null,r.left.remove(e,n),null);else{if(r.left.isRed()&&(r=r.rotateRight()),r.right.isEmpty()||r.right.isRed()||r.right.left.isRed()||(r=r.moveRedRight()),n(e,r.key)===0){if(r.right.isEmpty())return t.EMPTY;a=r.right.min(),r=r.copy(a.key,a.value,null,null,r.right.removeMin())}r=r.copy(null,null,null,null,r.right.remove(e,n))}return r.fixUp()}isRed(){return this.color}fixUp(){let e=this;return e.right.isRed()&&!e.left.isRed()&&(e=e.rotateLeft()),e.left.isRed()&&e.left.left.isRed()&&(e=e.rotateRight()),e.left.isRed()&&e.right.isRed()&&(e=e.colorFlip()),e}moveRedLeft(){let e=this.colorFlip();return e.right.left.isRed()&&(e=e.copy(null,null,null,null,e.right.rotateRight()),e=e.rotateLeft(),e=e.colorFlip()),e}moveRedRight(){let e=this.colorFlip();return e.left.left.isRed()&&(e=e.rotateRight(),e=e.colorFlip()),e}rotateLeft(){let e=this.copy(null,null,t.RED,null,this.right.left);return this.right.copy(null,null,this.color,e,null)}rotateRight(){let e=this.copy(null,null,t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,e)}colorFlip(){let e=this.left.copy(null,null,!this.left.color,null,null),n=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,e,n)}checkMaxDepth(){let e=this.check();return Math.pow(2,e)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw le(43730,{key:this.key,value:this.value});if(this.right.isRed())throw le(14113,{key:this.key,value:this.value});let e=this.left.check();if(e!==this.right.check())throw le(27949);return e+(this.isRed()?0:1)}};ja.EMPTY=null,ja.RED=!0,ja.BLACK=!1;ja.EMPTY=new class{constructor(){this.size=0}get key(){throw le(57766)}get value(){throw le(16141)}get color(){throw le(16727)}get left(){throw le(29726)}get right(){throw le(36894)}copy(e,n,a,r,s){return this}insert(e,n,a){return new ja(e,n)}remove(e,n){return this}isEmpty(){return!0}inorderTraversal(e){return!1}reverseTraversal(e){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};var nn=class t{constructor(e){this.comparator=e,this.data=new Lt(this.comparator)}has(e){return this.data.get(e)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(e){return this.data.indexOf(e)}forEach(e){this.data.inorderTraversal((n,a)=>(e(n),!1))}forEachInRange(e,n){let a=this.data.getIteratorFrom(e[0]);for(;a.hasNext();){let r=a.getNext();if(this.comparator(r.key,e[1])>=0)return;n(r.key)}}forEachWhile(e,n){let a;for(a=n!==void 0?this.data.getIteratorFrom(n):this.data.getIterator();a.hasNext();)if(!e(a.getNext().key))return}firstAfterOrEqual(e){let n=this.data.getIteratorFrom(e);return n.hasNext()?n.getNext().key:null}getIterator(){return new Jh(this.data.getIterator())}getIteratorFrom(e){return new Jh(this.data.getIteratorFrom(e))}add(e){return this.copy(this.data.remove(e).insert(e,!0))}delete(e){return this.has(e)?this.copy(this.data.remove(e)):this}isEmpty(){return this.data.isEmpty()}unionWith(e){let n=this;return n.size<e.size&&(n=e,e=this),e.forEach(a=>{n=n.add(a)}),n}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.data.getIterator(),a=e.data.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(this.comparator(r,s)!==0)return!1}return!0}toArray(){let e=[];return this.forEach(n=>{e.push(n)}),e}toString(){let e=[];return this.forEach(n=>e.push(n)),"SortedSet("+e.toString()+")"}copy(e){let n=new t(this.comparator);return n.data=e,n}},Jh=class{constructor(e){this.iter=e}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}};var yi=class t{constructor(e){this.fields=e,e.sort(Qn.comparator)}static empty(){return new t([])}unionWith(e){let n=new nn(Qn.comparator);for(let a of this.fields)n=n.add(a);for(let a of e)n=n.add(a);return new t(n.toArray())}covers(e){for(let n of this.fields)if(n.isPrefixOf(e))return!0;return!1}isEqual(e){return $o(this.fields,e.fields,(n,a)=>n.isEqual(a))}};var Zh=class extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}};var cn=class t{constructor(e){this.binaryString=e}static fromBase64String(e){let n=function(r){try{return atob(r)}catch(s){throw typeof DOMException<"u"&&s instanceof DOMException?new Zh("Invalid base64 string: "+s):s}}(e);return new t(n)}static fromUint8Array(e){let n=function(r){let s="";for(let i=0;i<r.length;++i)s+=String.fromCharCode(r[i]);return s}(e);return new t(n)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(n){return btoa(n)}(this.binaryString)}toUint8Array(){return function(n){let a=new Uint8Array(n.length);for(let r=0;r<n.length;r++)a[r]=n.charCodeAt(r);return a}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return Ce(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}};cn.EMPTY_BYTE_STRING=new cn("");var YN=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function Vr(t){if(ht(!!t,39018),typeof t=="string"){let e=0,n=YN.exec(t);if(ht(!!n,46558,{timestamp:t}),n[1]){let r=n[1];r=(r+"000000000").substr(0,9),e=Number(r)}let a=new Date(t);return{seconds:Math.floor(a.getTime()/1e3),nanos:e}}return{seconds:ct(t.seconds),nanos:ct(t.nanos)}}function ct(t){return typeof t=="number"?t:typeof t=="string"?Number(t):0}function Ur(t){return typeof t=="string"?cn.fromBase64String(t):cn.fromUint8Array(t)}var p0="server_timestamp",m0="__type__",g0="__previous_value__",y0="__local_write_time__";function Oc(t){return(t?.mapValue?.fields||{})[m0]?.stringValue===p0}function bp(t){let e=t.mapValue.fields[g0];return Oc(e)?bp(e):e}function gc(t){let e=Vr(t.mapValue.fields[y0].timestampValue);return new Nt(e.seconds,e.nanos)}var g_=class{constructor(e,n,a,r,s,i,l,u,c,f,p){this.databaseId=e,this.appId=n,this.persistenceKey=a,this.host=r,this.ssl=s,this.forceLongPolling=i,this.autoDetectLongPolling=l,this.longPollingOptions=u,this.useFetchStreams=c,this.isUsingEmulator=f,this.apiKey=p}},ep="(default)",yc=class t{constructor(e,n){this.projectId=e,this.database=n||ep}static empty(){return new t("","")}get isDefaultDatabase(){return this.database===ep}isEqual(e){return e instanceof t&&e.projectId===this.projectId&&e.database===this.database}};function I0(t,e){if(!Object.prototype.hasOwnProperty.apply(t.options,["projectId"]))throw new X(F.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new yc(t.options.projectId,e)}var PS="__type__",_0="__max__",Bh={mapValue:{fields:{__type__:{stringValue:_0}}}},OS="__vector__",Zo="value";function ks(t){return"nullValue"in t?0:"booleanValue"in t?1:"integerValue"in t||"doubleValue"in t?2:"timestampValue"in t?3:"stringValue"in t?5:"bytesValue"in t?6:"referenceValue"in t?7:"geoPointValue"in t?8:"arrayValue"in t?9:"mapValue"in t?Oc(t)?4:v0(t)?9007199254740991:S0(t)?10:11:le(28295,{value:t})}function Qa(t,e){if(t===e)return!0;let n=ks(t);if(n!==ks(e))return!1;switch(n){case 0:case 9007199254740991:return!0;case 1:return t.booleanValue===e.booleanValue;case 4:return gc(t).isEqual(gc(e));case 3:return function(r,s){if(typeof r.timestampValue=="string"&&typeof s.timestampValue=="string"&&r.timestampValue.length===s.timestampValue.length)return r.timestampValue===s.timestampValue;let i=Vr(r.timestampValue),l=Vr(s.timestampValue);return i.seconds===l.seconds&&i.nanos===l.nanos}(t,e);case 5:return t.stringValue===e.stringValue;case 6:return function(r,s){return Ur(r.bytesValue).isEqual(Ur(s.bytesValue))}(t,e);case 7:return t.referenceValue===e.referenceValue;case 8:return function(r,s){return ct(r.geoPointValue.latitude)===ct(s.geoPointValue.latitude)&&ct(r.geoPointValue.longitude)===ct(s.geoPointValue.longitude)}(t,e);case 2:return function(r,s){if("integerValue"in r&&"integerValue"in s)return ct(r.integerValue)===ct(s.integerValue);if("doubleValue"in r&&"doubleValue"in s){let i=ct(r.doubleValue),l=ct(s.doubleValue);return i===l?mc(i)===mc(l):isNaN(i)&&isNaN(l)}return!1}(t,e);case 9:return $o(t.arrayValue.values||[],e.arrayValue.values||[],Qa);case 10:case 11:return function(r,s){let i=r.mapValue.fields||{},l=s.mapValue.fields||{};if(px(i)!==px(l))return!1;for(let u in i)if(i.hasOwnProperty(u)&&(l[u]===void 0||!Qa(i[u],l[u])))return!1;return!0}(t,e);default:return le(52216,{left:t})}}function Ic(t,e){return(t.values||[]).find(n=>Qa(n,e))!==void 0}function el(t,e){if(t===e)return 0;let n=ks(t),a=ks(e);if(n!==a)return Ce(n,a);switch(n){case 0:case 9007199254740991:return 0;case 1:return Ce(t.booleanValue,e.booleanValue);case 2:return function(s,i){let l=ct(s.integerValue||s.doubleValue),u=ct(i.integerValue||i.doubleValue);return l<u?-1:l>u?1:l===u?0:isNaN(l)?isNaN(u)?0:-1:1}(t,e);case 3:return mx(t.timestampValue,e.timestampValue);case 4:return mx(gc(t),gc(e));case 5:return p_(t.stringValue,e.stringValue);case 6:return function(s,i){let l=Ur(s),u=Ur(i);return l.compareTo(u)}(t.bytesValue,e.bytesValue);case 7:return function(s,i){let l=s.split("/"),u=i.split("/");for(let c=0;c<l.length&&c<u.length;c++){let f=Ce(l[c],u[c]);if(f!==0)return f}return Ce(l.length,u.length)}(t.referenceValue,e.referenceValue);case 8:return function(s,i){let l=Ce(ct(s.latitude),ct(i.latitude));return l!==0?l:Ce(ct(s.longitude),ct(i.longitude))}(t.geoPointValue,e.geoPointValue);case 9:return gx(t.arrayValue,e.arrayValue);case 10:return function(s,i){let l=s.fields||{},u=i.fields||{},c=l[Zo]?.arrayValue,f=u[Zo]?.arrayValue,p=Ce(c?.values?.length||0,f?.values?.length||0);return p!==0?p:gx(c,f)}(t.mapValue,e.mapValue);case 11:return function(s,i){if(s===Bh.mapValue&&i===Bh.mapValue)return 0;if(s===Bh.mapValue)return 1;if(i===Bh.mapValue)return-1;let l=s.fields||{},u=Object.keys(l),c=i.fields||{},f=Object.keys(c);u.sort(),f.sort();for(let p=0;p<u.length&&p<f.length;++p){let m=p_(u[p],f[p]);if(m!==0)return m;let S=el(l[u[p]],c[f[p]]);if(S!==0)return S}return Ce(u.length,f.length)}(t.mapValue,e.mapValue);default:throw le(23264,{he:n})}}function mx(t,e){if(typeof t=="string"&&typeof e=="string"&&t.length===e.length)return Ce(t,e);let n=Vr(t),a=Vr(e),r=Ce(n.seconds,a.seconds);return r!==0?r:Ce(n.nanos,a.nanos)}function gx(t,e){let n=t.values||[],a=e.values||[];for(let r=0;r<n.length&&r<a.length;++r){let s=el(n[r],a[r]);if(s)return s}return Ce(n.length,a.length)}function tl(t){return y_(t)}function y_(t){return"nullValue"in t?"null":"booleanValue"in t?""+t.booleanValue:"integerValue"in t?""+t.integerValue:"doubleValue"in t?""+t.doubleValue:"timestampValue"in t?function(n){let a=Vr(n);return`time(${a.seconds},${a.nanos})`}(t.timestampValue):"stringValue"in t?t.stringValue:"bytesValue"in t?function(n){return Ur(n).toBase64()}(t.bytesValue):"referenceValue"in t?function(n){return ne.fromName(n).toString()}(t.referenceValue):"geoPointValue"in t?function(n){return`geo(${n.latitude},${n.longitude})`}(t.geoPointValue):"arrayValue"in t?function(n){let a="[",r=!0;for(let s of n.values||[])r?r=!1:a+=",",a+=y_(s);return a+"]"}(t.arrayValue):"mapValue"in t?function(n){let a=Object.keys(n.fields||{}).sort(),r="{",s=!0;for(let i of a)s?s=!1:r+=",",r+=`${i}:${y_(n.fields[i])}`;return r+"}"}(t.mapValue):le(61005,{value:t})}function Hh(t){switch(ks(t)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:let e=bp(t);return e?16+Hh(e):16;case 5:return 2*t.stringValue.length;case 6:return Ur(t.bytesValue).approximateByteSize();case 7:return t.referenceValue.length;case 9:return function(a){return(a.values||[]).reduce((r,s)=>r+Hh(s),0)}(t.arrayValue);case 10:case 11:return function(a){let r=0;return hl(a.fields,(s,i)=>{r+=s.length+Hh(i)}),r}(t.mapValue);default:throw le(13486,{value:t})}}function Mc(t,e){return{referenceValue:`projects/${t.projectId}/databases/${t.database}/documents/${e.path.canonicalString()}`}}function I_(t){return!!t&&"integerValue"in t}function MS(t){return!!t&&"arrayValue"in t}function yx(t){return!!t&&"nullValue"in t}function Ix(t){return!!t&&"doubleValue"in t&&isNaN(Number(t.doubleValue))}function i_(t){return!!t&&"mapValue"in t}function S0(t){return(t?.mapValue?.fields||{})[PS]?.stringValue===OS}function dc(t){if(t.geoPointValue)return{geoPointValue:{...t.geoPointValue}};if(t.timestampValue&&typeof t.timestampValue=="object")return{timestampValue:{...t.timestampValue}};if(t.mapValue){let e={mapValue:{fields:{}}};return hl(t.mapValue.fields,(n,a)=>e.mapValue.fields[n]=dc(a)),e}if(t.arrayValue){let e={arrayValue:{values:[]}};for(let n=0;n<(t.arrayValue.values||[]).length;++n)e.arrayValue.values[n]=dc(t.arrayValue.values[n]);return e}return{...t}}function v0(t){return(((t.mapValue||{}).fields||{}).__type__||{}).stringValue===_0}var w4={mapValue:{fields:{[PS]:{stringValue:OS},[Zo]:{arrayValue:{}}}}};var Ga=class t{constructor(e){this.value=e}static empty(){return new t({mapValue:{}})}field(e){if(e.isEmpty())return this.value;{let n=this.value;for(let a=0;a<e.length-1;++a)if(n=(n.mapValue.fields||{})[e.get(a)],!i_(n))return null;return n=(n.mapValue.fields||{})[e.lastSegment()],n||null}}set(e,n){this.getFieldsMap(e.popLast())[e.lastSegment()]=dc(n)}setAll(e){let n=Qn.emptyPath(),a={},r=[];e.forEach((i,l)=>{if(!n.isImmediateParentOf(l)){let u=this.getFieldsMap(n);this.applyChanges(u,a,r),a={},r=[],n=l.popLast()}i?a[l.lastSegment()]=dc(i):r.push(l.lastSegment())});let s=this.getFieldsMap(n);this.applyChanges(s,a,r)}delete(e){let n=this.field(e.popLast());i_(n)&&n.mapValue.fields&&delete n.mapValue.fields[e.lastSegment()]}isEqual(e){return Qa(this.value,e.value)}getFieldsMap(e){let n=this.value;n.mapValue.fields||(n.mapValue={fields:{}});for(let a=0;a<e.length;++a){let r=n.mapValue.fields[e.get(a)];i_(r)&&r.mapValue.fields||(r={mapValue:{fields:{}}},n.mapValue.fields[e.get(a)]=r),n=r}return n.mapValue.fields}applyChanges(e,n,a){hl(n,(r,s)=>e[r]=s);for(let r of a)delete e[r]}clone(){return new t(dc(this.value))}};var Sa=class t{constructor(e,n,a,r,s,i,l){this.key=e,this.documentType=n,this.version=a,this.readTime=r,this.createTime=s,this.data=i,this.documentState=l}static newInvalidDocument(e){return new t(e,0,he.min(),he.min(),he.min(),Ga.empty(),0)}static newFoundDocument(e,n,a,r){return new t(e,1,n,he.min(),a,r,0)}static newNoDocument(e,n){return new t(e,2,n,he.min(),he.min(),Ga.empty(),0)}static newUnknownDocument(e,n){return new t(e,3,n,he.min(),he.min(),Ga.empty(),2)}convertToFoundDocument(e,n){return!this.createTime.isEqual(he.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=e),this.version=e,this.documentType=1,this.data=n,this.documentState=0,this}convertToNoDocument(e){return this.version=e,this.documentType=2,this.data=Ga.empty(),this.documentState=0,this}convertToUnknownDocument(e){return this.version=e,this.documentType=3,this.data=Ga.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=he.min(),this}setReadTime(e){return this.readTime=e,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(e){return e instanceof t&&this.key.isEqual(e.key)&&this.version.isEqual(e.version)&&this.documentType===e.documentType&&this.documentState===e.documentState&&this.data.isEqual(e.data)}mutableCopy(){return new t(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}};var Fr=class{constructor(e,n){this.position=e,this.inclusive=n}};function _x(t,e,n){let a=0;for(let r=0;r<t.position.length;r++){let s=e[r],i=t.position[r];if(s.field.isKeyField()?a=ne.comparator(ne.fromName(i.referenceValue),n.key):a=el(i,n.data.field(s.field)),s.dir==="desc"&&(a*=-1),a!==0)break}return a}function Sx(t,e){if(t===null)return e===null;if(e===null||t.inclusive!==e.inclusive||t.position.length!==e.position.length)return!1;for(let n=0;n<t.position.length;n++)if(!Qa(t.position[n],e.position[n]))return!1;return!0}var Ds=class{constructor(e,n="asc"){this.field=e,this.dir=n}};function $N(t,e){return t.dir===e.dir&&t.field.isEqual(e.field)}var tp=class{},wt=class t extends tp{constructor(e,n,a){super(),this.field=e,this.op=n,this.value=a}static create(e,n,a){return e.isKeyField()?n==="in"||n==="not-in"?this.createKeyFieldInFilter(e,n,a):new S_(e,n,a):n==="array-contains"?new E_(e,a):n==="in"?new b_(e,a):n==="not-in"?new w_(e,a):n==="array-contains-any"?new C_(e,a):new t(e,n,a)}static createKeyFieldInFilter(e,n,a){return n==="in"?new v_(e,a):new T_(e,a)}matches(e){let n=e.data.field(this.field);return this.op==="!="?n!==null&&n.nullValue===void 0&&this.matchesComparison(el(n,this.value)):n!==null&&ks(this.value)===ks(n)&&this.matchesComparison(el(n,this.value))}matchesComparison(e){switch(this.op){case"<":return e<0;case"<=":return e<=0;case"==":return e===0;case"!=":return e!==0;case">":return e>0;case">=":return e>=0;default:return le(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}},da=class t extends tp{constructor(e,n){super(),this.filters=e,this.op=n,this.Pe=null}static create(e,n){return new t(e,n)}matches(e){return T0(this)?this.filters.find(n=>!n.matches(e))===void 0:this.filters.find(n=>n.matches(e))!==void 0}getFlattenedFilters(){return this.Pe!==null||(this.Pe=this.filters.reduce((e,n)=>e.concat(n.getFlattenedFilters()),[])),this.Pe}getFilters(){return Object.assign([],this.filters)}};function T0(t){return t.op==="and"}function E0(t){return JN(t)&&T0(t)}function JN(t){for(let e of t.filters)if(e instanceof da)return!1;return!0}function __(t){if(t instanceof wt)return t.field.canonicalString()+t.op.toString()+tl(t.value);if(E0(t))return t.filters.map(e=>__(e)).join(",");{let e=t.filters.map(n=>__(n)).join(",");return`${t.op}(${e})`}}function b0(t,e){return t instanceof wt?function(a,r){return r instanceof wt&&a.op===r.op&&a.field.isEqual(r.field)&&Qa(a.value,r.value)}(t,e):t instanceof da?function(a,r){return r instanceof da&&a.op===r.op&&a.filters.length===r.filters.length?a.filters.reduce((s,i,l)=>s&&b0(i,r.filters[l]),!0):!1}(t,e):void le(19439)}function w0(t){return t instanceof wt?function(n){return`${n.field.canonicalString()} ${n.op} ${tl(n.value)}`}(t):t instanceof da?function(n){return n.op.toString()+" {"+n.getFilters().map(w0).join(" ,")+"}"}(t):"Filter"}var S_=class extends wt{constructor(e,n,a){super(e,n,a),this.key=ne.fromName(a.referenceValue)}matches(e){let n=ne.comparator(e.key,this.key);return this.matchesComparison(n)}},v_=class extends wt{constructor(e,n){super(e,"in",n),this.keys=C0("in",n)}matches(e){return this.keys.some(n=>n.isEqual(e.key))}},T_=class extends wt{constructor(e,n){super(e,"not-in",n),this.keys=C0("not-in",n)}matches(e){return!this.keys.some(n=>n.isEqual(e.key))}};function C0(t,e){return(e.arrayValue?.values||[]).map(n=>ne.fromName(n.referenceValue))}var E_=class extends wt{constructor(e,n){super(e,"array-contains",n)}matches(e){let n=e.data.field(this.field);return MS(n)&&Ic(n.arrayValue,this.value)}},b_=class extends wt{constructor(e,n){super(e,"in",n)}matches(e){let n=e.data.field(this.field);return n!==null&&Ic(this.value.arrayValue,n)}},w_=class extends wt{constructor(e,n){super(e,"not-in",n)}matches(e){if(Ic(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;let n=e.data.field(this.field);return n!==null&&n.nullValue===void 0&&!Ic(this.value.arrayValue,n)}},C_=class extends wt{constructor(e,n){super(e,"array-contains-any",n)}matches(e){let n=e.data.field(this.field);return!(!MS(n)||!n.arrayValue.values)&&n.arrayValue.values.some(a=>Ic(this.value.arrayValue,a))}};var L_=class{constructor(e,n=null,a=[],r=[],s=null,i=null,l=null){this.path=e,this.collectionGroup=n,this.orderBy=a,this.filters=r,this.limit=s,this.startAt=i,this.endAt=l,this.Te=null}};function vx(t,e=null,n=[],a=[],r=null,s=null,i=null){return new L_(t,e,n,a,r,s,i)}function NS(t){let e=xe(t);if(e.Te===null){let n=e.path.canonicalString();e.collectionGroup!==null&&(n+="|cg:"+e.collectionGroup),n+="|f:",n+=e.filters.map(a=>__(a)).join(","),n+="|ob:",n+=e.orderBy.map(a=>function(s){return s.field.canonicalString()+s.dir}(a)).join(","),Ep(e.limit)||(n+="|l:",n+=e.limit),e.startAt&&(n+="|lb:",n+=e.startAt.inclusive?"b:":"a:",n+=e.startAt.position.map(a=>tl(a)).join(",")),e.endAt&&(n+="|ub:",n+=e.endAt.inclusive?"a:":"b:",n+=e.endAt.position.map(a=>tl(a)).join(",")),e.Te=n}return e.Te}function VS(t,e){if(t.limit!==e.limit||t.orderBy.length!==e.orderBy.length)return!1;for(let n=0;n<t.orderBy.length;n++)if(!$N(t.orderBy[n],e.orderBy[n]))return!1;if(t.filters.length!==e.filters.length)return!1;for(let n=0;n<t.filters.length;n++)if(!b0(t.filters[n],e.filters[n]))return!1;return t.collectionGroup===e.collectionGroup&&!!t.path.isEqual(e.path)&&!!Sx(t.startAt,e.startAt)&&Sx(t.endAt,e.endAt)}function A_(t){return ne.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}var Br=class{constructor(e,n=null,a=[],r=[],s=null,i="F",l=null,u=null){this.path=e,this.collectionGroup=n,this.explicitOrderBy=a,this.filters=r,this.limit=s,this.limitType=i,this.startAt=l,this.endAt=u,this.Ie=null,this.Ee=null,this.Re=null,this.startAt,this.endAt}};function ZN(t,e,n,a,r,s,i,l){return new Br(t,e,n,a,r,s,i,l)}function US(t){return new Br(t)}function Tx(t){return t.filters.length===0&&t.limit===null&&t.startAt==null&&t.endAt==null&&(t.explicitOrderBy.length===0||t.explicitOrderBy.length===1&&t.explicitOrderBy[0].field.isKeyField())}function eV(t){return ne.isDocumentKey(t.path)&&t.collectionGroup===null&&t.filters.length===0}function wp(t){return t.collectionGroup!==null}function Si(t){let e=xe(t);if(e.Ie===null){e.Ie=[];let n=new Set;for(let s of e.explicitOrderBy)e.Ie.push(s),n.add(s.field.canonicalString());let a=e.explicitOrderBy.length>0?e.explicitOrderBy[e.explicitOrderBy.length-1].dir:"asc";(function(i){let l=new nn(Qn.comparator);return i.filters.forEach(u=>{u.getFlattenedFilters().forEach(c=>{c.isInequality()&&(l=l.add(c.field))})}),l})(e).forEach(s=>{n.has(s.canonicalString())||s.isKeyField()||e.Ie.push(new Ds(s,a))}),n.has(Qn.keyField().canonicalString())||e.Ie.push(new Ds(Qn.keyField(),a))}return e.Ie}function Ka(t){let e=xe(t);return e.Ee||(e.Ee=tV(e,Si(t))),e.Ee}function tV(t,e){if(t.limitType==="F")return vx(t.path,t.collectionGroup,e,t.filters,t.limit,t.startAt,t.endAt);{e=e.map(r=>{let s=r.dir==="desc"?"asc":"desc";return new Ds(r.field,s)});let n=t.endAt?new Fr(t.endAt.position,t.endAt.inclusive):null,a=t.startAt?new Fr(t.startAt.position,t.startAt.inclusive):null;return vx(t.path,t.collectionGroup,e,t.filters,t.limit,n,a)}}function Cp(t,e){let n=t.filters.concat([e]);return new Br(t.path,t.collectionGroup,t.explicitOrderBy.slice(),n,t.limit,t.limitType,t.startAt,t.endAt)}function L0(t,e){let n=t.explicitOrderBy.concat([e]);return new Br(t.path,t.collectionGroup,n,t.filters.slice(),t.limit,t.limitType,t.startAt,t.endAt)}function _c(t,e,n){return new Br(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),e,n,t.startAt,t.endAt)}function A0(t,e){return new Br(t.path,t.collectionGroup,t.explicitOrderBy.slice(),t.filters.slice(),t.limit,t.limitType,e,t.endAt)}function Lp(t,e){return VS(Ka(t),Ka(e))&&t.limitType===e.limitType}function x0(t){return`${NS(Ka(t))}|lt:${t.limitType}`}function Ho(t){return`Query(target=${function(n){let a=n.path.canonicalString();return n.collectionGroup!==null&&(a+=" collectionGroup="+n.collectionGroup),n.filters.length>0&&(a+=`, filters: [${n.filters.map(r=>w0(r)).join(", ")}]`),Ep(n.limit)||(a+=", limit: "+n.limit),n.orderBy.length>0&&(a+=`, orderBy: [${n.orderBy.map(r=>function(i){return`${i.field.canonicalString()} (${i.dir})`}(r)).join(", ")}]`),n.startAt&&(a+=", startAt: ",a+=n.startAt.inclusive?"b:":"a:",a+=n.startAt.position.map(r=>tl(r)).join(",")),n.endAt&&(a+=", endAt: ",a+=n.endAt.inclusive?"a:":"b:",a+=n.endAt.position.map(r=>tl(r)).join(",")),`Target(${a})`}(Ka(t))}; limitType=${t.limitType})`}function Ap(t,e){return e.isFoundDocument()&&function(a,r){let s=r.key.path;return a.collectionGroup!==null?r.key.hasCollectionId(a.collectionGroup)&&a.path.isPrefixOf(s):ne.isDocumentKey(a.path)?a.path.isEqual(s):a.path.isImmediateParentOf(s)}(t,e)&&function(a,r){for(let s of Si(a))if(!s.field.isKeyField()&&r.data.field(s.field)===null)return!1;return!0}(t,e)&&function(a,r){for(let s of a.filters)if(!s.matches(r))return!1;return!0}(t,e)&&function(a,r){return!(a.startAt&&!function(i,l,u){let c=_x(i,l,u);return i.inclusive?c<=0:c<0}(a.startAt,Si(a),r)||a.endAt&&!function(i,l,u){let c=_x(i,l,u);return i.inclusive?c>=0:c>0}(a.endAt,Si(a),r))}(t,e)}function nV(t){return t.collectionGroup||(t.path.length%2==1?t.path.lastSegment():t.path.get(t.path.length-2))}function R0(t){return(e,n)=>{let a=!1;for(let r of Si(t)){let s=aV(r,e,n);if(s!==0)return s;a=a||r.field.isKeyField()}return 0}}function aV(t,e,n){let a=t.field.isKeyField()?ne.comparator(e.key,n.key):function(s,i,l){let u=i.data.field(s),c=l.data.field(s);return u!==null&&c!==null?el(u,c):le(42886)}(t.field,e,n);switch(t.dir){case"asc":return a;case"desc":return-1*a;default:return le(19790,{direction:t.dir})}}var qr=class{constructor(e,n){this.mapKeyFn=e,this.equalsFn=n,this.inner={},this.innerSize=0}get(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a!==void 0){for(let[r,s]of a)if(this.equalsFn(r,e))return s}}has(e){return this.get(e)!==void 0}set(e,n){let a=this.mapKeyFn(e),r=this.inner[a];if(r===void 0)return this.inner[a]=[[e,n]],void this.innerSize++;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],e))return void(r[s]=[e,n]);r.push([e,n]),this.innerSize++}delete(e){let n=this.mapKeyFn(e),a=this.inner[n];if(a===void 0)return!1;for(let r=0;r<a.length;r++)if(this.equalsFn(a[r][0],e))return a.length===1?delete this.inner[n]:a.splice(r,1),this.innerSize--,!0;return!1}forEach(e){hl(this.inner,(n,a)=>{for(let[r,s]of a)e(r,s)})}isEmpty(){return h0(this.inner)}size(){return this.innerSize}};var rV=new Lt(ne.comparator);function Ps(){return rV}var k0=new Lt(ne.comparator);function cc(...t){let e=k0;for(let n of t)e=e.insert(n.key,n);return e}function sV(t){let e=k0;return t.forEach((n,a)=>e=e.insert(n,a.overlayedDocument)),e}function Ii(){return fc()}function D0(){return fc()}function fc(){return new qr(t=>t.toString(),(t,e)=>t.isEqual(e))}var C4=new Lt(ne.comparator),iV=new nn(ne.comparator);function Ae(...t){let e=iV;for(let n of t)e=e.add(n);return e}var oV=new nn(Ce);function lV(){return oV}function FS(t,e){if(t.useProto3Json){if(isNaN(e))return{doubleValue:"NaN"};if(e===1/0)return{doubleValue:"Infinity"};if(e===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:mc(e)?"-0":e}}function P0(t){return{integerValue:""+t}}function uV(t,e){return VN(e)?P0(e):FS(t,e)}var nl=class{constructor(){this._=void 0}};function cV(t,e,n){return t instanceof Sc?function(r,s){let i={fields:{[m0]:{stringValue:p0},[y0]:{timestampValue:{seconds:r.seconds,nanos:r.nanoseconds}}}};return s&&Oc(s)&&(s=bp(s)),s&&(i.fields[g0]=s),{mapValue:i}}(n,e):t instanceof al?O0(t,e):t instanceof rl?M0(t,e):function(r,s){let i=fV(r,s),l=Ex(i)+Ex(r.Ae);return I_(i)&&I_(r.Ae)?P0(l):FS(r.serializer,l)}(t,e)}function dV(t,e,n){return t instanceof al?O0(t,e):t instanceof rl?M0(t,e):n}function fV(t,e){return t instanceof vc?function(a){return I_(a)||function(s){return!!s&&"doubleValue"in s}(a)}(e)?e:{integerValue:0}:null}var Sc=class extends nl{},al=class extends nl{constructor(e){super(),this.elements=e}};function O0(t,e){let n=N0(e);for(let a of t.elements)n.some(r=>Qa(r,a))||n.push(a);return{arrayValue:{values:n}}}var rl=class extends nl{constructor(e){super(),this.elements=e}};function M0(t,e){let n=N0(e);for(let a of t.elements)n=n.filter(r=>!Qa(r,a));return{arrayValue:{values:n}}}var vc=class extends nl{constructor(e,n){super(),this.serializer=e,this.Ae=n}};function Ex(t){return ct(t.integerValue||t.doubleValue)}function N0(t){return MS(t)&&t.arrayValue.values?t.arrayValue.values.slice():[]}function hV(t,e){return t.field.isEqual(e.field)&&function(a,r){return a instanceof al&&r instanceof al||a instanceof rl&&r instanceof rl?$o(a.elements,r.elements,Qa):a instanceof vc&&r instanceof vc?Qa(a.Ae,r.Ae):a instanceof Sc&&r instanceof Sc}(t.transform,e.transform)}var Wo=class t{constructor(e,n){this.updateTime=e,this.exists=n}static none(){return new t}static exists(e){return new t(void 0,e)}static updateTime(e){return new t(e)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(e){return this.exists===e.exists&&(this.updateTime?!!e.updateTime&&this.updateTime.isEqual(e.updateTime):!e.updateTime)}};function Gh(t,e){return t.updateTime!==void 0?e.isFoundDocument()&&e.version.isEqual(t.updateTime):t.exists===void 0||t.exists===e.isFoundDocument()}var Tc=class{};function V0(t,e){if(!t.hasLocalMutations||e&&e.fields.length===0)return null;if(e===null)return t.isNoDocument()?new np(t.key,Wo.none()):new Ec(t.key,t.data,Wo.none());{let n=t.data,a=Ga.empty(),r=new nn(Qn.comparator);for(let s of e.fields)if(!r.has(s)){let i=n.field(s);i===null&&s.length>1&&(s=s.popLast(),i=n.field(s)),i===null?a.delete(s):a.set(s,i),r=r.add(s)}return new sl(t.key,a,new yi(r.toArray()),Wo.none())}}function pV(t,e,n){t instanceof Ec?function(r,s,i){let l=r.value.clone(),u=wx(r.fieldTransforms,s,i.transformResults);l.setAll(u),s.convertToFoundDocument(i.version,l).setHasCommittedMutations()}(t,e,n):t instanceof sl?function(r,s,i){if(!Gh(r.precondition,s))return void s.convertToUnknownDocument(i.version);let l=wx(r.fieldTransforms,s,i.transformResults),u=s.data;u.setAll(U0(r)),u.setAll(l),s.convertToFoundDocument(i.version,u).setHasCommittedMutations()}(t,e,n):function(r,s,i){s.convertToNoDocument(i.version).setHasCommittedMutations()}(0,e,n)}function hc(t,e,n,a){return t instanceof Ec?function(s,i,l,u){if(!Gh(s.precondition,i))return l;let c=s.value.clone(),f=Cx(s.fieldTransforms,u,i);return c.setAll(f),i.convertToFoundDocument(i.version,c).setHasLocalMutations(),null}(t,e,n,a):t instanceof sl?function(s,i,l,u){if(!Gh(s.precondition,i))return l;let c=Cx(s.fieldTransforms,u,i),f=i.data;return f.setAll(U0(s)),f.setAll(c),i.convertToFoundDocument(i.version,f).setHasLocalMutations(),l===null?null:l.unionWith(s.fieldMask.fields).unionWith(s.fieldTransforms.map(p=>p.field))}(t,e,n,a):function(s,i,l){return Gh(s.precondition,i)?(i.convertToNoDocument(i.version).setHasLocalMutations(),null):l}(t,e,n)}function bx(t,e){return t.type===e.type&&!!t.key.isEqual(e.key)&&!!t.precondition.isEqual(e.precondition)&&!!function(a,r){return a===void 0&&r===void 0||!(!a||!r)&&$o(a,r,(s,i)=>hV(s,i))}(t.fieldTransforms,e.fieldTransforms)&&(t.type===0?t.value.isEqual(e.value):t.type!==1||t.data.isEqual(e.data)&&t.fieldMask.isEqual(e.fieldMask))}var Ec=class extends Tc{constructor(e,n,a,r=[]){super(),this.key=e,this.value=n,this.precondition=a,this.fieldTransforms=r,this.type=0}getFieldMask(){return null}},sl=class extends Tc{constructor(e,n,a,r,s=[]){super(),this.key=e,this.data=n,this.fieldMask=a,this.precondition=r,this.fieldTransforms=s,this.type=1}getFieldMask(){return this.fieldMask}};function U0(t){let e=new Map;return t.fieldMask.fields.forEach(n=>{if(!n.isEmpty()){let a=t.data.field(n);e.set(n,a)}}),e}function wx(t,e,n){let a=new Map;ht(t.length===n.length,32656,{Ve:n.length,de:t.length});for(let r=0;r<n.length;r++){let s=t[r],i=s.transform,l=e.data.field(s.field);a.set(s.field,dV(i,l,n[r]))}return a}function Cx(t,e,n){let a=new Map;for(let r of t){let s=r.transform,i=n.data.field(r.field);a.set(r.field,cV(s,i,e))}return a}var np=class extends Tc{constructor(e,n){super(),this.key=e,this.precondition=n,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}};var x_=class{constructor(e,n,a,r){this.batchId=e,this.localWriteTime=n,this.baseMutations=a,this.mutations=r}applyToRemoteDocument(e,n){let a=n.mutationResults;for(let r=0;r<this.mutations.length;r++){let s=this.mutations[r];s.key.isEqual(e.key)&&pV(s,e,a[r])}}applyToLocalView(e,n){for(let a of this.baseMutations)a.key.isEqual(e.key)&&(n=hc(a,e,n,this.localWriteTime));for(let a of this.mutations)a.key.isEqual(e.key)&&(n=hc(a,e,n,this.localWriteTime));return n}applyToLocalDocumentSet(e,n){let a=D0();return this.mutations.forEach(r=>{let s=e.get(r.key),i=s.overlayedDocument,l=this.applyToLocalView(i,s.mutatedFields);l=n.has(r.key)?null:l;let u=V0(i,l);u!==null&&a.set(r.key,u),i.isValidDocument()||i.convertToNoDocument(he.min())}),a}keys(){return this.mutations.reduce((e,n)=>e.add(n.key),Ae())}isEqual(e){return this.batchId===e.batchId&&$o(this.mutations,e.mutations,(n,a)=>bx(n,a))&&$o(this.baseMutations,e.baseMutations,(n,a)=>bx(n,a))}};var R_=class{constructor(e,n){this.largestBatchId=e,this.mutation=n}getKey(){return this.mutation.key}isEqual(e){return e!==null&&this.mutation===e.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}};var k_=class{constructor(e,n){this.count=e,this.unchangedNames=n}};var Ot,Le;function F0(t){if(t===void 0)return Mr("GRPC error has no .code"),F.UNKNOWN;switch(t){case Ot.OK:return F.OK;case Ot.CANCELLED:return F.CANCELLED;case Ot.UNKNOWN:return F.UNKNOWN;case Ot.DEADLINE_EXCEEDED:return F.DEADLINE_EXCEEDED;case Ot.RESOURCE_EXHAUSTED:return F.RESOURCE_EXHAUSTED;case Ot.INTERNAL:return F.INTERNAL;case Ot.UNAVAILABLE:return F.UNAVAILABLE;case Ot.UNAUTHENTICATED:return F.UNAUTHENTICATED;case Ot.INVALID_ARGUMENT:return F.INVALID_ARGUMENT;case Ot.NOT_FOUND:return F.NOT_FOUND;case Ot.ALREADY_EXISTS:return F.ALREADY_EXISTS;case Ot.PERMISSION_DENIED:return F.PERMISSION_DENIED;case Ot.FAILED_PRECONDITION:return F.FAILED_PRECONDITION;case Ot.ABORTED:return F.ABORTED;case Ot.OUT_OF_RANGE:return F.OUT_OF_RANGE;case Ot.UNIMPLEMENTED:return F.UNIMPLEMENTED;case Ot.DATA_LOSS:return F.DATA_LOSS;default:return le(39323,{code:t})}}(Le=Ot||(Ot={}))[Le.OK=0]="OK",Le[Le.CANCELLED=1]="CANCELLED",Le[Le.UNKNOWN=2]="UNKNOWN",Le[Le.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",Le[Le.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",Le[Le.NOT_FOUND=5]="NOT_FOUND",Le[Le.ALREADY_EXISTS=6]="ALREADY_EXISTS",Le[Le.PERMISSION_DENIED=7]="PERMISSION_DENIED",Le[Le.UNAUTHENTICATED=16]="UNAUTHENTICATED",Le[Le.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",Le[Le.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",Le[Le.ABORTED=10]="ABORTED",Le[Le.OUT_OF_RANGE=11]="OUT_OF_RANGE",Le[Le.UNIMPLEMENTED=12]="UNIMPLEMENTED",Le[Le.INTERNAL=13]="INTERNAL",Le[Le.UNAVAILABLE=14]="UNAVAILABLE",Le[Le.DATA_LOSS=15]="DATA_LOSS";var mV=null;function gV(){return new TextEncoder}var yV=new kr([4294967295,4294967295],0);function Lx(t){let e=gV().encode(t),n=new ZI;return n.update(e),new Uint8Array(n.digest())}function Ax(t){let e=new DataView(t.buffer),n=e.getUint32(0,!0),a=e.getUint32(4,!0),r=e.getUint32(8,!0),s=e.getUint32(12,!0);return[new kr([n,a],0),new kr([r,s],0)]}var D_=class t{constructor(e,n,a){if(this.bitmap=e,this.padding=n,this.hashCount=a,n<0||n>=8)throw new _i(`Invalid padding: ${n}`);if(a<0)throw new _i(`Invalid hash count: ${a}`);if(e.length>0&&this.hashCount===0)throw new _i(`Invalid hash count: ${a}`);if(e.length===0&&n!==0)throw new _i(`Invalid padding when bitmap length is 0: ${n}`);this.ge=8*e.length-n,this.pe=kr.fromNumber(this.ge)}ye(e,n,a){let r=e.add(n.multiply(kr.fromNumber(a)));return r.compare(yV)===1&&(r=new kr([r.getBits(0),r.getBits(1)],0)),r.modulo(this.pe).toNumber()}we(e){return!!(this.bitmap[Math.floor(e/8)]&1<<e%8)}mightContain(e){if(this.ge===0)return!1;let n=Lx(e),[a,r]=Ax(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);if(!this.we(i))return!1}return!0}static create(e,n,a){let r=e%8==0?0:8-e%8,s=new Uint8Array(Math.ceil(e/8)),i=new t(s,r,n);return a.forEach(l=>i.insert(l)),i}insert(e){if(this.ge===0)return;let n=Lx(e),[a,r]=Ax(n);for(let s=0;s<this.hashCount;s++){let i=this.ye(a,r,s);this.be(i)}}be(e){let n=Math.floor(e/8),a=e%8;this.bitmap[n]|=1<<a}},_i=class extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}};var ap=class t{constructor(e,n,a,r,s){this.snapshotVersion=e,this.targetChanges=n,this.targetMismatches=a,this.documentUpdates=r,this.resolvedLimboDocuments=s}static createSynthesizedRemoteEventForCurrentChange(e,n,a){let r=new Map;return r.set(e,bc.createSynthesizedTargetChangeForCurrentChange(e,n,a)),new t(he.min(),r,new Lt(Ce),Ps(),Ae())}},bc=class t{constructor(e,n,a,r,s){this.resumeToken=e,this.current=n,this.addedDocuments=a,this.modifiedDocuments=r,this.removedDocuments=s}static createSynthesizedTargetChangeForCurrentChange(e,n,a){return new t(a,n,Ae(),Ae(),Ae())}};var Xo=class{constructor(e,n,a,r){this.Se=e,this.removedTargetIds=n,this.key=a,this.De=r}},rp=class{constructor(e,n){this.targetId=e,this.Ce=n}},sp=class{constructor(e,n,a=cn.EMPTY_BYTE_STRING,r=null){this.state=e,this.targetIds=n,this.resumeToken=a,this.cause=r}},ip=class{constructor(){this.ve=0,this.Fe=xx(),this.Me=cn.EMPTY_BYTE_STRING,this.xe=!1,this.Oe=!0}get current(){return this.xe}get resumeToken(){return this.Me}get Ne(){return this.ve!==0}get Be(){return this.Oe}Le(e){e.approximateByteSize()>0&&(this.Oe=!0,this.Me=e)}ke(){let e=Ae(),n=Ae(),a=Ae();return this.Fe.forEach((r,s)=>{switch(s){case 0:e=e.add(r);break;case 2:n=n.add(r);break;case 1:a=a.add(r);break;default:le(38017,{changeType:s})}}),new bc(this.Me,this.xe,e,n,a)}Ke(){this.Oe=!1,this.Fe=xx()}qe(e,n){this.Oe=!0,this.Fe=this.Fe.insert(e,n)}Ue(e){this.Oe=!0,this.Fe=this.Fe.remove(e)}$e(){this.ve+=1}We(){this.ve-=1,ht(this.ve>=0,3241,{ve:this.ve})}Qe(){this.Oe=!0,this.xe=!0}},P_=class{constructor(e){this.Ge=e,this.ze=new Map,this.je=Ps(),this.He=qh(),this.Je=qh(),this.Ze=new Lt(Ce)}Xe(e){for(let n of e.Se)e.De&&e.De.isFoundDocument()?this.Ye(n,e.De):this.et(n,e.key,e.De);for(let n of e.removedTargetIds)this.et(n,e.key,e.De)}tt(e){this.forEachTarget(e,n=>{let a=this.nt(n);switch(e.state){case 0:this.rt(n)&&a.Le(e.resumeToken);break;case 1:a.We(),a.Ne||a.Ke(),a.Le(e.resumeToken);break;case 2:a.We(),a.Ne||this.removeTarget(n);break;case 3:this.rt(n)&&(a.Qe(),a.Le(e.resumeToken));break;case 4:this.rt(n)&&(this.it(n),a.Le(e.resumeToken));break;default:le(56790,{state:e.state})}})}forEachTarget(e,n){e.targetIds.length>0?e.targetIds.forEach(n):this.ze.forEach((a,r)=>{this.rt(r)&&n(r)})}st(e){let n=e.targetId,a=e.Ce.count,r=this.ot(n);if(r){let s=r.target;if(A_(s))if(a===0){let i=new ne(s.path);this.et(n,i,Sa.newNoDocument(i,he.min()))}else ht(a===1,20013,{expectedCount:a});else{let i=this._t(n);if(i!==a){let l=this.ut(e),u=l?this.ct(l,e,i):1;if(u!==0){this.it(n);let c=u===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.Ze=this.Ze.insert(n,c)}mV?.lt(function(f,p,m,S,R){let D={localCacheCount:f,existenceFilterCount:p.count,databaseId:m.database,projectId:m.projectId},L=p.unchangedNames;return L&&(D.bloomFilter={applied:R===0,hashCount:L?.hashCount??0,bitmapLength:L?.bits?.bitmap?.length??0,padding:L?.bits?.padding??0,mightContain:E=>S?.mightContain(E)??!1}),D}(i,e.Ce,this.Ge.ht(),l,u))}}}}ut(e){let n=e.Ce.unchangedNames;if(!n||!n.bits)return null;let{bits:{bitmap:a="",padding:r=0},hashCount:s=0}=n,i,l;try{i=Ur(a).toUint8Array()}catch(u){if(u instanceof Zh)return Nr("Decoding the base64 bloom filter in existence filter failed ("+u.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw u}try{l=new D_(i,r,s)}catch(u){return Nr(u instanceof _i?"BloomFilter error: ":"Applying bloom filter failed: ",u),null}return l.ge===0?null:l}ct(e,n,a){return n.Ce.count===a-this.Pt(e,n.targetId)?0:2}Pt(e,n){let a=this.Ge.getRemoteKeysForTarget(n),r=0;return a.forEach(s=>{let i=this.Ge.ht(),l=`projects/${i.projectId}/databases/${i.database}/documents/${s.path.canonicalString()}`;e.mightContain(l)||(this.et(n,s,null),r++)}),r}Tt(e){let n=new Map;this.ze.forEach((s,i)=>{let l=this.ot(i);if(l){if(s.current&&A_(l.target)){let u=new ne(l.target.path);this.It(u).has(i)||this.Et(i,u)||this.et(i,u,Sa.newNoDocument(u,e))}s.Be&&(n.set(i,s.ke()),s.Ke())}});let a=Ae();this.Je.forEach((s,i)=>{let l=!0;i.forEachWhile(u=>{let c=this.ot(u);return!c||c.purpose==="TargetPurposeLimboResolution"||(l=!1,!1)}),l&&(a=a.add(s))}),this.je.forEach((s,i)=>i.setReadTime(e));let r=new ap(e,n,this.Ze,this.je,a);return this.je=Ps(),this.He=qh(),this.Je=qh(),this.Ze=new Lt(Ce),r}Ye(e,n){if(!this.rt(e))return;let a=this.Et(e,n.key)?2:0;this.nt(e).qe(n.key,a),this.je=this.je.insert(n.key,n),this.He=this.He.insert(n.key,this.It(n.key).add(e)),this.Je=this.Je.insert(n.key,this.Rt(n.key).add(e))}et(e,n,a){if(!this.rt(e))return;let r=this.nt(e);this.Et(e,n)?r.qe(n,1):r.Ue(n),this.Je=this.Je.insert(n,this.Rt(n).delete(e)),this.Je=this.Je.insert(n,this.Rt(n).add(e)),a&&(this.je=this.je.insert(n,a))}removeTarget(e){this.ze.delete(e)}_t(e){let n=this.nt(e).ke();return this.Ge.getRemoteKeysForTarget(e).size+n.addedDocuments.size-n.removedDocuments.size}$e(e){this.nt(e).$e()}nt(e){let n=this.ze.get(e);return n||(n=new ip,this.ze.set(e,n)),n}Rt(e){let n=this.Je.get(e);return n||(n=new nn(Ce),this.Je=this.Je.insert(e,n)),n}It(e){let n=this.He.get(e);return n||(n=new nn(Ce),this.He=this.He.insert(e,n)),n}rt(e){let n=this.ot(e)!==null;return n||Y("WatchChangeAggregator","Detected inactive target",e),n}ot(e){let n=this.ze.get(e);return n&&n.Ne?null:this.Ge.At(e)}it(e){this.ze.set(e,new ip),this.Ge.getRemoteKeysForTarget(e).forEach(n=>{this.et(e,n,null)})}Et(e,n){return this.Ge.getRemoteKeysForTarget(e).has(n)}};function qh(){return new Lt(ne.comparator)}function xx(){return new Lt(ne.comparator)}var IV={asc:"ASCENDING",desc:"DESCENDING"},_V={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},SV={and:"AND",or:"OR"},O_=class{constructor(e,n){this.databaseId=e,this.useProto3Json=n}};function M_(t,e){return t.useProto3Json||Ep(e)?e:{value:e}}function N_(t,e){return t.useProto3Json?`${new Date(1e3*e.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+e.nanoseconds).slice(-9)}Z`:{seconds:""+e.seconds,nanos:e.nanoseconds}}function B0(t,e){return t.useProto3Json?e.toBase64():e.toUint8Array()}function Qo(t){return ht(!!t,49232),he.fromTimestamp(function(n){let a=Vr(n);return new Nt(a.seconds,a.nanos)}(t))}function q0(t,e){return V_(t,e).canonicalString()}function V_(t,e){let n=function(r){return new dt(["projects",r.projectId,"databases",r.database])}(t).child("documents");return e===void 0?n:n.child(e)}function z0(t){let e=dt.fromString(t);return ht(W0(e),10190,{key:e.toString()}),e}function o_(t,e){let n=z0(e);if(n.get(1)!==t.databaseId.projectId)throw new X(F.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+n.get(1)+" vs "+t.databaseId.projectId);if(n.get(3)!==t.databaseId.database)throw new X(F.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+n.get(3)+" vs "+t.databaseId.database);return new ne(G0(n))}function H0(t,e){return q0(t.databaseId,e)}function vV(t){let e=z0(t);return e.length===4?dt.emptyPath():G0(e)}function Rx(t){return new dt(["projects",t.databaseId.projectId,"databases",t.databaseId.database]).canonicalString()}function G0(t){return ht(t.length>4&&t.get(4)==="documents",29091,{key:t.toString()}),t.popFirst(5)}function TV(t,e){let n;if("targetChange"in e){e.targetChange;let a=function(c){return c==="NO_CHANGE"?0:c==="ADD"?1:c==="REMOVE"?2:c==="CURRENT"?3:c==="RESET"?4:le(39313,{state:c})}(e.targetChange.targetChangeType||"NO_CHANGE"),r=e.targetChange.targetIds||[],s=function(c,f){return c.useProto3Json?(ht(f===void 0||typeof f=="string",58123),cn.fromBase64String(f||"")):(ht(f===void 0||f instanceof Buffer||f instanceof Uint8Array,16193),cn.fromUint8Array(f||new Uint8Array))}(t,e.targetChange.resumeToken),i=e.targetChange.cause,l=i&&function(c){let f=c.code===void 0?F.UNKNOWN:F0(c.code);return new X(f,c.message||"")}(i);n=new sp(a,r,s,l||null)}else if("documentChange"in e){e.documentChange;let a=e.documentChange;a.document,a.document.name,a.document.updateTime;let r=o_(t,a.document.name),s=Qo(a.document.updateTime),i=a.document.createTime?Qo(a.document.createTime):he.min(),l=new Ga({mapValue:{fields:a.document.fields}}),u=Sa.newFoundDocument(r,s,i,l),c=a.targetIds||[],f=a.removedTargetIds||[];n=new Xo(c,f,u.key,u)}else if("documentDelete"in e){e.documentDelete;let a=e.documentDelete;a.document;let r=o_(t,a.document),s=a.readTime?Qo(a.readTime):he.min(),i=Sa.newNoDocument(r,s),l=a.removedTargetIds||[];n=new Xo([],l,i.key,i)}else if("documentRemove"in e){e.documentRemove;let a=e.documentRemove;a.document;let r=o_(t,a.document),s=a.removedTargetIds||[];n=new Xo([],s,r,null)}else{if(!("filter"in e))return le(11601,{Vt:e});{e.filter;let a=e.filter;a.targetId;let{count:r=0,unchangedNames:s}=a,i=new k_(r,s),l=a.targetId;n=new rp(l,i)}}return n}function EV(t,e){return{documents:[H0(t,e.path)]}}function bV(t,e){let n={structuredQuery:{}},a=e.path,r;e.collectionGroup!==null?(r=a,n.structuredQuery.from=[{collectionId:e.collectionGroup,allDescendants:!0}]):(r=a.popLast(),n.structuredQuery.from=[{collectionId:a.lastSegment()}]),n.parent=H0(t,r);let s=function(c){if(c.length!==0)return K0(da.create(c,"and"))}(e.filters);s&&(n.structuredQuery.where=s);let i=function(c){if(c.length!==0)return c.map(f=>function(m){return{field:Go(m.field),direction:LV(m.dir)}}(f))}(e.orderBy);i&&(n.structuredQuery.orderBy=i);let l=M_(t,e.limit);return l!==null&&(n.structuredQuery.limit=l),e.startAt&&(n.structuredQuery.startAt=function(c){return{before:c.inclusive,values:c.position}}(e.startAt)),e.endAt&&(n.structuredQuery.endAt=function(c){return{before:!c.inclusive,values:c.position}}(e.endAt)),{ft:n,parent:r}}function wV(t){let e=vV(t.parent),n=t.structuredQuery,a=n.from?n.from.length:0,r=null;if(a>0){ht(a===1,65062);let f=n.from[0];f.allDescendants?r=f.collectionId:e=e.child(f.collectionId)}let s=[];n.where&&(s=function(p){let m=j0(p);return m instanceof da&&E0(m)?m.getFilters():[m]}(n.where));let i=[];n.orderBy&&(i=function(p){return p.map(m=>function(R){return new Ds(jo(R.field),function(L){switch(L){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(R.direction))}(m))}(n.orderBy));let l=null;n.limit&&(l=function(p){let m;return m=typeof p=="object"?p.value:p,Ep(m)?null:m}(n.limit));let u=null;n.startAt&&(u=function(p){let m=!!p.before,S=p.values||[];return new Fr(S,m)}(n.startAt));let c=null;return n.endAt&&(c=function(p){let m=!p.before,S=p.values||[];return new Fr(S,m)}(n.endAt)),ZN(e,r,i,s,l,"F",u,c)}function CV(t,e){let n=function(r){switch(r){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return le(28987,{purpose:r})}}(e.purpose);return n==null?null:{"goog-listen-tags":n}}function j0(t){return t.unaryFilter!==void 0?function(n){switch(n.unaryFilter.op){case"IS_NAN":let a=jo(n.unaryFilter.field);return wt.create(a,"==",{doubleValue:NaN});case"IS_NULL":let r=jo(n.unaryFilter.field);return wt.create(r,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":let s=jo(n.unaryFilter.field);return wt.create(s,"!=",{doubleValue:NaN});case"IS_NOT_NULL":let i=jo(n.unaryFilter.field);return wt.create(i,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return le(61313);default:return le(60726)}}(t):t.fieldFilter!==void 0?function(n){return wt.create(jo(n.fieldFilter.field),function(r){switch(r){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return le(58110);default:return le(50506)}}(n.fieldFilter.op),n.fieldFilter.value)}(t):t.compositeFilter!==void 0?function(n){return da.create(n.compositeFilter.filters.map(a=>j0(a)),function(r){switch(r){case"AND":return"and";case"OR":return"or";default:return le(1026)}}(n.compositeFilter.op))}(t):le(30097,{filter:t})}function LV(t){return IV[t]}function AV(t){return _V[t]}function xV(t){return SV[t]}function Go(t){return{fieldPath:t.canonicalString()}}function jo(t){return Qn.fromServerFormat(t.fieldPath)}function K0(t){return t instanceof wt?function(n){if(n.op==="=="){if(Ix(n.value))return{unaryFilter:{field:Go(n.field),op:"IS_NAN"}};if(yx(n.value))return{unaryFilter:{field:Go(n.field),op:"IS_NULL"}}}else if(n.op==="!="){if(Ix(n.value))return{unaryFilter:{field:Go(n.field),op:"IS_NOT_NAN"}};if(yx(n.value))return{unaryFilter:{field:Go(n.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Go(n.field),op:AV(n.op),value:n.value}}}(t):t instanceof da?function(n){let a=n.getFilters().map(r=>K0(r));return a.length===1?a[0]:{compositeFilter:{op:xV(n.op),filters:a}}}(t):le(54877,{filter:t})}function W0(t){return t.length>=4&&t.get(0)==="projects"&&t.get(2)==="databases"}function X0(t){return!!t&&typeof t._toProto=="function"&&t._protoValueType==="ProtoValue"}var wc=class t{constructor(e,n,a,r,s=he.min(),i=he.min(),l=cn.EMPTY_BYTE_STRING,u=null){this.target=e,this.targetId=n,this.purpose=a,this.sequenceNumber=r,this.snapshotVersion=s,this.lastLimboFreeSnapshotVersion=i,this.resumeToken=l,this.expectedCount=u}withSequenceNumber(e){return new t(this.target,this.targetId,this.purpose,e,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(e,n){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,n,this.lastLimboFreeSnapshotVersion,e,null)}withExpectedCount(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,e)}withLastLimboFreeSnapshotVersion(e){return new t(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,e,this.resumeToken,this.expectedCount)}};var U_=class{constructor(e){this.yt=e}};function Q0(t){let e=wV({parent:t.parent,structuredQuery:t.structuredQuery});return t.limitType==="LAST"?_c(e,e.limit,"L"):e}var op=class{constructor(){}Dt(e,n){this.Ct(e,n),n.vt()}Ct(e,n){if("nullValue"in e)this.Ft(n,5);else if("booleanValue"in e)this.Ft(n,10),n.Mt(e.booleanValue?1:0);else if("integerValue"in e)this.Ft(n,15),n.Mt(ct(e.integerValue));else if("doubleValue"in e){let a=ct(e.doubleValue);isNaN(a)?this.Ft(n,13):(this.Ft(n,15),mc(a)?n.Mt(0):n.Mt(a))}else if("timestampValue"in e){let a=e.timestampValue;this.Ft(n,20),typeof a=="string"&&(a=Vr(a)),n.xt(`${a.seconds||""}`),n.Mt(a.nanos||0)}else if("stringValue"in e)this.Ot(e.stringValue,n),this.Nt(n);else if("bytesValue"in e)this.Ft(n,30),n.Bt(Ur(e.bytesValue)),this.Nt(n);else if("referenceValue"in e)this.Lt(e.referenceValue,n);else if("geoPointValue"in e){let a=e.geoPointValue;this.Ft(n,45),n.Mt(a.latitude||0),n.Mt(a.longitude||0)}else"mapValue"in e?v0(e)?this.Ft(n,Number.MAX_SAFE_INTEGER):S0(e)?this.kt(e.mapValue,n):(this.Kt(e.mapValue,n),this.Nt(n)):"arrayValue"in e?(this.qt(e.arrayValue,n),this.Nt(n)):le(19022,{Ut:e})}Ot(e,n){this.Ft(n,25),this.$t(e,n)}$t(e,n){n.xt(e)}Kt(e,n){let a=e.fields||{};this.Ft(n,55);for(let r of Object.keys(a))this.Ot(r,n),this.Ct(a[r],n)}kt(e,n){let a=e.fields||{};this.Ft(n,53);let r=Zo,s=a[r].arrayValue?.values?.length||0;this.Ft(n,15),n.Mt(ct(s)),this.Ot(r,n),this.Ct(a[r],n)}qt(e,n){let a=e.values||[];this.Ft(n,50);for(let r of a)this.Ct(r,n)}Lt(e,n){this.Ft(n,37),ne.fromName(e).path.forEach(a=>{this.Ft(n,60),this.$t(a,n)})}Ft(e,n){e.Mt(n)}Nt(e){e.Mt(2)}};op.Wt=new op;var F_=class{constructor(){this.Sn=new B_}addToCollectionParentIndex(e,n){return this.Sn.add(n),q.resolve()}getCollectionParents(e,n){return q.resolve(this.Sn.getEntries(n))}addFieldIndex(e,n){return q.resolve()}deleteFieldIndex(e,n){return q.resolve()}deleteAllFieldIndexes(e){return q.resolve()}createTargetIndexes(e,n){return q.resolve()}getDocumentsMatchingTarget(e,n){return q.resolve(null)}getIndexType(e,n){return q.resolve(0)}getFieldIndexes(e,n){return q.resolve([])}getNextCollectionGroupToUpdate(e){return q.resolve(null)}getMinOffset(e,n){return q.resolve(Ei.min())}getMinOffsetFromCollectionGroup(e,n){return q.resolve(Ei.min())}updateCollectionGroup(e,n,a){return q.resolve()}updateIndexEntries(e,n){return q.resolve()}},B_=class{constructor(){this.index={}}add(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n]||new nn(dt.comparator),s=!r.has(a);return this.index[n]=r.add(a),s}has(e){let n=e.lastSegment(),a=e.popLast(),r=this.index[n];return r&&r.has(a)}getEntries(e){return(this.index[e]||new nn(dt.comparator)).toArray()}};var L4=new Uint8Array(0);var kx={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},Y0=41943040,ca=class t{static withCacheSize(e){return new t(e,t.DEFAULT_COLLECTION_PERCENTILE,t.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(e,n,a){this.cacheSizeCollectionThreshold=e,this.percentileToCollect=n,this.maximumSequenceNumbersToCollect=a}};ca.DEFAULT_COLLECTION_PERCENTILE=10,ca.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,ca.DEFAULT=new ca(Y0,ca.DEFAULT_COLLECTION_PERCENTILE,ca.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),ca.DISABLED=new ca(-1,0,0);var Cc=class t{constructor(e){this.sr=e}next(){return this.sr+=2,this.sr}static _r(){return new t(0)}static ar(){return new t(-1)}};var Dx="LruGarbageCollector",RV=1048576;function Px([t,e],[n,a]){let r=Ce(t,n);return r===0?Ce(e,a):r}var q_=class{constructor(e){this.Pr=e,this.buffer=new nn(Px),this.Tr=0}Ir(){return++this.Tr}Er(e){let n=[e,this.Ir()];if(this.buffer.size<this.Pr)this.buffer=this.buffer.add(n);else{let a=this.buffer.last();Px(n,a)<0&&(this.buffer=this.buffer.delete(a).add(n))}}get maxValue(){return this.buffer.last()[0]}},z_=class{constructor(e,n,a){this.garbageCollector=e,this.asyncQueue=n,this.localStore=a,this.Rr=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Ar(6e4)}stop(){this.Rr&&(this.Rr.cancel(),this.Rr=null)}get started(){return this.Rr!==null}Ar(e){Y(Dx,`Garbage collection scheduled in ${e}ms`),this.Rr=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",e,async()=>{this.Rr=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(n){fl(n)?Y(Dx,"Ignoring IndexedDB error during garbage collection: ",n):await Tp(n)}await this.Ar(3e5)})}},H_=class{constructor(e,n){this.Vr=e,this.params=n}calculateTargetCount(e,n){return this.Vr.dr(e).next(a=>Math.floor(n/100*a))}nthSequenceNumber(e,n){if(n===0)return q.resolve(Jo.ce);let a=new q_(n);return this.Vr.forEachTarget(e,r=>a.Er(r.sequenceNumber)).next(()=>this.Vr.mr(e,r=>a.Er(r))).next(()=>a.maxValue)}removeTargets(e,n,a){return this.Vr.removeTargets(e,n,a)}removeOrphanedDocuments(e,n){return this.Vr.removeOrphanedDocuments(e,n)}collect(e,n){return this.params.cacheSizeCollectionThreshold===-1?(Y("LruGarbageCollector","Garbage collection skipped; disabled"),q.resolve(kx)):this.getCacheSize(e).next(a=>a<this.params.cacheSizeCollectionThreshold?(Y("LruGarbageCollector",`Garbage collection skipped; Cache size ${a} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),kx):this.gr(e,n))}getCacheSize(e){return this.Vr.getCacheSize(e)}gr(e,n){let a,r,s,i,l,u,c,f=Date.now();return this.calculateTargetCount(e,this.params.percentileToCollect).next(p=>(p>this.params.maximumSequenceNumbersToCollect?(Y("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${p}`),r=this.params.maximumSequenceNumbersToCollect):r=p,i=Date.now(),this.nthSequenceNumber(e,r))).next(p=>(a=p,l=Date.now(),this.removeTargets(e,a,n))).next(p=>(s=p,u=Date.now(),this.removeOrphanedDocuments(e,a))).next(p=>(c=Date.now(),zo()<=ge.DEBUG&&Y("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${i-f}ms
	Determined least recently used ${r} in `+(l-i)+`ms
	Removed ${s} targets in `+(u-l)+`ms
	Removed ${p} documents in `+(c-u)+`ms
Total Duration: ${c-f}ms`),q.resolve({didRun:!0,sequenceNumbersCollected:r,targetsRemoved:s,documentsRemoved:p})))}};function kV(t,e){return new H_(t,e)}var G_=class{constructor(){this.changes=new qr(e=>e.toString(),(e,n)=>e.isEqual(n)),this.changesApplied=!1}addEntry(e){this.assertNotApplied(),this.changes.set(e.key,e)}removeEntry(e,n){this.assertNotApplied(),this.changes.set(e,Sa.newInvalidDocument(e).setReadTime(n))}getEntry(e,n){this.assertNotApplied();let a=this.changes.get(n);return a!==void 0?q.resolve(a):this.getFromCache(e,n)}getEntries(e,n){return this.getAllFromCache(e,n)}apply(e){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(e)}assertNotApplied(){}};var j_=class{constructor(e,n){this.overlayedDocument=e,this.mutatedFields=n}};var K_=class{constructor(e,n,a,r){this.remoteDocumentCache=e,this.mutationQueue=n,this.documentOverlayCache=a,this.indexManager=r}getDocument(e,n){let a=null;return this.documentOverlayCache.getOverlay(e,n).next(r=>(a=r,this.remoteDocumentCache.getEntry(e,n))).next(r=>(a!==null&&hc(a.mutation,r,yi.empty(),Nt.now()),r))}getDocuments(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.getLocalViewOfDocuments(e,a,Ae()).next(()=>a))}getLocalViewOfDocuments(e,n,a=Ae()){let r=Ii();return this.populateOverlays(e,r,n).next(()=>this.computeViews(e,n,r,a).next(s=>{let i=cc();return s.forEach((l,u)=>{i=i.insert(l,u.overlayedDocument)}),i}))}getOverlayedDocuments(e,n){let a=Ii();return this.populateOverlays(e,a,n).next(()=>this.computeViews(e,n,a,Ae()))}populateOverlays(e,n,a){let r=[];return a.forEach(s=>{n.has(s)||r.push(s)}),this.documentOverlayCache.getOverlays(e,r).next(s=>{s.forEach((i,l)=>{n.set(i,l)})})}computeViews(e,n,a,r){let s=Ps(),i=fc(),l=function(){return fc()}();return n.forEach((u,c)=>{let f=a.get(c.key);r.has(c.key)&&(f===void 0||f.mutation instanceof sl)?s=s.insert(c.key,c):f!==void 0?(i.set(c.key,f.mutation.getFieldMask()),hc(f.mutation,c,f.mutation.getFieldMask(),Nt.now())):i.set(c.key,yi.empty())}),this.recalculateAndSaveOverlays(e,s).next(u=>(u.forEach((c,f)=>i.set(c,f)),n.forEach((c,f)=>l.set(c,new j_(f,i.get(c)??null))),l))}recalculateAndSaveOverlays(e,n){let a=fc(),r=new Lt((i,l)=>i-l),s=Ae();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(e,n).next(i=>{for(let l of i)l.keys().forEach(u=>{let c=n.get(u);if(c===null)return;let f=a.get(u)||yi.empty();f=l.applyToLocalView(c,f),a.set(u,f);let p=(r.get(l.batchId)||Ae()).add(u);r=r.insert(l.batchId,p)})}).next(()=>{let i=[],l=r.getReverseIterator();for(;l.hasNext();){let u=l.getNext(),c=u.key,f=u.value,p=D0();f.forEach(m=>{if(!s.has(m)){let S=V0(n.get(m),a.get(m));S!==null&&p.set(m,S),s=s.add(m)}}),i.push(this.documentOverlayCache.saveOverlays(e,c,p))}return q.waitFor(i)}).next(()=>a)}recalculateAndSaveOverlaysForDocumentKeys(e,n){return this.remoteDocumentCache.getEntries(e,n).next(a=>this.recalculateAndSaveOverlays(e,a))}getDocumentsMatchingQuery(e,n,a,r){return eV(n)?this.getDocumentsMatchingDocumentQuery(e,n.path):wp(n)?this.getDocumentsMatchingCollectionGroupQuery(e,n,a,r):this.getDocumentsMatchingCollectionQuery(e,n,a,r)}getNextDocuments(e,n,a,r){return this.remoteDocumentCache.getAllFromCollectionGroup(e,n,a,r).next(s=>{let i=r-s.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(e,n,a.largestBatchId,r-s.size):q.resolve(Ii()),l=pc,u=s;return i.next(c=>q.forEach(c,(f,p)=>(l<p.largestBatchId&&(l=p.largestBatchId),s.get(f)?q.resolve():this.remoteDocumentCache.getEntry(e,f).next(m=>{u=u.insert(f,m)}))).next(()=>this.populateOverlays(e,c,s)).next(()=>this.computeViews(e,u,c,Ae())).next(f=>({batchId:l,changes:sV(f)})))})}getDocumentsMatchingDocumentQuery(e,n){return this.getDocument(e,new ne(n)).next(a=>{let r=cc();return a.isFoundDocument()&&(r=r.insert(a.key,a)),r})}getDocumentsMatchingCollectionGroupQuery(e,n,a,r){let s=n.collectionGroup,i=cc();return this.indexManager.getCollectionParents(e,s).next(l=>q.forEach(l,u=>{let c=function(p,m){return new Br(m,null,p.explicitOrderBy.slice(),p.filters.slice(),p.limit,p.limitType,p.startAt,p.endAt)}(n,u.child(s));return this.getDocumentsMatchingCollectionQuery(e,c,a,r).next(f=>{f.forEach((p,m)=>{i=i.insert(p,m)})})}).next(()=>i))}getDocumentsMatchingCollectionQuery(e,n,a,r){let s;return this.documentOverlayCache.getOverlaysForCollection(e,n.path,a.largestBatchId).next(i=>(s=i,this.remoteDocumentCache.getDocumentsMatchingQuery(e,n,a,s,r))).next(i=>{s.forEach((u,c)=>{let f=c.getKey();i.get(f)===null&&(i=i.insert(f,Sa.newInvalidDocument(f)))});let l=cc();return i.forEach((u,c)=>{let f=s.get(u);f!==void 0&&hc(f.mutation,c,yi.empty(),Nt.now()),Ap(n,c)&&(l=l.insert(u,c))}),l})}};var W_=class{constructor(e){this.serializer=e,this.Nr=new Map,this.Br=new Map}getBundleMetadata(e,n){return q.resolve(this.Nr.get(n))}saveBundleMetadata(e,n){return this.Nr.set(n.id,function(r){return{id:r.id,version:r.version,createTime:Qo(r.createTime)}}(n)),q.resolve()}getNamedQuery(e,n){return q.resolve(this.Br.get(n))}saveNamedQuery(e,n){return this.Br.set(n.name,function(r){return{name:r.name,query:Q0(r.bundledQuery),readTime:Qo(r.readTime)}}(n)),q.resolve()}};var X_=class{constructor(){this.overlays=new Lt(ne.comparator),this.Lr=new Map}getOverlay(e,n){return q.resolve(this.overlays.get(n))}getOverlays(e,n){let a=Ii();return q.forEach(n,r=>this.getOverlay(e,r).next(s=>{s!==null&&a.set(r,s)})).next(()=>a)}saveOverlays(e,n,a){return a.forEach((r,s)=>{this.bt(e,n,s)}),q.resolve()}removeOverlaysForBatchId(e,n,a){let r=this.Lr.get(a);return r!==void 0&&(r.forEach(s=>this.overlays=this.overlays.remove(s)),this.Lr.delete(a)),q.resolve()}getOverlaysForCollection(e,n,a){let r=Ii(),s=n.length+1,i=new ne(n.child("")),l=this.overlays.getIteratorFrom(i);for(;l.hasNext();){let u=l.getNext().value,c=u.getKey();if(!n.isPrefixOf(c.path))break;c.path.length===s&&u.largestBatchId>a&&r.set(u.getKey(),u)}return q.resolve(r)}getOverlaysForCollectionGroup(e,n,a,r){let s=new Lt((c,f)=>c-f),i=this.overlays.getIterator();for(;i.hasNext();){let c=i.getNext().value;if(c.getKey().getCollectionGroup()===n&&c.largestBatchId>a){let f=s.get(c.largestBatchId);f===null&&(f=Ii(),s=s.insert(c.largestBatchId,f)),f.set(c.getKey(),c)}}let l=Ii(),u=s.getIterator();for(;u.hasNext()&&(u.getNext().value.forEach((c,f)=>l.set(c,f)),!(l.size()>=r)););return q.resolve(l)}bt(e,n,a){let r=this.overlays.get(a.key);if(r!==null){let i=this.Lr.get(r.largestBatchId).delete(a.key);this.Lr.set(r.largestBatchId,i)}this.overlays=this.overlays.insert(a.key,new R_(n,a));let s=this.Lr.get(n);s===void 0&&(s=Ae(),this.Lr.set(n,s)),this.Lr.set(n,s.add(a.key))}};var Q_=class{constructor(){this.sessionToken=cn.EMPTY_BYTE_STRING}getSessionToken(e){return q.resolve(this.sessionToken)}setSessionToken(e,n){return this.sessionToken=n,q.resolve()}};var Lc=class{constructor(){this.kr=new nn(Mt.Kr),this.qr=new nn(Mt.Ur)}isEmpty(){return this.kr.isEmpty()}addReference(e,n){let a=new Mt(e,n);this.kr=this.kr.add(a),this.qr=this.qr.add(a)}$r(e,n){e.forEach(a=>this.addReference(a,n))}removeReference(e,n){this.Wr(new Mt(e,n))}Qr(e,n){e.forEach(a=>this.removeReference(a,n))}Gr(e){let n=new ne(new dt([])),a=new Mt(n,e),r=new Mt(n,e+1),s=[];return this.qr.forEachInRange([a,r],i=>{this.Wr(i),s.push(i.key)}),s}zr(){this.kr.forEach(e=>this.Wr(e))}Wr(e){this.kr=this.kr.delete(e),this.qr=this.qr.delete(e)}jr(e){let n=new ne(new dt([])),a=new Mt(n,e),r=new Mt(n,e+1),s=Ae();return this.qr.forEachInRange([a,r],i=>{s=s.add(i.key)}),s}containsKey(e){let n=new Mt(e,0),a=this.kr.firstAfterOrEqual(n);return a!==null&&e.isEqual(a.key)}},Mt=class{constructor(e,n){this.key=e,this.Hr=n}static Kr(e,n){return ne.comparator(e.key,n.key)||Ce(e.Hr,n.Hr)}static Ur(e,n){return Ce(e.Hr,n.Hr)||ne.comparator(e.key,n.key)}};var Y_=class{constructor(e,n){this.indexManager=e,this.referenceDelegate=n,this.mutationQueue=[],this.Yn=1,this.Jr=new nn(Mt.Kr)}checkEmpty(e){return q.resolve(this.mutationQueue.length===0)}addMutationBatch(e,n,a,r){let s=this.Yn;this.Yn++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];let i=new x_(s,n,a,r);this.mutationQueue.push(i);for(let l of r)this.Jr=this.Jr.add(new Mt(l.key,s)),this.indexManager.addToCollectionParentIndex(e,l.key.path.popLast());return q.resolve(i)}lookupMutationBatch(e,n){return q.resolve(this.Zr(n))}getNextMutationBatchAfterBatchId(e,n){let a=n+1,r=this.Xr(a),s=r<0?0:r;return q.resolve(this.mutationQueue.length>s?this.mutationQueue[s]:null)}getHighestUnacknowledgedBatchId(){return q.resolve(this.mutationQueue.length===0?NN:this.Yn-1)}getAllMutationBatches(e){return q.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(e,n){let a=new Mt(n,0),r=new Mt(n,Number.POSITIVE_INFINITY),s=[];return this.Jr.forEachInRange([a,r],i=>{let l=this.Zr(i.Hr);s.push(l)}),q.resolve(s)}getAllMutationBatchesAffectingDocumentKeys(e,n){let a=new nn(Ce);return n.forEach(r=>{let s=new Mt(r,0),i=new Mt(r,Number.POSITIVE_INFINITY);this.Jr.forEachInRange([s,i],l=>{a=a.add(l.Hr)})}),q.resolve(this.Yr(a))}getAllMutationBatchesAffectingQuery(e,n){let a=n.path,r=a.length+1,s=a;ne.isDocumentKey(s)||(s=s.child(""));let i=new Mt(new ne(s),0),l=new nn(Ce);return this.Jr.forEachWhile(u=>{let c=u.key.path;return!!a.isPrefixOf(c)&&(c.length===r&&(l=l.add(u.Hr)),!0)},i),q.resolve(this.Yr(l))}Yr(e){let n=[];return e.forEach(a=>{let r=this.Zr(a);r!==null&&n.push(r)}),n}removeMutationBatch(e,n){ht(this.ei(n.batchId,"removed")===0,55003),this.mutationQueue.shift();let a=this.Jr;return q.forEach(n.mutations,r=>{let s=new Mt(r.key,n.batchId);return a=a.delete(s),this.referenceDelegate.markPotentiallyOrphaned(e,r.key)}).next(()=>{this.Jr=a})}nr(e){}containsKey(e,n){let a=new Mt(n,0),r=this.Jr.firstAfterOrEqual(a);return q.resolve(n.isEqual(r&&r.key))}performConsistencyCheck(e){return this.mutationQueue.length,q.resolve()}ei(e,n){return this.Xr(e)}Xr(e){return this.mutationQueue.length===0?0:e-this.mutationQueue[0].batchId}Zr(e){let n=this.Xr(e);return n<0||n>=this.mutationQueue.length?null:this.mutationQueue[n]}};var $_=class{constructor(e){this.ti=e,this.docs=function(){return new Lt(ne.comparator)}(),this.size=0}setIndexManager(e){this.indexManager=e}addEntry(e,n){let a=n.key,r=this.docs.get(a),s=r?r.size:0,i=this.ti(n);return this.docs=this.docs.insert(a,{document:n.mutableCopy(),size:i}),this.size+=i-s,this.indexManager.addToCollectionParentIndex(e,a.path.popLast())}removeEntry(e){let n=this.docs.get(e);n&&(this.docs=this.docs.remove(e),this.size-=n.size)}getEntry(e,n){let a=this.docs.get(n);return q.resolve(a?a.document.mutableCopy():Sa.newInvalidDocument(n))}getEntries(e,n){let a=Ps();return n.forEach(r=>{let s=this.docs.get(r);a=a.insert(r,s?s.document.mutableCopy():Sa.newInvalidDocument(r))}),q.resolve(a)}getDocumentsMatchingQuery(e,n,a,r){let s=Ps(),i=n.path,l=new ne(i.child("__id-9223372036854775808__")),u=this.docs.getIteratorFrom(l);for(;u.hasNext();){let{key:c,value:{document:f}}=u.getNext();if(!i.isPrefixOf(c.path))break;c.path.length>i.length+1||PN(DN(f),a)<=0||(r.has(f.key)||Ap(n,f))&&(s=s.insert(f.key,f.mutableCopy()))}return q.resolve(s)}getAllFromCollectionGroup(e,n,a,r){le(9500)}ni(e,n){return q.forEach(this.docs,a=>n(a))}newChangeBuffer(e){return new J_(this)}getSize(e){return q.resolve(this.size)}},J_=class extends G_{constructor(e){super(),this.Mr=e}applyChanges(e){let n=[];return this.changes.forEach((a,r)=>{r.isValidDocument()?n.push(this.Mr.addEntry(e,r)):this.Mr.removeEntry(a)}),q.waitFor(n)}getFromCache(e,n){return this.Mr.getEntry(e,n)}getAllFromCache(e,n){return this.Mr.getEntries(e,n)}};var Z_=class{constructor(e){this.persistence=e,this.ri=new qr(n=>NS(n),VS),this.lastRemoteSnapshotVersion=he.min(),this.highestTargetId=0,this.ii=0,this.si=new Lc,this.targetCount=0,this.oi=Cc._r()}forEachTarget(e,n){return this.ri.forEach((a,r)=>n(r)),q.resolve()}getLastRemoteSnapshotVersion(e){return q.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(e){return q.resolve(this.ii)}allocateTargetId(e){return this.highestTargetId=this.oi.next(),q.resolve(this.highestTargetId)}setTargetsMetadata(e,n,a){return a&&(this.lastRemoteSnapshotVersion=a),n>this.ii&&(this.ii=n),q.resolve()}lr(e){this.ri.set(e.target,e);let n=e.targetId;n>this.highestTargetId&&(this.oi=new Cc(n),this.highestTargetId=n),e.sequenceNumber>this.ii&&(this.ii=e.sequenceNumber)}addTargetData(e,n){return this.lr(n),this.targetCount+=1,q.resolve()}updateTargetData(e,n){return this.lr(n),q.resolve()}removeTargetData(e,n){return this.ri.delete(n.target),this.si.Gr(n.targetId),this.targetCount-=1,q.resolve()}removeTargets(e,n,a){let r=0,s=[];return this.ri.forEach((i,l)=>{l.sequenceNumber<=n&&a.get(l.targetId)===null&&(this.ri.delete(i),s.push(this.removeMatchingKeysForTargetId(e,l.targetId)),r++)}),q.waitFor(s).next(()=>r)}getTargetCount(e){return q.resolve(this.targetCount)}getTargetData(e,n){let a=this.ri.get(n)||null;return q.resolve(a)}addMatchingKeys(e,n,a){return this.si.$r(n,a),q.resolve()}removeMatchingKeys(e,n,a){this.si.Qr(n,a);let r=this.persistence.referenceDelegate,s=[];return r&&n.forEach(i=>{s.push(r.markPotentiallyOrphaned(e,i))}),q.waitFor(s)}removeMatchingKeysForTargetId(e,n){return this.si.Gr(n),q.resolve()}getMatchingKeysForTargetId(e,n){let a=this.si.jr(n);return q.resolve(a)}containsKey(e,n){return q.resolve(this.si.containsKey(n))}};var lp=class{constructor(e,n){this._i={},this.overlays={},this.ai=new Jo(0),this.ui=!1,this.ui=!0,this.ci=new Q_,this.referenceDelegate=e(this),this.li=new Z_(this),this.indexManager=new F_,this.remoteDocumentCache=function(r){return new $_(r)}(a=>this.referenceDelegate.hi(a)),this.serializer=new U_(n),this.Pi=new W_(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ui=!1,Promise.resolve()}get started(){return this.ui}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(e){return this.indexManager}getDocumentOverlayCache(e){let n=this.overlays[e.toKey()];return n||(n=new X_,this.overlays[e.toKey()]=n),n}getMutationQueue(e,n){let a=this._i[e.toKey()];return a||(a=new Y_(n,this.referenceDelegate),this._i[e.toKey()]=a),a}getGlobalsCache(){return this.ci}getTargetCache(){return this.li}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Pi}runTransaction(e,n,a){Y("MemoryPersistence","Starting transaction:",e);let r=new eS(this.ai.next());return this.referenceDelegate.Ti(),a(r).next(s=>this.referenceDelegate.Ii(r).next(()=>s)).toPromise().then(s=>(r.raiseOnCommittedEvent(),s))}Ei(e,n){return q.or(Object.values(this._i).map(a=>()=>a.containsKey(e,n)))}},eS=class extends m_{constructor(e){super(),this.currentSequenceNumber=e}},tS=class t{constructor(e){this.persistence=e,this.Ri=new Lc,this.Ai=null}static Vi(e){return new t(e)}get di(){if(this.Ai)return this.Ai;throw le(60996)}addReference(e,n,a){return this.Ri.addReference(a,n),this.di.delete(a.toString()),q.resolve()}removeReference(e,n,a){return this.Ri.removeReference(a,n),this.di.add(a.toString()),q.resolve()}markPotentiallyOrphaned(e,n){return this.di.add(n.toString()),q.resolve()}removeTarget(e,n){this.Ri.Gr(n.targetId).forEach(r=>this.di.add(r.toString()));let a=this.persistence.getTargetCache();return a.getMatchingKeysForTargetId(e,n.targetId).next(r=>{r.forEach(s=>this.di.add(s.toString()))}).next(()=>a.removeTargetData(e,n))}Ti(){this.Ai=new Set}Ii(e){let n=this.persistence.getRemoteDocumentCache().newChangeBuffer();return q.forEach(this.di,a=>{let r=ne.fromPath(a);return this.mi(e,r).next(s=>{s||n.removeEntry(r,he.min())})}).next(()=>(this.Ai=null,n.apply(e)))}updateLimboDocument(e,n){return this.mi(e,n).next(a=>{a?this.di.delete(n.toString()):this.di.add(n.toString())})}hi(e){return 0}mi(e,n){return q.or([()=>q.resolve(this.Ri.containsKey(n)),()=>this.persistence.getTargetCache().containsKey(e,n),()=>this.persistence.Ei(e,n)])}},up=class t{constructor(e,n){this.persistence=e,this.fi=new qr(a=>UN(a.path),(a,r)=>a.isEqual(r)),this.garbageCollector=kV(this,n)}static Vi(e,n){return new t(e,n)}Ti(){}Ii(e){return q.resolve()}forEachTarget(e,n){return this.persistence.getTargetCache().forEachTarget(e,n)}dr(e){let n=this.pr(e);return this.persistence.getTargetCache().getTargetCount(e).next(a=>n.next(r=>a+r))}pr(e){let n=0;return this.mr(e,a=>{n++}).next(()=>n)}mr(e,n){return q.forEach(this.fi,(a,r)=>this.wr(e,a,r).next(s=>s?q.resolve():n(r)))}removeTargets(e,n,a){return this.persistence.getTargetCache().removeTargets(e,n,a)}removeOrphanedDocuments(e,n){let a=0,r=this.persistence.getRemoteDocumentCache(),s=r.newChangeBuffer();return r.ni(e,i=>this.wr(e,i,n).next(l=>{l||(a++,s.removeEntry(i,he.min()))})).next(()=>s.apply(e)).next(()=>a)}markPotentiallyOrphaned(e,n){return this.fi.set(n,e.currentSequenceNumber),q.resolve()}removeTarget(e,n){let a=n.withSequenceNumber(e.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(e,a)}addReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),q.resolve()}removeReference(e,n,a){return this.fi.set(a,e.currentSequenceNumber),q.resolve()}updateLimboDocument(e,n){return this.fi.set(n,e.currentSequenceNumber),q.resolve()}hi(e){let n=e.key.toString().length;return e.isFoundDocument()&&(n+=Hh(e.data.value)),n}wr(e,n,a){return q.or([()=>this.persistence.Ei(e,n),()=>this.persistence.getTargetCache().containsKey(e,n),()=>{let r=this.fi.get(n);return q.resolve(r!==void 0&&r>a)}])}getCacheSize(e){return this.persistence.getRemoteDocumentCache().getSize(e)}};var nS=class t{constructor(e,n,a,r){this.targetId=e,this.fromCache=n,this.Ts=a,this.Is=r}static Es(e,n){let a=Ae(),r=Ae();for(let s of n.docChanges)switch(s.type){case 0:a=a.add(s.doc.key);break;case 1:r=r.add(s.doc.key)}return new t(e,n.fromCache,a,r)}};var aS=class{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(e){this._documentReadCount+=e}};var rS=class{constructor(){this.Rs=!1,this.As=!1,this.Vs=100,this.ds=function(){return jL()?8:MN(Jt())>0?6:4}()}initialize(e,n){this.fs=e,this.indexManager=n,this.Rs=!0}getDocumentsMatchingQuery(e,n,a,r){let s={result:null};return this.gs(e,n).next(i=>{s.result=i}).next(()=>{if(!s.result)return this.ps(e,n,r,a).next(i=>{s.result=i})}).next(()=>{if(s.result)return;let i=new aS;return this.ys(e,n,i).next(l=>{if(s.result=l,this.As)return this.ws(e,n,i,l.size)})}).next(()=>s.result)}ws(e,n,a,r){return a.documentReadCount<this.Vs?(zo()<=ge.DEBUG&&Y("QueryEngine","SDK will not create cache indexes for query:",Ho(n),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),q.resolve()):(zo()<=ge.DEBUG&&Y("QueryEngine","Query:",Ho(n),"scans",a.documentReadCount,"local documents and returns",r,"documents as results."),a.documentReadCount>this.ds*r?(zo()<=ge.DEBUG&&Y("QueryEngine","The SDK decides to create cache indexes for query:",Ho(n),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(e,Ka(n))):q.resolve())}gs(e,n){if(Tx(n))return q.resolve(null);let a=Ka(n);return this.indexManager.getIndexType(e,a).next(r=>r===0?null:(n.limit!==null&&r===1&&(n=_c(n,null,"F"),a=Ka(n)),this.indexManager.getDocumentsMatchingTarget(e,a).next(s=>{let i=Ae(...s);return this.fs.getDocuments(e,i).next(l=>this.indexManager.getMinOffset(e,a).next(u=>{let c=this.bs(n,l);return this.Ss(n,c,i,u.readTime)?this.gs(e,_c(n,null,"F")):this.Ds(e,c,n,u)}))})))}ps(e,n,a,r){return Tx(n)||r.isEqual(he.min())?q.resolve(null):this.fs.getDocuments(e,a).next(s=>{let i=this.bs(n,s);return this.Ss(n,i,a,r)?q.resolve(null):(zo()<=ge.DEBUG&&Y("QueryEngine","Re-using previous result from %s to execute query: %s",r.toString(),Ho(n)),this.Ds(e,i,n,kN(r,pc)).next(l=>l))})}bs(e,n){let a=new nn(R0(e));return n.forEach((r,s)=>{Ap(e,s)&&(a=a.add(s))}),a}Ss(e,n,a,r){if(e.limit===null)return!1;if(a.size!==n.size)return!0;let s=e.limitType==="F"?n.last():n.first();return!!s&&(s.hasPendingWrites||s.version.compareTo(r)>0)}ys(e,n,a){return zo()<=ge.DEBUG&&Y("QueryEngine","Using full collection scan to execute query:",Ho(n)),this.fs.getDocumentsMatchingQuery(e,n,Ei.min(),a)}Ds(e,n,a,r){return this.fs.getDocumentsMatchingQuery(e,a,r).next(s=>(n.forEach(i=>{s=s.insert(i.key,i)}),s))}};var BS="LocalStore",DV=3e8,sS=class{constructor(e,n,a,r){this.persistence=e,this.Cs=n,this.serializer=r,this.vs=new Lt(Ce),this.Fs=new qr(s=>NS(s),VS),this.Ms=new Map,this.xs=e.getRemoteDocumentCache(),this.li=e.getTargetCache(),this.Pi=e.getBundleCache(),this.Os(a)}Os(e){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(e),this.indexManager=this.persistence.getIndexManager(e),this.mutationQueue=this.persistence.getMutationQueue(e,this.indexManager),this.localDocuments=new K_(this.xs,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.xs.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(e){return this.persistence.runTransaction("Collect garbage","readwrite-primary",n=>e.collect(n,this.vs))}};function PV(t,e,n,a){return new sS(t,e,n,a)}async function $0(t,e){let n=xe(t);return await n.persistence.runTransaction("Handle user change","readonly",a=>{let r;return n.mutationQueue.getAllMutationBatches(a).next(s=>(r=s,n.Os(e),n.mutationQueue.getAllMutationBatches(a))).next(s=>{let i=[],l=[],u=Ae();for(let c of r){i.push(c.batchId);for(let f of c.mutations)u=u.add(f.key)}for(let c of s){l.push(c.batchId);for(let f of c.mutations)u=u.add(f.key)}return n.localDocuments.getDocuments(a,u).next(c=>({Ns:c,removedBatchIds:i,addedBatchIds:l}))})})}function J0(t){let e=xe(t);return e.persistence.runTransaction("Get last remote snapshot version","readonly",n=>e.li.getLastRemoteSnapshotVersion(n))}function OV(t,e){let n=xe(t),a=e.snapshotVersion,r=n.vs;return n.persistence.runTransaction("Apply remote event","readwrite-primary",s=>{let i=n.xs.newChangeBuffer({trackRemovals:!0});r=n.vs;let l=[];e.targetChanges.forEach((f,p)=>{let m=r.get(p);if(!m)return;l.push(n.li.removeMatchingKeys(s,f.removedDocuments,p).next(()=>n.li.addMatchingKeys(s,f.addedDocuments,p)));let S=m.withSequenceNumber(s.currentSequenceNumber);e.targetMismatches.get(p)!==null?S=S.withResumeToken(cn.EMPTY_BYTE_STRING,he.min()).withLastLimboFreeSnapshotVersion(he.min()):f.resumeToken.approximateByteSize()>0&&(S=S.withResumeToken(f.resumeToken,a)),r=r.insert(p,S),function(D,L,E){return D.resumeToken.approximateByteSize()===0||L.snapshotVersion.toMicroseconds()-D.snapshotVersion.toMicroseconds()>=DV?!0:E.addedDocuments.size+E.modifiedDocuments.size+E.removedDocuments.size>0}(m,S,f)&&l.push(n.li.updateTargetData(s,S))});let u=Ps(),c=Ae();if(e.documentUpdates.forEach(f=>{e.resolvedLimboDocuments.has(f)&&l.push(n.persistence.referenceDelegate.updateLimboDocument(s,f))}),l.push(MV(s,i,e.documentUpdates).next(f=>{u=f.Bs,c=f.Ls})),!a.isEqual(he.min())){let f=n.li.getLastRemoteSnapshotVersion(s).next(p=>n.li.setTargetsMetadata(s,s.currentSequenceNumber,a));l.push(f)}return q.waitFor(l).next(()=>i.apply(s)).next(()=>n.localDocuments.getLocalViewOfDocuments(s,u,c)).next(()=>u)}).then(s=>(n.vs=r,s))}function MV(t,e,n){let a=Ae(),r=Ae();return n.forEach(s=>a=a.add(s)),e.getEntries(t,a).next(s=>{let i=Ps();return n.forEach((l,u)=>{let c=s.get(l);u.isFoundDocument()!==c.isFoundDocument()&&(r=r.add(l)),u.isNoDocument()&&u.version.isEqual(he.min())?(e.removeEntry(l,u.readTime),i=i.insert(l,u)):!c.isValidDocument()||u.version.compareTo(c.version)>0||u.version.compareTo(c.version)===0&&c.hasPendingWrites?(e.addEntry(u),i=i.insert(l,u)):Y(BS,"Ignoring outdated watch update for ",l,". Current version:",c.version," Watch version:",u.version)}),{Bs:i,Ls:r}})}function NV(t,e){let n=xe(t);return n.persistence.runTransaction("Allocate target","readwrite",a=>{let r;return n.li.getTargetData(a,e).next(s=>s?(r=s,q.resolve(r)):n.li.allocateTargetId(a).next(i=>(r=new wc(e,i,"TargetPurposeListen",a.currentSequenceNumber),n.li.addTargetData(a,r).next(()=>r))))}).then(a=>{let r=n.vs.get(a.targetId);return(r===null||a.snapshotVersion.compareTo(r.snapshotVersion)>0)&&(n.vs=n.vs.insert(a.targetId,a),n.Fs.set(e,a.targetId)),a})}async function iS(t,e,n){let a=xe(t),r=a.vs.get(e),s=n?"readwrite":"readwrite-primary";try{n||await a.persistence.runTransaction("Release target",s,i=>a.persistence.referenceDelegate.removeTarget(i,r))}catch(i){if(!fl(i))throw i;Y(BS,`Failed to update sequence numbers for target ${e}: ${i}`)}a.vs=a.vs.remove(e),a.Fs.delete(r.target)}function Ox(t,e,n){let a=xe(t),r=he.min(),s=Ae();return a.persistence.runTransaction("Execute query","readwrite",i=>function(u,c,f){let p=xe(u),m=p.Fs.get(f);return m!==void 0?q.resolve(p.vs.get(m)):p.li.getTargetData(c,f)}(a,i,Ka(e)).next(l=>{if(l)return r=l.lastLimboFreeSnapshotVersion,a.li.getMatchingKeysForTargetId(i,l.targetId).next(u=>{s=u})}).next(()=>a.Cs.getDocumentsMatchingQuery(i,e,n?r:he.min(),n?s:Ae())).next(l=>(VV(a,nV(e),l),{documents:l,ks:s})))}function VV(t,e,n){let a=t.Ms.get(e)||he.min();n.forEach((r,s)=>{s.readTime.compareTo(a)>0&&(a=s.readTime)}),t.Ms.set(e,a)}var cp=class{constructor(){this.activeTargetIds=lV()}Qs(e){this.activeTargetIds=this.activeTargetIds.add(e)}Gs(e){this.activeTargetIds=this.activeTargetIds.delete(e)}Ws(){let e={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(e)}};var oS=class{constructor(){this.vo=new cp,this.Fo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(e){}updateMutationState(e,n,a){}addLocalQueryTarget(e,n=!0){return n&&this.vo.Qs(e),this.Fo[e]||"not-current"}updateQueryState(e,n,a){this.Fo[e]=n}removeLocalQueryTarget(e){this.vo.Gs(e)}isLocalQueryTarget(e){return this.vo.activeTargetIds.has(e)}clearQueryState(e){delete this.Fo[e]}getAllActiveQueryTargets(){return this.vo.activeTargetIds}isActiveQueryTarget(e){return this.vo.activeTargetIds.has(e)}start(){return this.vo=new cp,Promise.resolve()}handleUserChange(e,n,a){}setOnlineState(e){}shutdown(){}writeSequenceNumber(e){}notifyBundleLoaded(e){}};var lS=class{Mo(e){}shutdown(){}};var Mx="ConnectivityMonitor",dp=class{constructor(){this.xo=()=>this.Oo(),this.No=()=>this.Bo(),this.Lo=[],this.ko()}Mo(e){this.Lo.push(e)}shutdown(){window.removeEventListener("online",this.xo),window.removeEventListener("offline",this.No)}ko(){window.addEventListener("online",this.xo),window.addEventListener("offline",this.No)}Oo(){Y(Mx,"Network connectivity changed: AVAILABLE");for(let e of this.Lo)e(0)}Bo(){Y(Mx,"Network connectivity changed: UNAVAILABLE");for(let e of this.Lo)e(1)}static v(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}};var zh=null;function uS(){return zh===null?zh=function(){return 268435456+Math.round(2147483648*Math.random())}():zh++,"0x"+zh.toString(16)}var l_="RestConnection",UV={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery",ExecutePipeline:"executePipeline"},cS=class{get Ko(){return!1}constructor(e){this.databaseInfo=e,this.databaseId=e.databaseId;let n=e.ssl?"https":"http",a=encodeURIComponent(this.databaseId.projectId),r=encodeURIComponent(this.databaseId.database);this.qo=n+"://"+e.host,this.Uo=`projects/${a}/databases/${r}`,this.$o=this.databaseId.database===ep?`project_id=${a}`:`project_id=${a}&database_id=${r}`}Wo(e,n,a,r,s){let i=uS(),l=this.Qo(e,n.toUriEncodedString());Y(l_,`Sending RPC '${e}' ${i}:`,l,a);let u={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.$o};this.Go(u,r,s);let{host:c}=new URL(l),f=Va(c);return this.zo(e,l,u,a,f).then(p=>(Y(l_,`Received RPC '${e}' ${i}: `,p),p),p=>{throw Nr(l_,`RPC '${e}' ${i} failed with error: `,p,"url: ",l,"request:",a),p})}jo(e,n,a,r,s,i){return this.Wo(e,n,a,r,s)}Go(e,n,a){e["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+cl}(),e["Content-Type"]="text/plain",this.databaseInfo.appId&&(e["X-Firebase-GMPID"]=this.databaseInfo.appId),n&&n.headers.forEach((r,s)=>e[s]=r),a&&a.headers.forEach((r,s)=>e[s]=r)}Qo(e,n){let a=UV[e],r=`${this.qo}/v1/${n}:${a}`;return this.databaseInfo.apiKey&&(r=`${r}?key=${encodeURIComponent(this.databaseInfo.apiKey)}`),r}terminate(){}};var dS=class{constructor(e){this.Ho=e.Ho,this.Jo=e.Jo}Zo(e){this.Xo=e}Yo(e){this.e_=e}t_(e){this.n_=e}onMessage(e){this.r_=e}close(){this.Jo()}send(e){this.Ho(e)}i_(){this.Xo()}s_(){this.e_()}o_(e){this.n_(e)}__(e){this.r_(e)}};var mn="WebChannelConnection",uc=(t,e,n)=>{t.listen(e,a=>{try{n(a)}catch(r){setTimeout(()=>{throw r},0)}})},fp=class t extends cS{constructor(e){super(e),this.a_=[],this.forceLongPolling=e.forceLongPolling,this.autoDetectLongPolling=e.autoDetectLongPolling,this.useFetchStreams=e.useFetchStreams,this.longPollingOptions=e.longPollingOptions}static u_(){if(!t.c_){let e=a_();uc(e,n_.STAT_EVENT,n=>{n.stat===Fh.PROXY?Y(mn,"STAT_EVENT: detected buffering proxy"):n.stat===Fh.NOPROXY&&Y(mn,"STAT_EVENT: detected no buffering proxy")}),t.c_=!0}}zo(e,n,a,r,s){let i=uS();return new Promise((l,u)=>{let c=new e_;c.setWithCredentials(!0),c.listenOnce(t_.COMPLETE,()=>{try{switch(c.getLastErrorCode()){case lc.NO_ERROR:let p=c.getResponseJson();Y(mn,`XHR for RPC '${e}' ${i} received:`,JSON.stringify(p)),l(p);break;case lc.TIMEOUT:Y(mn,`RPC '${e}' ${i} timed out`),u(new X(F.DEADLINE_EXCEEDED,"Request time out"));break;case lc.HTTP_ERROR:let m=c.getStatus();if(Y(mn,`RPC '${e}' ${i} failed with status:`,m,"response text:",c.getResponseText()),m>0){let S=c.getResponseJson();Array.isArray(S)&&(S=S[0]);let R=S?.error;if(R&&R.status&&R.message){let D=function(E){let v=E.toLowerCase().replace(/_/g,"-");return Object.values(F).indexOf(v)>=0?v:F.UNKNOWN}(R.status);u(new X(D,R.message))}else u(new X(F.UNKNOWN,"Server responded with status "+c.getStatus()))}else u(new X(F.UNAVAILABLE,"Connection failed."));break;default:le(9055,{l_:e,streamId:i,h_:c.getLastErrorCode(),P_:c.getLastError()})}}finally{Y(mn,`RPC '${e}' ${i} completed.`)}});let f=JSON.stringify(r);Y(mn,`RPC '${e}' ${i} sending request:`,r),c.send(n,"POST",f,a,15)})}T_(e,n,a){let r=uS(),s=[this.qo,"/","google.firestore.v1.Firestore","/",e,"/channel"],i=this.createWebChannelTransport(),l={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},u=this.longPollingOptions.timeoutSeconds;u!==void 0&&(l.longPollingTimeout=Math.round(1e3*u)),this.useFetchStreams&&(l.useFetchStreams=!0),this.Go(l.initMessageHeaders,n,a),l.encodeInitMessageHeaders=!0;let c=s.join("");Y(mn,`Creating RPC '${e}' stream ${r}: ${c}`,l);let f=i.createWebChannel(c,l);this.I_(f);let p=!1,m=!1,S=new dS({Ho:R=>{m?Y(mn,`Not sending because RPC '${e}' stream ${r} is closed:`,R):(p||(Y(mn,`Opening RPC '${e}' stream ${r} transport.`),f.open(),p=!0),Y(mn,`RPC '${e}' stream ${r} sending:`,R),f.send(R))},Jo:()=>f.close()});return uc(f,qo.EventType.OPEN,()=>{m||(Y(mn,`RPC '${e}' stream ${r} transport opened.`),S.i_())}),uc(f,qo.EventType.CLOSE,()=>{m||(m=!0,Y(mn,`RPC '${e}' stream ${r} transport closed`),S.o_(),this.E_(f))}),uc(f,qo.EventType.ERROR,R=>{m||(m=!0,Nr(mn,`RPC '${e}' stream ${r} transport errored. Name:`,R.name,"Message:",R.message),S.o_(new X(F.UNAVAILABLE,"The operation could not be completed")))}),uc(f,qo.EventType.MESSAGE,R=>{if(!m){let D=R.data[0];ht(!!D,16349);let L=D,E=L?.error||L[0]?.error;if(E){Y(mn,`RPC '${e}' stream ${r} received error:`,E);let v=E.status,C=function(G){let _=Ot[G];if(_!==void 0)return F0(_)}(v),x=E.message;v==="NOT_FOUND"&&x.includes("database")&&x.includes("does not exist")&&x.includes(this.databaseId.database)&&Nr(`Database '${this.databaseId.database}' not found. Please check your project configuration.`),C===void 0&&(C=F.INTERNAL,x="Unknown error status: "+v+" with message "+E.message),m=!0,S.o_(new X(C,x)),f.close()}else Y(mn,`RPC '${e}' stream ${r} received:`,D),S.__(D)}}),t.u_(),setTimeout(()=>{S.s_()},0),S}terminate(){this.a_.forEach(e=>e.close()),this.a_=[]}I_(e){this.a_.push(e)}E_(e){this.a_=this.a_.filter(n=>n===e)}Go(e,n,a){super.Go(e,n,a),this.databaseInfo.apiKey&&(e["x-goog-api-key"]=this.databaseInfo.apiKey)}createWebChannelTransport(){return r_()}};function FV(t){return new fp(t)}function u_(){return typeof document<"u"?document:null}function Nc(t){return new O_(t,!0)}fp.c_=!1;var hp=class{constructor(e,n,a=1e3,r=1.5,s=6e4){this.Ci=e,this.timerId=n,this.R_=a,this.A_=r,this.V_=s,this.d_=0,this.m_=null,this.f_=Date.now(),this.reset()}reset(){this.d_=0}g_(){this.d_=this.V_}p_(e){this.cancel();let n=Math.floor(this.d_+this.y_()),a=Math.max(0,Date.now()-this.f_),r=Math.max(0,n-a);r>0&&Y("ExponentialBackoff",`Backing off for ${r} ms (base delay: ${this.d_} ms, delay with jitter: ${n} ms, last attempt: ${a} ms ago)`),this.m_=this.Ci.enqueueAfterDelay(this.timerId,r,()=>(this.f_=Date.now(),e())),this.d_*=this.A_,this.d_<this.R_&&(this.d_=this.R_),this.d_>this.V_&&(this.d_=this.V_)}w_(){this.m_!==null&&(this.m_.skipDelay(),this.m_=null)}cancel(){this.m_!==null&&(this.m_.cancel(),this.m_=null)}y_(){return(Math.random()-.5)*this.d_}};var Nx="PersistentStream",fS=class{constructor(e,n,a,r,s,i,l,u){this.Ci=e,this.b_=a,this.S_=r,this.connection=s,this.authCredentialsProvider=i,this.appCheckCredentialsProvider=l,this.listener=u,this.state=0,this.D_=0,this.C_=null,this.v_=null,this.stream=null,this.F_=0,this.M_=new hp(e,n)}x_(){return this.state===1||this.state===5||this.O_()}O_(){return this.state===2||this.state===3}start(){this.F_=0,this.state!==4?this.auth():this.N_()}async stop(){this.x_()&&await this.close(0)}B_(){this.state=0,this.M_.reset()}L_(){this.O_()&&this.C_===null&&(this.C_=this.Ci.enqueueAfterDelay(this.b_,6e4,()=>this.k_()))}K_(e){this.q_(),this.stream.send(e)}async k_(){if(this.O_())return this.close(0)}q_(){this.C_&&(this.C_.cancel(),this.C_=null)}U_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(e,n){this.q_(),this.U_(),this.M_.cancel(),this.D_++,e!==4?this.M_.reset():n&&n.code===F.RESOURCE_EXHAUSTED?(Mr(n.toString()),Mr("Using maximum backoff delay to prevent overloading the backend."),this.M_.g_()):n&&n.code===F.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.W_(),this.stream.close(),this.stream=null),this.state=e,await this.listener.t_(n)}W_(){}auth(){this.state=1;let e=this.Q_(this.D_),n=this.D_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([a,r])=>{this.D_===n&&this.G_(a,r)},a=>{e(()=>{let r=new X(F.UNKNOWN,"Fetching auth token failed: "+a.message);return this.z_(r)})})}G_(e,n){let a=this.Q_(this.D_);this.stream=this.j_(e,n),this.stream.Zo(()=>{a(()=>this.listener.Zo())}),this.stream.Yo(()=>{a(()=>(this.state=2,this.v_=this.Ci.enqueueAfterDelay(this.S_,1e4,()=>(this.O_()&&(this.state=3),Promise.resolve())),this.listener.Yo()))}),this.stream.t_(r=>{a(()=>this.z_(r))}),this.stream.onMessage(r=>{a(()=>++this.F_==1?this.H_(r):this.onNext(r))})}N_(){this.state=5,this.M_.p_(async()=>{this.state=0,this.start()})}z_(e){return Y(Nx,`close with error: ${e}`),this.stream=null,this.close(4,e)}Q_(e){return n=>{this.Ci.enqueueAndForget(()=>this.D_===e?n():(Y(Nx,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}},hS=class extends fS{constructor(e,n,a,r,s,i){super(e,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",n,a,r,i),this.serializer=s}j_(e,n){return this.connection.T_("Listen",e,n)}H_(e){return this.onNext(e)}onNext(e){this.M_.reset();let n=TV(this.serializer,e),a=function(s){if(!("targetChange"in s))return he.min();let i=s.targetChange;return i.targetIds&&i.targetIds.length?he.min():i.readTime?Qo(i.readTime):he.min()}(e);return this.listener.J_(n,a)}Z_(e){let n={};n.database=Rx(this.serializer),n.addTarget=function(s,i){let l,u=i.target;if(l=A_(u)?{documents:EV(s,u)}:{query:bV(s,u).ft},l.targetId=i.targetId,i.resumeToken.approximateByteSize()>0){l.resumeToken=B0(s,i.resumeToken);let c=M_(s,i.expectedCount);c!==null&&(l.expectedCount=c)}else if(i.snapshotVersion.compareTo(he.min())>0){l.readTime=N_(s,i.snapshotVersion.toTimestamp());let c=M_(s,i.expectedCount);c!==null&&(l.expectedCount=c)}return l}(this.serializer,e);let a=CV(this.serializer,e);a&&(n.labels=a),this.K_(n)}X_(e){let n={};n.database=Rx(this.serializer),n.removeTarget=e,this.K_(n)}};var pS=class{},mS=class extends pS{constructor(e,n,a,r){super(),this.authCredentials=e,this.appCheckCredentials=n,this.connection=a,this.serializer=r,this.ia=!1}sa(){if(this.ia)throw new X(F.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(e,n,a,r){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([s,i])=>this.connection.Wo(e,V_(n,a),r,s,i)).catch(s=>{throw s.name==="FirebaseError"?(s.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),s):new X(F.UNKNOWN,s.toString())})}jo(e,n,a,r,s){return this.sa(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([i,l])=>this.connection.jo(e,V_(n,a),r,i,l,s)).catch(i=>{throw i.name==="FirebaseError"?(i.code===F.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),i):new X(F.UNKNOWN,i.toString())})}terminate(){this.ia=!0,this.connection.terminate()}};function BV(t,e,n,a){return new mS(t,e,n,a)}var gS=class{constructor(e,n){this.asyncQueue=e,this.onlineStateHandler=n,this.state="Unknown",this.oa=0,this._a=null,this.aa=!0}ua(){this.oa===0&&(this.ca("Unknown"),this._a=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this._a=null,this.la("Backend didn't respond within 10 seconds."),this.ca("Offline"),Promise.resolve())))}ha(e){this.state==="Online"?this.ca("Unknown"):(this.oa++,this.oa>=1&&(this.Pa(),this.la(`Connection failed 1 times. Most recent error: ${e.toString()}`),this.ca("Offline")))}set(e){this.Pa(),this.oa=0,e==="Online"&&(this.aa=!1),this.ca(e)}ca(e){e!==this.state&&(this.state=e,this.onlineStateHandler(e))}la(e){let n=`Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this.aa?(Mr(n),this.aa=!1):Y("OnlineStateTracker",n)}Pa(){this._a!==null&&(this._a.cancel(),this._a=null)}};var il="RemoteStore",yS=class{constructor(e,n,a,r,s){this.localStore=e,this.datastore=n,this.asyncQueue=a,this.remoteSyncer={},this.Ta=[],this.Ia=new Map,this.Ea=new Set,this.Ra=[],this.Aa=s,this.Aa.Mo(i=>{a.enqueueAndForget(async()=>{Uc(this)&&(Y(il,"Restarting streams for network reachability change."),await async function(u){let c=xe(u);c.Ea.add(4),await Vc(c),c.Va.set("Unknown"),c.Ea.delete(4),await xp(c)}(this))})}),this.Va=new gS(a,r)}};async function xp(t){if(Uc(t))for(let e of t.Ra)await e(!0)}async function Vc(t){for(let e of t.Ra)await e(!1)}function Z0(t,e){let n=xe(t);n.Ia.has(e.targetId)||(n.Ia.set(e.targetId,e),GS(n)?HS(n):pl(n).O_()&&zS(n,e))}function qS(t,e){let n=xe(t),a=pl(n);n.Ia.delete(e),a.O_()&&eR(n,e),n.Ia.size===0&&(a.O_()?a.L_():Uc(n)&&n.Va.set("Unknown"))}function zS(t,e){if(t.da.$e(e.targetId),e.resumeToken.approximateByteSize()>0||e.snapshotVersion.compareTo(he.min())>0){let n=t.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;e=e.withExpectedCount(n)}pl(t).Z_(e)}function eR(t,e){t.da.$e(e),pl(t).X_(e)}function HS(t){t.da=new P_({getRemoteKeysForTarget:e=>t.remoteSyncer.getRemoteKeysForTarget(e),At:e=>t.Ia.get(e)||null,ht:()=>t.datastore.serializer.databaseId}),pl(t).start(),t.Va.ua()}function GS(t){return Uc(t)&&!pl(t).x_()&&t.Ia.size>0}function Uc(t){return xe(t).Ea.size===0}function tR(t){t.da=void 0}async function qV(t){t.Va.set("Online")}async function zV(t){t.Ia.forEach((e,n)=>{zS(t,e)})}async function HV(t,e){tR(t),GS(t)?(t.Va.ha(e),HS(t)):t.Va.set("Unknown")}async function GV(t,e,n){if(t.Va.set("Online"),e instanceof sp&&e.state===2&&e.cause)try{await async function(r,s){let i=s.cause;for(let l of s.targetIds)r.Ia.has(l)&&(await r.remoteSyncer.rejectListen(l,i),r.Ia.delete(l),r.da.removeTarget(l))}(t,e)}catch(a){Y(il,"Failed to remove targets %s: %s ",e.targetIds.join(","),a),await Vx(t,a)}else if(e instanceof Xo?t.da.Xe(e):e instanceof rp?t.da.st(e):t.da.tt(e),!n.isEqual(he.min()))try{let a=await J0(t.localStore);n.compareTo(a)>=0&&await function(s,i){let l=s.da.Tt(i);return l.targetChanges.forEach((u,c)=>{if(u.resumeToken.approximateByteSize()>0){let f=s.Ia.get(c);f&&s.Ia.set(c,f.withResumeToken(u.resumeToken,i))}}),l.targetMismatches.forEach((u,c)=>{let f=s.Ia.get(u);if(!f)return;s.Ia.set(u,f.withResumeToken(cn.EMPTY_BYTE_STRING,f.snapshotVersion)),eR(s,u);let p=new wc(f.target,u,c,f.sequenceNumber);zS(s,p)}),s.remoteSyncer.applyRemoteEvent(l)}(t,n)}catch(a){Y(il,"Failed to raise snapshot:",a),await Vx(t,a)}}async function Vx(t,e,n){if(!fl(e))throw e;t.Ea.add(1),await Vc(t),t.Va.set("Offline"),n||(n=()=>J0(t.localStore)),t.asyncQueue.enqueueRetryable(async()=>{Y(il,"Retrying IndexedDB access"),await n(),t.Ea.delete(1),await xp(t)})}async function Ux(t,e){let n=xe(t);n.asyncQueue.verifyOperationInProgress(),Y(il,"RemoteStore received new credentials");let a=Uc(n);n.Ea.add(3),await Vc(n),a&&n.Va.set("Unknown"),await n.remoteSyncer.handleCredentialChange(e),n.Ea.delete(3),await xp(n)}async function jV(t,e){let n=xe(t);e?(n.Ea.delete(2),await xp(n)):e||(n.Ea.add(2),await Vc(n),n.Va.set("Unknown"))}function pl(t){return t.ma||(t.ma=function(n,a,r){let s=xe(n);return s.sa(),new hS(a,s.connection,s.authCredentials,s.appCheckCredentials,s.serializer,r)}(t.datastore,t.asyncQueue,{Zo:qV.bind(null,t),Yo:zV.bind(null,t),t_:HV.bind(null,t),J_:GV.bind(null,t)}),t.Ra.push(async e=>{e?(t.ma.B_(),GS(t)?HS(t):t.Va.set("Unknown")):(await t.ma.stop(),tR(t))})),t.ma}var IS=class t{constructor(e,n,a,r,s){this.asyncQueue=e,this.timerId=n,this.targetTimeMs=a,this.op=r,this.removalCallback=s,this.deferred=new Pr,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(i=>{})}get promise(){return this.deferred.promise}static createAndSchedule(e,n,a,r,s){let i=Date.now()+a,l=new t(e,n,i,r,s);return l.start(a),l}start(e){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new X(F.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(e=>this.deferred.resolve(e))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}};function nR(t,e){if(Mr("AsyncQueue",`${e}: ${t}`),fl(t))return new X(F.UNAVAILABLE,`${e}: ${t}`);throw t}var Ac=class t{static emptySet(e){return new t(e.comparator)}constructor(e){this.comparator=e?(n,a)=>e(n,a)||ne.comparator(n.key,a.key):(n,a)=>ne.comparator(n.key,a.key),this.keyedMap=cc(),this.sortedSet=new Lt(this.comparator)}has(e){return this.keyedMap.get(e)!=null}get(e){return this.keyedMap.get(e)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(e){let n=this.keyedMap.get(e);return n?this.sortedSet.indexOf(n):-1}get size(){return this.sortedSet.size}forEach(e){this.sortedSet.inorderTraversal((n,a)=>(e(n),!1))}add(e){let n=this.delete(e.key);return n.copy(n.keyedMap.insert(e.key,e),n.sortedSet.insert(e,null))}delete(e){let n=this.get(e);return n?this.copy(this.keyedMap.remove(e),this.sortedSet.remove(n)):this}isEqual(e){if(!(e instanceof t)||this.size!==e.size)return!1;let n=this.sortedSet.getIterator(),a=e.sortedSet.getIterator();for(;n.hasNext();){let r=n.getNext().key,s=a.getNext().key;if(!r.isEqual(s))return!1}return!0}toString(){let e=[];return this.forEach(n=>{e.push(n.toString())}),e.length===0?"DocumentSet ()":`DocumentSet (
  `+e.join(`  
`)+`
)`}copy(e,n){let a=new t;return a.comparator=this.comparator,a.keyedMap=e,a.sortedSet=n,a}};var pp=class{constructor(){this.ga=new Lt(ne.comparator)}track(e){let n=e.doc.key,a=this.ga.get(n);a?e.type!==0&&a.type===3?this.ga=this.ga.insert(n,e):e.type===3&&a.type!==1?this.ga=this.ga.insert(n,{type:a.type,doc:e.doc}):e.type===2&&a.type===2?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):e.type===2&&a.type===0?this.ga=this.ga.insert(n,{type:0,doc:e.doc}):e.type===1&&a.type===0?this.ga=this.ga.remove(n):e.type===1&&a.type===2?this.ga=this.ga.insert(n,{type:1,doc:a.doc}):e.type===0&&a.type===1?this.ga=this.ga.insert(n,{type:2,doc:e.doc}):le(63341,{Vt:e,pa:a}):this.ga=this.ga.insert(n,e)}ya(){let e=[];return this.ga.inorderTraversal((n,a)=>{e.push(a)}),e}},bi=class t{constructor(e,n,a,r,s,i,l,u,c){this.query=e,this.docs=n,this.oldDocs=a,this.docChanges=r,this.mutatedKeys=s,this.fromCache=i,this.syncStateChanged=l,this.excludesMetadataChanges=u,this.hasCachedResults=c}static fromInitialDocuments(e,n,a,r,s){let i=[];return n.forEach(l=>{i.push({type:0,doc:l})}),new t(e,n,Ac.emptySet(n),i,a,r,!0,!1,s)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(e){if(!(this.fromCache===e.fromCache&&this.hasCachedResults===e.hasCachedResults&&this.syncStateChanged===e.syncStateChanged&&this.mutatedKeys.isEqual(e.mutatedKeys)&&Lp(this.query,e.query)&&this.docs.isEqual(e.docs)&&this.oldDocs.isEqual(e.oldDocs)))return!1;let n=this.docChanges,a=e.docChanges;if(n.length!==a.length)return!1;for(let r=0;r<n.length;r++)if(n[r].type!==a[r].type||!n[r].doc.isEqual(a[r].doc))return!1;return!0}};var _S=class{constructor(){this.wa=void 0,this.ba=[]}Sa(){return this.ba.some(e=>e.Da())}},SS=class{constructor(){this.queries=Fx(),this.onlineState="Unknown",this.Ca=new Set}terminate(){(function(n,a){let r=xe(n),s=r.queries;r.queries=Fx(),s.forEach((i,l)=>{for(let u of l.ba)u.onError(a)})})(this,new X(F.ABORTED,"Firestore shutting down"))}};function Fx(){return new qr(t=>x0(t),Lp)}async function KV(t,e){let n=xe(t),a=3,r=e.query,s=n.queries.get(r);s?!s.Sa()&&e.Da()&&(a=2):(s=new _S,a=e.Da()?0:1);try{switch(a){case 0:s.wa=await n.onListen(r,!0);break;case 1:s.wa=await n.onListen(r,!1);break;case 2:await n.onFirstRemoteStoreListen(r)}}catch(i){let l=nR(i,`Initialization of query '${Ho(e.query)}' failed`);return void e.onError(l)}n.queries.set(r,s),s.ba.push(e),e.va(n.onlineState),s.wa&&e.Fa(s.wa)&&jS(n)}async function WV(t,e){let n=xe(t),a=e.query,r=3,s=n.queries.get(a);if(s){let i=s.ba.indexOf(e);i>=0&&(s.ba.splice(i,1),s.ba.length===0?r=e.Da()?0:1:!s.Sa()&&e.Da()&&(r=2))}switch(r){case 0:return n.queries.delete(a),n.onUnlisten(a,!0);case 1:return n.queries.delete(a),n.onUnlisten(a,!1);case 2:return n.onLastRemoteStoreUnlisten(a);default:return}}function XV(t,e){let n=xe(t),a=!1;for(let r of e){let s=r.query,i=n.queries.get(s);if(i){for(let l of i.ba)l.Fa(r)&&(a=!0);i.wa=r}}a&&jS(n)}function QV(t,e,n){let a=xe(t),r=a.queries.get(e);if(r)for(let s of r.ba)s.onError(n);a.queries.delete(e)}function jS(t){t.Ca.forEach(e=>{e.next()})}var vS,Bx;(Bx=vS||(vS={})).Ma="default",Bx.Cache="cache";var TS=class{constructor(e,n,a){this.query=e,this.xa=n,this.Oa=!1,this.Na=null,this.onlineState="Unknown",this.options=a||{}}Fa(e){if(!this.options.includeMetadataChanges){let a=[];for(let r of e.docChanges)r.type!==3&&a.push(r);e=new bi(e.query,e.docs,e.oldDocs,a,e.mutatedKeys,e.fromCache,e.syncStateChanged,!0,e.hasCachedResults)}let n=!1;return this.Oa?this.Ba(e)&&(this.xa.next(e),n=!0):this.La(e,this.onlineState)&&(this.ka(e),n=!0),this.Na=e,n}onError(e){this.xa.error(e)}va(e){this.onlineState=e;let n=!1;return this.Na&&!this.Oa&&this.La(this.Na,e)&&(this.ka(this.Na),n=!0),n}La(e,n){if(!e.fromCache||!this.Da())return!0;let a=n!=="Offline";return(!this.options.Ka||!a)&&(!e.docs.isEmpty()||e.hasCachedResults||n==="Offline")}Ba(e){if(e.docChanges.length>0)return!0;let n=this.Na&&this.Na.hasPendingWrites!==e.hasPendingWrites;return!(!e.syncStateChanged&&!n)&&this.options.includeMetadataChanges===!0}ka(e){e=bi.fromInitialDocuments(e.query,e.docs,e.mutatedKeys,e.fromCache,e.hasCachedResults),this.Oa=!0,this.xa.next(e)}Da(){return this.options.source!==vS.Cache}};var mp=class{constructor(e){this.key=e}},gp=class{constructor(e){this.key=e}},ES=class{constructor(e,n){this.query=e,this.Za=n,this.Xa=null,this.hasCachedResults=!1,this.current=!1,this.Ya=Ae(),this.mutatedKeys=Ae(),this.eu=R0(e),this.tu=new Ac(this.eu)}get nu(){return this.Za}ru(e,n){let a=n?n.iu:new pp,r=n?n.tu:this.tu,s=n?n.mutatedKeys:this.mutatedKeys,i=r,l=!1,u=this.query.limitType==="F"&&r.size===this.query.limit?r.last():null,c=this.query.limitType==="L"&&r.size===this.query.limit?r.first():null;if(e.inorderTraversal((f,p)=>{let m=r.get(f),S=Ap(this.query,p)?p:null,R=!!m&&this.mutatedKeys.has(m.key),D=!!S&&(S.hasLocalMutations||this.mutatedKeys.has(S.key)&&S.hasCommittedMutations),L=!1;m&&S?m.data.isEqual(S.data)?R!==D&&(a.track({type:3,doc:S}),L=!0):this.su(m,S)||(a.track({type:2,doc:S}),L=!0,(u&&this.eu(S,u)>0||c&&this.eu(S,c)<0)&&(l=!0)):!m&&S?(a.track({type:0,doc:S}),L=!0):m&&!S&&(a.track({type:1,doc:m}),L=!0,(u||c)&&(l=!0)),L&&(S?(i=i.add(S),s=D?s.add(f):s.delete(f)):(i=i.delete(f),s=s.delete(f)))}),this.query.limit!==null)for(;i.size>this.query.limit;){let f=this.query.limitType==="F"?i.last():i.first();i=i.delete(f.key),s=s.delete(f.key),a.track({type:1,doc:f})}return{tu:i,iu:a,Ss:l,mutatedKeys:s}}su(e,n){return e.hasLocalMutations&&n.hasCommittedMutations&&!n.hasLocalMutations}applyChanges(e,n,a,r){let s=this.tu;this.tu=e.tu,this.mutatedKeys=e.mutatedKeys;let i=e.iu.ya();i.sort((f,p)=>function(S,R){let D=L=>{switch(L){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return le(20277,{Vt:L})}};return D(S)-D(R)}(f.type,p.type)||this.eu(f.doc,p.doc)),this.ou(a),r=r??!1;let l=n&&!r?this._u():[],u=this.Ya.size===0&&this.current&&!r?1:0,c=u!==this.Xa;return this.Xa=u,i.length!==0||c?{snapshot:new bi(this.query,e.tu,s,i,e.mutatedKeys,u===0,c,!1,!!a&&a.resumeToken.approximateByteSize()>0),au:l}:{au:l}}va(e){return this.current&&e==="Offline"?(this.current=!1,this.applyChanges({tu:this.tu,iu:new pp,mutatedKeys:this.mutatedKeys,Ss:!1},!1)):{au:[]}}uu(e){return!this.Za.has(e)&&!!this.tu.has(e)&&!this.tu.get(e).hasLocalMutations}ou(e){e&&(e.addedDocuments.forEach(n=>this.Za=this.Za.add(n)),e.modifiedDocuments.forEach(n=>{}),e.removedDocuments.forEach(n=>this.Za=this.Za.delete(n)),this.current=e.current)}_u(){if(!this.current)return[];let e=this.Ya;this.Ya=Ae(),this.tu.forEach(a=>{this.uu(a.key)&&(this.Ya=this.Ya.add(a.key))});let n=[];return e.forEach(a=>{this.Ya.has(a)||n.push(new gp(a))}),this.Ya.forEach(a=>{e.has(a)||n.push(new mp(a))}),n}cu(e){this.Za=e.ks,this.Ya=Ae();let n=this.ru(e.documents);return this.applyChanges(n,!0)}lu(){return bi.fromInitialDocuments(this.query,this.tu,this.mutatedKeys,this.Xa===0,this.hasCachedResults)}},KS="SyncEngine",bS=class{constructor(e,n,a){this.query=e,this.targetId=n,this.view=a}},wS=class{constructor(e){this.key=e,this.hu=!1}},CS=class{constructor(e,n,a,r,s,i){this.localStore=e,this.remoteStore=n,this.eventManager=a,this.sharedClientState=r,this.currentUser=s,this.maxConcurrentLimboResolutions=i,this.Pu={},this.Tu=new qr(l=>x0(l),Lp),this.Iu=new Map,this.Eu=new Set,this.Ru=new Lt(ne.comparator),this.Au=new Map,this.Vu=new Lc,this.du={},this.mu=new Map,this.fu=Cc.ar(),this.onlineState="Unknown",this.gu=void 0}get isPrimaryClient(){return this.gu===!0}};async function YV(t,e,n=!0){let a=oR(t),r,s=a.Tu.get(e);return s?(a.sharedClientState.addLocalQueryTarget(s.targetId),r=s.view.lu()):r=await aR(a,e,n,!0),r}async function $V(t,e){let n=oR(t);await aR(n,e,!0,!1)}async function aR(t,e,n,a){let r=await NV(t.localStore,Ka(e)),s=r.targetId,i=t.sharedClientState.addLocalQueryTarget(s,n),l;return a&&(l=await JV(t,e,s,i==="current",r.resumeToken)),t.isPrimaryClient&&n&&Z0(t.remoteStore,r),l}async function JV(t,e,n,a,r){t.pu=(p,m,S)=>async function(D,L,E,v){let C=L.view.ru(E);C.Ss&&(C=await Ox(D.localStore,L.query,!1).then(({documents:_})=>L.view.ru(_,C)));let x=v&&v.targetChanges.get(L.targetId),H=v&&v.targetMismatches.get(L.targetId)!=null,G=L.view.applyChanges(C,D.isPrimaryClient,x,H);return zx(D,L.targetId,G.au),G.snapshot}(t,p,m,S);let s=await Ox(t.localStore,e,!0),i=new ES(e,s.ks),l=i.ru(s.documents),u=bc.createSynthesizedTargetChangeForCurrentChange(n,a&&t.onlineState!=="Offline",r),c=i.applyChanges(l,t.isPrimaryClient,u);zx(t,n,c.au);let f=new bS(e,n,i);return t.Tu.set(e,f),t.Iu.has(n)?t.Iu.get(n).push(e):t.Iu.set(n,[e]),c.snapshot}async function ZV(t,e,n){let a=xe(t),r=a.Tu.get(e),s=a.Iu.get(r.targetId);if(s.length>1)return a.Iu.set(r.targetId,s.filter(i=>!Lp(i,e))),void a.Tu.delete(e);a.isPrimaryClient?(a.sharedClientState.removeLocalQueryTarget(r.targetId),a.sharedClientState.isActiveQueryTarget(r.targetId)||await iS(a.localStore,r.targetId,!1).then(()=>{a.sharedClientState.clearQueryState(r.targetId),n&&qS(a.remoteStore,r.targetId),LS(a,r.targetId)}).catch(Tp)):(LS(a,r.targetId),await iS(a.localStore,r.targetId,!0))}async function eU(t,e){let n=xe(t),a=n.Tu.get(e),r=n.Iu.get(a.targetId);n.isPrimaryClient&&r.length===1&&(n.sharedClientState.removeLocalQueryTarget(a.targetId),qS(n.remoteStore,a.targetId))}async function rR(t,e){let n=xe(t);try{let a=await OV(n.localStore,e);e.targetChanges.forEach((r,s)=>{let i=n.Au.get(s);i&&(ht(r.addedDocuments.size+r.modifiedDocuments.size+r.removedDocuments.size<=1,22616),r.addedDocuments.size>0?i.hu=!0:r.modifiedDocuments.size>0?ht(i.hu,14607):r.removedDocuments.size>0&&(ht(i.hu,42227),i.hu=!1))}),await iR(n,a,e)}catch(a){await Tp(a)}}function qx(t,e,n){let a=xe(t);if(a.isPrimaryClient&&n===0||!a.isPrimaryClient&&n===1){let r=[];a.Tu.forEach((s,i)=>{let l=i.view.va(e);l.snapshot&&r.push(l.snapshot)}),function(i,l){let u=xe(i);u.onlineState=l;let c=!1;u.queries.forEach((f,p)=>{for(let m of p.ba)m.va(l)&&(c=!0)}),c&&jS(u)}(a.eventManager,e),r.length&&a.Pu.J_(r),a.onlineState=e,a.isPrimaryClient&&a.sharedClientState.setOnlineState(e)}}async function tU(t,e,n){let a=xe(t);a.sharedClientState.updateQueryState(e,"rejected",n);let r=a.Au.get(e),s=r&&r.key;if(s){let i=new Lt(ne.comparator);i=i.insert(s,Sa.newNoDocument(s,he.min()));let l=Ae().add(s),u=new ap(he.min(),new Map,new Lt(Ce),i,l);await rR(a,u),a.Ru=a.Ru.remove(s),a.Au.delete(e),WS(a)}else await iS(a.localStore,e,!1).then(()=>LS(a,e,n)).catch(Tp)}function LS(t,e,n=null){t.sharedClientState.removeLocalQueryTarget(e);for(let a of t.Iu.get(e))t.Tu.delete(a),n&&t.Pu.yu(a,n);t.Iu.delete(e),t.isPrimaryClient&&t.Vu.Gr(e).forEach(a=>{t.Vu.containsKey(a)||sR(t,a)})}function sR(t,e){t.Eu.delete(e.path.canonicalString());let n=t.Ru.get(e);n!==null&&(qS(t.remoteStore,n),t.Ru=t.Ru.remove(e),t.Au.delete(n),WS(t))}function zx(t,e,n){for(let a of n)a instanceof mp?(t.Vu.addReference(a.key,e),nU(t,a)):a instanceof gp?(Y(KS,"Document no longer in limbo: "+a.key),t.Vu.removeReference(a.key,e),t.Vu.containsKey(a.key)||sR(t,a.key)):le(19791,{wu:a})}function nU(t,e){let n=e.key,a=n.path.canonicalString();t.Ru.get(n)||t.Eu.has(a)||(Y(KS,"New document in limbo: "+n),t.Eu.add(a),WS(t))}function WS(t){for(;t.Eu.size>0&&t.Ru.size<t.maxConcurrentLimboResolutions;){let e=t.Eu.values().next().value;t.Eu.delete(e);let n=new ne(dt.fromString(e)),a=t.fu.next();t.Au.set(a,new wS(n)),t.Ru=t.Ru.insert(n,a),Z0(t.remoteStore,new wc(Ka(US(n.path)),a,"TargetPurposeLimboResolution",Jo.ce))}}async function iR(t,e,n){let a=xe(t),r=[],s=[],i=[];a.Tu.isEmpty()||(a.Tu.forEach((l,u)=>{i.push(a.pu(u,e,n).then(c=>{if((c||n)&&a.isPrimaryClient){let f=c?!c.fromCache:n?.targetChanges.get(u.targetId)?.current;a.sharedClientState.updateQueryState(u.targetId,f?"current":"not-current")}if(c){r.push(c);let f=nS.Es(u.targetId,c);s.push(f)}}))}),await Promise.all(i),a.Pu.J_(r),await async function(u,c){let f=xe(u);try{await f.persistence.runTransaction("notifyLocalViewChanges","readwrite",p=>q.forEach(c,m=>q.forEach(m.Ts,S=>f.persistence.referenceDelegate.addReference(p,m.targetId,S)).next(()=>q.forEach(m.Is,S=>f.persistence.referenceDelegate.removeReference(p,m.targetId,S)))))}catch(p){if(!fl(p))throw p;Y(BS,"Failed to update sequence numbers: "+p)}for(let p of c){let m=p.targetId;if(!p.fromCache){let S=f.vs.get(m),R=S.snapshotVersion,D=S.withLastLimboFreeSnapshotVersion(R);f.vs=f.vs.insert(m,D)}}}(a.localStore,s))}async function aU(t,e){let n=xe(t);if(!n.currentUser.isEqual(e)){Y(KS,"User change. New user:",e.toKey());let a=await $0(n.localStore,e);n.currentUser=e,function(s,i){s.mu.forEach(l=>{l.forEach(u=>{u.reject(new X(F.CANCELLED,i))})}),s.mu.clear()}(n,"'waitForPendingWrites' promise is rejected due to a user change."),n.sharedClientState.handleUserChange(e,a.removedBatchIds,a.addedBatchIds),await iR(n,a.Ns)}}function rU(t,e){let n=xe(t),a=n.Au.get(e);if(a&&a.hu)return Ae().add(a.key);{let r=Ae(),s=n.Iu.get(e);if(!s)return r;for(let i of s){let l=n.Tu.get(i);r=r.unionWith(l.view.nu)}return r}}function oR(t){let e=xe(t);return e.remoteStore.remoteSyncer.applyRemoteEvent=rR.bind(null,e),e.remoteStore.remoteSyncer.getRemoteKeysForTarget=rU.bind(null,e),e.remoteStore.remoteSyncer.rejectListen=tU.bind(null,e),e.Pu.J_=XV.bind(null,e.eventManager),e.Pu.yu=QV.bind(null,e.eventManager),e}var wi=class{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(e){this.serializer=Nc(e.databaseInfo.databaseId),this.sharedClientState=this.Du(e),this.persistence=this.Cu(e),await this.persistence.start(),this.localStore=this.vu(e),this.gcScheduler=this.Fu(e,this.localStore),this.indexBackfillerScheduler=this.Mu(e,this.localStore)}Fu(e,n){return null}Mu(e,n){return null}vu(e){return PV(this.persistence,new rS,e.initialUser,this.serializer)}Cu(e){return new lp(tS.Vi,this.serializer)}Du(e){return new oS}async terminate(){this.gcScheduler?.stop(),this.indexBackfillerScheduler?.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}};wi.provider={build:()=>new wi};var yp=class extends wi{constructor(e){super(),this.cacheSizeBytes=e}Fu(e,n){ht(this.persistence.referenceDelegate instanceof up,46915);let a=this.persistence.referenceDelegate.garbageCollector;return new z_(a,e.asyncQueue,n)}Cu(e){let n=this.cacheSizeBytes!==void 0?ca.withCacheSize(this.cacheSizeBytes):ca.DEFAULT;return new lp(a=>up.Vi(a,n),this.serializer)}};var ol=class{async initialize(e,n){this.localStore||(this.localStore=e.localStore,this.sharedClientState=e.sharedClientState,this.datastore=this.createDatastore(n),this.remoteStore=this.createRemoteStore(n),this.eventManager=this.createEventManager(n),this.syncEngine=this.createSyncEngine(n,!e.synchronizeTabs),this.sharedClientState.onlineStateHandler=a=>qx(this.syncEngine,a,1),this.remoteStore.remoteSyncer.handleCredentialChange=aU.bind(null,this.syncEngine),await jV(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(e){return function(){return new SS}()}createDatastore(e){let n=Nc(e.databaseInfo.databaseId),a=FV(e.databaseInfo);return BV(e.authCredentials,e.appCheckCredentials,a,n)}createRemoteStore(e){return function(a,r,s,i,l){return new yS(a,r,s,i,l)}(this.localStore,this.datastore,e.asyncQueue,n=>qx(this.syncEngine,n,0),function(){return dp.v()?new dp:new lS}())}createSyncEngine(e,n){return function(r,s,i,l,u,c,f){let p=new CS(r,s,i,l,u,c);return f&&(p.gu=!0),p}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,e.initialUser,e.maxConcurrentLimboResolutions,n)}async terminate(){await async function(n){let a=xe(n);Y(il,"RemoteStore shutting down."),a.Ea.add(5),await Vc(a),a.Aa.shutdown(),a.Va.set("Unknown")}(this.remoteStore),this.datastore?.terminate(),this.eventManager?.terminate()}};ol.provider={build:()=>new ol};var AS=class{constructor(e){this.observer=e,this.muted=!1}next(e){this.muted||this.observer.next&&this.Ou(this.observer.next,e)}error(e){this.muted||(this.observer.error?this.Ou(this.observer.error,e):Mr("Uncaught Error in snapshot listener:",e.toString()))}Nu(){this.muted=!0}Ou(e,n){setTimeout(()=>{this.muted||e(n)},0)}};var Os="FirestoreClient",xS=class{constructor(e,n,a,r,s){this.authCredentials=e,this.appCheckCredentials=n,this.asyncQueue=a,this._databaseInfo=r,this.user=tn.UNAUTHENTICATED,this.clientId=Yo.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=s,this.authCredentials.start(a,async i=>{Y(Os,"Received user=",i.uid),await this.authCredentialListener(i),this.user=i}),this.appCheckCredentials.start(a,i=>(Y(Os,"Received new app check token=",i),this.appCheckCredentialListener(i,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this._databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(e){this.authCredentialListener=e}setAppCheckTokenChangeListener(e){this.appCheckCredentialListener=e}terminate(){this.asyncQueue.enterRestrictedMode();let e=new Pr;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),e.resolve()}catch(n){let a=nR(n,"Failed to shutdown persistence");e.reject(a)}}),e.promise}};async function c_(t,e){t.asyncQueue.verifyOperationInProgress(),Y(Os,"Initializing OfflineComponentProvider");let n=t.configuration;await e.initialize(n);let a=n.initialUser;t.setCredentialChangeListener(async r=>{a.isEqual(r)||(await $0(e.localStore,r),a=r)}),e.persistence.setDatabaseDeletedListener(()=>t.terminate()),t._offlineComponents=e}async function Hx(t,e){t.asyncQueue.verifyOperationInProgress();let n=await sU(t);Y(Os,"Initializing OnlineComponentProvider"),await e.initialize(n,t.configuration),t.setCredentialChangeListener(a=>Ux(e.remoteStore,a)),t.setAppCheckTokenChangeListener((a,r)=>Ux(e.remoteStore,r)),t._onlineComponents=e}async function sU(t){if(!t._offlineComponents)if(t._uninitializedComponentsProvider){Y(Os,"Using user provided OfflineComponentProvider");try{await c_(t,t._uninitializedComponentsProvider._offline)}catch(e){let n=e;if(!function(r){return r.name==="FirebaseError"?r.code===F.FAILED_PRECONDITION||r.code===F.UNIMPLEMENTED:!(typeof DOMException<"u"&&r instanceof DOMException)||r.code===22||r.code===20||r.code===11}(n))throw n;Nr("Error using user provided cache. Falling back to memory cache: "+n),await c_(t,new wi)}}else Y(Os,"Using default OfflineComponentProvider"),await c_(t,new yp(void 0));return t._offlineComponents}async function iU(t){return t._onlineComponents||(t._uninitializedComponentsProvider?(Y(Os,"Using user provided OnlineComponentProvider"),await Hx(t,t._uninitializedComponentsProvider._online)):(Y(Os,"Using default OnlineComponentProvider"),await Hx(t,new ol))),t._onlineComponents}async function oU(t){let e=await iU(t),n=e.eventManager;return n.onListen=YV.bind(null,e.syncEngine),n.onUnlisten=ZV.bind(null,e.syncEngine),n.onFirstRemoteStoreListen=$V.bind(null,e.syncEngine),n.onLastRemoteStoreUnlisten=eU.bind(null,e.syncEngine),n}function lR(t,e,n={}){let a=new Pr;return t.asyncQueue.enqueueAndForget(async()=>function(s,i,l,u,c){let f=new AS({next:m=>{f.Nu(),i.enqueueAndForget(()=>WV(s,p)),m.fromCache&&u.source==="server"?c.reject(new X(F.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):c.resolve(m)},error:m=>c.reject(m)}),p=new TS(l,f,{includeMetadataChanges:!0,Ka:!0});return KV(s,p)}(await oU(t),t.asyncQueue,e,n,a)),a.promise}function uR(t){let e={};return t.timeoutSeconds!==void 0&&(e.timeoutSeconds=t.timeoutSeconds),e}var lU="ComponentProvider",Gx=new Map;function uU(t,e,n,a,r){return new g_(t,e,n,r.host,r.ssl,r.experimentalForceLongPolling,r.experimentalAutoDetectLongPolling,uR(r.experimentalLongPollingOptions),r.useFetchStreams,r.isUsingEmulator,a)}var cR="firestore.googleapis.com",jx=!0,Ip=class{constructor(e){if(e.host===void 0){if(e.ssl!==void 0)throw new X(F.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=cR,this.ssl=jx}else this.host=e.host,this.ssl=e.ssl??jx;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Y0;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<RV)throw new X(F.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Yx("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=uR(e.experimentalLongPollingOptions??{}),function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new X(F.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new X(F.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new X(F.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&function(a,r){return a.timeoutSeconds===r.timeoutSeconds}(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}},xc=class{constructor(e,n,a,r){this._authCredentials=e,this._appCheckCredentials=n,this._databaseId=a,this._app=r,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Ip({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new X(F.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new X(F.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Ip(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=function(a){if(!a)return new Kh;switch(a.type){case"firstParty":return new h_(a.sessionIndex||"0",a.iamToken||null,a.authTokenFactory||null);case"provider":return a.client;default:throw new X(F.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(n){let a=Gx.get(n);a&&(Y(lU,"Removing Datastore"),Gx.delete(n),a.terminate())}(this),Promise.resolve()}};function dR(t,e,n,a={}){t=Pc(t,xc);let r=Va(e),s=t._getSettings(),i={...s,emulatorOptions:t._getEmulatorOptions()},l=`${e}:${n}`;r&&(Do(`https://${l}`),Po("Firestore",!0)),s.host!==cR&&s.host!==l&&Nr("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");let u={...s,host:l,ssl:r,emulatorOptions:a};if(!Ia(u,i)&&(t._setSettings(u),a.mockUserToken)){let c,f;if(typeof a.mockUserToken=="string")c=a.mockUserToken,f=tn.MOCK_USER;else{c=th(a.mockUserToken,t._app?.options.projectId);let p=a.mockUserToken.sub||a.mockUserToken.user_id;if(!p)throw new X(F.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");f=new tn(p)}t._authCredentials=new d_(new jh(c,f))}}var va=class t{constructor(e,n,a){this.converter=n,this._query=a,this.type="query",this.firestore=e}withConverter(e){return new t(this.firestore,e,this._query)}},Vn=class t{constructor(e,n,a){this.converter=n,this._key=a,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new vi(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new t(this.firestore,e,this._key)}toJSON(){return{type:t._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,n,a){if(dl(n,t._jsonSchema))return new t(e,a||null,new ne(dt.fromString(n.referencePath)))}};Vn._jsonSchemaVersion="firestore/documentReference/1.0",Vn._jsonSchema={type:Ct("string",Vn._jsonSchemaVersion),referencePath:Ct("string")};var vi=class t extends va{constructor(e,n,a){super(e,n,US(a)),this._path=a,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){let e=this._path.popLast();return e.isEmpty()?null:new Vn(this.firestore,null,new ne(e))}withConverter(e){return new t(this.firestore,e,this._path)}};function Fc(t,e,...n){if(t=Zt(t),RN("collection","path",e),t instanceof xc){let a=dt.fromString(e,...n);return cx(a),new vi(t,null,a)}{if(!(t instanceof Vn||t instanceof vi))throw new X(F.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");let a=t._path.child(dt.fromString(e,...n));return cx(a),new vi(t.firestore,null,a)}}var Kx="AsyncQueue",_p=class{constructor(e=Promise.resolve()){this.Yu=[],this.ec=!1,this.tc=[],this.nc=null,this.rc=!1,this.sc=!1,this.oc=[],this.M_=new hp(this,"async_queue_retry"),this._c=()=>{let a=u_();a&&Y(Kx,"Visibility state changed to "+a.visibilityState),this.M_.w_()},this.ac=e;let n=u_();n&&typeof n.addEventListener=="function"&&n.addEventListener("visibilitychange",this._c)}get isShuttingDown(){return this.ec}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.uc(),this.cc(e)}enterRestrictedMode(e){if(!this.ec){this.ec=!0,this.sc=e||!1;let n=u_();n&&typeof n.removeEventListener=="function"&&n.removeEventListener("visibilitychange",this._c)}}enqueue(e){if(this.uc(),this.ec)return new Promise(()=>{});let n=new Pr;return this.cc(()=>this.ec&&this.sc?Promise.resolve():(e().then(n.resolve,n.reject),n.promise)).then(()=>n.promise)}enqueueRetryable(e){this.enqueueAndForget(()=>(this.Yu.push(e),this.lc()))}async lc(){if(this.Yu.length!==0){try{await this.Yu[0](),this.Yu.shift(),this.M_.reset()}catch(e){if(!fl(e))throw e;Y(Kx,"Operation failed with retryable error: "+e)}this.Yu.length>0&&this.M_.p_(()=>this.lc())}}cc(e){let n=this.ac.then(()=>(this.rc=!0,e().catch(a=>{throw this.nc=a,this.rc=!1,Mr("INTERNAL UNHANDLED ERROR: ",Wx(a)),a}).then(a=>(this.rc=!1,a))));return this.ac=n,n}enqueueAfterDelay(e,n,a){this.uc(),this.oc.indexOf(e)>-1&&(n=0);let r=IS.createAndSchedule(this,e,n,a,s=>this.hc(s));return this.tc.push(r),r}uc(){this.nc&&le(47125,{Pc:Wx(this.nc)})}verifyOperationInProgress(){}async Tc(){let e;do e=this.ac,await e;while(e!==this.ac)}Ic(e){for(let n of this.tc)if(n.timerId===e)return!0;return!1}Ec(e){return this.Tc().then(()=>{this.tc.sort((n,a)=>n.targetTimeMs-a.targetTimeMs);for(let n of this.tc)if(n.skipDelay(),e!=="all"&&n.timerId===e)break;return this.Tc()})}Rc(e){this.oc.push(e)}hc(e){let n=this.tc.indexOf(e);this.tc.splice(n,1)}};function Wx(t){let e=t.message||"";return t.stack&&(e=t.stack.includes(t.message)?t.stack:t.message+`
`+t.stack),e}var ll=class extends xc{constructor(e,n,a,r){super(e,n,a,r),this.type="firestore",this._queue=new _p,this._persistenceKey=r?.name||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){let e=this._firestoreClient.terminate();this._queue=new _p(e),this._firestoreClient=void 0,await e}}};function XS(t,e){let n=typeof t=="object"?t:Vo(),a=typeof t=="string"?t:e||ep,r=ui(n,"firestore").getImmediate({identifier:a});if(!r._initialized){let s=eh("firestore");s&&dR(r,...s)}return r}function QS(t){if(t._terminated)throw new X(F.FAILED_PRECONDITION,"The client has already been terminated.");return t._firestoreClient||cU(t),t._firestoreClient}function cU(t){let e=t._freezeSettings(),n=uU(t._databaseId,t._app?.options.appId||"",t._persistenceKey,t._app?.options.apiKey,e);t._componentsProvider||e.localCache?._offlineComponentProvider&&e.localCache?._onlineComponentProvider&&(t._componentsProvider={_offline:e.localCache._offlineComponentProvider,_online:e.localCache._onlineComponentProvider}),t._firestoreClient=new xS(t._authCredentials,t._appCheckCredentials,t._queue,n,t._componentsProvider&&function(r){let s=r?._online.build();return{_offline:r?._offline.build(s),_online:s}}(t._componentsProvider))}var Wa=class t{constructor(e){this._byteString=e}static fromBase64String(e){try{return new t(cn.fromBase64String(e))}catch(n){throw new X(F.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+n)}}static fromUint8Array(e){return new t(cn.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:t._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(dl(e,t._jsonSchema))return t.fromBase64String(e.bytes)}};Wa._jsonSchemaVersion="firestore/bytes/1.0",Wa._jsonSchema={type:Ct("string",Wa._jsonSchemaVersion),bytes:Ct("string")};var ul=class{constructor(...e){for(let n=0;n<e.length;++n)if(e[n].length===0)throw new X(F.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Qn(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}};var Rc=class{constructor(e){this._methodName=e}};var Or=class t{constructor(e,n){if(!isFinite(e)||e<-90||e>90)throw new X(F.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(n)||n<-180||n>180)throw new X(F.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+n);this._lat=e,this._long=n}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return Ce(this._lat,e._lat)||Ce(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:t._jsonSchemaVersion}}static fromJSON(e){if(dl(e,t._jsonSchema))return new t(e.latitude,e.longitude)}};Or._jsonSchemaVersion="firestore/geoPoint/1.0",Or._jsonSchema={type:Ct("string",Or._jsonSchemaVersion),latitude:Ct("number"),longitude:Ct("number")};var Xa=class t{constructor(e){this._values=(e||[]).map(n=>n)}toArray(){return this._values.map(e=>e)}isEqual(e){return function(a,r){if(a.length!==r.length)return!1;for(let s=0;s<a.length;++s)if(a[s]!==r[s])return!1;return!0}(this._values,e._values)}toJSON(){return{type:t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(dl(e,t._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every(n=>typeof n=="number"))return new t(e.vectorValues);throw new X(F.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}};Xa._jsonSchemaVersion="firestore/vectorValue/1.0",Xa._jsonSchema={type:Ct("string",Xa._jsonSchemaVersion),vectorValues:Ct("object")};var dU=/^__.*__$/;function fR(t){switch(t){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw le(40011,{dataSource:t})}}var RS=class t{constructor(e,n,a,r,s,i){this.settings=e,this.databaseId=n,this.serializer=a,this.ignoreUndefinedProperties=r,s===void 0&&this.validatePath(),this.fieldTransforms=s||[],this.fieldMask=i||[]}get path(){return this.settings.path}get dataSource(){return this.settings.dataSource}contextWith(e){return new t({...this.settings,...e},this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}childContextForField(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePathSegment(e),a}childContextForFieldPath(e){let n=this.path?.child(e),a=this.contextWith({path:n,arrayElement:!1});return a.validatePath(),a}childContextForArray(e){return this.contextWith({path:void 0,arrayElement:!0})}createError(e){return Sp(e,this.settings.methodName,this.settings.hasConverter||!1,this.path,this.settings.targetDoc)}contains(e){return this.fieldMask.find(n=>e.isPrefixOf(n))!==void 0||this.fieldTransforms.find(n=>e.isPrefixOf(n.field))!==void 0}validatePath(){if(this.path)for(let e=0;e<this.path.length;e++)this.validatePathSegment(this.path.get(e))}validatePathSegment(e){if(e.length===0)throw this.createError("Document fields must not be empty");if(fR(this.dataSource)&&dU.test(e))throw this.createError('Document fields cannot begin and end with "__"')}},kS=class{constructor(e,n,a){this.databaseId=e,this.ignoreUndefinedProperties=n,this.serializer=a||Nc(e)}createContext(e,n,a,r=!1){return new RS({dataSource:e,methodName:n,targetDoc:a,path:Qn.emptyPath(),arrayElement:!1,hasConverter:r},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}};function YS(t){let e=t._freezeSettings(),n=Nc(t._databaseId);return new kS(t._databaseId,!!e.ignoreUndefinedProperties,n)}function $S(t,e,n,a=!1){return JS(n,t.createContext(a?4:3,e))}function JS(t,e){if(hR(t=Zt(t)))return hU("Unsupported field value:",e,t),fU(t,e);if(t instanceof Rc)return function(a,r){if(!fR(r.dataSource))throw r.createError(`${a._methodName}() can only be used with update() and set()`);if(!r.path)throw r.createError(`${a._methodName}() is not currently supported inside arrays`);let s=a._toFieldTransform(r);s&&r.fieldTransforms.push(s)}(t,e),null;if(t===void 0&&e.ignoreUndefinedProperties)return null;if(e.path&&e.fieldMask.push(e.path),t instanceof Array){if(e.settings.arrayElement&&e.dataSource!==4)throw e.createError("Nested arrays are not supported");return function(a,r){let s=[],i=0;for(let l of a){let u=JS(l,r.childContextForArray(i));u==null&&(u={nullValue:"NULL_VALUE"}),s.push(u),i++}return{arrayValue:{values:s}}}(t,e)}return function(a,r){if((a=Zt(a))===null)return{nullValue:"NULL_VALUE"};if(typeof a=="number")return uV(r.serializer,a);if(typeof a=="boolean")return{booleanValue:a};if(typeof a=="string")return{stringValue:a};if(a instanceof Date){let s=Nt.fromDate(a);return{timestampValue:N_(r.serializer,s)}}if(a instanceof Nt){let s=new Nt(a.seconds,1e3*Math.floor(a.nanoseconds/1e3));return{timestampValue:N_(r.serializer,s)}}if(a instanceof Or)return{geoPointValue:{latitude:a.latitude,longitude:a.longitude}};if(a instanceof Wa)return{bytesValue:B0(r.serializer,a._byteString)};if(a instanceof Vn){let s=r.databaseId,i=a.firestore._databaseId;if(!i.isEqual(s))throw r.createError(`Document reference is for database ${i.projectId}/${i.database} but should be for database ${s.projectId}/${s.database}`);return{referenceValue:q0(a.firestore._databaseId||r.databaseId,a._key.path)}}if(a instanceof Xa)return function(i,l){let u=i instanceof Xa?i.toArray():i;return{mapValue:{fields:{[PS]:{stringValue:OS},[Zo]:{arrayValue:{values:u.map(f=>{if(typeof f!="number")throw l.createError("VectorValues must only contain numeric values.");return FS(l.serializer,f)})}}}}}}(a,r);if(X0(a))return a._toProto(r.serializer);throw r.createError(`Unsupported field value: ${Dc(a)}`)}(t,e)}function fU(t,e){let n={};return h0(t)?e.path&&e.path.length>0&&e.fieldMask.push(e.path):hl(t,(a,r)=>{let s=JS(r,e.childContextForField(a));s!=null&&(n[a]=s)}),{mapValue:{fields:n}}}function hR(t){return!(typeof t!="object"||t===null||t instanceof Array||t instanceof Date||t instanceof Nt||t instanceof Or||t instanceof Wa||t instanceof Vn||t instanceof Rc||t instanceof Xa||X0(t))}function hU(t,e,n){if(!hR(n)||!$x(n)){let a=Dc(n);throw a==="an object"?e.createError(t+" a custom object"):e.createError(t+" "+a)}}function Bc(t,e,n){if((e=Zt(e))instanceof ul)return e._internalPath;if(typeof e=="string")return pR(t,e);throw Sp("Field path arguments must be of type string or ",t,!1,void 0,n)}var pU=new RegExp("[~\\*/\\[\\]]");function pR(t,e,n){if(e.search(pU)>=0)throw Sp(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,t,!1,void 0,n);try{return new ul(...e.split("."))._internalPath}catch{throw Sp(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,t,!1,void 0,n)}}function Sp(t,e,n,a,r){let s=a&&!a.isEmpty(),i=r!==void 0,l=`Function ${e}() called with invalid data`;n&&(l+=" (via `toFirestore()`)"),l+=". ";let u="";return(s||i)&&(u+=" (found",s&&(u+=` in field ${a}`),i&&(u+=` in document ${r}`),u+=")"),new X(F.INVALID_ARGUMENT,l+t+u)}var kc=class{convertValue(e,n="none"){switch(ks(e)){case 0:return null;case 1:return e.booleanValue;case 2:return ct(e.integerValue||e.doubleValue);case 3:return this.convertTimestamp(e.timestampValue);case 4:return this.convertServerTimestamp(e,n);case 5:return e.stringValue;case 6:return this.convertBytes(Ur(e.bytesValue));case 7:return this.convertReference(e.referenceValue);case 8:return this.convertGeoPoint(e.geoPointValue);case 9:return this.convertArray(e.arrayValue,n);case 11:return this.convertObject(e.mapValue,n);case 10:return this.convertVectorValue(e.mapValue);default:throw le(62114,{value:e})}}convertObject(e,n){return this.convertObjectMap(e.fields,n)}convertObjectMap(e,n="none"){let a={};return hl(e,(r,s)=>{a[r]=this.convertValue(s,n)}),a}convertVectorValue(e){let n=e.fields?.[Zo].arrayValue?.values?.map(a=>ct(a.doubleValue));return new Xa(n)}convertGeoPoint(e){return new Or(ct(e.latitude),ct(e.longitude))}convertArray(e,n){return(e.values||[]).map(a=>this.convertValue(a,n))}convertServerTimestamp(e,n){switch(n){case"previous":let a=bp(e);return a==null?null:this.convertValue(a,n);case"estimate":return this.convertTimestamp(gc(e));default:return null}}convertTimestamp(e){let n=Vr(e);return new Nt(n.seconds,n.nanos)}convertDocumentKey(e,n){let a=dt.fromString(e);ht(W0(a),9688,{name:e});let r=new yc(a.get(1),a.get(3)),s=new ne(a.popFirst(5));return r.isEqual(n)||Mr(`Document ${s} contains a document reference within a different database (${r.projectId}/${r.database}) which is not supported. It will be treated as a reference in the current database (${n.projectId}/${n.database}) instead.`),s}};var vp=class extends kc{constructor(e){super(),this.firestore=e}convertBytes(e){return new Wa(e)}convertReference(e){let n=this.convertDocumentKey(e,this.firestore._databaseId);return new Vn(this.firestore,null,n)}};var mR="@firebase/firestore",gR="4.12.0";var qc=class{constructor(e,n,a,r,s){this._firestore=e,this._userDataWriter=n,this._key=a,this._document=r,this._converter=s}get id(){return this._key.path.lastSegment()}get ref(){return new Vn(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){let e=new ZS(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}_fieldsProto(){return this._document?.data.clone().value.mapValue.fields??void 0}get(e){if(this._document){let n=this._document.data.field(Bc("DocumentSnapshot.get",e));if(n!==null)return this._userDataWriter.convertValue(n)}}},ZS=class extends qc{data(){return super.data()}};function IU(t){if(t.limitType==="L"&&t.explicitOrderBy.length===0)throw new X(F.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}var zc=class{},_l=class extends zc{};function Hc(t,e,...n){let a=[];e instanceof zc&&a.push(e),a=a.concat(n),function(s){let i=s.filter(u=>u instanceof ev).length,l=s.filter(u=>u instanceof Rp).length;if(i>1||i>0&&l>0)throw new X(F.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(a);for(let r of a)t=r._apply(t);return t}var Rp=class t extends _l{constructor(e,n,a){super(),this._field=e,this._op=n,this._value=a,this.type="where"}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=this._parse(e);return vR(e._query,n),new va(e.firestore,e.converter,Cp(e._query,n))}_parse(e){let n=YS(e.firestore);return function(s,i,l,u,c,f,p){let m;if(c.isKeyField()){if(f==="array-contains"||f==="array-contains-any")throw new X(F.INVALID_ARGUMENT,`Invalid Query. You can't perform '${f}' queries on documentId().`);if(f==="in"||f==="not-in"){IR(p,f);let R=[];for(let D of p)R.push(yR(u,s,D));m={arrayValue:{values:R}}}else m=yR(u,s,p)}else f!=="in"&&f!=="not-in"&&f!=="array-contains-any"||IR(p,f),m=$S(l,i,p,f==="in"||f==="not-in");return wt.create(c,f,m)}(e._query,"where",n,e.firestore._databaseId,this._field,this._op,this._value)}};function Gc(t,e,n){let a=e,r=Bc("where",t);return Rp._create(r,a,n)}var ev=class t extends zc{constructor(e,n){super(),this.type=e,this._queryConstraints=n}static _create(e,n){return new t(e,n)}_parse(e){let n=this._queryConstraints.map(a=>a._parse(e)).filter(a=>a.getFilters().length>0);return n.length===1?n[0]:da.create(n,this._getOperator())}_apply(e){let n=this._parse(e);return n.getFilters().length===0?e:(function(r,s){let i=r,l=s.getFlattenedFilters();for(let u of l)vR(i,u),i=Cp(i,u)}(e._query,n),new va(e.firestore,e.converter,Cp(e._query,n)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}};var tv=class t extends _l{constructor(e,n){super(),this._field=e,this._direction=n,this.type="orderBy"}static _create(e,n){return new t(e,n)}_apply(e){let n=function(r,s,i){if(r.startAt!==null)throw new X(F.INVALID_ARGUMENT,"Invalid query. You must not call startAt() or startAfter() before calling orderBy().");if(r.endAt!==null)throw new X(F.INVALID_ARGUMENT,"Invalid query. You must not call endAt() or endBefore() before calling orderBy().");return new Ds(s,i)}(e._query,this._field,this._direction);return new va(e.firestore,e.converter,L0(e._query,n))}};function jc(t,e="asc"){let n=e,a=Bc("orderBy",t);return tv._create(a,n)}var nv=class t extends _l{constructor(e,n,a){super(),this.type=e,this._limit=n,this._limitType=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){return new va(e.firestore,e.converter,_c(e._query,this._limit,this._limitType))}};function Kc(t){return Jx("limit",t),nv._create("limit",t,"F")}var av=class t extends _l{constructor(e,n,a){super(),this.type=e,this._docOrFields=n,this._inclusive=a}static _create(e,n,a){return new t(e,n,a)}_apply(e){let n=_U(e,this.type,this._docOrFields,this._inclusive);return new va(e.firestore,e.converter,A0(e._query,n))}};function SR(...t){return av._create("startAfter",t,!1)}function _U(t,e,n,a){if(n[0]=Zt(n[0]),n[0]instanceof qc)return function(s,i,l,u,c){if(!u)throw new X(F.NOT_FOUND,`Can't use a DocumentSnapshot that doesn't exist for ${l}().`);let f=[];for(let p of Si(s))if(p.field.isKeyField())f.push(Mc(i,u.key));else{let m=u.data.field(p.field);if(Oc(m))throw new X(F.INVALID_ARGUMENT,'Invalid query. You are trying to start or end a query using a document for which the field "'+p.field+'" is an uncommitted server timestamp. (Since the value of this field is unknown, you cannot start/end a query with it.)');if(m===null){let S=p.field.canonicalString();throw new X(F.INVALID_ARGUMENT,`Invalid query. You are trying to start or end a query using a document for which the field '${S}' (used as the orderBy) does not exist.`)}f.push(m)}return new Fr(f,c)}(t._query,t.firestore._databaseId,e,n[0]._document,a);{let r=YS(t.firestore);return function(i,l,u,c,f,p){let m=i.explicitOrderBy;if(f.length>m.length)throw new X(F.INVALID_ARGUMENT,`Too many arguments provided to ${c}(). The number of arguments must be less than or equal to the number of orderBy() clauses`);let S=[];for(let R=0;R<f.length;R++){let D=f[R];if(m[R].field.isKeyField()){if(typeof D!="string")throw new X(F.INVALID_ARGUMENT,`Invalid query. Expected a string for document ID in ${c}(), but got a ${typeof D}`);if(!wp(i)&&D.indexOf("/")!==-1)throw new X(F.INVALID_ARGUMENT,`Invalid query. When querying a collection and ordering by documentId(), the value passed to ${c}() must be a plain document ID, but '${D}' contains a slash.`);let L=i.path.child(dt.fromString(D));if(!ne.isDocumentKey(L))throw new X(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group and ordering by documentId(), the value passed to ${c}() must result in a valid document path, but '${L}' is not because it contains an odd number of segments.`);let E=new ne(L);S.push(Mc(l,E))}else{let L=$S(u,c,D);S.push(L)}}return new Fr(S,p)}(t._query,t.firestore._databaseId,r,e,n,a)}}function yR(t,e,n){if(typeof(n=Zt(n))=="string"){if(n==="")throw new X(F.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!wp(e)&&n.indexOf("/")!==-1)throw new X(F.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${n}' contains a '/' character.`);let a=e.path.child(dt.fromString(n));if(!ne.isDocumentKey(a))throw new X(F.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${a}' is not because it has an odd number of segments (${a.length}).`);return Mc(t,new ne(a))}if(n instanceof Vn)return Mc(t,n._key);throw new X(F.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Dc(n)}.`)}function IR(t,e){if(!Array.isArray(t)||t.length===0)throw new X(F.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${e.toString()}' filters.`)}function vR(t,e){let n=function(r,s){for(let i of r)for(let l of i.getFlattenedFilters())if(s.indexOf(l.op)>=0)return l.op;return null}(t.filters,function(r){switch(r){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(e.op));if(n!==null)throw n===e.op?new X(F.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${e.op.toString()}' filter.`):new X(F.INVALID_ARGUMENT,`Invalid query. You cannot use '${e.op.toString()}' filters with '${n.toString()}' filters.`)}var ml=class{constructor(e,n){this.hasPendingWrites=e,this.fromCache=n}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}},gl=class t extends qc{constructor(e,n,a,r,s,i){super(e,n,a,r,i),this._firestore=e,this._firestoreImpl=e,this.metadata=s}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){let n=new yl(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(n,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,n={}){if(this._document){let a=this._document.data.field(Bc("DocumentSnapshot.get",e));if(a!==null)return this._userDataWriter.convertValue(a,n.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new X(F.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e=this._document,n={};return n.type=t._jsonSchemaVersion,n.bundle="",n.bundleSource="DocumentSnapshot",n.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?n:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),n.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),n)}};gl._jsonSchemaVersion="firestore/documentSnapshot/1.0",gl._jsonSchema={type:Ct("string",gl._jsonSchemaVersion),bundleSource:Ct("string","DocumentSnapshot"),bundleName:Ct("string"),bundle:Ct("string")};var yl=class extends gl{data(e={}){return super.data(e)}},Il=class t{constructor(e,n,a,r){this._firestore=e,this._userDataWriter=n,this._snapshot=r,this.metadata=new ml(r.hasPendingWrites,r.fromCache),this.query=a}get docs(){let e=[];return this.forEach(n=>e.push(n)),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,n){this._snapshot.docs.forEach(a=>{e.call(n,new yl(this._firestore,this._userDataWriter,a.key,a,new ml(this._snapshot.mutatedKeys.has(a.key),this._snapshot.fromCache),this.query.converter))})}docChanges(e={}){let n=!!e.includeMetadataChanges;if(n&&this._snapshot.excludesMetadataChanges)throw new X(F.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===n||(this._cachedChanges=function(r,s){if(r._snapshot.oldDocs.isEmpty()){let i=0;return r._snapshot.docChanges.map(l=>{let u=new yl(r._firestore,r._userDataWriter,l.doc.key,l.doc,new ml(r._snapshot.mutatedKeys.has(l.doc.key),r._snapshot.fromCache),r.query.converter);return l.doc,{type:"added",doc:u,oldIndex:-1,newIndex:i++}})}{let i=r._snapshot.oldDocs;return r._snapshot.docChanges.filter(l=>s||l.type!==3).map(l=>{let u=new yl(r._firestore,r._userDataWriter,l.doc.key,l.doc,new ml(r._snapshot.mutatedKeys.has(l.doc.key),r._snapshot.fromCache),r.query.converter),c=-1,f=-1;return l.type!==0&&(c=i.indexOf(l.doc.key),i=i.delete(l.doc.key)),l.type!==1&&(i=i.add(l.doc),f=i.indexOf(l.doc.key)),{type:SU(l.type),doc:u,oldIndex:c,newIndex:f}})}}(this,n),this._cachedChangesIncludeMetadataChanges=n),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new X(F.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");let e={};e.type=t._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Yo.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;let n=[],a=[],r=[];return this.docs.forEach(s=>{s._document!==null&&(n.push(s._document),a.push(this._userDataWriter.convertObjectMap(s._document.data.value.mapValue.fields,"previous")),r.push(s.ref.path))}),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}};function SU(t){switch(t){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return le(61501,{type:t})}}Il._jsonSchemaVersion="firestore/querySnapshot/1.0",Il._jsonSchema={type:Ct("string",Il._jsonSchemaVersion),bundleSource:Ct("string","QuerySnapshot"),bundleName:Ct("string"),bundle:Ct("string")};function Dp(t){t=Pc(t,va);let e=Pc(t.firestore,ll),n=QS(e),a=new vp(e);return IU(t._query),lR(n,t._query).then(r=>new Il(e,a,t,r))}(function(e,n=!0){Xx(Ba),Fa(new On("firestore",(a,{instanceIdentifier:r,options:s})=>{let i=a.getProvider("app").getImmediate(),l=new ll(new Wh(a.getProvider("auth-internal")),new Qh(i,a.getProvider("app-check-internal")),I0(i,r),i);return s={useFetchStreams:n,...s},l._setSettings(s),l},"PUBLIC").setMultipleInstances(!0)),Mn(mR,gR,e),Mn(mR,gR,"esm2020")})();var LR="firebasestorage.googleapis.com",vU="storageBucket",TU=2*60*1e3,EU=10*60*1e3;var Ya=class t extends En{constructor(e,n,a=0){super(sv(e),`Firebase Storage: ${n} (${sv(e)})`),this.status_=a,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,t.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return sv(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}},$a;(function(t){t.UNKNOWN="unknown",t.OBJECT_NOT_FOUND="object-not-found",t.BUCKET_NOT_FOUND="bucket-not-found",t.PROJECT_NOT_FOUND="project-not-found",t.QUOTA_EXCEEDED="quota-exceeded",t.UNAUTHENTICATED="unauthenticated",t.UNAUTHORIZED="unauthorized",t.UNAUTHORIZED_APP="unauthorized-app",t.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",t.INVALID_CHECKSUM="invalid-checksum",t.CANCELED="canceled",t.INVALID_EVENT_NAME="invalid-event-name",t.INVALID_URL="invalid-url",t.INVALID_DEFAULT_BUCKET="invalid-default-bucket",t.NO_DEFAULT_BUCKET="no-default-bucket",t.CANNOT_SLICE_BLOB="cannot-slice-blob",t.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",t.NO_DOWNLOAD_URL="no-download-url",t.INVALID_ARGUMENT="invalid-argument",t.INVALID_ARGUMENT_COUNT="invalid-argument-count",t.APP_DELETED="app-deleted",t.INVALID_ROOT_OPERATION="invalid-root-operation",t.INVALID_FORMAT="invalid-format",t.INTERNAL_ERROR="internal-error",t.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})($a||($a={}));function sv(t){return"storage/"+t}function bU(){let t="An unknown error occurred, please check the error payload for server response.";return new Ya($a.UNKNOWN,t)}function wU(){return new Ya($a.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function CU(){return new Ya($a.CANCELED,"User canceled the upload/download.")}function LU(t){return new Ya($a.INVALID_URL,"Invalid URL '"+t+"'.")}function AU(t){return new Ya($a.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+t+"'.")}function TR(t){return new Ya($a.INVALID_ARGUMENT,t)}function AR(){return new Ya($a.APP_DELETED,"The Firebase app was deleted.")}function xU(t){return new Ya($a.INVALID_ROOT_OPERATION,"The operation '"+t+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}var zr=class t{constructor(e,n){this.bucket=e,this.path_=n}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){let e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,n){let a;try{a=t.makeFromUrl(e,n)}catch{return new t(e,"")}if(a.path==="")return a;throw AU(e)}static makeFromUrl(e,n){let a=null,r="([A-Za-z0-9.\\-_]+)";function s(x){x.path.charAt(x.path.length-1)==="/"&&(x.path_=x.path_.slice(0,-1))}let i="(/(.*))?$",l=new RegExp("^gs://"+r+i,"i"),u={bucket:1,path:3};function c(x){x.path_=decodeURIComponent(x.path)}let f="v[A-Za-z0-9_]+",p=n.replace(/[.]/g,"\\."),m="(/([^?#]*).*)?$",S=new RegExp(`^https?://${p}/${f}/b/${r}/o${m}`,"i"),R={bucket:1,path:3},D=n===LR?"(?:storage.googleapis.com|storage.cloud.google.com)":n,L="([^?#]*)",E=new RegExp(`^https?://${D}/${r}/${L}`,"i"),C=[{regex:l,indices:u,postModify:s},{regex:S,indices:R,postModify:c},{regex:E,indices:{bucket:1,path:2},postModify:c}];for(let x=0;x<C.length;x++){let H=C[x],G=H.regex.exec(e);if(G){let _=G[H.indices.bucket],y=G[H.indices.path];y||(y=""),a=new t(_,y),H.postModify(a);break}}if(a==null)throw LU(e);return a}},iv=class{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}};function RU(t,e,n){let a=1,r=null,s=null,i=!1,l=0;function u(){return l===2}let c=!1;function f(...L){c||(c=!0,e.apply(null,L))}function p(L){r=setTimeout(()=>{r=null,t(S,u())},L)}function m(){s&&clearTimeout(s)}function S(L,...E){if(c){m();return}if(L){m(),f.call(null,L,...E);return}if(u()||i){m(),f.call(null,L,...E);return}a<64&&(a*=2);let C;l===1?(l=2,C=0):C=(a+Math.random())*1e3,p(C)}let R=!1;function D(L){R||(R=!0,m(),!c&&(r!==null?(L||(l=2),clearTimeout(r),p(0)):L||(l=1)))}return p(0),s=setTimeout(()=>{i=!0,D(!0)},n),D}function kU(t){t(!1)}function DU(t){return t!==void 0}function ER(t,e,n,a){if(a<e)throw TR(`Invalid value for '${t}'. Expected ${e} or greater.`);if(a>n)throw TR(`Invalid value for '${t}'. Expected ${n} or less.`)}function PU(t){let e=encodeURIComponent,n="?";for(let a in t)if(t.hasOwnProperty(a)){let r=e(a)+"="+e(t[a]);n=n+r+"&"}return n=n.slice(0,-1),n}var Pp;(function(t){t[t.NO_ERROR=0]="NO_ERROR",t[t.NETWORK_ERROR=1]="NETWORK_ERROR",t[t.ABORT=2]="ABORT"})(Pp||(Pp={}));function OU(t,e){let n=t>=500&&t<600,r=[408,429].indexOf(t)!==-1,s=e.indexOf(t)!==-1;return n||r||s}var ov=class{constructor(e,n,a,r,s,i,l,u,c,f,p,m=!0,S=!1){this.url_=e,this.method_=n,this.headers_=a,this.body_=r,this.successCodes_=s,this.additionalRetryCodes_=i,this.callback_=l,this.errorCallback_=u,this.timeout_=c,this.progressCallback_=f,this.connectionFactory_=p,this.retry=m,this.isUsingEmulator=S,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((R,D)=>{this.resolve_=R,this.reject_=D,this.start_()})}start_(){let e=(a,r)=>{if(r){a(!1,new Sl(!1,null,!0));return}let s=this.connectionFactory_();this.pendingConnection_=s;let i=l=>{let u=l.loaded,c=l.lengthComputable?l.total:-1;this.progressCallback_!==null&&this.progressCallback_(u,c)};this.progressCallback_!==null&&s.addUploadProgressListener(i),s.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&s.removeUploadProgressListener(i),this.pendingConnection_=null;let l=s.getErrorCode()===Pp.NO_ERROR,u=s.getStatus();if(!l||OU(u,this.additionalRetryCodes_)&&this.retry){let f=s.getErrorCode()===Pp.ABORT;a(!1,new Sl(!1,null,f));return}let c=this.successCodes_.indexOf(u)!==-1;a(!0,new Sl(c,s))})},n=(a,r)=>{let s=this.resolve_,i=this.reject_,l=r.connection;if(r.wasSuccessCode)try{let u=this.callback_(l,l.getResponse());DU(u)?s(u):s()}catch(u){i(u)}else if(l!==null){let u=bU();u.serverResponse=l.getErrorText(),this.errorCallback_?i(this.errorCallback_(l,u)):i(u)}else if(r.canceled){let u=this.appDelete_?AR():CU();i(u)}else{let u=wU();i(u)}};this.canceled_?n(!1,new Sl(!1,null,!0)):this.backoffId_=RU(e,n,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&kU(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}},Sl=class{constructor(e,n,a){this.wasSuccessCode=e,this.connection=n,this.canceled=!!a}};function MU(t,e){e!==null&&e.length>0&&(t.Authorization="Firebase "+e)}function NU(t,e){t["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function VU(t,e){e&&(t["X-Firebase-GMPID"]=e)}function UU(t,e){e!==null&&(t["X-Firebase-AppCheck"]=e)}function FU(t,e,n,a,r,s,i=!0,l=!1){let u=PU(t.urlParams),c=t.url+u,f=Object.assign({},t.headers);return VU(f,e),MU(f,n),NU(f,s),UU(f,a),new ov(c,t.method,f,t.body,t.successCodes,t.additionalRetryCodes,t.handler,t.errorHandler,t.timeout,t.progressCallback,r,i,l)}function BU(t){if(t.length===0)return null;let e=t.lastIndexOf("/");return e===-1?"":t.slice(0,e)}function qU(t){let e=t.lastIndexOf("/",t.length-2);return e===-1?t:t.slice(e+1)}var V6=256*1024;var lv=class t{constructor(e,n){this._service=e,n instanceof zr?this._location=n:this._location=zr.makeFromUrl(n,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,n){return new t(e,n)}get root(){let e=new zr(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return qU(this._location.path)}get storage(){return this._service}get parent(){let e=BU(this._location.path);if(e===null)return null;let n=new zr(this._location.bucket,e);return new t(this._service,n)}_throwIfRoot(e){if(this._location.path==="")throw xU(e)}};function bR(t,e){let n=e?.[vU];return n==null?null:zr.makeFromBucketSpec(n,t)}function zU(t,e,n,a={}){t.host=`${e}:${n}`;let r=Va(e);r&&(Do(`https://${t.host}/b`),Po("Storage",!0)),t._isUsingEmulator=!0,t._protocol=r?"https":"http";let{mockUserToken:s}=a;s&&(t._overrideAuthToken=typeof s=="string"?s:th(s,t.app.options.projectId))}var uv=class{constructor(e,n,a,r,s,i=!1){this.app=e,this._authProvider=n,this._appCheckProvider=a,this._url=r,this._firebaseVersion=s,this._isUsingEmulator=i,this._bucket=null,this._host=LR,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=TU,this._maxUploadRetryTime=EU,this._requests=new Set,r!=null?this._bucket=zr.makeFromBucketSpec(r,this._host):this._bucket=bR(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=zr.makeFromBucketSpec(this._url,e):this._bucket=bR(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){ER("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){ER("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;let e=this._authProvider.getImmediate({optional:!0});if(e){let n=await e.getToken();if(n!==null)return n.accessToken}return null}async _getAppCheckToken(){if(Nn(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;let e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new lv(this,e)}_makeRequest(e,n,a,r,s=!0){if(this._deleted)return new iv(AR());{let i=FU(e,this._appId,a,r,n,this._firebaseVersion,s,this._isUsingEmulator);return this._requests.add(i),i.getPromise().then(()=>this._requests.delete(i),()=>this._requests.delete(i)),i}}async makeRequestWithTokens(e,n){let[a,r]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,n,a,r).getPromise()}},wR="@firebase/storage",CR="0.14.1";var xR="storage";function RR(t=Vo(),e){t=Zt(t);let a=ui(t,xR).getImmediate({identifier:e}),r=eh("storage");return r&&HU(a,...r),a}function HU(t,e,n,a={}){zU(t,e,n,a)}function GU(t,{instanceIdentifier:e}){let n=t.getProvider("app").getImmediate(),a=t.getProvider("auth-internal"),r=t.getProvider("app-check-internal");return new uv(n,a,r,e,Ba)}function jU(){Fa(new On(xR,GU,"PUBLIC").setMultipleInstances(!0)),Mn(wR,CR,""),Mn(wR,CR,"esm2020")}jU();var kR={apiKey:"AIzaSyBgQxRYAksD35D6m1OEPjSnfiOLxUABqnM",authDomain:"echly-b74cc.firebaseapp.com",projectId:"echly-b74cc",storageBucket:"echly-b74cc.firebasestorage.app",messagingSenderId:"609478020649",appId:"1:609478020649:web:54cd1ab0dc2b8277131638",measurementId:"G-Q0C7DP8QVR"};var cv=vI(kR),DR=JI(cv),Op=XS(cv),W6=RR(cv);var dv=null,fv=null;async function KU(t){let e=Date.now();if(dv&&fv&&e<fv)return dv;let n=await t.getIdToken(),a=await t.getIdTokenResult();return dv=n,fv=a.expirationTime?new Date(a.expirationTime).getTime()-6e4:e+6e4,n}function WU(t){let e=typeof window<"u"&&window.__ECHLY_API_BASE__;if(!e)return t;let n=typeof t=="string"?t:t instanceof URL?t.pathname+t.search:t instanceof Request?t.url:String(t);return n.startsWith("http")?t:e+n}var XU=25e3;async function PR(t,e={}){let n=DR.currentUser;if(!n)throw new Error("User not authenticated");let a=await KU(n),r=new Headers(e.headers||{});r.set("Authorization",`Bearer ${a}`);let s=e.timeout!==void 0?e.timeout:XU,{timeout:i,...l}=e,u=l.signal,c=null,f=null;s>0&&(c=new AbortController,f=setTimeout(()=>{console.warn("[authFetch] Request exceeded timeout threshold:",s,"ms"),c.abort()},s),u=l.signal?(()=>{let p=new AbortController;return l.signal?.addEventListener("abort",()=>{clearTimeout(f),p.abort()}),c.signal.addEventListener("abort",()=>p.abort()),p.signal})():c.signal);try{let p=await fetch(WU(t),{...l,headers:r,signal:u??l.signal});return f&&clearTimeout(f),p}catch(p){throw f&&clearTimeout(f),p instanceof Error&&p.name==="AbortError"&&c?.signal.aborted?new Error("Request timed out"):p}}var hv=null;function QU(){if(typeof window>"u")return null;if(!hv)try{hv=new AudioContext}catch{return null}return hv}function OR(){let t=QU();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(400,e+.02),n.type="sine",a.gain.setValueAtTime(.08,e),a.gain.exponentialRampToValueAtTime(.001,e+.05),n.start(e),n.stop(e+.05)}var B=pe(Cn());var YU=typeof process<"u"&&!1;function Mp(t,e){if(YU&&(typeof t!="number"||!Number.isFinite(t)||t<1))throw new Error(`[querySafety] ${e}: query limit is required and must be a positive number, got: ${t}`)}var ZU=20;function eF(t){let e=t.data(),n=e.status??"open",a=e.isResolved===!0||n==="resolved"||n==="done",r=n==="skipped";return{id:t.id,sessionId:e.sessionId,userId:e.userId,title:e.title,description:e.description,suggestion:e.suggestion??"",type:e.type,isResolved:a,isSkipped:r||void 0,createdAt:e.createdAt??null,contextSummary:e.contextSummary??null,actionSteps:e.actionSteps??e.actionItems??null,suggestedTags:e.suggestedTags??null,url:e.url??null,viewportWidth:e.viewportWidth??null,viewportHeight:e.viewportHeight??null,userAgent:e.userAgent??null,clientTimestamp:e.clientTimestamp??null,screenshotUrl:e.screenshotUrl??null,clarityScore:e.clarityScore??null,clarityStatus:e.clarityStatus??null,clarityIssues:e.clarityIssues??null,clarityConfidence:e.clarityConfidence??null,clarityCheckedAt:e.clarityCheckedAt??null}}async function UR(t,e=ZU,n){Mp(e,"getSessionFeedbackPageRepo");let a=Fc(Op,"feedback"),r=n!=null?Hc(a,Gc("sessionId","==",t),jc("createdAt","desc"),Kc(e),SR(n)):Hc(a,Gc("sessionId","==",t),jc("createdAt","desc"),Kc(e)),s=Date.now(),i=await Dp(r),l=Date.now()-s;console.log(`[FIRESTORE] query duration: ${l}ms`);let u=i.docs,c=u.map(eF),f=u.length>0?u[u.length-1]:null,p=u.length===e;return{feedback:c,lastVisibleDoc:f,hasMore:p}}async function FR(t,e=50){let{feedback:n}=await UR(t,e);return n}var BR=new Set(["script","style","noscript","iframe","svg"]);function Vt(t){if(!t)return!1;let e=t instanceof Element?t:t.parentElement;if(!e)return!1;let n=t instanceof Element?t:e;if(n.id&&String(n.id).toLowerCase().startsWith("echly"))return!0;let a=n.className;if(a&&typeof a=="string"&&a.includes("echly")||n instanceof Element&&n.getAttribute?.("data-echly-ui")!=null||n instanceof Element&&n.closest?.("[data-echly-ui]"))return!0;let r=n.getRootNode?.();return!!(r&&r instanceof ShadowRoot&&Vt(r.host))}function Np(t){if(!(t instanceof HTMLElement)||t.getAttribute?.("aria-hidden")==="true")return!0;let e=t.ownerDocument?.defaultView?.getComputedStyle?.(t);return e?e.display==="none"||e.visibility==="hidden":!1}function nF(t){if(!t?.getRootNode||Vt(t))return null;let e=t.ownerDocument;if(!e||t===e.body)return"body";let n=[],a=t;for(;a&&a!==e.body&&n.length<12;){let s=a.tagName.toLowerCase(),i=a.id?.trim();if(i&&/^[a-zA-Z][\w-]*$/.test(i)&&!i.includes(" ")){s+=`#${i}`,n.unshift(s);break}let l=a.getAttribute?.("class")?.trim();if(l){let p=l.split(/\s+/).find(m=>m.length>0&&/^[a-zA-Z_][\w-]*$/.test(m));p&&(s+=`.${p}`)}let u=a.parentElement;if(!u)break;let c=u.children,f=0;for(let p=0;p<c.length;p++)if(c[p]===a){f=p+1;break}s+=`:nth-child(${f})`,n.unshift(s),a=u}return n.length===0?null:n.join(" > ")}function aF(t){if(!t||Vt(t))return null;let e=[],n=t.ownerDocument.createTreeWalker(t,NodeFilter.SHOW_TEXT,{acceptNode(i){let l=i.parentElement;if(!l||Vt(l))return NodeFilter.FILTER_REJECT;let u=l.getRootNode?.();if(u&&u instanceof ShadowRoot&&Vt(u.host))return NodeFilter.FILTER_REJECT;let c=l.tagName.toLowerCase();return BR.has(c)||Np(l)?NodeFilter.FILTER_REJECT:(i.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),a=0,r=n.nextNode();for(;r&&a<2e3;){let i=(r.textContent??"").trim();if(i.length>0){let l=i.slice(0,2e3-a);e.push(l),a+=l.length}r=n.nextNode()}return e.length===0?null:e.join(" ").replace(/\s+/g," ").trim().slice(0,2e3)||null}function rF(t){if(!t||Vt(t))return null;let e=[];function n(i){if(!i||Vt(i)||Np(i))return;let u=(i.innerText??i.textContent??"").replace(/\s+/g," ").trim().slice(0,200);u.length>0&&e.push(u)}let a=t.getAttribute?.("aria-label")||t.placeholder||(t.innerText??t.textContent??"").trim();a&&e.push(String(a).slice(0,120));let r=t.parentElement;if(r&&!Vt(r)&&!Np(r)&&n(r),r)for(let i=0;i<r.children.length;i++){let l=r.children[i];l!==t&&!Vt(l)&&n(l)}for(let i=0;i<t.children.length;i++)Vt(t.children[i])||n(t.children[i]);let s=e.filter(Boolean).join(" ").replace(/\s+/g," ").trim();return s?s.length>800?s.slice(0,800)+"\u2026":s:null}function sF(t){if(!t?.document?.body)return null;let e=t.document,n=e.body,a=[],r=e.createTreeWalker(n,NodeFilter.SHOW_TEXT,{acceptNode(u){let c=u.parentElement;if(!c||Vt(c))return NodeFilter.FILTER_REJECT;let f=c.getRootNode?.();if(f&&f instanceof ShadowRoot&&Vt(f.host))return NodeFilter.FILTER_REJECT;let p=c.tagName.toLowerCase();if(BR.has(p)||Np(c))return NodeFilter.FILTER_REJECT;let m=c.getBoundingClientRect?.();return m&&(m.top>=t.innerHeight||m.bottom<=0||m.left>=t.innerWidth||m.right<=0)?NodeFilter.FILTER_REJECT:(u.textContent??"").trim().length>0?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}}),s=0,i=r.nextNode();for(;i&&s<1500;){let u=(i.textContent??"").trim();if(u.length>0){let c=u.slice(0,1500-s);a.push(c),s+=c.length}i=r.nextNode()}return a.length===0?null:a.join(" ").replace(/\s+/g," ").trim().slice(0,1500)||null}function Ja(t,e){try{typeof console<"u"&&console.log&&console.log(`ECHLY DEBUG \u2014 ${t}`,e)}catch{}}function Vp(t,e){let n=e;for(;n&&Vt(n);)n=n.parentElement;let a=n?nF(n):null,r=n?aF(n):null,s=n?rF(n):null,i=sF(t);if(n&&!Vt(n)&&n!==t.document?.body){if(!r?.trim()){let c=(n.innerText??n.textContent??"").replace(/\s+/g," ").trim().slice(0,2e3)||null;c&&(r=c),r&&Ja("SUBTREE TEXT FALLBACK USED","element.innerText")}!s?.trim()&&n.parentElement&&!Vt(n.parentElement)&&(s=(n.parentElement.innerText??n.parentElement.textContent??"").replace(/\s+/g," ").trim().slice(0,800)||null,s&&Ja("NEARBY TEXT FALLBACK USED","parent.innerText"))}i?.trim()||Ja("VISIBLE TEXT FALLBACK USED","(skipped to avoid Echly UI)");let l={url:t.location.href,scrollX:t.scrollX,scrollY:t.scrollY,viewportWidth:t.innerWidth,viewportHeight:t.innerHeight,devicePixelRatio:t.devicePixelRatio??1,domPath:a,nearbyText:s??null,subtreeText:r??null,visibleText:i??null,capturedAt:Date.now()};return Ja("DOM PATH",l.domPath??"(none)"),Ja("SUBTREE TEXT SIZE",l.subtreeText?.length??0),Ja("NEARBY TEXT SIZE",l.nearbyText?.length??0),Ja("VISIBLE TEXT SIZE",l.visibleText?.length??0),Ja("DOM SCOPE SAMPLE",(l.subtreeText??"").slice(0,200)||"(empty)"),Ja("NEARBY SCOPE SAMPLE",(l.nearbyText??"").slice(0,200)||"(empty)"),Ja("VISIBLE TEXT SAMPLE",(l.visibleText??"").slice(0,200)||"(empty)"),l}var pv=null;function iF(){if(typeof window>"u")return null;if(!pv)try{pv=new AudioContext}catch{return null}return pv}function Up(){let t=iF();if(!t)return;let e=t.currentTime,n=t.createOscillator(),a=t.createGain();n.connect(a),a.connect(t.destination),n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(600,e+.04),n.type="sine",a.gain.setValueAtTime(.04,e),a.gain.exponentialRampToValueAtTime(.001,e+.06),n.start(e),n.stop(e+.06)}var oF="[SESSION]";function Ms(t){typeof console<"u"&&console.debug&&console.debug(`${oF} ${t}`)}function Fp(t){if(!t||t===document.body||Vt(t))return!1;let e=document.getElementById("echly-shadow-host");if(e&&e.contains(t))return!1;let n=t.tagName?.toLowerCase();if(n==="input"||n==="textarea"||n==="select")return!1;let a=t.getAttribute?.("contenteditable");return!(a==="true"||a==="")}var jt=pe(Cn());var Hr=pe(Ke()),vl=24,qp="cubic-bezier(0.22, 0.61, 0.36, 1)";async function mv(t,e,n){return new Promise((a,r)=>{let s=new Image;s.crossOrigin="anonymous",s.onload=()=>{let i=Math.round(e.x*n),l=Math.round(e.y*n),u=Math.round(e.w*n),c=Math.round(e.h*n),f=document.createElement("canvas");f.width=u,f.height=c;let p=f.getContext("2d");if(!p){r(new Error("No canvas context"));return}p.drawImage(s,i,l,u,c,0,0,u,c);try{a(f.toDataURL("image/png"))}catch(m){r(m)}},s.onerror=()=>r(new Error("Image load failed")),s.src=t})}function GR({getFullTabImage:t,onAddVoice:e,onCancel:n,onSelectionStart:a}){let[r,s]=(0,jt.useState)(null),[i,l]=(0,jt.useState)(null),[u,c]=(0,jt.useState)(!1),[f,p]=(0,jt.useState)(!1),m=(0,jt.useRef)(null),S=(0,jt.useRef)(null),R=(0,jt.useCallback)(()=>{s(null),l(null),m.current=null,S.current=null,setTimeout(()=>n(),120)},[n]);(0,jt.useEffect)(()=>{let y=I=>{I.key==="Escape"&&(I.preventDefault(),i?(l(null),s(null),S.current=null,m.current=null):R())};return document.addEventListener("keydown",y),()=>document.removeEventListener("keydown",y)},[R,i]),(0,jt.useEffect)(()=>{let y=()=>{document.visibilityState==="hidden"&&R()};return document.addEventListener("visibilitychange",y),()=>document.removeEventListener("visibilitychange",y)},[R]);let D=(0,jt.useCallback)(async y=>{if(u)return;c(!0),Up(),p(!0),setTimeout(()=>p(!1),150),await new Promise(At=>setTimeout(At,200));let I=null;try{I=await t()}catch{c(!1),n();return}if(!I){c(!1),n();return}let b=typeof window<"u"&&window.devicePixelRatio||1,w;try{w=await mv(I,y,b)}catch{c(!1),n();return}let A=y.x+y.w/2,T=y.y+y.h/2,$=null;if(typeof document<"u"&&document.elementsFromPoint)for($=document.elementsFromPoint(A,T).find(M=>!Vt(M))??document.elementFromPoint(A,T)??document.elementFromPoint(y.x+2,y.y+2);$&&Vt($);)$=$.parentElement;let He=typeof window<"u"?Vp(window,$):null;e(w,He),c(!1),l(null)},[t,e,n,u]),L=(0,jt.useCallback)(()=>{l(null),s(null),S.current=null,m.current=null},[]),E=(0,jt.useCallback)(y=>{if(y.button!==0||i)return;y.preventDefault(),a?.();let I=y.clientX,b=y.clientY;m.current={x:I,y:b},s({x:I,y:b,w:0,h:0})},[a,i]),v=(0,jt.useCallback)(y=>{if(y.button!==0)return;y.preventDefault();let I=S.current,b=m.current;if(m.current=null,!b||!I||I.w<vl||I.h<vl){s(null);return}s(null),S.current=null,l({x:I.x,y:I.y,w:I.w,h:I.h})},[]),C=(0,jt.useCallback)(y=>{if(!m.current||i)return;let I=m.current.x,b=m.current.y,w=Math.min(I,y.clientX),A=Math.min(b,y.clientY),T=Math.abs(y.clientX-I),$=Math.abs(y.clientY-b),He={x:w,y:A,w:T,h:$};S.current=He,s(He)},[i]);(0,jt.useEffect)(()=>{let y=I=>{if(I.button!==0||!m.current||i)return;let b=S.current,w=m.current;if(m.current=null,!w||!b||b.w<vl||b.h<vl){s(null),S.current=null;return}s(null),S.current=null,l({x:b.x,y:b.y,w:b.w,h:b.h})};return window.addEventListener("mouseup",y),()=>window.removeEventListener("mouseup",y)},[i]);let x=!!r&&(r.w>=vl||r.h>=vl),H=i!==null,G=x&&r||H&&i,_=H?i:r;return(0,Hr.jsxs)("div",{id:"echly-overlay",role:"presentation","aria-hidden":!0,className:"echly-region-overlay","data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,userSelect:"none"},children:[(0,Hr.jsx)("div",{className:"echly-region-overlay-dim",style:{position:"fixed",inset:0,background:G?"transparent":"rgba(0,0,0,0.35)",pointerEvents:i?"none":"auto",cursor:"crosshair",zIndex:2147483646,transition:`background 180ms ${qp}`},onMouseDown:E,onMouseMove:C,onMouseUp:v,onMouseLeave:()=>{!m.current||i||(s(null),m.current=null,S.current=null)}}),(0,Hr.jsx)("div",{className:"echly-region-hint",style:{position:"fixed",left:"50%",top:24,transform:"translateX(-50%)",fontSize:13,color:"rgba(255,255,255,0.8)",zIndex:2147483647,pointerEvents:"none",opacity:i?0:1,transition:`opacity 180ms ${qp}`},children:"Drag to capture area \u2014 ESC to cancel"}),G&&_&&(0,Hr.jsx)("div",{className:"echly-region-cutout",style:{position:"fixed",left:_.x,top:_.y,width:Math.max(_.w,1),height:Math.max(_.h,1),borderRadius:6,border:`2px solid ${f?"#FFFFFF":"#5B8CFF"}`,boxShadow:"0 0 0 9999px rgba(0,0,0,0.35)",pointerEvents:"none",zIndex:2147483646,transition:f?"none":`border-color 150ms ${qp}`}}),H&&i&&(0,Hr.jsxs)("div",{className:"echly-region-confirm-bar",style:{position:"fixed",left:i.x+i.w/2,bottom:Math.max(12,i.y+i.h-48),transform:"translate(-50%, 100%)",display:"flex",gap:8,padding:"8px 12px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",zIndex:2147483647,animation:`echly-confirm-bar-in 220ms ${qp} forwards`},children:[(0,Hr.jsx)("button",{type:"button",onClick:L,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Retake"}),(0,Hr.jsx)("button",{type:"button",onClick:()=>D(i),disabled:u,className:"echly-region-confirm-btn",style:{padding:"8px 14px",borderRadius:999,border:"none",background:"linear-gradient(135deg, #5B8CFF, #466EFF)",color:"#fff",fontSize:13,fontWeight:600,cursor:u?"not-allowed":"pointer"},children:"Speak feedback"})]})]})}var jR=40;function cF(t,e=jR,n,a){let r=t.getBoundingClientRect(),s=n??(typeof window<"u"?window.innerWidth:0),i=a??(typeof window<"u"?window.innerHeight:0),l=Math.max(0,r.left-e),u=Math.max(0,r.top-e),c=s-l,f=i-u,p=Math.min(r.width+e*2,c),m=Math.min(r.height+e*2,f);return{x:l,y:u,w:Math.max(1,p),h:Math.max(1,m)}}async function KR(t,e,n=jR){let a=typeof window<"u"&&window.devicePixelRatio||1,r=cF(e,n);return mv(t,r,a)}var gv="[SESSION]",yv=null,Ta=[],Tl=null,El=null;function XR(t){let e=t.getBoundingClientRect();return{x:e.left+e.width/2,y:e.top+e.height/2}}function QR(t,e,n){t.style.left=`${e}px`,t.style.top=`${n}px`,t.style.transform="translate(-50%, -50%)"}function dF(){Tl&&El||(Tl=()=>WR(),El=()=>WR(),window.addEventListener("scroll",Tl,{passive:!0,capture:!0}),window.addEventListener("resize",El))}function YR(){Tl&&(window.removeEventListener("scroll",Tl,{capture:!0}),Tl=null),El&&(window.removeEventListener("resize",El),El=null)}function Iv(t,e,n={}){let{onMarkerClick:a,getSessionPaused:r}=n;if(!t)return;let s=document.getElementById("echly-marker-layer");if(!s)return;yv=s;let i=Ta.length+1,l=e.x,u=e.y;if(e.element){let p=XR(e.element);l=p.x,u=p.y}let c=document.createElement("div");c.className="echly-feedback-marker",c.setAttribute("data-echly-ui","true"),c.setAttribute("aria-label",`Feedback ${i}`),c.textContent=String(i),c.title=e.title??`Feedback #${i}`,c.style.cssText=["width:22px","height:22px","border-radius:50%","background:#2563eb","color:white","font-size:12px","font-weight:600","display:flex","align-items:center","justify-content:center","position:fixed","z-index:2147483646","box-shadow:0 4px 12px rgba(0,0,0,0.15)","cursor:pointer","pointer-events:auto","box-sizing:border-box"].join(";"),QR(c,l,u);let f={...e,x:l,y:u,index:i,domElement:c};Ta.push(f),c.addEventListener("click",p=>{p.preventDefault(),p.stopPropagation(),!r?.()&&(console.log(`${gv} marker clicked`,f.id),a?.({id:f.id,x:f.x,y:f.y,element:f.element,title:f.title,index:f.index}))}),yv.appendChild(c),Ta.length===1&&dF(),console.log(`${gv} marker created`,f.id,i)}function _v(t,e){let n=Ta.find(a=>a.id===t);n&&(e.id!=null&&(n.id=e.id),e.title!=null&&(n.title=e.title),n.domElement.title=n.title??`Feedback #${n.index}`)}function Sv(t){let e=Ta.findIndex(a=>a.id===t);if(e===-1)return;Ta[e].domElement.remove(),Ta.splice(e,1),Ta.length===0&&YR()}function WR(){for(let t of Ta)if(t.element&&t.element.isConnected){let{x:e,y:n}=XR(t.element);t.x=e,t.y=n,QR(t.domElement,e,n)}}function $R(){let t=document.getElementById("echly-marker-layer");if(t)for(;t.firstChild;)t.removeChild(t.firstChild);for(let e of Ta)console.log(`${gv} marker removed`,e.id);Ta.length=0,yv=null,YR()}var zp=24;function hF(t){let e=t.toLowerCase().trim();if(!e)return"neutral";let n=/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate|broken)\b/.exec(e),a=/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/.exec(e);if(n&&!a)return"negative";if(a&&!n)return"positive";if(n&&a){let r=(e.match(/\b(bug|broken|fail|error|issue|problem|doesn't work|don't work|terrible|frustrated|annoying|wrong|bad|hate)\b/g)??[]).length,s=(e.match(/\b(great|love|nice|good|works|thank|happy|easy|perfect|awesome|helpful)\b/g)??[]).length;return r>s?"negative":s>r?"positive":"neutral"}return"neutral"}function vv(){return typeof crypto<"u"&&crypto.randomUUID?crypto.randomUUID():`rec-${Date.now()}-${Math.random().toString(36).slice(2,11)}`}var Hp=["focus_mode","region_selecting","voice_listening","processing"];function e1({sessionId:t,extensionMode:e=!1,initialPointers:n,onComplete:a,onDelete:r,onRecordingChange:s,loadSessionWithPointers:i,onSessionLoaded:l,onCreateSession:u,onActiveSessionChange:c,globalSessionModeActive:f,globalSessionPaused:p,onSessionModeStart:m,onSessionModePause:S,onSessionModeResume:R,onSessionModeEnd:D}){let[L,E]=(0,B.useState)([]),[v,C]=(0,B.useState)(null),[x,H]=(0,B.useState)(!1),[G,_]=(0,B.useState)("idle"),[y,I]=(0,B.useState)(null),[b,w]=(0,B.useState)(n??[]),[A,T]=(0,B.useState)(null),[$,He]=(0,B.useState)(null),[At,M]=(0,B.useState)(""),[O,U]=(0,B.useState)(""),[J,Q]=(0,B.useState)(!1),[re,We]=(0,B.useState)(null),[Oe,$e]=(0,B.useState)(!1),[Je,bn]=(0,B.useState)(null),[yn,ot]=(0,B.useState)(0),[N,ae]=(0,B.useState)(!0),[ie,ue]=(0,B.useState)(null),[ye,Te]=(0,B.useState)(!1),[Wt,ft]=(0,B.useState)(!1),[Ze,Xe]=(0,B.useState)(null),[Ie,de]=(0,B.useState)(!1),[Ve,Re]=(0,B.useState)(!1),[ke,Qe]=(0,B.useState)(!1),[et,tt]=(0,B.useState)(null),Bt=(0,B.useRef)(!1),an=(0,B.useRef)(!1),In=(0,B.useRef)(null);(0,B.useEffect)(()=>{Bt.current=Ve},[Ve]),(0,B.useEffect)(()=>{an.current=ke},[ke]);let Tt=(0,B.useRef)({x:0,y:0}),wn=(0,B.useRef)(null),yt=(0,B.useRef)(null),Be=(0,B.useRef)(null),De=(0,B.useRef)(null),xt=(0,B.useRef)(null),Yn=(0,B.useRef)(L),Ea=(0,B.useRef)(G),ha=(0,B.useRef)(null),ba=(0,B.useRef)(!1),ar=(0,B.useRef)(null),xi=(0,B.useRef)(null),qt=(0,B.useRef)(null),Kr=(0,B.useRef)(null),rr=(0,B.useRef)(null),sr=(0,B.useRef)(null),bl=(0,B.useRef)(!1);(0,B.useEffect)(()=>{Ea.current=G},[G]),(0,B.useEffect)(()=>(G==="focus_mode"||G==="region_selecting"?document.documentElement.style.filter="saturate(0.98)":document.documentElement.style.filter="",()=>{document.documentElement.style.filter=""}),[G]),(0,B.useEffect)(()=>{if(G!=="voice_listening"){Kr.current!=null&&(cancelAnimationFrame(Kr.current),Kr.current=null),ar.current?.getTracks().forEach(oe=>oe.stop()),ar.current=null,xi.current?.close().catch(()=>{}),xi.current=null,qt.current=null,ot(0);return}let z=qt.current;if(!z)return;let W=new Uint8Array(z.frequencyBinCount),j,Z=()=>{z.getByteFrequencyData(W);let oe=W.reduce((Ee,fn)=>Ee+fn,0),nt=W.length?oe/W.length:0,te=Math.min(1,nt/128);ot(te),j=requestAnimationFrame(Z)};return j=requestAnimationFrame(Z),Kr.current=j,()=>{cancelAnimationFrame(j),Kr.current=null}},[G]),(0,B.useEffect)(()=>{ha.current=$},[$]),(0,B.useEffect)(()=>{ba.current=Hp.includes(G)},[G]);let wl=(0,B.useRef)(!1);(0,B.useEffect)(()=>{if(!s)return;Hp.includes(G)?(wl.current=!0,s(!0)):wl.current&&(wl.current=!1,s(!1))},[G,s]);let ir=(0,B.useCallback)(z=>{z===!1&&(ba.current||e||Hp.includes(Ea.current)||ha.current)||H(z)},[e]),td=(0,B.useCallback)(()=>{H(z=>!z)},[]);(0,B.useEffect)(()=>{xt.current=v},[v]),(0,B.useEffect)(()=>{Yn.current=L},[L]),(0,B.useEffect)(()=>{let z=j=>{if(!Oe||!wn.current)return;j.preventDefault();let Z=wn.current.offsetWidth,oe=wn.current.offsetHeight,nt=j.clientX-Tt.current.x,te=j.clientY-Tt.current.y,Ee=window.innerWidth-Z-zp,fn=window.innerHeight-oe-zp;nt=Math.max(zp,Math.min(nt,Ee)),te=Math.max(zp,Math.min(te,fn)),We({x:nt,y:te})},W=()=>{Oe&&($e(!1),document.body.style.userSelect="")};return window.addEventListener("mousemove",z),window.addEventListener("mouseup",W),()=>{window.removeEventListener("mousemove",z),window.removeEventListener("mouseup",W)}},[Oe]);let nd=(0,B.useCallback)(z=>{if(z.button!==0||!wn.current)return;let W=wn.current.getBoundingClientRect();$e(!0),document.body.style.userSelect="none",Tt.current={x:z.clientX-W.left,y:z.clientY-W.top},We({x:W.left,y:W.top})},[]),_n=(0,B.useCallback)(()=>{if(yt.current)return;tt(null);let z=document.createElement("div");z.id="echly-capture-root",document.body.appendChild(z),yt.current=z,Xe(z),ft(!0)},[]);(0,B.useEffect)(()=>{let z=document.getElementById("echly-capture-root");if(!z||z.querySelector("#echly-marker-layer"))return;let W=document.createElement("div");W.id="echly-marker-layer",W.style.cssText=["position:fixed","top:0","left:0","width:100%","height:100%","pointer-events:none","z-index:2147483646"].join(";"),z.appendChild(W)},[Ze]);let dn=(0,B.useCallback)(()=>{if(yt.current){try{document.body.removeChild(yt.current)}catch(z){console.error("CaptureWidget error:",z)}yt.current=null}Xe(null),ft(!1)},[]),$n=(0,B.useCallback)(()=>{_("idle"),H(N)},[N]);(0,B.useEffect)(()=>{if(n!=null){w(n);return}if(!t)return;(async()=>{let W=await FR(t);w(W.map(j=>({id:j.id,title:j.title,description:j.description,type:j.type})))})()},[t,n]),(0,B.useEffect)(()=>{let z=window.SpeechRecognition||window.webkitSpeechRecognition;if(!z)return;let W=new z;return W.continuous=!0,W.interimResults=!0,W.lang="en-US",W.onstart=()=>{let j=Date.now();sr.current=j,console.log("[VOICE] recognition.onstart",j);let Z=rr.current;Z!=null&&console.log("[VOICE] delay UI recording start\u2192onstart:",j-Z,"ms")},W.onspeechstart=()=>{console.log("[VOICE] speech detected",Date.now())},W.onaudiostart=()=>{console.log("[VOICE] audio start",Date.now())},W.onresult=j=>{let Z="";for(let te=0;te<j.results.length;++te){let fn=j.results[te][0];fn&&(Z+=fn.transcript+" ")}Z=Z.replace(/\s+/g," ").trim();let oe=Date.now();if(console.log("[VOICE] transcript received",oe,Z),Z&&!bl.current){bl.current=!0,console.log("[VOICE] first transcript chunk:",Z,"length:",Z.length);let te=rr.current,Ee=sr.current;te!=null&&console.log("[VOICE] delay UI\u2192first transcript:",oe-te,"ms"),Ee!=null&&console.log("[VOICE] delay onstart\u2192first transcript:",oe-Ee,"ms")}let nt=xt.current;nt&&E(te=>te.map(Ee=>Ee.id===nt?{...Ee,transcript:Z}:Ee))},W.onend=()=>{let j=Ea.current;j==="processing"||j==="success"||_("idle")},Be.current=W,()=>{try{W.stop()}catch(j){console.error("CaptureWidget error:",j)}}},[]);let Jn=(0,B.useCallback)(async()=>{let z=Date.now();rr.current=z,sr.current=null,bl.current=!1,console.log("[VOICE] UI recording started",z);try{let W=await navigator.mediaDevices.getUserMedia({audio:!0});ar.current=W;let j=new AudioContext,Z=j.createAnalyser();Z.fftSize=256,Z.smoothingTimeConstant=.7,j.createMediaStreamSource(W).connect(Z),xi.current=j,qt.current=Z,console.log("[VOICE] recognition.start() called",Date.now()),Be.current?.start(),_("voice_listening"),ot(0)}catch(W){console.error("Microphone permission denied:",W),I("Microphone permission denied."),_("error"),dn(),$n()}},[]),Wr=(0,B.useCallback)(async()=>{typeof navigator<"u"&&navigator.vibrate&&navigator.vibrate(8),OR(),Be.current?.stop();let z=xt.current;if(!z){_("idle");return}let j=Yn.current.find(Z=>Z.id===z);if(console.log("[VOICE] finishListening transcript:",j?.transcript),!j||!j.transcript||j.transcript.trim().length<5){console.warn("[VOICE] transcript too short, skipping pipeline"),_("idle");return}if(e){if(Bt.current){let oe=yt.current,nt=In.current??void 0,te=`pending-${Date.now()}`;oe&&Iv(oe,{id:te,x:0,y:0,element:nt,title:"Saving feedback\u2026"},{getSessionPaused:()=>an.current,onMarkerClick:Ee=>{ue(Ee.id),T(Ee.id)}}),tt(null),E(Ee=>Ee.filter(fn=>fn.id!==z)),C(null),_("idle"),In.current=null,console.log("[VOICE] final transcript sent to pipeline:",j.transcript),a(j.transcript,j.screenshot,{onSuccess:Ee=>{oe&&_v(te,{id:Ee.id,title:Ee.title}),w(fn=>[{id:Ee.id,title:Ee.title,description:Ee.description,type:Ee.type},...fn]),ue(Ee.id),setTimeout(()=>ue(null),1200)},onError:()=>{oe&&Sv(te),I("AI processing failed.")}},j.context??void 0,{sessionMode:!0});return}_("processing"),console.log("[VOICE] final transcript sent to pipeline:",j.transcript),a(j.transcript,j.screenshot,{onSuccess:oe=>{w(nt=>[{id:oe.id,title:oe.title,description:oe.description,type:oe.type},...nt]),E(nt=>nt.filter(te=>te.id!==z)),C(null),ue(oe.id),setTimeout(()=>ue(null),1200),de(!0),setTimeout(()=>de(!1),200),Te(!0),setTimeout(()=>{dn(),$n(),Te(!1)},120)},onError:()=>{I("AI processing failed."),_("voice_listening")}},j.context??void 0);return}_("processing"),console.log("[VOICE] final transcript sent to pipeline:",j.transcript);try{let Z=await a(j.transcript,j.screenshot);if(!Z){_("idle"),dn(),$n();return}w(oe=>[{id:Z.id,title:Z.title,description:Z.description,type:Z.type},...oe]),E(oe=>oe.filter(nt=>nt.id!==z)),C(null),ue(Z.id),setTimeout(()=>ue(null),1200),de(!0),setTimeout(()=>de(!1),200),Te(!0),setTimeout(()=>{dn(),$n(),Te(!1)},120)}catch(Z){console.error(Z),I("AI processing failed."),_("voice_listening")}},[a,e,dn,$n]),Ri=(0,B.useCallback)(()=>{Be.current?.stop();let z=xt.current;E(W=>W.filter(j=>j.id!==z)),C(null),_("cancelled"),dn(),$n()},[dn,$n]);(0,B.useEffect)(()=>{if(!Wt)return;let z=W=>{W.key==="Escape"&&(W.preventDefault(),Hp.includes(Ea.current)&&Ri())};return document.addEventListener("keydown",z),()=>document.removeEventListener("keydown",z)},[Wt,Ri]);let pa=(0,B.useCallback)(async()=>{try{await navigator.clipboard.writeText(window.location.href)}catch{}},[]),Cl=(0,B.useCallback)(()=>{w([]),E([]),C(null),_("idle"),T(null),He(null),Q(!1)},[]);(0,B.useEffect)(()=>{if(e)return;let z=W=>{let j=W.target;De.current&&j&&!De.current.contains(j)&&Q(!1)};return document.addEventListener("mousedown",z),()=>document.removeEventListener("mousedown",z)},[e]);let Ll=(0,B.useCallback)(async z=>{try{await r(z),w(W=>W.filter(j=>j.id!==z))}catch(W){console.error("Delete failed:",W)}},[r]),ki=(0,B.useCallback)(z=>{He(z.id),M(z.title),U(z.description)},[]),Di=(0,B.useCallback)(async z=>{let W=At.trim()||At,j=O;w(Z=>Z.map(oe=>oe.id===z?{...oe,title:W||oe.title,description:j}:oe)),He(null);try{let Z=await PR(`/api/tickets/${z}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:W||At,description:j})}),oe=await Z.json();if(Z.ok&&oe.success&&oe.ticket){let nt=oe.ticket;w(te=>te.map(Ee=>Ee.id===z?{...Ee,title:nt.title,description:nt.description,type:nt.type??Ee.type}:Ee))}}catch(Z){console.error("Save edit failed:",Z)}},[At,O]),wa=(0,B.useCallback)(()=>typeof chrome<"u"&&chrome.runtime?.id?new Promise((z,W)=>{chrome.runtime.sendMessage({type:"CAPTURE_TAB"},j=>{!j||!j.success?W(new Error("Capture failed")):z(j.screenshot??null)})}):Promise.resolve(null),[]),ad=(0,B.useCallback)(async()=>{if(typeof chrome<"u"&&chrome.runtime?.id)return wa();let{captureScreenshot:z}=await Promise.resolve().then(()=>(ZR(),JR));return z()},[wa]),Al=(0,B.useCallback)(()=>{_("region_selecting")},[]),rd=(0,B.useCallback)((z,W)=>{let j=vv(),Z={id:j,screenshot:z,transcript:"",structuredOutput:null,context:W??null,createdAt:Date.now()};E(oe=>[...oe,Z]),C(j),Jn()},[Jn]),Ca=(0,B.useCallback)(()=>{_("cancelled"),dn(),$n()},[dn,$n]),xl=(0,B.useCallback)(z=>{let W=xt.current;W&&E(j=>j.map(Z=>Z.id===W?{...Z,transcript:z}:Z))},[]),Pi=(0,B.useCallback)(async()=>{if(!(Ea.current!=="idle"||Bt.current)){if(console.log("[Echly] Start New Feedback Session clicked"),Ms("start"),e&&u&&c){let z=await u();if(!z?.id)return;c(z.id),w([]),m?.()}Re(!0),Qe(!1),tt(null),_n()}},[e,u,c,m,_n]),Xr=(0,B.useCallback)(()=>{Bt.current&&(Ms("pause"),Qe(!0),S?.())},[S]),La=(0,B.useCallback)(()=>{Bt.current&&(Ms("resume"),Qe(!1),R?.())},[R]),Oi=(0,B.useCallback)(()=>{Bt.current&&(Ms("end"),D?.(),$R(),Re(!1),Qe(!1),tt(null),dn())},[D,dn]);(0,B.useEffect)(()=>{!e||f===void 0||(f===!0&&(Re(!0),Qe(p??!1),tt(null),yt.current||_n()),p===!0&&Qe(!0),f===!1&&(Re(!1),Qe(!1),dn()))},[e,f,p,_n,dn]),(0,B.useEffect)(()=>{e&&f&&p!==void 0&&Qe(p)},[e,f,p]),(0,B.useEffect)(()=>{if(!e||f!==!0)return;let z=()=>{document.hidden||!f||yt.current||(Re(!0),Qe(p??!1),tt(null),_n())};return document.addEventListener("visibilitychange",z),()=>document.removeEventListener("visibilitychange",z)},[e,f,p,_n]),(0,B.useEffect)(()=>{!e||!i?.sessionId||(w(i.pointers??[]),Re(!0),Qe(!1),tt(null),_n(),l?.())},[e,i,_n,l]);let sd=(0,B.useCallback)(async z=>{if(et&&!yt.current){tt(null);return}if(!wa||et!=null)return;Ms("element clicked"),Up();let W=null;try{W=await wa()}catch{return}if(!W)return;let j;try{j=await KR(W,z)}catch{return}let Z=Vp(window,z);In.current=z instanceof HTMLElement?z:null,tt({screenshot:j,context:Z})},[wa,et]),Rl=(0,B.useCallback)(z=>{let W=et;if(!W||!z||z.trim().length===0){tt(null);return}let j=yt.current,Z=In.current??void 0,oe=`pending-${Date.now()}`;j&&Iv(j,{id:oe,x:0,y:0,element:Z??void 0,title:"Saving feedback\u2026"},{getSessionPaused:()=>an.current,onMarkerClick:te=>{ue(te.id),T(te.id)}}),tt(null),_("idle"),In.current=null,console.log("[VOICE] final transcript sent to pipeline:",z),a(z,W.screenshot,{onSuccess:te=>{j&&_v(oe,{id:te.id,title:te.title}),w(Ee=>[{id:te.id,title:te.title,description:te.description,type:te.type},...Ee]),ue(te.id),setTimeout(()=>ue(null),1200)},onError:()=>{j&&Sv(oe),I("AI processing failed.")}},W.context??void 0,{sessionMode:!0})},[et,a]),kl=(0,B.useCallback)(()=>{tt(null)},[]),Dl=(0,B.useCallback)(()=>{let z=et;if(!z)return;let W=vv(),j={id:W,screenshot:z.screenshot,transcript:"",structuredOutput:null,context:z.context??null,createdAt:Date.now()};E(Z=>[...Z,j]),C(W),Jn()},[et,Jn]),Mi=(0,B.useCallback)(async()=>{if(Ea.current==="idle"&&(I(null),Be.current?.stop(),ae(x),H(!1),_n(),_("focus_mode"),!e))try{let z=await ad();if(!z){Ca();return}let W=vv(),j={id:W,screenshot:z,transcript:"",structuredOutput:null,createdAt:Date.now()};E(Z=>[...Z,j]),C(W),Jn()}catch(z){console.error(z),I("Screen capture failed."),_("error"),Ca()}},[e,x,ad,Jn,_n,Ca]),Pl=(0,B.useMemo)(()=>({setIsOpen:ir,toggleOpen:td,startDrag:nd,handleShare:pa,setShowMenu:Q,resetSession:Cl,startListening:Jn,finishListening:Wr,discardListening:Ri,deletePointer:Ll,startEditing:ki,saveEdit:Di,setExpandedId:T,setEditedTitle:M,setEditedDescription:U,handleAddFeedback:Mi,handleRegionCaptured:rd,handleRegionSelectStart:Al,handleCancelCapture:Ca,getFullTabImage:wa,setActiveRecordingTranscript:xl,startSession:Pi,pauseSession:Xr,resumeSession:La,endSession:Oi,handleSessionElementClicked:sd,handleSessionFeedbackSubmit:Rl,handleSessionFeedbackCancel:kl,handleSessionStartVoice:Dl}),[ir,td,nd,pa,Cl,Jn,Wr,Ri,Ll,ki,Di,T,M,U,Mi,rd,Al,Ca,wa,xl,Pi,Xr,La,Oi,sd,Rl,kl,Dl]),Ni=(0,B.useMemo)(()=>v?L.find(z=>z.id===v):null,[v,L]),id=(0,B.useMemo)(()=>G!=="voice_listening"?"neutral":hF(Ni?.transcript??""),[G,Ni?.transcript]),od=Ni?.transcript?.trim()??"";return{state:{isOpen:x,state:G,errorMessage:y,pointers:b,expandedId:A,editingId:$,editedTitle:At,editedDescription:O,showMenu:J,position:re,liveTranscript:od,listeningAudioLevel:yn,listeningSentiment:id,highlightTicketId:ie,pillExiting:ye,orbSuccess:Ie,sessionMode:Ve,sessionPaused:ke,sessionFeedbackPending:et},handlers:Pl,refs:{widgetRef:wn,menuRef:De,captureRootRef:yt},captureRootReady:Wt,captureRootEl:Ze}}var jp=pe(Cn());var Gp=(...t)=>t.filter((e,n,a)=>!!e&&e.trim()!==""&&a.indexOf(e)===n).join(" ").trim();var t1=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();var n1=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,n,a)=>a?a.toUpperCase():n.toLowerCase());var Tv=t=>{let e=n1(t);return e.charAt(0).toUpperCase()+e.slice(1)};var Wc=pe(Cn());var a1={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var r1=t=>{for(let e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1};var s1=(0,Wc.forwardRef)(({color:t="currentColor",size:e=24,strokeWidth:n=2,absoluteStrokeWidth:a,className:r="",children:s,iconNode:i,...l},u)=>(0,Wc.createElement)("svg",{ref:u,...a1,width:e,height:e,stroke:t,strokeWidth:a?Number(n)*24/Number(e):n,className:Gp("lucide",r),...!s&&!r1(l)&&{"aria-hidden":"true"},...l},[...i.map(([c,f])=>(0,Wc.createElement)(c,f)),...Array.isArray(s)?s:[s]]));var Za=(t,e)=>{let n=(0,jp.forwardRef)(({className:a,...r},s)=>(0,jp.createElement)(s1,{ref:s,iconNode:e,className:Gp(`lucide-${t1(Tv(t))}`,`lucide-${t}`,a),...r}));return n.displayName=Tv(t),n};var pF=[["path",{d:"M20 6 9 17l-5-5",key:"1gmf2c"}]],Xc=Za("check",pF);var mF=[["path",{d:"m15 15 6 6",key:"1s409w"}],["path",{d:"m15 9 6-6",key:"ko1vev"}],["path",{d:"M21 16v5h-5",key:"1ck2sf"}],["path",{d:"M21 8V3h-5",key:"1qoq8a"}],["path",{d:"M3 16v5h5",key:"1t08am"}],["path",{d:"m3 21 6-6",key:"wwnumi"}],["path",{d:"M3 8V3h5",key:"1ln10m"}],["path",{d:"M9 9 3 3",key:"v551iv"}]],Qc=Za("expand",mF);var gF=[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]],Yc=Za("pencil",gF);var yF=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],$c=Za("trash-2",yF);var IF=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Jc=Za("x",IF);var gn=pe(Ke()),_F=()=>(0,gn.jsxs)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,gn.jsx)("circle",{cx:"12",cy:"12",r:"4"}),(0,gn.jsx)("path",{d:"M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"})]}),SF=()=>(0,gn.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:(0,gn.jsx)("path",{d:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"})});function Ev({onClose:t,summary:e=null,theme:n="dark",onThemeToggle:a}){return(0,gn.jsxs)("div",{className:"echly-sidebar-header",children:[(0,gn.jsxs)("div",{className:"echly-sidebar-header-left",children:[(0,gn.jsx)("span",{className:"echly-sidebar-title",children:"Echly"}),e&&(0,gn.jsx)("span",{className:"echly-sidebar-summary",children:e})]}),a&&(0,gn.jsx)("button",{type:"button",id:"theme-toggle",onClick:a,className:"echly-theme-toggle","aria-label":n==="dark"?"Switch to light mode":"Switch to dark mode",children:n==="dark"?(0,gn.jsx)(_F,{}):(0,gn.jsx)(SF,{})}),(0,gn.jsx)("button",{type:"button",onClick:t,className:"echly-sidebar-close","aria-label":"Close",children:(0,gn.jsx)(Jc,{size:16,strokeWidth:1.5})})]})}var Gr=pe(Cn());var pt=pe(Ke());function vF(t){let e=(t??"").toLowerCase();return/critical|blocking/.test(e)?"critical":/high|urgent|bug/.test(e)?"high":/low/.test(e)?"low":"medium"}function TF({item:t,expandedId:e,editingId:n,editedTitle:a,editedDescription:r,onExpand:s,onStartEdit:i,onSaveEdit:l,onDelete:u,onEditedTitleChange:c,onEditedDescriptionChange:f,highlightTicketId:p=null}){let m=e===t.id,S=n===t.id,R=p===t.id,D=vF(t.type),[L,E]=(0,Gr.useState)(!1),v=(0,Gr.useCallback)(()=>{s(m?null:t.id)},[m,t.id,s]),C=(0,Gr.useCallback)(()=>{i(t)},[t,i]),x=(0,Gr.useCallback)(()=>{l(t.id),E(!0),setTimeout(()=>E(!1),220)},[t.id,l]),H=(0,Gr.useCallback)(()=>{u(t.id)},[t.id,u]);return(0,pt.jsxs)("div",{className:`echly-feedback-item ${R?"echly-ticket-highlight":""}`,"data-priority":D,children:[(0,pt.jsx)("span",{className:"echly-priority-dot","aria-hidden":!0}),(0,pt.jsxs)("div",{className:"echly-feedback-item-inner",children:[(0,pt.jsx)("div",{className:"echly-feedback-item-content",children:S?(0,pt.jsxs)(pt.Fragment,{children:[(0,pt.jsx)("input",{value:a,onChange:G=>c(G.target.value),className:"echly-widget-input echly-feedback-item-input"}),(0,pt.jsx)("textarea",{value:r,onChange:G=>f(G.target.value),rows:3,className:"echly-widget-input echly-feedback-item-textarea"})]}):(0,pt.jsx)(pt.Fragment,{children:(0,pt.jsx)("h3",{className:"echly-widget-item-title",children:t.title})})}),(0,pt.jsxs)("div",{className:"echly-feedback-item-actions",children:[(0,pt.jsx)("button",{type:"button",onClick:v,className:"echly-widget-action-icon","aria-label":m?"Collapse":"Expand",children:(0,pt.jsx)(Qc,{size:16,strokeWidth:1.5})}),S?(0,pt.jsx)("button",{type:"button",onClick:x,className:`echly-widget-action-icon echly-widget-action-icon--confirm ${L?"echly-widget-action-icon--confirm-success":""}`,"aria-label":"Save",children:(0,pt.jsx)(Xc,{size:16,strokeWidth:1.5})}):(0,pt.jsx)("button",{type:"button",onClick:C,className:"echly-widget-action-icon","aria-label":"Edit",children:(0,pt.jsx)(Yc,{size:16,strokeWidth:1.5})}),(0,pt.jsx)("button",{type:"button",onClick:H,className:"echly-widget-action-icon echly-widget-action-icon--delete","aria-label":"Delete",children:(0,pt.jsx)($c,{size:16,strokeWidth:1.5})})]})]})]})}var i1=Gr.default.memo(TF,(t,e)=>t.item===e.item&&t.expandedId===e.expandedId&&t.editingId===e.editingId&&t.editedTitle===e.editedTitle&&t.editedDescription===e.editedDescription&&t.highlightTicketId===e.highlightTicketId);var Ci=pe(Ke());function bv({isIdle:t,onAddFeedback:e,extensionMode:n=!1,onStartSession:a,onResumeSession:r,captureDisabled:s=!1}){let i=!t||s;return n?(0,Ci.jsxs)("div",{className:"echly-add-insight-wrap",children:[(0,Ci.jsx)("button",{type:"button",onClick:i?void 0:a,disabled:i,className:`echly-add-insight-btn ${i?"echly-add-insight-btn--disabled":""}`,"aria-label":"Start New Feedback Session",children:"Start New Feedback Session"}),r&&(0,Ci.jsx)("button",{type:"button",onClick:i?void 0:r,disabled:i,className:"echly-add-insight-btn echly-add-insight-btn--secondary","aria-label":"Resume Feedback Session",style:{marginTop:8,background:"rgba(37, 99, 235, 0.15)",color:"#2563eb",border:"1px solid rgba(37, 99, 235, 0.4)"},children:"Resume Feedback Session"})]}):(0,Ci.jsx)("div",{className:"echly-add-insight-wrap",children:(0,Ci.jsx)("button",{type:"button",onClick:i?void 0:e,disabled:i,className:`echly-add-insight-btn ${i?"echly-add-insight-btn--disabled":""}`,"aria-label":"Capture feedback",children:"Capture feedback"})})}var g1=pe(vd());var Ns=pe(Cn()),p1=pe(vd());var o1={outline:"2px solid #2563eb",background:"rgba(37,99,235,0.1)"},Ut=null,Zc=null,Kp=null;function EF(t,e){if(typeof document.elementsFromPoint!="function")return document.elementFromPoint(t,e);let n=document.elementsFromPoint(t,e);for(let a of n)if(Fp(a))return a;return null}function l1(t){if(Ut){if(!t||t.width===0||t.height===0){Ut.style.display="none";return}Ut.style.display="block",Ut.style.left=`${t.left}px`,Ut.style.top=`${t.top}px`,Ut.style.width=`${t.width}px`,Ut.style.height=`${t.height}px`}}function bF(t,e){if(!e()){Ut&&(Ut.style.display="none"),Kp=null;return}let n=EF(t.clientX,t.clientY);if(n!==Kp){if(Kp=n,!n){l1(null);return}let a=n.getBoundingClientRect();l1(a)}}function u1(t,e){return Ut&&Ut.parentNode&&Wp(),Ut=document.createElement("div"),Ut.setAttribute("aria-hidden","true"),Ut.setAttribute("data-echly-ui","true"),Ut.style.cssText=["position:fixed","pointer-events:none","z-index:2147483646","box-sizing:border-box","border-radius:4px",`outline:${o1.outline}`,`background:${o1.background}`,"display:none"].join(";"),t.appendChild(Ut),Zc=n=>bF(n,e.getActive),document.addEventListener("mousemove",Zc,{passive:!0}),()=>Wp()}function Wp(){Zc&&(document.removeEventListener("mousemove",Zc),Zc=null),Kp=null,Ut?.parentNode&&Ut.parentNode.removeChild(Ut),Ut=null}var Li=null,wv=()=>!1,Cv=()=>{};function wF(t){if(t.button!==0||!wv())return;let e=t.target;!e||!Fp(e)||(t.preventDefault(),t.stopPropagation(),Ms("element clicked"),Cv(e))}function c1(t,e){return wv=e.enabled,Cv=e.onElementClicked,Li&&document.removeEventListener("click",Li,!0),Li=wF,document.addEventListener("click",Li,!0),()=>Lv()}function Lv(){Li&&(document.removeEventListener("click",Li,!0),Li=null),wv=()=>!1,Cv=()=>{}}var Ai=pe(Ke());function d1({sessionPaused:t,onPause:e,onResume:n,onEnd:a}){return(0,Ai.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:24,left:"50%",transform:"translateX(-50%)",display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderRadius:12,background:"rgba(20,22,28,0.95)",backdropFilter:"blur(12px)",boxShadow:"0 8px 32px rgba(0,0,0,0.3)",zIndex:2147483647,border:"1px solid rgba(255,255,255,0.08)"},children:[(0,Ai.jsx)("span",{style:{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"},children:t?"Session paused":"Recording Session"}),t?(0,Ai.jsx)("button",{type:"button",onClick:n,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg, #2563eb, #1d4ed8)",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Resume Feedback Session"}):(0,Ai.jsx)("button",{type:"button",onClick:e,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.9)",fontSize:13,fontWeight:500,cursor:"pointer"},children:"Pause"}),(0,Ai.jsx)("button",{type:"button",onClick:a,style:{padding:"6px 12px",borderRadius:8,border:"none",background:"rgba(239,68,68,0.9)",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"},children:"End"})]})}var Av=pe(Cn()),Kt=pe(Ke());function f1({screenshot:t,isVoiceListening:e,onRecordVoice:n,onDoneVoice:a,onSaveText:r,onCancel:s}){let[i,l]=(0,Av.useState)("choose"),[u,c]=(0,Av.useState)("");return(0,Kt.jsxs)("div",{"data-echly-ui":"true",style:{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%, -50%)",width:"min(380px, 92vw)",borderRadius:16,background:"rgba(20,22,28,0.98)",backdropFilter:"blur(16px)",boxShadow:"0 24px 48px rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",zIndex:2147483647,overflow:"hidden",display:"flex",flexDirection:"column"},children:[(0,Kt.jsxs)("div",{style:{padding:16,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,Kt.jsx)("div",{style:{borderRadius:8,overflow:"hidden",background:"#111",aspectRatio:"16/10",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,Kt.jsx)("img",{src:t,alt:"Capture",style:{maxWidth:"100%",maxHeight:"100%",objectFit:"contain"}})}),(0,Kt.jsx)("p",{style:{margin:"12px 0 0",fontSize:13,color:"rgba(255,255,255,0.7)"},children:"Speak or type feedback"})]}),(0,Kt.jsxs)("div",{style:{padding:16,display:"flex",flexDirection:"column",gap:10},children:[i==="choose"&&(0,Kt.jsxs)(Kt.Fragment,{children:[(0,Kt.jsx)("button",{type:"button",onClick:()=>{l("voice"),n()},style:{padding:"12px 16px",borderRadius:10,border:"none",background:"linear-gradient(135deg, #2563eb, #1d4ed8)",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer"},children:"Describe the change"}),(0,Kt.jsx)("button",{type:"button",onClick:()=>{l("text")},style:{padding:"12px 16px",borderRadius:10,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.9)",fontSize:14,fontWeight:500,cursor:"pointer"},children:"Type feedback"})]}),i==="voice"&&(0,Kt.jsx)("button",{type:"button",onClick:a,disabled:!e,style:{padding:"12px 16px",borderRadius:10,border:"none",background:e?"linear-gradient(135deg, #2563eb, #1d4ed8)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:14,fontWeight:600,cursor:e?"pointer":"default"},children:e?"Save feedback":"Saving feedback\u2026"}),i==="text"&&(0,Kt.jsxs)(Kt.Fragment,{children:[(0,Kt.jsx)("textarea",{value:u,onChange:S=>c(S.target.value),placeholder:"Describe feedback","aria-label":"Feedback text",rows:3,style:{width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:10,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.95)",fontSize:14,resize:"vertical",minHeight:80}}),(0,Kt.jsx)("button",{type:"button",onClick:()=>{let S=u.trim();S&&r(S)},disabled:!u.trim(),style:{padding:"12px 16px",borderRadius:10,border:"none",background:u.trim()?"linear-gradient(135deg, #2563eb, #1d4ed8)":"rgba(255,255,255,0.1)",color:"#fff",fontSize:14,fontWeight:600,cursor:u.trim()?"pointer":"default"},children:"Save feedback"})]}),s&&i==="choose"&&(0,Kt.jsx)("button",{type:"button",onClick:s,style:{padding:"8px 12px",border:"none",background:"transparent",color:"rgba(255,255,255,0.5)",fontSize:13,cursor:"pointer",alignSelf:"flex-start"},children:"Discard"})]})]})}var Vs=pe(Ke()),h1=12;function m1({captureRoot:t,sessionMode:e,sessionPaused:n,sessionFeedbackPending:a,state:r,onElementClicked:s,onPause:i,onResume:l,onEnd:u,onRecordVoice:c,onDoneVoice:f,onSaveText:p,onCancel:m}){let S=(0,Ns.useRef)([]),[R,D]=(0,Ns.useState)(null),L=e&&!n&&a==null;if((0,Ns.useEffect)(()=>{if(!e||!t)return;let v=()=>e&&!n&&a==null;return S.current.push(u1(t,{getActive:v})),S.current.push(c1(t,{enabled:v,onElementClicked:s})),()=>{S.current.forEach(C=>C()),S.current=[],Wp(),Lv()}},[e,t,n,a,s]),(0,Ns.useEffect)(()=>{if(!(!L||!t?.isConnected))return document.body.style.cursor="pointer",()=>{document.body.style.cursor=""}},[L,t]),(0,Ns.useEffect)(()=>{if(!L){D(null);return}let v=C=>{D({x:C.clientX+h1,y:C.clientY+h1})};return window.addEventListener("mousemove",v,{passive:!0}),()=>window.removeEventListener("mousemove",v)},[L]),!e||!t)return null;let E=(0,Vs.jsxs)(Vs.Fragment,{children:[(0,Vs.jsx)(d1,{sessionPaused:n,onPause:i,onResume:l,onEnd:u}),L&&R!=null&&(0,Vs.jsx)("div",{"aria-hidden":!0,className:"echly-capture-tooltip",style:{position:"fixed",left:R.x,top:R.y,pointerEvents:"none",zIndex:2147483646,padding:"6px 10px",fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.95)",background:"rgba(0,0,0,0.75)",borderRadius:6,whiteSpace:"nowrap",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"},children:"Click to add feedback"}),a&&(0,Vs.jsx)(f1,{screenshot:a.screenshot,isVoiceListening:r==="voice_listening",onRecordVoice:c,onDoneVoice:f,onSaveText:p,onCancel:m})]});return(0,p1.createPortal)(E,t)}var er=pe(Ke());function y1({captureRoot:t,extensionMode:e,state:n,getFullTabImage:a,onRegionCaptured:r,onRegionSelectStart:s,onCancelCapture:i,sessionMode:l=!1,sessionPaused:u=!1,sessionFeedbackPending:c=null,onSessionElementClicked:f,onSessionPause:p,onSessionResume:m,onSessionEnd:S,onSessionRecordVoice:R,onSessionDoneVoice:D,onSessionSaveText:L,onSessionFeedbackCancel:E=()=>{}}){let v=l&&e;return(0,er.jsx)(er.Fragment,{children:(0,g1.createPortal)((0,er.jsxs)(er.Fragment,{children:[v&&f&&p&&m&&S&&R&&D&&L&&(0,er.jsx)(m1,{captureRoot:t,sessionMode:l,sessionPaused:u,sessionFeedbackPending:c??null,state:n,onElementClicked:f,onPause:p,onResume:m,onEnd:S,onRecordVoice:R,onDoneVoice:D,onSaveText:L,onCancel:E}),!v&&(n==="focus_mode"||n==="region_selecting")&&(0,er.jsx)("div",{className:"echly-focus-overlay",style:{position:"fixed",inset:0,background:"rgba(0,0,0,0.04)",pointerEvents:"auto",cursor:"crosshair",zIndex:2147483645},"aria-hidden":!0}),!v&&e&&(n==="focus_mode"||n==="region_selecting")&&(0,er.jsx)(GR,{getFullTabImage:a,onAddVoice:r,onCancel:i,onSelectionStart:s})]}),t)})}var Xp=pe(Cn());var jr=pe(Ke());function CF(){return(0,jr.jsxs)("svg",{width:"22",height:"22",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":!0,children:[(0,jr.jsx)("path",{d:"M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"}),(0,jr.jsx)("path",{d:"M19 10v2a7 7 0 0 1-14 0v-2"}),(0,jr.jsx)("line",{x1:"12",x2:"12",y1:"19",y2:"22"})]})}function I1({isRecording:t,isProcessing:e,audioLevel:n}){let a=t&&!e?1+Math.min(.1,n*.1):1;return(0,jr.jsx)("div",{className:["echly-recording-orb-inner",e?"echly-recording-orb-inner--processing":"",t&&!e?"echly-recording-orb-inner--listening":""].filter(Boolean).join(" "),style:t&&!e?{transform:`scale(${a})`}:void 0,"aria-hidden":!0,children:(0,jr.jsx)("span",{className:"echly-recording-orb-icon",style:{color:"#FFFFFF"},children:(0,jr.jsx)(CF,{})})})}var fa=pe(Ke());function _1({visible:t,isActive:e,isProcessing:n,isExiting:a=!1,audioLevel:r,onDone:s,onCancel:i}){let[l,u]=(0,Xp.useState)(!1);(0,Xp.useEffect)(()=>{if(e||n){let m=requestAnimationFrame(()=>{requestAnimationFrame(()=>u(!0))});return()=>cancelAnimationFrame(m)}let p=requestAnimationFrame(()=>u(!1));return()=>cancelAnimationFrame(p)},[e,n]);let c=n?"Saving feedback\u2026":e?"Listening\u2026":"Tell us what's happening \u2014 we'll structure it.",f=e&&!n;return t?(0,fa.jsx)("div",{className:"echly-recording-row","aria-live":"polite",role:"status",children:(0,fa.jsxs)("div",{className:["echly-recording-capsule",l?"echly-recording-capsule--expanded":"",n?"echly-recording-capsule--processing":"",a?"echly-recording-capsule--exiting":"",e&&!n?"echly-recording-capsule--recording":""].filter(Boolean).join(" "),children:[(0,fa.jsx)("div",{className:"echly-recording-orb",children:(0,fa.jsx)(I1,{isRecording:e,isProcessing:n,audioLevel:r})}),(0,fa.jsxs)("div",{className:"echly-recording-center",children:[(0,fa.jsx)("span",{className:"echly-recording-status",children:c}),f&&(0,fa.jsx)("span",{className:"echly-recording-esc-hint",children:"Press Esc to cancel"}),(0,fa.jsxs)("div",{className:"echly-recording-action-row",children:[(0,fa.jsx)("button",{type:"button",onClick:i,className:"echly-recording-cancel-pill","aria-label":"Discard",children:"Discard"}),e&&!n&&(0,fa.jsx)("button",{type:"button",className:"echly-recording-done",onClick:s,"aria-label":"Save feedback",children:"Save feedback"})]})]})]})}):null}var tr=pe(Cn()),Ft=pe(Ke());function LF(t,e){if(e==="all")return t;let n=Date.now(),a={today:24*60*60*1e3,"7days":7*24*60*60*1e3,"30days":30*24*60*60*1e3},r=n-a[e];return t.filter(s=>(s.updatedAt?new Date(s.updatedAt).getTime():0)>=r)}function AF(t){if(!t)return"\u2014";let e=new Date(t),a=new Date().getTime()-e.getTime(),r=Math.floor(a/6e4);if(r<1)return"Just now";if(r<60)return`${r}m ago`;let s=Math.floor(r/60);if(s<24)return`${s}h ago`;let i=Math.floor(s/24);return i<7?`${i}d ago`:e.toLocaleDateString()}function S1({open:t,onClose:e,fetchSessions:n,onSelectSession:a}){let[r,s]=(0,tr.useState)([]),[i,l]=(0,tr.useState)(!1),[u,c]=(0,tr.useState)(null),[f,p]=(0,tr.useState)(""),[m,S]=(0,tr.useState)("all");(0,tr.useEffect)(()=>{t&&(p(""),S("all"),c(null),l(!0),n().then(L=>{console.log("[Echly] Sessions returned:",L),s(L)}).catch(L=>c(L instanceof Error?L.message:"Failed to load sessions")).finally(()=>l(!1)))},[t,n]);let R=(0,tr.useMemo)(()=>{let L=LF(r,m);if(f.trim()){let E=f.trim().toLowerCase();L=L.filter(v=>(v.title??"").toLowerCase().includes(E)||(v.id??"").toLowerCase().includes(E))}return L},[r,m,f]),D=L=>{if(typeof L.feedbackCount=="number")return L.feedbackCount;let E=typeof L.openCount=="number"?L.openCount:0,v=typeof L.resolvedCount=="number"?L.resolvedCount:0,C=typeof L.skippedCount=="number"?L.skippedCount:0;return E+v+C};return t?(0,Ft.jsx)("div",{"data-echly-ui":"true",style:{position:"fixed",inset:0,zIndex:2147483647,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",padding:24},onClick:L=>L.target===L.currentTarget&&e(),role:"dialog","aria-modal":"true","aria-labelledby":"resume-session-modal-title",children:(0,Ft.jsxs)("div",{style:{width:"min(420px, 100%)",maxHeight:"85vh",borderRadius:16,background:"rgba(20,22,28,0.98)",backdropFilter:"blur(16px)",boxShadow:"0 24px 48px rgba(0,0,0,0.4)",border:"1px solid rgba(255,255,255,0.1)",overflow:"hidden",display:"flex",flexDirection:"column"},onClick:L=>L.stopPropagation(),children:[(0,Ft.jsxs)("div",{style:{padding:16,borderBottom:"1px solid rgba(255,255,255,0.08)"},children:[(0,Ft.jsx)("h2",{id:"resume-session-modal-title",style:{margin:"0 0 12px",fontSize:18,fontWeight:600,color:"rgba(255,255,255,0.95)"},children:"Resume Feedback Session"}),(0,Ft.jsx)("input",{type:"search",placeholder:"Search sessions",value:f,onChange:L=>p(L.target.value),"aria-label":"Search sessions",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.95)",fontSize:14}}),(0,Ft.jsx)("div",{style:{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"},children:["today","7days","30days","all"].map(L=>(0,Ft.jsx)("button",{type:"button",onClick:()=>S(L),style:{padding:"6px 10px",borderRadius:6,border:"none",background:m===L?"rgba(37, 99, 235, 0.4)":"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.9)",fontSize:12,fontWeight:500,cursor:"pointer"},children:L==="today"?"Today":L==="7days"?"Last 7 days":L==="30days"?"Last 30 days":"All sessions"},L))})]}),(0,Ft.jsxs)("div",{style:{flex:1,overflow:"auto",minHeight:200,maxHeight:360},children:[i&&(0,Ft.jsx)("div",{style:{padding:24,textAlign:"center",color:"rgba(255,255,255,0.6)"},children:"Loading sessions\u2026"}),u&&(0,Ft.jsx)("div",{style:{padding:24,color:"#ef4444",fontSize:14},children:u}),!i&&!u&&R.length===0&&(0,Ft.jsx)("div",{style:{padding:24,textAlign:"center",color:"rgba(255,255,255,0.6)"},children:"No sessions match."}),!i&&!u&&R.length>0&&(0,Ft.jsx)("ul",{style:{listStyle:"none",margin:0,padding:8},children:R.map(L=>(0,Ft.jsx)("li",{children:(0,Ft.jsxs)("button",{type:"button",onClick:()=>{a(L.id),e()},style:{width:"100%",textAlign:"left",padding:"12px 14px",borderRadius:10,border:"none",background:"transparent",color:"rgba(255,255,255,0.9)",fontSize:14,cursor:"pointer",marginBottom:4},onMouseEnter:E=>{E.currentTarget.style.background="rgba(255,255,255,0.08)"},onMouseLeave:E=>{E.currentTarget.style.background="transparent"},children:[(0,Ft.jsx)("div",{style:{fontWeight:600},children:L.title?.trim()||"Untitled Session"}),(0,Ft.jsxs)("div",{style:{fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:4},children:[D(L)," feedback items \xB7 ",AF(L.updatedAt)]})]})},L.id))})]}),(0,Ft.jsx)("div",{style:{padding:12,borderTop:"1px solid rgba(255,255,255,0.08)"},children:(0,Ft.jsx)("button",{type:"button",onClick:e,style:{padding:"8px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.8)",fontSize:13,cursor:"pointer"},children:"Cancel"})})]})}):null}var mt=pe(Ke()),xF=["focus_mode","region_selecting","voice_listening","processing"],RF=["voice_listening","processing"];function Qp({sessionId:t,userId:e,extensionMode:n=!1,initialPointers:a,onComplete:r,onDelete:s,widgetToggleRef:i,onRecordingChange:l,expanded:u,onExpandRequest:c,onCollapseRequest:f,captureDisabled:p=!1,theme:m="dark",onThemeToggle:S,fetchSessions:R,onResumeSessionSelect:D,loadSessionWithPointers:L,onSessionLoaded:E,onSessionEnd:v,onCreateSession:C,onActiveSessionChange:x,globalSessionModeActive:H,globalSessionPaused:G,onSessionModeStart:_,onSessionModePause:y,onSessionModeResume:I,onSessionModeEnd:b}){let[w,A]=(0,nr.useState)(!1),{state:T,handlers:$,refs:He,captureRootEl:At}=e1({sessionId:t,userId:e,extensionMode:n,initialPointers:a,onComplete:r,onDelete:s,onRecordingChange:l,loadSessionWithPointers:L,onSessionLoaded:E,onCreateSession:C,onActiveSessionChange:x,globalSessionModeActive:H,globalSessionPaused:G,onSessionModeStart:_,onSessionModePause:y,onSessionModeResume:I,onSessionModeEnd:b}),O=u!==void 0?u:T.isOpen,U=(0,nr.useRef)(null),J=xF.includes(T.state)||T.pillExiting,Q=(RF.includes(T.state)||T.pillExiting)&&!T.sessionFeedbackPending,re=!J&&!T.sessionMode,We=T.sessionMode&&T.sessionPaused,Oe=!O&&re&&!We,$e=O&&re||We,Je=(0,nr.useRef)(!1);(0,nr.useEffect)(()=>{if(!J){Je.current=!1;return}Je.current||(Je.current=!0,f?.())},[J,f]);let bn=T.pointers.length,yn=T.pointers.filter(N=>/critical|bug|high|urgent/i.test(N.type||"")).length,ot=bn>0?yn>0?`${bn} insights \u2022 ${yn} need attention`:`${bn} insights`:null;return(0,nr.useEffect)(()=>{T.highlightTicketId&&U.current&&U.current.scrollTo({top:0,behavior:"smooth"})},[T.highlightTicketId]),nr.default.useEffect(()=>{if(i)return i.current=$.toggleOpen,()=>{i.current=null}},[$,i]),(0,mt.jsxs)(mt.Fragment,{children:[n&&R&&D&&(0,mt.jsx)(S1,{open:w,onClose:()=>A(!1),fetchSessions:R,onSelectSession:N=>{D(N),A(!1)}}),At&&(0,mt.jsx)(y1,{captureRoot:At,extensionMode:n,state:T.state,getFullTabImage:$.getFullTabImage,onRegionCaptured:$.handleRegionCaptured,onRegionSelectStart:$.handleRegionSelectStart,onCancelCapture:$.handleCancelCapture,sessionMode:T.sessionMode,sessionPaused:T.sessionPaused,sessionFeedbackPending:T.sessionFeedbackPending,onSessionElementClicked:$.handleSessionElementClicked,onSessionPause:()=>{$.pauseSession(),c?.()},onSessionResume:()=>{$.resumeSession(),f?.()},onSessionEnd:()=>{$.endSession(),v?.()},onSessionRecordVoice:$.handleSessionStartVoice,onSessionDoneVoice:$.finishListening,onSessionSaveText:$.handleSessionFeedbackSubmit,onSessionFeedbackCancel:$.handleSessionFeedbackCancel}),Q&&(0,mt.jsx)(mt.Fragment,{children:(0,mt.jsx)(_1,{visible:!0,isActive:T.state==="voice_listening",isProcessing:T.state==="processing"||T.pillExiting,isExiting:T.pillExiting,audioLevel:T.listeningAudioLevel??0,sentiment:T.listeningSentiment??"neutral",liveTranscript:T.liveTranscript??"",onDone:$.finishListening,onCancel:$.handleCancelCapture})}),Oe&&(0,mt.jsx)("div",{className:"echly-floating-trigger-wrapper",children:(0,mt.jsx)("button",{type:"button",onClick:()=>c?c():$.setIsOpen(!0),className:"echly-floating-trigger",children:n?"Echly":"Capture feedback"})}),$e&&(0,mt.jsxs)(mt.Fragment,{children:[!n&&(0,mt.jsx)("div",{className:"echly-backdrop",style:{position:"fixed",inset:0,zIndex:2147483646,background:"rgba(0,0,0,0.06)",pointerEvents:"auto"},"aria-hidden":!0}),(0,mt.jsx)("div",{ref:He.widgetRef,className:"echly-sidebar-container",style:n?{position:"fixed",...T.position?{left:T.position.x,top:T.position.y}:{bottom:"24px",right:"24px"},zIndex:2147483647,pointerEvents:"auto"}:void 0,children:(0,mt.jsxs)("div",{className:"echly-sidebar-surface",children:[(0,mt.jsx)(Ev,{onClose:()=>f?f():$.setIsOpen(!1),summary:ot,theme:m,onThemeToggle:S}),(0,mt.jsxs)("div",{ref:U,className:"echly-sidebar-body",children:[(0,mt.jsx)("div",{className:"echly-feedback-list",children:T.pointers.map(N=>(0,mt.jsx)(i1,{item:N,expandedId:T.expandedId,editingId:T.editingId,editedTitle:T.editedTitle,editedDescription:T.editedDescription,onExpand:$.setExpandedId,onStartEdit:$.startEditing,onSaveEdit:$.saveEdit,onDelete:$.deletePointer,onEditedTitleChange:$.setEditedTitle,onEditedDescriptionChange:$.setEditedDescription,highlightTicketId:T.highlightTicketId},N.id))}),T.errorMessage&&(0,mt.jsx)("div",{className:"echly-sidebar-error",children:T.errorMessage}),T.state==="idle"&&(0,mt.jsx)(bv,{isIdle:!0,onAddFeedback:$.handleAddFeedback,extensionMode:n,onStartSession:n?$.startSession:void 0,onResumeSession:n&&R&&D?()=>A(!0):void 0,captureDisabled:p})]})]})})]})]})}var gt=pe(Ke()),kF="echly-root",ed="echly-shadow-host",T1="widget-theme";function DF(){try{let t=localStorage.getItem(T1);return t==="dark"||t==="light"?t:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{return"dark"}}function PF(t,e){t.setAttribute("data-theme",e);try{localStorage.setItem(T1,e)}catch{}}function OF(){chrome.runtime.sendMessage({type:"ECHLY_OPEN_POPUP"}).catch(()=>{})}function MF({widgetRoot:t,initialTheme:e}){let[n,a]=ve.default.useState(null),[r,s]=ve.default.useState(null),[i,l]=ve.default.useState(!1),[u,c]=ve.default.useState(e),[f,p]=ve.default.useState({visible:!1,expanded:!1,isRecording:!1,sessionId:null,sessionModeActive:!1,sessionPaused:!1}),[m,S]=ve.default.useState(null),[R,D]=ve.default.useState(null),L=m??f.sessionId,E=ve.default.useRef(null),v=ve.default.useRef(!1),[C,x]=ve.default.useState(null),[H,G]=ve.default.useState(!1),[_,y]=ve.default.useState(!1),[I,b]=ve.default.useState(""),w=ve.default.useRef(null),A=ve.default.useRef(!1),[T,$]=ve.default.useState(!1),He=typeof chrome<"u"&&chrome.runtime?.getURL?chrome.runtime.getURL("assets/Echly_logo.svg"):"/Echly_logo.svg";ve.default.useEffect(()=>{let N=()=>{E.current?.()};return window.addEventListener("ECHLY_TOGGLE_WIDGET",N),()=>{window.removeEventListener("ECHLY_TOGGLE_WIDGET",N)}},[]),ve.default.useEffect(()=>{let N=ae=>{let ie=ae.detail?.state;ie&&p(ie)};return window.addEventListener("ECHLY_GLOBAL_STATE",N),()=>window.removeEventListener("ECHLY_GLOBAL_STATE",N)},[]),ve.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},N=>{let ae=E1(N);if(!ae)return;let ie=document.getElementById(ed);ie&&(ie.style.display=ae.visible?"block":"none"),b1(ae)})},[]),ve.default.useEffect(()=>{if(!f.sessionModeActive||!f.sessionId)return;let N=!1;return(async()=>{try{let ae=await vt(`/api/feedback?sessionId=${encodeURIComponent(f.sessionId)}&limit=50`);if(N)return;let ye=((await ae.json()).feedback??[]).map(Te=>({id:Te.id,title:Te.title??"",description:Te.description??"",type:Te.type??"Feedback"}));if(N)return;D({sessionId:f.sessionId,pointers:ye})}catch(ae){N||(console.error("[Echly] Failed to load session feedback for markers:",ae),D({sessionId:f.sessionId,pointers:[]}))}})(),()=>{N=!0}},[f.sessionModeActive,f.sessionId]),ve.default.useEffect(()=>{let N=()=>{let ie=window.location.origin;if(!(ie==="https://echly-web.vercel.app"||ie==="http://localhost:3000"))return;let ye=window.location.pathname.split("/").filter(Boolean);ye[0]==="dashboard"&&ye[1]&&chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:ye[1]},()=>{})};N(),window.addEventListener("popstate",N);let ae=setInterval(N,2e3);return()=>{window.removeEventListener("popstate",N),clearInterval(ae)}},[]);let At=ve.default.useCallback(N=>{N?chrome.runtime.sendMessage({type:"START_RECORDING"},ae=>{if(chrome.runtime.lastError){s(chrome.runtime.lastError.message||"Failed to start recording");return}ae?.ok||s(ae?.error||"No active session selected.")}):chrome.runtime.sendMessage({type:"STOP_RECORDING"}).catch(()=>{})},[]),M=ve.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_EXPAND_WIDGET"}).catch(()=>{})},[]),O=ve.default.useCallback(()=>{chrome.runtime.sendMessage({type:"ECHLY_COLLAPSE_WIDGET"}).catch(()=>{})},[]),U=ve.default.useCallback(()=>{let N=u==="dark"?"light":"dark";c(N),PF(t,N)},[u,t]);ve.default.useEffect(()=>{chrome.runtime.sendMessage({type:"ECHLY_GET_AUTH_STATE"},N=>{N?.authenticated&&N.user?.uid?a({uid:N.user.uid,name:N.user.name??null,email:N.user.email??null,photoURL:N.user.photoURL??null}):a(null),l(!0)})},[]);let J=ve.default.useCallback(async(N,ae,ie,ue,ye)=>{if(!v.current){if(v.current=!0,!L||!n){ie?.onError(),v.current=!1;return}if(ie){(async()=>{let Te=Zy(ae??null),Wt=zy(),ft=Hy(),Ze=ae?Gy(ae,L,ft):Promise.resolve(null),Xe=await Te;console.log("[OCR] Extracted visibleText:",Xe);let Ie=typeof window<"u"?window.location.href:"",de={...ue??{},visibleText:Xe?.trim()&&Xe||ue?.visibleText||null,url:ue?.url??Ie},Ve={transcript:N,context:de};try{console.log("[VOICE] final transcript submitted",N);let ke=await(await vt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Ve)})).json(),Qe=Array.isArray(ke.tickets)?ke.tickets:[],et=typeof ke.clarityScore=="number"?ke.clarityScore:ke.clarityScore!=null?Number(ke.clarityScore):100,tt=ke.clarityIssues??[],Bt=ke.suggestedRewrite??null,an=ke.confidence??.5;if(!!!ye?.sessionMode){if(ke.success&&et<=20){console.log("CLARITY GUARD TRIGGERED",et),x({tickets:Qe,screenshotUrl:null,screenshotId:ft,uploadPromise:Ze,transcript:N,screenshot:ae,firstFeedbackId:Wt,clarityScore:et,clarityIssues:tt,suggestedRewrite:Bt,confidence:an,callbacks:ie,context:de}),b(N),y(!1),A.current=!1,$(!1),G(!0),v.current=!1;return}let Be=!!ke.needsClarification,De=ke.verificationIssues??[];if(ke.success&&Be&&Qe.length===0){console.log("PIPELINE NEEDS CLARIFICATION",De),x({tickets:[],screenshotUrl:null,screenshotId:ft,uploadPromise:Ze,transcript:N,screenshot:ae,firstFeedbackId:Wt,clarityScore:et,clarityIssues:De.length>0?De:tt,suggestedRewrite:Bt,confidence:an,callbacks:ie,context:de}),b(N),y(!1),A.current=!1,$(!1),G(!0),v.current=!1;return}}if(!ke.success||Qe.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N,screenshotUrl:null,screenshotId:ft,sessionId:L,context:de}},Be=>{if(v.current=!1,chrome.runtime.lastError){ie.onError();return}if(Be?.success&&Be.ticket){let De=Be.ticket.id;ie.onSuccess({id:De,title:Be.ticket.title,description:Be.ticket.description,type:Be.ticket.type??"Feedback"}),Ze.then(xt=>{xt&&vt(`/api/tickets/${De}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:xt})}).catch(()=>{})}).catch(()=>{})}else ie.onError()});return}let Tt=et>=85?"clear":et>=60?"needs_improvement":"unclear",wn={clarityScore:et,clarityIssues:tt,clarityConfidence:an,clarityStatus:Tt},yt;for(let Be=0;Be<Qe.length;Be++){let De=Qe[Be],xt=typeof De.description=="string"?De.description:De.title??"",Yn={sessionId:L,title:De.title??"",description:xt,type:Array.isArray(De.suggestedTags)&&De.suggestedTags[0]?De.suggestedTags[0]:"Feedback",contextSummary:xt,actionSteps:Array.isArray(De.actionSteps)?De.actionSteps:[],suggestedTags:De.suggestedTags,screenshotUrl:null,screenshotId:Be===0?ft:void 0,metadata:{clientTimestamp:Date.now()},...wn},ha=await(await vt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Yn)})).json();if(ha.success&&ha.ticket){let ba=ha.ticket;yt||(yt={id:ba.id,title:ba.title,description:ba.description,type:ba.type??"Feedback"})}}if(v.current=!1,yt){let Be=yt.id;Ze.then(De=>{De&&vt(`/api/tickets/${Be}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:De})}).catch(()=>{})}).catch(()=>{}),ie.onSuccess(yt)}else ie.onError()}catch(Re){console.error("[Echly] Structure or submit failed:",Re),v.current=!1,ie.onError()}})();return}try{let Te=Hy(),Wt=ae?Gy(ae,L,Te):Promise.resolve(null),ft=await Zy(ae??null);console.log("[OCR] Extracted visibleText:",ft);let Ze=typeof window<"u"?window.location.href:"",Xe={transcript:N,context:{...ue??{},visibleText:ft?.trim()&&ft||ue?.visibleText||null,url:ue?.url??Ze}};console.log("[VOICE] final transcript submitted",N);let de=await(await vt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Xe)})).json(),Ve=Array.isArray(de.tickets)?de.tickets:[],Re=de.clarityScore??100,ke=de.clarityIssues??[],Qe=de.suggestedRewrite??null,et=de.confidence??.5;if(!de.success||Ve.length===0)return;let tt=Re>=85?"clear":Re>=60?"needs_improvement":"unclear",Bt={clarityScore:Re,clarityIssues:ke,clarityConfidence:et,clarityStatus:tt},an;for(let In=0;In<Ve.length;In++){let Tt=Ve[In],wn=typeof Tt.description=="string"?Tt.description:Tt.title??"",yt={sessionId:L,title:Tt.title??"",description:wn,type:Array.isArray(Tt.suggestedTags)&&Tt.suggestedTags[0]?Tt.suggestedTags[0]:"Feedback",contextSummary:wn,actionSteps:Array.isArray(Tt.actionSteps)?Tt.actionSteps:[],suggestedTags:Tt.suggestedTags,screenshotUrl:null,screenshotId:In===0?Te:void 0,metadata:{clientTimestamp:Date.now()},...Bt},De=await(await vt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(yt)})).json();if(De.success&&De.ticket){let xt=De.ticket;an||(an={id:xt.id,title:xt.title,description:xt.description,type:xt.type??"Feedback"})}}if(an){let In=an.id;Wt.then(Tt=>{Tt&&vt(`/api/tickets/${In}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Tt})}).catch(()=>{})}).catch(()=>{})}return an}finally{v.current=!1}}},[L,n]),Q=ve.default.useCallback(async N=>{},[]),re=ve.default.useCallback(async()=>{let N=await vt("/api/sessions"),ae=await N.json(),ie=ae.sessions??[];return console.log("[Echly] Sessions returned:",{ok:N.ok,status:N.status,success:ae.success,count:ie.length,sessions:ie}),!N.ok||!ae.success?[]:ie},[]),We=ve.default.useCallback(async()=>{console.log("[Echly] Creating session");try{let N=await vt("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),ae=await N.json();return console.log("[Echly] Create session response:",{ok:N.ok,status:N.status,success:ae.success,sessionId:ae.session?.id}),!N.ok||!ae.success||!ae.session?.id?null:{id:ae.session.id}}catch(N){return console.error("[Echly] Failed to create session:",N),null}},[]),Oe=ve.default.useCallback(N=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:N},()=>{}),S(N)},[]),$e=ve.default.useCallback(async N=>{chrome.runtime.sendMessage({type:"ECHLY_SET_ACTIVE_SESSION",sessionId:N},()=>{}),S(N);try{let ye=((await(await vt(`/api/feedback?sessionId=${encodeURIComponent(N)}&limit=50`)).json()).feedback??[]).map(Te=>({id:Te.id,title:Te.title??"",description:Te.description??"",type:Te.type??"Feedback"}));D({sessionId:N,pointers:ye})}catch(ae){console.error("[Echly] Failed to load session feedback:",ae),D({sessionId:N,pointers:[]})}},[]),Je=ve.default.useCallback(async N=>{if(!L)return;if(N.tickets.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:N.transcript,screenshotUrl:null,screenshotId:N.screenshotId,sessionId:L,context:N.context??{}}},ue=>{if(chrome.runtime.lastError){console.error("[Echly] Submit anyway failed:",chrome.runtime.lastError.message),N.callbacks.onError();return}if(ue?.success&&ue.ticket){let ye=ue.ticket.id;N.callbacks.onSuccess({id:ye,title:ue.ticket.title,description:ue.ticket.description,type:ue.ticket.type??"Feedback"}),N.uploadPromise.then(Te=>{Te&&vt(`/api/tickets/${ye}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Te})}).catch(()=>{})}).catch(()=>{})}else N.callbacks.onError()});return}let ae={clarityScore:N.clarityScore,clarityIssues:N.clarityIssues,clarityConfidence:N.confidence,clarityStatus:N.clarityScore>=85?"clear":N.clarityScore>=60?"needs_improvement":"unclear"},ie;for(let ue=0;ue<N.tickets.length;ue++){let ye=N.tickets[ue],Te=typeof ye.description=="string"?ye.description:ye.title??"",Wt={sessionId:L,title:ye.title??"",description:Te,type:Array.isArray(ye.suggestedTags)&&ye.suggestedTags[0]?ye.suggestedTags[0]:"Feedback",contextSummary:Te,actionSteps:Array.isArray(ye.actionSteps)?ye.actionSteps:[],suggestedTags:ye.suggestedTags,screenshotUrl:null,screenshotId:ue===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...ae},Ze=await(await vt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Wt)})).json();if(Ze.success&&Ze.ticket){let Xe=Ze.ticket;ie||(ie={id:Xe.id,title:Xe.title,description:Xe.description,type:Xe.type??"Feedback"})}}if(ie){let ue=ie.id;N.uploadPromise.then(ye=>{ye&&vt(`/api/tickets/${ue}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ye})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(ie)}else N.callbacks.onError()},[L]),bn=ve.default.useCallback(async(N,ae)=>{if(!L)return;let ie=ae.trim();try{let ue={transcript:ie,context:N.context??{}},Te=await(await vt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ue)})).json(),Wt=Array.isArray(Te.tickets)?Te.tickets:[],ft=Te.clarityScore??100,Ze=Te.confidence??.5,Xe=ft>=85?"clear":ft>=60?"needs_improvement":"unclear",Ie={clarityScore:ft,clarityIssues:Te.clarityIssues??[],clarityConfidence:Ze,clarityStatus:Xe};if(Wt.length===0){chrome.runtime.sendMessage({type:"ECHLY_PROCESS_FEEDBACK",payload:{transcript:ie,screenshotUrl:null,screenshotId:N.screenshotId,sessionId:L,context:N.context??{}}},Ve=>{if(chrome.runtime.lastError){console.error("[Echly] Submit edited feedback failed:",chrome.runtime.lastError.message),N.callbacks.onError();return}if(Ve?.success&&Ve.ticket){let Re=Ve.ticket.id;N.callbacks.onSuccess({id:Re,title:Ve.ticket.title,description:Ve.ticket.description,type:Ve.ticket.type??"Feedback"}),N.uploadPromise.then(ke=>{ke&&vt(`/api/tickets/${Re}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:ke})}).catch(()=>{})}).catch(()=>{})}else N.callbacks.onError()});return}let de;for(let Ve=0;Ve<Wt.length;Ve++){let Re=Wt[Ve],ke=typeof Re.description=="string"?Re.description:Re.title??"",Qe={sessionId:L,title:Re.title??"",description:ke,type:Array.isArray(Re.suggestedTags)&&Re.suggestedTags[0]?Re.suggestedTags[0]:"Feedback",contextSummary:ke,actionSteps:Array.isArray(Re.actionSteps)?Re.actionSteps:[],suggestedTags:Re.suggestedTags,screenshotUrl:null,screenshotId:Ve===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...Ie},tt=await(await vt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Qe)})).json();if(tt.success&&tt.ticket){let Bt=tt.ticket;de||(de={id:Bt.id,title:Bt.title,description:Bt.description,type:Bt.type??"Feedback"})}}if(de){let Ve=de.id;N.uploadPromise.then(Re=>{Re&&vt(`/api/tickets/${Ve}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Re})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(de)}else N.callbacks.onError()}catch(ue){console.error("[Echly] Submit edited feedback failed:",ue),N.callbacks.onError()}},[L]),yn=ve.default.useCallback(async()=>{let N=C;if(!(!N?.suggestedRewrite?.trim()||!L)){x(null);try{let ie=await(await vt("/api/structure-feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transcript:N.suggestedRewrite.trim()})})).json(),ue=Array.isArray(ie.tickets)?ie.tickets:[],ye=ie.clarityScore??100,Te=ie.confidence??.5,Wt=ye>=85?"clear":ye>=60?"needs_improvement":"unclear",ft={clarityScore:ye,clarityIssues:ie.clarityIssues??[],clarityConfidence:Te,clarityStatus:Wt},Ze;for(let Xe=0;Xe<ue.length;Xe++){let Ie=ue[Xe],de=typeof Ie.description=="string"?Ie.description:Ie.title??"",Ve={sessionId:L,title:Ie.title??"",description:de,type:Array.isArray(Ie.suggestedTags)&&Ie.suggestedTags[0]?Ie.suggestedTags[0]:"Feedback",contextSummary:de,actionSteps:Array.isArray(Ie.actionSteps)?Ie.actionSteps:[],suggestedTags:Ie.suggestedTags,screenshotUrl:null,screenshotId:Xe===0?N.screenshotId:void 0,metadata:{clientTimestamp:Date.now()},...ft},ke=await(await vt("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Ve)})).json();if(ke.success&&ke.ticket){let Qe=ke.ticket;Ze||(Ze={id:Qe.id,title:Qe.title,description:Qe.description,type:Qe.type??"Feedback"})}}if(Ze){let Xe=Ze.id;N.uploadPromise.then(Ie=>{Ie&&vt(`/api/tickets/${Xe}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({screenshotUrl:Ie})}).catch(()=>{})}).catch(()=>{}),N.callbacks.onSuccess(Ze)}else N.callbacks.onError()}catch(ae){console.error("[Echly] Use suggestion failed:",ae),N.callbacks.onError()}}},[C,L]);if(ve.default.useEffect(()=>{_&&w.current&&w.current.focus()},[_]),!i)return null;if(!n)return(0,gt.jsx)("div",{style:{pointerEvents:"auto"},children:(0,gt.jsxs)("button",{type:"button",title:"Sign in from extension",onClick:OF,style:{display:"flex",alignItems:"center",gap:"12px",padding:"10px 20px",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.08)",background:"#fff",color:"#6b7280",fontSize:"14px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.08)"},children:[(0,gt.jsx)("img",{src:He,alt:"",width:22,height:22,style:{display:"block"}}),"Sign in from extension"]})});let ot=C;return(0,gt.jsxs)(gt.Fragment,{children:[H&&ot&&(0,gt.jsx)("div",{style:{position:"fixed",top:0,left:0,width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.15)",zIndex:999999,fontFamily:'-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif'},children:(0,gt.jsxs)("div",{style:{maxWidth:420,width:"90%",background:"#F8FBFF",borderRadius:12,padding:20,boxShadow:"0 12px 32px rgba(0,0,0,0.12)",border:"1px solid #E6F0FF",animation:"echly-clarity-card-in 150ms ease-out"},children:[(0,gt.jsx)("div",{style:{fontWeight:600,fontSize:15,marginBottom:6,color:"#111"},children:"Quick suggestion"}),(0,gt.jsx)("div",{style:{fontSize:14,color:"#374151",marginBottom:8},children:"Your feedback may be unclear."}),(0,gt.jsx)("div",{style:{fontSize:13,color:"#6b7280",marginBottom:10},children:"Try specifying what looks wrong and what change you want."}),ot.suggestedRewrite&&(0,gt.jsxs)("div",{style:{fontSize:13,fontStyle:"italic",color:"#4b5563",marginBottom:12,opacity:.9},children:['Example: "',ot.suggestedRewrite,'"']}),(0,gt.jsx)("textarea",{ref:w,value:I,onChange:N=>b(N.target.value),disabled:!_,rows:3,placeholder:"Your feedback","aria-label":"Feedback message",style:{width:"100%",boxSizing:"border-box",padding:"10px 12px",borderRadius:8,border:"1px solid #E6F0FF",fontSize:14,resize:"vertical",minHeight:72,marginBottom:16,background:_?"#fff":"#f3f4f6",color:"#111"}}),(0,gt.jsx)("div",{style:{display:"flex",gap:8,justifyContent:"flex-end"},children:_?(0,gt.jsx)("button",{type:"button",disabled:T,onClick:()=>{if(A.current||!ot)return;A.current=!0,$(!0),G(!1),x(null),y(!1),bn(ot,I).catch(ie=>console.error("[Echly] Done submission failed:",ie)).finally(()=>{A.current=!1,$(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:T?"default":"pointer",opacity:T?.8:1},children:"Done"}):(0,gt.jsxs)(gt.Fragment,{children:[(0,gt.jsx)("button",{type:"button",disabled:T,onClick:()=>y(!0),style:{background:"transparent",border:"1px solid #E6F0FF",borderRadius:8,padding:"8px 14px",fontSize:14,color:"#374151",cursor:T?"default":"pointer",opacity:T?.7:1},children:"Edit feedback"}),(0,gt.jsx)("button",{type:"button",disabled:T,onClick:()=>{if(A.current||!ot)return;A.current=!0,$(!0),G(!1),x(null),y(!1),Je(ot).catch(ae=>console.error("[Echly] Submit anyway failed:",ae)).finally(()=>{A.current=!1,$(!1)})},style:{background:"#3B82F6",color:"white",border:"none",borderRadius:8,padding:"8px 14px",fontSize:14,fontWeight:500,cursor:T?"default":"pointer",opacity:T?.8:1},children:"Submit anyway"})]})})]})}),(0,gt.jsx)(Qp,{sessionId:L??"",userId:n.uid,extensionMode:!0,onComplete:J,onDelete:Q,widgetToggleRef:E,onRecordingChange:At,expanded:f.expanded,onExpandRequest:M,onCollapseRequest:O,captureDisabled:!1,theme:u,onThemeToggle:U,fetchSessions:re,onResumeSessionSelect:$e,loadSessionWithPointers:R,onSessionLoaded:()=>D(null),onSessionEnd:()=>S(null),onCreateSession:We,onActiveSessionChange:Oe,globalSessionModeActive:f.sessionModeActive??!1,globalSessionPaused:f.sessionPaused??!1,onSessionModeStart:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_START"}).catch(()=>{}),onSessionModePause:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_PAUSE"}).catch(()=>{}),onSessionModeResume:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_RESUME"}).catch(()=>{}),onSessionModeEnd:()=>chrome.runtime.sendMessage({type:"ECHLY_SESSION_MODE_END"}).catch(()=>{})})]})}var NF=`
  :host { all: initial; }
  #echly-root {
    all: initial;
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, system-ui, sans-serif;
  }
  #echly-root * { box-sizing: border-box; }
`;function VF(t){if(t.querySelector("#echly-styles"))return;let e=document.createElement("link");e.id="echly-styles",e.rel="stylesheet",e.href=chrome.runtime.getURL("popup.css"),t.appendChild(e);let n=document.createElement("style");n.id="echly-reset",n.textContent=NF,t.appendChild(n)}function UF(t){let e=t.attachShadow({mode:"open"});VF(e);let n=document.createElement("div");n.id=kF,n.setAttribute("data-echly-ui","true"),n.style.all="initial",n.style.boxSizing="border-box",n.style.pointerEvents="auto",n.style.width="auto",n.style.height="auto";let a=DF();n.setAttribute("data-theme",a),e.appendChild(n),(0,v1.createRoot)(n).render((0,gt.jsx)(MF,{widgetRoot:n,initialTheme:a}))}function E1(t){return t?{visible:t.visible??!1,expanded:t.expanded??!1,isRecording:t.isRecording??!1,sessionId:t.sessionId??null,sessionModeActive:t.sessionModeActive??!1,sessionPaused:t.sessionPaused??!1}:null}function b1(t){window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:t}}))}function FF(){document.addEventListener("visibilitychange",()=>{document.hidden||chrome.runtime.sendMessage({type:"ECHLY_GET_GLOBAL_STATE"},t=>{let e=E1(t);if(!e)return;let n=document.getElementById(ed);n&&(n.style.display=e.visible?"block":"none"),b1(e)})})}function BF(t){let e=window;e.__ECHLY_MESSAGE_LISTENER__||(e.__ECHLY_MESSAGE_LISTENER__=!0,chrome.runtime.onMessage.addListener(n=>{if(n.type==="ECHLY_FEEDBACK_CREATED"&&n.ticket&&n.sessionId){window.dispatchEvent(new CustomEvent("ECHLY_FEEDBACK_CREATED",{detail:{ticket:n.ticket,sessionId:n.sessionId}}));return}let a=document.getElementById(ed);a&&(n.type==="ECHLY_GLOBAL_STATE"&&n.state&&(a.style.display=n.state.visible?"block":"none",window.dispatchEvent(new CustomEvent("ECHLY_GLOBAL_STATE",{detail:{state:n.state}}))),n.type==="ECHLY_TOGGLE"&&window.dispatchEvent(new CustomEvent("ECHLY_TOGGLE_WIDGET")))}))}function qF(){let t=document.getElementById(ed);t||(t=document.createElement("div"),t.id=ed,t.setAttribute("data-echly-ui","true"),t.style.position="fixed",t.style.bottom="24px",t.style.right="24px",t.style.width="auto",t.style.height="auto",t.style.zIndex="2147483647",t.style.pointerEvents="auto",t.style.display="none",document.documentElement.appendChild(t),UF(t)),BF(t),FF()}qF();})();
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
