import React, { useState } from 'react';
import { Student, ExamResult, ScratchCard } from '../types/school';
import { SchoolBadge } from './SchoolBadge';
import {
  GraduationCap,
  CreditCard,
  Printer,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  School,
  FileText,
  AlertTriangle,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentDashboardProps {
  currentStudentAdmissionNo?: string;
  students: Student[];
  results: ExamResult[];
  scratchCards: ScratchCard[];
  onActivateScratchCard: (admissionNo: string, pin: string) => Promise<boolean>;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentStudentAdmissionNo,
  students,
  results,
  scratchCards,
  onActivateScratchCard
}) => {
  // Use currently active student or default to first
  const defaultAdmNo = currentStudentAdmissionNo || students[0]?.admissionNo || 'GSTC/2025/001';
  const [activeAdmNo, setActiveAdmNo] = useState(defaultAdmNo);
  const [pinInput, setPinInput] = useState('');
  const [activationError, setActivationError] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const student = students.find(
    (s) => s.admissionNo.toLowerCase() === activeAdmNo.toLowerCase()
  ) || students[0];

  const studentResult = results.find(
    (r) => r.studentId === student?.id || r.admissionNo === student?.admissionNo
  );

  const isActivated = Boolean(student?.hasActivatedScratchCard);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActivationError(null);
    setActivating(true);
    try {
      await onActivateScratchCard(activeAdmNo, pinInput);
      confetti({ particleCount: 70, spread: 90 });
      setPinInput('');
    } catch (err: any) {
      setActivationError(err.message || 'Activation failed. Please check your 12-digit PIN.');
    } finally {
      setActivating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Student Portal Header */}
      <div className="bg-[#0b4d2c] text-white p-5 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-900 uppercase">
              Student Portal
            </span>
            <span className="text-xs text-emerald-200">
              Read-Only Official Records
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Student Terminal Result & Broadsheet Viewer
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Welcome, <strong className="text-white">{student ? `${student.firstName} ${student.lastName}` : 'Student'}</strong> ({student?.admissionNo}).
            Activate an official GSTC 12-digit scratch card to view and print your term report card.
          </p>
        </div>

        {/* Admission No Switcher (Convenient for testing other students) */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 p-2 rounded-lg border border-white/20 text-xs">
          <span className="text-emerald-200">View as Student:</span>
          <select
            value={activeAdmNo}
            onChange={(e) => setActiveAdmNo(e.target.value)}
            className="bg-[#06331c] text-white px-2 py-1 rounded border border-emerald-600 focus:outline-none font-mono"
          >
            {students.map((s) => (
              <option key={s.id} value={s.admissionNo}>
                {s.firstName} {s.lastName} ({s.admissionNo})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SCRATCH CARD ACTIVATION BANNER IF NOT YET ACTIVATED */}
      {!isActivated ? (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-6 shadow-sm space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Official Result Protected — Scratch Card Required
              </h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                As per GSTC examination guidelines, terminal continuous assessments and examination report cards require activation using an authorized 12-digit scratch card PIN.
              </p>
            </div>
          </div>

          <form onSubmit={handleActivate} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Student Admission Number
                </label>
                <input
                  type="text"
                  readOnly
                  value={activeAdmNo}
                  className="w-full px-3 py-2 text-xs bg-stone-200/80 border border-stone-300 rounded-lg font-mono font-bold text-stone-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  12-Digit Scratch Card PIN
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8392-4910-5821"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] font-mono tracking-widest font-bold"
                />
              </div>
            </div>

            {activationError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{activationError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-stone-500">
                Available demo scratch card PIN in system: <code className="text-[#0b4d2c] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">1092-3847-9201</code> or <code className="text-[#0b4d2c] font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">5542-8819-3012</code>
              </div>
              <button
                type="submit"
                disabled={activating}
                className="px-5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{activating ? 'Verifying PIN...' : 'Activate Scratch Card & Unlock Result'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ACTIVATED BADGE */
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>
              Scratch Card Activated for Admission No: <strong className="font-mono">{student?.admissionNo}</strong>. Full terminal report is unlocked for viewing and printing.
            </span>
          </div>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Result</span>
          </button>
        </div>
      )}

      {/* OFFICIAL TERMINAL REPORT CARD (Printable) */}
      {isActivated && (
        <div className="bg-white rounded-2xl border-2 border-stone-300 p-6 sm:p-8 shadow-sm space-y-6 print:m-0 print:border-none print:shadow-none">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-[#0b4d2c] pb-4">
            <div className="flex justify-center mb-2">
              <SchoolBadge size="lg" />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-[#0b4d2c] uppercase tracking-wide">
              Government Science & Technical College, Garki
            </h3>
            <p className="text-xs text-stone-600">
              Area 10, Garki, Abuja FCT • Motto: Knowledge, Skill, and Self Reliance
            </p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-full border border-emerald-300">
              OFFICIAL CONTINUOUS ASSESSMENT & EXAMINATION REPORT SHEET
            </span>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Student Full Name</span>
              <strong className="text-stone-900 text-sm">
                {student?.firstName} {student?.lastName}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Admission Number</span>
              <strong className="font-mono text-[#0b4d2c] text-sm">{student?.admissionNo}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Class & Arm</span>
              <strong className="text-stone-800 text-sm">{student?.className}</strong>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 uppercase font-bold block">Academic Session / Term</span>
              <strong className="text-stone-800 text-sm">
                {student?.session || '2025/2026'} • {student?.term || 'First Term'}
              </strong>
            </div>
          </div>

          {/* Marks Breakdown Table (CA1 10, CA2 10, CA3 10, Exam 70, Total 100) */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#0b4d2c] text-white font-bold text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Curriculum Subject</th>
                  <th className="py-2.5 px-2 text-center">1st CA (10)</th>
                  <th className="py-2.5 px-2 text-center">2nd CA (10)</th>
                  <th className="py-2.5 px-2 text-center">3rd CA (10)</th>
                  <th className="py-2.5 px-2 text-center">Exam (70)</th>
                  <th className="py-2.5 px-2 text-center">Total (100)</th>
                  <th className="py-2.5 px-2 text-center">Grade</th>
                  <th className="py-2.5 px-3">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {studentResult && studentResult.subjects.length > 0 ? (
                  studentResult.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-bold text-stone-900">{sub.subjectName}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold">{sub.ca1}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold">{sub.ca2}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-semibold">{sub.ca3}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-bold text-stone-900">{sub.exam}</td>
                      <td className="py-2.5 px-2 text-center font-mono font-extrabold text-sm text-[#0b4d2c]">
                        {sub.total}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {sub.grade}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 font-medium">{sub.remark}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-stone-400">
                      Scores are currently being finalized by subject teachers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Aggregate Summary */}
          {studentResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
              <div>
                <span className="text-emerald-800 block text-[11px] font-bold">Total Aggregate Score</span>
                <strong className="text-xl font-black text-stone-900">{studentResult.totalScore} Marks</strong>
              </div>
              <div>
                <span className="text-emerald-800 block text-[11px] font-bold">Average Cumulative</span>
                <strong className="text-xl font-black text-emerald-800">{studentResult.averageScore}%</strong>
              </div>
              <div>
                <span className="text-emerald-800 block text-[11px] font-bold">Class Standing</span>
                <strong className="text-xl font-black text-[#0b4d2c]">
                  {studentResult.position || '1st in Class'}
                </strong>
              </div>
            </div>
          )}

          {/* Remarks & Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">
                Form Master&apos;s Recommendation:
              </span>
              <p className="italic text-stone-800 mt-1">
                {studentResult?.teacherRemark || 'Diligently committed to technical and vocational studies.'}
              </p>
            </div>
            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-[10px] text-stone-500 font-bold uppercase block">
                Principal&apos;s Official Endorsement:
              </span>
              <p className="italic text-[#0b4d2c] font-semibold mt-1">
                {studentResult?.principalRemark || 'Approved official terminal record. Good advancement.'}
              </p>
            </div>
          </div>

          {/* Footer note & Print button */}
          <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
            <span>Official Computer-Generated Broadsheet • GSTC Central Database</span>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Report Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
