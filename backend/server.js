const cors = require('cors');
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/alat', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, k.nama_kategori
             FROM alat a
             LEFT JOIN kategori_alat k ON a.id_kategori = k.id_kategori
             ORDER BY a.id_alat`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});

app.get('/api/alat/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'ID produk harus berupa bilangan bulat positif'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM alat WHERE id_alat = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});

app.delete('/api/alat/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'ID alat harus berupa bilangan bulat positif'
        });
    }

    try {
        const result = await pool.query(
            'DELETE FROM alat WHERE id_alat = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Alat tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Alat berhasil dihapus'
        });
    } catch (error) {
        if (error.code === '23503') {
            return res.status(409).json({
                message: 'Alat tidak dapat dihapus karena masih dipinjam atau tercatat dalam data peminjaman'
            });
        }

        console.error('Gagal menghapus alat:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menghapus alat'
        });
    }
});

app.post('/api/alat', async (req, res) => {
    const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;

    const numericStock = Number(stok);

    if (
        !nama_alat ||
        typeof nama_alat !== 'string' ||
        nama_alat.trim() === '' ||
        stok === undefined ||
        isNaN(numericStock) ||
        numericStock < 0
    ) {
        return res.status(400).json({
            message: 'Data produk tidak valid'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO alat
                (id_kategori, nama_alat, kondisi, stok, lokasi) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [
                id_kategori,
                nama_alat.trim(),
                kondisi.trim(),
                numericStock,
                lokasi.trim()
                 
            ]
        );

        res.status(201).json({
            message: 'Produk berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal menambahkan produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menambahkan produk'
        });
    }
});

app.put('/api/alat/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { id_kategori, nama_alat, kondisi, stok, lokasi } = req.body;

    const numericStock = Number(stok);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'ID produk tidak valid'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE alat 
             SET id_kategori = $1, 
                 nama_alat = $2, 
                 kondisi = $3, 
                 stok = $4, 
                 lokasi = $5 
             WHERE id_alat = $6 
             RETURNING *`,
            [
                Number(id_kategori),
                nama_alat.trim(),
                (kondisi || 'Baik').trim(),
                numericStock,
                (lokasi || '').trim(),
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Produk berhasil diubah',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal memperbarui produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui produk'
        });
    }
});

app.get('/api/kategori_alat', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM kategori_alat ORDER BY id_kategori'
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});

app.get('/api/kategori_alat/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'ID produk harus berupa bilangan bulat positif'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM kategori_alat WHERE id_kategori = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});

app.put('/api/kategori_alat/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { nama_kategori, deskripsi } = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'ID kategori tidak valid'
        });
    }

    if (!nama_kategori || typeof nama_kategori !== 'string' || nama_kategori.trim() === '') {
        return res.status(400).json({
            message: 'Nama kategori tidak boleh kosong'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE kategori_alat
             SET nama_kategori = $1,
                 deskripsi = $2
             WHERE id_kategori = $3
             RETURNING *`,
            [nama_kategori.trim(), (deskripsi || '').trim(), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Kategori tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Kategori berhasil diubah',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal memperbarui kategori:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui kategori'
        });
    }
});

app.get('/api/peminjaman', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, a.nama_alat
             FROM peminjaman p
             LEFT JOIN alat a ON p.id_alat = a.id_alat
             ORDER BY p.id_peminjaman`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Gagal mengambil seluruh produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});

app.get('/api/peminjaman/:id', async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'ID produk harus berupa bilangan bulat positif'
        });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM peminjaman WHERE id_peminjaman = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Gagal mengambil produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengambil data produk'
        });
    }
});

app.post('/api/peminjaman', async (req, res) => {
    const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status } = req.body;

    if (
        !nama_peminjam ||
        typeof nama_peminjam !== 'string' ||
        nama_peminjam.trim() === '' ||
        jumlah === undefined) {
        return res.status(400).json({
            message: 'Data produk tidak valid'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO peminjaman
                (id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING *`,
            [
                Number(id_alat),
                nama_peminjam.trim(),
                kelas.trim(),
                tanggal_pinjam,
                tanggal_kembali,
                Number(jumlah),
                status
            ]
        );

        res.status(201).json({
            message: 'Produk berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal menambahkan produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat menambahkan produk'
        });
    }
});

app.put('/api/peminjaman/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { id_alat, nama_peminjam, kelas, tanggal_pinjam, tanggal_kembali, jumlah, status} = req.body;

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'ID produk tidak valid'
        });
    }

    try {
        const result = await pool.query(
            `UPDATE peminjaman
             SET id_alat = $1, 
                 nama_peminjam = $2, 
                 kelas= $3, 
                 tanggal_pinjam = $4, 
                 tanggal_kembali = $5,
                 jumlah = $6,
                 status = $7
                 WHERE id_peminjaman = $8
             RETURNING *`,
            [
                Number(id_alat),
                nama_peminjam.trim(),
                kelas.trim(),
                tanggal_pinjam,
                tanggal_kembali,
                Number(jumlah),
                status,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Produk tidak ditemukan'
            });
        }

        res.status(200).json({
            message: 'Produk berhasil diubah',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal memperbarui produk:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat memperbarui produk'
        });
    }
});

app.put('/api/peminjaman/:id/kembalikan', async (req, res) => {
    const id = Number(req.params.id);
    const { tanggal_kembali } = req.body || {};

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            message: 'ID peminjaman tidak valid'
        });
    }

    try {
        const existingResult = await pool.query(
            'SELECT id_alat, jumlah, tanggal_pinjam, status FROM peminjaman WHERE id_peminjaman = $1',
            [id]
        );

        if (existingResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Data peminjaman tidak ditemukan'
            });
        }

        const peminjaman = existingResult.rows[0];
        if (peminjaman.status !== 'Dipinjam') {
            return res.status(400).json({
                message: 'Alat sudah dikembalikan sebelumnya'
            });
        }

        const tglPinjam = new Date(peminjaman.tanggal_pinjam);
        tglPinjam.setHours(0, 0, 0, 0);

        const tglKembaliDate = tanggal_kembali
            ? new Date(`${tanggal_kembali}T00:00:00`)
            : new Date();
        tglKembaliDate.setHours(0, 0, 0, 0);

        const selisihHari = Math.floor(
            (tglKembaliDate - tglPinjam) / (1000 * 60 * 60 * 24)
        );
        const statusBaru = selisihHari > 2 ? 'Terlambat' : 'Dikembalikan';

        const result = await pool.query(
            `UPDATE peminjaman
             SET tanggal_kembali = COALESCE($1::date, CURRENT_DATE),
                 status = $2
             WHERE id_peminjaman = $3
             RETURNING *`,
            [tanggal_kembali || null, statusBaru, id]
        );

        if (statusBaru === 'Terlambat') {
            await pool.query(
                'UPDATE alat SET stok = stok + $1 WHERE id_alat = $2',
                [peminjaman.jumlah, peminjaman.id_alat]
            );
        }

        res.status(200).json({
            message:
                statusBaru === 'Terlambat'
                    ? 'Alat dikembalikan dengan status Terlambat (lebih dari 2 hari)'
                    : 'Alat berhasil dikembalikan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Gagal mengembalikan alat:', error.message);
        res.status(500).json({
            message: 'Terjadi kesalahan saat mengembalikan alat'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});