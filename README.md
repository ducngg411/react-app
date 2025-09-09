# Grammar Studio - AI-Powered English Grammar Learning Platform

Một ứng dụng web tạo bài học ngữ pháp tiếng Anh bằng AI với hệ thống authentication và database MongoDB.

## 🚀 Tính năng

- **Tạo bài học bằng AI**: Sử dụng Gemini AI để tạo bài học ngữ pháp chi tiết
- **Authentication**: Đăng ký, đăng nhập với JWT
- **Database**: Lưu trữ bài học và thông tin user trên MongoDB Atlas
- **User Management**: Quản lý profile, thống kê học tập
- **Responsive Design**: Giao diện đẹp với Tailwind CSS
- **Real-time**: Tích hợp YouTube video và chấm điểm tự động

## 🛠️ Công nghệ sử dụng

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router DOM

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- Express Validator

## 📦 Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd react-app
```

### 2. Cài đặt dependencies cho frontend
```bash
npm install
```

### 3. Cài đặt dependencies cho backend
```bash
cd server
npm install
cd ..
```

### 4. Cấu hình Environment Variables

#### Backend (.env trong thư mục server)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grammar-studio?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-api-key-here
```

#### Frontend (.env trong thư mục gốc)
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Chạy ứng dụng

#### Chạy cả frontend và backend cùng lúc
```bash
npm run dev:full
```

#### Hoặc chạy riêng lẻ

Backend:
```bash
npm run server
```

Frontend:
```bash
npm run dev
```

## 🗄️ Database Schema

### User Model
- Thông tin cá nhân (username, email, profile)
- Preferences (language, theme, notifications)
- Stats (lessons created, exercises completed, study time)
- Authentication (password hash, role)

### Lesson Model
- Nội dung bài học (title, level, objectives, grammar, examples, exercises)
- Metadata (AI model used, generation time, difficulty, tags)
- Author reference
- Stats (views, completions, ratings)
- Video integration (YouTube)

## 🔐 Authentication

- JWT tokens với expiration 7 ngày
- Password hashing với bcryptjs
- Protected routes với middleware
- Role-based access (user/admin)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/logout` - Đăng xuất

### Lessons
- `GET /api/lessons` - Lấy danh sách bài học
- `GET /api/lessons/my` - Lấy bài học của user
- `GET /api/lessons/:id` - Lấy chi tiết bài học
- `POST /api/lessons` - Tạo bài học mới
- `PUT /api/lessons/:id` - Cập nhật bài học
- `DELETE /api/lessons/:id` - Xóa bài học

### Users
- `GET /api/users/profile` - Lấy profile
- `PUT /api/users/profile` - Cập nhật profile
- `PUT /api/users/password` - Đổi mật khẩu
- `GET /api/users/stats` - Lấy thống kê

## 🎨 UI Components

- **LoginModal**: Form đăng nhập
- **RegisterModal**: Form đăng ký
- **UserProfileModal**: Quản lý profile và settings
- **SettingsModal**: Cài đặt API keys
- **Toast**: Thông báo
- **Exercises**: Component bài tập tương tác

## 🔧 Development

### Cấu trúc thư mục
```
src/
├── components/          # UI Components
├── contexts/           # React Contexts
├── pages/             # Page Components
├── services/          # API Services
└── utils/             # Utilities

server/
├── models/            # MongoDB Models
├── routes/            # API Routes
├── middleware/        # Express Middleware
└── server.js         # Main server file
```

### Scripts
- `npm run dev` - Chạy frontend development server
- `npm run server` - Chạy backend development server
- `npm run dev:full` - Chạy cả frontend và backend
- `npm run build` - Build production frontend
- `npm run preview` - Preview production build

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy thư mục `dist/`

### Backend (Railway/Heroku)
1. Set environment variables
2. Deploy thư mục `server/`

## 📝 Notes

- Đảm bảo MongoDB Atlas cluster đã được tạo và whitelist IP
- Gemini API key cần được cấu hình để tạo bài học
- CORS đã được cấu hình cho development
- Rate limiting được áp dụng cho API endpoints

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License
