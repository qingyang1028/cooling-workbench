import React, {useState} from 'react';
import {Pagination, Select} from 'antd';
import {clock} from './scenario';
import {alertLocation, alertMessage, useTranslation} from './locale';

import {levels, ModuleHeader, SeverityLabel, SwitchLink} from './ConsoleUI';

const alertTypes = {all:'all',pump:'typePump',fan:'typeFan',heat:'typeHeat',slow:'typeSlow',network:'typeNetwork'};
const columns = ['time','device','location','severity','message','source'];

function AlertTable({rows,onOpenSwitch}){
 const t=useTranslation();
 const [page,setPage]=useState(1);
 const pinned=rows.filter(row=>row.severity==='critical');
 const rest=rows.filter(row=>row.severity!=='critical').reverse();
 const size=Math.max(1,10-pinned.length);
 const visible=rest.slice((page-1)*size,page*size);
 return <>
  <div className="table-wrap"><table>
   <thead><tr>{columns.map(column=><th key={column}>{t(column)}</th>)}</tr></thead>
   <tbody>{[...pinned,...visible].map(row=>{
    const critical=row.severity==='critical';
    return <tr key={row.id} className={critical?'pinned':''}>
     <td>{critical&&<span className="pin">{t('pinned')}</span>}{clock(row.at)}</td>
     <td>{row.kind==='network'?<SwitchLink device={row.device} onOpen={onOpenSwitch}/>:row.device}</td><td>{alertLocation(t,row)}</td>
     <td><SeverityLabel level={row.severity}/></td>
     <td>{alertMessage(t,row)}{row.verification==='pending'&&<span className="verification-tag">{t('linkUnconfirmed')}</span>}</td>
     <td>{t(row.supplied?'supplied':'simulated')}</td>
    </tr>;
   })}{rows.length===0&&<tr><td colSpan={columns.length}>{t('noMatchingAlerts')}</td></tr>}</tbody>
  </table></div>
  <Pagination aria-label={t('alertPagination')} current={page} total={rest.length} pageSize={size} onChange={setPage} showSizeChanger={false} hideOnSinglePage={false}/>
 </>;
}

export function AlertLog({at,rows,onOpenSwitch}){
 const t=useTranslation();
 const severityOptions=['all',...levels].map(value=>({value,label:t(value)}));
 const typeOptions=Object.entries(alertTypes).map(([value,key])=>({value,label:t(key)}));
 const [severity,setSeverity]=useState('all');
 const [kind,setKind]=useState('all');
 const filtered=rows.filter(row=>(severity==='all'||row.severity===severity)&&(kind==='all'||row.kind===kind));
 return <section className="panel log">
  <ModuleHeader icon="log" eyebrow={t('sourceRecords')} title={t('alerts')} count={filtered.length}>
   <div className="alert-filters">
    <div><span>{t('severity')}</span><Select size="small" aria-label={t('alertSeverity')} value={severity} options={severityOptions} onChange={setSeverity}/></div>
    <div><span>{t('type')}</span><Select size="small" aria-label={t('alertType')} value={kind} options={typeOptions} onChange={setKind}/></div>
   </div>
  </ModuleHeader>
  <AlertTable key={at+':'+severity+':'+kind} rows={filtered} onOpenSwitch={onOpenSwitch}/>
 </section>;
}
