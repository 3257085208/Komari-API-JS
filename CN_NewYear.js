(function() {
    // ================= 配置区域 =================
    // 1. 日期范围 (请确保当前日期在范围内，否则不显示)
    const startDate = new Date("2026-01-01"); // 建议设为今天之前，方便测试
    const endDate = new Date("2026-02-28");

    // 2. 悬挂组件配置 (关键！请换成您喜欢的 GIF 动图链接)
    // 推荐去搜索引擎搜 "鞭炮 GIF 透明" 或 "灯笼 GIF 透明"
    // 如果找不到，暂时先用下面这个静态的，找到后替换 URL 即可
    const leftGif = "https://img.icons8.com/color/96/chinese-new-year.png"; // 左侧挂件 URL
    const rightGif = "https://img.icons8.com/color/96/year-of-horse.png";   // 右侧挂件 URL

    // 3. 烟花配置
    const enableFireworks = true; // 是否开启背景烟花

    // ===========================================
    // 以下逻辑无需修改
    // ===========================================
    const now = new Date();
    if (now < startDate || now > endDate) return;

    // --- 模块一：悬挂挂件 (适配手机) ---
    function initDecorations() {
        const style = document.createElement('style');
        style.innerHTML = `
            .cny-item {
                position: fixed;
                top: 0;
                z-index: 99999;
                pointer-events: none; /* 鼠标穿透 */
                width: 120px; /* 电脑端大小 */
                transition: all 0.3s ease;
                filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));
            }
            .cny-left { left: 10px; transform-origin: top center; animation: swing 3s infinite ease-in-out; }
            .cny-right { right: 10px; transform-origin: top center; animation: swing 4s infinite ease-in-out; }
            
            /* 手机端适配：缩小尺寸，避免遮挡 */
            @media (max-width: 768px) {
                .cny-item { width: 60px; top: -5px; } 
                .cny-left { left: 5px; }
                .cny-right { right: 5px; }
            }
            
            @keyframes swing {
                0% { transform: rotate(0deg); }
                50% { transform: rotate(5deg); }
                100% { transform: rotate(0deg); }
            }
        `;
        document.head.appendChild(style);

        const lImg = document.createElement('img');
        lImg.src = leftGif; lImg.className = 'cny-item cny-left';
        document.body.appendChild(lImg);

        const rImg = document.createElement('img');
        rImg.src = rightGif; rImg.className = 'cny-item cny-right';
        document.body.appendChild(rImg);
    }

    // --- 模块二：动态烟花 (Canvas) ---
    function initFireworks() {
        if (!enableFireworks) return;
        
        const canvas = document.createElement('canvas');
        canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;z-index:99998;pointer-events:none;";
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        
        let particles = [];
        let w, h;
        
        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        function createFirework() {
            const x = Math.random() * w;
            const y = h; // 从底部升起
            const targetY = Math.random() * (h * 0.5); // 爆炸高度
            const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
            
            // 简化的烟花逻辑：直接在随机位置生成爆炸粒子
            const particleCount = 50 + Math.random() * 50;
            const px = Math.random() * w; 
            const py = Math.random() * h * 0.6; // 也就是上半屏
            
            for(let i=0; i<particleCount; i++) {
                particles.push({
                    x: px, y: py,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    alpha: 1,
                    color: color
                });
            }
        }

        function loop() {
            requestAnimationFrame(loop);
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // 拖尾效果
            ctx.fillRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';

            // 偶尔生成新烟花
            if(Math.random() < 0.03) createFirework(); 

            for(let i=particles.length-1; i>=0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.05; // 重力
                p.alpha -= 0.01; // 消失
                
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI*2);
                ctx.fill();

                if(p.alpha <= 0) particles.splice(i, 1);
            }
        }
        loop();
    }

    // --- 启动 ---
    // 等待页面加载完成后执行，确保样式正确
    if (document.readyState === 'complete') {
        initDecorations();
        initFireworks();
    } else {
        window.addEventListener('load', () => {
            initDecorations();
            initFireworks();
        });
    }
})();
