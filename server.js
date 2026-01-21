const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- НАСТРОЙКИ SUPABASE ---
const SUPABASE_URL = 'https://твой-проект.supabase.co'; 
const SUPABASE_KEY = 'твой-длинный-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Главная страница, чтобы проверить, жив ли сервер
app.get('/', (req, res) => res.send('Сенсей на связи! Сервер позора работает.'));

// Записать крутку
app.post('/api/spin', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'No username' });

    try {
        // Получаем текущее кол-во
        const { data } = await supabase
            .from('heroes')
            .select('spins')
            .eq('username', username)
            .single();

        let newSpins = (data ? data.spins : 0) + 1;

        // Обновляем
        await supabase
            .from('heroes')
            .upsert({ username, spins: newSpins, last_spin: new Date() });

        res.json({ success: true, spins: newSpins });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Получить ТОП-10
app.get('/api/leaderboard', async (req, res) => {
    const { data } = await supabase
        .from('heroes')
        .select('username, spins')
        .order('spins', { ascending: false })
        .limit(10);
    res.json(data || []);
});

// ПОРТ (Render сам подставит нужный через process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(Server running on port ${PORT}));
