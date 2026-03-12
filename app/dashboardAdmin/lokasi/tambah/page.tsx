"use client";
import { useRouter } from "next/navigation";
import LokasiForm from "@/app/components/LokasiForm";

export default function TambahLokasiPage() {
  const router = useRouter();

  return (
    <div >
      <LokasiForm
        mode="tambah"
        onSuccess={() => router.push("/dashboardAdmin/lokasi")}
      />
    </div>
  );
}
