/**
 * Time-List.top - 主JavaScript文件
 * 实现网站的交互功能，包括导航、动画效果和时间轴功能
 */

// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航栏效果
    initNavigation();
    
    // 初始化滚动动画
    initScrollAnimations();
    
    // 初始化时间轴演示
    initTimelineDemo();
    
    // 初始化统计图表演示
    initStatsChart();
});

/**
 * 导航栏相关功能
 */
function initNavigation() {
    const nav = document.querySelector('.global-nav');
    
    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // 平滑滚动到对应锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === "#") return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 60,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * 滚动动画效果
 */
function initScrollAnimations() {
    // 淡入效果的元素
    const fadeElements = document.querySelectorAll('.features-grid, .timeline-demo, .stats-demo, .about-content');
    
    // 创建Intersection Observer
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.2,
        rootMargin: '0px'
    });
    
    // 观察所有需要淡入效果的元素
    fadeElements.forEach(element => {
        element.classList.add('will-fade');
        fadeObserver.observe(element);
    });
    
    // 为每个特性项添加延迟淡入效果
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
}

/**
 * 时间轴演示功能
 */
function initTimelineDemo() {
    const timelineEvents = document.querySelectorAll('.timeline-event');
    
    // 为时间轴事件添加交互效果
    timelineEvents.forEach((event, index) => {
        // 添加延迟显示动画
        event.style.transitionDelay = `${index * 0.2}s`;
        
        // 添加点击事件处理
        event.addEventListener('click', function() {
            // 移除其他事件的活跃状态
            timelineEvents.forEach(e => e.classList.remove('active'));
            
            // 添加当前事件的活跃状态
            this.classList.add('active');
        });
    });
    
    // 模拟事件添加功能
    const demoContainer = document.querySelector('.timeline-container');
    const eventTypes = ['work', 'break', 'focus', 'exercise'];
    const eventTitles = ['项目会议', '午餐休息', '专注工作', '健身锻炼'];
    
    // 添加"添加事件"的演示功能（仅在演示页面）
    if (demoContainer) {
        setInterval(() => {
            // 随机选择事件类型和标题
            const randomIndex = Math.floor(Math.random() * eventTypes.length);
            const eventType = eventTypes[randomIndex];
            const eventTitle = eventTitles[randomIndex];
            
            // 随机生成时间
            const startHour = Math.floor(Math.random() * 12) + 8; // 8 AM to 8 PM
            const endHour = startHour + Math.floor(Math.random() * 3) + 1; // 1 to 3 hours later
            const timeText = `${startHour}:00 - ${endHour}:00`;
            
            // 创建新事件元素
            const newEvent = document.createElement('div');
            newEvent.className = `timeline-event ${eventType} new-event`;
            newEvent.innerHTML = `
                <span class="event-time">${timeText}</span>
                <h4 class="event-title">${eventTitle}</h4>
            `;
            
            // 添加到时间轴
            demoContainer.appendChild(newEvent);
            
            // 淡入效果
            setTimeout(() => {
                newEvent.classList.add('visible');
            }, 100);
            
            // 移除多余的事件以保持演示干净
            const events = document.querySelectorAll('.timeline-event');
            if (events.length > 10) {
                events[0].remove();
            }
        }, 10000); // 每10秒添加一个新事件
    }
}

/**
 * 统计图表演示功能
 */
function initStatsChart() {
    const statsChart = document.querySelector('.stats-chart');
    
    if (!statsChart) return;
    
    // 在这里我们使用伪元素和CSS创建了简单的图表效果
    // 在实际应用中，你可能会使用Chart.js或D3.js等库来创建真实的图表
    
    // 为了演示，我们可以动态更新一些统计数据
    const statValues = document.querySelectorAll('.stat-value');
    
    // 简单的动态更新功能，模拟数据变化
    setInterval(() => {
        statValues.forEach(value => {
            const currentValue = parseInt(value.textContent);
            const newValue = currentValue + Math.floor(Math.random() * 5) - 2; // 上下浮动2%
            
            // 确保百分比在合理范围内
            if (newValue >= 10 && newValue <= 50) {
                value.textContent = `${newValue}%`;
            }
        });
    }, 5000); // 每5秒更新一次
}

/**
 * 添加 CSS 类
 */
// 添加必要的CSS样式
const style = document.createElement('style');
style.textContent = `
    /* 动画效果 */
    .will-fade {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .timeline-event.active {
        transform: translateX(10px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    .global-nav.scrolled {
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .new-event {
        opacity: 0;
        transform: translateX(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .new-event.visible {
        opacity: 1;
        transform: translateX(0);
    }
`;
document.head.appendChild(style); 