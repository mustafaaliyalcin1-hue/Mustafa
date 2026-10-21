// Tepetaklak Kahramanlar — suit powers.
// Wear all four pieces of a suit to get its powers. Hold the Kahraman Kumandası:
//   use = first power, sneak + use = second power. Flying suits: jump while in the air to take off,
//   hold jump to fly where you look, let go to hover, land to switch flight off.
import { world, system } from '@minecraft/server';

const NS = 'kahraman';
const SUITS = {
  demir: { name: 'Demir Zırh', color: '§c' },
  simsek: { name: 'Şimşek', color: '§e' },
  ag: { name: 'Ağ Atan', color: '§3' },
  gok: { name: 'Gök Kahramanı', color: '§9' },
  gece: { name: 'Gece Bekçisi', color: '§8' },
  buz: { name: 'Buz Ustası', color: '§b' },
};
const HELP = {
  demir: 'Havada zıpla: uç · Kumanda: repulsör · Eğil+kumanda: göğüs ışını',
  simsek: 'Koşarak hızlan, suyun üstünde koş · Kumanda: hız modu · Eğil+kumanda: zamanı yavaşlat',
  ag: 'Duvara karşı zıpla: tırman · Kumanda: ağla sallan / ağ at · Eğil+kumanda: ağ tuzağı',
  gok: 'Havada zıpla: uç · Kumanda: ısı bakışı · Eğil+kumanda: buz nefesi',
  gece: 'Düşerken zıpla tuşunu tut: pelerinle süzül · Kumanda: kanca · Eğil+kumanda: sis bombası',
  buz: 'Su üstünde yürü · Kumanda: buz ışını · Eğil+kumanda: buz köprüsü aç/kapa',
};
const PIECES = [['Head', 'kask'], ['Chest', 'gogus'], ['Legs', 'pantolon'], ['Feet', 'bot']];
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const len = (v) => Math.hypot(v.x, v.y, v.z);
const norm = (v) => { const l = len(v) || 1; return { x: v.x / l, y: v.y / l, z: v.z / l }; };
const add = (a, b, k = 1) => ({ x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k });

const STATE = new Map();
function st(p) { let s = STATE.get(p.id); if (!s) { s = { suit: null, fly: false, energy: 100, cd: {}, wasJump: false, speedMode: false, bridge: false, swing: null, senseT: 0, t: 0 }; STATE.set(p.id, s); } return s; }

function suitOf(p) {
  let eq; try { eq = p.getComponent('minecraft:equippable'); } catch { return null; }
  if (!eq) return null;
  let id = null;
  for (const [slot, piece] of PIECES) {
    let it; try { it = eq.getEquipment(slot); } catch { return null; }
    if (!it || !it.typeId.startsWith(NS + ':') || !it.typeId.endsWith('_' + piece)) return null;
    const s = it.typeId.slice(NS.length + 1, -(piece.length + 1));
    if (id && id !== s) return null;
    id = s;
  }
  return SUITS[id] ? id : null;
}
function fx(p, name, opts) { try { p.addEffect(name, opts?.d ?? 60, { amplifier: opts?.a ?? 0, showParticles: false }); } catch {} }
function part(dim, id, loc) { try { dim.spawnParticle(id, loc); } catch {} }
function beam(dim, from, to, id, step = 0.6) {
  const d = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z }, L = len(d), n = norm(d);
  for (let t = 0.8; t < L; t += step) part(dim, id, add(from, n, t));
}
function sound(p, id) { try { p.playSound(id); } catch {} }
function bar(p, text) { try { p.onScreenDisplay.setActionBar(text); } catch {} }
function eye(p) { const l = p.location; return { x: l.x, y: l.y + 1.62, z: l.z }; }
function solid(dim, x, y, z) { try { const b = dim.getBlock({ x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) }); return !!b && !b.isAir && !b.isLiquid; } catch { return false; } }
function blockAt(dim, x, y, z) { try { return dim.getBlock({ x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) }); } catch { return undefined; } }
function knock(p, v) { try { const h = Math.hypot(v.x, v.z); p.applyKnockback(h ? v.x / h : 0, h ? v.z / h : 0, h, v.y); } catch {} }
function ready(s, key, sec) { const now = s.t; if ((s.cd[key] ?? -1e9) > now) return false; s.cd[key] = now + sec; return true; }

/* aim: the first entity or block along the view, up to `max` blocks */
function aim(p, max) {
  let ent, blk;
  try { ent = p.getEntitiesFromViewDirection({ maxDistance: max }).find((h) => h.entity && h.entity.id !== p.id); } catch {}
  try { blk = p.getBlockFromViewDirection({ maxDistance: max }); } catch {}
  const e0 = eye(p);
  const ed = ent ? len({ x: ent.entity.location.x - e0.x, y: ent.entity.location.y - e0.y, z: ent.entity.location.z - e0.z }) : 1e9;
  const bd = blk ? len({ x: blk.block.location.x + 0.5 - e0.x, y: blk.block.location.y + 0.5 - e0.y, z: blk.block.location.z + 0.5 - e0.z }) : 1e9;
  if (ent && ed <= bd) return { kind: 'entity', entity: ent.entity, point: add(ent.entity.location, { x: 0, y: 1, z: 0 }), dist: ed };
  if (blk) { const f = blk.faceLocation ?? { x: 0.5, y: 0.5, z: 0.5 }; return { kind: 'block', block: blk.block, face: blk.face, point: { x: blk.block.location.x + f.x, y: blk.block.location.y + f.y, z: blk.block.location.z + f.z }, dist: bd }; }
  return { kind: 'none', point: add(e0, p.getViewDirection(), max), dist: max };
}
function hurt(ent, amount, p) { try { ent.applyDamage(amount, { cause: 'entityAttack', damagingEntity: p }); } catch { try { ent.applyDamage(amount); } catch {} } }
function nearbyMobs(p, r) { try { return p.dimension.getEntities({ location: p.location, maxDistance: r, excludeTypes: ['minecraft:player', 'minecraft:item', 'minecraft:xp_orb'] }).filter((e) => e.id !== p.id); } catch { return []; } }

/* ---------- powers on the controller ---------- */
function primary(p, s) {
  const dim = p.dimension, e0 = eye(p);
  switch (s.suit) {
    case 'demir': {
      if (s.energy < 12 || !ready(s, 'rep', 0.5)) return;
      s.energy -= 12; const a = aim(p, 40); beam(dim, e0, a.point, 'minecraft:blue_flame_particle', 0.5); sound(p, 'mob.blaze.shoot');
      if (a.kind === 'entity') { hurt(a.entity, 8, p); try { const v = p.getViewDirection(); a.entity.applyKnockback(v.x, v.z, 1.2, 0.35); } catch {} }
      part(dim, 'minecraft:large_explosion', a.point); break;
    }
    case 'simsek': {
      s.speedMode = !s.speedMode; sound(p, s.speedMode ? 'random.levelup' : 'random.fizz');
      bar(p, s.speedMode ? '§eHIZ MODU AÇIK §f— koşmaya başla' : '§7Hız modu kapalı'); break;
    }
    case 'ag': {
      if (!ready(s, 'web', 0.35)) return;
      const a = aim(p, 48); beam(dim, e0, a.point, 'minecraft:white_smoke_particle', 0.7); sound(p, 'random.bow');
      if (a.kind === 'entity') { fx(a.entity, 'slowness', { d: 140, a: 4 }); fx(a.entity, 'weakness', { d: 140, a: 1 }); part(dim, 'minecraft:knockback_roar_particle', a.point); }
      else if (a.kind === 'block') s.swing = { to: a.point, t: 0 };
      break;
    }
    case 'gok': {
      if (!ready(s, 'heat', 0.25)) return;
      const a = aim(p, 48); beam(dim, e0, a.point, 'minecraft:basic_flame_particle', 0.45); sound(p, 'mob.ghast.fireball');
      if (a.kind === 'entity') { hurt(a.entity, 7, p); try { a.entity.setOnFire(5, true); } catch {} }
      else if (a.kind === 'block' && a.face === 'Up') { const b = blockAt(dim, a.block.location.x, a.block.location.y + 1, a.block.location.z); if (b && b.isAir) try { b.setType('minecraft:fire'); } catch {} }
      break;
    }
    case 'gece': {
      if (!ready(s, 'hook', 0.6)) return;
      const a = aim(p, 56); beam(dim, e0, a.point, 'minecraft:basic_crit_particle', 0.8); sound(p, 'random.bow');
      if (a.kind === 'block') s.swing = { to: a.point, t: 0, hook: true };
      else if (a.kind === 'entity') { hurt(a.entity, 4, p); try { const v = norm({ x: e0.x - a.entity.location.x, y: 0, z: e0.z - a.entity.location.z }); a.entity.applyKnockback(v.x, v.z, 1.6, 0.3); } catch {} }
      break;
    }
    case 'buz': {
      if (!ready(s, 'ice', 0.4)) return;
      const a = aim(p, 40); beam(dim, e0, a.point, 'minecraft:snowflake_particle', 0.4); sound(p, 'random.glass');
      if (a.kind === 'entity') { hurt(a.entity, 4, p); fx(a.entity, 'slowness', { d: 100, a: 9 }); fx(a.entity, 'mining_fatigue', { d: 100, a: 3 }); fx(a.entity, 'weakness', { d: 100, a: 2 }); try { a.entity.extinguishFire?.(); } catch {} }
      else if (a.kind === 'block') {
        const t = a.block.typeId;
        if (t.includes('water')) a.block.setType('minecraft:ice'); else if (t.includes('lava')) a.block.setType('minecraft:obsidian');
        else { const l = a.block.location, f = { Up: [0, 1, 0], Down: [0, -1, 0], North: [0, 0, -1], South: [0, 0, 1], East: [1, 0, 0], West: [-1, 0, 0] }[a.face] ?? [0, 1, 0]; const b = blockAt(dim, l.x + f[0], l.y + f[1], l.z + f[2]); if (b && b.isAir) b.setType('minecraft:packed_ice'); }
      }
      break;
    }
  }
}
function secondary(p, s) {
  const dim = p.dimension, e0 = eye(p);
  switch (s.suit) {
    case 'demir': {
      if (s.energy < 40 || !ready(s, 'uni', 3)) return;
      s.energy -= 40; const a = aim(p, 60); beam(dim, e0, a.point, 'minecraft:endrod', 0.3); sound(p, 'mob.wither.shoot');
      if (a.kind === 'entity') hurt(a.entity, 16, p);
      try { dim.createExplosion(a.point, 2.2, { breaksBlocks: false, causesFire: false, source: p }); } catch {}
      bar(p, '§bGÖĞÜS IŞINI!'); break;
    }
    case 'simsek': {
      if (!ready(s, 'slow', 15)) { bar(p, '§7Zaman yavaşlatma dolmadı'); return; }
      for (const m of nearbyMobs(p, 24)) { fx(m, 'slowness', { d: 200, a: 6 }); fx(m, 'weakness', { d: 200, a: 1 }); part(dim, 'minecraft:electric_spark_particle', add(m.location, { x: 0, y: 1, z: 0 })); }
      fx(p, 'haste', { d: 200, a: 3 }); bar(p, '§eZAMAN YAVAŞLADI — 10 sn'); sound(p, 'beacon.power'); break;
    }
    case 'ag': {
      if (!ready(s, 'trap', 4)) return;
      const a = aim(p, 30); if (a.kind === 'none') return;
      const c = a.kind === 'entity' ? a.entity.location : a.point;
      for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const b = blockAt(dim, c.x + dx, c.y + (a.kind === 'entity' ? 0 : 0.5), c.z + dz); if (b && b.isAir) try { b.setType('minecraft:web'); } catch {} }
      sound(p, 'random.bow'); bar(p, '§3AĞ TUZAĞI'); break;
    }
    case 'gok': {
      if (!ready(s, 'frost', 1.2)) return;
      const v = p.getViewDirection();
      for (let t = 1; t < 12; t += 0.7) { const q = add(e0, v, t); part(dim, 'minecraft:snowflake_particle', q); const b = blockAt(dim, q.x, q.y, q.z); if (b && b.typeId.includes('water')) try { b.setType('minecraft:ice'); } catch {} if (b && b.typeId === 'minecraft:fire') try { b.setType('minecraft:air'); } catch {} }
      for (const m of nearbyMobs(p, 12)) { const d = norm({ x: m.location.x - e0.x, y: m.location.y + 1 - e0.y, z: m.location.z - e0.z }); if (d.x * v.x + d.y * v.y + d.z * v.z > 0.8) { fx(m, 'slowness', { d: 160, a: 5 }); try { m.extinguishFire?.(); } catch {} } }
      sound(p, 'mob.polarbear.warning'); break;
    }
    case 'gece': {
      if (!ready(s, 'smoke', 6)) return;
      for (let i = 0; i < 24; i++) part(dim, 'minecraft:large_explosion', add(p.location, { x: (Math.random() - 0.5) * 6, y: Math.random() * 2, z: (Math.random() - 0.5) * 6 }));
      for (const m of nearbyMobs(p, 9)) { fx(m, 'blindness', { d: 120 }); fx(m, 'slowness', { d: 120, a: 2 }); }
      fx(p, 'invisibility', { d: 140 }); fx(p, 'speed', { d: 140, a: 2 }); sound(p, 'random.fizz'); bar(p, '§8SİS BOMBASI — görünmezsin'); break;
    }
    case 'buz': { s.bridge = !s.bridge; bar(p, s.bridge ? '§bBUZ KÖPRÜSÜ AÇIK §f— havaya yürü' : '§7Buz köprüsü kapalı'); sound(p, 'random.glass'); break; }
  }
}
const lastUse = new Map();
world.afterEvents.itemUse.subscribe((ev) => {
  const p = ev.source, it = ev.itemStack;
  if (!p || !it || it.typeId !== NS + ':kumanda') return;
  const now = Date.now(); if (now - (lastUse.get(p.id) ?? 0) < 150) return; lastUse.set(p.id, now);
  const s = st(p);
  if (!s.suit) { bar(p, '§7Önce bir kostümün 4 parçasını da giy.'); return; }
  if (p.isSneaking) secondary(p, s); else primary(p, s);
});

/* ---------- passive powers, movement and HUD (every tick) ---------- */
const PASSIVE = {
  demir: [['night_vision', 0], ['resistance', 1], ['strength', 1], ['fire_resistance', 0]],
  simsek: [['speed', 3], ['haste', 1], ['jump_boost', 1]],
  ag: [['jump_boost', 2], ['strength', 0], ['resistance', 0]],
  gok: [['strength', 3], ['resistance', 2], ['jump_boost', 2], ['fire_resistance', 0], ['water_breathing', 0]],
  gece: [['night_vision', 0], ['strength', 1], ['resistance', 1], ['jump_boost', 1]],
  buz: [['resistance', 1], ['speed', 0], ['fire_resistance', 0]],
};
function tickPlayer(p) {
  const s = st(p); s.t += 0.05;
  const suit = suitOf(p);
  if (suit !== s.suit) {
    s.suit = suit; s.fly = false; s.speedMode = false; s.bridge = false; s.swing = null;
    if (suit) { try { p.onScreenDisplay.setTitle(`${SUITS[suit].color}${SUITS[suit].name}`, { subtitle: HELP[suit], fadeInDuration: 5, stayDuration: 70, fadeOutDuration: 15 }); } catch { bar(p, SUITS[suit].name + ' · ' + HELP[suit]); } sound(p, 'armor.equip_netherite'); }
  }
  if (!suit) return;
  const dim = p.dimension, loc = p.location, v = p.getVelocity(), view = p.getViewDirection();
  const onGround = p.isOnGround, jump = p.isJumping, sneaking = p.isSneaking;
  const tick = Math.round(s.t / 0.05);
  if (tick % 20 === 0) for (const [e, a] of PASSIVE[suit]) fx(p, e, { d: 60, a });
  if (suit === 'simsek' && s.speedMode && tick % 20 === 0) fx(p, 'speed', { d: 60, a: 9 });
  if (suit === 'gok' && tick % 40 === 0) { try { const day = world.getTimeOfDay() < 12500; const top = dim.getTopmostBlock?.({ x: loc.x, z: loc.z }); if (day && (!top || top.location.y < loc.y)) fx(p, 'regeneration', { d: 60, a: 1 }); } catch {} }

  // no fall damage for heroes: slow falling just before the ground
  if (v.y < -0.75 && !s.fly && (solid(dim, loc.x, loc.y - 2, loc.z) || solid(dim, loc.x, loc.y - 3.5, loc.z))) fx(p, 'slow_falling', { d: 20 });

  // flight: jump in the air to take off, hold jump to fly where you look, land to stop
  if (suit === 'demir' || suit === 'gok') {
    if (onGround) s.fly = false;
    else if (jump && !s.wasJump && !s.fly && (suit === 'gok' || s.energy > 10)) { s.fly = true; sound(p, 'mob.enderdragon.flap'); }
    if (s.fly) {
      const speed = suit === 'gok' ? 1.9 : 1.35;
      if (jump && (suit === 'gok' || s.energy > 0)) {
        knock(p, { x: view.x * speed, y: view.y * speed + 0.08, z: view.z * speed });
        if (suit === 'demir') { s.energy = Math.max(0, s.energy - 0.35); part(dim, 'minecraft:basic_flame_particle', loc); part(dim, 'minecraft:blue_flame_particle', add(loc, { x: 0, y: 0.1, z: 0 })); }
        else if (tick % 2 === 0) part(dim, 'minecraft:endrod', loc);
      } else if (sneaking) { fx(p, 'slow_falling', { d: 4 }); }
      else { fx(p, 'slow_falling', { d: 10 }); if (tick % 3 === 0 && v.y < -0.02) knock(p, { x: v.x * 0.8, y: 0.06, z: v.z * 0.8 }); }
    }
  }
  if (suit === 'demir') s.energy = Math.min(100, s.energy + (onGround ? 0.6 : s.fly ? 0 : 0.15));

  // speedster: lightning trail and running on water
  if (suit === 'simsek' && p.isSprinting) {
    part(dim, 'minecraft:electric_spark_particle', add(loc, { x: 0, y: 0.8, z: 0 }));
    if (s.speedMode && tick % 2 === 0) part(dim, 'minecraft:basic_flame_particle', loc);
    const below = blockAt(dim, loc.x, loc.y - 0.2, loc.z);
    if (below && below.typeId.includes('water')) knock(p, { x: view.x * (s.speedMode ? 1.6 : 1.0), y: 0.12, z: view.z * (s.speedMode ? 1.6 : 1.0) });
  }

  // web slinger: climb walls and swing on webs; danger sense
  if (suit === 'ag') {
    const hx = Math.abs(view.x) > Math.abs(view.z) ? Math.sign(view.x) : 0, hz = hx ? 0 : Math.sign(view.z);
    const wall = solid(dim, loc.x + hx * 0.7, loc.y + 0.5, loc.z + hz * 0.7) || solid(dim, loc.x + hx * 0.7, loc.y + 1.4, loc.z + hz * 0.7);
    if (wall && !onGround) { if (jump) knock(p, { x: hx * 0.05, y: 0.32, z: hz * 0.05 }); else if (!sneaking) fx(p, 'slow_falling', { d: 4 }); }
    s.senseT -= 0.05;
    if (s.senseT <= 0 && tick % 10 === 0) { let hostile = []; try { hostile = dim.getEntities({ location: loc, maxDistance: 10, families: ['monster'] }); } catch {} if (hostile.length) { bar(p, `§c⚠ AĞ HİSSİ §f— yakında ${hostile.length} düşman`); s.senseT = 3; } }
  }
  if (s.swing && (suit === 'ag' || suit === 'gece')) {
    const sw = s.swing; sw.t += 0.05;
    const d = { x: sw.to.x - loc.x, y: sw.to.y - loc.y - 1, z: sw.to.z - loc.z }, dist = len(d);
    if (dist < 2.5 || sw.t > (sw.hook ? 2 : 1.3) || sneaking) s.swing = null;
    else {
      const n = norm(d), pull = sw.hook ? 2.0 : 1.6;
      knock(p, { x: n.x * pull + view.x * 0.3, y: n.y * pull + 0.25, z: n.z * pull + view.z * 0.3 });
      if (tick % 2 === 0) beam(dim, add(loc, { x: 0, y: 1.2, z: 0 }), sw.to, sw.hook ? 'minecraft:basic_crit_particle' : 'minecraft:white_smoke_particle', 1.4);
    }
  }

  // night watcher: cape glide
  if (suit === 'gece' && !onGround && jump && v.y < -0.15 && !s.swing) {
    fx(p, 'slow_falling', { d: 6 });
    knock(p, { x: view.x * 0.95, y: -0.04, z: view.z * 0.95 });
  }

  // ice master: walk on water, optional ice bridge in the air
  if (suit === 'buz') {
    for (const [dx, dz] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const b = blockAt(dim, loc.x + dx, loc.y - 1, loc.z + dz);
      if (b && b.typeId === 'minecraft:water') try { b.setType('minecraft:frosted_ice'); } catch {}
    }
    if (s.bridge && !sneaking) { const b = blockAt(dim, loc.x, loc.y - 1, loc.z); if (b && b.isAir) try { b.setType('minecraft:packed_ice'); } catch {} }
    if (tick % 4 === 0) part(dim, 'minecraft:snowflake_particle', add(loc, { x: 0, y: 0.2, z: 0 }));
  }

  // HUD
  if (tick % 5 === 0 && !(s.senseT > 0)) {
    const name = SUITS[suit].color + SUITS[suit].name + '§r';
    const parts = [name];
    if (suit === 'demir') { const n = Math.round(s.energy / 10); parts.push(`Enerji §b${'█'.repeat(n)}§8${'█'.repeat(10 - n)}§r`); }
    if (suit === 'demir' || suit === 'gok') parts.push(s.fly ? '§aUÇUYOR' : '§7havada zıpla = uç');
    if (suit === 'simsek' && s.speedMode) parts.push('§eHIZ MODU');
    if (suit === 'buz' && s.bridge) parts.push('§bBuz köprüsü');
    bar(p, parts.join('  ·  '));
  }
  s.wasJump = jump;
}
system.runInterval(() => {
  for (const p of world.getAllPlayers()) { try { tickPlayer(p); } catch {} }
}, 1);
world.afterEvents.playerSpawn?.subscribe((ev) => { if (ev.initialSpawn) try { ev.player.sendMessage('§6Tepetaklak Kahramanlar §fyüklü: kostümler Ekipman sekmesinde, Kahraman Kumandası ile güçleri kullan.'); } catch {} });
