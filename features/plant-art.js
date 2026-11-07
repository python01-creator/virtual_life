/* Original ceramic-pot botanical artwork, shared by room and growth detail. */
(()=>{
 'use strict';
 const cache=new Map(),stage=xp=>xp<1?0:xp<4?1:xp<8?4:xp<14?8:14;
 function artwork(value=5){const level=stage(Number(value)||0);if(cache.has(level))return cache.get(level);const shapes=[];
 const path=(d,fill,stroke='',width=1)=>shapes.push({d,fill,stroke,width});
 const ellipse=(cx,cy,rx,ry,fill,angle=0,stroke='')=>shapes.push({cx,cy,rx,ry,fill,angle,stroke,width:1});
 ellipse(120,242,51,7,'#a69f8524');ellipse(120,236,44,7,'#ded6c3');ellipse(120,234,39,5,'#f6f0e3');
 path('M78 166Q120 158 162 166L153 225Q149 235 120 235T87 225Z','#f1ebdf','#beb6a2',1.5);
 path('M83 172L92 223Q94 227 103 229L99 173Z','#fffbef');
 path('M150 172L145 223Q143 229 135 232Q149 231 153 224L160 171Z','#d9d0bd');
 path('M92 190Q120 195 149 190M91 195Q120 200 148 195','none','#d5c7a8',1.2);
 ellipse(120,166,43,9,'#ddd4be');ellipse(120,165,37,5.5,'#81745f');
 path('M99 165Q117 162 141 165','none','#9c8a70',1);
 if(level===0){ellipse(120,159,9,4.5,'#b19a71',-18);path('M116 159L124 156','none','#e6d8b4',1.3);}
 else{
 const top=level===1?110:level===4?83:61;
 path(`M120 165C114 141 129 120 123 ${top}`,'none','#708b68',3.2);
 path('M119 146Q105 132 93 126M121 137Q140 121 153 113','none','#78916d',2);
 path('M117 144C96 147 82 135 83 116C103 113 120 125 117 144Z','#91ab84');
 path('M121 136C124 115 142 103 160 109C159 129 143 140 121 136Z','#718f70');
 path('M115 141Q101 126 88 120M126 133Q140 118 155 113','none','#bbcc9b',1.1);
 if(level>=4){path('M123 120C101 118 92 101 99 85C119 87 130 102 123 120Z','#a3bb90');path('M124 111C128 89 143 79 159 84C158 102 144 114 124 111Z','#82a17e');path('M123 116Q108 99 103 90M129 108Q143 93 155 88','none','#cad7af',1);}
 if(level>=8){path('M123 91C104 87 104 70 112 61C126 69 129 80 123 91Z','#bad0a4');path('M123 87C126 71 138 65 148 70C145 84 135 91 123 87Z','#8ca985');path('M123 76Q119 67 122 58','none','#7c966f',2);}
 if(level===8){ellipse(122,54,6.5,10,'#eee4cb',-8);path('M116 59Q121 65 128 59','none','#a7b58d',2);}
 if(level===14){
 path('M124 91Q143 73 151 62M119 113Q95 95 83 85','none','#879d77',1.7);
 for(const [cx,cy,r]of [[122,49,8],[152,60,5.5],[82,83,4.5]]){for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180;ellipse(cx+Math.cos(a)*r*.8,cy+Math.sin(a)*r*.8,r*.56,r*.88,i%2?'#fffdf1':'#f3ead7',i*72);}ellipse(cx,cy,r*.44,r*.44,'#d7b573');ellipse(cx-1,cy-1,r*.15,r*.15,'#f6e6bd');}
 }
 }
 for(const item of shapes){item.path=new Path2D();if(item.d)item.path=new Path2D(item.d);else item.path.ellipse(item.cx,item.cy,item.rx,item.ry,item.angle*Math.PI/180,0,Math.PI*2);}
 const art={shapes,svg:'<svg viewBox="0 0 240 260" role="img" aria-label="'+(level===0?'아이보리 화분 속 씨앗':level===14?'작은 크림색 꽃이 핀 식물':level===8?'꽃봉오리가 맺힌 식물':'둥근 잎이 자라는 식물')+'">'+shapes.map(item=>item.d?'<path d="'+item.d+'" fill="'+item.fill+'"'+(item.stroke?' stroke="'+item.stroke+'" stroke-width="'+item.width+'" stroke-linecap="round" stroke-linejoin="round"':'')+'/>':'<ellipse cx="'+item.cx+'" cy="'+item.cy+'" rx="'+item.rx+'" ry="'+item.ry+'" fill="'+item.fill+'"'+(item.angle?' transform="rotate('+item.angle+' '+item.cx+' '+item.cy+')"':'')+'/>').join('')+'</svg>'};cache.set(level,art);return art;}
 const api={xp:5,svg:xp=>artwork(xp??api.xp).svg,draw(context,x,y,scale=1){const k=.42*scale;context.save();context.translate(x-120*k,y+27*scale-244*k);context.scale(k,k);for(const item of artwork(api.xp).shapes){if(item.fill!=='none'){context.fillStyle=item.fill;context.fill(item.path);}if(item.stroke){context.strokeStyle=item.stroke;context.lineWidth=item.width;context.lineCap='round';context.stroke(item.path);}}context.restore();}};
 window.lifePlantArt=api;
 window.addEventListener('life-growth-earned',event=>{api.xp=Math.max(0,Math.min(14,Number(event.detail?.garden?.xp)||0));});
 plant=function(x,y,scale=1){api.draw(ctx,x,y,scale);if(Date.now()<waterUntil){ctx.save();ctx.fillStyle='#b6d7d4';for(const dx of [-21,23]){ctx.beginPath();ctx.ellipse(x+dx*scale,y-8*scale,1.6*scale,3*scale,0,0,Math.PI*2);ctx.fill();}ctx.restore();}};
 if(window.lifeCloud)window.lifeCloud.ready.then(()=>window.lifeCloud.getSetting('garden')).then(value=>{api.xp=Math.max(0,Math.min(14,Number(value?.xp)||0));}).catch(()=>{});
})();
