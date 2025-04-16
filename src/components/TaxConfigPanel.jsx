export default function TaxConfigPanel({ taxConfig, setTaxConfig }) {
    const handleChange = (range, value) => {
      setTaxConfig(prev => ({
        ...prev,
        [range]: value
      }));
    };
  
    return (
      <div className="bg-obsDark border border-obsRed p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold text-obsRed mb-4">⚙️ Steuer-Konfiguration</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <label className="text-obsGray">Level 0–9:</label>
            <input
              type="text"
              value={taxConfig.low}
              onChange={(e) => handleChange("low", e.target.value)}
              className="p-1 rounded text-black w-24"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-obsGray">Level 10–19:</label>
            <input
              type="text"
              value={taxConfig.mid}
              onChange={(e) => handleChange("mid", e.target.value)}
              className="p-1 rounded text-black w-24"
            />
          </div>
          <div className="flex justify-between items-center">
            <label className="text-obsGray">Level 20+:</label>
            <input
              type="text"
              value={taxConfig.high}
              onChange={(e) => handleChange("high", e.target.value)}
              className="p-1 rounded text-black w-24"
            />
          </div>
        </div>
      </div>
    );
  }
  