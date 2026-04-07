const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'moonfy-super-secret-key-change-in-production';

// ---------- Инициализация SQLite ----------
const db = new sqlite3.Database('./moonfy.db');

db.serialize(() => {
    // Пользователи
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        avatar TEXT,
        role TEXT DEFAULT 'user',
        verified INTEGER DEFAULT 0,
        banned INTEGER DEFAULT 0,
        settings TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    // Треки
    db.run(`CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        filename TEXT NOT NULL,
        cover TEXT,
        playCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Плейлисты
    db.run(`CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        cover TEXT,
        collaborators TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Треки в плейлистах
    db.run(`CREATE TABLE IF NOT EXISTS playlist_tracks (
        playlistId INTEGER NOT NULL,
        trackId INTEGER NOT NULL,
        addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (playlistId, trackId),
        FOREIGN KEY(playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY(trackId) REFERENCES tracks(id) ON DELETE CASCADE
    )`);

    // Лайки (универсальные: track, playlist, comment)
    db.run(`CREATE TABLE IF NOT EXISTS likes (
        userId INTEGER NOT NULL,
        targetType TEXT NOT NULL,
        targetId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (userId, targetType, targetId),
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Подписки
    db.run(`CREATE TABLE IF NOT EXISTS follows (
        followerId INTEGER NOT NULL,
        followedId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (followerId, followedId),
        FOREIGN KEY(followerId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(followedId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Комментарии
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        trackId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        text TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(trackId) REFERENCES tracks(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Реакции на комментарии (эмодзи)
    db.run(`CREATE TABLE IF NOT EXISTS reactions (
        commentId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        emoji TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (commentId, userId, emoji),
        FOREIGN KEY(commentId) REFERENCES comments(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // История прослушиваний
    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        trackId INTEGER NOT NULL,
        listenedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(trackId) REFERENCES tracks(id) ON DELETE CASCADE
    )`);

    // Уведомления
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        type TEXT,
        message TEXT NOT NULL,
        link TEXT,
        read INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Жалобы
    db.run(`CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        targetType TEXT NOT NULL,
        targetId INTEGER NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Создаём администратора по умолчанию, если его нет
    const adminUsername = 'rqwweeqrwee';
    const adminPassword = '79773150504Aa';
    db.get(`SELECT id FROM users WHERE username = ?`, [adminUsername], async (err, row) => {
        if (!row) {
            const hashed = await bcrypt.hash(adminPassword, 10);
            db.run(`INSERT INTO users (username, email, password, role, verified) VALUES (?, ?, ?, 'admin', 1)`,
                [adminUsername, 'admin@moonfy.local', hashed]);
            console.log('✅ Администратор создан');
        }
    });
});

// ---------- Настройки загрузки файлов ----------
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};
ensureDir('uploads');
ensureDir('avatars');
ensureDir('covers');
ensureDir('track_covers');
ensureDir('custom_bg');

const audioStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + unique + path.extname(file.originalname));
    }
});
const uploadAudio = multer({ storage: audioStorage, limits: { fileSize: 50 * 1024 * 1024 } });

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'avatars/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + unique + path.extname(file.originalname));
    }
});
const uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 5 * 1024 * 1024 } });

const coverStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'covers/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'cover-' + unique + path.extname(file.originalname));
    }
});
const uploadCover = multer({ storage: coverStorage, limits: { fileSize: 2 * 1024 * 1024 } });

const trackCoverStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'track_covers/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'track-cover-' + unique + path.extname(file.originalname));
    }
});
const uploadTrackCover = multer({ storage: trackCoverStorage, limits: { fileSize: 2 * 1024 * 1024 } });

const customBgStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'custom_bg/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'bg-' + unique + path.extname(file.originalname));
    }
});
const uploadCustomBg = multer({ storage: customBgStorage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/avatars', express.static('avatars'));
app.use('/covers', express.static('covers'));
app.use('/custom_bg', express.static('custom_bg'));
app.use('/track_covers', express.static('track_covers'));

// ---------- Middleware ----------
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Токен не предоставлен' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, SECRET);
        db.get(`SELECT banned FROM users WHERE id = ?`, [decoded.id], (err, user) => {
            if (err || !user) return res.status(401).json({ error: 'Пользователь не найден' });
            if (user.banned) return res.status(403).json({ error: 'Ваш аккаунт заблокирован' });
            req.user = decoded;
            next();
        });
    } catch (err) {
        return res.status(401).json({ error: 'Недействительный токен' });
    }
}

function isAdmin(req, res, next) {
    db.get(`SELECT role FROM users WHERE id = ?`, [req.user.id], (err, user) => {
        if (err || !user || user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
        next();
    });
}

// ---------- Вспомогательные функции ----------
const runQuery = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) { if (err) reject(err); else resolve(this); });
});
const getQuery = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) reject(err); else resolve(row); });
});
const allQuery = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { if (err) reject(err); else resolve(rows); });
});

// ---------- API ----------

// Регистрация
app.post('/api/register', uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username?.trim() || !email?.trim() || !password?.trim())
            return res.status(400).json({ error: 'Заполните все поля' });
        const existing = await getQuery(`SELECT id FROM users WHERE username = ? OR email = ?`, [username, email]);
        if (existing) return res.status(400).json({ error: 'Имя или email уже заняты' });
        const hashed = await bcrypt.hash(password, 10);
        const avatar = req.file ? req.file.filename : null;
        const result = await runQuery(
            `INSERT INTO users (username, email, password, avatar, role, verified) VALUES (?, ?, ?, ?, 'user', 0)`,
            [username.trim(), email.trim(), hashed, avatar]
        );
        const userId = result.lastID;
        // Создаём плейлист "Избранное"
        await runQuery(`INSERT INTO playlists (userId, name) VALUES (?, 'Избранное')`, [userId]);
        const token = jwt.sign({ id: userId, username: username.trim(), role: 'user' }, SECRET);
        res.json({ token, user: { id: userId, username: username.trim(), avatar, role: 'user', verified: 0 } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Логин
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await getQuery(`SELECT * FROM users WHERE username = ?`, [username]);
        if (!user) return res.status(401).json({ error: 'Неверное имя или пароль' });
        if (user.banned) return res.status(403).json({ error: 'Аккаунт заблокирован' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Неверное имя или пароль' });
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET);
        res.json({ token, user: { id: user.id, username: user.username, avatar: user.avatar, role: user.role, verified: user.verified } });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получить профиль пользователя
app.get('/api/users/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await getQuery(`SELECT id, username, avatar, role, verified, createdAt FROM users WHERE id = ?`, [id]);
        if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
        const followersCount = await getQuery(`SELECT COUNT(*) as count FROM follows WHERE followedId = ?`, [id]);
        const followingCount = await getQuery(`SELECT COUNT(*) as count FROM follows WHERE followerId = ?`, [id]);
        res.json({ ...user, followersCount: followersCount.count, followingCount: followingCount.count });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Поиск пользователей
app.get('/api/users', async (req, res) => {
    const { search } = req.query;
    if (!search) return res.json([]);
    const users = await allQuery(`SELECT id, username, avatar, role, verified FROM users WHERE username LIKE ? LIMIT 20`, [`%${search}%`]);
    res.json(users);
});

// Редактирование профиля
app.put('/api/users/:id', authenticate, uploadAvatar.single('avatar'), async (req, res) => {
    if (req.user.id != req.params.id) return res.status(403).json({ error: 'Нет доступа' });
    try {
        const { username, email, password, settings } = req.body;
        let updateFields = [];
        let params = [];
        if (username?.trim()) {
            const existing = await getQuery(`SELECT id FROM users WHERE username = ? AND id != ?`, [username.trim(), req.params.id]);
            if (existing) return res.status(400).json({ error: 'Имя уже занято' });
            updateFields.push('username = ?');
            params.push(username.trim());
        }
        if (email?.trim()) {
            const existing = await getQuery(`SELECT id FROM users WHERE email = ? AND id != ?`, [email.trim(), req.params.id]);
            if (existing) return res.status(400).json({ error: 'Email уже используется' });
            updateFields.push('email = ?');
            params.push(email.trim());
        }
        if (password?.trim()) {
            const hashed = await bcrypt.hash(password.trim(), 10);
            updateFields.push('password = ?');
            params.push(hashed);
        }
        if (req.file) {
            const oldAvatar = await getQuery(`SELECT avatar FROM users WHERE id = ?`, [req.params.id]);
            if (oldAvatar?.avatar) {
                const oldPath = path.join(__dirname, 'avatars', oldAvatar.avatar);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateFields.push('avatar = ?');
            params.push(req.file.filename);
        }
        if (settings) {
            updateFields.push('settings = ?');
            params.push(settings);
        }
        if (updateFields.length === 0) return res.json({ message: 'Нет изменений' });
        params.push(req.params.id);
        await runQuery(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, params);
        const updated = await getQuery(`SELECT id, username, email, avatar, role, verified, settings FROM users WHERE id = ?`, [req.params.id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка обновления' });
    }
});

// Получить все треки (с количеством лайков)
app.get('/api/tracks', async (req, res) => {
    try {
        const tracks = await allQuery(`
            SELECT t.*, u.username, u.verified,
                (SELECT COUNT(*) FROM likes WHERE targetType = 'track' AND targetId = t.id) as likes
            FROM tracks t
            LEFT JOIN users u ON t.userId = u.id
            ORDER BY t.createdAt DESC
        `);
        res.json(tracks);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка загрузки треков' });
    }
});

// Загрузить трек
app.post('/api/tracks', authenticate, uploadAudio.single('audio'), uploadTrackCover.single('cover'), async (req, res) => {
    try {
        const { title, artist } = req.body;
        if (!req.file) return res.status(400).json({ error: 'Аудиофайл не загружен' });
        if (!title?.trim() || !artist?.trim()) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'Заполните название и исполнителя' });
        }
        const cover = req.fileCover ? req.fileCover.filename : null; // поле 'cover' из формы
        const result = await runQuery(
            `INSERT INTO tracks (userId, title, artist, filename, cover) VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, title.trim(), artist.trim(), req.file.filename, cover]
        );
        res.json({ id: result.lastID, title, artist, filename: req.file.filename, cover });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка загрузки трека' });
    }
});

// Обновить трек
app.put('/api/tracks/:id', authenticate, uploadTrackCover.single('cover'), async (req, res) => {
    try {
        const id = req.params.id;
        const track = await getQuery(`SELECT userId FROM tracks WHERE id = ?`, [id]);
        if (!track) return res.status(404).json({ error: 'Трек не найден' });
        const user = await getQuery(`SELECT role FROM users WHERE id = ?`, [req.user.id]);
        if (track.userId !== req.user.id && user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
        const { title, artist } = req.body;
        let updateFields = [];
        let params = [];
        if (title?.trim()) { updateFields.push('title = ?'); params.push(title.trim()); }
        if (artist?.trim()) { updateFields.push('artist = ?'); params.push(artist.trim()); }
        if (req.file) {
            const oldCover = await getQuery(`SELECT cover FROM tracks WHERE id = ?`, [id]);
            if (oldCover?.cover) {
                const oldPath = path.join(__dirname, 'track_covers', oldCover.cover);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateFields.push('cover = ?');
            params.push(req.file.filename);
        }
        if (updateFields.length === 0) return res.json({ message: 'Нет изменений' });
        params.push(id);
        await runQuery(`UPDATE tracks SET ${updateFields.join(', ')} WHERE id = ?`, params);
        const updated = await getQuery(`SELECT * FROM tracks WHERE id = ?`, [id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка обновления' });
    }
});

// Удалить трек
app.delete('/api/tracks/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const track = await getQuery(`SELECT userId, filename, cover FROM tracks WHERE id = ?`, [id]);
        if (!track) return res.status(404).json({ error: 'Трек не найден' });
        const user = await getQuery(`SELECT role FROM users WHERE id = ?`, [req.user.id]);
        if (track.userId !== req.user.id && user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
        // Удаляем файлы
        const audioPath = path.join(__dirname, 'uploads', track.filename);
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
        if (track.cover) {
            const coverPath = path.join(__dirname, 'track_covers', track.cover);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }
        await runQuery(`DELETE FROM tracks WHERE id = ?`, [id]);
        // Удаляем связанные записи (каскадное удаление в БД настроено, но для чистоты)
        await runQuery(`DELETE FROM playlist_tracks WHERE trackId = ?`, [id]);
        await runQuery(`DELETE FROM history WHERE trackId = ?`, [id]);
        await runQuery(`DELETE FROM comments WHERE trackId = ?`, [id]);
        await runQuery(`DELETE FROM likes WHERE targetType = 'track' AND targetId = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

// Стриминг аудио
app.get('/api/stream/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const track = await getQuery(`SELECT filename FROM tracks WHERE id = ?`, [id]);
        if (!track) return res.status(404).json({ error: 'Трек не найден' });
        const filePath = path.join(__dirname, 'uploads', track.filename);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Файл не найден' });
        res.sendFile(filePath);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка стриминга' });
    }
});

// Лайк / дизлайк
app.post('/api/like', authenticate, async (req, res) => {
    try {
        const { targetType, targetId } = req.body;
        const userId = req.user.id;
        const existing = await getQuery(`SELECT 1 FROM likes WHERE userId = ? AND targetType = ? AND targetId = ?`, [userId, targetType, targetId]);
        if (existing) {
            await runQuery(`DELETE FROM likes WHERE userId = ? AND targetType = ? AND targetId = ?`, [userId, targetType, targetId]);
            const count = await getQuery(`SELECT COUNT(*) as count FROM likes WHERE targetType = ? AND targetId = ?`, [targetType, targetId]);
            res.json({ liked: false, count: count.count });
        } else {
            await runQuery(`INSERT INTO likes (userId, targetType, targetId) VALUES (?, ?, ?)`, [userId, targetType, targetId]);
            const count = await getQuery(`SELECT COUNT(*) as count FROM likes WHERE targetType = ? AND targetId = ?`, [targetType, targetId]);
            res.json({ liked: true, count: count.count });
        }
    } catch (err) {
        res.status(500).json({ error: 'Ошибка лайка' });
    }
});

// Проверить лайк
app.get('/api/like/:targetType/:targetId', authenticate, async (req, res) => {
    try {
        const { targetType, targetId } = req.params;
        const userId = req.user.id;
        const liked = await getQuery(`SELECT 1 FROM likes WHERE userId = ? AND targetType = ? AND targetId = ?`, [userId, targetType, targetId]);
        const count = await getQuery(`SELECT COUNT(*) as count FROM likes WHERE targetType = ? AND targetId = ?`, [targetType, targetId]);
        res.json({ liked: !!liked, count: count.count });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Получить комментарии трека
app.get('/api/tracks/:id/comments', async (req, res) => {
    try {
        const trackId = req.params.id;
        const comments = await allQuery(`
            SELECT c.*, u.username, u.avatar, u.verified
            FROM comments c
            LEFT JOIN users u ON c.userId = u.id
            WHERE c.trackId = ?
            ORDER BY c.createdAt DESC
        `, [trackId]);
        res.json(comments);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка загрузки комментариев' });
    }
});

// Добавить комментарий
app.post('/api/tracks/:id/comments', authenticate, async (req, res) => {
    try {
        const trackId = req.params.id;
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ error: 'Текст не может быть пустым' });
        const result = await runQuery(`INSERT INTO comments (trackId, userId, text) VALUES (?, ?, ?)`, [trackId, req.user.id, text.trim()]);
        const newComment = await getQuery(`
            SELECT c.*, u.username, u.avatar, u.verified
            FROM comments c
            LEFT JOIN users u ON c.userId = u.id
            WHERE c.id = ?
        `, [result.lastID]);
        res.json(newComment);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка добавления комментария' });
    }
});

// Удалить комментарий
app.delete('/api/comments/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const comment = await getQuery(`SELECT userId FROM comments WHERE id = ?`, [id]);
        if (!comment) return res.status(404).json({ error: 'Комментарий не найден' });
        const user = await getQuery(`SELECT role FROM users WHERE id = ?`, [req.user.id]);
        if (comment.userId !== req.user.id && user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
        await runQuery(`DELETE FROM comments WHERE id = ?`, [id]);
        await runQuery(`DELETE FROM reactions WHERE commentId = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

// Реакции на комментарии
app.post('/api/reactions', authenticate, async (req, res) => {
    try {
        const { commentId, emoji } = req.body;
        const userId = req.user.id;
        const existing = await getQuery(`SELECT 1 FROM reactions WHERE commentId = ? AND userId = ? AND emoji = ?`, [commentId, userId, emoji]);
        if (existing) {
            await runQuery(`DELETE FROM reactions WHERE commentId = ? AND userId = ? AND emoji = ?`, [commentId, userId, emoji]);
        } else {
            await runQuery(`INSERT INTO reactions (commentId, userId, emoji) VALUES (?, ?, ?)`, [commentId, userId, emoji]);
        }
        const reactions = await allQuery(`SELECT emoji, COUNT(*) as count FROM reactions WHERE commentId = ? GROUP BY emoji`, [commentId]);
        const result = {};
        reactions.forEach(r => { result[r.emoji] = r.count; });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка реакции' });
    }
});

app.get('/api/reactions/:commentId', async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const reactions = await allQuery(`SELECT emoji, COUNT(*) as count FROM reactions WHERE commentId = ? GROUP BY emoji`, [commentId]);
        const result = {};
        reactions.forEach(r => { result[r.emoji] = r.count; });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Подписки
app.post('/api/users/:id/follow', authenticate, async (req, res) => {
    try {
        const followedId = req.params.id;
        const followerId = req.user.id;
        if (followerId == followedId) return res.status(400).json({ error: 'Нельзя подписаться на себя' });
        const existing = await getQuery(`SELECT 1 FROM follows WHERE followerId = ? AND followedId = ?`, [followerId, followedId]);
        if (!existing) {
            await runQuery(`INSERT INTO follows (followerId, followedId) VALUES (?, ?)`, [followerId, followedId]);
            const follower = await getQuery(`SELECT username FROM users WHERE id = ?`, [followerId]);
            await runQuery(`INSERT INTO notifications (userId, type, message, link) VALUES (?, 'new_follower', ?, ?)`,
                [followedId, `Пользователь ${follower.username} подписался на вас`, `/user/${followerId}`]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка подписки' });
    }
});

app.delete('/api/users/:id/follow', authenticate, async (req, res) => {
    try {
        const followedId = req.params.id;
        const followerId = req.user.id;
        await runQuery(`DELETE FROM follows WHERE followerId = ? AND followedId = ?`, [followerId, followedId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка отписки' });
    }
});

app.get('/api/users/:id/followers', async (req, res) => {
    try {
        const userId = req.params.id;
        const followers = await allQuery(`
            SELECT u.id, u.username, u.avatar, u.verified
            FROM follows f
            LEFT JOIN users u ON f.followerId = u.id
            WHERE f.followedId = ?
        `, [userId]);
        res.json(followers);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/users/:id/following', async (req, res) => {
    try {
        const userId = req.params.id;
        const following = await allQuery(`
            SELECT u.id, u.username, u.avatar, u.verified
            FROM follows f
            LEFT JOIN users u ON f.followedId = u.id
            WHERE f.followerId = ?
        `, [userId]);
        res.json(following);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// История прослушиваний
app.post('/api/history', authenticate, async (req, res) => {
    try {
        const { trackId } = req.body;
        const userId = req.user.id;
        // Удаляем старую запись этого трека, чтобы сдвинуть в начало
        await runQuery(`DELETE FROM history WHERE userId = ? AND trackId = ?`, [userId, trackId]);
        await runQuery(`INSERT INTO history (userId, trackId) VALUES (?, ?)`, [userId, trackId]);
        // Увеличиваем счётчик прослушиваний трека
        await runQuery(`UPDATE tracks SET playCount = playCount + 1 WHERE id = ?`, [trackId]);
        // Оставляем только последние 50 записей в истории
        const count = await getQuery(`SELECT COUNT(*) as cnt FROM history WHERE userId = ?`, [userId]);
        if (count.cnt > 50) {
            await runQuery(`DELETE FROM history WHERE userId = ? AND id NOT IN (SELECT id FROM history WHERE userId = ? ORDER BY listenedAt DESC LIMIT 50)`, [userId, userId]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка истории' });
    }
});

app.get('/api/history', authenticate, async (req, res) => {
    try {
        const history = await allQuery(`
            SELECT h.*, t.title, t.artist, t.cover, t.userId as trackUserId, u.username as trackUsername
            FROM history h
            LEFT JOIN tracks t ON h.trackId = t.id
            LEFT JOIN users u ON t.userId = u.id
            WHERE h.userId = ?
            ORDER BY h.listenedAt DESC
        `, [req.user.id]);
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Плейлисты
app.post('/api/playlists', authenticate, uploadCover.single('cover'), async (req, res) => {
    try {
        const { name, collaborators } = req.body;
        if (!name?.trim()) return res.status(400).json({ error: 'Введите название' });
        const cover = req.file ? req.file.filename : null;
        const collab = collaborators ? JSON.stringify(JSON.parse(collaborators)) : '[]';
        const result = await runQuery(
            `INSERT INTO playlists (userId, name, cover, collaborators) VALUES (?, ?, ?, ?)`,
            [req.user.id, name.trim(), cover, collab]
        );
        const newPlaylist = await getQuery(`SELECT * FROM playlists WHERE id = ?`, [result.lastID]);
        res.json(newPlaylist);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка создания плейлиста' });
    }
});

app.put('/api/playlists/:id', authenticate, uploadCover.single('cover'), async (req, res) => {
    try {
        const id = req.params.id;
        const playlist = await getQuery(`SELECT userId, collaborators FROM playlists WHERE id = ?`, [id]);
        if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });
        const user = await getQuery(`SELECT role FROM users WHERE id = ?`, [req.user.id]);
        const collabArray = playlist.collaborators ? JSON.parse(playlist.collaborators) : [];
        if (playlist.userId !== req.user.id && !collabArray.includes(req.user.id) && user.role !== 'admin')
            return res.status(403).json({ error: 'Нет доступа' });
        const { name, collaborators } = req.body;
        let updateFields = [];
        let params = [];
        if (name?.trim()) { updateFields.push('name = ?'); params.push(name.trim()); }
        if (collaborators) { updateFields.push('collaborators = ?'); params.push(JSON.stringify(JSON.parse(collaborators))); }
        if (req.file) {
            if (playlist.cover) {
                const oldPath = path.join(__dirname, 'covers', playlist.cover);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateFields.push('cover = ?');
            params.push(req.file.filename);
        }
        if (updateFields.length === 0) return res.json({ message: 'Нет изменений' });
        params.push(id);
        await runQuery(`UPDATE playlists SET ${updateFields.join(', ')} WHERE id = ?`, params);
        const updated = await getQuery(`SELECT * FROM playlists WHERE id = ?`, [id]);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка обновления' });
    }
});

app.delete('/api/playlists/:id', authenticate, async (req, res) => {
    try {
        const id = req.params.id;
        const playlist = await getQuery(`SELECT userId, cover FROM playlists WHERE id = ?`, [id]);
        if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });
        const user = await getQuery(`SELECT role FROM users WHERE id = ?`, [req.user.id]);
        if (playlist.userId !== req.user.id && user.role !== 'admin') return res.status(403).json({ error: 'Нет доступа' });
        if (playlist.cover) {
            const coverPath = path.join(__dirname, 'covers', playlist.cover);
            if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
        }
        await runQuery(`DELETE FROM playlists WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

app.get('/api/users/:id/playlists', async (req, res) => {
    try {
        const userId = req.params.id;
        const playlists = await allQuery(`
            SELECT * FROM playlists
            WHERE userId = ? OR json_extract(collaborators, '$') LIKE ?
        `, [userId, `%${userId}%`]);
        res.json(playlists);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/playlists/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const playlist = await getQuery(`SELECT * FROM playlists WHERE id = ?`, [id]);
        if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });
        const tracks = await allQuery(`
            SELECT t.*, u.username, u.verified
            FROM playlist_tracks pt
            LEFT JOIN tracks t ON pt.trackId = t.id
            LEFT JOIN users u ON t.userId = u.id
            WHERE pt.playlistId = ?
        `, [id]);
        res.json({ ...playlist, tracks });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.post('/api/playlists/:id/tracks', authenticate, async (req, res) => {
    try {
        const playlistId = req.params.id;
        const { trackId } = req.body;
        const playlist = await getQuery(`SELECT userId, collaborators FROM playlists WHERE id = ?`, [playlistId]);
        if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });
        const user = await getQuery(`SELECT role FROM users WHERE id = ?`, [req.user.id]);
        const collabArray = playlist.collaborators ? JSON.parse(playlist.collaborators) : [];
        if (playlist.userId !== req.user.id && !collabArray.includes(req.user.id) && user.role !== 'admin')
            return res.status(403).json({ error: 'Нет доступа' });
        const exists = await getQuery(`SELECT 1 FROM playlist_tracks WHERE playlistId = ? AND trackId = ?`, [playlistId, trackId]);
        if (!exists) {
            await runQuery(`INSERT INTO playlist_tracks (playlistId, trackId) VALUES (?, ?)`, [playlistId, trackId]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка добавления' });
    }
});

app.delete('/api/playlists/:id/tracks/:trackId', authenticate, async (req, res) => {
    try {
        const playlistId = req.params.id;
        const trackId = req.params.trackId;
        const playlist = await getQuery(`SELECT userId, collaborators FROM playlists WHERE id = ?`, [playlistId]);
        if (!playlist) return res.status(404).json({ error: 'Плейлист не найден' });
        const user = await getQuery(`SELECT role FROM users WHERE id = ?`, [req.user.id]);
        const collabArray = playlist.collaborators ? JSON.parse(playlist.collaborators) : [];
        if (playlist.userId !== req.user.id && !collabArray.includes(req.user.id) && user.role !== 'admin')
            return res.status(403).json({ error: 'Нет доступа' });
        await runQuery(`DELETE FROM playlist_tracks WHERE playlistId = ? AND trackId = ?`, [playlistId, trackId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления' });
    }
});

// Подписка на плейлист (не обязательно, но фронт просит)
app.post('/api/playlists/:id/subscribe', authenticate, async (req, res) => {
    // Для простоты не реализуем, но можно добавить таблицу подписок на плейлисты. Пока заглушка.
    res.json({ success: true });
});
app.delete('/api/playlists/:id/subscribe', authenticate, (req, res) => res.json({ success: true }));

// Избранное (как специальный плейлист)
app.get('/api/users/:id/favorites', async (req, res) => {
    try {
        const userId = req.params.id;
        const favPlaylist = await getQuery(`SELECT * FROM playlists WHERE userId = ? AND name = 'Избранное'`, [userId]);
        if (!favPlaylist) return res.status(404).json({ error: 'Избранное не найдено' });
        const tracks = await allQuery(`
            SELECT t.*, u.username, u.verified
            FROM playlist_tracks pt
            LEFT JOIN tracks t ON pt.trackId = t.id
            LEFT JOIN users u ON t.userId = u.id
            WHERE pt.playlistId = ?
        `, [favPlaylist.id]);
        res.json({ ...favPlaylist, tracks });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.post('/api/users/:id/favorites', authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        if (userId != req.user.id) return res.status(403).json({ error: 'Нет доступа' });
        const { trackId } = req.body;
        const favPlaylist = await getQuery(`SELECT id FROM playlists WHERE userId = ? AND name = 'Избранное'`, [userId]);
        if (!favPlaylist) return res.status(404).json({ error: 'Избранное не найдено' });
        const exists = await getQuery(`SELECT 1 FROM playlist_tracks WHERE playlistId = ? AND trackId = ?`, [favPlaylist.id, trackId]);
        if (!exists) {
            await runQuery(`INSERT INTO playlist_tracks (playlistId, trackId) VALUES (?, ?)`, [favPlaylist.id, trackId]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.delete('/api/users/:id/favorites/:trackId', authenticate, async (req, res) => {
    try {
        const userId = req.params.id;
        if (userId != req.user.id) return res.status(403).json({ error: 'Нет доступа' });
        const trackId = req.params.trackId;
        const favPlaylist = await getQuery(`SELECT id FROM playlists WHERE userId = ? AND name = 'Избранное'`, [userId]);
        if (!favPlaylist) return res.status(404).json({ error: 'Избранное не найдено' });
        await runQuery(`DELETE FROM playlist_tracks WHERE playlistId = ? AND trackId = ?`, [favPlaylist.id, trackId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Рекомендации
app.get('/api/recommendations', authenticate, async (req, res) => {
    try {
        const recs = await allQuery(`SELECT t.*, u.username, u.verified,
            (SELECT COUNT(*) FROM likes WHERE targetType = 'track' AND targetId = t.id) as likes
            FROM tracks t
            LEFT JOIN users u ON t.userId = u.id
            ORDER BY t.playCount DESC
            LIMIT 20`);
        res.json(recs);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Загрузка/удаление фона
app.post('/api/user/bg', authenticate, uploadCustomBg.single('bg'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
        const user = await getQuery(`SELECT settings FROM users WHERE id = ?`, [req.user.id]);
        let settings = user.settings ? JSON.parse(user.settings) : {};
        if (settings.customBg) {
            const oldPath = path.join(__dirname, 'custom_bg', settings.customBg);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        settings.customBg = req.file.filename;
        await runQuery(`UPDATE users SET settings = ? WHERE id = ?`, [JSON.stringify(settings), req.user.id]);
        res.json({ filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.delete('/api/user/bg', authenticate, async (req, res) => {
    try {
        const user = await getQuery(`SELECT settings FROM users WHERE id = ?`, [req.user.id]);
        let settings = user.settings ? JSON.parse(user.settings) : {};
        if (settings.customBg) {
            const bgPath = path.join(__dirname, 'custom_bg', settings.customBg);
            if (fs.existsSync(bgPath)) fs.unlinkSync(bgPath);
            delete settings.customBg;
            await runQuery(`UPDATE users SET settings = ? WHERE id = ?`, [JSON.stringify(settings), req.user.id]);
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Уведомления
app.get('/api/notifications', authenticate, async (req, res) => {
    try {
        const notifs = await allQuery(`SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC`, [req.user.id]);
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.put('/api/notifications/:id/read', authenticate, async (req, res) => {
    try {
        await runQuery(`UPDATE notifications SET read = 1 WHERE id = ? AND userId = ?`, [req.params.id, req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.put('/api/notifications/read-all', authenticate, async (req, res) => {
    try {
        await runQuery(`UPDATE notifications SET read = 1 WHERE userId = ?`, [req.user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Жалобы
app.post('/api/complaints', authenticate, async (req, res) => {
    try {
        const { targetType, targetId, reason } = req.body;
        if (!targetType || !targetId || !reason) return res.status(400).json({ error: 'Заполните все поля' });
        await runQuery(`INSERT INTO complaints (userId, targetType, targetId, reason) VALUES (?, ?, ?, ?)`,
            [req.user.id, targetType, targetId, reason]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.get('/api/admin/complaints', authenticate, isAdmin, async (req, res) => {
    try {
        const complaintsList = await allQuery(`
            SELECT c.*, u.username as complainantName
            FROM complaints c
            LEFT JOIN users u ON c.userId = u.id
            WHERE c.status = 'pending'
            ORDER BY c.createdAt DESC
        `);
        res.json(complaintsList);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.put('/api/admin/complaints/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        await runQuery(`UPDATE complaints SET status = ? WHERE id = ?`, [status, id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Админ: пользователи
app.get('/api/admin/users', authenticate, isAdmin, async (req, res) => {
    try {
        const usersList = await allQuery(`SELECT id, username, email, avatar, role, verified, banned, createdAt FROM users`);
        res.json(usersList);
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.put('/api/admin/users/:id/role', authenticate, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'artist', 'admin'].includes(role)) return res.status(400).json({ error: 'Недопустимая роль' });
        await runQuery(`UPDATE users SET role = ? WHERE id = ?`, [role, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.put('/api/admin/users/:id/verify', authenticate, isAdmin, async (req, res) => {
    try {
        const { verified } = req.body;
        await runQuery(`UPDATE users SET verified = ? WHERE id = ?`, [verified ? 1 : 0, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.put('/api/admin/users/:id/ban', authenticate, isAdmin, async (req, res) => {
    try {
        const { banned } = req.body;
        await runQuery(`UPDATE users SET banned = ? WHERE id = ?`, [banned ? 1 : 0, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

app.delete('/api/admin/users/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        // Удаляем аватар и кастомный фон пользователя
        const user = await getQuery(`SELECT avatar, settings FROM users WHERE id = ?`, [userId]);
        if (user?.avatar) {
            const avatarPath = path.join(__dirname, 'avatars', user.avatar);
            if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
        }
        if (user?.settings) {
            const settings = JSON.parse(user.settings);
            if (settings.customBg) {
                const bgPath = path.join(__dirname, 'custom_bg', settings.customBg);
                if (fs.existsSync(bgPath)) fs.unlinkSync(bgPath);
            }
        }
        // Удаляем треки пользователя и их файлы
        const userTracks = await allQuery(`SELECT filename, cover FROM tracks WHERE userId = ?`, [userId]);
        for (const track of userTracks) {
            const audioPath = path.join(__dirname, 'uploads', track.filename);
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
            if (track.cover) {
                const coverPath = path.join(__dirname, 'track_covers', track.cover);
                if (fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
            }
        }
        // Каскадное удаление через внешние ключи, но для файлов уже сделали
        await runQuery(`DELETE FROM users WHERE id = ?`, [userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка удаления пользователя' });
    }
});

// Статистика для админа
app.get('/api/admin/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const totalUsers = await getQuery(`SELECT COUNT(*) as count FROM users`);
        const totalTracks = await getQuery(`SELECT COUNT(*) as count FROM tracks`);
        const totalPlaylists = await getQuery(`SELECT COUNT(*) as count FROM playlists`);
        const totalComments = await getQuery(`SELECT COUNT(*) as count FROM comments`);
        const totalFollows = await getQuery(`SELECT COUNT(*) as count FROM follows`);
        const totalHistory = await getQuery(`SELECT COUNT(*) as count FROM history`);
        const totalLikes = await getQuery(`SELECT COUNT(*) as count FROM likes`);
        const totalComplaints = await getQuery(`SELECT COUNT(*) as count FROM complaints`);
        res.json({
            totalUsers: totalUsers.count,
            totalTracks: totalTracks.count,
            totalPlaylists: totalPlaylists.count,
            totalComments: totalComments.count,
            totalFollows: totalFollows.count,
            totalHistory: totalHistory.count,
            totalLikes: totalLikes.count,
            totalComplaints: totalComplaints.count
        });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Аналитика
app.get('/api/admin/analytics', authenticate, isAdmin, async (req, res) => {
    try {
        const userGrowth = await allQuery(`
            SELECT date(createdAt) as date, COUNT(*) as count
            FROM users
            WHERE createdAt >= datetime('now', '-30 days')
            GROUP BY date(createdAt)
            ORDER BY date
        `);
        const popularTracks = await allQuery(`
            SELECT t.id, t.title, t.artist, t.playCount, u.username
            FROM tracks t
            LEFT JOIN users u ON t.userId = u.id
            ORDER BY t.playCount DESC
            LIMIT 10
        `);
        const topArtists = await allQuery(`
            SELECT artist, SUM(playCount) as plays
            FROM tracks
            GROUP BY artist
            ORDER BY plays DESC
            LIMIT 10
        `);
        const totalUsers = await getQuery(`SELECT COUNT(*) as count FROM users`);
        const totalTracks = await getQuery(`SELECT COUNT(*) as count FROM tracks`);
        const totalPlays = await getQuery(`SELECT COUNT(*) as count FROM history`);
        res.json({
            userGrowth,
            popularTracks,
            topArtists,
            totalUsers: totalUsers.count,
            totalTracks: totalTracks.count,
            totalPlays: totalPlays.count
        });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🌙 Moonfy сервер запущен на http://localhost:${PORT}`);
    console.log(`🔑 Админ: rqwweeqrwee / 79773150504Aa`);
});