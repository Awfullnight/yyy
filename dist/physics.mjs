// ORBITAL FORGE — intentionally game-scaled flight model, not mission-grade navigation.
// Temporary QA mode. Switch to false to restore the normal limited economy.
export const TEST_MODE = true;
export const SLOTS = [
  { id: 'hull', name: 'Корпус', subtitle: 'Каркас и теплоизоляция', icon: '◈' },
  { id: 'engine', name: 'Двигатель', subtitle: 'Тяга и удельный импульс', icon: '✦' },
  { id: 'tank', name: 'Топливный бак', subtitle: 'Запас топлива', icon: '▰' },
  { id: 'nav', name: 'Навигация', subtitle: 'Точность траектории', icon: '⌖' },
  { id: 'shield', name: 'Теплозащита', subtitle: 'Предел нагрева оболочки', icon: '⬡' },
  { id: 'legs', name: 'Посадочные опоры', subtitle: 'Допустимая скорость касания', icon: '⋈' },
];

const part = (id, slot, name, tier, cost, metal, composite, electronics, mass, stats, desc) => ({
  id, slot, name, tier, cost, materials: { metal, composite, electronics }, mass, ...stats, desc,
});

export const PARTS = [
  part('hull-1','hull','Astra Mk I','БАЗОВЫЙ',980,20,15,0,2.5,{integrity:100,insulation:0.6},'Лёгкий корпус для первой экспедиции.'),
  part('hull-2','hull','Astra Composite','УЛУЧШ.',2480,25,22,3,2.1,{integrity:135,insulation:0.9},'Композит: ниже масса и выше прочность.'),
  part('hull-3','hull','Titanium X','ЭЛИТНЫЙ',4200,35,30,6,2.0,{integrity:180,insulation:1.2},'Усиленная конструкция для сложных миссий.'),
  part('engine-1','engine','Kestrel E-1','БАЗОВЫЙ',1800,24,4,6,1.6,{thrust:480,isp:350,reliability:0.91,fuelType:'kerolox'},'Кислородно-керосиновый двигатель. Достаточен для Луны.'),
  part('engine-2','engine','Vulcan V-2','УЛУЧШ.',3650,35,9,11,2.3,{thrust:720,isp:410,reliability:0.96,fuelType:'methalox'},'Метан и кислород: высокая тяга и чистое сгорание.'),
  part('engine-3','engine','Helios Fusion','ЭЛИТНЫЙ',6900,50,19,20,2.8,{thrust:970,isp:475,reliability:0.985,fuelType:'hydrolox'},'Фантастическая игровая установка на водороде и кислороде.'),
  part('tank-1','tank','Cryo 13T','БАЗОВЫЙ',1150,22,6,1,2.2,{capacity:13000},'Ёмкости хватает на лунный перелёт.'),
  part('tank-2','tank','Cryo 18T','УЛУЧШ.',2550,33,10,2,3.0,{capacity:18000},'Увеличенный запас для дальних трасс.'),
  part('tank-3','tank','Cryo 22T','ЭЛИТНЫЙ',4050,43,15,3,4.2,{capacity:22000},'Максимальная автономность на пути к Марсу.'),
  part('nav-1','nav','Guidance Core','БАЗОВЫЙ',870,3,3,8,0.3,{accuracy:0.68},'Базовое управление и расчёт траектории.'),
  part('nav-2','nav','DeepNav AI','УЛУЧШ.',2550,6,6,16,0.4,{accuracy:0.89},'Точная коррекция ошибок и прогноз посадки.'),
  part('nav-3','nav','DeepNav Quantum','ЭЛИТНЫЙ',4200,9,9,24,0.5,{accuracy:0.98},'Минимальный риск навигационного отклонения.'),
  part('shield-1','shield','Ceramic S1','БАЗОВЫЙ',790,4,13,1,0.8,{thermal:820},'Керамическая защита. Для Луны подходит лучше.'),
  part('shield-2','shield','Ablator S2','УЛУЧШ.',2370,8,23,3,1.0,{thermal:1120},'Выдерживает нагрев марсианского входа.'),
  part('shield-3','shield','ThermaShield X','ЭЛИТНЫЙ',3800,11,33,5,1.2,{thermal:1420},'Повышенный запас температурной прочности.'),
  part('legs-1','legs','Landing Kit L1','БАЗОВЫЙ',690,9,6,1,0.7,{touchdown:12.5},'Четыре лёгкие опоры для мягкой посадки.'),
  part('legs-2','legs','Landing Kit L2','УЛУЧШ.',2100,17,12,2,0.95,{touchdown:18},'Усиленные опоры и демпферы.'),
  part('legs-3','legs','Landing Kit L3','ЭЛИТНЫЙ',3450,25,19,4,1.2,{touchdown:24},'Тяжёлые амортизаторы для экстремальной посадки.'),
];

export const PART_BY_ID = Object.fromEntries(PARTS.map(p => [p.id, p]));
export const STARTER = ['hull-1','engine-1','tank-1','nav-1','shield-1','legs-1'];

export const MISSIONS = {
  moon: {
    id:'moon', name:'Луна', latin:'LUNA', title:'Миссия «Артемида»', subtitle:'Земля → Луна',
    distance:'384 400 км', duration:50, requiredDv:2.85, reward:5600,
    rewards:{metal:34,composite:18,electronics:7}, approachSpeed:460,
    targetAngle:6, landingZone:'Море Спокойствия', coords:'0.7° N · 23.5° E',
    gravity:1.62, heat:640, descentStart:7, incomingFuel:10500,
    advice:'Без атмосферы: главный риск — позднее торможение.', color:'#c9d8ed',
  },
  mars: {
    id:'mars', name:'Марс', latin:'MARS', title:'Миссия «Арес»', subtitle:'Земля → Марс',
    distance:'225 млн км', duration:72, requiredDv:4.15, reward:9500,
    rewards:{metal:52,composite:29,electronics:14}, approachSpeed:690,
    targetAngle:11, landingZone:'Равнина Элизий', coords:'3.1° N · 154.8° E',
    gravity:3.71, heat:980, descentStart:13, incomingFuel:17000,
    advice:'Тонкая атмосфера: понадобится теплозащита и запас Δv.', color:'#ff986f',
  },
};

export const MATERIALS = {
  metal: {name:'Сплавы', symbol:'Fe', color:'#a0b9d5'},
  composite: {name:'Композиты',symbol:'Cx',color:'#a1c5b6'},
  electronics: {name:'Электроника',symbol:'Si',color:'#cfb4ff'},
};

// Rocket propellants are fuel + onboard oxidizer. The game stores their combined
// mass in one tank and models a single compatible propellant for each engine.
export const FUEL_TYPES = {
  kerolox: {id:'kerolox',short:'RP-1 / LOX',name:'Керосин + кислород',nameEn:'Kerosene + oxygen',pricePer1000:110},
  methalox: {id:'methalox',short:'CH₄ / LOX',name:'Метан + кислород',nameEn:'Methane + oxygen',pricePer1000:165},
  hydrolox: {id:'hydrolox',short:'LH₂ / LOX',name:'Водород + кислород',nameEn:'Hydrogen + oxygen',pricePer1000:240},
};

export const SUPPLIES = [
  {id:'metal', name:'Сплавы ×35', type:'material', key:'metal', amount:35, cost:650, desc:'Рамы, крепления и корпуса'},
  {id:'composite', name:'Композиты ×22',type:'material',key:'composite',amount:22,cost:850,desc:'Обшивка и теплоизоляция'},
  {id:'electronics',name:'Электроника ×12',type:'material',key:'electronics',amount:12,cost:930,desc:'Платы, датчики и автоматика'},
];

export function newCareer(){
  return {
    credits:10500, resources:{metal:135,composite:75,electronics:45},
    owned:[], equipped:{hull:null,engine:null,tank:null,nav:null,shield:null,legs:null},
    fuel:0, fuelType:'kerolox', mission:'moon', plan:{altitude:12,duration:20,angle:0},
    flightCount:0, wins:0, history:[], condition:100, repaired:0,
  };
}

export function safeLoad(raw){
  try{
    if(!raw) return newCareer();
    const s=JSON.parse(raw);
    if(!s || !Number.isFinite(s.credits) || !Array.isArray(s.owned)) return newCareer();
    const d=newCareer();
    return {...d,...s,fuelType:FUEL_TYPES[s.fuelType]?s.fuelType:d.fuelType,resources:{...d.resources,...s.resources},equipped:{...d.equipped,...s.equipped},plan:{...d.plan,...s.plan},history:Array.isArray(s.history)?s.history.slice(0,15):[]};
  }catch{ return newCareer(); }
}

export function getPerformance(state){
  const selected=Object.values(state.equipped).map(id=>PART_BY_ID[id]).filter(Boolean);
  const ready=SLOTS.every(slot=>!!PART_BY_ID[state.equipped[slot.id]]);
  const engine=PART_BY_ID[state.equipped.engine]||{};
  const tank=PART_BY_ID[state.equipped.tank]||{};
  const nav=PART_BY_ID[state.equipped.nav]||{};
  const shield=PART_BY_ID[state.equipped.shield]||{};
  const legs=PART_BY_ID[state.equipped.legs]||{};
  const hull=PART_BY_ID[state.equipped.hull]||{};
  const dryMass=selected.reduce((n,p)=>n+p.mass,0);
  const wetMass=dryMass+state.fuel/1000;
  const deltaV=dryMass>0 && wetMass>dryMass ? engine.isp*9.81*Math.log(wetMass/dryMass)/1000 : 0;
  const twr=wetMass>0? (engine.thrust||0)/(wetMass*9.81):0;
  return {ready,selected,dryMass,wetMass,deltaV,twr,thrust:engine.thrust||0,
    compatible:!engine.fuelType||engine.fuelType===state.fuelType,requiredFuel:engine.fuelType||null,isp:engine.isp||0,
    capacity:tank.capacity||0, reliability:engine.reliability||0,accuracy:nav.accuracy||0,
    thermal:shield.thermal||0,touchdown:legs.touchdown||0,integrity:hull.integrity||0};
}

export function computeLanding(state){
  const mission=MISSIONS[state.mission];
  const perf=getPerformance(state);
  const dryMass=Math.max(6,perf.dryMass);
  // Approximate retro-thrust acceleration including the remaining landing fuel.
  const decel=Math.max(8,Math.min(27,(perf.thrust||300)/(dryMass+3) - mission.gravity));
  const idealAltitude=mission.approachSpeed**2/(2*decel)/1000+0.5;
  const idealDuration=mission.approachSpeed/decel;
  const altDelta=state.plan.altitude-idealAltitude;
  const timeDelta=state.plan.duration-idealDuration;
  const angleDelta=state.plan.angle-mission.targetAngle;
  const landingSpeed=3.5+Math.abs(altDelta)*1.45+Math.abs(timeDelta)*0.72+
    (altDelta<0?Math.abs(altDelta)*1.25:0)+(timeDelta<0?Math.abs(timeDelta)*0.7:0);
  const scatter=(1-perf.accuracy)*18;
  const landingError=Math.abs(angleDelta)*5.1+scatter+Math.abs(altDelta)*2.1;
  const retroFuel=Math.max(1000, Math.round((state.plan.duration/Math.max(1,idealDuration))*
    (mission.id==='moon'?1700:2600)));
  return {decel,idealAltitude,idealDuration,landingSpeed,landingError,retroFuel,
    safe:landingSpeed<=perf.touchdown&&landingError<=75, targetAngle:mission.targetAngle};
}

export function starterCost(state){
  const missing=STARTER.filter(id=>!state.owned.includes(id));
  const parts=missing.map(id=>PART_BY_ID[id]);
  const required={metal:0,composite:0,electronics:0};
  for(const p of parts) for(const key of Object.keys(required)) required[key]+=p.materials[key];
  const fuelCost=Math.ceil(Math.max(0,13000-state.fuel)/1000)*FUEL_TYPES.kerolox.pricePer1000;
  return {credits:parts.reduce((a,p)=>a+p.cost,0)+fuelCost,materials:required,missing,fuelCost};
}

export function affordability(state,price,materials={}){
  if(TEST_MODE) return null;
  if(state.credits<price) return 'Недостаточно кредитов';
  const key=Object.keys(materials).find(k=>(state.resources[k]||0)<materials[k]);
  return key?`Не хватает: ${MATERIALS[key]?.name||key}`:null;
}

export const formatNum=(n)=>Math.round(n).toLocaleString('ru-RU');

export function randomEvents(missionId,reliability){
  const library=[
    {id:'engine', title:'СБОЙ ДВИГАТЕЛЯ',level:'КРИТИЧЕСКИ',desc:'Давление в камере падает. Тяга нестабильна, запуск двигателя под угрозой.',
      a:{name:'Перезапустить',sub:'−600 кг топлива'},b:{name:'Переключить контур',sub:'−14% прочности'}},
    {id:'thermal', title:'ПЕРЕГРЕВ ОБОЛОЧКИ',level:'КРИТИЧЕСКИ',desc:'Температура обшивки быстро растёт. Возможна потеря защитного покрытия.',
      a:{name:'Сбросить тягу',sub:'−800 кг топлива'},b:{name:'Выдержать нагрев',sub:'−24% прочности'}},
    {id:'ice', title:'ОБЛЕДЕНЕНИЕ КОРПУСА',level:'ПРЕДУПРЕЖДЕНИЕ',desc:'В тени температура упала. Датчики и клапаны покрываются льдом.',
      a:{name:'Включить подогрев',sub:'−9% энергии'},b:{name:'Отсоединить контур',sub:'−12% прочности'}},
    {id:'nav', title:'ОШИБКА НАВИГАЦИИ',level:'ПРЕДУПРЕЖДЕНИЕ',desc:'Звёздный трекер потерял ориентацию. Курс отклоняется от расчётного.',
      a:{name:'Коррекция курса',sub:'−700 кг топлива'},b:{name:'Лететь по инерции',sub:'+22 км отклонения'}},
    {id:'debris', title:'МИКРОМЕТЕОРИТНЫЙ УДАР',level:'КРИТИЧЕСКИ',desc:'Система зафиксировала пробитие внешней обшивки.',
      a:{name:'Заделать пробоину',sub:'−4 композита'},b:{name:'Изолировать секцию',sub:'−19% прочности'}},
    {id:'fuel', title:'УТЕЧКА ТОПЛИВА',level:'КРИТИЧЕСКИ',desc:'Давление в магистрали снизилось. Обнаружено испарение горючего.',
      a:{name:'Перекрыть магистраль',sub:'−300 кг топлива'},b:{name:'Оставить поток',sub:'−2100 кг топлива'}},
    {id:'storm', title:'СОЛНЕЧНАЯ БУРЯ',level:'ПРЕДУПРЕЖДЕНИЕ',desc:'Поток частиц нарушает связь и работу электроники.',
      a:{name:'Уйти в энергосбережение',sub:'−8% энергии'},b:{name:'Сохранить курс',sub:'−13% прочности'}},
  ];
  const pool=[...library].sort(()=>Math.random()-0.5);
  if(reliability<0.94){const idx=pool.findIndex(e=>e.id==='engine'); if(idx>0) [pool[0],pool[idx]]=[pool[idx],pool[0]];}
  const phases=missionId==='mars'?[0.19,0.41,0.67]:[0.21,0.52];
  return phases.map((at,i)=>({...pool[i],at}));
}
