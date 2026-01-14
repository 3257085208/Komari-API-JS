(function() {
    // ================= 配置区域 =================
    // 1. 日期范围 (为了测试，起始日期设置得比较早)
    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-02-28");

    // 2. 悬挂组件 GIF 链接 (请替换为您找到的真实GIF链接)
    // 如果没有替换，默认还是静态图
    const leftGif = "https://img.icons8.com/color/96/chinese-new-year.png";
    const rightGif = "https://img.icons8.com/color/96/year-of-horse.png";

    // 3. 烟花配置
    const fireworkCount = 7; // 页面打开时总共燃放多少发烟花 (建议 5-10，太多会乱)

    // ===========================================
    // 逻辑执行区域
    // ===========================================
    const now = new Date();
    if (now < startDate || now > endDate) return;

    // --- 模块一：悬挂挂件 (保持不变) ---
    function initDecorations() {
        const style = document.createElement('style');
        style.innerHTML = `
            .cny-item {
                position: fixed; top: 0; z-index: 99999; pointer-events: none;
                width: 120px; transition: all 0.3s ease;
                filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));
            }
            .cny-left { left: 10px; transform-origin: top center; animation: swing 3s infinite ease-in-out; }
            .cny-right { right: 10px; transform-origin: top center; animation: swing 4s infinite ease-in-out; }
            @media (max-width: 768px) {
                .cny-item { width: 60px; top: -5px; } 
                .cny-left { left: 5px; } .cny-right { right: 5px; }
            }
            @keyframes swing { 0% {transform: rotate(0deg);} 50% {transform: rotate(5deg);} 100% {transform: rotate(0deg);} }
        `;
        document.head.appendChild(style);
        const lImg = document.createElement('img'); lImg.src = leftGif; lImg.className = 'cny-item cny-left';
        document.body.appendChild(lImg);
        const rImg = document.createElement('img'); rImg.src = rightGif; rImg.className = 'cny-item cny-right';
        document.body.appendChild(rImg);
    }

    // --- 模块二：高仿真、一次性红色烟花 ---
    function initRealisticFireworks() {
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

        let fireworks = []; // 正在上升的烟花弹
        let particles = []; // 爆炸后的碎片
        let launchedCount = 0; // 已燃放数量计数
        let animationFrameId; // 用于停止动画循环

        // 基础物理参数
        const gravity = 0.04;
        const friction = 0.98;

        // 工具函数：生成范围内随机数
        const random = (min, max) => Math.random() * (max - min) + min;

        // 粒子类（用于爆炸碎片）
        class Particle {
            constructor(x, y, hue) {
                this.x = x; this.y = y;
                // 爆炸力度随机
                const angle = random(0, Math.PI * 2);
                const speed = random(1, 5);
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.hue = hue; // 红色色相
                this.brightness = random(50, 70); // 亮度差异增加真实感
                this.alpha = 1; // 透明度
                this.decay = random(0.005, 0.015); // 消失速度
            }
            update() {
                this.vx *= friction; this.vy *= friction; this.vy += gravity;
                this.x += this.vx; this.y += this.vy; this.alpha -= this.decay;
                return this.alpha > 0;
            }
            draw() {
                ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
                ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); ctx.fill();
            }
        }

        // 烟花弹类（用于上升阶段）
        class Firework {
            constructor() {
                this.x = random(w * 0.1, w * 0.9); // 底部随机位置
                this.y = h;
                this.targetY = random(h * 0.1, h * 0.4); // 目标爆炸高度（屏幕中上部）
                this.hue = random(-10, 10); // 纯红色范围 (HSL中0是正红)
                // 计算发射速度，确保能到达目标高度
                const distance = this.y - this.targetY;
                // 简单的物理公式估算需要的初速度 v^2 = 2gh
                this.vy = -Math.sqrt(2 * (gravity + 0.02) * distance); 
                this.vx = random(-0.5, 0.5); // 轻微左右偏移
                this.trail = []; // 拖尾记录
            }
            update() {
                this.trail.push([this.x, this.y]);
                if (this.trail.length > 4) this.trail.shift(); // 保持拖尾长度

                this.vy += gravity; this.x += this.vx; this.y += this.vy;
                // 到达顶点或开始下坠时爆炸
                if (this.vy >= 0 || this.y <= this.targetY) {
                    // 创建爆炸碎片
                    const particleCount = random(40, 70);
                    for (let i = 0; i < particleCount; i++) particles.push(new Particle(this.x, this.y, this.hue));
                    return false; // 烟花弹自身销毁
                }
                return true;
            }
            draw() {
                ctx.beginPath();
                ctx.moveTo(this.trail[0][0], this.trail[0][1]);
                this.trail.forEach(point => ctx.lineTo(point[0], point[1]));
                ctx.strokeStyle = `hsla(${this.hue}, 100%, 50%, 0.5)`; ctx.lineWidth = 3; ctx.stroke(); // 绘制拖尾
                ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, 1)`; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); // 绘制弹头
            }
        }

        // 发射控制器
        function launchSequence() {
            if (launchedCount < fireworkCount) {
                fireworks.push(new Firework());
                launchedCount++;
                // 随机间隔发射下一发 (500ms - 1500ms)
                setTimeout(launchSequence, random(500, 1500));
            }
        }

        // 主动画循环
        function loop() {
            // 使用半透明黑色清空画布，形成拖尾效果
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';

            // 更新并绘制所有元素
            fireworks = fireworks.filter(fw => { fw.update(); fw.draw(); return fw.y > fw.targetY && fw.vy < 0; });
            particles = particles.filter(p => { p.update(); p.draw(); return p.alpha > 0; });

            // 【核心】检测是否全部结束
            if (launchedCount >= fireworkCount && fireworks.length === 0 && particles.length === 0) {
                // 停止动画循环
                cancelAnimationFrame(animationFrameId);
                // 移除 Canvas，释放内存
                document.body.removeChild(canvas);
                console.log("春节烟花特效已执行完毕并销毁。");
                return;
            }
            animationFrameId = requestAnimationFrame(loop);
        }

        // 启动
        launchSequence();
        loop();
    }

    // --- 入口 ---
    // 确保在页面加载完成后执行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initDecorations, 100);
        setTimeout(initRealisticFireworks, 500); // 延迟一点点放烟花
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            initDecorations();
            setTimeout(initRealisticFireworks, 500);
        });
    }
})();
