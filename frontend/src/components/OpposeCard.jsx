export default function OpposeCard({ data }) {
  if (!data) return null;

  if (typeof data === "string") {
    return (
      <div className="card oppose-card">
        <h2>🔴 OPPOSE - Company Counsel</h2>
        <p>{data}</p>
      </div>
    );
  }

  const renderTextOrObject = (item) => {
    if (!item) return null;
    if (typeof item === "string") return item;
    if (typeof item === "object") {
      return item.argument || item.defense || item.weakness || item.text || JSON.stringify(item);
    }
    return String(item);
  };

  return (
    <div className="card oppose-card">
      <h2>🔴 OPPOSE (Company Counsel)</h2>

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
              <li key={i}>{renderTextOrObject(arg)}</li>
            ))}
          </ul>
        </div>
      )}

      {data.weaknessesInClaim && data.weaknessesInClaim.length > 0 && (
        <div>
          <h3>Weaknesses in Claim</h3>
          <ul>
            {data.weaknessesInClaim.map((wk, i) => (
              <li key={i}>{renderTextOrObject(wk)}</li>
            ))}
          </ul>
        </div>
      )}

      {data.defenses && data.defenses.length > 0 && (
        <div>
          <h3>Defenses</h3>
          <ul>
            {data.defenses.map((def, i) => (
              <li key={i}>{renderTextOrObject(def)}</li>
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