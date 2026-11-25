import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Avatar,ConfigProvider,Select} from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import {moments,clock,snapshot} from './scenario';
import {Equipment} from './Equipment';
import {Inspector} from './Inspector';
import {AlertLog} from './AlertLog';
import operatorAvatar from './assets/operator-avatar.jpg';
import {ConsoleModal, SeverityCard, SwitchLink} from './ConsoleUI';
import {consoleTheme} from './consoleTheme';
import {LocaleContext, useTranslation} from './locale';
import './tokens.css';
import './style.css';

const snapshotOptions = moments.map(value => ({value, label:clock(value,false)}));
const languageOptions = [{value:'zh',label:'中文'},{value:'en',label:'English'}];
const dataNotes = ['noteRecords','noteFans','noteSnapshots','noteGauges','noteReadings','noteSeverities'];

function Workbench({language,onLanguageChange}){
 const t=useTranslation();
 useEffect(()=>{
  document.documentElement.lang=language==='en'?'en':'zh-CN';
  document.title=t('monitoring')+' · Command Center';
 },[language,t]);
 const [at,setAt]=useState(moments[0]),[selection,select]=useState({}),[marked,setMarked]=useState(null),[dialog,setDialog]=useState(null);
 useEffect(()=>{
  function returnToOverview(event) {
   const target=event.target;
   if (!(target instanceof Element)) return;
   if (target.closest('button, a, input, select, textarea, [role="button"], [role="combobox"], .ant-select-dropdown, .ant-modal-root, .ant-popover, .inspector, .log, .alert-cards, .brandbar, .snapshot-control')) return;
   select({});
  }
  document.addEventListener('click',returnToOverview);
  return ()=>document.removeEventListener('click',returnToOverview);
 },[]);
 const data=snapshot(at);
 const counts={critical:0,warning:0,info:0};
 for(const alert of data.visible) counts[alert.severity]++;
 const heatCount=data.visible.filter(alert=>alert.kind==='heat').length;
 const pendingSwitches=[...new Set(data.visible
  .filter(alert=>alert.severity==='warning'&&alert.kind==='network'&&alert.verification==='pending')
  .map(alert=>alert.device))];
 function openSwitch(device) {
  select({switchDevice: device});
  requestAnimationFrame(() => {
   const panel = document.getElementById('investigation-panel');
   panel.focus({preventScroll: true});
   panel.scrollIntoView({block: 'nearest'});
  });
 }
 function changeSnapshot(next) {
  if (selection.switchDevice && !data.visible.some(row =>
   row.kind === 'network' && row.device === selection.switchDevice && row.at <= next)) {
   select({});
  }
  setAt(next);
 }
 const alertCards=[
  {id:'critical',description:t('pumpSummary')},
  {id:'warning',description:t(heatCount===1?'heatCountOne':'heatCount',{count:heatCount})},
  {id:'info',description:t(counts.info?'fanReminder':'noAdvisories')}
 ];
 const visibleMark=marked&&marked.at<=at?marked:null;
 return <><header className="brandbar">
  <div className="brand"><i/>{t('brand')}</div><span>{t('commandCenter')}</span>
  <div className="duty">
   <Select className="language-control" size="small" aria-label={t('language')} value={language}
    options={languageOptions} onChange={onLanguageChange} popupMatchSelectWidth={false}/>
   <button className="about" onClick={()=>setDialog('data')}>{t('dataNotes')}</button>
   <Avatar size={36} src={operatorAvatar} alt={t('engineerAlt')}/><div><b>Ana</b><small>{t('engineer')}</small></div>
  </div>
 </header><main>
 <div className="heading">
  <h1>{t('monitoring')}</h1>
  <div className="snapshot-control"><span>{t('snapshot')}</span><Select size="small" aria-label={t('snapshot')} options={snapshotOptions} value={at} onChange={changeSnapshot}/></div>
 </div>
 <section className="alert-cards" aria-label={t('alertSummary')}>
  {alertCards.map(({id,description})=><SeverityCard key={id} level={id} count={counts[id]} description={description}>
    {id==='warning'&&pendingSwitches.length>0&&<small className="switch-verification">{pendingSwitches.map((device, index) =>
      <React.Fragment key={device}>{index > 0 && t('listSeparator')}<SwitchLink device={device} onOpen={openSwitch}/></React.Fragment>)}{t('switchSummary')}</small>}
  </SeverityCard>)}
 </section>
 <div className="layout">
 {at===1560&&<div className="review">{t('reviewBanner')}</div>}
 <Equipment {...{data,selection,select}}/><Inspector {...{at,data,selection,select}} marked={visibleMark} mark={()=>setDialog('mark')}/></div>
 <AlertLog at={at} rows={data.visible} onOpenSwitch={openSwitch}/>
 </main><ConsoleModal open={dialog!==null} title={t(dialog==='mark'?'markTitle':'dataScope')} onCancel={()=>setDialog(null)} confirmText={t('confirmMark')} onConfirm={dialog==='mark'?()=>{setMarked({at});setDialog(null)}:undefined}>
 {dialog==='mark'?<p>{t('markBody',{time:clock(at,false)})}</p>:dataNotes.map(key=><p key={key}>{t(key)}</p>)}
 </ConsoleModal></>;
}

const languageStorageKey = 'cooling-workbench-language';
const theme = consoleTheme();

function initialLanguage() {
 const requested=new URLSearchParams(window.location.search).get('lang');
 if (requested==='en'||requested==='zh') return requested;
 return window.localStorage.getItem(languageStorageKey)==='en'?'en':'zh';
}

function App() {
 const [language,setLanguage]=useState(initialLanguage);
 function changeLanguage(next) {
  setLanguage(next);
  window.localStorage.setItem(languageStorageKey,next);
  const url=new URL(window.location.href);
  url.searchParams.set('lang',next);
  window.history.replaceState(window.history.state,'',url);
 }
 return <ConfigProvider locale={language==='en'?enUS:zhCN} theme={theme}>
  <LocaleContext.Provider value={language}>
   <Workbench language={language} onLanguageChange={changeLanguage}/>
  </LocaleContext.Provider>
 </ConfigProvider>;
}

createRoot(document.getElementById('cooling-lanes')).render(<App/>);
