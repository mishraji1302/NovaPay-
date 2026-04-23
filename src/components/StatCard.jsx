/**
 * StatCard.jsx — Display a labelled statistic in a glass card.
 */
export default function StatCard({ label, value }) {
  return (
    <div className="glass glass-hover" style={{ padding: "18px 20px" }}>
      <p style={{ margin: "0 0 6px", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>
        {label}
      </p>
      <h2 className="text-mono" style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>{value}</h2>
    </div>
  );
}
