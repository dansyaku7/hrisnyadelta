"use client";
import AddPegawaiForm from "@/app/components/addpegawaiform";
import { useRouter } from "next/navigation";

export default function TambahPegawaiPage() {
    const router = useRouter();
  return (
    <main>
      <AddPegawaiForm
        onSuccess={() => router.push("/dashboardAdmin/pegawai")}
      />
    </main>
  );
}
