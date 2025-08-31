import React from 'react';

const AddMarksModal = () => {
  // Mock data that would normally come from props or state
  const teamName = "Wayne Enterprises";
  const criteria = [
    { id: 'innovation', name: 'Innovation & Creativity', max_marks: 20, description: 'Originality and creativity of the idea.' },
    { id: 'implementation', name: 'Technical Implementation', max_marks: 30, description: 'Quality of code and technical execution.' },
    { id: 'design', name: 'Design & User Experience', max_marks: 25, description: 'Is the project intuitive and well-designed?' },
    { id: 'pitch', name: 'Presentation & Pitch', max_marks: 25, description: 'Clarity and effectiveness of the presentation.' },
  ];

  return (
    <div className="fixed inset-0 bg-[#E9F0FF] bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add Marks</h2>
            <p className="text-gray-600">for team <span className="font-semibold text-indigo-600">{teamName}</span></p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
        </div>
        
        {/* Form Body */}
        <form>
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {criteria.map((criterion) => (
                <div key={criterion.id} className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-2">
                    <label className="font-semibold text-gray-700">{criterion.name}</label>
                    <p className="text-sm text-gray-500">{criterion.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      max={criterion.max_marks}
                      required
                      className="w-full text-center font-semibold text-lg p-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <span className="font-medium text-gray-500">/ {criterion.max_marks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Modal Footer */}
          <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-end items-center gap-4">
            <button type="button" className="font-semibold text-gray-600 hover:text-gray-800 transition">
              Cancel
            </button>
            <button 
              type="submit" 
              className="font-semibold text-white bg-blue-600 hover:bg-indigo-700 transition-colors duration-200 px-6 py-3 rounded-full text-sm whitespace-nowrap"
            >
              Submit Marks
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMarksModal;