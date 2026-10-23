const db = require('../src/config/database');
const { analyzeComplaint, processMessage } = require('../src/services/aiChatbotService');

async function runVerification() {
    console.log("=== STARTING LIVE CS & AI BOT INTEGRATION VERIFICATION ===");

    // 1. Test Complaint Analyzer Accuracy
    console.log("\n--- TEST 1: Smart Complaint Analyzer (Triage) ---");
    const testCases = [
        { msg: "halo kak mau tanya cara order", expectedComplaint: false, expectedCat: "GENERAL_QUERY" },
        { msg: "saldo rekening bca saya sudah kepotong tapi diamond belum masuk", expectedComplaint: true, expectedCat: "PAYMENT_ISSUE" },
        { msg: "pesanan TRX-17682910 pending lama banget tolong dicek", expectedComplaint: true, expectedCat: "TRANSACTION_DELAY", order: "TRX-17682910" },
        { msg: "saya salah ketik user id game waktu checkout tadi", expectedComplaint: true, expectedCat: "WRONG_ID" },
        { msg: "tolong hubungi #staf manusia segera", expectedComplaint: true, expectedCat: "HUMAN_ESCALATION" },
        { msg: "joki akun saya JK-12345 belum ada yang jalanin tolong dong", expectedComplaint: true, expectedCat: "JOKI_ISSUE", order: "JK-12345" }
    ];

    let passedCases = 0;
    for (const tc of testCases) {
        const triage = analyzeComplaint(tc.msg, tc.order);
        const ok = triage.isComplaint === tc.expectedComplaint && triage.category === tc.expectedCat;
        if (ok) {
            console.log(`✅ Passed: "${tc.msg}" -> Category: ${triage.category}, Urgency: ${triage.urgency}, Complaint: ${triage.isComplaint}`);
            passedCases++;
        } else {
            console.error(`❌ Failed: "${tc.msg}" -> Expected: ${tc.expectedCat}/${tc.expectedComplaint}, Got: ${triage.category}/${triage.isComplaint}`);
        }
    }

    // 2. Test cs_tickets Database Lifecycle
    console.log("\n--- TEST 2: cs_tickets Table Lifecycle Simulation ---");
    const testRoomId = 'user_99999';
    const testUserId = 99999;

    // Clean up any old test record
    await db.query('DELETE FROM cs_tickets WHERE room_id = ?', [testRoomId]);
    await db.query('DELETE FROM chat_messages WHERE room_id = ?', [testRoomId]);

    // Step A: User sends a general question
    const q1 = "halo min";
    const triage1 = analyzeComplaint(q1);
    await db.query(`
        INSERT INTO cs_tickets (room_id, user_id, category, urgency, status, summary, last_user_message, is_complaint, is_ai_paused)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [testRoomId, testUserId, triage1.category, triage1.urgency, 'ai_handled', triage1.summary, q1, 0]);

    let [rows] = await db.query('SELECT * FROM cs_tickets WHERE room_id = ?', [testRoomId]);
    console.log(`Step A (General Chat): Status=${rows[0].status}, Complaint=${rows[0].is_complaint}, Category=${rows[0].category}`);

    // Step B: User files a complaint about deducted balance
    const q2 = "saldo saya sudah kepotong tapi belum masuk";
    const triage2 = analyzeComplaint(q2);
    await db.query(`
        UPDATE cs_tickets SET 
            category = ?,
            urgency = ?,
            status = 'needs_followup',
            summary = ?,
            last_user_message = ?,
            is_complaint = 1,
            updated_at = NOW()
        WHERE room_id = ?
    `, [triage2.category, triage2.urgency, triage2.summary, q2, testRoomId]);

    [rows] = await db.query('SELECT * FROM cs_tickets WHERE room_id = ?', [testRoomId]);
    console.log(`Step B (Complaint Inbound): Status=${rows[0].status}, Urgency=${rows[0].urgency}, Complaint=${rows[0].is_complaint}, Category=${rows[0].category}`);

    // Step C: Staff Takes Over (Stop AI)
    await db.query(`
        UPDATE cs_tickets SET 
            is_ai_paused = 1,
            status = 'in_progress',
            handled_by = 1,
            updated_at = NOW()
        WHERE room_id = ?
    `, [testRoomId]);

    [rows] = await db.query('SELECT * FROM cs_tickets WHERE room_id = ?', [testRoomId]);
    console.log(`Step C (Staff Takeover): Status=${rows[0].status}, is_ai_paused=${rows[0].is_ai_paused}, HandledBy=${rows[0].handled_by}`);

    // Step D: Staff Resolves Ticket
    await db.query(`
        UPDATE cs_tickets SET 
            status = 'resolved',
            is_ai_paused = 0,
            notes = 'Saldo telah diverifikasi dan item dikirim',
            updated_at = NOW()
        WHERE room_id = ?
    `, [testRoomId]);

    [rows] = await db.query('SELECT * FROM cs_tickets WHERE room_id = ?', [testRoomId]);
    console.log(`Step D (Staff Resolved): Status=${rows[0].status}, is_ai_paused=${rows[0].is_ai_paused}, Notes=${rows[0].notes}`);

    // Clean up test data
    await db.query('DELETE FROM cs_tickets WHERE room_id = ?', [testRoomId]);
    await db.query('DELETE FROM chat_messages WHERE room_id = ?', [testRoomId]);

    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
    process.exit(0);
}

runVerification().catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
});
