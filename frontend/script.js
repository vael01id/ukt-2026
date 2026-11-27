async function loadAlat() {
  try {
    const response = await fetch("http://localhost:3000/api/alat");
    const result = await response.json();
    console.log(result);
    const productList = document.getElementById("tabelAlat");
    const alatSelect = document.getElementById("alatPinjam");
    productList.innerHTML = "";
    if (alatSelect) {
      alatSelect.innerHTML = `<option value="" disabled selected>Pilih Alat</option>`;
    }

    if (result && result.length > 0) {
      let no = 1;
      result.forEach((alat) => {
        const row = `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-3 text-gray-900">${no++}</td>
                        <td class="p-3 font-medium text-gray-900">${alat.nama_alat}</td>
                        <td class="p-3 text-gray-600">${alat.nama_kategori ?? alat.id_kategori ?? "-"}</td>
                        <td class="p-3 text-gray-600">${alat.kondisi ?? "-"}</td>
                        <td class="p-3 text-gray-600">${alat.stok}</td>
                        <td class="p-3 text-gray-600">${alat.lokasi ?? "-"}</td>
                        <td class="p-3 flex gap-2">
                          <button onclick="editAlat(${alat.id_alat})" class="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1 rounded text-xs font-medium">Edit</button>
                          <button onclick="hapusAlat(${alat.id_alat})" style="background-color: #ef4444;" class="text-black px-3 py-1 rounded text-xs font-medium">Hapus</button>
                        </td>
                    </tr>
                `;
        productList.innerHTML += row;

        if (alatSelect) {
          alatSelect.innerHTML += `<option value="${alat.id_alat}">${alat.nama_alat}</option>`;
        }
      });
    } else {
      productList.innerHTML = `
                <tr>
                    <td colspan="7" class="p-4 text-center text-gray-500">Belum ada alat yang ditambahkan.</td>
                </tr>
            `;
    }
  } catch (error) {
    console.error("Gagal mengambil data alat:", error);
    document.getElementById("tabelAlat").innerHTML = `
            <tr>
                <td colspan="7" class="p-4 text-center text-red-500">Gagal memuat data alat. Pastikan server aktif.</td>
            </tr>
        `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAlat();
  loadKategori();
  loadPeminjaman();

  const formAlat = document.getElementById("formAlat");
  if (formAlat) {
    formAlat.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        nama_alat: document.getElementById("namaAlat").value,
        id_kategori: document.getElementById("kategoriAlat").value,
        kondisi: document.getElementById("kondisiAlat").value,
        stok: document.getElementById("stokAlat").value,
        lokasi: document.getElementById("lokasiAlat").value || "",
      };

      try {
        const response = await fetch("http://localhost:3000/api/alat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
          alert(result.message || "Gagal menambahkan alat.");
          return;
        }

        alert("Alat berhasil ditambahkan!");
        formAlat.reset();
        loadAlat();
      } catch (error) {
        console.error("Gagal mengirim data alat:", error);
        alert("Gagal terhubung ke server.");
      }
    });
  }

  const formPeminjaman = document.getElementById("formPeminjaman");
  if (formPeminjaman) {
    formPeminjaman.addEventListener("submit", async (e) => {
      e.preventDefault();

      const payload = {
        id_alat: document.getElementById("alatPinjam").value,
        nama_peminjam: document.getElementById("namaPeminjam").value,
        kelas: document.getElementById("kelasPeminjam").value,
        jumlah: document.getElementById("jumlahPinjam").value,
        tanggal_pinjam: document.getElementById("tanggalPinjam").value,
        tanggal_kembali:
          document.getElementById("tanggalKembali").value || null,
        status: "Dipinjam",
      };

      try {
        const response = await fetch("http://localhost:3000/api/peminjaman", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok) {
          alert(result.message || "Gagal mencatat peminjaman.");
          return;
        }

        alert("Peminjaman berhasil dicatat!");
        formPeminjaman.reset();
        loadPeminjaman();
        loadAlat();
      } catch (error) {
        console.error("Gagal mengirim data peminjaman:", error);
        alert("Gagal terhubung ke server.");
      }
    });
  }

  const formEditAlat = document.getElementById("formEditAlat");
  if (formEditAlat) {
    formEditAlat.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editIdAlat").value;
      const payload = {
        nama_alat: document.getElementById("editNamaAlat").value,
        id_kategori: document.getElementById("editKategoriAlat").value,
        kondisi: document.getElementById("editKondisiAlat").value,
        stok: document.getElementById("editStokAlat").value,
        lokasi: document.getElementById("editLokasiAlat").value || "",
      };

      try {
        const response = await fetch(
          `http://localhost:3000/api/alat/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const result = await response.json();
        if (!response.ok) {
          alert(result.message || "Gagal memperbarui alat.");
          return;
        }

        alert("Alat berhasil diperbarui!");
        loadAlat();
        showSection("dataAlat");
      } catch (error) {
        console.error("Gagal memperbarui alat:", error);
        alert("Gagal terhubung ke server.");
      }
    });
  }

  const formEditKategori = document.getElementById("formEditKategori");
  if (formEditKategori) {
    formEditKategori.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("editIdKategori").value;
      const payload = {
        nama_kategori: document.getElementById("editNamaKategori").value,
        deskripsi: document.getElementById("editDeskripsiKategori").value || "",
      };

      try {
        const response = await fetch(
          `http://localhost:3000/api/kategori_alat/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const result = await response.json();
        if (!response.ok) {
          alert(result.message || "Gagal memperbarui kategori.");
          return;
        }

        alert("Kategori berhasil diperbarui!");
        loadKategori();
        loadAlat();
        showSection("dataKategori");
      } catch (error) {
        console.error("Gagal memperbarui kategori:", error);
        alert("Gagal terhubung ke server.");
      }
    });
  }
});

async function loadKategori() {
  try {
    const response = await fetch("http://localhost:3000/api/kategori_alat");
    const result = await response.json();
    console.log(result);

    const kategoriList = document.getElementById("tabelKategori");
    const kategoriSelect = document.getElementById("kategoriAlat");
    const editKategoriSelect = document.getElementById("editKategoriAlat");
    kategoriList.innerHTML = "";
    if (kategoriSelect) {
      kategoriSelect.innerHTML = `<option value="" disabled selected>Pilih Kategori</option>`;
    }
    if (editKategoriSelect) {
      editKategoriSelect.innerHTML = `<option value="" disabled selected>Pilih Kategori</option>`;
    }

    if (result && result.length > 0) {
      let no = 1;
      result.forEach((kategori) => {
        const row = `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-3 text-gray-900">${no++}</td>
                        <td class="p-3 font-medium text-gray-900">${kategori.nama_kategori}</td>
                        <td class="p-3 text-gray-600">${kategori.deskripsi ?? "-"}</td>
                        <td class="p-3 flex gap-2">
                          <button onclick="editKategori(${kategori.id_kategori})" class="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1 rounded text-xs font-medium">Edit</button>
                          <button onclick="hapusKategori(${kategori.id_kategori})" style="background-color: #ef4444;" class="text-black px-3 py-1 rounded text-xs font-medium">Hapus</button>
                        </td>

                    </tr>
                `;
        kategoriList.innerHTML += row;

        if (kategoriSelect) {
          kategoriSelect.innerHTML += `<option value="${kategori.id_kategori}">${kategori.nama_kategori}</option>`;
        }
        if (editKategoriSelect) {
          editKategoriSelect.innerHTML += `<option value="${kategori.id_kategori}">${kategori.nama_kategori}</option>`;
        }
      });
    } else {
      kategoriList.innerHTML = `
                <tr>
                    <td colspan="5" class="p-4 text-center text-gray-500">Belum ada kategori yang ditambahkan.</td>
                </tr>
            `;
    }
  } catch (error) {
    console.error("Gagal mengambil data kategori:", error);
    document.getElementById("tabelKategori").innerHTML = `
            <tr>
                <td colspan="4" class="p-4 text-center text-red-500">Gagal memuat data kategori. Pastikan server aktif.</td>
            </tr>
        `;
  }
}

async function editKategori(id) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/kategori_alat/${id}`,
    );
    const kategori = await response.json();

    if (!response.ok) {
      alert(kategori.message || "Gagal mengambil data kategori.");
      return;
    }

    document.getElementById("editIdKategori").value = kategori.id_kategori;
    document.getElementById("editNamaKategori").value =
      kategori.nama_kategori || "";
    document.getElementById("editDeskripsiKategori").value =
      kategori.deskripsi || "";

    showSection("editKategori");
  } catch (error) {
    console.error("Gagal mengambil detail kategori:", error);
    alert("Gagal terhubung ke server.");
  }
}

async function editAlat(id) {
  try {
    const response = await fetch(`http://localhost:3000/api/alat/${id}`);
    const alat = await response.json();

    if (!response.ok) {
      alert(alat.message || "Gagal mengambil data alat.");
      return;
    }

    document.getElementById("editIdAlat").value = alat.id_alat;
    document.getElementById("editNamaAlat").value = alat.nama_alat || "";
    document.getElementById("editKategoriAlat").value = alat.id_kategori || "";
    document.getElementById("editKondisiAlat").value = alat.kondisi || "Baik";
    document.getElementById("editStokAlat").value = alat.stok ?? 0;
    document.getElementById("editLokasiAlat").value = alat.lokasi || "";

    showSection("editAlat");
  } catch (error) {
    console.error("Gagal mengambil detail alat:", error);
    alert("Gagal terhubung ke server.");
  }
}

async function loadPeminjaman() {
  try {
    const response = await fetch("http://localhost:3000/api/peminjaman");
    const result = await response.json();
    console.log(result);

    const peminjamanList = document.getElementById("tabelPeminjaman");
    peminjamanList.innerHTML = "";

    if (result && result.length > 0) {
      let no = 1;
      result.forEach((peminjaman) => {
        const tglPinjam = peminjaman.tanggal_pinjam
          ? peminjaman.tanggal_pinjam.split("T")[0]
          : "-";
        const tglKembali = peminjaman.tanggal_kembali
          ? peminjaman.tanggal_kembali.split("T")[0]
          : "-";
        const aksiButton =
          peminjaman.status === "Dikembalikan"
            ? `<span class="px-3 py-1 rounded text-xs font-medium bg-slate-200 text-slate-700">Selesai</span>`
            : peminjaman.status === "Terlambat"
              ? `<span class="px-3 py-1 rounded text-xs font-medium" style="background-color: #fee2e2; color: #b91c1c;">Terlambat</span>`
              : `<button onclick="kembalikanPeminjaman(${peminjaman.id_peminjaman})" style="background-color: #16a34a; color: #ffffff;" class="px-3 py-1 rounded text-xs font-medium">Kembalikan</button>`;
        const row = `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="p-3 text-gray-900">${no++}</td>
                        <td class="p-3 font-medium text-gray-900">${peminjaman.nama_peminjam}</td>
                        <td class="p-3 text-gray-600">${peminjaman.kelas ?? "-"}</td>
                        <td class="p-3 text-gray-600">${peminjaman.nama_alat ?? peminjaman.id_alat ?? "-"}</td>
                        <td class="p-3 text-gray-600">${peminjaman.jumlah}</td>
                        <td class="p-3 text-gray-600">${tglPinjam}</td>
                        <td class="p-3 text-gray-600">${tglKembali}</td>
                        <td class="p-3 text-gray-600">${peminjaman.status ?? "Dipinjam"}</td>
                        <td class="p-3">${aksiButton}</td>
                    </tr>
                `;
        peminjamanList.innerHTML += row;
      });
    } else {
      peminjamanList.innerHTML = `
                <tr>
                    <td colspan="9" class="p-4 text-center text-gray-500">Belum ada peminjaman yang dicatat.</td>
                </tr>
            `;
    }
  } catch (error) {
    console.error("Gagal mengambil data peminjaman:", error);
    document.getElementById("tabelPeminjaman").innerHTML = `
            <tr>
                <td colspan="9" class="p-4 text-center text-red-500">Gagal memuat data peminjaman. Pastikan server aktif.</td>
            </tr>
        `;
  }
}

async function kembalikanPeminjaman(id) {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const tanggalKembali = `${yyyy}-${mm}-${dd}`;

  try {
    const response = await fetch(
      `http://localhost:3000/api/peminjaman/${id}/kembalikan`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggal_kembali: tanggalKembali }),
      },
    );

    const result = await response.json();
    if (!response.ok) {
      alert(result.message || "Gagal mengembalikan alat.");
      return;
    }

    if (result.data && result.data.status === "Terlambat") {
      alert(result.message);
    }

    loadPeminjaman();
    loadAlat();
  } catch (error) {
    console.error("Gagal mengembalikan alat:", error);
    alert("Gagal terhubung ke server.");
  }
}

async function hapusAlat(id) {
  if (!confirm("Yakin hapus alat ini?")) return;
  try {
    const response = await fetch(`http://localhost:3000/api/alat/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return alert(error.message || "Gagal menghapus alat.");
    }
    
    loadKategori();
    loadAlat();

  } catch (error) {
    console.error(error);
    alert("Gagal terhubung ke server.");
  }
}
