# Todo-List
A simple todo-list application with user authentication and task management.
## Features

- User registration and login
- Task creation, deletion, and listing
- User account deletion

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/todo-list.git
    cd todo-list
    ```

2. Install backend dependencies:
    ```sh
    npm install
    ```

## Usage

1. Start the backend server:
    ```sh
    node backend/server.js
    ```

2. Open [`index.html`]() in your browser to use the application.

## API Endpoints

### User Endpoints

- **POST /register**: Register a new user
- **POST /login**: Login a user
- **DELETE /users/delete**: Delete a user account

### Task Endpoints

- **GET /todos**: Get all tasks for the logged-in user
- **POST /todos**: Create a new task
- **DELETE /todos/:id**: Delete a task by ID

## Frontend

The frontend consists of three main HTML files:

- `index.html`: Main application interface
- `login.html`: User login page
- `register.html`: User registration page

## Styling

The application uses `style.css` for styling, which includes animations and transitions for a better user experience.

## Database

The application uses JSON files to store user and task data:

- [`backend/db/users.json`](): Stores user information
- [`backend/db/tasks.json`](): Stores task information

Needs to be blank on first startup `[]`

## Dependencies

- `bcrypt`: For password hashing
- `body-parser`: For parsing request bodies
- `express`: For creating the server
- `jsonwebtoken`: For handling JSON Web Tokens
- `sqlite3`: For database management
- `uuid`: For generating unique IDs