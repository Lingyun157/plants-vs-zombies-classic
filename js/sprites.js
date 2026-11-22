/* 原创 SVG 素材：所有植物、僵尸均用代码绘制，不引用任何原版图片资源 */
(function (global) {
  'use strict';

  function wrap(inner, vb) {
    return '<svg viewBox="' + (vb || '0 0 100 100') + '" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">' + inner + '</svg>';
  }
  function eyes(cx1, cx2, cy, r, pupil) {
    var p = pupil == null ? 2 : pupil;
    return '<ellipse cx="' + cx1 + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.15) + '" fill="#fff"/>' +
           '<circle cx="' + (cx1 + p) + '" cy="' + (cy + .5) + '" r="' + (p * .9) + '" fill="#222"/>' +
           '<ellipse cx="' + cx2 + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.15) + '" fill="#fff"/>' +
           '<circle cx="' + (cx2 + p) + '" cy="' + (cy + .5) + '" r="' + (p * .9) + '" fill="#222"/>';
  }
  function smile(cx, cy, w, color) {
    return '<path d="M' + (cx - w) + ' ' + cy + ' Q' + cx + ' ' + (cy + 8) + ' ' + (cx + w) + ' ' + cy +
      '" fill="none" stroke="' + (color || '#3b2412') + '" stroke-width="2.4" stroke-linecap="round"/>';
  }
  function stem(leafY) {
    var y = leafY || 74;
    return '<path d="M50 96 Q46 76 50 ' + (y - 24) + '" stroke="#348229" stroke-width="8" fill="none" stroke-linecap="round"/>' +
      '<path d="M47 84 Q24 84 19 68 Q40 65 48 77Z" fill="#4fa93a" stroke="#2f7a24" stroke-width="1.5"/>' +
      '<path d="M53 79 Q76 80 81 65 Q60 62 52 73Z" fill="#61bb45" stroke="#2f7a24" stroke-width="1.5"/>' +
      '<path d="M25 70 Q37 72 44 79 M74 68 Q63 70 55 76" stroke="#8ed36a" stroke-width="1.3" fill="none"/>';
  }

  var plant = {
    sunflower: function () {
      var petals = '';
      for (var i = 0; i < 12; i++) {
        var a = i * 30;
        petals += '<ellipse cx="50" cy="13" rx="8.5" ry="16" fill="' + (i % 2 ? '#ffd43b' : '#ffc622') +
          '" stroke="#e8a90e" stroke-width="1.2" transform="rotate(' + a + ' 50 43)"/>';
      }
      var seeds = '';
      for (var j = 0; j < 18; j++) {
        var ang = j * 2.399, rad = 3 + Math.sqrt(j + 1) * 3.4;
        seeds += '<circle cx="' + (50 + Math.cos(ang) * rad).toFixed(1) + '" cy="' + (43 + Math.sin(ang) * rad).toFixed(1) + '" r="1.1" fill="#5e3b17"/>';
      }
      return wrap(stem(80) + petals + '<circle cx="50" cy="43" r="21" fill="#9b6326" stroke="#6d3f13" stroke-width="2"/>' +
        seeds + eyes(43, 57, 41, 5.5, 1.6) + smile(50, 49, 7, '#47290f'));
    },
    peashooter: function () {
      return wrap(stem(76) +
        '<path d="M62 34 Q78 32 88 37 L88 49 Q76 53 62 51Z" fill="#53ad35" stroke="#2e7623" stroke-width="2"/>' +
        '<ellipse cx="88" cy="43" rx="7" ry="9" fill="#3f8c2a" stroke="#25611c" stroke-width="2"/>' +
        '<circle cx="48" cy="41" r="24" fill="#6ccf45" stroke="#317a25" stroke-width="2.5"/>' +
        '<path d="M32 30 Q42 20 55 22" stroke="#a5e57e" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        eyes(43, 56, 35, 6, 2.2) + smile(50, 48, 8));
    },
    wallnut: function (stage) {
      var crack = '';
      if (stage === 1) crack = '<path d="M36 28 L42 40 L37 48 M65 66 L58 74" stroke="#7b4a1f" stroke-width="2" fill="none"/>';
      if (stage === 2) crack = '<path d="M34 24 L43 39 L35 48 L44 60 M64 60 L55 72 L62 82" stroke="#6d3d16" stroke-width="2.6" fill="none"/><path d="M57 30 L66 38" stroke="#6d3d16" stroke-width="2" fill="none"/>';
      var face = eyes(41, 59, 50, 6, 2) + '<path d="M43 65 Q50 72 58 64" fill="none" stroke="#5b3415" stroke-width="2.5" stroke-linecap="round"/>';
      return wrap('<ellipse cx="50" cy="54" rx="32" ry="40" fill="#b97738" stroke="#78471d" stroke-width="3"/>' +
        '<path d="M27 38 Q35 18 55 17" stroke="#e4a765" stroke-width="6" fill="none" stroke-linecap="round" opacity=".8"/>' +
        '<ellipse cx="60" cy="79" rx="12" ry="6" fill="#8b5527" opacity=".45"/>' + crack + face);
    },
    cherryBomb: function () {
      var face1 = '<path d="M25 55 L34 51 M43 53 L35 57" stroke="#4a1110" stroke-width="3"/>' + eyes(29, 39, 61, 5, 1.5) + smile(34, 70, 5, '#5a1410');
      var face2 = '<path d="M61 55 L70 51 M79 53 L71 57" stroke="#4a1110" stroke-width="3"/>' + eyes(65, 75, 61, 5, 1.5) + smile(70, 70, 5, '#5a1410');
      return wrap('<path d="M34 44 Q30 22 46 16 M66 44 Q72 24 56 16" stroke="#3e8b2b" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M44 18 Q58 8 66 18 Q56 24 44 18Z" fill="#59b83e" stroke="#2f7a24" stroke-width="1.5"/>' +
        '<circle cx="34" cy="65" r="23" fill="#e33b32" stroke="#941f19" stroke-width="2.5"/>' +
        '<circle cx="70" cy="65" r="23" fill="#e33b32" stroke="#941f19" stroke-width="2.5"/>' +
        '<ellipse cx="25" cy="55" rx="6" ry="4" fill="#ff8a7a" opacity=".8"/><ellipse cx="61" cy="55" rx="6" ry="4" fill="#ff8a7a" opacity=".8"/>' +
        face1 + face2);
    },
    repeater: function () {
      return wrap(stem(76) +
        '<path d="M62 28 Q80 26 90 31 L90 38 Q76 41 62 39Z" fill="#4b9f2e" stroke="#2c6e20" stroke-width="2"/>' +
        '<ellipse cx="90" cy="34" rx="6" ry="7" fill="#337c25"/>' +
        '<path d="M62 46 Q80 44 90 49 L90 58 Q76 61 62 58Z" fill="#57b537" stroke="#2c6e20" stroke-width="2"/>' +
        '<ellipse cx="90" cy="53" rx="6" ry="8" fill="#337c25"/>' +
        '<circle cx="47" cy="45" r="25" fill="#6ccf45" stroke="#317a25" stroke-width="2.5"/>' +
        '<path d="M31 34 Q41 23 54 25" stroke="#a5e57e" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        eyes(42, 56, 40, 6, 2.2) + smile(49, 54, 8));
    },
    snowPea: function () {
      var snow = '<g stroke="#eafaff" stroke-width="2" stroke-linecap="round"><path d="M50 26v14M43 30l14 7M57 30l-14 7"/></g>';
      return wrap(stem(76) +
        '<path d="M62 34 Q78 32 88 37 L88 49 Q76 53 62 51Z" fill="#63c7d8" stroke="#2e8296" stroke-width="2"/>' +
        '<ellipse cx="88" cy="43" rx="7" ry="9" fill="#3d9fb6" stroke="#237488" stroke-width="2"/>' +
        '<circle cx="48" cy="43" r="24" fill="#83dce9" stroke="#2e8296" stroke-width="2.5"/>' +
        '<path d="M32 32 Q42 22 55 24" stroke="#e2fbff" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        snow + eyes(42, 56, 38, 5.8, 2) + smile(49, 51, 7));
    },
    chomper: function () {
      return wrap(stem(78) +
        '<ellipse cx="49" cy="41" rx="30" ry="28" fill="#a765c8" stroke="#6d3690" stroke-width="2.5"/>' +
        '<path d="M22 46 Q50 36 78 46 Q75 72 50 75 Q25 72 22 46Z" fill="#3d174f" stroke="#6d3690" stroke-width="2"/>' +
        '<path d="M26 47 l7 11 6-10 7 11 7-11 7 11 7-11 7 10 6-10" fill="#fff3e0"/>' +
        '<path d="M32 69 Q50 62 68 69 Q56 78 44 76Z" fill="#e87b9c"/>' +
        '<ellipse cx="35" cy="29" rx="7" ry="8" fill="#fff"/><circle cx="37" cy="30" r="3" fill="#222"/>' +
        '<ellipse cx="61" cy="29" rx="7" ry="8" fill="#fff"/><circle cx="63" cy="30" r="3" fill="#222"/>' +
        '<path d="M28 20 Q35 15 42 20 M58 20 Q65 15 72 20" stroke="#6d3690" stroke-width="2.5" fill="none"/>');
    },
    potatoMine: function (armed) {
      var light = armed ? '<circle cx="50" cy="52" r="11" fill="#ff3b2f" stroke="#8e120d" stroke-width="2"/>' +
          '<circle cx="50" cy="52" r="5" fill="#ffd0a0"/><circle cx="46" cy="48" r="2.5" fill="#fff"/>' :
        '<circle cx="50" cy="52" r="9" fill="#8c3d33" stroke="#5d231c" stroke-width="2"/><circle cx="50" cy="52" r="3.5" fill="#d18072"/>';
      return wrap('<ellipse cx="50" cy="64" rx="32" ry="27" fill="#a97644" stroke="#6d4724" stroke-width="2.5"/>' +
        '<circle cx="28" cy="62" r="5" fill="#8d6037"/><circle cx="72" cy="60" r="6" fill="#8d6037"/>' +
        '<circle cx="62" cy="79" r="4" fill="#8d6037"/><circle cx="37" cy="80" r="3.5" fill="#8d6037"/>' +
        '<ellipse cx="34" cy="54" rx="7" ry="4" fill="#c99a68" opacity=".7"/>' + light +
        '<path d="M33 76 Q40 82 47 76" stroke="#5b3415" stroke-width="2" fill="none" stroke-linecap="round"/>');
    },
    threepeater: function () {
      var out = stem(88);
      var ys = [20, 45, 70];
      for (var i = 0; i < 3; i++) {
        var y = ys[i];
        out += '<path d="M' + 44 + ' ' + (y + 10) + ' Q58 ' + (y + 8) + ' 61 ' + y + '" stroke="#348229" stroke-width="5" fill="none"/>';
        out += '<path d="M60 ' + (y - 8) + ' Q78 ' + (y - 10) + ' 88 ' + (y - 5) + ' L88 ' + (y + 5) + ' Q76 ' + (y + 8) + ' 60 ' + (y + 7) + 'Z" fill="#57b537" stroke="#2c6e20" stroke-width="1.8"/>';
        out += '<ellipse cx="88" cy="' + y + '" rx="6" ry="8" fill="#337c25"/>';
        out += '<circle cx="49" cy="' + y + '" r="14" fill="#6ccf45" stroke="#317a25" stroke-width="2"/>';
        out += '<circle cx="45" cy="' + (y - 2) + '" r="2.5" fill="#fff"/><circle cx="46" cy="' + (y - 2) + '" r="1.2" fill="#222"/>';
        out += '<circle cx="55" cy="' + (y - 2) + '" r="2.5" fill="#fff"/><circle cx="56" cy="' + (y - 2) + '" r="1.2" fill="#222"/>';
      }
      return wrap(out);
    },
    squash: function () {
      return wrap('<path d="M52 30 Q58 20 64 22" stroke="#4b8c2d" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="49" cy="62" rx="31" ry="28" transform="rotate(-16 49 62)" fill="#ff9b3d" stroke="#c45f16" stroke-width="2.5"/>' +
        '<path d="M35 39 Q26 62 36 84 M52 35 Q44 60 53 88 M66 41 Q60 64 68 80" stroke="#e67f25" stroke-width="2" fill="none"/>' +
        eyes(40, 58, 58, 6.5, 2.3) + '<path d="M38 73 Q49 85 62 71 Q54 76 46 75Z" fill="#7a2c0c"/>' +
        '<path d="M42 74 l3 5 3-5 M52 74 l3 5 3-5" fill="#fff"/>');
    },
    jalapeno: function () {
      return wrap('<path d="M67 18 Q76 12 82 16" stroke="#39852a" stroke-width="6" fill="none" stroke-linecap="round"/>' +
        '<path d="M66 22 Q82 30 76 55 Q70 84 38 88 Q20 88 18 72 Q40 76 52 58 Q64 40 66 22Z" fill="#e8352a" stroke="#9c1b14" stroke-width="2.5"/>' +
        '<path d="M62 30 Q72 44 66 62" stroke="#ff8174" stroke-width="4" fill="none" stroke-linecap="round"/>' +
        '<path d="M36 48 L46 44 M52 45 L62 49" stroke="#5e110c" stroke-width="3"/>' +
        eyes(40, 56, 55, 5.5, 2) + '<path d="M36 68 Q45 76 55 67" stroke="#5e110c" stroke-width="2.5" fill="none" stroke-linecap="round"/>');
    }
  };

  /* 僵尸基础身体 + 可替换装饰 */
  function zombieBase(opt) {
    var skin = opt.skin || '#a9bb8d';
    var shirt = opt.shirt || '#6d7c96';
    var pants = opt.pants || '#4a5368';
    var hair = opt.hair || '#4a4438';
    var s = '';
    // 腿和鞋
    s += '<rect x="37" y="94" width="12" height="35" rx="4" fill="' + pants + '"/>' +
         '<rect x="57" y="94" width="12" height="35" rx="4" fill="' + pants + '"/>' +
         '<path d="M34 126 h18 v8 h-22 q-3-5 4-8Z" fill="#2b2b30"/><path d="M55 126 h18 q7 3 4 8 h-22Z" fill="#2b2b30"/>';
    // 身体（破洞衣摆）
    s += '<path d="M32 60 Q50 54 72 60 L76 98 L68 94 L62 100 L54 95 L46 101 L38 95 L30 99 L28 68Z" fill="' + shirt + '" stroke="#394357" stroke-width="2"/>';
    // 伸出的手臂
    s += '<path d="M34 66 Q20 68 10 76" stroke="' + shirt + '" stroke-width="12" fill="none" stroke-linecap="round"/>' +
         '<path d="M12 75 L4 82" stroke="' + skin + '" stroke-width="10" fill="none" stroke-linecap="round"/>' +
         '<circle cx="5" cy="83" r="6" fill="' + skin + '"/>';
    s += '<path d="M70 66 Q82 70 86 80" stroke="' + shirt + '" stroke-width="10" fill="none" stroke-linecap="round"/>' +
         '<circle cx="88" cy="83" r="6" fill="' + skin + '"/>';
    // 头
    s += '<rect x="47" y="50" width="12" height="14" fill="' + skin + '"/>' +
         '<ellipse cx="54" cy="33" rx="21" ry="24" fill="' + skin + '" stroke="#687e52" stroke-width="2"/>' +
         '<ellipse cx="35" cy="36" rx="5" ry="7" fill="' + skin + '"/>' +
         '<path d="M37 18 Q44 8 60 10 Q72 11 75 22 Q60 17 37 25Z" fill="' + hair + '"/>';
    // 眼睛、嘴
    s += '<ellipse cx="47" cy="31" rx="6" ry="7" fill="#fff"/><circle cx="49" cy="33" r="2.6" fill="#222"/>' +
         '<ellipse cx="63" cy="31" rx="6" ry="7" fill="#fff"/><circle cx="65" cy="33" r="2.6" fill="#222"/>' +
         '<path d="M44 45 Q55 53 68 44 L66 51 Q54 57 46 50Z" fill="#3c2a24"/>' +
         '<path d="M48 46 l3 4 3-4 M58 46 l3 4 3-4" fill="#fff"/>';
    return s;
  }
  function coneHat() {
    return '<g class="hat"><path d="M42 16 L54 -12 L70 18Z" fill="#ef8b28" stroke="#a85a10" stroke-width="2"/>' +
      '<path d="M46 6 L65 8 M43 13 L69 16" stroke="#ffd6a0" stroke-width="3"/>' +
      '<ellipse cx="56" cy="17" rx="19" ry="5" fill="#e07a19" stroke="#a85a10" stroke-width="1.5"/></g>';
  }
  function bucketHat() {
    return '<g class="hat"><path d="M35 8 L75 8 L71 27 Q55 32 39 27Z" fill="#aab4bc" stroke="#5d6a72" stroke-width="2"/>' +
      '<path d="M38 12 L72 12 M40 19 L70 19" stroke="#d9e2e7" stroke-width="2"/>' +
      '<ellipse cx="55" cy="8" rx="20" ry="4" fill="#c4ced5" stroke="#5d6a72" stroke-width="1.5"/></g>';
  }
  function newspaper() {
    return '<g class="hat"><path d="M18 58 L70 52 L74 90 L22 96Z" fill="#e9e5d5" stroke="#9b9785" stroke-width="2"/>' +
      '<path d="M24 63 L64 59 M24 69 L64 65 M24 75 L58 71 M24 81 L62 77 M24 87 L50 83" stroke="#8d8a79" stroke-width="2"/>' +
      '<path d="M28 58 v36" stroke="#aaa58f" stroke-width="1.5"/></g>';
  }
  function footballHat() {
    return '<g class="hat"><path d="M33 24 Q36 0 56 0 Q76 0 77 24Z" fill="#c33b2e" stroke="#7d2018" stroke-width="2"/>' +
      '<path d="M55 2 L55 24 M36 10 Q55 16 74 10" stroke="#f5f3e8" stroke-width="4" fill="none"/>' +
      '<path d="M32 24 Q55 32 78 24" stroke="#eee" stroke-width="3" fill="none"/>' +
      '<path d="M36 29 Q28 34 35 38 M72 29 Q80 34 73 38" stroke="#d8d8d8" stroke-width="2.5" fill="none"/></g>';
  }
  function dancerHat() {
    var afro = '';
    for (var i = 0; i < 9; i++) {
      var a = i / 9 * Math.PI * 2;
      afro += '<circle cx="' + (55 + Math.cos(a) * 19).toFixed(1) + '" cy="' + (16 + Math.sin(a) * 15).toFixed(1) + '" r="10" fill="#2e2a26"/>';
    }
    return '<g class="hat">' + afro +
      '<path d="M39 31 h32 l-2 9 h-28Z" fill="#111" opacity=".9"/><circle cx="48" cy="35" r="5" fill="#3d4c55"/><circle cx="63" cy="35" r="5" fill="#3d4c55"/>' +
      '<path d="M53 35 h5" stroke="#111" stroke-width="2"/></g>';
  }
  function flagHat() {
    return '<g class="hat"><path d="M22 8 L24 104" stroke="#6b5030" stroke-width="4"/>' +
      '<path d="M24 10 Q42 4 54 12 Q42 20 24 16Z" fill="#e04332" stroke="#8e2219" stroke-width="1.5"/>' +
      '<circle cx="36" cy="12" r="2.6" fill="#fff"/></g>';
  }

  var zombie = {
    basic: function () { return wrap(zombieBase({}), '0 0 100 140'); },
    cone: function () { return wrap(coneHat() + zombieBase({}), '0 0 100 140'); },
    bucket: function () { return wrap(bucketHat() + zombieBase({ shirt: '#7a6b91' }), '0 0 100 140'); },
    newspaper: function () { return wrap(newspaper() + zombieBase({ shirt: '#5c8060', skin: '#b4c69a' }), '0 0 100 140'); },
    football: function () { return wrap(footballHat() + zombieBase({ shirt: '#d27134', pants: '#37405a', skin: '#b3c293' }), '0 0 100 140'); },
    dancer: function () { return wrap(dancerHat() + zombieBase({ shirt: '#e8c33f', pants: '#7a4c9c' }), '0 0 100 140'); },
    flag: function () { return wrap(flagHat() + zombieBase({ shirt: '#87775c' }), '0 0 100 140'); },
    gargantuar: function () {
      return wrap('<path d="M82 6 L88 118" stroke="#8d6a3f" stroke-width="12" stroke-linecap="round"/>' +
        zombieBase({ skin: '#8fa774', shirt: '#59604c', pants: '#3d4037', hair: '#2e2b26' }) +
        '<path d="M40 12 L52 -6 L66 14Z" fill="#6b6b6b" stroke="#333" stroke-width="2"/>', '0 0 100 140');
    }
  };

  var misc = {
    pea: function () { return wrap('<circle cx="10" cy="10" r="8" fill="#6ccf45" stroke="#2e7623" stroke-width="2"/><circle cx="7" cy="7" r="2.6" fill="#c8f0a8"/>', '0 0 20 20'); },
    snowPea: function () { return wrap('<circle cx="10" cy="10" r="8" fill="#8ee4f2" stroke="#2e8296" stroke-width="2"/><path d="M10 4v12M5 7l10 6M15 7L5 13" stroke="#fff" stroke-width="1.6"/>', '0 0 20 20'); },
    sun: function () {
      var rays = '';
      for (var i = 0; i < 12; i++) rays += '<ellipse cx="31" cy="6" rx="4" ry="9" fill="#ffd23b" transform="rotate(' + (i * 30) + ' 31 31)"/>';
      return wrap(rays + '<circle cx="31" cy="31" r="20" fill="#ffdb4d" stroke="#f0a51d" stroke-width="2"/>' +
        '<circle cx="31" cy="31" r="15" fill="#fff2a1" opacity=".75"/><circle cx="25" cy="25" r="4" fill="#fff" opacity=".85"/>', '0 0 62 62');
    },
    mower: function () {
      return wrap('<rect x="8" y="18" width="44" height="24" rx="5" fill="#c94132" stroke="#7a2118" stroke-width="2"/>' +
        '<path d="M10 26 h40" stroke="#ef8c74" stroke-width="3"/>' +
        '<rect x="30" y="6" width="7" height="16" rx="2" fill="#8b8b8b"/>' +
        '<circle cx="19" cy="45" r="9" fill="#333" stroke="#111" stroke-width="2"/><circle cx="45" cy="45" r="9" fill="#333" stroke="#111" stroke-width="2"/>' +
        '<circle cx="19" cy="45" r="3" fill="#aaa"/><circle cx="45" cy="45" r="3" fill="#aaa"/>' +
        '<path d="M52 36 L60 30 L60 44Z" fill="#ddd" stroke="#888" stroke-width="1.5"/>', '0 0 68 56');
    }
  };

  global.Sprites = { plant: plant, zombie: zombie, misc: misc, wrap: wrap };
})(window);
