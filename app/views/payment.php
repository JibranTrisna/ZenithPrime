<div class="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
    <h1 class="text-3xl font-bold text-cyan-400 mb-4">Selesaikan Pembayaran Anda</h1>
    <p class="text-gray-400 mb-6">Jendela pembayaran akan muncul secara otomatis. Jika tidak, klik tombol di bawah.</p>
    <button id="pay-button" class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
        Bayar Sekarang
    </button>
</div>

<script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="<?php echo MIDTRANS_CLIENT_KEY; ?>"></script>

<script type="text/javascript">
    document.addEventListener('DOMContentLoaded', function() {
        var payButton = document.getElementById('pay-button');
        var snapToken = '<?php echo $data['snap_token']; ?>';
        var baseUrl = '<?php echo BASE_URL; ?>';

        function triggerMidtransSnap() {
            if (!snapToken || snapToken.length === 0) {
                alert('Terjadi kesalahan: Snap Token tidak ditemukan.');
                window.location.href = baseUrl + '/transaction/history'; 
                return;
            }

            if (typeof snap === 'undefined') {
                console.error("Midtrans Snap.js belum dimuat.");
                alert("Terjadi masalah saat memuat pembayaran. Silakan coba lagi atau refresh halaman.");
                window.location.href = baseUrl + '/transaction/history'; 
                return;
            }

            snap.pay(snapToken, {
                onSuccess: function(result) {
                    console.log('Payment Success:', result);
                    alert("Pembayaran berhasil!");
                    window.location.href = baseUrl + '/transaction/history';
                },
                onPending: function(result) {
                    console.log('Payment Pending:', result);
                    alert("Pembayaran Anda tertunda. Silakan selesaikan pembayaran.");
                    window.location.href = baseUrl + '/transaction/history';
                },
                onError: function(result) {
                    console.error('Payment Error:', result);
                    alert('Pembayaran gagal! Silakan coba lagi.');
                    window.location.href = baseUrl + '/transaction/history';
                },
                onClose: function() {
                    console.log('Payment window closed by user.');
                    alert('Anda menutup jendela pembayaran. Transaksi Anda masih tertunda.');
                    window.location.href = baseUrl + '/transaction/history';
                }
            });
        }

        payButton.onclick = triggerMidtransSnap;
        setTimeout(triggerMidtransSnap, 100); 
    });
</script>