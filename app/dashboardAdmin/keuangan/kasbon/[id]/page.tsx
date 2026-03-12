"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import KasbonDetailForm, { KasbonDetail } from "@/app/components/KasbonDetailForm";

export default function DetailKasbonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [kasbon, setKasbon] = useState<KasbonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchKasbon();
    // eslint-disable-next-line
  }, [id]);

  async function fetchKasbon() {
    setLoading(true);
    try {
      const res = await fetch(`/api/kasbon/${id}`);
      const json = await res.json();
      if (!json.success || !json.data) throw new Error("Kasbon tidak ditemukan");
      const d = json.data;
      setKasbon({
        id: d.id,
        employeeId: d.employee_id,
        employeeName: d.employee_name,
        departmentId: d.department_id,
        department: d.department_name,
        tanggalPengajuan: d.tanggal_pengajuan,
        jumlahPinjaman: d.jumlah_pinjaman,
        alasan: d.alasan,
        status: d.status,
        sisaPinjaman: d.sisa_pinjaman,
        cicilanPerBulan: d.cicilan_per_bulan, // opsional, jika ada di API
      });
    } catch (err) {
      setKasbon(null);
    }
    setLoading(false);
  }

  if (loading || !kasbon)
    return <div className="p-12 text-center text-gray-400">Loading...</div>;

  return (
    <div>
      <KasbonDetailForm
        kasbon={kasbon}
        onCancel={() => router.push("/dashboardAdmin/keuangan/kasbon")}
      />
    </div>
  );
}
