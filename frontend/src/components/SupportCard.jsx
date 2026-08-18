export default function SupportCard({ data }) {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <div className="card support-card">
        <h2>🟢 SUPPORT - Consumer Counsel</h2>
        <p>{data}</p>
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
          <div>{textContent}</div>
          {basisList.length > 0 && (
            <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {basisList.map((basis, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: "#e8f5e9",
                    color: "#1b5e20",
                    padding: "3px 8px",
                    borderRadius: "4px",
                    border: "1px solid #c8e6c9",
                    fontSize: "0.82rem",
                    fontWeight: "600"
                  }}
                >
                  📜 {basis.section || "Section"} ({basis.title || "CPA 2019"}{basis.page ? `, Page ${basis.page}` : ""})
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
    <div className="card support-card">
      <h2>🟢 SUPPORT (Consumer Counsel)</h2>

      {data.position && (
        <div>
          <h3>Position</h3>
          <p>{data.position}</p>
        </div>
      )}

      {data.keyArguments && data.keyArguments.length > 0 && (
        <div>
          <h3>Key Arguments</h3>
          <ul>
            {data.keyArguments.map((arg, i) => (
              <li key={i}>{renderItemWithBasis(arg, "argument")}</li>
            ))}
          </ul>
        </div>
      )}

      {data.evidenceNeeded && data.evidenceNeeded.length > 0 && (
        <div>
          <h3>Evidence Needed</h3>
          <ul>
            {data.evidenceNeeded.map((ev, i) => (
              <li key={i}>{typeof ev === "string" ? ev : JSON.stringify(ev)}</li>
            ))}
          </ul>
        </div>
      )}

      {data.possibleRemedies && data.possibleRemedies.length > 0 && (
        <div>
          <h3>Possible Remedies</h3>
          <ul>
            {data.possibleRemedies.map((rem, i) => (
              <li key={i}>{renderItemWithBasis(rem, "remedy")}</li>
            ))}
          </ul>
        </div>
      )}

      {data.unsupportedClaims && data.unsupportedClaims.length > 0 && (
        <div style={{ marginTop: "14px", padding: "10px", backgroundColor: "#fffde7", borderRadius: "6px", border: "1px solid #fff59d" }}>
          <h3 style={{ color: "#f57f17", margin: "0 0 6px 0", fontSize: "0.95rem" }}>⚠️ Unsupported Claims / Limits</h3>
          <ul style={{ margin: 0, paddingLeft: "18px" }}>
            {data.unsupportedClaims.map((claim, i) => (
              <li key={i} style={{ color: "#5d4037", fontSize: "0.9rem" }}>
                {typeof claim === "string" ? claim : JSON.stringify(claim)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.strength !== undefined && (
        <div style={{ marginTop: "15px", fontWeight: "bold" }}>
          Strength: {data.strength}%
        </div>
      )}
    </div>
  );
}