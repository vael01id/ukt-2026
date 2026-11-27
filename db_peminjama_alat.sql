-- Hapus tabel dan tipe jika sudah ada (untuk mencegah error saat import ulang)
DROP TABLE IF EXISTS peminjaman;
DROP TABLE IF EXISTS alat;
DROP TABLE IF EXISTS kategori_alat;
DROP TYPE IF EXISTS status_kembali;

-- 1. Membuat Tipe Data ENUM untuk Status Peminjaman
CREATE TYPE status_kembali AS ENUM ('Dipinjam', 'Dikembalikan', 'Terlambat');

-- 2. Membuat Tabel Kategori Alat
CREATE TABLE kategori_alat (
    id_kategori SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    deskripsi TEXT
);

-- 3. Membuat Tabel Alat
CREATE TABLE alat (
    id_alat SERIAL PRIMARY KEY,
    id_kategori INTEGER REFERENCES kategori_alat(id_kategori) ON DELETE CASCADE,
    nama_alat VARCHAR(100) NOT NULL,
    kondisi VARCHAR(30) DEFAULT 'Baik',
    stok INTEGER NOT NULL CHECK (stok >= 0),
    lokasi VARCHAR(100)
);

-- 4. Membuat Tabel Peminjaman
CREATE TABLE peminjaman (
    id_peminjaman SERIAL PRIMARY KEY,
    id_alat INTEGER REFERENCES alat(id_alat) ON DELETE RESTRICT,
    nama_peminjam VARCHAR(100) NOT NULL,
    kelas VARCHAR(30) NOT NULL,
    tanggal_pinjam DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_kembali DATE,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    status status_kembali DEFAULT 'Dipinjam'
);

-- 5. Insert Data Awal (Seed Data)
INSERT INTO kategori_alat (nama_kategori, deskripsi) VALUES 
('Komputer & Jaringan', 'Peralatan lab komputer, server, dan jaringan'),
('Multimedia', 'Peralatan fotografi, videografi, dan presentasi'),
('Elektronika', 'Komponen dan alat ukur kelistrikan');

INSERT INTO alat (id_kategori, nama_alat, kondisi, stok, lokasi) VALUES 
(1, 'Kabel UTP Cat6 (Roll)', 'Baik', 10, 'Lemari Jaringan A'),
(1, 'Crimping Tool', 'Baik', 25, 'Lemari Jaringan B'),
(2, 'Kamera DSLR Canon', 'Baik', 5, 'Loker Multimedia 1'),
(2, 'Proyektor Epson', 'Baik', 8, 'Loker Multimedia 2'),
(3, 'Multimeter Digital', 'Baik', 20, 'Rak Elektro C');

-- 6. Membuat Function untuk Otomatisasi Stok
CREATE OR REPLACE FUNCTION update_stok_alat()
RETURNS TRIGGER AS $$
BEGIN
    -- Jika insert peminjaman baru (Barang dipinjam)
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.status = 'Dipinjam') THEN
            -- Pastikan stok mencukupi
            IF (SELECT stok FROM alat WHERE id_alat = NEW.id_alat) < NEW.jumlah THEN
                RAISE EXCEPTION 'Stok alat tidak mencukupi untuk peminjaman ini!';
            END IF;
            UPDATE alat SET stok = stok - NEW.jumlah WHERE id_alat = NEW.id_alat;
        END IF;
        RETURN NEW;
    END IF;

    -- Jika update status peminjaman (Barang dikembalikan)
    IF (TG_OP = 'UPDATE') THEN
        IF (OLD.status = 'Dipinjam' AND NEW.status = 'Dikembalikan') THEN
            UPDATE alat SET stok = stok + NEW.jumlah WHERE id_alat = NEW.id_alat;
        END IF;
        RETURN NEW;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Memasang Trigger pada Tabel Peminjaman
CREATE TRIGGER trg_update_stok
AFTER INSERT OR UPDATE ON peminjaman
FOR EACH ROW EXECUTE FUNCTION update_stok_alat();