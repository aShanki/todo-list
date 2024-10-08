const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const JWT_SECRET = 'your_secret_key';

const usersFilePath = path.join(__dirname, 'data/users.json');
const tasksFilePath = path.join(__dirname, 'data/tasks.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

function readJsonFile(filePath) {
    return JSON.parse(fs.readFileSync(filePath));
}

function writeJsonFile(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const users = readJsonFile(usersFilePath);

    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already taken' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    writeJsonFile(usersFilePath, users);

    res.json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJsonFile(usersFilePath);
    const user = users.find(user => user.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

function authenticate(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Failed to authenticate token' });

        req.user = decoded;
        next();
    });
}

app.get('/todos', authenticate, (req, res) => {
    const tasks = readJsonFile(tasksFilePath);
    const userTasks = tasks.filter(task => task.username === req.user.username);
    res.json(userTasks);
});

app.post('/todos', authenticate, (req, res) => {
    const { task } = req.body;
    const tasks = readJsonFile(tasksFilePath);
    const newTask = { id: Date.now(), task, username: req.user.username };
    tasks.push(newTask);
    writeJsonFile(tasksFilePath, tasks);

    res.json(newTask);
});

app.delete('/todos/:id', authenticate, (req, res) => {
    const tasks = readJsonFile(tasksFilePath);
    const taskId = parseInt(req.params.id);
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    writeJsonFile(tasksFilePath, updatedTasks);

    res.json({ message: 'Task deleted' });
});

app.delete('/users/delete', authenticate, (req, res) => {
    const users = readJsonFile(usersFilePath);
    const updatedUsers = users.filter(user => user.username !== req.user.username);
    writeJsonFile(usersFilePath, updatedUsers);

    const tasks = readJsonFile(tasksFilePath);
    const updatedTasks = tasks.filter(task => task.username !== req.user.username);
    writeJsonFile(tasksFilePath, updatedTasks);

    res.json({ success: true });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
