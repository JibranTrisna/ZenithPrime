const db = require('../config/database');

async function upgrade() {
    try {
        console.log('🔄 Upgrading joki_orders table for per-request joki system...');

        await db.query('ALTER TABLE joki_orders MODIFY COLUMN service_id INT NULL DEFAULT 0');
        await db.query('ALTER TABLE joki_orders MODIFY COLUMN account_password VARCHAR(255) NULL');

        const [cols] = await db.query('DESCRIBE joki_orders');
        const colNames = cols.map(c => c.Field);

        if (!colNames.includes('request_type')) {
            await db.query("ALTER TABLE joki_orders ADD COLUMN request_type VARCHAR(100) DEFAULT 'Push Rank' AFTER service_name");
            console.log('✅ Added request_type');
        }

        if (!colNames.includes('current_rank')) {
            await db.query("ALTER TABLE joki_orders ADD COLUMN current_rank VARCHAR(100) NULL AFTER request_type");
            console.log('✅ Added current_rank');
        }

        if (!colNames.includes('target_rank')) {
            await db.query("ALTER TABLE joki_orders ADD COLUMN target_rank VARCHAR(100) NULL AFTER current_rank");
            console.log('✅ Added target_rank');
        }

        if (!colNames.includes('play_mode')) {
            await db.query("ALTER TABLE joki_orders ADD COLUMN play_mode VARCHAR(50) DEFAULT 'solo' AFTER target_rank");
            console.log('✅ Added play_mode');
        }

        console.log('🎉 joki_orders upgraded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Upgrade failed:', err);
        process.exit(1);
    }
}

upgrade();
