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

    function xatFrame(canvas, opcoes) {
        var cfg = {};
        for (var k in PADRAO) cfg[k] = (opcoes && opcoes[k] !== undefined && opcoes[k] !== '') ? opcoes[k] : PADRAO[k];
        cfg.velocidade = Number(cfg.velocidade) || 1;
        var ctx = canvas.getContext('2d');
        var tema = (TEMAS[cfg.tema] || TEMAS.codigo)(cfg);
        var quieto = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
            foto: function (t) { quadro(t || 20000); }
        };
    }

    xatFrame.temas = Object.keys(TEMAS);
    global.xatFrame = xatFrame;
})(window);
