/*
 * motor.js - animated backgrounds for xat groups (xatframe).
 * Usage: xatFrame(canvas, { tema, cor1, cor2, fundo, texto, velocidade })
 * Follows xatframe rules: no flashing, no cookies, no external requests,
 * slow motion, and respects prefers-reduced-motion.
 */
(function (global) {
    'use strict';

    var PADRAO = { tema: 'codigo', cor1: '#7c3aed', cor2: '#06b6d4', fundo: '#070b1a', texto: '', velocidade: 1 };

    var TRECHOS = [
        '.chat {', 'display: grid;', 'place-items: center;', '}', '@keyframes brilho', 'color: var(--cor);',
        'const bot = new Bot();', '=> {', '</div>', '<canvas>', 'await fetch(url)', 'git push',
        'border-radius: 12px;', 'npm start', 'function () {}', 'return true;', 'flex-wrap: wrap;', 'transition: .3s;',
        'if (online) {', 'let xats = 0;', 'z-index: 10;', 'rgba(0,0,0,.5)', 'console.log()', 'export default'
    ];

    function rgba(hex, a) {
        var h = hex.replace('#', '');
        if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
        var n = parseInt(h, 16);
        return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
    }

    function rand(a, b) { return a + Math.random() * (b - a); }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function brilho(ctx, x, y, r, cor, a) {
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, rgba(cor, a));
        g.addColorStop(1, rgba(cor, 0));
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }

    function marcaDagua(ctx, w, h, cfg) {
        if (!cfg.texto) return;
        var size = Math.min(w / (cfg.texto.length * 0.62), h * 0.16);
        ctx.save();
        ctx.font = '800 ' + size + 'px system-ui, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = rgba('#ffffff', 0.05);
        ctx.fillText(cfg.texto, w / 2, h - size * 0.25);
        ctx.restore();
    }

    /* ---------- themes: each returns { desenhar(ctx, w, h, t, dt) } ---------- */

    var TEMAS = {};

    TEMAS.codigo = function (cfg) {
        var itens = [];
        function povoar(w, h) {
            var n = Math.max(14, Math.round(w * h / 26000));
            itens = [];
            for (var i = 0; i < n; i++) itens.push(novo(w, h, true));
        }
        function novo(w, h, qualquerY) {
            return {
                x: rand(0, w), y: qualquerY ? rand(0, h) : h + 20,
                txt: pick(TRECHOS), vel: rand(8, 22), a: rand(0.07, 0.24),
                tam: rand(11, 17), cor: pick([cfg.cor1, cfg.cor2, '#e2e8f0'])
            };
        }
        var ultW = 0, ultH = 0;
        return {
            desenhar: function (ctx, w, h, t, dt) {
                if (w !== ultW || h !== ultH) { povoar(w, h); ultW = w; ultH = h; }
                ctx.strokeStyle = rgba('#ffffff', 0.035);
                ctx.lineWidth = 1;
                ctx.beginPath();
                for (var gx = 0; gx < w; gx += 44) { ctx.moveTo(gx + 0.5, 0); ctx.lineTo(gx + 0.5, h); }
                for (var gy = 0; gy < h; gy += 44) { ctx.moveTo(0, gy + 0.5); ctx.lineTo(w, gy + 0.5); }
                ctx.stroke();
                brilho(ctx, w * 0.12 + Math.sin(t * 0.00015) * 40, h * 0.2, Math.max(w, h) * 0.45, cfg.cor1, 0.22);
                brilho(ctx, w * 0.9, h * 0.85 + Math.cos(t * 0.00012) * 40, Math.max(w, h) * 0.45, cfg.cor2, 0.18);
                ctx.textBaseline = 'middle';
                for (var i = 0; i < itens.length; i++) {
                    var p = itens[i];
                    p.y -= p.vel * dt * cfg.velocidade;
                    if (p.y < -20) itens[i] = p = novo(w, h, false);
                    ctx.font = p.tam + 'px Consolas, "Cascadia Code", Menlo, monospace';
                    ctx.fillStyle = rgba(p.cor, p.a);
                    ctx.fillText(p.txt, p.x, p.y);
                }
                marcaDagua(ctx, w, h, cfg);
            }
        };
    };

    TEMAS.galaxia = function (cfg) {
        var camadas = [];
        var ultW = 0, ultH = 0;
        function povoar(w, h) {
            camadas = [0.25, 0.6, 1].map(function (prof) {
                var n = Math.round(w * h / (9000 / prof));
                var estrelas = [];
                for (var i = 0; i < n; i++) estrelas.push({ x: rand(0, w), y: rand(0, h), r: rand(0.4, 1.5) * prof + 0.2, f: rand(0, 6.28) });
                return { prof: prof, estrelas: estrelas };
            });
        }
        return {
            desenhar: function (ctx, w, h, t, dt) {
                if (w !== ultW || h !== ultH) { povoar(w, h); ultW = w; ultH = h; }
                var m = Math.max(w, h);
                brilho(ctx, w * 0.25 + Math.sin(t * 0.0001) * 60, h * 0.35, m * 0.5, cfg.cor1, 0.28);
                brilho(ctx, w * 0.75, h * 0.6 + Math.cos(t * 0.00008) * 60, m * 0.45, cfg.cor2, 0.22);
                for (var c = 0; c < camadas.length; c++) {
                    var cam = camadas[c];
                    for (var i = 0; i < cam.estrelas.length; i++) {
                        var s = cam.estrelas[i];
                        s.x -= cam.prof * 6 * dt * cfg.velocidade;
                        if (s.x < 0) s.x += w;
                        // gentle twinkle (0.55 - 0.95): never flashes
                        ctx.fillStyle = rgba('#ffffff', 0.75 + Math.sin(t * 0.0012 + s.f) * 0.2);
                        ctx.beginPath();
                        ctx.arc(s.x, s.y, s.r, 0, 6.283);
                        ctx.fill();
                    }
                }
                // planet
                var px = w * 0.86, py = h * 0.8 + Math.sin(t * 0.0004) * 6, pr = Math.min(w, h) * 0.11;
                brilho(ctx, px, py, pr * 2.2, cfg.cor2, 0.25);
                var g = ctx.createLinearGradient(px - pr, py - pr, px + pr, py + pr);
                g.addColorStop(0, cfg.cor2);
                g.addColorStop(1, cfg.cor1);
                ctx.fillStyle = g;
                ctx.beginPath(); ctx.arc(px, py, pr, 0, 6.283); ctx.fill();
                ctx.fillStyle = rgba('#000000', 0.35);
                ctx.beginPath(); ctx.arc(px + pr * 0.35, py + pr * 0.3, pr * 0.95, 0, 6.283); ctx.fill();
                ctx.strokeStyle = rgba('#ffffff', 0.55);
                ctx.lineWidth = Math.max(1.5, pr * 0.05);
                ctx.beginPath(); ctx.ellipse(px, py, pr * 1.7, pr * 0.38, -0.35, 0, 6.283); ctx.stroke();
                marcaDagua(ctx, w, h, cfg);
            }
        };
    };

    TEMAS.neon = function (cfg) {
        var estrelas = [], ultW = 0, ultH = 0;
        return {
            desenhar: function (ctx, w, h, t, dt) {
                if (w !== ultW || h !== ultH) {
                    estrelas = [];
                    for (var i = 0; i < w * h / 7000; i++) estrelas.push({ x: rand(0, w), y: rand(0, h * 0.55), r: rand(0.4, 1.3) });
                    ultW = w; ultH = h;
                }
                var horiz = h * 0.62;
                var ceu = ctx.createLinearGradient(0, 0, 0, horiz);
                ceu.addColorStop(0, rgba(cfg.fundo, 0));
                ceu.addColorStop(1, rgba(cfg.cor1, 0.35));
                ctx.fillStyle = ceu;
                ctx.fillRect(0, 0, w, horiz);
                ctx.fillStyle = rgba('#ffffff', 0.7);
                estrelas.forEach(function (s) { ctx.fillRect(s.x, s.y, s.r, s.r); });
                // sun with stripes
                var sr = Math.min(w, h) * 0.2, sx = w / 2, sy = horiz - sr * 0.35;
                brilho(ctx, sx, sy, sr * 2.2, cfg.cor2, 0.3);
                ctx.save();
                ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 6.283); ctx.clip();
                var sol = ctx.createLinearGradient(0, sy - sr, 0, sy + sr);
                sol.addColorStop(0, cfg.cor2); sol.addColorStop(1, cfg.cor1);
                ctx.fillStyle = sol;
                ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
                ctx.fillStyle = cfg.fundo;
                for (var k = 0; k < 7; k++) {
                    var fy = sy + k * sr * 0.14, fh = 1 + k * sr * 0.018;
                    ctx.fillRect(sx - sr, fy, sr * 2, fh);
                }
                ctx.restore();
                // floor
                ctx.fillStyle = cfg.fundo;
                ctx.fillRect(0, horiz, w, h - horiz);
                ctx.strokeStyle = rgba(cfg.cor1, 0.8);
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                var linhas = 14, desloc = (t * 0.00012 * cfg.velocidade) % 1;
                for (var j = 0; j < linhas; j++) {
                    var z = (j + desloc) / linhas, y = horiz + (h - horiz) * z * z;
                    ctx.moveTo(0, y); ctx.lineTo(w, y);
                }
                for (var v = -16; v <= 16; v++) {
                    ctx.moveTo(w / 2 + v * w * 0.012, horiz);
                    ctx.lineTo(w / 2 + v * w * 0.14, h);
                }
                ctx.stroke();
                brilho(ctx, w / 2, horiz, w * 0.5, cfg.cor1, 0.12);
                marcaDagua(ctx, w, h, cfg);
            }
        };
    };

    TEMAS.aurora = function (cfg) {
        return {
            desenhar: function (ctx, w, h, t) {
                var m = Math.max(w, h), s = t * 0.00008 * cfg.velocidade;
                ctx.globalCompositeOperation = 'lighter';
                brilho(ctx, w * (0.3 + Math.sin(s * 1.3) * 0.2), h * (0.35 + Math.cos(s * 0.9) * 0.15), m * 0.55, cfg.cor1, 0.55);
                brilho(ctx, w * (0.7 + Math.cos(s * 1.1) * 0.2), h * (0.55 + Math.sin(s * 1.4) * 0.15), m * 0.5, cfg.cor2, 0.5);
                brilho(ctx, w * (0.5 + Math.sin(s * 0.7) * 0.3), h * (0.8 + Math.cos(s) * 0.1), m * 0.4, cfg.cor1, 0.32);
                brilho(ctx, w * (0.15 + Math.cos(s * 0.8) * 0.1), h * (0.85 + Math.sin(s * 1.2) * 0.1), m * 0.35, cfg.cor2, 0.3);
                ctx.globalCompositeOperation = 'source-over';
                marcaDagua(ctx, w, h, cfg);
            }
        };
    };

    TEMAS.petalas = function (cfg) {
        var itens = [], ultW = 0, ultH = 0;
        function novo(w, h, qualquerY) {
            return {
                x: rand(-50, w), y: qualquerY ? rand(0, h) : -20, r: rand(5, 11), rot: rand(0, 6.28),
                vr: rand(-0.6, 0.6), vy: rand(14, 30), fase: rand(0, 6.28), cor: pick([cfg.cor1, cfg.cor2]), a: rand(0.35, 0.75)
            };
        }
        return {
            desenhar: function (ctx, w, h, t, dt) {
                if (w !== ultW || h !== ultH) {
                    itens = [];
                    for (var i = 0; i < Math.max(12, w * h / 22000); i++) itens.push(novo(w, h, true));
                    ultW = w; ultH = h;
                }
                brilho(ctx, w * 0.5, 0, Math.max(w, h) * 0.6, cfg.cor1, 0.2);
                for (var k = 0; k < itens.length; k++) {
                    var p = itens[k];
                    p.y += p.vy * dt * cfg.velocidade;
                    p.x += Math.sin(t * 0.0008 + p.fase) * 12 * dt + 6 * dt;
                    p.rot += p.vr * dt;
                    if (p.y > h + 20 || p.x > w + 50) itens[k] = p = novo(w, h, false);
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillStyle = rgba(p.cor, p.a);
                    ctx.beginPath();
                    ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.283);
                    ctx.fill();
                    ctx.restore();
                }
                marcaDagua(ctx, w, h, cfg);
            }
        };
    };

    /*
     * estudio: premium scene built around the xat chat box (728px wide, centered).
     * Glow behind the chat, planet with orbiting moon on the left, a terminal typing
     * code on the right, aurora at the bottom. Side pieces only show on wide screens.
     */
    var TERMINAL = [
        '/* {texto} */',
        '.chat {',
        '  background: var(--vidro);',
        '  border-radius: 16px;',
        '  box-shadow: 0 0 40px #7c3aed;',
        '}',
        '',
        'const bot = new Bot();',
        'bot.on("entrar", user => {',
        '  bot.pc(user, "Bem-vindo!");',
        '});',
        '',
        '// online 24h'
    ];
    var CHAT_LARGURA = 728;

    TEMAS.estudio = function (cfg) {
        var estrelas = [], trechos = [], ultW = 0, ultH = 0;
        var linhas = TERMINAL.map(function (l) { return l.replace('{texto}', cfg.texto || 'xat'); });
        var totalChars = linhas.join('').length;
        var cadente = null, proximaCadente = 4000;

        function povoar(w, h) {
            estrelas = [];
            for (var i = 0; i < w * h / 5000; i++) {
                estrelas.push({ x: rand(0, w), y: rand(0, h), r: rand(0.3, 1.3), f: rand(0, 6.28) });
            }
            trechos = [];
            for (var j = 0; j < Math.max(8, w * h / 70000); j++) {
                trechos.push({ x: rand(0, w), y: rand(0, h), txt: pick(TRECHOS), vel: rand(6, 14), a: rand(0.05, 0.13), tam: rand(11, 14) });
            }
        }

        function aurora(ctx, w, h, t, k, cor) {
            var base = h * 0.8 + k * 30;
            ctx.beginPath();
            ctx.moveTo(0, h);
            for (var x = 0; x <= w + 40; x += 40) {
                ctx.lineTo(x, base + Math.sin(x * 0.0035 + t * 0.00025 * cfg.velocidade + k * 2) * 34);
            }
            ctx.lineTo(w, h);
            ctx.closePath();
            var g = ctx.createLinearGradient(0, base - 40, 0, h);
            g.addColorStop(0, rgba(cor, 0.16));
            g.addColorStop(1, rgba(cor, 0));
            ctx.fillStyle = g;
            ctx.fill();
        }

        function planeta(ctx, x, y, r, t) {
            var tilt = -0.32, anel = function (inicio, fim) {
                ctx.beginPath();
                ctx.ellipse(x, y, r * 1.75, r * 0.42, tilt, inicio, fim);
                ctx.stroke();
            };
            brilho(ctx, x, y, r * 2.6, cfg.cor1, 0.22);
            ctx.lineWidth = Math.max(2, r * 0.07);
            ctx.strokeStyle = rgba('#ffffff', 0.35);
            anel(Math.PI, Math.PI * 2);                       // back half of ring
            var ang = t * 0.00035 * cfg.velocidade;
            var mx = x + Math.cos(ang) * r * 2.1, my = y + Math.sin(ang) * r * 0.55;
            var luaAtras = Math.sin(ang) < 0;
            function lua() {
                ctx.fillStyle = rgba('#e2e8f0', 0.9);
                ctx.beginPath(); ctx.arc(mx, my, r * 0.12, 0, 6.283); ctx.fill();
            }
            if (luaAtras) lua();
            var g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
            g.addColorStop(0, cfg.cor2);
            g.addColorStop(1, cfg.cor1);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
            // soft bands + terminator shadow
            ctx.save();
            ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.clip();
            ctx.fillStyle = rgba('#ffffff', 0.08);
            for (var b = -2; b <= 2; b++) ctx.fillRect(x - r, y + b * r * 0.32 - r * 0.06, r * 2, r * 0.12);
            var s = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.2, x, y, r * 1.1);
            s.addColorStop(0, rgba('#000000', 0));
            s.addColorStop(1, rgba('#000000', 0.55));
            ctx.fillStyle = s;
            ctx.fillRect(x - r, y - r, r * 2, r * 2);
            ctx.restore();
            ctx.strokeStyle = rgba('#ffffff', 0.6);
            anel(0, Math.PI);                                 // front half of ring
            if (!luaAtras) lua();
        }

        function caixa(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
        }

        function terminal(ctx, cx, cy, largura, t) {
            var lh = 18, altura = 34 + linhas.length * lh + 14;
            var x = cx - largura / 2, y = cy - altura / 2;
            brilho(ctx, cx, cy, largura, cfg.cor2, 0.12);
            caixa(ctx, x, y, largura, altura, 12);
            ctx.fillStyle = 'rgba(8, 12, 30, 0.78)';
            ctx.fill();
            ctx.strokeStyle = rgba(cfg.cor1, 0.45);
            ctx.lineWidth = 1;
            ctx.stroke();
            ['#ff5f57', '#febc2e', '#28c840'].forEach(function (c, i) {
                ctx.fillStyle = rgba(c, 0.85);
                ctx.beginPath(); ctx.arc(x + 16 + i * 16, y + 16, 4.5, 0, 6.283); ctx.fill();
            });
            ctx.fillStyle = rgba('#ffffff', 0.4);
            ctx.font = '12px system-ui, "Segoe UI", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('style.css', cx, y + 20);
            ctx.textAlign = 'left';

            // typewriter: loops with a pause at the end, no blinking
            var ciclo = totalChars + 120;
            var mostrar = cfg.estatico ? totalChars : Math.floor(t * 0.018 * cfg.velocidade) % ciclo;
            ctx.save();
            caixa(ctx, x, y, largura, altura, 12);
            ctx.clip();
            ctx.font = '13px Consolas, "Cascadia Code", Menlo, monospace';
            ctx.textBaseline = 'middle';
            var resto = mostrar, cursorX = x + 16, cursorY = y + 42;
            for (var i = 0; i < linhas.length && resto >= 0; i++) {
                var linha = linhas[i], parte = linha.slice(0, resto);
                var ly = y + 42 + i * lh;
                resto -= linha.length;
                var tl = linha.trim();
                if (tl.indexOf('/') === 0) ctx.fillStyle = '#64748b';
                else if (/[{}]$|^}/.test(tl) || tl.indexOf('const') === 0) ctx.fillStyle = cfg.cor2;
                else ctx.fillStyle = '#cbd5e1';
                var dois = parte.indexOf(':');
                if (dois > 0 && ctx.fillStyle === '#cbd5e1') {
                    ctx.fillStyle = rgba(cfg.cor1, 1);
                    ctx.fillText(parte.slice(0, dois + 1), x + 16, ly);
                    var wKey = ctx.measureText(parte.slice(0, dois + 1)).width;
                    ctx.fillStyle = '#e2e8f0';
                    ctx.fillText(parte.slice(dois + 1), x + 16 + wKey, ly);
                } else {
                    ctx.fillText(parte, x + 16, ly);
                }
                cursorX = x + 16 + ctx.measureText(parte).width;
                cursorY = ly;
            }
            ctx.fillStyle = rgba(cfg.cor2, 0.8);
            ctx.fillRect(cursorX + 2, cursorY - 7, 7, 14);
            ctx.restore();
        }

        return {
            desenhar: function (ctx, w, h, t, dt) {
                if (w !== ultW || h !== ultH) { povoar(w, h); ultW = w; ultH = h; }
                var fundo = ctx.createLinearGradient(0, 0, 0, h);
                fundo.addColorStop(0, rgba(cfg.cor1, 0.06));
                fundo.addColorStop(1, rgba(cfg.cor2, 0.14));
                ctx.fillStyle = fundo;
                ctx.fillRect(0, 0, w, h);

                for (var i = 0; i < estrelas.length; i++) {
                    var s = estrelas[i];
                    ctx.fillStyle = rgba('#ffffff', 0.55 + Math.sin(t * 0.001 + s.f) * 0.2);
                    ctx.fillRect(s.x, s.y, s.r, s.r);
                }

                ctx.textBaseline = 'middle';
                for (var j = 0; j < trechos.length; j++) {
                    var p = trechos[j];
                    p.y -= p.vel * dt * cfg.velocidade;
                    if (p.y < -20) { p.y = h + 20; p.x = rand(0, w); p.txt = pick(TRECHOS); }
                    ctx.font = p.tam + 'px Consolas, "Cascadia Code", Menlo, monospace';
                    ctx.fillStyle = rgba('#c7d2fe', p.a);
                    ctx.fillText(p.txt, p.x, p.y);
                }

                // shooting star every ~9s, slow and soft
                if (!cadente && t > proximaCadente) {
                    cadente = { x: rand(w * 0.1, w * 0.6), y: rand(0, h * 0.25), ini: t };
                }
                if (cadente) {
                    var k = (t - cadente.ini) / 1400;
                    if (k > 1) { cadente = null; proximaCadente = t + rand(7000, 12000); }
                    else {
                        var hx = cadente.x + k * 260, hy = cadente.y + k * 110;
                        var cauda = ctx.createLinearGradient(hx - 120, hy - 50, hx, hy);
                        cauda.addColorStop(0, rgba('#ffffff', 0));
                        cauda.addColorStop(1, rgba('#ffffff', 0.55 * Math.sin(k * Math.PI)));
                        ctx.strokeStyle = cauda;
                        ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.moveTo(hx - 120, hy - 50); ctx.lineTo(hx, hy); ctx.stroke();
                    }
                }

                aurora(ctx, w, h, t, 0, cfg.cor1);
                aurora(ctx, w, h, t, 1, cfg.cor2);

                // breathing glow behind the chat box
                var cy = Math.min(h * 0.45, 400), resp = 0.85 + Math.sin(t * 0.0007) * 0.15;
                brilho(ctx, w / 2 - 160, cy, 520, cfg.cor1, 0.2 * resp);
                brilho(ctx, w / 2 + 160, cy, 520, cfg.cor2, 0.16 * resp);

                var lado = (w - CHAT_LARGURA) / 2 - 20;
                if (lado >= 230) {
                    var pr = Math.min(110, lado * 0.3);
                    planeta(ctx, lado / 2 + 10, cy - 20 + Math.sin(t * 0.0005) * 8, pr, t);
                    terminal(ctx, w - lado / 2 - 10, cy, Math.min(330, lado - 30), t);
                }

                marcaDagua(ctx, w, h, cfg);
            }
        };
    };

    function xatFrame(canvas, opcoes) {
        var cfg = {};
        for (var k in PADRAO) cfg[k] = (opcoes && opcoes[k] !== undefined && opcoes[k] !== '') ? opcoes[k] : PADRAO[k];
        cfg.velocidade = Number(cfg.velocidade) || 1;
        var ctx = canvas.getContext('2d');
        var tema = (TEMAS[cfg.tema] || TEMAS.codigo)(cfg);
        var quieto = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
        cfg.estatico = quieto;
        var w = 0, h = 0, ultimo = 0, rodando = true, id = 0;

        function medir() {
            var dpr = Math.min(global.devicePixelRatio || 1, 2);
            w = canvas.clientWidth || global.innerWidth;
            h = canvas.clientHeight || global.innerHeight;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function quadro(t) {
            // cap at ~30fps: xat warns users that animated frames can lag
            if (ultimo && t - ultimo < 32 && rodando && !quieto) {
                id = global.requestAnimationFrame(quadro);
                return;
            }
            var dt = ultimo ? Math.min((t - ultimo) / 1000, 0.1) : 0;
            ultimo = t;
            ctx.fillStyle = cfg.fundo;
            ctx.fillRect(0, 0, w, h);
            tema.desenhar(ctx, w, h, t, dt);
            if (rodando && !quieto) id = global.requestAnimationFrame(quadro);
        }

        medir();
        global.addEventListener('resize', function () { medir(); if (quieto) quadro(0); });
        quadro(0);
        if (!quieto) id = global.requestAnimationFrame(quadro);

        return {
            parar: function () { rodando = false; global.cancelAnimationFrame(id); },
            // renders a still frame at the given time (used for PNG fallback export)
            foto: function (t) { cfg.estatico = true; quadro(t || 20000); }
        };
    }

    xatFrame.temas = Object.keys(TEMAS);
    global.xatFrame = xatFrame;
})(window);
