import {TEST_MODE,SLOTS,PARTS,PART_BY_ID,STARTER,MISSIONS,MATERIALS,FUEL_TYPES,SUPPLIES,newCareer,safeLoad,getPerformance,computeLanding,starterCost,affordability,formatNum,randomEvents} from './physics.mjs';
import {SpaceRenderer} from './renderer.mjs';
import {getLanguage,setLanguage,localizeTree,watchTranslations} from './i18n.mjs';
import {guideHTML} from './guide.mjs';

const $=id=>document.getElementById(id);
const money=n=>formatNum(n);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stored=(()=>{try{return localStorage.getItem('orbital-forge-career-v1')}catch{return null}})();
let state=safeLoad(stored),activeTab='build',shopSlot='all',guideTopic='engine',flight=null,speedFactor=1,showHint=false;
let reportModal=null,lastTime=0,lastUI=0,logs=[{time:'00:00',type:'green',text:'Центр управления готов. Выберите модули и цель экспедиции.'}];
const renderer=new SpaceRenderer($('scene'),$('engine-canvas'));

function save(){try{localStorage.setItem('orbital-forge-career-v1',JSON.stringify(state));}catch{}}
function log(message,type='green'){
  const n=flight?Math.round(flight.elapsed):0,t=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  logs.unshift({time:t,type,text:message});logs=logs.slice(0,20);renderLogs();
}
function renderLogs(){ $('log-entries').innerHTML=logs.map(x=>`<div class="log-row"><time>${x.time}</time><span class="log-${x.type}">●</span><span>${esc(x.text)}</span></div>`).join(''); }
function toast(message,error=false){const el=document.createElement('div');el.className='toast'+(error?' error':'');el.textContent=message;$('toast-root').append(el);setTimeout(()=>el.remove(),3400);}
function chooseTab(tab){activeTab=tab;document.querySelectorAll('.tab').forEach(b=>{const a=b.dataset.tab===tab;b.classList.toggle('active',a);b.setAttribute('aria-selected',a)});renderPanel();$('panel-content').scrollTop=0;}
function selectMission(id){if(flight){toast('Нельзя сменить цель во время полёта',true);return;}if(!MISSIONS[id])return;state.mission=id;save();document.querySelectorAll('.dest').forEach(b=>b.classList.toggle('active',b.dataset.mission===id));log(`Выбрана цель: ${MISSIONS[id].name}. Дистанция ${MISSIONS[id].distance}.`);renderAll();}
function readiness(){const perf=getPerformance(state),missing=SLOTS.filter(s=>!state.equipped[s.id]);let error='';if(missing.length)error=`Не установлено модулей: ${missing.length}`;else if(!perf.compatible)error='Топливо не подходит двигателю';else if(state.fuel<1000)error='Заправь ракету';else if(state.condition<45)error='Корпус требует ремонта';else if(perf.twr<1)error='Недостаточная тяга для старта';return {perf,error,missing};}
function renderHeader(){
  $('credits').textContent=TEST_MODE?'∞':money(state.credits);
  for(const key of Object.keys(MATERIALS))$('res-'+key).textContent=TEST_MODE?'∞':money(state.resources[key]||0);
  $('res-fuel').textContent=`${money(state.fuel)} кг`;
  $('res-fuel-type').textContent=(FUEL_TYPES[state.fuelType]||FUEL_TYPES.kerolox).short;
  document.querySelectorAll('.dest').forEach(b=>{b.classList.toggle('active',b.dataset.mission===state.mission);b.disabled=!!flight;});
}
function renderReady(){
  const {perf,error,missing}=readiness();const count=6-missing.length;
  $('ready-indicator').classList.toggle('ready',!error);
  $('ready-counter').textContent=`${count} / 6`;
  $('ready-text').textContent=flight?'Полетное управление активно':error||'Готово к старту';
  const button=$('launch-button');button.disabled=!!error||!!flight;
  button.classList.toggle('running',!!flight);
  button.querySelector('span').textContent=flight?'МИССИЯ В ПРОЦЕССЕ':'НАЧАТЬ МИССИЮ';
}
function renderTelemetry(){
  const perf=getPerformance(flight?{...state,fuel:Math.max(0,flight.fuel)}:state),mission=MISSIONS[state.mission];
  $('res-fuel').textContent=`${money(flight?Math.max(0,flight.fuel):state.fuel)} кг`;
  $('tele-dv').innerHTML=`${perf.deltaV.toFixed(2)} <small>км/с</small>`;
  $('tele-mass').innerHTML=`${(flight?perf.dryMass+flight.fuel/1000:perf.wetMass).toFixed(1)} <small>т</small>`;
  $('bar-dv').style.width=`${Math.min(100,perf.deltaV/mission.requiredDv*100)}%`;
  const heat=flight?flight.heat:20,condition=flight?flight.condition:state.condition;
  $('tele-heat').innerHTML=`${Math.round(heat)} <small>°C</small>`;
  $('heat-status').textContent=flight?.icing?'ОБЛЕДЕНЕНИЕ':perf.thermal&&heat>perf.thermal?'ПРЕВЫШЕН ЛИМИТ':heat>620?'ПОВЫШЕННЫЙ НАГРЕВ':'НОРМА';
  $('heat-status').style.color=perf.thermal&&heat>perf.thermal?'#ff756e':heat>620?'#fac575':'#709080';
  $('tele-integrity').innerHTML=`${Math.round(condition)} <small>%</small>`;
  $('integrity-status').textContent=condition<45?'ТРЕБУЕТСЯ РЕМОНТ':condition<78?'ПОВРЕЖДЕНИЯ':'СИСТЕМЫ ГОТОВЫ';
  $('integrity-status').style.color=condition<45?'#ff756e':condition<78?'#fac575':'#709080';
}
function renderTimeline(){
  const p=flight?.progress??0;const step=p<.12?0:p<.27?1:p<.79?2:p<.97?3:4;
  document.querySelectorAll('.timeline-step').forEach((el,i)=>{el.classList.toggle('active',i===step);el.classList.toggle('complete',i<step);});
  $('mission-timeline-caption').textContent=flight?`T+ ${timeString(flight.elapsed)} · ${Math.round(p*100)}%`:'ГОТОВНОСТЬ К ЗАПУСКУ';
}
function renderSceneUI(){
  const mission=MISSIONS[state.mission];
  $('scene-overlay-left').classList.toggle('hidden',!!flight);
  $('flight-overlay').classList.toggle('hidden',!flight);
  $('live-badge').textContent=flight?'● ПРЯМОЙ ЭФИР':'● В АНГАРЕ';
  $('live-badge').classList.toggle('inflight',!!flight);
  $('stage-label').textContent=flight?`ПЕРЕЛЁТ / ${mission.latin}`:'3D КОНСТРУКТОР';
  if(flight){
    const traveled=(mission.id==='moon'?384400:225000000)*flight.progress;
    $('flight-distance').textContent=mission.id==='moon'?`${money(traveled)} км`:`${(traveled/1000000).toFixed(1)} млн км`;
    $('flight-progress-bar').style.width=`${Math.max(0,flight.progress*100)}%`;
    $('flight-time').textContent=`T+ ${timeString(flight.elapsed)} · ${Math.round(flight.speed)} км/с`;
    $('scene-coordinate').textContent=`ПУТЬ ${Math.round(flight.progress*100)}% · ${mission.latin} TRANSFER`;
  }else{
    const count=Object.values(state.equipped).filter(Boolean).length;
    $('scene-main-title').innerHTML=`ASTRA <span>${count===6?'READY':'MK I'}</span>`;
    $('scene-subtitle').textContent=count===6?'Конфигурация собрана · Проверь расчёт посадки':`Установлено модулей: ${count} из 6`;
    $('scene-coordinate').innerHTML='X 000.00&nbsp;&nbsp; Y 000.00&nbsp;&nbsp; Z 000.00';
  }
  const engineHeat=flight?.engineHeat??20;
  $('engine-camera-temperature').textContent=`ДВИГАТЕЛЬ ${Math.round(engineHeat)}°C`;
  $('engine-cam-indicator').textContent=flight?.faulty?'FAULT':flight?'ACTIVE':'STANDBY';
  $('engine-cam-indicator').style.color=flight?.faulty?'#ff756e':flight?'#d8fa74':'#90efb7';
}
function renderAll(){renderHeader();renderReady();renderTelemetry();renderTimeline();renderSceneUI();renderPanel();configureRenderer();}
function configureRenderer(){renderer.configure({mode:flight?'flight':'build',equipped:state.equipped,mission:state.mission,
  progress:flight?.progress??0,condition:flight?.condition??state.condition,heat:flight?.heat??20,
  engineHeat:flight?.engineHeat??20,fuel:flight?.fuel??state.fuel,critical:flight?.critical||null,
  faulty:flight?.faulty||false,icing:flight?.icing||false,overheat:flight?.overheat||false,language:getLanguage()});}

function renderPanel(){
  const el=$('panel-content');
  if(activeTab==='build')el.innerHTML=buildHTML();
  if(activeTab==='plan')el.innerHTML=planHTML();
  if(activeTab==='shop')el.innerHTML=shopHTML();
  if(activeTab==='report')el.innerHTML=reportsHTML();
  if(activeTab==='guide')el.innerHTML=guideHTML({state,topic:guideTopic,language:getLanguage(),testMode:TEST_MODE});
}
function buildHTML(){
  const perf=getPerformance(state),cost=starterCost(state),mission=MISSIONS[state.mission];
  const lang=getLanguage()==='en',L=(ru,en)=>lang?en:ru;
  const engine=PART_BY_ID[state.equipped.engine],selectedFuel=FUEL_TYPES[state.fuelType]||FUEL_TYPES.kerolox;
  const requiredFuel=engine?.fuelType?FUEL_TYPES[engine.fuelType]:null;
  const fuelButtons=Object.values(FUEL_TYPES).map(f=>`<button type="button" class="fuel-type-btn ${state.fuelType===f.id?'active':''}" data-fuel-type="${f.id}" ${flight?'disabled':''} aria-pressed="${state.fuelType===f.id}"><b>${f.short}</b><small>${f.pricePer1000} CR / t</small></button>`).join('');
  const rows=SLOTS.map(slot=>{const p=PART_BY_ID[state.equipped[slot.id]];
    return `<div class="part-slot ${p?'installed':''}"><div class="slot-icon">${slot.icon}</div><div class="slot-details"><small>${slot.name.toUpperCase()}</small><b class="${p?'':'empty'}">${p?esc(p.name):'МОДУЛЬ НЕ УСТАНОВЛЕН'}</b></div><button class="slot-action" data-open-shop="${slot.id}" ${flight?'disabled':''}>${p?'ЗАМЕНА +':'ВЫБРАТЬ +'}</button></div>`;}).join('');
  return `<div class="panel-section-head"><strong>Твоя ракета</strong><span>${Object.values(state.equipped).filter(Boolean).length} / 6 МОДУЛЕЙ</span></div>
    <p class="panel-note">Выбирай и покупай детали. Купленные модули остаются в ангаре и могут использоваться снова.</p>${rows}
    <div class="inline-summary"><div class="summary-box ${perf.deltaV<mission.requiredDv?'alert':''}"><span>ТЯГОВООРУЖЁННОСТЬ</span><b>${perf.twr.toFixed(2)} <small>TWR</small></b></div><div class="summary-box ${perf.deltaV<mission.requiredDv?'alert':''}"><span>ТРЕБУЕТСЯ ΔV</span><b>${mission.requiredDv.toFixed(2)} <small>км/с</small></b></div></div>
    <div class="fuel-card"><div class="fuel-top"><strong>ТОПЛИВО / КРИОГЕННОЕ</strong><b>${money(state.fuel)} / ${money(perf.capacity)} кг</b></div><div class="fuel-bar"><span style="width:${perf.capacity?Math.min(100,state.fuel/perf.capacity*100):0}%"></span></div><div class="fuel-sub"><span>${TEST_MODE?'∞ CR · ТЕСТОВАЯ ЗАПРАВКА':selectedFuel.pricePer1000+' CR / 1 000 кг'}</span><button class="secondary-btn" data-refuel="1" ${flight||state.fuel>=perf.capacity||!perf.capacity?'disabled':''}>ЗАПРАВИТЬ +</button></div></div>
    <div class="fuel-type-panel"><div class="fuel-type-head"><strong>${L('ТИП РАКЕТНОГО ТОПЛИВА','ROCKET PROPELLANT')}</strong><small>${L('ГОРЮЧЕЕ + ОКИСЛИТЕЛЬ','FUEL + OXIDIZER')}</small></div>
      <div class="fuel-type-choices">${fuelButtons}</div>
      <p class="fuel-compatibility ${!perf.compatible?'bad':''}">${engine?(perf.compatible?`✓ ${L('Двигатель','Engine')} ${engine.name} ${L('совместим с','matches')} ${selectedFuel.short}.`:`⚠ ${L('Для','For')} ${engine.name} ${L('нужно','you need')} ${requiredFuel.short}.`):L('Выбери двигатель, чтобы проверить совместимость топлива.','Select an engine to check propellant compatibility.')}</p>
      <button type="button" class="fuel-guide-link" data-tab-link="guide" data-guide-topic="fuel">${L('КАК ОТЛИЧАЮТСЯ ТИПЫ ТОПЛИВА? →','HOW DO PROPELLANTS DIFFER? →')}</button>
    </div>
    ${!flight&&!perf.ready?`<button class="wide-outline" data-starter="1">⚡ СОБРАТЬ БАЗОВУЮ РАКЕТУ · ${TEST_MODE?'БЕСПЛАТНО':money(cost.credits)+' CR'}</button><p class="panel-note">Базовый комплект включает 6 модулей и 13 000 кг топлива. Для Марса нужны улучшения.</p>`:''}
    ${state.condition<100&&!flight?`<button class="plain-action" data-repair="1">◈ ВОССТАНОВИТЬ КОРПУС · ${TEST_MODE?'БЕСПЛАТНО':'480 CR + 8 сплавов'}</button>`:''}
    <button class="hint-button" data-tab-link="plan">РАССЧИТАТЬ МЕСТО ПОСАДКИ →</button>`;
}
function sliderHTML(key,label,value,min,max,step,unit){return `<div class="slider-field"><div class="slider-top"><label for="range-${key}">${label}</label><input aria-label="${label}" type="number" data-plan-number="${key}" value="${value}" min="${min}" max="${max}" step="${step}"></div><input aria-label="${label}" id="range-${key}" type="range" data-plan="${key}" min="${min}" max="${max}" step="${step}" value="${value}"><div class="slider-range"><span>${min} ${unit}</span><span>${max} ${unit}</span></div></div>`;}
function predictionHTML(){
  const p=computeLanding(state),perf=getPerformance(state);
  const difficulty=!perf.ready?'danger':p.landingSpeed>perf.touchdown?'danger':p.landingError>75?'warning':'good';
  const title=!perf.ready?'СНАЧАЛА СОБЕРИ РАКЕТУ':p.landingSpeed>perf.touchdown?'СЛИШКОМ ЖЁСТКАЯ ПОСАДКА':p.landingError>75?'МИМО ПОСАДОЧНОЙ ЗОНЫ':'ПРОГНОЗ: МЯГКАЯ ПОСАДКА';
  return `<div class="prediction ${difficulty==='good'?'':difficulty}"><div class="prediction-title"><span>ПРОГНОЗ ТРАЕКТОРИИ</span><span class="prediction-pill">${title}</span></div><div class="prediction-stats"><div><small>СКОРОСТЬ КАСАНИЯ</small><b>${p.landingSpeed.toFixed(1)} <small>м/с</small></b></div><div><small>ОШИБКА ЦЕЛИ</small><b>${p.landingError.toFixed(1)} <small>км</small></b></div></div><div class="plan-foot">Допуск опор: ≤ ${perf.touchdown.toFixed(1)} м/с · Площадка: ≤ 75 км · Расход торможения: ≈ ${money(p.retroFuel)} кг</div></div>`;
}
function planHTML(){const mission=MISSIONS[state.mission],p=computeLanding(state),locked=!!flight&&flight.progress>.78;
  return `<div class="panel-section-head"><strong>Расчёт посадки</strong><span>НАВИГАЦИЯ / ${mission.latin}</span></div>
  <p class="panel-note">Подбери высоту и время торможения по формуле. Прогноз обновляется сразу. Во время перелёта можно исправить план до снижения.</p>
  <div class="target-card"><div class="target-ball ${mission.id}"></div><div><small>ЗОНА ПРИЗЕМЛЕНИЯ</small><b>${mission.landingZone}</b><span>${mission.coords}</span></div></div>
  <div class="formula-panel"><div class="formula-title">01 / ЗАДАЧА НА ПОСАДКУ</div><div class="equation">h ≈ v² / (2 × a)</div><p>Скорость сближения <b>${mission.approachSpeed} м/с</b>, торможение двигателя <b>${p.decel.toFixed(1)} м/с²</b>. Рассчитай высоту включения и время работы двигателя (t ≈ v / a).</p></div>
  <div id="plan-sliders" ${locked?'style="opacity:.5;pointer-events:none"':''}>
    ${sliderHTML('altitude','Высота начала торможения (км)',state.plan.altitude,1,32,.1,'км')}
    ${sliderHTML('duration','Время работы двигателя (с)',state.plan.duration,5,55,.1,'с')}
    ${sliderHTML('angle','Угол подхода к зоне (°)',state.plan.angle,-25,25,.5,'°')}
  </div><div id="prediction-container">${predictionHTML()}</div>
  <button class="hint-button" data-hint="1">${showHint?'▾ СКРЫТЬ ПОДСКАЗКУ':'▸ НУЖНА ПОДСКАЗКА ПО ФОРМУЛЕ?'}</button>
  ${showHint?`<div class="hint-text">Рассчитай: ${mission.approachSpeed}² ÷ (2 × ${p.decel.toFixed(1)}) ≈ ${(p.idealAltitude-.5).toFixed(2)} км. Добавь 0.5 км запаса. Время: ≈ ${p.idealDuration.toFixed(1)} с. Ищи угол площадки рядом с ${mission.targetAngle}°.</div>`:''}
  <div class="plan-foot">${locked?'⚠ СНИЖЕНИЕ НАЧАЛОСЬ: ПАРАМЕТРЫ ЗАБЛОКИРОВАНЫ.':mission.advice}</div>`;}
function shopHTML(){
  const pills=[{id:'all',name:'ВСЁ'},...SLOTS.map(s=>({id:s.id,name:s.name.toUpperCase()}))];
  let html=`<div class="panel-section-head"><strong>Магазин компонентов</strong><span>${TEST_MODE?'∞ ТЕСТОВЫЙ РЕЖИМ':'ПОКУПКА / МОНТАЖ'}</span></div><p class="panel-note">${TEST_MODE?'Все детали и материалы бесплатны. Кредиты и запасы не уменьшаются — испытывай любые конфигурации.':'Купленные детали сохраняются. Каждая новая покупка тратит кредиты и материалы со склада.'}</p><div class="shop-specs">${pills.map(p=>`<button class="plain-action ${shopSlot===p.id?'selected':''}" data-shop-filter="${p.id}" style="font-size:9px;padding:7px">${p.name}</button>`).join('')}</div>`;
  const slots=shopSlot==='all'?SLOTS:SLOTS.filter(s=>s.id===shopSlot);
  for(const slot of slots){html+=`<div class="shop-category"><div class="shop-cat-title"><span>${slot.icon} ${slot.name.toUpperCase()}</span><span>↑ УЛУЧШЕНИЯ</span></div>`;
    for(const p of PARTS.filter(p=>p.slot===slot.id)){
      const owned=state.owned.includes(p.id),equipped=state.equipped[p.slot]===p.id;
      const statSpecs=specsFor(p);
      html+=`<div class="shop-card ${owned?'owned':''}"><div class="shop-top"><div><small>${p.tier}</small><b>${p.name}</b></div><span class="shop-price">${owned?'КУПЛЕНО':TEST_MODE?'БЕСПЛАТНО':money(p.cost)+' CR'}</span></div><p class="shop-desc">${p.desc}</p><div class="shop-specs"><span>${p.mass.toFixed(1)} т</span>${statSpecs.map(s=>`<span>${s}</span>`).join('')}</div><div class="shop-bottom"><span class="mat-cost">Fe ${p.materials.metal} · Cx ${p.materials.composite} · Si ${p.materials.electronics}${TEST_MODE?' · ∞':''}</span><button class="shop-buy ${equipped?'equipped':''}" ${flight||equipped?'disabled':''} data-buy="${p.id}">${equipped?'УСТАНОВЛЕНО':owned?'УСТАНОВИТЬ':'КУПИТЬ +'}</button></div></div>`;
    }
    html+='</div>';
  }
  if(shopSlot==='all'){html+='<hr class="section-separator"><div class="shop-cat-title">ПОПОЛНЕНИЕ СКЛАДА</div>';
    for(const s of SUPPLIES)html+=`<div class="shop-card"><div class="shop-top"><div><small>РАСХОДНИКИ</small><b>${s.name}</b></div><span class="shop-price">${TEST_MODE?'БЕСПЛАТНО':s.cost+' CR'}</span></div><p class="shop-desc">${s.desc}</p><div class="shop-bottom"><span class="mat-cost">${TEST_MODE?'∞ · БЕЗ ОГРАНИЧЕНИЙ':'КРЕДИТЫ → РЕСУРСЫ'}</span><button class="shop-buy" data-supply="${s.id}" ${flight?'disabled':''}>КУПИТЬ +</button></div></div>`;
  }
  if(shopSlot!=='all')html+='<button class="hint-button" data-shop-filter="all">← КО ВСЕМ КОМПОНЕНТАМ</button>';
  return html;
}
function specsFor(p){if(p.slot==='engine')return [`${p.thrust} кН`,`${p.isp} с ISP`,FUEL_TYPES[p.fuelType].short];if(p.slot==='tank')return [`${money(p.capacity)} кг`];if(p.slot==='nav')return [`${Math.round(p.accuracy*100)}% точн.`];if(p.slot==='shield')return [`${p.thermal}°C`];if(p.slot==='legs')return [`≤ ${p.touchdown} м/с`];return [`${p.integrity}% прочн.`];}
function reportsHTML(){if(!state.history.length)return '<div class="report-empty"><strong>◈</strong><b>Пока нет экспедиций</b><p>Запусти ракету. Здесь появятся результаты, причины аварий и награды за посадки.</p></div>';
  return `<div class="panel-section-head"><strong>История экспедиций</strong><span>${state.wins} ПОСАДОК / ${state.flightCount} СТАРТОВ</span></div>`+state.history.map((r,i)=>`<div class="report-item ${r.success?'success':'fail'}"><div class="report-item-head"><b>${r.success?'✓':'✕'} ${r.mission==='moon'?'ЛУНА':'МАРС'} · #${r.number}</b><span>${r.success?'УСПЕШНО':'АВАРИЯ'}</span></div><div class="report-item-body">${esc(r.reason)}<br>${esc(r.date)} · ${r.distancePct}% маршрута · ${money(r.fuelUsed)} кг топлива</div><button class="plain-action" data-view-report="${i}">СМОТРЕТЬ ОТЧЁТ ↗</button></div>`).join('');}

function buyPart(id){if(flight)return;const p=PART_BY_ID[id];if(!p)return;
  if(state.owned.includes(id)){state.equipped[p.slot]=id;toast(`${p.name} установлен`);}
  else{const error=affordability(state,p.cost,p.materials);if(error){toast(error,true);return;}if(!TEST_MODE){state.credits-=p.cost;for(const key of Object.keys(MATERIALS))state.resources[key]-=p.materials[key];}state.owned.push(id);state.equipped[p.slot]=id;toast(`${p.name} куплен и установлен`);log(`Установлен модуль ${p.name}. ${TEST_MODE?'Бесплатно: тестовый режим.':'Списано '+money(p.cost)+' CR.'}`);}
  const capacity=getPerformance(state).capacity;if(state.fuel>capacity){const surplus=state.fuel-capacity;state.fuel=capacity;if(!TEST_MODE)state.credits+=Math.floor(surplus/1000)*60;toast(TEST_MODE?'Лишнее топливо слито до вместимости бака':'Лишнее топливо слито; часть стоимости возвращена');}
  save();renderAll();
}
function buySupply(id){if(flight)return;const supply=SUPPLIES.find(s=>s.id===id);if(!supply)return;if(!TEST_MODE&&state.credits<supply.cost){toast('Недостаточно кредитов',true);return;}if(!TEST_MODE)state.credits-=supply.cost;state.resources[supply.key]+=supply.amount;save();toast(`${supply.name}: добавлено на склад ${TEST_MODE?'бесплатно':''}`);renderAll();}
function selectFuelType(type){if(flight||!FUEL_TYPES[type]||type===state.fuelType)return;
  const drained=state.fuel,english=getLanguage()==='en';
  if(drained>0&&!confirm(english?`Changing propellant drains ${money(drained)} kg from the tank. Continue?`:`Смена типа топлива сольёт ${money(drained)} кг из бака. Продолжить?`))return;
  state.fuelType=type;state.fuel=0;save();renderAll();
  toast(english?`Selected: ${FUEL_TYPES[type].short}. Refuel before launch.`:`Выбрано: ${FUEL_TYPES[type].short}. Заправь ракету.`);
  log(english?`Propellant changed to ${FUEL_TYPES[type].short}. ${drained>0?'Previous fuel drained.':''}`:`Выбран тип топлива ${FUEL_TYPES[type].short}. ${drained>0?'Предыдущее топливо слито.':''}`);
}
function refuel(){if(flight)return;const perf=getPerformance(state),cap=perf.capacity;
  if(!cap){toast('Сначала установи топливный бак',true);return;}
  if(!perf.compatible){toast('Топливо не подходит двигателю. Смени тип топлива.',true);return;}
  const need=cap-state.fuel;if(need<=0){toast('Бак уже полон');return;}
  const fuel=FUEL_TYPES[state.fuelType]||FUEL_TYPES.kerolox,price=Math.ceil(need/1000)*fuel.pricePer1000;
  if(!TEST_MODE&&state.credits<price){toast(`Нужно ${money(price)} CR для полной заправки`,true);return;}
  if(!TEST_MODE)state.credits-=price;state.fuel=cap;save();log(`Заправка ${fuel.short}: ${money(cap)} кг. ${TEST_MODE?'Бесплатно.':'Цена '+money(price)+' CR.'}`);renderAll();toast('Бак полностью заправлен');}
function quickStarter(){if(flight)return;const cost=starterCost(state),err=affordability(state,cost.credits,cost.materials);if(err){toast(err,true);return;}if(!TEST_MODE){state.credits-=cost.credits;for(const key of Object.keys(MATERIALS))state.resources[key]-=cost.materials[key];}state.owned.push(...cost.missing);for(const id of STARTER){const p=PART_BY_ID[id];state.equipped[p.slot]=id;}state.fuelType='kerolox';state.fuel=13000;save();log(`Базовая ракета собрана и заправлена RP-1 / LOX. ${TEST_MODE?'Бесплатно.':'Затраты: '+money(cost.credits)+' CR.'}`);toast('Базовая ракета готова!');renderAll();}
function repair(){if(flight)return;if(state.condition>=100)return;const err=affordability(state,480,{metal:8});if(err){toast(err,true);return;}if(!TEST_MODE){state.credits-=480;state.resources.metal-=8;}state.condition=100;state.repaired++;save();log('Обшивка и крепления восстановлены. Прочность 100%.');toast('Ракета отремонтирована');renderAll();}

function timeString(s){let n=Math.round(s);return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
function modal(html,danger=false){$('modal-root').classList.remove('hidden');$('modal-root').innerHTML=`<div class="modal-card ${danger?'danger':''}" role="dialog" aria-modal="true">${html}</div>`;}
function hideModal(){$('modal-root').classList.add('hidden');$('modal-root').innerHTML='';}
function preflight(){const {perf,error}=readiness();if(error){toast(error,true);return;}const mission=MISSIONS[state.mission],p=computeLanding(state);
  const warnings=[perf.deltaV<mission.requiredDv?'Недостаточный Δv для этой цели.':null,perf.thermal<mission.heat?'Теплозащита слабее ожидаемого нагрева.':null,!p.safe?'Расчёт посадки пока рискованный.':null].filter(Boolean);
  modal(`<div class="modal-banner"><div class="modal-kicker" style="color:var(--acid)">ПРОВЕРКА ПЕРЕД СТАРТОМ / GO-NO GO</div><h2>Подтверди запуск на ${mission.id==='moon'?'Луну':'Марс'}</h2></div><div class="modal-body"><p>${mission.title}. После старта топливо будет расходоваться, возможны случайные аварийные ситуации. Управляй ими и следи за показателями.</p><div class="modal-status-list"><div><small>МАССА</small><b>${perf.wetMass.toFixed(1)} т</b></div><div><small>ТЯГА</small><b>${perf.thrust} кН</b></div><div><small>ΔV</small><b>${perf.deltaV.toFixed(2)}</b></div><div><small>ТОПЛИВО · ${FUEL_TYPES[state.fuelType].short}</small><b>${money(state.fuel)} кг</b></div><div><small>НАДЁЖНОСТЬ</small><b>${Math.round(perf.reliability*100)}%</b></div><div><small>TWR</small><b>${perf.twr.toFixed(2)}</b></div></div>
  ${warnings.length?`<p style="color:#f5c783">⚠ ${warnings.join('<br>⚠ ')}</p>`:'<p style="color:#a1e7b0">✓ Параметры для старта в пределах допустимых значений.</p>'}
  <div class="modal-options"><button class="modal-choice" data-confirm-launch="1"><span><b>ПОДТВЕРДИТЬ И ЗАПУСТИТЬ</b><small>Отправить ракету по выбранному маршруту</small></span><span class="choice-arrow">↗</span></button><button class="modal-choice secondary" data-close-modal="1"><span><b>Вернуться к сборке</b><small>Проверить детали или расчёт посадки</small></span><span class="choice-arrow">×</span></button></div></div>`);
}
function startFlight(){hideModal();const perf=getPerformance(state),mission=MISSIONS[state.mission];
  flight={progress:0,elapsed:0,condition:state.condition,heat:20,engineHeat:20,fuel:state.fuel,energy:100,
    speed:0,critical:null,faulty:false,icing:false,overheat:false,deviation:0,events:randomEvents(state.mission,perf.reliability),
    eventIndex:0,eventsResolved:[],phase:-1,initialFuel:state.fuel,retroApplied:false,perf,ended:false};
  state.flightCount++;save();logs=[];log(`СТАРТ: ${mission.title}. Системы двигателя активированы.`);
  chooseTab('plan');renderAll();toast('Ракета стартовала. Следи за телеметрией!');
}
function phaseOf(p){return p<.12?0:p<.27?1:p<.79?2:p<.97?3:4;}
const PHASE_NAMES=['Выход с площадки','Ускорение до межпланетного курса','Перелёт по траектории','Торможение и снижение','Касание поверхности'];
function updateFlight(dt){
  if(!flight||flight.critical||flight.ended)return;
  const f=flight,m=MISSIONS[state.mission];f.elapsed+=dt;
  f.progress=Math.min(1,f.progress+dt/m.duration);
  const p=f.progress,phase=phaseOf(p);
  if(phase!==f.phase){f.phase=phase;log(`Этап ${phase+1}/5: ${PHASE_NAMES[phase]}.`);}
  f.fuel-=dt*(state.mission==='moon'?189:230);
  const nominalHeat=p<.20?20+550*Math.sin(p/.2*Math.PI/2):p<.76?-115+80*Math.sin(p*10):state.mission==='mars'?-115+(p-.76)/.24*1095:-95+(p-.76)/.24*610;
  f.heat=nominalHeat+(f.overheat?340:0)+(f.icing?-170:0);
  f.engineHeat=p<.23?80+690*Math.sin(p/.23*Math.PI/2):p<.78?130+50*Math.sin(p*8):200+630*(p-.78)/.22;
  if(f.faulty)f.engineHeat=50;
  f.speed=p<.20?p/.2*10:p<.78?10+(state.mission==='mars'?4:0)*Math.sin(p*3):Math.max(.01,(1-p)/.22*7);
  if(f.fuel<=0){finish(false,'Топливо закончилось до завершения манёвра. Двигатель остановился.');return;}
  if(p>.33&&f.perf.deltaV<m.requiredDv){finish(false,`Недостаточно запаса Δv: ${f.perf.deltaV.toFixed(2)} вместо ${m.requiredDv.toFixed(2)} км/с. Ракета не вышла на требуемый маршрут.`);return;}
  if(p>.85 && f.heat>f.perf.thermal+110){finish(false,'Разрушение теплозащитного покрытия при входе в зону посадки. Оболочка перегрелась.');return;}
  if(p>.82&&!f.retroApplied){f.retroApplied=true;const prediction=computeLanding(state);f.fuel-=prediction.retroFuel;log(`Посадочный двигатель включён. Расход ${money(prediction.retroFuel)} кг.`, 'warn');if(f.fuel<=0){finish(false,'Недостаточно топлива на торможение у поверхности.');return;}}
  if(f.condition<=0){finish(false,'Нарушена целостность корпуса. Аппарат разрушился в полёте.');return;}
  const next=f.events[f.eventIndex];if(next&&p>=next.at){f.eventIndex++;triggerEvent(next);return;}
  if(p>=1)finishLanding();
}
function triggerEvent(event){const f=flight;f.critical=event;f.overheat=event.id==='thermal';f.icing=event.id==='ice';f.faulty=event.id==='engine';
  if(event.id==='thermal')f.heat=Math.max(f.heat,930);
  if(event.id==='ice')f.heat=-210;
  if(event.id==='engine')f.engineHeat=100;
  log(`ТРЕВОГА: ${event.title}. Требуется решение экипажа.`,event.level==='КРИТИЧЕСКИ'?'red':'warn');
  const unavailable=!TEST_MODE&&event.id==='debris'&&state.resources.composite<4;
  const visual=event.id==='thermal'?'930°C · CRITICAL HEAT':event.id==='ice'?'−210°C · FROST DETECTED':event.id==='engine'?'THRUST 0% · ENGINE FAULT':event.id==='nav'?'COURSE DRIFT · SENSOR LOST':event.id==='fuel'?'FUEL PRESSURE LOW':event.id==='storm'?'RADIATION STORM':'HULL BREACH DETECTED';
  modal(`<div class="modal-banner"><div class="modal-kicker">● ${event.level} / НЕШТАТНАЯ СИТУАЦИЯ</div><h2>${event.title}</h2></div><div class="modal-body"><div class="event-visual ${event.id}"><span class="event-radar">◈</span><div><small>LIVE SYSTEM / ANOMALY</small><b>${visual}</b></div><span class="event-pulse">●</span></div><p>${event.desc} Выбери действие. Время полёта остановлено, пока не принято решение.</p><div class="modal-status-list"><div><small>ОБОЛОЧКА</small><b>${Math.round(f.condition)}%</b></div><div><small>ТОПЛИВО</small><b>${money(f.fuel)} кг</b></div><div><small>ЭНЕРГИЯ</small><b>${Math.round(f.energy)}%</b></div></div><div class="modal-options"><button class="modal-choice" data-event-choice="a" ${unavailable?'disabled':''}><span><b>${event.a.name}</b><small>${event.a.sub}${unavailable?' · НЕТ МАТЕРИАЛОВ':''}</small></span><span class="choice-arrow">→</span></button><button class="modal-choice secondary" data-event-choice="b"><span><b>${event.b.name}</b><small>${event.b.sub}</small></span><span class="choice-arrow">→</span></button></div></div>` ,true);
}
function resolveEvent(choice){const f=flight,e=f?.critical;if(!e)return;let text='';
  if(e.id==='engine'){if(choice==='a'){f.fuel-=600;text='Двигатель успешно перезапущен.';}else{f.condition-=14;text='Включён резервный контур, повреждена камера.';}}
  if(e.id==='thermal'){if(choice==='a'){f.fuel-=800;text='Тяга снижена, оболочка охлаждается.';}else{f.condition-=24;text='Обшивка частично обгорела.';}}
  if(e.id==='ice'){if(choice==='a'){f.energy-=9;text='Подогрев активен. Лёд растаял.';}else{f.condition-=12;text='Замёрзший контур отброшен.';}}
  if(e.id==='nav'){if(choice==='a'){f.fuel-=700;text='Маневровые двигатели скорректировали курс.';}else{f.deviation+=22;text='Отклонение курса выросло на 22 км.';}}
  if(e.id==='debris'){if(choice==='a'){if(!TEST_MODE)state.resources.composite-=4;text='Пробоина заделана композитной заплатой.';}else{f.condition-=19;text='Отсек разгерметизирован и изолирован.';}}
  if(e.id==='fuel'){if(choice==='a'){f.fuel-=300;text='Утечка перекрыта, потеряно 300 кг топлива.';}else{f.fuel-=2100;text='Утечка продолжается: потеряно 2100 кг.';}}
  if(e.id==='storm'){if(choice==='a'){f.energy-=8;text='Аппарат переждал бурю в безопасном режиме.';}else{f.condition-=13;text='Радиация повредила несколько модулей.';}}
  f.eventsResolved.push({event:e.title,choice:choice==='a'?e.a.name:e.b.name});f.critical=null;f.faulty=false;f.overheat=false;f.icing=false;
  hideModal();log(text,f.condition<50?'warn':'green');save();renderAll();
  if(f.fuel<=0)finish(false,'После аварийного манёвра закончилось топливо.');
  else if(f.condition<=0)finish(false,'После аварии корпус потерял целостность.');
}
function finishLanding(){const f=flight,pred=computeLanding(state),perf=f.perf;
  const speed=pred.landingSpeed+Math.max(0,100-f.condition)*.045;
  const error=pred.landingError+f.deviation;
  f.finalSpeed=speed;f.finalError=error;
  if(speed>perf.touchdown){finish(false,`Жёсткое касание: ${speed.toFixed(1)} м/с при допустимых ${perf.touchdown.toFixed(1)} м/с.`);return;}
  if(error>75){finish(false,`Ракета промахнулась мимо посадочной зоны на ${error.toFixed(1)} км.`);return;}
  if(f.condition<30){finish(false,'Повреждённые опоры и корпус не выдержали касания.');return;}
  finish(true,`Мягкая посадка! ${speed.toFixed(1)} м/с, отклонение ${error.toFixed(1)} км от цели.`);
}
function finish(success,reason){const f=flight;if(!f||f.ended)return;f.ended=true;const mission=MISSIONS[state.mission];
  state.fuel=Math.max(0,Math.floor(f.fuel));state.condition=success?Math.max(55,Math.round(f.condition-6)):Math.max(25,Math.round(f.condition*.72));
  if(success){if(!TEST_MODE){state.credits+=mission.reward;for(const key of Object.keys(MATERIALS))state.resources[key]+=mission.rewards[key];}state.wins++;}
  const record={number:state.flightCount,mission:state.mission,success,reason,date:new Date().toLocaleString('ru-RU'),
    distancePct:Math.round(f.progress*100),fuelUsed:Math.max(0,Math.round(f.initialFuel-state.fuel)),fuelLeft:state.fuel,
    condition:state.condition,deltaV:f.perf.deltaV,heat:Math.round(f.heat),engineHeat:Math.round(f.engineHeat),
    speed:f.finalSpeed??null,error:f.finalError??null,events:f.eventsResolved,reward:success?mission.reward:0};
  state.history.unshift(record);state.history=state.history.slice(0,15);save();
  log((success?'ПОСАДКА ПОДТВЕРЖДЕНА. ':'МИССИЯ ПРЕРВАНА. ')+reason,success?'green':'red');
  flight=null;renderAll();showReport(record,true);
}
function showReport(r,justFinished=false){reportModal=r;const mission=MISSIONS[r.mission];
  modal(`<div class="modal-banner ${r.success?'success':''}"><div class="modal-kicker">${r.success?'● МИССИЯ ВЫПОЛНЕНА':'● АВАРИЙНОЕ ЗАВЕРШЕНИЕ'} / ОТЧЁТ #${r.number}</div><h2>${r.success?'Посадка успешна':'Миссия провалена'} · ${mission.name}</h2></div><div class="modal-body"><p>${esc(r.reason)}</p>
    <div class="report-stats"><div class="report-stat"><small>ПРОЙДЕННЫЙ МАРШРУТ</small><b>${r.distancePct}%</b></div><div class="report-stat"><small>ИЗРАСХОДОВАНО ТОПЛИВА</small><b>${money(r.fuelUsed)} <small>кг</small></b></div><div class="report-stat"><small>СОСТОЯНИЕ ПОСЛЕ ПОЛЁТА</small><b>${r.condition}%</b></div><div class="report-stat"><small>ΔV ПРИ СТАРТЕ</small><b>${r.deltaV.toFixed(2)} <small>км/с</small></b></div></div>
    <p style="font-size:11px">${r.events.length?`Решённые аварии: ${r.events.map(e=>esc(e.event)+' — '+esc(e.choice)).join('; ')}.`:'Зафиксированных аварийных событий не было.'}</p>
    <div class="result-reward ${r.success?'':'fail'}">${r.success?`${TEST_MODE?'ТЕСТОВАЯ НАГРАДА · ':''}+ ${money(r.reward)} CR · + ${mission.rewards.metal} Fe · + ${mission.rewards.composite} Cx · + ${mission.rewards.electronics} Si`:'НАГРАДА: 0 CR · ПОВРЕЖДЁННУЮ РАКЕТУ МОЖНО ПОЧИНИТЬ'}</div>
    <div class="result-buttons"><button class="modal-choice" data-finish-report="1"><span><b>${justFinished?'ВЕРНУТЬСЯ В АНГАР':'ЗАКРЫТЬ ОТЧЁТ'}</b><small>${justFinished?'Собрать и отправить новую миссию':'Вернуться к игре'}</small></span><span class="choice-arrow">→</span></button></div></div>`,!r.success);
}
function updatePrediction(){const el=$('prediction-container');if(el)el.innerHTML=predictionHTML();}

document.querySelectorAll('[data-mission]').forEach(b=>b.addEventListener('click',()=>selectMission(b.dataset.mission)));
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{
  setLanguage(button.dataset.language);
  document.querySelectorAll('[data-language]').forEach(b=>{const active=b.dataset.language===getLanguage();b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  renderPanel();configureRenderer();
}));
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>chooseTab(b.dataset.tab)));
$('reset-camera').addEventListener('click',()=>{renderer.resetCamera();toast('Камера сброшена');});
$('orbit-button').addEventListener('click',()=>toast('Потяни сцену пальцем или мышью. Колёсико меняет масштаб.'));
$('speed-button').addEventListener('click',()=>{speedFactor=speedFactor===1?2:speedFactor===2?3:1;$('speed-button').textContent=`×${speedFactor} СКОРОСТЬ`;toast(`Скорость времени: ×${speedFactor}`);});
$('launch-button').addEventListener('click',preflight);
$('restart-career').addEventListener('click',()=>{if(flight){toast('Дождись завершения миссии',true);return;}if(confirm('Начать карьеру заново? Все ракеты, кредиты и отчёты будут сброшены.')){state=newCareer();logs=[];log('Новая космическая программа запущена.');save();shopSlot='all';chooseTab('build');renderAll();}});
$('panel-content').addEventListener('click',e=>{
  const btn=e.target.closest('button');if(!btn)return;
  if(btn.dataset.openShop){shopSlot=btn.dataset.openShop;chooseTab('shop');}
  else if(btn.dataset.fuelType)selectFuelType(btn.dataset.fuelType);
  else if(btn.dataset.tabLink){if(btn.dataset.guideTopic)guideTopic=btn.dataset.guideTopic;chooseTab(btn.dataset.tabLink);}
  else if(btn.dataset.guideTopic){guideTopic=btn.dataset.guideTopic;renderPanel();}
  else if(btn.dataset.shopFilter){shopSlot=btn.dataset.shopFilter;renderPanel();}
  else if(btn.dataset.buy)buyPart(btn.dataset.buy);
  else if(btn.dataset.supply)buySupply(btn.dataset.supply);
  else if(btn.dataset.refuel)refuel();
  else if(btn.dataset.starter)quickStarter();
  else if(btn.dataset.repair)repair();
  else if(btn.dataset.hint){showHint=!showHint;renderPanel();}
  else if(btn.dataset.viewReport!==undefined){const r=state.history[Number(btn.dataset.viewReport)];if(r)showReport(r);}
});
$('panel-content').addEventListener('input',e=>{
  const key=e.target.dataset.plan||e.target.dataset.planNumber;if(!key)return;
  if(!['altitude','duration','angle'].includes(key))return;
  if(flight&&flight.progress>.78)return;
  const val=Number(e.target.value);if(!Number.isFinite(val)||e.target.value==='')return;
  const min=key==='angle'?-25:key==='duration'?5:1,max=key==='angle'?25:key==='duration'?55:32;
  state.plan[key]=Math.min(max,Math.max(min,val));
  const matching=key===e.target.dataset.plan?`[data-plan-number="${key}"]`:`[data-plan="${key}"]`;
  const other=$('panel-content').querySelector(matching);if(other)other.value=state.plan[key];
  updatePrediction();save();
});
$('modal-root').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.closeModal)hideModal();
  else if(b.dataset.confirmLaunch)startFlight();
  else if(b.dataset.eventChoice)resolveEvent(b.dataset.eventChoice);
  else if(b.dataset.finishReport){hideModal();reportModal=null;chooseTab('build');renderAll();}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!flight?.critical&&!flight){hideModal();}});

function loop(t){const dt=Math.min(.08,(t-lastTime)/1000||0);lastTime=t;
  if(flight&&!flight.critical)updateFlight(dt*speedFactor);
  configureRenderer();renderer.update(t);
  if(t-lastUI>150){renderTelemetry();renderSceneUI();renderTimeline();lastUI=t;}
  requestAnimationFrame(loop);
}
document.querySelectorAll('[data-language]').forEach(b=>{const active=b.dataset.language===getLanguage();b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
watchTranslations();renderAll();renderLogs();localizeTree(document.body);requestAnimationFrame(loop);
