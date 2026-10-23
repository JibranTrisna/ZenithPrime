const db = require('../config/database');

async function migrate() {
    try {
        console.log('🚀 Running Joki tables migration...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS joki_services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                game_slug VARCHAR(100) NOT NULL,
                category VARCHAR(50) NOT NULL,
                name VARCHAR(150) NOT NULL,
                price DECIMAL(15,2) NOT NULL,
                base_price DECIMAL(15,2) NOT NULL,
                min_order INT DEFAULT 1,
                estimate_time VARCHAR(100) DEFAULT '1-24 Jam',
                description TEXT NULL,
                is_active TINYINT(1) DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_game_slug (game_slug),
                INDEX idx_category (category)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS joki_orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(50) UNIQUE NOT NULL,
                user_id INT NOT NULL,
                service_id INT NOT NULL,
                game_slug VARCHAR(100) NOT NULL,
                service_name VARCHAR(150) NOT NULL,
                quantity INT DEFAULT 1,
                total_amount DECIMAL(15,2) NOT NULL,
                login_via VARCHAR(50) NOT NULL,
                account_id VARCHAR(150) NOT NULL,
                account_password VARCHAR(255) NOT NULL,
                nickname VARCHAR(100) NULL,
                whatsapp VARCHAR(30) NOT NULL,
                request_hero VARCHAR(255) NULL,
                notes TEXT NULL,
                snap_token VARCHAR(255) NULL,
                payment_status ENUM('pending', 'success', 'failed', 'expired') DEFAULT 'pending',
                payment_type VARCHAR(50) NULL,
                order_status ENUM('unpaid', 'queued', 'in_progress', 'completed', 'canceled') DEFAULT 'unpaid',
                worker_id INT NULL,
                worker_notes TEXT NULL,
                proof_image VARCHAR(255) NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_service_id (service_id),
                INDEX idx_order_id (order_id),
                INDEX idx_order_status (order_status),
                INDEX idx_payment_status (payment_status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Check if joki_services is empty, if so seed default services
        const [existing] = await db.query('SELECT COUNT(*) as count FROM joki_services');
        if (existing[0].count === 0) {
            console.log('🌱 Seeding initial Joki services...');
            const seedData = [
                // Mobile Legends: Bintang / Per Star
                ['mobile-legends', 'Joki Per Bintang', 'Master ke Grandmaster (Per Bintang)', 4000, 2500, 3, '1-3 Jam', 'Joki rank per bintang rank Master. Fast win streak.'],
                ['mobile-legends', 'Joki Per Bintang', 'Grandmaster ke Epic (Per Bintang)', 5000, 3000, 3, '1-4 Jam', 'Joki rank per bintang rank Grandmaster.'],
                ['mobile-legends', 'Joki Per Bintang', 'Epic ke Legend (Per Bintang)', 7500, 5000, 3, '2-6 Jam', 'Joki rank per bintang rank Epic menuju Legend.'],
                ['mobile-legends', 'Joki Per Bintang', 'Legend ke Mythic (Per Bintang)', 10000, 7000, 3, '3-8 Jam', 'Joki rank per bintang rank Legend menuju Mythic.'],
                ['mobile-legends', 'Joki Per Bintang', 'Mythic Grading (10 Match Penempatan)', 120000, 85000, 1, '4-12 Jam', 'Joki placement match Mythic garansi winrate tinggi.'],
                ['mobile-legends', 'Joki Per Bintang', 'Mythic ke Mythical Honor (Per Bintang)', 16000, 11000, 2, '4-12 Jam', 'Joki bintang rank Mythic 0-24 Star.'],
                ['mobile-legends', 'Joki Per Bintang', 'Mythical Honor ke Glory (Per Bintang)', 22000, 16000, 2, '6-24 Jam', 'Joki bintang rank Honor 25-49 Star.'],
                ['mobile-legends', 'Joki Per Bintang', 'Mythical Glory ke Immortal (Per Bintang)', 30000, 22000, 2, '12-36 Jam', 'Joki bintang rank Glory 50-99 Star.'],

                // Mobile Legends: Paket Rank Hemat
                ['mobile-legends', 'Paket Rank Hemat', 'Paket Full Epic V ke Legend V', 175000, 125000, 1, '6-12 Jam', 'Paket hemat joki rank Epic V langsung tembus Legend V.'],
                ['mobile-legends', 'Paket Rank Hemat', 'Paket Full Legend V ke Mythic', 240000, 175000, 1, '8-16 Jam', 'Paket hemat joki rank Legend V langsung tembus Mythic.'],
                ['mobile-legends', 'Paket Rank Hemat', 'Paket All-In Epic V ke Mythic', 399000, 290000, 1, '18-36 Jam', 'Paket combo terlaris Epic V sampai Mythic.'],
                ['mobile-legends', 'Joki Classic / WR', 'Joki Classic Winrate (Per Match)', 6000, 4000, 5, '1-6 Jam', 'Menaikkan winrate hero favorit di mode Classic. Garansi win.'],

                // Valorant
                ['valorant', 'Joki Rank Tier', 'Iron ke Bronze (Per Tier)', 45000, 30000, 1, '2-6 Jam', 'Joki tier rank Valorant Iron.'],
                ['valorant', 'Joki Rank Tier', 'Bronze ke Silver (Per Tier)', 65000, 45000, 1, '3-8 Jam', 'Joki tier rank Valorant Bronze.'],
                ['valorant', 'Joki Rank Tier', 'Silver ke Gold (Per Tier)', 90000, 65000, 1, '4-12 Jam', 'Joki tier rank Valorant Silver.'],
                ['valorant', 'Joki Rank Tier', 'Gold ke Platinum (Per Tier)', 135000, 95000, 1, '6-18 Jam', 'Joki tier rank Valorant Gold.'],
                ['valorant', 'Joki Rank Tier', 'Platinum ke Diamond (Per Tier)', 190000, 140000, 1, '12-24 Jam', 'Joki tier rank Valorant Platinum.'],
                ['valorant', 'Joki Rank Tier', '5 Match Placement (Rank Awal)', 150000, 110000, 1, '4-10 Jam', 'Joki placement match 5 game dengan MMR tinggi.'],

                // Free Fire
                ['free-fire', 'Joki Rank BR / CS', 'Silver ke Gold (Full Tier)', 35000, 25000, 1, '1-3 Jam', 'Joki rank Free Fire Silver ke Gold.'],
                ['free-fire', 'Joki Rank BR / CS', 'Gold ke Platinum (Full Tier)', 60000, 40000, 1, '2-5 Jam', 'Joki rank Free Fire Gold ke Platinum.'],
                ['free-fire', 'Joki Rank BR / CS', 'Platinum ke Diamond (Full Tier)', 95000, 65000, 1, '4-8 Jam', 'Joki rank Free Fire Platinum ke Diamond.'],
                ['free-fire', 'Joki Rank BR / CS', 'Diamond ke Master / Heroic', 160000, 110000, 1, '6-14 Jam', 'Joki rank Free Fire Diamond ke Master.'],

                // Honor of Kings
                ['honor-of-kings', 'Joki Per Bintang', 'Gold ke Platinum (Per Bintang)', 4500, 3000, 3, '1-4 Jam', 'Joki rank HOK per bintang rank Gold.'],
                ['honor-of-kings', 'Joki Per Bintang', 'Platinum ke Diamond (Per Bintang)', 7000, 4500, 3, '2-6 Jam', 'Joki rank HOK per bintang rank Platinum.'],
                ['honor-of-kings', 'Joki Per Bintang', 'Diamond ke Master (Per Bintang)', 11000, 7500, 3, '3-8 Jam', 'Joki rank HOK per bintang rank Diamond.'],
                ['honor-of-kings', 'Joki Per Bintang', 'Master ke Grandmaster (Per Bintang)', 17000, 12000, 2, '5-12 Jam', 'Joki rank HOK per bintang rank Master.'],

                // Genshin Impact
                ['genshin-impact', 'Quest & Explore', 'Spiral Abyss Lantai 9-12 (36 Star Full)', 95000, 65000, 1, '2-6 Jam', 'Clear Spiral Abyss full 36 bintang.'],
                ['genshin-impact', 'Quest & Explore', 'Eksplorasi Region 100% (Per Region)', 150000, 100000, 1, '1-3 Hari', 'Eksplorasi map 100% include all chest & culus.'],
                ['genshin-impact', 'Rawat Akun', 'Rawat Akun Mingguan (Daily + Resin + Event)', 80000, 55000, 1, '7 Hari', 'Daily commission, spend 160 resin setiap hari, claim event reward.']
            ];

            const insertQuery = `
                INSERT INTO joki_services (game_slug, category, name, price, base_price, min_order, estimate_time, description)
                VALUES ?
            `;
            await db.query(insertQuery, [seedData]);
            console.log('✅ Seeding completed with ' + seedData.length + ' Joki services');
        }

        console.log('🎉 Migration finished successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
