# RatuFileSaver
Bot menghasilkan tautan yang dapat dibagikan di dalam telegram untuk video, photo, dokumen dan bisa berbagi secara grup. Lewat 20 media Anda tidak bisa mengirim sampai 1 menit selesai.
<hr>

<a href="https://heroku.com/deploy?template=https://github.com/BimoSora/RatuFileSaver">
  <img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy">
</a>
<br>
Ganti tautan dengan template github Anda.
</br>

<br>
<a href="https://youtu.be/zw_ijvhzomI">
Klik di sini untuk menonton cara meng-host
</a>
<br>
Detail yang diperlukan.</br>
<code>TOKEN</code> - Dapatkan Token bot dari bot father.</br>
<code>DOMAIN</code> - Sama dengan nama aplikasi yang Anda masukkan di Heroku.</br>
<code>ADMIN</code> - ID Akun Anda (jika Anda tidak dapat menemukannya menggunakan bot seperti @getmyid_bot). <b>Jika ada tambahan ADMIN1 dan ADMIN2 tulis sesuai contoh yang ada di config Heroku dan tinggal kasih angka di belakangnya</b></br>
<code>botUSERNAME</code> - Nama pengguna bot Anda tanpa '@'.</br>
<code>DB_URL</code> - Buat akun di https://www.mongodb.com/cloud/atlas , nama database - RatuMediaFile ,nama collection - RatuFileBackup.Klik Connect dan pilih 'Hubungkan aplikasi Anda'.copy tautan dan ganti "< password >" dengan kata sandi pengguna yang memiliki akses ke DB dan ganti "myFirstDatabase" untuk "RatuMediaFile". Kalau mau ubah sesuai keinginan nama databasenya ada di folder config.</br>
<b>Tautan DB_URL</b>

    mongodb+srv://login:password@bot.qnbbq.mongodb.net/database?retryWrites=true&w=majority

<code>LOG_CHANNEL</code> - buat saluran pribadi dan dapatkan ID saluran (jika Anda tidak dapat meneruskan ID saluran apa pun dari saluran ke @getidsbot itu mungkin terlihat seperti -1001234567899).
<hr>

<h2>Berikut adalah beberapa perintah dan penggunaan admin.</h2>

~ Bagaimana pengguna melarang, unban dan kick dari bot dan grup.
<code>/ban</code> userID caption jika ada.</br>
<code>/banchat</code> userID (pribadi).</br>
<code>/unban</code> userID.</br>
<code>/unbanchat</code> userID (pribadi).</br>
<code>/kick</code> userID.</br>
<b>Dapatkan UserID dari saluran log.</b></br>

~ Bagaimana cara menggunakan pin dan unpin di grup.</br>
<code>/pin</code> reply ke pesan yang mau di pin.</br>
<code>/unpin</code> reply ke pesan yang mau di unpin.</br>

~ Bagaimana cara kirim pesan ke pengguna dari grup.</br>
<code>/send</code> pesan. kirim pesan di grup.</br>

~ Bagaimana cara kirim pesan ke pengguna dari bot.</br>
<code>/sendchat</code> userID pesan. kirim ke pengguna melalui bot.</br>

<h2>Cara menghapus file dari bot.</h2>
Anda dapat menghapus file 4 cara.</br>

  ⚫ Hapus file individual dengan file_id.
  
  ⚫ Hapus file grup dengan mediaId.
  
  ⚫ Hapus semua file Kirim oleh pengguna.
  
  ⚫ Hapus semua file Kirim ke bot.


~ Hapus file individual dengan file_id.</br>
<code>/rem</code> file_id. Ini akan menghapus file satu per satu saat Anda memberikan file_id, dapatkan file_id dari saluran log.</br>

~ Hapus file grup dengan mediaId.</br>
<code>/remgrp</code> mediaId. Ini akan menghapus media dalam grup, dapatkan mediaId dari saluran log.</br>

~ Hapus semua file Kirim oleh pengguna.</br>
<code>/remall</code> userID. Anda dapat menghapus semua file dikirim oleh pengguna tertentu jika pengguna mengirim konten atau spam yang kasar, dapatkan userid dari saluran log.</br>

~ Hapus semua file Kirim ke B0T.</br>
<code>/clear</code>. Ini akan menghapus semua file yang dikirim ke bot secara permanen.</br>

<h2>Kirim pesan ke pengguna</h2>

<code>/broadcast</code>. Anda dapat menyiarkan pesan teks ke pengguna Anda, pesan akan dikirim dari pengguna terakhir bergabung untuk pertama-tama bergabung dengan pengguna untuk mengurangi spam. Cobalah untuk tidak mengirim terlalu banyak pesan sekaligus jika Anda memiliki sejumlah besar pengguna.

<h2>Cara mengetahui total pengguna bot.</h2>

<code>/stats</code>. Anda akan mendapatkan total pengguna memulai bot Anda, data waktu nyata akan diperbarui setelah siaran yang berhasil.
<hr>

<b>Jika Anda ingin mendukung saya, ikuti saya di GitHub sebagai dukungan.</b>

//Update

HISTORY 8
1. Perbaikan penulisan URL gabung grup/channel tinggal tulis name-https://t.me/test

HISTORY 7
1. Perbaikan dalam list grup untuk melakukan perintah didalam grup.
2. Kirim media secara grup.
3. Hapus media secara grup.

HISTORY 6
1. Kirim pesan ke pengguna melalui bot.

HISTORY 5
1. Kirim pesan ke pengguna melalui grup.

HISTORY 4
1. bot mendukung kick, ban, unban dan ada pesan pribadi.
2. bot mendukung pin dan unpin.

HISTORY 3
1. Perbaikan penulisan file_name.
2. Perbaikan pencarian media.

HISTORY 2
1. Function teks disederhanakan.
2. Mendeteksi jika belum ada nama akun akan dikosongkan.
3. Admin bisa menggunakan bot tanpa masuk channel/grup.
4. Ada log channel untuk mengetahui siapa yang ngirim dan apa deskripsi filenya.

HISTORY 1
1. Ada join channel/grup terlebih dahulu saat start, pastikan id channel/grup di ganti pada index.js dan bot harus jadi admin di grup/channel.
2. Terdapat penambahan untuk menghilangkan null supaya tidak terlihat saat tampil.
3. Ada get ID untuk cek ID akun Anda.
4. Ada pesan bot belum dimasukkan ke channel/grup tujuan.
