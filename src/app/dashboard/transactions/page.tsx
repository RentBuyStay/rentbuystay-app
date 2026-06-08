"use client";

import Image from "next/image";
import { useGetBillingQuery } from "@/services/subscriptionApi";
import { toBillingRowVM, type BillingStatusLabel } from "@/lib/subscription";
import { formatPrice } from "@/lib/property";

const STATUS_STYLES: Record<BillingStatusLabel, { bg: string; color: string }> = {
  Paid: { bg: "#ECFDF3", color: "#027A48" },
  Pending: { bg: "#FFF7E9", color: "#EA651A" },
  Failed: { bg: "#FFECF1", color: "#E30045" },
};

const COLS = [
  { key: "ref", label: "Reference ID", width: 280 },
  { key: "plan", label: "Plan", width: 240 },
  { key: "amount", label: "Amount", width: 200 },
  { key: "date", label: "Date", width: 180 },
  { key: "status", label: "Status", width: 144 },
];

export default function TransactionsPage() {
  const { data: page, isLoading, isError } = useGetBillingQuery({ page: 0, size: 100 });
  const transactions = page?.content ?? [];
  const rows = transactions.map(toBillingRowVM);

  const totalSpent = transactions
    .filter((t) => ["SUCCESS", "PAID", "COMPLETED", "ACTIVE"].includes(t.status?.toUpperCase()))
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const successful = rows.filter((r) => r.status === "Paid").length;
  const failed = rows.filter((r) => r.status === "Failed").length;

  const metrics = [
    { label: "Total Transactions", value: String(page?.totalElements ?? rows.length), icon: "/icons/dash/metric-coin.svg" },
    { label: "Total Spent", value: formatPrice(totalSpent), icon: "/icons/dash/metric-dollar.svg" },
    { label: "Successful", value: String(successful), icon: "/icons/dash/metric-dollar.svg" },
    { label: "Failed", value: String(failed), icon: "/icons/dash/metric-home.svg" },
  ];

  function exportCsv() {
    const header = ["Reference", "Plan", "Amount", "Date", "Status"];
    const lines = rows.map((r) => [r.ref, r.plan, r.amount, r.date, r.status].map((v) => `"${v}"`).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={exportCsv}
          disabled={rows.length === 0}
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
            cursor: rows.length === 0 ? "not-allowed" : "pointer",
            opacity: rows.length === 0 ? 0.6 : 1,
          }}
        >
          <Image src="/icons/dash/export.svg" alt="" width={20} height={20} />
          Export CSV
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {metrics.map((m) => (
          <div key={m.label} className="bg-white flex flex-col" style={{ border: "1px solid #F6F6F6", borderRadius: "20px", padding: "24px", gap: "16px" }}>
            <div className="flex items-center" style={{ gap: "8px" }}>
              <Image src={m.icon} alt="" width={16} height={16} />
              <span style={{ fontSize: "12px", lineHeight: "24px", fontWeight: 500, color: "#807E7E" }}>{m.label}</span>
            </div>
            <span style={{ fontSize: "32px", lineHeight: "40px", fontWeight: 600, color: "#121212" }}>{m.value}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "16px", lineHeight: "32px", fontWeight: 500, color: "#121212" }}>
        Transaction History
      </h2>

      <div style={{ width: "100%", border: "1px solid #F6F6F6", borderRadius: "20px", overflow: "hidden" }}>
        <div className="flex" style={{ background: "#FFFFFF", borderBottom: "1px solid #F6F6F6" }}>
          {COLS.map((c) => (
            <div key={c.key} style={{ flex: `1 1 ${c.width}px`, padding: "12px 24px", fontSize: "12px", lineHeight: "20px", fontWeight: 500, color: "#807E7E" }}>
              {c.label}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#807E7E", fontSize: "14px", background: "#fff" }}>Loading transactions…</div>
        ) : isError ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#807E7E", fontSize: "14px", background: "#fff" }}>Couldn&rsquo;t load transactions.</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#807E7E", fontSize: "14px", background: "#fff" }}>No transactions yet.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-center" style={{ borderBottom: "1px solid #F6F6F6", background: "#FFFFFF" }}>
              <div style={{ flex: `1 1 ${COLS[0].width}px`, padding: "16px 24px", fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                {r.ref}
              </div>
              <div style={{ flex: `1 1 ${COLS[1].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                {r.plan}
              </div>
              <div style={{ flex: `1 1 ${COLS[2].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", fontWeight: 500, color: "#121212" }}>
                {r.amount}
              </div>
              <div style={{ flex: `1 1 ${COLS[3].width}px`, padding: "16px 24px", fontSize: "14px", lineHeight: "20px", color: "#121212" }}>
                {r.date}
              </div>
              <div style={{ flex: `1 1 ${COLS[4].width}px`, padding: "16px 24px" }}>
                <span
                  className="inline-flex items-center justify-center"
                  style={{ padding: "2px 8px", background: STATUS_STYLES[r.status].bg, color: STATUS_STYLES[r.status].color, borderRadius: "16px", fontSize: "12px", lineHeight: "18px", fontWeight: 500 }}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
