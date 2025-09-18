import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  MapPin,
  Ruler,
  Tag,
  FileText,
  AlertTriangle,
  Building2,
  Calculator,
} from "lucide-react";

function Prediction() {
  const [formData, setFormData] = useState({
    distance_from_road: "",
    nearby_landmark: "",
    landmark_distance: "",
    content_category: "",
    width: "",
    height: "",
  });

  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await fetch("http://localhost:5000/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setResponse({ success: false, reason: "⚠️ Backend not reachable" });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateArea = () => {
    const width = parseFloat(formData.width) || 0;
    const height = parseFloat(formData.height) || 0;
    return width * height;
  };

  const getFieldIcon = (fieldName: string) => {
    const icons: Record<string, JSX.Element> = {
      distance_from_road: <Ruler className="w-5 h-5 text-blue-600" />,
      nearby_landmark: <MapPin className="w-5 h-5 text-green-600" />,
      landmark_distance: <Building2 className="w-5 h-5 text-purple-600" />,
      content_category: <Tag className="w-5 h-5 text-orange-600" />,
      width: <Calculator className="w-5 h-5 text-indigo-600" />,
      height: <Calculator className="w-5 h-5 text-indigo-600" />,
    };
    return icons[fieldName] || <FileText className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          Billboard Compliance Checker
        </h1>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(formData).map((field) => (
            <div
              key={field}
              className={`flex items-center border rounded-lg px-3 py-2 transition ${
                focusedField === field
                  ? "border-blue-500 shadow"
                  : "border-gray-300"
              }`}
            >
              {getFieldIcon(field)}
              <input
                type="text"
                name={field}
                value={(formData as any)[field]}
                onChange={handleChange}
                onFocus={() => setFocusedField(field)}
                onBlur={() => setFocusedField(null)}
                placeholder={field.replace("_", " ").toUpperCase()}
                className="ml-3 w-full outline-none text-gray-700"
              />
            </div>
          ))}
        </div>

        {/* Area Calculation */}
        <div className="mt-4 text-sm text-gray-600">
          Estimated Area:{" "}
          <span className="font-semibold text-indigo-600">
            {calculateArea()} sq units
          </span>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 flex items-center justify-center"
        >
          {isLoading ? "Checking..." : "Check Compliance"}
        </button>

        {/* Response */}
        {response && (
          <div className="mt-6 p-6 rounded-xl border bg-gray-50 shadow-inner">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Compliance Result
            </h2>

            {/* Status */}
            <div className="flex items-center gap-2 mb-3">
              {response.success ? (
                response.allowed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )
              ) : (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              )}
              <span
                className={`font-semibold ${
                  response.success
                    ? response.allowed
                      ? "text-green-700"
                      : "text-red-700"
                    : "text-yellow-700"
                }`}
              >
                {response.success
                  ? response.allowed
                    ? "✅ Compliant"
                    : "❌ Not Compliant"
                  : "⚠️ Check Failed"}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 text-gray-700">
              <p>
                <span className="font-medium">Success:</span>{" "}
                {response.success ? "Yes" : "No"}
              </p>
              {"allowed" in response && (
                <p>
                  <span className="font-medium">Allowed:</span>{" "}
                  {response.allowed ? "Yes" : "No"}
                </p>
              )}
              {response.reason && (
                <p className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span>{response.reason}</span>
                </p>
              )}
            </div>

            {/* Highlight Box */}
            {response.success && "allowed" in response && (
              <div
                className={`mt-4 p-3 rounded-lg text-center font-medium ${
                  response.allowed
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {response.allowed
                  ? "✅ Content is Compliant with all rules!"
                  : "❌ Content is NOT compliant. Please review."}
              </div>
            )}

            {!response.success && (
              <div className="mt-4 bg-yellow-100 text-yellow-700 p-3 rounded-lg font-medium text-center">
                ⚠️ {response.reason}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Prediction;
