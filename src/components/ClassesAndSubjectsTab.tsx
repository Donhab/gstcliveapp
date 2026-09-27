import React, { useState } from 'react';
import { SchoolClass, Subject, TeachingAssignment, Staff } from '../types/school';
import { GraduationCap, Plus, BookOpen, Layers, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClassesAndSubjectsTabProps {
  type: 'classes' | 'subjects' | 'assignments';
  classes: SchoolClass[];
  subjects: Subject[];
  staff: Staff[];
  assignments: TeachingAssignment[];
  onAddClass: (c: Omit<SchoolClass, 'id'>) => Promise<void>;
  onAddSubject: (s: Omit<Subject, 'id'>) => Promise<void>;
  onAddAssignment: (a: Omit<TeachingAssignment, 'id'>) => Promise<void>;
  onDeleteAssignment: (id: string) => Promise<void>;
}

export const ClassesAndSubjectsTab: React.FC<ClassesAndSubjectsTabProps> = ({
  type,
  classes,
  subjects,
  staff,
  assignments,
  onAddClass,
  onAddSubject,
  onAddAssignment,
  onDeleteAssignment
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  // New Class Form
  const [className, setClassName] = useState('');
  const [classArm, setClassArm] = useState('Tech');
  const [formTeacher, setFormTeacher] = useState('');

  // New Subject Form
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subCategory, setSubCategory] = useState<Subject['category']>('Technical / Vocational');

  // New Assignment Form
  const [assignTeacher, setAssignTeacher] = useState(staff[0]?.id || '');
  const [assignSubject, setAssignSubject] = useState(subjects[0]?.id || '');
  const [assignClass, setAssignClass] = useState(classes[0]?.id || '');
  const [periods, setPeriods] = useState(4);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddClass({
      name: className,
      arm: classArm,
      level: className,
      formTeacherName: formTeacher || 'Unassigned'
    });
    setClassName('');
    setFormTeacher('');
    setModalOpen(false);
    confetti({ particleCount: 30 });
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddSubject({
      code: subCode || `GSTC${Math.floor(100 + Math.random() * 900)}`,
      name: subName,
      category: subCategory,
      classesOffered: ['CCS 1', 'Garment 1']
    });
    setSubCode('');
    setSubName('');
    setModalOpen(false);
    confetti({ particleCount: 30 });
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const stf = staff.find((s) => s.id === assignTeacher) || staff[0];
    const sub = subjects.find((s) => s.id === assignSubject) || subjects[0];
    const cls = classes.find((c) => c.id === assignClass) || classes[0];

    await onAddAssignment({
      teacherId: stf.id,
      teacherName: stf.fullName,
      subjectId: sub.id,
      subjectName: sub.name,
      classId: cls.id,
      className: cls.name,
      periodsPerWeek: periods
    });
    setModalOpen(false);
    confetti({ particleCount: 30 });
  };

  if (type === 'classes') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
          <div>
            <h2 className="text-base font-bold text-stone-900">Registered Classes ({classes.length})</h2>
            <p className="text-xs text-stone-500">Arms, levels and designated form masters</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-lg bg-emerald-50 text-[#0b4d2c] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-stone-100 text-stone-600 rounded">
                  {cls.arm}
                </span>
              </div>
              <h3 className="text-base font-bold text-stone-900">{cls.name}</h3>
              <p className="text-xs text-stone-500 mt-1">Form Teacher: <strong className="text-stone-700">{cls.formTeacherName}</strong></p>
            </div>
          ))}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <h3 className="font-bold text-base text-stone-900 mb-3">Add New Class</h3>
              <form onSubmit={handleCreateClass} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Class Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electrical 1, SS 1 Tech"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Department / Arm</label>
                  <input
                    type="text"
                    placeholder="e.g. Vocational, Technical, Commercial"
                    value={classArm}
                    onChange={(e) => setClassArm(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Form Master</label>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Danjuma Bello"
                    value={formTeacher}
                    onChange={(e) => setFormTeacher(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 text-xs text-stone-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#0b4d2c] text-white text-xs font-bold rounded-lg">Save Class</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'subjects') {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
          <div>
            <h2 className="text-base font-bold text-stone-900">Curriculum Subjects ({subjects.length})</h2>
            <p className="text-xs text-stone-500">Core academic, vocational, and technical subjects</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <div key={sub.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2 py-0.5 rounded">
                  {sub.code}
                </span>
                <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                  {sub.category}
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 mt-2">{sub.name}</h3>
              <p className="text-xs text-stone-400 mt-1">
                Offered in: {sub.classesOffered?.join(', ') || 'All classes'}
              </p>
            </div>
          ))}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
              <h3 className="font-bold text-base text-stone-900 mb-3">Add Subject</h3>
              <form onSubmit={handleCreateSubject} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CST101, GMC102, ENG101"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Subject Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electrical Installation & Maintenance"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Subject Category</label>
                  <select
                    value={subCategory}
                    onChange={(e: any) => setSubCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                  >
                    <option value="Technical / Vocational">Technical / Vocational</option>
                    <option value="Core">Core Academic</option>
                    <option value="Elective">Elective</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 text-xs text-stone-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#0b4d2c] text-white text-xs font-bold rounded-lg">Save Subject</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Assignments Tab
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
        <div>
          <h2 className="text-base font-bold text-stone-900">Teaching Assignments ({assignments.length})</h2>
          <p className="text-xs text-stone-500">Teacher to subject & class allocations</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Assign Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Teacher</th>
              <th className="py-3 px-4">Periods/Week</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {assignments.map((asg) => (
              <tr key={asg.id} className="hover:bg-emerald-50/40">
                <td className="py-3 px-4 font-bold text-stone-900">{asg.subjectName}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-stone-100 rounded text-stone-700 font-medium">{asg.className}</span>
                </td>
                <td className="py-3 px-4 font-medium text-emerald-800">{asg.teacherName}</td>
                <td className="py-3 px-4">{asg.periodsPerWeek} Periods</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onDeleteAssignment(asg.id)}
                    className="text-stone-400 hover:text-red-600 p-1"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-3">Create Teaching Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Teacher</label>
                <select
                  value={assignTeacher}
                  onChange={(e) => setAssignTeacher(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>{st.fullName} ({st.staffId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Subject</label>
                <select
                  value={assignSubject}
                  onChange={(e) => setAssignSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Class</label>
                <select
                  value={assignClass}
                  onChange={(e) => setAssignClass(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Periods Per Week</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={periods}
                  onChange={(e) => setPeriods(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-3 py-1.5 text-xs text-stone-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#0b4d2c] text-white text-xs font-bold rounded-lg">Assign Teacher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
