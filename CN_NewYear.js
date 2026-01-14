(function() {
    // ================= 配置区域 =================
    // 1. 日期范围
    const startDate = new Date("2026-01-01"); 
    const endDate = new Date("2026-02-28");

    // 2. 挂件设置 (建议替换为真实GIF)
    const leftGif = "https://img.icons8.com/color/96/chinese-new-year.png";
    const rightGif = "https://img.icons8.com/color/96/year-of-horse.png";

    // 3. 烟花强度
    const fireworkCount = 8; // 总共放几发
    
    // ===========================================
    // 核心逻辑
    // ===========================================
    
    const now = new Date();
    if (now < startDate || now > endDate) return;

    // --- 功能 1: 挂件 (这部分每次页面加载都要有，保持喜庆) ---
    function initDecorations() {
        // 防止重复添加
        if (document.getElementById('cny-style')) return;

        const style = document.createElement('style');
        style.id = 'cny-style';
        style.innerHTML = `
            .cny-item {
                position: fixed; top: 0; z-index: 99999; pointer-events: none;
                width: 120px; transition: all 0.3s ease;
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
            }
            .cny-left { left: 10px; transform-origin: top center; animation: swing 3.5s infinite ease-in-out; }
            .cny-right { right: 10px; transform-origin: top center; animation: swing 4.5s infinite ease-in-out; }
            @media (max-width: 768px) {
                .cny-item { width: 60px; top: -2px; } 
                .cny-left { left: 2px; } .cny-right { right: 2px; }
            }
            @keyframes swing { 0% {transform: rotate(0deg);} 50% {transform: rotate(6deg);} 100% {transform: rotate(0deg);} }
        `;
        document.head.appendChild(style);

        const lImg = document.createElement('img'); lImg.src = leftGif; lImg.className = 'cny-item cny-left';
        document.body.appendChild(lImg);
        const rImg = document.createElement('img'); rImg.src = rightGif; rImg.className = 'cny-item cny-right';
        document.body.appendChild(rImg);
    }

    // --- 功能 2: 物理烟花 (加了锁，只运行一次) ---
    function initPhysicsFireworks() {
        // 【关键】检查 SessionStorage，如果已经放过了，直接退出
        if (sessionStorage.getItem('cny_fireworks_played')) {
            console.log("春节烟花本次会话已展示，跳过。");
            return;
        }

        // 标记已展示 (关闭浏览器标签页前有效)
        sessionStorage.setItem('cny_fireworks_played', '1');

        const canvas = document.createElement('canvas');
        canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:99998;pointer-events:none;";
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        });

        // 颜色库：春节红 + 富贵金
        const colors = [
            { h: 0, s: 100, l: 50 },    // 正红
            { h: 350, s: 100, l: 50 },  // 深红
            { h: 45, s: 100, l: 50 },   // 金色
            { h: 40, s: 100, l: 60 }    // 亮金
        ];

        let particles = [];
        let rockets = [];
        let launched = 0;
        let running = true;

        // 物理参数
        const GRAVITY = 0.06; // 重力感，数值越大下坠越快
        const FRICTION = 0.96; // 空气阻力，数值越小爆炸范围越小但越真实

        class Particle {
            constructor(x, y, color) {
                this.x = x; this.y = y;
                this.color = color;
                // 爆炸速度
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 4 + 2; // 初始爆发力
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                
                this.alpha = 1;
                this.decay = Math.random() * 0.015 + 0.005; // 消失速度
                this.flicker = Math.random() > 0.5; // 50%概率闪烁
            }
            update() {
                this.vx *= FRICTION;
                this.vy *= FRICTION;
                this.vy += GRAVITY; // 施加重力
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
                
                // 闪烁效果
                if (this.flicker && this.alpha < 0.8) {
                    this.alpha = Math.random() * this.alpha; 
                }
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = `hsl(${this.color.h}, ${this.color.s}%, ${this.color.l}%)`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        class Rocket {
            constructor() {
                this.x = Math.random() * w * 0.8 + w * 0.1;
                this.y = h;
                this.targetY = Math.random() * h * 0.4 + h * 0.1; // 上半屏爆炸
                this.speed = Math.random() * 3 + 12; // 上升速度
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.trail = [];
            }
            update() {
                this.y -= this.speed;
                this.speed *= 0.98; // 上升阻力
                
                // 记录拖尾
                this.trail.push({x: this.x, y: this.y});
                if(this.trail.length > 5) this.trail.shift();

                // 爆炸判断
                if (this.y <= this.targetY || this.speed < 2) {
                    this.explode();
                    return false; // 销毁火箭
                }
                return true;
            }
            draw() {
                ctx.save();
                ctx.strokeStyle = `hsl(${this.color.h}, 100%, 70%)`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                if(this.trail.length > 0) {
                    ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    for(let t of this.trail) ctx.lineTo(t.x, t.y);
                }
                ctx.stroke();
                ctx.restore();
            }
            explode() {
                const count = 80; // 爆炸粒子数量
                for(let i=0; i<count; i++) {
                    particles.push(new Particle(this.x, this.y, this.color));
                }
            }
        }

        function loop() {
            if (!running && particles.length === 0 && rockets.length === 0) {
                document.body.removeChild(canvas);
                return;
            }
            
            requestAnimationFrame(loop);
            
            // 拖尾背景
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';

            // 随机发射
            if (launched < fireworkCount && Math.random() < 0.05) {
                rockets.push(new Rocket());
                launched++;
                if(launched >= fireworkCount) running = false;
            }

            // 更新绘制
            rockets = rockets.filter(r => r.update());
            rockets.forEach(r => r.draw());
            
            particles = particles.filter(p => p.alpha > 0);
            particles.forEach(p => { p.update(); p.draw(); });
        }
        
        loop();
    }

    // --- 入口 ---
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initDecorations();
        initPhysicsFireworks();
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            initDecorations();
            initPhysicsFireworks();
        });
    }
})();
