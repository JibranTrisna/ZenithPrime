const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const expressLayouts = require('express-ejs-layouts');
const http = require('http');
const { Server } = require("socket.io");
const cron = require('node-cron');
const helmet = require('helmet');
const hpp = require('hpp');

dotenv.config();

const db = require('./src/config/database');
const { globalLimiter, sqlInjectionDetector } = require('./src/middlewares/securityMiddleware');
const aiChatbotService = require('./src/services/aiChatbotService');

// Pastikan tabel cs_tickets selalu terinisialisasi
(async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS cs_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                room_id VARCHAR(50) NOT NULL UNIQUE,
                user_id INT NOT NULL,
                category VARCHAR(50) DEFAULT 'GENERAL_QUERY',
                urgency ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'low',
                status ENUM('needs_followup', 'in_progress', 'resolved', 'ai_handled') DEFAULT 'ai_handled',
                summary VARCHAR(255) DEFAULT 'Chatbot Conversation',
                order_id VARCHAR(100) NULL,
                last_user_message TEXT NULL,
                last_ai_message TEXT NULL,
                is_complaint TINYINT(1) DEFAULT 0,
                is_ai_paused TINYINT(1) DEFAULT 0,
                handled_by INT NULL,
                notes TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_status (status),
                INDEX idx_is_complaint (is_complaint),
                INDEX idx_urgency (urgency)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
    } catch (e) {
        console.error('Failed to verify cs_tickets table:', e);
    }
})();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 1e5 // 100KB: cegah DoS via payload socket raksasa
});
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
    console.warn('⚠️ SESSION_SECRET belum diset di .env — menggunakan secret default (TIDAK AMAN untuk production).');
}

// Sembunyikan header "X-Powered-By: Express"
app.disable('x-powered-by');

// Aktifkan HANYA jika aplikasi berada di belakang reverse proxy (Nginx/Cloudflare).
// Tanpa proxy, mempercayai X-Forwarded-For memungkinkan penyerang memalsukan IP untuk melewati rate limiter.
if (process.env.TRUST_PROXY) {
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);
}

// ==========================================
// 🛡️ 1. HELMET: SECURITY HEADERS & CONTENT SECURITY POLICY
// ==========================================
const MIDTRANS_DOMAINS = ['https://*.midtrans.com', 'https://*.veritrans.co.id'];

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Diperlukan oleh script inline di view EJS
                "'unsafe-eval'",   // Diperlukan oleh Tailwind Play CDN
                "https://cdn.tailwindcss.com",
                "https://cdn.jsdelivr.net",
                ...MIDTRANS_DOMAINS
            ],
            scriptSrcAttr: ["'unsafe-inline'"], // Mengizinkan atribut onclick/onsubmit yang dipakai di view
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            mediaSrc: ["'self'", "data:", "blob:", "https://cdn.freesound.org"],
            connectSrc: ["'self'", "ws:", "wss:", "https://cdn.jsdelivr.net", ...MIDTRANS_DOMAINS],
            frameSrc: ["'self'", ...MIDTRANS_DOMAINS],
            formAction: ["'self'", ...MIDTRANS_DOMAINS],
            objectSrc: ["'none'"],
            frameAncestors: ["'self'"], // Anti-Clickjacking
            // Jangan paksa HTTPS saat development di http://localhost
            upgradeInsecureRequests: isProduction ? [] : null
        }
    },
    crossOriginEmbedderPolicy: false,
    hsts: isProduction // HSTS hanya aktif di production (HTTPS)
}));

// ==========================================
// 📂 2. STATIC ASSETS (sebelum rate limiter agar gambar/video tidak menghabiskan kuota)
// ==========================================
app.use(express.static(path.join(__dirname, 'public'), {
    dotfiles: 'deny',
    maxAge: isProduction ? '7d' : 0
}));

// ==========================================
// 🛡️ 3. ANTI-DDOS, PAYLOAD LIMIT, HPP, SQLi SHIELD
// ==========================================
app.use(globalLimiter);

// Batasi ukuran body untuk mencegah DoS via payload besar
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(express.json({ limit: '50kb' }));

// Cegah HTTP Parameter Pollution (?status=a&status=b)
app.use(hpp());

// Blokir pola SQL Injection yang jelas berbahaya
app.use(sqlInjectionDetector);

// ==========================================
// 🎨 TEMPLATING
// ==========================================
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ==========================================
// 🔒 4. SESSION HARDENING
// ==========================================
const sessionMiddleware = session({
    name: 'zp_sid', // Bukan "connect.sid" default → mempersulit fingerprinting
    secret: process.env.SESSION_SECRET || 'rahasia_dapur_zenith_prime',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,       // Cookie tidak bisa dibaca JavaScript (anti pencurian sesi via XSS)
        secure: isProduction, // Hanya dikirim via HTTPS di production
        sameSite: 'lax',      // Mitigasi CSRF
        maxAge: 1000 * 60 * 60 * 24 // 24 jam
    }
});
app.use(sessionMiddleware);

app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.active = res.locals.active || '';
    next();
});

// ==========================================
// 💬 5. REAL-TIME CHAT (SOCKET.IO) — TERAUTENTIKASI
// ==========================================
// Bagikan sesi Express ke Socket.io agar identitas user diambil dari server, bukan dari client
io.engine.use(sessionMiddleware);

const USER_ROOM_PATTERN = /^user_\d+$/;
const MAX_MESSAGE_LENGTH = 1000;
const MESSAGE_WINDOW_MS = 5000;
const MAX_MESSAGES_PER_WINDOW = 5;

io.on('connection', (socket) => {
    const user = socket.request.session && socket.request.session.user;

    // Tolak koneksi tanpa login
    if (!user) {
        socket.disconnect(true);
        return;
    }

    const isStaff = user.role === 'staff' || user.role === 'admin';
    const ownRoom = `user_${user.id}`;
    let messageTimestamps = [];

    // User hanya boleh join ke room miliknya sendiri (parameter dari client diabaikan)
    socket.on('join_chat', () => {
        socket.join(ownRoom);
    });

    // Hanya staff/admin yang boleh masuk ke staff_room
    const joinStaff = () => {
        if (!isStaff) return;
        socket.join('staff_room');
    };
    socket.on('staff_join', joinStaff);
    socket.on('join_staff_room', joinStaff);

    // ==========================================
    // ⚡ STAFF LIVE CS CONTROL EVENTS
    // ==========================================
    // 1. Staff Mengambil Alih Percakapan (Human Takeover - Stop AI)
    socket.on('ticket_takeover', async (payload) => {
        if (!isStaff) return;
        const roomId = payload && payload.room_id;
        if (!roomId || !USER_ROOM_PATTERN.test(roomId)) return;

        try {
            await db.query(`
                UPDATE cs_tickets SET 
                    is_ai_paused = 1,
                    status = 'in_progress',
                    handled_by = ?,
                    updated_at = NOW()
                WHERE room_id = ?
            `, [user.id, roomId]);

            const sysMsg = '👨‍💼 CS Staff Zenith telah terhubung ke percakapan ini. Kami siap membantu kendala Anda secara langsung.';
            await db.query(
                'INSERT INTO chat_messages (sender_id, room_id, message, is_staff_reply, is_ai) VALUES (?, ?, ?, 1, 0)',
                [user.id, roomId, sysMsg]
            );

            io.to(roomId).emit('receive_message', {
                sender_id: user.id,
                room_id: roomId,
                message: sysMsg,
                is_staff: true,
                is_ai: false
            });

            const [tickets] = await db.query(`
                SELECT t.*, u.name as user_name, u.email as user_email, h.name as handler_name
                FROM cs_tickets t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN users h ON t.handled_by = h.id
                WHERE t.room_id = ?
            `, [roomId]);

            io.to('staff_room').emit('ticket_updated', {
                room_id: roomId,
                ticket: tickets[0] || null,
                action: 'takeover',
                actor_name: user.name
            });
        } catch (err) {
            console.error('Takeover Error:', err);
        }
    });

    // 2. Staff Mengembalikan Percakapan ke AI Assistant
    socket.on('ticket_handover_ai', async (payload) => {
        if (!isStaff) return;
        const roomId = payload && payload.room_id;
        if (!roomId || !USER_ROOM_PATTERN.test(roomId)) return;

        try {
            await db.query(`
                UPDATE cs_tickets SET 
                    is_ai_paused = 0,
                    status = 'ai_handled',
                    updated_at = NOW()
                WHERE room_id = ?
            `, [roomId]);

            const sysMsg = '🤖 Sesi telah dikembalikan ke Zenith AI Assistant 24/7. Ketik pertanyaan Anda kapan pun diperlukan.';
            await db.query(
                'INSERT INTO chat_messages (sender_id, room_id, message, is_staff_reply, is_ai) VALUES (0, ?, ?, 1, 1)',
                [roomId, sysMsg]
            );

            io.to(roomId).emit('receive_message', {
                sender_id: 0,
                room_id: roomId,
                message: sysMsg,
                is_staff: true,
                is_ai: true
            });

            const [tickets] = await db.query(`
                SELECT t.*, u.name as user_name, u.email as user_email, h.name as handler_name
                FROM cs_tickets t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN users h ON t.handled_by = h.id
                WHERE t.room_id = ?
            `, [roomId]);

            io.to('staff_room').emit('ticket_updated', {
                room_id: roomId,
                ticket: tickets[0] || null,
                action: 'handover_ai',
                actor_name: user.name
            });
        } catch (err) {
            console.error('Handover AI Error:', err);
        }
    });

    // 3. Staff Menyelesaikan Tiket Keluhan
    socket.on('ticket_resolve', async (payload) => {
        if (!isStaff) return;
        const { room_id, notes } = payload || {};
        if (!room_id || !USER_ROOM_PATTERN.test(room_id)) return;

        try {
            await db.query(`
                UPDATE cs_tickets SET 
                    status = 'resolved',
                    is_ai_paused = 0,
                    notes = ?,
                    handled_by = ?,
                    updated_at = NOW()
                WHERE room_id = ?
            `, [notes || 'Selesai ditangani staf', user.id, room_id]);

            const sysMsg = '✅ Tiket keluhan Anda telah ditandai Selesai oleh CS Staff Zenith. Terima kasih atas kepercayaan Anda bertransaksi di ZenithPrime!';
            await db.query(
                'INSERT INTO chat_messages (sender_id, room_id, message, is_staff_reply, is_ai) VALUES (?, ?, ?, 1, 0)',
                [user.id, room_id, sysMsg]
            );

            io.to(room_id).emit('receive_message', {
                sender_id: user.id,
                room_id,
                message: sysMsg,
                is_staff: true,
                is_ai: false
            });

            const [tickets] = await db.query(`
                SELECT t.*, u.name as user_name, u.email as user_email, h.name as handler_name
                FROM cs_tickets t
                JOIN users u ON t.user_id = u.id
                LEFT JOIN users h ON t.handled_by = h.id
                WHERE t.room_id = ?
            `, [room_id]);

            io.to('staff_room').emit('ticket_updated', {
                room_id,
                ticket: tickets[0] || null,
                action: 'resolved',
                actor_name: user.name
            });
        } catch (err) {
            console.error('Resolve Ticket Error:', err);
        }
    });

    socket.on('send_message', async (payload) => {
        // Anti-spam: maksimal 5 pesan per 5 detik per koneksi
        const now = Date.now();
        messageTimestamps = messageTimestamps.filter(t => now - t < MESSAGE_WINDOW_MS);
        if (messageTimestamps.length >= MAX_MESSAGES_PER_WINDOW) return;
        messageTimestamps.push(now);

        const message = (payload && typeof payload.message === 'string') ? payload.message.trim() : '';
        if (!message || message.length > MAX_MESSAGE_LENGTH) return;

        // Staff boleh membalas ke room user mana pun (tervalidasi); user biasa hanya ke room sendiri
        const roomId = isStaff ? payload.room_id : ownRoom;
        if (typeof roomId !== 'string' || !USER_ROOM_PATTERN.test(roomId)) return;

        // Identitas & peran diambil dari sesi server — tidak bisa dipalsukan client
        const data = { sender_id: user.id, room_id: roomId, message, is_staff: isStaff, is_ai: false };

        try {
            await db.query(
                'INSERT INTO chat_messages (sender_id, room_id, message, is_staff_reply, is_ai) VALUES (?, ?, ?, ?, 0)',
                [data.sender_id, data.room_id, data.message, data.is_staff ? 1 : 0]
            );

            io.to(roomId).emit('receive_message', data);

            if (isStaff) {
                // Update status tiket saat staff membalas
                await db.query(`
                    UPDATE cs_tickets SET 
                        status = IF(status = 'needs_followup', 'in_progress', status),
                        handled_by = ?,
                        updated_at = NOW()
                    WHERE room_id = ?
                `, [user.id, roomId]);

                const [updatedTickets] = await db.query(`
                    SELECT t.*, u.name as user_name, u.email as user_email, h.name as handler_name
                    FROM cs_tickets t
                    JOIN users u ON t.user_id = u.id
                    LEFT JOIN users h ON t.handled_by = h.id
                    WHERE t.room_id = ?
                `, [roomId]);

                io.to('staff_room').emit('ticket_updated', {
                    room_id: roomId,
                    ticket: updatedTickets[0] || null,
                    action: 'staff_message',
                    actor_name: user.name
                });
            } else {
                // ==========================================
                // 🚨 ANALISIS KELUHAN USER & SINKRONISASI TIKET
                // ==========================================
                const userTriage = aiChatbotService.analyzeComplaint(message);
                
                // Cek tiket yang sudah ada untuk room ini
                const [existingTickets] = await db.query('SELECT * FROM cs_tickets WHERE room_id = ?', [roomId]);
                let currentTicket = existingTickets[0] || null;

                if (!currentTicket) {
                    const initialStatus = userTriage.isComplaint ? 'needs_followup' : 'ai_handled';
                    await db.query(`
                        INSERT INTO cs_tickets (room_id, user_id, category, urgency, status, summary, order_id, last_user_message, is_complaint, is_ai_paused)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                    `, [
                        roomId,
                        user.id,
                        userTriage.category,
                        userTriage.urgency,
                        initialStatus,
                        userTriage.summary,
                        userTriage.detectedOrderId || null,
                        message,
                        userTriage.isComplaint ? 1 : 0
                    ]);
                    const [created] = await db.query('SELECT * FROM cs_tickets WHERE room_id = ?', [roomId]);
                    currentTicket = created[0];
                } else {
                    const isNowComplaint = userTriage.isComplaint || currentTicket.is_complaint === 1;
                    let nextStatus = currentTicket.status;
                    if (userTriage.isComplaint) {
                        if (currentTicket.status === 'resolved' || currentTicket.status === 'ai_handled') {
                            nextStatus = 'needs_followup';
                        }
                    }
                    const nextCategory = userTriage.isComplaint ? userTriage.category : currentTicket.category;
                    const nextUrgency = userTriage.isComplaint ? userTriage.urgency : currentTicket.urgency;
                    const nextSummary = userTriage.isComplaint ? userTriage.summary : currentTicket.summary;
                    const nextOrderId = userTriage.detectedOrderId || currentTicket.order_id;

                    await db.query(`
                        UPDATE cs_tickets SET 
                            category = ?,
                            urgency = ?,
                            status = ?,
                            summary = ?,
                            order_id = ?,
                            last_user_message = ?,
                            is_complaint = ?,
                            updated_at = NOW()
                        WHERE room_id = ?
                    `, [
                        nextCategory,
                        nextUrgency,
                        nextStatus,
                        nextSummary,
                        nextOrderId,
                        message,
                        isNowComplaint ? 1 : 0,
                        roomId
                    ]);

                    currentTicket.category = nextCategory;
                    currentTicket.urgency = nextUrgency;
                    currentTicket.status = nextStatus;
                    currentTicket.summary = nextSummary;
                    currentTicket.order_id = nextOrderId;
                    currentTicket.is_complaint = isNowComplaint ? 1 : 0;
                }

                // Kirim notifikasi seketika ke staff room dengan metadata tiket
                io.to('staff_room').emit('staff_notification', {
                    ...data,
                    user_name: user.name,
                    user_email: user.email,
                    ticket: currentTicket
                });

                // ==========================================
                // 🤖 SMART AI BOT AUTO-RESPONDER
                // ==========================================
                // Jika staff belum mengambil alih percakapan (is_ai_paused == 0), biarkan AI Assistant membalas otomatis
                if (currentTicket.is_ai_paused !== 1) {
                    setTimeout(async () => {
                        try {
                            const aiResult = await aiChatbotService.processMessage(message, {
                                id: user.id,
                                name: user.name,
                                email: user.email
                            });

                            // Jika AI mendeteksi eskalasi atau keluhan baru
                            if (aiResult.isEscalated || (aiResult.triage && aiResult.triage.isComplaint)) {
                                const cat = aiResult.triage ? aiResult.triage.category : 'HUMAN_ESCALATION';
                                const urg = aiResult.triage ? aiResult.triage.urgency : 'urgent';
                                const sum = aiResult.triage ? aiResult.triage.summary : 'Keluhan Membutuhkan Penanganan CS';
                                const ord = aiResult.triage ? aiResult.triage.detectedOrderId : null;

                                await db.query(`
                                    UPDATE cs_tickets SET 
                                        category = ?,
                                        urgency = ?,
                                        status = IF(status = 'in_progress', 'in_progress', 'needs_followup'),
                                        summary = ?,
                                        order_id = COALESCE(?, order_id),
                                        last_ai_message = ?,
                                        is_complaint = 1,
                                        updated_at = NOW()
                                    WHERE room_id = ?
                                `, [cat, urg, sum, ord, aiResult.text, roomId]);
                            } else {
                                await db.query(`
                                    UPDATE cs_tickets SET 
                                        last_ai_message = ?,
                                        updated_at = NOW()
                                    WHERE room_id = ?
                                `, [aiResult.text, roomId]);
                            }

                            const aiData = {
                                sender_id: 0,
                                room_id: roomId,
                                message: aiResult.text,
                                is_staff: true,
                                is_ai: true,
                                quick_replies: aiResult.quickReplies || [],
                                is_escalated: aiResult.isEscalated,
                                triage: aiResult.triage
                            };

                            await db.query(
                                'INSERT INTO chat_messages (sender_id, room_id, message, is_staff_reply, is_ai) VALUES (0, ?, ?, 1, 1)',
                                [aiData.room_id, aiData.message]
                            );

                            io.to(roomId).emit('receive_message', aiData);

                            const [freshTickets] = await db.query(`
                                SELECT t.*, u.name as user_name, u.email as user_email, h.name as handler_name
                                FROM cs_tickets t
                                JOIN users u ON t.user_id = u.id
                                LEFT JOIN users h ON t.handled_by = h.id
                                WHERE t.room_id = ?
                            `, [roomId]);

                            // Broadcast update AI ke staff room
                            io.to('staff_room').emit('staff_notification', {
                                ...aiData,
                                user_name: user.name,
                                user_email: user.email,
                                ticket: freshTickets[0] || currentTicket
                            });
                        } catch (aiErr) {
                            console.error('❌ AI Auto-response Error:', aiErr);
                        }
                    }, 600); // 600ms latency simulasi mengetik
                }
            }
        } catch (err) {
            console.error("Socket Error:", err);
        }
    });
});

// Otomatisasi pembersihan riwayat chat (> 24 jam)
cron.schedule('0 * * * *', async () => {
    console.log('⏳ Running Chat Cleanup Task...');
    try {
        await db.query("DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL 24 HOUR");
        console.log('✅ Chat history older than 24h cleaned.');
    } catch (err) {
        console.error('❌ Chat cleanup failed:', err);
    }
});

// ==========================================
// 🧭 ROUTES
// ==========================================
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const webRoutes = require('./src/routes/webRoutes');
const newsRoutes = require('./src/routes/newsRoutes');
const pageRoutes = require('./src/routes/pageRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const staffRoutes = require('./src/routes/staffRoutes');
const jokiRoutes = require('./src/routes/jokiRoutes');

app.use('/auth', authRoutes);
app.use('/staff', staffRoutes);
app.use('/admin', adminRoutes);
app.use('/joki', jokiRoutes);
app.use('/news', newsRoutes);
app.use('/api', apiRoutes);
app.use('/', pageRoutes);
app.use('/', webRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Halaman Tidak Ditemukan', layout: false });
});

// Global error handler: jangan bocorkan stack trace / path internal ke user
app.use((err, req, res, next) => {
    // Error dari body-parser saat payload melebihi limit
    if (err.type === 'entity.too.large') {
        return res.status(413).send('Payload terlalu besar.');
    }
    // Error upload (ukuran/tipe file)
    if (err.name === 'MulterError' || /gambar/i.test(err.message || '')) {
        req.flash('error_msg', err.code === 'LIMIT_FILE_SIZE' ? 'Ukuran file maksimal 2MB.' : err.message);
        return res.redirect(req.get('Referrer') || '/');
    }

    console.error('❌ Internal Server Error:', err);
    if (req.xhr || (req.headers.accept || '').includes('application/json')) {
        return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
    res.status(500).render('404', { title: 'Terjadi Kesalahan Server', layout: false });
});

server.listen(PORT, () => {
    console.log(`--------------------------------------------------`);
    console.log(`🚀 Server & Socket.io ZenithPrime berjalan di http://localhost:${PORT}`);
    console.log(`🛡️  Security: Helmet/CSP, Rate Limiter, SQLi Shield, HPP, Secure Session, Socket Auth`);
    console.log(`📅 Waktu Mulai: ${new Date().toLocaleString()}`);
    console.log(`--------------------------------------------------`);
});