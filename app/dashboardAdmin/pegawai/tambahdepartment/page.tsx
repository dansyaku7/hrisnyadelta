"use client";
import { useRouter } from "next/navigation";
import DepartmentForm from "@/app/components/DepartmentForm";

export default function TambahDepartmentPage() {
  const router = useRouter();

  return (
    <div>
      <DepartmentForm
        mode="tambah"
        onSuccess={() => router.push("/dashboardAdmin/pegawai")}
        onCancel={() => router.push("/dashboardAdmin/pegawai")}
      />
    </div>
  );
}
