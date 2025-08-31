import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function App() {
  const [submitLinks, setSubmitLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const { spldata, team } = location?.state || {};

  // Map presentation_type → label
  const typeLabels = {
    1: "Proposal Presentation Link",
    2: "Progress Presentation Link",
    3: "Final Presentation Link",
    4: "YouTube Demo Link",
    5: "GitHub Repository Link",
  };

  useEffect(() => {
    const getFiles = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:4000/api/pbl/${spldata.pbl_id}/team/${team.team_id}/files`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const files = response.data.data.files || [];
        console.log("Fetched files:", files);

        // Build a list of all 5 slots, filling in fetched URLs when available
        const formatted = Object.entries(typeLabels).map(([id, label]) => {
          const fileObj = files.find(f => f.presentation_type === Number(id));
          return {
            id: Number(id),
            label,
            url: fileObj ? fileObj.presentation_file : "",
          };
        });

        setSubmitLinks(formatted);
      } catch (err) {
        console.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    };

    if (spldata?.pbl_id && team?.team_id) {
      getFiles();
    }
  }, [spldata, team]);

  if (loading) {
    return <h1>Please wait...</h1>;
  }

  return (
    <div className="min-h-screen space-y-2 flex-col bg-slate-100 flex items-center justify-center p-4 font-sans">
      <h1 className="font-bold text-4xl">{team?.team_name}</h1>

      <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 text-center mb-8">
          Submission Links
        </h1>

        <div className="space-y-6">
          {submitLinks.map(link => (
            <div key={link.id}>
              <label
                htmlFor={`link-input-${link.id}`}
                className="block mb-2 text-sm font-semibold text-slate-600"
              >
                {link.label}
              </label>
              <input
                id={`link-input-${link.id}`}
                type="text"
                value={link.url}
                readOnly
                placeholder="Not submitted yet"
                className="w-full p-3 text-base text-slate-700 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
