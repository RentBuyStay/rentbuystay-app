"use client";

import Image from "next/image";

type TxRow = {
  id: string;
  property: string;
  location: string;
  type: "Apartment" | "Duplex" | "Commercial" | "House" | "Land";
  price: string;
  date: string;
  status: "Archived" | "Active" | "Paid" | "Failed" | "Pending";
};

const METRICS = [
  { label: "Total Listings", value: "12", icon: "/icons/dash/metric-home.svg" },
  { label: "Total Deals", value: "8", icon: "/icons/dash/metric-coin.svg" },
  { label: "Revenue", value: "₦840k", icon: "/icons/dash/metric-dollar.svg" },
  { label: "Additional Earnings", value: "₦293k", icon: "/icons/dash/metric-dollar.svg" },
];

const ROWS: TxRow[] = [
  { id: "RBS-L-004821", property: "3-Bedroom Flat, Lekki Phase 1", location: "Lekki Phase 1, Lagos", type: "Apartment", price: "₦2,800,000.00/yr", date: "12 Apr 2026", status: "Archived" },
  { id: "RBS-L-004822", property: "2-Bedroom Apartment, Victoria Island", location: "Victoria Island, Lagos", type: "Apartment", price: "₦4,500,000.00/yr", date: "1 Apr 2026", status: "Archived" },
  { id: "RBS-L-004823", property: "4-Bedroom Duplex, Ikoyi", location: "Ikoyi, Lagos", type: "Duplex", price: "₦260,000,000.00", date: "15 Mar 2026", status: "Archived" },
  { id: "RBS-L-004824", property: "Office Space, Ikeja GRA", location: "Ikeja GRA, Lagos", type: "Commercial", price: "₦3,400,000.00/yr", date: "2 Mar 2026", status: "Archived" },
  { id: "RBS-L-004825", property: "3-Bedroom Flat, Lekki Phase 1", location: "Lekki Phase 1, Lagos", type: "Apartment", price: "₦4,800,000.00/yr", date: "13 Feb 2026", status: "Archived" },
  { id: "RBS-L-004826", property: "2-Bedroom Flat, Lekki Phase 1", location: "Lekki Phase 1, Lagos", type: "Apartment", price: "₦4,800,000.00/yr", date: "13 Feb 2026", status: "Archived" },
];

const STATUS_STYLES: Record<TxRow["status"], { bg: string; color: string }> = {
  Archived: { bg: "rgba(138,56,245,0.08)", color: "#8A38F5" },
  Active: { bg: "#ECFDF3", color: "#027A48" },
  Paid: { bg: "#ECFDF3", color: "#027A48" },
  Pending: { bg: "#FFF7E9", color: "#EA651A" },
  Failed: { bg: "#FFECF1", color: "#E30045" },
};

const COLS = [
  { key: "id", label: "Property ID", width: 149 },
  { key: "property", label: "Property", width: 330 },
  { key: "type", label: "Type", width: 135 },
  { key: "price", label: "Price", width: 184 },
  { key: "date", label: "Date", width: 145 },
  { key: "status", label: "Status", width: 144 },
];

export default function TransactionsPage() {
  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>

      <div className="flex justify-end">
        <button
          type="button"
          className="flex items-center justify-center text-white hover:opacity-90 transition-opacity"
          style={{
            height: "48px",
            padding: "8px 24px",
            gap: "8px",
            background: "linear-gradient(175deg, #75A3C7 0%, #305E82 100%)",
            border: "1px solid rgba(120,158,187,0.5)",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <Image src="/icons/dash/export.svg" alt="" width={20} height={20} />
          Export CSV
        </button>
      </div>


      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {METRICS.map((m) => (
          <div
            key={m.label}
            className="bg-white flex flex-col"
            style={{
              border: "1px solid #F6F6F6",
              borderRadius: "20px",
              padding: "24px",
              gap: "16px",
            }}
          >
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src={m.icon} alt="" width={16} height={16} />
              <span
                style={{
                  fontSize: "12px",
                  lineHeight: "24px",
                  fontWeight: 500,
                  color: "#807E7E",
                }}
              >
                {m.label}
              </span>
            </div>
            <span
              style={{
                fontSize: "32px",
                lineHeight: "40px",
                fontWeight: 600,
                color: "#121212",
              }}
            >
              {m.value}
            </span>
          </div>
        ))}
      </div>


      <h2
        style={{
          fontSize: "16px",
          lineHeight: "32px",
          fontWeight: 500,
          color: "#121212",
        }}
      >
        Transaction History
      </h2>


      <div
        style={{
          width: "100%",
          border: "1px solid #F6F6F6",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >

        <div className="flex" style={{ background: "#FFFFFF", borderBottom: "1px solid #F6F6F6" }}>
          {COLS.map((c) => (
            <div
              key={c.key}
              style={{
                flex: `1 1 ${c.width}px`,
                padding: "12px 24px",
                fontSize: "12px",
                lineHeight: "20px",
                fontWeight: 500,
                color: "#807E7E",
              }}
            >
              {c.label}
            </div>
          ))}
        </div>


        {ROWS.map((r) => (
          <div
            key={r.id}
            className="flex items-center"
            style={{ borderBottom: "1px solid #F6F6F6", background: "#FFFFFF" }}
          >

            <div
              style={{
                flex: `1 1 ${COLS[0].width}px`,
                padding: "16px 24px",
                fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
                color: "#121212",
              }}
            >
              {r.id}
            </div>


            <div
              className="flex flex-col"
              style={{
                flex: `1 1 ${COLS[1].width}px`,
                padding: "16px 24px",
                gap: "4px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: 500,
                  color: "#121212",
                }}
              >
                {r.property}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  lineHeight: "18px",
                  fontWeight: 400,
                  color: "#807E7E",
                }}
              >
                {r.location}
              </span>
            </div>


            <div
              style={{
                flex: `1 1 ${COLS[2].width}px`,
                padding: "16px 24px",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
                color: "#121212",
              }}
            >
              {r.type}
            </div>


            <div
              style={{
                flex: `1 1 ${COLS[3].width}px`,
                padding: "16px 24px",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 500,
                color: "#305E82",
              }}
            >
              {r.price}
            </div>


            <div
              style={{
                flex: `1 1 ${COLS[4].width}px`,
                padding: "16px 24px",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: 400,
                color: "#121212",
              }}
            >
              {r.date}
            </div>


            <div
              style={{ flex: `1 1 ${COLS[5].width}px`, padding: "16px 24px" }}
            >
              <StatusBadge status={r.status} />
            </div>
          </div>
        ))}

        <Pagination />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: TxRow["status"] }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{
        padding: "2px 8px",
        background: s.bg,
        color: s.color,
        borderRadius: "16px",
        fontSize: "12px",
        lineHeight: "18px",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}

function Pagination() {
  const pages: (number | "ellipsis")[] = [1, 2, 3, "ellipsis", 8, 9, 10];
  const current = 1;

  return (
    <div
      className="flex items-center justify-between"
      style={{
        padding: "16px 24px",
        background: "#FFFFFF",
      }}
    >
      <button
        type="button"
        className="flex items-center hover:opacity-80"
        style={{
          height: "40px",
          padding: "8px 16px",
          gap: "8px",
          background: "#FFFFFF",
          border: "1px solid #EDEDED",
          borderRadius: "8px",
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: 500,
          color: "#807E7E",
          cursor: "pointer",
        }}
      >
        <Image src="/icons/arrow-left.svg" alt="" width={16} height={16} />
        Previous
      </button>

      <div className="flex items-center" style={{ gap: "4px" }}>
        {pages.map((p, i) => {
          if (p === "ellipsis") {
            return (
              <span
                key={`e-${i}`}
                className="flex items-center justify-center"
                style={{
                  width: "40px",
                  height: "40px",
                  fontSize: "14px",
                  color: "#807E7E",
                }}
              >
                …
              </span>
            );
          }
          const active = p === current;
          return (
            <button
              key={p}
              type="button"
              className="flex items-center justify-center hover:opacity-80"
              style={{
                width: "40px",
                height: "40px",
                background: active ? "#F6F6F6" : "transparent",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: active ? 600 : 400,
                color: active ? "#121212" : "#807E7E",
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="flex items-center hover:opacity-80"
        style={{
          height: "40px",
          padding: "8px 16px",
          gap: "8px",
          background: "#FFFFFF",
          border: "1px solid #EDEDED",
          borderRadius: "8px",
          fontSize: "14px",
          lineHeight: "20px",
          fontWeight: 500,
          color: "#807E7E",
          cursor: "pointer",
        }}
      >
        Next
        <Image
          src="/icons/arrow-left.svg"
          alt=""
          width={16}
          height={16}
          style={{ transform: "rotate(180deg)" }}
        />
      </button>
    </div>
  );
}
