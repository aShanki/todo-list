const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

const JWT_SECRET = 'your-secret-key';

app.use(bodyParser.json());


const usersFilePath = path.join(__dirname, 'db', 'users.json');
const tasksFilePath = path.join(__dirname, 'db', 'tasks.json');

const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath);
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeJsonFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

if (!fs.existsSync(path.join(__dirname, 'db'))) {
    fs.mkdirSync(path.join(__dirname, 'db'));
}

if (!fs.existsSync(usersFilePath)) {
    writeJsonFile(usersFilePath, []);
}

if (!fs.existsSync(tasksFilePath)) {
    writeJsonFile(tasksFilePath, []);
}

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const users = readJsonFile(usersFilePath);

    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ id: userId, username, password: hashedPassword });
    writeJsonFile(usersFilePath, users);

    res.json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readJsonFile(usersFilePath);

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = decoded;
        next();
    });
};

app.get('/todos', authenticate, (req, res) => {
    const tasks = readJsonFile(tasksFilePath);
    res.json(userTasks);
});

app.post('/todos', authenticate, (req, res) => {
    const { task } = req.body;
    const tasks = readJsonFile(tasksFilePath);
    writeJsonFile(tasksFilePath, tasks);
    res.status(201).json({ message: 'Task added' });
});

app.delete('/todos/:id', authenticate, (req, res) => {
    const tasks = readJsonFile(tasksFilePath);
    const filteredTasks = tasks.filter(task => task.id !== parseInt(req.params.id, 10) || task.userId !== req.user.id);
    writeJsonFile(tasksFilePath, filteredTasks);
    res.json({ message: 'Task deleted' });
});

app.delete('/users/delete', authenticate, (req, res) => {
    const { username } = req.body;
    const users = readJsonFile(usersFilePath);
    const filteredUsers = users.filter(user => user.username !== username);
    writeJsonFile(usersFilePath, filteredUsers);

    const tasks = readJsonFile(tasksFilePath);
    const filteredTasks = tasks.filter(task => task.userId !== req.user.id);
    writeJsonFile(tasksFilePath, filteredTasks);

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
