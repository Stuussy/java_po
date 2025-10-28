# Online Quiz System

A full-stack web application for creating and taking online quizzes with instant results.

## Technologies

- **Frontend**: React 18
- **Backend**: Java Spring Boot 3.1.5
- **Database**: MongoDB
- **Authentication**: JWT

## Features

### User Features
- User registration and authentication
- Browse available tests
- Take tests with timer and auto-save
- View instant results after completion
- Detailed answer review
- Test history and profile management

### Admin Features
- Create, edit, and delete tests
- Multiple question types:
  - Single choice
  - Multiple choice
  - True/False
  - Open-ended
  - Numeric
- User management
- Test analytics and reports
- Dashboard with statistics

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- MongoDB (running on localhost:27017)
- Maven

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd java_po
```

### 2. Setup MongoDB

Make sure MongoDB is running on `localhost:27017`. The application will automatically create the `quiz_system` database.

### 3. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

## Usage

### Default Accounts

The application automatically creates default accounts on first startup:

**Admin Account:**
- Email: `admin@quiz.com`
- Password: `admin123`
- Role: ADMIN

**Test User Account:**
- Email: `user@quiz.com`
- Password: `user123`
- Role: USER

### First Time Setup

1. Open `http://localhost:3000` in your browser
2. Login with one of the default accounts above, or register a new account
3. New registered users have the USER role by default

### User Flow

1. **Login/Register**: Create an account or login
2. **Browse Tests**: View available published tests
3. **Take Test**:
   - Click "Start Test" to begin
   - Answer questions within the time limit
   - Answers are auto-saved every 30 seconds
   - Submit when complete
4. **View Results**: See score, percentage, and pass/fail status
5. **Review Answers**: Check detailed breakdown of correct/incorrect answers
6. **Profile**: View test history and personal information

### Admin Flow

1. **Login as Admin**: Use admin credentials
2. **Dashboard**: View statistics (total users, tests, etc.)
3. **Manage Tests**:
   - Create new tests
   - Add questions with various types
   - Set duration and passing score
   - Publish or save as draft
4. **Manage Users**: View all users, change roles, delete users
5. **Reports**: View test statistics and user performance

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tests
- `GET /api/tests` - Get all published tests
- `GET /api/tests/{id}` - Get test by ID
- `GET /api/tests/search?query={query}` - Search tests
- `POST /api/tests/{id}/start` - Start test attempt
- `POST /api/tests/{testId}/attempt/{attemptId}/answer` - Save answer
- `POST /api/tests/{testId}/attempt/{attemptId}/submit` - Submit test
- `GET /api/tests/attempt/{attemptId}` - Get attempt result
- `GET /api/tests/my-attempts` - Get user's test attempts

### Admin (Requires ADMIN role)
- `GET /api/admin/tests` - Get all tests (including drafts)
- `POST /api/admin/tests` - Create test
- `PUT /api/admin/tests/{id}` - Update test
- `DELETE /api/admin/tests/{id}` - Delete test
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/{id}` - Delete user
- `PUT /api/admin/users/{id}/role` - Update user role
- `GET /api/admin/reports/test/{id}` - Get test report
- `GET /api/admin/reports/dashboard` - Get dashboard statistics

## Project Structure

```
java_po/
├── backend/
│   ├── src/main/java/com/quizsystem/
│   │   ├── controller/       # REST controllers
│   │   ├── model/            # MongoDB models
│   │   ├── repository/       # Data access layer
│   │   ├── service/          # Business logic
│   │   ├── security/         # JWT and security config
│   │   ├── dto/              # Data transfer objects
│   │   └── QuizSystemApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/              # API clients
│   │   ├── components/       # React components
│   │   │   ├── auth/
│   │   │   ├── tests/
│   │   │   ├── admin/
│   │   │   └── layout/
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Server Port
server.port=8080

# MongoDB
spring.data.mongodb.uri=mongodb://localhost:27017/quiz_system

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# CORS
cors.allowed-origins=http://localhost:3000
```

### Frontend Configuration

The frontend uses a proxy to connect to the backend. This is configured in `frontend/package.json`:

```json
"proxy": "http://localhost:8080"
```

## Testing

### Creating a Test Quiz

1. Login as admin
2. Go to "Admin" -> "Manage Tests"
3. Click "Create New Test"
4. Fill in test details:
   - Title
   - Description
   - Duration (minutes)
   - Passing score (%)
   - Tags
5. Add questions:
   - Click "Add Question"
   - Select question type
   - Enter question text
   - Add choices (for choice-based questions)
   - Mark correct answers
   - Set points
6. Save as draft or publish

### Taking a Test

1. Login as regular user
2. Browse available tests
3. Click "Start Test"
4. Answer questions
5. Submit when complete
6. View results and review answers

## Security

- Passwords are hashed using BCrypt
- JWT tokens for authentication
- Role-based access control (USER, ADMIN)
- Protected routes on both frontend and backend
- CORS configuration for API security

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection URL in `application.properties`

### Port Already in Use
- Backend (8080): Change in `application.properties`
- Frontend (3000): Change in `package.json` or use: `PORT=3001 npm start`

### CORS Errors
- Check `cors.allowed-origins` in `application.properties`
- Verify frontend proxy configuration

## Future Enhancements

- Email verification
- Password reset functionality
- File upload for questions (images)
- PDF certificate generation
- Real-time test monitoring for admins
- Test categories and filtering
- Leaderboards
- Social features (share results)
- Mobile app

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.
