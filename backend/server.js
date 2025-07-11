// backend/server.js (Final Version for Render)

const express = require('express');
const cors = require('cors');

// --- Import Routes ---
// Việc require các route sẽ tự động require và khởi tạo pool kết nối trong db.js
const authRoutes = require('./routes/auth');
const userDataRoutes = require('./routes/userData');
const predictionRoutes = require('./routes/prediction');
const interactivePredictionRoutes = require('./routes/interactivePrediction');

// --- Initialize Express App ---
const app = express();
const port = process.env.PORT || 3001; // Render sẽ cung cấp biến PORT

// --- CORS Configuration ---
// Danh sách các nguồn gốc (domains) được phép truy cập backend
const allowedOrigins = [
  // Thêm các URL local để tiện cho việc phát triển trên máy
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  // URL của frontend trên Render, sẽ được cung cấp qua biến môi trường
  process.env.FRONTEND_URL
];

const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép các request không có origin (như từ Postman, mobile apps)
    // hoặc các origin nằm trong danh sách trắng (whitelist)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin '${origin}' not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Kích hoạt CORS pre-flight cho tất cả các route. Điều này rất quan trọng.
app.options('*', cors(corsOptions));
// Áp dụng middleware CORS cho tất cả các request đến
app.use(cors(corsOptions));


// --- Middlewares ---
// Middleware để parse body của request thành JSON
app.use(express.json({ limit: '50mb' }));
// Middleware để parse body của các request URL-encoded
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// --- API Routes ---
// Gắn các router vào các đường dẫn API chính
app.use('/api/auth', authRoutes);
app.use('/api/user', userDataRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/interactive_prediction', interactivePredictionRoutes);

// Route cơ bản để kiểm tra sức khỏe của server
app.get('/', (req, res) => {
    res.send('Navigation App Backend is running and healthy!');
});


// --- Error Handling ---
// Middleware để bắt các route không tồn tại (404 Not Found)
app.use((req, res, next) => {
     res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Middleware xử lý lỗi toàn cục (Global Error Handler)
// Bắt tất cả các lỗi xảy ra trong các route async
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err.stack || err);
    
    // Tránh lộ chi tiết lỗi trong môi trường production
    const statusCode = err.status || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred.' 
        : (err.message || 'Internal Server Error');
    
    res.status(statusCode).json({ message });
});


// --- Start the Server ---
app.listen(port, () => {
    console.log(`✅ Backend server is listening on port ${port}`);
});
