"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import InputLokasiPegawaiForm from "@/app/components/InputLokasiPegawaiForm";

export default function InputLokasiPegawaiPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pegawai, setPegawai] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/employee/${id}`)
      .then(res => res.json())
      .then(json => {
        setPegawai(json.data);
        setLoading(false);
      });
  }, [id]);

  if (loading || !pegawai) return <div className="p-12 text-center text-gray-400">Loading...</div>;

  return (
    <div>
      <InputLokasiPegawaiForm
        pegawai={pegawai}
        onSuccess={() => router.push("/dashboardAdmin/pegawai")}
        onCancel={() => router.push("/dashboardAdmin/pegawai")}
      />
    </div>
  );
}
