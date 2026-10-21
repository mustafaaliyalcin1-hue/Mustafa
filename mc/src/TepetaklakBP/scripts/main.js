// Tepetaklak Fan Car — Bedrock script.
// Normal driving is vanilla (rideable + ground controls, jump = thruster hop).
// On a J ramp the script takes over: the fans press the car to the surface, it climbs
// the wall, rides upside down on the ceiling, lets go, flips and lands on its thrusters.
import { world, system } from '@minecraft/server';

const G = 9.81, DT = 0.05, C = 0.5; // C: height of the car's centre above its feet (blocks)
const DEPTH = 0.75; // deck blocks sit this far behind the riding surface, so the grid never pokes through it
const CAR = 'tepetaklak:fan_car';
// cardinal directions with the Minecraft yaw that faces them
const DIRS = [{ x: 1, z: 0, yaw: -90 }, { x: 0, z: 1, yaw: 0 }, { x: -1, z: 0, yaw: 90 }, { x: 0, z: -1, yaw: 180 }];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ---------- the J curve: quarter arcs eased with clothoids, same as the web game ---------- */
function buildRamp() {
  const segs = [{ arc: Math.PI / 2, R: 7, La: 4 }, { line: 4.5 }, { arc: Math.PI / 2, R: 4.5, La: 2.5 }, { line: 14 }];
  const parts = []; let acc = 0;
  for (const g of segs) {
    if (g.line !== undefined) { parts.push({ s0: acc, L: g.line, arc: false, k: () => 0 }); acc += g.line; continue; }
    const k0 = 1 / g.R, La = g.La, Lk = g.arc / k0 - La, L = 2 * La + Lk, s0 = acc;
    parts.push({ s0, L, arc: true, k: (u) => (u < La ? k0 * u / La : u < La + Lk ? k0 : k0 * (L - u) / La) });
    acc += L;
  }
  const ds = 0.1, L = acc, n = Math.ceil(L / ds) + 1;
  const kap = (s) => { for (const p of parts) if (s < p.s0 + p.L) return p.k(Math.max(0, s - p.s0)); return 0; };
  const X = [], Y = [], TH = [];
  let x = 0, y = 0, th = 0, ceil = 0;
  for (const p of parts) if (p.arc) ceil = p.s0 + p.L;
  for (let i = 0; i < n; i++) {
    const s = i * ds; X.push(x); Y.push(y); TH.push(s >= ceil ? Math.PI : th);
    const km = kap(s + ds / 2), thm = th + km * ds / 2;
    x += Math.cos(thm) * ds; y += Math.sin(thm) * ds; th += km * ds;
  }
  let yMax = 0, xMin = 0, xMax = 0;
  for (let i = 0; i < n; i++) { yMax = Math.max(yMax, Y[i]); xMin = Math.min(xMin, X[i]); xMax = Math.max(xMax, X[i]); }
  return { L, ds, n, X, Y, TH, ceil, yMax, xMin, xMax, ceilX0: X[Math.round(ceil / ds)], ceilX1: X[n - 1] };
}
const RAMP = buildRamp();
function at(s) {
  const f = clamp(s, 0, RAMP.L) / RAMP.ds, i = Math.min(RAMP.n - 2, Math.floor(f)), t = f - i;
  const th = RAMP.TH[i] + (RAMP.TH[i + 1] - RAMP.TH[i]) * t;
  return { x: RAMP.X[i] + (RAMP.X[i + 1] - RAMP.X[i]) * t, y: RAMP.Y[i] + (RAMP.Y[i + 1] - RAMP.Y[i]) * t, th,
    tx: Math.cos(th), ty: Math.sin(th), ux: -Math.sin(th), uy: Math.cos(th) };
}

/* ---------- ramps placed in the world (kept in a world dynamic property) ---------- */
let RAMPS = null;
function ramps() {
  if (!RAMPS) { try { RAMPS = JSON.parse(world.getDynamicProperty('tepetaklak:ramps') ?? '[]'); } catch { RAMPS = []; } }
  return RAMPS;
}
function saveRamps() { try { world.setDynamicProperty('tepetaklak:ramps', JSON.stringify(RAMPS.slice(-60))); } catch {} }
// local ramp frame → world: x along the ramp, y up, z to the right; origin at the centre of the start block
function toWorld(r, lx, ly, lz) {
  const D = DIRS[r.d], rx = -D.z, rz = D.x;
  return { x: r.x + 0.5 + D.x * lx + rx * lz, y: r.y + ly, z: r.z + 0.5 + D.z * lx + rz * lz };
}

/* ---------- block jobs: building a ramp is spread over several ticks ---------- */
const JOBS = []; let jobHead = 0;
system.runInterval(() => {
  let n = 0;
  while (jobHead < JOBS.length && n < 500) { try { JOBS[jobHead](); } catch {} jobHead++; n++; }
  if (jobHead >= JOBS.length && JOBS.length) { JOBS.length = 0; jobHead = 0; }
}, 1);

function buildRampAt(dim, r, onDone) {
  const put = (lx, ly, lz, type) => JOBS.push(() => {
    const p = toWorld(r, lx, ly, lz), b = dim.getBlock({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) });
    if (b) b.setType(type);
  });
  const top = Math.ceil(RAMP.yMax) + 2;
  // clear the space and lay a flat run-up and landing pad
  for (let lx = Math.floor(RAMP.xMin) - 3; lx <= Math.ceil(RAMP.xMax) + 2; lx++)
    for (let lz = -4; lz <= 4; lz++) for (let ly = 0; ly <= top; ly++) put(lx, ly, lz, 'minecraft:air');
  for (let lx = Math.floor(RAMP.xMin) - 22; lx <= Math.ceil(RAMP.xMax) + 2; lx++)
    for (let lz = -4; lz <= 4; lz++) put(lx, -1, lz, lz === 0 && lx % 4 === 0 ? 'minecraft:yellow_concrete' : 'minecraft:smooth_stone');
  // the deck sits just behind the riding surface, rails just in front of it
  const seen = new Set();
  for (let s = 0; s <= RAMP.L; s += 0.12) {
    const f = at(s);
    for (let lz = -2; lz <= 2; lz++) {
      const p = toWorld(r, f.x - f.ux * DEPTH, f.y - f.uy * DEPTH, lz), key = `${Math.floor(p.x)},${Math.floor(p.y)},${Math.floor(p.z)}`;
      if (seen.has(key)) continue; seen.add(key);
      put(f.x - f.ux * DEPTH, f.y - f.uy * DEPTH, lz, 'minecraft:quartz_block');
    }
    for (const lz of [-3, 3]) put(f.x - f.ux * DEPTH, f.y - f.uy * DEPTH, lz, 'minecraft:orange_concrete');
  }
  // pillars hold the overhanging ceiling; lanterns on top
  for (const lx of [Math.round(RAMP.ceilX1) + 1, Math.round((RAMP.ceilX0 + RAMP.ceilX1) / 2)])
    for (const lz of [-3, 3]) {
      for (let ly = 0; ly < Math.floor(RAMP.yMax); ly++) put(lx, ly, lz, 'minecraft:orange_concrete');
      put(lx, Math.floor(RAMP.yMax) + 1, lz, 'minecraft:sea_lantern');
    }
  JOBS.push(onDone);
}

/* ---------- items: J ramp kit and the car ---------- */
const lastUse = new Map();
function cardinal(player) {
  const v = player.getViewDirection();
  return Math.abs(v.x) > Math.abs(v.z) ? (v.x > 0 ? 0 : 2) : (v.z > 0 ? 1 : 3);
}
function say(player, text) { try { player.onScreenDisplay.setActionBar(text); } catch { try { player.sendMessage(text); } catch {} } }
function useItem(player, item, block) {
  if (!player || !item || player.typeId !== 'minecraft:player') return;
  const now = Date.now();
  if (now - (lastUse.get(player.id) ?? 0) < 600) return;
  if (item.typeId === 'tepetaklak:j_ramp') {
    lastUse.set(player.id, now);
    const d = cardinal(player), D = DIRS[d], p = player.location;
    const r = { dim: player.dimension.id, x: Math.floor(p.x) + D.x * 12, y: Math.floor(p.y), z: Math.floor(p.z) + D.z * 12, d };
    say(player, '§6J rampa kuruluyor…');
    buildRampAt(player.dimension, r, () => {
      ramps().push(r); saveRamps();
      say(player, '§aRampa hazır! §fFan Car ile rampaya düz gir.');
      try { player.playSound('random.levelup'); } catch {}
    });
  } else if (item.typeId === 'tepetaklak:fan_car') {
    lastUse.set(player.id, now);
    const v = player.getViewDirection(), p = player.location;
    const loc = block ? { x: block.location.x + 0.5, y: block.location.y + 1, z: block.location.z + 0.5 } : { x: p.x + v.x * 3, y: p.y, z: p.z + v.z * 3 };
    try {
      const car = player.dimension.spawnEntity(CAR, loc);
      car.setRotation?.({ x: 0, y: player.getRotation().y });
      say(player, '§fFan Car hazır: §ebinmek için dokun§f, zıpla tuşu = itici');
    } catch (e) { say(player, '§cFan Car buraya konamadı.'); }
  }
}
world.afterEvents.itemUse.subscribe((ev) => useItem(ev.source, ev.itemStack));
if (world.afterEvents.itemUseOn) world.afterEvents.itemUseOn.subscribe((ev) => useItem(ev.source, ev.itemStack, ev.block));

/* ---------- the trick ---------- */
const STATE = new Map();
const valid = (e) => !!e && (typeof e.isValid === 'function' ? e.isValid() : e.isValid !== false);
function riderOf(car) { try { return car.getComponent('minecraft:rideable')?.getRiders()?.[0]; } catch { return undefined; } }
function run(ent, cmd) { try { if (ent.runCommand) ent.runCommand(cmd); else ent.runCommandAsync(cmd); } catch { try { ent.runCommandAsync?.(cmd); } catch {} } }
const fx = (v) => v.toFixed(2);
function camera(st, center) {
  if (!valid(st.rider)) return;
  const r = st.r, lx = st.lxCam ?? 0, my = Math.max(4, center.y - r.y) * 0.5 + 5.5;
  const pos = toWorld(r, lx * 0.45 - 3.5, my + 1.5, 24), look = toWorld(r, lx * 0.45 - 1.5, my, 0);
  run(st.rider, `camera @s set minecraft:free ease 0.1 linear pos ${fx(pos.x)} ${fx(pos.y)} ${fx(pos.z)} facing ${fx(look.x)} ${fx(look.y)} ${fx(look.z)}`);
}
function groundTop(dim, x, z, fromY) {
  for (let y = Math.floor(fromY); y > fromY - 48; y--) {
    let b; try { b = dim.getBlock({ x: Math.floor(x), y, z: Math.floor(z) }); } catch { return fromY - 48; }
    if (b && !b.isAir && !b.isLiquid) return y + 1;
  }
  return fromY - 48;
}
function place(car, st, f) {
  const r = st.r, D = DIRS[r.d];
  const e = 0.35 * Math.max(0, -f.uy); // hang a little lower when upside down so the rider's head stays below the deck
  const surf = toWorld(r, f.x, f.y, st.lz);
  const ux = D.x * f.ux, uz = D.z * f.ux, uy = f.uy;
  const center = { x: surf.x + ux * (C + e), y: surf.y + uy * (C + e), z: surf.z + uz * (C + e) };
  car.teleport({ x: center.x, y: center.y - C, z: center.z }, { rotation: { x: 0, y: D.yaw }, keepVelocity: false });
  car.setProperty('tepetaklak:pitch', f.th * 180 / Math.PI);
  st.lxCam = f.x; st.center = center;
  return center;
}
function endTrick(car, st, text) {
  try { car.setProperty('tepetaklak:pitch', 0); car.triggerEvent('tepetaklak:trick_off'); } catch {}
  if (valid(st.rider)) { run(st.rider, 'camera @s clear'); if (text) say(st.rider, text); }
  STATE.set(car.id, { mode: 'drive' });
}

function tickCar(car, dim) {
  let st = STATE.get(car.id);
  if (!st) { st = { mode: 'drive' }; STATE.set(car.id, st); }
  if (st.mode === 'drive') {
    const rider = riderOf(car);
    if (!rider) return;
    const p = car.location, v = car.getVelocity();
    for (const r of ramps()) {
      if (r.dim !== dim.id) continue;
      const D = DIRS[r.d], rx = -D.z, rz = D.x, bx = r.x + 0.5, bz = r.z + 0.5;
      const lx = (p.x - bx) * D.x + (p.z - bz) * D.z, lz = (p.x - bx) * rx + (p.z - bz) * rz;
      if (lx < -3 || lx > 2.5 || Math.abs(lz) > 2.4 || Math.abs(p.y - r.y) > 1.6) continue;
      const along = (v.x * D.x + v.z * D.z) * 20;
      if (along < 2) continue;
      STATE.set(car.id, st = { mode: 'ramp', r, s: Math.max(0, lx), v: Math.max(10, along), lz: clamp(lz, -1.5, 1.5), hang: 0, rider, t: 0 });
      car.triggerEvent('tepetaklak:trick_on');
      say(rider, '§bFanlar açık! §fDuvara yapışıyorsun…');
      break;
    }
    return;
  }
  st.t += DT;
  // the rider sits upright while the car flips; full damage protection so the curved deck can never suffocate them
  if (valid(st.rider) && Math.round(st.t / DT) % 10 === 1) { try { st.rider.addEffect('resistance', 40, { amplifier: 4, showParticles: false }); } catch {} }
  if (st.mode === 'ramp') {
    const f = at(st.s);
    // auto throttle: climb at 40 km/h, crawl upside down on the ceiling; gravity along the track
    const vt = f.th < 1.2 ? 11 : f.th < 2.6 ? 7 : 1.6;
    st.v += (-G * Math.sin(f.th) + clamp((vt - st.v) * 3, -9, 14)) * DT;
    st.s += st.v * DT;
    if (f.th > 2.9) st.hang += DT;
    if (st.s < 0) { endTrick(car, st, '§7Rampadan geri kaydın.'); return; }
    const rider = riderOf(car) ?? st.rider; st.rider = rider;
    const jump = rider && rider.isJumping === true;
    if (st.s >= RAMP.L || (f.th > 2.9 && ((jump && st.hang > 0.4) || st.hang > 4))) {
      const D = DIRS[st.r.d], g = at(Math.min(st.s, RAMP.L)), v = st.v, push = 2.2;
      st.mode = 'drop';
      st.vel = { x: D.x * (g.tx * v + g.ux * push), y: g.ty * v + g.uy * push, z: D.z * (g.tx * v + g.ux * push) };
      st.th = g.th * 180 / Math.PI;
      try { car.dimension.spawnParticle('minecraft:basic_smoke_particle', st.center); } catch {}
      say(rider, `§eBıraktın! §fTavanda ${st.hang.toFixed(1)} sn`);
      return;
    }
    const center = place(car, st, at(st.s));
    if (f.th > 2.6 && rider) say(rider, '§6TEPETAKLAK! §fZıpla tuşu ile bırak');
    camera(st, center);
    return;
  }
  if (st.mode === 'drop') {
    const c = st.center, gy = groundTop(car.dimension, c.x, c.z, c.y);
    st.vel.y -= G * DT;
    const h = c.y - C - gy;
    // soft landing: the lift thrusters fire once the car is upright and close to the ground
    if (st.vel.y < -6 && h < 8 && st.th > 300) {
      st.vel.y += 26 * DT;
      try { car.dimension.spawnParticle('minecraft:basic_smoke_particle', { x: c.x, y: c.y - C, z: c.z }); } catch {}
    }
    c.x += st.vel.x * DT; c.y += st.vel.y * DT; c.z += st.vel.z * DT;
    st.th = Math.min(360, st.th + 230 * DT); // finish the flip: 180° on the ceiling → 360° upright
    const D = DIRS[st.r.d];
    if (c.y - C <= gy) {
      const vy = -st.vel.y;
      car.teleport({ x: c.x, y: gy, z: c.z }, { rotation: { x: 0, y: D.yaw }, keepVelocity: false });
      endTrick(car, st, vy < 9.5 ? `§aTEMİZ İNİŞ! §fTavanda ${st.hang.toFixed(1)} sn · salto` : `§6Sert iniş §f(${vy.toFixed(1)} m/s)`);
      try { if (valid(st.rider)) st.rider.playSound(vy < 9.5 ? 'random.orb' : 'random.anvil_land'); } catch {}
      try { car.applyImpulse({ x: st.vel.x * 0.02, y: 0, z: st.vel.z * 0.02 }); } catch {}
      return;
    }
    car.teleport({ x: c.x, y: c.y - C, z: c.z }, { rotation: { x: 0, y: D.yaw }, keepVelocity: false });
    car.setProperty('tepetaklak:pitch', st.th);
    camera(st, c);
  }
}

system.runInterval(() => {
  for (const id of ['overworld', 'nether', 'the_end']) {
    let dim; try { dim = world.getDimension(id); } catch { continue; }
    let cars; try { cars = dim.getEntities({ type: CAR }); } catch { continue; }
    for (const car of cars) { try { tickCar(car, dim); } catch (e) { const st = STATE.get(car.id); if (st && st.mode !== 'drive') endTrick(car, st); } }
  }
}, 1);
system.runInterval(() => { for (const [id, st] of STATE) if (st.mode === 'drive') STATE.delete(id); }, 1200);
