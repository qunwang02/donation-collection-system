// server.js - 数据查看API
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // 静态文件目录

// 数据存储文件
const DATA_FILE = path.join(__dirname, 'data.json');

// 初始化数据文件
function initDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ donations: [] }, null, 2));
    }
}

// 读取数据
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('读取数据失败:', error);
        return { donations: [] };
    }
}

// 保存数据
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('保存数据失败:', error);
        return false;
    }
}

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        dataCount: readData().donations.length 
    });
});

// 获取所有数据
app.get('/api/donations', (req, res) => {
    try {
        const data = readData();
        res.json({
            success: true,
            count: data.donations.length,
            data: data.donations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取数据失败: ' + error.message
        });
    }
});

// 提交数据
app.post('/api/donations', (req, res) => {
    try {
        const { data, batchId, deviceId } = req.body;
        
        if (!Array.isArray(data)) {
            return res.status(400).json({
                success: false,
                message: '数据格式错误，期望数组'
            });
        }
        
        const storedData = readData();
        
        // 添加时间戳和ID
        const newDonations = data.map(item => ({
            ...item,
            id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            serverReceivedAt: new Date().toISOString(),
            batchId,
            deviceId
        }));
        
        // 添加到存储
        storedData.donations.push(...newDonations);
        
        if (saveData(storedData)) {
            res.json({
                success: true,
                message: '数据保存成功',
                submittedCount: newDonations.length,
                totalCount: storedData.donations.length,
                failedCount: 0
            });
        } else {
            res.status(500).json({
                success: false,
                message: '保存数据到文件失败'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误: ' + error.message
        });
    }
});

// 按ID获取数据
app.get('/api/donations/:id', (req, res) => {
    try {
        const { id } = req.params;
        const data = readData();
        const donation = data.donations.find(d => d.id === id || d.localId === id);
        
        if (donation) {
            res.json({
                success: true,
                data: donation
            });
        } else {
            res.status(404).json({
                success: false,
                message: '未找到对应数据'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取数据失败: ' + error.message
        });
    }
});

// 统计数据
app.get('/api/stats', (req, res) => {
    try {
        const data = readData();
        const donations = data.donations;
        
        const stats = {
            total: donations.length,
            byProject: {},
            byPayment: {
                已缴费: 0,
                未缴费: 0,
                随喜: 0
            },
            totalAmountTWD: 0,
            totalAmountRMB: 0,
            byDate: {},
            recent: donations.slice(-10) // 最近10条
        };
        
        donations.forEach(donation => {
            // 按项目统计
            const project = donation.project || '未知';
            stats.byProject[project] = (stats.byProject[project] || 0) + 1;
            
            // 按缴费状态统计
            const payment = donation.payment || '未知';
            if (stats.byPayment[payment] !== undefined) {
                stats.byPayment[payment]++;
            }
            
            // 总金额
            stats.totalAmountTWD += donation.amountTWD || 0;
            stats.totalAmountRMB += donation.amountRMB || 0;
            
            // 按日期统计
            const date = donation.submitTime ? donation.submitTime.split('T')[0] : '未知日期';
            stats.byDate[date] = (stats.byDate[date] || 0) + 1;
        });
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取统计数据失败: ' + error.message
        });
    }
});

// 删除数据（需要管理员权限）
app.delete('/api/donations/:id', (req, res) => {
    // 这里可以添加身份验证
    try {
        const { id } = req.params;
        const data = readData();
        const initialLength = data.donations.length;
        
        data.donations = data.donations.filter(d => !(d.id === id || d.localId === id));
        
        if (saveData(data)) {
            const removedCount = initialLength - data.donations.length;
            res.json({
                success: true,
                message: `成功删除 ${removedCount} 条数据`,
                removedCount,
                remainingCount: data.donations.length
            });
        } else {
            res.status(500).json({
                success: false,
                message: '保存数据失败'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除数据失败: ' + error.message
        });
    }
});

// 初始化并启动服务器
initDataFile();

app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`数据文件: ${DATA_FILE}`);
    console.log(`API端点:`);
    console.log(`  GET  /health - 健康检查`);
    console.log(`  GET  /api/donations - 获取所有数据`);
    console.log(`  POST /api/donations - 提交数据`);
    console.log(`  GET  /api/donations/:id - 获取单条数据`);
    console.log(`  GET  /api/stats - 获取统计数据`);
    console.log(`  DELETE /api/donations/:id - 删除数据`);
});