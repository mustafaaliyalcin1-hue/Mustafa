(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Wl="170",jd=0,Nc=1,Jd=2,wu=1,Au=2,Wn=3,yi=0,Xe=1,Re=2,fi=0,ks=1,Aa=2,Oc=3,Uc=4,Qd=5,Hi=100,tf=101,ef=102,nf=103,sf=104,rf=200,af=201,of=202,lf=203,Vo=204,Wo=205,cf=206,hf=207,uf=208,df=209,ff=210,pf=211,mf=212,gf=213,vf=214,Xo=0,Ko=1,Yo=2,Is=3,$o=4,qo=5,Zo=6,jo=7,Xl=0,yf=1,xf=2,pi=0,_f=1,Mf=2,bf=3,Ru=4,Sf=5,Ef=6,Tf=7,Fc="attached",wf="detached",ku=300,Ds=301,Ns=302,Jo=303,Qo=304,Fa=306,Xi=1e3,Vi=1001,tl=1002,on=1003,Af=1004,Pr=1005,kn=1006,$a=1007,Wi=1008,Yn=1009,Cu=1010,Pu=1011,_r=1012,Kl=1013,Ki=1014,bn=1015,Rr=1016,Yl=1017,$l=1018,Os=1020,Lu=35902,Iu=1021,Du=1022,dn=1023,Nu=1024,Ou=1025,Cs=1026,Us=1027,ql=1028,Zl=1029,Uu=1030,jl=1031,Jl=1033,ya=33776,xa=33777,_a=33778,Ma=33779,el=35840,nl=35841,il=35842,sl=35843,rl=36196,al=37492,ol=37496,ll=37808,cl=37809,hl=37810,ul=37811,dl=37812,fl=37813,pl=37814,ml=37815,gl=37816,vl=37817,yl=37818,xl=37819,_l=37820,Ml=37821,ba=36492,bl=36494,Sl=36495,Fu=36283,El=36284,Tl=36285,wl=36286,Rf=3200,kf=3201,Ql=0,Cf=1,ci="",Ge="srgb",Bs="srgb-linear",za="linear",de="srgb",Ji=7680,zc=519,Pf=512,Lf=513,If=514,zu=515,Df=516,Nf=517,Of=518,Uf=519,Al=35044,Bc="300 es",Xn=2e3,Ra=2001;class Hs{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,t);t.target=null}}}const ze=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qa=Math.PI/180,Rl=180/Math.PI;function Cn(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(ze[s&255]+ze[s>>8&255]+ze[s>>16&255]+ze[s>>24&255]+"-"+ze[t&255]+ze[t>>8&255]+"-"+ze[t>>16&15|64]+ze[t>>24&255]+"-"+ze[e&63|128]+ze[e>>8&255]+"-"+ze[e>>16&255]+ze[e>>24&255]+ze[n&255]+ze[n>>8&255]+ze[n>>16&255]+ze[n>>24&255]).toLowerCase()}function Le(s,t,e){return Math.max(t,Math.min(e,s))}function Ff(s,t){return(s%t+t)%t}function Za(s,t,e){return(1-e)*s+e*t}function Rn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function fe(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}class vt{constructor(t=0,e=0){vt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*i+t.x,this.y=r*i+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Zt{constructor(t,e,n,i,r,a,o,l,c){Zt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c)}set(t,e,n,i,r,a,o,l,c){const h=this.elements;return h[0]=t,h[1]=i,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],p=n[8],v=i[0],g=i[3],m=i[6],_=i[1],x=i[4],y=i[7],R=i[2],w=i[5],T=i[8];return r[0]=a*v+o*_+l*R,r[3]=a*g+o*x+l*w,r[6]=a*m+o*y+l*T,r[1]=c*v+h*_+u*R,r[4]=c*g+h*x+u*w,r[7]=c*m+h*y+u*T,r[2]=f*v+d*_+p*R,r[5]=f*g+d*x+p*w,r[8]=f*m+d*y+p*T,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=h*a-o*c,f=o*l-h*r,d=c*r-a*l,p=e*u+n*f+i*d;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/p;return t[0]=u*v,t[1]=(i*c-h*n)*v,t[2]=(o*n-i*a)*v,t[3]=f*v,t[4]=(h*e-i*l)*v,t[5]=(i*r-o*e)*v,t[6]=d*v,t[7]=(n*l-c*e)*v,t[8]=(a*e-n*r)*v,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-i*c,i*l,-i*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(ja.makeScale(t,e)),this}rotate(t){return this.premultiply(ja.makeRotation(-t)),this}translate(t,e){return this.premultiply(ja.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const ja=new Zt;function Bu(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function ka(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function zf(){const s=ka("canvas");return s.style.display="block",s}const Hc={};function cr(s){s in Hc||(Hc[s]=!0,console.warn(s))}function Bf(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function Hf(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Gf(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const ie={enabled:!0,workingColorSpace:Bs,spaces:{},convert:function(s,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===de&&(s.r=Kn(s.r),s.g=Kn(s.g),s.b=Kn(s.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(s.applyMatrix3(this.spaces[t].toXYZ),s.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===de&&(s.r=Ps(s.r),s.g=Ps(s.g),s.b=Ps(s.b))),s},fromWorkingColorSpace:function(s,t){return this.convert(s,this.workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===ci?za:this.spaces[s].transfer},getLuminanceCoefficients:function(s,t=this.workingColorSpace){return s.fromArray(this.spaces[t].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,t,e){return s.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function Kn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Ps(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const Gc=[.64,.33,.3,.6,.15,.06],Vc=[.2126,.7152,.0722],Wc=[.3127,.329],Xc=new Zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Kc=new Zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);ie.define({[Bs]:{primaries:Gc,whitePoint:Wc,transfer:za,toXYZ:Xc,fromXYZ:Kc,luminanceCoefficients:Vc,workingColorSpaceConfig:{unpackColorSpace:Ge},outputColorSpaceConfig:{drawingBufferColorSpace:Ge}},[Ge]:{primaries:Gc,whitePoint:Wc,transfer:de,toXYZ:Xc,fromXYZ:Kc,luminanceCoefficients:Vc,outputColorSpaceConfig:{drawingBufferColorSpace:Ge}}});let Qi;class Vf{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Qi===void 0&&(Qi=ka("canvas")),Qi.width=t.width,Qi.height=t.height;const n=Qi.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Qi}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=ka("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=Kn(r[a]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Kn(e[n]/255)*255):e[n]=Kn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Wf=0;class Hu{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Wf++}),this.uuid=Cn(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(Ja(i[a].image)):r.push(Ja(i[a]))}else r=Ja(i);n.url=r}return e||(t.images[this.uuid]=n),n}}function Ja(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Vf.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Xf=0;class Ke extends Hs{constructor(t=Ke.DEFAULT_IMAGE,e=Ke.DEFAULT_MAPPING,n=Vi,i=Vi,r=kn,a=Wi,o=dn,l=Yn,c=Ke.DEFAULT_ANISOTROPY,h=ci){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Xf++}),this.uuid=Cn(),this.name="",this.source=new Hu(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new vt(0,0),this.repeat=new vt(1,1),this.center=new vt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ku)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Xi:t.x=t.x-Math.floor(t.x);break;case Vi:t.x=t.x<0?0:1;break;case tl:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Xi:t.y=t.y-Math.floor(t.y);break;case Vi:t.y=t.y<0?0:1;break;case tl:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Ke.DEFAULT_IMAGE=null;Ke.DEFAULT_MAPPING=ku;Ke.DEFAULT_ANISOTROPY=1;class ae{constructor(t=0,e=0,n=0,i=1){ae.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*i+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r;const l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],p=l[9],v=l[2],g=l[6],m=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-v)<.01&&Math.abs(p-g)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+v)<.1&&Math.abs(p+g)<.1&&Math.abs(c+d+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const x=(c+1)/2,y=(d+1)/2,R=(m+1)/2,w=(h+f)/4,T=(u+v)/4,E=(p+g)/4;return x>y&&x>R?x<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(x),i=w/n,r=T/n):y>R?y<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(y),n=w/i,r=E/i):R<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(R),n=T/r,i=E/r),this.set(n,i,r,e),this}let _=Math.sqrt((g-p)*(g-p)+(u-v)*(u-v)+(f-h)*(f-h));return Math.abs(_)<.001&&(_=1),this.x=(g-p)/_,this.y=(u-v)/_,this.z=(f-h)/_,this.w=Math.acos((c+d+m-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Kf extends Hs{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ae(0,0,t,e),this.scissorTest=!1,this.viewport=new ae(0,0,t,e);const i={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:kn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Ke(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Hu(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Yi extends Kf{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Gu extends Ke{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=on,this.minFilter=on,this.wrapR=Vi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Yf extends Ke{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=on,this.minFilter=on,this.wrapR=Vi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class qi{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const f=r[a+0],d=r[a+1],p=r[a+2],v=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=d,t[e+2]=p,t[e+3]=v;return}if(u!==v||l!==f||c!==d||h!==p){let g=1-o;const m=l*f+c*d+h*p+u*v,_=m>=0?1:-1,x=1-m*m;if(x>Number.EPSILON){const R=Math.sqrt(x),w=Math.atan2(R,m*_);g=Math.sin(g*w)/R,o=Math.sin(o*w)/R}const y=o*_;if(l=l*g+f*y,c=c*g+d*y,h=h*g+p*y,u=u*g+v*y,g===1-o){const R=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=R,c*=R,h*=R,u*=R}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,r,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],f=r[a+1],d=r[a+2],p=r[a+3];return t[e]=o*p+h*u+l*d-c*f,t[e+1]=l*p+h*f+c*u-o*d,t[e+2]=c*p+h*d+o*f-l*u,t[e+3]=h*p-o*u-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),f=l(n/2),d=l(i/2),p=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*d*p,this._y=c*d*u-f*h*p,this._z=c*h*p+f*d*u,this._w=c*h*u-f*d*p;break;case"YXZ":this._x=f*h*u+c*d*p,this._y=c*d*u-f*h*p,this._z=c*h*p-f*d*u,this._w=c*h*u+f*d*p;break;case"ZXY":this._x=f*h*u-c*d*p,this._y=c*d*u+f*h*p,this._z=c*h*p+f*d*u,this._w=c*h*u-f*d*p;break;case"ZYX":this._x=f*h*u-c*d*p,this._y=c*d*u+f*h*p,this._z=c*h*p-f*d*u,this._w=c*h*u+f*d*p;break;case"YZX":this._x=f*h*u+c*d*p,this._y=c*d*u+f*h*p,this._z=c*h*p-f*d*u,this._w=c*h*u-f*d*p;break;case"XZY":this._x=f*h*u-c*d*p,this._y=c*d*u-f*h*p,this._z=c*h*p+f*d*u,this._w=c*h*u+f*d*p;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+o+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-i)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(i+a)/d,this._z=(r+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(r-c)/d,this._x=(i+a)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(a-i)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Le(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*t._w+n*t._x+i*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-e;return this._w=d*a+e*this._w,this._x=d*n+e*this._x,this._y=d*i+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=i*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class D{constructor(t=0,e=0,n=0){D.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Yc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Yc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*i-o*n),h=2*(o*e-r*i),u=2*(r*n-a*e);return this.x=e+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=i+l*u+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Qa.copy(this).projectOnVector(t),this.sub(Qa)}reflect(t){return this.sub(Qa.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(Le(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Qa=new D,Yc=new qi;class Si{constructor(t=new D(1/0,1/0,1/0),e=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(vn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(vn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=vn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,vn):vn.fromBufferAttribute(r,a),vn.applyMatrix4(t.matrixWorld),this.expandByPoint(vn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Lr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Lr.copy(n.boundingBox)),Lr.applyMatrix4(t.matrixWorld),this.union(Lr)}const i=t.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,vn),vn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ks),Ir.subVectors(this.max,Ks),ts.subVectors(t.a,Ks),es.subVectors(t.b,Ks),ns.subVectors(t.c,Ks),ei.subVectors(es,ts),ni.subVectors(ns,es),Ri.subVectors(ts,ns);let e=[0,-ei.z,ei.y,0,-ni.z,ni.y,0,-Ri.z,Ri.y,ei.z,0,-ei.x,ni.z,0,-ni.x,Ri.z,0,-Ri.x,-ei.y,ei.x,0,-ni.y,ni.x,0,-Ri.y,Ri.x,0];return!to(e,ts,es,ns,Ir)||(e=[1,0,0,0,1,0,0,0,1],!to(e,ts,es,ns,Ir))?!1:(Dr.crossVectors(ei,ni),e=[Dr.x,Dr.y,Dr.z],to(e,ts,es,ns,Ir))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,vn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(vn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(On[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),On[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),On[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),On[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),On[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),On[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),On[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),On[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(On),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const On=[new D,new D,new D,new D,new D,new D,new D,new D],vn=new D,Lr=new Si,ts=new D,es=new D,ns=new D,ei=new D,ni=new D,Ri=new D,Ks=new D,Ir=new D,Dr=new D,ki=new D;function to(s,t,e,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){ki.fromArray(s,r);const o=i.x*Math.abs(ki.x)+i.y*Math.abs(ki.y)+i.z*Math.abs(ki.z),l=t.dot(ki),c=e.dot(ki),h=n.dot(ki);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const $f=new Si,Ys=new D,eo=new D;class Ei{constructor(t=new D,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):$f.setFromPoints(t).getCenter(n);let i=0;for(let r=0,a=t.length;r<a;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ys.subVectors(t,this.center);const e=Ys.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Ys,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(eo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ys.copy(t.center).add(eo)),this.expandByPoint(Ys.copy(t.center).sub(eo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Un=new D,no=new D,Nr=new D,ii=new D,io=new D,Or=new D,so=new D;class Ba{constructor(t=new D,e=new D(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Un)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Un.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Un.copy(this.origin).addScaledVector(this.direction,e),Un.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){no.copy(t).add(e).multiplyScalar(.5),Nr.copy(e).sub(t).normalize(),ii.copy(this.origin).sub(no);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Nr),o=ii.dot(this.direction),l=-ii.dot(Nr),c=ii.lengthSq(),h=Math.abs(1-a*a);let u,f,d,p;if(h>0)if(u=a*l-o,f=a*o-l,p=r*h,u>=0)if(f>=-p)if(f<=p){const v=1/h;u*=v,f*=v,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-p?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=p?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(no).addScaledVector(Nr,f),d}intersectSphere(t,e){Un.subVectors(t.center,this.origin);const n=Un.dot(this.direction),i=Un.dot(Un)-n*n,r=t.radius*t.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,i=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,i=(t.min.x-f.x)*c),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Un)!==null}intersectTriangle(t,e,n,i,r){io.subVectors(e,t),Or.subVectors(n,t),so.crossVectors(io,Or);let a=this.direction.dot(so),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;ii.subVectors(this.origin,t);const l=o*this.direction.dot(Or.crossVectors(ii,Or));if(l<0)return null;const c=o*this.direction.dot(io.cross(ii));if(c<0||l+c>a)return null;const h=-o*ii.dot(so);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Yt{constructor(t,e,n,i,r,a,o,l,c,h,u,f,d,p,v,g){Yt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,a,o,l,c,h,u,f,d,p,v,g)}set(t,e,n,i,r,a,o,l,c,h,u,f,d,p,v,g){const m=this.elements;return m[0]=t,m[4]=e,m[8]=n,m[12]=i,m[1]=r,m[5]=a,m[9]=o,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=f,m[3]=d,m[7]=p,m[11]=v,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Yt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/is.setFromMatrixColumn(t,0).length(),r=1/is.setFromMatrixColumn(t,1).length(),a=1/is.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const f=a*h,d=a*u,p=o*h,v=o*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+p*c,e[5]=f-v*c,e[9]=-o*l,e[2]=v-f*c,e[6]=p+d*c,e[10]=a*l}else if(t.order==="YXZ"){const f=l*h,d=l*u,p=c*h,v=c*u;e[0]=f+v*o,e[4]=p*o-d,e[8]=a*c,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=d*o-p,e[6]=v+f*o,e[10]=a*l}else if(t.order==="ZXY"){const f=l*h,d=l*u,p=c*h,v=c*u;e[0]=f-v*o,e[4]=-a*u,e[8]=p+d*o,e[1]=d+p*o,e[5]=a*h,e[9]=v-f*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){const f=a*h,d=a*u,p=o*h,v=o*u;e[0]=l*h,e[4]=p*c-d,e[8]=f*c+v,e[1]=l*u,e[5]=v*c+f,e[9]=d*c-p,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){const f=a*l,d=a*c,p=o*l,v=o*c;e[0]=l*h,e[4]=v-f*u,e[8]=p*u+d,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*u+p,e[10]=f-v*u}else if(t.order==="XZY"){const f=a*l,d=a*c,p=o*l,v=o*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+v,e[5]=a*h,e[9]=d*u-p,e[2]=p*u-d,e[6]=o*h,e[10]=v*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(qf,t,Zf)}lookAt(t,e,n){const i=this.elements;return en.subVectors(t,e),en.lengthSq()===0&&(en.z=1),en.normalize(),si.crossVectors(n,en),si.lengthSq()===0&&(Math.abs(n.z)===1?en.x+=1e-4:en.z+=1e-4,en.normalize(),si.crossVectors(n,en)),si.normalize(),Ur.crossVectors(en,si),i[0]=si.x,i[4]=Ur.x,i[8]=en.x,i[1]=si.y,i[5]=Ur.y,i[9]=en.y,i[2]=si.z,i[6]=Ur.z,i[10]=en.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],p=n[2],v=n[6],g=n[10],m=n[14],_=n[3],x=n[7],y=n[11],R=n[15],w=i[0],T=i[4],E=i[8],b=i[12],S=i[1],P=i[5],O=i[9],U=i[13],F=i[2],K=i[6],N=i[10],Y=i[14],H=i[3],J=i[7],st=i[11],lt=i[15];return r[0]=a*w+o*S+l*F+c*H,r[4]=a*T+o*P+l*K+c*J,r[8]=a*E+o*O+l*N+c*st,r[12]=a*b+o*U+l*Y+c*lt,r[1]=h*w+u*S+f*F+d*H,r[5]=h*T+u*P+f*K+d*J,r[9]=h*E+u*O+f*N+d*st,r[13]=h*b+u*U+f*Y+d*lt,r[2]=p*w+v*S+g*F+m*H,r[6]=p*T+v*P+g*K+m*J,r[10]=p*E+v*O+g*N+m*st,r[14]=p*b+v*U+g*Y+m*lt,r[3]=_*w+x*S+y*F+R*H,r[7]=_*T+x*P+y*K+R*J,r[11]=_*E+x*O+y*N+R*st,r[15]=_*b+x*U+y*Y+R*lt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],d=t[14],p=t[3],v=t[7],g=t[11],m=t[15];return p*(+r*l*u-i*c*u-r*o*f+n*c*f+i*o*d-n*l*d)+v*(+e*l*d-e*c*f+r*a*f-i*a*d+i*c*h-r*l*h)+g*(+e*c*u-e*o*d-r*a*u+n*a*d+r*o*h-n*c*h)+m*(-i*o*h-e*l*u+e*o*f+i*a*u-n*a*f+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],d=t[11],p=t[12],v=t[13],g=t[14],m=t[15],_=u*g*c-v*f*c+v*l*d-o*g*d-u*l*m+o*f*m,x=p*f*c-h*g*c-p*l*d+a*g*d+h*l*m-a*f*m,y=h*v*c-p*u*c+p*o*d-a*v*d-h*o*m+a*u*m,R=p*u*l-h*v*l-p*o*f+a*v*f+h*o*g-a*u*g,w=e*_+n*x+i*y+r*R;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const T=1/w;return t[0]=_*T,t[1]=(v*f*r-u*g*r-v*i*d+n*g*d+u*i*m-n*f*m)*T,t[2]=(o*g*r-v*l*r+v*i*c-n*g*c-o*i*m+n*l*m)*T,t[3]=(u*l*r-o*f*r-u*i*c+n*f*c+o*i*d-n*l*d)*T,t[4]=x*T,t[5]=(h*g*r-p*f*r+p*i*d-e*g*d-h*i*m+e*f*m)*T,t[6]=(p*l*r-a*g*r-p*i*c+e*g*c+a*i*m-e*l*m)*T,t[7]=(a*f*r-h*l*r+h*i*c-e*f*c-a*i*d+e*l*d)*T,t[8]=y*T,t[9]=(p*u*r-h*v*r-p*n*d+e*v*d+h*n*m-e*u*m)*T,t[10]=(a*v*r-p*o*r+p*n*c-e*v*c-a*n*m+e*o*m)*T,t[11]=(h*o*r-a*u*r-h*n*c+e*u*c+a*n*d-e*o*d)*T,t[12]=R*T,t[13]=(h*v*i-p*u*i+p*n*f-e*v*f-h*n*g+e*u*g)*T,t[14]=(p*o*i-a*v*i-p*n*l+e*v*l+a*n*g-e*o*g)*T,t[15]=(a*u*i-h*o*i+h*n*l-e*u*l-a*n*f+e*o*f)*T,this}scale(t){const e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,a){return this.set(1,n,r,0,t,1,a,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,u=o+o,f=r*c,d=r*h,p=r*u,v=a*h,g=a*u,m=o*u,_=l*c,x=l*h,y=l*u,R=n.x,w=n.y,T=n.z;return i[0]=(1-(v+m))*R,i[1]=(d+y)*R,i[2]=(p-x)*R,i[3]=0,i[4]=(d-y)*w,i[5]=(1-(f+m))*w,i[6]=(g+_)*w,i[7]=0,i[8]=(p+x)*T,i[9]=(g-_)*T,i[10]=(1-(f+v))*T,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let r=is.set(i[0],i[1],i[2]).length();const a=is.set(i[4],i[5],i[6]).length(),o=is.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),t.x=i[12],t.y=i[13],t.z=i[14],yn.copy(this);const c=1/r,h=1/a,u=1/o;return yn.elements[0]*=c,yn.elements[1]*=c,yn.elements[2]*=c,yn.elements[4]*=h,yn.elements[5]*=h,yn.elements[6]*=h,yn.elements[8]*=u,yn.elements[9]*=u,yn.elements[10]*=u,e.setFromRotationMatrix(yn),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,i,r,a,o=Xn){const l=this.elements,c=2*r/(e-t),h=2*r/(n-i),u=(e+t)/(e-t),f=(n+i)/(n-i);let d,p;if(o===Xn)d=-(a+r)/(a-r),p=-2*a*r/(a-r);else if(o===Ra)d=-a/(a-r),p=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=p,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,r,a,o=Xn){const l=this.elements,c=1/(e-t),h=1/(n-i),u=1/(a-r),f=(e+t)*c,d=(n+i)*h;let p,v;if(o===Xn)p=(a+r)*u,v=-2*u;else if(o===Ra)p=r*u,v=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=v,l[14]=-p,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const is=new D,yn=new Yt,qf=new D(0,0,0),Zf=new D(1,1,1),si=new D,Ur=new D,en=new D,$c=new Yt,qc=new qi;class En{constructor(t=0,e=0,n=0,i=En.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],f=i[6],d=i[10];switch(e){case"XYZ":this._y=Math.asin(Le(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Le(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Le(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Le(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Le(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Le(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return $c.makeRotationFromQuaternion(t),this.setFromRotationMatrix($c,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return qc.setFromEuler(this),this.setFromQuaternion(qc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}En.DEFAULT_ORDER="XYZ";class tc{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let jf=0;const Zc=new D,ss=new qi,Fn=new Yt,Fr=new D,$s=new D,Jf=new D,Qf=new qi,jc=new D(1,0,0),Jc=new D(0,1,0),Qc=new D(0,0,1),th={type:"added"},tp={type:"removed"},rs={type:"childadded",child:null},ro={type:"childremoved",child:null};class Se extends Hs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:jf++}),this.uuid=Cn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Se.DEFAULT_UP.clone();const t=new D,e=new En,n=new qi,i=new D(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Yt},normalMatrix:{value:new Zt}}),this.matrix=new Yt,this.matrixWorld=new Yt,this.matrixAutoUpdate=Se.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new tc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ss.setFromAxisAngle(t,e),this.quaternion.multiply(ss),this}rotateOnWorldAxis(t,e){return ss.setFromAxisAngle(t,e),this.quaternion.premultiply(ss),this}rotateX(t){return this.rotateOnAxis(jc,t)}rotateY(t){return this.rotateOnAxis(Jc,t)}rotateZ(t){return this.rotateOnAxis(Qc,t)}translateOnAxis(t,e){return Zc.copy(t).applyQuaternion(this.quaternion),this.position.add(Zc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(jc,t)}translateY(t){return this.translateOnAxis(Jc,t)}translateZ(t){return this.translateOnAxis(Qc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Fn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Fr.copy(t):Fr.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),$s.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Fn.lookAt($s,Fr,this.up):Fn.lookAt(Fr,$s,this.up),this.quaternion.setFromRotationMatrix(Fn),i&&(Fn.extractRotation(i.matrixWorld),ss.setFromRotationMatrix(Fn),this.quaternion.premultiply(ss.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(th),rs.child=t,this.dispatchEvent(rs),rs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(tp),ro.child=t,this.dispatchEvent(ro),ro.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Fn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Fn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Fn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(th),rs.child=t,this.dispatchEvent(rs),rs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose($s,t,Jf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose($s,Qf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));i.material=o}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(r(t.animations,l))}}if(e){const o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),d=a(t.animations),p=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),p.length>0&&(n.nodes=p)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}Se.DEFAULT_UP=new D(0,1,0);Se.DEFAULT_MATRIX_AUTO_UPDATE=!0;Se.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const xn=new D,zn=new D,ao=new D,Bn=new D,as=new D,os=new D,eh=new D,oo=new D,lo=new D,co=new D,ho=new ae,uo=new ae,fo=new ae;class un{constructor(t=new D,e=new D,n=new D){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),xn.subVectors(t,e),i.cross(xn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){xn.subVectors(i,e),zn.subVectors(n,e),ao.subVectors(t,e);const a=xn.dot(xn),o=xn.dot(zn),l=xn.dot(ao),c=zn.dot(zn),h=zn.dot(ao),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,d=(c*l-o*h)*f,p=(a*h-o*l)*f;return r.set(1-d-p,p,d)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Bn)===null?!1:Bn.x>=0&&Bn.y>=0&&Bn.x+Bn.y<=1}static getInterpolation(t,e,n,i,r,a,o,l){return this.getBarycoord(t,e,n,i,Bn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Bn.x),l.addScaledVector(a,Bn.y),l.addScaledVector(o,Bn.z),l)}static getInterpolatedAttribute(t,e,n,i,r,a){return ho.setScalar(0),uo.setScalar(0),fo.setScalar(0),ho.fromBufferAttribute(t,e),uo.fromBufferAttribute(t,n),fo.fromBufferAttribute(t,i),a.setScalar(0),a.addScaledVector(ho,r.x),a.addScaledVector(uo,r.y),a.addScaledVector(fo,r.z),a}static isFrontFacing(t,e,n,i){return xn.subVectors(n,e),zn.subVectors(t,e),xn.cross(zn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return xn.subVectors(this.c,this.b),zn.subVectors(this.a,this.b),xn.cross(zn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return un.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return un.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return un.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return un.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return un.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,r=this.c;let a,o;as.subVectors(i,n),os.subVectors(r,n),oo.subVectors(t,n);const l=as.dot(oo),c=os.dot(oo);if(l<=0&&c<=0)return e.copy(n);lo.subVectors(t,i);const h=as.dot(lo),u=os.dot(lo);if(h>=0&&u<=h)return e.copy(i);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(n).addScaledVector(as,a);co.subVectors(t,r);const d=as.dot(co),p=os.dot(co);if(p>=0&&d<=p)return e.copy(r);const v=d*c-l*p;if(v<=0&&c>=0&&p<=0)return o=c/(c-p),e.copy(n).addScaledVector(os,o);const g=h*p-d*u;if(g<=0&&u-h>=0&&d-p>=0)return eh.subVectors(r,i),o=(u-h)/(u-h+(d-p)),e.copy(i).addScaledVector(eh,o);const m=1/(g+v+f);return a=v*m,o=f*m,e.copy(n).addScaledVector(as,a).addScaledVector(os,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Vu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ri={h:0,s:0,l:0},zr={h:0,s:0,l:0};function po(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class Vt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ge){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ie.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=ie.workingColorSpace){return this.r=t,this.g=e,this.b=n,ie.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=ie.workingColorSpace){if(t=Ff(t,1),e=Le(e,0,1),n=Le(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=po(a,r,t+1/3),this.g=po(a,r,t),this.b=po(a,r,t-1/3)}return ie.toWorkingColorSpace(this,i),this}setStyle(t,e=Ge){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ge){const n=Vu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Kn(t.r),this.g=Kn(t.g),this.b=Kn(t.b),this}copyLinearToSRGB(t){return this.r=Ps(t.r),this.g=Ps(t.g),this.b=Ps(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ge){return ie.fromWorkingColorSpace(Be.copy(this),t),Math.round(Le(Be.r*255,0,255))*65536+Math.round(Le(Be.g*255,0,255))*256+Math.round(Le(Be.b*255,0,255))}getHexString(t=Ge){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ie.workingColorSpace){ie.fromWorkingColorSpace(Be.copy(this),e);const n=Be.r,i=Be.g,r=Be.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ie.workingColorSpace){return ie.fromWorkingColorSpace(Be.copy(this),e),t.r=Be.r,t.g=Be.g,t.b=Be.b,t}getStyle(t=Ge){ie.fromWorkingColorSpace(Be.copy(this),t);const e=Be.r,n=Be.g,i=Be.b;return t!==Ge?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(ri),this.setHSL(ri.h+t,ri.s+e,ri.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(ri),t.getHSL(zr);const n=Za(ri.h,zr.h,e),i=Za(ri.s,zr.s,e),r=Za(ri.l,zr.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Be=new Vt;Vt.NAMES=Vu;let ep=0;class Ti extends Hs{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ep++}),this.uuid=Cn(),this.name="",this.blending=ks,this.side=yi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Vo,this.blendDst=Wo,this.blendEquation=Hi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Vt(0,0,0),this.blendAlpha=0,this.depthFunc=Is,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=zc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ji,this.stencilZFail=Ji,this.stencilZPass=Ji,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ks&&(n.blending=this.blending),this.side!==yi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Vo&&(n.blendSrc=this.blendSrc),this.blendDst!==Wo&&(n.blendDst=this.blendDst),this.blendEquation!==Hi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Is&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==zc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Ji&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Ji&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Ji&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(e){const r=i(t.textures),a=i(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class xi extends Ti{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new Vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.combine=Xl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Ee=new D,Br=new vt;class Oe{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Al,this.updateRanges=[],this.gpuType=bn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Br.fromBufferAttribute(this,e),Br.applyMatrix3(t),this.setXY(e,Br.x,Br.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyMatrix3(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyMatrix4(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyNormalMatrix(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.transformDirection(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Rn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=fe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Rn(e,this.array)),e}setX(t,e){return this.normalized&&(e=fe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Rn(e,this.array)),e}setY(t,e){return this.normalized&&(e=fe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Rn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=fe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Rn(e,this.array)),e}setW(t,e){return this.normalized&&(e=fe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=fe(e,this.array),n=fe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=fe(e,this.array),n=fe(n,this.array),i=fe(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=fe(e,this.array),n=fe(n,this.array),i=fe(i,this.array),r=fe(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Al&&(t.usage=this.usage),t}}class ec extends Oe{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Wu extends Oe{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ee extends Oe{constructor(t,e,n){super(new Float32Array(t),e,n)}}let np=0;const cn=new Yt,mo=new Se,ls=new D,nn=new Si,qs=new Si,Pe=new D;class Te extends Hs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=Cn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Bu(t)?Wu:ec)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Zt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return cn.makeRotationFromQuaternion(t),this.applyMatrix4(cn),this}rotateX(t){return cn.makeRotationX(t),this.applyMatrix4(cn),this}rotateY(t){return cn.makeRotationY(t),this.applyMatrix4(cn),this}rotateZ(t){return cn.makeRotationZ(t),this.applyMatrix4(cn),this}translate(t,e,n){return cn.makeTranslation(t,e,n),this.applyMatrix4(cn),this}scale(t,e,n){return cn.makeScale(t,e,n),this.applyMatrix4(cn),this}lookAt(t){return mo.lookAt(t),mo.updateMatrix(),this.applyMatrix4(mo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ls).negate(),this.translate(ls.x,ls.y,ls.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let i=0,r=t.length;i<r;i++){const a=t[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ee(n,3))}else{for(let n=0,i=e.count;n<i;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Si);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const r=e[n];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(Pe.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(Pe),Pe.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(Pe)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ei);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(t){const n=this.boundingSphere.center;if(nn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];qs.setFromBufferAttribute(o),this.morphTargetsRelative?(Pe.addVectors(nn.min,qs.min),nn.expandByPoint(Pe),Pe.addVectors(nn.max,qs.max),nn.expandByPoint(Pe)):(nn.expandByPoint(qs.min),nn.expandByPoint(qs.max))}nn.getCenter(n);let i=0;for(let r=0,a=t.count;r<a;r++)Pe.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(Pe));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Pe.fromBufferAttribute(o,c),l&&(ls.fromBufferAttribute(t,c),Pe.add(ls)),i=Math.max(i,n.distanceToSquared(Pe))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Oe(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let E=0;E<n.count;E++)o[E]=new D,l[E]=new D;const c=new D,h=new D,u=new D,f=new vt,d=new vt,p=new vt,v=new D,g=new D;function m(E,b,S){c.fromBufferAttribute(n,E),h.fromBufferAttribute(n,b),u.fromBufferAttribute(n,S),f.fromBufferAttribute(r,E),d.fromBufferAttribute(r,b),p.fromBufferAttribute(r,S),h.sub(c),u.sub(c),d.sub(f),p.sub(f);const P=1/(d.x*p.y-p.x*d.y);isFinite(P)&&(v.copy(h).multiplyScalar(p.y).addScaledVector(u,-d.y).multiplyScalar(P),g.copy(u).multiplyScalar(d.x).addScaledVector(h,-p.x).multiplyScalar(P),o[E].add(v),o[b].add(v),o[S].add(v),l[E].add(g),l[b].add(g),l[S].add(g))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let E=0,b=_.length;E<b;++E){const S=_[E],P=S.start,O=S.count;for(let U=P,F=P+O;U<F;U+=3)m(t.getX(U+0),t.getX(U+1),t.getX(U+2))}const x=new D,y=new D,R=new D,w=new D;function T(E){R.fromBufferAttribute(i,E),w.copy(R);const b=o[E];x.copy(b),x.sub(R.multiplyScalar(R.dot(b))).normalize(),y.crossVectors(w,b);const P=y.dot(l[E])<0?-1:1;a.setXYZW(E,x.x,x.y,x.z,P)}for(let E=0,b=_.length;E<b;++E){const S=_[E],P=S.start,O=S.count;for(let U=P,F=P+O;U<F;U+=3)T(t.getX(U+0)),T(t.getX(U+1)),T(t.getX(U+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Oe(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const i=new D,r=new D,a=new D,o=new D,l=new D,c=new D,h=new D,u=new D;if(t)for(let f=0,d=t.count;f<d;f+=3){const p=t.getX(f+0),v=t.getX(f+1),g=t.getX(f+2);i.fromBufferAttribute(e,p),r.fromBufferAttribute(e,v),a.fromBufferAttribute(e,g),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,p),l.fromBufferAttribute(n,v),c.fromBufferAttribute(n,g),o.add(h),l.add(h),c.add(h),n.setXYZ(p,o.x,o.y,o.z),n.setXYZ(v,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let f=0,d=e.count;f<d;f+=3)i.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Pe.fromBufferAttribute(t,e),Pe.normalize(),t.setXYZ(e,Pe.x,Pe.y,Pe.z)}toNonIndexed(){function t(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let d=0,p=0;for(let v=0,g=l.length;v<g;v++){o.isInterleavedBufferAttribute?d=l[v]*o.data.stride+o.offset:d=l[v]*h;for(let m=0;m<h;m++)f[p++]=c[d++]}return new Oe(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Te,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=t(l,n);e.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],d=t(f,n);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const d=c[u];h.push(d.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const nh=new Yt,Ci=new Ba,Hr=new Ei,ih=new D,Gr=new D,Vr=new D,Wr=new D,go=new D,Xr=new D,sh=new D,Kr=new D;class Dt extends Se{constructor(t=new Te,e=new xi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const o=this.morphTargetInfluences;if(r&&o){Xr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(go.fromBufferAttribute(u,t),a?Xr.addScaledVector(go,h):Xr.addScaledVector(go.sub(e),h))}e.add(Xr)}return e}raycast(t,e){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Hr.copy(n.boundingSphere),Hr.applyMatrix4(r),Ci.copy(t.ray).recast(t.near),!(Hr.containsPoint(Ci.origin)===!1&&(Ci.intersectSphere(Hr,ih)===null||Ci.origin.distanceToSquared(ih)>(t.far-t.near)**2))&&(nh.copy(r).invert(),Ci.copy(t.ray).applyMatrix4(nh),!(n.boundingBox!==null&&Ci.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ci)))}_computeIntersections(t,e,n){let i;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let p=0,v=f.length;p<v;p++){const g=f[p],m=a[g.materialIndex],_=Math.max(g.start,d.start),x=Math.min(o.count,Math.min(g.start+g.count,d.start+d.count));for(let y=_,R=x;y<R;y+=3){const w=o.getX(y),T=o.getX(y+1),E=o.getX(y+2);i=Yr(this,m,t,n,c,h,u,w,T,E),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=g.materialIndex,e.push(i))}}else{const p=Math.max(0,d.start),v=Math.min(o.count,d.start+d.count);for(let g=p,m=v;g<m;g+=3){const _=o.getX(g),x=o.getX(g+1),y=o.getX(g+2);i=Yr(this,a,t,n,c,h,u,_,x,y),i&&(i.faceIndex=Math.floor(g/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let p=0,v=f.length;p<v;p++){const g=f[p],m=a[g.materialIndex],_=Math.max(g.start,d.start),x=Math.min(l.count,Math.min(g.start+g.count,d.start+d.count));for(let y=_,R=x;y<R;y+=3){const w=y,T=y+1,E=y+2;i=Yr(this,m,t,n,c,h,u,w,T,E),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=g.materialIndex,e.push(i))}}else{const p=Math.max(0,d.start),v=Math.min(l.count,d.start+d.count);for(let g=p,m=v;g<m;g+=3){const _=g,x=g+1,y=g+2;i=Yr(this,a,t,n,c,h,u,_,x,y),i&&(i.faceIndex=Math.floor(g/3),e.push(i))}}}}function ip(s,t,e,n,i,r,a,o){let l;if(t.side===Xe?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,t.side===yi,o),l===null)return null;Kr.copy(o),Kr.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Kr);return c<e.near||c>e.far?null:{distance:c,point:Kr.clone(),object:s}}function Yr(s,t,e,n,i,r,a,o,l,c){s.getVertexPosition(o,Gr),s.getVertexPosition(l,Vr),s.getVertexPosition(c,Wr);const h=ip(s,t,e,n,Gr,Vr,Wr,sh);if(h){const u=new D;un.getBarycoord(sh,Gr,Vr,Wr,u),i&&(h.uv=un.getInterpolatedAttribute(i,o,l,c,u,new vt)),r&&(h.uv1=un.getInterpolatedAttribute(r,o,l,c,u,new vt)),a&&(h.normal=un.getInterpolatedAttribute(a,o,l,c,u,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new D,materialIndex:0};un.getNormal(Gr,Vr,Wr,f.normal),h.face=f,h.barycoord=u}return h}class ve extends Te{constructor(t=1,e=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,d=0;p("z","y","x",-1,-1,n,e,t,a,r,0),p("z","y","x",1,-1,n,e,-t,a,r,1),p("x","z","y",1,1,t,n,e,i,a,2),p("x","z","y",1,-1,t,n,-e,i,a,3),p("x","y","z",1,-1,t,e,n,i,r,4),p("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new ee(c,3)),this.setAttribute("normal",new ee(h,3)),this.setAttribute("uv",new ee(u,2));function p(v,g,m,_,x,y,R,w,T,E,b){const S=y/T,P=R/E,O=y/2,U=R/2,F=w/2,K=T+1,N=E+1;let Y=0,H=0;const J=new D;for(let st=0;st<N;st++){const lt=st*P-U;for(let ht=0;ht<K;ht++){const St=ht*S-O;J[v]=St*_,J[g]=lt*x,J[m]=F,c.push(J.x,J.y,J.z),J[v]=0,J[g]=0,J[m]=w>0?1:-1,h.push(J.x,J.y,J.z),u.push(ht/T),u.push(1-st/E),Y+=1}}for(let st=0;st<E;st++)for(let lt=0;lt<T;lt++){const ht=f+lt+K*st,St=f+lt+K*(st+1),W=f+(lt+1)+K*(st+1),et=f+(lt+1)+K*st;l.push(ht,St,et),l.push(St,W,et),H+=6}o.addGroup(d,H,b),d+=H,f+=Y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ve(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Fs(s){const t={};for(const e in s){t[e]={};for(const n in s[e]){const i=s[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function qe(s){const t={};for(let e=0;e<s.length;e++){const n=Fs(s[e]);for(const i in n)t[i]=n[i]}return t}function sp(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Xu(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ie.workingColorSpace}const rp={clone:Fs,merge:qe};var ap=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,op=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class $n extends Ti{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ap,this.fragmentShader=op,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Fs(t.uniforms),this.uniformsGroups=sp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?e.uniforms[i]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[i]={type:"m4",value:a.toArray()}:e.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Ku extends Se{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Yt,this.projectionMatrix=new Yt,this.projectionMatrixInverse=new Yt,this.coordinateSystem=Xn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ai=new D,rh=new vt,ah=new vt;class an extends Ku{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Rl*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(qa*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Rl*2*Math.atan(Math.tan(qa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(ai.x,ai.y).multiplyScalar(-t/ai.z),ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ai.x,ai.y).multiplyScalar(-t/ai.z)}getViewSize(t,e){return this.getViewBounds(t,rh,ah),e.subVectors(ah,rh)}setViewOffset(t,e,n,i,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(qa*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,e-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const cs=-90,hs=1;class lp extends Se{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new an(cs,hs,t,e);i.layers=this.layers,this.add(i);const r=new an(cs,hs,t,e);r.layers=this.layers,this.add(r);const a=new an(cs,hs,t,e);a.layers=this.layers,this.add(a);const o=new an(cs,hs,t,e);o.layers=this.layers,this.add(o);const l=new an(cs,hs,t,e);l.layers=this.layers,this.add(l);const c=new an(cs,hs,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,r,a,o,l]=e;for(const c of e)this.remove(c);if(t===Xn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ra)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),p=t.xr.enabled;t.xr.enabled=!1;const v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,r),t.setRenderTarget(n,1,i),t.render(e,a),t.setRenderTarget(n,2,i),t.render(e,o),t.setRenderTarget(n,3,i),t.render(e,l),t.setRenderTarget(n,4,i),t.render(e,c),n.texture.generateMipmaps=v,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(u,f,d),t.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class Yu extends Ke{constructor(t,e,n,i,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Ds,super(t,e,n,i,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class cp extends Yi{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new Yu(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:kn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new ve(5,5,5),r=new $n({name:"CubemapFromEquirect",uniforms:Fs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Xe,blending:fi});r.uniforms.tEquirect.value=e;const a=new Dt(i,r),o=e.minFilter;return e.minFilter===Wi&&(e.minFilter=kn),new lp(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,n,i){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,i);t.setRenderTarget(r)}}const vo=new D,hp=new D,up=new Zt;class Fi{constructor(t=new D(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=vo.subVectors(n,e).cross(hp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(vo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||up.getNormalMatrix(t),i=this.coplanarPoint(vo).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Pi=new Ei,$r=new D;class nc{constructor(t=new Fi,e=new Fi,n=new Fi,i=new Fi,r=new Fi,a=new Fi){this.planes=[t,e,n,i,r,a]}set(t,e,n,i,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Xn){const n=this.planes,i=t.elements,r=i[0],a=i[1],o=i[2],l=i[3],c=i[4],h=i[5],u=i[6],f=i[7],d=i[8],p=i[9],v=i[10],g=i[11],m=i[12],_=i[13],x=i[14],y=i[15];if(n[0].setComponents(l-r,f-c,g-d,y-m).normalize(),n[1].setComponents(l+r,f+c,g+d,y+m).normalize(),n[2].setComponents(l+a,f+h,g+p,y+_).normalize(),n[3].setComponents(l-a,f-h,g-p,y-_).normalize(),n[4].setComponents(l-o,f-u,g-v,y-x).normalize(),e===Xn)n[5].setComponents(l+o,f+u,g+v,y+x).normalize();else if(e===Ra)n[5].setComponents(o,u,v,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Pi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Pi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Pi)}intersectsSprite(t){return Pi.center.set(0,0,0),Pi.radius=.7071067811865476,Pi.applyMatrix4(t.matrixWorld),this.intersectsSphere(Pi)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if($r.x=i.normal.x>0?t.max.x:t.min.x,$r.y=i.normal.y>0?t.max.y:t.min.y,$r.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint($r)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function $u(){let s=null,t=!1,e=null,n=null;function i(r,a){e(r,a),n=s.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function dp(s){const t=new WeakMap;function e(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=s.createBuffer();s.bindBuffer(l,f),s.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=s.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=s.SHORT;else if(c instanceof Uint32Array)d=s.UNSIGNED_INT;else if(c instanceof Int32Array)d=s.INT;else if(c instanceof Int8Array)d=s.BYTE;else if(c instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((d,p)=>d.start-p.start);let f=0;for(let d=1;d<u.length;d++){const p=u[f],v=u[d];v.start<=p.start+p.count+1?p.count=Math.max(p.count,v.start+v.count-p.start):(++f,u[f]=v)}u.length=f+1;for(let d=0,p=u.length;d<p;d++){const v=u[d];s.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=t.get(o);l&&(s.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}class Je extends Te{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=t/o,f=e/l,d=[],p=[],v=[],g=[];for(let m=0;m<h;m++){const _=m*f-a;for(let x=0;x<c;x++){const y=x*u-r;p.push(y,-_,0),v.push(0,0,1),g.push(x/o),g.push(1-m/l)}}for(let m=0;m<l;m++)for(let _=0;_<o;_++){const x=_+c*m,y=_+c*(m+1),R=_+1+c*(m+1),w=_+1+c*m;d.push(x,y,w),d.push(y,R,w)}this.setIndex(d),this.setAttribute("position",new ee(p,3)),this.setAttribute("normal",new ee(v,3)),this.setAttribute("uv",new ee(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Je(t.width,t.height,t.widthSegments,t.heightSegments)}}var fp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,pp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,mp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,gp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,yp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,xp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,_p=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Mp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,bp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Sp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Ep=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Tp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,wp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ap=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Rp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,kp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Cp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Lp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Ip=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Dp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Np=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Op=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Up=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Fp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,zp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Bp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Hp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Gp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Vp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Wp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Xp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Kp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Yp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,$p=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,qp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Zp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,jp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Jp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Qp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,tm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,em=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,nm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,im=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,sm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,rm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,am=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,om=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,cm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,hm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,um=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,dm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,fm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,pm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,mm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,gm=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vm=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ym=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,xm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,_m=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Mm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,bm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Sm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Em=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Tm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,wm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Am=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Rm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,km=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Cm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Pm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Lm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Im=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Nm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Om=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Um=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Fm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,zm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Bm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Hm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Gm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Vm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Wm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Xm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Km=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ym=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$m=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,qm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Zm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,jm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Jm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Qm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,t0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,e0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,n0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,i0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,s0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,r0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,a0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,o0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,l0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,c0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,h0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,u0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const d0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,f0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,p0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,m0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,g0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,v0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,y0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,x0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,_0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,M0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,b0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,S0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,E0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,T0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,w0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,A0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,R0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,k0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,C0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,P0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,I0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,D0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,N0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,O0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,U0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,F0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,z0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,B0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,H0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,G0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,V0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,W0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,X0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Jt={alphahash_fragment:fp,alphahash_pars_fragment:pp,alphamap_fragment:mp,alphamap_pars_fragment:gp,alphatest_fragment:vp,alphatest_pars_fragment:yp,aomap_fragment:xp,aomap_pars_fragment:_p,batching_pars_vertex:Mp,batching_vertex:bp,begin_vertex:Sp,beginnormal_vertex:Ep,bsdfs:Tp,iridescence_fragment:wp,bumpmap_pars_fragment:Ap,clipping_planes_fragment:Rp,clipping_planes_pars_fragment:kp,clipping_planes_pars_vertex:Cp,clipping_planes_vertex:Pp,color_fragment:Lp,color_pars_fragment:Ip,color_pars_vertex:Dp,color_vertex:Np,common:Op,cube_uv_reflection_fragment:Up,defaultnormal_vertex:Fp,displacementmap_pars_vertex:zp,displacementmap_vertex:Bp,emissivemap_fragment:Hp,emissivemap_pars_fragment:Gp,colorspace_fragment:Vp,colorspace_pars_fragment:Wp,envmap_fragment:Xp,envmap_common_pars_fragment:Kp,envmap_pars_fragment:Yp,envmap_pars_vertex:$p,envmap_physical_pars_fragment:rm,envmap_vertex:qp,fog_vertex:Zp,fog_pars_vertex:jp,fog_fragment:Jp,fog_pars_fragment:Qp,gradientmap_pars_fragment:tm,lightmap_pars_fragment:em,lights_lambert_fragment:nm,lights_lambert_pars_fragment:im,lights_pars_begin:sm,lights_toon_fragment:am,lights_toon_pars_fragment:om,lights_phong_fragment:lm,lights_phong_pars_fragment:cm,lights_physical_fragment:hm,lights_physical_pars_fragment:um,lights_fragment_begin:dm,lights_fragment_maps:fm,lights_fragment_end:pm,logdepthbuf_fragment:mm,logdepthbuf_pars_fragment:gm,logdepthbuf_pars_vertex:vm,logdepthbuf_vertex:ym,map_fragment:xm,map_pars_fragment:_m,map_particle_fragment:Mm,map_particle_pars_fragment:bm,metalnessmap_fragment:Sm,metalnessmap_pars_fragment:Em,morphinstance_vertex:Tm,morphcolor_vertex:wm,morphnormal_vertex:Am,morphtarget_pars_vertex:Rm,morphtarget_vertex:km,normal_fragment_begin:Cm,normal_fragment_maps:Pm,normal_pars_fragment:Lm,normal_pars_vertex:Im,normal_vertex:Dm,normalmap_pars_fragment:Nm,clearcoat_normal_fragment_begin:Om,clearcoat_normal_fragment_maps:Um,clearcoat_pars_fragment:Fm,iridescence_pars_fragment:zm,opaque_fragment:Bm,packing:Hm,premultiplied_alpha_fragment:Gm,project_vertex:Vm,dithering_fragment:Wm,dithering_pars_fragment:Xm,roughnessmap_fragment:Km,roughnessmap_pars_fragment:Ym,shadowmap_pars_fragment:$m,shadowmap_pars_vertex:qm,shadowmap_vertex:Zm,shadowmask_pars_fragment:jm,skinbase_vertex:Jm,skinning_pars_vertex:Qm,skinning_vertex:t0,skinnormal_vertex:e0,specularmap_fragment:n0,specularmap_pars_fragment:i0,tonemapping_fragment:s0,tonemapping_pars_fragment:r0,transmission_fragment:a0,transmission_pars_fragment:o0,uv_pars_fragment:l0,uv_pars_vertex:c0,uv_vertex:h0,worldpos_vertex:u0,background_vert:d0,background_frag:f0,backgroundCube_vert:p0,backgroundCube_frag:m0,cube_vert:g0,cube_frag:v0,depth_vert:y0,depth_frag:x0,distanceRGBA_vert:_0,distanceRGBA_frag:M0,equirect_vert:b0,equirect_frag:S0,linedashed_vert:E0,linedashed_frag:T0,meshbasic_vert:w0,meshbasic_frag:A0,meshlambert_vert:R0,meshlambert_frag:k0,meshmatcap_vert:C0,meshmatcap_frag:P0,meshnormal_vert:L0,meshnormal_frag:I0,meshphong_vert:D0,meshphong_frag:N0,meshphysical_vert:O0,meshphysical_frag:U0,meshtoon_vert:F0,meshtoon_frag:z0,points_vert:B0,points_frag:H0,shadow_vert:G0,shadow_frag:V0,sprite_vert:W0,sprite_frag:X0},Tt={common:{diffuse:{value:new Vt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zt}},envmap:{envMap:{value:null},envMapRotation:{value:new Zt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zt},normalScale:{value:new vt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Vt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Vt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0},uvTransform:{value:new Zt}},sprite:{diffuse:{value:new Vt(16777215)},opacity:{value:1},center:{value:new vt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}}},An={basic:{uniforms:qe([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.fog]),vertexShader:Jt.meshbasic_vert,fragmentShader:Jt.meshbasic_frag},lambert:{uniforms:qe([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new Vt(0)}}]),vertexShader:Jt.meshlambert_vert,fragmentShader:Jt.meshlambert_frag},phong:{uniforms:qe([Tt.common,Tt.specularmap,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,Tt.lights,{emissive:{value:new Vt(0)},specular:{value:new Vt(1118481)},shininess:{value:30}}]),vertexShader:Jt.meshphong_vert,fragmentShader:Jt.meshphong_frag},standard:{uniforms:qe([Tt.common,Tt.envmap,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.roughnessmap,Tt.metalnessmap,Tt.fog,Tt.lights,{emissive:{value:new Vt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Jt.meshphysical_vert,fragmentShader:Jt.meshphysical_frag},toon:{uniforms:qe([Tt.common,Tt.aomap,Tt.lightmap,Tt.emissivemap,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.gradientmap,Tt.fog,Tt.lights,{emissive:{value:new Vt(0)}}]),vertexShader:Jt.meshtoon_vert,fragmentShader:Jt.meshtoon_frag},matcap:{uniforms:qe([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,Tt.fog,{matcap:{value:null}}]),vertexShader:Jt.meshmatcap_vert,fragmentShader:Jt.meshmatcap_frag},points:{uniforms:qe([Tt.points,Tt.fog]),vertexShader:Jt.points_vert,fragmentShader:Jt.points_frag},dashed:{uniforms:qe([Tt.common,Tt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Jt.linedashed_vert,fragmentShader:Jt.linedashed_frag},depth:{uniforms:qe([Tt.common,Tt.displacementmap]),vertexShader:Jt.depth_vert,fragmentShader:Jt.depth_frag},normal:{uniforms:qe([Tt.common,Tt.bumpmap,Tt.normalmap,Tt.displacementmap,{opacity:{value:1}}]),vertexShader:Jt.meshnormal_vert,fragmentShader:Jt.meshnormal_frag},sprite:{uniforms:qe([Tt.sprite,Tt.fog]),vertexShader:Jt.sprite_vert,fragmentShader:Jt.sprite_frag},background:{uniforms:{uvTransform:{value:new Zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Jt.background_vert,fragmentShader:Jt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zt}},vertexShader:Jt.backgroundCube_vert,fragmentShader:Jt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Jt.cube_vert,fragmentShader:Jt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Jt.equirect_vert,fragmentShader:Jt.equirect_frag},distanceRGBA:{uniforms:qe([Tt.common,Tt.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Jt.distanceRGBA_vert,fragmentShader:Jt.distanceRGBA_frag},shadow:{uniforms:qe([Tt.lights,Tt.fog,{color:{value:new Vt(0)},opacity:{value:1}}]),vertexShader:Jt.shadow_vert,fragmentShader:Jt.shadow_frag}};An.physical={uniforms:qe([An.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zt},clearcoatNormalScale:{value:new vt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zt},sheen:{value:0},sheenColor:{value:new Vt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zt},transmissionSamplerSize:{value:new vt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zt},attenuationDistance:{value:0},attenuationColor:{value:new Vt(0)},specularColor:{value:new Vt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zt},anisotropyVector:{value:new vt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zt}}]),vertexShader:Jt.meshphysical_vert,fragmentShader:Jt.meshphysical_frag};const qr={r:0,b:0,g:0},Li=new En,K0=new Yt;function Y0(s,t,e,n,i,r,a){const o=new Vt(0);let l=r===!0?0:1,c,h,u=null,f=0,d=null;function p(_){let x=_.isScene===!0?_.background:null;return x&&x.isTexture&&(x=(_.backgroundBlurriness>0?e:t).get(x)),x}function v(_){let x=!1;const y=p(_);y===null?m(o,l):y&&y.isColor&&(m(y,1),x=!0);const R=s.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,a):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function g(_,x){const y=p(x);y&&(y.isCubeTexture||y.mapping===Fa)?(h===void 0&&(h=new Dt(new ve(1,1,1),new $n({name:"BackgroundCubeMaterial",uniforms:Fs(An.backgroundCube.uniforms),vertexShader:An.backgroundCube.vertexShader,fragmentShader:An.backgroundCube.fragmentShader,side:Xe,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,w,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Li.copy(x.backgroundRotation),Li.x*=-1,Li.y*=-1,Li.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Li.y*=-1,Li.z*=-1),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(K0.makeRotationFromEuler(Li)),h.material.toneMapped=ie.getTransfer(y.colorSpace)!==de,(u!==y||f!==y.version||d!==s.toneMapping)&&(h.material.needsUpdate=!0,u=y,f=y.version,d=s.toneMapping),h.layers.enableAll(),_.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new Dt(new Je(2,2),new $n({name:"BackgroundMaterial",uniforms:Fs(An.background.uniforms),vertexShader:An.background.vertexShader,fragmentShader:An.background.fragmentShader,side:yi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=ie.getTransfer(y.colorSpace)!==de,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||f!==y.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,u=y,f=y.version,d=s.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function m(_,x){_.getRGB(qr,Xu(s)),n.buffers.color.setClear(qr.r,qr.g,qr.b,x,a)}return{getClearColor:function(){return o},setClearColor:function(_,x=1){o.set(_),l=x,m(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,m(o,l)},render:v,addToRenderList:g}}function $0(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=f(null);let r=i,a=!1;function o(S,P,O,U,F){let K=!1;const N=u(U,O,P);r!==N&&(r=N,c(r.object)),K=d(S,U,O,F),K&&p(S,U,O,F),F!==null&&t.update(F,s.ELEMENT_ARRAY_BUFFER),(K||a)&&(a=!1,y(S,P,O,U),F!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(F).buffer))}function l(){return s.createVertexArray()}function c(S){return s.bindVertexArray(S)}function h(S){return s.deleteVertexArray(S)}function u(S,P,O){const U=O.wireframe===!0;let F=n[S.id];F===void 0&&(F={},n[S.id]=F);let K=F[P.id];K===void 0&&(K={},F[P.id]=K);let N=K[U];return N===void 0&&(N=f(l()),K[U]=N),N}function f(S){const P=[],O=[],U=[];for(let F=0;F<e;F++)P[F]=0,O[F]=0,U[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:O,attributeDivisors:U,object:S,attributes:{},index:null}}function d(S,P,O,U){const F=r.attributes,K=P.attributes;let N=0;const Y=O.getAttributes();for(const H in Y)if(Y[H].location>=0){const st=F[H];let lt=K[H];if(lt===void 0&&(H==="instanceMatrix"&&S.instanceMatrix&&(lt=S.instanceMatrix),H==="instanceColor"&&S.instanceColor&&(lt=S.instanceColor)),st===void 0||st.attribute!==lt||lt&&st.data!==lt.data)return!0;N++}return r.attributesNum!==N||r.index!==U}function p(S,P,O,U){const F={},K=P.attributes;let N=0;const Y=O.getAttributes();for(const H in Y)if(Y[H].location>=0){let st=K[H];st===void 0&&(H==="instanceMatrix"&&S.instanceMatrix&&(st=S.instanceMatrix),H==="instanceColor"&&S.instanceColor&&(st=S.instanceColor));const lt={};lt.attribute=st,st&&st.data&&(lt.data=st.data),F[H]=lt,N++}r.attributes=F,r.attributesNum=N,r.index=U}function v(){const S=r.newAttributes;for(let P=0,O=S.length;P<O;P++)S[P]=0}function g(S){m(S,0)}function m(S,P){const O=r.newAttributes,U=r.enabledAttributes,F=r.attributeDivisors;O[S]=1,U[S]===0&&(s.enableVertexAttribArray(S),U[S]=1),F[S]!==P&&(s.vertexAttribDivisor(S,P),F[S]=P)}function _(){const S=r.newAttributes,P=r.enabledAttributes;for(let O=0,U=P.length;O<U;O++)P[O]!==S[O]&&(s.disableVertexAttribArray(O),P[O]=0)}function x(S,P,O,U,F,K,N){N===!0?s.vertexAttribIPointer(S,P,O,F,K):s.vertexAttribPointer(S,P,O,U,F,K)}function y(S,P,O,U){v();const F=U.attributes,K=O.getAttributes(),N=P.defaultAttributeValues;for(const Y in K){const H=K[Y];if(H.location>=0){let J=F[Y];if(J===void 0&&(Y==="instanceMatrix"&&S.instanceMatrix&&(J=S.instanceMatrix),Y==="instanceColor"&&S.instanceColor&&(J=S.instanceColor)),J!==void 0){const st=J.normalized,lt=J.itemSize,ht=t.get(J);if(ht===void 0)continue;const St=ht.buffer,W=ht.type,et=ht.bytesPerElement,yt=W===s.INT||W===s.UNSIGNED_INT||J.gpuType===Kl;if(J.isInterleavedBufferAttribute){const ot=J.data,_t=ot.stride,wt=J.offset;if(ot.isInstancedInterleavedBuffer){for(let At=0;At<H.locationSize;At++)m(H.location+At,ot.meshPerAttribute);S.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ot.meshPerAttribute*ot.count)}else for(let At=0;At<H.locationSize;At++)g(H.location+At);s.bindBuffer(s.ARRAY_BUFFER,St);for(let At=0;At<H.locationSize;At++)x(H.location+At,lt/H.locationSize,W,st,_t*et,(wt+lt/H.locationSize*At)*et,yt)}else{if(J.isInstancedBufferAttribute){for(let ot=0;ot<H.locationSize;ot++)m(H.location+ot,J.meshPerAttribute);S.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let ot=0;ot<H.locationSize;ot++)g(H.location+ot);s.bindBuffer(s.ARRAY_BUFFER,St);for(let ot=0;ot<H.locationSize;ot++)x(H.location+ot,lt/H.locationSize,W,st,lt*et,lt/H.locationSize*ot*et,yt)}}else if(N!==void 0){const st=N[Y];if(st!==void 0)switch(st.length){case 2:s.vertexAttrib2fv(H.location,st);break;case 3:s.vertexAttrib3fv(H.location,st);break;case 4:s.vertexAttrib4fv(H.location,st);break;default:s.vertexAttrib1fv(H.location,st)}}}}_()}function R(){E();for(const S in n){const P=n[S];for(const O in P){const U=P[O];for(const F in U)h(U[F].object),delete U[F];delete P[O]}delete n[S]}}function w(S){if(n[S.id]===void 0)return;const P=n[S.id];for(const O in P){const U=P[O];for(const F in U)h(U[F].object),delete U[F];delete P[O]}delete n[S.id]}function T(S){for(const P in n){const O=n[P];if(O[S.id]===void 0)continue;const U=O[S.id];for(const F in U)h(U[F].object),delete U[F];delete O[S.id]}}function E(){b(),a=!0,r!==i&&(r=i,c(r.object))}function b(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:E,resetDefaultState:b,dispose:R,releaseStatesOfGeometry:w,releaseStatesOfProgram:T,initAttributes:v,enableAttribute:g,disableUnusedAttributes:_}}function q0(s,t,e){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function o(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let p=0;p<u;p++)d+=h[p];e.update(d,n,1)}function l(c,h,u,f){if(u===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let p=0;p<c.length;p++)a(c[p],h[p],f[p]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let p=0;for(let v=0;v<u;v++)p+=h[v]*f[v];e.update(p,n,1)}}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Z0(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const T=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(T){return!(T!==dn&&n.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(T){const E=T===Rr&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==Yn&&n.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&T!==bn&&!E)}function l(T){if(T==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,f=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),p=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),_=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),x=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),R=p>0,w=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:f,maxTextures:d,maxVertexTextures:p,maxTextureSize:v,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:_,maxVaryings:x,maxFragmentUniforms:y,vertexTextures:R,maxSamples:w}}function j0(s){const t=this;let e=null,n=0,i=!1,r=!1;const a=new Fi,o=new Zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||i;return i=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,d){const p=u.clippingPlanes,v=u.clipIntersection,g=u.clipShadows,m=s.get(u);if(!i||p===null||p.length===0||r&&!g)r?h(null):c();else{const _=r?0:n,x=_*4;let y=m.clippingState||null;l.value=y,y=h(p,f,x,d);for(let R=0;R!==x;++R)y[R]=e[R];m.clippingState=y,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=_}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,d,p){const v=u!==null?u.length:0;let g=null;if(v!==0){if(g=l.value,p!==!0||g===null){const m=d+v*4,_=f.matrixWorldInverse;o.getNormalMatrix(_),(g===null||g.length<m)&&(g=new Float32Array(m));for(let x=0,y=d;x!==v;++x,y+=4)a.copy(u[x]).applyMatrix4(_,o),a.normal.toArray(g,y),g[y+3]=a.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=v,t.numIntersection=0,g}}function J0(s){let t=new WeakMap;function e(a,o){return o===Jo?a.mapping=Ds:o===Qo&&(a.mapping=Ns),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Jo||o===Qo)if(t.has(a)){const l=t.get(a).texture;return e(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new cp(l.height);return c.fromEquirectangularTexture(s,a),t.set(a,c),a.addEventListener("dispose",i),e(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class qu extends Ku{constructor(t=-1,e=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-t,a=n+t,o=i+e,l=i-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const Es=4,oh=[.125,.215,.35,.446,.526,.582],Gi=20,yo=new qu,lh=new Vt;let xo=null,_o=0,Mo=0,bo=!1;const zi=(1+Math.sqrt(5))/2,us=1/zi,ch=[new D(-zi,us,0),new D(zi,us,0),new D(-us,0,zi),new D(us,0,zi),new D(0,zi,-us),new D(0,zi,us),new D(-1,1,-1),new D(1,1,-1),new D(-1,1,1),new D(1,1,1)];class kl{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){xo=this._renderer.getRenderTarget(),_o=this._renderer.getActiveCubeFace(),Mo=this._renderer.getActiveMipmapLevel(),bo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,i,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=dh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=uh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(xo,_o,Mo),this._renderer.xr.enabled=bo,t.scissorTest=!1,Zr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ds||t.mapping===Ns?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),xo=this._renderer.getRenderTarget(),_o=this._renderer.getActiveCubeFace(),Mo=this._renderer.getActiveMipmapLevel(),bo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:kn,minFilter:kn,generateMipmaps:!1,type:Rr,format:dn,colorSpace:Bs,depthBuffer:!1},i=hh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=hh(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Q0(r)),this._blurMaterial=tg(r,t,e)}return i}_compileMaterial(t){const e=new Dt(this._lodPlanes[0],t);this._renderer.compile(e,yo)}_sceneToCubeUV(t,e,n,i){const o=new an(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(lh),h.toneMapping=pi,h.autoClear=!1;const d=new xi({name:"PMREM.Background",side:Xe,depthWrite:!1,depthTest:!1}),p=new Dt(new ve,d);let v=!1;const g=t.background;g?g.isColor&&(d.color.copy(g),t.background=null,v=!0):(d.color.copy(lh),v=!0);for(let m=0;m<6;m++){const _=m%3;_===0?(o.up.set(0,l[m],0),o.lookAt(c[m],0,0)):_===1?(o.up.set(0,0,l[m]),o.lookAt(0,c[m],0)):(o.up.set(0,l[m],0),o.lookAt(0,0,c[m]));const x=this._cubeSize;Zr(i,_*x,m>2?x:0,x,x),h.setRenderTarget(i),v&&h.render(p,o),h.render(t,o)}p.geometry.dispose(),p.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=g}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===Ds||t.mapping===Ns;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=dh()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=uh());const r=i?this._cubemapMaterial:this._equirectMaterial,a=new Dt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const l=this._cubeSize;Zr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,yo)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=ch[(i-r-1)%ch.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,i,"latitudinal",r),this._halfBlur(a,t,n,n,i,"longitudinal",r)}_halfBlur(t,e,n,i,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Dt(this._lodPlanes[i],c),f=c.uniforms,d=this._sizeLods[n]-1,p=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*Gi-1),v=r/p,g=isFinite(r)?1+Math.floor(h*v):Gi;g>Gi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${Gi}`);const m=[];let _=0;for(let T=0;T<Gi;++T){const E=T/v,b=Math.exp(-E*E/2);m.push(b),T===0?_+=b:T<g&&(_+=2*b)}for(let T=0;T<m.length;T++)m[T]=m[T]/_;f.envMap.value=t.texture,f.samples.value=g,f.weights.value=m,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:x}=this;f.dTheta.value=p,f.mipInt.value=x-n;const y=this._sizeLods[i],R=3*y*(i>x-Es?i-x+Es:0),w=4*(this._cubeSize-y);Zr(e,R,w,3*y,2*y),l.setRenderTarget(e),l.render(u,yo)}}function Q0(s){const t=[],e=[],n=[];let i=s;const r=s-Es+1+oh.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);e.push(o);let l=1/o;a>s-Es?l=oh[a-s+Es-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,p=6,v=3,g=2,m=1,_=new Float32Array(v*p*d),x=new Float32Array(g*p*d),y=new Float32Array(m*p*d);for(let w=0;w<d;w++){const T=w%3*2/3-1,E=w>2?0:-1,b=[T,E,0,T+2/3,E,0,T+2/3,E+1,0,T,E,0,T+2/3,E+1,0,T,E+1,0];_.set(b,v*p*w),x.set(f,g*p*w);const S=[w,w,w,w,w,w];y.set(S,m*p*w)}const R=new Te;R.setAttribute("position",new Oe(_,v)),R.setAttribute("uv",new Oe(x,g)),R.setAttribute("faceIndex",new Oe(y,m)),t.push(R),i>Es&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function hh(s,t,e){const n=new Yi(s,t,e);return n.texture.mapping=Fa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Zr(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function tg(s,t,e){const n=new Float32Array(Gi),i=new D(0,1,0);return new $n({name:"SphericalGaussianBlur",defines:{n:Gi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:ic(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function uh(){return new $n({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ic(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function dh(){return new $n({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ic(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function ic(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function eg(s){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===Jo||l===Qo,h=l===Ds||l===Ns;if(c||h){let u=t.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new kl(s)),u=c?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&i(d)?(e===null&&(e=new kl(s)),u=c?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function ng(s){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&cr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function ig(s,t,e,n){const i={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const p in f.attributes)t.remove(f.attributes[p]);for(const p in f.morphAttributes){const v=f.morphAttributes[p];for(let g=0,m=v.length;g<m;g++)t.remove(v[g])}f.removeEventListener("dispose",a),delete i[f.id];const d=r.get(f);d&&(t.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,e.memory.geometries++),f}function l(u){const f=u.attributes;for(const p in f)t.update(f[p],s.ARRAY_BUFFER);const d=u.morphAttributes;for(const p in d){const v=d[p];for(let g=0,m=v.length;g<m;g++)t.update(v[g],s.ARRAY_BUFFER)}}function c(u){const f=[],d=u.index,p=u.attributes.position;let v=0;if(d!==null){const _=d.array;v=d.version;for(let x=0,y=_.length;x<y;x+=3){const R=_[x+0],w=_[x+1],T=_[x+2];f.push(R,w,w,T,T,R)}}else if(p!==void 0){const _=p.array;v=p.version;for(let x=0,y=_.length/3-1;x<y;x+=3){const R=x+0,w=x+1,T=x+2;f.push(R,w,w,T,T,R)}}else return;const g=new(Bu(f)?Wu:ec)(f,1);g.version=v;const m=r.get(u);m&&t.remove(m),r.set(u,g)}function h(u){const f=r.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function sg(s,t,e){let n;function i(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){s.drawElements(n,d,r,f*a),e.update(d,n,1)}function c(f,d,p){p!==0&&(s.drawElementsInstanced(n,d,r,f*a,p),e.update(d,n,p))}function h(f,d,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,p);let g=0;for(let m=0;m<p;m++)g+=d[m];e.update(g,n,1)}function u(f,d,p,v){if(p===0)return;const g=t.get("WEBGL_multi_draw");if(g===null)for(let m=0;m<f.length;m++)c(f[m]/a,d[m],v[m]);else{g.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,v,0,p);let m=0;for(let _=0;_<p;_++)m+=d[_]*v[_];e.update(m,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function rg(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function ag(s,t,e){const n=new WeakMap,i=new ae;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let b=function(){T.dispose(),n.delete(o),o.removeEventListener("dispose",b)};f!==void 0&&f.texture.dispose();const d=o.morphAttributes.position!==void 0,p=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],m=o.morphAttributes.normal||[],_=o.morphAttributes.color||[];let x=0;d===!0&&(x=1),p===!0&&(x=2),v===!0&&(x=3);let y=o.attributes.position.count*x,R=1;y>t.maxTextureSize&&(R=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);const w=new Float32Array(y*R*4*u),T=new Gu(w,y,R,u);T.type=bn,T.needsUpdate=!0;const E=x*4;for(let S=0;S<u;S++){const P=g[S],O=m[S],U=_[S],F=y*R*4*S;for(let K=0;K<P.count;K++){const N=K*E;d===!0&&(i.fromBufferAttribute(P,K),w[F+N+0]=i.x,w[F+N+1]=i.y,w[F+N+2]=i.z,w[F+N+3]=0),p===!0&&(i.fromBufferAttribute(O,K),w[F+N+4]=i.x,w[F+N+5]=i.y,w[F+N+6]=i.z,w[F+N+7]=0),v===!0&&(i.fromBufferAttribute(U,K),w[F+N+8]=i.x,w[F+N+9]=i.y,w[F+N+10]=i.z,w[F+N+11]=U.itemSize===4?i.w:1)}}f={count:u,texture:T,size:new vt(y,R)},n.set(o,f),o.addEventListener("dispose",b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let d=0;for(let v=0;v<c.length;v++)d+=c[v];const p=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(s,"morphTargetBaseInfluence",p),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}return{update:r}}function og(s,t,e,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(i.get(u)!==c&&(t.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;i.get(f)!==c&&(f.update(),i.set(f,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}class Zu extends Ke{constructor(t,e,n,i,r,a,o,l,c,h=Cs){if(h!==Cs&&h!==Us)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Cs&&(n=Ki),n===void 0&&h===Us&&(n=Os),super(null,i,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:on,this.minFilter=l!==void 0?l:on,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const ju=new Ke,fh=new Zu(1,1),Ju=new Gu,Qu=new Yf,td=new Yu,ph=[],mh=[],gh=new Float32Array(16),vh=new Float32Array(9),yh=new Float32Array(4);function Gs(s,t,e){const n=s[0];if(n<=0||n>0)return s;const i=t*e;let r=ph[i];if(r===void 0&&(r=new Float32Array(i),ph[i]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function ke(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function Ce(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function Ha(s,t){let e=mh[t];e===void 0&&(e=new Int32Array(t),mh[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function lg(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function cg(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;s.uniform2fv(this.addr,t),Ce(e,t)}}function hg(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ke(e,t))return;s.uniform3fv(this.addr,t),Ce(e,t)}}function ug(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;s.uniform4fv(this.addr,t),Ce(e,t)}}function dg(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Ce(e,t)}else{if(ke(e,n))return;yh.set(n),s.uniformMatrix2fv(this.addr,!1,yh),Ce(e,n)}}function fg(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Ce(e,t)}else{if(ke(e,n))return;vh.set(n),s.uniformMatrix3fv(this.addr,!1,vh),Ce(e,n)}}function pg(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(ke(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Ce(e,t)}else{if(ke(e,n))return;gh.set(n),s.uniformMatrix4fv(this.addr,!1,gh),Ce(e,n)}}function mg(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function gg(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;s.uniform2iv(this.addr,t),Ce(e,t)}}function vg(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ke(e,t))return;s.uniform3iv(this.addr,t),Ce(e,t)}}function yg(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;s.uniform4iv(this.addr,t),Ce(e,t)}}function xg(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function _g(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ke(e,t))return;s.uniform2uiv(this.addr,t),Ce(e,t)}}function Mg(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ke(e,t))return;s.uniform3uiv(this.addr,t),Ce(e,t)}}function bg(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ke(e,t))return;s.uniform4uiv(this.addr,t),Ce(e,t)}}function Sg(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(fh.compareFunction=zu,r=fh):r=ju,e.setTexture2D(t||r,i)}function Eg(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Qu,i)}function Tg(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||td,i)}function wg(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Ju,i)}function Ag(s){switch(s){case 5126:return lg;case 35664:return cg;case 35665:return hg;case 35666:return ug;case 35674:return dg;case 35675:return fg;case 35676:return pg;case 5124:case 35670:return mg;case 35667:case 35671:return gg;case 35668:case 35672:return vg;case 35669:case 35673:return yg;case 5125:return xg;case 36294:return _g;case 36295:return Mg;case 36296:return bg;case 35678:case 36198:case 36298:case 36306:case 35682:return Sg;case 35679:case 36299:case 36307:return Eg;case 35680:case 36300:case 36308:case 36293:return Tg;case 36289:case 36303:case 36311:case 36292:return wg}}function Rg(s,t){s.uniform1fv(this.addr,t)}function kg(s,t){const e=Gs(t,this.size,2);s.uniform2fv(this.addr,e)}function Cg(s,t){const e=Gs(t,this.size,3);s.uniform3fv(this.addr,e)}function Pg(s,t){const e=Gs(t,this.size,4);s.uniform4fv(this.addr,e)}function Lg(s,t){const e=Gs(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function Ig(s,t){const e=Gs(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function Dg(s,t){const e=Gs(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function Ng(s,t){s.uniform1iv(this.addr,t)}function Og(s,t){s.uniform2iv(this.addr,t)}function Ug(s,t){s.uniform3iv(this.addr,t)}function Fg(s,t){s.uniform4iv(this.addr,t)}function zg(s,t){s.uniform1uiv(this.addr,t)}function Bg(s,t){s.uniform2uiv(this.addr,t)}function Hg(s,t){s.uniform3uiv(this.addr,t)}function Gg(s,t){s.uniform4uiv(this.addr,t)}function Vg(s,t,e){const n=this.cache,i=t.length,r=Ha(e,i);ke(n,r)||(s.uniform1iv(this.addr,r),Ce(n,r));for(let a=0;a!==i;++a)e.setTexture2D(t[a]||ju,r[a])}function Wg(s,t,e){const n=this.cache,i=t.length,r=Ha(e,i);ke(n,r)||(s.uniform1iv(this.addr,r),Ce(n,r));for(let a=0;a!==i;++a)e.setTexture3D(t[a]||Qu,r[a])}function Xg(s,t,e){const n=this.cache,i=t.length,r=Ha(e,i);ke(n,r)||(s.uniform1iv(this.addr,r),Ce(n,r));for(let a=0;a!==i;++a)e.setTextureCube(t[a]||td,r[a])}function Kg(s,t,e){const n=this.cache,i=t.length,r=Ha(e,i);ke(n,r)||(s.uniform1iv(this.addr,r),Ce(n,r));for(let a=0;a!==i;++a)e.setTexture2DArray(t[a]||Ju,r[a])}function Yg(s){switch(s){case 5126:return Rg;case 35664:return kg;case 35665:return Cg;case 35666:return Pg;case 35674:return Lg;case 35675:return Ig;case 35676:return Dg;case 5124:case 35670:return Ng;case 35667:case 35671:return Og;case 35668:case 35672:return Ug;case 35669:case 35673:return Fg;case 5125:return zg;case 36294:return Bg;case 36295:return Hg;case 36296:return Gg;case 35678:case 36198:case 36298:case 36306:case 35682:return Vg;case 35679:case 36299:case 36307:return Wg;case 35680:case 36300:case 36308:case 36293:return Xg;case 36289:case 36303:case 36311:case 36292:return Kg}}class $g{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Ag(e.type)}}class qg{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Yg(e.type)}}class Zg{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(t,e[o.id],n)}}}const So=/(\w+)(\])?(\[|\.)?/g;function xh(s,t){s.seq.push(t),s.map[t.id]=t}function jg(s,t,e){const n=s.name,i=n.length;for(So.lastIndex=0;;){const r=So.exec(n),a=So.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){xh(e,c===void 0?new $g(o,s,t):new qg(o,s,t));break}else{let u=e.map[o];u===void 0&&(u=new Zg(o),xh(e,u)),e=u}}}class Sa{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=t.getActiveUniform(e,i),a=t.getUniformLocation(e,r.name);jg(r,a,this)}}setValue(t,e,n,i){const r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,a=e.length;r!==a;++r){const o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,r=t.length;i!==r;++i){const a=t[i];a.id in e&&n.push(a)}return n}}function _h(s,t,e){const n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}const Jg=37297;let Qg=0;function tv(s,t){const e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}const Mh=new Zt;function ev(s){ie._getMatrix(Mh,ie.workingColorSpace,s);const t=`mat3( ${Mh.elements.map(e=>e.toFixed(4))} )`;switch(ie.getTransfer(s)){case za:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function bh(s,t,e){const n=s.getShaderParameter(t,s.COMPILE_STATUS),i=s.getShaderInfoLog(t).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const a=parseInt(r[1]);return e.toUpperCase()+`

`+i+`

`+tv(s.getShaderSource(t),a)}else return i}function nv(s,t){const e=ev(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function iv(s,t){let e;switch(t){case _f:e="Linear";break;case Mf:e="Reinhard";break;case bf:e="Cineon";break;case Ru:e="ACESFilmic";break;case Ef:e="AgX";break;case Tf:e="Neutral";break;case Sf:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const jr=new D;function sv(){ie.getLuminanceCoefficients(jr);const s=jr.x.toFixed(4),t=jr.y.toFixed(4),e=jr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function rv(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(hr).join(`
`)}function av(s){const t=[];for(const e in s){const n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function ov(s,t){const e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(t,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function hr(s){return s!==""}function Sh(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Eh(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const lv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Cl(s){return s.replace(lv,hv)}const cv=new Map;function hv(s,t){let e=Jt[t];if(e===void 0){const n=cv.get(t);if(n!==void 0)e=Jt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Cl(e)}const uv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Th(s){return s.replace(uv,dv)}function dv(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function wh(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function fv(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===wu?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===Au?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Wn&&(t="SHADOWMAP_TYPE_VSM"),t}function pv(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Ds:case Ns:t="ENVMAP_TYPE_CUBE";break;case Fa:t="ENVMAP_TYPE_CUBE_UV";break}return t}function mv(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Ns:t="ENVMAP_MODE_REFRACTION";break}return t}function gv(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Xl:t="ENVMAP_BLENDING_MULTIPLY";break;case yf:t="ENVMAP_BLENDING_MIX";break;case xf:t="ENVMAP_BLENDING_ADD";break}return t}function vv(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function yv(s,t,e,n){const i=s.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const l=fv(e),c=pv(e),h=mv(e),u=gv(e),f=vv(e),d=rv(e),p=av(r),v=i.createProgram();let g,m,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(hr).join(`
`),g.length>0&&(g+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p].filter(hr).join(`
`),m.length>0&&(m+=`
`)):(g=[wh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(hr).join(`
`),m=[wh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,p,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==pi?"#define TONE_MAPPING":"",e.toneMapping!==pi?Jt.tonemapping_pars_fragment:"",e.toneMapping!==pi?iv("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Jt.colorspace_pars_fragment,nv("linearToOutputTexel",e.outputColorSpace),sv(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(hr).join(`
`)),a=Cl(a),a=Sh(a,e),a=Eh(a,e),o=Cl(o),o=Sh(o,e),o=Eh(o,e),a=Th(a),o=Th(o),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,g=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,m=["#define varying in",e.glslVersion===Bc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Bc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const x=_+g+a,y=_+m+o,R=_h(i,i.VERTEX_SHADER,x),w=_h(i,i.FRAGMENT_SHADER,y);i.attachShader(v,R),i.attachShader(v,w),e.index0AttributeName!==void 0?i.bindAttribLocation(v,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(v,0,"position"),i.linkProgram(v);function T(P){if(s.debug.checkShaderErrors){const O=i.getProgramInfoLog(v).trim(),U=i.getShaderInfoLog(R).trim(),F=i.getShaderInfoLog(w).trim();let K=!0,N=!0;if(i.getProgramParameter(v,i.LINK_STATUS)===!1)if(K=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,v,R,w);else{const Y=bh(i,R,"vertex"),H=bh(i,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(v,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+O+`
`+Y+`
`+H)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(U===""||F==="")&&(N=!1);N&&(P.diagnostics={runnable:K,programLog:O,vertexShader:{log:U,prefix:g},fragmentShader:{log:F,prefix:m}})}i.deleteShader(R),i.deleteShader(w),E=new Sa(i,v),b=ov(i,v)}let E;this.getUniforms=function(){return E===void 0&&T(this),E};let b;this.getAttributes=function(){return b===void 0&&T(this),b};let S=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=i.getProgramParameter(v,Jg)),S},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(v),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Qg++,this.cacheKey=t,this.usedTimes=1,this.program=v,this.vertexShader=R,this.fragmentShader=w,this}let xv=0;class _v{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Mv(t),e.set(t,n)),n}}class Mv{constructor(t){this.id=xv++,this.code=t,this.usedTimes=0}}function bv(s,t,e,n,i,r,a){const o=new tc,l=new _v,c=new Set,h=[],u=i.logarithmicDepthBuffer,f=i.vertexTextures;let d=i.precision;const p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(b){return c.add(b),b===0?"uv":`uv${b}`}function g(b,S,P,O,U){const F=O.fog,K=U.geometry,N=b.isMeshStandardMaterial?O.environment:null,Y=(b.isMeshStandardMaterial?e:t).get(b.envMap||N),H=Y&&Y.mapping===Fa?Y.image.height:null,J=p[b.type];b.precision!==null&&(d=i.getMaxPrecision(b.precision),d!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",d,"instead."));const st=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,lt=st!==void 0?st.length:0;let ht=0;K.morphAttributes.position!==void 0&&(ht=1),K.morphAttributes.normal!==void 0&&(ht=2),K.morphAttributes.color!==void 0&&(ht=3);let St,W,et,yt;if(J){const ce=An[J];St=ce.vertexShader,W=ce.fragmentShader}else St=b.vertexShader,W=b.fragmentShader,l.update(b),et=l.getVertexShaderID(b),yt=l.getFragmentShaderID(b);const ot=s.getRenderTarget(),_t=s.state.buffers.depth.getReversed(),wt=U.isInstancedMesh===!0,At=U.isBatchedMesh===!0,Gt=!!b.map,Q=!!b.matcap,j=!!Y,L=!!b.aoMap,ft=!!b.lightMap,nt=!!b.bumpMap,xt=!!b.normalMap,gt=!!b.displacementMap,zt=!!b.emissiveMap,pt=!!b.metalnessMap,C=!!b.roughnessMap,A=b.anisotropy>0,I=b.clearcoat>0,z=b.dispersion>0,X=b.iridescence>0,$=b.sheen>0,ut=b.transmission>0,at=A&&!!b.anisotropyMap,rt=I&&!!b.clearcoatMap,It=I&&!!b.clearcoatNormalMap,it=I&&!!b.clearcoatRoughnessMap,Et=X&&!!b.iridescenceMap,Nt=X&&!!b.iridescenceThicknessMap,Ht=$&&!!b.sheenColorMap,kt=$&&!!b.sheenRoughnessMap,ne=!!b.specularMap,jt=!!b.specularColorMap,me=!!b.specularIntensityMap,B=ut&&!!b.transmissionMap,Rt=ut&&!!b.thicknessMap,tt=!!b.gradientMap,ct=!!b.alphaMap,Lt=b.alphaTest>0,Ct=!!b.alphaHash,$t=!!b.extensions;let Me=pi;b.toneMapped&&(ot===null||ot.isXRRenderTarget===!0)&&(Me=s.toneMapping);const Fe={shaderID:J,shaderType:b.type,shaderName:b.name,vertexShader:St,fragmentShader:W,defines:b.defines,customVertexShaderID:et,customFragmentShaderID:yt,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:d,batching:At,batchingColor:At&&U._colorsTexture!==null,instancing:wt,instancingColor:wt&&U.instanceColor!==null,instancingMorph:wt&&U.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:ot===null?s.outputColorSpace:ot.isXRRenderTarget===!0?ot.texture.colorSpace:Bs,alphaToCoverage:!!b.alphaToCoverage,map:Gt,matcap:Q,envMap:j,envMapMode:j&&Y.mapping,envMapCubeUVHeight:H,aoMap:L,lightMap:ft,bumpMap:nt,normalMap:xt,displacementMap:f&&gt,emissiveMap:zt,normalMapObjectSpace:xt&&b.normalMapType===Cf,normalMapTangentSpace:xt&&b.normalMapType===Ql,metalnessMap:pt,roughnessMap:C,anisotropy:A,anisotropyMap:at,clearcoat:I,clearcoatMap:rt,clearcoatNormalMap:It,clearcoatRoughnessMap:it,dispersion:z,iridescence:X,iridescenceMap:Et,iridescenceThicknessMap:Nt,sheen:$,sheenColorMap:Ht,sheenRoughnessMap:kt,specularMap:ne,specularColorMap:jt,specularIntensityMap:me,transmission:ut,transmissionMap:B,thicknessMap:Rt,gradientMap:tt,opaque:b.transparent===!1&&b.blending===ks&&b.alphaToCoverage===!1,alphaMap:ct,alphaTest:Lt,alphaHash:Ct,combine:b.combine,mapUv:Gt&&v(b.map.channel),aoMapUv:L&&v(b.aoMap.channel),lightMapUv:ft&&v(b.lightMap.channel),bumpMapUv:nt&&v(b.bumpMap.channel),normalMapUv:xt&&v(b.normalMap.channel),displacementMapUv:gt&&v(b.displacementMap.channel),emissiveMapUv:zt&&v(b.emissiveMap.channel),metalnessMapUv:pt&&v(b.metalnessMap.channel),roughnessMapUv:C&&v(b.roughnessMap.channel),anisotropyMapUv:at&&v(b.anisotropyMap.channel),clearcoatMapUv:rt&&v(b.clearcoatMap.channel),clearcoatNormalMapUv:It&&v(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:it&&v(b.clearcoatRoughnessMap.channel),iridescenceMapUv:Et&&v(b.iridescenceMap.channel),iridescenceThicknessMapUv:Nt&&v(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ht&&v(b.sheenColorMap.channel),sheenRoughnessMapUv:kt&&v(b.sheenRoughnessMap.channel),specularMapUv:ne&&v(b.specularMap.channel),specularColorMapUv:jt&&v(b.specularColorMap.channel),specularIntensityMapUv:me&&v(b.specularIntensityMap.channel),transmissionMapUv:B&&v(b.transmissionMap.channel),thicknessMapUv:Rt&&v(b.thicknessMap.channel),alphaMapUv:ct&&v(b.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(xt||A),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!K.attributes.uv&&(Gt||ct),fog:!!F,useFog:b.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:_t,skinning:U.isSkinnedMesh===!0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:lt,morphTextureStride:ht,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:b.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:Me,decodeVideoTexture:Gt&&b.map.isVideoTexture===!0&&ie.getTransfer(b.map.colorSpace)===de,decodeVideoTextureEmissive:zt&&b.emissiveMap.isVideoTexture===!0&&ie.getTransfer(b.emissiveMap.colorSpace)===de,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Re,flipSided:b.side===Xe,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:$t&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:($t&&b.extensions.multiDraw===!0||At)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return Fe.vertexUv1s=c.has(1),Fe.vertexUv2s=c.has(2),Fe.vertexUv3s=c.has(3),c.clear(),Fe}function m(b){const S=[];if(b.shaderID?S.push(b.shaderID):(S.push(b.customVertexShaderID),S.push(b.customFragmentShaderID)),b.defines!==void 0)for(const P in b.defines)S.push(P),S.push(b.defines[P]);return b.isRawShaderMaterial===!1&&(_(S,b),x(S,b),S.push(s.outputColorSpace)),S.push(b.customProgramCacheKey),S.join()}function _(b,S){b.push(S.precision),b.push(S.outputColorSpace),b.push(S.envMapMode),b.push(S.envMapCubeUVHeight),b.push(S.mapUv),b.push(S.alphaMapUv),b.push(S.lightMapUv),b.push(S.aoMapUv),b.push(S.bumpMapUv),b.push(S.normalMapUv),b.push(S.displacementMapUv),b.push(S.emissiveMapUv),b.push(S.metalnessMapUv),b.push(S.roughnessMapUv),b.push(S.anisotropyMapUv),b.push(S.clearcoatMapUv),b.push(S.clearcoatNormalMapUv),b.push(S.clearcoatRoughnessMapUv),b.push(S.iridescenceMapUv),b.push(S.iridescenceThicknessMapUv),b.push(S.sheenColorMapUv),b.push(S.sheenRoughnessMapUv),b.push(S.specularMapUv),b.push(S.specularColorMapUv),b.push(S.specularIntensityMapUv),b.push(S.transmissionMapUv),b.push(S.thicknessMapUv),b.push(S.combine),b.push(S.fogExp2),b.push(S.sizeAttenuation),b.push(S.morphTargetsCount),b.push(S.morphAttributeCount),b.push(S.numDirLights),b.push(S.numPointLights),b.push(S.numSpotLights),b.push(S.numSpotLightMaps),b.push(S.numHemiLights),b.push(S.numRectAreaLights),b.push(S.numDirLightShadows),b.push(S.numPointLightShadows),b.push(S.numSpotLightShadows),b.push(S.numSpotLightShadowsWithMaps),b.push(S.numLightProbes),b.push(S.shadowMapType),b.push(S.toneMapping),b.push(S.numClippingPlanes),b.push(S.numClipIntersection),b.push(S.depthPacking)}function x(b,S){o.disableAll(),S.supportsVertexTextures&&o.enable(0),S.instancing&&o.enable(1),S.instancingColor&&o.enable(2),S.instancingMorph&&o.enable(3),S.matcap&&o.enable(4),S.envMap&&o.enable(5),S.normalMapObjectSpace&&o.enable(6),S.normalMapTangentSpace&&o.enable(7),S.clearcoat&&o.enable(8),S.iridescence&&o.enable(9),S.alphaTest&&o.enable(10),S.vertexColors&&o.enable(11),S.vertexAlphas&&o.enable(12),S.vertexUv1s&&o.enable(13),S.vertexUv2s&&o.enable(14),S.vertexUv3s&&o.enable(15),S.vertexTangents&&o.enable(16),S.anisotropy&&o.enable(17),S.alphaHash&&o.enable(18),S.batching&&o.enable(19),S.dispersion&&o.enable(20),S.batchingColor&&o.enable(21),b.push(o.mask),o.disableAll(),S.fog&&o.enable(0),S.useFog&&o.enable(1),S.flatShading&&o.enable(2),S.logarithmicDepthBuffer&&o.enable(3),S.reverseDepthBuffer&&o.enable(4),S.skinning&&o.enable(5),S.morphTargets&&o.enable(6),S.morphNormals&&o.enable(7),S.morphColors&&o.enable(8),S.premultipliedAlpha&&o.enable(9),S.shadowMapEnabled&&o.enable(10),S.doubleSided&&o.enable(11),S.flipSided&&o.enable(12),S.useDepthPacking&&o.enable(13),S.dithering&&o.enable(14),S.transmission&&o.enable(15),S.sheen&&o.enable(16),S.opaque&&o.enable(17),S.pointsUvs&&o.enable(18),S.decodeVideoTexture&&o.enable(19),S.decodeVideoTextureEmissive&&o.enable(20),S.alphaToCoverage&&o.enable(21),b.push(o.mask)}function y(b){const S=p[b.type];let P;if(S){const O=An[S];P=rp.clone(O.uniforms)}else P=b.uniforms;return P}function R(b,S){let P;for(let O=0,U=h.length;O<U;O++){const F=h[O];if(F.cacheKey===S){P=F,++P.usedTimes;break}}return P===void 0&&(P=new yv(s,S,b,r),h.push(P)),P}function w(b){if(--b.usedTimes===0){const S=h.indexOf(b);h[S]=h[h.length-1],h.pop(),b.destroy()}}function T(b){l.remove(b)}function E(){l.dispose()}return{getParameters:g,getProgramCacheKey:m,getUniforms:y,acquireProgram:R,releaseProgram:w,releaseShaderCache:T,programs:h,dispose:E}}function Sv(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function Ev(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function Ah(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function Rh(){const s=[];let t=0;const e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function a(u,f,d,p,v,g){let m=s[t];return m===void 0?(m={id:u.id,object:u,geometry:f,material:d,groupOrder:p,renderOrder:u.renderOrder,z:v,group:g},s[t]=m):(m.id=u.id,m.object=u,m.geometry=f,m.material=d,m.groupOrder=p,m.renderOrder=u.renderOrder,m.z=v,m.group=g),t++,m}function o(u,f,d,p,v,g){const m=a(u,f,d,p,v,g);d.transmission>0?n.push(m):d.transparent===!0?i.push(m):e.push(m)}function l(u,f,d,p,v,g){const m=a(u,f,d,p,v,g);d.transmission>0?n.unshift(m):d.transparent===!0?i.unshift(m):e.unshift(m)}function c(u,f){e.length>1&&e.sort(u||Ev),n.length>1&&n.sort(f||Ah),i.length>1&&i.sort(f||Ah)}function h(){for(let u=t,f=s.length;u<f;u++){const d=s[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:o,unshift:l,finish:h,sort:c}}function Tv(){let s=new WeakMap;function t(n,i){const r=s.get(n);let a;return r===void 0?(a=new Rh,s.set(n,[a])):i>=r.length?(a=new Rh,r.push(a)):a=r[i],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function wv(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new D,color:new Vt};break;case"SpotLight":e={position:new D,direction:new D,color:new Vt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new D,color:new Vt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new D,skyColor:new Vt,groundColor:new Vt};break;case"RectAreaLight":e={color:new Vt,position:new D,halfWidth:new D,halfHeight:new D};break}return s[t.id]=e,e}}}function Av(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new vt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let Rv=0;function kv(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function Cv(s){const t=new wv,e=Av(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);const i=new D,r=new Yt,a=new Yt;function o(c){let h=0,u=0,f=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let d=0,p=0,v=0,g=0,m=0,_=0,x=0,y=0,R=0,w=0,T=0;c.sort(kv);for(let b=0,S=c.length;b<S;b++){const P=c[b],O=P.color,U=P.intensity,F=P.distance,K=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=O.r*U,u+=O.g*U,f+=O.b*U;else if(P.isLightProbe){for(let N=0;N<9;N++)n.probe[N].addScaledVector(P.sh.coefficients[N],U);T++}else if(P.isDirectionalLight){const N=t.get(P);if(N.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const Y=P.shadow,H=e.get(P);H.shadowIntensity=Y.intensity,H.shadowBias=Y.bias,H.shadowNormalBias=Y.normalBias,H.shadowRadius=Y.radius,H.shadowMapSize=Y.mapSize,n.directionalShadow[d]=H,n.directionalShadowMap[d]=K,n.directionalShadowMatrix[d]=P.shadow.matrix,_++}n.directional[d]=N,d++}else if(P.isSpotLight){const N=t.get(P);N.position.setFromMatrixPosition(P.matrixWorld),N.color.copy(O).multiplyScalar(U),N.distance=F,N.coneCos=Math.cos(P.angle),N.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),N.decay=P.decay,n.spot[v]=N;const Y=P.shadow;if(P.map&&(n.spotLightMap[R]=P.map,R++,Y.updateMatrices(P),P.castShadow&&w++),n.spotLightMatrix[v]=Y.matrix,P.castShadow){const H=e.get(P);H.shadowIntensity=Y.intensity,H.shadowBias=Y.bias,H.shadowNormalBias=Y.normalBias,H.shadowRadius=Y.radius,H.shadowMapSize=Y.mapSize,n.spotShadow[v]=H,n.spotShadowMap[v]=K,y++}v++}else if(P.isRectAreaLight){const N=t.get(P);N.color.copy(O).multiplyScalar(U),N.halfWidth.set(P.width*.5,0,0),N.halfHeight.set(0,P.height*.5,0),n.rectArea[g]=N,g++}else if(P.isPointLight){const N=t.get(P);if(N.color.copy(P.color).multiplyScalar(P.intensity),N.distance=P.distance,N.decay=P.decay,P.castShadow){const Y=P.shadow,H=e.get(P);H.shadowIntensity=Y.intensity,H.shadowBias=Y.bias,H.shadowNormalBias=Y.normalBias,H.shadowRadius=Y.radius,H.shadowMapSize=Y.mapSize,H.shadowCameraNear=Y.camera.near,H.shadowCameraFar=Y.camera.far,n.pointShadow[p]=H,n.pointShadowMap[p]=K,n.pointShadowMatrix[p]=P.shadow.matrix,x++}n.point[p]=N,p++}else if(P.isHemisphereLight){const N=t.get(P);N.skyColor.copy(P.color).multiplyScalar(U),N.groundColor.copy(P.groundColor).multiplyScalar(U),n.hemi[m]=N,m++}}g>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Tt.LTC_FLOAT_1,n.rectAreaLTC2=Tt.LTC_FLOAT_2):(n.rectAreaLTC1=Tt.LTC_HALF_1,n.rectAreaLTC2=Tt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const E=n.hash;(E.directionalLength!==d||E.pointLength!==p||E.spotLength!==v||E.rectAreaLength!==g||E.hemiLength!==m||E.numDirectionalShadows!==_||E.numPointShadows!==x||E.numSpotShadows!==y||E.numSpotMaps!==R||E.numLightProbes!==T)&&(n.directional.length=d,n.spot.length=v,n.rectArea.length=g,n.point.length=p,n.hemi.length=m,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=y+R-w,n.spotLightMap.length=R,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=T,E.directionalLength=d,E.pointLength=p,E.spotLength=v,E.rectAreaLength=g,E.hemiLength=m,E.numDirectionalShadows=_,E.numPointShadows=x,E.numSpotShadows=y,E.numSpotMaps=R,E.numLightProbes=T,n.version=Rv++)}function l(c,h){let u=0,f=0,d=0,p=0,v=0;const g=h.matrixWorldInverse;for(let m=0,_=c.length;m<_;m++){const x=c[m];if(x.isDirectionalLight){const y=n.directional[u];y.direction.setFromMatrixPosition(x.matrixWorld),i.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(i),y.direction.transformDirection(g),u++}else if(x.isSpotLight){const y=n.spot[d];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),y.direction.setFromMatrixPosition(x.matrixWorld),i.setFromMatrixPosition(x.target.matrixWorld),y.direction.sub(i),y.direction.transformDirection(g),d++}else if(x.isRectAreaLight){const y=n.rectArea[p];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),a.identity(),r.copy(x.matrixWorld),r.premultiply(g),a.extractRotation(r),y.halfWidth.set(x.width*.5,0,0),y.halfHeight.set(0,x.height*.5,0),y.halfWidth.applyMatrix4(a),y.halfHeight.applyMatrix4(a),p++}else if(x.isPointLight){const y=n.point[f];y.position.setFromMatrixPosition(x.matrixWorld),y.position.applyMatrix4(g),f++}else if(x.isHemisphereLight){const y=n.hemi[v];y.direction.setFromMatrixPosition(x.matrixWorld),y.direction.transformDirection(g),v++}}}return{setup:o,setupView:l,state:n}}function kh(s){const t=new Cv(s),e=[],n=[];function i(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function a(h){n.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Pv(s){let t=new WeakMap;function e(i,r=0){const a=t.get(i);let o;return a===void 0?(o=new kh(s),t.set(i,[o])):r>=a.length?(o=new kh(s),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}class Lv extends Ti{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Rf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Iv extends Ti{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const Dv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Nv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Ov(s,t,e){let n=new nc;const i=new vt,r=new vt,a=new ae,o=new Lv({depthPacking:kf}),l=new Iv,c={},h=e.maxTextureSize,u={[yi]:Xe,[Xe]:yi,[Re]:Re},f=new $n({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new vt},radius:{value:4}},vertexShader:Dv,fragmentShader:Nv}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const p=new Te;p.setAttribute("position",new Oe(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new Dt(p,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=wu;let m=this.type;this.render=function(w,T,E){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||w.length===0)return;const b=s.getRenderTarget(),S=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),O=s.state;O.setBlending(fi),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const U=m!==Wn&&this.type===Wn,F=m===Wn&&this.type!==Wn;for(let K=0,N=w.length;K<N;K++){const Y=w[K],H=Y.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;i.copy(H.mapSize);const J=H.getFrameExtents();if(i.multiply(J),r.copy(H.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/J.x),i.x=r.x*J.x,H.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/J.y),i.y=r.y*J.y,H.mapSize.y=r.y)),H.map===null||U===!0||F===!0){const lt=this.type!==Wn?{minFilter:on,magFilter:on}:{};H.map!==null&&H.map.dispose(),H.map=new Yi(i.x,i.y,lt),H.map.texture.name=Y.name+".shadowMap",H.camera.updateProjectionMatrix()}s.setRenderTarget(H.map),s.clear();const st=H.getViewportCount();for(let lt=0;lt<st;lt++){const ht=H.getViewport(lt);a.set(r.x*ht.x,r.y*ht.y,r.x*ht.z,r.y*ht.w),O.viewport(a),H.updateMatrices(Y,lt),n=H.getFrustum(),y(T,E,H.camera,Y,this.type)}H.isPointLightShadow!==!0&&this.type===Wn&&_(H,E),H.needsUpdate=!1}m=this.type,g.needsUpdate=!1,s.setRenderTarget(b,S,P)};function _(w,T){const E=t.update(v);f.defines.VSM_SAMPLES!==w.blurSamples&&(f.defines.VSM_SAMPLES=w.blurSamples,d.defines.VSM_SAMPLES=w.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Yi(i.x,i.y)),f.uniforms.shadow_pass.value=w.map.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,s.setRenderTarget(w.mapPass),s.clear(),s.renderBufferDirect(T,null,E,f,v,null),d.uniforms.shadow_pass.value=w.mapPass.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,s.setRenderTarget(w.map),s.clear(),s.renderBufferDirect(T,null,E,d,v,null)}function x(w,T,E,b){let S=null;const P=E.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(P!==void 0)S=P;else if(S=E.isPointLight===!0?l:o,s.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0){const O=S.uuid,U=T.uuid;let F=c[O];F===void 0&&(F={},c[O]=F);let K=F[U];K===void 0&&(K=S.clone(),F[U]=K,T.addEventListener("dispose",R)),S=K}if(S.visible=T.visible,S.wireframe=T.wireframe,b===Wn?S.side=T.shadowSide!==null?T.shadowSide:T.side:S.side=T.shadowSide!==null?T.shadowSide:u[T.side],S.alphaMap=T.alphaMap,S.alphaTest=T.alphaTest,S.map=T.map,S.clipShadows=T.clipShadows,S.clippingPlanes=T.clippingPlanes,S.clipIntersection=T.clipIntersection,S.displacementMap=T.displacementMap,S.displacementScale=T.displacementScale,S.displacementBias=T.displacementBias,S.wireframeLinewidth=T.wireframeLinewidth,S.linewidth=T.linewidth,E.isPointLight===!0&&S.isMeshDistanceMaterial===!0){const O=s.properties.get(S);O.light=E}return S}function y(w,T,E,b,S){if(w.visible===!1)return;if(w.layers.test(T.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&S===Wn)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(E.matrixWorldInverse,w.matrixWorld);const U=t.update(w),F=w.material;if(Array.isArray(F)){const K=U.groups;for(let N=0,Y=K.length;N<Y;N++){const H=K[N],J=F[H.materialIndex];if(J&&J.visible){const st=x(w,J,b,S);w.onBeforeShadow(s,w,T,E,U,st,H),s.renderBufferDirect(E,null,U,st,w,H),w.onAfterShadow(s,w,T,E,U,st,H)}}}else if(F.visible){const K=x(w,F,b,S);w.onBeforeShadow(s,w,T,E,U,K,null),s.renderBufferDirect(E,null,U,K,w,null),w.onAfterShadow(s,w,T,E,U,K,null)}}const O=w.children;for(let U=0,F=O.length;U<F;U++)y(O[U],T,E,b,S)}function R(w){w.target.removeEventListener("dispose",R);for(const E in c){const b=c[E],S=w.target.uuid;S in b&&(b[S].dispose(),delete b[S])}}}const Uv={[Xo]:Ko,[Yo]:Zo,[$o]:jo,[Is]:qo,[Ko]:Xo,[Zo]:Yo,[jo]:$o,[qo]:Is};function Fv(s,t){function e(){let B=!1;const Rt=new ae;let tt=null;const ct=new ae(0,0,0,0);return{setMask:function(Lt){tt!==Lt&&!B&&(s.colorMask(Lt,Lt,Lt,Lt),tt=Lt)},setLocked:function(Lt){B=Lt},setClear:function(Lt,Ct,$t,Me,Fe){Fe===!0&&(Lt*=Me,Ct*=Me,$t*=Me),Rt.set(Lt,Ct,$t,Me),ct.equals(Rt)===!1&&(s.clearColor(Lt,Ct,$t,Me),ct.copy(Rt))},reset:function(){B=!1,tt=null,ct.set(-1,0,0,0)}}}function n(){let B=!1,Rt=!1,tt=null,ct=null,Lt=null;return{setReversed:function(Ct){if(Rt!==Ct){const $t=t.get("EXT_clip_control");Rt?$t.clipControlEXT($t.LOWER_LEFT_EXT,$t.ZERO_TO_ONE_EXT):$t.clipControlEXT($t.LOWER_LEFT_EXT,$t.NEGATIVE_ONE_TO_ONE_EXT);const Me=Lt;Lt=null,this.setClear(Me)}Rt=Ct},getReversed:function(){return Rt},setTest:function(Ct){Ct?ot(s.DEPTH_TEST):_t(s.DEPTH_TEST)},setMask:function(Ct){tt!==Ct&&!B&&(s.depthMask(Ct),tt=Ct)},setFunc:function(Ct){if(Rt&&(Ct=Uv[Ct]),ct!==Ct){switch(Ct){case Xo:s.depthFunc(s.NEVER);break;case Ko:s.depthFunc(s.ALWAYS);break;case Yo:s.depthFunc(s.LESS);break;case Is:s.depthFunc(s.LEQUAL);break;case $o:s.depthFunc(s.EQUAL);break;case qo:s.depthFunc(s.GEQUAL);break;case Zo:s.depthFunc(s.GREATER);break;case jo:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ct=Ct}},setLocked:function(Ct){B=Ct},setClear:function(Ct){Lt!==Ct&&(Rt&&(Ct=1-Ct),s.clearDepth(Ct),Lt=Ct)},reset:function(){B=!1,tt=null,ct=null,Lt=null,Rt=!1}}}function i(){let B=!1,Rt=null,tt=null,ct=null,Lt=null,Ct=null,$t=null,Me=null,Fe=null;return{setTest:function(ce){B||(ce?ot(s.STENCIL_TEST):_t(s.STENCIL_TEST))},setMask:function(ce){Rt!==ce&&!B&&(s.stencilMask(ce),Rt=ce)},setFunc:function(ce,mn,Dn){(tt!==ce||ct!==mn||Lt!==Dn)&&(s.stencilFunc(ce,mn,Dn),tt=ce,ct=mn,Lt=Dn)},setOp:function(ce,mn,Dn){(Ct!==ce||$t!==mn||Me!==Dn)&&(s.stencilOp(ce,mn,Dn),Ct=ce,$t=mn,Me=Dn)},setLocked:function(ce){B=ce},setClear:function(ce){Fe!==ce&&(s.clearStencil(ce),Fe=ce)},reset:function(){B=!1,Rt=null,tt=null,ct=null,Lt=null,Ct=null,$t=null,Me=null,Fe=null}}}const r=new e,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,d=[],p=null,v=!1,g=null,m=null,_=null,x=null,y=null,R=null,w=null,T=new Vt(0,0,0),E=0,b=!1,S=null,P=null,O=null,U=null,F=null;const K=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let N=!1,Y=0;const H=s.getParameter(s.VERSION);H.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(H)[1]),N=Y>=1):H.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),N=Y>=2);let J=null,st={};const lt=s.getParameter(s.SCISSOR_BOX),ht=s.getParameter(s.VIEWPORT),St=new ae().fromArray(lt),W=new ae().fromArray(ht);function et(B,Rt,tt,ct){const Lt=new Uint8Array(4),Ct=s.createTexture();s.bindTexture(B,Ct),s.texParameteri(B,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(B,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let $t=0;$t<tt;$t++)B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY?s.texImage3D(Rt,0,s.RGBA,1,1,ct,0,s.RGBA,s.UNSIGNED_BYTE,Lt):s.texImage2D(Rt+$t,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Lt);return Ct}const yt={};yt[s.TEXTURE_2D]=et(s.TEXTURE_2D,s.TEXTURE_2D,1),yt[s.TEXTURE_CUBE_MAP]=et(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),yt[s.TEXTURE_2D_ARRAY]=et(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),yt[s.TEXTURE_3D]=et(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ot(s.DEPTH_TEST),a.setFunc(Is),nt(!1),xt(Nc),ot(s.CULL_FACE),L(fi);function ot(B){h[B]!==!0&&(s.enable(B),h[B]=!0)}function _t(B){h[B]!==!1&&(s.disable(B),h[B]=!1)}function wt(B,Rt){return u[B]!==Rt?(s.bindFramebuffer(B,Rt),u[B]=Rt,B===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=Rt),B===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=Rt),!0):!1}function At(B,Rt){let tt=d,ct=!1;if(B){tt=f.get(Rt),tt===void 0&&(tt=[],f.set(Rt,tt));const Lt=B.textures;if(tt.length!==Lt.length||tt[0]!==s.COLOR_ATTACHMENT0){for(let Ct=0,$t=Lt.length;Ct<$t;Ct++)tt[Ct]=s.COLOR_ATTACHMENT0+Ct;tt.length=Lt.length,ct=!0}}else tt[0]!==s.BACK&&(tt[0]=s.BACK,ct=!0);ct&&s.drawBuffers(tt)}function Gt(B){return p!==B?(s.useProgram(B),p=B,!0):!1}const Q={[Hi]:s.FUNC_ADD,[tf]:s.FUNC_SUBTRACT,[ef]:s.FUNC_REVERSE_SUBTRACT};Q[nf]=s.MIN,Q[sf]=s.MAX;const j={[rf]:s.ZERO,[af]:s.ONE,[of]:s.SRC_COLOR,[Vo]:s.SRC_ALPHA,[ff]:s.SRC_ALPHA_SATURATE,[uf]:s.DST_COLOR,[cf]:s.DST_ALPHA,[lf]:s.ONE_MINUS_SRC_COLOR,[Wo]:s.ONE_MINUS_SRC_ALPHA,[df]:s.ONE_MINUS_DST_COLOR,[hf]:s.ONE_MINUS_DST_ALPHA,[pf]:s.CONSTANT_COLOR,[mf]:s.ONE_MINUS_CONSTANT_COLOR,[gf]:s.CONSTANT_ALPHA,[vf]:s.ONE_MINUS_CONSTANT_ALPHA};function L(B,Rt,tt,ct,Lt,Ct,$t,Me,Fe,ce){if(B===fi){v===!0&&(_t(s.BLEND),v=!1);return}if(v===!1&&(ot(s.BLEND),v=!0),B!==Qd){if(B!==g||ce!==b){if((m!==Hi||y!==Hi)&&(s.blendEquation(s.FUNC_ADD),m=Hi,y=Hi),ce)switch(B){case ks:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Aa:s.blendFunc(s.ONE,s.ONE);break;case Oc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Uc:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}else switch(B){case ks:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Aa:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Oc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Uc:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}_=null,x=null,R=null,w=null,T.set(0,0,0),E=0,g=B,b=ce}return}Lt=Lt||Rt,Ct=Ct||tt,$t=$t||ct,(Rt!==m||Lt!==y)&&(s.blendEquationSeparate(Q[Rt],Q[Lt]),m=Rt,y=Lt),(tt!==_||ct!==x||Ct!==R||$t!==w)&&(s.blendFuncSeparate(j[tt],j[ct],j[Ct],j[$t]),_=tt,x=ct,R=Ct,w=$t),(Me.equals(T)===!1||Fe!==E)&&(s.blendColor(Me.r,Me.g,Me.b,Fe),T.copy(Me),E=Fe),g=B,b=!1}function ft(B,Rt){B.side===Re?_t(s.CULL_FACE):ot(s.CULL_FACE);let tt=B.side===Xe;Rt&&(tt=!tt),nt(tt),B.blending===ks&&B.transparent===!1?L(fi):L(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),a.setFunc(B.depthFunc),a.setTest(B.depthTest),a.setMask(B.depthWrite),r.setMask(B.colorWrite);const ct=B.stencilWrite;o.setTest(ct),ct&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),zt(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?ot(s.SAMPLE_ALPHA_TO_COVERAGE):_t(s.SAMPLE_ALPHA_TO_COVERAGE)}function nt(B){S!==B&&(B?s.frontFace(s.CW):s.frontFace(s.CCW),S=B)}function xt(B){B!==jd?(ot(s.CULL_FACE),B!==P&&(B===Nc?s.cullFace(s.BACK):B===Jd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):_t(s.CULL_FACE),P=B}function gt(B){B!==O&&(N&&s.lineWidth(B),O=B)}function zt(B,Rt,tt){B?(ot(s.POLYGON_OFFSET_FILL),(U!==Rt||F!==tt)&&(s.polygonOffset(Rt,tt),U=Rt,F=tt)):_t(s.POLYGON_OFFSET_FILL)}function pt(B){B?ot(s.SCISSOR_TEST):_t(s.SCISSOR_TEST)}function C(B){B===void 0&&(B=s.TEXTURE0+K-1),J!==B&&(s.activeTexture(B),J=B)}function A(B,Rt,tt){tt===void 0&&(J===null?tt=s.TEXTURE0+K-1:tt=J);let ct=st[tt];ct===void 0&&(ct={type:void 0,texture:void 0},st[tt]=ct),(ct.type!==B||ct.texture!==Rt)&&(J!==tt&&(s.activeTexture(tt),J=tt),s.bindTexture(B,Rt||yt[B]),ct.type=B,ct.texture=Rt)}function I(){const B=st[J];B!==void 0&&B.type!==void 0&&(s.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function z(){try{s.compressedTexImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function X(){try{s.compressedTexImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function $(){try{s.texSubImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ut(){try{s.texSubImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function at(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function rt(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function It(){try{s.texStorage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function it(){try{s.texStorage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Et(){try{s.texImage2D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Nt(){try{s.texImage3D.apply(s,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Ht(B){St.equals(B)===!1&&(s.scissor(B.x,B.y,B.z,B.w),St.copy(B))}function kt(B){W.equals(B)===!1&&(s.viewport(B.x,B.y,B.z,B.w),W.copy(B))}function ne(B,Rt){let tt=c.get(Rt);tt===void 0&&(tt=new WeakMap,c.set(Rt,tt));let ct=tt.get(B);ct===void 0&&(ct=s.getUniformBlockIndex(Rt,B.name),tt.set(B,ct))}function jt(B,Rt){const ct=c.get(Rt).get(B);l.get(Rt)!==ct&&(s.uniformBlockBinding(Rt,ct,B.__bindingPointIndex),l.set(Rt,ct))}function me(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},J=null,st={},u={},f=new WeakMap,d=[],p=null,v=!1,g=null,m=null,_=null,x=null,y=null,R=null,w=null,T=new Vt(0,0,0),E=0,b=!1,S=null,P=null,O=null,U=null,F=null,St.set(0,0,s.canvas.width,s.canvas.height),W.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ot,disable:_t,bindFramebuffer:wt,drawBuffers:At,useProgram:Gt,setBlending:L,setMaterial:ft,setFlipSided:nt,setCullFace:xt,setLineWidth:gt,setPolygonOffset:zt,setScissorTest:pt,activeTexture:C,bindTexture:A,unbindTexture:I,compressedTexImage2D:z,compressedTexImage3D:X,texImage2D:Et,texImage3D:Nt,updateUBOMapping:ne,uniformBlockBinding:jt,texStorage2D:It,texStorage3D:it,texSubImage2D:$,texSubImage3D:ut,compressedTexSubImage2D:at,compressedTexSubImage3D:rt,scissor:Ht,viewport:kt,reset:me}}function Ch(s,t,e,n){const i=zv(n);switch(e){case Iu:return s*t;case Nu:return s*t;case Ou:return s*t*2;case ql:return s*t/i.components*i.byteLength;case Zl:return s*t/i.components*i.byteLength;case Uu:return s*t*2/i.components*i.byteLength;case jl:return s*t*2/i.components*i.byteLength;case Du:return s*t*3/i.components*i.byteLength;case dn:return s*t*4/i.components*i.byteLength;case Jl:return s*t*4/i.components*i.byteLength;case ya:case xa:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case _a:case Ma:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case nl:case sl:return Math.max(s,16)*Math.max(t,8)/4;case el:case il:return Math.max(s,8)*Math.max(t,8)/2;case rl:case al:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case ol:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case ll:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case cl:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case hl:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case ul:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case dl:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case fl:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case pl:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case ml:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case gl:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case vl:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case yl:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case xl:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case _l:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case Ml:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case ba:case bl:case Sl:return Math.ceil(s/4)*Math.ceil(t/4)*16;case Fu:case El:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Tl:case wl:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function zv(s){switch(s){case Yn:case Cu:return{byteLength:1,components:1};case _r:case Pu:case Rr:return{byteLength:2,components:1};case Yl:case $l:return{byteLength:2,components:4};case Ki:case Kl:case bn:return{byteLength:4,components:1};case Lu:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function Bv(s,t,e,n,i,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new vt,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(C,A){return d?new OffscreenCanvas(C,A):ka("canvas")}function v(C,A,I){let z=1;const X=pt(C);if((X.width>I||X.height>I)&&(z=I/Math.max(X.width,X.height)),z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const $=Math.floor(z*X.width),ut=Math.floor(z*X.height);u===void 0&&(u=p($,ut));const at=A?p($,ut):u;return at.width=$,at.height=ut,at.getContext("2d").drawImage(C,0,0,$,ut),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+X.width+"x"+X.height+") to ("+$+"x"+ut+")."),at}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+X.width+"x"+X.height+")."),C;return C}function g(C){return C.generateMipmaps}function m(C){s.generateMipmap(C)}function _(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function x(C,A,I,z,X=!1){if(C!==null){if(s[C]!==void 0)return s[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let $=A;if(A===s.RED&&(I===s.FLOAT&&($=s.R32F),I===s.HALF_FLOAT&&($=s.R16F),I===s.UNSIGNED_BYTE&&($=s.R8)),A===s.RED_INTEGER&&(I===s.UNSIGNED_BYTE&&($=s.R8UI),I===s.UNSIGNED_SHORT&&($=s.R16UI),I===s.UNSIGNED_INT&&($=s.R32UI),I===s.BYTE&&($=s.R8I),I===s.SHORT&&($=s.R16I),I===s.INT&&($=s.R32I)),A===s.RG&&(I===s.FLOAT&&($=s.RG32F),I===s.HALF_FLOAT&&($=s.RG16F),I===s.UNSIGNED_BYTE&&($=s.RG8)),A===s.RG_INTEGER&&(I===s.UNSIGNED_BYTE&&($=s.RG8UI),I===s.UNSIGNED_SHORT&&($=s.RG16UI),I===s.UNSIGNED_INT&&($=s.RG32UI),I===s.BYTE&&($=s.RG8I),I===s.SHORT&&($=s.RG16I),I===s.INT&&($=s.RG32I)),A===s.RGB_INTEGER&&(I===s.UNSIGNED_BYTE&&($=s.RGB8UI),I===s.UNSIGNED_SHORT&&($=s.RGB16UI),I===s.UNSIGNED_INT&&($=s.RGB32UI),I===s.BYTE&&($=s.RGB8I),I===s.SHORT&&($=s.RGB16I),I===s.INT&&($=s.RGB32I)),A===s.RGBA_INTEGER&&(I===s.UNSIGNED_BYTE&&($=s.RGBA8UI),I===s.UNSIGNED_SHORT&&($=s.RGBA16UI),I===s.UNSIGNED_INT&&($=s.RGBA32UI),I===s.BYTE&&($=s.RGBA8I),I===s.SHORT&&($=s.RGBA16I),I===s.INT&&($=s.RGBA32I)),A===s.RGB&&I===s.UNSIGNED_INT_5_9_9_9_REV&&($=s.RGB9_E5),A===s.RGBA){const ut=X?za:ie.getTransfer(z);I===s.FLOAT&&($=s.RGBA32F),I===s.HALF_FLOAT&&($=s.RGBA16F),I===s.UNSIGNED_BYTE&&($=ut===de?s.SRGB8_ALPHA8:s.RGBA8),I===s.UNSIGNED_SHORT_4_4_4_4&&($=s.RGBA4),I===s.UNSIGNED_SHORT_5_5_5_1&&($=s.RGB5_A1)}return($===s.R16F||$===s.R32F||$===s.RG16F||$===s.RG32F||$===s.RGBA16F||$===s.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function y(C,A){let I;return C?A===null||A===Ki||A===Os?I=s.DEPTH24_STENCIL8:A===bn?I=s.DEPTH32F_STENCIL8:A===_r&&(I=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):A===null||A===Ki||A===Os?I=s.DEPTH_COMPONENT24:A===bn?I=s.DEPTH_COMPONENT32F:A===_r&&(I=s.DEPTH_COMPONENT16),I}function R(C,A){return g(C)===!0||C.isFramebufferTexture&&C.minFilter!==on&&C.minFilter!==kn?Math.log2(Math.max(A.width,A.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?A.mipmaps.length:1}function w(C){const A=C.target;A.removeEventListener("dispose",w),E(A),A.isVideoTexture&&h.delete(A)}function T(C){const A=C.target;A.removeEventListener("dispose",T),S(A)}function E(C){const A=n.get(C);if(A.__webglInit===void 0)return;const I=C.source,z=f.get(I);if(z){const X=z[A.__cacheKey];X.usedTimes--,X.usedTimes===0&&b(C),Object.keys(z).length===0&&f.delete(I)}n.remove(C)}function b(C){const A=n.get(C);s.deleteTexture(A.__webglTexture);const I=C.source,z=f.get(I);delete z[A.__cacheKey],a.memory.textures--}function S(C){const A=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let z=0;z<6;z++){if(Array.isArray(A.__webglFramebuffer[z]))for(let X=0;X<A.__webglFramebuffer[z].length;X++)s.deleteFramebuffer(A.__webglFramebuffer[z][X]);else s.deleteFramebuffer(A.__webglFramebuffer[z]);A.__webglDepthbuffer&&s.deleteRenderbuffer(A.__webglDepthbuffer[z])}else{if(Array.isArray(A.__webglFramebuffer))for(let z=0;z<A.__webglFramebuffer.length;z++)s.deleteFramebuffer(A.__webglFramebuffer[z]);else s.deleteFramebuffer(A.__webglFramebuffer);if(A.__webglDepthbuffer&&s.deleteRenderbuffer(A.__webglDepthbuffer),A.__webglMultisampledFramebuffer&&s.deleteFramebuffer(A.__webglMultisampledFramebuffer),A.__webglColorRenderbuffer)for(let z=0;z<A.__webglColorRenderbuffer.length;z++)A.__webglColorRenderbuffer[z]&&s.deleteRenderbuffer(A.__webglColorRenderbuffer[z]);A.__webglDepthRenderbuffer&&s.deleteRenderbuffer(A.__webglDepthRenderbuffer)}const I=C.textures;for(let z=0,X=I.length;z<X;z++){const $=n.get(I[z]);$.__webglTexture&&(s.deleteTexture($.__webglTexture),a.memory.textures--),n.remove(I[z])}n.remove(C)}let P=0;function O(){P=0}function U(){const C=P;return C>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+i.maxTextures),P+=1,C}function F(C){const A=[];return A.push(C.wrapS),A.push(C.wrapT),A.push(C.wrapR||0),A.push(C.magFilter),A.push(C.minFilter),A.push(C.anisotropy),A.push(C.internalFormat),A.push(C.format),A.push(C.type),A.push(C.generateMipmaps),A.push(C.premultiplyAlpha),A.push(C.flipY),A.push(C.unpackAlignment),A.push(C.colorSpace),A.join()}function K(C,A){const I=n.get(C);if(C.isVideoTexture&&gt(C),C.isRenderTargetTexture===!1&&C.version>0&&I.__version!==C.version){const z=C.image;if(z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{W(I,C,A);return}}e.bindTexture(s.TEXTURE_2D,I.__webglTexture,s.TEXTURE0+A)}function N(C,A){const I=n.get(C);if(C.version>0&&I.__version!==C.version){W(I,C,A);return}e.bindTexture(s.TEXTURE_2D_ARRAY,I.__webglTexture,s.TEXTURE0+A)}function Y(C,A){const I=n.get(C);if(C.version>0&&I.__version!==C.version){W(I,C,A);return}e.bindTexture(s.TEXTURE_3D,I.__webglTexture,s.TEXTURE0+A)}function H(C,A){const I=n.get(C);if(C.version>0&&I.__version!==C.version){et(I,C,A);return}e.bindTexture(s.TEXTURE_CUBE_MAP,I.__webglTexture,s.TEXTURE0+A)}const J={[Xi]:s.REPEAT,[Vi]:s.CLAMP_TO_EDGE,[tl]:s.MIRRORED_REPEAT},st={[on]:s.NEAREST,[Af]:s.NEAREST_MIPMAP_NEAREST,[Pr]:s.NEAREST_MIPMAP_LINEAR,[kn]:s.LINEAR,[$a]:s.LINEAR_MIPMAP_NEAREST,[Wi]:s.LINEAR_MIPMAP_LINEAR},lt={[Pf]:s.NEVER,[Uf]:s.ALWAYS,[Lf]:s.LESS,[zu]:s.LEQUAL,[If]:s.EQUAL,[Of]:s.GEQUAL,[Df]:s.GREATER,[Nf]:s.NOTEQUAL};function ht(C,A){if(A.type===bn&&t.has("OES_texture_float_linear")===!1&&(A.magFilter===kn||A.magFilter===$a||A.magFilter===Pr||A.magFilter===Wi||A.minFilter===kn||A.minFilter===$a||A.minFilter===Pr||A.minFilter===Wi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,J[A.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,J[A.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,J[A.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,st[A.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,st[A.minFilter]),A.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,lt[A.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(A.magFilter===on||A.minFilter!==Pr&&A.minFilter!==Wi||A.type===bn&&t.has("OES_texture_float_linear")===!1)return;if(A.anisotropy>1||n.get(A).__currentAnisotropy){const I=t.get("EXT_texture_filter_anisotropic");s.texParameterf(C,I.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(A.anisotropy,i.getMaxAnisotropy())),n.get(A).__currentAnisotropy=A.anisotropy}}}function St(C,A){let I=!1;C.__webglInit===void 0&&(C.__webglInit=!0,A.addEventListener("dispose",w));const z=A.source;let X=f.get(z);X===void 0&&(X={},f.set(z,X));const $=F(A);if($!==C.__cacheKey){X[$]===void 0&&(X[$]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,I=!0),X[$].usedTimes++;const ut=X[C.__cacheKey];ut!==void 0&&(X[C.__cacheKey].usedTimes--,ut.usedTimes===0&&b(A)),C.__cacheKey=$,C.__webglTexture=X[$].texture}return I}function W(C,A,I){let z=s.TEXTURE_2D;(A.isDataArrayTexture||A.isCompressedArrayTexture)&&(z=s.TEXTURE_2D_ARRAY),A.isData3DTexture&&(z=s.TEXTURE_3D);const X=St(C,A),$=A.source;e.bindTexture(z,C.__webglTexture,s.TEXTURE0+I);const ut=n.get($);if($.version!==ut.__version||X===!0){e.activeTexture(s.TEXTURE0+I);const at=ie.getPrimaries(ie.workingColorSpace),rt=A.colorSpace===ci?null:ie.getPrimaries(A.colorSpace),It=A.colorSpace===ci||at===rt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,A.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,A.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,It);let it=v(A.image,!1,i.maxTextureSize);it=zt(A,it);const Et=r.convert(A.format,A.colorSpace),Nt=r.convert(A.type);let Ht=x(A.internalFormat,Et,Nt,A.colorSpace,A.isVideoTexture);ht(z,A);let kt;const ne=A.mipmaps,jt=A.isVideoTexture!==!0,me=ut.__version===void 0||X===!0,B=$.dataReady,Rt=R(A,it);if(A.isDepthTexture)Ht=y(A.format===Us,A.type),me&&(jt?e.texStorage2D(s.TEXTURE_2D,1,Ht,it.width,it.height):e.texImage2D(s.TEXTURE_2D,0,Ht,it.width,it.height,0,Et,Nt,null));else if(A.isDataTexture)if(ne.length>0){jt&&me&&e.texStorage2D(s.TEXTURE_2D,Rt,Ht,ne[0].width,ne[0].height);for(let tt=0,ct=ne.length;tt<ct;tt++)kt=ne[tt],jt?B&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,kt.width,kt.height,Et,Nt,kt.data):e.texImage2D(s.TEXTURE_2D,tt,Ht,kt.width,kt.height,0,Et,Nt,kt.data);A.generateMipmaps=!1}else jt?(me&&e.texStorage2D(s.TEXTURE_2D,Rt,Ht,it.width,it.height),B&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,it.width,it.height,Et,Nt,it.data)):e.texImage2D(s.TEXTURE_2D,0,Ht,it.width,it.height,0,Et,Nt,it.data);else if(A.isCompressedTexture)if(A.isCompressedArrayTexture){jt&&me&&e.texStorage3D(s.TEXTURE_2D_ARRAY,Rt,Ht,ne[0].width,ne[0].height,it.depth);for(let tt=0,ct=ne.length;tt<ct;tt++)if(kt=ne[tt],A.format!==dn)if(Et!==null)if(jt){if(B)if(A.layerUpdates.size>0){const Lt=Ch(kt.width,kt.height,A.format,A.type);for(const Ct of A.layerUpdates){const $t=kt.data.subarray(Ct*Lt/kt.data.BYTES_PER_ELEMENT,(Ct+1)*Lt/kt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,Ct,kt.width,kt.height,1,Et,$t)}A.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,0,kt.width,kt.height,it.depth,Et,kt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,tt,Ht,kt.width,kt.height,it.depth,0,kt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else jt?B&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,0,kt.width,kt.height,it.depth,Et,Nt,kt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,tt,Ht,kt.width,kt.height,it.depth,0,Et,Nt,kt.data)}else{jt&&me&&e.texStorage2D(s.TEXTURE_2D,Rt,Ht,ne[0].width,ne[0].height);for(let tt=0,ct=ne.length;tt<ct;tt++)kt=ne[tt],A.format!==dn?Et!==null?jt?B&&e.compressedTexSubImage2D(s.TEXTURE_2D,tt,0,0,kt.width,kt.height,Et,kt.data):e.compressedTexImage2D(s.TEXTURE_2D,tt,Ht,kt.width,kt.height,0,kt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):jt?B&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,kt.width,kt.height,Et,Nt,kt.data):e.texImage2D(s.TEXTURE_2D,tt,Ht,kt.width,kt.height,0,Et,Nt,kt.data)}else if(A.isDataArrayTexture)if(jt){if(me&&e.texStorage3D(s.TEXTURE_2D_ARRAY,Rt,Ht,it.width,it.height,it.depth),B)if(A.layerUpdates.size>0){const tt=Ch(it.width,it.height,A.format,A.type);for(const ct of A.layerUpdates){const Lt=it.data.subarray(ct*tt/it.data.BYTES_PER_ELEMENT,(ct+1)*tt/it.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,ct,it.width,it.height,1,Et,Nt,Lt)}A.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,it.width,it.height,it.depth,Et,Nt,it.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Ht,it.width,it.height,it.depth,0,Et,Nt,it.data);else if(A.isData3DTexture)jt?(me&&e.texStorage3D(s.TEXTURE_3D,Rt,Ht,it.width,it.height,it.depth),B&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,it.width,it.height,it.depth,Et,Nt,it.data)):e.texImage3D(s.TEXTURE_3D,0,Ht,it.width,it.height,it.depth,0,Et,Nt,it.data);else if(A.isFramebufferTexture){if(me)if(jt)e.texStorage2D(s.TEXTURE_2D,Rt,Ht,it.width,it.height);else{let tt=it.width,ct=it.height;for(let Lt=0;Lt<Rt;Lt++)e.texImage2D(s.TEXTURE_2D,Lt,Ht,tt,ct,0,Et,Nt,null),tt>>=1,ct>>=1}}else if(ne.length>0){if(jt&&me){const tt=pt(ne[0]);e.texStorage2D(s.TEXTURE_2D,Rt,Ht,tt.width,tt.height)}for(let tt=0,ct=ne.length;tt<ct;tt++)kt=ne[tt],jt?B&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,Et,Nt,kt):e.texImage2D(s.TEXTURE_2D,tt,Ht,Et,Nt,kt);A.generateMipmaps=!1}else if(jt){if(me){const tt=pt(it);e.texStorage2D(s.TEXTURE_2D,Rt,Ht,tt.width,tt.height)}B&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,Et,Nt,it)}else e.texImage2D(s.TEXTURE_2D,0,Ht,Et,Nt,it);g(A)&&m(z),ut.__version=$.version,A.onUpdate&&A.onUpdate(A)}C.__version=A.version}function et(C,A,I){if(A.image.length!==6)return;const z=St(C,A),X=A.source;e.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+I);const $=n.get(X);if(X.version!==$.__version||z===!0){e.activeTexture(s.TEXTURE0+I);const ut=ie.getPrimaries(ie.workingColorSpace),at=A.colorSpace===ci?null:ie.getPrimaries(A.colorSpace),rt=A.colorSpace===ci||ut===at?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,A.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,A.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,rt);const It=A.isCompressedTexture||A.image[0].isCompressedTexture,it=A.image[0]&&A.image[0].isDataTexture,Et=[];for(let ct=0;ct<6;ct++)!It&&!it?Et[ct]=v(A.image[ct],!0,i.maxCubemapSize):Et[ct]=it?A.image[ct].image:A.image[ct],Et[ct]=zt(A,Et[ct]);const Nt=Et[0],Ht=r.convert(A.format,A.colorSpace),kt=r.convert(A.type),ne=x(A.internalFormat,Ht,kt,A.colorSpace),jt=A.isVideoTexture!==!0,me=$.__version===void 0||z===!0,B=X.dataReady;let Rt=R(A,Nt);ht(s.TEXTURE_CUBE_MAP,A);let tt;if(It){jt&&me&&e.texStorage2D(s.TEXTURE_CUBE_MAP,Rt,ne,Nt.width,Nt.height);for(let ct=0;ct<6;ct++){tt=Et[ct].mipmaps;for(let Lt=0;Lt<tt.length;Lt++){const Ct=tt[Lt];A.format!==dn?Ht!==null?jt?B&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Lt,0,0,Ct.width,Ct.height,Ht,Ct.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Lt,ne,Ct.width,Ct.height,0,Ct.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):jt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Lt,0,0,Ct.width,Ct.height,Ht,kt,Ct.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Lt,ne,Ct.width,Ct.height,0,Ht,kt,Ct.data)}}}else{if(tt=A.mipmaps,jt&&me){tt.length>0&&Rt++;const ct=pt(Et[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,Rt,ne,ct.width,ct.height)}for(let ct=0;ct<6;ct++)if(it){jt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,0,0,Et[ct].width,Et[ct].height,Ht,kt,Et[ct].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,ne,Et[ct].width,Et[ct].height,0,Ht,kt,Et[ct].data);for(let Lt=0;Lt<tt.length;Lt++){const $t=tt[Lt].image[ct].image;jt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Lt+1,0,0,$t.width,$t.height,Ht,kt,$t.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Lt+1,ne,$t.width,$t.height,0,Ht,kt,$t.data)}}else{jt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,0,0,Ht,kt,Et[ct]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,ne,Ht,kt,Et[ct]);for(let Lt=0;Lt<tt.length;Lt++){const Ct=tt[Lt];jt?B&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Lt+1,0,0,Ht,kt,Ct.image[ct]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Lt+1,ne,Ht,kt,Ct.image[ct])}}}g(A)&&m(s.TEXTURE_CUBE_MAP),$.__version=X.version,A.onUpdate&&A.onUpdate(A)}C.__version=A.version}function yt(C,A,I,z,X,$){const ut=r.convert(I.format,I.colorSpace),at=r.convert(I.type),rt=x(I.internalFormat,ut,at,I.colorSpace),It=n.get(A),it=n.get(I);if(it.__renderTarget=A,!It.__hasExternalTextures){const Et=Math.max(1,A.width>>$),Nt=Math.max(1,A.height>>$);X===s.TEXTURE_3D||X===s.TEXTURE_2D_ARRAY?e.texImage3D(X,$,rt,Et,Nt,A.depth,0,ut,at,null):e.texImage2D(X,$,rt,Et,Nt,0,ut,at,null)}e.bindFramebuffer(s.FRAMEBUFFER,C),xt(A)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,z,X,it.__webglTexture,0,nt(A)):(X===s.TEXTURE_2D||X>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&X<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,z,X,it.__webglTexture,$),e.bindFramebuffer(s.FRAMEBUFFER,null)}function ot(C,A,I){if(s.bindRenderbuffer(s.RENDERBUFFER,C),A.depthBuffer){const z=A.depthTexture,X=z&&z.isDepthTexture?z.type:null,$=y(A.stencilBuffer,X),ut=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,at=nt(A);xt(A)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,at,$,A.width,A.height):I?s.renderbufferStorageMultisample(s.RENDERBUFFER,at,$,A.width,A.height):s.renderbufferStorage(s.RENDERBUFFER,$,A.width,A.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ut,s.RENDERBUFFER,C)}else{const z=A.textures;for(let X=0;X<z.length;X++){const $=z[X],ut=r.convert($.format,$.colorSpace),at=r.convert($.type),rt=x($.internalFormat,ut,at,$.colorSpace),It=nt(A);I&&xt(A)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,It,rt,A.width,A.height):xt(A)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,It,rt,A.width,A.height):s.renderbufferStorage(s.RENDERBUFFER,rt,A.width,A.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function _t(C,A){if(A&&A.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,C),!(A.depthTexture&&A.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const z=n.get(A.depthTexture);z.__renderTarget=A,(!z.__webglTexture||A.depthTexture.image.width!==A.width||A.depthTexture.image.height!==A.height)&&(A.depthTexture.image.width=A.width,A.depthTexture.image.height=A.height,A.depthTexture.needsUpdate=!0),K(A.depthTexture,0);const X=z.__webglTexture,$=nt(A);if(A.depthTexture.format===Cs)xt(A)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,X,0,$):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,X,0);else if(A.depthTexture.format===Us)xt(A)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,X,0,$):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,X,0);else throw new Error("Unknown depthTexture format")}function wt(C){const A=n.get(C),I=C.isWebGLCubeRenderTarget===!0;if(A.__boundDepthTexture!==C.depthTexture){const z=C.depthTexture;if(A.__depthDisposeCallback&&A.__depthDisposeCallback(),z){const X=()=>{delete A.__boundDepthTexture,delete A.__depthDisposeCallback,z.removeEventListener("dispose",X)};z.addEventListener("dispose",X),A.__depthDisposeCallback=X}A.__boundDepthTexture=z}if(C.depthTexture&&!A.__autoAllocateDepthBuffer){if(I)throw new Error("target.depthTexture not supported in Cube render targets");_t(A.__webglFramebuffer,C)}else if(I){A.__webglDepthbuffer=[];for(let z=0;z<6;z++)if(e.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer[z]),A.__webglDepthbuffer[z]===void 0)A.__webglDepthbuffer[z]=s.createRenderbuffer(),ot(A.__webglDepthbuffer[z],C,!1);else{const X=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,$=A.__webglDepthbuffer[z];s.bindRenderbuffer(s.RENDERBUFFER,$),s.framebufferRenderbuffer(s.FRAMEBUFFER,X,s.RENDERBUFFER,$)}}else if(e.bindFramebuffer(s.FRAMEBUFFER,A.__webglFramebuffer),A.__webglDepthbuffer===void 0)A.__webglDepthbuffer=s.createRenderbuffer(),ot(A.__webglDepthbuffer,C,!1);else{const z=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,X=A.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,X),s.framebufferRenderbuffer(s.FRAMEBUFFER,z,s.RENDERBUFFER,X)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function At(C,A,I){const z=n.get(C);A!==void 0&&yt(z.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),I!==void 0&&wt(C)}function Gt(C){const A=C.texture,I=n.get(C),z=n.get(A);C.addEventListener("dispose",T);const X=C.textures,$=C.isWebGLCubeRenderTarget===!0,ut=X.length>1;if(ut||(z.__webglTexture===void 0&&(z.__webglTexture=s.createTexture()),z.__version=A.version,a.memory.textures++),$){I.__webglFramebuffer=[];for(let at=0;at<6;at++)if(A.mipmaps&&A.mipmaps.length>0){I.__webglFramebuffer[at]=[];for(let rt=0;rt<A.mipmaps.length;rt++)I.__webglFramebuffer[at][rt]=s.createFramebuffer()}else I.__webglFramebuffer[at]=s.createFramebuffer()}else{if(A.mipmaps&&A.mipmaps.length>0){I.__webglFramebuffer=[];for(let at=0;at<A.mipmaps.length;at++)I.__webglFramebuffer[at]=s.createFramebuffer()}else I.__webglFramebuffer=s.createFramebuffer();if(ut)for(let at=0,rt=X.length;at<rt;at++){const It=n.get(X[at]);It.__webglTexture===void 0&&(It.__webglTexture=s.createTexture(),a.memory.textures++)}if(C.samples>0&&xt(C)===!1){I.__webglMultisampledFramebuffer=s.createFramebuffer(),I.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,I.__webglMultisampledFramebuffer);for(let at=0;at<X.length;at++){const rt=X[at];I.__webglColorRenderbuffer[at]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,I.__webglColorRenderbuffer[at]);const It=r.convert(rt.format,rt.colorSpace),it=r.convert(rt.type),Et=x(rt.internalFormat,It,it,rt.colorSpace,C.isXRRenderTarget===!0),Nt=nt(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,Nt,Et,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+at,s.RENDERBUFFER,I.__webglColorRenderbuffer[at])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(I.__webglDepthRenderbuffer=s.createRenderbuffer(),ot(I.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if($){e.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture),ht(s.TEXTURE_CUBE_MAP,A);for(let at=0;at<6;at++)if(A.mipmaps&&A.mipmaps.length>0)for(let rt=0;rt<A.mipmaps.length;rt++)yt(I.__webglFramebuffer[at][rt],C,A,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+at,rt);else yt(I.__webglFramebuffer[at],C,A,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+at,0);g(A)&&m(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ut){for(let at=0,rt=X.length;at<rt;at++){const It=X[at],it=n.get(It);e.bindTexture(s.TEXTURE_2D,it.__webglTexture),ht(s.TEXTURE_2D,It),yt(I.__webglFramebuffer,C,It,s.COLOR_ATTACHMENT0+at,s.TEXTURE_2D,0),g(It)&&m(s.TEXTURE_2D)}e.unbindTexture()}else{let at=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(at=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(at,z.__webglTexture),ht(at,A),A.mipmaps&&A.mipmaps.length>0)for(let rt=0;rt<A.mipmaps.length;rt++)yt(I.__webglFramebuffer[rt],C,A,s.COLOR_ATTACHMENT0,at,rt);else yt(I.__webglFramebuffer,C,A,s.COLOR_ATTACHMENT0,at,0);g(A)&&m(at),e.unbindTexture()}C.depthBuffer&&wt(C)}function Q(C){const A=C.textures;for(let I=0,z=A.length;I<z;I++){const X=A[I];if(g(X)){const $=_(C),ut=n.get(X).__webglTexture;e.bindTexture($,ut),m($),e.unbindTexture()}}}const j=[],L=[];function ft(C){if(C.samples>0){if(xt(C)===!1){const A=C.textures,I=C.width,z=C.height;let X=s.COLOR_BUFFER_BIT;const $=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ut=n.get(C),at=A.length>1;if(at)for(let rt=0;rt<A.length;rt++)e.bindFramebuffer(s.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,ut.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,ut.__webglMultisampledFramebuffer),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ut.__webglFramebuffer);for(let rt=0;rt<A.length;rt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(X|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(X|=s.STENCIL_BUFFER_BIT)),at){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ut.__webglColorRenderbuffer[rt]);const It=n.get(A[rt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,It,0)}s.blitFramebuffer(0,0,I,z,0,0,I,z,X,s.NEAREST),l===!0&&(j.length=0,L.length=0,j.push(s.COLOR_ATTACHMENT0+rt),C.depthBuffer&&C.resolveDepthBuffer===!1&&(j.push($),L.push($),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,L)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,j))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),at)for(let rt=0;rt<A.length;rt++){e.bindFramebuffer(s.FRAMEBUFFER,ut.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.RENDERBUFFER,ut.__webglColorRenderbuffer[rt]);const It=n.get(A[rt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,ut.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+rt,s.TEXTURE_2D,It,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ut.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const A=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[A])}}}function nt(C){return Math.min(i.maxSamples,C.samples)}function xt(C){const A=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&A.__useRenderToTexture!==!1}function gt(C){const A=a.render.frame;h.get(C)!==A&&(h.set(C,A),C.update())}function zt(C,A){const I=C.colorSpace,z=C.format,X=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||I!==Bs&&I!==ci&&(ie.getTransfer(I)===de?(z!==dn||X!==Yn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",I)),A}function pt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=O,this.setTexture2D=K,this.setTexture2DArray=N,this.setTexture3D=Y,this.setTextureCube=H,this.rebindTextures=At,this.setupRenderTarget=Gt,this.updateRenderTargetMipmap=Q,this.updateMultisampleRenderTarget=ft,this.setupDepthRenderbuffer=wt,this.setupFrameBufferTexture=yt,this.useMultisampledRTT=xt}function Hv(s,t){function e(n,i=ci){let r;const a=ie.getTransfer(i);if(n===Yn)return s.UNSIGNED_BYTE;if(n===Yl)return s.UNSIGNED_SHORT_4_4_4_4;if(n===$l)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Lu)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Cu)return s.BYTE;if(n===Pu)return s.SHORT;if(n===_r)return s.UNSIGNED_SHORT;if(n===Kl)return s.INT;if(n===Ki)return s.UNSIGNED_INT;if(n===bn)return s.FLOAT;if(n===Rr)return s.HALF_FLOAT;if(n===Iu)return s.ALPHA;if(n===Du)return s.RGB;if(n===dn)return s.RGBA;if(n===Nu)return s.LUMINANCE;if(n===Ou)return s.LUMINANCE_ALPHA;if(n===Cs)return s.DEPTH_COMPONENT;if(n===Us)return s.DEPTH_STENCIL;if(n===ql)return s.RED;if(n===Zl)return s.RED_INTEGER;if(n===Uu)return s.RG;if(n===jl)return s.RG_INTEGER;if(n===Jl)return s.RGBA_INTEGER;if(n===ya||n===xa||n===_a||n===Ma)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ya)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===xa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===_a)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ma)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ya)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===xa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===_a)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ma)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===el||n===nl||n===il||n===sl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===el)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===nl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===il)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===sl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===rl||n===al||n===ol)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===rl||n===al)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ol)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ll||n===cl||n===hl||n===ul||n===dl||n===fl||n===pl||n===ml||n===gl||n===vl||n===yl||n===xl||n===_l||n===Ml)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ll)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===cl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===hl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ul)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===dl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===fl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===pl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ml)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===gl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===vl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===yl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===xl)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===_l)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ml)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ba||n===bl||n===Sl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===ba)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===bl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Sl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Fu||n===El||n===Tl||n===wl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===ba)return r.COMPRESSED_RED_RGTC1_EXT;if(n===El)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Tl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===wl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Os?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}class Gv extends an{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class je extends Se{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Vv={type:"move"};class Eo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new je,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new je,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new je,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(const v of t.hand.values()){const g=e.getJointPose(v,n),m=this._getHandJoint(c,v);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,p=.005;c.inputState.pinching&&f>d+p?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=d-p&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Vv)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new je;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const Wv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Xv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Kv{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const i=new Ke,r=t.properties.get(i);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new $n({vertexShader:Wv,fragmentShader:Xv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Dt(new Je(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Yv extends Hs{constructor(t,e){super();const n=this;let i=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,p=null;const v=new Kv,g=e.getContextAttributes();let m=null,_=null;const x=[],y=[],R=new vt;let w=null;const T=new an;T.viewport=new ae;const E=new an;E.viewport=new ae;const b=[T,E],S=new Gv;let P=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let et=x[W];return et===void 0&&(et=new Eo,x[W]=et),et.getTargetRaySpace()},this.getControllerGrip=function(W){let et=x[W];return et===void 0&&(et=new Eo,x[W]=et),et.getGripSpace()},this.getHand=function(W){let et=x[W];return et===void 0&&(et=new Eo,x[W]=et),et.getHandSpace()};function U(W){const et=y.indexOf(W.inputSource);if(et===-1)return;const yt=x[et];yt!==void 0&&(yt.update(W.inputSource,W.frame,c||a),yt.dispatchEvent({type:W.type,data:W.inputSource}))}function F(){i.removeEventListener("select",U),i.removeEventListener("selectstart",U),i.removeEventListener("selectend",U),i.removeEventListener("squeeze",U),i.removeEventListener("squeezestart",U),i.removeEventListener("squeezeend",U),i.removeEventListener("end",F),i.removeEventListener("inputsourceschange",K);for(let W=0;W<x.length;W++){const et=y[W];et!==null&&(y[W]=null,x[W].disconnect(et))}P=null,O=null,v.reset(),t.setRenderTarget(m),d=null,f=null,u=null,i=null,_=null,St.stop(),n.isPresenting=!1,t.setPixelRatio(w),t.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){r=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){o=W,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return p},this.getSession=function(){return i},this.setSession=async function(W){if(i=W,i!==null){if(m=t.getRenderTarget(),i.addEventListener("select",U),i.addEventListener("selectstart",U),i.addEventListener("selectend",U),i.addEventListener("squeeze",U),i.addEventListener("squeezestart",U),i.addEventListener("squeezeend",U),i.addEventListener("end",F),i.addEventListener("inputsourceschange",K),g.xrCompatible!==!0&&await e.makeXRCompatible(),w=t.getPixelRatio(),t.getSize(R),i.renderState.layers===void 0){const et={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,e,et),i.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),_=new Yi(d.framebufferWidth,d.framebufferHeight,{format:dn,type:Yn,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil})}else{let et=null,yt=null,ot=null;g.depth&&(ot=g.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=g.stencil?Us:Cs,yt=g.stencil?Os:Ki);const _t={colorFormat:e.RGBA8,depthFormat:ot,scaleFactor:r};u=new XRWebGLBinding(i,e),f=u.createProjectionLayer(_t),i.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),_=new Yi(f.textureWidth,f.textureHeight,{format:dn,type:Yn,depthTexture:new Zu(f.textureWidth,f.textureHeight,yt,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),St.setContext(i),St.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function K(W){for(let et=0;et<W.removed.length;et++){const yt=W.removed[et],ot=y.indexOf(yt);ot>=0&&(y[ot]=null,x[ot].disconnect(yt))}for(let et=0;et<W.added.length;et++){const yt=W.added[et];let ot=y.indexOf(yt);if(ot===-1){for(let wt=0;wt<x.length;wt++)if(wt>=y.length){y.push(yt),ot=wt;break}else if(y[wt]===null){y[wt]=yt,ot=wt;break}if(ot===-1)break}const _t=x[ot];_t&&_t.connect(yt)}}const N=new D,Y=new D;function H(W,et,yt){N.setFromMatrixPosition(et.matrixWorld),Y.setFromMatrixPosition(yt.matrixWorld);const ot=N.distanceTo(Y),_t=et.projectionMatrix.elements,wt=yt.projectionMatrix.elements,At=_t[14]/(_t[10]-1),Gt=_t[14]/(_t[10]+1),Q=(_t[9]+1)/_t[5],j=(_t[9]-1)/_t[5],L=(_t[8]-1)/_t[0],ft=(wt[8]+1)/wt[0],nt=At*L,xt=At*ft,gt=ot/(-L+ft),zt=gt*-L;if(et.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(zt),W.translateZ(gt),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),_t[10]===-1)W.projectionMatrix.copy(et.projectionMatrix),W.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{const pt=At+gt,C=Gt+gt,A=nt-zt,I=xt+(ot-zt),z=Q*Gt/C*pt,X=j*Gt/C*pt;W.projectionMatrix.makePerspective(A,I,z,X,pt,C),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function J(W,et){et===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(et.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(i===null)return;let et=W.near,yt=W.far;v.texture!==null&&(v.depthNear>0&&(et=v.depthNear),v.depthFar>0&&(yt=v.depthFar)),S.near=E.near=T.near=et,S.far=E.far=T.far=yt,(P!==S.near||O!==S.far)&&(i.updateRenderState({depthNear:S.near,depthFar:S.far}),P=S.near,O=S.far),T.layers.mask=W.layers.mask|2,E.layers.mask=W.layers.mask|4,S.layers.mask=T.layers.mask|E.layers.mask;const ot=W.parent,_t=S.cameras;J(S,ot);for(let wt=0;wt<_t.length;wt++)J(_t[wt],ot);_t.length===2?H(S,T,E):S.projectionMatrix.copy(T.projectionMatrix),st(W,S,ot)};function st(W,et,yt){yt===null?W.matrix.copy(et.matrixWorld):(W.matrix.copy(yt.matrixWorld),W.matrix.invert(),W.matrix.multiply(et.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(et.projectionMatrix),W.projectionMatrixInverse.copy(et.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=Rl*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return S},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(W){l=W,f!==null&&(f.fixedFoveation=W),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=W)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(S)};let lt=null;function ht(W,et){if(h=et.getViewerPose(c||a),p=et,h!==null){const yt=h.views;d!==null&&(t.setRenderTargetFramebuffer(_,d.framebuffer),t.setRenderTarget(_));let ot=!1;yt.length!==S.cameras.length&&(S.cameras.length=0,ot=!0);for(let wt=0;wt<yt.length;wt++){const At=yt[wt];let Gt=null;if(d!==null)Gt=d.getViewport(At);else{const j=u.getViewSubImage(f,At);Gt=j.viewport,wt===0&&(t.setRenderTargetTextures(_,j.colorTexture,f.ignoreDepthValues?void 0:j.depthStencilTexture),t.setRenderTarget(_))}let Q=b[wt];Q===void 0&&(Q=new an,Q.layers.enable(wt),Q.viewport=new ae,b[wt]=Q),Q.matrix.fromArray(At.transform.matrix),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.projectionMatrix.fromArray(At.projectionMatrix),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert(),Q.viewport.set(Gt.x,Gt.y,Gt.width,Gt.height),wt===0&&(S.matrix.copy(Q.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale)),ot===!0&&S.cameras.push(Q)}const _t=i.enabledFeatures;if(_t&&_t.includes("depth-sensing")){const wt=u.getDepthInformation(yt[0]);wt&&wt.isValid&&wt.texture&&v.init(t,wt,i.renderState)}}for(let yt=0;yt<x.length;yt++){const ot=y[yt],_t=x[yt];ot!==null&&_t!==void 0&&_t.update(ot,et,c||a)}lt&&lt(W,et),et.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:et}),p=null}const St=new $u;St.setAnimationLoop(ht),this.setAnimationLoop=function(W){lt=W},this.dispose=function(){}}}const Ii=new En,$v=new Yt;function qv(s,t){function e(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,Xu(s)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function i(g,m,_,x,y){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(g,m):m.isMeshToonMaterial?(r(g,m),u(g,m)):m.isMeshPhongMaterial?(r(g,m),h(g,m)):m.isMeshStandardMaterial?(r(g,m),f(g,m),m.isMeshPhysicalMaterial&&d(g,m,y)):m.isMeshMatcapMaterial?(r(g,m),p(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),v(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(a(g,m),m.isLineDashedMaterial&&o(g,m)):m.isPointsMaterial?l(g,m,_,x):m.isSpriteMaterial?c(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,e(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===Xe&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,e(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===Xe&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,e(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,e(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);const _=t.get(m),x=_.envMap,y=_.envMapRotation;x&&(g.envMap.value=x,Ii.copy(y),Ii.x*=-1,Ii.y*=-1,Ii.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Ii.y*=-1,Ii.z*=-1),g.envMapRotation.value.setFromMatrix4($v.makeRotationFromEuler(Ii)),g.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,g.aoMapTransform))}function a(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform))}function o(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function l(g,m,_,x){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*_,g.scale.value=x*.5,m.map&&(g.map.value=m.map,e(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function c(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,e(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,e(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function h(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function u(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function f(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function d(g,m,_){g.ior.value=m.ior,m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Xe&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=_.texture,g.transmissionSamplerSize.value.set(_.width,_.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,m){m.matcap&&(g.matcap.value=m.matcap)}function v(g,m){const _=t.get(m).light;g.referencePosition.value.setFromMatrixPosition(_.matrixWorld),g.nearDistance.value=_.shadow.camera.near,g.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Zv(s,t,e,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(_,x){const y=x.program;n.uniformBlockBinding(_,y)}function c(_,x){let y=i[_.id];y===void 0&&(p(_),y=h(_),i[_.id]=y,_.addEventListener("dispose",g));const R=x.program;n.updateUBOMapping(_,R);const w=t.render.frame;r[_.id]!==w&&(f(_),r[_.id]=w)}function h(_){const x=u();_.__bindingPointIndex=x;const y=s.createBuffer(),R=_.__size,w=_.usage;return s.bindBuffer(s.UNIFORM_BUFFER,y),s.bufferData(s.UNIFORM_BUFFER,R,w),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,x,y),y}function u(){for(let _=0;_<o;_++)if(a.indexOf(_)===-1)return a.push(_),_;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){const x=i[_.id],y=_.uniforms,R=_.__cache;s.bindBuffer(s.UNIFORM_BUFFER,x);for(let w=0,T=y.length;w<T;w++){const E=Array.isArray(y[w])?y[w]:[y[w]];for(let b=0,S=E.length;b<S;b++){const P=E[b];if(d(P,w,b,R)===!0){const O=P.__offset,U=Array.isArray(P.value)?P.value:[P.value];let F=0;for(let K=0;K<U.length;K++){const N=U[K],Y=v(N);typeof N=="number"||typeof N=="boolean"?(P.__data[0]=N,s.bufferSubData(s.UNIFORM_BUFFER,O+F,P.__data)):N.isMatrix3?(P.__data[0]=N.elements[0],P.__data[1]=N.elements[1],P.__data[2]=N.elements[2],P.__data[3]=0,P.__data[4]=N.elements[3],P.__data[5]=N.elements[4],P.__data[6]=N.elements[5],P.__data[7]=0,P.__data[8]=N.elements[6],P.__data[9]=N.elements[7],P.__data[10]=N.elements[8],P.__data[11]=0):(N.toArray(P.__data,F),F+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,O,P.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(_,x,y,R){const w=_.value,T=x+"_"+y;if(R[T]===void 0)return typeof w=="number"||typeof w=="boolean"?R[T]=w:R[T]=w.clone(),!0;{const E=R[T];if(typeof w=="number"||typeof w=="boolean"){if(E!==w)return R[T]=w,!0}else if(E.equals(w)===!1)return E.copy(w),!0}return!1}function p(_){const x=_.uniforms;let y=0;const R=16;for(let T=0,E=x.length;T<E;T++){const b=Array.isArray(x[T])?x[T]:[x[T]];for(let S=0,P=b.length;S<P;S++){const O=b[S],U=Array.isArray(O.value)?O.value:[O.value];for(let F=0,K=U.length;F<K;F++){const N=U[F],Y=v(N),H=y%R,J=H%Y.boundary,st=H+J;y+=J,st!==0&&R-st<Y.storage&&(y+=R-st),O.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=y,y+=Y.storage}}}const w=y%R;return w>0&&(y+=R-w),_.__size=y,_.__cache={},this}function v(_){const x={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(x.boundary=4,x.storage=4):_.isVector2?(x.boundary=8,x.storage=8):_.isVector3||_.isColor?(x.boundary=16,x.storage=12):_.isVector4?(x.boundary=16,x.storage=16):_.isMatrix3?(x.boundary=48,x.storage=48):_.isMatrix4?(x.boundary=64,x.storage=64):_.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",_),x}function g(_){const x=_.target;x.removeEventListener("dispose",g);const y=a.indexOf(x.__bindingPointIndex);a.splice(y,1),s.deleteBuffer(i[x.id]),delete i[x.id],delete r[x.id]}function m(){for(const _ in i)s.deleteBuffer(i[_]);a=[],i={},r={}}return{bind:l,update:c,dispose:m}}class jv{constructor(t={}){const{canvas:e=zf(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const p=new Uint32Array(4),v=new Int32Array(4);let g=null,m=null;const _=[],x=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ge,this.toneMapping=pi,this.toneMappingExposure=1;const y=this;let R=!1,w=0,T=0,E=null,b=-1,S=null;const P=new ae,O=new ae;let U=null;const F=new Vt(0);let K=0,N=e.width,Y=e.height,H=1,J=null,st=null;const lt=new ae(0,0,N,Y),ht=new ae(0,0,N,Y);let St=!1;const W=new nc;let et=!1,yt=!1;const ot=new Yt,_t=new Yt,wt=new D,At=new ae,Gt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Q=!1;function j(){return E===null?H:1}let L=n;function ft(k,G){return e.getContext(k,G)}try{const k={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Wl}`),e.addEventListener("webglcontextlost",ct,!1),e.addEventListener("webglcontextrestored",Lt,!1),e.addEventListener("webglcontextcreationerror",Ct,!1),L===null){const G="webgl2";if(L=ft(G,k),L===null)throw ft(G)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(k){throw console.error("THREE.WebGLRenderer: "+k.message),k}let nt,xt,gt,zt,pt,C,A,I,z,X,$,ut,at,rt,It,it,Et,Nt,Ht,kt,ne,jt,me,B;function Rt(){nt=new ng(L),nt.init(),jt=new Hv(L,nt),xt=new Z0(L,nt,t,jt),gt=new Fv(L,nt),xt.reverseDepthBuffer&&f&&gt.buffers.depth.setReversed(!0),zt=new rg(L),pt=new Sv,C=new Bv(L,nt,gt,pt,xt,jt,zt),A=new J0(y),I=new eg(y),z=new dp(L),me=new $0(L,z),X=new ig(L,z,zt,me),$=new og(L,X,z,zt),Ht=new ag(L,xt,C),it=new j0(pt),ut=new bv(y,A,I,nt,xt,me,it),at=new qv(y,pt),rt=new Tv,It=new Pv(nt),Nt=new Y0(y,A,I,gt,$,d,l),Et=new Ov(y,$,xt),B=new Zv(L,zt,xt,gt),kt=new q0(L,nt,zt),ne=new sg(L,nt,zt),zt.programs=ut.programs,y.capabilities=xt,y.extensions=nt,y.properties=pt,y.renderLists=rt,y.shadowMap=Et,y.state=gt,y.info=zt}Rt();const tt=new Yv(y,L);this.xr=tt,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const k=nt.get("WEBGL_lose_context");k&&k.loseContext()},this.forceContextRestore=function(){const k=nt.get("WEBGL_lose_context");k&&k.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(k){k!==void 0&&(H=k,this.setSize(N,Y,!1))},this.getSize=function(k){return k.set(N,Y)},this.setSize=function(k,G,q=!0){if(tt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}N=k,Y=G,e.width=Math.floor(k*H),e.height=Math.floor(G*H),q===!0&&(e.style.width=k+"px",e.style.height=G+"px"),this.setViewport(0,0,k,G)},this.getDrawingBufferSize=function(k){return k.set(N*H,Y*H).floor()},this.setDrawingBufferSize=function(k,G,q){N=k,Y=G,H=q,e.width=Math.floor(k*q),e.height=Math.floor(G*q),this.setViewport(0,0,k,G)},this.getCurrentViewport=function(k){return k.copy(P)},this.getViewport=function(k){return k.copy(lt)},this.setViewport=function(k,G,q,Z){k.isVector4?lt.set(k.x,k.y,k.z,k.w):lt.set(k,G,q,Z),gt.viewport(P.copy(lt).multiplyScalar(H).round())},this.getScissor=function(k){return k.copy(ht)},this.setScissor=function(k,G,q,Z){k.isVector4?ht.set(k.x,k.y,k.z,k.w):ht.set(k,G,q,Z),gt.scissor(O.copy(ht).multiplyScalar(H).round())},this.getScissorTest=function(){return St},this.setScissorTest=function(k){gt.setScissorTest(St=k)},this.setOpaqueSort=function(k){J=k},this.setTransparentSort=function(k){st=k},this.getClearColor=function(k){return k.copy(Nt.getClearColor())},this.setClearColor=function(){Nt.setClearColor.apply(Nt,arguments)},this.getClearAlpha=function(){return Nt.getClearAlpha()},this.setClearAlpha=function(){Nt.setClearAlpha.apply(Nt,arguments)},this.clear=function(k=!0,G=!0,q=!0){let Z=0;if(k){let V=!1;if(E!==null){const Mt=E.texture.format;V=Mt===Jl||Mt===jl||Mt===Zl}if(V){const Mt=E.texture.type,Pt=Mt===Yn||Mt===Ki||Mt===_r||Mt===Os||Mt===Yl||Mt===$l,Ot=Nt.getClearColor(),Ut=Nt.getClearAlpha(),Kt=Ot.r,qt=Ot.g,Ft=Ot.b;Pt?(p[0]=Kt,p[1]=qt,p[2]=Ft,p[3]=Ut,L.clearBufferuiv(L.COLOR,0,p)):(v[0]=Kt,v[1]=qt,v[2]=Ft,v[3]=Ut,L.clearBufferiv(L.COLOR,0,v))}else Z|=L.COLOR_BUFFER_BIT}G&&(Z|=L.DEPTH_BUFFER_BIT),q&&(Z|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(Z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",ct,!1),e.removeEventListener("webglcontextrestored",Lt,!1),e.removeEventListener("webglcontextcreationerror",Ct,!1),rt.dispose(),It.dispose(),pt.dispose(),A.dispose(),I.dispose(),$.dispose(),me.dispose(),B.dispose(),ut.dispose(),tt.dispose(),tt.removeEventListener("sessionstart",Ac),tt.removeEventListener("sessionend",Rc),Ai.stop()};function ct(k){k.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function Lt(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;const k=zt.autoReset,G=Et.enabled,q=Et.autoUpdate,Z=Et.needsUpdate,V=Et.type;Rt(),zt.autoReset=k,Et.enabled=G,Et.autoUpdate=q,Et.needsUpdate=Z,Et.type=V}function Ct(k){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",k.statusMessage)}function $t(k){const G=k.target;G.removeEventListener("dispose",$t),Me(G)}function Me(k){Fe(k),pt.remove(k)}function Fe(k){const G=pt.get(k).programs;G!==void 0&&(G.forEach(function(q){ut.releaseProgram(q)}),k.isShaderMaterial&&ut.releaseShaderCache(k))}this.renderBufferDirect=function(k,G,q,Z,V,Mt){G===null&&(G=Gt);const Pt=V.isMesh&&V.matrixWorld.determinant()<0,Ot=$d(k,G,q,Z,V);gt.setMaterial(Z,Pt);let Ut=q.index,Kt=1;if(Z.wireframe===!0){if(Ut=X.getWireframeAttribute(q),Ut===void 0)return;Kt=2}const qt=q.drawRange,Ft=q.attributes.position;let se=qt.start*Kt,ge=(qt.start+qt.count)*Kt;Mt!==null&&(se=Math.max(se,Mt.start*Kt),ge=Math.min(ge,(Mt.start+Mt.count)*Kt)),Ut!==null?(se=Math.max(se,0),ge=Math.min(ge,Ut.count)):Ft!=null&&(se=Math.max(se,0),ge=Math.min(ge,Ft.count));const ye=ge-se;if(ye<0||ye===1/0)return;me.setup(V,Z,Ot,q,Ut);let Qe,oe=kt;if(Ut!==null&&(Qe=z.get(Ut),oe=ne,oe.setIndex(Qe)),V.isMesh)Z.wireframe===!0?(gt.setLineWidth(Z.wireframeLinewidth*j()),oe.setMode(L.LINES)):oe.setMode(L.TRIANGLES);else if(V.isLine){let Bt=Z.linewidth;Bt===void 0&&(Bt=1),gt.setLineWidth(Bt*j()),V.isLineSegments?oe.setMode(L.LINES):V.isLineLoop?oe.setMode(L.LINE_LOOP):oe.setMode(L.LINE_STRIP)}else V.isPoints?oe.setMode(L.POINTS):V.isSprite&&oe.setMode(L.TRIANGLES);if(V.isBatchedMesh)if(V._multiDrawInstances!==null)oe.renderMultiDrawInstances(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount,V._multiDrawInstances);else if(nt.get("WEBGL_multi_draw"))oe.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{const Bt=V._multiDrawStarts,Nn=V._multiDrawCounts,le=V._multiDrawCount,gn=Ut?z.get(Ut).bytesPerElement:1,ji=pt.get(Z).currentProgram.getUniforms();for(let tn=0;tn<le;tn++)ji.setValue(L,"_gl_DrawID",tn),oe.render(Bt[tn]/gn,Nn[tn])}else if(V.isInstancedMesh)oe.renderInstances(se,ye,V.count);else if(q.isInstancedBufferGeometry){const Bt=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,Nn=Math.min(q.instanceCount,Bt);oe.renderInstances(se,ye,Nn)}else oe.render(se,ye)};function ce(k,G,q){k.transparent===!0&&k.side===Re&&k.forceSinglePass===!1?(k.side=Xe,k.needsUpdate=!0,Cr(k,G,q),k.side=yi,k.needsUpdate=!0,Cr(k,G,q),k.side=Re):Cr(k,G,q)}this.compile=function(k,G,q=null){q===null&&(q=k),m=It.get(q),m.init(G),x.push(m),q.traverseVisible(function(V){V.isLight&&V.layers.test(G.layers)&&(m.pushLight(V),V.castShadow&&m.pushShadow(V))}),k!==q&&k.traverseVisible(function(V){V.isLight&&V.layers.test(G.layers)&&(m.pushLight(V),V.castShadow&&m.pushShadow(V))}),m.setupLights();const Z=new Set;return k.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;const Mt=V.material;if(Mt)if(Array.isArray(Mt))for(let Pt=0;Pt<Mt.length;Pt++){const Ot=Mt[Pt];ce(Ot,q,V),Z.add(Ot)}else ce(Mt,q,V),Z.add(Mt)}),x.pop(),m=null,Z},this.compileAsync=function(k,G,q=null){const Z=this.compile(k,G,q);return new Promise(V=>{function Mt(){if(Z.forEach(function(Pt){pt.get(Pt).currentProgram.isReady()&&Z.delete(Pt)}),Z.size===0){V(k);return}setTimeout(Mt,10)}nt.get("KHR_parallel_shader_compile")!==null?Mt():setTimeout(Mt,10)})};let mn=null;function Dn(k){mn&&mn(k)}function Ac(){Ai.stop()}function Rc(){Ai.start()}const Ai=new $u;Ai.setAnimationLoop(Dn),typeof self<"u"&&Ai.setContext(self),this.setAnimationLoop=function(k){mn=k,tt.setAnimationLoop(k),k===null?Ai.stop():Ai.start()},tt.addEventListener("sessionstart",Ac),tt.addEventListener("sessionend",Rc),this.render=function(k,G){if(G!==void 0&&G.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),tt.enabled===!0&&tt.isPresenting===!0&&(tt.cameraAutoUpdate===!0&&tt.updateCamera(G),G=tt.getCamera()),k.isScene===!0&&k.onBeforeRender(y,k,G,E),m=It.get(k,x.length),m.init(G),x.push(m),_t.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),W.setFromProjectionMatrix(_t),yt=this.localClippingEnabled,et=it.init(this.clippingPlanes,yt),g=rt.get(k,_.length),g.init(),_.push(g),tt.enabled===!0&&tt.isPresenting===!0){const Mt=y.xr.getDepthSensingMesh();Mt!==null&&Ya(Mt,G,-1/0,y.sortObjects)}Ya(k,G,0,y.sortObjects),g.finish(),y.sortObjects===!0&&g.sort(J,st),Q=tt.enabled===!1||tt.isPresenting===!1||tt.hasDepthSensing()===!1,Q&&Nt.addToRenderList(g,k),this.info.render.frame++,et===!0&&it.beginShadows();const q=m.state.shadowsArray;Et.render(q,k,G),et===!0&&it.endShadows(),this.info.autoReset===!0&&this.info.reset();const Z=g.opaque,V=g.transmissive;if(m.setupLights(),G.isArrayCamera){const Mt=G.cameras;if(V.length>0)for(let Pt=0,Ot=Mt.length;Pt<Ot;Pt++){const Ut=Mt[Pt];Cc(Z,V,k,Ut)}Q&&Nt.render(k);for(let Pt=0,Ot=Mt.length;Pt<Ot;Pt++){const Ut=Mt[Pt];kc(g,k,Ut,Ut.viewport)}}else V.length>0&&Cc(Z,V,k,G),Q&&Nt.render(k),kc(g,k,G);E!==null&&(C.updateMultisampleRenderTarget(E),C.updateRenderTargetMipmap(E)),k.isScene===!0&&k.onAfterRender(y,k,G),me.resetDefaultState(),b=-1,S=null,x.pop(),x.length>0?(m=x[x.length-1],et===!0&&it.setGlobalState(y.clippingPlanes,m.state.camera)):m=null,_.pop(),_.length>0?g=_[_.length-1]:g=null};function Ya(k,G,q,Z){if(k.visible===!1)return;if(k.layers.test(G.layers)){if(k.isGroup)q=k.renderOrder;else if(k.isLOD)k.autoUpdate===!0&&k.update(G);else if(k.isLight)m.pushLight(k),k.castShadow&&m.pushShadow(k);else if(k.isSprite){if(!k.frustumCulled||W.intersectsSprite(k)){Z&&At.setFromMatrixPosition(k.matrixWorld).applyMatrix4(_t);const Pt=$.update(k),Ot=k.material;Ot.visible&&g.push(k,Pt,Ot,q,At.z,null)}}else if((k.isMesh||k.isLine||k.isPoints)&&(!k.frustumCulled||W.intersectsObject(k))){const Pt=$.update(k),Ot=k.material;if(Z&&(k.boundingSphere!==void 0?(k.boundingSphere===null&&k.computeBoundingSphere(),At.copy(k.boundingSphere.center)):(Pt.boundingSphere===null&&Pt.computeBoundingSphere(),At.copy(Pt.boundingSphere.center)),At.applyMatrix4(k.matrixWorld).applyMatrix4(_t)),Array.isArray(Ot)){const Ut=Pt.groups;for(let Kt=0,qt=Ut.length;Kt<qt;Kt++){const Ft=Ut[Kt],se=Ot[Ft.materialIndex];se&&se.visible&&g.push(k,Pt,se,q,At.z,Ft)}}else Ot.visible&&g.push(k,Pt,Ot,q,At.z,null)}}const Mt=k.children;for(let Pt=0,Ot=Mt.length;Pt<Ot;Pt++)Ya(Mt[Pt],G,q,Z)}function kc(k,G,q,Z){const V=k.opaque,Mt=k.transmissive,Pt=k.transparent;m.setupLightsView(q),et===!0&&it.setGlobalState(y.clippingPlanes,q),Z&&gt.viewport(P.copy(Z)),V.length>0&&kr(V,G,q),Mt.length>0&&kr(Mt,G,q),Pt.length>0&&kr(Pt,G,q),gt.buffers.depth.setTest(!0),gt.buffers.depth.setMask(!0),gt.buffers.color.setMask(!0),gt.setPolygonOffset(!1)}function Cc(k,G,q,Z){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[Z.id]===void 0&&(m.state.transmissionRenderTarget[Z.id]=new Yi(1,1,{generateMipmaps:!0,type:nt.has("EXT_color_buffer_half_float")||nt.has("EXT_color_buffer_float")?Rr:Yn,minFilter:Wi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ie.workingColorSpace}));const Mt=m.state.transmissionRenderTarget[Z.id],Pt=Z.viewport||P;Mt.setSize(Pt.z,Pt.w);const Ot=y.getRenderTarget();y.setRenderTarget(Mt),y.getClearColor(F),K=y.getClearAlpha(),K<1&&y.setClearColor(16777215,.5),y.clear(),Q&&Nt.render(q);const Ut=y.toneMapping;y.toneMapping=pi;const Kt=Z.viewport;if(Z.viewport!==void 0&&(Z.viewport=void 0),m.setupLightsView(Z),et===!0&&it.setGlobalState(y.clippingPlanes,Z),kr(k,q,Z),C.updateMultisampleRenderTarget(Mt),C.updateRenderTargetMipmap(Mt),nt.has("WEBGL_multisampled_render_to_texture")===!1){let qt=!1;for(let Ft=0,se=G.length;Ft<se;Ft++){const ge=G[Ft],ye=ge.object,Qe=ge.geometry,oe=ge.material,Bt=ge.group;if(oe.side===Re&&ye.layers.test(Z.layers)){const Nn=oe.side;oe.side=Xe,oe.needsUpdate=!0,Pc(ye,q,Z,Qe,oe,Bt),oe.side=Nn,oe.needsUpdate=!0,qt=!0}}qt===!0&&(C.updateMultisampleRenderTarget(Mt),C.updateRenderTargetMipmap(Mt))}y.setRenderTarget(Ot),y.setClearColor(F,K),Kt!==void 0&&(Z.viewport=Kt),y.toneMapping=Ut}function kr(k,G,q){const Z=G.isScene===!0?G.overrideMaterial:null;for(let V=0,Mt=k.length;V<Mt;V++){const Pt=k[V],Ot=Pt.object,Ut=Pt.geometry,Kt=Z===null?Pt.material:Z,qt=Pt.group;Ot.layers.test(q.layers)&&Pc(Ot,G,q,Ut,Kt,qt)}}function Pc(k,G,q,Z,V,Mt){k.onBeforeRender(y,G,q,Z,V,Mt),k.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,k.matrixWorld),k.normalMatrix.getNormalMatrix(k.modelViewMatrix),V.onBeforeRender(y,G,q,Z,k,Mt),V.transparent===!0&&V.side===Re&&V.forceSinglePass===!1?(V.side=Xe,V.needsUpdate=!0,y.renderBufferDirect(q,G,Z,V,k,Mt),V.side=yi,V.needsUpdate=!0,y.renderBufferDirect(q,G,Z,V,k,Mt),V.side=Re):y.renderBufferDirect(q,G,Z,V,k,Mt),k.onAfterRender(y,G,q,Z,V,Mt)}function Cr(k,G,q){G.isScene!==!0&&(G=Gt);const Z=pt.get(k),V=m.state.lights,Mt=m.state.shadowsArray,Pt=V.state.version,Ot=ut.getParameters(k,V.state,Mt,G,q),Ut=ut.getProgramCacheKey(Ot);let Kt=Z.programs;Z.environment=k.isMeshStandardMaterial?G.environment:null,Z.fog=G.fog,Z.envMap=(k.isMeshStandardMaterial?I:A).get(k.envMap||Z.environment),Z.envMapRotation=Z.environment!==null&&k.envMap===null?G.environmentRotation:k.envMapRotation,Kt===void 0&&(k.addEventListener("dispose",$t),Kt=new Map,Z.programs=Kt);let qt=Kt.get(Ut);if(qt!==void 0){if(Z.currentProgram===qt&&Z.lightsStateVersion===Pt)return Ic(k,Ot),qt}else Ot.uniforms=ut.getUniforms(k),k.onBeforeCompile(Ot,y),qt=ut.acquireProgram(Ot,Ut),Kt.set(Ut,qt),Z.uniforms=Ot.uniforms;const Ft=Z.uniforms;return(!k.isShaderMaterial&&!k.isRawShaderMaterial||k.clipping===!0)&&(Ft.clippingPlanes=it.uniform),Ic(k,Ot),Z.needsLights=Zd(k),Z.lightsStateVersion=Pt,Z.needsLights&&(Ft.ambientLightColor.value=V.state.ambient,Ft.lightProbe.value=V.state.probe,Ft.directionalLights.value=V.state.directional,Ft.directionalLightShadows.value=V.state.directionalShadow,Ft.spotLights.value=V.state.spot,Ft.spotLightShadows.value=V.state.spotShadow,Ft.rectAreaLights.value=V.state.rectArea,Ft.ltc_1.value=V.state.rectAreaLTC1,Ft.ltc_2.value=V.state.rectAreaLTC2,Ft.pointLights.value=V.state.point,Ft.pointLightShadows.value=V.state.pointShadow,Ft.hemisphereLights.value=V.state.hemi,Ft.directionalShadowMap.value=V.state.directionalShadowMap,Ft.directionalShadowMatrix.value=V.state.directionalShadowMatrix,Ft.spotShadowMap.value=V.state.spotShadowMap,Ft.spotLightMatrix.value=V.state.spotLightMatrix,Ft.spotLightMap.value=V.state.spotLightMap,Ft.pointShadowMap.value=V.state.pointShadowMap,Ft.pointShadowMatrix.value=V.state.pointShadowMatrix),Z.currentProgram=qt,Z.uniformsList=null,qt}function Lc(k){if(k.uniformsList===null){const G=k.currentProgram.getUniforms();k.uniformsList=Sa.seqWithValue(G.seq,k.uniforms)}return k.uniformsList}function Ic(k,G){const q=pt.get(k);q.outputColorSpace=G.outputColorSpace,q.batching=G.batching,q.batchingColor=G.batchingColor,q.instancing=G.instancing,q.instancingColor=G.instancingColor,q.instancingMorph=G.instancingMorph,q.skinning=G.skinning,q.morphTargets=G.morphTargets,q.morphNormals=G.morphNormals,q.morphColors=G.morphColors,q.morphTargetsCount=G.morphTargetsCount,q.numClippingPlanes=G.numClippingPlanes,q.numIntersection=G.numClipIntersection,q.vertexAlphas=G.vertexAlphas,q.vertexTangents=G.vertexTangents,q.toneMapping=G.toneMapping}function $d(k,G,q,Z,V){G.isScene!==!0&&(G=Gt),C.resetTextureUnits();const Mt=G.fog,Pt=Z.isMeshStandardMaterial?G.environment:null,Ot=E===null?y.outputColorSpace:E.isXRRenderTarget===!0?E.texture.colorSpace:Bs,Ut=(Z.isMeshStandardMaterial?I:A).get(Z.envMap||Pt),Kt=Z.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,qt=!!q.attributes.tangent&&(!!Z.normalMap||Z.anisotropy>0),Ft=!!q.morphAttributes.position,se=!!q.morphAttributes.normal,ge=!!q.morphAttributes.color;let ye=pi;Z.toneMapped&&(E===null||E.isXRRenderTarget===!0)&&(ye=y.toneMapping);const Qe=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,oe=Qe!==void 0?Qe.length:0,Bt=pt.get(Z),Nn=m.state.lights;if(et===!0&&(yt===!0||k!==S)){const ln=k===S&&Z.id===b;it.setState(Z,k,ln)}let le=!1;Z.version===Bt.__version?(Bt.needsLights&&Bt.lightsStateVersion!==Nn.state.version||Bt.outputColorSpace!==Ot||V.isBatchedMesh&&Bt.batching===!1||!V.isBatchedMesh&&Bt.batching===!0||V.isBatchedMesh&&Bt.batchingColor===!0&&V.colorTexture===null||V.isBatchedMesh&&Bt.batchingColor===!1&&V.colorTexture!==null||V.isInstancedMesh&&Bt.instancing===!1||!V.isInstancedMesh&&Bt.instancing===!0||V.isSkinnedMesh&&Bt.skinning===!1||!V.isSkinnedMesh&&Bt.skinning===!0||V.isInstancedMesh&&Bt.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&Bt.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&Bt.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&Bt.instancingMorph===!1&&V.morphTexture!==null||Bt.envMap!==Ut||Z.fog===!0&&Bt.fog!==Mt||Bt.numClippingPlanes!==void 0&&(Bt.numClippingPlanes!==it.numPlanes||Bt.numIntersection!==it.numIntersection)||Bt.vertexAlphas!==Kt||Bt.vertexTangents!==qt||Bt.morphTargets!==Ft||Bt.morphNormals!==se||Bt.morphColors!==ge||Bt.toneMapping!==ye||Bt.morphTargetsCount!==oe)&&(le=!0):(le=!0,Bt.__version=Z.version);let gn=Bt.currentProgram;le===!0&&(gn=Cr(Z,G,V));let ji=!1,tn=!1,Ws=!1;const xe=gn.getUniforms(),Tn=Bt.uniforms;if(gt.useProgram(gn.program)&&(ji=!0,tn=!0,Ws=!0),Z.id!==b&&(b=Z.id,tn=!0),ji||S!==k){gt.buffers.depth.getReversed()?(ot.copy(k.projectionMatrix),Hf(ot),Gf(ot),xe.setValue(L,"projectionMatrix",ot)):xe.setValue(L,"projectionMatrix",k.projectionMatrix),xe.setValue(L,"viewMatrix",k.matrixWorldInverse);const Qn=xe.map.cameraPosition;Qn!==void 0&&Qn.setValue(L,wt.setFromMatrixPosition(k.matrixWorld)),xt.logarithmicDepthBuffer&&xe.setValue(L,"logDepthBufFC",2/(Math.log(k.far+1)/Math.LN2)),(Z.isMeshPhongMaterial||Z.isMeshToonMaterial||Z.isMeshLambertMaterial||Z.isMeshBasicMaterial||Z.isMeshStandardMaterial||Z.isShaderMaterial)&&xe.setValue(L,"isOrthographic",k.isOrthographicCamera===!0),S!==k&&(S=k,tn=!0,Ws=!0)}if(V.isSkinnedMesh){xe.setOptional(L,V,"bindMatrix"),xe.setOptional(L,V,"bindMatrixInverse");const ln=V.skeleton;ln&&(ln.boneTexture===null&&ln.computeBoneTexture(),xe.setValue(L,"boneTexture",ln.boneTexture,C))}V.isBatchedMesh&&(xe.setOptional(L,V,"batchingTexture"),xe.setValue(L,"batchingTexture",V._matricesTexture,C),xe.setOptional(L,V,"batchingIdTexture"),xe.setValue(L,"batchingIdTexture",V._indirectTexture,C),xe.setOptional(L,V,"batchingColorTexture"),V._colorsTexture!==null&&xe.setValue(L,"batchingColorTexture",V._colorsTexture,C));const Xs=q.morphAttributes;if((Xs.position!==void 0||Xs.normal!==void 0||Xs.color!==void 0)&&Ht.update(V,q,gn),(tn||Bt.receiveShadow!==V.receiveShadow)&&(Bt.receiveShadow=V.receiveShadow,xe.setValue(L,"receiveShadow",V.receiveShadow)),Z.isMeshGouraudMaterial&&Z.envMap!==null&&(Tn.envMap.value=Ut,Tn.flipEnvMap.value=Ut.isCubeTexture&&Ut.isRenderTargetTexture===!1?-1:1),Z.isMeshStandardMaterial&&Z.envMap===null&&G.environment!==null&&(Tn.envMapIntensity.value=G.environmentIntensity),tn&&(xe.setValue(L,"toneMappingExposure",y.toneMappingExposure),Bt.needsLights&&qd(Tn,Ws),Mt&&Z.fog===!0&&at.refreshFogUniforms(Tn,Mt),at.refreshMaterialUniforms(Tn,Z,H,Y,m.state.transmissionRenderTarget[k.id]),Sa.upload(L,Lc(Bt),Tn,C)),Z.isShaderMaterial&&Z.uniformsNeedUpdate===!0&&(Sa.upload(L,Lc(Bt),Tn,C),Z.uniformsNeedUpdate=!1),Z.isSpriteMaterial&&xe.setValue(L,"center",V.center),xe.setValue(L,"modelViewMatrix",V.modelViewMatrix),xe.setValue(L,"normalMatrix",V.normalMatrix),xe.setValue(L,"modelMatrix",V.matrixWorld),Z.isShaderMaterial||Z.isRawShaderMaterial){const ln=Z.uniformsGroups;for(let Qn=0,ti=ln.length;Qn<ti;Qn++){const Dc=ln[Qn];B.update(Dc,gn),B.bind(Dc,gn)}}return gn}function qd(k,G){k.ambientLightColor.needsUpdate=G,k.lightProbe.needsUpdate=G,k.directionalLights.needsUpdate=G,k.directionalLightShadows.needsUpdate=G,k.pointLights.needsUpdate=G,k.pointLightShadows.needsUpdate=G,k.spotLights.needsUpdate=G,k.spotLightShadows.needsUpdate=G,k.rectAreaLights.needsUpdate=G,k.hemisphereLights.needsUpdate=G}function Zd(k){return k.isMeshLambertMaterial||k.isMeshToonMaterial||k.isMeshPhongMaterial||k.isMeshStandardMaterial||k.isShadowMaterial||k.isShaderMaterial&&k.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return E},this.setRenderTargetTextures=function(k,G,q){pt.get(k.texture).__webglTexture=G,pt.get(k.depthTexture).__webglTexture=q;const Z=pt.get(k);Z.__hasExternalTextures=!0,Z.__autoAllocateDepthBuffer=q===void 0,Z.__autoAllocateDepthBuffer||nt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Z.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(k,G){const q=pt.get(k);q.__webglFramebuffer=G,q.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(k,G=0,q=0){E=k,w=G,T=q;let Z=!0,V=null,Mt=!1,Pt=!1;if(k){const Ut=pt.get(k);if(Ut.__useDefaultFramebuffer!==void 0)gt.bindFramebuffer(L.FRAMEBUFFER,null),Z=!1;else if(Ut.__webglFramebuffer===void 0)C.setupRenderTarget(k);else if(Ut.__hasExternalTextures)C.rebindTextures(k,pt.get(k.texture).__webglTexture,pt.get(k.depthTexture).__webglTexture);else if(k.depthBuffer){const Ft=k.depthTexture;if(Ut.__boundDepthTexture!==Ft){if(Ft!==null&&pt.has(Ft)&&(k.width!==Ft.image.width||k.height!==Ft.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(k)}}const Kt=k.texture;(Kt.isData3DTexture||Kt.isDataArrayTexture||Kt.isCompressedArrayTexture)&&(Pt=!0);const qt=pt.get(k).__webglFramebuffer;k.isWebGLCubeRenderTarget?(Array.isArray(qt[G])?V=qt[G][q]:V=qt[G],Mt=!0):k.samples>0&&C.useMultisampledRTT(k)===!1?V=pt.get(k).__webglMultisampledFramebuffer:Array.isArray(qt)?V=qt[q]:V=qt,P.copy(k.viewport),O.copy(k.scissor),U=k.scissorTest}else P.copy(lt).multiplyScalar(H).floor(),O.copy(ht).multiplyScalar(H).floor(),U=St;if(gt.bindFramebuffer(L.FRAMEBUFFER,V)&&Z&&gt.drawBuffers(k,V),gt.viewport(P),gt.scissor(O),gt.setScissorTest(U),Mt){const Ut=pt.get(k.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+G,Ut.__webglTexture,q)}else if(Pt){const Ut=pt.get(k.texture),Kt=G||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ut.__webglTexture,q||0,Kt)}b=-1},this.readRenderTargetPixels=function(k,G,q,Z,V,Mt,Pt){if(!(k&&k.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ot=pt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Pt!==void 0&&(Ot=Ot[Pt]),Ot){gt.bindFramebuffer(L.FRAMEBUFFER,Ot);try{const Ut=k.texture,Kt=Ut.format,qt=Ut.type;if(!xt.textureFormatReadable(Kt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!xt.textureTypeReadable(qt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=k.width-Z&&q>=0&&q<=k.height-V&&L.readPixels(G,q,Z,V,jt.convert(Kt),jt.convert(qt),Mt)}finally{const Ut=E!==null?pt.get(E).__webglFramebuffer:null;gt.bindFramebuffer(L.FRAMEBUFFER,Ut)}}},this.readRenderTargetPixelsAsync=async function(k,G,q,Z,V,Mt,Pt){if(!(k&&k.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ot=pt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Pt!==void 0&&(Ot=Ot[Pt]),Ot){const Ut=k.texture,Kt=Ut.format,qt=Ut.type;if(!xt.textureFormatReadable(Kt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!xt.textureTypeReadable(qt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(G>=0&&G<=k.width-Z&&q>=0&&q<=k.height-V){gt.bindFramebuffer(L.FRAMEBUFFER,Ot);const Ft=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Ft),L.bufferData(L.PIXEL_PACK_BUFFER,Mt.byteLength,L.STREAM_READ),L.readPixels(G,q,Z,V,jt.convert(Kt),jt.convert(qt),0);const se=E!==null?pt.get(E).__webglFramebuffer:null;gt.bindFramebuffer(L.FRAMEBUFFER,se);const ge=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await Bf(L,ge,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,Ft),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Mt),L.deleteBuffer(Ft),L.deleteSync(ge),Mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(k,G=null,q=0){k.isTexture!==!0&&(cr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),G=arguments[0]||null,k=arguments[1]);const Z=Math.pow(2,-q),V=Math.floor(k.image.width*Z),Mt=Math.floor(k.image.height*Z),Pt=G!==null?G.x:0,Ot=G!==null?G.y:0;C.setTexture2D(k,0),L.copyTexSubImage2D(L.TEXTURE_2D,q,0,0,Pt,Ot,V,Mt),gt.unbindTexture()},this.copyTextureToTexture=function(k,G,q=null,Z=null,V=0){k.isTexture!==!0&&(cr("WebGLRenderer: copyTextureToTexture function signature has changed."),Z=arguments[0]||null,k=arguments[1],G=arguments[2],V=arguments[3]||0,q=null);let Mt,Pt,Ot,Ut,Kt,qt,Ft,se,ge;const ye=k.isCompressedTexture?k.mipmaps[V]:k.image;q!==null?(Mt=q.max.x-q.min.x,Pt=q.max.y-q.min.y,Ot=q.isBox3?q.max.z-q.min.z:1,Ut=q.min.x,Kt=q.min.y,qt=q.isBox3?q.min.z:0):(Mt=ye.width,Pt=ye.height,Ot=ye.depth||1,Ut=0,Kt=0,qt=0),Z!==null?(Ft=Z.x,se=Z.y,ge=Z.z):(Ft=0,se=0,ge=0);const Qe=jt.convert(G.format),oe=jt.convert(G.type);let Bt;G.isData3DTexture?(C.setTexture3D(G,0),Bt=L.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(C.setTexture2DArray(G,0),Bt=L.TEXTURE_2D_ARRAY):(C.setTexture2D(G,0),Bt=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,G.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,G.unpackAlignment);const Nn=L.getParameter(L.UNPACK_ROW_LENGTH),le=L.getParameter(L.UNPACK_IMAGE_HEIGHT),gn=L.getParameter(L.UNPACK_SKIP_PIXELS),ji=L.getParameter(L.UNPACK_SKIP_ROWS),tn=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,ye.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ye.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Ut),L.pixelStorei(L.UNPACK_SKIP_ROWS,Kt),L.pixelStorei(L.UNPACK_SKIP_IMAGES,qt);const Ws=k.isDataArrayTexture||k.isData3DTexture,xe=G.isDataArrayTexture||G.isData3DTexture;if(k.isRenderTargetTexture||k.isDepthTexture){const Tn=pt.get(k),Xs=pt.get(G),ln=pt.get(Tn.__renderTarget),Qn=pt.get(Xs.__renderTarget);gt.bindFramebuffer(L.READ_FRAMEBUFFER,ln.__webglFramebuffer),gt.bindFramebuffer(L.DRAW_FRAMEBUFFER,Qn.__webglFramebuffer);for(let ti=0;ti<Ot;ti++)Ws&&L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,pt.get(k).__webglTexture,V,qt+ti),k.isDepthTexture?(xe&&L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,pt.get(G).__webglTexture,V,ge+ti),L.blitFramebuffer(Ut,Kt,Mt,Pt,Ft,se,Mt,Pt,L.DEPTH_BUFFER_BIT,L.NEAREST)):xe?L.copyTexSubImage3D(Bt,V,Ft,se,ge+ti,Ut,Kt,Mt,Pt):L.copyTexSubImage2D(Bt,V,Ft,se,ge+ti,Ut,Kt,Mt,Pt);gt.bindFramebuffer(L.READ_FRAMEBUFFER,null),gt.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else xe?k.isDataTexture||k.isData3DTexture?L.texSubImage3D(Bt,V,Ft,se,ge,Mt,Pt,Ot,Qe,oe,ye.data):G.isCompressedArrayTexture?L.compressedTexSubImage3D(Bt,V,Ft,se,ge,Mt,Pt,Ot,Qe,ye.data):L.texSubImage3D(Bt,V,Ft,se,ge,Mt,Pt,Ot,Qe,oe,ye):k.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,V,Ft,se,Mt,Pt,Qe,oe,ye.data):k.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,V,Ft,se,ye.width,ye.height,Qe,ye.data):L.texSubImage2D(L.TEXTURE_2D,V,Ft,se,Mt,Pt,Qe,oe,ye);L.pixelStorei(L.UNPACK_ROW_LENGTH,Nn),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,le),L.pixelStorei(L.UNPACK_SKIP_PIXELS,gn),L.pixelStorei(L.UNPACK_SKIP_ROWS,ji),L.pixelStorei(L.UNPACK_SKIP_IMAGES,tn),V===0&&G.generateMipmaps&&L.generateMipmap(Bt),gt.unbindTexture()},this.copyTextureToTexture3D=function(k,G,q=null,Z=null,V=0){return k.isTexture!==!0&&(cr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),q=arguments[0]||null,Z=arguments[1]||null,k=arguments[2],G=arguments[3],V=arguments[4]||0),cr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(k,G,q,Z,V)},this.initRenderTarget=function(k){pt.get(k).__webglFramebuffer===void 0&&C.setupRenderTarget(k)},this.initTexture=function(k){k.isCubeTexture?C.setTextureCube(k,0):k.isData3DTexture?C.setTexture3D(k,0):k.isDataArrayTexture||k.isCompressedArrayTexture?C.setTexture2DArray(k,0):C.setTexture2D(k,0),gt.unbindTexture()},this.resetState=function(){w=0,T=0,E=null,gt.reset(),me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=ie._getDrawingBufferColorSpace(t),e.unpackColorSpace=ie._getUnpackColorSpace()}}class sc{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new Vt(t),this.near=e,this.far=n}clone(){return new sc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class ed extends Se{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new En,this.environmentIntensity=1,this.environmentRotation=new En,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Jv{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Al,this.updateRanges=[],this.version=0,this.uuid=Cn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,r=this.stride;i<r;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Cn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Cn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ye=new D;class Ca{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Ye.fromBufferAttribute(this,e),Ye.applyMatrix4(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ye.fromBufferAttribute(this,e),Ye.applyNormalMatrix(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ye.fromBufferAttribute(this,e),Ye.transformDirection(t),this.setXYZ(e,Ye.x,Ye.y,Ye.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Rn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=fe(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=fe(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Rn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Rn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Rn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Rn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=fe(e,this.array),n=fe(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=fe(e,this.array),n=fe(n,this.array),i=fe(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=fe(e,this.array),n=fe(n,this.array),i=fe(i,this.array),r=fe(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return new Oe(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Ca(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class nd extends Ti{static get type(){return"SpriteMaterial"}constructor(t){super(),this.isSpriteMaterial=!0,this.color=new Vt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}let ds;const Zs=new D,fs=new D,ps=new D,ms=new vt,js=new vt,id=new Yt,Jr=new D,Js=new D,Qr=new D,Ph=new vt,To=new vt,Lh=new vt;class Qv extends Se{constructor(t=new nd){if(super(),this.isSprite=!0,this.type="Sprite",ds===void 0){ds=new Te;const e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Jv(e,5);ds.setIndex([0,1,2,0,2,3]),ds.setAttribute("position",new Ca(n,3,0,!1)),ds.setAttribute("uv",new Ca(n,2,3,!1))}this.geometry=ds,this.material=t,this.center=new vt(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),fs.setFromMatrixScale(this.matrixWorld),id.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),ps.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&fs.multiplyScalar(-ps.z);const n=this.material.rotation;let i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));const a=this.center;ta(Jr.set(-.5,-.5,0),ps,a,fs,i,r),ta(Js.set(.5,-.5,0),ps,a,fs,i,r),ta(Qr.set(.5,.5,0),ps,a,fs,i,r),Ph.set(0,0),To.set(1,0),Lh.set(1,1);let o=t.ray.intersectTriangle(Jr,Js,Qr,!1,Zs);if(o===null&&(ta(Js.set(-.5,.5,0),ps,a,fs,i,r),To.set(0,1),o=t.ray.intersectTriangle(Jr,Qr,Js,!1,Zs),o===null))return;const l=t.ray.origin.distanceTo(Zs);l<t.near||l>t.far||e.push({distance:l,point:Zs.clone(),uv:un.getInterpolation(Zs,Jr,Js,Qr,Ph,To,Lh,new vt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}}function ta(s,t,e,n,i,r){ms.subVectors(s,e).addScalar(.5).multiply(n),i!==void 0?(js.x=r*ms.x-i*ms.y,js.y=i*ms.x+r*ms.y):js.copy(ms),s.copy(t),s.x+=js.x,s.y+=js.y,s.applyMatrix4(id)}const Ih=new D,Dh=new ae,Nh=new ae,ty=new D,Oh=new Yt,ea=new D,wo=new Ei,Uh=new Yt,Ao=new Ba;class Fh extends Dt{constructor(t,e){super(t,e),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Fc,this.bindMatrix=new Yt,this.bindMatrixInverse=new Yt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const t=this.geometry;this.boundingBox===null&&(this.boundingBox=new Si),this.boundingBox.makeEmpty();const e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,ea),this.boundingBox.expandByPoint(ea)}computeBoundingSphere(){const t=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Ei),this.boundingSphere.makeEmpty();const e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,ea),this.boundingSphere.expandByPoint(ea)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}raycast(t,e){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),wo.copy(this.boundingSphere),wo.applyMatrix4(i),t.ray.intersectsSphere(wo)!==!1&&(Uh.copy(i).invert(),Ao.copy(t.ray).applyMatrix4(Uh),!(this.boundingBox!==null&&Ao.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(t,e,Ao)))}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){this.skeleton=t,e===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld),this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const t=new ae,e=this.geometry.attributes.skinWeight;for(let n=0,i=e.count;n<i;n++){t.fromBufferAttribute(e,n);const r=1/t.manhattanLength();r!==1/0?t.multiplyScalar(r):t.set(1,0,0,0),e.setXYZW(n,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){super.updateMatrixWorld(t),this.bindMode===Fc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===wf?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){const n=this.skeleton,i=this.geometry;Dh.fromBufferAttribute(i.attributes.skinIndex,t),Nh.fromBufferAttribute(i.attributes.skinWeight,t),Ih.copy(e).applyMatrix4(this.bindMatrix),e.set(0,0,0);for(let r=0;r<4;r++){const a=Nh.getComponent(r);if(a!==0){const o=Dh.getComponent(r);Oh.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),e.addScaledVector(ty.copy(Ih).applyMatrix4(Oh),a)}}return e.applyMatrix4(this.bindMatrixInverse)}}class sd extends Se{constructor(){super(),this.isBone=!0,this.type="Bone"}}class rd extends Ke{constructor(t=null,e=1,n=1,i,r,a,o,l,c=on,h=on,u,f){super(null,a,o,l,c,h,i,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const zh=new Yt,ey=new Yt;class rc{constructor(t=[],e=[]){this.uuid=Cn(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Yt)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){const n=new Yt;this.bones[t]&&n.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){const n=this.bones[t];n&&n.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){const n=this.bones[t];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const t=this.bones,e=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=t.length;r<a;r++){const o=t[r]?t[r].matrixWorld:ey;zh.multiplyMatrices(o,e[r]),zh.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new rc(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);const e=new Float32Array(t*t*4);e.set(this.boneMatrices);const n=new rd(e,t,t,dn,bn);return n.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=n,this}getBoneByName(t){for(let e=0,n=this.bones.length;e<n;e++){const i=this.bones[e];if(i.name===t)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(t,e){this.uuid=t.uuid;for(let n=0,i=t.bones.length;n<i;n++){const r=t.bones[n];let a=e[r];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),a=new sd),this.bones.push(a),this.boneInverses.push(new Yt().fromArray(t.boneInverses[n]))}return this.init(),this}toJSON(){const t={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;const e=this.bones,n=this.boneInverses;for(let i=0,r=e.length;i<r;i++){const a=e[i];t.bones.push(a.uuid);const o=n[i];t.boneInverses.push(o.toArray())}return t}}class Bh extends Oe{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const gs=new Yt,Hh=new Yt,na=[],Gh=new Si,ny=new Yt,Qs=new Dt,tr=new Ei;class vs extends Dt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Bh(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,ny)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Si),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,gs),Gh.copy(t.boundingBox).applyMatrix4(gs),this.boundingBox.union(Gh)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ei),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,gs),tr.copy(t.boundingSphere).applyMatrix4(gs),this.boundingSphere.union(tr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(t,e){const n=this.matrixWorld,i=this.count;if(Qs.geometry=this.geometry,Qs.material=this.material,Qs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),tr.copy(this.boundingSphere),tr.applyMatrix4(n),t.ray.intersectsSphere(tr)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,gs),Hh.multiplyMatrices(n,gs),Qs.matrixWorld=Hh,Qs.raycast(t,na);for(let a=0,o=na.length;a<o;a++){const l=na[a];l.instanceId=r,l.object=this,e.push(l)}na.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Bh(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new rd(new Float32Array(i*this.count),i,this.count,ql,bn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class ad extends Ti{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new Vt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const Vh=new Yt,Pl=new Ba,ia=new Ei,sa=new D;class iy extends Se{constructor(t=new Te,e=new ad){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ia.copy(n.boundingSphere),ia.applyMatrix4(i),ia.radius+=r,t.ray.intersectsSphere(ia)===!1)return;Vh.copy(i).invert(),Pl.copy(t.ray).applyMatrix4(Vh);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let p=f,v=d;p<v;p++){const g=c.getX(p);sa.fromBufferAttribute(u,g),Wh(sa,g,l,i,t,e,this)}}else{const f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let p=f,v=d;p<v;p++)sa.fromBufferAttribute(u,p),Wh(sa,p,l,i,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Wh(s,t,e,n,i,r,a){const o=Pl.distanceSqToPoint(s);if(o<e){const l=new D;Pl.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}class Ga extends Ke{constructor(t,e,n,i,r,a,o,l,c){super(t,e,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class In{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,i=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(i),e.push(r),i=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let i=0;const r=n.length;let a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(i=Math.floor(o+(l-o)/2),c=n[i]-a,c<0)o=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===a)return i/(r-1);const h=n[i],f=n[i+1]-h,d=(a-h)/f;return(i+d)/(r-1)}getTangent(t,e){let i=t-1e-4,r=t+1e-4;i<0&&(i=0),r>1&&(r=1);const a=this.getPoint(i),o=this.getPoint(r),l=e||(a.isVector2?new vt:new D);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new D,i=[],r=[],a=[],o=new D,l=new Yt;for(let d=0;d<=t;d++){const p=d/t;i[d]=this.getTangentAt(p,new D)}r[0]=new D,a[0]=new D;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),f=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),o.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],o),a[0].crossVectors(i[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(i[d-1],i[d]),o.length()>Number.EPSILON){o.normalize();const p=Math.acos(Le(i[d-1].dot(i[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,p))}a[d].crossVectors(i[d],r[d])}if(e===!0){let d=Math.acos(Le(r[0].dot(r[t]),-1,1));d/=t,i[0].dot(o.crossVectors(r[0],r[t]))>0&&(d=-d);for(let p=1;p<=t;p++)r[p].applyMatrix4(l.makeRotationAxis(i[p],d*p)),a[p].crossVectors(i[p],r[p])}return{tangents:i,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class ac extends In{constructor(t=0,e=0,n=1,i=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new vt){const n=e,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(a?r=0:r=i),this.aClockwise===!0&&!a&&(r===i?r=-i:r=r-i);const o=this.aStartAngle+t*r;let l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*h-d*u+this.aX,c=f*u+d*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class sy extends ac{constructor(t,e,n,i,r,a){super(t,e,n,n,i,r,a),this.isArcCurve=!0,this.type="ArcCurve"}}function oc(){let s=0,t=0,e=0,n=0;function i(r,a,o,l){s=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){i(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let f=(a-r)/c-(o-r)/(c+h)+(o-a)/h,d=(o-a)/h-(l-a)/(h+u)+(l-o)/u;f*=h,d*=h,i(a,o,f,d)},calc:function(r){const a=r*r,o=a*r;return s+t*r+e*a+n*o}}}const ra=new D,Ro=new oc,ko=new oc,Co=new oc;class ry extends In{constructor(t=[],e=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=i}getPoint(t,e=new D){const n=e,i=this.points,r=i.length,a=(r-(this.closed?0:1))*t;let o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=i[(o-1)%r]:(ra.subVectors(i[0],i[1]).add(i[0]),c=ra);const u=i[o%r],f=i[(o+1)%r];if(this.closed||o+2<r?h=i[(o+2)%r]:(ra.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=ra),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let p=Math.pow(c.distanceToSquared(u),d),v=Math.pow(u.distanceToSquared(f),d),g=Math.pow(f.distanceToSquared(h),d);v<1e-4&&(v=1),p<1e-4&&(p=v),g<1e-4&&(g=v),Ro.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,p,v,g),ko.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,p,v,g),Co.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,p,v,g)}else this.curveType==="catmullrom"&&(Ro.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),ko.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),Co.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(Ro.calc(l),ko.calc(l),Co.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new D().fromArray(i))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function Xh(s,t,e,n,i){const r=(n-t)*.5,a=(i-e)*.5,o=s*s,l=s*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*s+e}function ay(s,t){const e=1-s;return e*e*t}function oy(s,t){return 2*(1-s)*s*t}function ly(s,t){return s*s*t}function mr(s,t,e,n){return ay(s,t)+oy(s,e)+ly(s,n)}function cy(s,t){const e=1-s;return e*e*e*t}function hy(s,t){const e=1-s;return 3*e*e*s*t}function uy(s,t){return 3*(1-s)*s*s*t}function dy(s,t){return s*s*s*t}function gr(s,t,e,n,i){return cy(s,t)+hy(s,e)+uy(s,n)+dy(s,i)}class od extends In{constructor(t=new vt,e=new vt,n=new vt,i=new vt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new vt){const n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(gr(t,i.x,r.x,a.x,o.x),gr(t,i.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class fy extends In{constructor(t=new D,e=new D,n=new D,i=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=i}getPoint(t,e=new D){const n=e,i=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(gr(t,i.x,r.x,a.x,o.x),gr(t,i.y,r.y,a.y,o.y),gr(t,i.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class ld extends In{constructor(t=new vt,e=new vt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new vt){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new vt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class py extends In{constructor(t=new D,e=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new D){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new D){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class cd extends In{constructor(t=new vt,e=new vt,n=new vt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new vt){const n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(mr(t,i.x,r.x,a.x),mr(t,i.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class my extends In{constructor(t=new D,e=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new D){const n=e,i=this.v0,r=this.v1,a=this.v2;return n.set(mr(t,i.x,r.x,a.x),mr(t,i.y,r.y,a.y),mr(t,i.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class hd extends In{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new vt){const n=e,i=this.points,r=(i.length-1)*t,a=Math.floor(r),o=r-a,l=i[a===0?a:a-1],c=i[a],h=i[a>i.length-2?i.length-1:a+1],u=i[a>i.length-3?i.length-1:a+2];return n.set(Xh(o,l.x,c.x,h.x,u.x),Xh(o,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const i=this.points[e];t.points.push(i.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const i=t.points[e];this.points.push(new vt().fromArray(i))}return this}}var Ll=Object.freeze({__proto__:null,ArcCurve:sy,CatmullRomCurve3:ry,CubicBezierCurve:od,CubicBezierCurve3:fy,EllipseCurve:ac,LineCurve:ld,LineCurve3:py,QuadraticBezierCurve:cd,QuadraticBezierCurve3:my,SplineCurve:hd});class gy extends In{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ll[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const a=i[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,i=this.curves.length;n<i;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const a=r[i],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(i.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const i=this.curves[e];t.curves.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const i=t.curves[e];this.curves.push(new Ll[i.type]().fromJSON(i))}return this}}class Kh extends gy{constructor(t){super(),this.type="Path",this.currentPoint=new vt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new ld(this.currentPoint.clone(),new vt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,i){const r=new cd(this.currentPoint.clone(),new vt(t,e),new vt(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(t,e,n,i,r,a){const o=new od(this.currentPoint.clone(),new vt(t,e),new vt(n,i),new vt(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new hd(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,i,r,a){const o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,n,i,r,a),this}absarc(t,e,n,i,r,a){return this.absellipse(t,e,n,n,i,r,a),this}ellipse(t,e,n,i,r,a,o,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,i,r,a,o,l),this}absellipse(t,e,n,i,r,a,o,l){const c=new ac(t,e,n,i,r,a,o,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class lc extends Te{constructor(t=[new vt(0,-.5),new vt(.5,0),new vt(0,.5)],e=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:i},e=Math.floor(e),i=Le(i,0,Math.PI*2);const r=[],a=[],o=[],l=[],c=[],h=1/e,u=new D,f=new vt,d=new D,p=new D,v=new D;let g=0,m=0;for(let _=0;_<=t.length-1;_++)switch(_){case 0:g=t[_+1].x-t[_].x,m=t[_+1].y-t[_].y,d.x=m*1,d.y=-g,d.z=m*0,v.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case t.length-1:l.push(v.x,v.y,v.z);break;default:g=t[_+1].x-t[_].x,m=t[_+1].y-t[_].y,d.x=m*1,d.y=-g,d.z=m*0,p.copy(d),d.x+=v.x,d.y+=v.y,d.z+=v.z,d.normalize(),l.push(d.x,d.y,d.z),v.copy(p)}for(let _=0;_<=e;_++){const x=n+_*h*i,y=Math.sin(x),R=Math.cos(x);for(let w=0;w<=t.length-1;w++){u.x=t[w].x*y,u.y=t[w].y,u.z=t[w].x*R,a.push(u.x,u.y,u.z),f.x=_/e,f.y=w/(t.length-1),o.push(f.x,f.y);const T=l[3*w+0]*y,E=l[3*w+1],b=l[3*w+0]*R;c.push(T,E,b)}}for(let _=0;_<e;_++)for(let x=0;x<t.length-1;x++){const y=x+_*t.length,R=y,w=y+t.length,T=y+t.length+1,E=y+1;r.push(R,w,E),r.push(T,E,w)}this.setIndex(r),this.setAttribute("position",new ee(a,3)),this.setAttribute("uv",new ee(o,2)),this.setAttribute("normal",new ee(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new lc(t.points,t.segments,t.phiStart,t.phiLength)}}class cc extends Te{constructor(t=1,e=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);const r=[],a=[],o=[],l=[],c=new D,h=new vt;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,f=3;u<=e;u++,f+=3){const d=n+u/e*i;c.x=t*Math.cos(d),c.y=t*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[f]/t+1)/2,h.y=(a[f+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new ee(a,3)),this.setAttribute("normal",new ee(o,3)),this.setAttribute("uv",new ee(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new cc(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class Ie extends Te{constructor(t=1,e=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],f=[],d=[];let p=0;const v=[],g=n/2;let m=0;_(),a===!1&&(t>0&&x(!0),e>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new ee(u,3)),this.setAttribute("normal",new ee(f,3)),this.setAttribute("uv",new ee(d,2));function _(){const y=new D,R=new D;let w=0;const T=(e-t)/n;for(let E=0;E<=r;E++){const b=[],S=E/r,P=S*(e-t)+t;for(let O=0;O<=i;O++){const U=O/i,F=U*l+o,K=Math.sin(F),N=Math.cos(F);R.x=P*K,R.y=-S*n+g,R.z=P*N,u.push(R.x,R.y,R.z),y.set(K,T,N).normalize(),f.push(y.x,y.y,y.z),d.push(U,1-S),b.push(p++)}v.push(b)}for(let E=0;E<i;E++)for(let b=0;b<r;b++){const S=v[b][E],P=v[b+1][E],O=v[b+1][E+1],U=v[b][E+1];(t>0||b!==0)&&(h.push(S,P,U),w+=3),(e>0||b!==r-1)&&(h.push(P,O,U),w+=3)}c.addGroup(m,w,0),m+=w}function x(y){const R=p,w=new vt,T=new D;let E=0;const b=y===!0?t:e,S=y===!0?1:-1;for(let O=1;O<=i;O++)u.push(0,g*S,0),f.push(0,S,0),d.push(.5,.5),p++;const P=p;for(let O=0;O<=i;O++){const F=O/i*l+o,K=Math.cos(F),N=Math.sin(F);T.x=b*N,T.y=g*S,T.z=b*K,u.push(T.x,T.y,T.z),f.push(0,S,0),w.x=K*.5+.5,w.y=N*.5*S+.5,d.push(w.x,w.y),p++}for(let O=0;O<i;O++){const U=R+O,F=P+O;y===!0?h.push(F,F+1,U):h.push(F+1,F,U),E+=3}c.addGroup(m,E,y===!0?1:2),m+=E}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ie(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class hc extends Ie{constructor(t=1,e=1,n=32,i=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,i,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new hc(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class uc extends Te{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};const r=[],a=[];o(i),c(n),h(),this.setAttribute("position",new ee(r,3)),this.setAttribute("normal",new ee(r.slice(),3)),this.setAttribute("uv",new ee(a,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function o(_){const x=new D,y=new D,R=new D;for(let w=0;w<e.length;w+=3)d(e[w+0],x),d(e[w+1],y),d(e[w+2],R),l(x,y,R,_)}function l(_,x,y,R){const w=R+1,T=[];for(let E=0;E<=w;E++){T[E]=[];const b=_.clone().lerp(y,E/w),S=x.clone().lerp(y,E/w),P=w-E;for(let O=0;O<=P;O++)O===0&&E===w?T[E][O]=b:T[E][O]=b.clone().lerp(S,O/P)}for(let E=0;E<w;E++)for(let b=0;b<2*(w-E)-1;b++){const S=Math.floor(b/2);b%2===0?(f(T[E][S+1]),f(T[E+1][S]),f(T[E][S])):(f(T[E][S+1]),f(T[E+1][S+1]),f(T[E+1][S]))}}function c(_){const x=new D;for(let y=0;y<r.length;y+=3)x.x=r[y+0],x.y=r[y+1],x.z=r[y+2],x.normalize().multiplyScalar(_),r[y+0]=x.x,r[y+1]=x.y,r[y+2]=x.z}function h(){const _=new D;for(let x=0;x<r.length;x+=3){_.x=r[x+0],_.y=r[x+1],_.z=r[x+2];const y=g(_)/2/Math.PI+.5,R=m(_)/Math.PI+.5;a.push(y,1-R)}p(),u()}function u(){for(let _=0;_<a.length;_+=6){const x=a[_+0],y=a[_+2],R=a[_+4],w=Math.max(x,y,R),T=Math.min(x,y,R);w>.9&&T<.1&&(x<.2&&(a[_+0]+=1),y<.2&&(a[_+2]+=1),R<.2&&(a[_+4]+=1))}}function f(_){r.push(_.x,_.y,_.z)}function d(_,x){const y=_*3;x.x=t[y+0],x.y=t[y+1],x.z=t[y+2]}function p(){const _=new D,x=new D,y=new D,R=new D,w=new vt,T=new vt,E=new vt;for(let b=0,S=0;b<r.length;b+=9,S+=6){_.set(r[b+0],r[b+1],r[b+2]),x.set(r[b+3],r[b+4],r[b+5]),y.set(r[b+6],r[b+7],r[b+8]),w.set(a[S+0],a[S+1]),T.set(a[S+2],a[S+3]),E.set(a[S+4],a[S+5]),R.copy(_).add(x).add(y).divideScalar(3);const P=g(R);v(w,S+0,_,P),v(T,S+2,x,P),v(E,S+4,y,P)}}function v(_,x,y,R){R<0&&_.x===1&&(a[x]=_.x-1),y.x===0&&y.z===0&&(a[x]=R/2/Math.PI+.5)}function g(_){return Math.atan2(_.z,-_.x)}function m(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new uc(t.vertices,t.indices,t.radius,t.details)}}class ud extends Kh{constructor(t){super(t),this.uuid=Cn(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,i=this.holes.length;n<i;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(i.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const i=this.holes[e];t.holes.push(i.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const i=t.holes[e];this.holes.push(new Kh().fromJSON(i))}return this}}const vy={triangulate:function(s,t,e=2){const n=t&&t.length,i=n?t[0]*e:s.length;let r=dd(s,0,i,e,!0);const a=[];if(!r||r.next===r.prev)return a;let o,l,c,h,u,f,d;if(n&&(r=by(s,t,r,e)),s.length>80*e){o=c=s[0],l=h=s[1];for(let p=e;p<i;p+=e)u=s[p],f=s[p+1],u<o&&(o=u),f<l&&(l=f),u>c&&(c=u),f>h&&(h=f);d=Math.max(c-o,h-l),d=d!==0?32767/d:0}return Mr(r,a,e,o,l,d,0),a}};function dd(s,t,e,n,i){let r,a;if(i===Iy(s,t,e,n)>0)for(r=t;r<e;r+=n)a=Yh(r,s[r],s[r+1],a);else for(r=e-n;r>=t;r-=n)a=Yh(r,s[r],s[r+1],a);return a&&Va(a,a.next)&&(Sr(a),a=a.next),a}function $i(s,t){if(!s)return s;t||(t=s);let e=s,n;do if(n=!1,!e.steiner&&(Va(e,e.next)||_e(e.prev,e,e.next)===0)){if(Sr(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Mr(s,t,e,n,i,r,a){if(!s)return;!a&&r&&Ay(s,n,i,r);let o=s,l,c;for(;s.prev!==s.next;){if(l=s.prev,c=s.next,r?xy(s,n,i,r):yy(s)){t.push(l.i/e|0),t.push(s.i/e|0),t.push(c.i/e|0),Sr(s),s=c.next,o=c.next;continue}if(s=c,s===o){a?a===1?(s=_y($i(s),t,e),Mr(s,t,e,n,i,r,2)):a===2&&My(s,t,e,n,i,r):Mr($i(s),t,e,n,i,r,1);break}}}function yy(s){const t=s.prev,e=s,n=s.next;if(_e(t,e,n)>=0)return!1;const i=t.x,r=e.x,a=n.x,o=t.y,l=e.y,c=n.y,h=i<r?i<a?i:a:r<a?r:a,u=o<l?o<c?o:c:l<c?l:c,f=i>r?i>a?i:a:r>a?r:a,d=o>l?o>c?o:c:l>c?l:c;let p=n.next;for(;p!==t;){if(p.x>=h&&p.x<=f&&p.y>=u&&p.y<=d&&Ts(i,o,r,l,a,c,p.x,p.y)&&_e(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function xy(s,t,e,n){const i=s.prev,r=s,a=s.next;if(_e(i,r,a)>=0)return!1;const o=i.x,l=r.x,c=a.x,h=i.y,u=r.y,f=a.y,d=o<l?o<c?o:c:l<c?l:c,p=h<u?h<f?h:f:u<f?u:f,v=o>l?o>c?o:c:l>c?l:c,g=h>u?h>f?h:f:u>f?u:f,m=Il(d,p,t,e,n),_=Il(v,g,t,e,n);let x=s.prevZ,y=s.nextZ;for(;x&&x.z>=m&&y&&y.z<=_;){if(x.x>=d&&x.x<=v&&x.y>=p&&x.y<=g&&x!==i&&x!==a&&Ts(o,h,l,u,c,f,x.x,x.y)&&_e(x.prev,x,x.next)>=0||(x=x.prevZ,y.x>=d&&y.x<=v&&y.y>=p&&y.y<=g&&y!==i&&y!==a&&Ts(o,h,l,u,c,f,y.x,y.y)&&_e(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;x&&x.z>=m;){if(x.x>=d&&x.x<=v&&x.y>=p&&x.y<=g&&x!==i&&x!==a&&Ts(o,h,l,u,c,f,x.x,x.y)&&_e(x.prev,x,x.next)>=0)return!1;x=x.prevZ}for(;y&&y.z<=_;){if(y.x>=d&&y.x<=v&&y.y>=p&&y.y<=g&&y!==i&&y!==a&&Ts(o,h,l,u,c,f,y.x,y.y)&&_e(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function _y(s,t,e){let n=s;do{const i=n.prev,r=n.next.next;!Va(i,r)&&fd(i,n,n.next,r)&&br(i,r)&&br(r,i)&&(t.push(i.i/e|0),t.push(n.i/e|0),t.push(r.i/e|0),Sr(n),Sr(n.next),n=s=r),n=n.next}while(n!==s);return $i(n)}function My(s,t,e,n,i,r){let a=s;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&Cy(a,o)){let l=pd(a,o);a=$i(a,a.next),l=$i(l,l.next),Mr(a,t,e,n,i,r,0),Mr(l,t,e,n,i,r,0);return}o=o.next}a=a.next}while(a!==s)}function by(s,t,e,n){const i=[];let r,a,o,l,c;for(r=0,a=t.length;r<a;r++)o=t[r]*n,l=r<a-1?t[r+1]*n:s.length,c=dd(s,o,l,n,!1),c===c.next&&(c.steiner=!0),i.push(ky(c));for(i.sort(Sy),r=0;r<i.length;r++)e=Ey(i[r],e);return e}function Sy(s,t){return s.x-t.x}function Ey(s,t){const e=Ty(s,t);if(!e)return t;const n=pd(e,s);return $i(n,n.next),$i(e,e.next)}function Ty(s,t){let e=t,n=-1/0,i;const r=s.x,a=s.y;do{if(a<=e.y&&a>=e.next.y&&e.next.y!==e.y){const f=e.x+(a-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=r&&f>n&&(n=f,i=e.x<e.next.x?e:e.next,f===r))return i}e=e.next}while(e!==t);if(!i)return null;const o=i,l=i.x,c=i.y;let h=1/0,u;e=i;do r>=e.x&&e.x>=l&&r!==e.x&&Ts(a<c?r:n,a,l,c,a<c?n:r,a,e.x,e.y)&&(u=Math.abs(a-e.y)/(r-e.x),br(e,s)&&(u<h||u===h&&(e.x>i.x||e.x===i.x&&wy(i,e)))&&(i=e,h=u)),e=e.next;while(e!==o);return i}function wy(s,t){return _e(s.prev,s,t.prev)<0&&_e(t.next,s,s.next)<0}function Ay(s,t,e,n){let i=s;do i.z===0&&(i.z=Il(i.x,i.y,t,e,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,Ry(i)}function Ry(s){let t,e,n,i,r,a,o,l,c=1;do{for(e=s,s=null,r=null,a=0;e;){for(a++,n=e,o=0,t=0;t<c&&(o++,n=n.nextZ,!!n);t++);for(l=c;o>0||l>0&&n;)o!==0&&(l===0||!n||e.z<=n.z)?(i=e,e=e.nextZ,o--):(i=n,n=n.nextZ,l--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;e=n}r.nextZ=null,c*=2}while(a>1);return s}function Il(s,t,e,n,i){return s=(s-e)*i|0,t=(t-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,s|t<<1}function ky(s){let t=s,e=s;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==s);return e}function Ts(s,t,e,n,i,r,a,o){return(i-a)*(t-o)>=(s-a)*(r-o)&&(s-a)*(n-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(i-a)*(n-o)}function Cy(s,t){return s.next.i!==t.i&&s.prev.i!==t.i&&!Py(s,t)&&(br(s,t)&&br(t,s)&&Ly(s,t)&&(_e(s.prev,s,t.prev)||_e(s,t.prev,t))||Va(s,t)&&_e(s.prev,s,s.next)>0&&_e(t.prev,t,t.next)>0)}function _e(s,t,e){return(t.y-s.y)*(e.x-t.x)-(t.x-s.x)*(e.y-t.y)}function Va(s,t){return s.x===t.x&&s.y===t.y}function fd(s,t,e,n){const i=oa(_e(s,t,e)),r=oa(_e(s,t,n)),a=oa(_e(e,n,s)),o=oa(_e(e,n,t));return!!(i!==r&&a!==o||i===0&&aa(s,e,t)||r===0&&aa(s,n,t)||a===0&&aa(e,s,n)||o===0&&aa(e,t,n))}function aa(s,t,e){return t.x<=Math.max(s.x,e.x)&&t.x>=Math.min(s.x,e.x)&&t.y<=Math.max(s.y,e.y)&&t.y>=Math.min(s.y,e.y)}function oa(s){return s>0?1:s<0?-1:0}function Py(s,t){let e=s;do{if(e.i!==s.i&&e.next.i!==s.i&&e.i!==t.i&&e.next.i!==t.i&&fd(e,e.next,s,t))return!0;e=e.next}while(e!==s);return!1}function br(s,t){return _e(s.prev,s,s.next)<0?_e(s,t,s.next)>=0&&_e(s,s.prev,t)>=0:_e(s,t,s.prev)<0||_e(s,s.next,t)<0}function Ly(s,t){let e=s,n=!1;const i=(s.x+t.x)/2,r=(s.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&i<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==s);return n}function pd(s,t){const e=new Dl(s.i,s.x,s.y),n=new Dl(t.i,t.x,t.y),i=s.next,r=t.prev;return s.next=t,t.prev=s,e.next=i,i.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Yh(s,t,e,n){const i=new Dl(s,t,e);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Sr(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Dl(s,t,e){this.i=s,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function Iy(s,t,e,n){let i=0;for(let r=t,a=e-n;r<e;r+=n)i+=(s[a]-s[r])*(s[r+1]+s[a+1]),a=r;return i}class vr{static area(t){const e=t.length;let n=0;for(let i=e-1,r=0;r<e;i=r++)n+=t[i].x*t[r].y-t[r].x*t[i].y;return n*.5}static isClockWise(t){return vr.area(t)<0}static triangulateShape(t,e){const n=[],i=[],r=[];$h(t),qh(n,t);let a=t.length;e.forEach($h);for(let l=0;l<e.length;l++)i.push(a),a+=e[l].length,qh(n,e[l]);const o=vy.triangulate(n,i);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}}function $h(s){const t=s.length;t>2&&s[t-1].equals(s[0])&&s.pop()}function qh(s,t){for(let e=0;e<t.length;e++)s.push(t[e].x),s.push(t[e].y)}class dc extends Te{constructor(t=new ud([new vt(.5,.5),new vt(-.5,.5),new vt(-.5,-.5),new vt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,i=[],r=[];for(let o=0,l=t.length;o<l;o++){const c=t[o];a(c)}this.setAttribute("position",new ee(i,3)),this.setAttribute("uv",new ee(r,2)),this.computeVertexNormals();function a(o){const l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1;let f=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,p=e.bevelSize!==void 0?e.bevelSize:d-.1,v=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3;const m=e.extrudePath,_=e.UVGenerator!==void 0?e.UVGenerator:Dy;let x,y=!1,R,w,T,E;m&&(x=m.getSpacedPoints(h),y=!0,f=!1,R=m.computeFrenetFrames(h,!1),w=new D,T=new D,E=new D),f||(g=0,d=0,p=0,v=0);const b=o.extractPoints(c);let S=b.shape;const P=b.holes;if(!vr.isClockWise(S)){S=S.reverse();for(let Q=0,j=P.length;Q<j;Q++){const L=P[Q];vr.isClockWise(L)&&(P[Q]=L.reverse())}}const U=vr.triangulateShape(S,P),F=S;for(let Q=0,j=P.length;Q<j;Q++){const L=P[Q];S=S.concat(L)}function K(Q,j,L){return j||console.error("THREE.ExtrudeGeometry: vec does not exist"),Q.clone().addScaledVector(j,L)}const N=S.length,Y=U.length;function H(Q,j,L){let ft,nt,xt;const gt=Q.x-j.x,zt=Q.y-j.y,pt=L.x-Q.x,C=L.y-Q.y,A=gt*gt+zt*zt,I=gt*C-zt*pt;if(Math.abs(I)>Number.EPSILON){const z=Math.sqrt(A),X=Math.sqrt(pt*pt+C*C),$=j.x-zt/z,ut=j.y+gt/z,at=L.x-C/X,rt=L.y+pt/X,It=((at-$)*C-(rt-ut)*pt)/(gt*C-zt*pt);ft=$+gt*It-Q.x,nt=ut+zt*It-Q.y;const it=ft*ft+nt*nt;if(it<=2)return new vt(ft,nt);xt=Math.sqrt(it/2)}else{let z=!1;gt>Number.EPSILON?pt>Number.EPSILON&&(z=!0):gt<-Number.EPSILON?pt<-Number.EPSILON&&(z=!0):Math.sign(zt)===Math.sign(C)&&(z=!0),z?(ft=-zt,nt=gt,xt=Math.sqrt(A)):(ft=gt,nt=zt,xt=Math.sqrt(A/2))}return new vt(ft/xt,nt/xt)}const J=[];for(let Q=0,j=F.length,L=j-1,ft=Q+1;Q<j;Q++,L++,ft++)L===j&&(L=0),ft===j&&(ft=0),J[Q]=H(F[Q],F[L],F[ft]);const st=[];let lt,ht=J.concat();for(let Q=0,j=P.length;Q<j;Q++){const L=P[Q];lt=[];for(let ft=0,nt=L.length,xt=nt-1,gt=ft+1;ft<nt;ft++,xt++,gt++)xt===nt&&(xt=0),gt===nt&&(gt=0),lt[ft]=H(L[ft],L[xt],L[gt]);st.push(lt),ht=ht.concat(lt)}for(let Q=0;Q<g;Q++){const j=Q/g,L=d*Math.cos(j*Math.PI/2),ft=p*Math.sin(j*Math.PI/2)+v;for(let nt=0,xt=F.length;nt<xt;nt++){const gt=K(F[nt],J[nt],ft);ot(gt.x,gt.y,-L)}for(let nt=0,xt=P.length;nt<xt;nt++){const gt=P[nt];lt=st[nt];for(let zt=0,pt=gt.length;zt<pt;zt++){const C=K(gt[zt],lt[zt],ft);ot(C.x,C.y,-L)}}}const St=p+v;for(let Q=0;Q<N;Q++){const j=f?K(S[Q],ht[Q],St):S[Q];y?(T.copy(R.normals[0]).multiplyScalar(j.x),w.copy(R.binormals[0]).multiplyScalar(j.y),E.copy(x[0]).add(T).add(w),ot(E.x,E.y,E.z)):ot(j.x,j.y,0)}for(let Q=1;Q<=h;Q++)for(let j=0;j<N;j++){const L=f?K(S[j],ht[j],St):S[j];y?(T.copy(R.normals[Q]).multiplyScalar(L.x),w.copy(R.binormals[Q]).multiplyScalar(L.y),E.copy(x[Q]).add(T).add(w),ot(E.x,E.y,E.z)):ot(L.x,L.y,u/h*Q)}for(let Q=g-1;Q>=0;Q--){const j=Q/g,L=d*Math.cos(j*Math.PI/2),ft=p*Math.sin(j*Math.PI/2)+v;for(let nt=0,xt=F.length;nt<xt;nt++){const gt=K(F[nt],J[nt],ft);ot(gt.x,gt.y,u+L)}for(let nt=0,xt=P.length;nt<xt;nt++){const gt=P[nt];lt=st[nt];for(let zt=0,pt=gt.length;zt<pt;zt++){const C=K(gt[zt],lt[zt],ft);y?ot(C.x,C.y+x[h-1].y,x[h-1].x+L):ot(C.x,C.y,u+L)}}}W(),et();function W(){const Q=i.length/3;if(f){let j=0,L=N*j;for(let ft=0;ft<Y;ft++){const nt=U[ft];_t(nt[2]+L,nt[1]+L,nt[0]+L)}j=h+g*2,L=N*j;for(let ft=0;ft<Y;ft++){const nt=U[ft];_t(nt[0]+L,nt[1]+L,nt[2]+L)}}else{for(let j=0;j<Y;j++){const L=U[j];_t(L[2],L[1],L[0])}for(let j=0;j<Y;j++){const L=U[j];_t(L[0]+N*h,L[1]+N*h,L[2]+N*h)}}n.addGroup(Q,i.length/3-Q,0)}function et(){const Q=i.length/3;let j=0;yt(F,j),j+=F.length;for(let L=0,ft=P.length;L<ft;L++){const nt=P[L];yt(nt,j),j+=nt.length}n.addGroup(Q,i.length/3-Q,1)}function yt(Q,j){let L=Q.length;for(;--L>=0;){const ft=L;let nt=L-1;nt<0&&(nt=Q.length-1);for(let xt=0,gt=h+g*2;xt<gt;xt++){const zt=N*xt,pt=N*(xt+1),C=j+ft+zt,A=j+nt+zt,I=j+nt+pt,z=j+ft+pt;wt(C,A,I,z)}}}function ot(Q,j,L){l.push(Q),l.push(j),l.push(L)}function _t(Q,j,L){At(Q),At(j),At(L);const ft=i.length/3,nt=_.generateTopUV(n,i,ft-3,ft-2,ft-1);Gt(nt[0]),Gt(nt[1]),Gt(nt[2])}function wt(Q,j,L,ft){At(Q),At(j),At(ft),At(j),At(L),At(ft);const nt=i.length/3,xt=_.generateSideWallUV(n,i,nt-6,nt-3,nt-2,nt-1);Gt(xt[0]),Gt(xt[1]),Gt(xt[3]),Gt(xt[1]),Gt(xt[2]),Gt(xt[3])}function At(Q){i.push(l[Q*3+0]),i.push(l[Q*3+1]),i.push(l[Q*3+2])}function Gt(Q){r.push(Q.x),r.push(Q.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Ny(e,n,t)}static fromJSON(t,e){const n=[];for(let r=0,a=t.shapes.length;r<a;r++){const o=e[t.shapes[r]];n.push(o)}const i=t.options.extrudePath;return i!==void 0&&(t.options.extrudePath=new Ll[i.type]().fromJSON(i)),new dc(n,t.options)}}const Dy={generateTopUV:function(s,t,e,n,i){const r=t[e*3],a=t[e*3+1],o=t[n*3],l=t[n*3+1],c=t[i*3],h=t[i*3+1];return[new vt(r,a),new vt(o,l),new vt(c,h)]},generateSideWallUV:function(s,t,e,n,i,r){const a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],f=t[i*3],d=t[i*3+1],p=t[i*3+2],v=t[r*3],g=t[r*3+1],m=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new vt(a,1-l),new vt(c,1-u),new vt(f,1-p),new vt(v,1-m)]:[new vt(o,1-l),new vt(h,1-u),new vt(d,1-p),new vt(g,1-m)]}};function Ny(s,t,e){if(e.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){const r=s[n];e.shapes.push(r.uuid)}else e.shapes.push(s.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class Pa extends uc{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Pa(t.radius,t.detail)}}class Sn extends Te{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new D,f=new D,d=[],p=[],v=[],g=[];for(let m=0;m<=n;m++){const _=[],x=m/n;let y=0;m===0&&a===0?y=.5/e:m===n&&l===Math.PI&&(y=-.5/e);for(let R=0;R<=e;R++){const w=R/e;u.x=-t*Math.cos(i+w*r)*Math.sin(a+x*o),u.y=t*Math.cos(a+x*o),u.z=t*Math.sin(i+w*r)*Math.sin(a+x*o),p.push(u.x,u.y,u.z),f.copy(u).normalize(),v.push(f.x,f.y,f.z),g.push(w+y,1-x),_.push(c++)}h.push(_)}for(let m=0;m<n;m++)for(let _=0;_<e;_++){const x=h[m][_+1],y=h[m][_],R=h[m+1][_],w=h[m+1][_+1];(m!==0||a>0)&&d.push(x,y,w),(m!==n-1||l<Math.PI)&&d.push(y,R,w)}this.setIndex(d),this.setAttribute("position",new ee(p,3)),this.setAttribute("normal",new ee(v,3)),this.setAttribute("uv",new ee(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Sn(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class fc extends Te{constructor(t=1,e=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const a=[],o=[],l=[],c=[],h=new D,u=new D,f=new D;for(let d=0;d<=n;d++)for(let p=0;p<=i;p++){const v=p/i*r,g=d/n*Math.PI*2;u.x=(t+e*Math.cos(g))*Math.cos(v),u.y=(t+e*Math.cos(g))*Math.sin(v),u.z=e*Math.sin(g),o.push(u.x,u.y,u.z),h.x=t*Math.cos(v),h.y=t*Math.sin(v),f.subVectors(u,h).normalize(),l.push(f.x,f.y,f.z),c.push(p/i),c.push(d/n)}for(let d=1;d<=n;d++)for(let p=1;p<=i;p++){const v=(i+1)*d+p-1,g=(i+1)*(d-1)+p-1,m=(i+1)*(d-1)+p,_=(i+1)*d+p;a.push(v,g,_),a.push(g,m,_)}this.setIndex(a),this.setAttribute("position",new ee(o,3)),this.setAttribute("normal",new ee(l,3)),this.setAttribute("uv",new ee(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new fc(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class ue extends Ti{static get type(){return"MeshStandardMaterial"}constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Vt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ql,this.normalScale=new vt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class pc extends ue{static get type(){return"MeshPhysicalMaterial"}constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new vt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Le(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Vt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Vt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Vt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class Oy extends Ti{static get type(){return"MeshLambertMaterial"}constructor(t){super(),this.isMeshLambertMaterial=!0,this.color=new Vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ql,this.normalScale=new vt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.combine=Xl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class mc extends Se{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Vt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Uy extends mc{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Vt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const Po=new Yt,Zh=new D,jh=new D;class md{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new vt(512,512),this.map=null,this.mapPass=null,this.matrix=new Yt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new nc,this._frameExtents=new vt(1,1),this._viewportCount=1,this._viewports=[new ae(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Zh.setFromMatrixPosition(t.matrixWorld),e.position.copy(Zh),jh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(jh),e.updateMatrixWorld(),Po.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Po),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Po)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Jh=new Yt,er=new D,Lo=new D;class Fy extends md{constructor(){super(new an(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new vt(4,2),this._viewportCount=6,this._viewports=[new ae(2,1,1,1),new ae(0,1,1,1),new ae(3,1,1,1),new ae(1,1,1,1),new ae(3,0,1,1),new ae(1,0,1,1)],this._cubeDirections=[new D(1,0,0),new D(-1,0,0),new D(0,0,1),new D(0,0,-1),new D(0,1,0),new D(0,-1,0)],this._cubeUps=[new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,1,0),new D(0,0,1),new D(0,0,-1)]}updateMatrices(t,e=0){const n=this.camera,i=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),er.setFromMatrixPosition(t.matrixWorld),n.position.copy(er),Lo.copy(n.position),Lo.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(Lo),n.updateMatrixWorld(),i.makeTranslation(-er.x,-er.y,-er.z),Jh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Jh)}}class zy extends mc{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Fy}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class By extends md{constructor(){super(new qu(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Qh extends mc{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Se.DEFAULT_UP),this.updateMatrix(),this.target=new Se,this.shadow=new By}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}const tu=new Yt;class Hy{constructor(t,e,n=0,i=1/0){this.ray=new Ba(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new tc,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return tu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(tu),this}intersectObject(t,e=!0,n=[]){return Nl(t,this,n,e),n.sort(eu),n}intersectObjects(t,e=!0,n=[]){for(let i=0,r=t.length;i<r;i++)Nl(t[i],this,n,e);return n.sort(eu),n}}function eu(s,t){return s.distance-t.distance}function Nl(s,t,e,n){let i=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let a=0,o=r.length;a<o;a++)Nl(r[a],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Wl}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Wl);class Gy extends ed{constructor(){super();const t=new ve;t.deleteAttribute("uv");const e=new ue({side:Xe}),n=new ue,i=new zy(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);const r=new Dt(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const a=new Dt(t,n);a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),this.add(a);const o=new Dt(t,n);o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),this.add(o);const l=new Dt(t,n);l.position.set(6.167,.857,7.803),l.rotation.set(0,.561,0),l.scale.set(3.927,6.285,3.687),this.add(l);const c=new Dt(t,n);c.position.set(-2.017,.018,6.124),c.rotation.set(0,.333,0),c.scale.set(2.002,4.566,2.064),this.add(c);const h=new Dt(t,n);h.position.set(2.291,-.756,-2.621),h.rotation.set(0,-.286,0),h.scale.set(1.546,1.552,1.496),this.add(h);const u=new Dt(t,n);u.position.set(-2.193,-.369,-5.547),u.rotation.set(0,.516,0),u.scale.set(3.875,3.487,2.986),this.add(u);const f=new Dt(t,ys(50));f.position.set(-16.116,14.37,8.208),f.scale.set(.1,2.428,2.739),this.add(f);const d=new Dt(t,ys(50));d.position.set(-16.109,18.021,-8.207),d.scale.set(.1,2.425,2.751),this.add(d);const p=new Dt(t,ys(17));p.position.set(14.904,12.198,-1.832),p.scale.set(.15,4.265,6.331),this.add(p);const v=new Dt(t,ys(43));v.position.set(-.462,8.89,14.52),v.scale.set(4.38,5.441,.088),this.add(v);const g=new Dt(t,ys(20));g.position.set(3.235,11.486,-12.541),g.scale.set(2.5,2,.1),this.add(g);const m=new Dt(t,ys(100));m.position.set(0,20,0),m.scale.set(1,.1,1),this.add(m)}dispose(){const t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(const e of t)e.dispose()}}function ys(s){const t=new xi;return t.color.setScalar(s),t}function Vy(s){const t=new je,e=new $n({side:Xe,depthWrite:!1,fog:!1,uniforms:{top:{value:new Vt(132363)},mid:{value:new Vt(726566)},hor:{value:new Vt(2763322)}},vertexShader:"varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 hor; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = h > 0.12 ? mix(mid, top, smoothstep(0.12, 0.7, h)) : mix(hor, mid, smoothstep(-0.05, 0.12, h));
      gl_FragColor = vec4(c, 1.0); }`}),n=new Dt(new Sn(480,32,16),e);n.renderOrder=-10,t.add(n);const i=s==="dusuk"?500:1800,r=new Float32Array(i*3),a=new Float32Array(i*3);let o=31;const l=()=>(o=o*16807%2147483647)/2147483647;for(let u=0;u<i;u++){const f=l()*Math.PI*2,d=Math.acos(.15+.85*l());r[u*3]=Math.sin(d)*Math.cos(f)*460,r[u*3+1]=Math.cos(d)*460,r[u*3+2]=Math.sin(d)*Math.sin(f)*460;const p=.4+l()*.6;a[u*3]=p,a[u*3+1]=p,a[u*3+2]=p*(.9+l()*.2)}const c=new Te;c.setAttribute("position",new Oe(r,3)),c.setAttribute("color",new Oe(a,3));const h=new iy(c,new ad({size:1.4,sizeAttenuation:!1,vertexColors:!0,fog:!1,depthWrite:!1,transparent:!0,opacity:.9}));return t.add(h),t}class Wy{constructor(t,e){this.canvas=t,this.quality=e,this.renderer=new jv({canvas:t,antialias:e!=="dusuk",powerPreference:"high-performance"}),this.renderer.outputColorSpace=Ge,this.renderer.toneMapping=Ru,this.renderer.toneMappingExposure=1.05,this.renderer.autoClear=!1,this.scene=new ed,this.scene.fog=new sc(726048,180,520);const n=new kl(this.renderer);this.scene.environment=n.fromScene(new Gy,.04).texture,this.scene.environmentIntensity=.32,n.dispose(),this.scene.add(Vy(e)),this.hemi=new Uy(13162751,1911320,.55),this.scene.add(this.hemi),this.sun=new Qh(16774370,2.6),this.sun.position.set(-50,75,-45),this.scene.add(this.sun,this.sun.target),this.fills=[[50,70,45,1.1],[55,65,-50,.75],[-55,65,50,.75]].map(([i,r,a,o])=>{const l=new Qh(15265535,o);return l.position.set(i,r,a),this.scene.add(l),l}),this.applyQuality(e),this.resize(),window.addEventListener("resize",()=>this.resize())}applyQuality(t){this.quality=t;const e=window.devicePixelRatio||1;this.pixelRatio=t==="yuksek"?Math.min(e,2):t==="orta"?Math.min(e,1.4):Math.min(e,1)*.85,this.renderer.setPixelRatio(this.pixelRatio);const n=t!=="dusuk";if(this.renderer.shadowMap.enabled=n,this.renderer.shadowMap.autoUpdate=!1,this.renderer.shadowMap.type=Au,this.sun.castShadow=n,n){const i=this.sun.shadow.camera;i.left=-66,i.right=66,i.top=46,i.bottom=-46,i.near=20,i.far=220;const r=t==="yuksek"?4096:2048;this.sun.shadow.map&&this.sun.shadow.mapSize.x!==r&&(this.sun.shadow.map.dispose(),this.sun.shadow.map=null),this.sun.shadow.mapSize.set(r,r),this.sun.shadow.bias=-25e-5,this.sun.shadow.normalBias=.02,i.updateProjectionMatrix()}this.resize()}resize(){this.w=window.innerWidth,this.h=window.innerHeight,this.renderer.setSize(this.w,this.h,!1),this.canvas.style.width=this.w+"px",this.canvas.style.height=this.h+"px"}clear(){this.renderer.setScissorTest(!1),this.renderer.setViewport(0,0,this.w,this.h),this.renderer.setClearColor(329740),this.renderer.clear(),this.renderer.shadowMap.needsUpdate=!0}renderView(t,e){const n=this.renderer,i=Math.round(e.x),r=Math.round(this.h-e.y-e.h),a=Math.round(e.w),o=Math.round(e.h);a<2||o<2||(n.setScissorTest(!0),n.setScissor(i,r,a,o),n.setViewport(i,r,a,o),n.setClearColor(329740),n.clear(),n.render(this.scene,t))}}const Ol=30,te=1/Ol,bt={W:68,HL:52.5,HW:34,LINE:.12,BOX_D:16.5,BOX_HW:20.16,GA_D:5.5,GA_HW:9.16,GOAL_HW:3.66,GOAL_H:2.44,POST_R:.06,SPOT:11,CIRCLE_R:9.15},mi=bt.HL-bt.BOX_D,pe=.11,rn=22,ur=23,Ea=24,Ls=25,dr=10,Xy=4,Io=Ls*dr+Xy,dt={HIDDEN:-1,LOCO:0,KICK:1,LUNGE:2,SLIDE:3,FALL:4,DOWN:5,PUSH:6,CARD:7,DIVE:8,GETUP:9,CELEB:10,FLAG:11,POINT:12},Pn={POINT_R:1,PROTEST:2,OUT:3},Wt=(s,t,e,n,i,r,a,o,l=60)=>({id:s,name:t,short:e,city:n,kit:{shirt:i,shorts:r,socks:a,gk:o},str:l}),gi=[{id:"amator",name:"Bölgesel Amatör Lig",teams:[Wt("ova","Ovacık Gençlik","OVA","Ovacık","#2e7d32","#ffffff","#2e7d32","#ff9800",40),Wt("bag","Bağlarbaşı Gücü","BAĞ","Bağlarbaşı","#6a1b9a","#212121","#6a1b9a","#cddc39",38),Wt("pin","Pınarhisar Yolspor","PIN","Pınarhisar","#f9a825","#1a237e","#f9a825","#00bcd4",41),Wt("koy","Köprüköy Dostluk","KÖP","Köprüköy","#c62828","#c62828","#ffffff","#4caf50",39),Wt("yay","Yaylalar Birlik","YAY","Yaylalar","#0277bd","#ffffff","#0277bd","#ffeb3b",37),Wt("cay","Çayırova Kıvılcım","ÇAY","Çayırova","#ef6c00","#000000","#ef6c00","#9c27b0",40)]},{id:"lig3",name:"3. Lig",teams:[Wt("nig","Niğde Kalespor","NKS","Niğde","#455a64","#ffffff","#455a64","#ff5722",48),Wt("kir","Kırşehir Bozkurtları","KBZ","Kırşehir","#8d6e63","#3e2723","#8d6e63","#00e676",47),Wt("bil","Bilecik Lalesi","BLL","Bilecik","#e91e63","#ffffff","#e91e63","#3f51b5",46),Wt("ama","Amasya Elmaspor","AES","Amasya","#d32f2f","#ffeb3b","#d32f2f","#03a9f4",49),Wt("yoz","Yozgat Çamlık SK","YÇS","Yozgat","#1b5e20","#a5d6a7","#1b5e20","#ff9800",45),Wt("art","Artvin Çoruh Gücü","AÇG","Artvin","#00838f","#ffffff","#00838f","#ffc107",48)]},{id:"lig2",name:"2. Lig",teams:[Wt("usa","Uşak Halıcılar","UHL","Uşak","#283593","#ffffff","#283593","#ff7043",55),Wt("ksk","Kastamonu Ormanspor","KOS","Kastamonu","#2e7d32","#1b5e20","#ffffff","#ffeb3b",54),Wt("afy","Afyon Kaymaklılar","AKY","Afyon","#fafafa","#c62828","#fafafa","#673ab7",56),Wt("tok","Tokat Bezcileri","TBZ","Tokat","#6d4c41","#ffffff","#6d4c41","#00bcd4",53),Wt("bur","Burdur Göl Yıldızı","BGY","Burdur","#039be5","#01579b","#039be5","#ff5252",55),Wt("cor","Çorum Leblebispor","ÇLS","Çorum","#fdd835","#d84315","#fdd835","#2196f3",54)]},{id:"lig1",name:"1. Lig",teams:[Wt("erz","Erzurum Dadaş Gücü","EDG","Erzurum","#0d47a1","#ffffff","#0d47a1","#ff9100",62),Wt("sam","Samsun Karadeniz FK","SKF","Samsun","#e53935","#ffffff","#e53935","#00c853",63),Wt("man","Manisa Mesir SK","MMS","Manisa","#000000","#ffffff","#000000","#ffd600",61),Wt("mal","Malatya Kayısıspor","MKS","Malatya","#ffb300","#5d4037","#ffb300","#00b0ff",62),Wt("eld","Edirne Selimiye FK","ESF","Edirne","#7b1fa2","#ffffff","#7b1fa2","#76ff03",60),Wt("den","Denizli Horozları","DHZ","Denizli","#1b5e20","#000000","#1b5e20","#ff4081",61)]},{id:"super",name:"Süper Lig",teams:[Wt("anb","Ankara Bozkır SK","ABZ","Ankara","#1565c0","#ffd600","#1565c0","#ff6d00",72),Wt("izk","İzmir Körfez Yıldızları","İKY","İzmir","#00acc1","#ffffff","#00acc1","#ff1744",71),Wt("bsa","Bursa Uludağ Gücü","BUG","Bursa","#2e7d32","#ffffff","#2e7d32","#ffab00",70),Wt("kon","Konya Ova Kartalları","KOK","Konya","#fafafa","#2e7d32","#2e7d32","#651fff",69),Wt("ant","Antalya Güneşspor","AGS","Antalya","#d50000","#ffffff","#d50000","#00e5ff",70),Wt("trb","Trabzon Dalgakıran","TDK","Trabzon","#880e4f","#4fc3f7","#880e4f","#ffea00",72),Wt("gaz","Gaziantep Kale FK","GKF","Gaziantep","#212121","#e53935","#212121","#00e676",68),Wt("esk","Eskişehir Lületaşı","ELT","Eskişehir","#f57c00","#000000","#f57c00","#2979ff",68)]},{id:"derbi",name:"Derbi Maçları",teams:[]},{id:"avrupa",name:"Avrupa Kupası",teams:[Wt("nor","Nordhafen SV","NOR","Nordhafen","#b71c1c","#ffffff","#b71c1c","#00e676",80),Wt("mon","Real Montaval","RMV","Montaval","#ffffff","#1a237e","#ffffff","#ff6d00",82),Wt("kov","Dinamo Kovrin","DKV","Kovrin","#0d47a1","#0d47a1","#ffffff","#ffd600",78),Wt("ver","AC Verrano","ACV","Verrano","#000000","#000000","#e53935","#76ff03",81),Wt("cal","Sporting Calheta","SCA","Calheta","#2e7d32","#ffffff","#2e7d32","#ff4081",79),Wt("lun","Lundmark FF","LFF","Lundmark","#ffd600","#1565c0","#ffd600","#d500f9",77)]},{id:"final",name:"Turnuva Finali",teams:[]}],gd=[{name:"Boğaz Derbisi",a:Wt("hal","Haliç Yelkenlileri","HYK","İstanbul","#f9a825","#0d47a1","#f9a825","#00e676",76),b:Wt("usk","Üsküdar Martıları","ÜSM","İstanbul","#ffffff","#000000","#000000","#ff3d00",76)},{name:"Ege Derbisi",a:Wt("kor","Kordon Rüzgârı","KRZ","İzmir","#00897b","#ffffff","#00897b","#ffab00",72),b:Wt("bor","Bornova Zeytinliler","BZY","İzmir","#558b2f","#000000","#558b2f","#e040fb",72)},{name:"Başkent Derbisi",a:Wt("ulu","Ulus Kalesi FK","UKF","Ankara","#c62828","#000000","#c62828","#00e5ff",71),b:Wt("cny","Çankaya Gençlerbirliği Ankara","ÇGA","Ankara","#1a237e","#fafafa","#1a237e","#ffea00",70)},{name:"Karadeniz Derbisi",a:Wt("ris","Rize Çay Gücü","RÇG","Rize","#2e7d32","#1565c0","#2e7d32","#ff9100",70),b:Wt("ord","Ordu Fındık SK","OFS","Ordu","#6a1b9a","#ffffff","#6a1b9a","#c6ff00",69)}],nu=[Wt("ist","İstanbul Boğaziçi FK","İBF","İstanbul","#ffffff","#c62828","#c62828","#00e676",86),Wt("lon","Albion Rovers Kingsbury","ARK","Kingsbury","#1565c0","#ffffff","#1565c0","#ffd600",85)],La={amator:["Belediye Çim Sahası","Köy Meydanı Stadı","İlçe Spor Kompleksi"],lig3:["Şehir Stadı","Gençlik Parkı Stadı","Atatürk Şehir Stadı"],lig2:["Yeni Şehir Stadı","Kent Arena","Vadi Stadyumu"],lig1:["Büyükşehir Arena","Liman Stadyumu","Ova Park"],super:["Anadolu Arena","Körfez Park","Kartal Yuvası Stadyumu","Güneş Arena"],derbi:["Boğaz Arena","Ege Park Stadyumu","Başkent Arena"],avrupa:["Arena Europa","Stade du Nord","Parkstadion"],final:["Final Arena — Ulusal Stadyum"]};function vd(s,t){const e={...s.kit},n={...t.kit};return Ky(e.shirt,n.shirt)<120&&(n.shirt=Er(e.shirt)>.5?"#263238":"#f5f5f5",n.shorts=Er(e.shirt)>.5?"#263238":"#f5f5f5",n.socks=n.shirt),[e,n]}function Ul(s){const t=parseInt(s.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function Ky(s,t){const e=Ul(s),n=Ul(t);return Math.hypot(e[0]-n[0],e[1]-n[1],e[2]-n[2])}function Er(s){const[t,e,n]=Ul(s);return(.299*t+.587*e+.114*n)/255}function fn(s){let t=2166136261;for(let e=0;e<s.length;e++)t^=s.charCodeAt(e),t=Math.imul(t,16777619);return t>>>0}class Ve{constructor(t=1){this.s=t>>>0||1}next(){let t=this.s=this.s+1831565813>>>0;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}range(t,e){return t+(e-t)*this.next()}int(t,e){return Math.floor(this.range(t,e+1))}chance(t){return this.next()<t}sign(){return this.next()<.5?-1:1}pick(t){return t[Math.floor(this.next()*t.length)]}gauss(t=0,e=1){const n=Math.max(1e-9,this.next()),i=this.next();return t+e*Math.sqrt(-2*Math.log(n))*Math.cos(2*Math.PI*i)}shuffle(t){for(let e=t.length-1;e>0;e--){const n=Math.floor(this.next()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}weighted(t){let e=0;for(const i of t)e+=i.w;let n=this.next()*e;for(const i of t)if((n-=i.w)<=0)return i.v;return t[t.length-1].v}fork(t){return new Ve(fn(String(this.s)+":"+t))}}const r1=new Ve((Date.now()^1540483477)>>>0),iu=["duz","dikey","yatay","yarim","kusak","ince","omuz","v"];function _i(s,t){const e=document.createElement("canvas");return e.width=s,e.height=t,[e,e.getContext("2d")]}function Mi(s,t=!0){const e=new Ga(s);return t&&(e.colorSpace=Ge),e.anisotropy=8,e}function Mn(s,t){const e=new Vt(s);return t>0?e.lerp(new Vt(1,1,1),t):e.multiplyScalar(1+t),"#"+e.getHexString()}function gc(s){return Er(s)>.55?"#141414":"#ffffff"}function Ia(s,t){const e=fn(s||"x"),n=t.pattern||iu[e%iu.length];let i=t.second||t.shorts;return Math.abs(Er(i)-Er(t.shirt))<.12&&(i=gc(t.shirt)),{pattern:n,second:i}}function Yy(s,t,e,n,i,r,a){s.save(),s.translate(t,e),s.beginPath(),s.moveTo(-n,-n),s.lineTo(n,-n),s.lineTo(n,n*.2),s.quadraticCurveTo(n*.9,n*.9,0,n*1.25),s.quadraticCurveTo(-n*.9,n*.9,-n,n*.2),s.closePath(),s.fillStyle=r,s.fill(),s.lineWidth=n*.16,s.strokeStyle=Mn(i,-.35),s.stroke(),s.beginPath(),s.arc(0,-n*.05,n*.55,0,Math.PI*2),s.fillStyle=i,s.fill(),s.fillStyle=gc(i),s.font=`bold ${Math.round(n*.55)}px Arial, sans-serif`,s.textAlign="center",s.textBaseline="middle",s.fillText(a.slice(0,2),0,-n*.03),s.restore()}function $y(s){const{shirt:t,second:e,pattern:n,num:i,name:r,crest:a,hi:o,collar:l,official:c}=s,h=o?1024:512,u=h/2,[f,d]=_i(h,u),p=u*.85;d.fillStyle=t,d.fillRect(0,0,h,u),d.save(),d.beginPath(),d.rect(0,0,h,p),d.clip(),d.fillStyle=e;const v=h/24;if(n==="dikey")for(let w=0;w<h;w+=v*2)d.fillRect(w,0,v,p);else if(n==="ince"){d.globalAlpha=.55;for(let w=0;w<h;w+=v)d.fillRect(w,0,v*.18,p);d.globalAlpha=1}else if(n==="yatay")for(let w=p*.22;w<p;w+=p*.16)d.fillRect(0,w,h,p*.08);else if(n==="yarim")d.fillRect(h*.5,0,h*.5,p);else if(n==="kusak")for(const w of[h*.25,h*.75])d.save(),d.translate(w,p*.5),d.rotate(-.55),d.fillRect(-h*.3,-p*.09,h*.6,p*.18),d.restore();else if(n==="omuz")d.fillRect(0,0,h,p*.2);else if(n==="v")for(const w of[h*.25,h*.75])d.beginPath(),d.moveTo(w-h*.22,0),d.lineTo(w,p*.42),d.lineTo(w+h*.22,0),d.lineTo(w+h*.16,0),d.lineTo(w,p*.3),d.lineTo(w-h*.16,0),d.fill();d.globalAlpha=.22,d.fillStyle="#000";for(const w of[0,h*.5,h])d.fillRect(w-h*.035,0,h*.07,p);d.globalAlpha=1;const g=d.getImageData(0,0,h,u),m=g.data;let _=1234;for(let w=0;w<m.length;w+=4){_=_*1103515245+12345&2147483647;const T=w/4%h,E=Math.floor(w/4/h),b=((T+E)%4<2?4:-4)+(_>>8)%9-4;m[w]+=b,m[w+1]+=b,m[w+2]+=b}d.putImageData(g,0,0),d.restore();const x=l||e;d.fillStyle=x,d.fillRect(0,0,h,p*.035),d.beginPath(),d.moveTo(h*.2,0),d.lineTo(h*.25,p*.11),d.lineTo(h*.3,0),d.closePath(),d.fill(),d.fillStyle=t,d.beginPath(),d.moveTo(h*.215,0),d.lineTo(h*.25,p*.08),d.lineTo(h*.285,0),d.closePath(),d.fill(),d.fillStyle=Mn(x,-.1),d.fillRect(0,p-p*.025,h,p*.025);const y=gc(n==="dikey"||n==="yatay"?Mn(t,-.2):t),R=y==="#ffffff"?"rgba(0,0,0,0.55)":"rgba(255,255,255,0.6)";if(i){if(d.textAlign="center",d.textBaseline="middle",d.font=`900 ${Math.round(p*.42)}px Arial Black, Arial, sans-serif`,d.lineWidth=h*.008,d.strokeStyle=R,d.fillStyle=y,d.strokeText(String(i),h*.75,p*.52),d.fillText(String(i),h*.75,p*.52),r){d.font=`bold ${Math.round(p*.075)}px Arial, sans-serif`;const w=r.split(" ").slice(-1)[0].toLocaleUpperCase("tr-TR");d.lineWidth=h*.004,d.strokeText(w,h*.75,p*.19),d.fillText(w,h*.75,p*.19)}d.font=`bold ${Math.round(p*.12)}px Arial, sans-serif`,d.lineWidth=h*.004,d.strokeText(String(i),h*.18,p*.36),d.fillText(String(i),h*.18,p*.36)}return a&&Yy(d,h*.335,p*.3,p*.06,a.c1,a.c2,a.txt),c&&(d.fillStyle="#111",d.fillRect(h*.31,p*.24,h*.05,p*.1),d.fillStyle="#ffd400",d.font=`bold ${Math.round(p*.035)}px Arial`,d.textAlign="center",d.fillText("HAKEM",h*.335,p*.3)),d.fillStyle=t,d.fillRect(0,u*.87,h,u*.13),d.fillStyle=x,d.fillRect(0,u*.965,h,u*.035),Mi(f)}function qy(s){const t=s==="yuksek"?4096:s==="orta"?2048:1024,e=t/2,[n,i]=_i(t,e),r=t/117,a=e/80,o=E=>(E+58.5)*r,l=E=>(E+40)*a;i.fillStyle="#2b6a26",i.fillRect(0,0,t,e);const c=18,h=105/c*r;for(let E=-3;E<c+3;E++)i.fillStyle=E%2===0?"#357d2f":"#2b6a27",i.fillRect(o(-52.5)+E*h,0,h+1,e);i.globalAlpha=.035;for(let E=0;E<12;E++)i.fillStyle=E%2?"#ffffff":"#000000",i.fillRect(0,l(-34)+E*(68/12)*a,t,68/12*a);i.globalAlpha=1;const u=(E,b,S,P,O)=>{const U=i.createRadialGradient(o(E),l(b),0,o(E),l(b),Math.max(S,P)*r);U.addColorStop(0,`rgba(120,105,60,${O})`),U.addColorStop(1,"rgba(120,105,60,0)"),i.save(),i.translate(o(E),l(b)),i.scale(1,P/S),i.translate(-o(E),-l(b)),i.fillStyle=U,i.fillRect(o(E)-S*r,l(b)-S*r,S*2*r,S*2*r),i.restore()};for(const E of[1,-1])u(E*50.5,0,4.5,3,.55),u(E*41.5,0,2,2,.35),u(E*47,0,6,5,.25);u(0,0,3,3,.25),i.globalAlpha=.25,i.fillStyle="#6f7d3a",i.fillRect(o(0),l(33.2),o(52)-o(0),a*1.2),i.fillRect(o(-52),l(-34.3),o(0)-o(-52),a*1.2),i.globalAlpha=1;const f=i.getImageData(0,0,t,e),d=f.data;let p=777;for(let E=0;E<d.length;E+=4){p=p*1103515245+12345&2147483647;const b=(p>>10)%23-11;d[E]+=b*.5,d[E+1]+=b,d[E+2]+=b*.35}i.putImageData(f,0,0);const v=Mi(n),g=256,[m,_]=_i(g,g),x=_.createImageData(g,g),y=x.data;let R=99;const w=new Float32Array(g*g);for(let E=0;E<g*g;E++)R=R*1103515245+12345&2147483647,w[E]=(R>>8)/8388608;for(let E=0;E<2600;E++){R=R*1103515245+12345&2147483647;const b=R%g,S=(R>>9)%g,P=2+(R>>3)%6;for(let O=0;O<P;O++)w[(S+O)%g*g+b]=1}for(let E=0;E<g*g;E++){const b=90+w[E]*140;y[E*4]=b,y[E*4+1]=b,y[E*4+2]=b,y[E*4+3]=255}_.putImageData(x,0,0);const T=Mi(m,!1);return T.wrapS=T.wrapT=Xi,T.repeat.set(117*1.6,80*1.6),{color:v,detail:T}}function su(s,t="#04101a"){const[e,n]=_i(2048,64);n.fillStyle=t,n.fillRect(0,0,2048,64);let i=20,r=0;for(;i<2048;){const[o,l]=s[r++%s.length];n.fillStyle=l,n.font="bold 40px Arial, sans-serif",n.textBaseline="middle",n.fillText(o,i,34),i+=n.measureText(o).width+50,n.fillStyle="#22d36b",n.fillRect(i-32,26,14,14),i+=10}n.fillStyle="rgba(0,0,0,0.35)";for(let o=0;o<64;o+=4)n.fillRect(0,o,2048,1);for(let o=0;o<2048;o+=4)n.fillRect(o,0,1,64);const a=Mi(e);return a.wrapS=Xi,a}function Zy(){const[s,t]=_i(256,512);t.fillStyle="#0a0f16",t.fillRect(0,0,256,512);let e=5;for(let i=8;i<512;i+=16)for(let r=6;r<256;r+=14){e=e*1103515245+12345&2147483647;const a=(e>>8)%100;a<38&&(t.fillStyle=a<8?"#9fc8ff":a<20?"#ffd88a":"#f5e6b8",t.globalAlpha=.5+a%10/20,t.fillRect(r,i,8,9))}t.globalAlpha=1;const n=Mi(s);return n.wrapS=n.wrapT=Xi,n}function jy(){const[s,t]=_i(128,128),e=t.createRadialGradient(64,64,0,64,64,64);return e.addColorStop(0,"rgba(255,255,240,1)"),e.addColorStop(.18,"rgba(255,250,225,0.65)"),e.addColorStop(.5,"rgba(255,240,200,0.12)"),e.addColorStop(1,"rgba(255,240,200,0)"),t.fillStyle=e,t.fillRect(0,0,128,128),Mi(s)}function Jy(){const[s,t]=_i(64,64);t.clearRect(0,0,64,64),t.strokeStyle="rgba(255,255,255,1)",t.lineWidth=6,t.beginPath(),t.moveTo(0,16),t.lineTo(16,0),t.lineTo(48,0),t.lineTo(64,16),t.moveTo(0,48),t.lineTo(16,64),t.lineTo(48,64),t.lineTo(64,48),t.moveTo(16,0),t.lineTo(16,64),t.moveTo(48,0),t.lineTo(48,64),t.moveTo(0,16),t.lineTo(0,48),t.moveTo(64,16),t.lineTo(64,48),t.stroke();const e=Mi(s);return e.wrapS=e.wrapT=Xi,e}function Qy(){const[s,t]=_i(1024,512);return{c:s,g:t,t:Mi(s)}}function wn(s,t,e,n,i,r){s.push(t,r,n,e,r,i,e,r,n,t,r,n,t,r,i,e,r,i)}function nr(s,t,e,n,i,r,a,o,l,c){for(let h=0;h<o;h++){const u=r+(a-r)*h/o,f=r+(a-r)*(h+1)/o,d=(_,x)=>[t+Math.cos(x)*_,e+Math.sin(x)*_],p=d(n,u),v=d(i,u),g=d(i,f),m=d(n,f);c&&(!c(p[0],p[1])||!c(g[0],g[1]))||s.push(p[0],l,p[1],g[0],l,g[1],v[0],l,v[1],p[0],l,p[1],m[0],l,m[1],g[0],l,g[1])}}function tx(s){const t=new je,{color:e,detail:n}=qy(s),i=new ue({map:e,roughness:.93,metalness:0,bumpMap:s==="dusuk"?null:n,bumpScale:1.6,roughnessMap:s==="dusuk"?null:n});s!=="dusuk"&&(i.onBeforeCompile=_=>{_.fragmentShader=_.fragmentShader.replace("#include <map_fragment>",`#include <map_fragment>
        #ifdef USE_BUMPMAP
          float gd = texture2D(bumpMap, vBumpMapUv).r;
          diffuseColor.rgb *= 0.8 + 0.42 * gd;
        #endif`)});const r=new Dt(new Je(117,80),i);r.rotation.x=-Math.PI/2,r.receiveShadow=!0,t.add(r);const a=new Dt(new Je(150,112),new ue({color:2046492,roughness:.95}));a.rotation.x=-Math.PI/2,a.position.y=-.02,a.receiveShadow=!0,t.add(a);const o=bt.LINE,l=bt.HL,c=bt.HW,h=.006,u=[];wn(u,-l,l,c-o,c,h),wn(u,-l,l,-c,-c+o,h);for(const _ of[1,-1]){wn(u,_>0?l-o:-l,_>0?l:-l+o,-c,c,h);const x=_*(l-bt.BOX_D);wn(u,_>0?x:x-o,_>0?x+o:x,-20.16,bt.BOX_HW,h);const y=_>0?[x,l]:[-l,x];wn(u,y[0],y[1],bt.BOX_HW-o,bt.BOX_HW,h),wn(u,y[0],y[1],-20.16,-20.16+o,h);const R=_*(l-bt.GA_D);wn(u,_>0?R:R-o,_>0?R+o:R,-9.16,bt.GA_HW,h);const w=_>0?[R,l]:[-l,R];wn(u,w[0],w[1],bt.GA_HW-o,bt.GA_HW,h),wn(u,w[0],w[1],-9.16,-9.16+o,h);const T=_*(l-bt.SPOT);nr(u,T,0,0,.11,0,Math.PI*2,16,h),nr(u,T,0,bt.CIRCLE_R-o,bt.CIRCLE_R,0,Math.PI*2,128,h,E=>_>0?E<x:E>x);for(const E of[1,-1]){const b=E>0?_>0?Math.PI:1.5*Math.PI:_>0?Math.PI/2:0;nr(u,_*l,E*c,1-o,1,b,b+Math.PI/2,14,h)}}wn(u,-o/2,o/2,-c,c,h),nr(u,0,0,bt.CIRCLE_R-o,bt.CIRCLE_R,0,Math.PI*2,160,h),nr(u,0,0,0,.11,0,Math.PI*2,16,h);const f=new Te;f.setAttribute("position",new ee(u,3)),f.computeVertexNormals();const d=new Dt(f,new ue({color:16185074,roughness:.75,emissive:1118481,side:Re,polygonOffset:!0,polygonOffsetFactor:-2}));d.receiveShadow=!0,t.add(d);const p=Jy();for(const _ of[1,-1])t.add(ex(_,s,p));const v=(()=>{const _=document.createElement("canvas");_.width=8,_.height=64;const x=_.getContext("2d");for(let R=0;R<8;R++)x.fillStyle=R%2?"#ff3d00":"#ffffff",x.fillRect(0,R*8,8,8);const y=new Ga(_);return y.colorSpace=Ge,y})(),g=new ue({map:v,roughness:.5}),m=new ue({color:16764928,side:Re,roughness:.8});for(const _ of[1,-1])for(const x of[1,-1]){const y=new Dt(new Ie(.018,.022,1.5,8),g);y.position.set(_*l,.75,x*c),y.castShadow=s==="yuksek";const R=new Je(.42,.3,6,2),w=R.attributes.position;for(let E=0;E<w.count;E++)w.setZ(E,Math.sin((w.getX(E)+.21)*9)*.03*(w.getX(E)+.21)*3);R.computeVertexNormals(),R.translate(.21,0,0);const T=new Dt(R,m);T.position.set(_*l,1.33,x*c),T.rotation.y=Math.atan2(-x,-_)+Math.PI/2,t.add(y,T)}return t}function Do(s,t,e,n,i,r,a,o,l,c){const h=new Je(1,1,i,r),u=h.attributes.position,f=h.attributes.uv,d=new D(...s),p=new D(...t),v=new D(...e),g=new D(...n),m=new D().crossVectors(new D().subVectors(p,d),new D().subVectors(g,d)).normalize(),_=new D;for(let x=0;x<u.count;x++){const y=f.getX(x),R=f.getY(x);_.copy(d).multiplyScalar((1-y)*(1-R)).addScaledVector(p,y*(1-R)).addScaledVector(v,y*R).addScaledVector(g,(1-y)*R),_.addScaledVector(m,Math.sin(y*Math.PI)*Math.sin(R*Math.PI)*a),u.setXYZ(x,_.x,_.y,_.z),f.setXY(x,y*l,R*c)}return h.computeVertexNormals(),new Dt(h,o)}function ex(s,t,e){const n=new je,i=new pc({color:16777215,roughness:.25,metalness:.05,clearcoat:t==="yuksek"?.8:0}),r=new ue({color:3817285,roughness:.5,metalness:.6}),a=bt.POST_R,o=bt.GOAL_HW+a,l=bt.GOAL_H+a,c=s*(bt.HL-a);for(const y of[1,-1]){const R=new Dt(new Ie(a,a,l,20),i);R.position.set(c,l/2,y*o),R.castShadow=!0,n.add(R)}const h=new Dt(new Ie(a,a,o*2+a*2,20),i);h.rotation.x=Math.PI/2,h.position.set(c,bt.GOAL_H+a,0),h.castShadow=!0,n.add(h);const u=new ue({map:e,transparent:!0,alphaTest:.12,side:Re,roughness:.9,color:15790320}),f=s*bt.HL,d=s*(bt.HL+1),p=s*(bt.HL+2.2),v=bt.GOAL_H,g=-o,m=o,_=t==="dusuk"?4:10;n.add(Do([f,v,g],[f,v,m],[d,v,m],[d,v,g],_,2,-.08,u,o*2/.14,1/.14)),n.add(Do([d,v,g],[d,v,m],[p,0,m],[p,0,g],_,_,.18*s,u,o*2/.14,2.6/.14));for(const y of[1,-1]){const R=y*o;n.add(Do([f,0,R],[p,0,R],[d,v,R],[f,v,R],_,_,.1*y,u,2.2/.14,v/.14))}const x=(y,R,w)=>{const T=new D(...y),E=new D(...R),b=new Dt(new Ie(w,w,T.distanceTo(E),8),r);b.position.addVectors(T,E).multiplyScalar(.5),b.quaternion.setFromUnitVectors(new D(0,1,0),new D().subVectors(E,T).normalize()),n.add(b)};for(const y of[1,-1])x([f,v,y*o],[d,v,y*o],.025),x([d,v,y*o],[p,0,y*o],.025),x([f,.02,y*o],[p,.02,y*o],.02);return x([d,v,-o],[d,v,o],.025),x([p,.02,-o],[p,.02,o],.02),n}function Tr(s,t=!1){const e=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,l=new Te;let c=0;for(let h=0;h<s.length;++h){const u=s[h];let f=0;if(e!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in u.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(u.attributes[d]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in u.morphAttributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[d]===void 0&&(a[d]=[]),a[d].push(u.morphAttributes[d])}if(t){let d;if(e)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,h),c+=d}}if(e){let h=0;const u=[];for(let f=0;f<s.length;++f){const d=s[f].index;for(let p=0;p<d.count;++p)u.push(d.getX(p)+h);h+=s[f].attributes.position.count}l.setIndex(u)}for(const h in r){const u=ru(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in a){const u=a[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let f=0;f<u;++f){const d=[];for(let v=0;v<a[h].length;++v)d.push(a[h][v][f]);const p=ru(d);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(p)}}return l}function ru(s){let t,e,n,i=-1,r=0;for(let c=0;c<s.length;++c){const h=s[c];if(t===void 0&&(t=h.array.constructor),t!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(e===void 0&&(e=h.itemSize),e!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*e}const a=new t(r),o=new Oe(a,e,n);let l=0;for(let c=0;c<s.length;++c){const h=s[c];if(h.isInterleavedBufferAttribute){const u=l/e;for(let f=0,d=h.count;f<d;f++)for(let p=0;p<e;p++){const v=h.getComponent(f,p);o.setComponent(f+u,p,v)}}else a.set(h.array,l);l+=h.count*e}return i!==void 0&&(o.gpuType=i),o}function Di(s,t,e){const n=s.index?s.toNonIndexed():s,i=n.attributes.position.count;return n.setAttribute("aPart",new ee(new Float32Array(i).fill(t),1)),n.setAttribute("aArm",new ee(new Float32Array(i).fill(e),1)),n.attributes.uv&&n.deleteAttribute("uv"),n}function nx(s){const t=s?6:4,e=[],n=new Ie(.17,.15,.52,t,1,!s);if(n.scale(1,1,.65),n.translate(0,.98,0),e.push(Di(n,0,0)),s){const r=new Sn(.17,t,2,0,Math.PI*2,0,Math.PI/2);r.scale(1,.45,.65),r.translate(0,1.24,0),e.push(Di(r,0,0))}const i=new Sn(.1,t,s?4:3);if(i.scale(.9,1.08,.95),i.translate(0,1.43,0),e.push(Di(i,1,0)),s){const r=new Sn(.104,t,2,0,Math.PI*2,0,Math.PI*.45);r.scale(.92,1.05,.97),r.translate(0,1.445,.006),e.push(Di(r,2,0))}for(const r of[-1,1]){const a=new Ie(.05,.042,.56,s?5:3,1,!0);if(a.translate(r*.215,.95,0),e.push(Di(a,0,r)),s){const l=new Sn(.045,4,2);l.translate(r*.215,.65,0),e.push(Di(l,1,r))}const o=new Ie(.075,.06,.74,s?5:3,1,!0);o.translate(r*.085,.37,0),e.push(Di(o,2,0))}return Tr(e)}function ix(){const s={uTime:{value:0},uJump:{value:0}},t=new Oy({color:16777215});return t.onBeforeCompile=e=>{e.uniforms.uTime=s.uTime,e.uniforms.uJump=s.uJump,e.vertexShader=`uniform float uTime; uniform float uJump; attribute float aPart; attribute float aArm;
`+e.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        float ph = float(gl_InstanceID) * 1.731;
        float hh = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
        float ex = uJump * step(0.25, hh);
        if (abs(aArm) > 0.5) {
          float ang = ex * (2.3 + 0.5 * sin(uTime * 9.0 + ph)) + 0.06 * sin(uTime * 1.7 + ph);
          vec2 v = transformed.xy - vec2(aArm * 0.215, 1.22);
          float c = cos(ang * aArm), s = sin(ang * aArm);
          transformed.xy = vec2(aArm * 0.215, 1.22) + vec2(v.x * c - v.y * s, v.x * s + v.y * c);
        }
        transformed.y += max(0.0, sin(uTime * 7.5 + ph)) * ex * 0.32 + sin(uTime * 1.2 + ph) * 0.015;`).replace("#include <color_vertex>",`#include <color_vertex>
        #ifdef USE_INSTANCING_COLOR
          float hc = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
          vec3 skinC = mix(vec3(0.92, 0.7, 0.53), vec3(0.32, 0.2, 0.12), hc * hc);
          vec3 hairC = mix(vec3(0.05, 0.04, 0.03), vec3(0.45, 0.32, 0.18), fract(hc * 5.1));
          vec3 pantC = mix(vec3(0.06, 0.08, 0.14), vec3(0.28, 0.28, 0.3), fract(hc * 7.3));
          vColor = aPart < 0.5 ? instanceColor.rgb : (aPart < 1.5 ? skinC : (abs(position.y - 1.45) < 0.2 ? hairC : pantC));
        #endif`)},t.userData.uniforms=s,t}const Ta=.85,hi=.42,au=.6;function No(s){let t=s;return()=>(t=t*16807%2147483647)/2147483647}function sx(s,t,e,n){const i=new ud;i.moveTo(0,0),i.lineTo(0,t+e),i.lineTo(.25,t+e),i.lineTo(.25,t);for(let a=0;a<s;a++){const o=t+a*hi;i.lineTo(.25+a*Ta,o+hi),i.lineTo(.25+(a+1)*Ta,o+hi)}const r=.25+s*Ta;return i.lineTo(r,t+s*hi+1.6),i.lineTo(r+.4,t+s*hi+1.6),i.lineTo(r+.4,0),i.lineTo(0,0),new dc(i,{depth:n,bevelEnabled:!1,steps:1})}function rx(s,t,e){const n=new je,i=No(4242),r=new ue({color:7041144,roughness:.92,metalness:0,side:Re}),a=new ue({color:3883080,roughness:.9,side:Re}),o=new ue({color:12107976,roughness:.35,metalness:.8}),l=new ue({color:11061472,roughness:.15,metalness:.1,transparent:!0,opacity:.22,side:Re,depthWrite:!1}),c=new ue({color:2764856,roughness:.7,metalness:.3,side:Re}),h=new ue({color:1119256,roughness:.5}),u=t.kit||t,f=e.kit||e,d=Ia(t.id,u),p=Ia(e.id,f),v=new Yt,g=new Vt,m=new qi,_=new D(1,1,1),x=new D,y=new D(0,1,0),R=new D,w=[{axis:"x",sign:-1,front:44,len:118,rows:18,h0:.2,wall:1.2,name:"anaAlt"},{axis:"x",sign:-1,front:56,len:118,rows:18,h0:10.8,wall:1.1,name:"anaUst"},{axis:"x",sign:1,front:44,len:118,rows:18,h0:.2,wall:1.2,name:"karsiAlt"},{axis:"x",sign:1,front:56,len:118,rows:18,h0:10.8,wall:1.1,name:"karsiUst"},{axis:"z",sign:1,front:64,len:72,rows:24,h0:.2,wall:1.2,name:"evKale"},{axis:"z",sign:-1,front:64,len:72,rows:24,h0:.2,wall:1.2,name:"deplasmanKale"}],T=(I,z,X,$)=>I.axis==="x"?[$,X,I.sign*(I.front+z)]:[I.sign*(I.front+z),X,$];for(const I of w){const z=sx(I.rows,I.h0,I.wall,I.len),X=new Yt;I.axis==="x"?X.set(0,0,1,-I.len/2,0,1,0,0,I.sign,0,0,I.sign*I.front,0,0,0,1):X.set(I.sign,0,0,I.sign*I.front,0,1,0,0,0,0,1,-I.len/2,0,0,0,1),z.applyMatrix4(X),z.computeVertexNormals();const $=new Dt(z,I.h0>5?a:r);$.receiveShadow=s==="yuksek",n.add($)}for(const I of[-1,1])for(const z of[-1,1]){const X=new Dt(new ve(12,9,12),r);X.position.set(I*65,4.5,z*50),X.rotation.y=Math.PI/4,n.add(X)}const E=s==="yuksek"?.72:s==="orta"?.42:.2,b=nx(s==="yuksek"),S=ix(),P=(()=>{const I=new ve(.46,.06,.4);I.translate(0,.42,.05);const z=new ve(.46,.42,.05);return z.translate(0,.65,.24),Tr([I,z])})(),O=new ue({color:16777215,roughness:.6}),U=[],F=["#2b2f36","#dcdcdc","#465260","#7a6a5a","#1e3d59","#5a2a2a","#9e9e9e","#14324a"],K={anaAlt:u.shirt,anaUst:Mn(u.shirt,-.4),karsiAlt:"#5b6470",karsiUst:Mn(u.shirt,-.25),evKale:d.second,deplasmanKale:"#5b6470"};for(const I of w){const z=Math.floor(I.len/au),X=[],$=[],ut=I.axis==="x"?I.sign>0?0:Math.PI:I.sign>0?Math.PI/2:-Math.PI/2;for(let rt=0;rt<I.rows;rt++)for(let It=0;It<z;It++){const it=-I.len/2+(It+.5)*au,Et=T(I,.25+rt*Ta+.3,I.h0+(rt+1)*hi,it);$.push(Et),i()<E&&X.push([Et,rt,it])}if(s==="yuksek"){const rt=new vs(P,O,$.length),It=new Vt(K[I.name]||"#566");m.setFromAxisAngle(y,ut),$.forEach((it,Et)=>{v.compose(x.set(it[0],it[1]-hi,it[2]),m,_.set(1,1,1)),rt.setMatrixAt(Et,v),rt.setColorAt(Et,g.copy(It).multiplyScalar(.85+i()*.2))}),rt.computeBoundingSphere(),n.add(rt)}if(!X.length)continue;const at=new vs(b,S,X.length);X.forEach(([rt,It,it],Et)=>{m.setFromAxisAngle(y,ut+(i()-.5)*.5);const Nt=.9+i()*.18;v.compose(x.set(rt[0]+(i()-.5)*.12,rt[1]-hi+.02,rt[2]),m,_.set(Nt,Nt,Nt)),at.setMatrixAt(Et,v);let Ht;if(I.name==="evKale")Ht=It%4<2?u.shirt:d.second;else if(I.name==="deplasmanKale")Ht=it>0?i()<.8?f.shirt:p.second:i()<.55?u.shirt:F[i()*F.length|0];else{const kt=i();Ht=kt<.58?u.shirt:kt<.68?d.second:kt<.74?f.shirt:F[i()*F.length|0]}at.setColorAt(Et,g.set(Ht).multiplyScalar(.75+i()*.3))}),at.computeBoundingSphere(),n.add(at),U.push(at)}const N=su([["VAR ODASI","#ffffff"],["REKLAMSIZ FUTBOL","#22d36b"],["FAIR PLAY","#ffd400"],["HAKEME SAYGI","#4fc3f7"]]),Y=su([["ADİL OYUN","#ffffff"],["İNTERNETSİZ","#22d36b"],["KURGUSAL LİG","#ff9100"],["SAYGI","#ffffff"]],"#0a0414"),H=[],J=(I,z,X,$,ut)=>{const at=ut.clone();at.needsUpdate=!0,at.repeat.set(X/30,1);const rt=new ue({map:at,emissiveMap:at,emissive:16777215,emissiveIntensity:1.1,roughness:.4}),It=new Dt(new ve(X,.9,.16),[h,h,h,h,rt,rt]);It.position.set(I,.45,z),It.rotation.y=$,n.add(It),H.push(at)};J(-27,-38.6,52,0,N),J(27,-38.6,52,0,Y),J(0,38.6,110,Math.PI,Y),J(-58,-20,28,Math.PI/2,N),J(-58,20,28,Math.PI/2,Y),J(58,-20,28,-Math.PI/2,Y),J(58,20,28,-Math.PI/2,N);const st=[],lt=[],ht=[{axis:"x",sign:-1,front:46,back:76,len:124,y0:29,y1:34},{axis:"x",sign:1,front:46,back:76,len:124,y0:29,y1:34},{axis:"z",sign:1,front:63,back:88,len:78,y0:25,y1:29},{axis:"z",sign:-1,front:63,back:88,len:78,y0:25,y1:29}];for(const I of ht){const z=I.back-I.front,X=(ut,at,rt)=>I.axis==="x"?new D(rt,at,I.sign*(I.front+ut)):new D(I.sign*(I.front+ut),at,rt),$=Math.atan2(I.y1-I.y0,z);for(const[ut,at,rt]of[[0,z*.45,l],[z*.45,z,c]]){const It=X(ut,I.y0+(I.y1-I.y0)*ut/z+.6,0),it=X(at,I.y0+(I.y1-I.y0)*at/z+.6,0),Et=It.distanceTo(it),Nt=new Dt(new ve(I.axis==="x"?I.len:Et,.12,I.axis==="x"?Et:I.len),rt);Nt.position.addVectors(It,it).multiplyScalar(.5),I.axis==="x"?Nt.rotation.x=-I.sign*$:Nt.rotation.z=I.sign*$,n.add(Nt)}for(let ut=-I.len/2;ut<=I.len/2+.01;ut+=8){for(let rt=0;rt<6;rt++){const It=z*rt/6,it=z*(rt+1)/6,Et=I.y0+(I.y1-I.y0)*It/z,Nt=I.y0+(I.y1-I.y0)*it/z,Ht=Et-2.4*(1-rt/6)-.8,kt=Nt-2.4*(1-(rt+1)/6)-.8;st.push([X(It,Et,ut),X(it,Nt,ut),.11]),st.push([X(It,Ht,ut),X(it,kt,ut),.09]),st.push([X(It,Ht,ut),X(it,Nt,ut),.06]),st.push([X(it,kt,ut),X(it,Nt,ut),.06])}st.push([X(z,0,ut),X(z,I.y1,ut),.28])}st.push([X(0,I.y0-.2,-I.len/2),X(0,I.y0-.2,I.len/2),.35]);for(let ut=-I.len/2+2;ut<=I.len/2-2;ut+=3.2)lt.push(X(-.3,I.y0-.9,ut))}for(const I of[-1,1])for(const z of[-1,1]){st.push([new D(I*70,0,z*56),new D(I*70,42,z*56),.55]);for(let X=0;X<4;X++)for(let $=0;$<4;$++)lt.push(new D(I*(70-1.5+$),40+X*1.2,z*54.8))}const St=new vs(new Ie(1,1,1,s==="dusuk"?5:8,1),o,st.length);st.forEach(([I,z,X],$)=>{R.subVectors(z,I);const ut=R.length();R.normalize(),m.setFromUnitVectors(y,R),v.compose(x.addVectors(I,z).multiplyScalar(.5),m,_.set(X,ut,X)),St.setMatrixAt($,v)}),St.computeBoundingSphere(),n.add(St);const W=new vs(new ve(.9,.7,.05),new ue({color:16777215,emissive:16774877,emissiveIntensity:3.2}),lt.length),et=new vs(new ve(.98,.78,.42),o,lt.length),yt=new Se,ot=[];lt.forEach((I,z)=>{yt.position.copy(I),yt.rotation.set(0,0,0),yt.lookAt(0,-4,0),yt.updateMatrix(),W.setMatrixAt(z,yt.matrix),yt.translateZ(-.24),yt.updateMatrix(),et.setMatrixAt(z,yt.matrix),z%2===0&&ot.push(I)}),W.computeBoundingSphere(),et.computeBoundingSphere(),n.add(W,et);const _t=new nd({map:jy(),color:16774102,transparent:!0,blending:Aa,depthWrite:!1,fog:!1});for(const I of ot){const z=new Qv(_t);z.position.copy(I),z.scale.set(5.5,5.5,1),z.renderOrder=5,n.add(z)}if(s==="yuksek"){const I=new xi({color:16773576,transparent:!0,opacity:.03,blending:Aa,depthWrite:!1,side:Re,fog:!1});for(const z of[-1,1])for(const X of[-1,1]){const $=new D(z*69,41,X*55),ut=new D(z*22,0,X*12),at=new Dt(new Ie(1.2,22,$.distanceTo(ut),24,1,!0),I);R.subVectors($,ut).normalize(),at.quaternion.setFromUnitVectors(y,R),at.position.addVectors($,ut).multiplyScalar(.5),n.add(at)}}const wt=[];for(const[I,z]of[[0,-1],[1,1]]){const X=I===0?u:f,$=z*10,ut=new Dt(new ve(9,.5,1.2),a);ut.position.set($,.25,-41.4),n.add(ut);const at=new Dt(new Ie(1.7,1.7,9.4,18,1,!0,0,Math.PI),l);at.rotation.z=Math.PI/2,at.position.set($,.4,-41.4),n.add(at);for(const rt of[-4.7,4.7]){const It=new Dt(new fc(1.7,.05,6,18,Math.PI),o);It.rotation.y=Math.PI/2,It.position.set($+rt,.4,-41.4),n.add(It)}for(let rt=0;rt<7;rt++)wt.push([$-3.6+rt*1.2,.05,-41.6,0,.8,rt<6?X.shirt:"#1a1a1a"]);wt.push([$+z*2,0,-36.9,z*.4,1,"#151515"]),wt.push([$-z*3,0,-37.3,-z*.3,.98,"#26323e"])}const At=No(77);for(const I of[-1,1])for(let z=0;z<6;z++){const X=(z<3?-1:1)*(6+z%3*5+At()*2);wt.push([I*55.4,-.5,X,I>0?-Math.PI/2:Math.PI/2,.72,"#ff9100"])}const Gt=new Dt(new ve(84,.25,2.2),o);Gt.position.set(0,18.7,-55.2),n.add(Gt);const Q=new Dt(new ve(84,.06,.06),o);Q.position.set(0,19.8,-54.15),n.add(Q);const j=new ue({color:1711394,roughness:.4,metalness:.6}),L=new ue({color:657930,roughness:.15,metalness:.9});for(const I of[-30,-12,8,26]){const z=new Dt(new ve(.5,.45,.9),j);z.position.set(I,19.6,-55),n.add(z);const X=new Dt(new Ie(.14,.16,.6,12),L);X.rotation.x=Math.PI/2,X.position.set(I,19.65,-54.3),n.add(X),wt.push([I-.7,18.83,-55.6,0,1,"#2d2d2d"])}{const I=new vs(b,S,wt.length);wt.forEach(([z,X,$,ut,at,rt],It)=>{m.setFromAxisAngle(y,Math.PI+ut),v.compose(x.set(z,X,$),m,_.set(at,at,at)),I.setMatrixAt(It,v),I.setColorAt(It,g.set(rt))}),I.computeBoundingSphere(),n.add(I)}const ft=Qy(),nt=new ue({map:ft.t,emissiveMap:ft.t,emissive:16777215,emissiveIntensity:1.25,roughness:.3}),xt=new Dt(new Je(19,9.5),nt);xt.position.set(-70,22,0),xt.rotation.y=Math.PI/2;const gt=new Dt(new ve(.8,10.6,20.2),h);gt.position.set(-70.5,22,0);for(const I of[-7,7]){const z=new Dt(new ve(.6,17,.6),o);z.position.set(-70.8,8.5,I),n.add(z)}n.add(xt,gt);const zt=new Dt(new cc(420,48),new ue({color:857104,roughness:1}));zt.rotation.x=-Math.PI/2,zt.position.y=-.05,n.add(zt);const pt=Zy(),C=[],A=No(9);for(let I=0;I<80;I++){const z=I/80*Math.PI*2+A()*.05,X=150+A()*120,$=12+A()*22,ut=12+A()*18,at=14+A()*A()*90,rt=new ve($,at,ut),It=rt.attributes.uv;for(let it=0;it<It.count;it++)It.setXY(it,It.getX(it)*$/8,It.getY(it)*at/10);rt.rotateY(-z),rt.translate(Math.cos(z)*X,at/2,Math.sin(z)*X),C.push(rt)}return n.add(new Dt(Tr(C),new ue({color:725014,roughness:.9,emissive:16777215,emissiveMap:pt,emissiveIntensity:.55,map:pt}))),{group:n,crowds:U,crowdMat:S,boards:H,scoreboard:ft,update(I){for(const z of H)z.offset.x=I*.035%1}}}const Qt=(s,t,e)=>s<t?t:s>e?e:s,$e=(s,t,e)=>s+(t-s)*e,yr=s=>(s=Qt(s,0,1),s*s*(3-2*s)),yd=s=>1-(1-s)*(1-s),ax=s=>s*s;function vc(s){for(;s>Math.PI;)s-=2*Math.PI;for(;s<-Math.PI;)s+=2*Math.PI;return s}function ox(s,t,e){return s+vc(t-s)*e}function wa(s,t,e){const n=vc(t-s);return s+Qt(n,-e,e)}function xd(s,t){const e=Math.floor(s);return t===1&&e>=45?`45+${e-44}'`:t===2&&e>=90?`90+${e-89}'`:`${e+1}'`}function _d(s=new Date){return`${s.getFullYear()}-${String(s.getMonth()+1).padStart(2,"0")}-${String(s.getDate()).padStart(2,"0")}`}const mt={PELVIS:0,NECK:1,HEAD:2,SHL:3,SHR:4,ELL:5,ELR:6,HANDL:7,HANDR:8,HIPL:9,HIPR:10,KNEEL:11,KNEER:12,ANKL:13,ANKR:14,TOEL:15,TOER:16},ws=17,Fl=.46,zl=.46,Ni=.075,Bl=.1,la=.5,ou=.19,Oo=.29,Uo=.27,zs=.21,be=[{name:"Kafa",cat:"kafa",kind:"sphere",a:mt.HEAD,r:.11},{name:"Gövde",cat:"govde",kind:"torso"},{name:"Kalça",cat:"govde",kind:"pelvis"},{name:"Sol üst kol",cat:"kol",kind:"cyl",a:mt.SHL,b:mt.ELL,r:.055},{name:"Sağ üst kol",cat:"kol",kind:"cyl",a:mt.SHR,b:mt.ELR,r:.055},{name:"Sol ön kol",cat:"kol",kind:"cyl",a:mt.ELL,b:mt.HANDL,r:.045},{name:"Sağ ön kol",cat:"kol",kind:"cyl",a:mt.ELR,b:mt.HANDR,r:.045},{name:"Sol el",cat:"kol",kind:"sphere",a:mt.HANDL,r:.05},{name:"Sağ el",cat:"kol",kind:"sphere",a:mt.HANDR,r:.05},{name:"Sol uyluk",cat:"bacak",kind:"cyl",a:mt.HIPL,b:mt.KNEEL,r:.085},{name:"Sağ uyluk",cat:"bacak",kind:"cyl",a:mt.HIPR,b:mt.KNEER,r:.085},{name:"Sol baldır",cat:"bacak",kind:"cyl",a:mt.KNEEL,b:mt.ANKL,r:.062},{name:"Sağ baldır",cat:"bacak",kind:"cyl",a:mt.KNEER,b:mt.ANKR,r:.062},{name:"Sol ayak",cat:"ayak",kind:"foot",a:mt.ANKL,b:mt.TOEL},{name:"Sağ ayak",cat:"ayak",kind:"foot",a:mt.ANKR,b:mt.TOER}],Ae={TORSO:1,PELVIS:2,UARML:3,UARMR:4,FARML:5,FARMR:6,HANDL:7,HANDR:8,THIGHL:9,THIGHR:10,SHINL:11,SHINR:12,FOOTL:13,FOOTR:14},We=[Ae.THIGHL,Ae.THIGHR,Ae.SHINL,Ae.SHINR,Ae.FOOTL,Ae.FOOTR],lx=[.19,.21,.11],cx=[.17,.1,.11],hx=[.05,.04,.135];function Vs(){return{j:new Float64Array(ws*3),up:new Float64Array(3),fwd:new Float64Array(3),right:new Float64Array(3),bodyUp:new Float64Array(3)}}const we=new Float64Array(ws*3),xs=[0,0,0],Hn=[0,0,0];function Ze(s,t,e,n){we[s*3]=t,we[s*3+1]=e,we[s*3+2]=n}function Da(s){const t=Math.hypot(s[0],s[1],s[2])||1;return s[0]/=t,s[1]/=t,s[2]/=t,s}function Gn(s,t,e){const n=s<0?0:1,i=s*Bl,r=Fl*Math.sin(t),a=-Fl*Math.cos(t),o=t-e,l=r+zl*Math.sin(o),c=a-zl*Math.cos(o),h=Qt(o*.6,-.7,.5);Ze(mt.HIPL+n,0,i,0),Ze(mt.KNEEL+n,r,i,a),Ze(mt.ANKL+n,l,i,c),Ze(mt.TOEL+n,l+zs*Math.cos(h),i,c+zs*Math.sin(h))}function ux(s,t,e,n,i,r,a){let o=t[0]-s[0],l=t[1]-s[1],c=t[2]-s[2],h=Math.hypot(o,l,c)||1e-6;const u=n+i-1e-4,f=Math.abs(n-i)+.05,d=Qt(h,f,u),p=o/h,v=l/h,g=c/h,m=Qt((n*n+d*d-i*i)/(2*n*d),-1,1),_=Math.sqrt(1-m*m);let x=e[0]*p+e[1]*v+e[2]*g,y=e[0]-x*p,R=e[1]-x*v,w=e[2]-x*g,T=Math.hypot(y,R,w);T<1e-5&&(y=0,R=0,w=1,T=1),y/=T,R/=T,w/=T,r[0]=s[0]+n*(p*m+y*_),r[1]=s[1]+n*(v*m+R*_),r[2]=s[2]+n*(g*m+w*_),a[0]=s[0]+p*d,a[1]=s[1]+v*d,a[2]=s[2]+g*d}function ca(s,t,e,n){const i=s<0?0:1,r=[0,s*Bl,t];ux(r,e,n,Fl,zl,xs,Hn),Ze(mt.HIPL+i,0,s*Bl,0),Ze(mt.KNEEL+i,xs[0],xs[1],xs[2]-t),Ze(mt.ANKL+i,Hn[0],Hn[1],Hn[2]-t);const a=Math.atan2(Hn[0]-xs[0],-(Hn[2]-xs[2])),o=Qt(a*.5,-.9,.6);Ze(mt.TOEL+i,Hn[0]+zs*Math.cos(o),Hn[1],Hn[2]-t+zs*Math.sin(o))}function Oi(s){const t=s<0?0:1;return-we[(mt.ANKL+t)*3+2]}function He(s,t,e){const n=s<0?0:1,i=(mt.SHL+n)*3,r=we[i],a=we[i+1],o=we[i+2];Da(t),Da(e);const l=r+Oo*t[0],c=a+Oo*t[1],h=o+Oo*t[2];Ze(mt.ELL+n,l,c,h),Ze(mt.HANDL+n,l+Uo*e[0],c+Uo*e[1],h+Uo*e[2])}function ui(s,t,e){const n=t+(s>0?Math.PI:0),i=-(.1+.6*e)*Math.sin(n),r=.3+1*e;He(s,[Math.sin(i),s*.13,-Math.cos(i)],[Math.sin(i+r),s*.1,-Math.cos(i+r)])}function dx(s,t,e,n,i){if(s===Pn.POINT_R)ui(-1,t,e),He(1,[.95,.08,.3],[.95,.06,.3]);else if(s===Pn.PROTEST)for(const r of[-1,1])He(r,[.35,r*.75,-.2],[.6,r*.4,.5]);else if(s===Pn.OUT)for(const r of[-1,1])if(i===2||i===0&&r<0||i===1&&r>0){const o=n;He(r,[.12,r*Math.sin(o),-Math.cos(o)],[.25,r*Math.sin(o+.1),-Math.cos(o+.1)])}else He(r,[.05,r*.12,-1],[.3,r*.1,-.95]);else ui(-1,t,e),ui(1,t,e)}function fx(s){return s<.55?yr(s/.55):s<.75?1:1-.5*yr((s-.75)/.25)}function qn(s,t){const e=s.pose|0,n=Qt(s.sp/7.5,0,1),i=s.ph,r=Qt(s.pt,0,1);let a=.05+.2*n,o=0,l=0,c=0,h=0,u=0;if(e===dt.LUNGE||e===dt.SLIDE){const T=s.p2>=0?1:-1,E=fx(r),b=[.05,T*.14,Ni],S=[$e(b[0],s.p1,E),$e(b[1],s.p2,E),$e(b[2],s.p3,E)];e===dt.LUNGE?(o=.97-.2*E,a=.15+.25*E,ca(-T,o,[-.05,-T*.16,Ni],[1,0,0]),ca(T,o,S,[1,0,.5])):(o=$e(.97,.3,E),a=$e(.1,-.6,E),ca(T,o,S,[.3,0,1]),ca(-T,o,[-.25+.2*(1-E),-T*.18,$e(Ni,.06,E)],[.2,-T*.3,1]))}else if(e===dt.KICK){const T=s.p1===1?-1:1;let E,b;if(r<.45){const S=r/.45;E=$e(.05,-.75,S),b=$e(.2,1.5,S)}else if(r<.6){const S=(r-.45)/.15;E=$e(-.75,.3,S),b=$e(1.5,.12,S)}else{const S=(r-.6)/.4;E=$e(.3,1.05,S),b=$e(.12,.05,S)}Gn(-T,.12,.18),Gn(T,E,b),o=Oi(-T)+Ni,a=.1}else if(e===dt.FALL||e===dt.DOWN||e===dt.GETUP){Gn(-1,.35,.5),Gn(1,-.3,.7),o=Math.max(Oi(-1),Oi(1))+Ni,a=.2;const T=Math.PI/2-.12;l=e===dt.DOWN?T:e===dt.FALL?T*ax(r):T*(1-yr(r)),c=Math.cos(s.p1),h=Math.sin(s.p1)}else if(e===dt.DIVE)Gn(-1,.05,.08),Gn(1,-.05,.08),o=Math.max(Oi(-1),Oi(1))+Ni,a=0,l=1.35*yd(Math.min(1,r*1.4)),c=0,h=s.p1>=0?1:-1,u=.35*Math.sin(Math.PI*Math.min(1,r*1.2));else{Gn(-1,0,0),Gn(1,0,0);const T=.08+.55*n;for(const E of[-1,1]){const b=i+(E>0?Math.PI:0),S=T*Math.sin(b),P=.1+n*(.12+1.2*Math.max(0,Math.cos(b)));Gn(E,S,P)}o=Math.max(Oi(-1),Oi(1))+Ni+n*.04*Math.abs(Math.sin(2*i))}for(const T of[mt.HIPL,mt.HIPR,mt.KNEEL,mt.KNEER,mt.ANKL,mt.ANKR,mt.TOEL,mt.TOER])we[T*3+2]+=o;for(const T of[0,1]){const E=(mt.TOEL+T)*3,b=(mt.ANKL+T)*3;if(we[E+2]<.02&&l===0){we[E+2]=.02;const S=we[E+2]-we[b+2],P=Math.sqrt(Math.max(0,zs*zs-S*S)),O=we[E]-we[b];we[E]=we[b]+(O>=0?P:-P)}}const f=Math.sin(a),d=Math.cos(a);Ze(mt.PELVIS,0,0,o),Ze(mt.NECK,f*la,0,o+d*la);const p=f*la,v=o+d*la;if(Ze(mt.SHL,p-f*.06,-ou,v-d*.06),Ze(mt.SHR,p-f*.06,ou,v-d*.06),Ze(mt.HEAD,p+f*.15,0,v+d*.15),e===dt.LOCO)dx(s.p1|0,i,n,s.p2,s.p3|0);else if(e===dt.KICK){const T=s.p1===1?-1:1;He(-T,[.2,-T*.75,-.6],[.4,-T*.6,-.2]),He(T,[-.4,T*.25,-.9],[-.1,T*.2,-.95])}else if(e===dt.LUNGE)for(const T of[-1,1])He(T,[.25,T*.65,-.7],[.5,T*.5,-.3]);else if(e===dt.SLIDE)for(const T of[-1,1])He(T,[-.5,T*.5,-.7],[-.5,T*.4,-.75]);else if(e===dt.FALL||e===dt.DOWN||e===dt.GETUP)for(const T of[-1,1])He(T,[.8,T*.3,-.3],[.9,T*.2,0]);else if(e===dt.DIVE)for(const T of[-1,1])He(T,[.15,T*.25,.96],[.15,T*.2,.97]);else if(e===dt.PUSH){let T=r<.4?yr(r/.4):r<.75?1:1-.7*yr((r-.75)/.25);a+=.15*T;for(const E of[-1,1]){const b=[$e(.15,1,T),E*$e(.12,.02,T),$e(-1,.05,T)];He(E,b,b.slice())}}else if(e===dt.CARD)ui(-1,i,n*.3),He(1,[.12,.12,1],[.1,.1,1]);else if(e===dt.FLAG)ui(-1,i,n*.3),He(1,[.35,.25,.9],[.35,.2,.92]);else if(e===dt.POINT){ui(-1,i,n*.3);const T=[Math.cos(s.p1)*.95,Math.sin(s.p1)*.95,.15];He(1,T,T.slice())}else if(e===dt.CELEB)for(const T of[-1,1])He(T,[.15,T*.55,.82],[.1,T*.4,.9]);else ui(-1,i,n),ui(1,i,n);const g=Math.cos(s.h),m=Math.sin(s.h),_=g,x=m,y=-m,R=g,w=t.j;for(let T=0;T<ws;T++){const E=we[T*3],b=we[T*3+1],S=we[T*3+2];w[T*3]=E*_+b*y,w[T*3+1]=S,w[T*3+2]=E*x+b*R}if(t.up[0]=f*_,t.up[1]=d,t.up[2]=f*x,t.fwd[0]=d*_,t.fwd[1]=-f,t.fwd[2]=d*x,t.right[0]=y,t.right[1]=0,t.right[2]=R,t.bodyUp[0]=0,t.bodyUp[1]=1,t.bodyUp[2]=0,l!==0){const T=c*_+h*y,b=c*x+h*R,S=0,P=-T,O=Math.cos(l),U=Math.sin(l),F=(N,Y)=>{const H=N[Y],J=N[Y+1],st=N[Y+2],lt=b*H+S*J+P*st,ht=S*st-P*J,St=P*H-b*st,W=b*J-S*H;N[Y]=H*O+ht*U+b*lt*(1-O),N[Y+1]=J*O+St*U+S*lt*(1-O),N[Y+2]=st*O+W*U+P*lt*(1-O)};for(let N=0;N<ws;N++)F(w,N*3);F(t.up,0),F(t.fwd,0),F(t.right,0),F(t.bodyUp,0);const K=.12*Math.sin(l);for(let N=0;N<ws;N++)w[N*3+1]+=K}for(let T=0;T<ws;T++)w[T*3]+=s.x,w[T*3+1]+=u,w[T*3+2]+=s.z;return t}function As(s,t,e){return e[0]=s.j[t*3],e[1]=s.j[t*3+1],e[2]=s.j[t*3+2],e}function wr(s,t,e){const n=be[t];if(e.c=e.c||[0,0,0],e.ax=e.ax||[[0,0,0],[0,0,0],[0,0,0]],n.kind==="torso"||n.kind==="pelvis"){const u=n.kind==="torso"?.31:.02,f=n.kind==="torso"?lx:cx,d=mt.PELVIS*3;for(let p=0;p<3;p++)e.c[p]=s.j[d+p]+s.up[p]*u,e.ax[0][p]=s.right[p],e.ax[1][p]=s.up[p],e.ax[2][p]=s.fwd[p];return e.h=f,e}const i=As(s,n.a,[0,0,0]),r=As(s,n.b,[0,0,0]),a=Da([r[0]-i[0],r[1]-i[1],r[2]-i[2]]),o=s.bodyUp,l=o[0]*a[0]+o[1]*a[1]+o[2]*a[2],c=Da([o[0]-l*a[0],o[1]-l*a[1],o[2]-l*a[2]]),h=[c[1]*a[2]-c[2]*a[1],c[2]*a[0]-c[0]*a[2],c[0]*a[1]-c[1]*a[0]];for(let u=0;u<3;u++)e.c[u]=i[u]+a[u]*.085-c[u]*.025,e.ax[0][u]=h[u],e.ax[1][u]=c[u],e.ax[2][u]=a[u];return e.h=hx,e}const yc={};function Md(s,t,e,n){const i=be[t];if(i.kind==="sphere"){const o=i.a*3;return s.j[o]*e+s.j[o+2]*n+i.r}if(i.kind==="cyl"){const o=i.a*3,l=i.b*3,c=s.j[o]*e+s.j[o+2]*n,h=s.j[l]*e+s.j[l+2]*n,u=s.j[l]-s.j[o],f=s.j[l+1]-s.j[o+1],d=s.j[l+2]-s.j[o+2],p=Math.hypot(u,f,d)||1,v=(u*e+d*n)/p;return Math.max(c,h)+i.r*Math.sqrt(Math.max(0,1-v*v))}const r=wr(s,t,yc);let a=r.c[0]*e+r.c[2]*n;for(let o=0;o<3;o++)a+=r.h[o]*Math.abs(r.ax[o][0]*e+r.ax[o][2]*n);return a}function Fo(s,t,e,n=!0){let i=-1/0,r=-1;for(let a=0;a<be.length;a++){if(n&&be[a].cat==="kol")continue;const o=Md(s,a,t,e);o>i&&(i=o,r=a)}return{ext:i,part:r}}function px(s,t,e,n,i,r){const a=[t[0]-s[0],t[1]-s[1],t[2]-s[2]],o=[n[0]-e[0],n[1]-e[1],n[2]-e[2]],l=[s[0]-e[0],s[1]-e[1],s[2]-e[2]],c=a[0]*a[0]+a[1]*a[1]+a[2]*a[2],h=o[0]*o[0]+o[1]*o[1]+o[2]*o[2],u=o[0]*l[0]+o[1]*l[1]+o[2]*l[2];let f,d;if(c<=1e-9&&h<=1e-9)f=d=0;else if(c<=1e-9)f=0,d=Qt(u/h,0,1);else{const p=a[0]*l[0]+a[1]*l[1]+a[2]*l[2];if(h<=1e-9)d=0,f=Qt(-p/c,0,1);else{const v=a[0]*o[0]+a[1]*o[1]+a[2]*o[2],g=c*h-v*v;f=g!==0?Qt((v*u-p*h)/g,0,1):0,d=(v*f+u)/h,d<0?(d=0,f=Qt(-p/c,0,1)):d>1&&(d=1,f=Qt((v-p)/c,0,1))}}for(let p=0;p<3;p++)i[p]=s[p]+a[p]*f,r[p]=e[p]+o[p]*d;return Math.hypot(i[0]-r[0],i[1]-r[1],i[2]-r[2])}function Hl(s,t,e){const n=be[t];if(e.a=e.a||[0,0,0],e.b=e.b||[0,0,0],n.kind==="sphere")return As(s,n.a,e.a),As(s,n.a,e.b),e.r=n.r,e;if(n.kind==="cyl")return As(s,n.a,e.a),As(s,n.b,e.b),e.r=n.r,e;const i=wr(s,t,yc);if(n.kind==="torso"){for(let r=0;r<3;r++)e.a[r]=i.c[r]-i.ax[1][r]*.12,e.b[r]=i.c[r]+i.ax[1][r]*.12;return e.r=.15,e}if(n.kind==="pelvis"){for(let r=0;r<3;r++)e.a[r]=i.c[r]-i.ax[0][r]*.08,e.b[r]=i.c[r]+i.ax[0][r]*.08;return e.r=.1,e}for(let r=0;r<3;r++)e.a[r]=i.c[r]-i.ax[2][r]*.09,e.b[r]=i.c[r]+i.ax[2][r]*.09;return e.r=.045,e}const Ss={},ha={},_s=[0,0,0],ir=[0,0,0];function mx(s,t,e,n){let i={d:1/0,pa:-1,pb:-1,point:[0,0,0]};for(const r of t){Hl(s,r,Ss);for(const a of n){Hl(e,a,ha);const o=px(Ss.a,Ss.b,ha.a,ha.b,_s,ir)-Ss.r-ha.r;if(o<i.d){i.d=o,i.pa=r,i.pb=a;const l=Math.hypot(ir[0]-_s[0],ir[1]-_s[1],ir[2]-_s[2])||1,c=(Ss.r+o/2)/l;for(let h=0;h<3;h++)i.point[h]=_s[h]+(ir[h]-_s[h])*Qt(c,0,1)}}}return i}function gx(s,t,e,n,i,r){const a=be[t];if(a.kind==="torso"||a.kind==="pelvis"||a.kind==="foot"){const p=wr(s,t,yc),v=[e-p.c[0],n-p.c[1],i-p.c[2]],g=[0,0,0];let m=0;for(let x=0;x<3;x++){const y=v[0]*p.ax[x][0]+v[1]*p.ax[x][1]+v[2]*p.ax[x][2],R=Qt(y,-p.h[x],p.h[x]);g[x]=R,m+=(y-R)*(y-R)}const _=[p.c[0],p.c[1],p.c[2]];for(let x=0;x<3;x++)for(let y=0;y<3;y++)_[y]+=p.ax[x][y]*g[x];return{d:Math.sqrt(m)-r,point:_,t:0}}const o=Hl(s,t,Ss),l=[o.b[0]-o.a[0],o.b[1]-o.a[1],o.b[2]-o.a[2]],c=l[0]*l[0]+l[1]*l[1]+l[2]*l[2],h=c>1e-9?Qt(((e-o.a[0])*l[0]+(n-o.a[1])*l[1]+(i-o.a[2])*l[2])/c,0,1):0,u=[o.a[0]+l[0]*h,o.a[1]+l[1]*h,o.a[2]+l[2]*h],f=Math.hypot(e-u[0],n-u[1],i-u[2]),d=[u[0]+(e-u[0])/(f||1)*o.r,u[1]+(n-u[1])/(f||1)*o.r,u[2]+(i-u[2])/(f||1)*o.r];return{d:f-o.r-r,point:d,t:h,len:Math.sqrt(c)}}function vx(s,t,e){const n=t?mt.ANKL:mt.ANKR,i=t?mt.TOEL:mt.TOER,r=s.j[n*3],a=s.j[n*3+2],o=s.j[i*3],l=s.j[i*3+2],c=Math.hypot(o-r,l-a)||1;return[o+(o-r)/c*e*.95,e,l+(l-a)/c*e*.95]}const Xt={BODY:0,UARML:1,UARMR:2,FARML:3,FARMR:4,THIGHL:5,THIGHR:6,SHINL:7,SHINR:8,FOOTL:9,FOOTR:10},yx=11,lu=["kisa","kisa","kazinmis","afro","uzun","kel","ibik","topuz","kisa","kazinmis"],ua=new Vt;function sr(s,t,e){let n=s.index?s.toNonIndexed():s;for(const c of Object.keys(n.attributes))["position","normal","uv"].includes(c)||n.deleteAttribute(c);const i=n.attributes.position.count;n.attributes.normal||n.computeVertexNormals(),n.attributes.uv||n.setAttribute("uv",new ee(new Float32Array(i*2),2));const r=new Float32Array(i*3),a=n.attributes.position;for(let c=0;c<i;c++){const h=typeof e=="function"?e(a.getX(c),a.getY(c),a.getZ(c)):e;ua.set(h),r[c*3]=ua.r,r[c*3+1]=ua.g,r[c*3+2]=ua.b}n.setAttribute("color",new ee(r,3));const o=new Uint16Array(i*4),l=new Float32Array(i*4);for(let c=0;c<i;c++)o[c*4]=t,l[c*4]=1;return n.setAttribute("skinIndex",new ec(o,4)),n.setAttribute("skinWeight",new ee(l,4)),n}function Bi(s,t,e,n,i,r=!0,a=3){const o=new Ie(t,s,n-e,i,a,r);return o.translate(0,(e+n)/2,0),o}function De(s,t,e,n,i,r,a,o=Math.PI){const l=new Sn(1,a,Math.max(4,Math.round(a*.7)),0,Math.PI*2,0,o);return l.scale(s,t,e),l.translate(n,i,r),l}const zo=[.093,.108,.103];function Ms(s,t,e=.42,n=-.45,i=0,r=.66){const a=new Sn(1,s+4,s+2),o=a.attributes.position;for(let l=0;l<o.count;l++){const c=o.getX(l),h=o.getY(l),u=o.getZ(l),f=u<0?i+(e-i)*-u:i+(n-i)*u,d=Math.abs(c)>.75&&u<.3&&u>-.6?-.12:0,p=h>f+d?t:.96;o.setXYZ(l,c*zo[0]*p,h*zo[1]*p+r,u*zo[2]*p+.006)}return a.computeVertexNormals(),a}function da(s,t,e,n,i,r){const a=new ve(s,t,e);return a.translate(n,i,r),a}function cu(s,t){return new lc(s.map(([e,n])=>new vt(e,n)),t)}function xx(s,t){const e=[],n=[],i=[];for(let o=0;o<=t;o++){const l=o/t;let c,h,u,f;if(l<.8){const d=l/.8;c=.07+d*.39,h=.168+.024*Math.sin(Math.min(1,d*1.15)*Math.PI*.5)-(d<.3?.008*Math.sin(d/.3*Math.PI):0),u=.108+.02*Math.sin(d*Math.PI*.9),f=.1+.01*d}else{const d=(l-.8)/.2;c=.46+.075*Math.sin(d*Math.PI*.5);const p=Math.cos(d*Math.PI*.5);h=.065+.127*p,u=.055+.073*p,f=.055+.056*p}for(let d=0;d<=s;d++){const p=d/s*Math.PI*2,v=Math.sin(p);e.push(Math.cos(p)*h,c,v*(v<0?u:f)),n.push(1-d/s,.15+.85*l)}}for(let o=0;o<t;o++)for(let l=0;l<s;l++){const c=o*(s+1)+l,h=c+1,u=c+s+1,f=u+1;i.push(c,u,h,h,u,f)}const r=new Te;r.setAttribute("position",new ee(e,3)),r.setAttribute("uv",new ee(n,2)),r.setIndex(i),r.computeVertexNormals();const a=r.attributes.normal;for(let o=0;o<=t;o++){const l=o*(s+1),c=l+s,h=(a.getX(l)+a.getX(c))/2,u=(a.getY(l)+a.getY(c))/2,f=(a.getZ(l)+a.getZ(c))/2;a.setXYZ(l,h,u,f),a.setXYZ(c,h,u,f)}return r}function hu(s,t,e,n,i,r){const a=Bi(s,t,0,e,n,!0,2),o=a.attributes.position,l=a.attributes.uv;for(let c=0;c<o.count;c++)l.setXY(c,l.getX(c),i+o.getY(c)/e*(r-i));return a}let rr=null;function _x(s){return rr&&rr.q===s||(rr={q:s,body:new ue({vertexColors:!0,roughness:.62,metalness:.02}),proxy:new xi({visible:!1}),sphere:new Sn(1,8,6),cyl:new Ie(1,1,1,8,1),box:new ve(1,1,1)}),rr}class Mx{constructor(t,e){const n=e.quality,i=_x(n);this.entId=t,this.group=new je;const r=n==="dusuk"?8:n==="orta"?12:16,a=fn(String(e.seed||t)+(e.name||"")),o=e.kind==="ref"||e.kind==="ar"?{pattern:"duz",second:"#111111"}:Ia(e.teamId,{shirt:e.shirt,shorts:e.shorts}),l=e.second||o.second,c=e.skin,h=Mn(c,-.18),u=e.hair||"#222",f=e.socks,d=e.kind==="ref"||e.kind==="ar"?"#c6ff00":l,p=e.boots||["#111111","#f2f2f2","#ff3d00","#00b0ff","#ffd600","#d500f9","#111111"][a%7],v=p==="#111111"?["#ff3d00","#00e676","#ffd600","#ffffff"][(a>>3)%4]:"#111111",g=e.kind==="gk",m=g?["#ff6d00","#c6ff00","#2979ff","#ffffff"][(a>>5)%4]:c,_=[],x=(N,Y,H)=>_.push(sr(N,Y,H)),y=N=>Y=>Y*N>.082?l:e.shorts,R=cu([[.15,-.14],[.172,-.12],[.182,-.02],[.178,.08],[.17,.13]],r);R.scale(1,1,.7),x(R,Xt.BODY,e.shorts),x(De(.155,.05,.1,0,-.125,0,r),Xt.BODY,e.shorts),x(Bi(.054,.05,.47,.58,r),Xt.BODY,c),x(De(.093,.108,.103,0,.66,.006,r+4),Xt.BODY,c),x(De(.07,.056,.078,0,.607,-.022,r),Xt.BODY,c);const w=new hc(.015,.026,8);w.rotateX(-Math.PI/2),w.scale(1,1.4,1),w.translate(0,.642,-.104),x(w,Xt.BODY,h);for(const N of[-1,1])x(De(.016,.028,.02,N*.094,.655,.006,8),Xt.BODY,h),x(De(.012,.008,.005,N*.034,.668,-.093,8),Xt.BODY,"#efe9df"),x(De(.0055,.0055,.003,N*.034,.668,-.097,6),Xt.BODY,"#2a1a10"),x(da(.032,.008,.01,N*.035,.688,-.094),Xt.BODY,u);x(da(.036,.006,.008,0,.616,-.1),Xt.BODY,"#7a3b33");const T=e.kind==="ref"||e.kind==="ar"?"kisa":lu[a%lu.length];T==="kisa"?x(Ms(r,1.07),Xt.BODY,u):T==="kazinmis"?x(Ms(r,1.025,.5,-.35),Xt.BODY,Mn(u,.12)):T==="afro"?x(Ms(r,1.32,.48,-.25,.05,.668),Xt.BODY,u):T==="uzun"?x(Ms(r,1.09,.38,-.95,-.1),Xt.BODY,u):T==="ibik"?(x(Ms(r,1.015,.55,-.3),Xt.BODY,Mn(u,.2)),x(da(.03,.045,.17,0,.755,.01),Xt.BODY,u)):T==="topuz"&&(x(Ms(r,1.06,.4,-.4),Xt.BODY,u),x(De(.042,.042,.042,0,.745,.08,8),Xt.BODY,u)),(a>>7)%4===0&&e.kind!=="ref"&&x(De(.074,.05,.08,0,.6,-.018,r,Math.PI),Xt.BODY,Mn(u,.05));for(const N of[0,1]){const Y=N?Xt.UARMR:Xt.UARML,H=N?Xt.FARMR:Xt.FARML;g||x(Bi(.052,.045,.13,.29,r),Y,c),x(De(.045,.045,.045,0,.29,0,r),Y,g?e.shirt:c),g||x(Bi(.045,.035,0,.25,r),H,c),x(De(.036,.05,.024,0,.29,0,r),H,m),x(De(.012,.025,.012,(N?-1:1)*.03,.275,-.01,6),H,m),g&&x(De(.045,.06,.03,0,.29,0,r),H,m)}for(const N of[0,1]){const Y=N?Xt.THIGHR:Xt.THIGHL,H=N?Xt.SHINR:Xt.SHINL,J=N?Xt.FOOTR:Xt.FOOTL,st=N?-1:1;x(Bi(.098,.092,-.02,.19,r,!0,2),Y,y(st)),x(Bi(.088,.064,.17,.45,r),Y,c),x(De(.062,.062,.062,0,.455,0,r),Y,c),x(cu([[.056,0],[.062,.05],[.067,.13],[.063,.22],[.052,.33],[.045,.42],[.046,.47]],r),H,(lt,ht)=>ht<.065?d:f),x(De(.05,.11,.022,0,.2,-.05,r),H,Mn(f,.06)),x(De(.053,.044,.138,0,.004,0,r),J,p),x(De(.0545,.018,.1,0,-.006,.01,r),J,v),x(da(.096,.014,.265,0,-.036,0),J,Mn(p,-.45));for(const[lt,ht]of[[-.03,.09],[.03,.09],[-.03,.02],[.03,.02],[-.028,-.09],[.028,-.09]]){const St=new Ie(.007,.006,.014,6);St.translate(lt,-.049,ht),x(St,J,"#cfcfcf")}x(Bi(.05,.047,.03,.06,r),J,p)}const E=Tr(_),b=[],S=n==="dusuk"?18:30;b.push(sr(xx(S,n==="dusuk"?10:16),Xt.BODY,"#ffffff"));for(const N of[0,1]){const Y=N?Xt.UARMR:Xt.UARML,H=N?Xt.FARMR:Xt.FARML,J=g?.29:.17;b.push(sr(hu(.068,g?.054:.062,J,r,.12,g?.1:.015),Y,"#ffffff"));const st=sr(De(.069,.069,.069,0,.01,0,r),Y,"#ffffff"),lt=st.attributes.uv;for(let ht=0;ht<lt.count;ht++)lt.setXY(ht,.5,.1);b.push(st),g&&b.push(sr(hu(.05,.04,.24,r,.1,.015),H,"#ffffff"))}const P=Tr(b),O=$y({shirt:e.shirt,second:l,pattern:o.pattern,num:e.num,name:e.name,hi:n==="yuksek",crest:e.crest,official:e.kind==="ref"||e.kind==="ar",collar:e.kind==="ref"||e.kind==="ar"?"#111111":void 0}),U=n==="yuksek"?new pc({map:O,roughness:.74,metalness:0,sheen:.6,sheenRoughness:.6,sheenColor:new Vt(16777215)}):new ue({map:O,roughness:.72});this.ownMats=[U],this.ownTex=[O],this.ownGeo=[E,P],this.bones=[];for(let N=0;N<yx;N++){const Y=new sd;Y.matrixAutoUpdate=!1,this.bones.push(Y)}const F=this.bones.map(()=>new Yt);this.skeleton=new rc(this.bones,F);const K=n!=="dusuk";this.body=new Fh(E,i.body),this.shirt=new Fh(P,U);for(const N of[this.body,this.shirt])N.frustumCulled=!1,N.castShadow=K,N.receiveShadow=n==="yuksek",N.bind(this.skeleton,new Yt),this.group.add(N);for(const N of this.bones)this.body.add(N);this.meshes=[];for(let N=0;N<be.length;N++){const Y=be[N],H=Y.kind==="sphere"?i.sphere:Y.kind==="cyl"?i.cyl:i.box,J=new Dt(H,i.proxy);J.matrixAutoUpdate=!1,J.userData={ent:t,part:N},this.group.add(J),this.meshes.push(J)}if(e.kind==="ref"&&(this.card=new Dt(new ve(.075,.105,.004),new ue({color:16765952,roughness:.4,emissive:3353088})),this.card.visible=!1,this.group.add(this.card)),e.kind==="ar"){const N=new je,Y=new Dt(new Ie(.011,.011,.58,8),new ue({color:2236962,roughness:.4,metalness:.5}));Y.position.y=.27;const H=document.createElement("canvas");H.width=64,H.height=48;const J=H.getContext("2d");for(let W=0;W<4;W++)for(let et=0;et<4;et++)J.fillStyle=(et+W)%2?"#ffd000":"#e8102a",J.fillRect(et*16,W*12,16,12);const st=new Ga(H);st.colorSpace=Ge;const lt=new Je(.34,.26,6,3),ht=lt.attributes.position;for(let W=0;W<ht.count;W++)ht.setZ(W,Math.sin(ht.getX(W)*14)*.015);lt.computeVertexNormals();const St=new Dt(lt,new ue({map:st,side:Re,roughness:.8}));St.position.set(.18,.42,0),N.add(Y,St),this.flag=N,this.group.add(N),this.ownTex.push(st)}}dispose(){for(const t of this.ownGeo)t.dispose();for(const t of this.ownMats)t.dispose();for(const t of this.ownTex)t.dispose();this.skeleton.dispose()}setProxyCyl(t,e,n,i,r){hn.set(e[n*3],e[n*3+1],e[n*3+2]),bs.set(e[i*3],e[i*3+1],e[i*3+2]),Ui.subVectors(bs,hn);const a=Ui.length()||1e-4;Ui.divideScalar(a),pa.setFromUnitVectors(uu,Ui),ar.set(r,a,r),hn.addScaledVector(Ui,a/2),t.matrix.compose(hn,pa,ar)}limbBone(t,e,n,i,r){hn.set(e[n*3],e[n*3+1],e[n*3+2]),bs.set(e[i*3],e[i*3+1],e[i*3+2]),sn.subVectors(bs,hn).normalize(),Ne.set(-r.fwd[0],-r.fwd[1],-r.fwd[2]),Ne.addScaledVector(sn,-Ne.dot(sn)),Ne.lengthSq()<1e-6&&(Ne.set(r.right[0],r.right[1],r.right[2]),Ne.addScaledVector(sn,-Ne.dot(sn))),Ne.normalize(),oi.crossVectors(sn,Ne),t.matrix.makeBasis(oi,sn,Ne).setPosition(hn),t.matrixWorldNeedsUpdate=!0}update(t,e,n){const i=t.j,r=this.bones;oi.set(t.right[0],t.right[1],t.right[2]),sn.set(t.up[0],t.up[1],t.up[2]),Ne.set(-t.fwd[0],-t.fwd[1],-t.fwd[2]),r[Xt.BODY].matrix.makeBasis(oi,sn,Ne).setPosition(i[0],i[1],i[2]),r[Xt.BODY].matrixWorldNeedsUpdate=!0,this.limbBone(r[Xt.UARML],i,mt.SHL,mt.ELL,t),this.limbBone(r[Xt.UARMR],i,mt.SHR,mt.ELR,t),this.limbBone(r[Xt.FARML],i,mt.ELL,mt.HANDL,t),this.limbBone(r[Xt.FARMR],i,mt.ELR,mt.HANDR,t),this.limbBone(r[Xt.THIGHL],i,mt.HIPL,mt.KNEEL,t),this.limbBone(r[Xt.THIGHR],i,mt.HIPR,mt.KNEER,t),this.limbBone(r[Xt.SHINL],i,mt.KNEEL,mt.ANKL,t),this.limbBone(r[Xt.SHINR],i,mt.KNEER,mt.ANKR,t);for(const[a,o]of[[Xt.FOOTL,13],[Xt.FOOTR,14]]){const l=wr(t,o,du);oi.set(l.ax[0][0],l.ax[0][1],l.ax[0][2]),sn.set(l.ax[1][0],l.ax[1][1],l.ax[1][2]),Ne.set(l.ax[2][0],l.ax[2][1],l.ax[2][2]),r[a].matrix.makeBasis(oi,sn,Ne).setPosition(l.c[0],l.c[1],l.c[2]),r[a].matrixWorldNeedsUpdate=!0}for(let a=0;a<be.length;a++){const o=be[a],l=this.meshes[a];if(o.kind==="sphere")hn.set(i[o.a*3],i[o.a*3+1],i[o.a*3+2]),pa.identity(),ar.set(o.r,o.r,o.r),l.matrix.compose(hn,pa,ar);else if(o.kind==="cyl")this.setProxyCyl(l,i,o.a,o.b,o.r);else{const c=wr(t,a,du);oi.set(c.ax[0][0],c.ax[0][1],c.ax[0][2]),sn.set(c.ax[1][0],c.ax[1][1],c.ax[1][2]),Ne.set(c.ax[2][0],c.ax[2][1],c.ax[2][2]),o.kind!=="foot"&&Ne.negate(),fa.makeBasis(oi,sn,Ne),fa.scale(ar.set(c.h[0]*2,c.h[1]*2,c.h[2]*2)),fa.setPosition(c.c[0],c.c[1],c.c[2]),l.matrix.copy(fa)}}this.card&&(this.card.visible=e===7,this.card.visible&&(this.card.material.color.set(n>=2?14680064:16765952),this.card.material.emissive.set(n>=2?3342336:3353088),this.card.position.set(i[mt.HANDR*3],i[mt.HANDR*3+1]+.08,i[mt.HANDR*3+2]),this.card.rotation.set(0,-Math.atan2(t.fwd[2],t.fwd[0])+Math.PI/2,0))),this.flag&&(hn.set(i[mt.HANDR*3],i[mt.HANDR*3+1],i[mt.HANDR*3+2]),bs.set(i[mt.ELR*3],i[mt.ELR*3+1],i[mt.ELR*3+2]),Ui.subVectors(hn,bs).normalize(),this.flag.position.copy(hn),this.flag.quaternion.setFromUnitVectors(uu,Ui))}}const uu=new D(0,1,0),Ui=new D,hn=new D,bs=new D,fa=new Yt,oi=new D,sn=new D,Ne=new D,pa=new qi,ar=new D,du={};function bx(s){const t=new Pa(pe,s==="dusuk"?3:5),e=(1+Math.sqrt(5))/2,n=[[0,1,e],[0,-1,e],[0,1,-e],[0,-1,-e],[1,e,0],[-1,e,0],[1,-e,0],[-1,-e,0],[e,0,1],[-e,0,1],[e,0,-1],[-e,0,-1]].map(d=>new D(...d).normalize()),r=new Pa(1,0).attributes.position,a=[];for(let d=0;d<r.count;d+=3)a.push(new D().fromBufferAttribute(r,d).add(new D().fromBufferAttribute(r,d+1)).add(new D().fromBufferAttribute(r,d+2)).normalize());const o=t.attributes.position,l=new Float32Array(o.count*3),c=new Float32Array(o.count*3),h=new D,u=new D;for(let d=0;d<o.count;d+=3){h.set(0,0,0);for(let y=0;y<3;y++)h.add(u.fromBufferAttribute(o,d+y));h.normalize();let p=9;for(const y of n)p=Math.min(p,h.angleTo(y));let v=9,g=9;for(const y of a){const R=h.angleTo(y);R<v?(g=v,v=R):R<g&&(g=R)}let m=.94,_=.94,x=.92;p<.36?(m=.04,_=.05,x=.08):(g-v<.035||Math.abs(p-.36)<.03)&&(m=_=x=.55);for(let y=0;y<3;y++)l[(d+y)*3]=m,l[(d+y)*3+1]=_,l[(d+y)*3+2]=x,u.fromBufferAttribute(o,d+y).normalize(),c[(d+y)*3]=u.x,c[(d+y)*3+1]=u.y,c[(d+y)*3+2]=u.z}t.setAttribute("color",new Oe(l,3)),t.setAttribute("normal",new Oe(c,3));const f=new pc({vertexColors:!0,roughness:.38,clearcoat:s==="yuksek"?.7:0,clearcoatRoughness:.3});return new Dt(t,f)}class fu{constructor(t,e){this.gfx=t,this.scene=t.scene,this.root=new je,this.scene.add(this.root),this.quality=t.quality,this.setup=null,this.humans=[],this.sk=Vs(),this.st={},this.pickables=[];const n=this.quality;this.pitch=tx(n),this.root.add(this.pitch),this.ball=bx(n),this.ball.castShadow=n!=="dusuk",this.root.add(this.ball);const i=(()=>{const r=document.createElement("canvas");r.width=r.height=64;const a=r.getContext("2d"),o=a.createRadialGradient(32,32,0,32,32,32);return o.addColorStop(0,"rgba(0,0,0,0.55)"),o.addColorStop(1,"rgba(0,0,0,0)"),a.fillStyle=o,a.fillRect(0,0,64,64),new Ga(r)})();this.blobMat=new xi({map:i,transparent:!0,depthWrite:!1}),this.ballBlob=new Dt(new Je(.4,.4),this.blobMat),this.ballBlob.rotation.x=-Math.PI/2,this.ballBlob.visible=n==="dusuk",this.root.add(this.ballBlob),this.overlays=new Sx(this.root),this.sbKey="",e&&this.setTeams(e)}setTeams(t){for(const i of this.humans)this.root.remove(i.group),i.dispose();this.stadium&&this.root.remove(this.stadium.group);for(const i of this.blobs||[])this.root.remove(i);this.humans=[],this.pickables=[],this.blobs=[],this.setup=t;const e=this.quality,n=t.teams||[{id:"ev",short:"EV",kit:t.kits[0]},{id:"dep",short:"DEP",kit:t.kits[1]}];this.stadium=rx(e,{id:n[0].id,kit:t.kits[0]},{id:n[1].id,kit:t.kits[1]}),this.root.add(this.stadium.group),this.sbKey="",this.teamNames=n.map(i=>i.short||i.name||"");for(let i=0;i<Ls;i++){let r;if(i<22){const o=i<11?0:1,l=i%11,c=t.kits[o],h=t.squads[o][l],u=l===0,f=Ia(n[o].id,c);r={shirt:u?c.gk:c.shirt,second:u?"#111111":f.second,shorts:u?"#1d1d1d":c.shorts,socks:u?c.gk:c.socks,skin:h.skin,hair:h.hair,num:h.num,name:h.name,quality:e,kind:u?"gk":"player",teamId:n[o].id,crest:{c1:c.shirt,c2:f.second,txt:(n[o].short||"FK").slice(0,2)},seed:n[o].id+i}}else r={shirt:"#c6ff00",second:"#111111",shorts:"#111111",socks:"#111111",skin:["#e0ac69","#c68642","#f1c27d"][i-22],hair:"#222",quality:e,kind:i===rn?"ref":"ar",seed:"hakem"+i};const a=new Mx(i,r);if(this.root.add(a.group),this.humans.push(a),this.pickables.push(...a.meshes),e==="dusuk"){const o=new Dt(new Je(1.1,1.1),this.blobMat);o.rotation.x=-Math.PI/2,o.position.y=.012,this.root.add(o),this.blobs.push(o)}}}apply(t,e,n=!0){for(let r=0;r<this.humans.length;r++){const a=this.humans[r],o=t(r,this.st),l=n&&o&&o.pose!==dt.HIDDEN;a.group.visible=l,this.blobs[r]&&(this.blobs[r].visible=l),l&&(qn(o,this.sk),a.update(this.sk,o.pose,o.p1),this.blobs[r]&&(this.blobs[r].position.x=this.sk.j[0],this.blobs[r].position.z=this.sk.j[2]))}const i=e();i&&(this.ball.visible=!0,this.ball.position.set(i[0],i[1],i[2]),this.ball.rotation.set(i[3]*.7,i[3]*.3,0),this.ballBlob.position.set(i[0],.011,i[2]),this.ballBlob.scale.setScalar(Math.max(.3,1-i[1]*.12)))}setCrowd(t,e){if(!this.stadium)return;const n=this.stadium.crowdMat.userData.uniforms;n.uTime.value=t,n.uJump.value+=(e-n.uJump.value)*.08,this.stadium.update(t)}setScoreboard(t,e,n){if(!this.stadium)return;const i=`${t}|${e}|${n}`;if(i===this.sbKey)return;this.sbKey=i;const{c:r,g:a,t:o}=this.stadium.scoreboard,l=r.width,c=r.height,h=a.createLinearGradient(0,0,0,c);h.addColorStop(0,"#08121e"),h.addColorStop(1,"#02060b"),a.fillStyle=h,a.fillRect(0,0,l,c),a.strokeStyle="#22d36b",a.lineWidth=8,a.strokeRect(8,8,l-16,c-16);const[u,f]=this.teamNames||["EV","DEP"];a.fillStyle="#ffffff",a.textAlign="center",a.textBaseline="middle",a.font="bold 86px Arial, sans-serif",a.fillText(u,l*.2,c*.36),a.fillText(f,l*.8,c*.36),a.font="900 150px Arial, sans-serif",a.fillText(t,l*.5,c*.38),a.font="bold 64px monospace",a.fillStyle="#22d36b",a.fillText(e,l*.5,c*.68),n?(a.fillStyle=n.includes("VAR")?"#00e5ff":"#ffd400",a.fillRect(l*.18,c*.78,l*.64,c*.15),a.fillStyle="#001018",a.font="bold 60px Arial, sans-serif",a.fillText(n,l*.5,c*.856)):(a.fillStyle="#8b98a5",a.font="bold 40px Arial, sans-serif",a.fillText("VAR ODASI · REKLAMSIZ FUTBOL",l*.5,c*.86)),o.needsUpdate=!0}}class Sx{constructor(t){this.g=new je,t.add(this.g);const e=(l,c)=>new xi({color:l,transparent:!0,opacity:c,depthWrite:!1,side:Re,toneMapped:!1,fog:!1}),n=new ve(.035,.012,bt.W+2),i=new Je(bt.W+2,2.2),r=l=>{const c=new je,h=new Dt(n,e(l,.95));h.position.y=.02;const u=new Dt(i,e(l,.13));return u.rotation.y=Math.PI/2,u.position.y=1.1,c.add(h,u),c.visible=!1,c.renderOrder=10,this.g.add(c),c};this.attLine=r(16724804),this.defLine=r(3116031),this.truthAtt=r(16777215),this.truthDef=r(2282347);const a=new ve(bt.LINE,.015,bt.BOX_HW*2);this.box=[];for(const l of[1,-1]){const c=new je,h=new Dt(a,e(16769280,.95));h.position.set(l*(mi+bt.LINE/2),.012,0);const u=new Dt(new Je(bt.BOX_HW*2,1.4),e(16769280,.16));u.rotation.y=Math.PI/2,u.position.set(l*mi,.7,0),c.add(h,u),c.visible=!1,this.g.add(c),this.box.push(c)}const o=new ve(bt.LINE,.015,bt.W);this.goal=[];for(const l of[1,-1]){const c=new je,h=new Dt(o,e(58879,.95));h.position.set(l*(bt.HL-bt.LINE/2),.012,0);const u=new Dt(new Je(bt.W,1),e(58879,.15));u.rotation.y=Math.PI/2,u.position.set(l*bt.HL,.5,0),c.add(h,u),c.visible=!1,this.g.add(c),this.goal.push(c)}this.markers=[16724804,3116031,16752640].map(l=>{const c=new Dt(new Sn(.045,12,8),new xi({color:l,depthTest:!1,toneMapped:!1}));return c.renderOrder=20,c.visible=!1,this.g.add(c),c})}setLine(t,e){const n=this[t];if(e==null){n.visible=!1;return}n.visible=!0,n.position.x=e}showBox(t,e){this.box[0].visible=e&&t>0,this.box[1].visible=e&&t<0}showGoal(t,e){this.goal[0].visible=e&&t>0,this.goal[1].visible=e&&t<0}marker(t,e){const n=this.markers[t];if(!e){n.visible=!1;return}n.visible=!0,n.position.set(e[0],e[1],e[2])}clear(){for(const t of["attLine","defLine","truthAtt","truthDef"])this[t].visible=!1;for(const t of[...this.box,...this.goal])t.visible=!1;for(const t of this.markers)t.visible=!1}}class Ex{constructor(t){this.ctx=null,this.settings=t,this.crowdLevel=.3,this.crowdTarget=.3,this.roomOn=!1,this.started=!1}unlock(){if(this.started){this.ctx.state==="suspended"&&this.ctx.resume();return}const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.started=!0;const e=this.ctx;this.master=e.createGain(),this.master.connect(e.destination),this.sfx=e.createGain(),this.sfx.connect(this.master),this.amb=e.createGain(),this.amb.connect(this.master),this.radioBus=e.createGain(),this.radioBus.connect(this.master),this.applyVolumes(),this.noise=this.makeNoise(3),this.buildCrowd(),this.buildRoom(),this.keyTimer=0}applyVolumes(){if(!this.ctx)return;const t=this.settings;this.master.gain.value=t.muted?0:t.volMaster,this.amb.gain.value=t.volAmbient,this.sfx.gain.value=t.volSfx,this.radioBus.gain.value=t.volRadio}makeNoise(t){const e=this.ctx,n=e.createBuffer(1,e.sampleRate*t,e.sampleRate),i=n.getChannelData(0);let r=0;for(let a=0;a<i.length;a++){const o=Math.random()*2-1;r=(r+.02*o)/1.02,i[a]=o*.5+r*3}return n}noiseSrc(t=!0){const e=this.ctx.createBufferSource();return e.buffer=this.noise,e.loop=t,e.loopStart=Math.random()*2,e}buildCrowd(){const t=this.ctx;this.crowdGain=t.createGain(),this.crowdGain.gain.value=0,this.crowdGain.connect(this.amb);for(const[e,n,i]of[[420,.7,.9],[1100,1.2,.45],[2600,2,.12]]){const r=this.noiseSrc(),a=t.createBiquadFilter();a.type="bandpass",a.frequency.value=e,a.Q.value=n;const o=t.createGain();o.gain.value=i;const l=t.createOscillator();l.frequency.value=.07+Math.random()*.15;const c=t.createGain();c.gain.value=i*.35,l.connect(c),c.connect(o.gain),r.connect(a),a.connect(o),o.connect(this.crowdGain),r.start(),l.start()}}buildRoom(){const t=this.ctx;this.roomGain=t.createGain(),this.roomGain.gain.value=0,this.roomGain.connect(this.amb);for(const[r,a]of[[60,.05],[120,.03],[180,.012]]){const o=t.createOscillator();o.frequency.value=r,o.type="sine";const l=t.createGain();l.gain.value=a,o.connect(l),l.connect(this.roomGain),o.start()}const e=this.noiseSrc(),n=t.createBiquadFilter();n.type="lowpass",n.frequency.value=300;const i=t.createGain();i.gain.value=.05,e.connect(n),n.connect(i),i.connect(this.roomGain),e.start()}setCrowd(t){this.crowdTarget=t}setRoom(t){this.roomOn=t}update(t){if(!this.ctx)return;this.crowdLevel+=(this.crowdTarget-this.crowdLevel)*Math.min(1,t*1.5);const e=this.ctx.currentTime;this.crowdGain.gain.setTargetAtTime(this.crowdLevel*(this.roomOn?.35:1),e,.1),this.roomGain.gain.setTargetAtTime(this.roomOn?1:0,e,.3),this.roomOn&&(this.keyTimer-=t,this.keyTimer<=0&&(this.keyTimer=.08+Math.random()*(Math.random()<.15?2.5:.35),this.keyClick()))}env(t,e,n,i,r){t.gain.setValueAtTime(1e-4,e),t.gain.exponentialRampToValueAtTime(i,e+n),t.gain.exponentialRampToValueAtTime(1e-4,e+n+r)}keyClick(){const t=this.ctx,e=t.currentTime,n=this.noiseSrc(!1),i=t.createBiquadFilter();i.type="highpass",i.frequency.value=2500+Math.random()*2e3;const r=t.createGain();this.env(r,e,.001,.05+Math.random()*.04,.03),n.connect(i),i.connect(r),r.connect(this.roomGain),n.start(e,Math.random()),n.stop(e+.06)}whistle(t=!1,e=!1){if(!this.ctx)return;const n=this.ctx,i=(a,o)=>{const l=n.createOscillator();l.type="square",l.frequency.setValueAtTime(2900,a);const c=n.createOscillator();c.frequency.value=38;const h=n.createGain();h.gain.value=120,c.connect(h),h.connect(l.frequency);const u=n.createBiquadFilter();u.type="bandpass",u.frequency.value=3e3,u.Q.value=3;const f=n.createGain();f.gain.setValueAtTime(1e-4,a),f.gain.exponentialRampToValueAtTime(.25,a+.03),f.gain.setValueAtTime(.25,a+o-.05),f.gain.exponentialRampToValueAtTime(1e-4,a+o),l.connect(u),u.connect(f),f.connect(this.sfx),l.start(a),c.start(a),l.stop(a+o),c.stop(a+o)},r=n.currentTime+.01;e?(i(r,.35),i(r+.45,.35),i(r+.9,.9)):i(r,t?.8:.28)}kick(t=15){if(!this.ctx)return;const e=this.ctx,n=e.currentTime,i=e.createOscillator();i.type="sine",i.frequency.setValueAtTime(160,n),i.frequency.exponentialRampToValueAtTime(50,n+.08);const r=e.createGain();this.env(r,n,.002,Math.min(.5,.1+t/60),.1),i.connect(r),r.connect(this.sfx),i.start(n),i.stop(n+.15)}roar(t=1){if(!this.ctx)return;this.crowdLevel=Math.min(1.4,this.crowdLevel+.7*t);const e=this.ctx,n=e.currentTime,i=this.noiseSrc(!1),r=e.createBiquadFilter();r.type="bandpass",r.frequency.value=700,r.Q.value=.6;const a=e.createGain();a.gain.setValueAtTime(1e-4,n),a.gain.exponentialRampToValueAtTime(.6*t,n+.4),a.gain.exponentialRampToValueAtTime(1e-4,n+3.5),i.connect(r),r.connect(a),a.connect(this.amb),i.start(n),i.stop(n+3.6)}groan(){if(!this.ctx)return;const t=this.ctx,e=t.currentTime,n=this.noiseSrc(!1),i=t.createBiquadFilter();i.type="lowpass",i.frequency.setValueAtTime(900,e),i.frequency.linearRampToValueAtTime(300,e+1.2);const r=t.createGain();this.env(r,e,.15,.35,1.3),n.connect(i),i.connect(r),r.connect(this.amb),n.start(e),n.stop(e+1.6)}radio(t="in"){if(!this.ctx)return;const e=this.ctx,n=e.currentTime,i=this.noiseSrc(!1),r=e.createBiquadFilter();r.type="bandpass",r.frequency.value=1800,r.Q.value=.9;const a=e.createGain();this.env(a,n,.005,.18,.16),i.connect(r),r.connect(a),a.connect(this.radioBus),i.start(n),i.stop(n+.25);const o=e.createOscillator();o.type="sine",o.frequency.value=t==="in"?1250:880;const l=e.createGain();this.env(l,n+.18,.005,.12,.08),o.connect(l),l.connect(this.radioBus),o.start(n+.18),o.stop(n+.3)}ui(t="click"){if(!this.ctx)return;const e=this.ctx,n=e.currentTime,i=e.createOscillator(),r=e.createGain();t==="click"?(i.type="triangle",i.frequency.value=900,this.env(r,n,.002,.08,.05)):t==="tick"?(i.type="square",i.frequency.value=1500,this.env(r,n,.001,.05,.03)):t==="stamp"?(i.type="sawtooth",i.frequency.setValueAtTime(220,n),i.frequency.exponentialRampToValueAtTime(90,n+.2),this.env(r,n,.005,.2,.25)):t==="good"?(i.type="sine",i.frequency.setValueAtTime(660,n),i.frequency.setValueAtTime(990,n+.09),this.env(r,n,.005,.15,.25)):t==="bad"?(i.type="sine",i.frequency.setValueAtTime(300,n),i.frequency.setValueAtTime(200,n+.12),this.env(r,n,.005,.15,.3)):t==="mark"&&(i.type="sine",i.frequency.value=1320,this.env(r,n,.002,.1,.07)),i.connect(r),r.connect(this.sfx),i.start(n),i.stop(n+.4)}speak(t){if(!this.settings.tts||!window.speechSynthesis)return;const e=speechSynthesis.getVoices().filter(i=>i.lang&&i.lang.toLowerCase().startsWith("tr")&&i.localService);if(!e.length)return;const n=new SpeechSynthesisUtterance(t);n.voice=e[0],n.lang="tr-TR",n.rate=1.08,n.pitch=.9,n.volume=Math.min(1,this.settings.volRadio*this.settings.volMaster*1.2),speechSynthesis.cancel(),speechSynthesis.speak(n)}}const pu="varodasi.save.v1",bd={controls:"auto",quality:"auto",volMaster:.8,volAmbient:.7,volSfx:.8,volRadio:.9,muted:!1,tts:!1,matchMinutes:7,showFps:!1,reduceMotion:!1,gpSpeed:1,gpRumble:!0};function Bo(){return{v:1,settings:{...bd},career:null,stats:Sd(),daily:{},tutorialDone:!1,trainingBest:{}}}function Sd(){return{matches:0,incidents:0,correct:0,missed:0,wrong:0,unnecessary:0,totalTime:0,notesSum:0,bestNote:0,offsideErrSum:0,offsideN:0,framesPerfect:0,byType:{},history:[]}}class Tx{constructor(){this.data=Bo(),this.load()}load(){try{const t=localStorage.getItem(pu);if(t){const e=JSON.parse(t);this.data={...Bo(),...e,settings:{...bd,...e.settings||{}},stats:{...Sd(),...e.stats||{}}}}}catch(t){console.warn("Kayıt okunamadı, yeni kayıt açılıyor.",t)}}persist(){try{localStorage.setItem(pu,JSON.stringify(this.data))}catch(t){console.warn("Kayıt yazılamadı",t)}}reset(){this.data=Bo(),this.persist()}get settings(){return this.data.settings}}const fr=[{id:0,name:"Ana yayın",short:"ANA"},{id:1,name:"Ters açı",short:"TERS"},{id:2,name:"Kale arkası",short:"KALE"},{id:3,name:"Taktik (yüksek)",short:"TAKTİK"},{id:4,name:"Çizgi / ofsayt kamerası",short:"ÇİZGİ"},{id:5,name:"Yakın plan",short:"YAKIN"}];function xc(){return new an(30,1.7777777777777777,.1,600)}function wx(s,t,e,n){const i=e.ball,r=e.focus,a=e.dir;let o=30;const l=new D,c=new D;switch(t){case 0:l.set(i[0]*.82,21,-54),c.set(i[0],.5,i[2]*.55),o=22;break;case 1:l.set(i[0]*.82,17,54),c.set(i[0],.5,i[2]*.55),o=22;break;case 2:{const h=a*(bt.HL+12);l.set(h,5.5,r[2]*.25),c.set(r[0],.9,r[2]),o=Math.max(14,Math.min(38,1100/Math.max(8,Math.abs(h-r[0]))*.9));break}case 3:l.set(r[0]-a*26,46,r[2]*.4-14),c.set(r[0]+a*4,0,r[2]),o=42;break;case 4:{if(e.lineKind==="goal"){const h=a*bt.HL,u=Math.sign(e.ballRaw[2]||1);l.set(h,2.6,u*(bt.HW+9)),c.set(h,.1,e.ballRaw[2]),o=14}else{const h=e.lineX!==null&&e.lineX!==void 0?e.lineX:r[0];l.set(h,13,-44),c.set(h,0,r[2]*.75),o=21}break}case 5:{let h=-.17,u=-1;if(e.pair){const[f,d]=e.pair,p=Math.hypot(f,d)||1;h=-d/p,u=f/p,u>0&&(h=-h,u=-u)}l.set(r[0]+h*17,3.2,r[2]+u*17),c.set(r[0],.85,r[2]),o=10;break}}s.position.copy(l),s.lookAt(c),s.fov=o,s.aspect=n}function Ax(s,t,e){const n=t.zoom||1;if(n<=1.001){s.clearViewOffset(),s.updateProjectionMatrix();return}const i=e.w,r=e.h,a=i/n,o=r/n,l=i-a,c=r-o;t.panX=Math.max(-.5,Math.min(.5,t.panX||0)),t.panY=Math.max(-.5,Math.min(.5,t.panY||0));const h=l/2+t.panX*l,u=c/2+t.panY*c;s.setViewOffset(i,r,h,u,a,o),s.updateProjectionMatrix()}class a1{constructor(){this.cam=xc(),this.x=0,this.z=0,this.zoom=26}update(t,e,n,i){const r=1-Math.exp(-e*2.2);this.x+=(t[0]-this.x)*r,this.z+=(t[2]-this.z)*r*.7;const a=i?16:26;this.zoom+=(a-this.zoom)*(1-Math.exp(-e*1.5)),this.cam.position.set(this.x*.82,21,-54),this.cam.lookAt(this.x,.5,this.z*.55),this.cam.fov=this.zoom*(n<1.4?1.25:1),this.cam.aspect=n,this.cam.clearViewOffset(),this.cam.updateProjectionMatrix()}}const Rx=["Ahmet","Mehmet","Mustafa","Emre","Burak","Cem","Can","Deniz","Eren","Furkan","Gökhan","Hakan","İlker","Kaan","Kerem","Levent","Murat","Oğuz","Okan","Onur","Ozan","Serkan","Sinan","Tolga","Tuna","Ufuk","Umut","Volkan","Yasin","Yiğit","Zafer","Alper","Barış","Batuhan","Berk","Cenk","Doğan","Ege","Ferhat","Halil","İsmail","Kadir","Kemal","Mert","Necati","Orhan","Rıdvan","Selim","Taner","Tarık","Utku","Yunus","Arda","Baran","Çağan","Efe","Erdem","Görkem","Koray","Polat"],kx=["Yılmaz","Kaya","Demir","Şahin","Çelik","Yıldız","Öztürk","Aydın","Özdemir","Arslan","Doğan","Kılıç","Aslan","Çetin","Kara","Koç","Kurt","Özkan","Şimşek","Polat","Korkmaz","Karaca","Tekin","Erdem","Güneş","Bulut","Aksoy","Tunç","Akın","Uçar","Işık","Duman","Sarı","Bozkurt","Çınar","Toprak","Ateş","Ekinci","Gök","Taş","Yazıcı","Keskin","Avcı","Ergin","Sezer","Uysal","Altun","Bayram","Karataş","Kocabaş","Yalçın","Önal","Turan","Erbay","Soylu","Kalkan","Acar","Ercan"],Cx=["Lukas","Mateo","Jonas","Rafael","Nico","Elias","Tomás","Viktor","Marco","Sven","Diego","Pierre","Anders","Luca","Adrien","Oskar"],Px=["Halvorsen","Moreau","Kovač","Brandt","Ferreira","Lindqvist","Rossetti","Dvořák","Navarro","Weller","Castell","Ostrander","Varga","Delacroix","Mertens","Sorensen"],Lx=[1,2,4,5,3,7,6,8,11,9,10],Ix=["GK","DR","DC","DC","DL","MR","MC","MC","ML","FW","FW"];function Na(s,t=!1){const e=new Set,n=[];for(let i=0;i<11;i++){let r;do{const a=t&&s.chance(.75)?s.pick(Cx):s.pick(Rx),o=t&&s.chance(.75)?s.pick(Px):s.pick(kx);r=`${a} ${o}`}while(e.has(r));e.add(r),n.push({name:r,num:Lx[i],role:Ix[i],skin:s.pick(["#f1c27d","#e0ac69","#c68642","#8d5524","#ffdbac","#d9a066"]),hair:s.pick(["#1b1b1b","#3b2a1a","#5a3a1a","#2a2a2a","#7a5a30","#c9a050"])})}return n}const Dx=["Suat Düdükçüoğlu","Kenan Yeşilçim","Tamer Kuralsever","Halit Adaletli","Bora Kartçı","Serdar Düzgün"],Nx=["Nazlı Ekrancı","Cihan Ayrıntı","Pelin Karelik","Oktay Monitör"];function M(s,t,...e){const[n,...i]=s.split("."),r=document.createElement(n||"div");if(i.length&&(r.className=i.join(" ")),t)for(const[a,o]of Object.entries(t))o==null||o===!1||(a==="class"?r.className+=(r.className?" ":"")+o:a==="style"&&typeof o=="object"?Object.assign(r.style,o):a.startsWith("on")&&typeof o=="function"?r.addEventListener(a.slice(2).toLowerCase(),o):a==="html"?r.innerHTML=o:a==="text"?r.textContent=o:r.setAttribute(a,o===!0?"":o));for(const a of e.flat(3))a==null||a===!1||r.appendChild(typeof a=="string"||typeof a=="number"?document.createTextNode(String(a)):a);return r}function ma(s){for(;s.firstChild;)s.removeChild(s.firstChild);return s}let ga=null;function di(s,t=""){ga||(ga=M("div.toasts"),document.body.appendChild(ga));const e=M("div.toast"+(t?"."+t:""),null,s);ga.appendChild(e),setTimeout(()=>e.classList.add("out"),2600),setTimeout(()=>e.remove(),3200)}function Ed(s,t,e){const n=M("div.modal-wrap"),i=M("div.modal",null,M("h2",null,s),M("div.modal-body",null,t),M("div.modal-btns",null,...e.map(r=>M("button.btn"+(r.cls?"."+r.cls:""),{onclick:()=>{n.remove(),r.on&&r.on()}},r.label))));return n.appendChild(i),document.body.appendChild(n),n}function mu(s){s=Math.max(0,s);const t=Math.floor(s/60),e=Math.floor(s%60);return`${String(t).padStart(2,"0")}:${String(e).padStart(2,"0")}`}const Ox=[[-50,0],[-34,20],[-37,7],[-37,-7],[-34,-20],[-14,22],[-16,7],[-16,-7],[-14,-22],[3,6],[3,-6]],Ux=[[-50,0],[-30,22],[-33,8],[-33,-8],[-30,-22],[-14,24],[-15,8],[-15,-8],[-14,-24],[-1,1.5],[-6,-8]];function va(s,t,e,n,i=[0,0]){const r=Ox[s];if(s===0){const c=-50.5+Math.max(0,(t+20)*.04);return[Math.min(c,-47),e*.12]}let a=r[0]*.62+t*.48+(n?7:-3);const o=s<=4?0:s<=8?1:2;o===0&&(a=Math.min(a,t-6)),o===2&&!n&&(a=Math.max(a,-12)),a=Math.max(-46,Math.min(46,a));let l=r[1]*.82+e*.28;return l=Math.max(-31,Math.min(31,l)),[a+i[0],l+i[1]]}const Fx=2.4,Ho=9.81,gu=2.6;class Td{constructor(t){this.rng=new Ve(t.seed),this.squads=t.squads,this.ents=[];for(let e=0;e<Ls;e++){const n=e<11?0:e<22?1:2,i=e<22?e%11:-1,r=n<2?this.squads[n][i]:null;this.ents.push({id:e,team:n,idx:i,num:r?r.num:0,name:r?r.name:e===rn?"Hakem":"Yan hakem",role:r?r.role:"REF",x:0,z:0,h:0,ph:this.rng.range(0,6.28),sp:0,vx:0,vz:0,pose:dt.LOCO,pt:0,p1:0,p2:0,p3:0,anim:null,active:!0,yellow:0,red:!1,wander:[0,0],wanderT:0,decide:.5,kickCd:0,tackleT:0})}this.ball={x:0,y:pe,z:0,vx:0,vy:0,vz:0,spin:0,owner:-1,lastTeam:0,lastKicker:-1,kickerCd:0,shot:null,intended:-1,held:!1},this.half=1,this.score=[0,0],this.minute=0,this.mode="free",this.events=[],this.setPiece=null,this.celebrate=0,this.sinceRestart=0,this.sc=null,this.sf=0,this.possTeam=0,this.kickoff(0)}dir(t){return this.half===1==(t===0)?1:-1}rel(t,e,n){const i=this.dir(t);return[i*e,i*n]}world(t,e,n){const i=this.dir(t);return[i*e,i*n]}emit(t){this.events.push(t)}activePlayers(t){return this.ents.filter(e=>e.team===t&&e.active)}kickoff(t){this.mode="free",this.celebrate=0;for(const n of this.ents){if(n.team>1)continue;const i=Ux[n.idx];let[r,a]=i;n.team!==t&&n.idx>=9&&(r=-10,a=n.idx===9?6:-6);const[o,l]=this.world(n.team,r,a);this.place(n,o,l,this.dir(n.team)>0?0:Math.PI)}this.placeOfficials(0,0),this.setBall(0,0);const e=this.ents[t*11+9].active?this.ents[t*11+9]:this.nearest(t,0,0);this.place(e,-this.dir(t)*.4,.2,this.dir(t)>0?0:Math.PI),this.setPiece={type:"kickoff",team:t,x:0,z:0,t:0,taker:e.id},this.possTeam=t,this.sinceRestart=0}restart(t,e,n,i="fk"){this.mode="free",this.celebrate=0,e=Qt(e,-52,52),n=Qt(n,-33.8,33.8);for(const o of this.ents){if(o.team>1||!o.active)continue;const[l,c]=this.rel(o.team,e,n),[h,u]=va(o.idx,l,c,o.team===t);let[f,d]=this.world(o.team,h,u);if(o.team!==t){const p=Math.hypot(f-e,d-n);if(p<9.2){const v=9.2/(p||1);f=e+(f-e)*v,d=n+(d-n)*v}}this.place(o,f,d,Math.atan2(n-d,e-f)),o.pose=dt.LOCO,o.anim=null}this.placeOfficials(e,n),this.setBall(e,n);let r;i==="goalkick"?r=this.ents[t*11]:r=this.nearest(t,e,n,!0);const a=this.dir(t);this.place(r,e-a*.8,n,a>0?0:Math.PI),this.setPiece={type:i,team:t,x:e,z:n,t:0,taker:r.id},this.possTeam=t,this.sinceRestart=0}place(t,e,n,i){t.x=e,t.z=n,t.vx=0,t.vz=0,t.sp=0,i!==void 0&&(t.h=i),t.pose=t.active?dt.LOCO:dt.HIDDEN,t.anim=null,t.pt=0,t.p1=0,t.p2=0,t.p3=0}placeOfficials(t,e){const n=this.ents[rn];this.place(n,t-8,Qt(e*.5-10,-28,28),0),this.place(this.ents[ur],20,bt.HW+.9,-Math.PI/2),this.place(this.ents[Ea],-20,-34-.9,Math.PI/2)}setBall(t,e){const n=this.ball;n.x=t,n.z=e,n.y=pe,n.vx=n.vy=n.vz=0,n.owner=-1,n.shot=null,n.intended=-1,n.held=!0}nearest(t,e,n,i=!1){let r=null,a=1/0;for(const o of this.ents){if(o.team!==t||!o.active||i&&o.idx===0)continue;const l=Math.hypot(o.x-e,o.z-n);l<a&&(a=l,r=o)}return r}sendOff(t){const e=this.ents[t];e.active=!1,e.red=!0,this.place(e,e.x,e.team===0?-40:40),e.pose=dt.HIDDEN}step(){this.mode==="script"?this.stepScript():this.mode==="free"&&this.stepFree()}animate(t){if(t.anim&&(t.anim.f++,t.pose=t.anim.pose,t.pt=Math.min(1,t.anim.f/t.anim.n),t.p1=t.anim.p1,t.p2=t.anim.p2,t.p3=t.anim.p3,t.anim.f>=t.anim.n)){const e=t.anim.next;t.anim=e||null,e||(t.pose=dt.LOCO,t.pt=0,t.p1=t.p2=t.p3=0)}}playAnim(t,e,n,i=0,r=0,a=0,o=null){t.anim={pose:e,n,f:0,p1:i,p2:r,p3:a,next:o}}moveTo(t,e,n,i,r,a){const o=e-t.x,l=n-t.z,c=Math.hypot(o,l),h=c<.25?0:Math.min(i,c*1.3+.3),u=(c>1e-6?o/c*h:0)-t.vx,f=(c>1e-6?l/c*h:0)-t.vz,d=Math.hypot(u,f),p=6.5*te,v=d>p?p/d:1;t.vx+=u*v,t.vz+=f*v,t.x+=t.vx*te,t.z+=t.vz*te,t.sp=Math.hypot(t.vx,t.vz),t.sp>1.2?t.h=wa(t.h,Math.atan2(t.vz,t.vx),.22):r!==void 0&&(t.h=wa(t.h,Math.atan2(a-t.z,r-t.x),.12)),t.ph+=t.sp*te*(2*Math.PI/Fx)}stepFree(){const t=this.ball,e=this.rng;this.sinceRestart+=te,t.kickerCd>0&&(t.kickerCd-=te);const n=this.setPiece;if(n){n.t+=te;const r=this.ents[n.taker];r.active||(n.taker=this.nearest(n.team,n.x,n.z).id);const a=Math.hypot(r.x-n.x,r.z-n.z);n.t>.9&&a<1.2&&(t.held=!1,t.owner=r.id,t.lastTeam=r.team,r.decide=0,r.forcePass=!0,this.setPiece=null,this.possTeam=r.team,n.type!=="kickoff"?this.emit({type:"whistleShort"}):this.emit({type:"whistle"}))}const i=t.owner>=0?this.ents[t.owner]:null;i?this.possTeam=i.team:!n&&!t.shot&&(this.possTeam=t.lastTeam);for(const r of this.ents)r.team>1||(r.wanderT-=te,r.wanderT<=0&&(r.wanderT=e.range(1.5,4),r.wander=[e.range(-4,4),e.range(-3,3)]));for(const r of[0,1])this.teamAI(r,i);if(i&&this.ownerAI(i),i&&!i.kicking){const r=.55+.12*Math.sin(i.ph*.5);t.x=i.x+Math.cos(i.h)*r,t.z=i.z+Math.sin(i.h)*r,t.y=pe,t.vx=i.vx,t.vz=i.vz,t.vy=0,t.spin+=i.sp*te/pe}else t.held||(this.ballPhysics(),t.held||this.ballControl());this.checkBoundaries(),this.officialsAI();for(const r of this.ents)this.animate(r);this.celebrate>0&&(this.celebrate-=te,this.celebrate<=0&&this.emit({type:"kickoffNeeded",team:this.celebrateTeam}))}teamAI(t,e){const n=this.ball,i=this.possTeam===t,[r,a]=this.rel(t,n.x,n.z),o=this.activePlayers(t),l=o.filter(d=>d.idx!==0).map(d=>({e:d,d:Math.hypot(d.x-n.x,d.z-n.z)})).sort((d,p)=>d.d-p.d),c=l[0]?l[0].e:null,h=l[1]?l[1].e:null,u=this.activePlayers(1-t).map(d=>this.rel(t,d.x,d.z)[0]).sort((d,p)=>p-d),f=Math.max(u[1]!==void 0?u[1]:0,r,0);for(const d of o){if(e&&d===e)continue;if(d.kicking){this.kickStep(d);continue}let p,v,g=5.2;if(this.celebrate>0){const R=this.ents[this.scorer];d.team===R.team?(p=R.x,v=R.z,g=4,this.moveTo(d,p+d.idx%3-1,v+d.idx%4-1.5,g,R.x,R.z)):this.moveTo(d,d.x,d.z,1,n.x,n.z);continue}const[m,_]=this.rel(t,d.x,d.z);if([p,v]=va(d.idx,r,a,i,d.wander),i&&d.role==="FW"&&(p=Math.min(p+6,f-.8)),i&&!e&&n.intended===d.id)[p,v]=this.rel(t,n.x+n.vx*.35,n.z+n.vz*.35),g=6.5;else if(!e&&!this.setPiece&&d===c&&!n.shot)[p,v]=this.rel(t,n.x+n.vx*.4,n.z+n.vz*.4),g=7;else if(!i&&e&&d===c){const[R,w]=this.rel(t,e.x,e.z);p=R-.9,v=w,g=6.6,Math.hypot(d.x-e.x,d.z-e.z)<1.25&&!e.kicking?(d.tackleT+=te,d.tackleT>.45&&this.rng.chance(.05)&&this.tackle(d,e)):d.tackleT=0}else if(!i&&e&&d===h){const[R,w]=this.rel(t,e.x,e.z);p=Math.max(R-9,m-2),v=w*.7,g=5.5}if(this.setPiece&&this.setPiece.taker===d.id){const R=this.dir(t);if([p,v]=this.rel(t,this.setPiece.x-R*.7,this.setPiece.z),g=6,this.setPiece.t>3){this.place(d,this.setPiece.x-R*.7,this.setPiece.z,R>0?0:Math.PI);continue}}if(d.idx===0){if(n.shot&&n.shot.team!==t)this.keeperSave(d,t);else{const[R,w]=va(0,r,a,i);p=R,v=w,g=4,!e&&!this.setPiece&&r<-36&&Math.abs(a)<18&&d===this.nearest(t,n.x,n.z)&&!n.shot&&([p,v]=[r,a],g=6)}if(d.pose===dt.DIVE&&d.anim){this.moveTo(d,d.x+d.vx*.1,d.z+d.vz*.1,6);continue}}p=Qt(p,-51.5,51.5),v=Qt(v,-33,33);const[x,y]=this.world(t,p,v);this.separate(d,x,y,g)}}separate(t,e,n,i){let r=0,a=0;for(const o of this.ents){if(o===t||o.team>1||!o.active)continue;const l=t.x-o.x,c=t.z-o.z,h=l*l+c*c;if(h<2.2&&h>1e-4){const u=Math.sqrt(h);r+=l/u*(1.5-u),a+=c/u*(1.5-u)}}this.moveTo(t,e+r*2,n+a*2,i,this.ball.x,this.ball.z)}tackle(t,e){const n=this.ball,i=this.rng;if(t.tackleT=0,this.playAnim(t,dt.LUNGE,14,.75,.22,.08),i.chance(.5))n.owner=t.id,n.lastTeam=t.team,t.decide=i.range(.3,.8);else{n.owner=-1;const r=t.h+i.range(-.8,.8),a=i.range(4,7);n.vx=Math.cos(r)*a,n.vz=Math.sin(r)*a,n.vy=.5,n.lastTeam=t.team,n.lastKicker=t.id,n.kickerCd=.3}e.decide=.4}ownerAI(t){this.ball;const e=this.rng;if(t.kicking){this.kickStep(t);return}if(this.celebrate>0){this.moveTo(t,t.x,t.z,1);return}const n=t.team,[i,r]=this.rel(n,t.x,t.z);let a=1/0;for(const u of this.activePlayers(1-n))a=Math.min(a,Math.hypot(u.x-t.x,u.z-t.z));if(t.idx===0){t.holdT=(t.holdT||0)+te,this.moveTo(t,t.x,t.z,1,0,0),t.holdT>1.4&&(t.holdT=0,this.pass(t,!0));return}t.decide-=te;let o=i+8,l=r*.85;i>38&&(l=r*.5);const[c,h]=this.world(n,Qt(o,-50,51),Qt(l,-32,32));if(this.moveTo(t,c,h,a<3?6.2:5.4),t.decide<=0||t.forcePass||a<1.4){t.decide=e.range(.5,1.3);const u=i>27&&Math.abs(r)<17;t.forcePass?(t.forcePass=!1,this.pass(t,!1)):u&&e.chance(i>36?.55:.28)?this.shoot(t):(e.chance(.55)||a<2.2)&&this.pass(t,!1)}}beginKick(t,e){t.kicking={f:0,launch:e},this.playAnim(t,dt.KICK,15)}kickStep(t){const e=t.kicking;e.f++,this.moveTo(t,t.x+Math.cos(t.h)*.6,t.z+Math.sin(t.h)*.6,2.5);const n=this.ball;e.f<9&&n.owner===t.id&&(n.x=t.x+Math.cos(t.h)*.62,n.z=t.z+Math.sin(t.h)*.62,n.y=pe),e.f===9&&n.owner===t.id&&(n.owner=-1,n.held=!1,e.launch(n),n.lastTeam=t.team,n.lastKicker=t.id,n.kickerCd=.35,this.emit({type:"kick",power:Math.hypot(n.vx,n.vy,n.vz)})),e.f>=15&&(t.kicking=null)}pass(t,e){const n=this.rng,i=t.team,[r,a]=this.rel(i,t.x,t.z),o=this.activePlayers(1-i);let l=null,c=-1/0;for(const v of this.activePlayers(i)){if(v===t||v.idx===0)continue;const[g,m]=this.rel(i,v.x,v.z),_=Math.hypot(g-r,m-a);if(_<6||_>(e?55:38))continue;let x=9;for(const R of o)x=Math.min(x,zx(R.x,R.z,t.x,t.z,v.x,v.z));if(x<1.3)continue;const y=(g-r)*.35+Math.min(x,6)*1.2-Math.abs(_-(e?30:16))*.08+n.range(0,2.5);y>c&&(c=y,l=v)}if(!l&&(e&&(l=this.activePlayers(i).filter(v=>v.idx>0)[n.int(0,5)]||null),!l))return;const h=l,u=h.x+h.vx*.6,f=h.z+h.vz*.6,d=Math.hypot(u-t.x,f-t.z);t.h=Math.atan2(f-t.z,u-t.x);const p=e||d>30||n.chance(.12);this.beginKick(t,v=>{const g=u-v.x,m=f-v.z,_=Math.hypot(g,m)||1;if(p){const x=Qt(_*.55+6,12,24),y=_/x;v.vx=g/_*x,v.vz=m/_*x,v.vy=.5*Ho*y*.92}else{const x=Math.sqrt(25+2*gu*_);v.vx=g/_*x,v.vz=m/_*x,v.vy=0}v.intended=h.id})}shoot(t){const e=this.rng,n=t.team,[i,r]=this.rel(n,t.x,t.z),a=Math.hypot(52.5-i,r),o=Qt(.3-a*.0085,.05,.26),l=e.next(),c=l<o?"goal":l<o+.5?"save":"wide";let h,u;c==="goal"?(h=e.sign()*e.range(1.2,3.2),u=e.range(.25,2)):c==="save"?(h=e.range(-2.2,2.2),u=e.range(.3,1.8)):e.chance(.6)?(h=e.sign()*e.range(4.2,7),u=e.range(.3,1.5)):(h=e.range(-3,3),u=e.range(2.75,3.6));const[f,d]=this.world(n,53.2,h);t.h=Math.atan2(d-t.z,f-t.x),this.beginKick(t,p=>{const v=f-p.x,g=d-p.z,m=Math.hypot(v,g)||1,_=e.range(22,28),x=m/_;p.vx=v/m*_,p.vz=g/m*_,p.vy=(u-p.y+.5*Ho*x*x)/x,p.shot={team:n,outcome:c,gZ:h},p.intended=-1,this.emit({type:"shot",team:n,outcome:c})})}keeperSave(t,e){const n=this.ball,[i,r]=this.rel(e,t.x,t.z),[a,o]=this.rel(e,n.x,n.z),[l,c]=this.rel(e,n.vx,n.vz),h=l<-.1?(i-a)/l:.5,u=o+c*Math.max(0,h),f=n.shot.outcome;let d=f==="goal"?r-Math.sign(u-r)*.3:u;d=Qt(d,-3.5,3.5);const[p,v]=this.world(e,-51.3,d);if(h<.35&&Math.abs(u-r)>.9&&t.pose!==dt.DIVE&&f!=="wide"){const g=Math.sign(this.rel(e,-Math.sin(t.h),Math.cos(t.h))[1]*(u-r))||1;this.playAnim(t,dt.DIVE,26,f==="goal"?-g:g),t.vx=(p-t.x)*2.5,t.vz=(v-t.z)*2.5}this.moveTo(t,p,v,f==="goal"?3:6.5,n.x,n.z),f==="save"&&Math.hypot(n.x-t.x,n.z-t.z)<1.6&&n.y<2.5&&(n.shot=null,n.owner=t.id,n.lastTeam=e,n.vx=n.vy=n.vz=0,t.holdT=0,this.emit({type:"save",team:e}))}ballPhysics(){const t=this.ball;if(t.y<=pe+.005&&Math.abs(t.vy)<.01||(t.vy-=Ho*te,t.vx*=.999,t.vz*=.999),t.x+=t.vx*te,t.y+=t.vy*te,t.z+=t.vz*te,t.y<pe&&(t.y=pe,t.vy<-1.6?(t.vy=-t.vy*.5,t.vx*=.9,t.vz*=.9):t.vy=0),t.y<=pe+.005&&t.vy===0){const n=Math.hypot(t.vx,t.vz);if(n>0){const i=Math.max(0,n-gu*te);t.vx*=i/n,t.vz*=i/n}}t.spin+=Math.hypot(t.vx,t.vz)*te/pe}ballControl(){const t=this.ball;if(t.shot||t.y>1.3)return;let e=null,n=1;for(const i of this.ents){if(i.team>1||!i.active||i.kicking||i.id===t.lastKicker&&t.kickerCd>0)continue;const r=Math.hypot(i.x-t.x,i.z-t.z);r<n&&(n=r,e=i)}e&&(e.team!==t.lastTeam&&this.emit({type:"interception",team:e.team}),t.owner=e.id,t.lastTeam=e.team,t.intended=-1,e.decide=this.rng.range(.35,1))}checkBoundaries(){const t=this.ball;if(t.held||t.owner>=0&&!this.ents[t.owner].kicking&&this.ents[t.owner].idx===0)return;const e=pe;if(Math.abs(t.x)>bt.HL+e&&Math.abs(t.z)<bt.GOAL_HW-e&&t.y<bt.GOAL_H-e&&this.celebrate<=0){const n=this.dir(0)*Math.sign(t.x)>0?0:1;this.goal(n);return}if(this.celebrate>0){Math.abs(t.x)>bt.HL+1.8&&(t.x=Math.sign(t.x)*(bt.HL+1.8),t.vx=0,t.vz*=.5);return}if(Math.abs(t.z)>bt.HW+e){const n=1-t.lastTeam;this.emit({type:"out",kind:"taç"}),this.restart(n,Qt(t.x,-52,52),Math.sign(t.z)*(bt.HW-.1),"throw");return}if(Math.abs(t.x)>bt.HL+e){const n=this.dir(0)*Math.sign(t.x)>0?1:0;t.lastTeam===n?(this.emit({type:"out",kind:"korner"}),this.restart(1-n,Math.sign(t.x)*(bt.HL-.3),Math.sign(t.z||1)*(bt.HW-.3),"corner")):(this.emit({type:"out",kind:"aut"}),this.restart(n,Math.sign(t.x)*(bt.HL-5.5),Math.sign(t.z||1)*3,"goalkick"))}}goal(t,e){this.score[t]++;const n=this.ball;n.shot=null,n.owner=-1;let i=e;i===void 0&&(i=n.lastKicker>=0&&this.ents[n.lastKicker].team===t?n.lastKicker:this.activePlayers(t).find(r=>r.role==="FW").id),this.scorer=i,this.celebrate=3.2,this.celebrateTeam=1-t,this.playAnim(this.ents[i],dt.CELEB,70),this.emit({type:"goal",team:t,scorer:i})}officialsAI(){const t=this.ball,e=this.ents[rn],n=this.dir(this.possTeam),i=Qt(t.x-n*11,-45,45),r=Qt(t.z*.55-Math.sign(t.z||1)*9,-27,27);e.anim||this.moveTo(e,i,r,6,t.x,t.z),this.arStep(this.ents[ur],1),this.arStep(this.ents[Ea],-1)}arStep(t,e){const n=this.dir(0)===e?1:0,i=this.activePlayers(n).map(l=>l.x*e).sort((l,c)=>c-l),r=Math.max(i[1]!==void 0?i[1]:0,this.ball.x*e),a=e*Qt(r,0,bt.HL),o=e*(bt.HW+.9);t.anim||(this.moveTo(t,a,o,7),t.sp<1.5&&(t.h=wa(t.h,e>0?-Math.PI/2:Math.PI/2,.2)))}startScript(t){this.mode="script",this.sc=t,this.sf=0,this.setPiece=null,this.celebrate=0;const e=this.ball;e.owner=-1,e.shot=null,e.held=!1,e.intended=-1;for(const[i,r]of t.tracks){const a=this.ents[i];r.get(0,a),a.vx=a.vz=0,a.anim=null}for(const i of this.ents){if(t.tracks.has(i.id)||!i.active||(i.anim=null,i.pose=dt.LOCO,i.pt=0,i.p1=i.p2=i.p3=0,i.kicking=null,i.team>1))continue;const[r,a]=this.shadowTarget(i,0);this.place(i,r,a,Math.atan2(t.bz[0]-a,t.bx[0]-r))}const n=this.ents[rn];t.tracks.has(rn)||this.place(n,t.bx[0]-t.dir*12,Qt(t.bz[0]*.5-9,-27,27)),this.stepScriptBall(0)}shadowTarget(t,e){const n=this.sc,i=n.attackTeam,[r,a]=this.rel(t.team,n.bx[e],n.bz[e]);let[o,l]=va(t.idx,r,a,t.team===i,[0,0]),[c,h]=this.world(t.team,o,l);n.constrain&&([c,h]=n.constrain(t,c,h,e));for(const u of n.keep||[]){const f=n.tracks.get(u);if(!f)continue;const d=c-f.x[e],p=h-f.z[e],v=Math.hypot(d,p),g=n.keepR||4;if(v<g){const m=g/(v||1);c=f.x[e]+d*m,h=f.z[e]+p*m}}return[Qt(c,-52,52),Qt(h,-33.5,33.5)]}stepScriptBall(t){const e=this.ball,n=this.sc,i=n.bx[t],r=n.by[t],a=n.bz[t];e.spin+=Math.hypot(i-e.x,a-e.z)/pe,e.x=i,e.y=r,e.z=a}stepScript(){const t=this.sc,e=Math.min(this.sf,t.n-1);for(const[n,i]of t.tracks){const r=this.ents[n],a=r.x,o=r.z;i.get(e,r),r.vx=(r.x-a)/te,r.vz=(r.z-o)/te}for(const n of this.ents)if(!(t.tracks.has(n.id)||!n.active)&&n.team<=1){const[i,r]=this.shadowTarget(n,e);this.moveTo(n,i,r,n.idx===0?4:5.5,t.bx[e],t.bz[e])}if(!t.tracks.has(rn)){const n=this.ents[rn],i=Qt(t.bx[e]-t.dir*12,-45,45),r=Qt(t.bz[e]*.5-Math.sign(t.bz[e]||1)*9,-27,27);this.moveTo(n,i,r,6,t.bx[e],t.bz[e])}for(const n of[ur,Ea])t.tracks.has(n)||this.arStep(this.ents[n],n===ur?1:-1);for(const n of this.ents)t.tracks.has(n.id)||n.pose!==dt.HIDDEN&&(n.pose=dt.LOCO,n.pt=0,n.p1=n.p2=n.p3=0);for(const n of t.overlays){if(e<n.f0||e>n.f1)continue;const i=this.ents[n.id];i.pose=n.pose,i.pt=n.f1>n.f0?(e-n.f0)/(n.f1-n.f0):1,i.p1=n.p1,i.p2=n.p2,i.p3=n.p3,n.toward&&(i.p1=vc(Math.atan2(n.toward[1]-i.z,n.toward[0]-i.x)-i.h))}this.stepScriptBall(e);for(const n of t.events)n.f===e&&this.emit({...n,script:!0});this.sf++,this.sf>=t.n&&(this.mode="hold",this.emit({type:"scriptEnd"}))}}function zx(s,t,e,n,i,r){const a=i-e,o=r-n,l=a*a+o*o,c=l>0?Qt(((s-e)*a+(t-n)*o)/l,0,1):0;return Math.hypot(s-(e+a*c),t-(n+o*c))}const he={A:0,B:1,X:2,Y:3,LB:4,RB:5,LT:6,RT:7,BACK:8,START:9,R3:11,UP:12,DOWN:13,LEFT:14,RIGHT:15},Bx=new Set([he.LT,he.RT,he.UP,he.DOWN,he.LEFT,he.RIGHT]);class Hx{constructor(t){this.app=t,this.prev=[],this.hold={},this.x=window.innerWidth/2,this.y=window.innerHeight/2,this.cursorT=0,this.connected=null,this.focusEl=null,this.cursor=M("div.gp-cursor",{style:{display:"none"}}),document.body.appendChild(this.cursor),window.addEventListener("gamepadconnected",e=>{this.connected=e.gamepad.id,di("🎮 Kontrolcü bağlandı"),this.rumble(120,.4)}),window.addEventListener("gamepaddisconnected",()=>{this.connected=null,di("🎮 Kontrolcü ayrıldı","warn"),this.cursor.style.display="none"})}pad(){if(!navigator.getGamepads)return null;for(const t of navigator.getGamepads())if(t&&t.connected)return t;return null}rumble(t=100,e=.5){if(this.app.settings.gpRumble===!1)return;const n=this.pad(),i=n&&n.vibrationActuator;i&&i.playEffect&&i.playEffect("dual-rumble",{duration:t,strongMagnitude:e,weakMagnitude:e*.6}).catch(()=>{})}varView(){const t=this.app.screen;return t&&(t.varView||t.vv)||null}key(t,e=!1){window.dispatchEvent(new KeyboardEvent("keydown",{key:t,shiftKey:e,bubbles:!0}))}update(t){const e=this.pad();if(!e)return;const n=c=>Math.abs(c)<.18?0:(c-Math.sign(c)*.18)/.82,i=n(e.axes[0]||0),r=n(e.axes[1]||0),a=n(e.axes[2]||0),o=n(e.axes[3]||0);if(i||r){const c=950*(this.app.settings.gpSpeed||1)*t,h=Math.hypot(i,r),u=Math.pow(h,1.6)/(h||1);this.x=Math.max(0,Math.min(window.innerWidth-1,this.x+i*u*c)),this.y=Math.max(0,Math.min(window.innerHeight-1,this.y+r*u*c)),this.cursorT=6,this.setFocus(null),this.move()}if(this.cursorT>0&&(this.cursorT-=t,this.cursorT<=0&&(this.cursor.style.display="none")),a||o){const c=this.varView();if(c&&c.gamepadPan)c.gamepadPan(a*t*.9,o*t*.9);else{const h=this.scrollTarget();h&&(h.scrollTop+=o*t*900)}}const l=e.buttons.map(c=>c.pressed||c.value>.5);for(let c=0;c<l.length;c++)l[c]&&!this.prev[c]?(this.press(c),this.hold[c]=.32):l[c]&&Bx.has(c)&&(this.hold[c]-=t,this.hold[c]<=0&&(this.hold[c]=.07,this.press(c,!0)));this.prev=l}move(){const t=this.cursor;t.style.display="",t.style.transform=`translate(${this.x}px, ${this.y}px)`}scrollTarget(){let e=document.elementFromPoint(this.x,this.y);for(;e&&e!==document.body;){if(e.scrollHeight>e.clientHeight+4&&getComputedStyle(e).overflowY!=="visible")return e;e=e.parentElement}return document.querySelector(".page-body.scroll")||document.querySelector(".var-side")}clickAt(t,e){this.cursor.style.display="none";const n=document.elementFromPoint(t,e);if(this.cursor.style.display="",!n)return;const i={clientX:t,clientY:e,bubbles:!0,cancelable:!0,pointerId:77,button:0,pointerType:"mouse",isPrimary:!0};n.dispatchEvent(new PointerEvent("pointerdown",i)),n.dispatchEvent(new PointerEvent("pointerup",i)),n.dispatchEvent(new MouseEvent("click",i)),this.app.audio.unlock()}buttons(){return[...(document.querySelector(".modal-wrap:last-of-type .modal")||document.getElementById("ui")).querySelectorAll("button, input")].filter(n=>{if(n.disabled)return!1;const i=n.getBoundingClientRect();return i.width>2&&i.height>2&&i.bottom>0&&i.top<window.innerHeight&&getComputedStyle(n).visibility!=="hidden"})}setFocus(t){this.focusEl&&this.focusEl.classList.remove("gp-focus"),this.focusEl=t,t&&(t.classList.add("gp-focus"),t.scrollIntoView({block:"nearest"}))}nav(t,e){const n=this.buttons();if(!n.length)return;if(!this.focusEl||!n.includes(this.focusEl)){this.setFocus(n[0]);return}const i=this.focusEl.getBoundingClientRect(),r=i.left+i.width/2,a=i.top+i.height/2;let o=null,l=1/0;for(const c of n){if(c===this.focusEl)continue;const h=c.getBoundingClientRect(),u=h.left+h.width/2,f=h.top+h.height/2,d=(u-r)*t+(f-a)*e;if(d<=4)continue;const p=Math.abs((u-r)*e)+Math.abs((f-a)*t),v=d+p*2.2;v<l&&(l=v,o=c)}o&&(this.setFocus(o),this.app.audio.ui("tick"))}press(t,e=!1){const n=this.varView(),i=document.querySelector(".modal-wrap");if(n&&!i){this.pressVar(t,n,e);return}switch(t){case he.A:this.cursorT>0&&!this.focusEl?this.clickAt(this.x,this.y):this.focusEl&&this.focusEl.isConnected?(this.focusEl.click(),this.app.audio.unlock()):this.nav(0,1);break;case he.B:{if(i){if(i.querySelectorAll(".btn").length>1){const o=i.querySelector(".btn.primary");o&&o.click()}break}const r=document.querySelector(".page-head .btn");r?r.click():this.key("Escape");break}case he.START:this.key("Escape");break;case he.Y:this.key("f");break;case he.UP:this.nav(0,-1);break;case he.DOWN:this.nav(0,1);break;case he.LEFT:this.nav(-1,0);break;case he.RIGHT:this.nav(1,0);break}}pressVar(t,e,n){switch(t){case he.A:n||this.clickAt(this.x,this.y);break;case he.B:this.key("Escape");break;case he.START:this.key(" ");break;case he.LT:this.key("ArrowLeft");break;case he.RT:this.key("ArrowRight");break;case he.LEFT:this.key("ArrowLeft",!0);break;case he.RIGHT:this.key("ArrowRight",!0);break;case he.UP:this.key("+");break;case he.DOWN:this.key("-");break;case he.LB:this.key("[");break;case he.RB:this.key("]");break;case he.X:this.key("m"),this.rumble(60,.3);break;case he.Y:this.key("l");break;case he.BACK:this.key("Tab");break;case he.R3:this.key("0");break}}}class Gx{constructor(){this.save=new Tx,this.settings=this.save.settings,this.canvas=document.getElementById("gl"),this.uiRoot=document.getElementById("ui"),this.applyDevice(),this.gfx=new Wy(this.canvas,this.resolveQuality());const t=gi[4].teams,e=new Ve(7);this.defaultSetup={kits:vd(t[0],t[1]),squads:[Na(e),Na(e)],teams:[t[0],t[1]]},this.world=new fu(this.gfx,this.defaultSetup),this.audio=new Ex(this.settings),this.menuCam=xc(),this.screen=null,this.time=0,this.fpsEl=null,this.frames=0,this.fpsT=0,this.stack=[];const n=()=>{this.audio.unlock(),this.isTouch&&this.tryFullscreen()};window.addEventListener("pointerdown",n,{passive:!0}),window.addEventListener("keydown",i=>{this.audio.unlock(),this.screen&&this.screen.onKey&&this.screen.onKey(i)}),window.addEventListener("contextmenu",i=>i.preventDefault()),this.updateFpsEl(),this.gamepad=new Hx(this)}detectTouch(){const t=window.matchMedia&&window.matchMedia("(pointer: coarse)").matches;return navigator.maxTouchPoints>0&&t||"ontouchstart"in window&&t}applyDevice(){const t=this.settings.controls;this.isTouch=t==="auto"?this.detectTouch():t==="touch",document.body.classList.toggle("touch",this.isTouch)}resolveQuality(){const t=this.settings.quality;return t!=="auto"?t:this.detectTouch()?navigator.deviceMemory&&navigator.deviceMemory>=6?"orta":"dusuk":"yuksek"}rebuildGraphics(){const t=this.resolveQuality();t!==this.gfx.quality&&(this.gfx.applyQuality(t),this.gfx.scene.remove(this.world.root),this.world=new fu(this.gfx,this.world.setup||this.defaultSetup))}tryFullscreen(){if(this._fsTried)return;this._fsTried=!0;const t=document.documentElement,e=t.requestFullscreen?t.requestFullscreen():null;e&&e.then&&e.then(()=>{try{screen.orientation.lock("landscape").catch(()=>{})}catch{}}).catch(()=>{})}updateFpsEl(){this.settings.showFps&&!this.fpsEl&&(this.fpsEl=M("div.fps",null,"-- FPS"),document.body.appendChild(this.fpsEl)),!this.settings.showFps&&this.fpsEl&&(this.fpsEl.remove(),this.fpsEl=null)}persist(){this.save.persist()}show(t){this.screen&&this.screen.exit&&this.screen.exit(),this.uiRoot.innerHTML="",this.screen=t,t.el&&this.uiRoot.appendChild(t.el),t.enter&&t.enter()}start(){let t=performance.now();const e=n=>{const i=Math.min(.1,(n-t)/1e3);t=n,this.time+=i;try{this.gamepad.update(i),this.screen&&this.screen.update&&this.screen.update(i),this.audio.update(i),this.render(i)}catch(r){console.error(r)}this.frames++,this.fpsT+=i,this.fpsT>=.5&&(this.fpsEl&&(this.fpsEl.textContent=Math.round(this.frames/this.fpsT)+" FPS"),this.frames=0,this.fpsT=0),requestAnimationFrame(e)};requestAnimationFrame(e)}render(t){const e=this.gfx;if(e.clear(),this.screen&&this.screen.render){this.screen.render(e,t);return}this.renderMenuBackground(e,t)}renderMenuBackground(t,e=1/60){this.demo||(this.demo=new Td({seed:2024,squads:(this.world.setup||this.defaultSetup).squads}),this.demoAcc=0,this.demoFocus=[0,0]);const n=this.demo;for(this.demoAcc+=Math.min(.1,e);this.demoAcc>=te;){this.demoAcc-=te,n.step();for(const l of n.events)l.type==="kickoffNeeded"&&n.kickoff(l.team);n.events.length=0}this.world.apply((l,c)=>{const h=n.ents[l];return c.x=h.x,c.z=h.z,c.h=h.h,c.ph=h.ph,c.sp=h.sp,c.pose=h.active?h.pose:dt.HIDDEN,c.pt=h.pt,c.p1=h.p1,c.p2=h.p2,c.p3=h.p3,c},()=>[n.ball.x,n.ball.y,n.ball.z,n.ball.spin],!0),this.world.setCrowd(this.time,n.celebrate>0?1:0),this.world.setScoreboard(`${n.score[0]} - ${n.score[1]}`,"GÖSTERİ MAÇI","");const i=this.demoFocus,r=1-Math.exp(-e*.8);i[0]+=(n.ball.x-i[0])*r,i[1]+=(n.ball.z-i[1])*r;const a=this.time*.05,o=this.menuCam;if(o.position.set(i[0]*.6+Math.cos(a)*34,11+Math.sin(this.time*.13)*3,i[1]*.4+Math.sin(a)*26),o.lookAt(i[0],.8,i[1]),o.fov=38,this.debugCam){const l=this.debugCam,c=l.ent!==void 0?n.ents[l.ent]:null,h=c?[c.x,l.at[1],c.z]:l.at;o.position.set(h[0]+l.pos[0],l.pos[1],h[2]+l.pos[2]),o.lookAt(h[0],h[1],h[2]),o.fov=l.fov||30,l.freeze&&(this.demoAcc=-1e9)}o.aspect=t.w/t.h,o.clearViewOffset(),o.updateProjectionMatrix(),t.renderView(o,{x:0,y:0,w:t.w,h:t.h})}}const Vx="modulepreload",Wx=function(s,t){return new URL(s,t).href},vu={},_c=function(t,e,n){let i=Promise.resolve();if(e&&e.length>0){let a=function(h){return Promise.all(h.map(u=>Promise.resolve(u).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};const o=document.getElementsByTagName("link"),l=document.querySelector("meta[property=csp-nonce]"),c=l?.nonce||l?.getAttribute("nonce");i=a(e.map(h=>{if(h=Wx(h,n),h in vu)return;vu[h]=!0;const u=h.endsWith(".css"),f=u?'[rel="stylesheet"]':"";if(!!n)for(let v=o.length-1;v>=0;v--){const g=o[v];if(g.href===h&&(!u||g.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${f}`))return;const p=document.createElement("link");if(p.rel=u?"stylesheet":Vx,u||(p.as="script"),p.crossOrigin="",p.href=h,c&&p.setAttribute("nonce",c),document.head.appendChild(p),u)return new Promise((v,g)=>{p.addEventListener("load",v),p.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${h}`)))})}))}function r(a){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=a,window.dispatchEvent(o),!o.defaultPrevented)throw a}return i.then(a=>{for(const o of a||[])o.status==="rejected"&&r(o.reason);return t().catch(r)})};function Ln(s,t,e,n={}){return M("div.screen.page",null,M("div.page-head",null,M("button.btn.small",{onclick:()=>{s.audio.ui("click"),n.onBack?n.onBack():_c(()=>Promise.resolve().then(()=>Yd),void 0,import.meta.url).then(a=>s.show(new a.MenuScreen(s)))}},"← Geri"),M("h1",null,t),M("div.grow"),n.right||null),M("div.page-body.scroll",null,e))}function _n(s,t,e){const n=M("div.opt-group"),i=()=>{n.innerHTML="";for(const r of s)n.appendChild(M("button.btn.small"+(r.value===t?".on":""),{onclick:()=>{t=r.value,e(t),i()}},r.label))};return i(),n}const Xx={OFSAYT:["VAR, gol için kontrol ediyoruz. Ofsayt şüphesi var.","Golü kontrol edin, yardımcım tereddütlü."],PENALTI:["VAR, ceza sahasında temas var mı? Kontrol edin.","Penaltı pozisyonu, bakıyor musunuz?"],ELLE:["El var mı? Ben net göremedim, kontrol edin.","Elle oynama itirazı var, bakın lütfen."],KIRMIZI:["Müdahale sert mi? Kırmızı için kontrol edin.","Kartı gösterdim, siz bir bakın."],FAUL_GOL:["Golü kontrol edin, atakta bir şey var mı?","Gol öncesine bakın, savunma itiraz ediyor."],KIMLIK:["Kartı doğru oyuncuya mı gösterdim? Kontrol edin.","Numarayı teyit edin, kalabalıktı."],TOP_DISARI:["Top çizgiden çıktı mı? Golü kontrol edin.","Yardımcım emin değil, top dışarıda mıydı?"]},yu=["Ne oluyor, bekliyorum.","Oyuncular etrafımda, süre uzuyor!","Bir şey var mı yok mu? Söyleyin.","Tribünler çok gergin, hızlanalım.","Kontrol devam ediyor mu?","Kaptanlar sürekli soruyor, karar ne?"],o1=["Anlaşıldı, kontrol tamam. Devam.","Tamam, oyunu başlatıyorum."],l1=["Monitöre geliyorum.","Tamam, sahada inceleyeceğim."],c1=["Anlaşıldı, kararı düzeltiyorum.","Tamam, olgusal düzeltme yapıyorum."],Kx={OFSAYT:["Bence ofsayt kamerası (5) daha net, çizgiyi oradan çekelim.","Pas anını iyi bul, koşu çok hızlı.","Sondan ikinci savunmacıya dikkat, en geride kalan o."],PENALTI:["Yakın plan (6) temasın olup olmadığını gösteriyor.","Temas noktası çizgiye çok yakın, ceza sahası göstergesini aç.","Kale arkası (3) da işe yarar."],ELLE:["Yakın planda (6) topun nereye çarptığı görünüyor.","Kolun konumuna dikkat et, vücudu büyütüyor mu?"],KIRMIZI:["Yakın plan (6) krampon yüksekliğini gösteriyor.","Taktik kamera (4) kale tarafındaki savunmacıları gösterir."],FAUL_GOL:["Golden geriye sar, APP işaretine kadar bak.","Ters açı (2) mücadeleyi daha net gösteriyor."],KIMLIK:["Yakın planda (6) sırt numaralarını okuyabiliriz.","Çelmeyi takanla kartı göreni karşılaştır."],TOP_DISARI:["Çizgi kamerası (5) tam çizgiye bakıyor.","Topun en dış karesini bul."]},xu={OFFSIDE:"Bana ofsayt gibi geldi ama ölçmeden emin olamayız.",GOAL:"İlk izlenimim gol temiz.",PEN:"Bence temas var, ciddiye almak lazım.",NOFOUL:"Bana temas yok gibi geldi.",DIVE:"Bence oyuncu kendini attı.",FK:"Temas çizginin dışında olabilir.",RED:"Bu müdahale bence çok sert.",NORED:"Sert ama bence kırmızılık değil.",NOGOAL_FOUL:"Golden önce bir itme gördüm sanki.",NOGOAL_OUT:"Top çizgiyi geçmiş olabilir.",CONFIRM:"Bence kart doğru oyuncuya.",SW:"Bence kartı yanlış oyuncu gördü."},_u=[{name:"Necdet Kuralbilir",role:"Eski FIFA hakemi (kurgusal)",tone:"teknik",color:"#22d36b"},{name:"Bülent Taçoğlu",role:"Eski futbolcu",tone:"duygusal",color:"#ffb300"},{name:"Ayla Tezcan",role:"Spor yazarı",tone:"analitik",color:"#4fc3f7"}],Yx={teknik:{iyi:["Protokole birebir uygun bir VAR yönetimi. Gereksiz hiçbir müdahale yok.","Çizgiyi doğru karede çekti, işte modern hakemlik bu.","Ders kitabına girecek bir kontrol süreci."],orta:["Genel olarak iyi ama bir iki pozisyonda süre uzadı.","Bir kararda protokolün sınırında dolaştı.","Kötü değil ama mükemmel de değil."],kotu:["Açık ve net hatayı kaçırırsanız VAR’ın ne anlamı kalır?","Bu maçta VAR odası sınıfta kaldı.","Protokol böyle uygulanmaz arkadaşlar."]},duygusal:{iyi:["Valla helal olsun, bu akşam kimse VAR’dan şikâyet edemez!","Ben de itiraz ederdim ama görüntüler net, doğru karar.","Futbolun adaleti bu akşam sahadaydı."],orta:["Bir pozisyon var ki hâlâ içime sinmedi.","Taraftar haklı olarak sinirlendi bir ara.","İdare eder, ama bu ligde daha iyisini görmeliyiz."],kotu:["Bu nasıl karar? Ben oynasam saha ortasına oturur kalırdım!","Emeğe yazık, çok yazık!","VAR odasında uyuyorlar mıydı acaba?"]},analitik:{iyi:["Karar başına ortalama süre çok makul, doğruluk yüksek.","İstatistiksel olarak sezonun en iyi VAR performanslarından biri.","Kamera seçimleri isabetli, ölçümler hassas."],orta:["Doğruluk fena değil ama süre yönetimi geliştirilmeli.","Bir kritik pozisyondaki ölçüm hatası maçın notunu düşürdü.","Veriler karışık bir tablo çiziyor."],kotu:["Kaçırılan açık hata sayısı kabul edilebilir değil.","Bu maçın verileri MHK masasına gidecek.","Doğruluk oranı lig ortalamasının epey altında."]}},$x={dogru_mudahale:["{dk}. dakikadaki müdahale tam yerindeydi.","{dk}. dakikada VAR hatayı yakaladı, bravo."],dogru_kontrol:["{dk}. dakikada müdahale etmemek doğruydu.","{dk}. dakikadaki pozisyonda saha kararı zaten doğruydu."],gri_kontrol:["{dk}. dakika yoruma açıktı, hakeme saygı gösterildi."],kismi:["{dk}. dakikada doğru yöne gidildi ama karar tam isabet değildi."],gereksiz_gri:["{dk}. dakikada müdahaleye gerek yoktu, gri bir pozisyondu."],yanlis_mudahale:["{dk}. dakikadaki müdahale tamamen hatalıydı.","{dk}. dakikada doğru kararı bozdular!"],kacirilan:["{dk}. dakikada çok net bir hata vardı ve VAR görmedi!","{dk}. dakikadaki pozisyon affedilemez."],yanlis_duzeltme:["{dk}. dakikada müdahale etmek doğruydu ama yanlış karara gidildi."]},qx=[["@TribunSesi","Tribün Sesi"],["@OfsaytCizgisi","Ofsayt Çizgisi"],["@KaleArkasiTayfa","Kale Arkası"],["@EmekliHakemNuri","Emekli Hakem Nuri"],["@VARsizOlmaz","VAR’sız Olmaz"],["@FutbolIstatistik","Futbol İstatistik"],["@CimAdami","Çim Adamı"],["@KornerBayragi","Korner Bayrağı"],["@DuduklerSusmasin","Düdükler Susmasın"],["@KurgusalSpor","Kurgusal Spor Ajansı"],["@AnneminKulubu","Annemin Kulübü"],["@TaktikTahtasi","Taktik Tahtası"]],Zx={dogru_mudahale:["VAR odası bugün işini yaptı, {dk}. dakikadaki düzeltme tertemiz. 👏","{dk}. dakikada çizgiyi çeken arkadaşa çay ısmarlayın ☕","Hata yakalandı, adalet yerini buldu. {dk}'"],dogru_kontrol:["{dk}. dakikada müdahale etmediler, doğru. Herkes hakem olmuş yine 😅","Saha kararı doğruydu, VAR da öyle dedi. Tartışacak bir şey yok."],gri_kontrol:["{dk}. dakika tartışılır ama protokol böyle, gri pozisyona girilmez.","Penaltı mı değil mi? Saatlerce konuşuruz, VAR doğru yerde durdu."],kismi:["{dk}. dakikada yarım doğru... Bu da bir şey sanırım 🤷"],gereksiz_gri:["{dk}. dakikada ne gerek vardı monitöre? Hakemin kararı makuldü.","Her pozisyona VAR girerse maç 3 saat sürer ⏳"],yanlis_mudahale:["{dk}. dakikadaki müdahale bu sezonun en tuhaf olayı olabilir 🤯","Doğru kararı VAR bozdu. Ekranı ters mi takmışlar?","VAR odasına gözlük kampanyası başlatıyorum 👓"],kacirilan:["{dk}. dakikayı izleyen herkes gördü, VAR odası hariç 🙈","Bu pozisyonu kaçırmak için özel eğitim almak lazım.","{dk}' — kumanda bende olsaydı 3 saniyede bulurdum."],yanlis_duzeltme:["{dk}. dakikada müdahale doğru, karar yanlış. Yarım hamle 🙃"]},jx={iyi:["Bugünkü VAR performansı 10 numara. Böyle devam!","İlk kez bir maçtan sonra VAR’ı konuşmuyoruz, güzel duygu.","Hakem notu yüksek gelir bu maçta."],orta:["VAR fena değildi ama mükemmel de değildi.","Bir iki karar dışında sorun yok.","Ortalama bir VAR akşamı."],kotu:["Bu maçın VAR kayıtları müzeye kaldırılsın, ibret olsun.","MHK bu maçı mutlaka incelemeli.","Bu gidişle VAR odasına sesli asistan alacaklar 🤖"]},Jx={suspend:["MHK seni bir hafta görevlendirmedi. Bu haftayı eğitim videolarıyla geçireceksin.","Gözlemci raporu olumsuz: MHK bir hafta dinlenmeni istedi."],praise:["MHK Başkanı performansını tebrik etti. Bir sonraki görevin daha önemli olabilir.","Gözlemci raporunda “örnek VAR yönetimi” ifadesi var!"],warn:["MHK’dan uyarı: Protokole daha sıkı uymalısın.","Gözlemci notu: Kararlarda daha hızlı olmalısın."],promote:["Tebrikler! MHK seni bir üst klasmana yükseltti: {lig}.","Yeni sezon, yeni lig: Artık {lig} maçlarında görevlisin!"],demote:["Kötü performans serisi nedeniyle bir alt klasmana indirildin: {lig}."]},h1=["Top orta sahada, iki takım da kontrollü oynuyor.","Tempo yükseliyor, tribünler coştu.","Kanattan etkili bir atak gelişiyor.","Savunma hattı önde, ofsayt tuzağı kuruluyor.","Hakem oyunu akıcı tutuyor.","Ev sahibi baskıyı artırdı.","Deplasman ekibi kontra arıyor."],vi=[{key:"amator",name:"Bölgesel Amatör Lig",matches:3,minNote:6,minRep:0,diff:"kolay",inc:[4,4],icon:"🌱"},{key:"lig3",name:"3. Lig",matches:3,minNote:6.3,minRep:35,diff:"kolay",inc:[4,5],icon:"🥉"},{key:"lig2",name:"2. Lig",matches:3,minNote:6.6,minRep:45,diff:"orta",inc:[5,5],icon:"🥈"},{key:"lig1",name:"1. Lig",matches:4,minNote:6.9,minRep:50,diff:"orta",inc:[5,6],icon:"🥇"},{key:"super",name:"Süper Lig",matches:4,minNote:7.2,minRep:55,diff:"zor",inc:[6,6],icon:"⭐"},{key:"derbi",name:"Derbi Maçları",matches:3,minNote:7.4,minRep:60,diff:"zor",inc:[6,7],derby:!0,icon:"🔥"},{key:"avrupa",name:"Avrupa Kupası",matches:3,minNote:7.6,minRep:65,diff:"zor",inc:[7,7],icon:"🌍"},{key:"final",name:"Turnuva Finali",matches:1,minNote:0,minRep:0,diff:"zor",inc:[7,7],derby:!0,icon:"🏆"}];function Qx(s){return{name:s||"VAR Hakemi",tier:0,week:1,tierNotes:[],rep:50,suspended:0,lowStreak:0,history:[],news:[{week:1,text:"MHK seni Bölgesel Amatör Lig VAR hakemi olarak görevlendirdi. Başarılar!"}],finished:!1,trophy:!1,started:Date.now()}}function t_(s){const t=vi[s.tier],e=new Ve(fn(`${s.name}:${s.started}:${s.week}`));let n,i,r=t.name,a=null;if(t.key==="derbi"){const c=e.pick(gd);[n,i]=e.chance(.5)?[c.a,c.b]:[c.b,c.a],a=c.name,r=`Süper Lig — ${c.name}`}else if(t.key==="avrupa"){const c=gi.find(d=>d.id==="avrupa").teams,h=gi.find(d=>d.id==="super").teams,u=e.pick(h),f={...e.pick(c),foreign:!0};[n,i]=e.chance(.5)?[u,f]:[f,u]}else if(t.key==="final")n=nu[0],i={...nu[1],foreign:!0};else{const c=gi.find(f=>f.id===t.key).teams,h=e.int(0,c.length-1);let u=e.int(0,c.length-2);u>=h&&u++,n=c[h],i=c[u]}const o=e.pick(La[t.key]||La.super),l=e.int(t.inc[0],t.inc[1]);return{home:n,away:i,competition:r,stadium:o,derby:!!t.derby,derbyName:a,numIncidents:l,seed:e.int(1,2e9),tier:t.key}}function wd(s){return s.length?s.reduce((t,e)=>t+e,0)/s.length:0}function e_(s,t,e){const n=new Ve(fn(`${s.name}:${s.week}:res`)),i=vi[s.tier],r=[],a=i.derby?1.4:i.key==="avrupa"||i.key==="final"?1.3:1;let o=(t.note-6.5)*4-t.missed*4-t.wrong*2;o=Math.round(o*a);const l=s.rep;s.rep=Math.max(0,Math.min(100,s.rep+o)),s.tierNotes.push(t.note),s.history.push({week:s.week,tier:i.key,home:e.home.name,away:e.away.name,note:t.note,rep:s.rep}),s.history.length>60&&s.history.shift();const c=h=>n.pick(Jx[h]);if(i.key==="final")s.finished=!0,s.trophy=t.note>=7,r.push(s.trophy?"🏆 Turnuva finalini kusursuz yönettin! Kariyerinin zirvesindesin.":"Finali yönettin. Kariyer tamamlandı — ama not daha iyi olabilirdi.");else if(t.note<5?(s.suspended=1,r.push(c("suspend"))):t.note>=8.5?r.push(c("praise")):t.note<6&&r.push(c("warn")),s.lowStreak=t.note<5.5?s.lowStreak+1:0,s.lowStreak>=2&&s.tier>0)s.tier--,s.tierNotes=[],s.lowStreak=0,r.push(c("demote").replace("{lig}",vi[s.tier].name));else{const h=s.tierNotes.slice(-i.matches);s.tierNotes.length>=i.matches&&wd(h)>=i.minNote&&s.rep>=i.minRep&&(s.tier++,s.tierNotes=[],r.push(c("promote").replace("{lig}",vi[s.tier].name)),s.promoted=!0)}s.week++;for(const h of r)s.news.unshift({week:s.week-1,text:h});return s.news=s.news.slice(0,20),{news:r,repDelta:s.rep-l}}function n_(s){s.suspended=0,s.news.unshift({week:s.week,text:"Görevsiz hafta tamamlandı. MHK seni yeniden görevlendirdi."}),s.week++}function i_(s){const t=vi[s.tier],e=s.tierNotes.slice(-t.matches);return{tier:t,played:s.tierNotes.length,avg:wd(e),need:t.minNote,needRep:t.minRep,matches:t.matches}}const Wa={kolay:{key:"kolay",name:"Kolay",level:0,refError:.5,gray:.12,avar:.9,time:120},orta:{key:"orta",name:"Orta",level:1,refError:.42,gray:.22,avar:.75,time:90},zor:{key:"zor",name:"Zor",level:2,refError:.38,gray:.32,avar:.6,time:60}};function Ad(s){return{...s,gray:Math.min(.45,s.gray+.12),time:Math.max(45,s.time-20),derby:!0}}const or=1024;class s_{constructor(){this.chunks=[],this.meta=[],this.count=0}push(t){const e=this.count/or|0,n=this.count%or*Io;this.chunks[e]||(this.chunks[e]=new Float32Array(or*Io));const i=this.chunks[e];for(let o=0;o<Ls;o++){const l=t.ents[o],c=n+o*dr;i[c]=l.x,i[c+1]=l.z,i[c+2]=l.h,i[c+3]=l.ph,i[c+4]=l.sp,i[c+5]=l.active?l.pose:dt.HIDDEN,i[c+6]=l.pt,i[c+7]=l.p1,i[c+8]=l.p2,i[c+9]=l.p3}const r=t.ball,a=n+Ls*dr;return i[a]=r.x,i[a+1]=r.y,i[a+2]=r.z,i[a+3]=r.spin,this.meta.push(t.minute,t.half),this.count++}_off(t){return t=Math.max(0,Math.min(this.count-1,t|0)),[this.chunks[t/or|0],t%or*Io]}ent(t,e,n={}){const[i,r]=this._off(t),a=r+e*dr;return n.x=i[a],n.z=i[a+1],n.h=i[a+2],n.ph=i[a+3],n.sp=i[a+4],n.pose=i[a+5],n.pt=i[a+6],n.p1=i[a+7],n.p2=i[a+8],n.p3=i[a+9],n}ball(t,e=[0,0,0,0]){const[n,i]=this._off(t),r=i+Ls*dr;return e[0]=n[r],e[1]=n[r+1],e[2]=n[r+2],e[3]=n[r+3],e}minute(t){return t=Math.max(0,Math.min(this.count-1,t|0)),this.meta[t*2]}half(t){return t=Math.max(0,Math.min(this.count-1,t|0)),this.meta[t*2+1]}sampleEnt(t,e,n={}){const i=Math.floor(t),r=t-i;if(r<1e-4||i+1>=this.count)return this.ent(i,e,n);const a=this.ent(i,e,r_),o=this.ent(i+1,e,a_);if(Math.abs(a.x-o.x)+Math.abs(a.z-o.z)>3)return this.ent(r<.5?i:i+1,e,n);if(n.x=a.x+(o.x-a.x)*r,n.z=a.z+(o.z-a.z)*r,n.h=ox(a.h,o.h,r),n.ph=Math.abs(o.ph-a.ph)<3?a.ph+(o.ph-a.ph)*r:o.ph,n.sp=a.sp+(o.sp-a.sp)*r,a.pose===o.pose)n.pose=a.pose,n.pt=o.pt>=a.pt?a.pt+(o.pt-a.pt)*r:r<.5?a.pt:o.pt,n.p1=a.p1+(o.p1-a.p1)*r,n.p2=a.p2+(o.p2-a.p2)*r,n.p3=a.p3+(o.p3-a.p3)*r;else{const l=r<.5?a:o;n.pose=l.pose,n.pt=l.pt,n.p1=l.p1,n.p2=l.p2,n.p3=l.p3}return n}sampleBall(t,e=[0,0,0,0]){const n=Math.floor(t),i=t-n;if(i<1e-4||n+1>=this.count)return this.ball(n,e);const r=this.ball(n,o_),a=this.ball(n+1,l_);if(Math.abs(r[0]-a[0])+Math.abs(r[2]-a[2])>4)return this.ball(i<.5?n:n+1,e);for(let o=0;o<4;o++)e[o]=r[o]+(a[o]-r[o])*i;return e}}const r_={},a_={},o_=[0,0,0,0],l_=[0,0,0,0],c_=2.4;class h_{constructor(t){this.n=t,this.x=new Float32Array(t),this.z=new Float32Array(t),this.h=new Float32Array(t),this.ph=new Float32Array(t),this.sp=new Float32Array(t),this.pose=new Int8Array(t),this.pt=new Float32Array(t),this.p1=new Float32Array(t),this.p2=new Float32Array(t),this.p3=new Float32Array(t)}get(t,e={}){return t=Qt(t|0,0,this.n-1),e.x=this.x[t],e.z=this.z[t],e.h=this.h[t],e.ph=this.ph[t],e.sp=this.sp[t],e.pose=this.pose[t],e.pt=this.pt[t],e.p1=this.p1[t],e.p2=this.p2[t],e.p3=this.p3[t],e}}function u_(s,t,e){const n=s.length;if(t<=s[0].f||n===1){e[0]=s[0].X,e[1]=s[0].Z;return}if(t>=s[n-1].f){e[0]=s[n-1].X,e[1]=s[n-1].Z;return}let i=0;for(;i<n-2&&t>s[i+1].f;)i++;const r=s[i],a=s[i+1],o=a.f-r.f,l=(t-r.f)/o,c=_=>{if(s[_].stop)return[0,0];const y=s[Math.max(0,_-1)],R=s[Math.min(n-1,_+1)],w=R.f-y.f||1;return[(R.X-y.X)/w,(R.Z-y.Z)/w]},h=c(i),u=c(i+1),f=l*l,d=f*l,p=2*d-3*f+1,v=d-2*f+l,g=-2*d+3*f,m=d-f;e[0]=p*r.X+v*o*h[0]+g*a.X+m*o*u[0],e[1]=p*r.Z+v*o*h[1]+g*a.Z+m*o*u[1]}class d_{constructor({dir:t,n:e,rng:n}){this.dir=t,this.n=e,this.rng=n,this.specs=new Map,this.tracks=new Map,this.overlays=[],this.bx=new Float32Array(e),this.by=new Float32Array(e).fill(pe),this.bz=new Float32Array(e),this._sk=Vs()}W(t,e){return[this.dir*t,this.dir*e]}WB(t,e,n){return[this.dir*t,e,this.dir*n]}R(t,e){return[this.dir*t,this.dir*e]}hW(t){return this.dir>0?t:t+Math.PI}hR(t){return this.dir>0?t:t-Math.PI}spec(t){return this.specs.has(t)||this.specs.set(t,{pts:[],poses:[],faces:[],h0:0,ph0:this.rng.range(0,6.28)}),this.specs.get(t)}path(t,e){const n=this.spec(t);return n.pts=e.map(i=>({f:i[0],X:i[1],Z:i[2],stop:i[3]==="s"})),this}pose(t,e,n,i,r=0,a=0,o=0){return this.spec(t).poses.push({f0:e,f1:n,pose:i,p1:r,p2:a,p3:o}),this}face(t,e,n,i){return this.spec(t).faces.push({f0:e,f1:n,...i}),this}heading0(t,e){return this.spec(t).h0=e,this}overlay(t,e,n,i,r=0,a=0,o=0){return this.overlays.push({id:t,f0:e,f1:n,pose:i,p1:r,p2:a,p3:o}),this}shift(t,e,n){const i=this.specs.get(t);for(const r of i.pts)r.X+=e,r.Z+=n}build(){const t=this.n,e=[0,0];for(const[n,i]of this.specs){const r=new h_(t);for(let a=0;a<t;a++)u_(i.pts,a,e),r.x[a]=this.dir*e[0],r.z[a]=this.dir*e[1];for(let a=0;a<t;a++){const o=Math.max(0,a-1),l=Math.min(t-1,a+1),c=(r.x[l]-r.x[o])/((l-o)*te),h=(r.z[l]-r.z[o])/((l-o)*te);r.sp[a]=Math.hypot(c,h),r._vx=r._vx||new Float32Array(t),r._vz=r._vz||new Float32Array(t),r._vx[a]=c,r._vz[a]=h}this.tracks.set(n,r)}for(const[n,i]of this.specs){const r=this.tracks.get(n);let a=this.hW(i.h0);for(let l=0;l<t;l++){let c=null,h=.22;for(const u of i.faces)if(!(l<u.f0||l>u.f1)){if(u.ent!==void 0){const f=this.tracks.get(u.ent);f&&(c=Math.atan2(f.z[l]-r.z[l],f.x[l]-r.x[l]))}else if(u.X!==void 0){const[f,d]=this.W(u.X,u.Z);c=Math.atan2(d-r.z[l],f-r.x[l])}else u.h!==void 0&&(c=this.hW(u.h));u.snap&&(h=10)}c===null&&r.sp[l]>.7&&(c=Math.atan2(r._vz[l],r._vx[l])),l===0&&c!==null&&(a=c),c!==null&&(a=wa(a,c,h)),r.h[l]=a}let o=i.ph0;for(let l=0;l<t;l++)o+=r.sp[l]*te*(2*Math.PI/c_),r.ph[l]=o;r.pose.fill(dt.LOCO);for(const l of i.poses)for(let c=Math.max(0,l.f0);c<=Math.min(t-1,l.f1);c++)r.pose[c]=l.pose,r.pt[c]=l.f1>l.f0?(c-l.f0)/(l.f1-l.f0):1,r.p1[c]=l.p1,r.p2[c]=l.p2,r.p3[c]=l.p3}return this}state(t,e,n={}){return this.tracks.get(t).get(e,n)}skel(t,e,n=this._sk){return qn(this.state(t,e),n)}pos(t,e){const n=this.tracks.get(t);return e=Qt(e,0,this.n-1),[n.x[e],n.z[e]]}posR(t,e){const n=this.pos(t,e);return this.R(n[0],n[1])}fwd(t,e){const i=this.tracks.get(t).h[Qt(e,0,this.n-1)];return[Math.cos(i),Math.sin(i)]}toLocal(t,e,n,i){const r=this.tracks.get(t),a=r.h[e],o=n-r.x[e],l=i-r.z[e],c=Math.cos(a),h=Math.sin(a);return[o*c+l*h,o*-h+l*c]}ballAt(t){return t=Qt(t,0,this.n-1),[this.bx[t],this.by[t],this.bz[t]]}footBall(t,e){const n=this.state(t,e);return qn(n,this._sk),vx(this._sk,n.p1===1,pe)}_set(t,e,n,i){t<0||t>=this.n||(this.bx[t]=e,this.by[t]=n,this.bz[t]=i)}ballHold(t,e,n){for(let i=t;i<=e;i++)this._set(i,n[0],n[1],n[2])}ballCarry(t,e,n,i=.55){const r=this.tracks.get(t);for(let a=e;a<=n;a++){if(a<0||a>=this.n)continue;const o=i+.12*Math.sin(r.ph[a]*.5);this._set(a,r.x[a]+Math.cos(r.h[a])*o,pe,r.z[a]+Math.sin(r.h[a])*o)}}ballLine(t,e,n,i,r="lin"){for(let a=t;a<=e;a++){let o=e>t?(a-t)/(e-t):1;r==="out"?o=1-Math.pow(1-o,1.6):r==="out2"&&(o=yd(o)),this._set(a,n[0]+(i[0]-n[0])*o,n[1]+(i[1]-n[1])*o,n[2]+(i[2]-n[2])*o)}}ballAir(t,e,n,i,r){for(let a=t;a<=e;a++){const o=e>t?(a-t)/(e-t):1;this._set(a,n[0]+(i[0]-n[0])*o,n[1]+(i[1]-n[1])*o+4*r*o*(1-o),n[2]+(i[2]-n[2])*o)}}ballLoose(t,e,n,i,r,a=0){let o=n[0],l=n[1],c=n[2];for(let h=t;h<=e;h++){this._set(h,o,l,c),o+=i*te,c+=r*te,l+=a*te,a-=9.81*te,l<pe&&(l=pe,a=-a*.45,Math.abs(a)<.8&&(a=0));const u=l<=pe+.01?.965:.995;i*=u,r*=u}}}const xr=Vs(),Oa=Vs(),li=Vs();function f_(s,t){return{n:s.n,ent:(e,n)=>s.tracks.has(n)?s.state(n,Math.max(0,Math.min(s.n-1,e))):null,ball:e=>s.ballAt(e),ids:e=>[...s.tracks.keys()].filter(n=>t(n)===e)}}function p_(s,t,e,n){return{n:e,ent:(i,r)=>{const a=s.ent(t+Math.max(0,Math.min(e-1,i)),r);return a.pose===dt.HIDDEN?null:a},ball:i=>s.ball(t+Math.max(0,Math.min(e-1,i))),ids:i=>{const r=[];for(let a=0;a<22;a++)n(a)===i&&s.ent(t,a).pose!==dt.HIDDEN&&r.push(a);return r}}}const Rd=s=>s<11?0:s<22?1:2;function Gl(s,t,e,n,i){const r=s.ent(t,e);qn(r,xr);const a=Fo(xr,i,0,!0),o=Fo(xr,i,0,!1),l=[];for(const p of s.ids(n)){const v=s.ent(t,p);if(!v)continue;qn(v,Oa);const g=Fo(Oa,i,0,!0);l.push({id:p,ext:g.ext,part:g.part})}l.sort((p,v)=>v.ext-p.ext);const c=l[1]||l[0],u=s.ball(t)[0]*i,f=a.ext-c.ext,d=a.ext>0;return{attExt:a.ext,attPart:a.part,attAllExt:o.ext,attAllPart:o.part,defs:l,second:c,margin:f,ballExt:u,offside:f>0&&a.ext>u&&d}}function pn(s,t,e,n,i,r,a){let o=1/0,l=t,c=-1,h=null,u=-1,f=-1,d=null,p=0;for(let v=t;v<=e;v++){const g=s.ent(v,n),m=s.ent(v,r);if(!g||!m)continue;qn(g,xr),qn(m,Oa);const _=mx(xr,i,Oa,a);_.d<o&&(o=_.d,l=v,h=_.point.slice(),u=_.pa,f=_.pb),_.d<0&&(p=Math.max(p,-_.d)),_.d<0&&c<0&&(c=v,d=_.point.slice())}return{minD:o,minF:l,first:c,point:h,firstPoint:d,pa:u,pb:f,contact:c>=0,maxPen:p}}function m_(s,t,e){const n=s.ent(t,e);qn(n,li);const i=s.ball(t);let r={d:1/0,part:-1,point:null,t:0,len:0};for(let o=0;o<be.length;o++){const l=gx(li,o,i[0],i[1],i[2],pe);l.d<r.d&&(r={d:l.d,part:o,point:l.point,t:l.t,len:l.len||0})}let a=be[r.part].cat;if((r.part===Ae.UARML||r.part===Ae.UARMR)&&r.t*r.len<.09&&(a="omuz"),r.part===Ae.TORSO){const o=li.up,l=[li.j[0],li.j[1],li.j[2]],c=(r.point[0]-l[0])*o[0]+(r.point[1]-l[1])*o[1]+(r.point[2]-l[2])*o[2],h=(r.point[0]-l[0])*li.right[0]+(r.point[2]-l[2])*li.right[2];a=c>.42&&Math.abs(h)>.1?"omuz":"govde"}return{...r,region:a}}function kd(s,t,e,n){for(let i=t;i<=e;i++){const r=m_(s,i,n);if(r.d<=.002)return{f:i,...r}}return null}function Cd(s,t,e,n){let i=-1/0,r=t;for(let a=t;a<=e;a++){const l=s.ball(a)[0]*n-(bt.HL+pe);l>i&&(i=l,r=a)}return{margin:i,frame:r}}function Zn(s,t){return s*11+t}function re(s,t,e,n){for(const i of e){const r=Zn(t,i);if(s.ents[r].active&&!n.has(r))return n.add(r),r}for(let i=1;i<11;i++){const r=Zn(t,i);if(s.ents[r].active&&!n.has(r))return n.add(r),r}return null}function jn(s,t){return new d_({dir:s.dir,n:t,rng:s.rng})}function wi(s){return f_(s,Rd)}function Zi(s,t=0){return s.rng.chance(Math.min(.9,s.diff.refError+t))}function Pd(s){return s>0?ur:Ea}function Jn(s,t,e){return{n:t.n,tracks:t.tracks,bx:t.bx,by:t.by,bz:t.bz,overlays:t.overlays,dir:s.dir,attackTeam:s.attackTeam,defTeam:s.defTeam,events:[],keep:[],keepR:4,appFrame:0,...e}}function Xa(s,t,e,n,i,r){const a=s.WB(52.9,i,n),o=s.n,l=t+Math.max(8,Math.round(Math.hypot(a[0]-e[0],a[2]-e[2])/25*30));s.ballAir(t,l,e,a,.25);const c=s.WB(54.2,Math.max(pe,i*.4),n*.95);return s.ballLine(l,l+10,a,c,"out"),s.ballLine(l+10,l+20,c,s.WB(54,pe,n*.95),"out"),s.ballHold(l+20,o-1,s.WB(54,pe,n*.95)),l}function Mc(s,t,e,n,i,r=[]){const a=i.chance(.6)?-Math.sign(n):Math.sign(n);s.path(t,[[0,50.6,0],[e-12,50.4,n*.12],...r,[e+3,50.4,n*.12],[e+22,50.6,n*.12+a*1.6,"s"]]),s.face(t,0,s.n-1,{h:Math.PI,snap:!1});const o=-a;s.pose(t,e+3,e+30,8,o,0,0),s.pose(t,e+31,s.n-1,5,o*Math.PI/2,0,0)}function bc(s,t,e){s.path(t,[[0,50.5,0],[e-1,50.2,0]]),s.face(t,0,e-1,{h:Math.PI})}function g_(s){const{sim:t,rng:e,diff:n}=s,i=s.attackTeam,r=s.defTeam,a=new Set,o=300,l=jn(s,o),c=e.int(95,120),h=e.range(21,32),u=e.sign(),f=re(t,i,[6,7,5,8],a),d=re(t,i,[9,10],a),p=re(t,i,[10,9,8,5],a),v=Zn(r,0),g=[];for(const L of[1,2,3,4]){const ft=re(t,r,[L],a);ft!==null&&g.push(ft)}const m=n.level,_=m===0?e.range(.15,.45):m===1?e.range(.05,.25):e.range(.012,.12),x=(e.chance(.5)?1:-1)*_,y=u*e.range(1.5,8),R=[-19,-6.5,6.5,19].map(L=>L+e.range(-2,2));let w=0,T=1/0;R.forEach((L,ft)=>{Math.abs(L-y)<T&&(T=Math.abs(L-y),w=ft)});const E=m===2&&e.chance(.6),b=R.map((L,ft)=>ft===w?h:h-(E&&Math.abs(ft-w)===1?e.range(.28,.55):e.range(.8,2.6))),S=g[Math.min(w,g.length-1)],P=c+e.int(48,58),O=[h+e.range(10,13),y*.55],U=Math.min(47,Math.max(42.5,h+16)),F=P+Math.round((U-O[0])/6*30)+8,K=O[1]*.6,N=-u*e.range(3,12);l.path(f,[[0,h-24,N-u*2],[c,h-15,N],[c+30,h-13,N,"s"],[o-1,h-10,N*.8]]),l.face(f,c-22,c+6,{X:O[0],Z:O[1]}),l.pose(f,c-9,c+6,dt.KICK);const Y=e.chance(m===0?.15:.35);if(l.path(d,[[0,h-6,y+u*3],[c-34,h-2.8,y+u*1.5],[c-12,h-1.2,y+u*.4],[c,h,y],[c+15,h+3.2,y-u*.3],[P,O[0],O[1]],[F,U,K],[F+18,U+2.5,K],[o-1,U+1,K+u*7,"s"]]),Y&&l.pose(d,c-14,c+4,dt.LOCO,Pn.POINT_R),l.pose(d,F-9,F+6,dt.KICK),l.pose(d,F+30,o-1,dt.CELEB),p!==null){const L=-y*.6-u*6;l.path(p,[[0,h-9,L],[c,h-4.5,L*.9],[P,h+4,L*.6],[o-1,U-4,L*.3]])}g.forEach((L,ft)=>{const nt=R[ft],xt=b[ft];L===S?l.path(L,[[0,xt+2.6,nt],[c-20,xt+.7,nt],[c,xt,nt],[c+14,xt+1.6,nt+(y-nt)*.2],[P,O[0]-2.8,O[1]+u*1.4],[F,U-2.2,K+u*1.2],[o-1,U-1,K+u*3,"s"]]):l.path(L,[[0,xt+2.4,nt],[c,xt,nt],[c+18,xt+2.5,nt*.92],[P,xt+10,nt*.75],[o-1,xt+14,nt*.6,"s"]]),l.face(L,0,c+3,{ent:f})}),Mc(l,v,F,u*e.range(1.4,2.9),e),l.build();const H=wi(l);for(let L=0;L<3;L++){const ft=Gl(H,c,d,r,s.dir),nt=x-ft.margin;if(Math.abs(nt)<5e-4)break;l.shift(d,nt,0),l.build()}l.ballCarry(f,0,c-10,.55);const J=l.footBall(f,c);l.ballLine(c-9,c,l.ballAt(c-10),J);const[st,lt]=l.pos(d,P),[ht,St]=l.fwd(d,P),W=[st+ht*.55,.11,lt+St*.55],et=e.chance(.3);et?l.ballAir(c,P,J,W,e.range(2,4.5)):l.ballLine(c,P,J,W,"out"),l.ballCarry(d,P+1,F-10,.6);const yt=l.footBall(d,F);l.ballLine(F-9,F,l.ballAt(F-10),yt);const ot=u*e.range(1.3,3),_t=e.range(.3,1.9),wt=Xa(l,F,yt,ot,_t),At=Gl(H,c,d,r,s.dir),Q=Zi(s,m===2?.1:0)?!At.offside:At.offside,j=Jn(s,l,{type:"OFSAYT",subtype:Y?"kolOnde":E?"yakinSavunmaci":"standart",keyFrame:c,goalFrame:wt,focus:d,keep:[d,f,S],refDecision:Q?"OFFSIDE":"GOAL",meta:{passer:f,receiver:d,lineDefender:S,targetMargin:x,lofted:et},line:"offside",bestCam:4});return j.events.push({f:c,type:"kick"},{f:F,type:"kick"},{f:wt,type:"goal",team:i,scorer:d}),Q&&(j.overlays.push({id:Pd(s.dir),f0:wt+8,f1:o-1,pose:dt.FLAG,p1:0,p2:0,p3:0}),j.events.push({f:wt+10,type:"flag"})),j.constrain=(L,ft,nt)=>(L.team===r&&L.idx!==0&&s.dir*ft>h-3.5&&(ft=s.dir*(h-3.5)),[ft,nt]),j}function v_(s,t,e){const n=t.keyFrame,i=Gl(s,n,t.meta.receiver,t.defTeam,t.dir),r=i.offside;return{outcome:r?"OFFSIDE":"GOAL",accept:{[r?"OFFSIDE":"GOAL"]:1},gray:!1,factual:!0,keyFrame:n,facts:{marginM:i.margin,attPart:be[i.attPart].name,attAllPart:be[i.attAllPart].name,armAhead:i.attAllExt>i.attExt+.005,secondId:i.second.id,secondPart:be[i.second.part].name,attExt:i.attExt,defExt:i.second.ext}}}const y_=Object.freeze(Object.defineProperty({__proto__:null,generate:g_,judge:v_},Symbol.toStringTag,{value:"Module"})),Mu=[{w:3,v:"foulIn"},{w:2.2,v:"foulOut"},{w:2,v:"foulLine"},{w:2.4,v:"dive"},{w:1.6,v:"light"},{w:1.4,v:"clean"}];function x_(s,t){const{sim:e,rng:n,diff:i}=s,r=s.attackTeam,a=s.defTeam,o=i.level,l=new Set,c=215,h=n.int(96,118),u=n.sign();let f=t||n.weighted(i.gray>.25?[...Mu,{w:1.5,v:"light"}]:Mu);const d=re(e,r,[9,10,5,8],l),p=re(e,a,[2,3,1,4],l),v=re(e,a,[3,2,4,1],l),g=Zn(a,0),m=(j,L,ft)=>o===0?n.range(...j):o===1?n.range(...L):n.range(...ft);let _;f==="foulOut"?_=mi-m([.8,2.4],[.3,1.1],[.06,.45]):f==="foulLine"?_=mi+m([.8,2],[.25,.9],[.03,.35]):_=mi+n.range(1.6,7);const x=u*n.range(4,13),y=jn(s,c),R=f!=="clean",w=f==="dive"?h+n.int(0,3):h+2,T=n.range(-.35,.35),E=[[0,_-16,x+u*6.5],[h-40,_-7.6,x+u*2.8],[h,_,x]];R?E.push([w+12,_+1.7,x-u*.5],[w+32,_+2.5,x-u*.8,"s"]):E.push([h+20,_+3.5,x-u*1.5],[h+50,_+5,x-u*2,"s"]),y.path(d,E),R?(y.pose(d,w,w+18,dt.FALL,T),y.pose(d,w+19,c-1,dt.DOWN,T)):y.pose(d,h+22,c-1,dt.LOCO,Pn.PROTEST);const b=.55,S=-u*.84,P=Math.hypot(b,S),O=[b/P,S/P];y.path(d,E),y.path(p,[[0,_+7,x-u*7],[c-1,_+7,x-u*7]]),bc(y,g,c),v!==null&&y.path(v,[[0,_+9,x*.2],[h,_+6,x*.3],[c-1,_+5,x*.4]]),y.build();const U=y.skel(d,h),[F,K]=y.posR(d,h),N=j=>y.R(U.j[j*3],U.j[j*3+2]),Y=N(mt.ANKL),H=N(mt.ANKR),J=j=>(j[0]-F)*O[0]+(j[1]-K)*O[1],st=J(Y)>J(H)?Y:H,lt=y.R(y.pos(d,h)[0]+y.fwd(d,h)[0]*.6,y.pos(d,h)[1]+y.fwd(d,h)[1]*.6);let ht;f==="foulIn"||f==="foulOut"||f==="foulLine"?ht=-n.range(.05,.1):f==="light"?ht=-n.range(.006,.018):f==="dive"?ht=o===0?n.range(.28,.5):o===1?n.range(.16,.32):n.range(.1,.2):ht=.2;let St=.11-ht,W=f==="clean"?[lt[0]+O[0]*.15,lt[1]+O[1]*.15]:[st[0]+O[0]*St,st[1]+O[1]*St];const et=f==="clean"?.1:n.range(.08,.16),yt=wi(y),ot=()=>{const j=[W[0]+O[0]*.86,W[1]+O[1]*.86];y.path(p,[[0,_+7.5,x-u*7.5],[h-34,j[0]+O[0]*4.2,j[1]+O[1]*4.2],[h-8,j[0]+O[0]*.9,j[1]+O[1]*.9],[h,j[0],j[1]],[h+16,j[0]-O[0]*.6,j[1]-O[1]*.6,"s"],[c-1,j[0]-O[0]*1.2,j[1]-O[1]*1.2]]);const L=y.specs.get(p);L.poses=[],L.faces=[],y.face(p,h-20,h+20,{X:W[0],Z:W[1]}),y.build();const[ft,nt]=y.W(W[0],W[1]),[xt,gt]=y.toLocal(p,h,ft,nt);y.pose(p,h-9,h+7,dt.LUNGE,xt,gt,et),f==="clean"&&y.pose(p,h+20,c-1,dt.LOCO,0),y.build()};if(ot(),f!=="clean")for(let j=0;j<5;j++){const ft=pn(yt,h-8,h+3,p,We,d,We).minD-ht;if(Math.abs(ft)<.003)break;W=[W[0]-O[0]*ft,W[1]-O[1]*ft],ot()}if(f==="foulIn"||f==="foulOut"||f==="foulLine")for(let j=0;j<3;j++){const L=pn(yt,h-8,h+3,p,We,d,We),ft=L.firstPoint||L.point,nt=y.R(ft[0],ft[2])[0],xt=_-nt;if(Math.abs(xt)<.002)break;for(const gt of[d,p])y.shift(gt,xt,0);W=[W[0]+xt,W[1]],ot()}y.ballCarry(d,0,h-2,.6);const _t=y.ballAt(h-2);if(f==="clean"){const[j,L]=y.fwd(p,h),ft=Math.atan2(L,j)+u*.9*y.dir,nt=y.WB(W[0]-O[0]*.14,.11,W[1]-O[1]*.14);y.ballLine(h-2,h,_t,nt),y.ballLoose(h,c-1,nt,Math.cos(ft)*9,Math.sin(ft)*9,1.2)}else{const[j,L]=y.fwd(d,h);y.ballLoose(h-1,c-1,_t,j*3.2+y.dir*.4,L*3.2,0)}const wt=f==="light"?n.chance(.5):Zi(s);let At;f==="foulIn"?At=wt?"NOFOUL":"PEN":f==="foulLine"?At=wt?n.chance(.6)?"FK":"NOFOUL":"PEN":f==="foulOut"?At=wt?"PEN":"FK":At=wt?"PEN":"NOFOUL";const Gt=Jn(s,y,{type:"PENALTI",subtype:f,keyFrame:h,focus:d,keep:[d,p],refDecision:At,meta:{attacker:d,defender:p,fallStart:w,Xc:_},line:"box",bestCam:5}),Q=h+14;if(Gt.events.push({f:Q,type:At==="NOFOUL"?"crowd":"whistle"}),At==="PEN"){const[j,L]=y.W(bt.HL-bt.SPOT,0);Gt.overlays.push({id:22,f0:Q+6,f1:c-1,pose:dt.POINT,p1:0,p2:0,p3:0,toward:[j,L]})}return Gt}function __(s,t){const{attacker:e,defender:n}=t.meta,i=t.keyFrame,r=pn(s,i-8,i+3,n,We,e,We),a=r.firstPoint||r.point,o=a[0]*t.dir,l=a[2]*t.dir,c=o>=mi&&Math.abs(l)<=bt.BOX_HW;let h=!1;for(let v=i-3;v<=i+12;v++){const g=s.ent(v,e);if(g&&g.pose===dt.FALL){h=!0;break}}let u,f,d=!1;r.contact?t.subtype==="light"||t.subtype==="clean"?(d=!0,u=c?"PEN":"FK",f={[u]:1,NOFOUL:1}):(u=c?"PEN":"FK",f={[u]:1}):h?(u="DIVE",f={DIVE:1,NOFOUL:.8}):(u="NOFOUL",f={NOFOUL:1});const p=r.contact&&!d&&(t.refDecision==="PEN"||t.refDecision==="FK");return{outcome:u,accept:f,gray:d,factual:p,keyFrame:r.contact?r.first:r.minF,facts:{contact:r.contact,minDistM:r.minD,penetrationM:r.maxPen,contactFrame:r.contact?r.first:-1,closestFrame:r.minF,distLineM:o-mi,inside:c,fell:h,point:a}}}const M_=Object.freeze(Object.defineProperty({__proto__:null,generate:x_,judge:__},Symbol.toStringTag,{value:"Module"})),bu=[{w:3,v:"kolAcik"},{w:2.4,v:"kolDogal"},{w:1.8,v:"omuz"},{w:1.4,v:"gogus"},{w:1.8,v:"gri"}];function b_(s,t){const{sim:e,rng:n,diff:i}=s,r=s.attackTeam,a=s.defTeam,o=new Set,l=200,c=n.int(80,100),h=n.sign();let u=t||n.weighted(i.gray>.25?[...bu,{w:1.6,v:"gri"}]:bu);const f=re(e,r,[h>0?5:8,5,8,6],o),d=re(e,a,[2,3,1,4],o),p=re(e,r,[9,10],o),v=re(e,r,[10,9],o),g=re(e,a,[3,2,4,1],o),m=Zn(a,0),_=n.range(37,44),x=h*n.range(19,27),y=n.range(43.5,48),R=h*n.range(2.5,9),w=n.int(14,24),T=c+w,E=jn(s,l);E.path(f,[[0,_-14,x+h*2],[c,_,x],[c+20,_+2.5,x-h*.6,"s"],[l-1,_+3.5,x-h*2]]),E.face(f,c-18,c+6,{X:y,Z:R}),E.pose(f,c-9,c+6,dt.KICK);const b=[_-y,x-R],S=Math.hypot(b[0],b[1]),P=[b[0]/S,b[1]/S],O=n.chance(.5)?1:0;let U;u==="gogus"?U=P:U=O===1?[P[1],-P[0]]:[-P[1],P[0]];const F=u==="gogus"?0:.35;let K=U[0]*(1-F)+P[0]*F,N=U[1]*(1-F)+P[1]*F;const Y=Math.hypot(K,N);K/=Y,N/=Y;const H=Math.atan2(N,K);E.path(d,[[0,y-3,R+h*1.5],[c-20,y-.6,R+h*.3],[T,y,R,"s"],[l-1,y+.6,R]]),E.face(d,0,l-1,{h:H});let J;u==="kolAcik"?J=i.level===2?n.range(.85,1.15):n.range(.95,1.5):u==="kolDogal"?J=n.range(.06,.24):u==="gri"?J=n.range(.42,.72):J=n.range(.05,.4);const st=T-(u==="kolAcik"?n.int(8,22):n.int(3,9)),lt=O;if(u!=="gogus"){for(let C=0;C<6;C++){const A=st-6+C;E.pose(d,A,A,dt.LOCO,Pn.OUT,J*(C+1)/6,lt)}E.pose(d,st,T+10,dt.LOCO,Pn.OUT,J,lt)}p!==null&&E.path(p,[[0,y-10,R-h*3],[c,y-4,R-h*3.5],[T,y-1.5,R-h*4.2],[l-1,y,R-h*4]]),v!==null&&E.path(v,[[0,y-12,-R],[c,y-6,-R*.5],[T+10,y-2,-R*.3],[l-1,y-1,-R*.3]]),g!==null&&E.path(g,[[0,y+1.5,-R*.4-h*4],[l-1,y+2,-R*.4-h*4.5]]),bc(E,m,l),E.build();const ht=E.skel(d,T),St=pt=>[ht.j[pt*3],ht.j[pt*3+1],ht.j[pt*3+2]],W=O===1?1:0;let et,yt;if(u==="gogus"){const pt=St(mt.PELVIS);et=[pt[0]+ht.up[0]*.33+ht.fwd[0]*.11,pt[1]+ht.up[1]*.33,pt[2]+ht.up[2]*.33+ht.fwd[2]*.11],yt=0}else if(u==="omuz"){const pt=St(mt.SHL+W);et=[pt[0],pt[1]+.05,pt[2]],yt=.02}else{const pt=St(mt.ELL+W),C=St(mt.HANDL+W),A=n.range(.3,.7);et=[pt[0]+(C[0]-pt[0])*A,pt[1]+(C[1]-pt[1])*A,pt[2]+(C[2]-pt[2])*A],yt=.045}const ot=E.pos(f,c),_t=[ot[0]-et[0],0,ot[1]-et[2]],wt=Math.hypot(_t[0],_t[2]);if(_t[0]/=wt,_t[2]/=wt,u!=="gogus"&&u!=="omuz"){const pt=ht.right[0]*(O===1?1:-1),C=ht.right[2]*(O===1?1:-1);_t[0]=_t[0]*.6+pt*.4,_t[2]=_t[2]*.6+C*.4;const A=Math.hypot(_t[0],_t[2]);_t[0]/=A,_t[2]/=A}const At=yt+.11-.012,Gt=[et[0]+_t[0]*At,et[1],et[2]+_t[2]*At];E.ballCarry(f,0,c-10,.55);const Q=E.footBall(f,c);E.ballLine(c-9,c,E.ballAt(c-10),Q);const j=Math.max(0,n.range(.4,1.4)*(Gt[1]<1?.6:1));E.ballAir(c,T,Q,Gt,j);const L=[-_t[0]*.3+(n.next()-.5),-_t[2]*.3+(n.next()-.5)];E.ballLoose(T+1,l-1,Gt,_t[0]*5+L[0]*4,_t[2]*5+L[1]*4,2.5);const ft=wi(E),nt=kd(ft,c+2,T+1,d),xt=nt&&nt.region==="kol"&&J>=.6;let gt;if(u==="gri")gt=n.chance(.5)?"PEN":"NOFOUL";else{const pt=Zi(s);gt=xt?pt?"NOFOUL":"PEN":pt?"PEN":"NOFOUL"}const zt=Jn(s,E,{type:"ELLE",subtype:u,keyFrame:T,focus:d,keep:[d,f,p],refDecision:gt,meta:{defender:d,crosser:f,armAngle:J,armSide:O,kickFrame:c},line:"box",bestCam:5});if(zt.events.push({f:c,type:"kick"},{f:T,type:"thud"},{f:T+12,type:gt==="PEN"?"whistle":"crowd"}),gt==="PEN"){const[pt,C]=E.W(bt.HL-bt.SPOT,0);zt.overlays.push({id:22,f0:T+18,f1:l-1,pose:dt.POINT,p1:0,toward:[pt,C]})}return zt}function S_(s,t){const{defender:e,kickFrame:n}=t.meta,i=kd(s,n+2,t.keyFrame+3,e),r=s.ent(t.keyFrame,e);let a=0;r.pose===dt.LOCO&&(r.p1|0)===Pn.OUT&&(a=r.p2);const o=i?i.region:"yok",l=o==="kol";let c,h,u=!1;return l&&a>=.75?(c="PEN",h={PEN:1}):l&&a>=.4?(u=!0,c=a>=.6?"PEN":"NOFOUL",h={PEN:1,NOFOUL:1}):(c="NOFOUL",h={NOFOUL:1}),{outcome:c,accept:h,gray:u,factual:!1,keyFrame:i?i.f:t.keyFrame,facts:{region:o,part:i?be[i.part].name:"-",armAngleDeg:a*180/Math.PI,contactFrame:i?i.f:-1,point:i?i.point:null}}}const E_=Object.freeze(Object.defineProperty({__proto__:null,generate:b_,judge:S_},Symbol.toStringTag,{value:"Module"})),Su=[{w:2.6,v:"sertKirmizi"},{w:2.2,v:"sertSari"},{w:1.2,v:"sertGri"},{w:2.4,v:"dogsoKirmizi"},{w:2.2,v:"dogsoKoruma"},{w:1,v:"dogsoGri"}];function T_(s,t,e){const n=t>0?mt.KNEER:mt.KNEEL,i=t>0?mt.ANKR:mt.ANKL,r=[s.j[n*3],s.j[n*3+1],s.j[n*3+2]],a=[s.j[i*3],s.j[i*3+1],s.j[i*3+2]],o=Math.max(0,Math.min(1,(e-a[1])/(r[1]-a[1]||1)));return[a[0]+(r[0]-a[0])*o,a[1]+(r[1]-a[1])*o,a[2]+(r[2]-a[2])*o]}function w_(s,t){const e=t||s.rng.weighted(s.diff.gray>.25?[...Su,{w:1.4,v:"sertGri"},{w:1.2,v:"dogsoGri"}]:Su);return e.startsWith("sert")?A_(s,e):R_(s,e)}function A_(s,t){const{sim:e,rng:n}=s,i=s.attackTeam,r=s.defTeam,a=new Set,o=200,l=n.int(80,100),c=n.sign(),h=re(e,i,[6,7,5,8],a),u=re(e,r,[6,7,5,8],a),f=re(e,r,[7,6,2],a),d=n.range(-12,18),p=n.range(-18,18),v=jn(s,o);v.path(h,[[0,d-15,p-c*3],[l-30,d-5.5,p-c*1],[l,d,p],[l+14,d+1.8,p+c*.4],[l+34,d+2.6,p+c*.6,"s"]]),v.pose(h,l+1,l+16,dt.FALL,c*.4),v.pose(h,l+17,o-1,dt.DOWN,c*.4),v.path(u,[[0,d+8,p+c*7],[o-1,d,p]]),f!==null&&v.path(f,[[0,d+6,p-c*6],[o-1,d+3,p-c*3]]),v.build();let g;t==="sertKirmizi"?g=n.range(.3,.46):t==="sertSari"?g=n.range(.04,.1):g=n.range(.17,.24);const m=v.skel(h,l),_=[.62,c*.78],y=T_(m,c,g),R=v.R(y[0],y[2]),w=.03;let T=[R[0]+_[0]*(.105-w),R[1]+_[1]*(.105-w)];const E=t==="sertKirmizi"?n.range(6.5,8):n.range(4.2,5.5),b=()=>{const K=[T[0]+_[0]*.88,T[1]+_[1]*.88],N=E*14/30;v.path(u,[[0,K[0]+_[0]*14,K[1]+_[1]*14],[l-14,K[0]+_[0]*N,K[1]+_[1]*N],[l,K[0],K[1]],[l+16,K[0]-_[0]*1.6,K[1]-_[1]*1.6,"s"],[o-1,K[0]-_[0]*1.8,K[1]-_[1]*1.8]]);const Y=v.specs.get(u);Y.poses=[],Y.faces=[],v.face(u,l-30,l+30,{X:T[0],Z:T[1]}),v.build();const[H,J]=v.W(T[0],T[1]),[st,lt]=v.toLocal(u,l,H,J);v.pose(u,l-14,l+10,dt.SLIDE,st,lt,g),v.pose(u,l+11,l+40,dt.SLIDE,st*.7,lt,.1),v.build()};b();const S=wi(v);for(let K=0;K<4;K++){const Y=pn(S,l-6,l+3,u,We,h,We).minD- -.04;if(Math.abs(Y)<.004)break;T=[T[0]-_[0]*Y,T[1]-_[1]*Y],b()}v.ballCarry(h,0,l-3,.6);const[P,O]=v.fwd(h,l);v.ballLoose(l-2,o-1,v.ballAt(l-3),P*4,O*4,.6);let U;if(t==="sertGri")U=n.chance(.5)?"RED":"NORED";else{const K=Zi(s);U=t==="sertKirmizi"!==K?"RED":"NORED"}const F=Jn(s,v,{type:"KIRMIZI",subtype:t,keyFrame:l,focus:h,keep:[h,u],refDecision:U,meta:{kind:"sert",attacker:h,defender:u,leadSide:1},line:null,bestCam:5});return Ld(F,v,s,u,l,U),F}function R_(s,t){const{sim:e,rng:n}=s,i=s.attackTeam,r=s.defTeam,a=new Set,o=230,l=n.int(110,130),c=n.sign(),h=re(e,i,[9,10],a),u=re(e,i,[6,7],a),f=re(e,r,[2,3],a),d=re(e,r,[3,2,1,4],a),p=Zn(r,0),v=n.range(22,30),g=n.range(-7,7),m=40,_=jn(s,o),x=[v-14,g-c*2];_.path(u,[[0,x[0]-18,x[1]+c*6],[12,x[0]-15.5,x[1]+c*5.4],[40,x[0]-12,x[1]+c*4,"s"],[o-1,x[0]-8,x[1]+c*3]]),_.face(u,0,14,{X:x[0],Z:x[1]}),_.pose(u,3,18,dt.KICK),_.path(h,[[0,x[0]-4,x[1]-c*3],[m,x[0],x[1]],[l,v,g],[l+14,v+2,g+c*.3],[l+34,v+2.8,g+c*.4,"s"]]),_.pose(h,l+1,l+17,dt.FALL,-c*.3),_.pose(h,l+18,o-1,dt.DOWN,-c*.3),_.path(f,[[0,x[0]+2,x[1]+c*6],[o-1,v,g]]);let y,R;t==="dogsoKoruma"?(y=v+n.range(3.5,6.5),R=g+c*n.range(.5,3)):t==="dogsoGri"?(y=v+n.range(6.5,9.5),R=g+c*n.range(5.5,8.5)):(y=v-n.range(5,9),R=g-c*n.range(9,14)),d!==null&&_.path(d,[[0,y-4,R+(R-g)*.4],[l,y,R],[o-1,y+1,(R+g)/2]]),bc(_,p,o),_.build();const w=_.skel(h,l),T=[-.55,c*.83],b=c>0?mt.ANKR:mt.ANKL,S=_.R(w.j[b*3],w.j[b*3+2]);let P=[S[0]+T[0]*.07,S[1]+T[1]*.07];const O=()=>{const St=[P[0]+T[0]*.86,P[1]+T[1]*.86];_.path(f,[[0,x[0]+2,x[1]+c*6],[l-40,St[0]-6,St[1]+c*1.5],[l,St[0],St[1]],[l+16,St[0]+1.6,St[1],"s"],[o-1,St[0]+2,St[1]]]);const W=_.specs.get(f);W.poses=[],W.faces=[],_.face(f,l-12,l+10,{X:P[0],Z:P[1]}),_.build();const[et,yt]=_.W(P[0],P[1]),[ot,_t]=_.toLocal(f,l,et,yt);_.pose(f,l-9,l+7,dt.LUNGE,ot,_t,.12),_.build()};O();const U=wi(_);for(let St=0;St<4;St++){const et=pn(U,l-7,l+3,f,We,h,We).minD- -.05;if(Math.abs(et)<.004)break;P=[P[0]-T[0]*et,P[1]-T[1]*et],O()}const F=_.footBall(u,12);_.ballHold(0,11,F);const[K,N]=_.pos(h,m),[Y,H]=_.fwd(h,m);_.ballLine(12,m,F,[K+Y*.6,.11,N+H*.6],"out"),_.ballCarry(h,m+1,l-2,.75);const[J,st]=_.fwd(h,l);_.ballLoose(l-1,o-1,_.ballAt(l-2),J*4.5,st*4.5,0);let lt;if(t==="dogsoGri")lt=n.chance(.5)?"RED":"NORED";else{const St=Zi(s);lt=t==="dogsoKirmizi"!==St?"RED":"NORED"}const ht=Jn(s,_,{type:"KIRMIZI",subtype:t,keyFrame:l,focus:h,keep:[h,f,d],refDecision:lt,meta:{kind:"dogso",attacker:h,defender:f,cover:d},line:null,bestCam:3});return ht.events.push({f:12,type:"kick"}),ht.constrain=(St,W,et,yt)=>{if(St.team===r&&St.idx!==0){const ot=s.dir*W,_t=_.posR(h,yt)[0];ot>_t-7&&(W=s.dir*(_t-7))}return[W,et]},Ld(ht,_,s,f,l,lt),ht}function Ld(s,t,e,n,i,r){s.events.push({f:i+6,type:"whistle"});const a=Math.min(t.n-30,i+60);s.events.push({f:a,type:"card",color:r==="RED"?"red":"yellow",target:n}),s.overlays.push({id:22,f0:a,f1:t.n-1,pose:dt.CARD,p1:r==="RED"?2:1}),s.cardTarget=n,s.cardColor=r==="RED"?"red":"yellow",s.refApproach={id:n,f0:i+12,f1:a}}function k_(s,t){const{attacker:e,defender:n}=t.meta,i=t.keyFrame,r=pn(s,i-7,i+3,n,We,e,We),a=r.contact?r.first:r.minF;let o,l,c=!1;const h={contact:r.contact,contactFrame:r.contact?r.first:-1,penetrationM:r.maxPen};if(t.meta.kind==="sert"){const u=s.ent(a,n),f=u.p3*1,d=(()=>{const v=r.firstPoint||r.point;return v?v[1]:f})(),p=u.sp;h.studsHeightM=d,h.speed=p,r.contact?d>=.34&&p>=3.5?(o="RED",l={RED:1}):d>=.22?(c=!0,o=d>=.28?"RED":"NORED",l={RED:1,NORED:1}):(o="NORED",l={NORED:1}):(o="NORED",l={NORED:1})}else{const u=s.ent(a,e),[f,d]=[u.x*t.dir,u.z*t.dir];let p=0,v=0,g=1/0,m=-1;for(const x of s.ids(t.defTeam)){if(x===n||x%11===0)continue;const y=s.ent(a,x);if(!y)continue;const R=y.x*t.dir,w=y.z*t.dir;if(R<=f+.5)continue;const T=52.5-f,E=0-d,b=Math.hypot(T,E),S=Math.max(0,Math.min(1,((R-f)*T+(w-d)*E)/(b*b))),P=Math.hypot(R-(f+T*S),w-(d+E*S)),O=Math.hypot(R-f,w-d);O<g&&(g=O,m=x),P<4&&O<10.5?p++:P<9&&O<14&&v++}const _=Math.hypot(52.5-f,d);h.coverClear=p,h.coverGray=v,h.distGoalM=_,h.nearestCoverM=g,h.nearestId=m,r.contact?p>0||_>38?(o="NORED",l={NORED:1}):v>0?(c=!0,o="RED",l={RED:1,NORED:1}):(o="RED",l={RED:1}):(o="NORED",l={NORED:1})}return{outcome:o,accept:l,gray:c,factual:!1,keyFrame:a,facts:h}}const C_=Object.freeze(Object.defineProperty({__proto__:null,generate:w_,judge:k_},Symbol.toStringTag,{value:"Module"})),Eu=[{w:3.2,v:"itme"},{w:2.6,v:"omuz"},{w:1.6,v:"hafif"}],Id=[Ae.HANDL,Ae.HANDR,Ae.FARML,Ae.FARMR],Dd=[Ae.TORSO,Ae.PELVIS];function P_(s,t){const{sim:e,rng:n,diff:i}=s,r=s.attackTeam,a=s.defTeam,o=new Set,l=t||n.weighted(i.gray>.25?[...Eu,{w:1.4,v:"hafif"}]:Eu),c=290,h=n.sign(),u=re(e,r,[6,7,2,3],o),f=re(e,r,[9,10],o),d=re(e,a,[2,3],o),p=re(e,a,[1,4,3],o),v=Zn(a,0),g=n.range(31,37),m=h*n.range(0,9),_=14,x=n.int(70,80),y=x-n.int(4,9),R=x+9,w=n.range(43,46.5),T=m*.4,E=R+Math.round((w-(g+2.5))/6.2*30)+10,b=jn(s,c);b.path(u,[[0,g-30,m-h*8],[_,g-28.5,m-h*7.5],[_+30,g-26,m-h*7,"s"],[c-1,g-18,m-h*5]]),b.face(u,0,_+6,{X:g,Z:m}),b.pose(u,_-9,_+6,dt.KICK);const S=[[0,g-13,m+h*1.2],[y-30,g-7.2,m+h*.5],[y,g-2.6,m]];l==="itme"?(S.push([y+14,g-.6,m-h*.2],[y+30,g+.2,m-h*.3,"s"]),b.pose(d,y+2,y+18,dt.FALL,n.range(-.25,.25)),b.pose(d,y+19,c-1,dt.DOWN,0)):l==="hafif"?(S.push([y+18,g-.4,m-h*.4],[E,w-6,T+h*2.5],[c-1,w-4,T+h*2.5]),b.pose(d,y+30,c-1,dt.LOCO,Pn.PROTEST)):S.push([y+16,g+.4,m+h*.35],[E,w-3.5,T+h*2],[c-1,w-2.5,T+h*2.2]),b.path(d,S),b.path(f,[[0,g-15,m],[c-1,g,m]]),p!==null&&b.path(p,[[0,g-12,m-h*10],[y,g-4,m-h*9],[E,w-4,T-h*6],[c-1,w-3,T-h*5]]),Mc(b,v,E,h*n.range(1.3,2.9),n),b.build();const[P,O]=b.posR(d,y),[U,F]=b.R(...b.fwd(d,y));let K=l==="omuz"?.5:.74;const N=l==="itme"?-.03:l==="hafif"?-.01:-.025,Y=()=>{let Q,j;l==="omuz"?(Q=P-U*.12+-F*h*K,j=O-F*.12+U*h*K):(Q=P-U*K,j=O-F*K);const L=[g+2.5,m*.8];b.path(f,[[0,Q-9.5,j-h*1.2],[y-30,Q-4.6,j-h*.5],[y,Q,j],[R,L[0],L[1]],[E,w,T],[E+18,w+2.5,T],[c-1,w+1,T-h*6,"s"]]);const ft=b.specs.get(f);ft.poses=[],l!=="omuz"&&b.pose(f,y-12,y+10,dt.PUSH),b.pose(f,E-9,E+6,dt.KICK),b.pose(f,E+30,c-1,dt.CELEB),b.build()};Y();const H=wi(b),J=()=>l==="omuz"?pn(H,y-4,y+3,f,[Ae.TORSO],d,[Ae.TORSO]):pn(H,y-4,y+3,f,Id,d,Dd);for(let Q=0;Q<5;Q++){const L=J().minD-N;if(Math.abs(L)<.003)break;K-=L,Y()}b.ballHold(0,_-10,b.footBall(u,_));const st=b.footBall(u,_);b.ballLine(_-9,_,st,st);const lt=b.WB(g+.8,.11,m*.9);b.ballAir(_,x,st,lt,n.range(7,10));const[ht,St]=b.pos(f,R),[W,et]=b.fwd(f,R),yt=[ht+W*.6,.11,St+et*.6];b.ballAir(x,R,lt,yt,.5),b.ballCarry(f,R+1,E-10,.6);const ot=b.footBall(f,E);b.ballLine(E-9,E,b.ballAt(E-10),ot);const _t=h*n.range(1.2,3),wt=n.range(.3,1.8),At=Xa(b,E,ot,_t,wt),Gt=Jn(s,b,{type:"FAUL_GOL",subtype:l,keyFrame:y,focus:f,keep:[f,d],refDecision:"GOAL",appFrame:n.int(4,9),goalFrame:At,meta:{attacker:f,defender:d,push:l!=="omuz"},line:null,bestCam:2});return Gt.events.push({f:_,type:"kick"},{f:E,type:"kick"},{f:At,type:"goal",team:r,scorer:f}),Gt}function L_(s,t){const{attacker:e,defender:n}=t.meta,i=t.keyFrame,r=pn(s,i-4,i+3,e,Id,n,Dd),a=pn(s,i-4,i+3,e,[Ae.TORSO],n,[Ae.TORSO]);let o=!1;for(let f=i;f<=i+12;f++){const d=s.ent(f,n);if(d&&d.pose===dt.FALL){o=!0;break}}let l=!1;if(r.contact){const f=s.ent(r.first,e);l=f&&f.pose===dt.PUSH}let c,h,u=!1;return l&&o?(c="NOGOAL_FOUL",h={NOGOAL_FOUL:1}):l?(u=!0,c="NOGOAL_FOUL",h={NOGOAL_FOUL:1,GOAL:1}):(c="GOAL",h={GOAL:1}),{outcome:c,accept:h,gray:u,factual:!1,keyFrame:l?r.first:a.contact?a.first:i,facts:{handsContact:l,bodyContact:a.contact,fell:o,contactFrame:l?r.first:a.contact?a.first:-1,framesBeforeGoal:(t.goalFrame||0)-i}}}const I_=Object.freeze(Object.defineProperty({__proto__:null,generate:P_,judge:L_},Symbol.toStringTag,{value:"Module"}));function D_(s){const{sim:t,rng:e}=s,n=s.attackTeam,i=s.defTeam,r=new Set,a=240,o=e.int(80,96),l=e.sign(),c=re(t,n,[6,7,9,10,5,8],r),h=re(t,i,[6,7,5,8],r),u=re(t,i,[7,6,8,5],r),f=re(t,i,[2,3,1,4],r),d=e.range(-10,20),p=e.range(-16,16),v=jn(s,a);v.path(c,[[0,d-14,p-l*2],[o-30,d-5.4,p-l*.6],[o,d,p],[o+14,d+1.7,p+l*.3],[o+32,d+2.4,p+l*.5,"s"]]),v.pose(c,o+2,o+18,dt.FALL,l*.3),v.pose(c,o+19,o+120,dt.DOWN,l*.3),v.pose(c,o+121,o+150,dt.GETUP,l*.3),v.path(h,[[0,d+6,p+l*6],[a-1,d,p]]),v.build();const g=v.skel(c,o),m=[.5,l*.87],_=l>0?mt.ANKR:mt.ANKL,x=v.R(g.j[_*3],g.j[_*3+2]);let y=[x[0]+m[0]*.06,x[1]+m[1]*.06];const R=()=>{const ht=[y[0]+m[0]*.86,y[1]+m[1]*.86];v.path(h,[[0,ht[0]+m[0]*9,ht[1]+m[1]*9],[o-9,ht[0]+m[0]*1.2,ht[1]+m[1]*1.2],[o,ht[0],ht[1],"s"],[o+40,ht[0]+.4,ht[1]+m[1]*.4,"s"],[a-1,ht[0]+.6,ht[1]+m[1]*.5]]);const St=v.specs.get(h);St.poses=[],St.faces=[],v.face(h,o-12,o+8,{X:y[0],Z:y[1]}),v.build();const[W,et]=v.W(y[0],y[1]),[yt,ot]=v.toLocal(h,o,W,et);v.pose(h,o-9,o+7,dt.LUNGE,yt,ot,.1),v.build()};R();const w=wi(v);for(let ht=0;ht<4;ht++){const W=pn(w,o-7,o+3,h,We,c,We).minD- -.05;if(Math.abs(W)<.004)break;y=[y[0]-m[0]*W,y[1]-m[1]*W],R()}const[T,E]=v.posR(h,o),b=e.range(1.5,2.6),S=E+l*b*.55,P=T+b*.8;v.path(u,[[0,P+7,S+l*5],[o-10,P+1.2,S+l*.5],[o,P,S,"s"],[o+40,P-.4,S,"s"],[a-1,P-.6,S]]),v.face(u,o-6,a-1,{X:d+1.5,Z:p}),f!==null&&v.path(f,[[0,d+12,p-l*5],[o,d+5,p-l*4.5],[a-1,d+3.6,p-l*3.8]]);const U=Zi(s)?f!==null&&e.chance(.2)?f:u:h,F=o+e.int(55,70);v.build();const[K,N]=v.posR(U,F),Y=d-14,H=p-l*10;v.path(rn,[[0,Y-8,H],[o,Y,H+l*1],[F-4,K-2.6,N-l*.8,"s"],[a-1,K-2.6,N-l*.8]]),v.face(rn,F-12,a-1,{ent:U}),v.pose(rn,F,a-1,dt.CARD,1),v.pose(U,F+8,a-1,dt.LOCO,Pn.PROTEST),v.face(U,F-8,a-1,{ent:rn}),v.build(),v.ballCarry(c,0,o-3,.6);const[J,st]=v.fwd(c,o);v.ballLoose(o-2,a-1,v.ballAt(o-3),J*4,st*4,.3);const lt=Jn(s,v,{type:"KIMLIK",subtype:U===h?"dogruKisi":"yanlisKisi",keyFrame:o,focus:h,keep:[c,h,u,rn],refDecision:"CONFIRM",cardTarget:U,cardColor:"yellow",candidates:[h,u,f].filter(ht=>ht!==null),meta:{attacker:c,offender:h,teammate:u,cardFrame:F},line:null,bestCam:5});return lt.events.push({f:o+6,type:"whistle"},{f:F,type:"card",color:"yellow",target:U}),lt}function N_(s,t){const{attacker:e}=t.meta,n=t.keyFrame;let i=null;for(const l of t.candidates){const c=pn(s,n-7,n+3,l,We,e,We);(!i||c.minD<i.r.minD)&&(i={id:l,r:c})}const r=i.id,o=r===t.cardTarget?"CONFIRM":"SW:"+r;return{outcome:o,accept:{[o]:1},gray:!1,factual:!0,keyFrame:i.r.first>=0?i.r.first:n,facts:{offender:r,cardTarget:t.cardTarget,contactFrame:i.r.first}}}const O_=Object.freeze(Object.defineProperty({__proto__:null,generate:D_,judge:N_},Symbol.toStringTag,{value:"Module"}));function U_(s){const{sim:t,rng:e,diff:n}=s,i=s.attackTeam,r=s.defTeam,a=new Set,o=270,l=e.sign(),c=n.level,h=re(t,i,[l>0?5:8,5,8],a),u=re(t,i,[9,10],a),f=re(t,r,[l>0?4:1,1,4],a),d=re(t,r,[2,3],a),p=Zn(r,0),v=c===0?e.range(.08,.25):c===1?e.range(.03,.12):e.range(.008,.05),g=(e.chance(.5)?1:-1)*v,m=bt.HL+pe+g,_=l*e.range(9,17),x=e.int(100,116),y=x+e.int(20,26),R=y+e.int(16,22),w=e.range(43.5,46.5),T=l*e.range(.5,3.5),E=jn(s,o),b=[m-.95,_+l*.1];E.path(h,[[0,33,l*30],[x-50,44,l*26],[x-14,50.2,_+l*4],[x,b[0],b[1],"s"],[x+12,b[0]-.3,b[1]-l*.1,"s"]]),E.path(f,[[0,37,l*27],[x-14,48,_+l*6],[x,50.4,_-l*1.5],[o-1,49,_-l*2]]),d!==null&&E.path(d,[[0,46,l*3],[o-1,47.5,T+l*1.5]]),E.path(u,[[0,33,-l*6],[y,40.5,T-l*1.5],[R,w,T],[R+20,w+2.5,T],[o-1,w+1.5,T-l*6,"s"]]),Mc(E,p,R,-l*e.range(1.2,2.8),e),E.build();const S=E.WB(m,pe,_),P=E.WB(m-.75,pe,_-l*.25),[O,U]=E.W(w,T),F=Math.atan2(U-P[2],O-P[0]),K=Math.cos(F),N=Math.sin(F),Y=[.53,.1],H=[P[0]-(K*Y[0]-N*Y[1]),P[2]-(N*Y[0]+K*Y[1])],J=E.R(H[0],H[1]);E.specs.get(h).pts.push({f:y,X:J[0],Z:J[1],stop:!0},{f:o-1,X:J[0]-2,Z:J[1]-l*1.5,stop:!1}),E.face(h,x+12,y+6,{X:w,Z:T}),E.face(h,x-10,x+8,{X:m,Z:_}),E.build();const[lt,ht]=E.toLocal(h,x,S[0],S[2]);E.pose(h,x-9,x+7,dt.LUNGE,lt-.02,ht,.17),E.pose(h,y-9,y+6,dt.KICK),E.build(),E.ballCarry(h,0,x-15,.7),E.ballLine(x-14,x,E.ballAt(x-15),S,"out2"),E.ballLine(x,x+10,S,P,"out2"),E.ballHold(x+10,y-10,P);const St=E.footBall(h,y);E.ballLine(y-9,y,P,St),E.pose(u,R-9,R+6,dt.KICK),E.pose(u,R+30,o-1,dt.CELEB),E.build();const W=E.footBall(u,R);E.ballLine(y,R,St,W,"lin");const et=-l*e.range(1,2.8),yt=e.range(.3,1.6),ot=Xa(E,R,W,et,yt),_t=wi(E),wt=Cd(_t,0,y,s.dir),At=wt.margin>0,Q=Zi(s,c===2?.1:0)?!At:At,j=Jn(s,E,{type:"TOP_DISARI",subtype:At?"disari":"iceride",keyFrame:wt.frame,focus:h,keep:[h,u,f],refDecision:Q?"NOGOAL_OUT":"GOAL",goalFrame:ot,meta:{winger:h,striker:u,crossFrame:y,peakFrame:x,targetMargin:g,zb:_},line:"goal",bestCam:4});return j.events.push({f:y,type:"kick"},{f:R,type:"kick"},{f:ot,type:"goal",team:i,scorer:u}),Q&&(j.overlays.push({id:Pd(s.dir),f0:ot+8,f1:o-1,pose:dt.FLAG,p1:0}),j.events.push({f:ot+10,type:"flag"})),j}function F_(s,t){const e=Cd(s,0,t.meta.crossFrame,t.dir),i=e.margin>0?"NOGOAL_OUT":"GOAL";return{outcome:i,accept:{[i]:1},gray:!1,factual:!0,keyFrame:e.frame,facts:{marginM:e.margin,frame:e.frame}}}const z_=Object.freeze(Object.defineProperty({__proto__:null,generate:U_,judge:F_},Symbol.toStringTag,{value:"Module"})),Sc={OFSAYT:y_,PENALTI:M_,ELLE:E_,KIRMIZI:C_,FAUL_GOL:I_,KIMLIK:O_,TOP_DISARI:z_},bi=Object.keys(Sc);function B_(s,t){const e=Sc[s],n={...t,defTeam:1-t.attackTeam,dir:t.sim.dir(t.attackTeam)},i=e.generate(n);return i.type=s,i.ctx={diff:t.diff},i}function H_(s,t){return Sc[t.type].judge(s,t)}function G_(s){const{sim:t,rng:e}=s,n=s.attackTeam,i=s.defTeam,r=new Set,a=150,o=re(t,n,[9,10,7,6],r),l=Zn(i,0),c=bt.HL-bt.SPOT,h=70,u=e.chance(.78),f=e.sign(),d=jn(s,a);d.path(o,[[0,c-4.2,-1.6],[30,c-4.2,-1.6,"s"],[h,c-.55,-.12],[h+14,c+.6,0,"s"],[a-1,c+4,f*3]]),d.face(o,0,h+5,{X:bt.HL,Z:0}),d.pose(o,h-9,h+6,dt.KICK),u&&d.pose(o,h+30,a-1,dt.CELEB);const p=u&&e.chance(.65)?-f:f,v=-p;d.path(l,[[0,bt.HL-.3,0],[h,bt.HL-.4,0],[h+18,bt.HL-.6,p*1.7,"s"]]),d.face(l,0,a-1,{h:Math.PI}),d.pose(l,h-1,h+25,dt.DIVE,v),d.pose(l,h+26,a-1,dt.DOWN,v*Math.PI/2),d.build();const g=d.footBall(o,h);d.ballHold(0,h,[d.W(c,0)[0],.11,d.W(c,0)[1]]);const m=f*e.range(u?2.2:1.1,u?3.2:1.9),_=e.range(.3,u?1.9:1.2);let x=-1;if(u)x=Xa(d,h,g,m,_);else{const R=d.WB(bt.HL-.6,_,p*1.6);d.ballAir(h,h+10,g,R,.1);const w=d.WB(bt.HL-6,.11,p*9);d.ballAir(h+10,h+35,R,w,1.5),d.ballLoose(h+36,a-1,w,-s.dir*2,s.dir*p*1,0)}const y=Jn(s,d,{type:"PEN_KICK",keyFrame:h,focus:o,keep:[o,l],meta:{goal:u,kicker:o}});return y.events.push({f:20,type:"whistle"},{f:h,type:"kick"}),u?y.events.push({f:x,type:"goal",team:n,scorer:o}):y.events.push({f:h+10,type:"save"}),y.constrain=(R,w,T)=>R.idx===0?[w,T]:(s.dir*w>bt.HL-bt.BOX_D-1.5&&(w=s.dir*(bt.HL-bt.BOX_D-1.5-Math.abs(T)*.02)),[w,T]),y}const Ue={OFSAYT:{name:"Ofsayt şüpheli gol",icon:"🚩",factual:!0,outcomes:{GOAL:"Gol geçerli",OFFSIDE:"Ofsayt — gol iptal"},field:{GOAL:"GOL (bayrak kalkmadı)",OFFSIDE:"OFSAYT (yan hakem bayrak kaldırdı)"},tools:["offside"]},PENALTI:{name:"Penaltı şüphesi",icon:"⚠️",factual:!1,outcomes:{PEN:"Penaltı",NOFOUL:"Penaltı yok — oyun devam",DIVE:"Penaltı yok + simülasyon sarı kartı",FK:"Faul ceza sahası dışında — serbest vuruş"},field:{PEN:"PENALTI",NOFOUL:"DEVAM (faul yok)",FK:"SERBEST VURUŞ (ceza sahası dışı)"},tools:["contact","box"]},ELLE:{name:"Elle oynama şüphesi",icon:"✋",factual:!1,outcomes:{PEN:"Elle oynama — penaltı",NOFOUL:"Elle oynama yok — devam"},field:{PEN:"PENALTI (elle oynama)",NOFOUL:"DEVAM (elle oynama yok)"},tools:["contact","box"]},KIRMIZI:{name:"Kırmızı kart şüphesi",icon:"🟥",factual:!1,outcomes:{RED:"Direkt kırmızı kart",NORED:"Kırmızı kart yok (sarı kart yeterli)"},field:{RED:"KIRMIZI KART",NORED:"SARI KART"},tools:["contact"]},FAUL_GOL:{name:"Gol öncesi faul şüphesi",icon:"⚽",factual:!1,outcomes:{GOAL:"Gol geçerli",NOGOAL_FOUL:"Atakta faul var — gol iptal"},field:{GOAL:"GOL"},tools:["contact","app"]},KIMLIK:{name:"Kart kimlik kontrolü",icon:"🪪",factual:!0,outcomes:{CONFIRM:"Kart doğru oyuncuya gösterildi"},field:{CONFIRM:"SARI KART"},tools:["contact"]},TOP_DISARI:{name:"Top oyun dışında mı? (gol)",icon:"📏",factual:!0,outcomes:{GOAL:"Gol geçerli",NOGOAL_OUT:"Top oyun dışına çıkmıştı — gol iptal"},field:{GOAL:"GOL",NOGOAL_OUT:"GOL YOK (yan hakem: top dışarıda)"},tools:["goalline"]}};function Ar(s,t,e){if(t&&t.startsWith("SW:")){const n=+t.slice(3),i=e?e(n):null;return i?`Kart #${i.num} ${i.name}'e verilmeli`:"Kart başka oyuncuya verilmeli"}return Ue[s.type].outcomes[t]||t}function pr(s,t){if(s.type==="KIMLIK"){const e=t?t(s.cardTarget):null;return e?`SARI KART → #${e.num} ${e.name}`:"SARI KART"}if(s.type==="KIRMIZI"){const e=t?t(s.cardTarget):null,n=Ue.KIRMIZI.field[s.refDecision];return e?`${n} → #${e.num} ${e.name}`:n}return Ue[s.type].field[s.refDecision]||s.refDecision}function V_(s,t){const e=s.refDecision,n={check:{action:"CHECK",label:"Kontrol tamamlandı — saha kararı geçerli"},ofr:[],direct:[]},i=r=>Ar(s,r,t);switch(s.type){case"OFSAYT":case"TOP_DISARI":{const r=Object.keys(Ue[s.type].outcomes).filter(a=>a!==e);for(const a of r)n.direct.push({action:"DIRECT",outcome:a,label:i(a)});break}case"KIMLIK":for(const r of s.candidates)r!==s.cardTarget&&n.direct.push({action:"DIRECT",outcome:"SW:"+r,label:i("SW:"+r)});break;case"PENALTI":for(const r of["PEN","NOFOUL","DIVE"])r!==e&&n.ofr.push({action:"OFR",outcome:r,label:i(r)});e==="PEN"&&n.direct.push({action:"DIRECT",outcome:"FK",label:"Olgusal: faul ceza sahası DIŞINDA — serbest vuruş"}),e==="FK"&&n.direct.push({action:"DIRECT",outcome:"PEN",label:"Olgusal: faul ceza sahası İÇİNDE — penaltı"}),e==="FK"&&(n.ofr=n.ofr.filter(r=>r.outcome!=="PEN"));break;default:{const r=Object.keys(Ue[s.type].outcomes).filter(a=>a!==e);for(const a of r)n.ofr.push({action:"OFR",outcome:a,label:i(a)})}}return n}function Nd(s,t){return!t||t.action==="CHECK"?s.refDecision:t.outcome}const Od={dogru_mudahale:{text:"Doğru müdahale",cls:"ok"},dogru_kontrol:{text:"Doğru: müdahale gerekmiyordu",cls:"ok"},gri_kontrol:{text:"Doğru: gri alan, saha kararı korundu",cls:"ok"},kismi:{text:"Kısmen doğru düzeltme",cls:"mid"},gereksiz_gri:{text:"Gereksiz müdahale (gri alan)",cls:"mid"},yanlis_mudahale:{text:"Yanlış müdahale",cls:"bad"},kacirilan:{text:"Kaçırılan açık hata",cls:"bad"},yanlis_duzeltme:{text:"Hatalı düzeltme",cls:"bad"}};function W_(s,t,e={}){const n=s.truth,i=s.refDecision,r=n.accept[i]!==void 0,a=!n.gray&&!r,o=t.action!=="CHECK",l=Nd(s,t),c=n.accept[l];let h,u;a?o?c!==void 0?(h=c>=1?"dogru_mudahale":"kismi",u=Math.round(100*c)):(h="yanlis_duzeltme",u=15):(h="kacirilan",u=0):o?n.gray&&c!==void 0?(h="gereksiz_gri",u=40):(h="yanlis_mudahale",u=0):(h=n.gray?"gri_kontrol":"dogru_kontrol",u=100);let f=0;if(!e.noTimer&&u>=40&&s.timeLimit){const m=Math.min(1,t.timeUsed/s.timeLimit);f=m<=.25?20:Math.max(0,Math.round(20*(1-(m-.25)/.75))),t.timeout&&(f=0)}let d=0;const p=[],v=t.marks||{},g=n.keyFrame;if(s.type==="OFSAYT"){if(v.passFrame!==void 0&&v.passFrame!==null){const m=Math.abs(v.passFrame-g);m===0?(d+=5,p.push("Pas karesini tam buldun (+5)")):m===1?(d+=2,p.push("Pas karesi 1 kare kaydı (+2)")):p.push(`Pas karesi ${m} kare uzakta`)}if(v.offsideMargin!==void 0&&v.offsideMargin!==null){const m=Math.abs(v.offsideMargin-n.facts.marginM)*100,_=m<=2?10:m<=5?7:m<=10?4:m<=20?2:0;d+=_,p.push(`Çizgi farkı hatası ${m.toFixed(1)} cm (+${_})`)}}else if(v.contactFrame!==void 0&&v.contactFrame!==null&&n.facts&&(n.facts.contactFrame>=0||s.type==="TOP_DISARI")){const m=s.type==="TOP_DISARI"?n.facts.frame:n.facts.contactFrame,_=Math.abs(v.contactFrame-m),x=_<=1?10:_<=3?5:0;d+=x,p.push(_<=1?`Kritik kareyi buldun (+${x})`:`Kritik kareye ${_} kare uzaktın (+${x})`)}if(t.camsUsed&&t.camsUsed.has&&t.camsUsed.has(s.bestCam)&&(d+=5,p.push("En net kamerayı kullandın (+5)")),a&&o&&c!==void 0){const m=n.factual||s.type==="OFSAYT"||s.type==="TOP_DISARI"||s.type==="KIMLIK";(m?t.action==="DIRECT":t.action==="OFR")?(d+=5,p.push("Doğru prosedür (+5)")):p.push(m?"Olgusal karar doğrudan düzeltilebilirdi":"Yoruma dayalı kararda hakemi monitöre çağırmalıydın")}return d=Math.min(20,d),{verdict:h,acc:u,time:f,prec:d,total:u+f+d,clearError:a,intervened:o,final:l,notes:p}}function X_(s,t={}){if(!s.length)return{note:0,acc:0};const e=s.length,n=s.reduce((u,f)=>u+f.acc,0)/e,i=s.reduce((u,f)=>u+f.time,0)/e,r=s.reduce((u,f)=>u+f.prec,0)/e,a=s.filter(u=>u.verdict==="kacirilan").length,o=s.filter(u=>u.verdict==="yanlis_mudahale"||u.verdict==="yanlis_duzeltme").length,l=t.noTimer?0:.13;let c=10*((.75+(.13-l))*(n/100)+l*(i/20)+.12*(r/20));c-=a*.6+o*.3,c=Math.max(1,Math.min(10,Math.round(c*10)/10));const h=s.filter(u=>u.acc>=100).length;return{note:c,acc:n,time:i,prec:r,missed:a,wrong:o,correct:h,n:e,label:K_(c)}}function K_(s){return s>=9.2?"Kusursuz":s>=8.2?"Çok iyi":s>=7.2?"İyi":s>=6.2?"Yeterli":s>=5?"Zayıf":"Başarısız"}class Ud{constructor(t){this.cfg=t,this.seed=t.seed>>>0;const e=new Ve(this.seed);this.rng=e,this.squads=[Na(e.fork("h"),!!t.home.foreign),Na(e.fork("a"),!!t.away.foreign)],this.kits=vd(t.home,t.away),this.teams=[t.home,t.away],this.sim=new Td({seed:fn("sim"+this.seed),squads:this.squads}),this.rec=new s_,this.out=[],this.state="pre",this.t=0,this.incidents=[],this.results=[],this.events=[],this.refName=e.pick(Dx),this.avarName=e.pick(Nx),this.fans=[50,50],this.matchSeconds=t.matchSeconds||420,this.stoppage=[e.int(1,3),e.int(2,5)],this.plan=this.planIncidents(),this.next=0,this.cur=null,this.timer=0,this.record()}players(t){if(t==null||t<0||t>21)return null;const e=this.sim.ents[t];return{num:e.num,name:e.name,team:e.team,teamName:this.teams[e.team].short}}planIncidents(){const t=this.cfg,e=this.rng.fork("plan"),n=t.numIncidents||5,i=t.types&&t.types.length?t.types:bi,r=[];for(;r.length<n;)r.push(...e.shuffle(i.slice()));const a=r.slice(0,n),o=[],l=[[7,43],[48,87]];for(let c=0;c<n;c++){const h=c<Math.ceil(n/2)?0:1;o.push(e.range(l[h][0],l[h][1]))}o.sort((c,h)=>c-h);for(let c=1;c<n;c++)o[c]-o[c-1]<5&&(o[c]=Math.min(88,o[c-1]+5));return a.map((c,h)=>({type:c,minute:o[h],half:o[h]<45?1:2,attackTeam:e.int(0,1),seed:e.int(1,1e9)}))}emit(t){this.out.push(t)}record(){this.rec.push(this.sim)}start(){this.state="live",this.emit({type:"whistle",long:!0}),this.emit({type:"text",text:"Maç başladı!"})}update(t,e=1){if(this.state==="live"||this.state==="scenario"||this.state==="restartScript"){const n=this.state==="live"?e:1;this.acc=(this.acc||0)+t*n;let i=0;for(;this.acc>=te&&i<12;)if(this.acc-=te,i++,this.tick(),this.state!=="live"&&this.state!=="scenario"&&this.state!=="restartScript"){this.acc=0;break}}else this.state==="cutting"?(this.timer+=t,!this.cutDone&&this.timer>=.28&&(this.cutDone=!0,this.cutAction()),this.timer>=.6&&(this.state=this.cutNext,this.acc=0)):this.state==="aftermath"?(this.timer+=t,this.timer>=3.2&&this.beginReview()):this.state==="resume"&&(this.timer+=t,this.timer>=.4&&this.applyAftermath())}tick(){const t=this.sim;t.step(),t.mode==="free"?t.minute+=te*(90/this.matchSeconds):t.minute+=te/60,this.record();for(const i of t.events)this.handleSimEvent(i);if(t.events.length=0,this.state!=="live")return;const e=t.minute;if(t.half===1&&e>=45+this.stoppage[0]&&t.mode==="free"){this.halftime();return}if(t.half===2&&e>=90+this.stoppage[1]&&t.mode==="free"){this.fulltime();return}const n=this.plan[this.next];n&&t.mode==="free"&&e>=n.minute&&(n.half===t.half||e>n.minute+3||t.half===2)&&!t.setPiece&&t.celebrate<=0&&t.sinceRestart>3&&this.triggerIncident(n)}handleSimEvent(t){const e=this.sim;switch(t.type){case"goal":if(t.script){const n=this.cur;n&&n.sc.type!=="PEN_KICK"?n.sc.refDecision==="GOAL"?(e.score[t.team]++,n.goalCounted=!0,this.emit({type:"goal",team:t.team,scorer:t.scorer,pending:!0})):this.emit({type:"goalNoFlag",team:t.team}):this.penScript&&(e.score[t.team]++,this.events.push({kind:"goal",team:t.team,minute:e.minute,half:e.half,text:`Penaltı golü: ${this.players(t.scorer).name}`}),this.emit({type:"goal",team:t.team,scorer:t.scorer}))}else this.events.push({kind:"goal",team:t.team,minute:e.minute,half:e.half,text:`Gol: ${this.players(t.scorer).name}`}),this.emit({type:"goal",team:t.team,scorer:t.scorer}),this.emit({type:"text",text:"VAR sessiz kontrol: gol temiz."});break;case"kickoffNeeded":this.cut(()=>e.kickoff(t.team),"live");break;case"scriptEnd":this.penScript?this.endPenalty():this.endScenario();break;default:this.emit(t)}}cut(t,e){this.state="cutting",this.timer=0,this.cutDone=!1,this.cutAction=t,this.cutNext=e,this.emit({type:"cut"})}halftime(){this.state="halftime",this.emit({type:"whistle",long:!0,triple:!0}),this.emit({type:"halftime"})}continueSecondHalf(){const t=this.sim;t.half=2,t.minute=45,this.cut(()=>t.kickoff(1),"live"),this.emit({type:"text",text:"İkinci yarı başladı."})}fulltime(){this.state="ended",this.emit({type:"whistle",long:!0,triple:!0}),this.emit({type:"fulltime"})}diffFor(){return this.cfg.diff}triggerIncident(t){this.next++,this.cut(()=>this.startScenario(t),"scenario")}startScenario(t){const e=this.sim,n=new Ve(fn(`${this.seed}:${t.seed}:${t.type}`)),i=B_(t.type,{sim:e,rng:n,diff:this.diffFor(),attackTeam:t.attackTeam}),r={idx:this.incidents.length,type:t.type,sc:i,subtype:i.subtype,minute:e.minute,half:e.half,attackTeam:t.attackTeam,defTeam:1-t.attackTeam,dir:i.dir,refDecision:i.refDecision,cardTarget:i.cardTarget,candidates:i.candidates||[],bestCam:i.bestCam,line:i.line,focus:i.focus,meta:i.meta,timeLimit:this.cfg.noTimer?0:this.cfg.diff.time};this.cur=r,e.startScript(i),r.segStart=this.rec.count,this.emit({type:"incidentLive",inc:r})}endScenario(){const t=this.cur,e=t.sc;t.segEnd=t.segStart+e.n-1,t.appFrame=t.segStart+(e.appFrame||0);const n=p_(this.rec,t.segStart,e.n,Rd);t.truth=H_(n,e),t.truth.keyFrameAbs=t.segStart+t.truth.keyFrame,t.truth.facts&&t.truth.facts.contactFrame>=0&&(t.truth.facts.contactFrameAbs=t.segStart+t.truth.facts.contactFrame),this.incidents.push(t),this.state="aftermath",this.timer=0,this.emit({type:"fieldDecision",inc:t})}prepareSingle(t){const e=this.sim;for(let i=0;i<60;i++)e.step(),e.minute+=te*.2,this.record(),e.events.length=0;const n={type:t,minute:e.minute,half:1,attackTeam:this.rng.int(0,1),seed:this.rng.int(1,1e9)};for(this.cfg.attackMinute&&(e.minute=this.cfg.attackMinute),this.startScenario(n);e.mode==="script";){e.step(),e.minute+=te/60,this.record();for(const i of e.events)i.type==="scriptEnd"&&this.endScenario();e.events.length=0}return this.state="review",this.buildRadio(this.cur),this.cur}beginReview(){this.state="review";const t=this.cur;this.buildRadio(t),this.emit({type:"review",inc:t})}buildRadio(t){const e=new Ve(fn("radio"+this.seed+":"+t.idx)),n=this.cfg.diff,i=[];i.push({t:.5,who:"HAKEM",text:e.pick(Xx[t.type])});const r=e.chance(n.avar),a=e.range(6,14);e.chance(.6)&&i.push({t:a,who:"AVAR",text:e.pick(Kx[t.type])});const o=t.truth.outcome;let l=o.startsWith("SW:")?"SW":o;if(!r){const c=Object.keys(t.truth.accept).length>1?[t.refDecision]:Object.keys(Ue[t.type].outcomes).filter(h=>!(h in t.truth.accept));l=c.length?c[0]:l,t.type==="KIMLIK"&&(l=o==="CONFIRM"?"SW":"CONFIRM"),l.startsWith("SW:")&&(l="SW")}if(xu[l]&&i.push({t:a+e.range(8,16),who:"AVAR",text:xu[l],opinion:!0,correct:r}),t.timeLimit){const c=t.timeLimit,h=new Set;for(const u of[.45,.7,.88]){let f;do f=e.pick(yu);while(h.has(f)&&h.size<yu.length);h.add(f),i.push({t:c*u,who:"HAKEM",text:f,pressure:!0})}}t.radio=i.sort((c,h)=>c.t-h.t),t.avarCorrect=r}submitDecision(t){const e=this.cur,n=W_(e,t,{noTimer:this.cfg.noTimer}),i={inc:e,dec:t,ev:n};this.results.push(i),e.decision=t,e.eval=n,e.final=Nd(e,t);const r=e.attackTeam,a=["GOAL","PEN","RED","FK"].includes(e.final)||(e.type==="KIMLIK",!1);if(e.final!==e.refDecision){const l=a?r:1-r;this.fans[l]=Math.min(100,this.fans[l]+8),this.fans[1-l]=Math.max(0,this.fans[1-l]-14)}return this.state="resume",this.timer=0,this.emit({type:"decisionMade",inc:e,dec:t}),i}applyAftermath(){const t=this.cur,e=this.sim,n=t.final,i=t.attackTeam,r=t.defTeam,a=t.sc,o=Math.min(a.n-1,t.truth.keyFrame||0),l=a.tracks.has(a.focus)?a.tracks.get(a.focus).get(o,{}):{x:e.ball.x,z:e.ball.z},c=t.minute,h=t.half,u=(p,v,g)=>this.events.push({kind:p,team:v,minute:c,half:h,text:g,inc:t.idx});let f=null;if(["OFSAYT","TOP_DISARI","FAUL_GOL"].includes(t.type))n==="GOAL"&&!t.goalCounted&&(e.score[i]++,t.goalCounted=!0),n!=="GOAL"&&t.goalCounted&&(e.score[i]--,t.goalCounted=!1),n==="GOAL"?(u("goal",i,`Gol: ${this.players(a.meta.receiver||a.meta.attacker||a.meta.striker).name}${t.decision.action!=="CHECK"?" (VAR sonrası)":""}`),f=()=>e.kickoff(r)):(u("var",i,`VAR: ${Ue[t.type].outcomes[n]}`),n==="NOGOAL_OUT"?f=()=>e.restart(r,e.dir(i)*(bt.HL-5.5),3,"goalkick"):f=()=>e.restart(r,l.x,l.z,"fk"));else if(t.type==="PENALTI"||t.type==="ELLE")n==="PEN"?(u("var",i,t.decision.action==="CHECK"?"Penaltı":"VAR sonrası penaltı"),f="penalty"):n==="FK"?(u("var",i,"Serbest vuruş (ceza sahası dışı)"),f=()=>e.restart(i,l.x-e.dir(i)*.5,l.z,"fk")):(n==="DIVE"&&(this.giveCard(a.meta.attacker,"yellow"),u("card",i,`Sarı kart (simülasyon): ${this.players(a.meta.attacker).name}`)),t.refDecision==="PEN"&&u("var",i,"VAR sonrası penaltı iptal"),f=()=>e.restart(r,e.dir(i)*(bt.HL-5.5),0,"goalkick"));else if(t.type==="KIRMIZI"){const p=a.cardTarget;n==="RED"?(this.giveCard(p,"red"),u("card",r,`Kırmızı kart: ${this.players(p).name}${t.refDecision!=="RED"?" (VAR sonrası)":""}`)):(this.giveCard(p,"yellow"),u("card",r,`Sarı kart: ${this.players(p).name}${t.refDecision==="RED"?" (VAR: kırmızı iptal)":""}`)),f=()=>e.restart(i,l.x-e.dir(i)*.5,l.z,"fk")}else if(t.type==="KIMLIK"){const p=n.startsWith("SW:")?+n.slice(3):a.cardTarget;this.giveCard(p,"yellow"),u("card",r,`Sarı kart: ${this.players(p).name}${n.startsWith("SW:")?" (VAR: kimlik düzeltildi)":""}`),f=()=>e.restart(i,l.x-e.dir(i)*.5,l.z,"fk")}this.cur.done=!0,f==="penalty"?this.cut(()=>this.startPenalty(t),"restartScript"):this.cut(f,"live"),this.emit({type:"resumed",inc:t})}giveCard(t,e){const n=this.sim.ents[t];!n||!n.active||(e==="yellow"?(n.yellow++,n.yellow>=2&&(this.sim.sendOff(t),this.events.push({kind:"card",team:n.team,minute:this.sim.minute,half:this.sim.half,text:`İkinci sarıdan kırmızı: ${n.name}`}))):this.sim.sendOff(t))}startPenalty(t){const e=this.sim,n=new Ve(fn("pen"+this.seed+t.idx)),i=G_({sim:e,rng:n,diff:this.cfg.diff,attackTeam:t.attackTeam,defTeam:t.defTeam,dir:e.dir(t.attackTeam)});this.penScript={sc:i,inc:t},this.cur={sc:i,type:"PEN_KICK",idx:-1},e.startScript(i)}endPenalty(){const{sc:t,inc:e}=this.penScript;this.penScript=null,this.cur=e;const n=this.sim;t.meta.goal?this.cut(()=>n.kickoff(e.defTeam),"live"):(this.events.push({kind:"miss",team:e.attackTeam,minute:n.minute,half:n.half,text:"Penaltı kaçtı"}),this.cut(()=>n.restart(e.defTeam,n.dir(e.attackTeam)*(bt.HL-5.5),2,"goalkick"),"live"))}grade(){return X_(this.results.map(t=>t.ev),{noTimer:this.cfg.noTimer})}}async function Ec(s,t,e){const{MatchScreen:n}=await _c(async()=>{const{MatchScreen:r}=await import("./match-Bpz1o1LO.js");return{MatchScreen:r}},[],import.meta.url),i=new Ud(t);s.world.setTeams({kits:i.kits,squads:i.squads,teams:i.teams}),s.show(new n(s,i,e))}function Y_(s,t){const e=new Ve(t.seed||Date.now()*2654435761>>>0),n=t.derby?null:gi.find(l=>l.id===(t.league||"super")).teams;let i,r,a;if(t.derby){const l=e.pick(gd);[i,r]=e.chance(.5)?[l.a,l.b]:[l.b,l.a],a=`Hızlı Maç — ${l.name}`}else{const l=e.int(0,n.length-1);let c=e.int(0,n.length-2);c>=l&&c++,i=n[l],r=n[c],a="Hızlı Maç — "+gi.find(h=>h.id===(t.league||"super")).name}let o=Wa[t.diff||"orta"];return t.derby&&(o=Ad(o)),{mode:"quick",home:i,away:r,diff:o,numIncidents:t.n||5,types:t.types||bi,seed:e.int(1,2e9),matchSeconds:(s.settings.matchMinutes||7)*60,competition:a,stadium:e.pick(La.super),derby:!!t.derby}}function Tu(s,t=_d()){const e=fn("gunluk:"+t),n=new Ve(e),i=gi.find(o=>o.id==="super").teams,r=n.int(0,i.length-1);let a=n.int(0,i.length-2);return a>=r&&a++,{mode:"daily",home:i[r],away:i[a],diff:Wa.orta,numIncidents:5,types:bi,seed:e,matchSeconds:300,competition:`Günlük Zorluk — ${t}`,stadium:n.pick(La.super),dateKey:t}}function $_(s,t,e){const n=new Ve(e||Date.now()*2654435761>>>0),i=gi.find(o=>o.id==="super").teams,r=n.int(0,i.length-1);let a=n.int(0,i.length-2);return a>=r&&a++,{mode:"training",home:i[r],away:i[a],diff:Wa[t||"orta"],numIncidents:1,types:[s],seed:n.int(1,2e9),matchSeconds:420,competition:"Pozisyon Antrenmanı",noTimer:!0}}const Vn=s=>`${Math.abs(s*100).toFixed(Math.abs(s*100)<10?1:0)} cm`,q_=["VAR yalnızca dört durumda devreye girer: gol / gol değil, penaltı / penaltı değil, direkt kırmızı kart ve kimlik karışıklığı.","Temel ilke: “Açık ve net hata” ya da gözden kaçan ciddi bir olay yoksa saha kararına dokunulmaz. Yoruma açık (gri) pozisyonlarda saha kararı makulse VAR “Kontrol tamamlandı” der.","Olgusal kararlar (ofsayt çizgisi, top oyun dışında mı, faulün ceza sahası içinde mi dışında mı, kart kime gösterildi) ölçülebilir; yanlışsa VAR doğrudan düzeltir.","Yoruma dayalı kararlarda (temasın şiddeti, elin konumu, faulün sertliği) VAR hakemi monitöre çağırır: Sahada İnceleme (OFR). Son kararı saha hakemi verir.","Gol öncesi kontrol, Atak Başlangıç Anı’na (APP) kadar geriye gider. Bu aralıktaki faul, ofsayt ya da topun oyun dışına çıkması golü geçersiz kılar.","Sarı kartlar (ikinci sarı hariç) ve penaltı dışındaki serbest vuruşlar VAR incelemesine konu değildir."];function Fd(s){const t=s.truth,e=t.facts||{},n=[];switch(s.type){case"OFSAYT":{n.push("Kural 11: Topa takım arkadaşı oynadığı anda; kafa, gövde ya da ayaklarından herhangi biri rakip yarı sahada ve hem toptan hem de sondan ikinci rakip oyuncudan rakip kale çizgisine daha yakınsa oyuncu ofsayt konumundadır. Kollar ve eller (koltuk altının alt hizasından itibaren) hesaba katılmaz."),n.push(`Pas anında hücumcunun en ileri sayılabilir bölgesi “${e.attPart}”, sondan ikinci savunmacının ise “${e.secondPart}” idi.`),n.push(e.marginM>0?`Hücumcu ${Vn(e.marginM)} öndeydi: OFSAYT. Gol geçersiz.`:`Hücumcu ${Vn(e.marginM)} gerideydi: ofsayt değil. Gol geçerli.`),e.armAhead&&n.push("Dikkat: Pas anında hücumcunun kolu/eli vücudunun geri kalanından öndeydi. Kol ofsayta sayılmadığı için ölçüm vücudun diğer bölgelerinden yapılmalıydı."),n.push("Doğru pas karesi, topa ilk temasın olduğu karedir. Bir kare (1/30 sn) erken ya da geç seçmek, koşan bir oyuncu için 20 cm’den fazla fark yaratabilir.");break}case"PENALTI":{n.push("Kural 12: Rakibe dikkatsizce, pervasızca ya da aşırı güç kullanarak çelme takmak veya takmaya çalışmak doğrudan serbest vuruştur; kendi ceza sahasında yapılırsa penaltıdır. Faulün yeri temas noktasıdır ve ceza sahası çizgisi ceza sahasına dahildir."),e.contact?(n.push(`Temas vardı (iç içe geçme ${Vn(e.penetrationM)}). Temas noktası ceza sahası çizgisinin ${e.distLineM>=0?`${Vn(e.distLineM)} İÇİNDEYDİ`:`${Vn(e.distLineM)} DIŞINDAYDI`}.`),t.gray&&n.push("Temas hafifti; bu bir yorum meselesi (gri alan). Hakemin kararı makul olduğundan VAR müdahalesi gerekmez.")):(n.push(`Savunmacının ayağı ile hücumcunun bacağı arasında en az ${Vn(e.minDistM)} mesafe kaldı: TEMAS YOK.`),e.fell&&n.push("Hücumcu temas olmadan kendini attı. Bu bir simülasyondur; penaltı verilemez, sarı kart gerekir. (Simülasyon sarı kartı tek başına VAR konusu değildir, ama verilmiş bir penaltı iptal edilmelidir.)")),s.subtype==="clean"&&n.push("Savunmacı önce topa temiz şekilde oynadı.");break}case"ELLE":{n.push("Kural 12: Oyuncu kolunu/elini vücudunu doğal olmayan şekilde büyütecek biçimde açmışsa ve top koluna çarparsa elle oynamadır. Kol vücuda yakın, doğal konumdaysa ya da top omza (koltuk altının üst kısmı) çarptıysa elle oynama yoktur.");const i={kol:"kola/ele",omuz:"omza",govde:"gövdeye",kafa:"kafaya",bacak:"bacağa",ayak:"ayağa",yok:"hiçbir yere"}[e.region]||e.region;n.push(`Top ${i} çarptı (${e.part}). Kolun gövdeden açılma açısı yaklaşık ${Math.round(e.armAngleDeg)}°.`),e.region==="kol"&&e.armAngleDeg>=43?n.push("Kol belirgin şekilde açık; savunmacı vücudunu büyütmüş: PENALTI."):e.region==="kol"&&e.armAngleDeg>=23?n.push("Kol ne tam doğal ne de belirgin açık: gri alan. Saha kararı korunmalı."):e.region==="kol"?n.push("Kol vücuda yakın ve doğal pozisyonda: elle oynama yok."):n.push("Kola temas yok: elle oynama yok.");break}case"KIRMIZI":{s.meta.kind==="sert"?(n.push("Kural 12: Rakibin güvenliğini tehlikeye atan, aşırı güçle ya da krampon açık yapılan müdahale “ciddi faul hareketi”dir ve direkt kırmızı karttır. Pervasız ama tehlikeli olmayan müdahale sarı karttır."),n.push(`Temas yüksekliği yaklaşık ${Vn(e.studsHeightM)}, müdahale hızı ${e.speed.toFixed(1)} m/sn.`),n.push(e.studsHeightM>=.34?"Kramponlar baldır hizasında, yüksek hızla: rakibin sağlığını tehlikeye atan müdahale — KIRMIZI KART.":e.studsHeightM>=.22?"Temas bilek üstünde ama aşırı değil: gri alan. Saha kararı makul.":"Temas bilek hizasında, topa yönelik: sarı kart yeterli.")):(n.push("Kural 12: Bariz gol şansını faulle engellemek (DOGSO) kırmızı karttır. Değerlendirme: kaleye uzaklık, oyunun yönü, topun kontrolü ve araya girebilecek savunmacı sayısı."),e.coverClear>0?n.push(`Temas anında kale tarafında, hücumcunun yoluna girebilecek bir savunmacı vardı (en yakını ${e.nearestCoverM.toFixed(1)} m): bariz gol şansı yok, sarı kart.`):e.coverGray>0?n.push("Kale tarafında bir savunmacı vardı ama araya girip giremeyeceği tartışmalı: gri alan. Saha kararı korunmalı."):n.push(`Hücumcu kaleye ${e.distGoalM.toFixed(0)} m uzaklıkta, top kontrolünde ve önünde kaleciden başka kimse yoktu: bariz gol şansı engellendi — KIRMIZI KART.`));break}case"FAUL_GOL":{n.push("Gol kontrolü Atak Başlangıç Anı’na (APP) kadar geriye gider. Bu aralıkta hücum eden takımın yaptığı faul golü geçersiz kılar."),e.handsContact&&e.fell?n.push("Hücumcu, rakibini iki eliyle sırtından itti ve rakip yere düştü. Bu net bir faul: GOL İPTAL, savunma lehine serbest vuruş."):e.handsContact?n.push("Hücumcunun elleri rakibinin sırtındaydı ama itme hafifti, rakip dengesini korudu: gri alan. Saha kararı (gol) korunmalı."):n.push("Omuz omuza, topa yönelik ve normal güçte bir mücadele: faul yok. Gol geçerli."),n.push(`Temas golden yaklaşık ${(e.framesBeforeGoal/30).toFixed(1)} saniye önceydi; geriye sarıp APP’ye kadar izlemek gerekiyordu.`);break}case"KIMLIK":{n.push("VAR, kartın yanlış oyuncuya gösterildiği kimlik karışıklığında doğrudan müdahale eder (olgusal karar)."),n.push(e.offender===e.cardTarget?"Kart, çelmeyi takan oyuncuya gösterildi: doğru.":"Çelmeyi takan oyuncu kart gören oyuncu değildi! Kart, temas eden oyuncuya verilmeliydi.");break}case"TOP_DISARI":{n.push("Kural 9: Top yerde ya da havada, kale çizgisini veya taç çizgisini TAMAMEN geçtiğinde oyun dışıdır. Çizgi sahaya dahildir; topun çizgiye değen küçük bir kısmı bile kalsa top oyundadır."),n.push(e.marginM>0?`Top çizginin dış kenarını ${Vn(e.marginM)} tamamen geçti: OYUN DIŞI. Ardından gelen gol geçersiz.`:`Topun ${Vn(-e.marginM)}'lik kısmı hâlâ çizginin üzerindeydi: top oyunda. Gol geçerli.`);break}}return n}const zd={OFSAYT:"Pas karesini bul → hücumcunun kol hariç en ileri bölgesini işaretle → sondan ikinci savunmacıyı işaretle → çizgileri karşılaştır.",PENALTI:"Yakın plan ve kale arkası kamerasıyla temas karesini bul; ceza sahası çizgisi göstergesini aç; dalış mı, temas mı, içeride mi?",ELLE:"Topun çarptığı bölgeyi bul: kol mu omuz mu? Kol vücudu büyütüyor mu?",KIRMIZI:"Temas yüksekliği ve hız (sert faul) ya da kale tarafındaki savunmacılar (gol fırsatı).",FAUL_GOL:"Golden geriye, APP işaretine kadar sar. Hücumcunun elleri rakibin sırtında mı?",KIMLIK:"Yakın planda formaları oku: çelmeyi takan kim, kartı gören kim?",TOP_DISARI:"Çizgi kamerasında topun en dış karesini bul; topun tamamı çizginin dışında mı?"},lr=[.1,.25,.5,1],Z_=[0,2,3,5];class Bd{constructor(t,e,n,i={}){this.app=t,this.s=e,this.inc=n,this.opts=i,this.rec=e.rec,this.f0=n.segStart,this.f1=n.segEnd,this.ph=this.f0,this.playing=!i.readOnly,this.speed=1,this.layout=(t.isTouch,1),this.views=Z_.map(r=>({cam:r,zoom:1,panX:0,panY:0,camObj:xc()})),this.active=0,this.camsUsed=new Set([0]),this.tool=null,this.off={passFrame:null,att:null,def:null},this.marks={contactFrame:null},this.boxOn=!1,this.goalOn=!1,this.truthOn=!1,this.timeUsed=0,this.timeLimit=i.readOnly||i.training?0:n.timeLimit,this.radioShown=0,this.sel=null,this.decided=!!i.readOnly,this.guideIdx=0,this.lastTick=999,this.sk=Vs(),this.raycaster=new Hy,this.players=r=>e.players(r),this.build(),this.app.world.overlays.clear(),i.readOnly&&this.addMsg("sys","ANALİZ","Gerçek cevaplar için sağdaki “Gerçek” araçlarını kullan.")}build(){const t=this.inc,e=Ue[t.type];this.timerEl=M("div.var-timer",null,this.timeLimit?mu(this.timeLimit):"∞");const n=M("div.var-top",null,M("span.var-tag",null,this.opts.readOnly?"ANALİZ":"VAR"),M("span.var-title",null,`${e.icon} ${e.name} · ${xd(t.minute,t.half)}`),M("span.var-field",null,"Saha kararı:",M("b",null,pr(t,this.players))),this.timerEl);this.viewsEl=M("div.var-views.l1"),this.vpEls=this.views.map((o,l)=>{const c=M("div.vp-label"),h=M("div.vp-zoom"),u=M("div.vp",null,c,h,M("div.vp-rec",null,"● REPLAY"));return u._lab=c,u._zoom=h,this.bindViewport(u,l),u}),this.readout=M("div.vp-readout",{style:{display:"none"}}),this.refreshViews(),this.tlFill=M("div.tl-fill"),this.tlHead=M("div.tl-head"),this.tlMarks=M("div",{style:{position:"absolute",inset:0,pointerEvents:"none"}}),this.tl=M("div.tl",null,M("div.tl-ticks"),this.tlFill,this.tlMarks,this.tlHead),this.bindTimeline(),this.tlInfo=M("div.tl-info"),this.playBtn=M("button.btn.small",{onclick:()=>this.togglePlay(),title:"Oynat / Duraklat (Boşluk)"},"▶"),this.speedBtns=lr.map(o=>M("button.btn.small.speed-btn",{onclick:()=>this.setSpeed(o)},o+"x")),this.speedCycle=M("button.btn.small.speed-cycle",{onclick:()=>this.setSpeed(lr[(lr.indexOf(this.speed)+1)%lr.length])},"1x"),this.layoutBtns=[1,2,4].map(o=>M("button.btn.small",{onclick:()=>this.setLayout(o),title:o+" görüntü"},o===1?"▣":o===2?"◫":"⊞"));const i=o=>()=>this.stepFrame(o),r=M("div.var-bottom",null,M("div.tl-row.wrap",null,M("button.btn.small",{onclick:()=>this.seek(this.inc.appFrame),title:"Atak başlangıç anına (APP) git"},"⏮ APP"),M("button.btn.small.far",{onclick:i(-10),title:"10 kare geri (Shift+←)"},"«"),M("button.btn.small",{onclick:i(-1),title:"1 kare geri (←)"},"‹ 1"),this.playBtn,M("button.btn.small",{onclick:i(1),title:"1 kare ileri (→)"},"1 ›"),M("button.btn.small.far",{onclick:i(10),title:"10 kare ileri (Shift+→)"},"»"),M("span.muted.hiz",{style:{fontSize:"11px",marginLeft:"6px"}},"HIZ"),...this.speedBtns,this.speedCycle,M("div.grow"),...this.layoutBtns),M("div.tl-row",null,this.tl,this.tlInfo));this.camBtns=fr.map(o=>M("button.btn.cam-btn",{onclick:()=>this.setCam(o.id)},M("span.n",null,o.id+1),o.short)),this.toolSec=M("div.sec"),this.radioEl=M("div.var-radio"),this.decideEl=M("div.var-decide");const a=M("div.var-side",null,M("div.sec",null,M("h5",null,"KAMERALAR (seçili görüntüye)"),M("div.cam-grid",null,...this.camBtns)),this.toolSec,M("div.sec",{style:{padding:"6px 12px 0",borderBottom:0}},M("h5",null,"TELSİZ")),this.radioEl,this.decideEl);this.viewsEl.appendChild(this.readout),this.guideEl=M("div.guide",{style:{display:"none"},onclick:()=>this.guideEl.classList.toggle("min"),title:"Küçült / büyüt"}),this.el=M("div.screen.var",null,n,this.viewsEl,a,r,this.guideEl),this.renderTools(),this.renderDecision(),this.updateButtons(),this.updateTimeline()}refreshViews(){ma(this.viewsEl),this.viewsEl.className="var-views l"+this.layout;for(let t=0;t<this.layout;t++){const e=this.vpEls[t];e.classList.toggle("active",t===this.active&&this.layout>1),this.viewsEl.appendChild(e)}this.readout&&this.viewsEl.appendChild(this.readout),this.updateLabels()}updateLabels(){for(let t=0;t<this.views.length;t++){const e=this.vpEls[t],n=this.views[t];e._lab.innerHTML="",e._lab.append(M("span.n",null,String(n.cam+1)),fr[n.cam].name.toUpperCase()),e._zoom.textContent=n.zoom>1.01?`🔍 ${n.zoom.toFixed(1)}x`:""}}renderTools(){const t=this.inc,e=Ue[t.type].tools,n=this.toolSec;if(ma(n),n.appendChild(M("h5",null,"ARAÇLAR")),e.includes("offside")){const i=this.tool==="offside";if(n.appendChild(M("button.btn.small.tool-btn"+(i?".on":""),{onclick:()=>{this.tool=i?null:"offside",this.renderTools(),this.updateOverlays()}},"📐 Ofsayt aracı")),i){const r=this.off,a=(l,c,h,u)=>M("div.step"+(h?".done":u?".cur":""),null,M("i",null,h?"✓":l),M("span",null,c)),o=r.passFrame===null?1:r.att?r.def?4:3:2;n.appendChild(M("div.tool-box",null,a(1,"Pasın çıktığı kareyi bul (topa ilk temas) ve “Pas karesi” de.",r.passFrame!==null,o===1),a(2,"Hücumcunun kol HARİÇ en ileri bölgesine tıkla.",!!r.att,o===2),a(3,"Sondan ikinci savunmacının kalesine en yakın bölgesine tıkla.",!!r.def,o===3),M("div.row",{style:{marginTop:"6px"}},M("button.btn.small."+(o===1?"primary":"ghost"),{onclick:()=>this.setPassFrame()},"⏺ Pas karesi"),r.passFrame!==null?M("button.btn.small.ghost",{onclick:()=>this.seek(r.passFrame)},"↩ Kareye dön"):null,M("button.btn.small.ghost",{onclick:()=>{this.off={passFrame:null,att:null,def:null},this.renderTools(),this.updateOverlays()}},"Sıfırla"))))}}if(e.includes("contact")||e.includes("goalline")){const i=t.type==="TOP_DISARI"?"📍 Bu kare: topun en dış noktası":"📍 Bu kare: kritik an (temas)";n.appendChild(M("button.btn.small.tool-btn"+(this.marks.contactFrame!==null?".on":""),{onclick:()=>this.markContact()},i+(this.marks.contactFrame!==null?`  [${this.marks.contactFrame-this.f0}]`:"")))}if(e.includes("box")&&n.appendChild(M("button.btn.small.tool-btn"+(this.boxOn?".on":""),{onclick:()=>{this.boxOn=!this.boxOn,this.renderTools(),this.updateOverlays()}},"🟨 Ceza sahası çizgisi göstergesi")),e.includes("goalline")&&n.appendChild(M("button.btn.small.tool-btn"+(this.goalOn?".on":""),{onclick:()=>{this.goalOn=!this.goalOn,this.renderTools(),this.updateOverlays()}},"🟦 Kale çizgisi göstergesi")),this.opts.readOnly||this.opts.training&&this.decided){n.appendChild(M("h5",{style:{marginTop:"8px"}},"GERÇEK CEVAP"));const i=t.truth;n.appendChild(M("button.btn.small.tool-btn",{onclick:()=>this.seek(this.f0+i.keyFrame)},`🎯 Doğru kritik kareye git [${i.keyFrame}]`)),t.type==="OFSAYT"&&n.appendChild(M("button.btn.small.tool-btn"+(this.truthOn?".on":""),{onclick:()=>{this.truthOn=!this.truthOn,this.renderTools(),this.updateOverlays()}},"✅ Gerçek ofsayt çizgileri"))}}renderDecision(){const t=this.decideEl;if(ma(t),this.opts.readOnly){t.appendChild(M("button.btn.primary.dec-btn",{onclick:()=>this.opts.onExit&&this.opts.onExit()},"← Rapora dön"));return}if(this.decided)return;const e=V_(this.inc,this.players),n=(i,r="")=>M("button.btn.dec-btn"+r+(this.sel===i?".sel":""),{onclick:()=>{this.sel=i,this.app.audio.ui("click"),this.renderDecision()}},i.label);if(t.appendChild(M("div.dec-label",null,"KARAR")),t.appendChild(n(e.check,".primary")),e.ofr.length){t.appendChild(M("div.dec-label",null,"📺 SAHADA İNCELEME ÖNER (OFR)"));for(const i of e.ofr)t.appendChild(n(i,".warn"))}if(e.direct.length){t.appendChild(M("div.dec-label",null,"✏️ DOĞRUDAN DÜZELTME (olgusal)"));for(const i of e.direct)t.appendChild(n(i,".danger"))}this.sel&&t.appendChild(M("button.btn.primary.dec-btn",{style:{justifyContent:"center",fontWeight:900,letterSpacing:"1px",marginTop:"4px"},onclick:()=>this.submit(!1)},"✔ KARARI GÖNDER"))}bindViewport(t,e){const n=new Map;let i=null,r=!1,a=null;t.addEventListener("pointerdown",l=>{try{t.setPointerCapture(l.pointerId)}catch{}if(n.set(l.pointerId,{x:l.clientX,y:l.clientY}),n.size===1&&(i={x:l.clientX,y:l.clientY,panX:this.views[e].panX,panY:this.views[e].panY,btn:l.button},r=!1),n.size===2){const[c,h]=[...n.values()];a={d:Math.hypot(c.x-h.x,c.y-h.y),zoom:this.views[e].zoom,cx:(c.x+h.x)/2,cy:(c.y+h.y)/2},r=!0}}),t.addEventListener("pointermove",l=>{if(!n.has(l.pointerId))return;n.set(l.pointerId,{x:l.clientX,y:l.clientY});const c=this.views[e],h=t.getBoundingClientRect();if(n.size===2&&a){const[d,p]=[...n.values()],v=Math.hypot(d.x-p.x,d.y-p.y);this.zoomAt(e,a.zoom*(v/a.d),(a.cx-h.left)/h.width,(a.cy-h.top)/h.height);return}if(!i)return;const u=l.clientX-i.x,f=l.clientY-i.y;if(Math.hypot(u,f)>6&&(r=!0),r&&c.zoom>1.01){const d=c.zoom;c.panX=i.panX-u/d/(h.width-h.width/d),c.panY=i.panY-f/d/(h.height-h.height/d),c.panX=Math.max(-.5,Math.min(.5,c.panX)),c.panY=Math.max(-.5,Math.min(.5,c.panY))}});const o=l=>{n.has(l.pointerId)&&(n.delete(l.pointerId),n.size<2&&(a=null),n.size===0&&(!r&&i&&i.btn===0&&this.onTap(e,l),i=null))};t.addEventListener("pointerup",o),t.addEventListener("pointercancel",o),t.addEventListener("wheel",l=>{l.preventDefault();const c=t.getBoundingClientRect(),h=this.views[e];this.zoomAt(e,h.zoom*Math.pow(1.0018,-l.deltaY),(l.clientX-c.left)/c.width,(l.clientY-c.top)/c.height)},{passive:!1}),t.addEventListener("dblclick",()=>{const l=this.views[e];l.zoom=1,l.panX=l.panY=0,this.updateLabels()})}gamepadPan(t,e){const n=this.views[this.active];n.zoom<=1.01||(n.panX=Math.max(-.5,Math.min(.5,n.panX+t/n.zoom*1.5)),n.panY=Math.max(-.5,Math.min(.5,n.panY+e/n.zoom*1.5)))}zoomAt(t,e,n,i){const r=this.views[t];e=Math.max(1,Math.min(10,e));const a=this.vpEls[t].getBoundingClientRect(),o=a.width,l=a.height,c=r.zoom,h=c>1.001?(o-o/c)*(.5+r.panX):0,u=c>1.001?(l-l/c)*(.5+r.panY):0,f=h+n*o/c,d=u+i*l/c;e>1.001?(r.panX=(f-n*o/e)/(o-o/e)-.5,r.panY=(d-i*l/e)/(l-l/e)-.5):r.panX=r.panY=0,r.zoom=e,this.updateLabels()}onTap(t,e){t!==this.active&&(this.active=t,this.refreshViews(),this.updateButtons()),this.tool==="offside"&&this.off.passFrame!==null&&!this.decided&&this.offsideClick(t,e)}pick(t,e){const n=this.vpEls[t],i=n.getBoundingClientRect(),r=new vt((e.clientX-i.left)/i.width*2-1,-((e.clientY-i.top)/i.height)*2+1),a=this.views[t].camObj;this.raycaster.setFromCamera(r,a);const o=this.app.world.pickables.filter(l=>l.parent&&l.parent.visible);return this.raycaster.intersectObjects(o,!1)}offsideClick(t,e){const n=this.pick(t,e);if(!n.length){di("Bir oyuncunun vücuduna tıkla.");return}let i=n[0];const{ent:r}=i.object.userData;if(be[i.object.userData.part].cat==="kol"){const u=n.find(f=>f.object.userData.ent===r&&be[f.object.userData.part].cat!=="kol");u&&(i=u)}const a=i.object.userData.part,o=this.inc,l=r<11?0:r<22?1:2;let h=this.off.att?this.off.def?null:"def":"att";if(h||(h=l===o.attackTeam?"att":"def"),h==="att"&&l!==o.attackTeam){di("Önce HÜCUM eden takımdan oyuncu işaretle.","warn");return}if(h==="def"&&l!==o.defTeam){di("Savunma takımından bir oyuncu işaretle.","warn");return}if(be[a].cat==="kol"){di("Kol ve el ofsayt değerlendirmesinde sayılmaz! Başka bölge seç.","bad"),this.app.audio.ui("bad");return}this.playheadFrame()!==this.off.passFrame&&di(`Çizgi pas karesine (${this.off.passFrame-this.f0}) göre çizildi.`),this.off[h]={ent:r,part:a,point:[i.point.x,i.point.y,i.point.z]},this.app.audio.ui("mark"),this.renderTools(),this.updateOverlays()}bindTimeline(){let t=!1;const e=n=>{const i=this.tl.getBoundingClientRect(),r=Math.max(0,Math.min(1,(n.clientX-i.left)/i.width));this.playing=!1,this.ph=Math.round(this.f0+r*(this.f1-this.f0)),this.updateButtons()};this.tl.addEventListener("pointerdown",n=>{t=!0;try{this.tl.setPointerCapture(n.pointerId)}catch{}e(n)}),this.tl.addEventListener("pointermove",n=>{t&&e(n)}),this.tl.addEventListener("pointerup",()=>{t=!1}),this.tl.addEventListener("pointercancel",()=>{t=!1})}onKey(t){if(t.target&&t.target.tagName==="INPUT")return;const e=t.key;if(e==="ArrowLeft")this.stepFrame(t.shiftKey?-10:-1),t.preventDefault();else if(e==="ArrowRight")this.stepFrame(t.shiftKey?10:1),t.preventDefault();else if(e===" ")this.togglePlay(),t.preventDefault();else if(e>="1"&&e<="6")this.setCam(+e-1);else if(e==="Tab")t.preventDefault(),this.active=(this.active+1)%this.layout,this.refreshViews(),this.updateButtons();else if(e==="+"||e==="="){const n=this.views[this.active];this.zoomAt(this.active,n.zoom*1.25,.5,.5)}else if(e==="-"){const n=this.views[this.active];this.zoomAt(this.active,n.zoom/1.25,.5,.5)}else if(e==="p"||e==="P")this.tool==="offside"&&this.setPassFrame();else if(e==="k"||e==="K")this.markContact();else if(e==="a"||e==="A")this.seek(this.inc.appFrame);else if(e==="["||e==="]"){const n=this.views[this.active];this.setCam((n.cam+(e==="]"?1:fr.length-1))%fr.length)}else if(e==="m"||e==="M")this.tool==="offside"&&this.off.passFrame===null?this.setPassFrame():this.tool!=="offside"?this.markContact():this.setPassFrame();else if(e==="l"||e==="L")this.setLayout(this.layout===1?2:this.layout===2?4:1);else if(e==="0"){const n=this.views[this.active];n.zoom=1,n.panX=n.panY=0,this.updateLabels()}else e==="Escape"&&this.sel&&!this.decided&&(this.sel=null,this.renderDecision())}playheadFrame(){return Math.round(this.ph)}togglePlay(){!this.playing&&this.ph>=this.f1-.5&&(this.ph=this.f0),this.playing=!this.playing,this.updateButtons()}setSpeed(t){this.speed=t,this.updateButtons()}setLayout(t){this.layout=t,this.active>=t&&(this.active=0);for(let e=0;e<t;e++)this.camsUsed.add(this.views[e].cam);this.refreshViews(),this.updateButtons()}setCam(t){this.views[this.active].cam=t,this.camsUsed.add(t),this.app.audio.ui("click"),this.updateLabels(),this.updateButtons()}stepFrame(t){this.playing=!1,this.ph=Math.max(this.f0,Math.min(this.f1,this.playheadFrame()+t)),this.updateButtons(),this.app.audio.ui("tick")}seek(t){this.playing=!1,this.ph=Math.max(this.f0,Math.min(this.f1,t)),this.updateButtons()}setPassFrame(){this.playing=!1,this.off.passFrame=this.playheadFrame(),this.ph=this.off.passFrame,this.app.audio.ui("mark"),this.renderTools(),this.updateOverlays(),this.updateButtons()}markContact(){this.decided&&!this.opts.training||(this.playing=!1,this.marks.contactFrame=this.playheadFrame(),this.ph=this.marks.contactFrame,this.app.audio.ui("mark"),this.renderTools(),this.updateButtons())}offsideMeasure(){const t=this.off;if(t.passFrame===null||!t.att||!t.def)return null;const e=this.inc.dir,n=a=>{const o=this.rec.ent(t.passFrame,a.ent);return qn(o,this.sk),Md(this.sk,a.part,e,0)},i=n(t.att),r=n(t.def);return{a:i,d:r,margin:i-r}}updateOverlays(){const t=this.app.world.overlays,e=this.inc,n=e.dir;if(t.clear(),t.showBox(n,this.boxOn),t.showGoal(n,this.goalOn),this.tool==="offside"||this.truthOn){const i=this.offsideMeasure();if(this.off.att&&t.marker(0,this.off.att.point),this.off.def&&t.marker(1,this.off.def.point),i){t.setLine("attLine",i.a*n),t.setLine("defLine",i.d*n);const r=i.margin*100,a=r>0;this.readout.style.display="",this.readout.innerHTML="",this.readout.append(M("div",{class:"muted",style:{fontSize:"11px"}},`Pas karesi ${this.off.passFrame-this.f0} · ${be[this.off.att.part].name} ↔ ${be[this.off.def.part].name}`),M("b",{style:{color:a?"var(--red)":"var(--green)"}},`${a?"+":"−"}${Math.abs(r).toFixed(1)} cm`),M("div",null,a?"Hücumcu önde → OFSAYT":"Hücumcu geride → ofsayt değil"))}else this.readout.style.display=this.tool==="offside"?"":"none",this.readout.innerHTML='<span class="muted">Ofsayt aracı: adımları takip et</span>'}else this.readout.style.display="none";if(this.truthOn&&e.type==="OFSAYT"){const i=e.truth.facts;t.setLine("truthAtt",i.attExt*n),t.setLine("truthDef",i.defExt*n);const r=M("div",{style:{color:"var(--green)",fontSize:"12px",marginTop:"4px"}},`GERÇEK: ${i.marginM>0?"+":"−"}${Math.abs(i.marginM*100).toFixed(1)} cm (kare ${e.truth.keyFrame}) — beyaz/yeşil çizgi`);this.readout.style.display="",this.readout.appendChild(r)}}submit(t){if(this.decided)return;const e=t?{action:"CHECK"}:this.sel;if(!e)return;this.decided=!0,this.playing=!1;const n=this.offsideMeasure(),i={action:e.action,outcome:e.outcome,timeUsed:this.timeUsed,timeout:!!t,camsUsed:new Set(this.camsUsed),marks:{passFrame:this.off.passFrame!==null?this.off.passFrame-this.f0:null,offsideMargin:n?n.margin:null,contactFrame:this.marks.contactFrame!==null?this.marks.contactFrame-this.f0:null}};if(this.app.audio.ui("stamp"),this.app.gamepad&&this.app.gamepad.rumble(180,.6),this.renderDecision(),this.opts.training){const r=this.s.submitDecision(i);this.showFeedback(r),this.opts.onTrainingResult&&this.opts.onTrainingResult(r)}else this.opts.onDecision&&this.opts.onDecision(i)}showOverlay(t,e,n){const i=M("div.ofr-overlay",null,t==="ofr"?M("div.monitor-ico"):null,M("div.big",null,e),n?M("div",{style:{fontSize:"15px",color:"#cfd8e3",maxWidth:"520px"}},n):null);return this.viewsEl.appendChild(i),i}showFeedback(t){const e=this.inc,n=t.ev,i=e.truth,r=Od[n.verdict],a=t.dec.action==="CHECK"?`Kontrol tamamlandı (saha kararı: ${pr(e,this.players)})`:Ar(e,t.dec.outcome,this.players)+(t.dec.action==="OFR"?" (OFR)":" (doğrudan)"),o=i.gray?`Gri alan — saha kararı korunmalı (${pr(e,this.players)})`:n.clearError?Ar(e,i.outcome,this.players):`Müdahale yok — saha kararı doğru (${pr(e,this.players)})`,l=M("div.fb-body",null,M("div.kv",null,M("span",null,"Senin kararın"),M("span",null,a),M("span",null,"Doğru karar"),M("span",null,o),M("span",null,"Puan"),M("span",null,`${n.acc} doğruluk + ${n.prec} hassasiyet`)),n.notes.length?M("div.muted",{style:{fontSize:"13px",margin:"6px 0"}},n.notes.join(" · ")):null,M("div.rule",null,...Fd(e).map(h=>M("p",null,h))),M("p.muted",{style:{fontSize:"12.5px"}},"💡 "+zd[e.type])),c=M("div.panel.feedback",null,M("div.fb-head",null,M("span.verdict."+r.cls,null,r.text),M("div.grow"),M("button.btn.small",{onclick:()=>{c.remove(),this.renderTools()}},"🔍 Görüntüyü incele"),this.opts.onNext?M("button.btn.small.primary",{onclick:()=>this.opts.onNext()},this.opts.nextLabel||"Yeni pozisyon"):null,this.opts.onExit?M("button.btn.small",{onclick:()=>this.opts.onExit()},"Menü"):null),l);this.el.appendChild(c),this.app.audio.ui(r.cls==="ok"?"good":"bad"),this.renderTools(),this.decideEl.innerHTML="",this.decideEl.append(M("button.btn.small.dec-btn",{onclick:()=>{c.isConnected||this.el.appendChild(c)}},"📋 Sonucu göster"),this.opts.onNext?M("button.btn.primary.dec-btn",{onclick:()=>this.opts.onNext()},this.opts.nextLabel||"Yeni pozisyon"):null)}addMsg(t,e,n,i){const r=M("div.rmsg."+t+(i?".pressure":""),null,M("b",null,e),n);this.radioEl.appendChild(r),this.radioEl.scrollTop=this.radioEl.scrollHeight}updateButtons(){this.playBtn.textContent=this.playing?"⏸":"▶",this.speedBtns.forEach((e,n)=>e.classList.toggle("on",lr[n]===this.speed)),this.speedCycle.textContent="⏱ "+this.speed+"x",this.layoutBtns.forEach((e,n)=>e.classList.toggle("on",[1,2,4][n]===this.layout));const t=this.views[this.active].cam;this.camBtns.forEach((e,n)=>e.classList.toggle("on",n===t)),this.updateTimeline()}updateTimeline(){const t=this.f1-this.f0||1,e=o=>(o-this.f0)/t*100+"%";this.tlHead.style.left=e(this.ph),this.tlFill.style.width=e(this.ph);const n=[];n.push(["app",this.inc.appFrame,"APP"]),this.off.passFrame!==null&&n.push(["pass",this.off.passFrame,"PAS"]),this.marks.contactFrame!==null&&n.push(["contact",this.marks.contactFrame,this.inc.type==="TOP_DISARI"?"ÇİZGİ":"TEMAS"]),(this.opts.readOnly||this.opts.training&&this.decided)&&n.push(["truth",this.f0+this.inc.truth.keyFrame,"GERÇEK"]);const i=n.map(o=>o.join(":")).join("|");if(i!==this._mk){this._mk=i,ma(this.tlMarks);for(const[o,l,c]of n)this.tlMarks.appendChild(M("div.tl-mark."+o,{style:{left:e(l)}},M("span",null,c)))}const r=this.playheadFrame(),a=(r-this.f0)/Ol;this.tlInfo.textContent=`kare ${String(r-this.f0).padStart(3,"0")}/${this.f1-this.f0} · ${a.toFixed(2)} sn`}update(t){this.playing&&(this.ph+=t*Ol*this.speed,this.ph>=this.f1&&(this.ph=this.f1,this.playing=!1,this.updateButtons()),this.updateTimeline()),this.timeUsed+=t;const e=this.inc.radio||[];for(;!this.opts.readOnly&&this.radioShown<e.length&&e[this.radioShown].t<=this.timeUsed&&(!this.decided||this.opts.training);){const i=e[this.radioShown++];i.pressure&&!this.timeLimit||(this.addMsg(i.who==="HAKEM"?"ref":"avar",i.who==="HAKEM"?`HAKEM (${this.s.refName})`:`AVAR (${this.s.avarName})`,i.text,i.pressure),this.app.audio.radio("in"),this.app.audio.speak(i.text))}if(this.timeLimit&&!this.decided){const i=this.timeLimit-this.timeUsed;this.timerEl.textContent=mu(Math.ceil(i)),this.timerEl.classList.toggle("warn",i<=this.timeLimit*.35&&i>10),this.timerEl.classList.toggle("crit",i<=10),this.el.classList.toggle("crit",i<=10),this.app.audio.setCrowd(.25+.75*Math.min(1,this.timeUsed/this.timeLimit));const r=Math.ceil(i);i<=10&&r!==this.lastTick&&(this.lastTick=r,this.app.audio.ui("tick")),i<=0&&(this.addMsg("ref",`HAKEM (${this.s.refName})`,"Süre doldu, saha kararıyla devam ediyorum!",!0),this.submit(!0))}const n=this.opts.guide;if(n&&this.guideIdx<n.length){n[this.guideIdx].check(this)&&(this.guideIdx++,this.app.audio.ui("good"),this._gk=null);const r=n[this.guideIdx];r&&this._gk!==this.guideIdx?(this._gk=this.guideIdx,this.guideEl.style.display="",this.guideEl.classList.remove("min"),this.guideEl.innerHTML=`<div class="gstep">ADIM ${this.guideIdx+1} / ${n.length}</div>${r.text}`):r||(this.guideEl.style.display="none")}}camInfo(t){const e=this.rec,n=this.inc,i=Math.max(this.f0,t-8),r=Math.min(this.f1,t+8),a=[0,0,0],o=[0,0,0];let l=0,c=0;const h={},u=[0,0,0,0],f=n.dir;let d=0;for(let m=i;m<=r;m+=2){if(e.ball(m,u),a[0]+=u[0],a[1]+=u[1],a[2]+=u[2],e.ent(m,n.focus,h),o[0]+=h.x,o[2]+=h.z,n.line==="offside"){let _=-1e9;for(let x=1;x<11;x++){const y=e.ent(m,n.defTeam*11+x,h);y.pose!==dt.HIDDEN&&(_=Math.max(_,y.x*f))}d+=_*f}l++}for(let m=0;m<3;m++)a[m]/=l,o[m]/=l;n.line==="offside"?c=d/l:n.line==="box"?c=f*mi:c=o[0],o[1]=.9;let p=null;const v=n.meta||{},g=[v.defender,v.offender,v.attacker,v.lineDefender].find(m=>m!=null&&m!==n.focus);if(g!=null){const m=e.ent(t,n.focus,{}),_=e.ent(t,g,{});m.pose!==dt.HIDDEN&&_.pose!==dt.HIDDEN&&Math.hypot(m.x-_.x,m.z-_.z)<12&&(p=[_.x-m.x,_.z-m.z])}return{ball:a,focus:o,dir:f,lineX:c,lineKind:n.line,ballRaw:e.ball(t),pair:p}}render(t){const e=this.playing?this.ph:this.playheadFrame(),n=this.rec;this.app.world.apply((r,a)=>n.sampleEnt(e,r,a),()=>n.sampleBall(e)),this.app.world.setCrowd(this.app.time,0);const i=this.camInfo(Math.round(e));for(let r=0;r<this.layout;r++){const o=this.vpEls[r].getBoundingClientRect(),l={x:o.left+2,y:o.top+2,w:o.width-4,h:o.height-4},c=this.views[r];wx(c.camObj,c.cam,i,l.w/l.h),Ax(c.camObj,c,l),t.renderView(c.camObj,l)}}destroy(){this.app.world.overlays.clear()}}const Go=s=>s==null?"—":`${s>0?"+":"−"}${Math.abs(s*100).toFixed(1)} cm`,Hd=s=>s>=7.2?"iyi":s>=5.5?"orta":"kotu";class j_{constructor(t,e,n){this.app=t,this.s=e,this.ctx=n,this.grade=e.grade(),this.el=this.build()}enter(){this.app.audio.setRoom(!1),this.app.audio.setCrowd(.15)}build(){const t=this.s,e=this.grade,n=h=>t.players(h),i=e.note>=7?"":e.note>=5.5?".mid":".bad",r=t.results.length?t.results.reduce((h,u)=>h+u.dec.timeUsed,0)/t.results.length:0,a=M("div.card",null,M("div.official",null,"MHK · VAR PERFORMANS RAPORU · RESMİ GÖZLEMCİ DEĞERLENDİRMESİ"),M("div.report-head",{style:{marginTop:"10px"}},M("div.grade"+i,null,M("b",null,e.note.toFixed(1)),M("span",null,"/ 10 · "+e.label)),M("div.col",{style:{gap:"4px"}},M("h2",{style:{margin:0}},`${t.teams[0].name} ${t.sim.score[0]} - ${t.sim.score[1]} ${t.teams[1].name}`),M("div.muted",null,`${t.cfg.competition} · ${t.cfg.stadium||""}`),M("div.muted",null,`Saha hakemi: ${t.refName} · AVAR: ${t.avarName}`),M("div.row.wrap",{style:{marginTop:"6px"}},M("span.chip.green",null,`Doğru: ${e.correct}/${e.n}`),e.missed?M("span.chip.red",null,`Kaçırılan açık hata: ${e.missed}`):null,e.wrong?M("span.chip.red",null,`Hatalı müdahale: ${e.wrong}`):null,M("span.chip",null,`Ort. karar süresi: ${r.toFixed(1)} sn`),M("span.chip",null,`Doğruluk %${Math.round(e.acc)}`)))),...this.ctx.extra||[]),o=t.results.map((h,u)=>this.incidentCard(h,u,n)),l=M("div.row.wrap",{style:{marginTop:"16px",justifyContent:"flex-end"}},M("button.btn",{onclick:()=>this.app.show(new J_(this.app,this.s,this))},"📺 TV Yorum Programı"),M("button.btn",{onclick:()=>this.app.show(new Gd(this.app,this.s,this))},"📱 Sosyal Medya"),M("button.btn.primary",{onclick:()=>this.ctx.next()},this.ctx.nextLabel||"Devam →")),c=M("div.report-doc.col",null,a,...o,l);return Ln(this.app,"Maç Sonu Raporu",c,{onBack:()=>this.ctx.next(),right:M("button.btn.small.primary",{onclick:()=>this.ctx.next()},this.ctx.nextLabel||"Devam →")})}incidentCard(t,e,n){const i=t.inc,r=t.ev,a=t.dec,o=i.truth,l=Od[r.verdict],c=a.action==="CHECK"?`Kontrol tamamlandı${a.timeout?" (süre doldu)":""}`:`${Ar(i,a.outcome,n)} (${a.action==="OFR"?"OFR — hakem monitörde":"doğrudan düzeltme"})`,h=o.gray?"Gri alan: müdahale yok (saha kararı makul)":r.clearError?`${Ar(i,o.outcome,n)} — müdahale gerekli`:"Müdahale yok — saha kararı doğru",u=[...a.camsUsed||[]].map(p=>fr[p].short).join(", "),f=M("div.kv",null,M("span",null,"Saha kararı"),M("span",null,pr(i,n)),M("span",null,"Senin kararın"),M("span",null,c),M("span",null,"Doğru karar"),M("span",null,h),M("span",null,"Süre"),M("span",null,`${a.timeUsed.toFixed(1)} sn${i.timeLimit?" / "+i.timeLimit+" sn":""}`),M("span",null,"Kullanılan kameralar"),M("span",null,u||"—"),M("span",null,"Puan"),M("span",null,`Doğruluk ${r.acc} · Süre ${r.time} · Hassasiyet ${r.prec}`));let d=null;if(i.type==="OFSAYT"){const p=a.marks||{};d=M("div.cmp",null,M("div",null,"Senin çizgin",M("b",null,Go(p.offsideMargin))),M("div",null,"Gerçek fark",M("b",{style:{color:o.facts.marginM>0?"var(--red)":"var(--green)"}},Go(o.facts.marginM))),M("div",null,"Ölçüm hatası",M("b",null,p.offsideMargin===null||p.offsideMargin===void 0?"—":`${Math.abs((p.offsideMargin-o.facts.marginM)*100).toFixed(1)} cm`)),M("div",null,"Pas karesi (sen / gerçek)",M("b",null,`${p.passFrame??"—"} / ${o.keyFrame}`)))}else if(o.facts&&(o.facts.contactFrame!==void 0||i.type==="TOP_DISARI")){const p=a.marks||{},v=i.type==="TOP_DISARI"?o.facts.frame:o.facts.contactFrame;d=M("div.cmp",null,M("div",null,i.type==="TOP_DISARI"?"En dış kare (sen / gerçek)":"Temas karesi (sen / gerçek)",M("b",null,`${p.contactFrame??"—"} / ${v>=0?v:"temas yok"}`)),i.type==="TOP_DISARI"?M("div",null,"Topun çizgiyi geçmesi",M("b",null,Go(o.facts.marginM))):null,i.type==="PENALTI"&&o.facts.contact?M("div",null,"Temas – çizgi mesafesi",M("b",null,`${o.facts.distLineM>=0?"içeride ":"dışarıda "}${Math.abs(o.facts.distLineM*100).toFixed(1)} cm`)):null)}return M("div.card.inc-card."+l.cls,null,M("div.row",null,M("h3",{style:{margin:0}},`${e+1}. ${Ue[i.type].icon} ${Ue[i.type].name} · ${xd(i.minute,i.half)}`),M("div.grow"),M("span.verdict."+l.cls,{style:{fontSize:"15px"}},l.text)),f,d,r.notes.length?M("div.muted",{style:{fontSize:"12.5px",margin:"4px 0 8px"}},r.notes.join(" · ")):null,M("div.rule",null,...Fd(i).map(p=>M("p",null,p))),M("div.row",{style:{marginTop:"8px"}},M("button.btn.small",{onclick:()=>this.analyze(i)},"🔍 Pozisyonu yeniden izle (analiz)")))}analyze(t){const e=this.app,n=this,i={vv:null,enter(){e.audio.setRoom(!0)},exit(){this.vv.destroy(),e.audio.setRoom(!1)},update(r){this.vv.update(r)},render(r){this.vv.render(r)},onKey(r){this.vv.onKey(r)}};i.vv=new Bd(e,this.s,t,{readOnly:!0,onExit:()=>e.show(n)}),i.el=i.vv.el,e.show(i)}}class J_{constructor(t,e,n){this.app=t,this.s=e,this.report=n;const i=n.grade,r=new Ve(fn("studio"+e.seed)),a=Hd(i.note),o=e.results.slice().sort((f,d)=>f.ev.acc-d.ev.acc),l=new Set,c=_u.map((f,d)=>{const p=r.pick(Yx[f.tone][a]),v=o[d%Math.max(1,o.length)];let g="";if(v){const m=$x[v.ev.verdict];g=" "+m[(d+r.int(0,9))%m.length].replace("{dk}",Math.floor(v.inc.minute)+1)}return l.has(g)&&(g=""),l.add(g),p+g}),h=M("div.studio-ticker",null,M("span",null,"📺 HAKEM MASASI"),M("span",{style:{fontWeight:500}},`${e.teams[0].name} ${e.sim.score[0]}-${e.sim.score[1]} ${e.teams[1].name} · VAR notu ${i.note.toFixed(1)}`)),u=M("div.studio-set",null,..._u.map((f,d)=>M("div.pundit",null,M("div.bubble",{style:{animationDelay:`${d*.9}s`,animationFillMode:"backwards"}},c[d]),M("div.avatar",{style:{background:f.color}},f.name.split(" ").map(p=>p[0]).join("")),M("div.desk",null,M("b",null,f.name),M("span",null,f.role)))));this.el=M("div.screen.studio",null,M("div.page-head",null,M("button.btn.small",{onclick:()=>t.show(n)},"← Rapor"),M("h1",null,"Hakem Masası — Maç Sonu Yorumları"),M("div.grow"),M("button.btn.small",{onclick:()=>t.show(new Gd(t,e,n))},"📱 Sosyal Medya"),M("button.btn.small.primary",{onclick:()=>n.ctx.next()},n.ctx.nextLabel||"Devam →")),u,h,M("div.muted",{style:{textAlign:"center",fontSize:"11px",padding:"6px"}},"Yorumcular kurgusal karakterlerdir."))}enter(){this.app.audio.setCrowd(.05)}}class Gd{constructor(t,e,n){this.app=t;const i=new Ve(fn("social"+e.seed)),r=Hd(n.grade.note),a=[];for(const c of e.results){const h=c.ev.acc>=100?1:2;for(let u=0;u<h;u++)a.push(i.pick(Zx[c.ev.verdict]).replace("{dk}",Math.floor(c.inc.minute)+1))}for(let c=0;c<3;c++)a.push(i.pick(jx[r]));for(const c of[0,1]){const h=e.fans[c],u=e.teams[c].short;a.push(h>=50?`${u} taraftarı olarak bu akşam hakemlere söyleyecek sözüm yok 💪`:`Bu akşam ${u} olarak haksızlığa uğradık bence. Kayıtlar izlensin! 😤`)}const o=[...new Set(a)];a.length=0,a.push(...o),i.shuffle(a);const l=M("div.feed",null,...a.map(c=>{const[h,u]=i.pick(qx),f=`hsl(${i.int(0,360)}, 60%, 60%)`;return M("div.card.tweet",null,M("div.av",{style:{background:f}},u[0]),M("div",null,M("div.who",null,M("b",null,u),M("span.muted",null,`${h} · ${i.int(1,59)} dk`)),M("div.txt",null,c),M("div.meta",null,M("span",null,`💬 ${i.int(2,300)}`),M("span",null,`🔁 ${i.int(5,900)}`),M("span",null,`❤ ${i.int(20,4e3)}`))))}));this.el=Ln(t,"Sosyal Medya — #VARodası",M("div",null,l,M("p.muted",{style:{textAlign:"center",fontSize:"12px"}},"Tüm hesaplar ve paylaşımlar kurgusaldır.")),{onBack:()=>t.show(n),right:M("button.btn.small.primary",{onclick:()=>n.ctx.next()},n.ctx.nextLabel||"Devam →")})}}function Q_(s,t,e,n){s.matches++,s.notesSum+=e.note,s.bestNote=Math.max(s.bestNote,e.note);for(const i of t.results){const r=i.inc.type;s.incidents++;const a=i.ev.acc>=100;a&&s.correct++,i.ev.verdict==="kacirilan"&&s.missed++,(i.ev.verdict==="yanlis_mudahale"||i.ev.verdict==="yanlis_duzeltme")&&s.wrong++,i.ev.verdict==="gereksiz_gri"&&s.unnecessary++,s.totalTime+=i.dec.timeUsed||0;const o=s.byType[r]=s.byType[r]||{n:0,ok:0};o.n++,a&&o.ok++,r==="OFSAYT"&&i.dec.marks&&i.dec.marks.offsideMargin!==void 0&&i.dec.marks.offsideMargin!==null&&(s.offsideErrSum+=Math.abs(i.dec.marks.offsideMargin-i.inc.truth.facts.marginM)*100,s.offsideN++,i.dec.marks.passFrame===i.inc.truth.keyFrame&&s.framesPerfect++)}s.history.unshift({d:Date.now(),mode:n,note:e.note,home:t.teams[0].short,away:t.teams[1].short,score:t.sim.score.slice()}),s.history=s.history.slice(0,30)}function t1(s,t,e){const i="train_"+t.type,r=s.byType[i]=s.byType[i]||{n:0,ok:0};r.n++,e.acc>=100&&r.ok++}function Tc(s,t,e){const n=s.save.data,i=t.grade();Q_(n.stats,t,i,e.mode);const r=[];let a=e.next;if(e.mode==="career"&&n.career){const o=n.career,l=e_(o,i,e.fixture);r.push(M("div.rule",{style:{marginTop:"12px"}},M("p",null,M("b",null,`Kariyer: ${o.name}`),` · İtibar ${o.rep} (${l.repDelta>=0?"+":""}${l.repDelta})`),...l.news.map(c=>M("p",null,"📰 "+c)),o.finished?null:M("p.muted",null,`Klasman: ${vi[o.tier].name}`)))}if(e.mode==="daily"){const o=t.cfg.dateKey,l=n.daily[o]=n.daily[o]||{best:0,plays:0};l.plays++;const c=Math.round(t.results.reduce((u,f)=>u+f.ev.total,0)),h=c>l.best;h&&(l.best=c),r.push(M("div.rule",{style:{marginTop:"12px"}},M("p",null,M("b",null,`Günlük skor: ${c} puan`),h?" — YENİ REKOR! 🎉":` (rekorun: ${l.best})`)))}s.persist(),s.show(new j_(s,t,{mode:e.mode,extra:r,next:a,nextLabel:e.nextLabel}))}class Rs{constructor(t){this.app=t;const e=t.save.data.career;this.el=e?this.hub(e):this.create()}create(){const t=this.app,e=M("input",{type:"text",maxlength:24,placeholder:"Adın (ör. Deniz Yıldırım)",value:""}),n=M("div.grid2",null,M("div.card",null,M("h3",null,"🏆 Yeni kariyer"),M("p",null,"Bölgesel Amatör Lig’de VAR odasına adım at. İyi notlar ve itibarla üst liglere yüksel: 3. Lig, 2. Lig, 1. Lig, Süper Lig, derbiler, Avrupa ve sonunda Turnuva Finali."),M("p.muted",null,"Kötü performansta MHK seni görevlendirmeyebilir ya da alt lige indirebilir."),e,M("button.btn.primary",{style:{marginTop:"12px",width:"100%",height:"52px"},onclick:()=>{t.save.data.career=Qx(e.value.trim()||"VAR Hakemi"),t.persist(),t.show(new Rs(t))}},"Kariyere başla")),M("div.card",null,M("h3",null,"Basamaklar"),this.ladder(null)));return Ln(t,"Kariyer",n)}ladder(t){return M("div.ladder",null,...vi.map((e,n)=>{const i=t?n<t.tier?".done":n===t.tier?".cur":".lock":"";return M("div.rung"+i,null,M("span",null,e.icon),M("b",null,e.name),M("div.grow"),M("span.muted",{style:{fontSize:"12px"}},e.key==="final"?"Tek maç":`${e.matches} maç · ort. ≥ ${e.minNote} · itibar ≥ ${e.minRep}`))}))}hub(t){const e=this.app,n=i_(t),i=t.finished?null:t_(t),r=t.finished?M("div.card",null,M("h3",null,t.trophy?"🏆 Kariyer tamamlandı — şampiyon VAR hakemi!":"Kariyer tamamlandı"),M("p",null,`${t.history.length} maç yönettin. İtibar: ${t.rep}.`),M("button.btn",{onclick:()=>Ed("Yeni kariyer",M("p",null,"Mevcut kariyer silinip yenisi başlatılsın mı?"),[{label:"Vazgeç"},{label:"Yeni kariyer",cls:"primary",on:()=>{e.save.data.career=null,e.persist(),e.show(new Rs(e))}}])},"Yeni kariyer başlat")):t.suspended?M("div.card",null,M("h3",null,`Hafta ${t.week} — Görevsiz`),M("p",null,"MHK bu hafta seni görevlendirmedi. Eğitim videolarını izleyip bir sonraki haftayı bekle."),M("button.btn.warn",{onclick:()=>{n_(t),e.persist(),e.show(new Rs(e))}},"Haftayı geçir →")):M("div.card",null,M("div.official",null,`HAFTA ${t.week} · MHK GÖREVLENDİRMESİ`),M("h3",{style:{marginTop:"8px"}},`${i.home.name} — ${i.away.name}`),M("p.muted",null,`${i.competition} · ${i.stadium}`),M("p",null,`Görev: VAR · ${i.numIncidents} kritik pozisyon bekleniyor${i.derby?" · 🔥 DERBİ: daha az süre, daha gri pozisyonlar":""}`),M("button.btn.primary",{style:{width:"100%",height:"54px",fontSize:"17px"},onclick:()=>this.play(t,i)},"▶ Göreve git")),a=M("div.grid2",null,M("div.col",null,M("div.card",null,M("div.row",null,M("h3",{style:{margin:0}},`👤 ${t.name}`),M("div.grow"),M("span.chip.green",null,`İtibar ${t.rep}/100`)),M("div.bar",{style:{margin:"8px 0"}},M("i",{style:{width:t.rep+"%"}})),M("p.muted",{style:{fontSize:"13px"}},t.finished?"Kariyer tamamlandı.":`${n.tier.name}: ${n.played} maç · son ${n.matches} maç ortalaması ${n.avg?n.avg.toFixed(2):"—"} (yükselme için ≥ ${n.need}, itibar ≥ ${n.needRep})`)),r,M("div.card",null,M("h3",null,"📰 Haberler"),M("div.news",null,...t.news.slice(0,8).map(o=>M("div",null,`Hafta ${o.week}: ${o.text}`))))),M("div.col",null,M("div.card",null,M("h3",null,"Kariyer basamakları"),this.ladder(t)),M("div.card",null,M("h3",null,"Son maçlar"),t.history.length?M("div.news",null,...t.history.slice(-8).reverse().map(o=>M("div",null,`H${o.week} · ${o.home} – ${o.away} · not ${o.note.toFixed(1)}`))):M("p.muted",null,"Henüz maç yok."))));return Ln(e,"Kariyer",a)}play(t,e){const n=this.app,i=vi[t.tier];let r=Wa[i.diff];e.derby&&(r=Ad(r)),r={...r,time:Math.max(45,r.time-Math.max(0,t.tier-3)*5)};const a={mode:"career",home:e.home,away:e.away,diff:r,numIncidents:e.numIncidents,types:bi,seed:e.seed,matchSeconds:(n.settings.matchMinutes||7)*60,competition:e.competition,stadium:e.stadium,derby:e.derby};Ec(n,a,{mode:"career",onFinish:o=>Tc(n,o,{mode:"career",fixture:e,next:()=>n.show(new Rs(n)),nextLabel:"Kariyer merkezi"})})}}class e1{constructor(t){this.app=t;const e=this.o={diff:"orta",n:5,league:"super",derby:!1,types:new Set(bi)},n=M("div.opt-group"),i=()=>{n.innerHTML="";for(const a of bi)n.appendChild(M("button.btn.small"+(e.types.has(a)?".on":""),{onclick:()=>{e.types.has(a)&&e.types.size>1?e.types.delete(a):e.types.add(a),i()}},`${Ue[a].icon} ${Ue[a].name}`))};i();const r=M("div.grid2",null,M("div.card",null,M("h3",null,"Zorluk"),_n([{value:"kolay",label:"Kolay (120 sn)"},{value:"orta",label:"Orta (90 sn)"},{value:"zor",label:"Zor (60 sn)"}],e.diff,a=>e.diff=a),M("p.muted",{style:{fontSize:"13px"}},"Zorluk; ofsayt farklarını (40 cm → 2 cm), gri alan sıklığını, hakemin hata oranını, AVAR’ın güvenilirliğini ve kontrol süresini belirler."),M("h3",null,"Pozisyon sayısı"),_n([4,5,6,7,8].map(a=>({value:a,label:String(a)})),e.n,a=>e.n=a),M("h3",null,"Lig"),_n([{value:"lig2",label:"2. Lig"},{value:"lig1",label:"1. Lig"},{value:"super",label:"Süper Lig"},{value:"derbi",label:"🔥 Derbi"}],"super",a=>{e.derby=a==="derbi",e.league=a==="derbi"?"super":a})),M("div.card",null,M("h3",null,"Pozisyon türleri"),n,M("p.muted",{style:{fontSize:"13px"}},`Maç süresi ayarlardan değiştirilebilir (şu an ${t.settings.matchMinutes} dakika).`),M("button.btn.primary",{style:{width:"100%",marginTop:"10px",height:"56px",fontSize:"18px"},onclick:()=>this.start()},"▶ Maça başla")));this.el=Ln(t,"Hızlı Maç",r)}start(){const t=this.app,e=this.o,n=Y_(t,{diff:e.diff,n:e.n,league:e.league,derby:e.derby,types:[...e.types]}),i=()=>_c(()=>Promise.resolve().then(()=>Yd),void 0,import.meta.url).then(r=>t.show(new r.MenuScreen(t)));Ec(t,n,{mode:"quick",onFinish:r=>Tc(t,r,{mode:"quick",next:i,nextLabel:"Ana menü"})})}}class Vd{constructor(t){this.app=t,this.diff="orta";const e=t.save.data.stats.byType,n=bi.map(r=>{const a=e["train_"+r];return M("div.card",null,M("h3",null,`${Ue[r].icon} ${Ue[r].name}`),M("p.muted",{style:{fontSize:"13px",minHeight:"54px"}},zd[r]),M("div.row",null,M("span.chip",null,a?`${a.ok}/${a.n} doğru`:"Henüz denenmedi"),M("div.grow"),M("button.btn.primary",{onclick:()=>Ka(t,r,this.diff)},"Çalış ▶")))}),i=M("div",null,M("div.row.wrap",{style:{marginBottom:"10px"}},M("b",null,"Zorluk:"),_n([{value:"kolay",label:"Kolay"},{value:"orta",label:"Orta"},{value:"zor",label:"Zor"}],this.diff,r=>this.diff=r)),M("p.muted",null,"Süre sınırı yok. Kararını verdiğin anda doğru cevap, ölçümler ve kural açıklaması gösterilir. “Yeni pozisyon” ile aynı türden sınırsız tekrar yapabilirsin."),M("div.grid3",null,...n));this.el=Ln(t,"Pozisyon Antrenmanı",i)}}function Ka(s,t,e,n={}){const i=$_(t,e,n.seed),r=new Ud(i);s.world.setTeams({kits:r.kits,squads:r.squads,teams:r.teams});const a=r.prepareSingle(t),o=n.onExit||(()=>s.show(new Vd(s))),l={enter(){s.audio.setRoom(!0),s.audio.setCrowd(.2)},exit(){l.vv.destroy(),s.audio.setRoom(!1)},update(c){l.vv.update(c)},render(c){l.vv.render(c)},onKey(c){l.vv.onKey(c)}};return l.vv=new Bd(s,r,a,{training:!0,guide:n.guide,onNext:n.onNext||(()=>Ka(s,t,e)),nextLabel:n.nextLabel,onExit:o,onTrainingResult:c=>{t1(s.save.data.stats,a,c.ev),s.persist(),n.onResult&&n.onResult(c)}}),l.el=l.vv.el,s.show(l),l}class wc{constructor(t){this.app=t;const e=_d(),n=Tu(t,e),i=t.save.data.daily[e],r=Object.entries(t.save.data.daily).sort((o,l)=>o[0]<l[0]?1:-1).slice(0,10),a=M("div.grid2",null,M("div.card",null,M("h3",null,`📅 ${e}`),M("p",null,`${n.home.name} — ${n.away.name}`),M("p.muted",null,"Bugünün maçı herkes için aynı: aynı takımlar, aynı 5 kritik pozisyon, aynı hakem hataları. Kendi rekorunu geçmeye çalış!"),M("div.row",null,M("span.chip.green",null,i?`Rekorun: ${i.best} puan`:"Bugün henüz oynamadın"),i?M("span.chip",null,`${i.plays} deneme`):null),M("button.btn.primary",{style:{width:"100%",marginTop:"14px",height:"56px",fontSize:"18px"},onclick:()=>this.start(e)},"▶ Günün maçını oyna")),M("div.card",null,M("h3",null,"Geçmiş günler"),r.length?M("div.news",null,...r.map(([o,l])=>M("div",null,`${o} — en iyi: ${l.best} puan (${l.plays} deneme)`))):M("p.muted",null,"Henüz kayıt yok."),M("p.muted",{style:{fontSize:"12px"}},"Puan: her pozisyon için doğruluk + süre + hassasiyet (en fazla 140).")));this.el=Ln(t,"Günlük Zorluk",a)}start(t){const e=this.app,n=Tu(e,t);Ec(e,n,{mode:"daily",onFinish:i=>Tc(e,i,{mode:"daily",next:()=>e.show(new wc(e)),nextLabel:"Günlük ekrana dön"})})}}class n1{constructor(t){const e=t.save.data.stats,n=(o,l)=>l?Math.round(o/l*100):0,i=(o,l)=>M("div.card.stat",null,M("b",null,String(o)),M("span",null,l)),r=bi.map(o=>{const l=e.byType[o]||{n:0,ok:0},c=e.byType["train_"+o]||{n:0,ok:0},h=n(l.ok,l.n);return M("div",{style:{margin:"8px 0"}},M("div.row",null,M("span",null,`${Ue[o].icon} ${Ue[o].name}`),M("div.grow"),M("span.muted",{style:{fontSize:"12px"}},`Maç: ${l.ok}/${l.n} · Antrenman: ${c.ok}/${c.n}`)),M("div.bar",null,M("i",{style:{width:h+"%",background:h>=70?"var(--green)":h>=45?"var(--yellow)":"var(--red)"}})))}),a=M("div.col",null,M("div.grid3",null,i(e.matches,"Yönetilen maç"),i(e.matches?(e.notesSum/e.matches).toFixed(2):"—","Ortalama hakem notu"),i(e.bestNote?e.bestNote.toFixed(1):"—","En yüksek not"),i(`%${n(e.correct,e.incidents)}`,`Doğru karar (${e.correct}/${e.incidents})`),i(e.missed,"Kaçırılan açık hata"),i(e.wrong,"Hatalı müdahale"),i(e.unnecessary,"Gereksiz müdahale (gri)"),i(e.incidents?(e.totalTime/e.incidents).toFixed(1)+" sn":"—","Ortalama karar süresi"),i(e.offsideN?(e.offsideErrSum/e.offsideN).toFixed(1)+" cm":"—","Ort. ofsayt çizgi hatası"),i(e.offsideN?`${e.framesPerfect}/${e.offsideN}`:"—","Tam isabet pas karesi")),M("div.card",null,M("h3",null,"Pozisyon türüne göre doğruluk"),...r),M("div.card",null,M("h3",null,"Son maçlar"),e.history.length?M("div.news",null,...e.history.map(o=>M("div",null,`${new Date(o.d).toLocaleDateString("tr-TR")} · ${o.home} ${o.score[0]}-${o.score[1]} ${o.away} · not ${o.note.toFixed(1)} · ${{quick:"Hızlı maç",career:"Kariyer",daily:"Günlük",tutorial:"Eğitim"}[o.mode]||o.mode}`))):M("p.muted",null,"Henüz maç yok.")));this.el=Ln(t,"İstatistikler",a)}}class i1{constructor(t){this.app=t;const e=t.settings,n=()=>t.persist(),i=(o,l)=>{const c=M("span.mono",{style:{width:"44px",textAlign:"right"}},Math.round(e[l]*100)+"%"),h=M("input",{type:"range",min:0,max:100,value:Math.round(e[l]*100)});return h.addEventListener("input",()=>{e[l]=h.value/100,c.textContent=h.value+"%",t.audio.applyVolumes()}),h.addEventListener("change",()=>{n(),t.audio.ui("click")}),M("label.set",null,M("span",null,o),h,c)},r=t.detectTouch()?"dokunmatik":"fare + klavye",a=M("div.grid2",null,M("div.card",null,M("h3",null,"🎮 Kontrol"),M("p.muted",{style:{fontSize:"13px"}},`Otomatik algılanan cihaz: ${r}`),_n([{value:"auto",label:"Otomatik"},{value:"pc",label:"PC (fare + klavye)"},{value:"touch",label:"Telefon / tablet"}],e.controls,o=>{e.controls=o,t.applyDevice(),n()}),M("h3",null,"🖥️ Grafik"),_n([{value:"auto",label:"Otomatik"},{value:"yuksek",label:"Yüksek"},{value:"orta",label:"Orta"},{value:"dusuk",label:"Düşük (telefon)"}],e.quality,o=>{e.quality=o,n(),t.rebuildGraphics(),di("Grafik: "+t.gfx.quality)}),M("p.muted",{style:{fontSize:"13px"}},"Düşük mod: gölge yok, daha az seyirci, düşük çözünürlük — telefonda 60 FPS için."),M("label.set",null,M("span",null,"FPS göstergesi"),_n([{value:!1,label:"Kapalı"},{value:!0,label:"Açık"}],e.showFps,o=>{e.showFps=o,n(),t.updateFpsEl()})),M("h3",null,"🎮 Kontrolcü"),M("p.muted",{style:{fontSize:"13px"}},navigator.getGamepads&&[...navigator.getGamepads()].find(o=>o)?"Bağlı: "+[...navigator.getGamepads()].find(o=>o).id.slice(0,48):"Bağlı kontrolcü yok. Xbox / PlayStation / genel USB-Bluetooth kontrolcüyü bağlayıp bir tuşa bas."),(()=>{const o=M("span.mono",{style:{width:"44px",textAlign:"right"}},Math.round(e.gpSpeed*100)+"%"),l=M("input",{type:"range",min:40,max:200,value:Math.round(e.gpSpeed*100)});return l.addEventListener("input",()=>{e.gpSpeed=l.value/100,o.textContent=l.value+"%"}),l.addEventListener("change",n),M("label.set",null,M("span",null,"İmleç hızı"),l,o)})(),M("label.set",null,M("span",null,"Titreşim"),_n([{value:!0,label:"Açık"},{value:!1,label:"Kapalı"}],e.gpRumble!==!1,o=>{e.gpRumble=o,n(),o&&t.gamepad.rumble(150,.5)})),M("h3",null,"⏱️ Maç süresi"),_n([5,6,7,8].map(o=>({value:o,label:`${o} dk`})),e.matchMinutes,o=>{e.matchMinutes=o,n()}),M("p.muted",{style:{fontSize:"13px"}},"90 dakikalık maçın gerçek zamanda kaç dakika süreceği (VAR incelemeleri hariç).")),M("div.card",null,M("h3",null,"🔊 Ses"),i("Genel ses","volMaster"),i("Ambiyans (tribün, oda)","volAmbient"),i("Efektler (düdük, top)","volSfx"),i("Telsiz","volRadio"),M("label.set",null,M("span",null,"Ses"),_n([{value:!1,label:"Açık"},{value:!0,label:"Kapalı"}],e.muted,o=>{e.muted=o,t.audio.applyVolumes(),n()})),M("label.set",null,M("span",null,"Sesli telsiz (cihaz sesi)"),_n([{value:!1,label:"Kapalı"},{value:!0,label:"Açık"}],e.tts,o=>{e.tts=o,n()})),M("p.muted",{style:{fontSize:"12px"}},"Sesli telsiz yalnızca cihazında yerel (çevrimdışı) Türkçe ses varsa çalışır; internet kullanılmaz."),M("h3",{style:{marginTop:"16px"}},"💾 Kayıt"),M("p.muted",{style:{fontSize:"13px"}},"Tüm ilerleme yalnızca bu cihazda (tarayıcı belleğinde) tutulur. Hesap, sunucu ya da reklam yoktur."),M("button.btn.danger",{onclick:()=>Ed("Kaydı sil",M("p",null,"Kariyer, istatistikler ve ayarlar silinecek. Emin misin?"),[{label:"Vazgeç"},{label:"Sil",cls:"danger",on:()=>{t.save.reset(),location.reload()}}])},"Tüm kaydı sıfırla")));this.el=Ln(t,"Ayarlar",a)}}class Wd{constructor(t){this.app=t;const e=i=>M("li",{style:{margin:"6px 0",lineHeight:1.5}},i),n=M("div.grid2",null,M("div.card",null,M("h3",null,"🎓 İnteraktif eğitim maçı"),M("p",null,"Adım adım rehberle iki pozisyon: önce ofsayt aracını, sonra temas ve penaltı incelemesini öğren."),M("div.col",null,M("button.btn.primary",{style:{height:"52px"},onclick:()=>s1(t)},"1. Ders — Ofsayt aracı"),M("button.btn",{style:{height:"52px"},onclick:()=>Xd(t)},"2. Ders — Penaltı ve OFR")),M("h3",{style:{marginTop:"18px"}},"🧭 VAR protokolü"),M("ul",{style:{paddingLeft:"18px",fontSize:"14px"}},...q_.map(e))),M("div.card",null,M("h3",null,"🕹️ Kontroller"),M("div.kv",null,M("span",null,"Oynat / duraklat"),M("span",null,"Boşluk · ▶ düğmesi"),M("span",null,"Kare kare"),M("span",null,"← → (Shift ile 10 kare) · ‹ 1  1 › düğmeleri"),M("span",null,"Sarma"),M("span",null,"Zaman çizelgesini sürükle"),M("span",null,"Yavaş çekim"),M("span",null,"0.1x · 0.25x · 0.5x · 1x"),M("span",null,"Kamera"),M("span",null,"1–6 tuşları · kamera düğmeleri (seçili görüntüye)"),M("span",null,"Bölünmüş ekran"),M("span",null,"▣ ◫ ⊞ · Tab ile görüntü seç"),M("span",null,"Yakınlaştırma"),M("span",null,"Fare tekerleği · iki parmak · + / −"),M("span",null,"Kaydırma"),M("span",null,"Yakınken sürükle · çift tık: sıfırla"),M("span",null,"Pas karesi / kritik kare"),M("span",null,"P / K tuşları"),M("span",null,"APP’ye git"),M("span",null,"A tuşu · ⏮ APP"),M("span",null,"Canlı oyunu hızlandır"),M("span",null,"F · ⏩ düğmesi")),M("h3",{style:{marginTop:"14px"}},"🎮 Kontrolcü"),M("div.kv",null,M("span",null,"Sol çubuk / A"),M("span",null,"Ekran imleci / tıkla (oyuncu işaretleme dahil)"),M("span",null,"D-pad (menü)"),M("span",null,"Düğmeler arasında gezin · B: geri"),M("span",null,"LT / RT"),M("span",null,"1 kare geri / ileri (basılı tut: hızlı)"),M("span",null,"D-pad ← / →"),M("span",null,"10 kare geri / ileri"),M("span",null,"D-pad ↑ / ↓"),M("span",null,"Yakınlaştır / uzaklaştır · R3: sıfırla"),M("span",null,"LB / RB"),M("span",null,"Önceki / sonraki kamera"),M("span",null,"X / □"),M("span",null,"Pas karesi ya da kritik anı işaretle"),M("span",null,"Y / △"),M("span",null,"Görüntü düzeni 1 → 2 → 4 · Canlı maçta hız"),M("span",null,"Start / Select"),M("span",null,"Oynat-duraklat (VAR), duraklat (maç) / görüntü seç"),M("span",null,"Sağ çubuk"),M("span",null,"Yakın görüntüyü kaydır · sayfaları kaydır")),M("h3",{style:{marginTop:"14px"}},"📏 Ofsayt aracı"),M("ol",{style:{paddingLeft:"18px",fontSize:"14px"}},e("Pasın çıktığı kareyi bul: topa İLK temasın olduğu kare. Bir kare hata 20+ cm demektir."),e("“Pas karesi” düğmesine bas."),e("Hücumcunun kol hariç en ileri bölgesine tıkla (ayak, diz, gövde, kafa)."),e("Sondan ikinci savunmacının (genelde kaleciden sonraki en geri oyuncu) kalesine en yakın bölgesine tıkla."),e("Kırmızı çizgi maviyi geçiyorsa ofsayt. Fark ekranda cm olarak yazar.")),M("h3",{style:{marginTop:"14px"}},"🏅 Puanlama"),M("p",{style:{fontSize:"14px",lineHeight:1.5}},"Her pozisyonun simülasyon tarafından ölçülmüş kesin bir doğru cevabı vardır. Doğruluk en önemli kısımdır; hızlı karar, doğru kareyi bulmak, doğru kamera ve doğru prosedür (olgusal → doğrudan, yorum → OFR) bonus getirir. Gereksiz müdahale ve kaçırılan açık hata notunu düşürür. Gri alanda saha kararına dokunmamak doğrudur.")));this.el=Ln(t,"Nasıl Oynanır",n)}}const Vl=s=>()=>s.show(new Wd(s));function s1(s){Ka(s,"OFSAYT","kolay",{guide:[{text:'Bu bir <b class="k">ofsayt şüpheli gol</b>. Önce pozisyonu sonuna kadar izle. (Video kendiliğinden oynuyor.)',check:e=>e.ph>=e.f1-5||e.timeUsed>14},{text:'Sağ paneldeki <b class="k">📐 Ofsayt aracı</b> düğmesine bas.',check:e=>e.tool==="offside"},{text:'Zaman çizelgesini sürükle ve <b class="k">‹ 1 / 1 ›</b> (ya da ← →) ile kare kare ilerleyerek pasörün topa <b class="k">ilk dokunduğu</b> kareyi bul. Sonra <b class="k">⏺ Pas karesi</b>’ne bas.',check:e=>e.off.passFrame!==null},{text:'Kamerayı <b class="k">5 — ÇİZGİ</b> yap: savunma çizgisine dik bakan ofsayt kamerası. Tekerlek ya da iki parmakla yakınlaştırabilirsin.',check:e=>e.views[e.active].cam===4},{text:'Golü atan <b class="k">hücumcunun</b> kol HARİÇ en ileri bölgesine tıkla (ayak, diz, gövde ya da kafa).',check:e=>!!e.off.att},{text:'Şimdi <b class="k">sondan ikinci savunmacının</b> (kaleciden sonra kalesine en yakın oyuncu) kalesine en yakın bölgesine tıkla.',check:e=>!!e.off.def},{text:'Kırmızı çizgi maviyi geçiyorsa <b class="k">OFSAYT</b>. Saha kararı yanlışsa doğrudan düzelt, doğruysa “Kontrol tamamlandı” de; sonra <b class="k">✔ KARARI GÖNDER</b>.',check:e=>e.decided}],onExit:Vl(s),onNext:()=>Xd(s),nextLabel:"2. Ders: Penaltı →"})}function Xd(s){Ka(s,"PENALTI","kolay",{guide:[{text:'Şimdi bir <b class="k">penaltı şüphesi</b>. İzle: hücumcu düştü ve hakem bir karar verdi (üstte “Saha kararı”).',check:e=>e.ph>=e.f0+e.inc.truth.keyFrame+25||e.timeUsed>12},{text:'Alttaki <b class="k">⊞</b> düğmesiyle 4’lü bölünmüş ekrana geç ve açıları karşılaştır.',check:e=>e.layout===4},{text:'Bir görüntüye dokunup seç ve <b class="k">6 — YAKIN</b> kamerayı ata.',check:e=>e.views.slice(0,e.layout).some(n=>n.cam===5)},{text:'Temas anına git (yavaş çekim 0.25x yardımcı olur) ve <b class="k">📍 Bu kare: kritik an</b> düğmesine bas.',check:e=>e.marks.contactFrame!==null},{text:'<b class="k">🟨 Ceza sahası çizgisi göstergesini</b> aç: temas çizginin içinde mi dışında mı? (Çizgi ceza sahasına dahildir.)',check:e=>e.boxOn},{text:'Karar ver. Saha kararı makulse <b class="k">Kontrol tamamlandı</b>. Açık hata varsa: yorum gerektiriyorsa <b class="k">OFR</b>, faulün yeri gibi olgusal bir hataysa <b class="k">doğrudan düzeltme</b>.',check:e=>e.decided}],onExit:Vl(s),onResult:()=>{s.save.data.tutorialDone=!0,s.persist()},onNext:Vl(s),nextLabel:"Eğitimi bitir ✓"})}class Kd{constructor(t){this.app=t;const e=r=>()=>{t.audio.ui("click"),t.show(new r(t))},n=(r,a,o,l,c="")=>M("button.btn.menu-btn"+c,{onclick:e(l)},M("span.ic",null,r),a,M("span.desc",null,o)),i=!t.save.data.tutorialDone;this.el=M("div.screen.menu",null,M("div.menu-left",null,M("div.logo",null,M("div.logo-mon",null,"VAR"),M("div",null,M("div.logo-title",{html:"VAR <span>ODASI</span>"}),M("div.logo-sub",null,"Video Yardımcı Hakem Simülasyonu"))),n("🏆","Kariyer","Amatörden finale",Rs),n("⚡","Hızlı Maç","Zorluğu seç, oyna",e1),n("🎯","Pozisyon Antrenmanı","Süresiz, sınırsız",Vd),n("📅","Günlük Zorluk","Herkese aynı 5 pozisyon",wc),n("📊","İstatistikler","Karnen",n1),n("⚙️","Ayarlar","Kontrol, grafik, ses",i1),n("📘","Nasıl Oynanır",i?"Buradan başla!":"Protokol ve eğitim maçı",Wd,i?".primary":""),M("div.badges",null,M("span.chip.green",null,"✓ Reklamsız"),M("span.chip.green",null,"✓ Satın alma yok"),M("span.chip.green",null,"✓ İnternetsiz çalışır"),M("span.chip.green",null,"🎮 Kontrolcü desteği"))),M("div.menu-right",null,M("div.panel.menu-card",null,M("b",null,"Görev: VAR odasındaki video hakemsin."),M("br"),"Saha hakeminin kararını izle, kamera açılarını incele, çizgini çek. ","Yalnızca “açık ve net hata” varsa müdahale et. Her pozisyonun ölçülmüş tek bir doğru cevabı var — şans yok, sadece göz ve kural bilgisi.")))}enter(){this.app.audio.setRoom(!1),this.app.audio.setCrowd(.12)}}const Yd=Object.freeze(Object.defineProperty({__proto__:null,MenuScreen:Kd},Symbol.toStringTag,{value:"Module"})),Ua=new Gx;window.__varApp=Ua;Ua.show(new Kd(Ua));Ua.start();"serviceWorker"in navigator&&location.protocol.startsWith("http")&&window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));export{a1 as B,te as D,h1 as L,o1 as R,Ue as T,Bd as V,_c as _,Ed as a,pr as b,ma as c,l1 as d,c1 as e,xd as f,Yd as g,M as h,xc as m,Ar as o,wx as p,di as t,r1 as u};
