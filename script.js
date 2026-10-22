
// Compatibility fallback for browsers without CanvasRenderingContext2D.roundRect.
if (typeof CanvasRenderingContext2D !== 'undefined' &&
    !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
    radius = Math.min(Number(radius) || 0, Math.abs(width) / 2, Math.abs(height) / 2);
    this.beginPath();
    this.moveTo(x + radius, y);
    this.lineTo(x + width - radius, y);
    this.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.lineTo(x + width, y + height - radius);
    this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.lineTo(x + radius, y + height);
    this.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.lineTo(x, y + radius);
    this.quadraticCurveTo(x, y, x + radius, y);
    this.closePath();
    return this;
  };
}

const $ = id => document.getElementById(id);
const seasons=['Spring','Summer','Autumn','Winter'], weathers=['Clear','Cloudy','Rain'];
let data=[];
function seededData(){data=[];for(let i=0;i<720;i++){let season=seasons[Math.floor(Math.random()*4)], 
  day_type=Math.random()<.72?'Weekday':'Weekend', weather=weathers[Math.random()<.62?0:Math.random()<.72?1:2], 
  hour=Math.floor(Math.random()*24);let s={Spring:1.0,Summer:1.25,Autumn:1.12,Winter:.62}[season],w={Clear:1.12,Cloudy:.9,Rain:.48}[weather], 
  commute=day_type==='Weekday'?(hour>=7&&hour<=9?1.8:hour>=16&&hour<=18?2.0:.55):(hour>=11&&hour<=16?1.5:.7);
  let trips=Math.max(8,Math.round((75+Math.random()*100)*s*w*commute));
  let casual=Math.round(trips*(day_type==='Weekend'?.52:.24)*(weather==='Rain'?.65:1));
  let duration=Math.round((day_type==='Weekend'?24:15)+Math.random()*15+(weather==='Rain'?2:0));data.push({season,day_type,weather,hour,trips,casual,registered:Math.max(0,trips-casual),duration});}}
function filtered(){return data.filter(d=>($('seasonFilter').value==='All'||d.season===$('seasonFilter').value)&&($('dayFilter').value==='All'||d.day_type===$('dayFilter').value)&&($('weatherFilter').value==='All'||d.weather===$('weatherFilter').value))}
const fmt=n=>Math.round(n).toLocaleString('en-US');
const avg=(arr,key)=>arr.length?arr.reduce((s,d)=>s+d[key],0)/arr.length:0;
function aggregate(arr,key,labels){return labels.map(label=>({label,value:arr.filter(d=>d[key]===label).reduce((s,d)=>s+metric(d),0),trips:arr.filter(d=>d[key]===label).reduce((s,d)=>s+d.trips,0),casual:arr.filter(d=>d[key]===label).reduce((s,d)=>s+d.casual,0)}))}
function metric(d){let m=$('metricFilter').value;return m==='duration'?d.duration:m==='casual'?d.casual:d.trips}
function canvasSetup(id){let c=$(id),r=c.getBoundingClientRect(),ratio=window.devicePixelRatio||1;
  c.width=Math.max(1,r.width*ratio);c.height=Math.max(1,r.height*ratio);
  let x=c.getContext('2d');x.scale(ratio,ratio);return {c,x,w:r.width,h:r.height}}
function drawBars(id,items,color,formatLabel=true){let {x,w,h}=canvasSetup(id);x.clearRect(0,0,w,h);
let left=35,right=10,top=10,bottom=32,plotW=w-left-right,plotH=h-top-bottom,max=Math.max(1,...items.map(d=>d.value));x.font='10px system-ui';x.textAlign='right';
for(let i=0;i<4;i++){let y=top+plotH*i/3;x.strokeStyle='#edf1f6';x.beginPath();x.moveTo(left,y);x.lineTo(w-right,y);x.stroke();x.fillStyle='#8491a5';x.fillText(fmt(max*(1-i/3)),left-7,y+3)}
let step=plotW/items.length,bw=Math.min(30,step*.58);items.forEach((d,i)=>{let bh=d.value/max*(plotH-4),xx=left+i*step+(step-bw)/2,yy=top+plotH-bh;
  let grad=x.createLinearGradient(0,yy,0,top+plotH);grad.addColorStop(0,color);grad.addColorStop(1,color+'99');x.fillStyle=grad;x.beginPath();x.roundRect(xx,yy,bw,bh,5);x.fill();x.fillStyle='#718096';x.textAlign='center';
  let label=String(d.label);if(label.length>8)label=label.slice(0,7);x.fillText(label,left+i*step+step/2,h-11)})}
function drawWeather(id,items){let {x,w,h}=canvasSetup(id);x.clearRect(0,0,w,h);
let left=37,top=15,bottom=32,plotH=h-top-bottom,plotW=w-left-10,max=Math.max(1,...items.map(d=>d.trips));x.font='10px system-ui';x.textAlign='right';
for(let i=0;i<4;i++){let y=top+plotH*i/3;x.strokeStyle='#edf1f6';x.beginPath();x.moveTo(left,y);x.lineTo(w-8,y);x.stroke();x.fillStyle='#8491a5';x.fillText(fmt(max*(1-i/3)),left-7,y+3)}
let step=plotW/items.length;items.forEach((d,i)=>{let xx=left+i*step+step*.2,bw=step*.25,bh=d.trips/max*plotH;x.fillStyle='#3768f5';x.beginPath();x.roundRect(xx,top+plotH-bh,bw,bh,4);x.fill();
  let ch=d.casual/max*plotH;x.fillStyle='#13b8a6';x.beginPath();x.roundRect(xx+bw+4,top+plotH-ch,bw,ch,4);x.fill();x.fillStyle='#718096';x.textAlign='center';x.fillText(d.label,left+i*step+step/2,h-11)})}
function drawDonut(id,registered,casual){let {x,w,h}=canvasSetup(id);x.clearRect(0,0,w,h);
let total=registered+casual, cx=w*.5,cy=h*.48,r=Math.min(w*.24,h*.37),ri=r*.64,start=-Math.PI/2;[[registered,'#3768f5'],[casual,'#13b8a6']].forEach(([v,col])=>{let end=start+(total?v/total:0)*Math.PI*2;x.beginPath();x.arc(cx,cy,r,start,end);x.arc(cx,cy,ri,end,start,true);x.closePath();x.fillStyle=col;x.fill();start=end});x.textAlign='center';x.fillStyle='#17233b';x.font='800 22px system-ui';x.fillText(total?Math.round(casual/total*100)+'%':'0%',cx,cy+2);x.fillStyle='#718096';x.font='10px system-ui';x.fillText('casual riders',cx,cy+18)}
function render(){let arr=filtered(),total=arr.reduce((s,d)=>s+d.trips,0),cas=arr.reduce((s,d)=>s+d.casual,0),reg=arr.reduce((s,d)=>s+d.registered,0);$('heroTrips').textContent=fmt(total);$('heroSub').textContent=`${arr.length.toLocaleString()} records match these filters`;$('kpiTrips').textContent=fmt(total);$('kpiTripsSub').textContent=`${arr.length} records selected`;$('kpiDuration').textContent=avg(arr,'duration').toFixed(1)+' min';
let hours=Array.from({length:24},(_,hour)=>({label:hour+':00',value:arr.filter(d=>d.hour===hour).reduce((s,d)=>s+metric(d),0),trips:arr.filter(d=>d.hour===hour).reduce((s,d)=>s+d.trips,0)}));
let peak=hours.reduce((a,b)=>b.trips>a.trips?b:a,hours[0]);$('kpiHour').textContent=peak.label;$('kpiHourSub').textContent=`${fmt(peak.trips)} trips in peak hour`;$('heroDelta').textContent=arr.length?`Peak hour: ${peak.label} · ${peak.trips.toLocaleString()} trips`:'No matching records';
let wc=weathers.map(w=>({label:w,value:arr.filter(d=>d.weather===w).reduce((s,d)=>s+d.trips,0)})).sort((a,b)=>b.value-a.value);$('kpiWeather').textContent=wc[0]?.value?wc[0].label:'—';$('kpiWeatherSub').textContent=wc[0]?.value?`${fmt(wc[0].value)} trips in this condition`:'No data';
drawBars('hourChart',hours,$('metricFilter').value==='duration'?'#13b8a6':'#3768f5');
let seas=aggregate(arr,'season',seasons);drawBars('seasonChart',seas,'#8b5cf6');
let wa=weathers.map(w=>({label:w,trips:arr.filter(d=>d.weather===w).reduce((s,d)=>s+d.trips,0),casual:arr.filter(d=>d.weather===w).reduce((s,d)=>s+d.casual,0)}));drawWeather('weatherChart',wa);drawDonut('riderChart',reg,cas);
let seasonTop=seas.slice().sort((a,b)=>b.trips-a.trips)[0];$('hourInsight').innerHTML=`<b>${peak.label} is the busiest hour</b> in this selection. Compare weekday and weekend patterns with the Day type dropdown.`;$('seasonInsight').innerHTML=`<b>${seasonTop?.label||'—'}</b> leads by trip volume in the current selection. Seasonal differences may reflect weather and riding comfort.`;
let clear=wa.find(d=>d.label==='Clear'),rain=wa.find(d=>d.label==='Rain');$('weatherInsight').innerHTML=clear&&rain?`<b>${clear.trips>=rain.trips?'Clear':'Rainy'} conditions</b> show ${clear.trips>=rain.trips?'higher':'lower'} trip volume than the other in this demo. This is association, not proof of causation.`:'Select multiple weather conditions to compare demand.';$('riderInsight').innerHTML=`<b>${total?Math.round(reg/total*100):0}% registered</b> and <b>${total?Math.round(cas/total*100):0}% casual</b> rider trips in the current selection.`;
let combos={};arr.forEach(d=>{let k=d.season+'|'+d.day_type+'|'+d.weather;if(!combos[k])combos[k]={season:d.season,day:d.day_type,weather:d.weather,trips:0,dur:0,n:0};combos[k].trips+=d.trips;combos[k].dur+=d.duration;combos[k].n++});
let rows=Object.values(combos).sort((a,b)=>b.trips-a.trips).slice(0,6);$('snapshotBody').innerHTML=rows.length?rows.map(r=>`<tr><td>${r.season}</td><td>${r.day}</td><td>${r.weather}</td><td><b>${fmt(r.trips)}</b></td><td>${(r.dur/r.n).toFixed(1)} min</td></tr>`).join(''):'<tr><td colspan="5">No rows match the selected filters.</td></tr>';if(!arr.length){$('headline').textContent='No records match the selected filters.';$('summary').textContent='Reset filters or choose another combination to explore demand.'}else{$('headline').textContent=`${peak.label} is the busiest hour; ${seasonTop.label.toLowerCase()} leads seasonal demand.`;$('summary').textContent=`Across ${fmt(total)} generated trips in the current selection, demand varies by time, season and weather. Use this as a hypothesis to test against real bike-share data.`}}
function parseCSV(text){let lines=text.trim().split(/\r?\n/);
  let headers=lines.shift().split(',').map(s=>s.trim().toLowerCase());
  let required=['season','day_type','weather','hour','trips','casual','registered','duration'];
  let missing=required.filter(h=>!headers.includes(h));if(missing.length)throw new Error('Missing columns: '+missing.join(', '));return lines.filter(Boolean).map(line=>{let cells=line.split(',');
    let row={};headers.forEach((h,i)=>row[h]=cells[i]?.trim());return {season:row.season,day_type:row.day_type,weather:row.weather,hour:Number(row.hour),trips:Number(row.trips),casual:Number(row.casual),registered:Number(row.registered),duration:Number(row.duration)}}).filter(d=>seasons.includes(d.season)&&['Weekday','Weekend'].includes(d.day_type)&&weathers.includes(d.weather)&&[d.hour,d.trips,d.casual,d.registered,d.duration].every(Number.isFinite))}
$('applyBtn').onclick=render;$('resetBtn').onclick=()=>{['seasonFilter','dayFilter','weatherFilter'].forEach(id=>$(id).value='All');$('metricFilter').value='trips';render()};['seasonFilter','dayFilter','weatherFilter','metricFilter'].forEach(id=>$(id).addEventListener('change',render));$('sampleBtn').onclick=()=>{seededData();$('csvFile').value='';$('uploadStatus').textContent='Sample data reloaded.';render()};$('csvFile').onchange=async e=>{let f=e.target.files[0];if(!f)return;try{let parsed=parseCSV(await f.text());if(!parsed.length)throw new Error('No valid rows found. Check categories and numeric columns.');data=parsed;$('uploadStatus').textContent=`Loaded ${parsed.length} valid records from ${f.name}.`;render()}catch(err){$('uploadStatus').textContent='CSV error: '+err.message}};$('exportBtn').onclick=()=>{let arr=filtered(),cols=['season','day_type','weather','hour','trips','casual','registered','duration'];
  let csv=[cols.join(','),...arr.map(d=>cols.map(c=>d[c]).join(','))].join('\n');
  let blob=new Blob([csv],{type:'text/csv'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='urbanpulse-filtered-data.csv';a.click();URL.revokeObjectURL(url)};window.addEventListener('resize',render);seededData();render();