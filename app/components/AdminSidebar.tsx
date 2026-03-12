"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

function SidebarDropdown({ label, icon, children, paths }: any) {
  const pathname = usePathname();
  const active = paths.some((p: string) => pathname.startsWith(p));
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v: boolean) => !v)}
        className={`flex items-center gap-3 w-full min-h-[40px] p-2 rounded-lg font-semibold transition duration-75 group
        ${active ? "bg-[#07ABE8] text-white" : "text-cyan-700 hover:bg-cyan-50"}
        `}
      >
        {icon}
        <span className="flex-1 text-left whitespace-nowrap">{label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 10 6">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 4 4 4-4" />
        </svg>
      </button>
      <ul className={`py-2 space-y-1 pl-7 ${open ? "" : "hidden"} transition-all`}>{children}</ul>
    </li>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 w-75 h-screen bg-white hidden md:flex flex-col font-comfortaa">

      <div style={{
          width: 170,
          padding: 8,
          paddingTop: 2,
          marginLeft: 50,
          marginTop: 15,
          display: "inline-block",
        }}>
        <img src="/templates/DIL.png" className="h-19 w-33" alt="Logo" />
      </div>
      <div style={{
          width: 290,
          borderRadius: 20,
          marginLeft: 10,
          marginTop: 15,
        }}>
      <ul className="flex-1 overflow-y-auto space-y-1 font-medium text-lg py-4 px-3">
        <li>
            <Link
              href="/dashboardAdmin"
              className={`flex items-center gap-3 min-h-[40px] p-2 rounded-lg font-semibold ${
                pathname === "/dashboardAdmin"
                  ? "bg-[#07ABE8] text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}>
              <img src={pathname === "/dashboardAdmin"? "/dashboard-white.svg": "/dashboard.svg"} alt="Dashboard" className="w-5 h-5"/>
              Dashboard
            </Link>
          </li>

          <SidebarDropdown
            label="Pengumuman"
            icon={<img src={pathname.startsWith("/dashboardAdmin/pengumuman") ? "/announ-white.svg" : "/announ.svg"} alt="Pengumuman" className="w-5 h-5" />}
            paths={["/dashboardAdmin/pengumuman"]}
          >
            <li>
              <Link
                href="/dashboardAdmin/pengumuman"
                className={`flex items-center gap-3 w-full min-h-[36px] p-2 rounded-lg font-semibold ${ 
                  pathname === "/dashboardAdmin/pengumuman"
                    ? "bg-[#07ABE8] text-white"
                    : "text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                Daftar Pengumuman
              </Link>
            </li>
            <li>
              <Link
                href="/dashboardAdmin/pengumuman/tambah"
                className={`flex items-center gap-3 w-full min-h-[36px] p-2 rounded-lg font-semibold ${ 
                  pathname === "/dashboardAdmin/pengumuman/tambah"
                    ? "bg-[#07ABE8] text-white"
                    : "text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                Tambah Pengumuman
              </Link>
            </li>
          </SidebarDropdown>

          <li>
            <Link
              href="/dashboardAdmin/pegawai"
              className={`flex items-center gap-3 min-h-[40px] p-2 rounded-lg font-semibold ${
                pathname === "/dashboardAdmin/pegawai"
                  ? "bg-[#07ABE8] text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              <img src={pathname === "/dashboardAdmin/pegawai"? "/employee-white.svg": "/employee.svg"} alt="Pegawai" className="w-5 h-5"/>
              Pegawai
            </Link>
          </li>

          <li>
            <Link
              href="/dashboardAdmin/shift"
              className={`flex items-center gap-3 min-h-[40px] p-2 rounded-lg font-semibold ${
                pathname === "/dashboardAdmin/shift"
                  ? "bg-[#07ABE8] text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              <img src={pathname === "/dashboardAdmin/shift"? "/shift-white.svg": "/shift.svg"} alt="Shift" className="w-5 h-5"/>
              Shift
            </Link>
          </li>

          <li>
            <Link
              href="/dashboardAdmin/lokasi"
              className={`flex items-center gap-3 min-h-[40px] p-2 rounded-lg font-semibold ${
                pathname === "/dashboardAdmin/lokasi"
                  ? "bg-[#07ABE8] text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              <img src={pathname === "/dashboardAdmin/lokasi"? "/location-white.svg": "/location.svg"} alt="Location" className="w-5 h-5"/>
              Lokasi
            </Link>
          </li>

            <li>
              <Link
                href="/dashboardAdmin/absensi"
                className={`flex items-center gap-3 min-h-[36px] p-2 rounded-lg font-semibold ${
                  pathname === "/dashboardAdmin/absensi"
                    ? "bg-[#07ABE8] text-white"
                    : "text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                <img src={pathname.startsWith("/dashboardAdmin/absensi") ? "/absensi-white.svg" : "/absensi.svg"} alt="Absensi" className="w-5 h-5" />
                Absensi
              </Link>
            </li>

          <li>
            <Link
              href="/dashboardAdmin/overtime"
              className={`flex items-center gap-3 min-h-[40px] p-2 rounded-lg font-semibold ${
                pathname === "/dashboardAdmin/overtime"
                  ? "bg-[#07ABE8] text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              <img src={pathname === "/dashboardAdmin/overtime"? "/overtime-white.svg": "/overtime.svg"} alt="Overtime" className="w-5 h-5"/>
              Overtime
            </Link>
          </li>

          <li>
            <Link
              href="/dashboardAdmin/cuti"
              className={`flex items-center gap-3 min-h-[40px] p-2 rounded-lg font-semibold ${
                pathname === "/dashboardAdmin/cuti"
                  ? "bg-[#07ABE8] text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              <img src={pathname === "/dashboardAdmin/cuti"? "/cuti-white.svg": "/cuti.svg"} alt="Cuti" className="w-5 h-5"/>
              Cuti
            </Link>
          </li>

          <li>
            <Link
              href="/dashboardAdmin/rekap"
              className={`flex items-center gap-3 min-h-[40px] p-2 rounded-lg font-semibold ${
                pathname === "/dashboardAdmin/rekap"
                  ? "bg-[#07ABE8] text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              <img src={pathname === "/dashboardAdmin/rekap"? "/rekap-white.svg": "/rekap.svg"} alt="Rekap" className="w-5 h-5"/>
              Rekap Data
            </Link>
          </li>

          <SidebarDropdown
            label="Keuangan"
            icon={<img src={pathname.startsWith("/dashboardAdmin/keuangan") ? "/dollar-white.svg" : "/dollar.svg"} alt="Keuangan" className="w-5 h-5" />}
            paths={["/dashboardAdmin/keuangan"]}
          >
            <li>
              <Link
                href="/dashboardAdmin/keuangan/payroll"
                className={`flex items-center gap-3 min-h-[36px] p-2 rounded-lg font-semibold ${
                  pathname === "/dashboardAdmin/keuangan/payroll"
                    ? "bg-[#07ABE8] text-white"
                    : "text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                Payroll
              </Link>
            </li>
            <li>
              <Link
                href="/dashboardAdmin/keuangan/kasbon"
                className={`flex items-center gap-3 min-h-[36px] p-2 rounded-lg font-semibold ${
                  pathname === "/dashboardAdmin/keuangan/kasbon"
                    ? "bg-[#07ABE8] text-white"
                    : "text-cyan-700 hover:bg-cyan-50"
                }`}
              >
                Kasbon
              </Link>
            </li>
          </SidebarDropdown>

          <li>
            <Link
              href="/dashboardAdmin/liburNasional"
              className={`flex items-center gap-3 min-h-[40px] p-2 rounded-lg font-semibold ${
                pathname === "/dashboardAdmin/liburNasional"
                  ? "bg-[#07ABE8] text-white"
                  : "text-cyan-700 hover:bg-cyan-50"
              }`}
            >
              <img src={pathname === "/dashboardAdmin/liburNasional"? "/rekap-white.svg": "/rekap.svg"} alt="Libur" className="w-5 h-5"/>
              Hari Libur
            </Link>
          </li>
      </ul>
      </div>
    </aside>
  );
}
