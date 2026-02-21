# Online Quiz System

Полнофункциональная веб-платформа для создания и прохождения онлайн-тестов с мгновенными результатами, AI-генерацией вопросов и сертификатами.

## О проекте

Online Quiz System — это образовательная платформа, которая позволяет преподавателям создавать тесты (в том числе с помощью ИИ), а студентам — проходить их, получать оценки и сертификаты. Проект поддерживает три языка интерфейса и две темы оформления.

---

## Технологии

| Слой | Технология | Версия |
|------|-----------|--------|
| **Backend** | Java + Spring Boot | 3.1.5 (Java 17) |
| **Frontend** | React | 18.2.0 |
| **База данных** | MongoDB | Latest |
| **Аутентификация** | JWT (JJWT) | 0.11.5 |
| **Маршрутизация** | React Router DOM | 6.20.0 |
| **HTTP-клиент** | Axios | 1.6.2 |
| **AI-сервис** | ApiFreeLLM | — |
| **Email** | Spring Mail + Gmail SMTP | — |
| **Безопасность** | Spring Security + BCrypt | — |
| **Сборка** | Maven (backend), npm (frontend) | — |

---

## Возможности

### Для пользователей
- Регистрация с подтверждением email (код верификации)
- Вход/выход с JWT-аутентификацией
- Сброс пароля через email
- Строгая валидация паролей
- Просмотр и поиск опубликованных тестов
- Прохождение тестов с таймером обратного отсчёта
- Автосохранение ответов каждые 30 секунд
- Мгновенные результаты и детальный обзор ответов
- Ограничение количества попыток (по умолчанию 3)
- Генерация и скачивание сертификатов (PNG)
- Курсы с модулями и привязанными тестами
- Отслеживание прогресса по курсам
- Выбор аватара для профиля
- История прохождения тестов
- 3 языка интерфейса: English, Русский, Қазақша
- 2 темы: светлая и тёмная

### Для администратора
- Создание, редактирование и удаление тестов
- 5 типов вопросов: одиночный выбор, множественный выбор, правда/ложь, открытый ответ, числовой ответ
- 3 уровня сложности: начальный, средний, продвинутый
- AI-генерация тестов (предпросмотр + сохранение)
- Управление пользователями (роли, удаление)
- Управление курсами (создание, редактирование, модули)
- Аналитика и отчёты по тестам
- Панель управления со статистикой
- Публикация / черновик тестов

---

## Страницы (20)

### Публичные
| Страница | Маршрут | Описание |
|----------|---------|----------|
| Главная | `/` | Лендинг с избранными тестами и курсами |
| Вход | `/login` | Форма авторизации |
| Регистрация | `/register` | Форма регистрации |
| Подтверждение email | `/verify-email` | Ввод кода верификации |
| Забыли пароль | `/forgot-password` | Запрос сброса пароля |
| Сброс пароля | `/reset-password` | Форма нового пароля |
| Тесты | `/tests` | Каталог тестов с поиском |
| Курсы | `/courses` | Каталог курсов |
| Детали курса | `/courses/:id` | Модули, тесты, прогресс |

### Для авторизованных пользователей
| Страница | Маршрут | Описание |
|----------|---------|----------|
| Начало теста | `/test/:id/start` | Информация о тесте и кнопка старта |
| Прохождение теста | `/test/:id/attempt/:attemptId` | Интерфейс тестирования с таймером |
| Результат | `/result/:attemptId` | Оценка, процент, статус |
| Обзор ответов | `/result/:attemptId/review` | Детальный разбор ответов |
| Профиль | `/profile` | Данные пользователя, история, аватар |

### Админ-панель
| Страница | Маршрут | Описание |
|----------|---------|----------|
| Дашборд | `/admin` | Статистика платформы |
| Управление тестами | `/admin/tests` | CRUD тестов |
| Редактор теста | `/admin/tests/new`, `/admin/tests/:id/edit` | Конструктор вопросов |
| AI-генерация | `/admin/ai-generate` | Генерация тестов через ИИ |
| Пользователи | `/admin/users` | Управление ролями |
| Отчёты | `/admin/reports` | Аналитика по тестам |

---

## Архитектура

```
java_po/
├── backend/
│   └── src/main/java/com/quizsystem/
│       ├── controller/        # 5 REST-контроллеров
│       ├── model/             # 8 моделей MongoDB
│       ├── repository/        # 8 репозиториев
│       ├── service/           # 7 сервисов
│       ├── security/          # JWT, фильтры, Spring Security
│       ├── dto/               # DTO-объекты
│       ├── config/            # Конфигурация и инициализация
│       └── QuizSystemApplication.java
│
├── frontend/src/
│   ├── pages/                 # 20 страниц
│   ├── components/
│   │   ├── layout/            # Header, Footer, PrivateRoute
│   │   ├── auth/              # AvatarSelector
│   │   └── tests/             # Timer
│   ├── contexts/              # AuthContext, LanguageContext, ThemeContext
│   ├── api/                   # 5 API-клиентов (axios)
│   ├── translations/          # en.json, ru.json, kz.json
│   ├── utils/                 # avatars, passwordValidator
│   └── index.css              # Глобальные стили + темы
│
└── README.md
```

---

## Модели данных (MongoDB)

| Модель | Описание | Ключевые поля |
|--------|----------|---------------|
| **User** | Пользователь | email, name, role (USER/ADMIN), avatar, emailVerified |
| **Test** | Тест | title, questions[], durationMinutes, passingScore, difficulty, maxAttempts |
| **TestAttempt** | Попытка прохождения | testId, userId, answers[], score, status (IN_PROGRESS/SUBMITTED/GRADED) |
| **Course** | Курс | title, modules[], testIds[], difficulty, category |
| **CourseProgress** | Прогресс по курсу | userId, courseId, completedModuleIds[], completed |
| **Certificate** | Сертификат | studentName, testTitle, score, verificationCode |
| **EmailVerificationToken** | Токен верификации | email, code, expiresAt (TTL) |
| **PasswordResetToken** | Токен сброса пароля | email, token, expiresAt (TTL) |

---

## API (основные эндпоинты)

### Аутентификация (`/api/auth`)
- `POST /register` — регистрация
- `POST /login` — вход
- `POST /verify-email` — подтверждение email
- `POST /forgot-password` — запрос сброса пароля
- `POST /reset-password` — сброс пароля
- `GET /me` — текущий пользователь
- `PUT /update-avatar` — обновление аватара

### Тесты (`/api/tests`)
- `GET /` — список опубликованных тестов
- `GET /search?query=` — поиск
- `POST /{id}/start` — начать тест
- `POST /{testId}/attempt/{attemptId}/answer` — сохранить ответ
- `POST /{testId}/attempt/{attemptId}/submit` — завершить тест
- `GET /attempt/{attemptId}` — результат
- `GET /my-attempts` — история попыток

### Курсы (`/api/courses`)
- `GET /` — список курсов
- `GET /{id}` — детали курса
- `POST /{courseId}/modules/{moduleId}/complete` — завершить модуль
- `GET /my-progress` — прогресс пользователя

### Сертификаты (`/api/certificates`)
- `POST /generate/{attemptId}` — генерация
- `GET /{id}/download` — скачать PNG
- `GET /verify/{code}` — проверка подлинности

### Админ (`/api/admin`, требуется роль ADMIN)
- CRUD для тестов, пользователей, курсов
- `POST /ai/generate` — AI-генерация теста (предпросмотр)
- `POST /ai/generate-and-save` — AI-генерация + сохранение
- `GET /reports/dashboard` — статистика платформы
- `GET /reports/test/{id}` — отчёт по тесту

---

## Установка и запуск

### Требования
- Java 17+
- Node.js 16+
- MongoDB (localhost:27017)
- Maven

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Запустится на `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm start
```

Запустится на `http://localhost:3000`

### Аккаунты по умолчанию

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@quiz.com | admin123 |
| User | user@quiz.com | user123 |

---

## Безопасность

- Хеширование паролей через BCrypt
- JWT-токены (срок действия 24 часа)
- Ролевой доступ (USER / ADMIN)
- Защищённые маршруты на фронтенде и бэкенде
- CORS-настройка (только localhost:3000)
- Строгая политика паролей
- TTL-индексы для автоудаления истёкших токенов

---

## Лицензия

MIT License
