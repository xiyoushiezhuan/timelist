/**
 * Time-List.top - 统计功能
 * 实现时间统计和数据可视化功能
 */

class TimeStatistics {
    constructor(options = {}) {
        // 配置选项
        this.options = Object.assign({
            container: '.statistics-app',
            timelineInstance: null, // Timeline实例
            chartLibrary: 'internal' // 'internal' 或 'chartjs'
        }, options);
        
        // DOM元素
        this.container = document.querySelector(this.options.container);
        
        // Timeline实例
        this.timeline = this.options.timelineInstance;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化统计功能
     */
    init() {
        if (!this.container) return;
        
        // 创建统计UI
        this.createStatisticsUI();
        
        // 计算并显示统计数据
        this.calculateAndDisplayStats();
        
        // 绑定事件
        this.bindEvents();
    }
    
    /**
     * 创建统计UI
     */
    createStatisticsUI() {
        // 清空容器
        this.container.innerHTML = '';
        
        // 创建统计头部
        const header = document.createElement('div');
        header.className = 'stats-header';
        header.innerHTML = `
            <h2>时间统计</h2>
            <div class="stats-filters">
                <select id="stats-period">
                    <option value="all">全部时间</option>
                    <option value="today">今天</option>
                    <option value="week">本周</option>
                    <option value="month">本月</option>
                </select>
                <div class="stats-buttons">
                    <button id="generate-weekly-btn" class="btn btn-secondary">生成周报</button>
                    <button id="generate-monthly-btn" class="btn btn-secondary">生成月报</button>
                </div>
            </div>
        `;
        this.container.appendChild(header);
        
        // 创建统计概览
        const overview = document.createElement('div');
        overview.className = 'stats-overview';
        overview.innerHTML = `
            <div class="stats-card total-time">
                <h3>总计时间</h3>
                <div class="stats-value" id="total-time-value">0小时</div>
            </div>
            <div class="stats-card avg-daily">
                <h3>日均时间</h3>
                <div class="stats-value" id="avg-daily-value">0小时</div>
            </div>
            <div class="stats-card most-tracked">
                <h3>最多记录</h3>
                <div class="stats-value" id="most-tracked-value">-</div>
            </div>
        `;
        this.container.appendChild(overview);
        
        // 创建图表容器
        const chartsContainer = document.createElement('div');
        chartsContainer.className = 'stats-charts';
        chartsContainer.innerHTML = `
            <div class="chart-container">
                <h3>时间分配</h3>
                <div class="pie-chart" id="time-distribution-chart"></div>
            </div>
            <div class="chart-container">
                <h3>每日趋势</h3>
                <div class="bar-chart" id="daily-trend-chart"></div>
            </div>
        `;
        this.container.appendChild(chartsContainer);
        
        // 创建标签统计
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'stats-tags';
        tagsContainer.innerHTML = `
            <h3>标签统计</h3>
            <div id="tags-stats-container" class="tags-stats">
                <p class="empty-stats">暂无标签数据</p>
            </div>
        `;
        this.container.appendChild(tagsContainer);
        
        // 创建周报容器（默认隐藏）
        const weeklyReportContainer = document.createElement('div');
        weeklyReportContainer.className = 'weekly-report-container hidden';
        weeklyReportContainer.innerHTML = `
            <div class="weekly-report-header">
                <h3>周报统计</h3>
                <button class="btn btn-secondary close-report-btn">关闭</button>
            </div>
            <div id="weekly-report-content" class="weekly-report-content"></div>
        `;
        this.container.appendChild(weeklyReportContainer);
        
        // 创建月度报告容器（默认隐藏）
        const monthlyReportContainer = document.createElement('div');
        monthlyReportContainer.className = 'monthly-report-container hidden';
        monthlyReportContainer.innerHTML = `
            <div class="monthly-report-header">
                <h3>月度报告</h3>
                <button class="btn btn-secondary close-report-btn">关闭</button>
            </div>
            <div id="monthly-report-content" class="monthly-report-content"></div>
        `;
        this.container.appendChild(monthlyReportContainer);
    }
    
    /**
     * 计算并显示统计数据
     */
    calculateAndDisplayStats(period = 'all') {
        if (!this.timeline) {
            console.error('缺少Timeline实例，无法计算统计数据');
            return;
        }
        
        // 获取过滤后的事件
        const events = this.filterEventsByPeriod(this.timeline.events, period);
        
        // 计算总时间
        const totalStats = this.calculateTotalTime(events);
        document.getElementById('total-time-value').textContent = 
            `${totalStats.hours.toFixed(1)}小时`;
        
        // 计算日均时间
        const avgDailyHours = this.calculateAverageDailyTime(events);
        document.getElementById('avg-daily-value').textContent = 
            `${avgDailyHours.toFixed(1)}小时`;
        
        // 计算最多记录的类型
        const typeStats = this.calculateTypeDistribution(events);
        let mostTracked = '无数据';
        let maxTime = 0;
        
        for (const type in typeStats) {
            if (typeStats[type].hours > maxTime) {
                maxTime = typeStats[type].hours;
                mostTracked = this.getTypeDisplayName(type);
            }
        }
        
        document.getElementById('most-tracked-value').textContent = mostTracked;
        
        // 渲染图表
        this.renderDistributionChart(typeStats);
        this.renderDailyTrendChart(events);
        
        // 渲染标签统计
        this.renderTagsStats(events);
    }
    
    /**
     * 按时间段过滤事件
     */
    filterEventsByPeriod(events, period) {
        if (period === 'all') return events;
        
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                // 获取本周一
                const dayOfWeek = now.getDay() || 7; // 将周日从0转为7
                startDate = new Date(now);
                startDate.setDate(now.getDate() - dayOfWeek + 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            default:
                return events;
        }
        
        return events.filter(event => {
            const eventStartDate = new Date(event.start);
            return eventStartDate >= startDate;
        });
    }
    
    /**
     * 计算总时间
     */
    calculateTotalTime(events) {
        let totalMinutes = 0;
        
        events.forEach(event => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            const durationMinutes = (end - start) / (1000 * 60);
            
            totalMinutes += durationMinutes;
        });
        
        return {
            minutes: totalMinutes,
            hours: totalMinutes / 60
        };
    }
    
    /**
     * 计算日均时间
     */
    calculateAverageDailyTime(events) {
        if (events.length === 0) return 0;
        
        // 获取日期范围
        let minDate = new Date();
        let maxDate = new Date(0); // 1970年1月1日
        
        events.forEach(event => {
            const eventDate = new Date(event.start);
            if (eventDate < minDate) minDate = eventDate;
            if (eventDate > maxDate) maxDate = eventDate;
        });
        
        // 计算天数差异（至少为1天）
        const daysDiff = Math.max(1, Math.floor((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);
        
        // 计算总时间
        const totalStats = this.calculateTotalTime(events);
        
        // 返回日均小时数
        return totalStats.hours / daysDiff;
    }
    
    /**
     * 计算类型分布
     */
    calculateTypeDistribution(events) {
        const typeStats = {};
        
        events.forEach(event => {
            const type = event.type || 'other';
            if (!typeStats[type]) {
                typeStats[type] = {
                    minutes: 0,
                    hours: 0,
                    percentage: 0,
                    count: 0
                };
            }
            
            const start = new Date(event.start);
            const end = new Date(event.end);
            const durationMinutes = (end - start) / (1000 * 60);
            
            typeStats[type].minutes += durationMinutes;
            typeStats[type].hours = typeStats[type].minutes / 60;
            typeStats[type].count++;
        });
        
        // 计算百分比
        const totalMinutes = Object.values(typeStats).reduce(
            (total, stats) => total + stats.minutes, 0
        );
        
        if (totalMinutes > 0) {
            for (const type in typeStats) {
                typeStats[type].percentage = (typeStats[type].minutes / totalMinutes) * 100;
            }
        }
        
        return typeStats;
    }
    
    /**
     * 计算标签统计
     */
    calculateTagsStats(events) {
        const tagsStats = {};
        
        events.forEach(event => {
            if (!event.tags || !Array.isArray(event.tags)) return;
            
            const durationMinutes = 
                (new Date(event.end) - new Date(event.start)) / (1000 * 60);
            
            event.tags.forEach(tag => {
                if (!tag) return;
                
                const tagName = tag.trim().toLowerCase();
                if (!tagName) return;
                
                if (!tagsStats[tagName]) {
                    tagsStats[tagName] = {
                        minutes: 0,
                        hours: 0,
                        count: 0,
                        displayName: tag.trim()
                    };
                }
                
                tagsStats[tagName].minutes += durationMinutes;
                tagsStats[tagName].hours = tagsStats[tagName].minutes / 60;
                tagsStats[tagName].count++;
            });
        });
        
        // 转换为数组并排序
        return Object.values(tagsStats).sort((a, b) => b.hours - a.hours);
    }
    
    /**
     * 渲染分布图表
     */
    renderDistributionChart(typeStats) {
        const chartContainer = document.getElementById('time-distribution-chart');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = '';
        
        if (Object.keys(typeStats).length === 0) {
            chartContainer.innerHTML = '<p class="empty-stats">暂无数据</p>';
            return;
        }
        
        if (this.options.chartLibrary === 'chartjs' && typeof Chart !== 'undefined') {
            // 使用Chart.js (如果可用)
            const canvas = document.createElement('canvas');
            chartContainer.appendChild(canvas);
            
            const data = {
                labels: Object.keys(typeStats).map(this.getTypeDisplayName),
                datasets: [{
                    data: Object.values(typeStats).map(stat => stat.hours),
                    backgroundColor: this.getTypeColors()
                }]
            };
            
            new Chart(canvas, {
                type: 'pie',
                data: data,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        } else {
            // 使用简单的内部实现
            const pieChart = document.createElement('div');
            pieChart.className = 'simple-pie-chart';
            
            // 计算总的小时数
            const totalHours = Object.values(typeStats).reduce(
                (sum, stat) => sum + stat.hours, 0
            );
            
            // 创建图表和图例
            let cumulativePercentage = 0;
            let pieHTML = '<div class="pie" style="background-image: conic-gradient(';
            let legendHTML = '<div class="chart-legend">';
            
            for (const type in typeStats) {
                const stats = typeStats[type];
                const percentage = stats.percentage;
                
                if (percentage === 0) continue;
                
                const color = this.getTypeColor(type);
                const typeName = this.getTypeDisplayName(type);
                
                // 添加饼图部分
                pieHTML += `${color} ${cumulativePercentage}% ${cumulativePercentage + percentage}%, `;
                cumulativePercentage += percentage;
                
                // 添加图例项
                legendHTML += `
                    <div class="legend-item">
                        <span class="color-dot" style="background-color: ${color}"></span>
                        <span class="type-name">${typeName}</span>
                        <span class="type-value">${stats.hours.toFixed(1)}小时 (${percentage.toFixed(1)}%)</span>
                    </div>
                `;
            }
            
            // 完成饼图CSS
            pieHTML = pieHTML.slice(0, -2) + ')"></div>';
            legendHTML += '</div>';
            
            pieChart.innerHTML = pieHTML + legendHTML;
            chartContainer.appendChild(pieChart);
        }
    }
    
    /**
     * 渲染每日趋势图表
     */
    renderDailyTrendChart(events) {
        const chartContainer = document.getElementById('daily-trend-chart');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = '';
        
        if (events.length === 0) {
            chartContainer.innerHTML = '<p class="empty-stats">暂无数据</p>';
            return;
        }
        
        // 按日期分组事件
        const dailyData = {};
        const typeColors = {};
        
        events.forEach(event => {
            const startDate = new Date(event.start);
            const dateKey = startDate.toISOString().split('T')[0];
            const type = event.type || 'other';
            
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = {};
            }
            
            if (!dailyData[dateKey][type]) {
                dailyData[dateKey][type] = 0;
            }
            
            const durationHours = 
                (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60);
            
            dailyData[dateKey][type] += durationHours;
            
            // 保存类型颜色
            if (!typeColors[type]) {
                typeColors[type] = this.getTypeColor(type);
            }
        });
        
        // 获取所有日期并排序
        const dates = Object.keys(dailyData).sort();
        
        // 获取所有类型
        const types = Array.from(
            new Set(
                Object.values(dailyData)
                    .flatMap(dayData => Object.keys(dayData))
            )
        );
        
        if (this.options.chartLibrary === 'chartjs' && typeof Chart !== 'undefined') {
            // 使用Chart.js (如果可用)
            const canvas = document.createElement('canvas');
            chartContainer.appendChild(canvas);
            
            const datasets = types.map(type => {
                return {
                    label: this.getTypeDisplayName(type),
                    data: dates.map(date => dailyData[date][type] || 0),
                    backgroundColor: this.getTypeColor(type)
                };
            });
            
            const formattedDates = dates.map(date => {
                const d = new Date(date);
                return `${d.getMonth() + 1}/${d.getDate()}`;
            });
            
            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: formattedDates,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            title: {
                                display: true,
                                text: '小时'
                            }
                        }
                    }
                }
            });
        } else {
            // 使用简单的内部实现
            const barChart = document.createElement('div');
            barChart.className = 'simple-bar-chart';
            
            // 创建图表
            let chartHTML = '';
            
            // 添加图例
            let legendHTML = '<div class="chart-legend bar-legend">';
            types.forEach(type => {
                legendHTML += `
                    <div class="legend-item">
                        <span class="color-dot" style="background-color: ${this.getTypeColor(type)}"></span>
                        <span class="type-name">${this.getTypeDisplayName(type)}</span>
                    </div>
                `;
            });
            legendHTML += '</div>';
            
            // 计算所有日期中的最大总时长，用于设置图表高度比例
            const maxTotalHours = Math.max(...dates.map(date => {
                return Object.values(dailyData[date]).reduce((sum, hours) => sum + hours, 0);
            }));
            
            // 添加柱状图
            chartHTML += '<div class="bar-container">';
            
            dates.forEach(date => {
                const dayData = dailyData[date];
                const d = new Date(date);
                const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
                
                // 创建一个单独的日期柱子
                let barHTML = `
                    <div class="chart-bar">
                        <div class="bar-segments">
                `;
                
                // 添加每种类型的数据段
                let cumulativeHeight = 0;
                types.forEach(type => {
                    const hours = dayData[type] || 0;
                    if (hours === 0) return;
                    
                    const heightPercentage = (hours / maxTotalHours) * 100;
                    barHTML += `
                        <div class="bar-segment" 
                             style="height: ${heightPercentage}%; 
                                    background-color: ${this.getTypeColor(type)};
                                    bottom: ${cumulativeHeight}%;"
                             title="${this.getTypeDisplayName(type)}: ${hours.toFixed(1)}小时">
                        </div>
                    `;
                    cumulativeHeight += heightPercentage;
                });
                
                // 添加日期标签
                barHTML += `
                        </div>
                        <div class="bar-label">${dateLabel}</div>
                    </div>
                `;
                
                chartHTML += barHTML;
            });
            
            chartHTML += '</div>';
            
            barChart.innerHTML = legendHTML + chartHTML;
            chartContainer.appendChild(barChart);
        }
    }
    
    /**
     * 渲染标签统计
     */
    renderTagsStats(events) {
        const tagsContainer = document.getElementById('tags-stats-container');
        if (!tagsContainer) return;
        
        // 计算标签统计
        const tagsStats = this.calculateTagsStats(events);
        
        // 清空容器
        tagsContainer.innerHTML = '';
        
        if (tagsStats.length === 0) {
            tagsContainer.innerHTML = '<p class="empty-stats">暂无标签数据</p>';
            return;
        }
        
        // 创建标签统计列表
        const tagsList = document.createElement('div');
        tagsList.className = 'tags-list';
        
        tagsStats.forEach(tagStat => {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-stat-item';
            tagItem.innerHTML = `
                <div class="tag-stat-header">
                    <span class="tag">${tagStat.displayName}</span>
                    <span class="tag-hours">${tagStat.hours.toFixed(1)}小时</span>
                </div>
                <div class="tag-stat-bar">
                    <div class="tag-stat-progress" style="width: ${Math.min(100, tagStat.hours * 5)}%"></div>
                </div>
                <div class="tag-stat-footer">
                    <span class="tag-count">${tagStat.count}个事件</span>
                </div>
            `;
            tagsList.appendChild(tagItem);
        });
        
        tagsContainer.appendChild(tagsList);
    }
    
    /**
     * 生成周报
     */
    generateWeeklyReport() {
        if (!this.timeline) {
            console.error('缺少Timeline实例，无法生成周报');
            return;
        }
        
        // 获取本周事件
        const events = this.filterEventsByPeriod(this.timeline.events, 'week');
        
        // 如果没有事件，显示提示信息
        if (events.length === 0) {
            alert('本周没有记录事件，无法生成周报');
            return;
        }
        
        // 显示周报容器
        const reportContainer = this.container.querySelector('.weekly-report-container');
        reportContainer.classList.remove('hidden');
        
        const reportContent = document.getElementById('weekly-report-content');
        
        // 获取周信息
        const today = new Date();
        const dayOfWeek = today.getDay() || 7; // 将周日从0转为7
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - dayOfWeek + 1);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        
        // 格式化日期
        const formatDate = (date) => {
            return date.toLocaleDateString('zh-CN', { 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            });
        };
        
        // 计算总时间
        const totalStats = this.calculateTotalTime(events);
        
        // 计算类型分布
        const typeStats = this.calculateTypeDistribution(events);
        
        // 按日期分组事件
        const dailyEvents = {};
        
        // 创建周一到周日的日期键
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            dailyEvents[dateKey] = [];
        }
        
        // 归类事件
        events.forEach(event => {
            const eventDate = new Date(event.start);
            const dateKey = eventDate.toISOString().split('T')[0];
            
            if (dailyEvents[dateKey]) {
                dailyEvents[dateKey].push(event);
            }
        });
        
        // 生成周报HTML
        let reportHTML = `
            <div class="weekly-report-summary">
                <h4>周报概览 (${formatDate(startDate)} - ${formatDate(endDate)})</h4>
                <div class="report-summary-stats">
                    <div class="report-stat-item">
                        <span class="report-stat-label">总计时间</span>
                        <span class="report-stat-value">${totalStats.hours.toFixed(1)}小时</span>
                    </div>
                    <div class="report-stat-item">
                        <span class="report-stat-label">事件数量</span>
                        <span class="report-stat-value">${events.length}个</span>
                    </div>
                </div>
            </div>
            
            <div class="weekly-report-chart">
                <h4>时间分配</h4>
                <div class="report-type-distribution">
        `;
        
        // 添加类型分布
        for (const type in typeStats) {
            const stats = typeStats[type];
            reportHTML += `
                <div class="report-type-item">
                    <div class="report-type-color" style="background-color: ${this.getTypeColor(type)}"></div>
                    <span class="report-type-name">${this.getTypeDisplayName(type)}</span>
                    <span class="report-type-value">${stats.hours.toFixed(1)}小时 (${stats.percentage.toFixed(1)}%)</span>
                </div>
            `;
        }
        
        reportHTML += `
                </div>
            </div>
            
            <div class="weekly-report-days">
                <h4>每日事件汇总</h4>
        `;
        
        // 添加每日事件
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateKey = date.toISOString().split('T')[0];
            const dayEvents = dailyEvents[dateKey];
            
            reportHTML += `
                <div class="report-day">
                    <h5>${formatDate(date)}</h5>
            `;
            
            if (dayEvents.length === 0) {
                reportHTML += `<p class="report-no-events">没有记录的事件</p>`;
            } else {
                // 计算当天总时间
                let dailyTotalMinutes = 0;
                dayEvents.forEach(event => {
                    const start = new Date(event.start);
                    const end = new Date(event.end);
                    dailyTotalMinutes += (end - start) / (1000 * 60);
                });
                
                reportHTML += `<p class="report-day-total">总计: ${(dailyTotalMinutes / 60).toFixed(1)}小时</p>`;
                reportHTML += `<ul class="report-events-list">`;
                
                // 按开始时间排序事件
                dayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
                
                // 添加事件列表
                dayEvents.forEach(event => {
                    const start = new Date(event.start);
                    const end = new Date(event.end);
                    const duration = (end - start) / (1000 * 60);
                    const hours = Math.floor(duration / 60);
                    const minutes = Math.floor(duration % 60);
                    const durationText = hours > 0 ? 
                        `${hours}小时${minutes > 0 ? ` ${minutes}分钟` : ''}` : 
                        `${minutes}分钟`;
                    
                    reportHTML += `
                        <li class="report-event-item ${event.type || 'other'}">
                            <span class="report-event-time">
                                ${start.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})} - 
                                ${end.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}
                            </span>
                            <span class="report-event-title">${event.title}</span>
                            <span class="report-event-duration">${durationText}</span>
                        </li>
                    `;
                });
                
                reportHTML += `</ul>`;
            }
            
            reportHTML += `</div>`;
        }
        
        reportHTML += `
            </div>
            
            <div class="weekly-report-actions">
                <button id="export-report-btn" class="btn btn-primary">导出为PDF</button>
            </div>
        `;
        
        // 设置周报内容
        reportContent.innerHTML = reportHTML;
        
        // 绑定关闭按钮事件
        const closeBtn = reportContainer.querySelector('.close-report-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                reportContainer.classList.add('hidden');
            });
        }
        
        // 绑定导出按钮事件
        const exportBtn = reportContent.querySelector('#export-report-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportWeeklyReportAsPDF();
            });
        }
    }
    
    /**
     * 导出周报为PDF
     */
    exportWeeklyReportAsPDF() {
        // 在实际应用中，这里会调用PDF生成库（如jsPDF）
        // 但为了简化示例，我们只显示一个提示
        alert('导出PDF功能将在下一个版本实现');
        
        // 可以通过window.print()实现一个简单的打印功能
        // window.print();
    }
    
    /**
     * 生成月度报告
     */
    generateMonthlyReport() {
        if (!this.timeline) {
            console.error('缺少Timeline实例，无法生成月报');
            return;
        }
        
        // 获取本月事件
        const events = this.filterEventsByPeriod(this.timeline.events, 'month');
        
        // 如果没有事件，显示提示信息
        if (events.length === 0) {
            alert('本月没有记录事件，无法生成月报');
            return;
        }
        
        // 显示月报容器
        const reportContainer = this.container.querySelector('.monthly-report-container');
        reportContainer.classList.remove('hidden');
        
        const reportContent = document.getElementById('monthly-report-content');
        
        // 获取月份信息
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 格式化日期
        const formatDate = (date) => {
            return date.toLocaleDateString('zh-CN', { 
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
            });
        };
        
        const formatMonthYear = (date) => {
            return date.toLocaleDateString('zh-CN', { 
                year: 'numeric',
                month: 'long'
            });
        };
        
        // 计算总时间
        const totalStats = this.calculateTotalTime(events);
        
        // 计算类型分布
        const typeStats = this.calculateTypeDistribution(events);
        
        // 计算工作日平均时间
        const workdayEvents = events.filter(event => {
            const date = new Date(event.start);
            const day = date.getDay();
            return day > 0 && day < 6; // 1-5 为工作日
        });
        
        const workdayCount = this._getWorkdaysInMonth(year, month);
        const workdayTotalStats = this.calculateTotalTime(workdayEvents);
        const avgWorkdayHours = workdayCount > 0 ? workdayTotalStats.hours / workdayCount : 0;
        
        // 按周分组事件
        const weeklyEvents = this._groupEventsByWeek(events);
        
        // 生成月报HTML
        let reportHTML = `
            <div class="monthly-report-summary">
                <h4>月度报告：${formatMonthYear(firstDay)}</h4>
                <div class="report-period">${formatDate(firstDay)} - ${formatDate(lastDay)}</div>
                <div class="report-summary-stats">
                    <div class="report-stat-item">
                        <span class="report-stat-label">总计时间</span>
                        <span class="report-stat-value">${totalStats.hours.toFixed(1)}小时</span>
                    </div>
                    <div class="report-stat-item">
                        <span class="report-stat-label">事件数量</span>
                        <span class="report-stat-value">${events.length}个</span>
                    </div>
                    <div class="report-stat-item">
                        <span class="report-stat-label">工作日平均</span>
                        <span class="report-stat-value">${avgWorkdayHours.toFixed(1)}小时/天</span>
                    </div>
                </div>
            </div>
            
            <div class="monthly-report-chart">
                <h4>时间分配</h4>
                <div class="monthly-type-distribution">
        `;
        
        // 添加类型分布
        for (const type in typeStats) {
            const stats = typeStats[type];
            reportHTML += `
                <div class="report-type-item">
                    <div class="report-type-color" style="background-color: ${this.getTypeColor(type)}"></div>
                    <span class="report-type-name">${this.getTypeDisplayName(type)}</span>
                    <span class="report-type-value">${stats.hours.toFixed(1)}小时 (${stats.percentage.toFixed(1)}%)</span>
                </div>
            `;
        }
        
        reportHTML += `
                </div>
            </div>
            
            <div class="monthly-report-weeks">
                <h4>每周汇总</h4>
                <table class="weekly-summary-table">
                    <thead>
                        <tr>
                            <th>周次</th>
                            <th>日期范围</th>
                            <th>总时长</th>
                            <th>事件数</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        // 添加每周汇总
        weeklyEvents.forEach((weekData, index) => {
            const weekNumber = index + 1;
            const weekStartDate = new Date(weekData.startDate);
            const weekEndDate = new Date(weekData.endDate);
            const weekTotalStats = this.calculateTotalTime(weekData.events);
            
            reportHTML += `
                <tr>
                    <td>第${weekNumber}周</td>
                    <td>${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}</td>
                    <td>${weekTotalStats.hours.toFixed(1)}小时</td>
                    <td>${weekData.events.length}个</td>
                </tr>
            `;
        });
        
        reportHTML += `
                    </tbody>
                </table>
            </div>
            
            <div class="monthly-report-details">
                <h4>详细记录</h4>
                <div class="monthly-details-container">
        `;
        
        // 按日期分组并排序事件
        const dailyEvents = {};
        events.forEach(event => {
            const eventDate = new Date(event.start);
            const dateKey = eventDate.toISOString().split('T')[0];
            
            if (!dailyEvents[dateKey]) {
                dailyEvents[dateKey] = [];
            }
            
            dailyEvents[dateKey].push(event);
        });
        
        // 排序日期
        const sortedDates = Object.keys(dailyEvents).sort((a, b) => new Date(a) - new Date(b));
        
        // 添加每日事件
        sortedDates.forEach(dateKey => {
            const date = new Date(dateKey);
            const dayEvents = dailyEvents[dateKey];
            
            // 计算当天总时间
            let dailyTotalMinutes = 0;
            dayEvents.forEach(event => {
                const start = new Date(event.start);
                const end = new Date(event.end);
                dailyTotalMinutes += (end - start) / (1000 * 60);
            });
            
            reportHTML += `
                <div class="monthly-day-events">
                    <div class="monthly-day-header">
                        <h5>${formatDate(date)} ${this._getDayOfWeekName(date)}</h5>
                        <span class="day-total-time">${(dailyTotalMinutes / 60).toFixed(1)}小时</span>
                    </div>
                    <ul class="monthly-events-list">
            `;
            
            // 按开始时间排序事件
            dayEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
            
            // 添加事件列表
            dayEvents.forEach(event => {
                const start = new Date(event.start);
                const end = new Date(event.end);
                const duration = (end - start) / (1000 * 60);
                const hours = Math.floor(duration / 60);
                const minutes = Math.floor(duration % 60);
                const durationText = hours > 0 ? 
                    `${hours}小时${minutes > 0 ? ` ${minutes}分钟` : ''}` : 
                    `${minutes}分钟`;
                
                reportHTML += `
                    <li class="monthly-event-item ${event.type || 'other'}">
                        <span class="monthly-event-time">
                            ${start.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})} - 
                            ${end.toLocaleTimeString('zh-CN', {hour: '2-digit', minute: '2-digit'})}
                        </span>
                        <span class="monthly-event-title">${event.title}</span>
                        <span class="monthly-event-duration">${durationText}</span>
                    </li>
                `;
            });
            
            reportHTML += `
                    </ul>
                </div>
            `;
        });
        
        reportHTML += `
                </div>
            </div>
            
            <div class="monthly-report-actions">
                <button id="export-monthly-report-btn" class="btn btn-primary">导出为PDF</button>
            </div>
        `;
        
        // 设置月报内容
        reportContent.innerHTML = reportHTML;
        
        // 绑定关闭按钮事件
        const closeBtn = reportContainer.querySelector('.close-report-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                reportContainer.classList.add('hidden');
            });
        }
        
        // 绑定导出按钮事件
        const exportBtn = reportContent.querySelector('#export-monthly-report-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportMonthlyReportAsPDF();
            });
        }
    }
    
    /**
     * 导出月报为PDF
     */
    exportMonthlyReportAsPDF() {
        // 在实际应用中，这里会调用PDF生成库（如jsPDF）
        // 但为了简化示例，我们只显示一个提示
        alert('导出PDF功能将在下一个版本实现');
        
        // 可以通过window.print()实现一个简单的打印功能
        // window.print();
    }
    
    /**
     * 获取当月的工作日数量
     * @private
     */
    _getWorkdaysInMonth(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        let count = 0;
        
        for (let d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
            const day = d.getDay();
            if (day > 0 && day < 6) { // 1-5 为工作日
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * 按周分组事件
     * @private
     */
    _groupEventsByWeek(events) {
        if (events.length === 0) return [];
        
        // 按日期排序事件
        const sortedEvents = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));
        
        // 获取月份的开始和结束日期
        const firstEventDate = new Date(sortedEvents[0].start);
        const year = firstEventDate.getFullYear();
        const month = firstEventDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        // 获取月份第一周的开始日期（找到最近的星期一）
        const firstWeekStart = new Date(firstDayOfMonth);
        const firstDayWeekday = firstDayOfMonth.getDay() || 7; // 将周日从0转为7
        if (firstDayWeekday > 1) {
            firstWeekStart.setDate(firstDayOfMonth.getDate() - (firstDayWeekday - 1));
        }
        
        // 创建周数据数组
        const weeks = [];
        let currentWeekStart = new Date(firstWeekStart);
        
        while (currentWeekStart <= lastDayOfMonth) {
            // 计算周结束日期（周日）
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
            
            // 过滤属于当前周的事件
            const weekEvents = sortedEvents.filter(event => {
                const eventStart = new Date(event.start);
                return eventStart >= currentWeekStart && eventStart <= currentWeekEnd;
            });
            
            // 添加周数据
            weeks.push({
                startDate: new Date(currentWeekStart),
                endDate: new Date(currentWeekEnd),
                events: weekEvents
            });
            
            // 移动到下一周
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        
        return weeks;
    }
    
    /**
     * 获取星期几的名称
     * @private
     */
    _getDayOfWeekName(date) {
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return days[date.getDay()];
    }
    
    /**
     * 绑定事件处理函数
     */
    bindEvents() {
        // 绑定时间段选择变化事件
        const periodSelect = document.getElementById('stats-period');
        if (periodSelect) {
            periodSelect.addEventListener('change', () => {
                this.calculateAndDisplayStats(periodSelect.value);
            });
        }
        
        // 绑定生成周报按钮事件
        const weeklyReportBtn = document.getElementById('generate-weekly-btn');
        if (weeklyReportBtn) {
            weeklyReportBtn.addEventListener('click', () => {
                this.generateWeeklyReport();
            });
        }
        
        // 绑定生成月报按钮事件
        const monthlyReportBtn = document.getElementById('generate-monthly-btn');
        if (monthlyReportBtn) {
            monthlyReportBtn.addEventListener('click', () => {
                this.generateMonthlyReport();
            });
        }
        
        // 如果提供了Timeline实例，监听事件变化
        if (this.timeline) {
            // 这里假设Timeline类有一个事件变化的回调
            if (typeof this.timeline.options.onEventAdd === 'function') {
                const originalCallback = this.timeline.options.onEventAdd;
                this.timeline.options.onEventAdd = (event) => {
                    originalCallback(event);
                    this.calculateAndDisplayStats(
                        periodSelect ? periodSelect.value : 'all'
                    );
                };
            } else {
                this.timeline.options.onEventAdd = () => {
                    this.calculateAndDisplayStats(
                        periodSelect ? periodSelect.value : 'all'
                    );
                };
            }
            
            // 类似地处理编辑和删除事件
            this.timeline.options.onEventEdit = () => {
                this.calculateAndDisplayStats(
                    periodSelect ? periodSelect.value : 'all'
                );
            };
            
            this.timeline.options.onEventDelete = () => {
                this.calculateAndDisplayStats(
                    periodSelect ? periodSelect.value : 'all'
                );
            };
        }
    }
    
    /**
     * 获取类型的显示名称
     */
    getTypeDisplayName(type) {
        const typeNames = {
            'work': '工作',
            'break': '休息',
            'focus': '专注',
            'exercise': '运动',
            'other': '其他'
        };
        
        return typeNames[type] || type;
    }
    
    /**
     * 获取类型的颜色
     */
    getTypeColor(type) {
        const typeColors = {
            'work': '#007aff',
            'break': '#34c759',
            'focus': '#5856d6',
            'exercise': '#ff3b30',
            'other': '#9e9e9e'
        };
        
        return typeColors[type] || '#9e9e9e';
    }
    
    /**
     * 获取所有类型的颜色
     */
    getTypeColors() {
        return [
            '#007aff', // 工作
            '#34c759', // 休息
            '#5856d6', // 专注
            '#ff3b30', // 运动
            '#9e9e9e'  // 其他
        ];
    }
}

// 导出TimeStatistics类
window.TimeStatistics = TimeStatistics; 