# NullPointer: A Community-Driven Q&A app.

A robust backend system for user management, question and answer handling, and a reputation-based voting system, built using Node.js, Express, MongoDB, and JWT for authentication. The system includes features like user registration, login, password reset, reputation tracking, filtering and pagination.

## Features

- **User Registration and Login**: Users can register, log in, and manage their accounts.
- **Password Reset**: Users can reset their password via email using a secure token-based mechanism.
- **Reputation System**: Users earn reputation points through upvotes and downvotes on answers, as well as for posting questions.
- **Admin Privileges**: Admins can manage users, including banning and promoting them.
- **Pagination and Filtering**: API routes support pagination and filtering for users, questions and answers.
- **Security**: Uses JWT for secure authentication and authorization.
- **Email Notifications**: Sends password reset emails to users.

## Prerequisites

Before you start, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local or Cloud instance, e.g., MongoDB Atlas)
- [Postman](https://www.postman.com/) (Optional for testing APIs)

## Setup Instructions

### 1. Clone the repository

```
mkdir forum_app
cd forum_app
git clone https://github.com/elab-development/internet-tehnologije-2024-projekat-forum_app_20210013_20210133.git .
cd backend
```

### 2. Install dependencies

Run the following command to install the necessary packages:

```
npm install
```

### 3. Setup environment variables

Create a .env file in the root of the backend directory and add the following environment variables:

```
PORT=port_number
FRONTEND_PORT=frontend_port_number
MONGO_URI=database_connection_string
JWT_SECRET=jwt_secret_key
MAIL_PASS=password_for_email_service
```

| Variable        | Description                                                                   |
| --------------- | ----------------------------------------------------------------------------- |
| `PORT`          | Port on which the server will run.                                            |
| `FRONTEND_PORT` | Port on which the frontend service runs.                                      |
| `MONGO_URI`     | Connection string for your MongoDB instance.                                  |
| `JWT_SECRET`    | A secret key used for signing JWT tokens.                                     |
| `MAIL_PASS`     | The password for your email service (used for sending password reset emails). |

For the email service, you should use Gmail (check email configuration for "Less Secure Apps" or use App Passwords).

### 4. Run the Project

To start the application, make sure you are in the backend directory, then run:

```
npm start
```

The server will start on the port defined in the .env file.

### 5. Test API Endpoints

You can test the API endpoints using Postman or your preferred API client. Below are the available routes:

#### Welcome Route

| Method | Endpoint | Description                  | Access |
| ------ | -------- | ---------------------------- | ------ |
| GET    | /        | Welcome message for the API. | Public |

#### User Routes

| Method | Endpoint             | Description                            | Access |
| ------ | -------------------- | -------------------------------------- | ------ |
| GET    | /users               | Fetch all users with optional filters. | Public |
| GET    | /users/:id           | Fetch a single user by id.             | Public |
| GET    | /users/byReputation  | Fetch users sorted by reputation.      | Public |
| POST   | /users/register      | Register a new user.                   | Public |
| POST   | /users/login         | Login and receive a JWT token.         | Public |
| POST   | /users/logout        | Logout the current user.               | Public |
| PUT    | /users/promote/:id   | Promote a user to admin.               | Admin  |
| PUT    | /users/ban/:id       | Ban a user by id.                      | Admin  |
| PUT    | /users/unban/:id     | Unban a user by id.                    | Admin  |
| POST   | /users/requestReset  | Request a password reset email.        | Public |
| POST   | /users/resetPassword | Reset password with a valid token.     | Public |
| POST   | /users/uploadImage   | Uploads a new user profile image.      | User   |

#### Question Routes

| Method | Endpoint              | Description                                                     | Access |
| ------ | --------------------- | --------------------------------------------------------------- | ------ |
| GET    | /questions            | Fetch all questions with optional filters.                      | Public |
| GET    | /questions/:id        | Fetch a single question by id.                                  | Public |
| GET    | /questions/byUser/:id | Fetches all questions of a user with id, with optional filters. | Public |
| POST   | /questions            | Add a new question.                                             | User   |
| PUT    | /questions/:id        | Update a specific question by id.                               | User   |
| DELETE | /questions/:id        | Delete a specific question by id.                               | User   |
| POST   | /questions/:id/view   | Update view count for a specific question.                      | Public |

#### Answer Routes

| Method | Endpoint                | Description                                | Access |
| ------ | ----------------------- | ------------------------------------------ | ------ |
| GET    | /answers                | Fetch all answers with optional filters.   | Public |
| GET    | /answers/:id            | Fetch a single answer by id.               | Public |
| GET    | /answers/byQuestion/:id | Fetch all answers for a specific question. | Public |
| GET    | /answers/byUser/:id     | Fetch all answers by a specific user.      | Public |
| POST   | /answers                | Add an answer to a specific question.      | User   |
| PUT    | /answers/:id            | Update a specific answer by id.            | User   |
| DELETE | /answers/:id            | Delete a specific answer by id.            | User   |
| POST   | /answers/:id/vote       | Vote on an answer (upvote/downvote).       | User   |

## Conclusion

This project showcases a robust implementation of a forum-like application, featuring a comprehensive API for managing users, questions, and answers. With flexible authentication, reputation tracking, and pagination, the system is designed for scalability and usability. The well-structured codebase and adherence to RESTful principles make it a solid foundation for further development and integration with a frontend application.

Whether you're exploring backend development, learning about database design, or building a community-driven platform, this project offers valuable insights and a starting point for more advanced implementations.

Thank you for exploring this project—happy coding! 🚀
