import React from "react";

export type KehadiranRow = {
  name: string;
  department: string;
  totalHadir: number;
  totalTerlambatMenit: number;
  totalWFH: number;
  totalIzinCuti: number;
  totalAlfa: number;
  totalLembur: number;
};

type LaporanKehadiranProps = {
  periode: string;
  dataKehadiran: KehadiranRow[];
  disetujuiOleh: string;
  diperiksaOleh: string;
  dibuatOleh: string;
  tanggal: string;
};

const LaporanKehadiran: React.FC<LaporanKehadiranProps> = ({
  periode,
  dataKehadiran,
  disetujuiOleh,
  diperiksaOleh,
  dibuatOleh,
  tanggal,
}) => {
  return (
    <div className="laporan-container">
      <div className="header-laporan">
        <div>
          <img
            src="/templates/DIL.png"
            alt="Logo Perusahaan"
            style={{ height: "100px", marginRight: 18, verticalAlign: "middle", marginLeft: 10, marginTop:10 }}
          />
        </div>
        <div>
          <div className="header-info">LAPORAN KEHADIRAN PEGAWAI</div>
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
          <b>Total Karyawan:</b> <span>{dataKehadiran.length}</span>
        </div>
      </div>
      <table className="table-kehadiran">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Pegawai</th>
            <th>Departemen</th>
            <th>Total Hadir</th>
            <th>Total WFH</th>
            <th>Total Terlambat (Menit)</th>
            <th>Total Izin/Cuti</th>
            <th>Total Alfa</th>
            <th>Total Lembur (Menit)</th>
          </tr>
        </thead>
        <tbody>
          {dataKehadiran.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ color: "#94a3b8", textAlign: "center" }}>
                Tidak ada data kehadiran.
              </td>
            </tr>
          ) : (
            dataKehadiran.map((row, idx) => (
              <tr key={row.name + row.department + idx}>
                <td>{idx + 1}</td>
                <td style={{ textAlign: "left" }}>{row.name}</td>
                <td>{row.department}</td>
                <td>{row.totalHadir}</td>
                <td>{row.totalWFH}</td>
                <td>{row.totalTerlambatMenit} menit</td>
                <td>{row.totalIzinCuti}</td>
                <td>{row.totalAlfa}</td>
                <td>{row.totalLembur}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <span className="ttd-date">{tanggal}</span>
      {/* Footer tanda tangan */}
      <table className="footer-sign-tabel">
        <tbody>
          <tr>
            <td style={{ width: "50%" }}></td>
            <td className="sign-col">
              <div className="sign-kiri">Disetujui Oleh,</div>
              <div className="ttd-space"></div>
              <span className="sign-name">{disetujuiOleh}</span>
            </td>
            <td style={{ width: "32px" }}></td>
            <td className="sign-col">
              <div className="sign-kiri">Diperiksa Oleh,</div>
              <div className="ttd-space"></div>
              <span className="sign-name">{diperiksaOleh}</span>
            </td>
            <td style={{ width: "32px" }}></td>
            <td className="sign-col">
              <div className="sign-label">Dibuat Oleh,</div>
              <div className="ttd-space"></div>
              <span className="sign-name">{dibuatOleh}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <style>{`
        .laporan-container {
          max-width: 1000px;
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
        .footer-sign-tabel {
          border: 10px;
          margin-top: 0px;
          margin-bottom: 20px;
          background: none;
          border-collapse: collapse;
        }
        .footer-sign-tabel td {
          border: none;
          text-align: center;
          vertical-align: top;
          padding: 0;
          background: none;
        }
        .footer-sign-tabel .sign-col {
          min-width: 160px;
          padding-left: 8px;
          padding-right: 8px;
        }
        .ttd-space {
          height: 56px;
        }
        .sign-kiri, .sign-label {
          margin-top: 5px;
          margin-bottom: 8px;
          font-size: 11pt;
        }
        .sign-name {
          margin-top: 6px;
          font-weight: bold;
          text-decoration: underline;
          display: block;
          min-height: 16px;
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
            max-width: 800px;
            min-height: 0 !important;
            height: auto !important;
          }
          .header-laporan, .rekap-info, .footer-laporan {
            color: #000 !important;
          }
          .table-kehadiran {
            page-break-inside: auto;
          }
          .table-kehadiran tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          .footer-sign-tabel {
            page-break-inside: avoid;
          }
          @page {
            size: A4 portrait;
            margin: 5mm 0 0 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LaporanKehadiran;
