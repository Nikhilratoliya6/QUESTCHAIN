# QuestChain 🎯

QuestChain ([LINK](https://questchain.pages.dev)) is a gamified daily task management system that helps users build consistent habits through a unique weightage-based approach.

## 🌟 Features

- **Daily Quests**: Create and track daily tasks with customizable goals and weightage, set quantitative targets for tasks, and schedule quests for future days
- **Smart Notifications**: 
  - Evening reminders for incomplete tasks
  - Morning reminders for streak break
  - Real-time notifications for broadcast messages
- **Activity Heatmap**: Visualize your consistency with a GitHub-style activity heatmap
- **Regularity Tracking**: Monitor your completion rate with detailed statistics and pie charts
- **Today's Progress**: Monitor your progress for today's tasks
- **Task Motivation**: : Get real-time progress insights, a dynamic activity heatmap, and comprehensive regularity scores to inspire consistent task completion and drive daily productivity.
- **User Authentication**: Secure signup/login system with JWT authentication
- **Responsive Design**: Works seamlessly on both desktop and mobile devices
- **SEO Optimized**: Comprehensive meta tags, sitemap.xml, and robots.txt for search engine optimization
- **PWA Ready**: Progressive Web App capabilities with manifest.json for mobile installation
- **Quest Types**
  - **Goal-Based Quests** 🎯
    - Set numerical goals (e.g., "Read 20 pages")
    - Track progress with interactive slider
    - Visual progress bars
    - Real-time progress updates
  - **Checklist Quests** ✔️
    - Simple yes/no completion tasks
    - Quick toggle checkboxes
    - Color-coded status (Green/Red)
    - One-click completion

- **Enhanced Progress Tracking**
  - Group tasks by quest type
  - Combined progress view
  - Color-coded status indicators
  - Visual completion markers

## 🛠️ Tech Stack

### Frontend
- React.js
- Chart.js for data visualization
- RSuite Calendar Component
- Axios for API calls
- React Icons
- CSS3 with modern flexbox layouts

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Express Validator

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/kushal7201/questchain.git
cd questchain
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Create a .env file in the backend directory
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

5. Start the servers
```bash
# In backend directory
npm run dev

# In frontend directory
npm start
```
### Android Installation

While there is no actual app for android or iphone, but we can you a simple feature which chrome provide to install website as app!🎉
[Installation](https://drive.google.com/file/d/1WxbmM4fj134et8rsVeWJKaK36xxv_XlN/view?usp=sharing)
<!-- ![Android Demo](./assets/android.mp4) -->
The app will be installed within a minute or two than you can use it seamlessly

### 📱 Demo Video
Check out QuestChain in action on Android:
[DEMO](https://drive.google.com/file/d/1KEm1x3WCDjpXGpKVqnzUsocUC4-xRL_4/view?usp=sharing)


## 💡 How It Works

1. **Create Quests**
   - Set daily tasks with specific goals
   - Assign weightage points for incomplete tasks
   - Choose duration for recurring tasks
   - Choose between Goal-Based or Checklist quests
   - Set appropriate completion criteria
   - Group similar tasks together

2. **Track Progress**
   - Update task progress throughout the day
   - View completion status in real-time
   - Get instant feedback on the progress

3. **Monitor Consistency**
   - Check your activity heatmap
   - View regularity percentage
   - Track completed vs incomplete days

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation and sanitization

## 🎨 UI Features

- Clean, modern interface
- Responsive design
- Interactive calendars
- Progress visualization
- Activity heatmaps
- Statistical charts
- Quest type grouping
- Color-coded status indicators

## 📱 Mobile Responsiveness

- Hamburger menu for mobile navigation
- Adaptive layouts
- Touch-friendly interface
- Optimized performance

## 🔍 SEO & Performance

- **SEO Optimized**: Complete meta tags for social media sharing
- **Sitemap**: Automated sitemap.xml for search engine indexing
- **Robots.txt**: Proper robot directives for web crawlers
- **Open Graph**: Facebook and social media preview optimization
- **Twitter Cards**: Enhanced Twitter sharing experience
- **PWA**: Progressive Web App with offline capabilities
- **Canonical URLs**: Proper URL structure for SEO

### Domain Configuration:
- **Primary Domain**: https://questchain.me (main production URL)
- **Fallback Domain**: https://questchain.pages.dev (Cloudflare Pages backup)

### SEO Files Location:
- `frontend/public/sitemap.xml` - Site structure for questchain.me (primary domain)
- `frontend/public/sitemap-pages.xml` - Site structure for questchain.pages.dev (fallback domain)
- `frontend/public/robots.txt` - Crawler directives for primary domain
- `frontend/public/robots-pages.txt` - Crawler directives for fallback domain
- `frontend/public/manifest.json` - PWA configuration

### SEO Setup Instructions:
1. Submit both sitemaps to Google Search Console:
   - https://questchain.me/sitemap.xml (primary)
   - https://questchain.pages.dev/sitemap-pages.xml (fallback)
2. Verify both domains in Google Search Console
3. Set questchain.me as the preferred domain
4. Monitor indexing status and search performance

### Deployment Notes:
- Deploy `sitemap.xml` and `robots.txt` to questchain.me
- Deploy `sitemap-pages.xml` and `robots-pages.txt` to questchain.pages.dev
- Or simply deploy all files to both domains and use the appropriate ones

<!-- ## 🛣️ Future Roadmap

- [ ] Social features and friend challenges
- [ ] Achievement system
- [ ] Customizable themes
- [ ] Export statistics
- [ ] Mobile app version
- [ ] Weekly and monthly quest planning -->

### Azure Docker Deployment:
NOTE: envs saved in backend locally will go into the azure
```bash
cd backend
docker build -t devins112/questchain:latest .
docker login
docker push devins112/questchain:latest
```
- Then `Restart` the Web App through Azure portal. 

## 👨‍💻 Author:

**Kushal Bansal**

### Contact Details:
- 📧 Email: [support@questchain.me](mailto:support@questchain.me)

## 📄 License

This project is licensed under the MIT License - see the LICENSE.md file for details

---

Built with ❤️ and determination to make habit-building fun and effective
