export default function OpposeCard({ data }) {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <div className="docket-card respondent-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 className="font-serif" style={{ color: "#E63946", fontSize: "1.1rem" }}>
            ⚖️ RESPONDENT AI (Defense Counsel)
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
      const textContent = item[textKey] || item.argument || item.defense || item.text || JSON.stringify(item);
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
                    backgroundColor: "rgba(139, 46, 46, 0.25)",
                    color: "#F87171",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    border: "1px solid rgba(248, 113, 113, 0.35)",
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
    <div className="docket-card respondent-panel">
      {/* Panel Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid var(--border-hairline)" }}>
        <h3 className="font-serif" style={{ color: "#E63946", fontSize: "1.15rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🔴</span> RESPONDENT COUNSEL
        </h3>
        {data.strength !== undefined && (
          <span className="font-mono" style={{ backgroundColor: "rgba(139, 46, 46, 0.3)", color: "#F87171", padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem", border: "1px solid rgba(248, 113, 113, 0.4)" }}>
            DEFENSE STRENGTH: {data.strength}%
          </span>
        )}
      </div>

      {/* Position */}
      {data.position && (
        <div style={{ marginBottom: "16px" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            Defense Stance & Challenge
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
            Statutory Objections & Proof Challenges
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

      {/* Weaknesses in Consumer Claim */}
      {data.weaknessesInConsumerClaim && data.weaknessesInConsumerClaim.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            Pleading Shortcomings
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "4px" }}>
            {data.weaknessesInConsumerClaim.map((weakness, i) => (
              <li key={i}>{typeof weakness === "string" ? weakness : JSON.stringify(weakness)}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Defenses Supported By Law */}
      {data.defensesSupportedByRetrievedLaw && data.defensesSupportedByRetrievedLaw.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div className="font-mono text-muted" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
            Supported Statutory Defenses
          </div>
          <ul style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.defensesSupportedByRetrievedLaw.map((def, i) => (
              <li key={i} style={{ color: "var(--text-parchment)" }}>
                {renderItemWithBasis(def, "defense")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Unsupported Defense Claims */}
      {data.unsupportedClaims && data.unsupportedClaims.length > 0 && (
        <div style={{ marginTop: "14px", padding: "10px 14px", backgroundColor: "rgba(201, 169, 97, 0.08)", borderRadius: "4px", border: "1px solid var(--border-hairline)" }}>
          <div className="font-mono text-brass" style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            ⚠️ Rejected Pretrained Defenses (Not in CPA 2019)
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