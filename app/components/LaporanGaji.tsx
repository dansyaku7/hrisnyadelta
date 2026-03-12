"use client";
import React from "react";

export type LaporanGajiRow = {
  employee_name: string;
  department: string;
  gaji_pokok: number | null | undefined;
  total_uang_makan: number | null | undefined;
  tunjangan_jabatan: number | null | undefined;
  tunjangan_lembur: number | null | undefined;
  thr_bonus: number | null | undefined;
  tunjangan_lain: number | null | undefined;
  potongan_bpjs: number | null | undefined;
  potongan_pajak: number | null | undefined;
  potongan_kasbon: number | null | undefined;
};

type LaporanGajiProps = {
  periode: string; 
  tanggal: string; 
  dataGaji: LaporanGajiRow[];
};

const nz = (x: number | null | undefined) => Number(x ?? 0);
const fmtIDR = (n: number) => (Number.isFinite(n) ? n : 0).toLocaleString("id-ID");

const LaporanGaji: React.FC<LaporanGajiProps> = ({ periode, tanggal, dataGaji }) => {
  return (
    <div className="laporan-container">
      <div className="header-laporan">
        <div>
          <img
            src="/templates/DIL.png"
            alt="Logo Perusahaan"
            style={{ height: "100px", marginRight: 18, verticalAlign: "middle", marginLeft: 10, marginTop:0 }}
          />
        </div>
        <div>
          <div className="header-info">LAPORAN GAJI</div>
          <div className="header-detail">
            PT DELTA INDONESIA LABORATORY
            <br />
            Prima Orchard Trade Mall, Jl. Prima Harapan Regency No.2, Bekasi Utara, Jawa Barat 17123
            <br />
            Phone: +62 221-8838-2018 | <i>https://deltaindonesialab.com/</i>
          </div>
        </div>
      </div>

      <div className="rekap-info">
        <div>
          <b>Periode:</b> <span>{periode}</span>
        </div>
        <div>
          <b>Total Karyawan:</b> <span>{dataGaji.length}</span>
        </div>
      </div>

      <table className="table-kehadiran">
        <thead>
          <tr>
            <th rowSpan={2}>No</th>
            <th rowSpan={2}>Nama Pegawai</th>
            <th rowSpan={2}>Departemen</th>
            <th colSpan={7}>Pendapatan</th>
            <th colSpan={4}>Potongan</th>
            <th rowSpan={2}>Gaji Bersih</th>
          </tr>
          <tr>
            <th>Gaji Pokok</th>
            <th>Total Uang Makan</th>
            <th>Tunj. Jabatan</th>
            <th>Tunj. Lembur</th>
            <th>THR/Bonus</th>
            <th>Tunj. Lain-lain</th>
            <th>Jumlah Pendapatan</th>
            <th>Pot. BPJS</th>
            <th>Pot. Pajak</th>
            <th>Pot. Kasbon</th>
            <th>Jumlah Potongan</th>
          </tr>
        </thead>
        <tbody>
          {dataGaji.length === 0 ? (
            <tr>
              <td colSpan={1 + 1 + 1 + 7 + 4 + 1} style={{ color: "#94a3b8", textAlign: "center" }}>
                Tidak ada data gaji.
              </td>
            </tr>
          ) : (
            dataGaji.map((row, idx) => {
              const gp = nz(row.gaji_pokok);
              const um = nz(row.total_uang_makan);
              const tj = nz(row.tunjangan_jabatan);
              const tl = nz(row.tunjangan_lembur);
              const th = nz(row.thr_bonus);
              const tlain = nz(row.tunjangan_lain);
              const p_bpjs = nz(row.potongan_bpjs);
              const p_pajak = nz(row.potongan_pajak);
              const p_kasbon = nz(row.potongan_kasbon);

              const jumlah_pendapatan = gp + um + tj + tl + th + tlain;
              const jumlah_potongan = p_bpjs + p_pajak + p_kasbon;
              const thp = jumlah_pendapatan - jumlah_potongan;

              return (
                <tr key={row.employee_name + row.department + idx}>
                  <td>{idx + 1}</td>
                  <td style={{ textAlign: "left" }}>{row.employee_name}</td>
                  <td>{row.department}</td>

                  <td style={{ textAlign: "right" }}>{fmtIDR(gp)}</td>
                  <td style={{ textAlign: "right" }}>{fmtIDR(um)}</td>
                  <td style={{ textAlign: "right" }}>{fmtIDR(tj)}</td>
                  <td style={{ textAlign: "right" }}>{fmtIDR(tl)}</td>
                  <td style={{ textAlign: "right" }}>{fmtIDR(th)}</td>
                  <td style={{ textAlign: "right" }}>{fmtIDR(tlain)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtIDR(jumlah_pendapatan)}</td>

                  <td style={{ textAlign: "right" }}>{fmtIDR(p_bpjs)}</td>
                  <td style={{ textAlign: "right" }}>{fmtIDR(p_pajak)}</td>
                  <td style={{ textAlign: "right" }}>{fmtIDR(p_kasbon)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtIDR(jumlah_potongan)}</td>

                  <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtIDR(thp)}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      <span className="ttd-date">{tanggal}</span>
      <style>{`
        .laporan-container {
          max-width: 2000px;
          background: #fff;
        }
        .header-laporan {
          display: flex;
          align-items: flex-start; 
          gap: 24px;
          margin-bottom: 10px;
        }
        .header-info {
          font-size: 16pt;
          font-weight: bold;
          letter-spacing: 0.8px;
        }
        .header-detail {
          font-size: 11pt;
          margin-bottom: 5px;
          color: #334155;
        }
        .rekap-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0 0 0;
          font-size: 10pt;
        }
        .table-kehadiran {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          margin-right: 12px;
          font-size: 10pt;
          background: #fff;
        }
        .table-kehadiran th, .table-kehadiran td {
          border: 1px solid #b2b2b2;
          padding: 5px 7px;
          text-align: center;
        }
        .table-kehadiran th {
          color: black;
          font-weight: bold;
        }
        .table-kehadiran tr:nth-child(even) {
          background: #f1f5f9;
        }
        .ttd-date {
          margin-bottom: 0px;
          font-size: 11pt;
          display: block;
          text-align: right;
          width:98%;
          margin-top: 40px;
          margin-right: 0px;
          font-family: inherit;
        }
        @media print {
          .laporan-container {
            box-shadow: none;
            padding: 2px 30px 32px 30px !important;
            border-radius: 0;
            background: #fff !important;
            max-width: 2000px;
            min-height: 0 !important;
            height: auto !important;
          }
          .header-laporan, .rekap-info, .footer-laporan {
            color: #000 !important;
          }
          .table-kehadiran { page-break-inside: auto; }
          .table-kehadiran tr { page-break-inside: avoid; page-break-after: auto; }
          @page { size: A4 portrait; margin: 5mm 0 0 0; }
        }
      `}</style>
    </div>
  );
};

export default LaporanGaji;