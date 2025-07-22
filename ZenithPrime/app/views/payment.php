<div class="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
    <h1 class="text-3xl font-bold mb-4">Selesaikan Pembayaran Anda</h1>
    <p class="text-gray-400 mb-6">Jendela pembayaran akan muncul secara otomatis. Jika tidak, klik tombol di bawah.</p>
    <button id="pay-button" class="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
        Bayar Sekarang
    </button>
</div>

<script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="<?php echo MIDTRANS_CLIENT_KEY; ?>"></script>
<script type="text/javascript">
    document.getElementById('pay-button').onclick = function(){
        snap.pay('<?php echo $data['snap_token']; ?>', {
            onSuccess: function(result){
                console.log(result);
                window.location.href = '<?php echo BASE_URL; ?>/transaction/history';
            },
            onPending: function(result){
                console.log(result);
                window.location.href = '<?php echo BASE_URL; ?>/transaction/history';
            },
            onError: function(result){
                console.log(result);
                alert('Pembayaran Gagal!');
            },
            onClose: function(){
                alert('Anda menutup jendela pembayaran.');
            }
        });
    };

    document.getElementById('pay-button').click();
</script>