(function() {
    // ================= 配置区域 =================
    // 1. 生效日期 (这里预设了包含当前日期的范围，方便您立刻看到效果)
    const startDate = new Date("2026-01-01"); 
    const endDate = new Date("2026-02-28"); // 或者是每年的 12-01 到 12-31

    // 2. 挂件配置 (精选的透明背景圣诞素材)
    // 左边：装满礼物的圣诞袜
    const leftGif = "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/96/external-christmas-stocking-christmas-flaticons-lineal-color-flat-icons-2.png";
    // 右边：圣诞铃铛与冬青
    const rightGif = "https://img.icons8.com/color/96/christmas-bell.png";
    // 彩蛋：飞行的圣诞老人 (GIF)
    const santaGif = "https://img.icons8.com/external-yogi-aprelliyanto-flat-yogi-aprelliyanto/96/external-sleigh-christmas-yogi-aprelliyanto-flat-yogi-aprelliyanto.png";

    // ===========================================
    // 逻辑执行区域
    // ===========================================
    const now = new Date();
    if (now < startDate || now > endDate) return;

    // --- 模块一：物理重力雪花 (Canvas) ---
    function initSnow() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:99997;pointer-events:none;";
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        
        let w = canvas.width = window.innerWidth;
        let h = canvas.height = window.innerHeight;
        window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });

        const particles = [];
        const maxParticles = window.innerWidth < 768 ? 50 : 150; // 手机端减少雪花数量

        class Flake {
            constructor() {
                this.init();
            }
            init() {
                this.x = Math.random() * w;
                this.y = Math.random() * h; // 初始随机分布
                this.r = Math.random() * 3 + 1; // 雪花半径
                this.d = Math.random() * maxParticles; // 密度因子
                this.a = Math.random() * 0.5 + 0.3; // 透明度
                this.vx = Math.random() * 1 - 0.5; // 水平飘动
                this.vy = Math.random() * 1 + 1; // 下落速度
            }
            update() {
                this.y += this.vy;
                this.x += this.vx;
                
                // 简单的风力模拟
                this.x += Math.sin(this.y * 0.01) * 0.2;

                // 触底或出界重置
                if (this.y > h || this.x > w || this.x < 0) {
                    this.x = Math.random() * w;
                    this.y = -10; // 从顶部重新落下
                }
            }
            draw() {
                ctx.fillStyle = `rgba(255, 255, 255, ${this.a})`;
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

    // --- 模块二：重力感应挂饰 (继承自V5的优秀逻辑) ---
    function initOrnaments() {
        if (document.getElementById('xmas-style')) return;

        const style = document.createElement('style');
        style.id = 'xmas-style';
        style.innerHTML = `
            .xmas-item {
                position: fixed; top: 0; z-index: 99999;
                width: 100px; transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
                will-change: transform;
            }
            .xmas-left { left: 15px; transform-origin: top center; }
            .xmas-right { right: 15px; transform-origin: top center; }
            
            /* 默认摆动动画 */
            @keyframes gentleSwing { 
                0% { transform: rotate(0deg); } 
                50% { transform: rotate(4deg); } 
                100% { transform: rotate(0deg); } 
            }
            .xmas-idle { animation: gentleSwing 5s infinite ease-in-out; }

            @media (max-width: 768px) {
                .xmas-item { width: 55px; top: -2px; } 
                .xmas-left { left: 5px; } .xmas-right { right: 5px; }
            }
        `;
        document.head.appendChild(style);

        const lImg = document.createElement('img');
        lImg.src = leftGif; lImg.className = 'xmas-item xmas-left xmas-idle';
        document.body.appendChild(lImg);

        const rImg = document.createElement('img');
        rImg.src = rightGif; rImg.className = 'xmas-item xmas-right xmas-idle';
        document.body.appendChild(rImg);

        // 重力感应逻辑
        let currentRotation = 0;
        window.addEventListener('devicemotion', (event) => {
            const acc = event.accelerationIncludingGravity;
            if (!acc) return;
            const x = acc.x || 0;
            if (Math.abs(x) > 0.5) {
                lImg.classList.remove('xmas-idle');
                rImg.classList.remove('xmas-idle');
                const targetRotation = Math.max(-40, Math.min(40, x * 6));
                currentRotation += (targetRotation - currentRotation) * 0.1;
                lImg.style.transform = `rotate(${currentRotation}deg)`;
                rImg.style.transform = `rotate(${currentRotation * 0.8}deg)`;
            }
        }, false);
    }

    // --- 模块三：圣诞老人飞越彩蛋 ---
    function initSantaFlyby() {
        // 使用 SessionStorage 确保每次打开浏览器只飞一次，避免烦人
        if (sessionStorage.getItem('xmas_santa_flown')) return;
        sessionStorage.setItem('xmas_santa_flown', '1');

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
                position: fixed;
                top: 15%; /* 屏幕上方 15% 处飞行 */
                z-index: 99998;
                width: 120px;
                opacity: 0.9;
                pointer-events: none;
                animation: flyAcross 12s linear forwards; /* 12秒飞完全程 */
            }
            @media (max-width: 768px) { .santa-sleigh { width: 80px; top: 20%; } }
        `;
        document.head.appendChild(style);

        const santa = document.createElement('img');
        santa.src = santaGif;
        santa.className = 'santa-sleigh';
        document.body.appendChild(santa);

        // 动画结束后移除 DOM
        setTimeout(() => {
            if(santa && santa.parentNode) santa.parentNode.removeChild(santa);
        }, 13000);
    }

    // --- 入口 ---
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initSnow();
        initOrnaments();
        setTimeout(initSantaFlyby, 2000); // 延迟2秒起飞
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            initSnow();
            initOrnaments();
            setTimeout(initSantaFlyby, 2000);
        });
    }
})();
