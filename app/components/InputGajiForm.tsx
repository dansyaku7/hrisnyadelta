"use client";
import { useState, useEffect } from "react";

type InputGajiFormProps = {
  row: {
    employeeId: number;
    username?: string;
    NIK: string;
    name: string;
    department: string;
    departmentId: number;
    totalHadir: number;
    totalTerlambatMenit: number;
    totalIzinCuti: number;
    totalAlfa: number;
    totalWFH: number;
    totalLembur: number;
    totalLemburFormatted: string;
    gajiPokok?: number;
    uangMakan: 0;
    totalUangMakan: 0;
    tunjanganJabatan?: number;
  };
  tanggalList: { tanggal: string; excluded: boolean; label: string }[];
  excludeDates: string[];
  tanggalMulai: string;
  tanggalAkhir: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function InputGajiForm({
  row,
  tanggalMulai,
  tanggalAkhir,
  tanggalList,
  excludeDates,
  onClose,
  onSuccess,
}: InputGajiFormProps) {
  const [form, setForm] = useState({
    tunjanganLain: "",
    thrBonus: "",
    potonganBpjs: "",
    potonganPajak: "",
    potonganKasbon: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const totalHariKerja = tanggalList.filter(tgl => !excludeDates.includes(tgl.tanggal)).length;

  // --- SQL: kasbonId = id, bukan _id
  const [kasbonAktif, setKasbonAktif] = useState<null | { id: number; sisaPinjaman: number }>(null);
  const [cekKasbonLoading, setCekKasbonLoading] = useState(false);

  // Lembur SQL: tetap sama
  const tunjanganLemburOtomatis = row.gajiPokok && row.totalLembur
    ? (Number(row.gajiPokok) / 173 * Number(row.totalLembur) * 2)
    : 0;

  useEffect(() => {
    if (!row.employeeId) {
      setKasbonAktif(null);
      return;
    }
    setCekKasbonLoading(true);
    
    fetch(`/api/kasbon?employeeId=${row.employeeId}`)
      .then(res => res.json())
      .then(json => {
        const mapped = (json.data || []).map((k: any) => ({
          id: Number(k.id), 
          employeeId: String(k.employee_id),
          sisaPinjaman: k.sisa_pinjaman,
          jumlahPinjaman: k.jumlah_pinjaman,
          status: k.status,
        }));
        const aktif = mapped.find((k: any) =>
          k.employeeId === String(row.employeeId) &&
          (
            String(k.status).toLowerCase() === "approved" ||
            String(k.status).toLowerCase() === "cicil"
          ) &&
          Number(k.sisaPinjaman ?? k.jumlahPinjaman ?? 0) > 0
        );
        setKasbonAktif(aktif || null);
        // Log untuk debug
        console.log("kasbon aktif ditemukan:", aktif);
      })
      .finally(() => setCekKasbonLoading(false));
  }, [row.employeeId]);


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    

    const body = {
      employeeId: row.employeeId,
      kasbonId: kasbonAktif?.id,
      name: row.name,
      NIK: row.NIK,
      departmentId: row.departmentId,    
      department: row.department,
      tanggalMulai,
      tanggalAkhir,
      totalHadir: row.totalHadir,
      totalTerlambatMenit: row.totalTerlambatMenit,
      totalWFH: row.totalWFH,
      totalIzinCuti: row.totalIzinCuti,
      totalAlfa: row.totalAlfa,
      totalLembur: row.totalLembur,
      totalLemburFormatted: row.totalLemburFormatted,
      gajiPokok: row.gajiPokok || 0,
      totalUangMakan: row.totalUangMakan || 0,
      tunjanganJabatan: row.tunjanganJabatan || 0,
      tunjanganLembur: tunjanganLemburOtomatis,
      tunjanganLain: Number(form.tunjanganLain) || 0,
      thrBonus: Number(form.thrBonus) || 0,
      potonganBpjs: Number(form.potonganBpjs) || 0,
      potonganPajak: Number(form.potonganPajak) || 0,
      potonganKasbon: Number(form.potonganKasbon) || 0,
      
    };
    const res = await fetch("/api/payroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      // PATCH kasbon jika ada potongan kasbon
      if (body.potonganKasbon > 0 && body.kasbonId) {
        try {
          const kasbonRes = await fetch("/api/kasbon/potong", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeId: row.employeeId, jumlahPotong: body.potonganKasbon }),
          });
          const resp = await kasbonRes.json();
          if (!kasbonRes.ok) {
            console.log("Error kasbon PATCH:", resp);
          }
        } catch (err) {
          console.log("Fetch error:", err);
        }
      }
      setMsg("Berhasil input payroll.");
      if (onSuccess) onSuccess();
      setTimeout(onClose, 700);
    } else {
      const errJson = await res.json();
      setMsg("Gagal input payroll: " + (errJson?.error || ""));
    }
    setLoading(false);
  }

  return (
  <form
    onSubmit={handleSubmit}
    className="p-5 bg-white rounded-xl w-full max-w-4xl shadow-xl"
  >
    <h2 className="text-lg font-bold mb-4 text-cyan-800">Input Payroll Karyawan</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Info Kiri */}
      <div>
        <div className="mb-2 grid grid-cols-2 gap-y-1 text-sm">
          <div>Nama</div>
          <div className="font-semibold break-words max-w-xs">{row.name}</div>
          <div>Department</div>
          <div>{row.department}</div>
          <div className="pr-3 border-gray-300 border-b border-b-gray-200 py-1">Periode</div>
          <div className="pr-3 border-gray-300 border-b border-b-gray-200 py-1">
            {tanggalMulai} s/d {tanggalAkhir}
          </div>
          <div>Total Hari Kerja</div>
          <div className="font-semibold">{totalHariKerja}</div>
          <div>Hadir</div>
          <div>{row.totalHadir}</div>
          <div>Terlambat</div>
          <div>{row.totalTerlambatMenit} menit</div>
          <div>WFH</div>
          <div>{row.totalWFH}</div>
          <div>Izin/Cuti</div>
          <div>{row.totalIzinCuti}</div>
          <div>Alfa</div>
          <div>{row.totalAlfa}</div>
          <div className="pr-3 border-gray-300 border-b border-b-gray-200 py-1">Lembur</div>
          <div className="pr-3 border-gray-300 border-b border-b-gray-200 py-1">{row.totalLemburFormatted || row.totalLembur + " jam"}</div>
          <div>Gaji Pokok</div>
          <div>
            {row.gajiPokok
              ? "Rp " + Number(row.gajiPokok).toLocaleString("id-ID")
              : "-"}
          </div>
          <div>Nominal Uang Makan</div>
          <div>Rp {Number(row.uangMakan || 0).toLocaleString("id-ID")}</div>
          <div className="font-semibold">Total Uang Makan</div>
          <div className="font-semibold text-cyan-700">
            Rp {Number(row.totalUangMakan || 0).toLocaleString("id-ID")}
          </div>
          <div>Tunjangan Jabatan</div>
          <div>
            {row.tunjanganJabatan
              ? "Rp " + Number(row.tunjanganJabatan).toLocaleString("id-ID")
              : "-"}
          </div>
          <div>Tunjangan Lembur</div>
          <div>
            {"Rp " + tunjanganLemburOtomatis.toLocaleString("id-ID")}
          </div>
        </div>
      </div>
      {/* Input Kanan */}
      <div>
        <div className="mb-2">
          <label className="block font-semibold">Tunjangan Lain-lain</label>
          <input
            name="tunjanganLain"
            value={form.tunjanganLain}
            onChange={handleChange}
            type="number"
            min={0}
            className="border px-3 py-2 rounded w-full"
            placeholder="Rp"
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">THR / Bonus</label>
          <input
            name="thrBonus"
            value={form.thrBonus}
            onChange={handleChange}
            type="number"
            min={0}
            className="border px-3 py-2 rounded w-full"
            placeholder="Rp"
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">Potongan BPJS</label>
          <input
            name="potonganBpjs"
            value={form.potonganBpjs}
            onChange={handleChange}
            type="number"
            min={0}
            className="border px-3 py-2 rounded w-full"
            placeholder="Rp"
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold">Potongan Pajak</label>
          <input
            name="potonganPajak"
            value={form.potonganPajak}
            onChange={handleChange}
            type="number"
            min={0}
            className="border px-3 py-2 rounded w-full"
            placeholder="Rp"
          />
        </div>
        <div className="mb-2">
          {cekKasbonLoading ? (
            <div className="text-xs text-gray-500">Cek kasbon aktif...</div>
          ) : kasbonAktif ? (
            <div className="text-xs text-red-600 font-semibold">
              Ada kasbon aktif: <b>Rp {Number(kasbonAktif.sisaPinjaman).toLocaleString("id-ID")}</b>
            </div>
          ) : (
            <div className="text-xs text-green-600">Tidak ada kasbon aktif</div>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-semibold">Potongan Kasbon</label>
          <input
            name="potonganKasbon"
            value={form.potonganKasbon}
            onChange={handleChange}
            type="number"
            min={0}
            className="border px-3 py-2 rounded w-full"
            placeholder="Rp"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-cyan-700 text-white hover:bg-cyan-800"
          >
            {loading ? "Menyimpan..." : "Input"}
          </button>
        </div>
        {msg && (
          <div
            className={`mt-2 text-sm ${
              msg.includes("Berhasil") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  </form>
  );
}
