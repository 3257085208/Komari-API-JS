(function() {
    // ================= 配置区域 =================
    const startDate = new Date("2026-01-01"); 
    const endDate = new Date("2026-02-28");

    // 挂件图片 (建议使用透明背景 GIF)
    const leftGif = "https://img.icons8.com/color/96/chinese-new-year.png";
    const rightGif = "https://img.icons8.com/color/96/year-of-horse.png";

    // ===========================================
    // 逻辑执行
    // ===========================================
    const now = new Date();
    if (now < startDate || now > endDate) return;

    // --- 模块一：重力感应挂件 ---
    function initGyroDecorations() {
        if (document.getElementById('cny-style')) return;

        // 定义基础样式 (默认有轻微的风吹摆动，以防没有陀螺仪数据时是僵硬的)
        const style = document.createElement('style');
        style.id = 'cny-style';
        style.innerHTML = `
            .cny-item {
                position: fixed; top: 0; z-index: 99999;
                width: 120px; transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
                will-change: transform;
            }
            .cny-left { left: 10px; transform-origin: top center; }
            .cny-right { right: 10px; transform-origin: top center; }
            
            /* 默认呼吸动画 (当没有重力感应时生效) */
            @keyframes idleSwing { 
                0% { transform: rotate(0deg); } 
                50% { transform: rotate(3deg); } 
                100% { transform: rotate(0deg); } 
            }
            .cny-idle { animation: idleSwing 4s infinite ease-in-out; }

            @media (max-width: 768px) {
                .cny-item { width: 60px; top: -2px; } 
                .cny-left { left: 5px; } .cny-right { right: 5px; }
            }
        `;
        document.head.appendChild(style);

        const lImg = document.createElement('img');
        lImg.src = leftGif; lImg.className = 'cny-item cny-left cny-idle';
        lImg.id = 'cny-l';
        document.body.appendChild(lImg);

        const rImg = document.createElement('img');
        rImg.src = rightGif; rImg.className = 'cny-item cny-right cny-idle';
        rImg.id = 'cny-r';
        document.body.appendChild(rImg);

        // === 核心：重力感应监听 ===
        let currentRotation = 0;
        let targetRotation = 0;
        
        // 监听设备运动
        window.addEventListener('devicemotion', (event) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc) return;

            // 获取横向重力分量 (X轴)
            // Android 和 iOS 的方向可能相反，这里做一个通用处理
            const x = acc.x || 0;
            
            // 只有当检测到明显的倾斜/摇晃时才接管动画
            if (Math.abs(x) > 0.5) {
                // 移除默认的 CSS 动画
                lImg.classList.remove('cny-idle');
                rImg.classList.remove('cny-idle');

                // 计算目标角度 (放大系数 5，让晃动更明显)
                // 限制最大角度 ±45度，防止甩飞
                targetRotation = Math.max(-45, Math.min(45, x * 5));
                
                // 简单的平滑插值
                currentRotation += (targetRotation - currentRotation) * 0.1;

                // 应用旋转
                lImg.style.transform = `rotate(${currentRotation}deg)`;
                // 右边挂件稍微延迟一点/反向一点，增加错落感
                rImg.style.transform = `rotate(${currentRotation * 0.9}deg)`;
            }
        }, false);
    }

    // --- 模块二：剧本式红金烟花 ---
    function initScenarioFireworks() {
        if (sessionStorage.getItem('cny_fireworks_v5_played')) return;
        sessionStorage.setItem('cny_fireworks_v5_played', '1');

        const canvas = document.createElement('canvas');
        canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:99998;pointer-events:none;";
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

        let particles = [];
        let rockets = [];
        let phase = 0; // 0: 等待, 1: 巨型烟花, 2: 散花
        let smallShotsCount = 0;

        const GRAVITY = 0.05;
        const FRICTION = 0.96;

        class Particle {
            constructor(x, y, isBig) {
                this.x = x; this.y = y;
                const angle = Math.random() * Math.PI * 2;
                // 大烟花爆发力更强
                const force = isBig ? (Math.random() * 8 + 3) : (Math.random() * 4 + 2);
                this.vx = Math.cos(angle) * force;
                this.vy = Math.sin(angle) * force;
                
                // 【核心颜色逻辑】红金混合
                // 70% 概率是红色系，30% 概率是金色系
                const isGold = Math.random() > 0.7;
                if (isGold) {
                    this.hue = Math.random() * 10 + 40; // 金色 (Hue 40-50)
                    this.lightness = Math.random() * 40 + 50; // 亮一点
                } else {
                    this.hue = Math.random() * 10 + 355; // 红色 (Hue 355-0-5)
                    if (this.hue > 360) this.hue -= 360;
                    this.lightness = 50;
                }
                
                this.alpha = 1;
                this.decay = Math.random() * 0.01 + 0.005;
            }
            update() {
                this.vx *= FRICTION; this.vy *= FRICTION; this.vy += GRAVITY;
                this.x += this.vx; this.y += this.vy; this.alpha -= this.decay;
            }
            draw() {
                ctx.globalAlpha = this.alpha;
                // 使用 lighter 混合模式，让红金重叠处发光
                ctx.globalCompositeOperation = 'lighter';
                ctx.fillStyle = `hsl(${this.hue}, 100%, ${this.lightness}%)`;
                ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
            }
        }

        class Rocket {
            constructor(isBig) {
                this.isBig = isBig;
                this.x = isBig ? w / 2 : Math.random() * w; // 大烟花强制居中
                this.y = h;
                // 大烟花炸得更高
                this.targetY = isBig ? h * 0.2 : (Math.random() * h * 0.4 + h * 0.1);
                this.vy = isBig ? -18 : -(Math.random() * 5 + 10);
                this.trail = [];
                this.exploded = false;
            }
            update() {
                this.y += this.vy;
                this.vy += GRAVITY; 
                this.trail.push({x: this.x, y: this.y});
                if(this.trail.length > 5) this.trail.shift();

                // 到达最高点附近爆炸
                if (this.vy >= -2 && !this.exploded) {
                    this.explode();
                    return false;
                }
                return true;
            }
            draw() {
                ctx.strokeStyle = '#ffdd00'; // 拖尾总是金色
                ctx.lineWidth = this.isBig ? 4 : 2;
                ctx.beginPath();
                if(this.trail.length) {
                    ctx.moveTo(this.trail[0].x, this.trail[0].y);
                    for(let t of this.trail) ctx.lineTo(t.x, t.y);
                }
                ctx.stroke();
            }
            explode() {
                this.exploded = true;
                // 大烟花产生 300 个粒子，小烟花 80 个
                const count = this.isBig ? 300 : 80;
                for(let i=0; i<count; i++) {
                    particles.push(new Particle(this.x, this.y, this.isBig));
                }
                
                // 触发后续逻辑
                if(this.isBig) {
                    setTimeout(() => { phase = 2; }, 500); // 开启散花模式
                }
            }
        }

        function loop() {
            if (phase === 2 && smallShotsCount > 8 && particles.length === 0) {
                document.body.removeChild(canvas);
                return;
            }
            
            requestAnimationFrame(loop);
            
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'source-over';

            // 剧本控制
            if (phase === 0) { // 第一发：巨型烟花
                rockets.push(new Rocket(true)); 
                phase = 1; // 标记已发射
            } else if (phase === 2) { // 散花阶段
                if (smallShotsCount < 8 && Math.random() < 0.05) {
                    rockets.push(new Rocket(false));
                    smallShotsCount++;
                }
            }

            rockets = rockets.filter(r => r.update());
            rockets.forEach(r => r.draw());
            
            particles.forEach(p => p.update());
            particles = particles.filter(p => p.alpha > 0);
            particles.forEach(p => p.draw());
        }
        
        // 延迟 800ms 启动，等待页面稳定
        setTimeout(loop, 800);
    }

    // --- 入口 ---
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initGyroDecorations();
        initScenarioFireworks();
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            initGyroDecorations();
            initScenarioFireworks();
        });
    }
})();
