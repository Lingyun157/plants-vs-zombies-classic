/* 植物大战僵尸 · 经典复刻版 游戏逻辑 */
(function () {
  'use strict';

  var CFG = {
    cols: 9, rows: 5, cellW: 90, cellH: 100,
    lawnX: 96, lawnY: 108,
    levelTime: 180, sunValue: 25, peaSpeed: 430
  };

  var PLANTS = [
    { id: 'sunflower',   name: '向日葵',   cost: 50,  cd: 7,  hp: 400,  kind: 'sun',      interval: 10 },
    { id: 'peashooter',  name: '豌豆射手', cost: 100, cd: 6,  hp: 400,  kind: 'shoot',    interval: 1.4, damage: 25 },
    { id: 'wallnut',     name: '坚果墙',   cost: 50,  cd: 14, hp: 750,  kind: 'wall' },
    { id: 'potatoMine',  name: '土豆雷',   cost: 25,  cd: 12, hp: 400,  kind: 'mine',     interval: 8, damage: 1800 },
    { id: 'cherryBomb',  name: '樱桃炸弹', cost: 150, cd: 22, hp: 9999, kind: 'bomb',     interval: 1, damage: 1800 },
    { id: 'repeater',    name: '双发射手', cost: 200, cd: 9,  hp: 400,  kind: 'shoot',    interval: 1.5, damage: 25, shots: 2 },
    { id: 'snowPea',     name: '寒冰射手', cost: 175, cd: 9,  hp: 400,  kind: 'shoot',    interval: 1.5, damage: 25, slow: true },
    { id: 'chomper',     name: '大嘴花',   cost: 150, cd: 12, hp: 400,  kind: 'chomp',    interval: 7, damage: 999 },
    { id: 'threepeater', name: '三线射手', cost: 300, cd: 14, hp: 400,  kind: 'shoot',    interval: 1.6, damage: 25, rows: 3 },
    { id: 'squash',      name: '窝瓜',     cost: 50,  cd: 20, hp: 9999, kind: 'squash',   interval: 1.1, damage: 1800 },
    { id: 'jalapeno',    name: '辣椒',     cost: 125, cd: 25, hp: 9999, kind: 'rowbomb',  interval: 1.1, damage: 1800 }
  ];
  var byId = {};
  PLANTS.forEach(function (p) { byId[p.id] = p; });

  var ZOMBIES = {
    basic:     { name: '普通僵尸',   hp: 200,  speed: 18, dps: 30 },
    cone:      { name: '路障僵尸',   hp: 500,  speed: 18, dps: 30 },
    bucket:    { name: '铁桶僵尸',   hp: 800,  speed: 17, dps: 30 },
    newspaper: { name: '读报僵尸',   hp: 340,  speed: 18, dps: 30 },
    football:  { name: '橄榄球僵尸', hp: 700,  speed: 32, dps: 35 },
    dancer:    { name: '舞王僵尸',   hp: 500,  speed: 22, dps: 30 },
    flag:      { name: '旗帜僵尸',   hp: 280,  speed: 21, dps: 30 },
    gargantuar:{ name: '巨人僵尸',   hp: 2200, speed: 11, dps: 500, big: true }
  };

  var $ = function (s) { return document.querySelector(s); };
  var game, lawn, gridEl, entityLayer, sunLayer, fxLayer, mowerLayer;
  var state = null, uid = 0, scale = 1, lastFrame = 0, audioCtx = null, soundOn = true;
  var cells = [], cardEls = {};

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    scale = Math.min((w - 24) / 1000, (h - 24) / 700, 1.25);
    if (scale < 0.3) scale = 0.3;
    game.style.transform = 'scale(' + scale + ')';
    var stage = $('#stage');
    stage.style.width = (1000 * scale) + 'px';
    stage.style.height = (700 * scale) + 'px';
  }

  function fmtTime(t) {
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function beep(freq, dur, type, vol) {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(vol || 0.06, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + dur);
    } catch (e) { /* 音频不可用则静默 */ }
  }

  function toast(msg, ms) {
    var t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.classList.remove('show'); }, ms || 1800);
  }

  /* ---------------- 初始化与重置 ---------------- */

  function buildBoard() {
    for (var r = 0; r < CFG.rows; r++) {
      for (var c = 0; c < CFG.cols; c++) {
        var d = document.createElement('div');
        d.className = 'cell'; d.dataset.row = r; d.dataset.col = c;
        gridEl.appendChild(d);
        cells.push(d);
      }
    }
    gridEl.addEventListener('click', onLawnClick);
    gridEl.addEventListener('mousemove', onLawnHover);
    gridEl.addEventListener('mouseleave', clearHover);
  }

  function buildCards() {
    PLANTS.forEach(function (p, i) {
      var d = document.createElement('div');
      d.className = 'seed-card'; d.dataset.id = p.id; d.title = p.name + ' · ' + p.cost + ' 阳光';
      d.innerHTML = '<span class="card-cost">' + p.cost + '</span>' +
        Sprites.plant[p.id]() +
        '<span class="card-name">' + p.name + '</span>' +
        (i < 9 ? '<span class="key">' + (i + 1) + '</span>' : '') +
        '<div class="cd-mask"></div>';
      d.addEventListener('click', function () { selectCard(p.id); });
      $('#seed-bank').appendChild(d);
      cardEls[p.id] = d;
    });
  }

  function reset() {
    if (state && state.rafId) cancelAnimationFrame(state.rafId);
    uid = 0;
    entityLayer.innerHTML = ''; sunLayer.innerHTML = ''; fxLayer.innerHTML = ''; mowerLayer.innerHTML = '';
    state = {
      time: 0, sun: 300, running: false, paused: false, ended: false,
      grid: [], plants: [], zombies: [], peas: [], suns: [],
      mowers: [], cooldown: {}, selected: null, shovel: false,
      nextSpawn: 12, wave: 0, kills: 0, finalWave: false,
      rafId: 0, last: 0
    };
    PLANTS.forEach(function (p) { state.cooldown[p.id] = 0; });
    for (var r = 0; r < CFG.rows; r++) {
      state.grid.push(new Array(CFG.cols).fill(null));
      var m = document.createElement('div');
      m.className = 'mower';
      m.style.left = (CFG.lawnX - 46) + 'px';
      m.style.top = (CFG.lawnY + r * CFG.cellH + 44) + 'px';
      m.innerHTML = Sprites.misc.mower();
      mowerLayer.appendChild(m);
      state.mowers.push({ row: r, el: m, used: false, moving: false, x: 0 });
    }
    $('#sun-value').textContent = state.sun;
    $('#progress-fill').style.width = '0%';
    $('#wave-label').textContent = '准备迎敌…';
    $('#shovel').classList.remove('active');
    updateCards();
  }

  function startGame() {
    reset();
    $('#start-screen').classList.add('hidden');
    $('#pause-screen').classList.add('hidden');
    $('#end-screen').classList.add('hidden');
    state.running = true;
    state.last = performance.now();
    state.rafId = requestAnimationFrame(frame);
    beep(520, .12, 'triangle', .05);
    setTimeout(function () { beep(700, .16, 'triangle', .05); }, 110);
  }

  /* ---------------- 输入 ---------------- */

  function selectCard(id) {
    if (!state || !state.running || state.paused || state.ended) return;
    var p = byId[id];
    if (state.sun < p.cost || state.cooldown[id] > 0) {
      beep(160, .1, 'square', .03);
      toast(state.sun < p.cost ? '阳光不足！' : '卡片冷却中！', 900);
      return;
    }
    if (state.selected === id && !state.shovel) { state.selected = null; }
    else { state.selected = id; state.shovel = false; $('#shovel').classList.remove('active'); }
    beep(660, .05, 'sine', .025);
    updateCards();
  }

  function selectShovel() {
    if (!state || !state.running || state.paused || state.ended) return;
    state.shovel = !state.shovel;
    state.selected = null;
    $('#shovel').classList.toggle('active', state.shovel);
    updateCards();
  }

  function clearHover() {
    cells.forEach(function (c) { c.classList.remove('hover', 'blocked'); });
  }

  function onLawnHover(e) {
    var cell = e.target.closest ? e.target.closest('.cell') : null;
    clearHover();
    if (!cell || !state || !state.running || state.paused || state.ended) return;
    if (!state.selected && !state.shovel) return;
    var r = +cell.dataset.row, c = +cell.dataset.col;
    if (state.shovel) {
      if (state.grid[r][c]) cell.classList.add('blocked');
      return;
    }
    var p = byId[state.selected];
    cell.classList.add(state.grid[r][c] || state.sun < p.cost ? 'blocked' : 'hover');
  }

  function onLawnClick(e) {
    if (!state || !state.running || state.paused || state.ended) return;
    var cell = e.target.closest ? e.target.closest('.cell') : null;
    if (!cell) return;
    var r = +cell.dataset.row, c = +cell.dataset.col;
    if (state.shovel) {
      var target = state.grid[r][c];
      if (target) { removePlant(target, true); beep(300, .08, 'square', .03); }
      state.shovel = false;
      $('#shovel').classList.remove('active');
      clearHover(); updateCards();
      return;
    }
    if (!state.selected) return;
    var def = byId[state.selected];
    if (state.grid[r][c]) { toast('这里已经有植物了'); beep(150, .08, 'square', .02); return; }
    if (state.sun < def.cost) { toast('阳光不足！'); return; }
    state.sun -= def.cost;
    $('#sun-value').textContent = state.sun;
    state.cooldown[def.id] = def.cd;
    addPlant(def, r, c);
    beep(440, .08, 'sine', .04);
    if (state.sun < def.cost) { state.selected = null; clearHover(); }
    updateCards();
  }

  function bindUI() {
    $('#start-btn').addEventListener('click', startGame);
    $('#restart-btn').addEventListener('click', startGame);
    $('#restart-pause-btn').addEventListener('click', startGame);
    $('#pause-btn').addEventListener('click', togglePause);
    $('#resume-btn').addEventListener('click', togglePause);
    $('#shovel').addEventListener('click', selectShovel);
    $('#sound-btn').addEventListener('click', function () {
      soundOn = !soundOn;
      this.querySelector('span').textContent = soundOn ? '🔊' : '🔇';
      if (soundOn) beep(600, .08, 'sine', .04);
    });
    document.addEventListener('keydown', function (e) {
      if (!state || !state.running || state.ended) return;
      if (e.key === 'Escape') {
        if (state.selected || state.shovel) {
          state.selected = null; state.shovel = false;
          $('#shovel').classList.remove('active'); clearHover(); updateCards();
        } else togglePause();
        return;
      }
      if (state.paused) return;
      if (e.key.toLowerCase() === 'x') { selectShovel(); return; }
      if (/^[1-9]$/.test(e.key)) {
        var p = PLANTS[parseInt(e.key, 10) - 1];
        if (p) selectCard(p.id);
      }
    });
    document.addEventListener('contextmenu', function (e) {
      if (!state || !state.running) return;
      e.preventDefault();
      state.selected = null; state.shovel = false;
      $('#shovel').classList.remove('active'); clearHover(); updateCards();
    });
    window.addEventListener('resize', resize);
  }

  function togglePause() {
    if (!state || state.ended) return;
    state.paused = !state.paused;
    $('#pause-screen').classList.toggle('hidden', !state.paused);
    $('#pause-btn').querySelector('span').textContent = state.paused ? '▶' : '⏸';
  }

  /* ---------------- 实体创建 ---------------- */

  function addPlant(def, r, c) {
    var el = document.createElement('div');
    el.className = 'plant';
    el.dataset.plant = def.id;
    el.style.left = (c * CFG.cellW) + 'px';
    el.style.top = (r * CFG.cellH) + 'px';
    el.style.zIndex = 10 + r * 2;
    el.innerHTML = '<div class="sprite">' + Sprites.plant[def.id]() + '</div>';
    entityLayer.appendChild(el);
    var p = {
      id: def.id, def: def, row: r, col: c, el: el,
      hp: def.hp, maxHp: def.hp,
      timer: def.kind === 'sun' ? 6 : (def.interval || 1),
      armed: false, dead: false, hurtStage: 0
    };
    state.grid[r][c] = p;
    state.plants.push(p);
    return p;
  }

  function removePlant(p, silent) {
    if (!p || p.dead) return;
    p.dead = true;
    if (state.grid[p.row][p.col] === p) state.grid[p.row][p.col] = null;
    if (!silent) p.el.classList.add('dying');
    var el = p.el;
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, silent ? 0 : 420);
    var i = state.plants.indexOf(p);
    if (i >= 0) state.plants.splice(i, 1);
  }

  function spawnZombie(type, row, x) {
    var def = ZOMBIES[type];
    var el = document.createElement('div');
    el.className = 'zombie' + (def.big ? ' big-zombie' : '');
    el.style.zIndex = 11 + row * 2;
    el.style.top = (row * CFG.cellH - 26) + 'px';
    el.style.width = def.big ? '140px' : '100px';
    el.style.height = def.big ? '196px' : '140px';
    el.innerHTML = '<div class="sprite">' + Sprites.zombie[type]() + '</div>';
    entityLayer.appendChild(el);
    var z = {
      id: ++uid, type: type, def: def, row: row, x: x == null ? 840 + Math.random() * 50 : x,
      hp: def.hp, maxHp: def.hp, el: el, dead: false, eating: false,
      slowUntil: 0, danceTimer: 5, hatOn: true, hurtFlash: 0
    };
    state.zombies.push(z);
    return z;
  }

  function updateZombieEl(z) {
    z.el.style.left = (z.x - (z.def.big ? 70 : 50)) + 'px';
    z.el.style.top = (z.row * CFG.cellH - (z.def.big ? 60 : 26)) + 'px';
  }

  function damageZombie(z, amount) {
    if (z.dead) return;
    z.hp -= amount;
    z.el.classList.add('hit');
    var el = z.el;
    setTimeout(function () { el.classList.remove('hit'); }, 110);
    if (z.hatOn && z.hp < z.maxHp * 0.55) {
      z.hatOn = false;
      var hat = el.querySelector('.hat');
      if (hat) hat.style.display = 'none';
      if (z.type === 'newspaper') toast('读报僵尸被激怒了！', 1100);
    }
    if (z.hp <= 0) killZombie(z);
  }

  function killZombie(z) {
    if (z.dead) return;
    z.dead = true;
    state.kills++;
    z.el.classList.add('dying');
    var el = z.el;
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 560);
    var i = state.zombies.indexOf(z);
    if (i >= 0) state.zombies.splice(i, 1);
  }

  function addPea(row, x, slow, damage) {
    var el = document.createElement('div');
    el.className = 'pea';
    el.style.left = x + 'px';
    el.style.top = (row * CFG.cellH + 42) + 'px';
    el.style.zIndex = 30 + row * 2;
    el.innerHTML = slow ? Sprites.misc.snowPea() : Sprites.misc.pea();
    fxLayer.appendChild(el);
    state.peas.push({ row: row, x: x, slow: !!slow, damage: damage || 20, el: el, dead: false });
  }

  function addSun(x, y, targetY, fromSky) {
    var el = document.createElement('div');
    el.className = 'sun-token';
    el.style.left = x + 'px'; el.style.top = y + 'px';
    el.innerHTML = Sprites.misc.sun();
    sunLayer.appendChild(el);
    var s = { x: x, y: y, targetY: targetY, vy: fromSky ? 62 : 45, el: el, life: 13, landed: false, dead: false };
    el.addEventListener('click', function () { collectSun(s); });
    state.suns.push(s);
  }

  function collectSun(s) {
    if (s.dead || !state.running) return;
    s.dead = true;
    state.sun += CFG.sunValue;
    $('#sun-value').textContent = state.sun;
    floatText('+25', s.x + 28, s.y + 10);
    s.el.remove();
    beep(880, .09, 'sine', .05);
    var i = state.suns.indexOf(s);
    if (i >= 0) state.suns.splice(i, 1);
    updateCards();
  }

  function floatText(text, x, y) {
    var d = document.createElement('div');
    d.className = 'fx'; d.textContent = text;
    d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.zIndex = 100;
    fxLayer.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1000);
  }

  function boom(x, y, big) {
    var d = document.createElement('div');
    d.className = 'boom';
    d.style.left = x + 'px'; d.style.top = y + 'px'; d.style.zIndex = 120;
    if (big) d.style.transform = 'scale(1.6)';
    fxLayer.appendChild(d);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 520);
    beep(90, .38, 'sawtooth', .1);
  }

  function explodeArea(row, col, damage, radiusRow, radiusCol) {
    var px = col * CFG.cellW + CFG.cellW / 2;
    var py = row * CFG.cellH + CFG.cellH / 2;
    boom(px, py, radiusRow > 0);
    state.zombies.slice().forEach(function (z) {
      if (Math.abs(z.row - row) <= radiusRow && Math.abs(z.x - px) <= (radiusCol + .5) * CFG.cellW) damageZombie(z, damage);
    });
  }

  /* ---------------- 更新逻辑 ---------------- */

  function updateCards() {
    if (!state) return;
    PLANTS.forEach(function (p) {
      var el = cardEls[p.id];
      var cdLeft = state.cooldown[p.id] || 0;
      var disabled = state.sun < p.cost || cdLeft > 0;
      el.classList.toggle('disabled', disabled);
      el.classList.toggle('selected', state.selected === p.id);
      el.querySelector('.cd-mask').style.height = (cdLeft / p.cd * 100).toFixed(1) + '%';
    });
  }

  function updatePlants(dt) {
    state.plants.slice().forEach(function (p) {
      if (p.dead) return;
      var def = p.def, px = p.col * CFG.cellW + CFG.cellW / 2;

      if (def.kind === 'sun') {
        p.timer -= dt;
        if (p.timer <= 0) {
          p.timer = 10;
          addSun(px - 4, p.row * CFG.cellH + 46, p.row * CFG.cellH + 58, false);
          p.el.classList.add('fired');
          setTimeout(function () { p.el.classList.remove('fired'); }, 230);
        }
      } else if (def.kind === 'shoot') {
        var rows = def.rows ? [p.row - 1, p.row, p.row + 1] : [p.row];
        var hasTarget = rows.some(function (r) {
          return r >= 0 && r < CFG.rows && state.zombies.some(function (z) { return z.row === r && z.x > px - 10 && !z.dead; });
        });
        if (hasTarget) {
          p.timer -= dt;
          if (p.timer <= 0) {
            p.timer = def.interval;
            rows.forEach(function (r) {
              if (r < 0 || r >= CFG.rows) return;
              for (var k = 0; k < (def.shots || 1); k++) addPea(r, px + 38 - k * 13, !!def.slow, def.damage);
            });
            p.el.classList.add('fired');
            setTimeout(function () { p.el.classList.remove('fired'); }, 230);
          }
        } else {
          p.timer = Math.min(p.timer, def.interval);
        }
      } else if (def.kind === 'mine') {
        if (!p.armed) {
          p.timer -= dt;
          if (p.timer <= 0) {
            p.armed = true;
            p.el.querySelector('.sprite').innerHTML = Sprites.plant.potatoMine(true);
          }
        } else {
          var hit = state.zombies.some(function (z) {
            return z.row === p.row && z.x > p.col * CFG.cellW - 15 && z.x < (p.col + 1) * CFG.cellW + 25;
          });
          if (hit) { explodeArea(p.row, p.col, def.damage, 1, 1); removePlant(p, true); }
        }
      } else if (def.kind === 'bomb' || def.kind === 'rowbomb') {
        p.timer -= dt;
        if (p.timer <= 0) {
          if (def.kind === 'bomb') explodeArea(p.row, p.col, def.damage, 1, 1);
          else { boom(400, p.row * CFG.cellH + 50, true); state.zombies.slice().forEach(function (z) { if (z.row === p.row) damageZombie(z, def.damage); }); }
          removePlant(p, true);
        }
      } else if (def.kind === 'squash') {
        p.timer -= dt;
        if (p.timer <= 0) {
          var victim = state.zombies.filter(function (z) { return z.row === p.row && z.x > px - 80 && z.x < px + 190; })
            .sort(function (a, b) { return a.x - b.x; })[0];
          if (victim) { boom(victim.x, p.row * CFG.cellH + 50, false); damageZombie(victim, def.damage); }
          removePlant(p, true);
        }
      } else if (def.kind === 'chomp') {
        if (p.timer > 0) p.timer -= dt;
        else {
          var prey = state.zombies.filter(function (z) { return z.row === p.row && z.x > px && z.x < px + 115; })
            .sort(function (a, b) { return a.x - b.x; })[0];
          if (prey) {
            p.el.classList.add('chomping');
            setTimeout(function () { p.el.classList.remove('chomping'); }, 420);
            damageZombie(prey, def.damage);
            p.timer = def.interval;
          }
        }
      }
    });
  }

  function updatePeas(dt) {
    state.peas.slice().forEach(function (pea) {
      if (pea.dead) return;
      pea.x += CFG.peaSpeed * dt;
      var hit = null;
      state.zombies.forEach(function (z) {
        if (z.dead || z.row !== pea.row) return;
        if (z.x > pea.x - 60 && z.x < pea.x + 30 && (!hit || z.x < hit.x)) hit = z;
      });
      if (hit) {
        damageZombie(hit, pea.damage);
        if (pea.slow) hit.slowUntil = state.time + 4.5;
        pea.dead = true; pea.el.remove();
        var i = state.peas.indexOf(pea);
        if (i >= 0) state.peas.splice(i, 1);
      } else if (pea.x > 850) {
        pea.dead = true; pea.el.remove();
        var j = state.peas.indexOf(pea);
        if (j >= 0) state.peas.splice(j, 1);
      } else pea.el.style.left = pea.x + 'px';
    });
  }

  function updateZombies(dt) {
    state.zombies.slice().forEach(function (z) {
      if (z.dead) return;
      var speed = z.def.speed * (state.time < z.slowUntil ? .42 : 1);
      if (z.type === 'newspaper' && !z.hatOn) speed *= 2;
      if (z.type === 'dancer') {
        z.danceTimer -= dt;
        if (z.danceTimer <= 0) {
          z.danceTimer = 4 + Math.random() * 2;
          z.row = Math.max(0, Math.min(CFG.rows - 1, z.row + (Math.random() < .5 ? -1 : 1)));
        }
      }

      // 吃植物判定：嘴部进入植物格子右侧即停下
      var eating = null;
      for (var c = 0; c < CFG.cols; c++) {
        var p = state.grid[z.row][c];
        if (p && !p.dead && z.x <= c * CFG.cellW + 98 && z.x >= c * CFG.cellW - 18) { eating = p; break; }
      }
      z.eating = !!eating;
      z.el.classList.toggle('eating', z.eating);
      z.el.classList.toggle('slowed', state.time < z.slowUntil);
      if (eating) {
        eating.hp -= z.def.dps * dt;
        if (eating.hp <= 0) { removePlant(eating, false); beep(120, .12, 'square', .04); }
        var stage = eating.hp / eating.maxHp < .4 ? 2 : (eating.hp / eating.maxHp < .75 ? 1 : 0);
        if (eating.id === 'wallnut' && stage !== eating.hurtStage) {
          eating.hurtStage = stage;
          eating.el.querySelector('.sprite').innerHTML = Sprites.plant.wallnut(stage);
        }
      } else {
        z.x -= speed * dt;
      }
      updateZombieEl(z);

      if (z.x < -32) {
        var mower = state.mowers[z.row];
        if (!mower.used) {
          mower.used = true; mower.moving = true; mower.x = 0;
          mower.el.classList.add('moving');
          toast('割草机启动！', 1100);
          beep(200, .3, 'sawtooth', .08);
        } else if (!state.ended) {
          endGame(false);
        }
      }
    });
  }

  function updateMowers(dt) {
    state.mowers.forEach(function (m) {
      if (!m.moving) return;
      m.x += 900 * dt;
      m.el.style.left = (CFG.lawnX - 46 + m.x) + 'px';
      state.zombies.slice().forEach(function (z) {
        if (z.row === m.row && z.x < m.x + 40) killZombie(z);
      });
      if (m.x > 860) { m.moving = false; m.el.style.display = 'none'; }
    });
  }

  function updateSuns(dt) {
    state.suns.slice().forEach(function (s) {
      if (s.dead) return;
      if (!s.landed) {
        s.y += s.vy * dt;
        if (s.y >= s.targetY) { s.y = s.targetY; s.landed = true; }
        s.el.style.top = s.y + 'px';
      }
      if (s.landed) {
        s.life -= dt;
        if (s.life < 2) s.el.style.opacity = Math.max(0, s.life / 2);
        if (s.life <= 0) {
          s.dead = true; s.el.remove();
          var i = state.suns.indexOf(s);
          if (i >= 0) state.suns.splice(i, 1);
        }
      }
    });
  }

  function spawnWave() {
    var t = state.time;
    if (t >= 168 && !state.finalWave) {
      state.finalWave = true;
      toast('⚠ 最终一波僵尸来了！', 2600);
      beep(180, .5, 'sawtooth', .07);
      ['gargantuar', 'football', 'bucket', 'cone', 'dancer', 'basic'].forEach(function (type, i) {
        spawnZombie(type, (i * 2 + Math.floor(Math.random() * 2)) % CFG.rows, 850 + i * 24 + Math.random() * 40);
      });
      return;
    }
    if (t >= CFG.levelTime) return;
    var progress = t / CFG.levelTime;
    var count = 1 + Math.floor(progress * 1.5) + Math.floor(Math.random() * 2);
    var pool = ['basic', 'basic', 'basic', 'cone'];
    if (progress > .3) pool.push('bucket', 'newspaper');
    if (progress > .55) pool.push('football', 'flag');
    if (progress > .72) pool.push('dancer', 'cone', 'bucket');
    for (var i = 0; i < count; i++) {
      var type = pool[Math.floor(Math.random() * pool.length)];
      spawnZombie(type, Math.floor(Math.random() * CFG.rows), 840 + i * 28 + Math.random() * 40);
    }
    state.nextSpawn = t + Math.max(8, 13 - progress * 4) + Math.random() * 3;
  }

  function updateProgress() {
    var p = Math.min(state.time / CFG.levelTime, 1);
    $('#progress-fill').style.width = (p * 100).toFixed(1) + '%';
    var wave = Math.min(4, Math.floor(p * 4) + 1);
    var label = ['准备迎敌…', '第一波 · 试探', '第二波 · 进攻', '第三波 · 强攻', '最终波 · 守住草坪！'][wave];
    if (wave > state.wave) {
      state.wave = wave;
      if (wave === 4) toast('⚠ 一大波僵尸正在接近！', 2000);
    }
    $('#wave-label').textContent = label + '  ·  ' + fmtTime(state.time) + '  ·  击杀 ' + state.kills;
  }

  function endGame(win) {
    if (state.ended) return;
    state.ended = true;
    state.running = false;
    var best = parseInt(localStorage.getItem('pvz_clone_kills') || '0', 10);
    if (state.kills > best) { best = state.kills; localStorage.setItem('pvz_clone_kills', String(best)); }
    $('#end-title').textContent = win ? '你守住了草坪！' : '僵尸吃掉了你的脑子！';
    $('#end-stats').innerHTML = '存活时间：' + fmtTime(state.time) + '<br>击杀僵尸：' + state.kills + '<br>历史最佳：' + best;
    $('#end-screen').classList.remove('hidden');
    if (win) { beep(660, .2, 'triangle', .07); setTimeout(function () { beep(880, .4, 'triangle', .07); }, 200); }
    else beep(100, .7, 'sawtooth', .08);
  }

  function frame(now) {
    if (!state || state.ended) return;
    var dt = Math.min((now - state.last) / 1000, .05);
    state.last = now;
    if (state.running && !state.paused) {
      state.time += dt;
      PLANTS.forEach(function (p) {
        if (state.cooldown[p.id] > 0) state.cooldown[p.id] = Math.max(0, state.cooldown[p.id] - dt);
      });
      if (Math.floor(state.time * 4) !== Math.floor((state.time - dt) * 4)) updateCards();
      if (state.time >= state.nextSpawn && !state.finalWave) spawnWave();
      if (Math.floor(state.time / 5) > Math.floor((state.time - dt) / 5) && state.time < CFG.levelTime - 6) {
        addSun(40 + Math.random() * 720, -40, 40 + Math.random() * 400, true);
      }
      updatePlants(dt);
      updatePeas(dt);
      updateZombies(dt);
      updateMowers(dt);
      updateSuns(dt);
      updateProgress();
      if (state.finalWave && state.time >= CFG.levelTime && state.zombies.length === 0) endGame(true);
    }
    state.rafId = requestAnimationFrame(frame);
  }

  /* ---------------- 启动 ---------------- */
  function init() {
    game = $('#game'); lawn = $('#lawn');
    gridEl = $('#grid'); entityLayer = $('#entity-layer');
    sunLayer = $('#sun-layer'); fxLayer = $('#fx-layer'); mowerLayer = $('#mower-layer');
    buildBoard(); buildCards(); bindUI(); resize(); reset();
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
