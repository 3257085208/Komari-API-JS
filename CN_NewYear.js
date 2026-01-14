(function() {
    // === 配置区域 ===
    // 1. 设置生效日期范围 (格式：YYYY-MM-DD)
    // 2026年春节是2月17日，这里预设为 2月10日 到 2月24日
    const startDate = new Date("2026-1-10");
    const endDate = new Date("2026-02-24");
    
    // 2. 设置挂件图片地址 (建议上传到您自己的图床)
    const leftImage = "https://img.icons8.com/color/96/chinese-new-year.png"; // 左侧图片
    const rightImage = "https://img.icons8.com/color/96/year-of-horse.png";   // 右侧图片
    
    // 3. 设置挂件大小
    const imgWidth = "120px";
    
    // === 逻辑区域 ===
    const now = new Date();
    
    // 检查当前日期是否在范围内
    if (now >= startDate && now <= endDate) {
        // 创建样式
        const style = document.createElement('style');
        style.innerHTML = `
            .cny-decoration {
                position: fixed;
                top: 0;
                z-index: 9999;
                pointer-events: none; /* 让鼠标穿透 */
                width: ${imgWidth};
                transition: transform 0.3s ease;
            }
            .cny-left { left: 10px; transform-origin: top left; animation: swing 3s infinite ease-in-out; }
            .cny-right { right: 10px; transform-origin: top right; animation: swing 3s infinite ease-in-out; }
            @media (max-width: 768px) {
                .cny-decoration { width: 80px; } /* 手机端缩小 */
            }
            @keyframes swing {
                0% { transform: rotate(0deg); }
                50% { transform: rotate(5deg); }
                100% { transform: rotate(0deg); }
            }
        `;
        document.head.appendChild(style);

        // 注入左侧图片
        const leftImg = document.createElement('img');
        leftImg.src = leftImage;
        leftImg.className = 'cny-decoration cny-left';
        document.body.appendChild(leftImg);

        // 注入右侧图片
        const rightImg = document.createElement('img');
        rightImg.src = rightImage;
        rightImg.className = 'cny-decoration cny-right';
        document.body.appendChild(rightImg);
    }
})();
