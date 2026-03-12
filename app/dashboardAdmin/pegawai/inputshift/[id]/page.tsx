"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import InputShiftForm from "@/app/components/InputShiftForm";

export default function InputShiftPegawaiPage() {
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
      <InputShiftForm
        pegawai={pegawai}
        onSuccess={() => router.push("/dashboardAdmin/pegawai")}
        onCancel={() => router.push("/dashboardAdmin/pegawai")}
      />
    </div>
  );
}
