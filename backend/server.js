// server.js


// require('dotenv').config();

console.log("==== ENVIRONMENT VARIABLES (FROM server.js) ====");
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_DATABASE:", process.env.DB_DATABASE);
console.log("==============================================");


const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userDataRoutes = require('./routes/userData');
const predictionRoutes = require('./routes/prediction');
const interactivePredictionRoutes = require('./routes/interactivePrediction');


const app = express();
const port = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:8080', // Cho phép khi bạn chạy frontend trên máy
  'http://127.0.0.1:8080', // Một dạng khác của localhost
  process.env.FRONTEND_URL    // URL của frontend trên Render
];
const corsOptions = {
  origin: function (origin, callback) {
    // Nếu không có origin (ví dụ: request từ Postman), hoặc origin nằm trong danh sách cho phép
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// Kích hoạt CORS preflight cho tất cả các route
app.options('*', cors(corsOptions)); 

// Sử dụng middleware CORS cho tất cả các request
app.use(cors(corsOptions));
// --- END: Cấu hình CORS cho Production ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/user', userDataRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/interactive_prediction', interactivePredictionRoutes);

app.get('/', (req, res) => {
    res.send('Navigation App Backend is running!');
});

app.use((req, res, next) => {
     res.status(404).json({ message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err.stack || err);
    // Avoid sending detailed stack trace in production
    const statusCode = err.status || 500;
    const message = process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : (err.message || 'Internal Server Error');
    res.status(statusCode).json({ message });
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Backend server listening at ${port}`);
});
