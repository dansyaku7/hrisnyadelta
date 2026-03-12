"use client";
import { useRouter, useParams } from "next/navigation";
import GantiPasswordForm from "@/app/components/GantiPasswordForm";

export default function GantiPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  return (
    <div>
      <GantiPasswordForm id={id as string} onSuccess={() => router.push("/dashboardAdmin/pegawai")} />
    </div>
  );
}
