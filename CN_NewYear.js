(function() {
    // ================= 配置区域 =================
    const startDate = new Date("2026-01-01"); 
    const endDate = new Date("2026-02-28");

    // 雪花颜色 (冰蓝色，适配白底)
    const snowColor = "100, 180, 255"; 

    // 挂件配置
    const leftGif = "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/96/external-christmas-stocking-christmas-flaticons-lineal-color-flat-icons-2.png";
    const rightGif = "https://img.icons8.com/color/96/christmas-bell.png";
    const santaGif = "https://img.icons8.com/external-yogi-aprelliyanto-flat-yogi-aprelliyanto/96/external-sleigh-christmas-yogi-aprelliyanto-flat-yogi-aprelliyanto.png";

    // ===========================================
    // 核心逻辑
    // ===========================================
    const now = new Date();
    if (now < startDate || now > endDate) return;

    // --- 全局变量：环境风力 (由陀螺仪控制) ---
    let globalWindX = 0; 

    // --- 统一的重力感应监听 (驱动挂件 + 雪花) ---
    function initGyroSensor(lImg, rImg) {
        window.addEventListener('devicemotion', (event) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc) return;
            
            // X轴重力分量 (-10 ~ 10)
            const x = acc.x || 0;

            // 1. 驱动挂件 (最大旋转 45度)
            if (lImg && rImg && Math.abs(x) > 0.5) {
                lImg.classList.remove('xmas-idle'); 
                rImg.classList.remove('xmas-idle');
                // 简单的平滑处理交由 CSS transition 完成，这里直接设置目标角度
                const rot = Math.max(-45, Math.min(45, x * 5));
                lImg.style.transform = `rotate(${rot}deg)`;
                rImg.style.transform = `rotate(${rot * 0.8}deg)`;
            }

            // 2. 驱动雪花 (计算风力)
            // 目标风力：将重力分量映射为水平速度偏移量
            const targetWind = x * 1.5; 
            // 线性插值 (Lerp) 实现风力渐变，避免雪花瞬移，增加空气感
            globalWindX += (targetWind - globalWindX) * 0.05;

        }, false);
    }

    // --- 模块一：物理风力雪花 ---
    function initSnow() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:99997;pointer-events:none;";
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

        const particles = [];
        const maxParticles = window.innerWidth < 768 ? 60 : 150;

        class Flake {
            constructor() { this.init(true); }
            
            init(firstTime = false) {
                this.x = Math.random() * w;
                // 如果是第一次生成，随机铺满屏幕；否则从顶部生成
                this.y = firstTime ? Math.random() * h : -10; 
                this.r = Math.random() * 3 + 1.5; 
                this.a = Math.random() * 0.6 + 0.4;
                // 基础下落速度
                this.vy = Math.random() * 1.5 + 1; 
                // 基础水平飘动 (自身的随机性)
                this.baseVx = Math.random() * 1 - 0.5; 
            }

            update() {
                // 垂直运动
                this.y += this.vy;
                
                // 水平运动 = 自身飘动 + 陀螺仪风力
                this.x += this.baseVx + globalWindX;

                // 边界检查 (循环利用)
                // 注意：因为有强风，雪花可能从左右两侧飞出去，需要处理
                if (this.y > h || (globalWindX > 0 && this.x > w) || (globalWindX < 0 && this.x < 0)) {
                    // 如果是因为飞出左右边界重置的，根据风向从另一侧补进来，视觉更自然
                    if (this.x > w) {
                        this.x = -10;
                        this.y = Math.random() * h; // 随机高度补入
                    } else if (this.x < 0) {
                        this.x = w + 10;
                        this.y = Math.random() * h;
                    } else {
                        // 正常触底重置
                        this.init(); 
                    }
                }
            }

            draw() {
                ctx.fillStyle = `rgba(${snowColor}, ${this.a})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < maxParticles; i++) particles.push(new Flake());

        function loop() {
            ctx.clearRect(0, 0, w, h);
            particles.forEach(p => { p.update(); p.draw(); });
            requestAnimationFrame(loop);
        }
        loop();
    }

    // --- 模块二：挂饰 (初始化) ---
    function initOrnaments() {
        if (document.getElementById('xmas-style')) return;
        const style = document.createElement('style');
        style.id = 'xmas-style';
        style.innerHTML = `
            .xmas-item {
                position: fixed; top: 0; z-index: 99999;
                width: 100px; transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
                will-change: transform;
            }
            .xmas-left { left: 15px; transform-origin: top center; }
            .xmas-right { right: 15px; transform-origin: top center; }
            .xmas-idle { animation: gentleSwing 5s infinite ease-in-out; }
            @keyframes gentleSwing { 0% {transform: rotate(0deg);} 50% {transform: rotate(4deg);} 100% {transform: rotate(0deg);} }
            @media (max-width: 768px) { .xmas-item { width: 55px; top: -2px; } .xmas-left { left: 5px; } .xmas-right { right: 5px; } }
        `;
        document.head.appendChild(style);

        const lImg = document.createElement('img'); lImg.src = leftGif; lImg.className = 'xmas-item xmas-left xmas-idle'; document.body.appendChild(lImg);
        const rImg = document.createElement('img'); rImg.src = rightGif; rImg.className = 'xmas-item xmas-right xmas-idle'; document.body.appendChild(rImg);

        // 启动传感器，传入图片对象以便控制
        initGyroSensor(lImg, rImg);
    }

    // --- 模块三：圣诞老人飞越 ---
    function initSantaFlyby() {
        if (sessionStorage.getItem('xmas_santa_v7')) return;
        sessionStorage.setItem('xmas_santa_v7', '1');
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes flyAcross {
                0% { left: -150px; transform: translateY(0); }
                25% { transform: translateY(20px); }
                50% { transform: translateY(0); }
                75% { transform: translateY(-20px); }
                100% { left: 100vw; transform: translateY(0); }
            }
            .santa-sleigh {
                position: fixed; top: 15%; z-index: 99998; width: 120px; opacity: 0.9;
                pointer-events: none; animation: flyAcross 12s linear forwards;
            }
            @media (max-width: 768px) { .santa-sleigh { width: 80px; top: 20%; } }
        `;
        document.head.appendChild(style);
        const santa = document.createElement('img'); santa.src = santaGif; santa.className = 'santa-sleigh'; document.body.appendChild(santa);
        setTimeout(() => { if(santa && santa.parentNode) santa.parentNode.removeChild(santa); }, 13000);
    }

    // --- 入口 ---
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initSnow(); initOrnaments(); setTimeout(initSantaFlyby, 2000);
    } else {
        window.addEventListener('DOMContentLoaded', () => { initSnow(); initOrnaments(); setTimeout(initSantaFlyby, 2000); });
    }
})();
