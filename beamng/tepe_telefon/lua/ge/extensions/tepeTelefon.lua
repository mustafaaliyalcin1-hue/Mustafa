-- Tepe Telefon: BeamNG.drive serbest sürüş için akıllı telefon ve acil hizmetler.
-- Polis, ambulans, taksi ve cenaze aracı çağırma; kaza algılama; olay yeri tedavisi;
-- polis ifadesi ve kusur tespiti. Arayüz: ui/modules/apps/TepeTelefon.
local M = {}
local TAG = 'tepeTelefon'

local CFG = {
  crashDetect = true,
  fireOnCrash = true,     -- sert kazada araç yanabilir
  worldAcc = true,        -- oyuncudan bağımsız kazalar
  worldEvery = 300,       -- sn (ortalama)
  fleeChance = 0.3,       -- çevrilen aracın kaçma olasılığı
  crashDv = 7.0,          -- m/s: kısa sürede yatay hız değişimi (~25 km/s) = kaza
  crashWindow = 0.2,      -- sn
  crashCooldown = 25,     -- sn
  sosDelay = 10,          -- sn: otomatik 112 geri sayımı
  spawnMin = 220, spawnMax = 480,
  arriveDist = 15,
  emergencySpeed = 27,    -- m/s (~97 km/s) acil araç azami hız
  normalSpeed = 16,       -- m/s (~58 km/s)
  stuckTime = 150,        -- sn: bu süre içinde gelemezse yakına alınır
  leaveDespawn = 260,     -- m: ayrılan araç bu uzaklıkta silinir
  leaveMaxTime = 90,      -- sn
  taxiWait = 120,         -- sn
  incidentLife = 600,     -- sn
}

-- İlk uyan seçilir. cfg anahtarı yapılandırma adında aranır (ör. 'police' -> 'police_interceptor').
local FLEET = {
  police    = { {model='fullsize', cfg='police'}, {model='bastion', cfg='police'}, {model='midsize', cfg='police'}, {model='fullsize'} },
  ambulance = { {model='van', cfg='ambulance'}, {model='md_series', cfg='ambulance'}, {model='van'} },
  taxi      = { {model='fullsize', cfg='taxi'}, {model='midsize', cfg='taxi'}, {model='midsize'} },
  fire      = { {model='md_series', cfg='fire'}, {model='us_semi', cfg='fire'}, {model='van', cfg='fire'}, {model='pickup', cfg='fire'}, {model='md_series', red=true}, {model='van', red=true} },
  hearse    = { {model='lansdale', cfg='hearse'}, {model='fullsize', cfg='hearse'}, {model='lansdale', black=true}, {model='van', black=true} },
}

local NAMES = {
  police = 'Trafik Ekibi', ambulance = '112 Ambulans', taxi = 'Taksi', hearse = 'Cenaze Aracı', fire = 'İtfaiye',
}
local DRIVERS = {'Mehmet', 'Hüseyin', 'Hasan', 'Murat', 'Kemal', 'Erkan', 'Serkan', 'Yusuf', 'Ramazan', 'Cengiz'}
local SURN = {'K.', 'Y.', 'D.', 'Ş.', 'A.', 'Ö.', 'T.', 'Ç.'}
local LEVELS = {
  west_coast_usa='West Coast, ABD', east_coast_usa='East Coast, ABD', italy='İtalya', utah='Utah',
  jungle_rock_island='Jungle Rock Island', gridmap_v2='Grid Map', small_island='Small Island',
  johnson_valley='Johnson Valley', industrial='Sanayi Bölgesi', hirochi_raceway='Hirochi Pisti',
  automation_test_track='Automation Test Pisti', derby='Derby Arenası', driver_training='Sürüş Eğitimi',
  cliff='Uçurum', small_grid='Grid', north_wind='North Wind', west_coast_usa_v2='West Coast, ABD',
}

-- durum -----------------------------------------------------------------------
local simT = 0
local units = {}            -- uid -> birim
local vidToUnit = {}        -- araç id -> uid
local unitSeq = 0
local hist = {}             -- araç id -> hız geçmişi
local incident = nil
local crashPending = nil
local lastCrashT = -999
local stateTimer = 0
local uiReady = false

-- yardımcılar ------------------------------------------------------------------
local function send(t, data)
  data = data or {}
  data.t = t
  guihooks.trigger('TepeTelefon', data)
end
local function notify(title, text, app) send('notify', {title=title, text=text, app=app}) end
local function sms(from, text) send('sms', {from=from, text=text}) end

local function rnd(a, b) return a + math.random() * (b - a) end
local function pick(t) return t[math.random(#t)] end
local function clamp(x, a, b) if x < a then return a elseif x > b then return b end return x end
local function hdist(a, b) local dx, dy = a.x - b.x, a.y - b.y return math.sqrt(dx*dx + dy*dy) end
local function hlen(v) return math.sqrt(v.x*v.x + v.y*v.y) end

local function playerVeh() return be:getPlayerVehicle(0) end
local function vpos(v) return vec3(v:getPosition()) end
local function vvel(v) return vec3(v:getVelocity()) end
local function vdir(v) return vec3(v:getDirectionVector()) end
local function getVeh(vid) if not vid then return nil end return be:getObjectByID(vid) end

local function q(cmd, veh) if veh then veh:queueLuaCommand(cmd) end end

local function plate(kind)
  local il = pick({'34', '06', '35', '16', '07', '01', '42', '55', '61', '41'})
  local L = {'A','B','C','D','E','F','G','H','J','K','L','M','N','P','R','S','T','U','V','Y','Z'}
  if kind == 'police' then return il..' A '..math.random(1000, 9999) end
  if kind == 'taxi' then return il..' T '..math.random(1000, 9999) end
  if kind == 'hearse' then return il..' BLD '..math.random(100, 999) end
  if kind == 'fire' then return il..' İTF '..math.random(10, 99) end
  return il..' '..pick(L)..pick(L)..pick(L)..' '..math.random(100, 999)
end

local function levelName()
  local id = getCurrentLevelIdentifier and getCurrentLevelIdentifier() or nil
  if not id then return 'Bilinmeyen konum' end
  return LEVELS[id] or id:gsub('_', ' ')
end

-- araç seçimi ----------------------------------------------------------------
local function modelInfo(model)
  if not core_vehicles or not core_vehicles.getModel then return nil end
  local ok, m = pcall(core_vehicles.getModel, model)
  if ok and type(m) == 'table' and m.model then return m end
  return nil
end

local function findConfig(m, key)
  if type(m.configs) ~= 'table' then return nil end
  if m.configs[key] then return key end
  for k, _ in pairs(m.configs) do
    if string.find(string.lower(k), key, 1, true) then return k end
  end
  return nil
end

local function chooseVehicle(kind)
  for _, c in ipairs(FLEET[kind]) do
    local m = modelInfo(c.model)
    if m then
      if c.cfg then
        local k = findConfig(m, c.cfg)
        if k then return {model=c.model, config='vehicles/'..c.model..'/'..k..'.pc', black=c.black, red=c.red} end
      else
        return {model=c.model, black=c.black, red=c.red}
      end
    end
  end
  return {model='pickup'}
end

-- yol ağı --------------------------------------------------------------------
local function roadNodes()
  if not map or not map.getMap then return {} end
  local md = map.getMap()
  return (md and md.nodes) or {}
end

-- Hedefe en yakın yol noktası: yatay uzaklık + yükseklik farkı cezası
-- (üst geçit / alt yol / paralel yoldaki noktayı seçmesin)
local function closestNode(pos)
  local nodes = roadNodes()
  local best, bd = nil, math.huge
  for name, n in pairs(nodes) do
    local dz = math.abs(n.pos.z - pos.z)
    local d = hdist(n.pos, pos) + (dz > 3 and dz * 8 or 0)
    if d < bd then best, bd = name, d end
  end
  return best
end

local function spotFree(p)
  for _, o in pairs(map.objects or {}) do
    if o.pos and hdist(o.pos, p) < 9 then return false end
  end
  return true
end

-- target çevresinde minD..maxD uzaklıkta bir yol noktası ve hedefe dönük yön bulur
local function findRoadSpot(target, minD, maxD, towardTarget, maxDz)
  local nodes = roadNodes()
  local cands = {}
  for name, n in pairs(nodes) do
    local d = hdist(n.pos, target)
    if d > minD and d < maxD and (n.radius or 3) >= 2 and (not maxDz or math.abs(n.pos.z - target.z) < maxDz) then cands[#cands + 1] = name end
  end
  if #cands == 0 then return nil end
  for _ = 1, 12 do
    local name = pick(cands)
    local n = nodes[name]
    local bestDir, bestScore = nil, -math.huge
    for nb, _ in pairs(n.links or {}) do
      local nn = nodes[nb]
      if nn then
        local dir = nn.pos - n.pos
        dir.z = 0
        if dir:length() > 0.5 then
          dir = dir:normalized()
          local toT = target - n.pos
          toT.z = 0
          local score = towardTarget and dir:dot(toT:normalized()) or math.random()
          if score > bestScore then bestDir, bestScore = dir, score end
        end
      end
    end
    if bestDir then
      local right = bestDir:cross(vec3(0, 0, 1)):normalized()
      local off = math.min((n.radius or 4) * 0.45, 2.2)
      local p = n.pos + right * off + vec3(0, 0, 0.4)
      if spotFree(p) then return p, quatFromDir(bestDir, vec3(0, 0, 1)), name, bestDir end
    end
  end
  return nil
end

-- kameradan görünmeyen nokta ----------------------------------------------------
local function camInfo()
  local cp, cf
  pcall(function() if core_camera and core_camera.getPosition then cp = vec3(core_camera.getPosition()) end end)
  pcall(function() if core_camera and core_camera.getForward then cf = vec3(core_camera.getForward()) end end)
  if not cp then pcall(function() cp = vec3(getCameraPosition()) end) end
  if not cf then pcall(function() cf = quat(getCameraQuat()) * vec3(0, 1, 0) end) end
  local pv = playerVeh()
  if not cp and pv then cp = vpos(pv) + vec3(0, 0, 2) end
  if not cf and pv then cf = vdir(pv) end
  return cp, cf
end

-- kameranın arkasında/yanındaysa ya da arada bina/engel varsa görünmez sayılır
local function hiddenFromCam(p, cp, cf)
  if not cp then return true end
  local to = p + vec3(0, 0, 1.2) - cp
  local L = to:length()
  if L < 1 then return false end
  local dir = to / L
  if cf then
    local f = vec3(cf.x, cf.y, 0)
    local h = vec3(dir.x, dir.y, 0)
    if f:length() > 0.01 and h:length() > 0.01 and f:normalized():dot(h:normalized()) < 0.15 then return true end
  end
  if castRayStatic then
    local ok, hit = pcall(castRayStatic, cp, dir, L)
    if ok and type(hit) == 'number' and hit < L - 4 then return true end
  end
  return false
end

-- birimler -------------------------------------------------------------------
local function unitPublic(u, pp, fwd, right)
  local o = {id=u.id, kind=u.kind, name=u.name, plate=u.plate, driver=u.driver, status=u.status, world=u.world and true or nil,
             dist=u.dist and math.floor(u.dist) or nil, eta=u.eta and math.floor(u.eta) or nil}
  if u.pos and pp then
    local r = u.pos - pp
    o.dx = math.floor(r:dot(right)); o.dy = math.floor(r:dot(fwd))
  end
  return o
end

local function driveTo(u, pos, speed)
  local veh = getVeh(u.vid)
  if not veh then return end
  local node = closestNode(pos)
  u.targetPos = vec3(pos)
  u.targetNode = node
  local spd = speed or (u.emergency and CFG.emergencySpeed or CFG.normalSpeed)
  local cmd = "ai.setMode('manual') ai.setSpeedMode('limit') ai.setSpeed("..spd..") ai.setAvoidCars('on') ai.driveInLane('on')"
  if u.emergency then cmd = cmd .. " ai.setAggression(0.55)" else cmd = cmd .. " ai.setAggression(0.3)" end
  if node then cmd = cmd .. string.format(" ai.setTarget(%q)", node) end
  cmd = cmd .. " input.event('parkingbrake', 0, 2)"
  q(cmd, veh)
end

local function lights(u, lightbar, hazard)
  local veh = getVeh(u.vid)
  if not veh then return end
  q(string.format("pcall(electrics.set_lightbar_signal, %d) pcall(electrics.set_warn_signal, %s) pcall(electrics.setLightsState, 1)",
    lightbar or 0, hazard and 'true' or 'false'), veh)
end

local function stopUnit(u)
  local veh = getVeh(u.vid)
  if not veh then return end
  q("ai.setMode('stop')", veh)
  u.parkAt = simT + 3.5
end

local function parkUnit(u)
  local veh = getVeh(u.vid)
  if not veh then return end
  q("ai.setMode('disabled') input.event('throttle', 0, 2) input.event('brake', 1, 2) input.event('parkingbrake', 1, 2)", veh)
end

local function despawn(u)
  local veh = getVeh(u.vid)
  if veh then pcall(function() veh:delete() end) end
  if u.vid then vidToUnit[u.vid] = nil end
  units[u.id] = nil
end

local function sendAway(u, siren)
  local veh = getVeh(u.vid)
  if not veh then despawn(u) return end
  u.status = 'leaving'
  u.leaveT = simT
  u.parkAt = nil
  q("input.event('brake', 0, 2) input.event('parkingbrake', 0, 2) ai.setMode('traffic') ai.setSpeedMode('legal') ai.setAvoidCars('on')", veh)
  lights(u, siren and 2 or 0, false)
end

local function findUnit(kind, active)
  for _, u in pairs(units) do
    if u.kind == kind and not u.world and (not active or u.status == 'enroute' or u.status == 'onscene' or u.status == 'ride' or u.status == 'board') then return u end
  end
  return nil
end

local function spawnUnit(kind, target, follow)
  local pv = playerVeh()
  local tgt = target or (pv and vpos(pv))
  if not tgt then return nil end
  local choice = chooseVehicle(kind)
  -- önce yakında (70-200 m) ve kameradan görünmeyen bir yol noktası ara
  local p, rot
  local cp, cf = camInfo()
  for _, r in ipairs({{70, 160, 18}, {150, 260, 14}, {240, 420, 10}}) do
    for _ = 1, r[3] do
      local sp, srot = findRoadSpot(tgt, r[1], r[2], true, 10)
      if not sp then break end
      if hiddenFromCam(sp, cp, cf) then p, rot = sp, srot break end
    end
    if p then break end
  end
  if not p then p, rot = findRoadSpot(tgt, CFG.spawnMin, CFG.spawnMax, true) end
  if not p then p, rot = findRoadSpot(tgt, 80, 1500, true) end
  if not p then
    local d = pv and vdir(pv) or vec3(0, 1, 0)
    p = tgt - d * 60 + vec3(0, 0, 0.5)
    rot = quatFromDir(d, vec3(0, 0, 1))
  end
  local opts = {pos=p, rot=rot, autoEnterVehicle=false, cling=true}
  if choice.config then opts.config = choice.config end
  if choice.red and createVehiclePaint then
    pcall(function()
      local paint = createVehiclePaint({x=0.75, y=0.04, z=0.03, w=1}, {0.3, 0.4, 0.9, 0.1})
      opts.paint, opts.paint2, opts.paint3 = paint, paint, paint
    end)
  end
  if choice.black and createVehiclePaint then
    pcall(function()
      local paint = createVehiclePaint({x=0.02, y=0.02, z=0.025, w=1}, {0.6, 0.3, 0.9, 0.1})
      opts.paint, opts.paint2, opts.paint3 = paint, paint, paint
    end)
  end
  local ok, veh = pcall(core_vehicles.spawnNewVehicle, choice.model, opts)
  if not ok or not veh then
    log('E', TAG, 'Araç oluşturulamadı: '..tostring(choice.model)..' '..tostring(veh))
    send('error', {text='Ekip aracı oluşturulamadı ('..tostring(choice.model)..').'})
    return nil
  end
  -- oyuncunun aracı değişmiş olabilir, geri dön
  if pv and playerVeh() ~= pv then pcall(be.enterVehicle, be, 0, pv) end

  unitSeq = unitSeq + 1
  local u = {
    id=unitSeq, kind=kind, vid=veh:getID(), t0=simT, status='enroute',
    emergency=(kind == 'police' or kind == 'ambulance' or kind == 'fire'), follow=follow,
    plate=plate(kind), driver=pick(DRIVERS)..' '..pick(SURN),
  }
  u.name = NAMES[kind]..' '..math.random(2, 48)
  if kind == 'police' then u.name = 'Trafik Ekibi '..math.random(10, 99)..'-'..math.random(1, 9) end
  if kind == 'fire' then u.name = 'İtfaiye '..math.random(1, 24)..'. Grup' end
  units[u.id] = u
  vidToUnit[u.vid] = u.id
  if core_vehicles.setPlateText then pcall(core_vehicles.setPlateText, u.plate, u.vid) end
  driveTo(u, tgt)
  lights(u, u.emergency and 2 or 0, false)
  return u
end

local function teleportNear(u, tgt)
  local veh = getVeh(u.vid)
  if not veh then return end
  local p, rot = findRoadSpot(tgt, 40, 120, true, 6)
  if not p then return end
  if spawn and spawn.safeTeleport then
    pcall(spawn.safeTeleport, veh, p, rot)
  else
    pcall(function() veh:setPosRot(p.x, p.y, p.z, rot.x, rot.y, rot.z, rot.w) end)
  end
  u.t0 = simT - CFG.stuckTime + 60
  driveTo(u, tgt)
end

-- yangın ---------------------------------------------------------------------
local burning = {}       -- araç id -> {t}
local igniteQueue = {}   -- {vid, at}
local worldArrived       -- aşağıda tanımlanır (bağımsız kazalar)
local dispatch           -- aşağıda tanımlanır

local function igniteLater(vid, delay)
  if vid then igniteQueue[#igniteQueue + 1] = {vid = vid, at = simT + delay} end
end

local function extinguishNear(pos, radius)
  local n = 0
  for vid, _ in pairs(burning) do
    local v = getVeh(vid)
    if not v then burning[vid] = nil
    elseif hdist(vpos(v), pos) < radius then
      q("if fire and fire.extinguishVehicle then fire.extinguishVehicle() end", v)
      burning[vid] = nil
      n = n + 1
    end
  end
  return n
end

local function anyBurningNear(pos, radius)
  for vid, _ in pairs(burning) do
    local v = getVeh(vid)
    if v and hdist(vpos(v), pos) < radius then return true end
  end
  return false
end

-- yaralanma modeli -------------------------------------------------------------
local function rollSeverity(dvKmh)
  local r = math.random()
  local t
  if dvKmh < 20 then t = {{'none', .8}, {'hafif', 1}}
  elseif dvKmh < 40 then t = {{'none', .3}, {'hafif', .85}, {'orta', 1}}
  elseif dvKmh < 60 then t = {{'hafif', .4}, {'orta', .8}, {'agir', .97}, {'olu', 1}}
  elseif dvKmh < 85 then t = {{'hafif', .15}, {'orta', .5}, {'agir', .85}, {'olu', 1}}
  else t = {{'orta', .15}, {'agir', .6}, {'olu', 1}} end
  for _, e in ipairs(t) do if r <= e[2] then return e[1] end end
  return 'hafif'
end

local function isTraffic(vid)
  if not gameplay_traffic or not gameplay_traffic.getTrafficData then return false end
  local ok, data = pcall(gameplay_traffic.getTrafficData)
  return ok and type(data) == 'table' and data[vid] ~= nil
end

local function makeIncident(pos, ev)
  incident = {
    id = math.random(10000, 99999), pos = vec3(pos), t = simT, solo = ev.solo, ev = ev,
    patients = {}, dispatched = false, statementDone = false, medDone = false, dead = false,
  }
  -- yalnızca çarpılan araçtaki kişi muayene edilir (oyuncu değil)
  if not ev.solo and ev.occupied then
    table.insert(incident.patients, {who='karsi', name='Karşı sürücü', sev=rollSeverity(ev.otherDv or 0), state='bekliyor', p=0})
  end
  for _, pt in ipairs(incident.patients) do
    if pt.who == 'karsi' then ev.otherSev = pt.sev end
  end
  return incident
end

local function incidentPublic()
  if not incident then return nil end
  local pts = {}
  for _, pt in ipairs(incident.patients) do
    pts[#pts + 1] = {who=pt.who, name=pt.name, state=pt.state, p=math.floor((pt.p or 0) * 100), outcome=pt.outcome, triage=pt.triage}
  end
  return {id=incident.id, solo=incident.solo, dispatched=incident.dispatched, patients=pts, dead=incident.dead,
          statementDone=incident.statementDone, medDone=incident.medDone, ago=math.floor(simT - incident.t)}
end

-- olay yeri tedavisi ------------------------------------------------------------
local DUR = {none=10, hafif=16, orta=26, agir=36, olu=30}
local TRIAGE = {none='yesil', hafif='yesil', orta='sari', agir='kirmizi', olu='kirmizi'}

local function startTreatment(u)
  if not incident or #incident.patients == 0 then
    notify('112 Ambulans', 'Sağlık ekibi olay yerini kontrol etti. Yaralı ya da müdahale gereken kimse yok.', 'med')
    u.leaveAt = simT + 12
    if incident then incident.medDone = true end
    return
  end
  local start = simT + 4
  for _, pt in ipairs(incident.patients) do
    pt.state = 'bekliyor'
    pt.startAt = start
    pt.dur = DUR[pt.sev] * rnd(0.85, 1.2)
    pt.triage = TRIAGE[pt.sev]
    start = start + 3
  end
  incident.ambUnit = u.id
  notify('112 Ambulans', 'Sağlık ekibi olay yerinde. Yaralılara müdahale ediliyor.', 'med')
  send('med_open', {})
end

local function finishPatient(pt)
  local s, r = pt.sev, math.random()
  if pt.force then pt.outcome = pt.force
  elseif s == 'none' then pt.outcome = 'saglam'
  elseif s == 'hafif' then pt.outcome = 'yerinde'
  elseif s == 'orta' then pt.outcome = (r < 0.7) and 'yerinde' or 'hastane'
  elseif s == 'agir' then
    if pt.who == 'sen' then pt.outcome = 'ambulansta'
    else pt.outcome = (r < 0.85) and 'hastane' or 'vefat' end
  elseif s == 'olu' then pt.outcome = (r < 0.85) and 'vefat' or 'kurtarildi' end
  pt.state = 'bitti'
  pt.p = 1
  if pt.outcome == 'vefat' then
    pt.triage = 'siyah'; incident.dead = true
    if not incident.hearseCalled then incident.hearseCalled = true; incident.hearseAt = simT + 6 end
  end
  local TXT = {
    saglam = 'kontrol edildi, sağlığı yerinde.',
    yerinde = 'olay yerinde tedavi edildi.',
    hastane = 'hastaneye kaldırılıyor.',
    ambulansta = 'ambulansta tedavi edildi; hastanede kontrol önerildi.',
    vefat = 'tüm müdahaleye rağmen hayatını kaybetti.',
    kurtarildi = 'ekip son anda hayata döndürdü, hastaneye kaldırılıyor.',
  }
  local txt = TXT[pt.outcome]
  if pt.atCheck then txt = 'nabız ve solunum yok. Olay yerinde ölüm tespit edildi.' end
  notify('112 Ambulans', pt.name..' '..txt, 'med')
end

local function updateTreatment()
  if not incident or incident.medDone or not incident.ambUnit then return end
  local all = true
  for _, pt in ipairs(incident.patients) do
    if pt.state ~= 'bitti' then
      all = false
      if pt.startAt and simT >= pt.startAt then
        if not pt.checked then
          -- önce hayati belirtiler: nabız, solunum, bilinç
          pt.state = 'kontrol'
          pt.p = 0
          if simT - pt.startAt >= 7 then
            pt.checked = true
            if pt.sev == 'olu' and math.random() < 0.85 then
              pt.force = 'vefat'; pt.atCheck = true
              finishPatient(pt)   -- ölüm tespit edildi -> cenaze aracı otomatik
            else
              if pt.sev == 'olu' then pt.sev = 'agir'; pt.dur = DUR.agir end
              notify('112 Ambulans', pt.name..' yaşıyor. Hayati belirtiler alındı, müdahaleye başlandı.', 'med')
              pt.startAt = simT
            end
          end
        else
          pt.state = 'mudahale'
          pt.p = clamp((simT - pt.startAt) / pt.dur, 0, 1)
          if pt.p >= 1 then finishPatient(pt) end
        end
      end
    end
  end
  if not all then return end
  incident.medDone = true
  local u = units[incident.ambUnit]
  local transport, dead = false, false
  for _, pt in ipairs(incident.patients) do
    if pt.outcome == 'hastane' or pt.outcome == 'kurtarildi' then transport = true end
    if pt.outcome == 'vefat' then dead = true end
  end
  if u then
    if transport then u.leaveAt = simT + 6; u.leaveSiren = true
    else u.leaveAt = simT + (dead and 25 or 10) end
  end
  if dead and not incident.hearseSms then
    incident.hearseSms = true
    sms('112 Acil', 'Olay yerindeki karşı sürücü hayatını kaybetti. Savcılık ve 188 Cenaze Hizmetleri bilgilendirildi; cenaze aracı otomatik olarak yönlendirildi.')
  end
end

-- polis ---------------------------------------------------------------------
local function statementPayload()
  local ev = incident.ev
  return {
    incidentId = incident.id, solo = incident.solo, speed = math.floor(ev.speed or 0),
    share = ev.share or 1, playerDv = math.floor(ev.playerDv or 0), otherDv = math.floor(ev.otherDv or 0),
    occupied = ev.occupied, otherSev = ev.otherSev, otherModel = ev.otherModel, manual = ev.manual,
    officer = pick({'Polis Memuru ', 'Komiser Yardımcısı ', 'Polis Memuru '})..pick(DRIVERS)..' '..pick(SURN),
    location = levelName(),
  }
end

local function policeArrived(u)
  if incident and not incident.statementDone then
    incident.policeUnit = u.id
    send('statement', statementPayload())
    notify(u.name, 'Trafik polisi olay yerine geldi. İfaden alınacak.', 'police')
    u.timeoutAt = simT + 300
  else
    send('police_ask', {officer=pick(DRIVERS)..' '..pick(SURN), unit=u.id})
    notify(u.name, 'Polis ekibi yanına geldi.', 'police')
    u.timeoutAt = simT + 240
  end
end

-- araç sağa çekme (kazada karşı araç, polis çevirmesi) ---------------------------
local pulls = {}   -- araç id -> durum

local function startPullOver(vid, canDrive, onParked, delay)
  local veh = getVeh(vid)
  if not veh then return end
  pulls[vid] = {vid = vid, phase = 'hazard', t = simT, canDrive = canDrive, onParked = onParked, delay = delay or 3.5}
  q("pcall(electrics.set_warn_signal, true) ai.setMode('stop')", veh)
end

local function releasePull(vid)
  pulls[vid] = nil
  q("pcall(electrics.set_warn_signal, false) input.event('brake', 0, 2) input.event('parkingbrake', 0, 2) ai.setMode('traffic') ai.setSpeedMode('legal')", getVeh(vid))
end

local function updatePulls()
  for vid, pl in pairs(pulls) do
    local veh = getVeh(vid)
    if not veh then
      pulls[vid] = nil
    elseif pl.phase == 'parked' then
      -- park halindeyken trafik sistemi aracı yeniden sürmesin
      if simT - (pl.holdT or 0) > 5 then
        pl.holdT = simT
        q("ai.setMode('disabled') input.event('throttle', 0, 2) input.event('parkingbrake', 1, 2) pcall(electrics.set_warn_signal, true)", veh)
      end
    else
      local p, spd = vpos(veh), hlen(vvel(veh))
      if pl.phase == 'hazard' and simT - pl.t > pl.delay then
        if not pl.canDrive then
          pl.phase = 'parked'
          if pl.onParked then pl.onParked(p, false) end
        else
          pl.phase = 'pulling'
          pl.t = simT
          -- ileride, aynı yön üzerinde 45-110 m'de uygun bir yol noktası
          local d = vdir(veh); d.z = 0; d = d:normalized()
          local nodes, best, bs = roadNodes(), nil, -math.huge
          for name, n in pairs(nodes) do
            local r = n.pos - p; r.z = 0
            local L = r:length()
            if L > 45 and L < 110 then
              local al = r:normalized():dot(d)
              if al > 0.85 then
                local sc = al * 2 - math.abs(L - 70) / 40 + ((n.radius or 3) > 3.5 and 0.3 or 0)
                if sc > bs then best, bs = name, sc end
              end
            end
          end
          local cmd = "pcall(electrics.set_warn_signal, true) input.event('parkingbrake', 0, 2)"
          if best then
            pl.dest = vec3(nodes[best].pos)
            cmd = cmd .. string.format(" ai.setMode('manual') ai.setTarget(%q) ai.setSpeedMode('limit') ai.setSpeed(6) ai.driveInLane('on') ai.setAvoidCars('on')", best)
          end
          -- BeamNG'nin kendi kenara çekme davranışı varsa onu da kullan
          cmd = cmd .. " if ai.setPullOver then pcall(ai.setPullOver, true) end"
          q(cmd, veh)
        end
      elseif pl.phase == 'pulling' then
        if spd < 0.8 then pl.slowT = pl.slowT or simT else pl.slowT = nil end
        local near = pl.dest and hdist(p, pl.dest) < 14
        if (near and spd < 3) or (pl.slowT and simT - pl.slowT > 2.5 and simT - pl.t > 6) or simT - pl.t > 30 then
          pl.phase = 'parked'
          q("ai.setMode('stop')", veh)
          pl.holdT = simT - 2
          if pl.onParked then pl.onParked(vec3(p), true) end
        end
      end
    end
  end
end

local function incidentPullParked(p, moved)
  if not incident then return end
  if not moved then
    notify('Kaza yeri', 'Çarptığın araç dörtlülerini yaktı ve olduğu yerde kaldı. Sürücü hareket edemiyor.', 'police')
    return
  end
  incident.pos = vec3(p)
  for _, u in pairs(units) do
    if u.status == 'enroute' and not u.follow and u.kind ~= 'taxi' then driveTo(u, incident.pos) end
  end
  notify('Kaza yeri', 'Çarptığın araç dörtlülerini yakıp ileride sağa çekti. Ekipler oraya geliyor.', 'police')
end

-- kaza algılama ------------------------------------------------------------------
local function pushHist(id, v)
  local h = hist[id]
  if not h then h = {}; hist[id] = h end
  h[#h + 1] = {simT, v.x, v.y, v.z}
  while #h > 2 and simT - h[1][1] > 0.6 do table.remove(h, 1) end
end

local function velAgo(id, ago)
  local h = hist[id]
  if not h or #h == 0 then return nil end
  for i = #h, 1, -1 do
    if simT - h[i][1] >= ago then return vec3(h[i][2], h[i][3], h[i][4]) end
  end
  return nil
end

local function onCrash(pv, pp, vNow, vBefore, dv)
  lastCrashT = simT
  local pid = pv:getID()
  local other, od = nil, 11
  for oid, o in pairs(map.objects or {}) do
    if oid ~= pid and o.pos and not vidToUnit[oid] then
      local d = hdist(o.pos, pp)
      if d < od then other, od = oid, d end
    end
  end
  local ev = {speed = hlen(vBefore) * 3.6, playerDv = dv * 3.6, solo = (other == nil)}
  if other then
    local o = map.objects[other]
    local ob = velAgo(other, CFG.crashWindow) or vec3(o.vel or vec3())
    local onow = vec3(o.vel or vec3())
    local odv = hlen(onow - ob)
    local d = o.pos - pp
    d.z = 0
    d = d:normalized()
    local a1 = math.max(0, vBefore:dot(d))
    local a2 = math.max(0, ob:dot(-d))
    ev.share = (a1 + 0.3) / (a1 + a2 + 0.6)
    ev.otherDv = math.max(odv, dv * 0.6) * 3.6
    ev.otherSpeed = hlen(ob) * 3.6
    ev.occupied = (hlen(ob) > 1.5) or isTraffic(other)
    local ov = getVeh(other)
    ev.otherModel = ov and ov.getJBeamFilename and ov:getJBeamFilename() or 'araç'
  else
    ev.share = 1
  end
  -- önceki olay açıksa kapat (ekipler kalırsa yeni olaya bağlanır)
  makeIncident(pp, ev)
  -- sert kazada araç(lar) yanabilir
  if CFG.fireOnCrash then
    local imp = math.max(ev.playerDv or 0, ev.otherDv or 0)
    local chance = imp > 100 and 0.7 or imp > 75 and 0.45 or imp > 58 and 0.2 or 0
    if math.random() < chance then
      incident.fireSoon = true
      local victims = {}
      if other and math.random() < 0.8 then victims[#victims + 1] = other end
      if #victims == 0 or math.random() < 0.45 then victims[#victims + 1] = pv:getID() end
      for _, vid in ipairs(victims) do
        igniteQueue[#igniteQueue + 1] = {vid = vid, at = simT + rnd(4, 11), onFire = function()
          if incident then
            incident.fire = true
            -- alevler yaralının durumunu kötüleştirebilir
            for _, pt in ipairs(incident.patients) do
              if pt.state == 'bekliyor' and math.random() < 0.4 then
                pt.sev = ({none='hafif', hafif='orta', orta='agir', agir='olu', olu='olu'})[pt.sev]
              end
            end
            if incident.dispatched and not findUnit('fire', true) then dispatch({'fire'}, 'yangin') end
          end
        end}
      end
    end
  end
  if other and ev.occupied then
    incident.otherVid = other
    local sev = ev.otherSev
    startPullOver(other, sev ~= 'agir' and sev ~= 'olu', incidentPullParked)
  end
  if not CFG.crashDetect then return end
  crashPending = {deadline = simT + CFG.sosDelay}
  send('crash', {countdown = CFG.sosDelay, speed = math.floor(ev.speed), solo = ev.solo})
end

-- Darbe farklı sürelerde emilebilir: kısa/orta/uzun pencerelerde yatay hız değişimine bak.
-- Eşikler sert frenden (≈1 g) çok yüksek, gerçek çarpışmadan düşük seçildi.
local CRASH_WIN = { {0.12, 6.0}, {0.25, 7.5}, {0.45, 10.5} }

local function checkCrash(pv)
  local pid = pv:getID()
  local v = vvel(pv)
  pushHist(pid, v)
  if crashPending or simT - lastCrashT < CFG.crashCooldown then return end
  -- ekipler hâlâ önceki kaza için yoldaysa/oradaysa yeni olay açma
  if incident and incident.dispatched and simT - incident.t < 90 then return end
  local best, bestBefore = 0, nil
  for _, w in ipairs(CRASH_WIN) do
    local before = velAgo(pid, w[1])
    if before then
      local dv = hlen(v - before)
      local need = w[2] * (CFG.crashSens or 1)
      if dv > need and hlen(before) > 3 and dv / need > best then best, bestBefore = dv / need, before end
    end
  end
  if bestBefore then
    onCrash(pv, vpos(pv), v, bestBefore, hlen(v - bestBefore))
  end
end

-- çağrılar --------------------------------------------------------------------
function dispatch(services, reason)   -- yukarıda local olarak bildirildi
  local pv = playerVeh()
  if not pv then return end
  local pp = vpos(pv)
  if reason == 'kaza' and (not incident or simT - incident.t > CFG.incidentLife) then
    -- algılanmamış kaza: yakındaki araca bak
    local other, od = nil, 15
    for oid, o in pairs(map.objects or {}) do
      if oid ~= pv:getID() and o.pos and not vidToUnit[oid] then
        local d = hdist(o.pos, pp)
        if d < od then other, od = oid, d end
      end
    end
    local ev = {speed = 0, playerDv = 0, solo = other == nil, share = other and 0.5 or 1, manual = true}
    if other then ev.occupied = isTraffic(other) ev.otherDv = 15 end
    makeIncident(pp, ev)
  end
  local target, follow = pp, true
  if incident and (reason == 'kaza' or reason == 'saglik' or reason == 'auto' or reason == 'cenaze' or reason == 'yangin') and simT - incident.t < CFG.incidentLife then
    target, follow = incident.pos, false
    incident.dispatched = true
  end
  local out = {}
  for _, kind in ipairs(services) do
    local ex = findUnit(kind, true)
    if ex then
      out[#out + 1] = unitPublic(ex)
      notify(ex.name, 'Ekip zaten yolda ya da olay yerinde.', kind)
    else
      local u = spawnUnit(kind, target, follow)
      if u then
        local d = hdist(vpos(getVeh(u.vid)), target)
        u.dist = d
        u.eta = d * 1.3 / (u.emergency and 16 or 10)
        u.reason = reason
        out[#out + 1] = unitPublic(u)
      end
    end
  end
  send('dispatched', {units = out, reason = reason})
end

local function unitArrived(u)
  u.status = 'onscene'
  u.arriveT = simT
  stopUnit(u)
  if u.world and worldArrived and u.kind ~= 'fire' then worldArrived(u) return end
  if u.kind == 'police' then
    policeArrived(u)
  elseif u.kind == 'ambulance' then
    startTreatment(u)
  elseif u.kind == 'fire' then
    local at = u.targetPos or u.pos
    -- oyunun kendi yangınlarını bilemeyiz: ihbar varsa ya da biz yaktıysak yangın var say; her durumda söndür
    local reported = u.reason == 'yangin' or anyBurningNear(at, 80) or anyBurningNear(vpos(getVeh(u.vid)), 80)
      or (incident and (incident.fire or incident.fireSoon) and hdist(incident.pos, at) < 120)
    u.reported = reported
    u.extUntil = simT + (reported and rnd(14, 22) or 8)
    notify(u.name, reported and 'İtfaiye olay yerinde. Yangına köpükle müdahale ediliyor…' or 'İtfaiye olay yerinde. Araçlar kontrol ediliyor, soğutma yapılıyor…', 'fire')
  elseif u.kind == 'hearse' then
    lights(u, 0, true)
    u.leaveAt = simT + 28
    notify('188 Cenaze Hizmetleri', 'Cenaze aracı geldi. Ekip naaşı teslim alıyor.', 'hearse')
  elseif u.kind == 'taxi' then
    lights(u, 0, true)
    u.waitUntil = simT + CFG.taxiWait
    send('taxi_arrived', {plate=u.plate, driver=u.driver})
  end
end

-- taksi yolculuğu ---------------------------------------------------------------
local ride = nil

local function taxiBoard()
  local u = findUnit('taxi', true)
  local pv = playerVeh()
  if not u or u.status ~= 'onscene' or not pv then send('error', {text='Bekleyen taksi yok.'}) return end
  local tv = getVeh(u.vid)
  local d = hdist(vpos(tv), vpos(pv))
  if d > 25 then send('error', {text='Taksiye biraz daha yaklaş ('..math.floor(d)..' m).'}) return end
  ride = {uid=u.id, ownVid=pv:getID(), km=0, last=vpos(tv), fare=75}
  u.status = 'board'
  lights(u, 0, false)
  pcall(be.enterVehicle, be, 0, tv)
  send('ride', {phase='dest'})
end

local function taxiDest(km)
  if not ride then return end
  local u = units[ride.uid]
  if not u then ride = nil return end
  local tv = getVeh(u.vid)
  local p = vpos(tv)
  local want = (km or 3) * 1000 * 0.7
  local nodes, best, bd = roadNodes(), nil, math.huge
  for name, n in pairs(nodes) do
    local err = math.abs(hdist(n.pos, p) - want) + math.random() * 120
    if err < bd and (n.radius or 3) >= 2.5 then best, bd = name, err end
  end
  if not best then send('error', {text='Bu haritada gidilecek yol bulunamadı.'}) return end
  ride.dest = vec3(nodes[best].pos)
  ride.destKm = km
  u.status = 'ride'
  driveTo(u, ride.dest, 18)
  send('ride', {phase='go'})
end

local function taxiExit(arrived)
  if not ride then return end
  local u = units[ride.uid]
  local fare = math.floor(ride.fare + 0.5)
  send('ride_end', {km = math.floor(ride.km * 10) / 10, fare = fare, arrived = arrived})
  if u then
    stopUnit(u)
    u.leaveAt = simT + 6
    u.status = 'onscene'
  end
  local own = getVeh(ride.ownVid)
  ride = nil
  local walked = false
  if gameplay_walk then
    if gameplay_walk.setWalkingMode then walked = pcall(gameplay_walk.setWalkingMode, true)
    elseif gameplay_walk.toggleWalkingMode then walked = pcall(gameplay_walk.toggleWalkingMode) end
  end
  if not walked and own then pcall(be.enterVehicle, be, 0, own) end
end

local function updateRide()
  if not ride then return end
  local u = units[ride.uid]
  local tv = u and getVeh(u.vid)
  if not tv then ride = nil send('ride_end', {km=0, fare=0}) return end
  local p = vpos(tv)
  local step = hdist(p, ride.last)
  if step < 50 then ride.km = ride.km + step / 1000 end
  ride.last = p
  ride.fare = 75 + ride.km * 45
  if ride.dest then
    ride.rem = hdist(p, ride.dest)
    if ride.rem < 30 and hlen(vvel(tv)) < 2 then taxiExit(true) end
  end
end

-- =====================================================================
-- MESLEK: POLİS / AMBULANS olarak oynama
-- Dünya işleri burada (araçlar, işaret, kovalamaca, nakil); puan ve para arayüzde.
-- =====================================================================
-- PIT / sıkıştırma algılama --------------------------------------------------
-- st: takip durumu tablosu. 'pit' = araç kısa sürede 65°+ döndü ve az önce temas vardı,
-- 'stop' = 18 m içinde 3 sn neredeyse durdu (önü kesildi / sıkıştırıldı).
local function yawOf(v) local d = vdir(v) return math.atan2(d.y, d.x) end
local function pitCheck(st, tv, pv)
  local tp, ts = vpos(tv), hlen(vvel(tv))
  local d = hdist(tp, vpos(pv))
  st.yh = st.yh or {}
  table.insert(st.yh, {simT, yawOf(tv)})
  while #st.yh > 2 and simT - st.yh[1][1] > 1.6 do table.remove(st.yh, 1) end
  if d < 7.5 then st.contactT = simT end
  local old = st.yh[1]
  if old and simT - old[1] > 0.6 then
    local dy = math.abs(st.yh[#st.yh][2] - old[2])
    if dy > math.pi then dy = 2 * math.pi - dy end
    if dy > math.rad(65) and st.contactT and simT - st.contactT < 2.5 then return 'pit', d end
  end
  if d < 18 and ts < 3 then st.slowT = st.slowT or simT else st.slowT = nil end
  if st.slowT and simT - st.slowT > 3 then return 'stop', d end
  return nil, d
end

local function holdStopped(vid)
  q("ai.setMode('disabled') input.event('throttle', 0, 2) input.event('brake', 1, 2) input.event('parkingbrake', 1, 2) pcall(electrics.set_warn_signal, true)", getVeh(vid))
  pulls[vid] = {vid = vid, phase = 'parked', holdT = simT, t = simT}   -- trafik sistemi yeniden sürmesin
end

local duty = {role = 'sivil', lights = 0, nextCallAt = nil}
local job = nil
local offer = nil
local leftovers = {}   -- görev bitince temizlenecek araçlar
local CIV = {'midsize', 'pessima', 'covet', 'fullsize', 'sunburst', 'vivace', 'etk800', 'legran', 'pickup', 'van', 'bluebuck', 'moonhawk'}
local STREETS = {'Atatürk Cd.', 'Cumhuriyet Blv.', 'İnönü Cd.', 'Sahil Yolu', 'Fevzi Çakmak Cd.', 'Gazi Blv.', 'Mimar Sinan Cd.', 'Lale Sk.', 'Çevre Yolu', 'Sanayi Cd.'}
local HOSPITALS = {'Devlet Hastanesi Acil', 'Şehir Hastanesi Acil', 'Eğitim ve Araştırma Hastanesi', 'Üniversite Hastanesi Acil'}

local function civModel()
  for _ = 1, 12 do local m = pick(CIV); if modelInfo(m) then return m end end
  return 'pickup'
end

local function setMarker(pos)
  if not core_groundMarkers then return end
  if core_groundMarkers.setPath then pcall(core_groundMarkers.setPath, pos)
  elseif core_groundMarkers.setFocus then pcall(core_groundMarkers.setFocus, pos) end
end

local function rotDir(d, deg)
  local a = math.rad(deg)
  return vec3(d.x * math.cos(a) - d.y * math.sin(a), d.x * math.sin(a) + d.y * math.cos(a), 0)
end

local function spawnProp(pos, dir, park)
  local pv = playerVeh()
  local opts = {pos = pos, rot = quatFromDir(dir, vec3(0, 0, 1)), autoEnterVehicle = false, cling = true}
  local model = civModel()
  local ok, veh = pcall(core_vehicles.spawnNewVehicle, model, opts)
  if pv and playerVeh() ~= pv then pcall(be.enterVehicle, be, 0, pv) end
  if not ok or not veh then return nil end
  local vid = veh:getID()
  local pl = plate('civ')
  if core_vehicles.setPlateText then pcall(core_vehicles.setPlateText, pl, vid) end
  if park ~= false then
    q("ai.setMode('disabled') input.event('parkingbrake', 1, 2) pcall(electrics.set_warn_signal, true)", veh)
  end
  return vid, pl, model
end

local function cleanupJob(mode)
  if not job then return end
  for _, vid in ipairs(job.props or {}) do
    leftovers[#leftovers + 1] = {vid = vid, t = simT, mode = mode or 'delete'}
    if mode == 'release' then releasePull(vid) end
  end
  setMarker(nil)
  job = nil
  duty.nextCallAt = simT + rnd(25, 50)
end

local function updateLeftovers(pp)
  for i = #leftovers, 1, -1 do
    local l = leftovers[i]
    local veh = getVeh(l.vid)
    if not veh then table.remove(leftovers, i)
    elseif (pp and hdist(vpos(veh), pp) > 220) or simT - l.t > 180 then
      pcall(function() veh:delete() end)
      table.remove(leftovers, i)
    end
  end
end

local function jobVehicleFor(role)
  return chooseVehicle(role == 'polis' and 'police' or 'ambulance')
end

local function setRole(role)
  local pv = playerVeh()
  if role == duty.role then return end
  if job then cleanupJob('delete') end
  offer = nil
  if role == 'sivil' then
    duty.role = 'sivil'
    if duty.prevModel and core_vehicles.replaceVehicle then
      pcall(core_vehicles.replaceVehicle, duty.prevModel, {config = duty.prevConfig})
    end
    send('duty', {role = 'sivil'})
    return
  end
  if duty.role == 'sivil' and pv then
    duty.prevModel = pv.getJBeamFilename and pv:getJBeamFilename() or nil
    duty.prevConfig = pv.partConfig
  end
  duty.role = role
  duty.lights = 0
  local c = jobVehicleFor(role)
  if core_vehicles.replaceVehicle then
    local ok = pcall(core_vehicles.replaceVehicle, c.model, {config = c.config})
    if not ok then send('error', {text = 'Görev aracı yüklenemedi, mevcut aracınla devam ediyorsun.'}) end
  end
  local nv = playerVeh()
  local pl = plate(role == 'polis' and 'police' or 'ambulance')
  if nv and core_vehicles.setPlateText then pcall(core_vehicles.setPlateText, pl, nv:getID()) end
  duty.nextCallAt = simT + 12
  send('duty', {role = role, plate = pl})
end

local function setLights(n)
  duty.lights = n
  q(string.format("pcall(electrics.set_lightbar_signal, %d)", n), playerVeh())
end

local function makeOffer(pp)
  local p, _, _, dir = findRoadSpot(pp, 450, 1300, false)
  if not p then p, _, _, dir = findRoadSpot(pp, 150, 2500, false) end
  if not p then return end
  local kinds = duty.role == 'polis' and {'kaza', 'kaza', 'kacak'} or {'kaza', 'kaza', 'fenalik'}
  local kind = pick(kinds)
  offer = {kind = kind, pos = p, dir = dir or vec3(0, 1, 0), t = simT, address = pick(STREETS)..' No:'..math.random(2, 180),
           dist = math.floor(hdist(p, pp))}
  send('job_offer', {kind = kind, role = duty.role, address = offer.address, dist = offer.dist, level = levelName()})
end

local function acceptOffer()
  if not offer then return end
  local o = offer
  offer = nil
  job = {kind = o.kind, role = duty.role, pos = o.pos, phase = 'goto', t0 = simT, props = {}, cars = {}, address = o.address}
  local d = o.dir:normalized()
  if o.kind == 'kaza' then
    -- iki araç: biri yola çapraz, diğeri önünde
    local v1, p1, m1 = spawnProp(o.pos, rotDir(d, 28), true)
    local v2, p2, m2 = spawnProp(o.pos + d * 6.5 + rotDir(d, 90) * 0.8, rotDir(d, -12), true)
    for _, e in ipairs({{v1, p1, m1}, {v2, p2, m2}}) do
      if e[1] then table.insert(job.props, e[1]); table.insert(job.cars, {plate = e[2], model = e[3]}) end
    end
  elseif o.kind == 'fenalik' then
    local right = d:cross(vec3(0, 0, 1)):normalized()
    local v1, p1, m1 = spawnProp(o.pos + right * 1.2, d, true)
    if v1 then table.insert(job.props, v1); table.insert(job.cars, {plate = p1, model = m1}) end
  elseif o.kind == 'kacak' then
    local v1, p1, m1 = spawnProp(o.pos, d, false)
    if v1 then
      table.insert(job.props, v1); table.insert(job.cars, {plate = p1, model = m1})
      job.target = v1
      q("ai.setMode('random') ai.setSpeedMode('limit') ai.setSpeed(22) ai.setAggression(0.6)", getVeh(v1))
    end
  end
  setMarker(job.pos)
  send('job_start', {kind = job.kind, role = job.role, address = job.address, cars = job.cars})
end

local function updateDuty(pv, pp)
  updateLeftovers(pp)
  if duty.role == 'sivil' or not pp then return end
  if offer and simT - offer.t > 35 then
    offer = nil
    send('job_offer_expired', {})
    duty.nextCallAt = simT + rnd(20, 40)
  end
  if not job and not offer and duty.nextCallAt and simT > duty.nextCallAt then makeOffer(pp) end
  if not job then return end

  local spd = hlen(vvel(pv))
  if job.kind == 'kacak' then
    local tv = getVeh(job.target)
    if not tv then send('job_failed', {reason = 'Şüpheli araç kayboldu.'}) cleanupJob('delete') return end
    local tp, ts = vpos(tv), hlen(vvel(tv))
    local d = hdist(tp, pp)
    job.dist = d
    if simT - (job.mkT or 0) > 1 then job.mkT = simT; setMarker(tp) end
    if job.phase == 'goto' and d < 150 then
      job.phase = 'chase'
      job.tChase = simT
      q(string.format("ai.setMode('flee') if ai.setTargetObjectID then pcall(ai.setTargetObjectID, %d) end ai.setSpeedMode('off') ai.setAggression(0.85)", pv:getID()), tv)
      notify('Telsiz', 'Şüpheli seni fark etti ve kaçıyor! Sirenleri aç, aracı durdur.', 'police')
    elseif job.phase == 'chase' then
      job.pit = job.pit or {}
      local how = pitCheck(job.pit, tv, pv)
      if how then
        job.phase = 'caught'
        holdStopped(job.target)
        setMarker(nil)
        send('job_caught', {secs = math.floor(simT - job.tChase), plate = job.cars[1] and job.cars[1].plate, model = job.cars[1] and job.cars[1].model, pit = how == 'pit'})
      end
      if d > 1100 then job.farT = job.farT or simT else job.farT = nil end
      if (job.farT and simT - job.farT > 25) or simT - job.tChase > 360 then
        send('job_failed', {reason = 'Şüpheli gözden kayboldu. Ekipler aramaya devam edecek.'})
        cleanupJob('delete')
      end
    end
    return
  end

  if job.phase == 'goto' then
    job.dist = hdist(job.pos, pp)
    if job.dist < 30 and spd < 2.5 then
      job.phase = 'scene'
      setMarker(nil)
      send('job_scene', {kind = job.kind, role = job.role, cars = job.cars, secs = math.floor(simT - job.t0)})
    end
  elseif job.phase == 'transport' then
    job.dist = hdist(job.hospital, pp)
    if job.dist < 25 and spd < 2 then
      job.phase = 'delivered'
      setMarker(nil)
      send('job_hospital', {secs = math.floor(simT - job.tTransport), limit = job.limit, name = job.hospitalName})
    end
  end
end

local function jobLoad()
  -- ambulans: hasta(lar) ambulansa alındı, en yakın hastaneye
  if not job then return end
  local pv = playerVeh()
  if not pv then return end
  local pp = vpos(pv)
  local p = findRoadSpot(pp, 900, 2200, false) or findRoadSpot(pp, 300, 4000, false)
  if not p then send('job_hospital', {secs = 0, limit = 1, name = pick(HOSPITALS)}) return end
  job.hospital = p
  job.hospitalName = pick(HOSPITALS)
  job.phase = 'transport'
  job.tTransport = simT
  job.limit = math.floor(hdist(p, pp) * 1.4 / 13 + 45)
  setMarker(p)
  send('job_transport', {name = job.hospitalName, dist = math.floor(hdist(p, pp)), limit = job.limit})
end

local function policePullover()
  local pv = playerVeh()
  if not pv then return end
  local pp, fwd = vpos(pv), vdir(pv)
  fwd.z = 0; fwd = fwd:normalized()
  local best, bd = nil, 70
  for oid, o in pairs(map.objects or {}) do
    if oid ~= pv:getID() and o.pos and not vidToUnit[oid] and not pulls[oid] then
      local r = o.pos - pp; r.z = 0
      local L = r:length()
      if L < bd and L > 3 and r:normalized():dot(fwd) > 0.6 then best, bd = oid, L end
    end
  end
  if not best then send('error', {text = 'Önünde durdurulacak araç yok. 70 m içinde, tam önündeki araca bak.'}) return end
  duty.stopVid = best
  setLights(2)
  local mdl = getVeh(best).getJBeamFilename and getVeh(best):getJBeamFilename() or 'araç'
  local pl = plate('civ')
  send('stop_wait', {model = mdl})
  if math.random() < (CFG.fleeChance or 0.3) then
    -- önce uyuyormuş gibi yavaşlar, sonra gaza basıp kaçar
    q("pcall(electrics.set_warn_signal, true) ai.setMode('stop')", getVeh(best))
    duty.chase = {vid = best, phase = 'fake', fleeAt = simT + rnd(2, 4.5), model = mdl, plate = pl}
    return
  end
  startPullOver(best, true, function(p)
    send('stop_ready', {model = mdl, plate = pl})
  end, 1.2)
end

local function updateStopChase(pv)
  local c = duty.chase
  if not c or not pv then return end
  local tv = getVeh(c.vid)
  if not tv then duty.chase = nil send('stop_escaped', {reason = 'Araç gözden kayboldu.'}) setMarker(nil) return end
  if c.phase == 'fake' and simT > c.fleeAt then
    c.phase = 'flee'
    c.t0 = simT
    q(string.format("pcall(electrics.set_warn_signal, false) input.event('parkingbrake', 0, 2) ai.setMode('flee') if ai.setTargetObjectID then pcall(ai.setTargetObjectID, %d) end ai.setSpeedMode('off') ai.setAggression(0.9) ai.setAvoidCars('on')", pv:getID()), tv)
    send('stop_flee', {model = c.model, plate = c.plate})
    notify('Telsiz', c.model..' dur ihtarına uymadı ve kaçıyor! PIT manevrasıyla durdur.', 'police')
  elseif c.phase == 'flee' then
    local how, d = pitCheck(c, tv, pv)
    c.dist = d
    c.spd = hlen(vvel(tv)) * 3.6
    if simT - (c.mkT or 0) > 1 then c.mkT = simT; setMarker(vpos(tv)) end
    if how then
      holdStopped(c.vid)
      setMarker(nil)
      send('stop_ready', {model = c.model, plate = c.plate, suspect = true, pit = how == 'pit', secs = math.floor(simT - c.t0)})
      duty.chase = nil
      return
    end
    if d > 1000 then c.farT = c.farT or simT else c.farT = nil end
    if (c.farT and simT - c.farT > 20) or simT - c.t0 > 300 then
      q("ai.setMode('traffic') ai.setSpeedMode('legal')", tv)
      setMarker(nil)
      duty.chase = nil
      duty.stopVid = nil
      send('stop_escaped', {reason = 'Şüpheli araç gözden kayboldu. Plakası tüm ekiplere bildirildi.'})
    end
  end
end

local function dutyPublic(pp)
  local o = {role = duty.role, lights = duty.lights}
  if duty.chase and duty.chase.phase == 'flee' then o.chase = {dist = duty.chase.dist and math.floor(duty.chase.dist) or nil, spd = duty.chase.spd and math.floor(duty.chase.spd) or nil} end
  if offer then o.offer = {kind = offer.kind, address = offer.address, dist = offer.dist, left = math.max(0, math.floor(35 - (simT - offer.t)))} end
  if job then
    o.job = {kind = job.kind, phase = job.phase, address = job.address, dist = job.dist and math.floor(job.dist) or nil,
             tleft = job.phase == 'transport' and math.floor(job.limit - (simT - job.tTransport)) or nil}
  end
  return o
end

-- =====================================================================
-- OYUNCUDAN BAĞIMSIZ KAZALAR
-- Bir araç şeritte durur, arkadan gelen araç (yapay zekâ, araçlardan kaçmıyor) ona gerçekten çarpar.
-- Ardından ekipler (ambulans, polis, gerekirse itfaiye, nadiren cenaze aracı) olay yerine gider.
-- =====================================================================
local worldEv = nil
local worldSeq = 0
local nextWorldAt = nil

local function nodeAhead(p, dir, minA, maxA)
  local best, bs = nil, math.huge
  for name, n in pairs(roadNodes()) do
    local r = n.pos - p; r.z = 0
    local along = r:dot(dir)
    if along > minA and along < maxA then
      local lat = (r - dir * along):length()
      if lat < 7 and lat < bs then best, bs = name, lat end
    end
  end
  return best
end

local function roadNear(p, maxD)
  for _, n in pairs(roadNodes()) do
    if hdist(n.pos, p) < maxD and math.abs(n.pos.z - p.z) < 3 then return true end
  end
  return false
end

local function startWorldAccident(pp)
  for _ = 1, 10 do
    local p, _, _, dir = findRoadSpot(pp, 280, 750, false)
    if not p or not dir then return end
    local back = p - dir * 55
    if roadNear(back, 7) and spotFree(back) then
      local ahead = nodeAhead(p, dir, 25, 90)
      local bVid, bPlate = spawnProp(p, dir, false)
      if not bVid then return end
      q("ai.setMode('disabled') input.event('parkingbrake', 1, 2)", getVeh(bVid))
      local aVid, aPlate = spawnProp(back + vec3(0, 0, 0.2), dir, false)
      if not aVid then pcall(function() getVeh(bVid):delete() end) return end
      local speed = rnd(13, 22)   -- ~47-80 km/s
      local cmd = string.format("ai.setMode('manual') ai.setSpeedMode('set') ai.setSpeed(%.1f) ai.setAvoidCars('off') ai.driveInLane('on') ai.setAggression(0.9)", speed)
      if ahead then cmd = cmd .. string.format(" ai.setTarget(%q)", ahead) end
      q(cmd, getVeh(aVid))
      worldSeq = worldSeq + 1
      worldEv = {id = worldSeq, pos = vec3(p), a = aVid, b = bVid, phase = 'approach', t = simT,
                 address = pick(STREETS), plates = {aPlate, bPlate}}
      return
    end
  end
end

local function worldDispatch(ev, kinds)
  for _, k in ipairs(kinds) do
    local u = spawnUnit(k, ev.pos, false)
    if u then u.world = ev.id; u.reason = 'dunya' end
  end
end

worldArrived = function(u)
  local ev = worldEv
  lights(u, u.emergency and 2 or 0, not u.emergency)
  if u.kind == 'police' then
    u.leaveAt = simT + rnd(55, 85)
  elseif u.kind == 'ambulance' then
    u.leaveAt = simT + rnd(30, 45)
    if ev and ev.death and not ev.hearseSent then
      ev.hearseAt = simT + 35
    elseif ev and math.random() < 0.55 then
      u.leaveSiren = true   -- yaralıyı hastaneye götürüyor
    end
  elseif u.kind == 'hearse' then
    u.leaveAt = simT + 28
  end
end

local function updateWorld(pp)
  if not CFG.worldAcc or not pp then return end
  if not worldEv then
    if not nextWorldAt then nextWorldAt = simT + rnd(120, 200) end
    if simT > nextWorldAt and duty.role == 'sivil' then
      nextWorldAt = simT + CFG.worldEvery * rnd(0.7, 1.4)
      startWorldAccident(pp)
    end
    return
  end
  local ev = worldEv
  local av, bv = getVeh(ev.a), getVeh(ev.b)
  if ev.phase == 'approach' then
    if not av or not bv then worldEv = nil return end
    local aspd = hlen(vvel(av))
    ev.maxSpd = math.max(ev.maxSpd or 0, aspd)
    local before = velAgo(ev.a, 0.25)
    local hit = before and hlen(vvel(av) - before) > 5
    local close = hdist(vpos(av), vpos(bv)) < 6.5
    if hit or (close and aspd < 2) or simT - ev.t > 30 then
      ev.phase = 'crashed'
      ev.tCrash = simT
      local imp = (ev.maxSpd or 0) * 3.6
      for _, vid in ipairs({ev.a, ev.b}) do
        q("ai.setMode('disabled') input.event('throttle', 0, 2) input.event('brake', 1, 2) input.event('parkingbrake', 1, 2) pcall(electrics.set_warn_signal, true)", getVeh(vid))
      end
      local fireChance = imp > 70 and 0.45 or imp > 55 and 0.22 or 0
      ev.fire = math.random() < fireChance
      ev.death = imp > 60 and math.random() < 0.12
      if ev.fire then igniteLater(ev.a, rnd(4, 9)) end
      ev.dispatchAt = simT + rnd(3, 6)
    end
  elseif ev.phase == 'crashed' then
    if ev.dispatchAt and simT > ev.dispatchAt then
      ev.dispatchAt = nil
      local kinds = {'ambulance', 'police'}
      if ev.fire then kinds[#kinds + 1] = 'fire' end
      worldDispatch(ev, kinds)
      local d = math.floor(hdist(ev.pos, pp))
      send('traffic', {address = ev.address, dist = d, fire = ev.fire})
    end
    if ev.hearseAt and simT > ev.hearseAt then
      ev.hearseAt = nil; ev.hearseSent = true
      worldDispatch(ev, {'hearse'})
    end
    -- bitti mi? bu olayın ekipleri gittiyse araçları temizlik listesine al
    local busy = false
    for _, u in pairs(units) do if u.world == ev.id then busy = true end end
    if not ev.dispatchAt and not ev.hearseAt and not busy and simT - ev.tCrash > 40 then
      leftovers[#leftovers + 1] = {vid = ev.a, t = simT, mode = 'delete'}
      leftovers[#leftovers + 1] = {vid = ev.b, t = simT, mode = 'delete'}
      worldEv = nil
    elseif simT - ev.tCrash > 600 then
      worldEv = nil
    end
  end
end

-- ana döngü -------------------------------------------------------------------
local function sendState()
  local pv = playerVeh()
  local pp, fwd, right
  if pv then
    pp = vpos(pv)
    fwd = vdir(pv); fwd.z = 0
    if fwd:length() < 0.01 then fwd = vec3(0, 1, 0) end
    fwd = fwd:normalized()
    right = fwd:cross(vec3(0, 0, 1)):normalized()
  end
  local list = {}
  for _, u in pairs(units) do list[#list + 1] = unitPublic(u, pp, fwd, right) end
  table.sort(list, function(a, b) return a.id < b.id end)
  local r = nil
  if ride then
    r = {km = math.floor(ride.km * 100) / 100, fare = math.floor(ride.fare * 10) / 10,
         rem = ride.rem and math.floor(ride.rem) or nil, going = ride.dest ~= nil}
  end
  local spd = pv and math.floor(hlen(vvel(pv)) * 3.6) or 0
  send('state', {units = list, incident = incidentPublic(), ride = r, level = levelName(), speed = spd, duty = dutyPublic(pp),
                 x = pp and math.floor(pp.x) or 0, y = pp and math.floor(pp.y) or 0,
                 crash = crashPending and math.max(0, math.ceil(crashPending.deadline - simT)) or nil})
end

local function updateUnits(pv)
  local pp = pv and vpos(pv)
  for _, u in pairs(units) do
    local veh = getVeh(u.vid)
    if not veh then
      units[u.id] = nil
      vidToUnit[u.vid] = nil
    else
      local p = vpos(veh)
      u.pos = p
      local spd = hlen(vvel(veh))
      if u.parkAt and simT >= u.parkAt then u.parkAt = nil; if u.status == 'onscene' then parkUnit(u) end end

      if u.status == 'enroute' then
        local tgt = u.targetPos
        if u.follow and pp then
          if hdist(pp, u.targetPos) > 50 then driveTo(u, pp) end
          tgt = pp
        end
        local d = hdist(p, tgt)
        u.dist = d
        local est = d * 1.25 / math.max(spd, u.emergency and 13 or 8)
        u.eta = u.eta and (u.eta * 0.9 + est * 0.1) or est
        if spd < 1 then u.slowT = u.slowT or simT else u.slowT = nil end
        -- son 60 m: yavaşla, yanına sakin yanaşsın
        if d < 60 and not u.near then u.near = true; q("ai.setSpeed(7)", veh) end
        if d >= 60 and u.near and d > 90 then u.near = false; q("ai.setSpeed("..(u.emergency and CFG.emergencySpeed or CFG.normalSpeed)..")", veh) end
        if d < CFG.arriveDist then
          unitArrived(u)
        elseif u.slowT and simT - u.slowT > 5 and d < 35 and simT - u.t0 > 10 then
          unitArrived(u)      -- yol bitti, yeterince yakın
        elseif u.slowT and simT - u.slowT > 10 and simT - u.t0 > 15 then
          u.slowT = nil
          local moved = false
          if d < 160 then
            -- yolun sonunda takıldı: yalnızca kameradan görünmüyorsa hedefin yanına yanaştır
            local cp, cf = camInfo()
            for _ = 1, 8 do
              local sp, srot = findRoadSpot(tgt, 12, 40, true, 4)
              if sp and hiddenFromCam(sp, cp, cf) and hiddenFromCam(p, cp, cf) then
                if spawn and spawn.safeTeleport then pcall(spawn.safeTeleport, veh, sp, srot)
                else pcall(function() veh:setPosRot(sp.x, sp.y, sp.z, srot.x, srot.y, srot.z, srot.w) end) end
                moved = true
                break
              end
            end
          end
          if moved then unitArrived(u) else driveTo(u, tgt) end
        elseif simT - u.t0 > CFG.stuckTime then
          teleportNear(u, tgt)
        end
      elseif u.status == 'onscene' then
        if u.kind == 'fire' and u.extUntil and simT > u.extUntil then
          u.extUntil = nil
          local n = extinguishNear(u.targetPos or p, 70) + extinguishNear(p, 70)
          -- listede olmayan (oyunun kendi) yangınlar için: çevredeki tüm araçlara söndürme uygula
          local centers = {p, u.targetPos}
          for oid, o in pairs(map.objects or {}) do
            if o.pos and not vidToUnit[oid] then
              for _, c in ipairs(centers) do
                if c and hdist(o.pos, c) < 70 then q("if fire and fire.extinguishVehicle then fire.extinguishVehicle() end", getVeh(oid)) break end
              end
            end
          end
          if incident then incident.fire = nil; incident.fireSoon = nil end
          notify(u.name, (n > 0 or u.reported) and 'Yangın söndürüldü. Soğutma yapıldı, olay yeri güvenli.' or 'Araçlar kontrol edildi ve soğutuldu. Olay yeri güvenli.', 'fire')
          u.leaveAt = simT + 14
        end
        if u.kind == 'taxi' and u.waitUntil and simT > u.waitUntil and not ride then
          u.waitUntil = nil
          sendAway(u, false)
          send('taxi_left', {})
        elseif u.timeoutAt and simT > u.timeoutAt then
          sendAway(u, false)
        elseif u.leaveAt and simT > u.leaveAt then
          if u.kind == 'hearse' then sms('188 Cenaze Hizmetleri', 'Naaş teslim alındı ve morga götürülüyor. Başınız sağ olsun.') end
          sendAway(u, u.leaveSiren)
        end
      elseif u.status == 'leaving' then
        if (pp and hdist(p, pp) > CFG.leaveDespawn) or simT - u.leaveT > CFG.leaveMaxTime then despawn(u) end
      end
    end
  end
end

local function onUpdate(dtReal, dtSim)
  if not dtSim or dtSim <= 0 then return end
  simT = simT + dtSim
  local pv = playerVeh()

  for oid, o in pairs(map.objects or {}) do
    if o.vel and (not pv or oid ~= pv:getID()) then pushHist(oid, o.vel) end
  end
  if pv and not ride then checkCrash(pv) end

  if crashPending and simT >= crashPending.deadline then
    crashPending = nil
    send('crash_off', {auto = true})
    sms('112 Acil', 'Telefonun kaza algıladı ve 112 otomatik arandı. Konumun ekiplerle paylaşıldı.')
    dispatch((incident and incident.fireSoon) and {'ambulance', 'police', 'fire'} or {'ambulance', 'police'}, 'auto')
  end

  for i = #igniteQueue, 1, -1 do
    local it = igniteQueue[i]
    if simT >= it.at then
      table.remove(igniteQueue, i)
      local v = getVeh(it.vid)
      if v then
        q("if fire and fire.igniteVehicle then fire.igniteVehicle() end", v)
        burning[it.vid] = {t = simT}
        local mine = pv and it.vid == pv:getID()
        if it.onFire then it.onFire(it.vid) end
        if mine then notify('Tepe Telefon', 'Aracın alev aldı! Hemen uzaklaş.', 'fire') end
      end
    end
  end

  updateUnits(pv)
  updateTreatment()
  updatePulls()
  updateRide()
  updateDuty(pv, pv and vpos(pv))
  updateWorld(pv and vpos(pv))
  updateStopChase(pv)

  if incident and incident.hearseAt and simT > incident.hearseAt then
    incident.hearseAt = nil
    dispatch({'hearse'}, 'cenaze')
  end
  if incident and incident.dispatched and simT - incident.t > 60 then
    local busy = false
    for _, u in pairs(units) do if not u.world and u.kind ~= 'taxi' and u.status ~= 'leaving' then busy = true end end
    if not busy then incident = nil end
  end
  if incident and simT - incident.t > CFG.incidentLife then incident = nil end

  stateTimer = stateTimer + dtReal
  if uiReady and stateTimer > 0.4 then
    stateTimer = 0
    sendState()
  end
end

-- arayüzden gelen komutlar --------------------------------------------------------
function M.ui(cmd, json)
  local d = {}
  if json and json ~= '' then
    local ok, r = pcall(jsonDecode, json)
    if ok and type(r) == 'table' then d = r end
  end
  if cmd == 'ready' then
    uiReady = true
    sendState()
  elseif cmd == 'settings' then
    if d.crash ~= nil then CFG.crashDetect = d.crash and true or false end
    if d.fire ~= nil then CFG.fireOnCrash = d.fire and true or false end
    if tonumber(d.sens) then CFG.crashSens = clamp(tonumber(d.sens), 0.5, 1.6) end
    if d.world ~= nil then CFG.worldAcc = d.world and true or false end
    if tonumber(d.delay) then CFG.sosDelay = clamp(tonumber(d.delay), 3, 60) end
  elseif cmd == 'dispatch' then
    dispatch(d.services or {}, d.reason or 'genel')
  elseif cmd == 'sos' then
    if crashPending then crashPending = nil end
    send('crash_off', {})
    dispatch((incident and incident.fireSoon) and {'ambulance', 'police', 'fire'} or {'ambulance', 'police'}, 'auto')
  elseif cmd == 'sos_cancel' then
    crashPending = nil
    send('crash_off', {cancel = true})
  elseif cmd == 'cancel_unit' then
    local u = units[tonumber(d.id) or -1]
    if u and u.status == 'enroute' then sendAway(u, false) end
  elseif cmd == 'police_reason' then
    local u = units[tonumber(d.unit) or -1] or findUnit('police', true)
    if d.reason == 'kaza' then
      local pv = playerVeh()
      if pv and (not incident or incident.statementDone) then
        local ev = {speed=0, playerDv=0, solo=true, share=1, manual=true}
        makeIncident(vpos(pv), ev)
        incident.medDone = true
      end
      if incident then
        if u then incident.policeUnit = u.id end
        send('statement', statementPayload())
      end
    else
      if u then u.leaveAt = simT + 5; u.timeoutAt = nil end
    end
  elseif cmd == 'verdict' then
    if incident then incident.statementDone = true end
    local u = (incident and incident.policeUnit and units[incident.policeUnit]) or findUnit('police', true)
    if u then u.leaveAt = simT + 7; u.timeoutAt = nil end
  elseif cmd == 'role' then
    if duty.chase then setMarker(nil); duty.chase = nil end
    setRole(d.role or 'sivil')
  elseif cmd == 'lights' then
    setLights(tonumber(d.n) or 0)
  elseif cmd == 'job_accept' then
    acceptOffer()
  elseif cmd == 'job_decline' then
    offer = nil
    duty.nextCallAt = simT + rnd(20, 40)
  elseif cmd == 'job_load' then
    jobLoad()
  elseif cmd == 'job_hearse' then
    local pos = job and job.pos
    if not pos then local pv = playerVeh(); pos = pv and vpos(pv) end
    if pos then
      local u = spawnUnit('hearse', pos, false)
      if u then send('dispatched', {units = {unitPublic(u)}, reason = 'cenaze'}) end
    end
  elseif cmd == 'job_finish' then
    cleanupJob(d.release and 'release' or 'delete')
  elseif cmd == 'job_cancel' then
    cleanupJob('delete')
  elseif cmd == 'pol_pullover' then
    if duty.chase then send('error', {text = 'Önce kaçan aracı durdur.'}) else policePullover() end
  elseif cmd == 'stop_release' then
    if duty.stopVid then releasePull(duty.stopVid); duty.stopVid = nil end
    if job and job.kind == 'kacak' then cleanupJob('release') end
  elseif cmd == 'taxi_call' then
    dispatch({'taxi'}, 'taksi')
  elseif cmd == 'taxi_board' then
    taxiBoard()
  elseif cmd == 'taxi_dest' then
    taxiDest(tonumber(d.km) or 3)
  elseif cmd == 'taxi_exit' then
    taxiExit(false)
  elseif cmd == 'taxi_cancel' then
    local u = findUnit('taxi', true)
    if u and not ride then sendAway(u, false) end
  end
end

function M.togglePhone() send('toggle', {}) end

-- olay kancaları ----------------------------------------------------------------
M.onUpdate = onUpdate
function M.onVehicleResetted(vid) hist[vid] = nil end
function M.onVehicleDestroyed(vid)
  hist[vid] = nil
  local uid = vidToUnit[vid]
  if uid then units[uid] = nil; vidToUnit[vid] = nil end
  if ride and ride.ownVid == vid then ride.ownVid = nil end
end
function M.onVehicleSwitched() hist = {} end
function M.onClientEndMission()
  for _, u in pairs(units) do despawn(u) end
  units, vidToUnit, hist, incident, crashPending, ride = {}, {}, {}, nil, nil, nil
  job, offer, pulls, leftovers = nil, nil, {}, {}
  worldEv, nextWorldAt, burning, igniteQueue = nil, nil, {}, {}
  duty.role, duty.stopVid, duty.chase = 'sivil', nil, nil
end
function M.onExtensionLoaded()
  math.randomseed(os.time())
  log('I', TAG, 'Tepe Telefon yüklendi')
end

return M
