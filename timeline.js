/**
 * Time-List.top - 时间轴功能
 * 实现时间轴的核心功能，包括事件的添加、编辑、删除等
 */

class Timeline {
    constructor(options = {}) {
        // 配置选项
        this.options = Object.assign({
            container: '.timeline-app',
            storage: 'localStorage', // localStorage 或 server
            apiEndpoint: '/api/events', // 如果使用服务器存储
            onEventAdd: null,
            onEventEdit: null,
            onEventDelete: null
        }, options);
        
        // 事件数据
        this.events = [];
        
        // DOM元素
        this.container = document.querySelector(this.options.container);
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化时间轴
     */
    init() {
        // 加载事件数据
        this.loadEvents();
        
        // 创建时间轴UI
        this.createTimelineUI();
        
        // 绑定事件处理
        this.bindEvents();
    }
    
    /**
     * 加载事件数据
     */
    loadEvents() {
        if (this.options.storage === 'localStorage') {
            // 从本地存储加载
            const storedEvents = localStorage.getItem('timelineEvents');
            if (storedEvents) {
                try {
                    this.events = JSON.parse(storedEvents);
                } catch(e) {
                    console.error('加载事件数据失败:', e);
                    this.events = [];
                }
            }
        } else {
            // 从服务器加载 (这里实际应用中会用fetch或axios)
            console.log('将从服务器加载事件数据');
            // 实际应用中在这里添加API请求代码
        }
        
        // 确保事件按时间排序
        this.sortEvents();
    }
    
    /**
     * 保存事件数据
     */
    saveEvents() {
        if (this.options.storage === 'localStorage') {
            // 保存到本地存储
            localStorage.setItem('timelineEvents', JSON.stringify(this.events));
        } else {
            // 保存到服务器 (这里实际应用中会用fetch或axios)
            console.log('将保存事件数据到服务器');
            // 实际应用中在这里添加API请求代码
        }
    }
    
    /**
     * 创建时间轴UI
     */
    createTimelineUI() {
        if (!this.container) return;
        
        // 清空容器
        this.container.innerHTML = '';
        
        // 创建时间轴头部
        const header = document.createElement('div');
        header.className = 'timeline-header';
        header.innerHTML = `
            <h2>我的时间轴</h2>
            <div class="timeline-actions">
                <button class="btn btn-primary add-event-btn">添加事件</button>
                <button class="btn btn-secondary filter-events-btn">筛选</button>
            </div>
        `;
        this.container.appendChild(header);
        
        // 创建时间轴容器
        const timelineContainer = document.createElement('div');
        timelineContainer.className = 'timeline-container';
        this.container.appendChild(timelineContainer);
        
        // 创建添加事件表单
        const eventForm = document.createElement('div');
        eventForm.className = 'event-form hidden';
        eventForm.innerHTML = `
            <h3>添加新事件</h3>
            <form id="add-event-form">
                <div class="form-group">
                    <label for="event-title">事件名称</label>
                    <input type="text" id="event-title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="event-start">开始时间</label>
                    <input type="datetime-local" id="event-start" name="start" required>
                </div>
                <div class="form-group">
                    <label for="event-end">结束时间</label>
                    <input type="datetime-local" id="event-end" name="end" required>
                </div>
                <div class="form-group">
                    <label for="event-type">事件类型</label>
                    <select id="event-type" name="type">
                        <option value="work">工作</option>
                        <option value="break">休息</option>
                        <option value="focus">专注</option>
                        <option value="exercise">运动</option>
                        <option value="other">其他</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="event-tags">标签 (用逗号分隔)</label>
                    <input type="text" id="event-tags" name="tags" placeholder="例如: 重要, 会议, 客户">
                </div>
                <div class="form-group">
                    <label for="event-description">描述</label>
                    <textarea id="event-description" name="description" rows="3"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary cancel-btn">取消</button>
                    <button type="submit" class="btn btn-primary save-btn">保存</button>
                </div>
            </form>
        `;
        this.container.appendChild(eventForm);
        
        // 渲染时间轴事件
        this.renderEvents();
    }
    
    /**
     * 渲染事件列表
     */
    renderEvents() {
        const timelineContainer = this.container.querySelector('.timeline-container');
        if (!timelineContainer) return;
        
        // 清空现有事件
        timelineContainer.innerHTML = '';
        
        // 如果没有事件，显示空状态
        if (this.events.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p>还没有事件。点击"添加事件"开始记录您的时间。</p>
            `;
            timelineContainer.appendChild(emptyState);
            return;
        }
        
        // 渲染所有事件
        this.events.forEach(event => {
            const eventElement = this.createEventElement(event);
            timelineContainer.appendChild(eventElement);
        });
    }
    
    /**
     * 创建单个事件元素
     */
    createEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = `timeline-event ${event.type || 'other'}`;
        eventElement.dataset.id = event.id;
        
        // 格式化时间显示
        const startTime = new Date(event.start);
        const endTime = new Date(event.end);
        const formattedStart = startTime.toLocaleString('zh-CN', {
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
        const formattedEnd = endTime.toLocaleString('zh-CN', {
            hour: 'numeric',
            minute: 'numeric'
        });
        
        // 计算持续时间
        const duration = (endTime - startTime) / (1000 * 60); // 分钟
        let durationText;
        if (duration < 60) {
            durationText = `${duration}分钟`;
        } else {
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            durationText = `${hours}小时${minutes > 0 ? ` ${minutes}分钟` : ''}`;
        }
        
        // 渲染标签
        const tagsHtml = event.tags && event.tags.length 
            ? `<div class="event-tags">${event.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>`
            : '';
        
        // 设置事件HTML
        eventElement.innerHTML = `
            <span class="event-time">${formattedStart} - ${formattedEnd}</span>
            <h4 class="event-title">${event.title}</h4>
            <span class="event-duration">${durationText}</span>
            ${tagsHtml}
            <p class="event-description">${event.description || ''}</p>
            <div class="event-actions">
                <button class="edit-event" data-id="${event.id}">编辑</button>
                <button class="delete-event" data-id="${event.id}">删除</button>
            </div>
        `;
        
        return eventElement;
    }
    
    /**
     * 绑定事件处理函数
     */
    bindEvents() {
        if (!this.container) return;
        
        // 添加事件按钮
        const addBtn = this.container.querySelector('.add-event-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showEventForm();
            });
        }
        
        // 取消按钮
        const cancelBtn = this.container.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideEventForm();
            });
        }
        
        // 保存事件表单
        const eventForm = this.container.querySelector('#add-event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEventFormSubmit(eventForm);
            });
        }
        
        // 事件操作（编辑和删除）
        this.container.addEventListener('click', (e) => {
            // 编辑按钮
            if (e.target.classList.contains('edit-event')) {
                const eventId = e.target.dataset.id;
                this.editEvent(eventId);
            }
            
            // 删除按钮
            if (e.target.classList.contains('delete-event')) {
                const eventId = e.target.dataset.id;
                this.deleteEvent(eventId);
            }
        });
    }
    
    /**
     * 显示事件表单
     */
    showEventForm(eventId = null) {
        const form = this.container.querySelector('.event-form');
        const formTitle = form.querySelector('h3');
        
        // 清空表单
        document.getElementById('add-event-form').reset();
        
        // 如果是编辑现有事件
        if (eventId) {
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                formTitle.textContent = '编辑事件';
                document.getElementById('event-title').value = event.title;
                document.getElementById('event-start').value = this.formatDateForInput(event.start);
                document.getElementById('event-end').value = this.formatDateForInput(event.end);
                document.getElementById('event-type').value = event.type || 'other';
                document.getElementById('event-tags').value = event.tags ? event.tags.join(', ') : '';
                document.getElementById('event-description').value = event.description || '';
                
                // 存储编辑的事件ID
                form.dataset.eventId = eventId;
            }
        } else {
            formTitle.textContent = '添加新事件';
            delete form.dataset.eventId;
            
            // 设置默认的开始和结束时间
            const now = new Date();
            const start = this.formatDateForInput(now);
            now.setHours(now.getHours() + 1);
            const end = this.formatDateForInput(now);
            
            document.getElementById('event-start').value = start;
            document.getElementById('event-end').value = end;
        }
        
        // 显示表单
        form.classList.remove('hidden');
    }
    
    /**
     * 隐藏事件表单
     */
    hideEventForm() {
        const form = this.container.querySelector('.event-form');
        form.classList.add('hidden');
    }
    
    /**
     * 处理表单提交
     */
    handleEventFormSubmit(form) {
        // 获取表单数据
        const formData = new FormData(form);
        const eventData = {
            title: formData.get('title'),
            start: new Date(formData.get('start')).toISOString(),
            end: new Date(formData.get('end')).toISOString(),
            type: formData.get('type'),
            description: formData.get('description'),
            tags: formData.get('tags')
                ? formData.get('tags').split(',').map(tag => tag.trim())
                : []
        };
        
        // 验证开始时间早于结束时间
        if (new Date(eventData.start) >= new Date(eventData.end)) {
            alert('开始时间必须早于结束时间');
            return;
        }
        
        // 检查是否是编辑现有事件
        const eventForm = this.container.querySelector('.event-form');
        const eventId = eventForm.dataset.eventId;
        
        if (eventId) {
            // 更新现有事件
            this.updateEvent(eventId, eventData);
        } else {
            // 添加新事件
            this.addEvent(eventData);
        }
        
        // 隐藏表单
        this.hideEventForm();
    }
    
    /**
     * 添加新事件
     */
    addEvent(eventData) {
        // 生成唯一ID
        eventData.id = Date.now().toString();
        
        // 添加到事件列表
        this.events.push(eventData);
        
        // 排序事件
        this.sortEvents();
        
        // 保存并重新渲染
        this.saveEvents();
        this.renderEvents();
        
        // 触发回调
        if (typeof this.options.onEventAdd === 'function') {
            this.options.onEventAdd(eventData);
        }
    }
    
    /**
     * 更新事件
     */
    updateEvent(eventId, eventData) {
        // 查找事件索引
        const index = this.events.findIndex(e => e.id === eventId);
        
        if (index !== -1) {
            // 保留ID
            eventData.id = eventId;
            
            // 更新事件
            this.events[index] = eventData;
            
            // 排序事件
            this.sortEvents();
            
            // 保存并重新渲染
            this.saveEvents();
            this.renderEvents();
            
            // 触发回调
            if (typeof this.options.onEventEdit === 'function') {
                this.options.onEventEdit(eventData);
            }
        }
    }
    
    /**
     * 删除事件
     */
    deleteEvent(eventId) {
        // 确认删除
        if (!confirm('确定要删除这个事件吗？')) {
            return;
        }
        
        // 查找事件
        const index = this.events.findIndex(e => e.id === eventId);
        
        if (index !== -1) {
            const deletedEvent = this.events[index];
            
            // 从数组中删除
            this.events.splice(index, 1);
            
            // 保存并重新渲染
            this.saveEvents();
            this.renderEvents();
            
            // 触发回调
            if (typeof this.options.onEventDelete === 'function') {
                this.options.onEventDelete(deletedEvent);
            }
        }
    }
    
    /**
     * 编辑事件
     */
    editEvent(eventId) {
        this.showEventForm(eventId);
    }
    
    /**
     * 排序事件（按开始时间）
     */
    sortEvents() {
        this.events.sort((a, b) => {
            return new Date(a.start) - new Date(b.start);
        });
    }
    
    /**
     * 格式化日期用于datetime-local输入
     */
    formatDateForInput(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const pad = (num) => num.toString().padStart(2, '0');
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    
    /**
     * 按标签筛选事件
     */
    filterEventsByTag(tag) {
        if (!tag) {
            // 如果没有指定标签，显示所有事件
            this.renderEvents();
            return;
        }
        
        // 查找包含指定标签的事件
        const filteredEvents = this.events.filter(event => 
            event.tags && event.tags.some(t => t.toLowerCase() === tag.toLowerCase())
        );
        
        // 临时保存原始事件列表
        const originalEvents = this.events;
        
        // 设置过滤后的事件列表并渲染
        this.events = filteredEvents;
        this.renderEvents();
        
        // 恢复原始事件列表
        this.events = originalEvents;
    }
    
    /**
     * 按类型筛选事件
     */
    filterEventsByType(type) {
        if (!type) {
            // 如果没有指定类型，显示所有事件
            this.renderEvents();
            return;
        }
        
        // 查找指定类型的事件
        const filteredEvents = this.events.filter(event => event.type === type);
        
        // 临时保存原始事件列表
        const originalEvents = this.events;
        
        // 设置过滤后的事件列表并渲染
        this.events = filteredEvents;
        this.renderEvents();
        
        // 恢复原始事件列表
        this.events = originalEvents;
    }
    
    /**
     * 获取事件总时长统计
     */
    getTimeStatistics() {
        // 按类型统计时间
        const statsByType = {};
        
        // 总时间
        let totalMinutes = 0;
        
        this.events.forEach(event => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            const durationMinutes = (end - start) / (1000 * 60);
            
            totalMinutes += durationMinutes;
            
            const type = event.type || 'other';
            if (!statsByType[type]) {
                statsByType[type] = 0;
            }
            statsByType[type] += durationMinutes;
        });
        
        // 计算百分比
        const typeStats = {};
        for (const type in statsByType) {
            typeStats[type] = {
                minutes: statsByType[type],
                hours: statsByType[type] / 60,
                percentage: totalMinutes > 0 ? (statsByType[type] / totalMinutes) * 100 : 0
            };
        }
        
        return {
            totalMinutes,
            totalHours: totalMinutes / 60,
            byType: typeStats
        };
    }
}

// 导出Timeline类
window.Timeline = Timeline; 