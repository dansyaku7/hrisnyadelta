import React from "react";

interface SlipGajiProps {
  employee_name: string;
  NIK: string;
  department: string;
  periode: string;
  gajiPokok: string;
  pajak: string;
  totalUangMakan: string;
  bpjs: string;
  tunjanganJabatan: string;
  kasbon: string;
  tunjanganLembur: string;
  tunjanganLain: string;
  thr: string;
  totalPenerimaan: string;
  totalPotongan: string;
  takeHomePay: string;
  dibuatOleh: string;
  diterimaOleh: string;
  tanggal: string;
  logoUrl?: string;
}

const SlipGaji: React.FC<SlipGajiProps> = ({
  employee_name,
  NIK,
  department,
  periode,
  gajiPokok,
  pajak,
  totalUangMakan,
  bpjs,
  tunjanganJabatan,
  kasbon,
  tunjanganLembur,
  tunjanganLain,
  thr,
  totalPenerimaan,
  totalPotongan,
  takeHomePay,
  dibuatOleh,
  diterimaOleh,
  tanggal,
  logoUrl = "/templates/DIL.png",
}) => {
  return (
    <div className="slip-box">
      <div className="header-row">
        <img
          src={logoUrl}
          alt="Logo Perusahaan"
          style={{
            height: "100px",
            marginLeft: 10,
            marginTop: 0,
          }}
        />
        <div>
          <div className="company-info">PT DELTA INDONESIA LABORATORY</div>
          <div className="company-detail">
            Prima Orchard Trade Mall, Jl. Prima Harapan Regency No.2, RT.001/RW.012,<br />
            Harapan Baru, Kec. Bekasi Utara, Kota Bks, Jawa Barat 17123<br />
            Phone: +62 221-8838-2018<br />
            <i>Website : https://deltaindonesialab.com/</i>
          </div>
        </div>
        <div>
          <table className="employee-info-table">
            <tbody>
              <tr>
                <td><b>Nama</b></td><td>:</td><td>{employee_name}</td>
              </tr>
              <tr>
                <td><b>NIK</b></td><td>:</td><td>{NIK}</td>
              </tr>
              <tr>
                <td><b>Departemen</b></td><td>:</td><td>{department}</td>
              </tr>
              <tr>
                <td><b>Periode</b></td><td>:</td><td>{periode}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="slip-title">SLIP GAJI</div>
      <div>
        <table className="main-table">
          <tbody>
            <tr className="line-head">
              <td colSpan={3}>PENERIMAAN</td>
              <td colSpan={3}>POTONGAN</td>
            </tr>
            <tr>
              <td>Gaji Pokok</td><td style={{ width: 10 }}>:</td><td style={{ textAlign: "left" }}>{gajiPokok}</td>
              <td>Pajak</td><td style={{ width: 10 }}>:</td><td style={{ textAlign: "left" }}>{pajak}</td>
            </tr>
            <tr>
              <td>Uang Makan</td><td>:</td><td style={{ textAlign: "left" }}>{totalUangMakan}</td>
              <td>BPJS</td><td>:</td><td style={{ textAlign: "left" }}>{bpjs}</td>
            </tr>
            <tr>
              <td>Tunjangan Jabatan</td><td>:</td><td style={{ textAlign: "left" }}>{tunjanganJabatan}</td>
              <td>Kasbon</td><td>:</td><td style={{ textAlign: "left" }}>{kasbon}</td>
            </tr>
            <tr>
              <td>Tunjangan Lembur</td><td>:</td><td style={{ textAlign: "left" }}>{tunjanganLembur}</td>
              <td></td><td></td><td></td>
            </tr>
            <tr>
              <td>Tunjangan lain-lain</td><td>:</td><td style={{ textAlign: "left" }}>{tunjanganLain}</td>
              <td></td><td></td><td></td>
            </tr>
            <tr>
              <td>THR/Bonus</td><td>:</td><td style={{ textAlign: "left" }}>{thr}</td>
              <td></td><td></td><td></td>
            </tr>
            <tr className="total-row">
              <td>Total Penerimaan</td><td>:</td><td style={{ textAlign: "left" }}>{totalPenerimaan}</td>
              <td>Total Potongan</td><td>:</td><td style={{ textAlign: "left" }}>{totalPotongan}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="gaji-bersih">
        Take Home Pay <span className="gaji-box">{takeHomePay}</span>
      </div>
      <div className="footer-sign">
        <div className="sign-col">
          <div className="sign-kiri">Dibuat Oleh,</div>
          <div className="ttd-space"></div>
          <span className="sign-name">{dibuatOleh}</span>
        </div>
        <div className="center"></div>
        <div className="sign-col">
          <span className="ttd-date">Bekasi, {tanggal}</span>
          <div className="sign-label">Diterima Oleh,</div>
          <div className="ttd-space"></div>
          <span className="sign-name">{diterimaOleh}</span>
        </div>
      </div>
      <style jsx>{`
        body {
          font-family: 'Times New Roman', Arial, sans-serif;
          font-size: 12pt;
          margin: 40px;
        }
        .slip-box {
          width: 1200px;
          margin: auto;
          padding: 24px 30px 32px 30px;
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .company-info {
          font-weight: bold;
          font-size: 15pt;
          letter-spacing: 1px;
          margin-left: 5px;
          max-width: 100%;
        }
        .company-detail {
          font-size: 11pt;
          margin-left: 5px;
          margin-top: 4px;
          margin-bottom: 4px;
          font-weight: normal;
          width: 530px;
        }
        .employee-info-table {
          margin-left: 0;
          margin-top: 2px;
          min-width: 180px;
          width: 400px;
        }
        .employee-info-table td {
          padding: 2px 4px 2px 0;
          font-size: 11pt;
          border: none;
        }
        .employee-info-table td:first-child {
          padding-left: 0;
          min-width: 58px;
          width: 58px;
        }
        .employee-info-table td:nth-child(2) {
          padding-left: 0;
          width: 10px;
        }
        .slip-title {
          text-align: center;
          margin: 16px 0 18px 0;
          font-size: 16pt;
          font-weight: bold;
        }
        .main-table {
          width: 100%;
          width: 1000;
          border-collapse: collapse;
          margin-bottom: 18px;
          font-size: 11pt;
        }
        .main-table th,
        .main-table td {
          padding: 4px 8px;
        }
        .main-table th {
          background: #f9f9f9;
        }
        .main-table .line-head {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          font-weight: bold;
        }
        .main-table .total-row {
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
          font-weight: bold;
        }
        .gaji-bersih {
          margin: 20px 0 0 9px;
          font-size: 12pt;
          font-weight: bold;
        }
        .gaji-box {
          display: inline-block;
          border: 1.5px solid #000;
          min-width: 110px;
          min-height: 20px;
          margin-left: 16px;
          vertical-align: middle;
          text-align: center;
          font-weight: normal;
          background: #fff;
        }
        .footer-sign {
          margin-top: 36px;
          width: 100%;
          display: flex;
          justify-content: space-between;
          font-size: 11pt;
        }
        .footer-sign .sign-col {
          text-align: center;
          width: 35%;
          min-width: 170px;
        }
        .footer-sign .center {
          width: 25%;
          text-align: center;
        }
        .ttd-space {
          height: 60px; 
        }
        .ttd-date {
          margin-bottom: 10px;
          font-size: 11pt;
          display: block;
        }
        .sign-kiri{
          margin-top: 28px;
          margin-bottom: 8px;
          font-size: 11pt;
        }
        .sign-label {
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
      `}</style>
      <style jsx global>{`
      @media print {
        .slip-box {
          width: 100vw !important;
          max-width: 100vw !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 12mm 16mm !important;
          font-size: 10pt !important;
          box-sizing: border-box;
          page-break-inside: avoid !important;
        }
        .main-table,
        .company-info,
        .company-detail,
        .employee-info-table,
        .gaji-bersih {
          font-size: 10pt !important;
        }
      }
      @page {
        size: A4 landscape;
        margin: 0;
      }
    `}</style>
    </div>
  );
};

export default SlipGaji;
