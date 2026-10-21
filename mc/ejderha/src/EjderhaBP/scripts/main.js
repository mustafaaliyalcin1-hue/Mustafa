// Ejderha Binicileri — dragons: eggs hatch, babies grow as you feed them, adults can be ridden and flown,
// the Ejderha Asası breathes their element, and the Kadim Ejderha boss hunts you from the sky.
import { world, system } from '@minecraft/server';

const NS = 'ejderha';
const BREEDS = ['kizil', 'yesil', 'kara', 'buz'];
const NAME = { kizil: 'Kızıl Ejderha', yesil: 'Yeşil Ejderha', kara: 'Kara Ejderha', buz: 'Buz Ejderhası' };
const MEAT = ['cod', 'salmon', 'beef', 'porkchop', 'chicken', 'mutton', 'rabbit'];
const GROW = [{ food: 4, age: 300 }, { food: 10, age: 900 }]; // feeds or seconds to reach young, then adult
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const len = (v) => Math.hypot(v.x, v.y, v.z);
const norm = (v) => { const l = len(v) || 1; return { x: v.x / l, y: v.y / l, z: v.z / l }; };
const add = (a, b, k = 1) => ({ x: a.x + b.x * k, y: a.y + b.y * k, z: a.z + b.z * k });
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const valid = (e) => !!e && (typeof e.isValid === 'function' ? e.isValid() : e.isValid !== false);
const part = (dim, id, loc) => { try { dim.spawnParticle(id, loc); } catch {} };
const sound = (dim, id, loc, opts) => { try { dim.playSound(id, loc, opts); } catch {} };
const bar = (p, t) => { try { p.onScreenDisplay.setActionBar(t); } catch {} };
const fx = (e, n, d, a = 0) => { try { e.addEffect(n, d, { amplifier: a, showParticles: false }); } catch {} };
const hurt = (e, n, by) => { try { e.applyDamage(n, by ? { cause: 'entityAttack', damagingEntity: by } : undefined); } catch { try { e.applyDamage(n); } catch {} } };
const prop = (e, k, d) => { try { return e.getProperty(k) ?? d; } catch { return d; } };
const setProp = (e, k, v) => { try { if (e.getProperty(k) !== v) e.setProperty(k, v); } catch {} };
const dyn = (e, k, d) => { try { return e.getDynamicProperty(k) ?? d; } catch { return d; } };
const setDyn = (e, k, v) => { try { e.setDynamicProperty(k, v); } catch {} };
const variantOf = (e) => { try { return BREEDS[e.getComponent('minecraft:variant')?.value ?? 0] ?? 'kizil'; } catch { return 'kizil'; } };
const riderOf = (e) => { try { return e.getComponent('minecraft:rideable')?.getRiders()?.[0]; } catch { return undefined; } };
const tamed = (e) => { try { return !!e.getComponent('minecraft:is_tamed'); } catch { return false; } };
const blockAt = (dim, p) => { try { return dim.getBlock({ x: Math.floor(p.x), y: Math.floor(p.y), z: Math.floor(p.z) }); } catch { return undefined; } };
const solidAt = (dim, p) => { const b = blockAt(dim, p); return !!b && !b.isAir && !b.isLiquid; };
const yawOf = (v) => Math.atan2(-v.x, v.z) * 180 / Math.PI;
function dims() { const out = []; for (const id of ['overworld', 'nether', 'the_end']) { try { out.push(world.getDimension(id)); } catch {} } return out; }

/* ---------- eggs ---------- */
const lastUse = new Map();
function onUse(p, item, block) {
  if (!p || !item) return;
  const now = Date.now(); if (now - (lastUse.get(p.id) ?? 0) < 250) return;
  const id = item.typeId;
  if (id.startsWith(NS + ':yumurta_') && block) {
    lastUse.set(p.id, now);
    const breed = id.slice((NS + ':yumurta_').length);
    const loc = { x: block.location.x + 0.5, y: block.location.y + 1, z: block.location.z + 0.5 };
    try {
      const egg = p.dimension.spawnEntity(`${NS}:egg`, loc);
      egg.triggerEvent(`${NS}:set_${breed}`);
      setDyn(egg, 'hatch', Date.now() + 8000);
      sound(p.dimension, 'block.turtle_egg.drop', loc);
      bar(p, `§6${NAME[breed]} yumurtası §fısınıyor… 8 saniye`);
      takeOne(p);
    } catch { bar(p, '§cYumurta buraya konamadı.'); }
  } else if (id === NS + ':asa') {
    lastUse.set(p.id, now); staff(p);
  } else if (id === NS + ':cagri') {
    lastUse.set(p.id, now); summonBoss(p);
  }
}
function takeOne(p) {
  try {
    if (p.getGameMode?.() === 'creative' || p.getGameMode?.() === 'Creative') return;
    const inv = p.getComponent('minecraft:inventory')?.container, slot = p.selectedSlotIndex ?? p.selectedSlot;
    const it = inv?.getItem(slot); if (!it) return;
    if (it.amount > 1) { it.amount -= 1; inv.setItem(slot, it); } else inv.setItem(slot, undefined);
  } catch {}
}
world.afterEvents.itemUse.subscribe((ev) => onUse(ev.source, ev.itemStack));
world.afterEvents.itemUseOn?.subscribe((ev) => onUse(ev.source, ev.itemStack, ev.block));

function tickEggs(dim) {
  let eggs; try { eggs = dim.getEntities({ type: `${NS}:egg` }); } catch { return; }
  for (const egg of eggs) {
    const at = dyn(egg, 'hatch', 0), l = egg.location;
    if (!at) { setDyn(egg, 'hatch', Date.now() + 8000); continue; }
    if (Math.random() < 0.3) part(dim, 'minecraft:basic_flame_particle', add(l, { x: (Math.random() - 0.5) * 0.6, y: 0.2, z: (Math.random() - 0.5) * 0.6 }));
    if (Date.now() < at) continue;
    const breed = variantOf(egg);
    try {
      const baby = dim.spawnEntity(`${NS}:dragon`, l);
      baby.triggerEvent(`${NS}:set_${breed}`); baby.triggerEvent(`${NS}:hatched`);
      setDyn(baby, 'born', Date.now());
      for (let i = 0; i < 12; i++) part(dim, 'minecraft:villager_happy', add(l, { x: (Math.random() - 0.5), y: Math.random(), z: (Math.random() - 0.5) }));
      sound(dim, 'block.turtle_egg.crack', l); sound(dim, 'mob.enderdragon.growl', l, { pitch: 2, volume: 0.4 });
      for (const p of dim.getPlayers({ location: l, maxDistance: 24 })) bar(p, `§a${NAME[breed]} yumurtadan çıktı! §fSeni annesi sanıyor: eline et ya da balık al, besle.`);
    } catch {}
    try { egg.remove(); } catch {}
  }
}

/* ---------- growth and feeding ---------- */
world.afterEvents.playerInteractWithEntity?.subscribe((ev) => {
  const d = ev.target, p = ev.player;
  if (!d || d.typeId !== `${NS}:dragon`) return;
  const it = ev.itemStack ?? ev.beforeItemStack;
  if (!it || !MEAT.some((m) => it.typeId.includes(m))) return;
  system.run(() => {
    if (!valid(d)) return;
    const food = dyn(d, 'food', 0) + 1; setDyn(d, 'food', food);
    const stg = prop(d, `${NS}:stage`, 0);
    part(d.dimension, 'minecraft:heart_particle', add(d.location, { x: 0, y: 1 + stg, z: 0 }));
    if (stg < 2) bar(p, `§d♥ ${NAME[variantOf(d)]} §fbeslendi (${food}/${GROW[stg].food}) — büyümesine az kaldı`);
  });
});
function tickGrowth(d) {
  const stg = prop(d, `${NS}:stage`, 0); if (stg >= 2) return;
  const born = dyn(d, 'born', 0) || (setDyn(d, 'born', Date.now()), Date.now());
  const age = (Date.now() - born) / 1000, food = dyn(d, 'food', 0), g = GROW[stg];
  if (food < g.food && age < g.age) return;
  d.triggerEvent(stg === 0 ? `${NS}:grow_young` : `${NS}:grow_adult`);
  setProp(d, `${NS}:stage`, stg + 1); setDyn(d, 'food', 0); setDyn(d, 'born', Date.now());
  const l = d.location; sound(d.dimension, 'mob.enderdragon.growl', l, { pitch: stg === 0 ? 1.6 : 1.0 });
  for (let i = 0; i < 20; i++) part(d.dimension, 'minecraft:totem_particle', add(l, { x: (Math.random() - 0.5) * 2, y: Math.random() * 2, z: (Math.random() - 0.5) * 2 }));
  for (const p of d.dimension.getPlayers({ location: l, maxDistance: 32 }))
    bar(p, stg === 0 ? `§b${NAME[variantOf(d)]} büyüdü! §fArtık genç bir ejderha.` : `§6${NAME[variantOf(d)]} yetişkin oldu! §fDokunarak bin, zıplayarak havalan.`);
}

/* ---------- riding and flying ---------- */
const FLY = new Map();
function tickDragon(d) {
  tickGrowth(d);
  const rider = riderOf(d), flying = prop(d, `${NS}:flying`, false), l = d.location, dim = d.dimension;
  let f = FLY.get(d.id); if (!f) { f = { v: { x: 0, y: 0, z: 0 }, breath: 0, cd: 0 }; FLY.set(d.id, f); }
  f.cd -= 0.05; f.breath -= 0.05; f.hud = (f.hud ?? 0) + 1;
  setProp(d, `${NS}:breath`, f.breath > 0);
  if (!rider) {
    if (flying) { // nobody on board: glide down and land
      try { d.clearVelocity(); d.applyImpulse({ x: f.v.x * 0.9, y: -0.25, z: f.v.z * 0.9 }); } catch {}
      f.v.x *= 0.9; f.v.z *= 0.9;
      if (solidAt(dim, add(l, { x: 0, y: -0.6, z: 0 }))) { d.triggerEvent(`${NS}:fly_off`); setProp(d, `${NS}:flying`, false); }
    }
    return;
  }
  const view = rider.getViewDirection(), jump = rider.isJumping === true;
  if (!flying) {
    if (jump) { d.triggerEvent(`${NS}:fly_on`); setProp(d, `${NS}:flying`, true); f.v = { x: view.x * 0.3, y: 0.6, z: view.z * 0.3 }; sound(dim, 'mob.enderdragon.flap', l); bar(rider, '§bHavalandın! §fBaktığın yöne uçarsın · zıpla = yüksel · aşağı bak = in'); }
    return;
  }
  // flight: cruise toward where the rider looks; jump climbs; looking down near the ground lands
  const speed = 0.62, target = { x: view.x * speed, y: view.y * speed + (jump ? 0.45 : 0.02), z: view.z * speed };
  f.v = { x: f.v.x + (target.x - f.v.x) * 0.12, y: f.v.y + (target.y - f.v.y) * 0.12, z: f.v.z + (target.z - f.v.z) * 0.12 };
  const ahead = add(l, norm(f.v), 2.2);
  if (solidAt(dim, add(ahead, { x: 0, y: 1, z: 0 }))) { f.v.x *= 0.3; f.v.z *= 0.3; f.v.y = Math.max(f.v.y, 0.3); }
  try { d.clearVelocity(); d.applyImpulse(f.v); d.setRotation({ x: 0, y: yawOf(f.v) }); } catch {}
  if (Math.random() < 0.15) part(dim, 'minecraft:basic_smoke_particle', add(l, { x: 0, y: 1, z: 0 }));
  const nearGround = solidAt(dim, add(l, { x: 0, y: -0.8, z: 0 }));
  if (nearGround && view.y < -0.35) { d.triggerEvent(`${NS}:fly_off`); setProp(d, `${NS}:flying`, false); f.v = { x: 0, y: 0, z: 0 }; sound(dim, 'step.stone', l); }
  if (f.hud % 6 === 0) {
    let h = 0; for (let y = Math.floor(l.y) - 1; y > l.y - 200 && h < 200; y--, h++) { const b = blockAt(dim, { x: l.x, y, z: l.z }); if (b && !b.isAir) break; }
    bar(rider, `§6${NAME[variantOf(d)]}§r · Hız ${Math.round(len(f.v) * 72)} km/s · Yükseklik ${h} m · Nefes ${f.cd > 0 ? '§7bekliyor' : '§ahazır'}`);
  }
}

/* ---------- the staff: breath and fireball, element depends on the breed ---------- */
const ELEMENT = {
  kizil: { particle: 'minecraft:basic_flame_particle', sound: 'mob.ghast.fireball', hit: (e, p) => { hurt(e, 7, p); try { e.setOnFire(6, true); } catch {} } },
  yesil: { particle: 'minecraft:villager_happy', sound: 'mob.witch.throw', hit: (e, p) => { hurt(e, 4, p); fx(e, 'poison', 140, 1); fx(e, 'nausea', 100); } },
  kara: { particle: 'minecraft:blue_flame_particle', sound: 'mob.wither.shoot', hit: (e, p) => { hurt(e, 6, p); fx(e, 'wither', 120, 1); fx(e, 'blindness', 60); } },
  buz: { particle: 'minecraft:snowflake_particle', sound: 'random.glass', hit: (e, p) => { hurt(e, 5, p); fx(e, 'slowness', 140, 5); fx(e, 'mining_fatigue', 140, 2); try { e.extinguishFire?.(); } catch {} } },
};
function mount(p) { try { return p.getComponent('minecraft:riding')?.entityRidingOn; } catch { return undefined; } }
function staff(p) {
  const d = mount(p);
  if (!d || d.typeId !== `${NS}:dragon`) { bar(p, '§7Asa, ejderhana binerken çalışır.'); return; }
  const f = FLY.get(d.id) ?? { cd: 0, breath: 0, v: { x: 0, y: 0, z: 0 } }; FLY.set(d.id, f);
  if (f.cd > 0) return;
  const el = ELEMENT[variantOf(d)], view = p.getViewDirection(), dim = d.dimension;
  const mouth = add(add(d.location, { x: 0, y: 1.6, z: 0 }), view, 3.2);
  if (p.isSneaking) { // fireball: explodes where you look (no block damage)
    f.cd = 2.5; f.breath = 0.6;
    let hit; try { hit = p.getBlockFromViewDirection({ maxDistance: 64 }); } catch {}
    let ent; try { ent = p.getEntitiesFromViewDirection({ maxDistance: 64 }).find((h) => h.entity.id !== d.id && h.entity.id !== p.id)?.entity; } catch {}
    const point = ent ? ent.location : hit ? { x: hit.block.location.x + 0.5, y: hit.block.location.y + 1, z: hit.block.location.z + 0.5 } : add(mouth, view, 40);
    const L = len(sub(point, mouth));
    for (let t = 0; t < L; t += 1.2) part(dim, el.particle, add(mouth, view, t));
    try { dim.createExplosion(point, 2.5, { breaksBlocks: false, causesFire: variantOf(d) === 'kizil', source: p }); } catch {}
    sound(dim, el.sound, mouth);
    return;
  }
  f.cd = 0.35; f.breath = 0.5; // breath: a 14-block cone
  for (let t = 0; t < 14; t += 0.8) for (let k = 0; k < 2; k++) part(dim, el.particle, add(add(mouth, view, t), { x: (Math.random() - 0.5) * t * 0.25, y: (Math.random() - 0.5) * t * 0.25, z: (Math.random() - 0.5) * t * 0.25 }));
  let ents = []; try { ents = dim.getEntities({ location: mouth, maxDistance: 15 }); } catch {}
  for (const e of ents) {
    if (e.id === d.id || e.id === p.id || e.typeId === 'minecraft:item') continue;
    const dir = norm(sub(add(e.location, { x: 0, y: 0.8, z: 0 }), mouth));
    if (dir.x * view.x + dir.y * view.y + dir.z * view.z > 0.85) el.hit(e, p);
  }
  for (let t = 2; t < 14; t += 2) {
    const q = add(mouth, view, t), b = blockAt(dim, q); if (!b) continue;
    if (variantOf(d) === 'buz' && b.typeId.includes('water')) try { b.setType('minecraft:ice'); } catch {}
    if (variantOf(d) === 'kizil' && !b.isAir && !b.isLiquid) { const up = blockAt(dim, add(q, { x: 0, y: 1, z: 0 })); if (up && up.isAir && Math.random() < 0.3) try { up.setType('minecraft:fire'); } catch {} break; }
  }
  sound(dim, el.sound, mouth, { volume: 0.6 });
}

/* ---------- Kadim Ejderha: circles the nearest player, breathes fire, rains fireballs ---------- */
function summonBoss(p) {
  const v = p.getViewDirection(), l = p.location;
  const at = { x: l.x + v.x * 24, y: l.y + 18, z: l.z + v.z * 24 };
  try {
    p.dimension.spawnEntity(`${NS}:kadim`, at);
    sound(p.dimension, 'mob.enderdragon.growl', l, { volume: 2, pitch: 0.6 });
    for (const q of p.dimension.getPlayers({ location: l, maxDistance: 80 })) { try { q.onScreenDisplay.setTitle('§5KADİM EJDERHA', { subtitle: 'Gökyüzüne bak…', fadeInDuration: 10, stayDuration: 60, fadeOutDuration: 20 }); } catch {} }
    takeOne(p);
  } catch { bar(p, '§cKadim Ejderha burada çağrılamadı.'); }
}
const BOSS = new Map();
function tickBoss(b) {
  const dim = b.dimension, l = b.location;
  let s = BOSS.get(b.id); if (!s) { s = { a: Math.random() * 6.28, t: 0, atk: 3, v: { x: 0, y: 0, z: 0 } }; BOSS.set(b.id, s); }
  s.t += 0.05; s.atk -= 0.05;
  let target; try { target = dim.getPlayers({ location: l, maxDistance: 96 })[0]; } catch {}
  if (!target) { try { b.clearVelocity(); } catch {} return; }
  const tl = target.location;
  s.a += 0.012;
  const dive = Math.sin(s.t * 0.35) > 0.85; // now and then it swoops low
  const goal = { x: tl.x + Math.cos(s.a) * 22, y: tl.y + (dive ? 5 : 14), z: tl.z + Math.sin(s.a) * 22 };
  const want = sub(goal, l), dist = len(want), sp = Math.min(0.9, dist * 0.05);
  const n = norm(want);
  s.v = { x: s.v.x + (n.x * sp - s.v.x) * 0.08, y: s.v.y + (n.y * sp - s.v.y) * 0.08, z: s.v.z + (n.z * sp - s.v.z) * 0.08 };
  try { b.clearVelocity(); b.applyImpulse(s.v); b.setRotation({ x: 0, y: yawOf(sub(tl, l)) }); } catch {}
  setProp(b, `${NS}:breath`, s.atk < 0.6 && s.atk > 0);
  if (s.atk <= 0) {
    s.atk = 3 + Math.random() * 2;
    const mouth = add(l, { x: 0, y: 3, z: 0 }), to = norm(sub(add(tl, { x: 0, y: 1, z: 0 }), mouth)), D = len(sub(tl, mouth));
    if (D < 40 && Math.random() < 0.6) { // fire breath
      for (let t = 0; t < D; t += 0.9) part(dim, 'minecraft:basic_flame_particle', add(mouth, to, t));
      sound(dim, 'mob.enderdragon.growl', l, { volume: 2, pitch: 0.8 });
      for (const q of dim.getEntities({ location: tl, maxDistance: 4 })) { if (q.id === b.id) continue; hurt(q, 6, b); try { q.setOnFire(4, true); } catch {} }
    } else { // fireballs rain around the target
      for (let k = 0; k < 3; k++) {
        const at = add(tl, { x: (Math.random() - 0.5) * 10, y: 0, z: (Math.random() - 0.5) * 10 });
        system.runTimeout(() => { try { for (let t = 0; t < 1; t += 0.2) part(dim, 'minecraft:basic_flame_particle', add(at, { x: 0, y: t * 6, z: 0 })); dim.createExplosion(at, 2, { breaksBlocks: false, causesFire: false, source: b }); } catch {} }, 10 + k * 8);
      }
      sound(dim, 'mob.ghast.fireball', l, { volume: 2 });
    }
  }
  if (Math.random() < 0.3) part(dim, 'minecraft:dragon_breath_trail', add(l, { x: (Math.random() - 0.5) * 4, y: 2, z: (Math.random() - 0.5) * 4 }));
}
world.afterEvents.entityDie.subscribe((ev) => {
  const e = ev.deadEntity; if (!e || e.typeId !== `${NS}:kadim`) return;
  try { for (const q of e.dimension.getPlayers({ location: e.location, maxDistance: 96 })) q.onScreenDisplay.setTitle('§6ZAFER!', { subtitle: 'Kadim Ejderha yenildi · Kara yumurta düştü', fadeInDuration: 10, stayDuration: 80, fadeOutDuration: 20 }); } catch {}
  BOSS.delete(e.id);
});

/* ---------- main loop ---------- */
let tick = 0;
system.runInterval(() => {
  tick++;
  for (const dim of dims()) {
    let ds = []; try { ds = dim.getEntities({ type: `${NS}:dragon` }); } catch {}
    for (const d of ds) { try { tickDragon(d); } catch {} }
    let bs = []; try { bs = dim.getEntities({ type: `${NS}:kadim` }); } catch {}
    for (const b of bs) { try { tickBoss(b); } catch {} }
    if (tick % 10 === 0) tickEggs(dim);
  }
}, 1);
system.runInterval(() => { for (const id of FLY.keys()) if (Math.random() < 0.02) FLY.delete(id); }, 1200);
world.afterEvents.playerSpawn?.subscribe((ev) => { if (ev.initialSpawn) try { ev.player.sendMessage('§6Ejderha Binicileri §fyüklü: Eşyalar sekmesinde yumurtalar, Ejderha Asası ve Kadim Çağrı Taşı var.'); } catch {} });
