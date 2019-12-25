!function(){"use strict";var t,i,e,s,h,n,a,o,r,f,B=Math.abs,m=Math.sin,p=Math.cos,R=Math.max,N=Math.min,d=Math.ceil,w=Math.sqrt,x=Math.pow,l={},u={},g={0:"0,",1:"17,",2:"34,",3:"51,",4:"68,",5:"85,",6:"102,",7:"119,",8:"136,",9:"153,",a:"170,",A:"170,",b:"187,",B:"187,",c:"204,",C:"204,",d:"221,",D:"221,",e:"238,",E:"238,",f:"255,",F:"255,"},v=document,T={};for(t=0;t<256;++t)i=t.toString(16),t<16&&(i="0"+i),u[i]=u[i.toUpperCase()]=t.toString()+",";function y(t){return void 0!==t}function c(t){return"object"==typeof t&&null!=t}function S(t,i,e){return isNaN(t)?e:N(e,R(i,t))}function b(){return!1}function C(){return(new Date).valueOf()}function z(t){for(var i,e,s=t.length-1;s;)e=~~(Math.random()*s),i=t[s],t[s]=t[e],t[e]=i,--s}function D(t,i,e){this.x=t,this.y=i,this.z=e}function A(t){this[1]={1:t[0],2:t[1],3:t[2]},this[2]={1:t[3],2:t[4],3:t[5]},this[3]={1:t[6],2:t[7],3:t[8]}}function I(t,i,e,s,h){var n,a,o,r,l,u=[],g=2/t;for(l=Math.PI*(3-w(5)+(parseFloat(h)?parseFloat(h):0)),n=0;n<t;++n)o=w(1-(a=n*g-1+g/2)*a),r=n*l,u.push([p(r)*o*i,a*e,m(r)*o*s]);return u}function M(t,i,e,s,h,n){var a,o,r,l,u,g,c=[],d=2/t;for(o=Math.PI*(3-w(5)+(parseFloat(n)?parseFloat(n):0)),r=0;r<t;++r)l=r*d-1+d/2,u=p(a=r*o),g=m(a),c.push(i?[l*e,u*s,g*h]:[u*e,l*s,g*h]);return c}function F(t,i,e,s,h,n){var a,o,r,l,u=[],g=2*Math.PI/i;for(o=0;o<i;++o)r=p(a=o*g),l=m(a),u.push(t?[n*e,r*s,l*h]:[r*e,n*s,l*h]);return u}function O(t,i,e,s,h){return M(t,0,i,e,s,h)}function k(t,i,e,s,h){return M(t,1,i,e,s,h)}function P(t,i,e,s,h){return F(0,t,i,e,s,h=isNaN(h)?0:1*h)}function E(t,i,e,s,h){return F(1,t,i,e,s,h=isNaN(h)?0:1*h)}function _(t,i){if(window.G_vmlCanvasManager)return null;var e=v.createElement("canvas");return e.width=t,e.height=i,e}function L(t,i,e,s){var h,n=t.createLinearGradient(0,0,i,0);for(h in s)n.addColorStop(1-h,s[h]);t.fillStyle=n,t.fillRect(0,e,i,1)}function H(t,i,e){var s,h,n,a,o=1,r=t.weightGradient;if(t.gCanvas)h=t.gCanvas.getContext("2d"),o=t.gCanvas.height;else{if(c(r[0])?o=r.length:r=[r],t.gCanvas=s=_(1024,o),!s)return null;for(h=s.getContext("2d"),n=0;n<o;++n)L(h,1024,n,r[n])}return e=R(N(e||0,o-1),0),"rgba("+(a=h.getImageData(~~(1023*i),e,1,1).data)[0]+","+a[1]+","+a[2]+","+a[3]/255+")"}function W(t,i,e,s,h,n,a,o,r,l,u,g){var c,d,f=h+(o||0)+(r.length&&r[0]<0?B(r[0]):0),m=n+(o||0)+(r.length&&r[1]<0?B(r[1]):0);for(t.font=i,t.textBaseline="top",t.fillStyle=e,a&&(t.shadowColor=a),o&&(t.shadowBlur=o),r.length&&(t.shadowOffsetX=r[0],t.shadowOffsetY=r[1]),c=0;c<s.length;++c)d=0,u&&("right"==g?d=l-u[c]:"centre"==g&&(d=(l-u[c])/2)),t.fillText(s[c],f+d,m),m+=parseInt(i)}function X(t,i,e,s,h,n,a){n?(t.beginPath(),t.moveTo(i,e+h-n),t.arcTo(i,e,i+n,e,n),t.arcTo(i+s,e,i+s,e+n,n),t.arcTo(i+s,e+h,i+s-n,e+h,n),t.arcTo(i,e+h,i,e+h-n,n),t.closePath(),t[a?"stroke":"fill"]()):t[a?"strokeRect":"fillRect"](i,e,s,h)}function Y(t,i,e,s,h,n,a,o,r){this.strings=t,this.font=i,this.width=e,this.height=s,this.maxWidth=h,this.stringWidths=n,this.align=a,this.valign=o,this.scale=r}function U(t,i,e){var s=_(i,e);return s?(s.getContext("2d").drawImage(t,(i-t.width)/2,(e-t.height)/2),s):null}function V(t,i,e){var s=_(i,e);return s?(s.getContext("2d").drawImage(t,0,0,i,e),s):null}function q(t,i,e,s,h,n,a,o,r,l){var u,g,c,d,f,m,p,w,x=i+(2*o+n)*s,v=e+(2*o+n)*s,T=_(x,v);return T?(r*=s,d=x-(n*=s),f=v-n,o=o*s+(g=c=n/2),u=T.getContext("2d"),w=N(r,d/2,f/2),h&&(u.fillStyle=h,X(u,g,c,d,f,w)),n&&(u.strokeStyle=a,u.lineWidth=n,X(u,g,c,d,f,w,!0)),l?((p=(m=_(x,v)).getContext("2d")).drawImage(t,o,o,i,e),p.globalCompositeOperation="source-in",p.fillStyle=a,p.fillRect(0,0,x,v),p.globalCompositeOperation="destination-over",p.drawImage(T,0,0),p.globalCompositeOperation="source-over",u.drawImage(m,0,0)):u.drawImage(t,o,o,t.width,t.height),{image:T,width:x/s,height:v/s}):null}function G(t,i,e){var s,h,n,a,o,r,l,u,g=parseInt(t.toString().length*e),c=parseInt(2*e*t.length),d=_(g,c);if(!d)return null;for((s=d.getContext("2d")).fillStyle="#000",s.fillRect(0,0,g,c),W(s,e+"px "+i,"#fff",t,0,0,0,0,[],"centre"),u={min:{x:n=(h=s.getImageData(0,0,g,c)).width,y:a=h.height},max:{x:-1,y:-1}},r=0;r<a;++r)for(o=0;o<n;++o)l=4*(r*n+o),0<h.data[1+l]&&(o<u.min.x&&(u.min.x=o),o>u.max.x&&(u.max.x=o),r<u.min.y&&(u.min.y=r),r>u.max.y&&(u.max.y=r));return n!=g&&(u.min.x*=g/n,u.max.x*=g/n),a!=c&&(u.min.y*=g/a,u.max.y*=g/a),d=null,u}function Z(t){return"'"+t.replace(/(\'|\")/g,"").replace(/\s*,\s*/g,"', '")+"'"}function j(t,i,e){(e=e||v).addEventListener?e.addEventListener(t,i,!1):e.attachEvent("on"+t,i)}function J(t,i,e,s){var h,n,a,o,r,l,u,g,c,d,f,m,p,w,x,v,T,y,S,b,C,z,D,A,I,M,F,O,k,P,E=s.imageScale;return i.complete?t.complete?(i.width=i.width,i.height=i.height,E&&(t.width=i.width*E,t.height=i.height*E),e.iw=t.width,e.ih=t.height,s.txtOpt&&(n=t,h=s.zoomMax*s.txtScale,r=e.iw*h,l=e.ih*h,r<i.naturalWidth||l<i.naturalHeight?(n=V(t,r,l))&&(e.fimage=n):(r=e.iw,l=e.ih,h=1),parseFloat(s.imageRadius)&&(e.image=e.fimage=(z=e.image,D=s.imageRadius,A=r,I=l,M=h,k=parseFloat(D),P=R(A,I),t=(F=_(A,I))?(0<D.indexOf("%")?k=P*k/100:k*=M,(O=F.getContext("2d")).globalCompositeOperation="source-over",O.fillStyle="#fff",P/2<=k?(k=N(A,I)/2,O.beginPath(),O.moveTo(A/2,I/2),O.arc(A/2,I/2,k,0,2*Math.PI,!1),O.fill(),O.closePath()):(X(O,0,0,A,I,k=N(A/2,I/2,k),!0),O.fill()),O.globalCompositeOperation="source-in",O.drawImage(z,0,0,A,I),F):null)),e.HasText()||(s.shadow&&(u=e.image,g=r,c=l,d=h,f=s.shadow,m=s.shadowBlur,p=s.shadowOffset,v=B(p[0]),T=B(p[1]),y=g+(m<v?v+m:2*m)*d,S=c+(m<T?T+m:2*m)*d,b=d*((m||0)+(p[0]<0?v:0)),C=d*((m||0)+(p[1]<0?T:0)),(n=(w=_(y,S))?(x=w.getContext("2d"),f&&(x.shadowColor=f),m&&(x.shadowBlur=m*d),p&&(x.shadowOffsetX=p[0]*d,x.shadowOffsetY=p[1]*d),x.drawImage(u,b,C,g,c),{image:w,width:y/d,height:S/d}):null)&&(e.fimage=n.image,e.w=n.width,e.h=n.height)),(s.bgColour||s.bgOutlineThickness)&&(a="tag"==s.bgColour?K(e.a,"background-color"):s.bgColour,o="tag"==s.bgOutline?K(e.a,"color"):s.bgOutline||s.textColour,r=e.fimage.width,l=e.fimage.height,"colour"==s.outlineMethod&&(n=q(e.fimage,r,l,h,a,s.bgOutlineThickness,e.outline.colour,s.padding,s.bgRadius,1))&&(e.oimage=n.image),(n=q(e.fimage,r,l,h,a,s.bgOutlineThickness,o,s.padding,s.bgRadius))&&(e.fimage=n.image,e.w=n.width,e.h=n.height)),"size"==s.outlineMethod&&(0<s.outlineIncrease?(e.iw+=2*s.outlineIncrease,e.ih+=2*s.outlineIncrease,r=h*e.iw,l=h*e.ih,n=V(e.fimage,r,l),e.oimage=n,e.fimage=U(e.fimage,e.oimage.width,e.oimage.height)):(r=h*(e.iw+2*s.outlineIncrease),l=h*(e.ih+2*s.outlineIncrease),n=V(e.fimage,r,l),e.oimage=U(n,e.fimage.width,e.fimage.height))))),void e.Init()):j("load",function(){J(t,i,e,s)},t):j("load",function(){J(t,i,e,s)},i)}function K(t,i){var e=v.defaultView,s=i.replace(/\-([a-z])/g,function(t){return t.charAt(1).toUpperCase()});return e&&e.getComputedStyle&&e.getComputedStyle(t,null).getPropertyValue(i)||t.currentStyle&&t.currentStyle[s]}function Q(t){return t.target&&y(t.target.id)?t.target.id:t.srcElement.parentNode.id}function $(t,i){var e,s,h=parseInt(K(i,"width"))/i.width,n=parseInt(K(i,"height"))/i.height;return y(t.offsetX)?e={x:t.offsetX,y:t.offsetY}:(s=gt(i.id),y(t.changedTouches)&&(t=t.changedTouches[0]),t.pageX&&(e={x:t.pageX-s.x,y:t.pageY-s.y})),e&&h&&n&&(e.x/=h,e.y/=n),e}function tt(t){var i=t.target||t.fromElement.parentNode,e=mt.tc[i.id];e&&(e.mx=e.my=-1,e.UnFreeze(),e.EndDrag())}function it(t){var i,e,s,h=mt,n=Q(t);for(i in h.tc)(e=h.tc[i]).tttimer&&(clearTimeout(e.tttimer),e.tttimer=null);n&&h.tc[n]&&((s=$(t,(e=h.tc[n]).canvas))&&(e.mx=s.x,e.my=s.y,e.Drag(t,s)),e.drawn=0)}function et(t){var i=mt,e=v.addEventListener?0:1,s=Q(t);s&&t.button==e&&i.tc[s]&&i.tc[s].BeginDrag(t)}function st(t){var i,e=mt,s=v.addEventListener?0:1,h=Q(t);h&&t.button==s&&e.tc[h]&&(i=e.tc[h],it(t),i.EndDrag()||i.touchState||i.Clicked(t))}function ht(t){var i,e=Q(t),s=e&&mt.tc[e];s&&t.changedTouches&&(1==t.touches.length&&0==s.touchState?(s.touchState=1,s.BeginDrag(t),(i=$(t,s.canvas))&&(s.mx=i.x,s.my=i.y,s.drawn=0)):2==t.targetTouches.length&&s.pinchZoom?(s.touchState=3,s.EndDrag(),s.BeginPinch(t)):(s.EndDrag(),s.EndPinch(),s.touchState=0))}function nt(t){var i=Q(t),e=i&&mt.tc[i];if(e&&t.changedTouches){switch(e.touchState){case 1:e.Draw(),e.Clicked();break;case 2:e.EndDrag();break;case 3:e.EndPinch()}e.touchState=0}}function at(t){var i,e,s,h=mt,n=Q(t);for(i in h.tc)(e=h.tc[i]).tttimer&&(clearTimeout(e.tttimer),e.tttimer=null);if((e=n&&h.tc[n])&&t.changedTouches&&e.touchState){switch(e.touchState){case 1:case 2:(s=$(t,e.canvas))&&(e.mx=s.x,e.my=s.y,e.Drag(t,s)&&(e.touchState=2));break;case 3:e.Pinch(t)}e.drawn=0}}function ot(t){var i=mt,e=Q(t);e&&i.tc[e]&&(t.cancelBubble=!0,t.returnValue=!1,t.preventDefault&&t.preventDefault(),i.tc[e].Wheel(0<(t.wheelDelta||t.detail)))}function rt(t){var i,e=mt;for(i in clearTimeout(e.scrollTimer),e.tc)e.tc[i].Pause();e.scrollTimer=setTimeout(function(){var t,i=mt;for(t in i.tc)i.tc[t].Resume()},e.scrollPause)}function lt(){ut(C())}function ut(t){var i,e=mt.tc;for(i in mt.NextFrame(mt.interval),t=t||C(),e)e[i].Draw(t)}function gt(t){var i=v.getElementById(t).getBoundingClientRect(),e=v.documentElement,s=v.body,h=window,n=h.pageXOffset||e.scrollLeft,a=h.pageYOffset||e.scrollTop,o=e.clientLeft||s.clientLeft,r=e.clientTop||s.clientTop;return{x:i.left+n-o,y:i.top+a-r}}function ct(t){this.e=t,this.br=0,this.line=[],this.text=[],this.original=t.innerText||t.textContent}function dt(t,i){this.ts=null,this.tc=t,this.tag=i,this.x=this.y=this.w=this.h=this.sc=1,this.z=0,this.pulse=1,this.pulsate=t.pulsateTo<1,this.colour=t.outlineColour,this.adash=~~t.outlineDash,this.agap=~~t.outlineDashSpace||this.adash,this.aspeed=1*t.outlineDashSpeed,"tag"==this.colour?this.colour=K(i.a,"color"):"tagbg"==this.colour&&(this.colour=K(i.a,"background-color")),this.Draw=this.pulsate?this.DrawPulsate:this.DrawSimple,this.radius=0|t.outlineRadius,this.SetMethod(t.outlineMethod)}function ft(t,i,e,s,h,n,a,o,r,l,u,g,c,d){this.tc=t,this.image=null,this.text=i,this.text_original=d,this.line_widths=[],this.title=e.title||null,this.a=e,this.position=new D(s[0],s[1],s[2]),this.x=this.y=this.z=0,this.w=h,this.h=n,this.colour=a||t.textColour,this.bgColour=o||t.bgColour,this.bgRadius=0|r,this.bgOutline=l||this.colour,this.bgOutlineThickness=0|u,this.textFont=g||t.textFont,this.padding=0|c,this.sc=this.alpha=1,this.weighted=!t.weight,this.outline=new dt(t,this)}function mt(t,i,e){var s,h,n,o,r,a,l,u,g=v.getElementById(t),c=["id","class","innerHTML"];if(!g)throw 0;if(y(window.G_vmlCanvasManager)&&(g=window.G_vmlCanvasManager.initElement(g),this.ie=parseFloat(navigator.appVersion.split("MSIE")[1])),g&&(!g.getContext||!g.getContext("2d").fillText)){for(h=v.createElement("DIV"),s=0;s<c.length;++s)h[c[s]]=g[c[s]];throw g.parentNode.insertBefore(h,g),g.parentNode.removeChild(g),0}for(s in mt.options)this[s]=e&&y(e[s])?e[s]:y(mt[s])?mt[s]:mt.options[s];if(this.canvas=g,this.ctxt=g.getContext("2d"),this.z1=250/R(this.depth,.001),this.z2=this.z1/this.zoom,this.radius=.0075*N(g.height,g.width),this.max_radius=100,this.max_weight=[],this.min_weight=[],this.textFont=this.textFont&&Z(this.textFont),this.textHeight*=1,this.imageRadius=this.imageRadius.toString(),this.pulsateTo=S(this.pulsateTo,0,1),this.minBrightness=S(this.minBrightness,0,1),this.maxBrightness=S(this.maxBrightness,this.minBrightness,1),this.ctxt.textBaseline="top",this.lx=(this.lock+"").indexOf("x")+1,this.ly=(this.lock+"").indexOf("y")+1,this.frozen=this.dx=this.dy=this.fixedAnim=this.touchState=0,this.fixedAlpha=1,this.source=i||t,this.repeatTags=N(64,~~this.repeatTags),this.minTags=N(200,~~this.minTags),0<~~this.scrollPause?mt.scrollPause=~~this.scrollPause:this.scrollPause=0,0<this.minTags&&this.repeatTags<1&&(s=this.GetTags().length)&&(this.repeatTags=d(this.minTags/s)-1),this.transform=A.Identity(),this.startTime=this.time=C(),this.mx=this.my=-1,this.centreImage&&(o=this,(r=new Image).onload=function(){var n=r.width/2,a=r.height/2;o.centreFunc=function(t,i,e,s,h){t.setTransform(1,0,0,1,0,0),t.globalAlpha=1,t.drawImage(r,s-n,h-a)}},r.src=o.centreImage),this.Animate=this.dragControl?this.AnimateDrag:this.AnimatePosition,this.animTiming="function"==typeof mt[this.animTiming]?mt[this.animTiming]:mt.Smooth,this.shadowBlur||this.shadowOffset[0]||this.shadowOffset[1]?(this.ctxt.shadowColor=this.shadow,this.shadow=this.ctxt.shadowColor,this.shadowAlpha=!!(l=_(3,3))&&((a=l.getContext("2d")).strokeStyle="#000",a.shadowColor="#fff",a.shadowBlur=3,a.globalAlpha=0,a.strokeRect(2,2,2,2),a.globalAlpha=1,l=null,0<a.getImageData(2,2,1,1).data[0])):delete this.shadow,this.Load(),i&&this.hideTags&&(u=this,mt.loaded?u.HideTags():j("load",function(){u.HideTags()},window)),this.yaw=this.initial?this.initial[0]*this.maxSpeed:0,this.pitch=this.initial?this.initial[1]*this.maxSpeed:0,this.tooltip?(this.ctitle=g.title,g.title="","native"==this.tooltip?this.Tooltip=this.TooltipNative:(this.Tooltip=this.TooltipDiv,this.ttdiv||(this.ttdiv=v.createElement("div"),this.ttdiv.className=this.tooltipClass,this.ttdiv.style.position="absolute",this.ttdiv.style.zIndex=g.style.zIndex+1,j("mouseover",function(t){t.target.style.display="none"},this.ttdiv),v.body.appendChild(this.ttdiv)))):this.Tooltip=this.TooltipNone,!this.noMouse&&!T[t])for(T[t]=[["mousemove",it],["mouseout",tt],["mouseup",st],["touchstart",ht],["touchend",nt],["touchcancel",nt],["touchmove",at]],this.dragControl&&(T[t].push(["mousedown",et]),T[t].push(["selectstart",b])),this.wheelZoom&&(T[t].push(["mousewheel",ot]),T[t].push(["DOMMouseScroll",ot])),this.scrollPause&&T[t].push(["scroll",rt,window]),s=0;s<T[t].length;++s)j((h=T[t][s])[0],h[1],h[2]?h[2]:g);mt.started||(n=window.requestAnimationFrame=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||window.msRequestAnimationFrame,mt.NextFrame=n?mt.NextFrameRAF:mt.NextFrameTimeout,mt.interval=this.interval,mt.NextFrame(this.interval),mt.started=1)}function pt(t){var i=t.targetTouches[0],e=t.targetTouches[1];return w(x(e.pageX-i.pageX,2)+x(e.pageY-i.pageY,2))}function wt(t,i){mt.tc[i]&&mt.tc[i][t]()}for(t in(a=D.prototype).length=function(){return w(this.x*this.x+this.y*this.y+this.z*this.z)},a.dot=function(t){return this.x*t.x+this.y*t.y+this.z*t.z},a.cross=function(t){return new D(this.y*t.z-this.z*t.y,this.z*t.x-this.x*t.z,this.x*t.y-this.y*t.x)},a.angle=function(t){var i,e=this.dot(t);return 0==e?Math.PI/2:1<=(i=e/(this.length()*t.length()))?0:i<=-1?Math.PI:Math.acos(i)},a.unit=function(){var t=this.length();return new D(this.x/t,this.y/t,this.z/t)},n=A.prototype,A.Identity=function(){return new A([1,0,0,0,1,0,0,0,1])},A.Rotation=function(t,i){var e=m(t),s=p(t),h=1-s;return new A([s+x(i.x,2)*h,i.x*i.y*h-i.z*e,i.x*i.z*h+i.y*e,i.y*i.x*h+i.z*e,s+x(i.y,2)*h,i.y*i.z*h-i.x*e,i.z*i.x*h-i.y*e,i.z*i.y*h+i.x*e,s+x(i.z,2)*h])},n.mul=function(t){var i,e,s=[],h=t.xform?1:0;for(i=1;i<=3;++i)for(e=1;e<=3;++e)h?s.push(this[i][1]*t[1][e]+this[i][2]*t[2][e]+this[i][3]*t[3][e]):s.push(this[i][e]*t);return new A(s)},n.xform=function(t){var i={},e=t.x,s=t.y,h=t.z;return i.x=e*this[1][1]+s*this[2][1]+h*this[3][1],i.y=e*this[1][2]+s*this[2][2]+h*this[3][2],i.z=e*this[1][3]+s*this[2][3]+h*this[3][3],i},(r=Y.prototype).SetImage=function(t,i,e,s,h,n,a,o){this.image=t,this.iwidth=i*this.scale,this.iheight=e*this.scale,this.ipos=s,this.ipad=h*this.scale,this.iscale=o,this.ialign=n,this.ivalign=a},r.Align=function(t,i,e){var s=0;return"right"==e||"bottom"==e?s=i-t:"left"!=e&&"top"!=e&&(s=(i-t)/2),s},r.Create=function(t,i,e,s,h,n,a,o,r){var l,u,g,c,d,f,m,p,w,x,v,T,y,S,b,C,z,D=B(a[0]),A=B(a[1]);return m=d=2*((o=R(o,D+n,A+n))+s),u=this.width+d,g=this.height+m,w=x=o+s,this.image&&(v=T=o+s,y=this.iwidth,S=this.iheight,"top"==this.ipos||"bottom"==this.ipos?(y<this.width?v+=this.Align(y,this.width,this.ialign):w+=this.Align(this.width,y,this.align),"top"==this.ipos?x+=S+this.ipad:T+=this.height+this.ipad,u=R(u,y+d),g+=S+this.ipad):(S<this.height?T+=this.Align(S,this.height,this.ivalign):x+=this.Align(this.height,S,this.valign),"right"==this.ipos?v+=this.width+this.ipad:w+=y+this.ipad,u+=y+this.ipad,g=R(g,S+m))),(l=_(u,g))?(d=m=s/2,b=N(r,(f=u-s)/2,(p=g-s)/2),c=l.getContext("2d"),i&&(c.fillStyle=i,X(c,d,m,f,p,b)),s&&(c.strokeStyle=e,c.lineWidth=s,X(c,d,m,f,p,b,!0)),(n||D||A)&&(C=_(u,g))&&(z=c,c=C.getContext("2d")),W(c,this.font,t,this.strings,w,x,0,0,[],this.maxWidth,this.stringWidths,this.align),this.image&&c.drawImage(this.image,v,T,y,S),z&&(c=z,h&&(c.shadowColor=h),n&&(c.shadowBlur=n),c.shadowOffsetX=a[0],c.shadowOffsetY=a[1],c.drawImage(C,0,0)),l):null},(o=ct.prototype).Empty=function(){for(var t=0;t<this.text.length;++t)if(this.text[t].length)return!1;return!0},o.Lines=function(t){var i,e,s,h=t?1:0;for(e=(i=(t=t||this.e).childNodes).length,s=0;s<e;++s)"BR"==i[s].nodeName?(this.text.push(this.line.join(" ")),this.br=1):3==i[s].nodeType?this.br?(this.line=[i[s].nodeValue],this.br=0):this.line.push(i[s].nodeValue):this.Lines(i[s]);return h||this.br||this.text.push(this.line.join(" ")),this.text},o.SplitWidth=function(t,i,e,s){var h,n,a,o=[];for(i.font=s+"px "+e,h=0;h<this.text.length;++h){for(a=this.text[h].split(/\s+/),this.line=[a[0]],n=1;n<a.length;++n)i.measureText(this.line.join(" ")+" "+a[n]).width>t?(o.push(this.line.join(" ")),this.line=[a[n]]):this.line.push(a[n]);o.push(this.line.join(" "))}return this.text=o},(e=dt.prototype).SetMethod=function(t){var i={block:["PreDraw","DrawBlock"],colour:["PreDraw","DrawColour"],outline:["PostDraw","DrawOutline"],classic:["LastDraw","DrawOutline"],size:["PreDraw","DrawSize"],none:["LastDraw"]},e=i[t]||i.outline;"none"==t?this.Draw=function(){return 1}:this.drawFunc=this[e[1]],this[e[0]]=this.Draw},e.Update=function(t,i,e,s,h,n,a,o){var r=this.tc.outlineOffset,l=2*r;this.x=h*t+a-r,this.y=h*i+o-r,this.w=h*e+l,this.h=h*s+l,this.sc=h,this.z=n},e.Ants=function(t){if(this.adash){var i,e=this.adash,s=this.agap,h=this.aspeed,n=e+s,a=0,o=e,r=s,l=0,u=0;h&&(u=B(h)*(C()-this.ts)/50,h<0&&(u=864e4-u),h=~~u%n),i=h?(h<=e?(a=e-h,o=h):l=s-(r=n-h),[a,r,o,l]):[e,s],t.setLineDash(i)}},e.DrawOutline=function(t,i,e,s,h,n){var a=N(this.radius,h/2,s/2);t.strokeStyle=n,this.Ants(t),X(t,i,e,s,h,a,!0)},e.DrawSize=function(t,i,e,s,h,n,a,o,r){var l,u,g,c=a.w,d=a.h;return this.pulsate?(g=a.image?(a.image.height+this.tc.outlineIncrease)/a.image.height:a.oscale,u=a.fimage||a.image,l=1+(g-1)*(1-this.pulse),a.h*=l,a.w*=l):u=a.oimage,a.alpha=1,a.Draw(t,o,r,u),a.h=d,a.w=c,1},e.DrawColour=function(t,i,e,s,h,n,a,o,r){return a.oimage?(this.pulse<1?(a.alpha=1-x(this.pulse,2),a.Draw(t,o,r,a.fimage),a.alpha=this.pulse):a.alpha=1,a.Draw(t,o,r,a.oimage),1):this[a.image?"DrawColourImage":"DrawColourText"](t,i,e,s,h,n,a,o,r)},e.DrawColourText=function(t,i,e,s,h,n,a,o,r){var l=a.colour;return a.colour=n,a.alpha=1,a.Draw(t,o,r),a.colour=l,1},e.DrawColourImage=function(t,i,e,s,h,n,a,o,r){var l=t.canvas,u=~~R(i,0),g=~~R(e,0),c=N(l.width-u,s)+.5|0,d=N(l.height-g,h)+.5|0;return f?(f.width=c,f.height=d):f=_(c,d),f?(f.getContext("2d").drawImage(l,u,g,c,d,0,0,c,d),t.clearRect(u,g,c,d),this.pulsate?a.alpha=1-x(this.pulse,2):a.alpha=1,a.Draw(t,o,r),t.setTransform(1,0,0,1,0,0),t.save(),t.beginPath(),t.rect(u,g,c,d),t.clip(),t.globalCompositeOperation="source-in",t.fillStyle=n,t.fillRect(u,g,c,d),t.restore(),t.globalAlpha=1,t.globalCompositeOperation="destination-over",t.drawImage(f,0,0,c,d,u,g,c,d),t.globalCompositeOperation="source-over",1):this.SetMethod("outline")},e.DrawBlock=function(t,i,e,s,h,n){var a=N(this.radius,h/2,s/2);t.fillStyle=n,X(t,i,e,s,h,a)},e.DrawSimple=function(t,i,e,s,h,n){var a=this.tc;return t.setTransform(1,0,0,1,0,0),t.strokeStyle=this.colour,t.lineWidth=a.outlineThickness,t.shadowBlur=t.shadowOffsetX=t.shadowOffsetY=0,t.globalAlpha=n?h:1,this.drawFunc(t,this.x,this.y,this.w,this.h,this.colour,i,e,s)},e.DrawPulsate=function(t,i,e,s){var h=C()-this.ts,n=this.tc,a=n.pulsateTo+(1-n.pulsateTo)*(.5+p(2*Math.PI*h/(1e3*n.pulsateTime))/2);return this.pulse=a=mt.Smooth(1,a),this.DrawSimple(t,i,e,s,a,1)},e.Active=function(t,i,e){var s=i>=this.x&&e>=this.y&&i<=this.x+this.w&&e<=this.y+this.h;return this.ts=s?this.ts||C():null,s},e.PreDraw=e.PostDraw=e.LastDraw=b,(s=ft.prototype).Init=function(t){var i=this.tc;this.textHeight=i.textHeight,this.HasText()?this.Measure(i.ctxt,i):(this.w=this.iw,this.h=this.ih),this.SetShadowColour=i.shadowAlpha?this.SetShadowColourAlpha:this.SetShadowColourFixed,this.SetDraw(i)},s.Draw=b,s.HasText=function(){return this.text&&0<this.text[0].length},s.EqualTo=function(t){var i=t.getElementsByTagName("img");return this.a.href!=t.href?0:i.length?this.image.src==i[0].src:(t.innerText||t.textContent)==this.text_original},s.SetImage=function(t){this.image=this.fimage=t},s.SetDraw=function(t){this.Draw=this.fimage?7<t.ie?this.DrawImageIE:this.DrawImage:this.DrawText,t.noSelect&&(this.CheckActive=b)},s.MeasureText=function(t){var i,e,s=this.text.length,h=0;for(i=0;i<s;++i)this.line_widths[i]=e=t.measureText(this.text[i]).width,h=R(h,e);return h},s.Measure=function(t,i){var e,s,h,n,a,o,r,l,u,g=G(this.text,this.textFont,this.textHeight);r=g?g.max.y+g.min.y:this.textHeight,t.font=this.font=this.textHeight+"px "+this.textFont,o=this.MeasureText(t),i.txtOpt&&(h=(s=(e=i.txtScale)*this.textHeight)+"px "+this.textFont,n=[e*i.shadowOffset[0],e*i.shadowOffset[1]],t.font=h,a=this.MeasureText(t),u=new Y(this.text,h,a+e,e*r+e,a,this.line_widths,i.textAlign,i.textVAlign,e),this.image&&u.SetImage(this.image,this.iw,this.ih,i.imagePosition,i.imagePadding,i.imageAlign,i.imageVAlign,i.imageScale),l=u.Create(this.colour,this.bgColour,this.bgOutline,e*this.bgOutlineThickness,i.shadow,e*i.shadowBlur,n,e*this.padding,e*this.bgRadius),"colour"==i.outlineMethod?this.oimage=u.Create(this.outline.colour,this.bgColour,this.outline.colour,e*this.bgOutlineThickness,i.shadow,e*i.shadowBlur,n,e*this.padding,e*this.bgRadius):"size"==i.outlineMethod&&(s=(g=G(this.text,this.textFont,this.textHeight+i.outlineIncrease)).max.y+g.min.y,h=e*(this.textHeight+i.outlineIncrease)+"px "+this.textFont,t.font=h,a=this.MeasureText(t),u=new Y(this.text,h,a+e,e*s+e,a,this.line_widths,i.textAlign,i.textVAlign,e),this.image&&u.SetImage(this.image,this.iw+i.outlineIncrease,this.ih+i.outlineIncrease,i.imagePosition,i.imagePadding,i.imageAlign,i.imageVAlign,i.imageScale),this.oimage=u.Create(this.colour,this.bgColour,this.bgOutline,e*this.bgOutlineThickness,i.shadow,e*i.shadowBlur,n,e*this.padding,e*this.bgRadius),this.oscale=this.oimage.width/l.width,0<i.outlineIncrease?l=U(l,this.oimage.width,this.oimage.height):this.oimage=U(this.oimage,l.width,l.height)),l&&(this.fimage=l,o=this.fimage.width/e,r=this.fimage.height/e),this.SetDraw(i),i.txtOpt=!!this.fimage),this.h=r,this.w=o},s.SetFont=function(t,i,e,s){this.textFont=t,this.colour=i,this.bgColour=e,this.bgOutline=s,this.Measure(this.tc.ctxt,this.tc)},s.SetWeight=function(t){var i,e,s=this.tc,h=s.weightMode.split(/[, ]/),n=t.length;if(this.HasText()){for(this.weighted=!0,e=0;e<n;++e)"both"==(i=h[e]||"size")?(this.Weight(t[e],s.ctxt,s,"size",s.min_weight[e],s.max_weight[e],e),this.Weight(t[e],s.ctxt,s,"colour",s.min_weight[e],s.max_weight[e],e)):this.Weight(t[e],s.ctxt,s,i,s.min_weight[e],s.max_weight[e],e);this.Measure(s.ctxt,s)}},s.Weight=function(t,i,e,s,h,n,a){var o=((t=isNaN(t)?1:t)-h)/(n-h);"colour"==s?this.colour=H(e,o,a):"bgcolour"==s?this.bgColour=H(e,o,a):"bgoutline"==s?this.bgOutline=H(e,o,a):"outline"==s?this.outline.colour=H(e,o,a):"size"==s&&(0<e.weightSizeMin&&e.weightSizeMax>e.weightSizeMin?this.textHeight=e.weightSize*(e.weightSizeMin+(e.weightSizeMax-e.weightSizeMin)*o):this.textHeight=R(1,t*e.weightSize))},s.SetShadowColourFixed=function(t,i,e){t.shadowColor=i},s.SetShadowColourAlpha=function(t,i,e){var s,h,n,a,o,r;t.shadowColor=(o=s=i,r=(1*(h=e)).toPrecision(3)+")","#"===s[0]?(l[s]||(4===s.length?l[s]="rgba("+g[s[1]]+g[s[2]]+g[s[3]]:l[s]="rgba("+u[s.substr(1,2)]+u[s.substr(3,2)]+u[s.substr(5,2)]),o=l[s]+r):"rgb("===s.substr(0,4)||"hsl("===s.substr(0,4)?o=s.replace("(","a(").replace(")",","+r):"rgba("!==s.substr(0,5)&&"hsla("!==s.substr(0,5)||(n=s.lastIndexOf(",")+1,a=s.indexOf(")"),h*=parseFloat(s.substring(n,a)),o=s.substr(0,n)+h.toPrecision(3)+")"),o)},s.DrawText=function(t,i,e){var s,h,n=this.tc,a=this.x,o=this.y,r=this.sc;for(t.globalAlpha=this.alpha,t.fillStyle=this.colour,n.shadow&&this.SetShadowColour(t,n.shadow,this.alpha),t.font=this.font,a+=i/r,o+=e/r-this.h/2,s=0;s<this.text.length;++s)h=a,"right"==n.textAlign?h+=this.w/2-this.line_widths[s]:"centre"==n.textAlign?h-=this.line_widths[s]/2:h-=this.w/2,t.setTransform(r,0,0,r,r*h,r*o),t.fillText(this.text[s],0,0),o+=this.textHeight},s.DrawImage=function(t,i,e,s){var h=this.x,n=this.y,a=this.sc,o=s||this.fimage,r=this.w,l=this.h,u=this.alpha,g=this.shadow;t.globalAlpha=u,g&&this.SetShadowColour(t,g,u),h+=i/a-r/2,n+=e/a-l/2,t.setTransform(a,0,0,a,a*h,a*n),t.drawImage(o,0,0,r,l)},s.DrawImageIE=function(t,i,e){var s=this.fimage,h=this.sc,n=s.width=this.w*h,a=s.height=this.h*h,o=this.x*h+i-n/2,r=this.y*h+e-a/2;t.setTransform(1,0,0,1,0,0),t.globalAlpha=this.alpha,t.drawImage(s,o,r)},s.Calc=function(t,i){var e,s,h,n,a,o,r=this.tc,l=r.minBrightness,u=r.maxBrightness,g=r.max_radius;return e=t.xform(this.position),this.xformed=e,h=e,n=(s=r).stretchX,a=r.stretchY,o=s.radius*s.z1/(s.z1+s.z2+h.z),e={x:h.x*o*n,y:h.y*o*a,z:h.z,w:(s.z1-h.z)/s.z2},this.x=e.x,this.y=e.y,this.z=e.z,this.sc=e.w,this.alpha=i*S(l+(u-l)*(g-this.z)/(2*g),0,1),this.xformed},s.UpdateActive=function(t,i,e){var s=this.outline,h=this.w,n=this.h,a=this.x-h/2,o=this.y-n/2;return s.Update(a,o,h,n,this.sc,this.z,i,e),s},s.CheckActive=function(t,i,e){var s=this.tc,h=this.UpdateActive(t,i,e);return h.Active(t,s.mx,s.my)?h:null},s.Clicked=function(t){var i,e=this.a,s=e.target,h=e.href;if(""==s||"_self"==s){if(v.createEvent){if((i=v.createEvent("MouseEvents")).initMouseEvent("click",1,1,window,0,0,0,0,0,0,0,0,0,0,null),!e.dispatchEvent(i))return}else if(e.fireEvent&&!e.fireEvent("onclick"))return;v.location=h}else if(self.frames[s])self.frames[s].document.location=h;else{try{if(top.frames[s])return void(top.frames[s].document.location=h)}catch(t){}window.open(h,s)}},(h=mt.prototype).SourceElements=function(){return v.querySelectorAll?v.querySelectorAll("#"+this.source):[v.getElementById(this.source)]},h.HideTags=function(){var t,i=this.SourceElements();for(t=0;t<i.length;++t)i[t].style.display="none"},h.GetTags=function(){var t,i,e,s,h=this.SourceElements(),n=[];for(s=0;s<=this.repeatTags;++s)for(i=0;i<h.length;++i)for(t=h[i].getElementsByTagName("a"),e=0;e<t.length;++e)n.push(t[e]);return n},h.Message=function(t){var i,e,s,h,n,a,o=[],r=t.split("");for(i=0;i<r.length;++i)" "!=r[i]&&(e=i-r.length/2,(s=v.createElement("A")).href="#",s.innerText=r[i],n=100*m(e/9),a=-100*p(e/9),(h=new ft(this,r[i],s,[n,0,a],2,18,"#000","#fff",0,0,0,"monospace",2,r[i])).Init(),o.push(h));return o},h.CreateTag=function(t){var i,e,s,h,n,a,o,r,l=[0,0,0];return"text"!=this.imageMode&&(i=t.getElementsByTagName("img")).length&&((e=new Image).src=i[0].src,!this.imageMode)?((s=new ft(this,"",t,l,0,0)).SetImage(e),J(e,i[0],s,this),s):("image"!=this.imageMode&&(h=(n=new ct(t)).Lines(),n.Empty()?n=null:(a=this.textFont||Z(K(t,"font-family")),this.splitWidth&&(h=n.SplitWidth(this.splitWidth,this.ctxt,a,this.textHeight)),o="tag"==this.bgColour?K(t,"background-color"):this.bgColour,r="tag"==this.bgOutline?K(t,"color"):this.bgOutline)),n||e?(s=new ft(this,h,t,l,2,this.textHeight+2,this.textColour||K(t,"color"),o,this.bgRadius,r,this.bgOutlineThickness,a,this.padding,n&&n.original),e?(s.SetImage(e),J(e,i[0],s,this)):s.Init(),s):void 0)},h.UpdateTag=function(t,i){var e=this.textColour||K(i,"color"),s=this.textFont||Z(K(i,"font-family")),h="tag"==this.bgColour?K(i,"background-color"):this.bgColour,n="tag"==this.bgOutline?K(i,"color"):this.bgOutline;t.a=i,t.title=i.title,t.colour==e&&t.textFont==s&&t.bgColour==h&&t.bgOutline==n||t.SetFont(s,e,h,n)},h.Weight=function(t){var i,e,s,h,n,a,o,r,l,u=t.length,g=[],c=this.weightFrom?this.weightFrom.split(/[, ]/):[null],d=c.length;for(e=0;e<u;++e)for(g[e]=[],s=0;s<d;++s)n=t[e].a,a=c[s],o=this.textHeight,l=r=void 0,l=1,a?l=1*(n.getAttribute(a)||o):(r=K(n,"font-size"))&&(l=-1<r.indexOf("px")&&1*r.replace("px","")||-1<r.indexOf("pt")&&1.25*r.replace("pt","")||3.3*r),i=l,(!this.max_weight[s]||i>this.max_weight[s])&&(this.max_weight[s]=i),(!this.min_weight[s]||i<this.min_weight[s])&&(this.min_weight[s]=i),g[e][s]=i;for(s=0;s<d;++s)this.max_weight[s]>this.min_weight[s]&&(h=1);if(h)for(e=0;e<u;++e)t[e].SetWeight(g[e])},h.Load=function(){var t,i,e,s,h,n,a,o,r=this.GetTags(),l=[],u=[],g={sphere:I,vcylinder:O,hcylinder:k,vring:P,hring:E};if(r.length){for(u.length=r.length,o=0;o<r.length;++o)u[o]=o;for(this.shuffleTags&&z(u),s=100*this.radiusX,h=100*this.radiusY,n=100*this.radiusZ,this.max_radius=R(s,R(h,n)),o=0;o<r.length;++o)(i=this.CreateTag(r[u[o]]))&&l.push(i);for(this.weight&&this.Weight(l,!0),this.shapeArgs?this.shapeArgs[0]=l.length:(t=(e=this.shape.toString().split(/[(),]/)).shift(),"function"==typeof window[t]?this.shape=window[t]:this.shape=g[t]||g.sphere,this.shapeArgs=[l.length,s,h,n].concat(e)),a=this.shape.apply(this,this.shapeArgs),this.listLength=l.length,o=0;o<l.length;++o)l[o].position=new D(a[o][0],a[o][1],a[o][2])}this.noTagsMessage&&!l.length&&(o=this.imageMode&&"both"!=this.imageMode?this.imageMode+" ":"",l=this.Message("No "+o+"tags")),this.taglist=l},h.Update=function(){var t,i,e,s,h,n,a=this.GetTags(),o=[],r=this.taglist,l=[],u=[];if(!this.shapeArgs)return this.Load();if(a.length){for(s=this.listLength=a.length,e=r.length,h=0;h<e;++h)o.push(r[h]),u.push(h);for(h=0;h<s;++h){for(t=n=0;n<e;++n)r[n].EqualTo(a[h])&&(this.UpdateTag(o[n],a[h]),t=u[n]=-1);t||l.push(h)}for(n=h=0;h<e;++h)-1==u[n]?u.splice(n,1):++n;if(u.length){for(z(u);u.length&&l.length;)h=u.shift(),n=l.shift(),o[h]=this.CreateTag(a[n]);for(u.sort(function(t,i){return t-i});u.length;)o.splice(u.pop(),1)}for(n=o.length/(l.length+1),h=0;l.length;)o.splice(d(++h*n),0,this.CreateTag(a[l.shift()]));for(this.shapeArgs[0]=s=o.length,i=this.shape.apply(this,this.shapeArgs),h=0;h<s;++h)o[h].position=new D(i[h][0],i[h][1],i[h][2]);this.weight&&this.Weight(o)}this.taglist=o},h.SetShadow=function(t){t.shadowBlur=this.shadowBlur,t.shadowOffsetX=this.shadowOffset[0],t.shadowOffsetY=this.shadowOffset[1]},h.Draw=function(t){if(!this.paused){var i,e,s,h,n=this.canvas,a=n.width,o=n.height,r=0,l=(t-this.time)*mt.interval/1e3,u=a/2+this.offsetX,g=o/2+this.offsetY,c=this.ctxt,d=-1,f=this.taglist,m=f.length,p=this.frontSelect,w=this.centreFunc==b;if(this.time=t,this.frozen&&this.drawn)return this.Animate(a,o,l);for(h=this.AnimateFixed(),c.setTransform(1,0,0,1,0,0),s=0;s<m;++s)f[s].Calc(this.transform,this.fixedAlpha);if(f=function(t,i){var e,s=[],h=t.length;for(e=0;e<h;++e)s.push(t[e]);return s.sort(i),s}(f,function(t,i){return i.z-t.z}),h&&this.fixedAnim.active)i=this.fixedAnim.tag.UpdateActive(c,u,g);else{for(this.active=null,s=0;s<m;++s)(e=0<=this.mx&&0<=this.my&&this.taglist[s].CheckActive(c,u,g))&&e.sc>r&&(!p||e.z<=0)&&(d=s,(i=e).tag=this.taglist[s],r=e.sc);this.active=i}for(this.txtOpt||this.shadow&&this.SetShadow(c),c.clearRect(0,0,a,o),s=0;s<m;++s){if(!w&&f[s].z<=0){try{this.centreFunc(c,a,o,u,g)}catch(t){alert(t),this.centreFunc=b}w=!0}i&&i.tag==f[s]&&i.PreDraw(c,f[s],u,g)||f[s].Draw(c,u,g),i&&i.tag==f[s]&&i.PostDraw(c)}this.freezeActive&&i?this.Freeze():(this.UnFreeze(),this.drawn=m==this.listLength),this.fixedCallback&&(this.fixedCallback(this,this.fixedCallbackTag),this.fixedCallback=null),h||this.Animate(a,o,l),i&&i.LastDraw(c),n.style.cursor=i?this.activeCursor:"",this.Tooltip(i,this.taglist[d])}},h.TooltipNone=function(){},h.TooltipNative=function(t,i){this.canvas.title=t?i&&i.title?i.title:"":this.ctitle},h.SetTTDiv=function(t,i){var e=this,s=e.ttdiv.style;t!=e.ttdiv.innerHTML&&(s.display="none"),e.ttdiv.innerHTML=t,i&&(i.title=e.ttdiv.innerHTML),"none"!=s.display||e.tttimer||(e.tttimer=setTimeout(function(){var t=gt(e.canvas.id);s.display="block",s.left=t.x+e.mx+"px",s.top=t.y+e.my+24+"px",e.tttimer=null},e.tooltipDelay))},h.TooltipDiv=function(t,i){t&&i&&i.title?this.SetTTDiv(i.title,i):!t&&-1!=this.mx&&-1!=this.my&&this.ctitle.length?this.SetTTDiv(this.ctitle):this.ttdiv.style.display="none"},h.Transform=function(t,i,e){if(i||e){var s=m(i),h=p(i),n=m(e),a=p(e),o=new A([a,0,n,0,1,0,-n,0,a]),r=new A([1,0,0,0,h,-s,0,s,h]);t.transform=t.transform.mul(o.mul(r))}},h.AnimateFixed=function(){var t,i,e,s,h;return this.fadeIn&&((i=C()-this.startTime)>=this.fadeIn?(this.fadeIn=0,this.fixedAlpha=1):this.fixedAlpha=i/this.fadeIn),!!this.fixedAnim&&(this.fixedAnim.transform||(this.fixedAnim.transform=this.transform),t=this.fixedAnim,i=C()-t.t0,e=t.angle,h=this.animTiming(t.t,i),this.transform=t.transform,i>=t.t?(this.fixedCallbackTag=t.tag,this.fixedCallback=t.cb,this.fixedAnim=this.yaw=this.pitch=0):e*=h,s=A.Rotation(e,t.axis),this.transform=this.transform.mul(s),0!=this.fixedAnim)},h.AnimatePosition=function(t,i,e){var s,h,n=this,a=n.mx,o=n.my;!n.frozen&&0<=a&&0<=o&&a<t&&o<i?(s=n.maxSpeed,h=n.reverse?-1:1,n.lx||(n.yaw=(2*a*s/t-s)*h*e),n.ly||(n.pitch=(2*o*s/i-s)*-h*e),n.initial=null):n.initial||(n.frozen&&!n.freezeDecel?n.yaw=n.pitch=0:n.Decel(n)),this.Transform(n,n.pitch,n.yaw)},h.AnimateDrag=function(t,i,e){var s=this,h=100*e*s.maxSpeed/s.max_radius/s.zoom;s.dx||s.dy?(s.lx||(s.yaw=s.dx*h/s.stretchX),s.ly||(s.pitch=s.dy*-h/s.stretchY),s.dx=s.dy=0,s.initial=null):s.initial||s.Decel(s),this.Transform(s,s.pitch,s.yaw)},h.Freeze=function(){this.frozen||(this.preFreeze=[this.yaw,this.pitch],this.frozen=1,this.drawn=0)},h.UnFreeze=function(){this.frozen&&(this.yaw=this.preFreeze[0],this.pitch=this.preFreeze[1],this.frozen=0)},h.Decel=function(t){var i=t.minSpeed,e=B(t.yaw),s=B(t.pitch);!t.lx&&i<e&&(t.yaw=e>t.z0?t.yaw*t.decel:0),!t.ly&&i<s&&(t.pitch=s>t.z0?t.pitch*t.decel:0)},h.Zoom=function(t){this.z2=this.z1*(1/t),this.drawn=0},h.Clicked=function(t){var i=this.active;try{i&&i.tag&&(!1===this.clickToFront||null===this.clickToFront?i.tag.Clicked(t):this.TagToFront(i.tag,this.clickToFront,function(){i.tag.Clicked(t)},!0))}catch(t){}},h.Wheel=function(t){var i=this.zoom+this.zoomStep*(t?1:-1);this.zoom=N(this.zoomMax,R(this.zoomMin,i)),this.Zoom(this.zoom)},h.BeginDrag=function(t){this.down=$(t,this.canvas),t.cancelBubble=!0,t.returnValue=!1,t.preventDefault&&t.preventDefault()},h.Drag=function(t,i){if(this.dragControl&&this.down){var e=this.dragThreshold*this.dragThreshold,s=i.x-this.down.x,h=i.y-this.down.y;(this.dragging||e<s*s+h*h)&&(this.dx=s,this.dy=h,this.dragging=1,this.down=i)}return this.dragging},h.EndDrag=function(){var t=this.dragging;return this.dragging=this.down=null,t},h.BeginPinch=function(t){this.pinched=[pt(t),this.zoom],t.preventDefault&&t.preventDefault()},h.Pinch=function(t){var i,e,s=this.pinched;s&&(e=pt(t),i=s[1]*e/s[0],this.zoom=N(this.zoomMax,R(this.zoomMin,i)),this.Zoom(this.zoom))},h.EndPinch=function(t){this.pinched=null},h.Pause=function(){this.paused=!0},h.Resume=function(){this.paused=!1},h.SetSpeed=function(t){this.initial=t,this.yaw=t[0]*this.maxSpeed,this.pitch=t[1]*this.maxSpeed},h.FindTag=function(t){if(!y(t))return null;if(y(t.index)&&(t=t.index),!c(t))return this.taglist[t];var i,e,s;for(y(t.id)?(i="id",e=t.id):y(t.text)&&(i="innerText",e=t.text),s=0;s<this.taglist.length;++s)if(this.taglist[s].a[i]==e)return this.taglist[s]},h.RotateTag=function(t,i,e,s,h,n){var a,o,r=t.Calc(this.transform,1),l=new D(r.x,r.y,r.z),u=(a=e,o=(o=i)*Math.PI/180,a=a*Math.PI/180,new D(m(a)*p(o),-m(o),-p(a)*p(o))),g=l.angle(u),c=l.cross(u).unit();0==g?(this.fixedCallbackTag=t,this.fixedCallback=h):this.fixedAnim={angle:-g,axis:c,t:s,t0:C(),cb:h,tag:t,active:n}},h.TagToFront=function(t,i,e,s){this.RotateTag(t,0,0,i,e,s)},mt.Start=function(t,i,e){mt.Delete(t),mt.tc[t]=new mt(t,i,e)},mt.Linear=function(t,i){return i/t},mt.Smooth=function(t,i){return.5-p(i*Math.PI/t)/2},mt.Pause=function(t){wt("Pause",t)},mt.Resume=function(t){wt("Resume",t)},mt.Reload=function(t){wt("Load",t)},mt.Update=function(t){wt("Update",t)},mt.SetSpeed=function(t,i){return!(!c(i)||!mt.tc[t]||isNaN(i[0])||isNaN(i[1]))&&(mt.tc[t].SetSpeed(i),!0)},mt.TagToFront=function(t,i){return!!c(i)&&(i.lat=i.lng=0,mt.RotateTag(t,i))},mt.RotateTag=function(t,i){if(c(i)&&mt.tc[t]){isNaN(i.time)&&(i.time=500);var e=mt.tc[t].FindTag(i);if(e)return mt.tc[t].RotateTag(e,i.lat,i.lng,i.time,i.callback,i.active),!0}return!1},mt.Delete=function(t){var i,e,s,h,n;if(T[t]&&(e=v.getElementById(t)))for(i=0;i<T[t].length;++i)s=T[t][i][0],h=T[t][i][1],(n=(n=e)||v).removeEventListener?n.removeEventListener(s,h):n.detachEvent("on"+s,h);delete T[t],delete mt.tc[t]},mt.NextFrameRAF=function(){requestAnimationFrame(ut)},mt.NextFrameTimeout=function(t){setTimeout(lt,t)},mt.tc={},mt.options={z1:2e4,z2:2e4,z0:2e-4,freezeActive:!0,freezeDecel:!1,activeCursor:"pointer",pulsateTo:1,pulsateTime:3,reverse:!1,depth:.5,maxSpeed:.05,minSpeed:0,decel:.95,interval:20,minBrightness:.1,maxBrightness:1,outlineColour:"",outlineThickness:2,outlineOffset:5,outlineMethod:"outline",outlineRadius:0,textColour:["#222","#000"],textHeight:15,textFont:"Helvetica, Arial, sans-serif",shadow:"#111",shadowBlur:1,shadowOffset:[.1,.1],initial:null,hideTags:!1,zoom:0,weight:!1,weightMode:"size",weightFrom:null,weightSize:1,weightSizeMin:null,weightSizeMax:null,weightGradient:{0:"#f00",.33:"#ff0",.66:"#0f0",1:"#00f"},txtOpt:!0,txtScale:2,frontSelect:!1,wheelZoom:!0,zoomMin:.8,zoomMax:.8,zoomStep:.05,shape:"sphere",lock:null,tooltip:null,tooltipDelay:300,tooltipClass:"tctooltip",radiusX:1,radiusY:1,radiusZ:1,stretchX:1,stretchY:1,offsetX:0,offsetY:0,shuffleTags:!1,noSelect:!1,noMouse:!1,imageScale:1,paused:!1,dragControl:!1,dragThreshold:4,centreFunc:b,splitWidth:0,animTiming:"Smooth",clickToFront:!1,fadeIn:0,padding:0,bgColour:null,bgRadius:0,bgOutline:null,bgOutlineThickness:0,outlineIncrease:4,textAlign:"centre",textVAlign:"middle",imageMode:null,imagePosition:null,imagePadding:2,imageAlign:"centre",imageVAlign:"middle",noTagsMessage:!0,centreImage:null,pinchZoom:!1,repeatTags:0,minTags:0,imageRadius:0,scrollPause:!1,outlineDash:0,outlineDashSpace:0,outlineDashSpeed:1})mt[t]=mt.options[t];window.TagCanvas=mt,j("load",function(){mt.loaded=1},window)}();