import React from 'react';
import {Button,Progress} from 'antd';
import {ModuleHeader,SeverityLabel} from './ConsoleUI';
import {clock,racks} from './scenario';
import {alertLocation, alertMessage, useTranslation} from './locale';
import pumpImage from './assets/coolant-pump.webp';
import gpuImage from './assets/gpu.webp';
import cabinetImage from './assets/rack-cabinet.webp';
import networkSwitchImage from './assets/network-switch.webp';

function InspectorHeader({type, title, context, image, alt}) {
 const t=useTranslation();
 return <>
  <ModuleHeader icon="inspect" eyebrow={type} title={t('investigation')}/>
  <div className="inspector-hero">
   <div className="inspector-identity"><h3>{title}</h3><p>{context}</p></div>
   <div className="inspector-art"><img src={image} alt={alt}/></div>
  </div>
 </>;
}

function Dial({title,value,min=0,max,unit,fault=false}){
 const caption=value+' '+unit;
 return <div className={fault?"dial dial-fault":"dial"}><b>{title}</b><div className="meter"><Progress type="dashboard" percent={(value-min)/(max-min)*100} size={100} strokeWidth={7} strokeColor="var(--dial-accent)" railColor="var(--dial-rail)" gapDegree={65} format={()=> <span className="reading">{value}<small>{unit}</small></span>} aria-label={title+' '+caption}/></div><small>{min}–{max} {unit}</small></div>;
}
function Evidence({items}) {
 const t=useTranslation();
 return <ol className="evidence">{items.map(row=>
  <li key={row.id} className={row.severity==='critical'?'critical':''}>
   <time>{clock(row.at)}</time><strong>{row.device}</strong><SeverityLabel level={row.severity}/>
   <p>{alertMessage(t,row)}</p>
  </li>
 )}</ol>;
}
function GpuDetail({data,loop,rack,gpu,onBack}) {
 const t=useTranslation();
 const device=data.devices.get(gpu);
 const index=Number(gpu.slice(-2))+Number(rack.slice(1));
 const temp=device?.heat?.temperature??(61+index%9);
 const speed=device?.slow?150+index%50:345+index%60;
 return <>
  <InspectorHeader type={t('gpuDetails')} title={gpu} context={t('gpuLocation',{loop,rack,slot:gpu.slice(-3)})}
   image={gpuImage} alt={t('gpuAlt')}/>
  <div className="inspector-body">
   <div className="dials">
    <Dial title={t('gpuTemperature')} value={temp} min={1} max={100} unit="°C" fault={temp>=85}/>
    <Dial title={t('throughput')} value={speed} max={500} unit={t('samplesPerSecond')} fault={speed<250}/>
   </div>
   <h3>{t('deviceEvidence')}</h3>
   {device?<Evidence items={[device.heat,device.slow].filter(Boolean)}/>:<p>{t('noGpuAlerts')}</p>}
   <Button className="gpu-back" onClick={onBack}>{t('backToRack')}</Button>
  </div>
 </>;
}

export function Inspector({at,data,selection,select,mark,marked}){
 const t=useTranslation();
 const {loop,rack,gpu}=selection, pump=data.visible[0];
 if (selection.switchDevice) {
  const records = data.visible.filter(row => row.kind === 'network' && row.device === selection.switchDevice);
  const latest = records.at(-1);
  if (latest) return <aside id="investigation-panel" className="panel inspector" tabIndex={-1} aria-label={t('switchDetailsLabel',{device:latest.device})}>
   <InspectorHeader type={t('switchDetails')} title={latest.device} context={alertLocation(t,latest)}
    image={networkSwitchImage} alt={t('switchAlt')}/>
   <div className="inspector-body">
    <dl className="switch-facts">
     <dt>{t('alertSeverity')}</dt><dd><SeverityLabel level={latest.severity}/></dd>
     <dt>{t('coolingLink')}</dt><dd>{t(latest.verification==='pending'?'unconfirmed':'notRecorded')}</dd>
    </dl>
    <h3>{t('originalAlerts')}</h3><Evidence items={records}/>
    <Button onClick={()=>select({})}>{t('backToOverview')}</Button>
   </div>
  </aside>;
 }
 if (gpu) return <aside id="investigation-panel" className="panel inspector" aria-label={t('gpuDetailsLabel',{gpu})}>
  <GpuDetail data={data} loop={loop} rack={rack} gpu={gpu} onBack={()=>select({...selection,gpu:undefined})}/>
 </aside>;
 const firstHeat=data.visible.find(r=>r.kind==='heat'),secondHeat=data.visible.find(r=>r.kind==='heat'&&r.location!==firstHeat?.location);
 const local=data.visible.filter(r=>r.location===rack);
 const fanReminder=data.fanReminders.get(rack);
 const headings=t(rack?'rackDetails':loop?'loopDetails':'overview');
 const confirmed=at===1560, suspect=!!firstHeat;
 const title=rack?t('rackTitle',{rack}):loop?t('loopTitle',{loop}):t(confirmed?'confirmedTitle':suspect?'suspectTitle':'initialTitle');
 const loop3=loop===3;
 let context = t('pumpLocation');
 if (rack) context = t('rackLocation',{loop});
 else if (loop) context = t('loopLocation',{start:racks[(loop-1)*10],end:racks[loop*10-1]});
 return <aside id="investigation-panel" className="panel inspector">
  <InspectorHeader type={headings} title={title} context={context}
   image={rack?cabinetImage:pumpImage}
   alt={t(rack?'rackAlt':'pumpAlt')}/>
  <div className="inspector-body">
 {rack?<><h3>{t('rackAlerts')}</h3><div className="big-value">{local.length}<small>{t(local.length===1?'alertUnitOne':'alertUnit')}</small></div><Evidence items={local.slice(0,2)}/>
 {fanReminder && <><h3><SeverityLabel level="info" label={t('fanAdvisory')}/></h3><Evidence items={[fanReminder]}/></>}
 <Button onClick={()=>select({...selection,gpu:local.find(r=>r.device.includes('-G'))?.device??rack+'-G01'})}>{t('viewGpuEvidence')}</Button></>:
 loop?<><div className="dials"><Dial title={t('pumpSpeed')} value={loop3?0:2780+loop*18} max={3600} unit="rpm" fault={loop3}/><Dial title={t('coolantFlow')} value={loop3?0:385+loop*16} max={600} unit="L/min" fault={loop3}/></div><h3>{t('loopEvidence')}</h3>{loop3?<Evidence items={[pump,firstHeat].filter(Boolean)}/>:<p>{t('noLoopAlerts')}</p>}</>:
 <><p>{t(confirmed?'confirmedBody':suspect?'suspectBody':'initialBody')}</p><h3>{t(confirmed?'reviewEvidence':'currentEvidence')}</h3><Evidence items={[pump,firstHeat,secondHeat].filter(Boolean)}/><Button onClick={()=>select({loop:3})}>{t('viewLoopGauges')}</Button></>}
 {(!loop||loop3)&&<div className="decision">{marked?<b className="lime">{t('marked',{time:clock(marked.at,false)})}</b>:<Button type="primary" block onClick={mark}>{t('markAction')}</Button>}<small>{t('simulatedAction')}</small></div>}
 </div></aside>;
}
