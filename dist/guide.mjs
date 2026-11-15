// Bilingual engineering reference. Figures are taken from the actual game model;
// explanatory science is deliberately separated from simplified gameplay.
import {PARTS,PART_BY_ID,SLOTS,FUEL_TYPES,MATERIALS,SUPPLIES,getPerformance,formatNum} from './physics.mjs';

export function guideHTML({state,topic='engine',language='ru',testMode=false}){
  const en=language==='en', L=(ru,eng)=>en?eng:ru;
  const perf=getPerformance(state),engine=PART_BY_ID[state.equipped.engine],tank=PART_BY_ID[state.equipped.tank];
  const fuel=FUEL_TYPES[state.fuelType]||FUEL_TYPES.kerolox;
  const expected=engine?.fuelType?FUEL_TYPES[engine.fuelType]:null;
  const number=n=>formatNum(n);
  const nav=`<div class="guide-nav" role="group" aria-label="${L('Темы справочника','Guide topics')}">
    ${[['engine',L('ДВИГАТЕЛЬ','ENGINE')],['fuel',L('ТОПЛИВО','FUEL')],['materials',L('МАТЕРИАЛЫ','MATERIALS')]].map(([id,label])=>`<button class="guide-nav-button ${topic===id?'selected':''}" data-guide-topic="${id}" aria-pressed="${topic===id}">${label}</button>`).join('')}
  </div>`;
  const title=`<div class="panel-section-head"><strong>${L('Инженерный справочник','Engineering guide')}</strong><span>SCIENCE / OF–01</span></div>
    <p class="panel-note">${L('Показатели подставляются из твоей ракеты. Принципы основаны на реальной космонавтике, но расчёты игры упрощены.','Values come from your current rocket. The principles reflect real rocketry; game calculations are simplified.')}</p>`;

  let content='';
  if(topic==='engine'){
    content=`<div class="guide-hero"><span class="guide-kicker">01 / ${L('ТВОЙ ДВИГАТЕЛЬ','YOUR ENGINE')}</span>
      <h3>${engine?engine.name:L('Двигатель не установлен','No engine installed')}</h3>
      <p>${engine?L('Ракетный двигатель разгоняет аппарат, выбрасывая раскалённые газы через сопло. Его характеристика зависит от тяги, эффективности и надёжности.','A rocket accelerates by ejecting hot gas through a nozzle. Thrust, efficiency and reliability define its performance.'):L('Выбери двигатель во вкладке «Магазин», чтобы увидеть его реальные игровые параметры.','Select an engine in the Shop to see its live game stats.')}</p>
      <div class="guide-metrics">
        <div><small>${L('ТЯГА','THRUST')}</small><strong>${engine?.thrust??'—'} <em>kN</em></strong></div>
        <div><small>${L('УД. ИМПУЛЬС','SPECIFIC IMPULSE')}</small><strong>${engine?.isp??'—'} <em>s</em></strong></div>
        <div><small>${L('НАДЁЖНОСТЬ','RELIABILITY')}</small><strong>${engine?Math.round(engine.reliability*100)+'%':'—'}</strong></div>
        <div><small>${L('МАССА','MASS')}</small><strong>${engine?engine.mass.toFixed(1)+' t':'—'}</strong></div>
      </div>
      <div class="guide-status ${perf.compatible?'good':'bad'}">${engine?(perf.compatible?`✓ ${L('ТОПЛИВО СОВМЕСТИМО','FUEL COMPATIBLE')} · ${fuel.short}`:`⚠ ${L('ТРЕБУЕТСЯ','REQUIRES')} ${expected.short} · ${L('СЕЙЧАС','SELECTED')} ${fuel.short}`):L('Установи двигатель и выбери подходящее топливо.','Install an engine and select matching propellant.')}</div>
    </div>
    <div class="guide-chapter"><h4>${L('Что значат характеристики?','What do these numbers mean?')}</h4>
      <div class="guide-term"><b>${L('Тяга (kN)','Thrust (kN)')}</b><p>${L('Сила двигателя. Чем больше тяга относительно веса ракеты, тем легче стартовать. В игре проверяется TWR: меньше 1 — старт невозможен.','Engine force. More thrust relative to rocket weight makes launch easier. In this game, TWR below 1 blocks launch.')}</p></div>
      <div class="guide-term"><b>${L('Удельный импульс — Isp (s)','Specific impulse — Isp (s)')}</b><p>${L('Мера эффективности расхода топлива: высокий Isp даёт больше изменения скорости при той же доле потраченной массы.','A measure of propellant efficiency: higher Isp delivers more velocity change for the same mass ratio.')}</p></div>
      <div class="guide-term"><b>${L('Надёжность (%)','Reliability (%)')}</b><p>${L('Игровой показатель риска неисправности: у базового двигателя риск выше, у улучшенных — ниже. Аварии в игре всё равно могут случаться случайно.','A game reliability indicator: the starter engine has higher risk than upgraded ones. Random mission events can still occur.')}</p></div>
    </div>
    <div class="guide-formula"><span>TWR = F / (m × g₀)</span><span>Δv ≈ Isp × g₀ × ln(m₀ / m₁)</span></div>
    <div class="guide-callout"><strong>${L('Текущая ракета','Current rocket')}</strong><p>${L('Тяговооружённость','Thrust-to-weight ratio')}: <b>${perf.twr.toFixed(2)} TWR</b> · Δv: <b>${perf.deltaV.toFixed(2)} km/s</b>. ${L('Заправка увеличивает Δv, но повышает стартовую массу. Эти формулы в игре не являются профессиональным расчётом траектории.','Fuel increases Δv but also launch mass. Game formulas are not mission-grade navigation.')}</p></div>
    <div class="guide-chapter"><h4>${L('Сравнение трёх двигателей','Compare the three engines')}</h4><div class="guide-comparison">${PARTS.filter(p=>p.slot==='engine').map(p=>`<div class="guide-compare-row ${p.id===engine?.id?'current':''}"><div><b>${p.name}</b><small>${FUEL_TYPES[p.fuelType].short}</small></div><div><b>${p.thrust} kN</b><small>${p.isp} s Isp · ${Math.round(p.reliability*100)}%</small></div></div>`).join('')}</div>
    <p class="guide-fine">${L('Helios Fusion — вымышленный экспериментальный двигатель. Его показатели и работа с водородом заданы только для этой игры.','Helios Fusion is fictional experimental hardware. Its numbers and hydrogen propellant are game design choices.')}</p></div>
    <button class="guide-action" data-open-shop="engine">${L('ВЫБРАТЬ ИЛИ УЛУЧШИТЬ ДВИГАТЕЛЬ →','SELECT OR UPGRADE ENGINE →')}</button>`;
  }else if(topic==='fuel'){
    const percent=perf.capacity?Math.min(100,100*state.fuel/perf.capacity):0;
    content=`<div class="guide-hero"><span class="guide-kicker">02 / ${L('ТОПЛИВНАЯ СИСТЕМА','PROPELLANT SYSTEM')}</span><h3>${fuel.short}</h3>
      <p>${en?fuel.nameEn:fuel.name}. ${L('В ракетах горючее и окислитель хранятся раздельно: кислород приходится брать с собой, ведь в космосе нет воздуха. В игре их суммарная масса показана одним числом.','Real rockets store fuel and oxidizer separately. They carry their own oxygen because space has no air. The game combines both into one mass value.')}</p>
      <div class="guide-metrics"><div><small>${L('ЗАПРАВЛЕНО','LOADED')}</small><strong>${number(state.fuel)} <em>kg</em></strong></div><div><small>${L('ВМЕСТИМОСТЬ','CAPACITY')}</small><strong>${number(perf.capacity)} <em>kg</em></strong></div><div><small>${L('ЦЕНА / 1 Т','COST / 1 T')}</small><strong>${fuel.pricePer1000} <em>CR</em></strong></div><div><small>${L('ЗАПОЛНЕНИЕ','FILL')}</small><strong>${percent.toFixed(0)}%</strong></div></div>
      <div class="guide-meter"><span style="width:${percent}%"></span></div>
      <div class="guide-status ${perf.compatible?'good':'bad'}">${engine?(perf.compatible?`✓ ${L('ПОДХОДИТ ДЛЯ','MATCHES')} ${engine.name}`:`⚠ ${engine.name} ${L('ТРЕБУЕТ','REQUIRES')} ${expected.short}`):L('Установи двигатель, чтобы проверить совместимость.','Install an engine to check compatibility.')}</div>
    </div>
    <div class="guide-chapter"><h4>${L('Три типа жидкого топлива','Three liquid propellant types')}</h4>
      <div class="guide-propellant-list">
        <article class="guide-fuel-item ${state.fuelType==='kerolox'?'selected':''}"><b>RP-1 / LOX <small>${L('КЕРОСИН + КИСЛОРОД','KEROSENE + OXYGEN')}</small></b><p>${L('Плотное горючее, удобное для компактных баков. Кислород охлаждают до жидкого состояния; при сгорании керосина возможны отложения сажи. В игре подходит Kestrel E-1.','Dense fuel helps keep tanks compact. Oxygen must be cryogenic; kerosene combustion can leave soot. In this game it powers Kestrel E-1.')}</p><span>${L('ИГРОВАЯ ЦЕНА','GAME COST')}: 110 CR / 1000 kg</span></article>
        <article class="guide-fuel-item ${state.fuelType==='methalox'?'selected':''}"><b>CH₄ / LOX <small>${L('МЕТАН + КИСЛОРОД','METHANE + OXYGEN')}</small></b><p>${L('Метан сгорает чище керосина, но требует охлаждения. Теоретически его можно производить на Марсе из местного CO₂ и привезённого или добытого водорода при наличии энергии. В игре подходит Vulcan V-2.','Methane burns cleaner than kerosene but needs cryogenic storage. It could be produced on Mars from CO₂ and hydrogen with an energy supply. In this game it powers Vulcan V-2.')}</p><span>${L('ИГРОВАЯ ЦЕНА','GAME COST')}: 165 CR / 1000 kg</span></article>
        <article class="guide-fuel-item ${state.fuelType==='hydrolox'?'selected':''}"><b>LH₂ / LOX <small>${L('ВОДОРОД + КИСЛОРОД','HYDROGEN + OXYGEN')}</small></b><p>${L('Водород даёт высокий удельный импульс, но занимает много объёма и нуждается в очень холодном хранении и хорошей теплоизоляции. В игре используется вымышленным Helios Fusion.','Hydrogen can achieve high specific impulse but has very low density. Storage needs extremely low temperatures and strong insulation. In this game it powers fictional Helios Fusion.')}</p><span>${L('ИГРОВАЯ ЦЕНА','GAME COST')}: 240 CR / 1000 kg</span></article>
      </div></div>
    <div class="guide-callout"><strong>${L('Почему тип топлива важен?','Why does propellant matter?')}</strong><p>${L('Каждой модели двигателя назначена подходящая топливная пара. При смене типа бак опустошается; несовместимый состав блокирует запуск. Чем эффективнее установленный двигатель, тем больше расчётный Δv, но дорогие системы сложнее собрать.','Each engine is assigned one compatible propellant pair. Changing the type empties the tank; an incompatible choice blocks launch. Efficient engines provide more calculated Δv, but their parts are costlier.')}</p></div>
    <p class="guide-fine">${L('Твёрдое топливо тоже существует: в таких двигателях горючее и окислитель смешаны в твёрдом заряде. Этот тип пока не доступен в игре.','Solid propellant also exists: fuel and oxidizer are mixed in a solid grain. That type is not selectable in this prototype.')}</p>
    <button class="guide-action" data-tab-link="build">${L('ПЕРЕЙТИ К ВЫБОРУ ТОПЛИВА →','CHOOSE PROPELLANT IN BUILD →')}</button>
    <div class="guide-sources">${L('О принципах работы:','Learn the underlying science:')} <a href="https://www.grc.nasa.gov/www/k-12/rocket/TRCRocket/practical_rocketry.html" target="_blank" rel="noopener">NASA Practical Rocketry ↗</a></div>`;
  }else{
    const assembly=Object.values(state.equipped).map(id=>PART_BY_ID[id]).filter(Boolean);
    const total={metal:0,composite:0,electronics:0};for(const p of assembly)for(const k of Object.keys(total))total[k]+=p.materials[k];
    const materialText={
      metal:[L('Сплавы (Fe)','Alloys (Fe)'),L('Каркас, стенки баков, силовые соединения и крепления. Металлы хорошо несут нагрузки, но увеличивают массу. В игре Fe объединяет разные конструкционные сплавы.','Frames, tank walls, load-bearing joints and mounts. Metals handle stress but increase mass. Fe represents several structural alloys in this game.')],
      composite:[L('Композиты (Cx)','Composites (Cx)'),L('Лёгкие многослойные панели и элементы теплоизоляции. Часто помогают снизить массу, но требуют точной технологии изготовления и ремонта.','Lightweight layered panels and insulation structures. They can reduce mass, but are more complex to manufacture and repair.')],
      electronics:[L('Электроника (Si)','Electronics (Si)'),L('Датчики, бортовой компьютер, автоматика двигателя и навигация. Масса невелика, но отказ электроники может сорвать манёвр.','Sensors, flight computers, engine controls and navigation. Low mass, but electronics failures can ruin a maneuver.')],
    };
    content=`<div class="guide-hero"><span class="guide-kicker">03 / ${L('РЕСУРСЫ ДЛЯ СБОРКИ','ASSEMBLY RESOURCES')}</span><h3>${L('Из чего сделана ракета?','What is a rocket made of?')}</h3><p>${L('В реальности детали состоят из разных материалов. В ORBITAL FORGE закупки сведены к трём ресурсам, чтобы научиться выбирать между массой, прочностью, ценой и электроникой.','Real spacecraft use many materials. ORBITAL FORGE groups purchases into three resources to teach trade-offs between mass, strength, cost and electronics.')}</p>
      <div class="guide-metrics">${Object.entries(MATERIALS).map(([key,val])=>`<div><small>${en?({metal:'ALLOYS',composite:'COMPOSITES',electronics:'ELECTRONICS'}[key]):val.name.toUpperCase()}</small><strong>${testMode?'∞':number(state.resources[key]||0)} <em>${val.symbol}</em></strong></div>`).join('')}</div>
      <div class="guide-status good">${testMode?L('∞ ТЕСТ: покупки не уменьшают материалы и кредиты.','∞ TEST: purchases do not consume materials or credits.'):L('Материалы списываются при покупке деталей; установленные детали можно использовать снова.','Materials are spent when buying parts; owned parts can be reused.')}</div></div>
      <div class="guide-chapter"><h4>${L('Роль каждого ресурса','What each material does')}</h4>
        ${Object.entries(materialText).map(([key,[name,desc]])=>`<div class="guide-material"><span class="guide-material-icon ${key}">${MATERIALS[key].symbol}</span><div><b>${name}</b><p>${desc}</p></div></div>`).join('')}
      </div>
      <div class="guide-chapter"><h4>${L('Материалы твоей конфигурации','Bill of materials for your rocket')}</h4>
        <p class="guide-fine">${L('Числа ниже — рецепт покупки каждой установленной детали, а не повторная цена уже купленного модуля.','Numbers below show each equipped part’s purchase recipe, not a second charge for an already-owned module.')}</p>
        <div class="guide-bom"><div class="guide-bom-row heading"><span>${L('МОДУЛЬ','MODULE')}</span><span>Fe</span><span>Cx</span><span>Si</span></div>
          ${SLOTS.map(slot=>{const p=PART_BY_ID[state.equipped[slot.id]];return `<div class="guide-bom-row"><span>${p?p.name:en?'Not installed':'Не установлен'}</span><span>${p?.materials.metal??'—'}</span><span>${p?.materials.composite??'—'}</span><span>${p?.materials.electronics??'—'}</span></div>`}).join('')}
          <div class="guide-bom-row total"><span>${L('ИТОГО','TOTAL')}</span><span>${total.metal}</span><span>${total.composite}</span><span>${total.electronics}</span></div></div>
      </div>
      <div class="guide-chapter"><h4>${L('Как пополняется склад','How warehouse refills work')}</h4>${SUPPLIES.map(s=>`<div class="guide-compare-row"><div><b>${en?materialText[s.key][0]:MATERIALS[s.key].name}</b><small>+${s.amount} ${MATERIALS[s.key].symbol}</small></div><div><b>${s.cost} CR</b><small>${L('цена пакета в игре','in-game bundle cost')}</small></div></div>`).join('')}</div>
      <button class="guide-action" data-tab-link="shop">${L('ОТКРЫТЬ МАГАЗИН МАТЕРИАЛОВ →','OPEN MATERIALS SHOP →')}</button>`;
  }
  return title+nav+content+`<p class="guide-disclaimer">ⓘ ${L('Это образовательный симулятор. Числа, цены, типы двигателей и аварийные вероятности настроены для игрового баланса, а не для проектирования настоящих ракет.','This is an educational simulator. Numbers, prices, engine models and failure probabilities are tuned for game balance, not real spacecraft design.')}</p>`;
}
