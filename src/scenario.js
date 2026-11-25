// Seconds from the pump failure at 02:40:00.
export function clock(offset, seconds = true) {
  const total = 9600 + offset;
  const parts = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60];
  return parts.slice(0, seconds ? 3 : 2).map(n => String(n).padStart(2, '0')).join(':');
}
export const moments = [0, 180, 300, 600, 720, 1560];
export const slots = Array.from({length:30}, (_,i) => 'G'+String(i+1).padStart(2,'0'));
export const racks = Array.from({length:40}, (_,i) => 'R'+String(i+1).padStart(2,'0'));
export const loopFor = rack => Math.ceil(Number(rack.slice(1))/10);
const records = [];
function add(at, device, location, kind, supplied = false, temperature = null, {severity = kind === 'pump' ? 'critical' : 'warning', verification = null} = {}) {
  records.push({id:records.length+1, at, device, location, kind, supplied, temperature, severity, verification});
}
add(0,'P3',3,'pump',true);
add(130,'R21-G01','R21','heat',true,86);
add(150,'R22-G01','R22','heat',true,87);
add(180,'R21-G01','R21','slow',true);
add(240,'SW-A',null,'network',true,null,{verification:'pending'});
add(255,'SW-B',null,'network',true,null,{verification:'pending'});

// Repeated warnings are possible. Each pass revisits 180 distinct GPUs.
for (let i=0;i<298;i++) {
  const rack=racks[20+(i%10)];
  const slotIndex = (Math.floor(i/10) % 18) + (i%10 < 2 ? 1 : 0);
  const device=rack+'-'+slots[slotIndex];
  const temperature=85+((i*7)%11);
  add(260+Math.floor(i*460/297),device,rack,'heat',false,temperature);
}
for(let i=0;i<16;i++){
  const rack=racks[20+i%10];
  add(300+i*16,rack+'-'+slots[Math.floor(i/10)+(i%10 < 2 ? 1 : 0)],rack,'slow');
}
// Prototype rule: issue one alert at the fifth distinct hot GPU in a rack.
// With no recovery in this scenario, repeat once after five minutes at full speed.
const hotDevicesByRack = new Map();
const temperatureEvents = records.filter(row => row.kind === 'heat').sort((a,b) => a.at-b.at);
for (const row of temperatureEvents) {
  const hotDevices = hotDevicesByRack.get(row.location) ?? new Set();
  hotDevicesByRack.set(row.location, hotDevices);
  if (hotDevices.has(row.device)) continue;
  hotDevices.add(row.device);
  if (hotDevices.size === 5) {
    const fan = 'FAN-' + row.location;
    add(row.at, fan, row.location, 'fan');
    if (row.at + 300 <= 720)
      add(row.at + 300, fan, row.location, 'fan', false, null, {severity:'info'});
  }
}
export const alerts=records.sort((a,b)=>a.at-b.at || a.id-b.id);
export function snapshot(at){
  const visible=alerts.filter(row=>row.at<=at);
  const devices=new Map();
  const fanReminders = new Map();
  for(const row of visible){
    if (row.kind === 'fan' && row.severity === 'info') fanReminders.set(row.location, row);
    if(!row.device.includes('-G'))continue;
    const device=devices.get(row.device)??{};
    if(row.kind==='heat')device.heat=row;
    if(row.kind==='slow')device.slow=row;
    devices.set(row.device,device);
  }
  return {visible,devices,fanReminders};
}
