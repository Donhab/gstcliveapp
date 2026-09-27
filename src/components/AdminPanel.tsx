import React, { useState } from 'react';
import {
  SchoolClass,
  Subject,
  Staff,
  TeachingAssignment,
  SchoolSettings,
  SchoolNews
} from '../types/school';
import {
  GraduationCap,
  BookOpen,
  UserCheck,
  Plus,
  Layers,
  ArrowRight,
  Settings,
  CheckCircle,
  Sparkles,
  Link,
  Trash2,
  Sliders,
  Check,
  Newspaper,
  Calendar,
  Send,
  Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminPanelProps {
  classes: SchoolClass[];
  subjects: Subject[];
  staff: Staff[];
  assignments: TeachingAssignment[];
  settings: SchoolSettings | null;
  news?: SchoolNews[];
  initialSubTab?: 'teachers' | 'classes' | 'subjects' | 'allocations' | 'news' | 'settings';
  onAddStaff: (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Staff>;
  onDeleteStaff: (id: string) => Promise<void>;
  onAddClass: (data: Omit<SchoolClass, 'id'>) => Promise<void>;
  onAddSubject: (data: Omit<Subject, 'id'>) => Promise<void>;
  onAssignAllSubjectsToAllClasses: () => Promise<void>;
  onAssignSubjectToTeacher: (
    teacherId: string,
    subjectId: string,
    classId: string,
    periods: number
  ) => Promise<void>;
  onDeleteAssignment: (id: string) => Promise<void>;
  onUpdateSettings: (newSettings: Partial<SchoolSettings>) => Promise<void>;
  onPostNews?: (data: Omit<SchoolNews, 'id' | 'publishedAt'>) => Promise<SchoolNews>;
  onDeleteNews?: (id: string) => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  classes,
  subjects,
  staff,
  assignments,
  settings,
  news = [],
  initialSubTab = 'teachers',
  onAddStaff,
  onDeleteStaff,
  onAddClass,
  onAddSubject,
  onAssignAllSubjectsToAllClasses,
  onAssignSubjectToTeacher,
  onDeleteAssignment,
  onUpdateSettings,
  onPostNews,
  onDeleteNews
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'teachers' | 'classes' | 'subjects' | 'allocations' | 'news' | 'settings'>(initialSubTab);

  // Teacher registration form
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [isFormTeacher, setIsFormTeacher] = useState(false);
  const [formTeacherClassId, setFormTeacherClassId] = useState(classes[0]?.id || '');
  const [submittingTeacher, setSubmittingTeacher] = useState(false);

  // Class creation form
  const [showClassModal, setShowClassModal] = useState(false);
  const [className, setClassName] = useState('');
  const [classArm, setClassArm] = useState('Tech');
  const [designatedFormTeacher, setDesignatedFormTeacher] = useState('');

  // Subject creation form
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subCode, setSubCode] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [subCategory, setSubCategory] = useState<Subject['category']>('Technical / Vocational');

  // Allocation form (Assign subject to teacher)
  const [allocTeacherId, setAllocTeacherId] = useState(staff[0]?.id || '');
  const [allocSubjectId, setAllocSubjectId] = useState(subjects[0]?.id || '');
  const [allocClassId, setAllocClassId] = useState(classes[0]?.id || '');
  const [allocPeriods, setAllocPeriods] = useState(4);
  const [allocating, setAllocating] = useState(false);
  const [bulkAssigning, setBulkAssigning] = useState(false);

  // Settings form
  const [schoolName, setSchoolName] = useState(settings?.schoolName || 'Govt. Science & Tech. College, Garki');
  const [motto, setMotto] = useState(settings?.motto || 'Knowledge, Skill, and Self Reliance');
  const [session, setSession] = useState(settings?.session || '2025/2026');
  const [term, setTerm] = useState(settings?.term || 'First Term');
  const [savedSettings, setSavedSettings] = useState(false);

  // News posting form
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<SchoolNews['category']>('General');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsAuthorName, setNewsAuthorName] = useState('Admin Usman (Academic Records)');
  const [newsAuthorRole, setNewsAuthorRole] = useState('School Administration');
  const [postingNews, setPostingNews] = useState(false);
  const [postedSuccess, setPostedSuccess] = useState(false);

  const handlePostNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onPostNews) return;
    setPostingNews(true);
    try {
      await onPostNews({
        title: newsTitle,
        category: newsCategory,
        summary: newsSummary,
        content: newsContent,
        authorName: newsAuthorName || 'School Administration',
        authorRole: newsAuthorRole || 'Admin'
      });
      setNewsTitle('');
      setNewsSummary('');
      setNewsContent('');
      setPostedSuccess(true);
      confetti({ particleCount: 35 });
      setTimeout(() => setPostedSuccess(false), 4000);
    } catch (err: any) {
      alert(`Error publishing news: ${err?.message || err}`);
    } finally {
      setPostingNews(false);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingTeacher(true);
    try {
      const staffNum = (staff.length + 1).toString().padStart(3, '0');
      const staffId = `GSTC/STF/${staffNum}`;
      const selectedClass = classes.find((c) => c.id === formTeacherClassId);

      await onAddStaff({
        staffId,
        fullName: teacherName,
        email: teacherEmail || `${teacherName.toLowerCase().replace(/\s+/g, '.')}@gstcgarki.edu.ng`,
        phone: teacherPhone || '+234 803 000 0000',
        role: isFormTeacher ? 'Form Master' : 'Teacher',
        assignedClasses: isFormTeacher && selectedClass ? [selectedClass.name] : ['CCS 1'],
        subjects: ['Computer Craft Studies'],
        isFormTeacher,
        formTeacherClassId: isFormTeacher ? formTeacherClassId : undefined,
        formTeacherClassName: isFormTeacher && selectedClass ? selectedClass.name : undefined,
        status: 'Active'
      });

      confetti({ particleCount: 40 });
      setTeacherName('');
      setTeacherEmail('');
      setTeacherPhone('');
      setIsFormTeacher(false);
      setShowTeacherModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTeacher(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddClass({
      name: className,
      arm: classArm,
      level: className,
      formTeacherName: designatedFormTeacher || 'Unassigned'
    });
    confetti({ particleCount: 30 });
    setClassName('');
    setShowClassModal(false);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddSubject({
      code: subCode.toUpperCase(),
      name: subTitle,
      category: subCategory,
      classesOffered: classes.map((c) => c.name)
    });
    confetti({ particleCount: 30 });
    setSubCode('');
    setSubTitle('');
    setShowSubjectModal(false);
  };

  const handleBulkAssignAllSubjects = async () => {
    if (confirm('Assign all available curriculum subjects to all school classes?')) {
      setBulkAssigning(true);
      try {
        await onAssignAllSubjectsToAllClasses();
        confetti({ particleCount: 50, spread: 80 });
      } catch (err) {
        console.error(err);
      } finally {
        setBulkAssigning(false);
      }
    }
  };

  const handleAssignSubjectToTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAllocating(true);
    try {
      await onAssignSubjectToTeacher(allocTeacherId, allocSubjectId, allocClassId, allocPeriods);
      confetti({ particleCount: 30 });
    } catch (err) {
      console.error(err);
    } finally {
      setAllocating(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateSettings({
      schoolName,
      motto,
      session,
      term,
      ca1Max: 10,
      ca2Max: 10,
      ca3Max: 10,
      examMax: 70
    });
    setSavedSettings(true);
    confetti({ particleCount: 30 });
    setTimeout(() => setSavedSettings(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Panel Header Banner */}
      <div className="bg-[#0b4d2c] text-white p-5 rounded-2xl shadow-sm border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-stone-900 uppercase tracking-wider">
            Admin Panel
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1">
            Academic Operations & Curriculum Control
          </h2>
          <p className="text-xs text-emerald-100 mt-0.5">
            Add teachers, designate form masters, create classes & subjects, assign subjects to teachers, and manage school settings.
          </p>
        </div>

        {/* Quick Bulk Action Button: Assign all subjects to all classes */}
        <button
          onClick={handleBulkAssignAllSubjects}
          disabled={bulkAssigning}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 self-start md:self-auto shrink-0"
        >
          <Layers className="w-4 h-4 text-stone-900" />
          <span>{bulkAssigning ? 'Linking Subjects...' : 'Assign All Subjects to All Classes'}</span>
        </button>
      </div>

      {/* Admin Subtabs */}
      <div className="flex border-b border-stone-200 bg-white px-4 rounded-xl border space-x-1 sm:space-x-3 overflow-x-auto text-xs">
        {[
          { id: 'teachers', label: `Teachers (${staff.length})`, icon: UserCheck },
          { id: 'classes', label: `Classes (${classes.length})`, icon: GraduationCap },
          { id: 'subjects', label: `Subjects (${subjects.length})`, icon: BookOpen },
          { id: 'allocations', label: `Subject Allocations (${assignments.length})`, icon: Link },
          { id: 'news', label: `Post News (${news.length})`, icon: Newspaper },
          { id: 'settings', label: 'School Settings', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'border-[#0b4d2c] text-[#0b4d2c] font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TEACHERS MANAGEMENT */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Registered Teaching Faculty</h3>
              <p className="text-xs text-stone-500">
                Register teachers, allocate form teacher roles to specific classes
              </p>
            </div>
            <button
              onClick={() => setShowTeacherModal(true)}
              className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Teacher
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staff.map((stf) => (
              <div
                key={stf.id}
                className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {stf.staffId}
                    </span>
                    <h4 className="text-sm font-bold text-stone-900 mt-1">{stf.fullName}</h4>
                    <span className="text-xs text-stone-500 block">{stf.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove teacher ${stf.fullName}?`)) onDeleteStaff(stf.id);
                    }}
                    className="text-stone-300 hover:text-red-600 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1.5 text-xs">
                  {stf.isFormTeacher && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      ★ Form Master: {stf.formTeacherClassName || 'Class'}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[10px] bg-stone-100 text-stone-700">
                    Classes: {stf.assignedClasses?.join(', ') || 'CCS 1'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CLASSES MANAGEMENT */}
      {activeSubTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Academic Classes & Arms</h3>
              <p className="text-xs text-stone-500">
                Create new classes and assign designated form masters
              </p>
            </div>
            <button
              onClick={() => setShowClassModal(true)}
              className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Class
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0b4d2c] flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-stone-100 rounded text-stone-600">
                    Arm: {cls.arm}
                  </span>
                </div>
                <h4 className="text-base font-bold text-stone-900">{cls.name}</h4>
                <p className="text-xs text-stone-500">
                  Form Teacher: <strong className="text-stone-800">{cls.formTeacherName || 'Unassigned'}</strong>
                </p>
                <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                  Assigned Subjects: <span className="text-stone-700 font-semibold">{cls.assignedSubjectIds?.length || subjects.length} subjects</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SUBJECTS MANAGEMENT */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Curriculum Subjects</h3>
              <p className="text-xs text-stone-500">
                Create core and vocational subjects
              </p>
            </div>
            <button
              onClick={() => setShowSubjectModal(true)}
              className="px-3.5 py-1.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Subject
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#0b4d2c] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {sub.code}
                  </span>
                  <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                    {sub.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-stone-900">{sub.name}</h4>
                <p className="text-xs text-stone-400">
                  Offered in: {sub.classesOffered?.join(', ') || 'All classes'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUBJECT ALLOCATIONS (Assign a subject to a teacher) */}
      {activeSubTab === 'allocations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Form */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-emerald-700" />
                Assign Subject to Teacher
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Allocate a specific subject and class to a faculty member
              </p>
            </div>

            <form onSubmit={handleAssignSubjectToTeacherSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Teacher</label>
                <select
                  value={allocTeacherId}
                  onChange={(e) => setAllocTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {staff.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} ({st.staffId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Subject</label>
                <select
                  value={allocSubjectId}
                  onChange={(e) => setAllocSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Select Class</label>
                <select
                  value={allocClassId}
                  onChange={(e) => setAllocClassId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.arm})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Weekly Periods</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={allocPeriods}
                  onChange={(e) => setAllocPeriods(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={allocating}
                className="w-full py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5"
              >
                <Link className="w-3.5 h-3.5" />
                <span>{allocating ? 'Assigning...' : 'Assign to Teacher'}</span>
              </button>
            </form>
          </div>

          {/* Assignments Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Active Teaching Allocations ({assignments.length})
              </h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-700 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Teacher</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 px-3">Periods</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {assignments.map((asg) => (
                    <tr key={asg.id} className="hover:bg-stone-50">
                      <td className="py-2.5 px-3 font-bold text-stone-900">{asg.subjectName}</td>
                      <td className="py-2.5 px-3 text-emerald-800 font-semibold">{asg.teacherName}</td>
                      <td className="py-2.5 px-3 font-medium text-stone-700">{asg.className}</td>
                      <td className="py-2.5 px-3 text-stone-500">{asg.periodsPerWeek} / wk</td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onDeleteAssignment(asg.id)}
                          className="text-stone-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="max-w-2xl bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-700" />
              School Configuration & Grading Parameters
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Enforce CA marks limits (10 max each) and examination limits (70 max).
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Official School Name</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Motto</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Current Academic Session</label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Active Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                >
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
            </div>

            {/* Assessment Structure Specifications */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <span className="font-bold text-[#0b4d2c] block text-xs">
                Continuous Assessment Breakdown (Institutional Policy):
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">First CA</span>
                  <strong className="text-emerald-800 text-sm">10 Marks</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">Second CA</span>
                  <strong className="text-emerald-800 text-sm">10 Marks</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">Third CA</span>
                  <strong className="text-emerald-800 text-sm">10 Marks</strong>
                </div>
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-[10px] text-stone-500 block">Exam</span>
                  <strong className="text-emerald-800 text-sm">70 Marks</strong>
                </div>
              </div>
              <p className="text-[11px] text-emerald-900 mt-1">
                Total aggregate score is strictly computed to 100 marks maximum.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSettings && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Settings updated
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-sm"
              >
                Save School Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 6: POST NEWS TO WEBSITE FOR VISITORS */}
      {activeSubTab === 'news' && (
        <div className="space-y-6">
          {/* Post News Form Card */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <Newspaper className="w-4 h-4 text-emerald-700" />
                  Post School News & Public Announcements
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Publish verified school bulletins, admissions notices, and exam timetables for visitors and parents to see on the public website.
                </p>
              </div>
              {postedSuccess && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <Check className="w-4 h-4" /> Published to Website in Real Time!
                </span>
              )}
            </div>

            <form onSubmit={handlePostNewsSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">
                    News Article Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. First Term Practical Examination Timetable Released"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={newsCategory}
                    onChange={(e: any) => setNewsCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] bg-white focus:outline-none"
                  >
                    <option value="General">General School News</option>
                    <option value="Admissions">Admissions & Enrollment</option>
                    <option value="Examination">Examination & Results</option>
                    <option value="Technical Workshop">Technical Workshop / Exhibition</option>
                    <option value="Sports & Culture">Sports & Culture</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Brief Summary / Lead Text
                </label>
                <input
                  type="text"
                  placeholder="One or two sentences summarizing the announcement for the preview card..."
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Article Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the full body of the news article here for visitors..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Author Name / Sign-off</label>
                  <input
                    type="text"
                    value={newsAuthorName}
                    onChange={(e) => setNewsAuthorName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Author Designation / Office</label>
                  <input
                    type="text"
                    value={newsAuthorRole}
                    onChange={(e) => setNewsAuthorRole(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={postingNews}
                  className="px-5 py-2.5 bg-[#0b4d2c] hover:bg-[#083a21] text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{postingNews ? 'Publishing to Website...' : 'Publish News to Website'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* List of Published News */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <h4 className="font-bold text-xs text-stone-800 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-emerald-700" />
                <span>Live Published News Articles ({news.length})</span>
              </h4>
              <span className="text-[11px] text-stone-500">
                Visible to all visitors, parents, and students in real time
              </span>
            </div>

            {news.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                No news articles published yet. Use the form above to post news for visitors to see.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {news.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-stone-50/80 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.category}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {new Date(item.publishedAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <h5 className="font-bold text-sm text-stone-900 leading-snug">
                        {item.title}
                      </h5>
                      <p className="text-stone-600 line-clamp-2 leading-relaxed">
                        {item.summary || item.content}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Published by <span className="font-medium text-stone-600">{item.authorName}</span> ({item.authorRole})
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {onDeleteNews && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete the news article "${item.title}"?`)) {
                              onDeleteNews(item.id);
                            }
                          }}
                          className="px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 flex items-center gap-1 transition"
                          title="Delete news article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete News</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Teacher */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-emerald-700" />
                Register Teacher Member
              </h3>
              <button onClick={() => setShowTeacherModal(false)} className="text-stone-400 hover:text-stone-600">✕</button>
            </div>

            <form onSubmit={handleAddTeacher} className="space-y-3 mt-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Danjuma Bello"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  placeholder="teacher@gstcgarki.edu.ng"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+234 803 000 0000"
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              {/* Designated Form Teacher Switch */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">Designate as Form Master?</span>
                  <input
                    type="checkbox"
                    checked={isFormTeacher}
                    onChange={(e) => setIsFormTeacher(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-600"
                  />
                </div>
                {isFormTeacher && (
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Assigned Form Class
                    </label>
                    <select
                      value={formTeacherClassId}
                      onChange={(e) => setFormTeacherClassId(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white"
                    >
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} ({cls.arm})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowTeacherModal(false)} className="px-3 py-1.5 text-stone-600">Cancel</button>
                <button
                  type="submit"
                  disabled={submittingTeacher}
                  className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg shadow-sm"
                >
                  {submittingTeacher ? 'Saving...' : 'Add Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Class */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-sm text-stone-900 mb-3">Create Class</h3>
            <form onSubmit={handleAddClass} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical 1, SS 1 Tech"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Arm / Stream</label>
                <input
                  type="text"
                  placeholder="Vocational, Technical, Commercial"
                  value={classArm}
                  onChange={(e) => setClassArm(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowClassModal(false)} className="px-3 py-1.5 text-stone-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg">Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="font-bold text-sm text-stone-900 mb-3">Create Subject</h3>
            <form onSubmit={handleAddSubject} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ELE101"
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrical Installation"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c]"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={subCategory}
                  onChange={(e: any) => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                >
                  <option value="Technical / Vocational">Technical / Vocational</option>
                  <option value="Core">Core Academic</option>
                  <option value="Elective">Elective</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="px-3 py-1.5 text-stone-600">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#0b4d2c] text-white font-bold rounded-lg">Create Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
