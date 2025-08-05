const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const auth = require('./middleware/auth');
const Quest = require('./models/Quest');
const User = require('./models/User');
const Notification = require('./models/Notification');
require('dotenv').config(); 

const app = express();
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://dqdevins.vercel.app', 'https://questchain.pages.dev', "https://www.devins.social", "https://devins.social", 'https://questchain.me']
        : ['http://localhost:3000']
}));
app.use(express.json());

// Remove console.logs in production
if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.error = () => {};
}

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

connectDB();

// Cron job endpoints - supporting both GET and POST
const handleEveningReminders = async (req, res) => {
    console.log('Evening reminders endpoint hit');
    try {
        const apiKey = req.headers['x-cron-key'];
        console.log('Received API key:', apiKey);
        if (!apiKey || apiKey !== process.env.CRON_SECRET_KEY) {
            console.log('Invalid or missing API key');
            return res.status(401).json({ error: 'Invalid API key' });
        }

        const today = new Date();
        today.setHours(today.getHours() + 5);
        today.setMinutes(today.getMinutes() + 30);
        const todayStr = today.toISOString().split('T')[0];
        
        const incompleteQuests = await Quest.find({ 
            date: todayStr,
            'quests.completed': false 
        }).populate('user');

        for (const quest of incompleteQuests) {
            if (!quest.user || !quest.user._id) {
                console.log('Skipping quest without valid user:', quest._id);
                continue;
            }
            
            const incompleteQuestItems = quest.quests.filter(q => !q.completed);
            
            for (const item of incompleteQuestItems) {
                await Notification.create({
                    user: quest.user._id,
                    title: 'Quest Reminder',
                    message: `Don't forget to complete "${item.name}" today! Take some time now to complete it.`,
                    type: 'quest',
                    questId: quest._id
                });
            }
        }
        res.json({ success: true, message: 'Evening reminders sent successfully' });
    } catch (error) {
        console.error('Error sending quest notifications:', error);
        res.status(500).json({ error: 'Error sending reminders' });
    }
};

const handleDailySummary = async (req, res) => {
    console.log('Daily summary endpoint hit');
    try {
        const apiKey = req.headers['x-cron-key'];
        console.log('Received API key:', apiKey);
        if (!apiKey || apiKey !== process.env.CRON_SECRET_KEY) {
            console.log('Invalid or missing API key');
            return res.status(401).json({ error: 'Invalid API key' });
        }

        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() + 5);
        yesterday.setMinutes(yesterday.getMinutes() + 30);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const incompleteQuests = await Quest.find({
            date: yesterdayStr,
            'quests.completed': false
        }).populate('user');

        for (const quest of incompleteQuests) {
            if (!quest.user || !quest.user._id) {
                console.log('Skipping quest without valid user:', quest._id);
                continue;
            }
            
            const incompleteQuestItems = quest.quests.filter(q => !q.completed);
            
            if (incompleteQuestItems.length > 0) {
                await Notification.create({
                    user: quest.user._id,
                    title: 'Daily Summary',
                    message: `You had ${incompleteQuestItems.length} incomplete quests yesterday. Try to maintain your streak today!`,
                    type: 'quest'
                });
            }
        }
        res.json({ success: true, message: 'Daily summary sent successfully' });
    } catch (error) {
        console.error('Error sending daily summary notifications:', error);
        res.status(500).json({ error: 'Error sending daily summary' });
    }
};

// Support both GET and POST for cron endpoints
app.get('/send-evening-reminders', handleEveningReminders);
app.post('/send-evening-reminders', handleEveningReminders);
app.get('/send-daily-summary', handleDailySummary);
app.post('/send-daily-summary', handleDailySummary);

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const noteRoutes = require('./routes/noteRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/notifications', notificationRoutes);
app.use('/api/notes', noteRoutes);

app.get('/health', async (req, res) => {
    res.json("Health Check ---> OKAY✅");
});

// Updated quest routes to be user-specific
app.get('/quests/:date', auth, async (req, res) => {
    try {
        const { date } = req.params;
        const quest = await Quest.findOne({ date, user: req.user.id });
        if (!quest) {
            return res.json({ quests: [], penalty: -1 });
        }
        res.json(quest);
    } catch (error) {
        console.error('Error fetching quests:', error);
        res.status(500).json({ error: 'Error fetching quests' });
    }
});

app.get('/', auth, async (req, res) => {
    res.json("Hello World");
});

app.put('/quests/:date', auth, async (req, res) => {
    try {
        const { date } = req.params;
        const { quests } = req.body;
        
        // Calculate total penalty based on incomplete quests
        const penalty = quests.reduce((total, quest) => {
            return total + (quest.completed ? 0 : quest.penaltyPoints);
        }, 0);

        let quest = await Quest.findOne({ date, user: req.user.id });
        if (quest) {
            quest = await Quest.findOneAndUpdate(
                { date, user: req.user.id },
                { quests, penalty },
                { new: true }
            );
        } else {
            quest = new Quest({
                date,
                user: req.user.id,
                quests,
                penalty
            });
            await quest.save();
        }
        res.json(quest);
    } catch (error) {
        console.error('Error updating quests:', error);
        res.status(500).json({ error: 'Error updating quests' });
    }
});

// Remove the hardcoded initialization route and replace with new quest creation route
app.post('/quests', auth, async (req, res) => {
    try {
        const { name, goal, penaltyPoints, numberOfDays, startDate, type } = req.body;
        const quests = [];
        for (let i = 0; i < numberOfDays; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const questDate = date.toISOString().split('T')[0];
            
            let existingQuest = await Quest.findOne({ date: questDate, user: req.user.id });
            if (existingQuest) {
                existingQuest.quests.push({
                    name,
                    progress: 0,
                    goal: type === 'goal' ? parseInt(goal) : 1,
                    completed: false,
                    penaltyPoints: parseInt(penaltyPoints),
                    type
                });
                existingQuest.penalty += parseInt(penaltyPoints);
                await existingQuest.save();
                quests.push(existingQuest);
            } else {
                const newQuest = new Quest({
                    date: questDate,
                    user: req.user.id,
                    quests: [{
                        name,
                        progress: 0,
                        goal: type === 'goal' ? parseInt(goal) : 1,
                        completed: false,
                        penaltyPoints: parseInt(penaltyPoints),
                        type
                    }],
                    penalty: parseInt(penaltyPoints)
                });
                await newQuest.save();
                quests.push(newQuest);
            }
        }
          res.json({ message: 'Quests created successfully', quests });
    } catch (error) {
        console.error('Error creating quests:', error);
        res.status(500).json({ error: 'Error creating quests' });
    }
});

// Reorder quests endpoint - MUST come before /:questId route to avoid conflicts
app.put('/quests/:date/reorder', auth, async (req, res) => {
    try {
        const { date } = req.params;
        const { questType, questOrders } = req.body;
        
        // Find the quest document for this date and user
        let questDoc = await Quest.findOne({ date, user: req.user.id });
        if (!questDoc) {
            return res.status(404).json({ error: 'Quest not found for this date' });
        }
        
        // Update the order for each quest of the specified type
        questOrders.forEach(({ questId, order }) => {
            const questIndex = questDoc.quests.findIndex(q => 
                q._id.toString() === questId && q.type === questType
            );
            if (questIndex !== -1) {
                questDoc.quests[questIndex].order = order;
            }
        });
        
        // Sort quests by type and order
        questDoc.quests.sort((a, b) => {
            // First sort by type (goal first, then checklist)
            if (a.type !== b.type) {
                return a.type === 'goal' ? -1 : 1;
            }
            // Then sort by order within the same type
            return (a.order || 0) - (b.order || 0);
        });
        
        await questDoc.save();
        res.json({ 
            success: true, 
            message: 'Quests reordered successfully',
            quests: questDoc.quests 
        });
    } catch (error) {
        console.error('Error reordering quests:', error);
        res.status(500).json({ error: 'Error reordering quests' });
    }
});

// Update individual quest details (name, goal, penaltyPoints)
app.put('/quests/:date/:questId', auth, async (req, res) => {
    try {
        const { date, questId } = req.params;
        const { name, goal, penaltyPoints } = req.body;
        
        // Find the quest document for this date and user
        let questDoc = await Quest.findOne({ date, user: req.user.id });
        if (!questDoc) {
            return res.status(404).json({ error: 'Quest not found for this date' });
        }
        
        // Find the specific quest item in the quests array
        const questItem = questDoc.quests.find(q => q._id.toString() === questId);
        if (!questItem) {
            return res.status(404).json({ error: 'Quest item not found' });
        }
        
        // Store old penalty points for recalculation
        const oldPenaltyPoints = questItem.penaltyPoints;
        
        // Update quest details
        questItem.name = name;
        questItem.penaltyPoints = parseInt(penaltyPoints);
        if (goal !== undefined && questItem.type === 'goal') {
            questItem.goal = parseInt(goal);
            // Reset progress if goal changed and progress exceeds new goal
            if (questItem.progress > questItem.goal) {
                questItem.progress = questItem.goal;
                questItem.completed = true;
            } else {
                questItem.completed = questItem.progress >= questItem.goal;
            }
        }
        
        // Recalculate total penalty for the day
        questDoc.penalty = questDoc.quests.reduce((total, quest) => {
            return total + (quest.completed ? 0 : quest.penaltyPoints);
        }, 0);
        
        await questDoc.save();
        res.json(questDoc);    } catch (error) {
        console.error('Error updating quest details:', error);
        res.status(500).json({ error: 'Error updating quest details' });
    }
});

// Delete individual quest
app.delete('/quests/:date/:questId', auth, async (req, res) => {
    try {
        const { date, questId } = req.params;
        
        // Find the quest document for this date and user
        let questDoc = await Quest.findOne({ date, user: req.user.id });
        if (!questDoc) {
            return res.status(404).json({ error: 'Quest not found for this date' });
        }
        
        // Find the specific quest item in the quests array
        const questIndex = questDoc.quests.findIndex(q => q._id.toString() === questId);
        if (questIndex === -1) {
            return res.status(404).json({ error: 'Quest item not found' });
        }
        
        // Remove the quest from the array
        questDoc.quests.splice(questIndex, 1);
        
        // Recalculate total penalty for the day
        questDoc.penalty = questDoc.quests.reduce((total, quest) => {
            return total + (quest.completed ? 0 : quest.penaltyPoints);
        }, 0);
        
        // If no quests left, set penalty to -1 (no data)
        if (questDoc.quests.length === 0) {
            questDoc.penalty = -1;
        }
        
        await questDoc.save();
        res.json(questDoc);
    } catch (error) {
        console.error('Error deleting quest:', error);
        res.status(500).json({ error: 'Error deleting quest' });
    }
});

// Updated regularity route to be user-specific and consider account creation date
app.get('/regularity', auth, async (req, res) => {
    try {
        // Get the user's info from auth middleware
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const createdAt = new Date(user.createdAt);
        const today = new Date();
        today.setHours(today.getHours() + 5);
        today.setMinutes(today.getMinutes() + 30);
        
        // Get all quests between creation date and today
        const allQuests = await Quest.find({
            user: req.user.id,
            date: {
                $gte: createdAt.toISOString().split('T')[0],
                $lte: today.toISOString().split('T')[0]
            }
        });

        // Filter out quests with penalty === -1 (no data)
        const validQuests = allQuests.filter(quest => quest.penalty !== -1);
        const totalDays = validQuests.length;
        
        const completedDays = validQuests.filter(quest => quest.penalty === 0).length;
        const incompleteDays = totalDays - completedDays;
        const regularityPercentage = totalDays > 0 ? (completedDays * 100) / totalDays : 0;
        res.json({
            regularityPercentage,
            completedDays,
            incompleteDays,
            totalDays
        });
    } catch (error) {
        console.error('Error in regularity endpoint:', error);
        res.status(500).json({ error: 'Server error while fetching regularity data' });
    }
});

app.get('/activity-heatmap', auth, async (req, res) => {
    try {
        // Get offset from query parameter (default to 0 for current period)
        const offset = parseInt(req.query.offset) || 0;
        
        // Get today's date
        const today = new Date();
        today.setHours(today.getHours() + 5);
        today.setMinutes(today.getMinutes() + 30);

        // Calculate the end date based on offset (today - offset * 30 days)
        const endDate = new Date(today);
        endDate.setDate(today.getDate() - (offset * 30));

        // Get date 29 days before the end date
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 29);

        // Format dates for query
        const activities = await Quest.find({
            user: req.user.id,
            date: {
                $gte: startDate.toISOString().split('T')[0],
                $lte: endDate.toISOString().split('T')[0]
            }
        }).sort({ date: 1 });// Helper function to calculate weighted progress percentage
        const calculateWeightedProgress = (quests) => {
            if (!quests || quests.length === 0) return 0;
            
            const totalWeight = quests.reduce((sum, quest) => sum + quest.penaltyPoints, 0);
            if (totalWeight === 0) return 0;
            
            const weightedProgress = quests.reduce((sum, quest) => {
                const progressRatio = quest.type === 'checklist' 
                    ? (quest.progress || 0) 
                    : (quest.progress || 0) / quest.goal;
                return sum + (quest.penaltyPoints * progressRatio);
            }, 0);
            
            return (weightedProgress / totalWeight) * 100;
        };        // Create a map of all dates in the range
        const activityMap = {};
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const activity = activities.find(a => a.date === dateStr);
            if (activity) {
                const progressPercentage = calculateWeightedProgress(activity.quests);
                activityMap[dateStr] = {
                    penalty: activity.penalty,
                    progressPercentage: progressPercentage
                };
            } else {
                activityMap[dateStr] = {
                    penalty: -1,
                    progressPercentage: -1
                };
            }
        }

        res.json(activityMap);
    } catch (error) {
        console.error('Error fetching activity heatmap:', error);
        res.status(500).json({ error: 'Error fetching activity heatmap' });    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Server is running on port ${PORT}`);
    }
});