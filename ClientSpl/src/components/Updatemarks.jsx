import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

/* ---- Your rubric (ids must match pbl_criteria_id in DB) ---- */
const rubric = [
  { id: 1, key: "tech",         label: "Technical Implementation", weight: 40 },
  { id: 2, key: "innovation",   label: "Innovation & Creativity",  weight: 25 },
  { id: 3, key: "presentation", label: "Presentation Quality",     weight: 20 },
  { id: 4, key: "docs",         label: "Documentation",            weight: 15 },
];

/* ---- helpers ---- */
function groupToEditable(rows, rubricOrder) {
  // Map student -> { student_username, student_name, scores:{label:number}, comment:'' }
  const byStudent = new Map();
  for (const row of rows || []) {
    if (!byStudent.has(row.student_username)) {
      const emptyScores = Object.fromEntries(rubricOrder.map(r => [r.label, 0]));
      byStudent.set(row.student_username, {
        student_username: row.student_username,
        student_name: row.student_name ?? row.student_username,
        scores: { ...emptyScores },
        comment: '', // single comment field applied to all criteria on save
      });
    }
    const s = byStudent.get(row.student_username);
    s.scores[row.criteria_info] = Number(row.marks ?? 0);
  }
  // sort by name for stable UI
  return Array.from(byStudent.values()).sort((a,b) => a.student_name.localeCompare(b.student_name));
}

export default function App() {
  const location = useLocation();
  const { spldata, type, selectedTeamId } = location?.state || {};

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // local editable state (array of {student_username, student_name, scores:{label->num}, comment})
  const [editable, setEditable] = useState([]);

  // fetch
  useEffect(() => {
    const fetchMarks = async () => {
      if (!spldata?.pbl_id || !selectedTeamId || typeof type === 'undefined') return;
      setLoading(true);
      setErr(null);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:4000/api/pbl/${spldata.pbl_id}/marks/${type}`,
          {
            params: { team_id: selectedTeamId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const apiRows = res.data?.data?.marks ?? res.data?.marks ?? res.data ?? [];
        setRows(apiRows);
        setEditable(groupToEditable(apiRows, rubric));
      } catch (e) {
        setErr(e.response?.data?.error || e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, [spldata?.pbl_id, selectedTeamId, type]);

  // recompute totals for display
  const withTotals = useMemo(() => {
    return editable.map(s => {
      const vals = rubric.map(r => Number(s.scores[r.label] ?? 0));
      const total = vals.reduce((a,b)=>a+b,0);
      const average = vals.length ? total/vals.length : 0;
      return { ...s, total, average };
    });
  }, [editable]);

  const clamp01 = (n) => {
    const x = Number(n);
    if (Number.isNaN(x)) return 0;
    return Math.max(0, Math.min(10, x));
  };

  const handleScoreChange = (student_username, criterionLabel, value) => {
    setEditable(prev =>
      prev.map(s => s.student_username === student_username
        ? { ...s, scores: { ...s.scores, [criterionLabel]: clamp01(value) } }
        : s
      )
    );
  };

  const handleCommentChange = (student_username, value) => {
    setEditable(prev =>
      prev.map(s => s.student_username === student_username
        ? { ...s, comment: value }
        : s
      )
    );
  };


  const handleSaveStudent = async (student) => {
    try {
      const token = localStorage.getItem('token');

      let pbl_criteria_ids=[1,2,3,4]
      const updates = rubric.map(r => ({
        pbl_criteria_id: r.id,
        marks: Number(student.scores[r.label] ?? 0),
        comments: student.comment || '',
      }));
      console.log(updates)
      let marks=[]
      let comments=updates[0].comments
      updates.map((infos)=>{
        marks.push(infos.marks)
        
      })
      console.log(marks,pbl_criteria_ids)
      const payload = {
        pbl_id: spldata.pbl_id,
        presentation_type: type,   
        pbl_criteria_ids,      
        student_username: student.student_username,
        marks,
        comments
      };
      console.log(comments)
      console.log(payload)
      await axios.put(
        'http://localhost:4000/api/pbl/judge/update-marking',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // optional: toast/feedback
      alert(`Saved marks for ${student.student_name}`);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.error || 'Failed to save marks');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
            Team Evaluation — Update Marks
          </h1>
          <p className="text-slate-500 mt-1">
            PBL #{spldata?.pbl_id} • Team #{selectedTeamId} • Presentation Type: {type}
          </p>
        </header>

        {loading && (
          <div className="p-6 bg-white border border-slate-200 rounded-lg text-slate-600">
            Loading marks…
          </div>
        )}

        {err && !loading && (
          <div className="p-6 bg-white border border-rose-200 text-rose-600 rounded-lg">
            {String(err)}
          </div>
        )}

        {!loading && !err && (
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Student</th>
                  {rubric.map(r => (
                    <th key={r.id} className="px-4 py-3 text-left font-semibold text-slate-700">
                      {r.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Total</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Average</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Comments</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {withTotals.map(student => (
                  <tr key={student.student_username} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {student.student_name}{" "}
                      <span className="text-slate-400">({student.student_username})</span>
                    </td>

                    {rubric.map(r => (
                      <td key={r.id} className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={student.scores[r.label] ?? 0}
                          onChange={(e) => handleScoreChange(student.student_username, r.label, e.target.value)}
                          className="w-20 px-2 py-1 text-sm text-right border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                      </td>
                    ))}

                    <td className="px-4 py-3 font-semibold">{student.total}</td>
                    <td className="px-4 py-3">{student.average.toFixed(2)}</td>

                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={student.comment}
                        onChange={(e) => handleCommentChange(student.student_username, e.target.value)}
                        placeholder="Optional comment"
                        className="w-56 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSaveStudent(student)}
                        className="px-4 py-2 text-xs font-semibold bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}

                {withTotals.length === 0 && (
                  <tr>
                    <td colSpan={rubric.length + 4} className="px-4 py-6 text-slate-500 text-center">
                      No marks found for this team / presentation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
