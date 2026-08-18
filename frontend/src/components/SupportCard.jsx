export default function SupportCard({ data }) {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <div className="docket-card petitioner-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 className="font-serif" style={{ color: "var(--courtroom-green-bright)", fontSize: "1.1rem" }}>
            ⚖️ PETITIONER AI (Consumer Counsel)
          </h3>
        </div>
        <p style={{ color: "var(--text-parchment)" }}>{data}</p>
      </div>
    );
  }

  const renderItemWithBasis = (item, textKey) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (typeof item === "object") {
      const textContent = item[textKey] || item.argument || item.remedy || item.text || JSON.stringify(item);
      const basisList = Array.isArray(item.legalBasis) ? item.legalBasis : [];

      return (
        <div>
          <div style={{ color: "var(--text-parchment)", marginBottom: "4px" }}>{textContent}</div>
          {basisList.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
              {basisList.map((basis, idx) => (
                <span
                  key={idx}
                  className="font-mono"
                  style={{
                    backgroundColor: "rgba(46, 92, 78, 0.25)",
                    color: "#52B788",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    border: "1px solid rgba(82, 183, 136, 0.4)",
                    fontSize: "0.78rem"
                  }}
                >
                  📜 {basis.section || "Section"} ({basis.title || "CPA 2019"}{basis.page ? `, p.${basis.page}` : ""})
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }
    return String(item);
  };

  return (
    <div className="docket-card petitioner-panel">
      {/* Panel Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid var(--border-hairline)" }}>
        <h3 className="font-serif" style={{ color: "#52B788", fontSize: "1.15rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🟢</span> PETITIONER COUNSEL
        </h3>
        {data.strength !== undefined && (
          <span className="font-mono" style={{ backgroundColor: "rgba(46, 92, 78, 0.3)", color: "#52B788", padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem", border: "1px solid rgba(82, 183, 136, 0.4)" }}>
            CLAIM STRENGTH: {data.strength}%
          </span>
        )}
      </div>

      {/* Position */}
      {data.position && (
        <div style={{ marginBottom: "16px" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            Factual & Legal Position
          </div>
          <p style={{ fontSize: "0.95rem", color: "var(--text-parchment)", fontStyle: "italic", lineHeight: "1.5" }}>
            "{data.position}"
          </p>
        </div>
      )}

      {/* Key Arguments */}
      {data.keyArguments && data.keyArguments.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            Key Statutory Arguments
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
            {data.keyArguments.map((arg, i) => (
              <li key={i} style={{ color: "var(--text-parchment)" }}>
                {renderItemWithBasis(arg, "argument")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Needed */}
      {data.evidenceNeeded && data.evidenceNeeded.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            Evidentiary Burden
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
            {data.evidenceNeeded.map((ev, i) => (
              <li key={i}>{typeof ev === "string" ? ev : JSON.stringify(ev)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Possible Remedies */}
      {data.possibleRemedies && data.possibleRemedies.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            Statutory Relief Sought
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.possibleRemedies.map((rem, i) => (
              <li key={i} style={{ color: "var(--text-parchment)" }}>
                {renderItemWithBasis(rem, "remedy")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unsupported Claims */}
      {data.unsupportedClaims && data.unsupportedClaims.length > 0 && (
        <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "rgba(139, 46, 46, 0.12)", borderRadius: "4px", border: "1px solid rgba(139, 46, 46, 0.3)" }}>
          <div className="font-mono" style={{ color: "#E63946", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            ⚠️ Claim Limits / Unretrieved Context
          </div>
          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {data.unsupportedClaims.map((claim, i) => (
              <li key={i}>{typeof claim === "string" ? claim : JSON.stringify(claim)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}