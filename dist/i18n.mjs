// Local, offline RU/EN UI translation. The original Russian text is kept per DOM node
// so switching back restores it without modifying saved mission data.
const lines = [
['Центр управления готов. Выберите модули и цель экспедиции.','Mission control ready. Select modules and a destination.'],
['Собирай ракету. Рискуй ресурсами. Управляй миссией.','Build a rocket. Manage resources. Control the mission.'],
['От чертежа','From blueprint'],['до другой планеты.','to another planet.'],
['КОСМИЧЕСКАЯ ПРОГРАММА','SPACE PROGRAM'],['БАЛАНС ЭКСПЕДИЦИИ / ТЕСТ','MISSION BALANCE / TEST'],
['ИНЖЕНЕРНАЯ СИМУЛЯЦИЯ · СЕЗОН 01','ENGINEERING SIMULATION · SEASON 01'],
['Ресурсы на складе','Warehouse resources'],['Цель миссии','Mission destination'],['Панели игры','Game panels'],
['Интерактивная трёхмерная сцена, вращайте мышью или пальцем','Interactive 3D scene; rotate with mouse or touch'],
['3D визуализация ракеты и полёта','3D rocket and flight visualization'],
['Свободное вращение камеры','Free camera rotation'],['Вернуть исходную камеру','Reset camera'],['Ускорение игрового времени','Game time acceleration'],
['Центр миссии','Mission Control'],['ПАНЕЛЬ УПРАВЛЕНИЯ / 01','CONTROL PANEL / 01'],
['ПРОГРАММА 01','PROGRAM 01'],['ПРОГРАММА 02','PROGRAM 02'],
['ЛУНА','MOON'],['МАРС','MARS'],['Луна','Moon'],['Марс','Mars'],['Луну','Moon'],
['СКЛАД /','WAREHOUSE /'],['СПЛАВЫ','ALLOYS'],['КОМПОЗИТЫ','COMPOSITES'],['ЭЛЕКТРОНИКА','ELECTRONICS'],['ТОПЛИВО В РАКЕТЕ','ROCKET FUEL'],['АВТОСОХРАНЕНИЕ','AUTOSAVE'],
['В АНГАРЕ','IN HANGAR'],['ПРЯМОЙ ЭФИР','LIVE'],['3D КОНСТРУКТОР','3D BUILDER'],
['ВРАЩЕНИЕ','ROTATE'],['ВИД','RESET'],['СКОРОСТЬ','SPEED'],['СБОРОЧНЫЙ ДОК / A–01','ASSEMBLY DOCK / A–01'],
['Ожидает установки модулей','Waiting for modules'],['Конфигурация собрана · Проверь расчёт посадки','Configuration complete · Check landing plan'],
['Установлено модулей:','Installed modules:'],['из 6','of 6'],['ПОЛЁТ В ПРОЦЕССЕ','FLIGHT IN PROGRESS'],
['ДВИГАТЕЛЬ','ENGINE'],['ПОТЯНИ, ЧТОБЫ ВРАЩАТЬ · КОЛЁСИКО — МАСШТАБ','DRAG TO ROTATE · SCROLL TO ZOOM'],
['ΔV / ЗАПАС СКОРОСТИ','ΔV / VELOCITY RESERVE'],['МАССА РАКЕТЫ','ROCKET MASS'],['ТЕМП. ОБОЛОЧКИ','HULL TEMPERATURE'],
['С ТОПЛИВОМ','INCLUDING FUEL'],['СОСТОЯНИЕ','INTEGRITY'],['СИСТЕМЫ ГОТОВЫ','SYSTEMS READY'],['НОРМА','NORMAL'],
['ОБЛЕДЕНЕНИЕ','ICING'],['ПРЕВЫШЕН ЛИМИТ','LIMIT EXCEEDED'],['ПОВЫШЕННЫЙ НАГРЕВ','ELEVATED HEAT'],['ТРЕБУЕТСЯ РЕМОНТ','REPAIR NEEDED'],['ПОВРЕЖДЕНИЯ','DAMAGED'],
['ЭТАПЫ МИССИИ','MISSION PHASES'],['ГОТОВНОСТЬ К ЗАПУСКУ','LAUNCH READINESS'],
['СТАРТ','LAUNCH'],['РАЗГОН','ACCELERATION'],['ПЕРЕЛЁТ','TRANSFER'],['СНИЖЕНИЕ','DESCENT'],['ПОСАДКА','LANDING'],
['СБОРКА','BUILD'],['РАСЧЁТ','MATH'],['МАГАЗИН','SHOP'],['ОТЧЁТЫ','REPORTS'],['СПРАВКА','GUIDE'],
['Топливо не подходит двигателю','Propellant does not match the engine'],['Топливо не подходит двигателю. Смени тип топлива.','Incompatible propellant. Select the correct fuel type.'],
['Собери ракету для запуска','Build a rocket to launch'],['Полетное управление активно','Flight control active'],
['Готово к старту','Ready for launch'],['Не установлено модулей:','Missing modules:'],['Заправь ракету','Refuel the rocket'],['Корпус требует ремонта','Hull requires repair'],['Недостаточная тяга для старта','Insufficient launch thrust'],
['НАЧАТЬ МИССИЮ','START MISSION'],['МИССИЯ В ПРОЦЕССЕ','MISSION IN PROGRESS'],
['Твоя ракета','Your rocket'],['МОДУЛЕЙ','MODULES'],['МОДУЛЬ НЕ УСТАНОВЛЕН','MODULE NOT INSTALLED'],['ЗАМЕНА +','REPLACE +'],['ВЫБРАТЬ +','SELECT +'],
['Выбирай и покупай детали. Купленные модули остаются в ангаре и могут использоваться снова.','Choose and buy parts. Purchased modules remain in your hangar for reuse.'],
['Каркас и теплоизоляция','Frame and insulation'],['Тяга и удельный импульс','Thrust and specific impulse'],['Запас топлива','Fuel capacity'],['Точность траектории','Trajectory accuracy'],['Предел нагрева оболочки','Hull thermal limit'],['Допустимая скорость касания','Maximum safe touchdown speed'],
['Земля → Луна','Earth → Moon'],['Земля → Марс','Earth → Mars'],['Двигатель','Engine'],
['ТЯГОВООРУЖЁННОСТЬ','THRUST-TO-WEIGHT'],['ТРЕБУЕТСЯ ΔV','REQUIRED ΔV'],
['ТОПЛИВО / КРИОГЕННОЕ','FUEL / CRYOGENIC'],['ТЕСТОВАЯ ЗАПРАВКА','TEST REFUEL'],['ЗАПРАВИТЬ +','REFUEL +'],
['СОБРАТЬ БАЗОВУЮ РАКЕТУ','ASSEMBLE STARTER ROCKET'],['БЕСПЛАТНО','FREE'],
['Базовый комплект включает 6 модулей и 13 000 кг топлива. Для Марса нужны улучшения.','Starter kit: 6 modules and 13,000 kg of fuel. Mars requires upgrades.'],
['ВОССТАНОВИТЬ КОРПУС','REPAIR HULL'],['8 сплавов','8 alloys'],['РАССЧИТАТЬ МЕСТО ПОСАДКИ','CALCULATE LANDING SITE'],
['Расчёт посадки','Landing calculation'],['НАВИГАЦИЯ /','NAVIGATION /'],
['Подбери высоту и время торможения по формуле. Прогноз обновляется сразу. Во время перелёта можно исправить план до снижения.','Use the formula to choose braking altitude and duration. The prediction updates instantly. Adjust your plan during transfer, before descent.'],
['ЗОНА ПРИЗЕМЛЕНИЯ','LANDING ZONE'],['Море Спокойствия','Sea of Tranquility'],['Равнина Элизий','Elysium Planitia'],
['ЗАДАЧА НА ПОСАДКУ','LANDING EXERCISE'],['Скорость сближения','Approach speed'],['торможение двигателя','engine deceleration'],
['Рассчитай высоту включения и время работы двигателя','Calculate engine ignition altitude and burn duration'],
['Высота начала торможения (км)','Braking start altitude (km)'],['Время работы двигателя (с)','Engine burn duration (s)'],['Угол подхода к зоне (°)','Approach angle to target (°)'],
['ПРОГНОЗ ТРАЕКТОРИИ','TRAJECTORY FORECAST'],['СНАЧАЛА СОБЕРИ РАКЕТУ','BUILD ROCKET FIRST'],['СЛИШКОМ ЖЁСТКАЯ ПОСАДКА','TOUCHDOWN TOO HARD'],
['МИМО ПОСАДОЧНОЙ ЗОНЫ','MISSED LANDING ZONE'],['ПРОГНОЗ: МЯГКАЯ ПОСАДКА','FORECAST: SOFT LANDING'],
['СКОРОСТЬ КАСАНИЯ','TOUCHDOWN SPEED'],['ОШИБКА ЦЕЛИ','TARGET ERROR'],['Допуск опор:','Landing leg limit:'],['Площадка:','Landing zone:'],['Расход торможения:','Braking fuel:'],
['СКРЫТЬ ПОДСКАЗКУ','HIDE HINT'],['НУЖНА ПОДСКАЗКА ПО ФОРМУЛЕ?','NEED A FORMULA HINT?'],['Рассчитай:','Calculate:'],['Добавь 0.5 км запаса. Время:','Add a 0.5 km buffer. Time:'],['Ищи угол площадки рядом с','Aim for a target angle near'],
['СНИЖЕНИЕ НАЧАЛОСЬ: ПАРАМЕТРЫ ЗАБЛОКИРОВАНЫ.','DESCENT STARTED: INPUTS LOCKED.'],
['Без атмосферы: главный риск — позднее торможение.','No atmosphere: late braking is the main risk.'],
['Тонкая атмосфера: понадобится теплозащита и запас Δv.','Thin atmosphere: you need thermal shielding and Δv reserve.'],
['Магазин компонентов','Component shop'],['ТЕСТОВЫЙ РЕЖИМ','TEST MODE'],['ПОКУПКА / МОНТАЖ','PURCHASE / INSTALL'],
['Все детали и материалы бесплатны. Кредиты и запасы не уменьшаются — испытывай любые конфигурации.','All parts and materials are free. Credits and supplies never decrease: test any configuration.'],
['Купленные детали сохраняются. Каждая новая покупка тратит кредиты и материалы со склада.','Purchased parts persist. Each new purchase spends credits and warehouse materials.'],
['ВСЁ','ALL'],['КОРПУС','HULL'],['ТОПЛИВНЫЙ БАК','FUEL TANK'],['НАВИГАЦИЯ','NAVIGATION'],['ТЕПЛОЗАЩИТА','HEAT SHIELD'],['ПОСАДОЧНЫЕ ОПОРЫ','LANDING LEGS'],
['↑ УЛУЧШЕНИЯ','↑ UPGRADES'],['БАЗОВЫЙ','BASIC'],['УЛУЧШ.','ADVANCED'],['ЭЛИТНЫЙ','ELITE'],
['КУПЛЕНО','OWNED'],['УСТАНОВЛЕНО','INSTALLED'],['УСТАНОВИТЬ','INSTALL'],['КУПИТЬ +','BUY +'],
['ПОПОЛНЕНИЕ СКЛАДА','WAREHOUSE REFILL'],['РАСХОДНИКИ','CONSUMABLES'],['БЕЗ ОГРАНИЧЕНИЙ','UNLIMITED'],['КРЕДИТЫ → РЕСУРСЫ','CREDITS → MATERIALS'],['КО ВСЕМ КОМПОНЕНТАМ','BACK TO ALL COMPONENTS'],
['точн.','accuracy'],['прочн.','integrity'],
['Пока нет экспедиций','No expeditions yet'],['Запусти ракету. Здесь появятся результаты, причины аварий и награды за посадки.','Launch your rocket. Results, failure analysis, and landing rewards appear here.'],
['История экспедиций','Expedition history'],['ПОСАДОК /','LANDINGS /'],['СТАРТОВ','LAUNCHES'],['УСПЕШНО','SUCCESS'],['АВАРИЯ','FAILURE'],['маршрута','of route'],['топлива','fuel'],['СМОТРЕТЬ ОТЧЁТ','VIEW REPORT'],
['ПРОВЕРКА ПЕРЕД СТАРТОМ','PREFLIGHT CHECK'],['Подтверди запуск на','Confirm launch to'],
['Миссия «Артемида»','Mission Artemis'],['Миссия «Арес»','Mission Ares'],
['После старта топливо будет расходоваться, возможны случайные аварийные ситуации. Управляй ими и следи за показателями.','Fuel is consumed after launch; random emergencies may occur. Handle them and monitor your instruments.'],
['МАССА','MASS'],['ТЯГА','THRUST'],['ТОПЛИВО','FUEL'],['НАДЁЖНОСТЬ','RELIABILITY'],
['Недостаточный Δv для этой цели.','Not enough Δv for this destination.'],['Теплозащита слабее ожидаемого нагрева.','Heat shield rating is below expected heating.'],['Расчёт посадки пока рискованный.','Landing plan is still risky.'],
['Параметры для старта в пределах допустимых значений.','Launch parameters are within the allowed limits.'],
['ПОДТВЕРДИТЬ И ЗАПУСТИТЬ','CONFIRM & LAUNCH'],['Отправить ракету по выбранному маршруту','Send rocket along the selected route'],['Вернуться к сборке','Back to assembly'],['Проверить детали или расчёт посадки','Review parts or the landing plan'],
['Выход с площадки','Leaving launchpad'],['Ускорение до межпланетного курса','Accelerating to transfer'],['Перелёт по траектории','Flight along trajectory'],['Торможение и снижение','Braking and descent'],['Касание поверхности','Surface touchdown'],
['Этап','Phase'],['Посадочный двигатель включён. Расход','Landing engine ignited. Fuel usage'],
['НЕШТАТНАЯ СИТУАЦИЯ','EMERGENCY'],['КРИТИЧЕСКИ','CRITICAL'],['ПРЕДУПРЕЖДЕНИЕ','WARNING'],['ТРЕВОГА:','ALERT:'],['Требуется решение экипажа.','Crew decision required.'],
['Выбери действие. Время полёта остановлено, пока не принято решение.','Choose an action. The simulation is paused until you decide.'],['ОБОЛОЧКА','HULL'],['ЭНЕРГИЯ','ENERGY'],['НЕТ МАТЕРИАЛОВ','INSUFFICIENT MATERIALS'],
['СБОЙ ДВИГАТЕЛЯ','ENGINE FAILURE'],['Давление в камере падает. Тяга нестабильна, запуск двигателя под угрозой.','Chamber pressure is dropping. Thrust is unstable and engine ignition is at risk.'],
['ПЕРЕГРЕВ ОБОЛОЧКИ','HULL OVERHEATING'],['Температура обшивки быстро растёт. Возможна потеря защитного покрытия.','Hull temperature is rising rapidly. Thermal protection may fail.'],
['ОБЛЕДЕНЕНИЕ КОРПУСА','HULL ICING'],['В тени температура упала. Датчики и клапаны покрываются льдом.','Temperature dropped in shadow. Sensors and valves are freezing.'],
['ОШИБКА НАВИГАЦИИ','NAVIGATION ERROR'],['Звёздный трекер потерял ориентацию. Курс отклоняется от расчётного.','Star tracker lost orientation. The course is drifting off target.'],
['МИКРОМЕТЕОРИТНЫЙ УДАР','MICROMETEORITE IMPACT'],['Система зафиксировала пробитие внешней обшивки.','A breach has been detected in the outer hull.'],
['УТЕЧКА ТОПЛИВА','FUEL LEAK'],['Давление в магистрали снизилось. Обнаружено испарение горючего.','Fuel line pressure is dropping. Propellant is leaking.'],
['СОЛНЕЧНАЯ БУРЯ','SOLAR STORM'],['Поток частиц нарушает связь и работу электроники.','Particle radiation disrupts communications and electronics.'],
['Перезапустить','Restart engine'],['Переключить контур','Switch to backup circuit'],['Сбросить тягу','Reduce thrust'],['Выдержать нагрев','Endure the heat'],
['Включить подогрев','Activate heaters'],['Отсоединить контур','Disconnect circuit'],['Коррекция курса','Correct course'],['Лететь по инерции','Coast on inertia'],
['Заделать пробоину','Patch hull breach'],['Изолировать секцию','Isolate compartment'],['Перекрыть магистраль','Shut fuel line'],['Оставить поток','Keep flow open'],
['Уйти в энергосбережение','Switch to safe mode'],['Сохранить курс','Maintain course'],
['кг топлива','kg fuel'],['прочности','integrity'],['энергии','energy'],['композита','composites'],['км отклонения','km deviation'],
['Двигатель успешно перезапущен.','Engine restarted successfully.'],['Включён резервный контур, повреждена камера.','Backup circuit active; chamber damaged.'],
['Тяга снижена, оболочка охлаждается.','Thrust reduced; hull is cooling.'],['Обшивка частично обгорела.','Outer hull has partially burned.'],
['Подогрев активен. Лёд растаял.','Heaters activated. Ice melted.'],['Замёрзший контур отброшен.','Frozen circuit jettisoned.'],
['Маневровые двигатели скорректировали курс.','Thrusters corrected the course.'],['Отклонение курса выросло на 22 км.','Course deviation increased by 22 km.'],
['Пробоина заделана композитной заплатой.','Breach repaired with a composite patch.'],['Отсек разгерметизирован и изолирован.','The depressurized compartment was isolated.'],
['Утечка перекрыта, потеряно 300 кг топлива.','Leak stopped; 300 kg of fuel lost.'],['Утечка продолжается: потеряно 2100 кг.','Leak continues: 2,100 kg lost.'],
['Аппарат переждал бурю в безопасном режиме.','Craft weathered the storm in safe mode.'],['Радиация повредила несколько модулей.','Radiation damaged several modules.'],
['Топливо закончилось до завершения манёвра. Двигатель остановился.','Fuel ran out before the maneuver ended. Engine stopped.'],
['Недостаточно запаса Δv:','Insufficient Δv reserve:'],['вместо','instead of'],['Ракета не вышла на требуемый маршрут.','Rocket failed to reach the required trajectory.'],
['Разрушение теплозащитного покрытия при входе в зону посадки. Оболочка перегрелась.','Heat shield failed during landing approach. Hull overheated.'],
['Недостаточно топлива на торможение у поверхности.','Insufficient fuel for terminal braking.'],['Нарушена целостность корпуса. Аппарат разрушился в полёте.','Hull integrity lost. Spacecraft broke up in flight.'],
['Жёсткое касание:','Hard touchdown:'],['при допустимых','with the allowed limit of'],['Ракета промахнулась мимо посадочной зоны на','Rocket missed the landing zone by'],
['Повреждённые опоры и корпус не выдержали касания.','Damaged landing legs and hull failed at touchdown.'],
['Мягкая посадка!','Soft landing!'],['отклонение','deviation'],['от цели','from target'],
['ПОСАДКА ПОДТВЕРЖДЕНА.','LANDING CONFIRMED.'],['МИССИЯ ПРЕРВАНА.','MISSION ABORTED.'],
['МИССИЯ ВЫПОЛНЕНА','MISSION COMPLETE'],['АВАРИЙНОЕ ЗАВЕРШЕНИЕ','MISSION FAILED'],['ОТЧЁТ #','REPORT #'],
['Посадка успешна','Landing successful'],['Миссия провалена','Mission failed'],
['ПРОЙДЕННЫЙ МАРШРУТ','ROUTE COMPLETED'],['ИЗРАСХОДОВАНО ТОПЛИВА','FUEL USED'],['СОСТОЯНИЕ ПОСЛЕ ПОЛЁТА','POST-FLIGHT INTEGRITY'],['ΔV ПРИ СТАРТЕ','LAUNCH ΔV'],
['Решённые аварии:','Handled emergencies:'],['Зафиксированных аварийных событий не было.','No emergency events recorded.'],['ТЕСТОВАЯ НАГРАДА','TEST REWARD'],
['НАГРАДА: 0 CR · ПОВРЕЖДЁННУЮ РАКЕТУ МОЖНО ПОЧИНИТЬ','REWARD: 0 CR · DAMAGED ROCKET CAN BE REPAIRED'],
['ВЕРНУТЬСЯ В АНГАР','RETURN TO HANGAR'],['ЗАКРЫТЬ ОТЧЁТ','CLOSE REPORT'],['Собрать и отправить новую миссию','Build and launch another mission'],['Вернуться к игре','Return to game'],
['ТЕЛЕМЕТРИЯ / ЖУРНАЛ СОБЫТИЙ','TELEMETRY / EVENT LOG'],['ПРАВИЛА','RULES'],['Каждая посадка','Every landing'],['имеет цену.','has a price.'],
['За успешный полёт получай кредиты и материалы. Аварии тратят ресурсы. Решения во время полёта меняют исход.','Successful flights earn credits and materials. Accidents cost resources. In-flight decisions affect the outcome.'],
['МОДЕЛЬ: ИГРОВАЯ, НЕ НАВИГАЦИОННАЯ','MODEL: GAME-SCALED, NOT NAVIGATION-GRADE'],['ПРОЕКТИРУЙ. ИСПЫТЫВАЙ. ИССЛЕДУЙ.','DESIGN. TEST. EXPLORE.'],['НОВАЯ КАРЬЕРА','NEW CAREER'],
['ПРЕЗЕНТАЦИЯ','PRESENTATION'],
['Нельзя сменить цель во время полёта','Cannot change destination during flight'],['Выбрана цель:','Destination selected:'],['Дистанция','Distance'],
['Камера сброшена','Camera reset'],['Потяни сцену пальцем или мышью. Колёсико меняет масштаб.','Drag with finger or mouse. Scroll to zoom.'],['Скорость времени:','Simulation time speed:'],
['Дождись завершения миссии','Wait until the mission ends'],['Начать карьеру заново? Все ракеты, кредиты и отчёты будут сброшены.','Restart career? All rockets, credits, and reports will be reset.'],['Новая космическая программа запущена.','New space program started.'],
['куплен и установлен','purchased and installed'],['установлен','installed'],['Установлен модуль','Module installed:'],['Бесплатно: тестовый режим.','Free: test mode.'],['Списано','Charged'],
['бесплатно','for free'],
['Лишнее топливо слито до вместимости бака','Excess fuel drained to tank capacity'],['Лишнее топливо слито; часть стоимости возвращена','Excess fuel drained; partial refund issued'],
['Недостаточно кредитов','Insufficient credits'],['добавлено на склад','added to warehouse'],['Сначала установи топливный бак','Install a fuel tank first'],['Бак уже полон','Fuel tank is already full'],['Нужно','Need'],['для полной заправки','for a full refuel'],
['Заправка завершена:','Refueling complete:'],['Бесплатно.','Free.'],['Цена','Cost'],['Бак полностью заправлен','Tank fully fueled'],['Базовая ракета собрана и заправлена.','Starter rocket assembled and fueled.'],['Затраты:','Spent:'],['Базовая ракета готова!','Starter rocket ready!'],['Обшивка и крепления восстановлены. Прочность 100%.','Hull and joints restored. Integrity 100%.'],['Ракета отремонтирована','Rocket repaired'],
['Ракета стартовала. Следи за телеметрией!','Rocket launched. Monitor telemetry!'],['Системы двигателя активированы.','Engine systems active.'],['После аварийного манёвра закончилось топливо.','Fuel ran out after emergency maneuver.'],['После аварии корпус потерял целостность.','Hull failed after the emergency.'],
['Лёгкий корпус для первой экспедиции.','Lightweight hull for the first expedition.'],['Композит: ниже масса и выше прочность.','Composite structure: lighter and stronger.'],['Усиленная конструкция для сложных миссий.','Reinforced structure for difficult missions.'],
['Простой однокамерный двигатель. Достаточен для Луны.','Simple single-chamber engine. Enough for the Moon.'],['Больше тяги и эффективнее расход топлива.','More thrust and better fuel efficiency.'],['Экспериментальная высокоэффективная установка.','Experimental high-efficiency propulsion system.'],
['Ёмкости хватает на лунный перелёт.','Enough capacity for a lunar transfer.'],['Увеличенный запас для дальних трасс.','Increased fuel reserve for long journeys.'],['Максимальная автономность на пути к Марсу.','Maximum range for the journey to Mars.'],
['Базовое управление и расчёт траектории.','Basic guidance and trajectory calculations.'],['Точная коррекция ошибок и прогноз посадки.','Precise course corrections and landing predictions.'],['Минимальный риск навигационного отклонения.','Minimal navigation deviation risk.'],
['Керамическая защита. Для Луны подходит лучше.','Ceramic protection. Best suited to lunar missions.'],['Выдерживает нагрев марсианского входа.','Withstands Mars entry heating.'],['Повышенный запас температурной прочности.','Higher thermal resistance reserve.'],
['Четыре лёгкие опоры для мягкой посадки.','Four lightweight legs for a soft touchdown.'],['Усиленные опоры и демпферы.','Reinforced legs and dampers.'],['Тяжёлые амортизаторы для экстремальной посадки.','Heavy-duty shock absorbers for tough landings.'],
['Рамы, крепления и корпуса','Frames, brackets and hulls'],['Обшивка и теплоизоляция','Hull cladding and insulation'],['Платы, датчики и автоматика','Circuits, sensors and automation'],
['Сплавы','Alloys'],['Композиты','Composites'],['Электроника','Electronics'],['Корпус','Hull'],['Топливный бак','Fuel tank'],['Навигация','Navigation'],['Теплозащита','Heat shield'],['Посадочные опоры','Landing legs'],
['км/с','km/s'],['м/с²','m/s²'],['м/с','m/s'],['млн км','million km'],['км','km'],['кг','kg'],['кН','kN'],
];

const entries = lines.sort((a,b)=>b[0].length-a[0].length);
const origins = new WeakMap();
const attributes = new WeakMap();
let current = (()=>{try{return localStorage.getItem('orbital-forge-language')==='en'?'en':'ru';}catch{return 'ru'}})();
export const getLanguage=()=>current;

export function translateText(input){
  let out=String(input);
  for(const [ru,en] of entries){if(out.includes(ru))out=out.replaceAll(ru,en);}
  // A few inflected/standalone words are not covered by exact phrases.
  out=out.replace(/(\d(?:[\d.,\s]*\d)?)\s+т(?=\s|$|[.,/])/g,'$1 t').replace(/(\d(?:[\d.,\s]*\d)?)\s+с(?=\s|$|[.,/])/g,'$1 s');
  if(out.trim()==='т'||out.trim()==='с')out=out.replace(out.trim(),out.trim()==='т'?'t':'s');
  return out;
}

function translateNode(node){
  if(node.nodeType===3){
    const now=node.nodeValue||'';
    if(current==='en'){
      if(!/[А-Яа-яЁё]/.test(now))return;
      const english=translateText(now);
      if(english!==now){origins.set(node,{ru:now,en:english});node.nodeValue=english;}
    }else{
      const prev=origins.get(node);
      if(prev && now===prev.en)node.nodeValue=prev.ru;
    }
  }else if(node.nodeType===1){
    if(node.tagName==='SCRIPT'||node.tagName==='STYLE')return;
    const remembered=attributes.get(node)||{};
    for(const key of ['title','aria-label','placeholder']){
      if(!node.hasAttribute(key))continue;
      const val=node.getAttribute(key);
      if(current==='en'&&/[А-Яа-яЁё]/.test(val)){
        const en=translateText(val);remembered[key]={ru:val,en};node.setAttribute(key,en);
      }else if(current==='ru'&&remembered[key]&&val===remembered[key].en){node.setAttribute(key,remembered[key].ru);}
    }
    attributes.set(node,remembered);
  }
}

export function localizeTree(root){
  if(!root)return;
  translateNode(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  while(walker.nextNode())translateNode(walker.currentNode);
}

export function setLanguage(next){
  current=next==='en'?'en':'ru';
  document.documentElement.lang=current;
  try{localStorage.setItem('orbital-forge-language',current);}catch{}
  localizeTree(document.body);
}

export function watchTranslations(){
  document.documentElement.lang=current;
  const observer=new MutationObserver(changes=>{
    for(const change of changes){
      if(change.type==='characterData')translateNode(change.target);
      if(change.type==='childList')for(const node of change.addedNodes)localizeTree(node);
    }
  });
  observer.observe(document.body,{subtree:true,characterData:true,childList:true});
  return observer;
}
