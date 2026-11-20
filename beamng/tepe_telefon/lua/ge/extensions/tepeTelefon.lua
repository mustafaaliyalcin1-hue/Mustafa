-- Tepe Telefon: BeamNG.drive serbest sürüş için akıllı telefon ve acil hizmetler.
-- Polis, ambulans, taksi ve cenaze aracı çağırma; kaza algılama; olay yeri tedavisi;
-- polis ifadesi ve kusur tespiti. Arayüz: ui/modules/apps/TepeTelefon.
local M = {}
local TAG = 'tepeTelefon'

local CFG = {
  crashDetect = true,
  crashDv = 7.0,          -- m/s: kısa sürede yatay hız değişimi (~25 km/s) = kaza
  crashWindow = 0.2,      -- sn
  crashCooldown = 25,     -- sn
  sosDelay = 10,          -- sn: otomatik 112 geri sayımı
  spawnMin = 220, spawnMax = 480,
  arriveDist = 24,
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
  hearse    = { {model='lansdale', cfg='hearse'}, {model='fullsize', cfg='hearse'}, {model='lansdale', black=true}, {model='van', black=true} },
}

local NAMES = {
  police = 'Trafik Ekibi', ambulance = '112 Ambulans', taxi = 'Taksi', hearse = 'Cenaze Aracı',
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
        if k then return {model=c.model, config='vehicles/'..c.model..'/'..k..'.pc', black=c.black} end
      else
        return {model=c.model, black=c.black}
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

local function closestNode(pos)
  local nodes = roadNodes()
  if map and map.findClosestRoad then
    local ok, n1, n2 = pcall(map.findClosestRoad, pos)
    if ok and n1 then
      if n2 and nodes[n1] and nodes[n2] and hdist(nodes[n2].pos, pos) < hdist(nodes[n1].pos, pos) then return n2 end
      return n1
    end
  end
  local best, bd = nil, math.huge
  for name, n in pairs(nodes) do
    local d = hdist(n.pos, pos)
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
local function findRoadSpot(target, minD, maxD, towardTarget)
  local nodes = roadNodes()
  local cands = {}
  for name, n in pairs(nodes) do
    local d = hdist(n.pos, target)
    if d > minD and d < maxD and (n.radius or 3) >= 2 then cands[#cands + 1] = name end
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
      if spotFree(p) then return p, quatFromDir(bestDir, vec3(0, 0, 1)), name end
    end
  end
  return nil
end

-- birimler -------------------------------------------------------------------
local function unitPublic(u, pp, fwd, right)
  local o = {id=u.id, kind=u.kind, name=u.name, plate=u.plate, driver=u.driver, status=u.status,
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
    if u.kind == kind and (not active or u.status == 'enroute' or u.status == 'onscene' or u.status == 'ride' or u.status == 'board') then return u end
  end
  return nil
end

local function spawnUnit(kind, target, follow)
  local pv = playerVeh()
  local tgt = target or (pv and vpos(pv))
  if not tgt then return nil end
  local choice = chooseVehicle(kind)
  local p, rot = findRoadSpot(tgt, CFG.spawnMin, CFG.spawnMax, true)
  if not p then p, rot = findRoadSpot(tgt, 80, 1500, true) end
  if not p then
    local d = pv and vdir(pv) or vec3(0, 1, 0)
    p = tgt - d * 60 + vec3(0, 0, 0.5)
    rot = quatFromDir(d, vec3(0, 0, 1))
  end
  local opts = {pos=p, rot=rot, autoEnterVehicle=false, cling=true}
  if choice.config then opts.config = choice.config end
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
    emergency=(kind == 'police' or kind == 'ambulance'), follow=follow,
    plate=plate(kind), driver=pick(DRIVERS)..' '..pick(SURN),
  }
  u.name = NAMES[kind]..' '..math.random(2, 48)
  if kind == 'police' then u.name = 'Trafik Ekibi '..math.random(10, 99)..'-'..math.random(1, 9) end
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
  local p, rot = findRoadSpot(tgt, 40, 120, true)
  if not p then return end
  if spawn and spawn.safeTeleport then
    pcall(spawn.safeTeleport, veh, p, rot)
  else
    pcall(function() veh:setPosRot(p.x, p.y, p.z, rot.x, rot.y, rot.z, rot.w) end)
  end
  u.t0 = simT - CFG.stuckTime + 60
  driveTo(u, tgt)
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
  local pSev = rollSeverity(ev.playerDv or 0)
  if pSev == 'olu' then pSev = 'agir' end
  table.insert(incident.patients, {who='sen', name='Sen', sev=pSev, state='bekliyor', p=0})
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
  if not incident then
    notify('112 Ambulans', 'Sağlık ekibi geldi. Seni kontrol ettiler, sağlığın yerinde.', 'med')
    u.leaveAt = simT + 12
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
  if s == 'none' then pt.outcome = 'saglam'
  elseif s == 'hafif' then pt.outcome = 'yerinde'
  elseif s == 'orta' then pt.outcome = (r < 0.7) and 'yerinde' or 'hastane'
  elseif s == 'agir' then
    if pt.who == 'sen' then pt.outcome = 'ambulansta'
    else pt.outcome = (r < 0.85) and 'hastane' or 'vefat' end
  elseif s == 'olu' then pt.outcome = (r < 0.85) and 'vefat' or 'kurtarildi' end
  pt.state = 'bitti'
  pt.p = 1
  if pt.outcome == 'vefat' then pt.triage = 'siyah'; incident.dead = true end
  local TXT = {
    saglam = 'kontrol edildi, sağlığı yerinde.',
    yerinde = 'olay yerinde tedavi edildi.',
    hastane = 'hastaneye kaldırılıyor.',
    ambulansta = 'ambulansta tedavi edildi; hastanede kontrol önerildi.',
    vefat = 'tüm müdahaleye rağmen hayatını kaybetti.',
    kurtarildi = 'ekip son anda hayata döndürdü, hastaneye kaldırılıyor.',
  }
  notify('112 Ambulans', pt.name..' '..TXT[pt.outcome], 'med')
end

local function updateTreatment()
  if not incident or incident.medDone or not incident.ambUnit then return end
  local all = true
  for _, pt in ipairs(incident.patients) do
    if pt.state ~= 'bitti' then
      all = false
      if pt.startAt and simT >= pt.startAt then
        pt.state = 'mudahale'
        pt.p = clamp((simT - pt.startAt) / pt.dur, 0, 1)
        if pt.p >= 1 then finishPatient(pt) end
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
  if dead then
    sms('112 Acil', 'Olay yerindeki karşı sürücü hayatını kaybetti. Başınız sağ olsun. Savcılık ve 188 Cenaze Hizmetleri bilgilendirildi; cenaze aracı yönlendiriliyor.')
    incident.hearseAt = simT + 18
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
  if not CFG.crashDetect then return end
  crashPending = {deadline = simT + CFG.sosDelay}
  send('crash', {countdown = CFG.sosDelay, speed = math.floor(ev.speed), solo = ev.solo})
end

local function checkCrash(pv)
  local pid = pv:getID()
  local v = vvel(pv)
  pushHist(pid, v)
  if crashPending or simT - lastCrashT < CFG.crashCooldown then return end
  if incident and incident.dispatched and simT - incident.t < CFG.incidentLife then return end
  local before = velAgo(pid, CFG.crashWindow)
  if not before then return end
  local dv = hlen(v - before)
  if dv > CFG.crashDv and hlen(before) > 4 or dv > CFG.crashDv * 1.4 then
    onCrash(pv, vpos(pv), v, before, dv)
  end
end

-- çağrılar --------------------------------------------------------------------
local function dispatch(services, reason)
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
  if incident and (reason == 'kaza' or reason == 'saglik' or reason == 'auto') and simT - incident.t < CFG.incidentLife then
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
  if u.kind == 'police' then
    policeArrived(u)
  elseif u.kind == 'ambulance' then
    startTreatment(u)
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
  send('state', {units = list, incident = incidentPublic(), ride = r, level = levelName(), speed = spd,
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
        if d < CFG.arriveDist or (d < 80 and u.slowT and simT - u.slowT > 4 and simT - u.t0 > 15) then
          unitArrived(u)
        elseif simT - u.t0 > CFG.stuckTime then
          teleportNear(u, tgt)
        end
      elseif u.status == 'onscene' then
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
    dispatch({'ambulance', 'police'}, 'auto')
  end

  updateUnits(pv)
  updateTreatment()
  updateRide()

  if incident and incident.hearseAt and simT > incident.hearseAt then
    incident.hearseAt = nil
    dispatch({'hearse'}, 'cenaze')
  end
  if incident and simT - incident.t > CFG.incidentLife and not next(units) then incident = nil end

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
    if tonumber(d.delay) then CFG.sosDelay = clamp(tonumber(d.delay), 3, 60) end
  elseif cmd == 'dispatch' then
    dispatch(d.services or {}, d.reason or 'genel')
  elseif cmd == 'sos' then
    if crashPending then crashPending = nil end
    send('crash_off', {})
    dispatch({'ambulance', 'police'}, 'auto')
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
end
function M.onExtensionLoaded()
  math.randomseed(os.time())
  log('I', TAG, 'Tepe Telefon yüklendi')
end

return M
