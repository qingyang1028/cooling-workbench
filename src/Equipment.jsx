import React,{useLayoutEffect,useRef,useState} from 'react';
import {CloseButton,DeviceNode,Icon,ModuleHeader,SeverityLabel} from './ConsoleUI';
import {Popover} from 'antd';
import {slots,racks} from './scenario';
import {alertMessage, useTranslation} from './locale';

function RackHardware() {
  return <svg aria-hidden="true" viewBox="0 0 80 68" className="hardware">
    <path d="m4 55 27 10 45-17-29-10z" fill="var(--hardware-shadow)"/>
    <g><path d="m9 16 26 7 32-13-26-7z" fill="var(--node-top)"/><path d="m9 16 26 7v37L9 52z" fill="var(--node-front)"/><path d="m35 23 32-13v37L35 60z" fill="var(--node-side)"/>
    {[0,1,2,3,4,5].map(i=><g key={i}><path d={'M12 '+(21+i*5)+'l20 5'} stroke="currentColor"/><path d={'M14 '+(22+i*5)+'l2 .5'} stroke="currentColor"/></g>)}
    {[0,1,2,3,4,5,6,7].map(i=><path key={i} d={'M'+(39+i*3.5)+' '+(24-i*1.4)+'v28'} stroke="var(--node-fin)" strokeWidth=".8"/>)}</g>
  </svg>;
}
function RackGpuWindow({data,rack,gpu,onClose,onSelectGpu}) {
 const t=useTranslation();
 return <div className="gpu-window" id={'gpu-window-'+rack} role="dialog" aria-label={t('rackSlots',{rack})}
      onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();onClose()}}}>
      <header><strong>{t('rackSlotsTitle',{rack})}</strong>
       <CloseButton autoFocus onClick={onClose}/></header>
      <div className="slots">{slots.map(slot=>{
        const deviceId=rack+'-'+slot, hot=data.devices.has(deviceId);
        return <DeviceNode key={slot} kind="slot" status={hot?'warning':'normal'} selected={gpu===deviceId}
         aria-label={t('viewDevice',{device:deviceId})} aria-controls="investigation-panel"
         onClick={()=>onSelectGpu(deviceId)}>{hot?<SeverityLabel level="warning" label={slot}/>:slot}</DeviceNode>;
       })}</div>
     </div>;
}

export function Equipment({data,selection,select}){
 const t=useTranslation();
 const {loop,rack,gpu}=selection;
 const ref=useRef(null), [columns,setColumns]=useState(10);
 useLayoutEffect(()=>{
  const update=()=>{const w=ref.current.clientWidth;setColumns(w>=850?10:w>=490?5:2)};
  update(); const observer=new ResizeObserver(update);observer.observe(ref.current);return ()=>observer.disconnect();
 },[]);
 const openRack=selection.slotsClosed?null:rack;
 function closeRack(id,restoreFocus=false) {
  select(current=>current.rack===id?{...current,slotsClosed:true}:current);
  if(restoreFocus) ref.current.querySelector('#rack-'+id)?.focus({preventScroll:true});
 }
 return <section className="panel equipment" ref={ref}><ModuleHeader icon="topology" eyebrow={t('topology')} title={t('topologyTitle')}><span>{t('equipmentCount')}</span></ModuleHeader>
 {[1,2,3,4].map(n=>{
  const members=racks.slice((n-1)*10,n*10),rows=[];
  for(let i=0;i<10;i+=columns)rows.push(members.slice(i,i+columns));
  return <div className={'lane '+(n===3?'incident-lane':'')} key={n}>
   <DeviceNode kind="loop" status={n===3?'critical':'normal'} selected={loop===n&&!rack} onClick={()=>select({loop:n})} aria-label={t('viewLoop',{loop:n})}>
    <Icon name="snowflake"/>
    <span className="loop-label">
     <strong>{t('loop',{loop:n})}</strong>
     <small>{t(n===3?'stopped':'racksPerLoop')}</small>
    </span>
   </DeviceNode>
   <div className="rack-groups">{rows.map((row,index)=><div className="rack-row" key={row[0]} style={{'--cols':columns}}>
    <div className="pipe" aria-hidden="true">
     {n!==3&&index===0&&[0,1,2,3].map(dot=><span className="flow-dot" key={dot} style={{'--delay':-dot*2.25+'s'}}/>)}
    </div>
    {row.map(id=>{
    const devices=slots.map(slot=>data.devices.get(id+'-'+slot)).filter(Boolean);
    const count=devices.length;
    const tooHot=devices.some(device=>device.heat?.temperature>=85);
    const fanReminder = data.fanReminders.get(id);
    const open=openRack===id;
    return <Popover key={id} open={open} trigger="click" placement="bottom" destroyOnHidden
     color="var(--surface-overlay)" styles={{container:{border:'var(--stroke) solid var(--line)'}}}
     onOpenChange={next=>next?select(current=>current.rack===id?{...current,slotsClosed:false}:{loop:n,rack:id}):closeRack(id)}
     content={<RackGpuWindow data={data} rack={id} gpu={rack===id?gpu:undefined}
      onClose={()=>closeRack(id,true)} onSelectGpu={device=>select({loop:n,rack:id,gpu:device})}/>}>
     <DeviceNode id={'rack-'+id} kind="rack" status={tooHot?'overheat':count?'warning':'normal'} selected={rack===id}
      aria-expanded={open} aria-haspopup="dialog" aria-controls={open?'gpu-window-'+id:undefined}
      aria-label={t('rackAlertsLabel',{rack:id,count})+(fanReminder?t('listSeparator')+alertMessage(t,fanReminder):'')}>
      <RackHardware/><b>{id}</b><small>{count?<SeverityLabel level="warning" label={count+'/30'}/>:t('gpusPerRack')}</small>
      {fanReminder && <small title={fanReminder.device+' · '+alertMessage(t,fanReminder)}><SeverityLabel level="info" label={t('fanFullSpeed')}/></small>}
     </DeviceNode>
    </Popover>;
   })}</div>)}</div>
  </div>;
 })}
 <footer className="topology-legend" aria-label={t('alertLegend')}>
  <SeverityLabel level="critical"/><SeverityLabel level="warning"/><SeverityLabel level="info"/>
 </footer></section>;
}
