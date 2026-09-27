import React, { useState } from 'react';
import { Staff } from '../types/school';
import { UserCheck, Search, Trash2, Mail, Phone, Briefcase } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StaffTabProps {
  staff: Staff[];
  onAddStaff: (data: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Staff>;
  onDeleteStaff: (id: string) => Promise<void>;
  showRegisterModalDefault?: boolean;
}

export const StaffTab: React.FC<StaffTabProps> = ({
  staff,
  onAddStaff,
  onDeleteStaff,
  showRegisterModalDefault = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(showRegisterModalDefault);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Staff['role']>('Teacher');
  const [assignedClasses, setAssignedClasses] = useState('CCS 1');
  const [subjects, setSubjects] = useState('Computer Craft Studies');
  const [submitting, setSubmitting] = useState(false);

  const filteredStaff = staff.filter((s) => {
    return (
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const staffNum = (staff.length + 1).toString().padStart(3, '0');
      const staffId = `GSTC/STF/${staffNum}`;

      await onAddStaff({
        staffId,
        fullName,
        email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@gstcgarki.edu.ng`,
        phone: phone || '+234 803 000 0000',
        role,
        assignedClasses: assignedClasses.split(',').map((s) => s.trim()),
        subjects: subjects.split(',').map((s) => s.trim()),
        status: 'Active'
      });

      confetti({ particleCount: 40, spread: 60 });
      setFullName('');
      setEmail('');
      setPhone('');
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
        <div>
          <h2 className="text-base font-bold text-stone-900">Academic & Non-Academic Staff ({staff.length})</h2>
          <p className="text-xs text-stone-500">
            Teaching staff, form masters and department heads with auto-generated GSTC/STF numbers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5"
        >
          <UserCheck className="w-4 h-4" />
          <span>Register Staff Member</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by staff name, ID, or email..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
        />
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((stf) => (
          <div
            key={stf.id}
            className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs hover:shadow-md transition space-y-3 relative group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {stf.staffId}
                </span>
                <h3 className="text-sm font-bold text-stone-900 mt-1.5">{stf.fullName}</h3>
                <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" /> {stf.role}
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Remove staff ${stf.fullName}?`)) {
                    onDeleteStaff(stf.id);
                  }
                }}
                className="text-stone-300 hover:text-red-600 transition p-1"
                title="Delete staff"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs text-stone-600 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span className="truncate">{stf.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{stf.phone}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-1">
              {stf.subjects?.map((sub, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-stone-100 text-stone-700 text-[10px] font-medium rounded"
                >
                  {sub}
                </span>
              ))}
              {stf.assignedClasses?.map((cls, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded border border-emerald-100"
                >
                  Class: {cls}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Staff Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#0b4d2c]" />
                Register Staff • Auto-assign GSTC/STF ID
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mrs. Fatima Aliyu"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="fatima.aliyu@gstcgarki.edu.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+234 803 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Designation Role</label>
                  <select
                    value={role}
                    onChange={(e: any) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none bg-white"
                  >
                    <option value="Teacher">Subject Teacher</option>
                    <option value="Form Master">Form Master / Mistress</option>
                    <option value="Head of Dept">Head of Department</option>
                    <option value="Admin">Admin</option>
                    <option value="Principal">Principal / VP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Assigned Class(es)</label>
                  <input
                    type="text"
                    placeholder="e.g. CCS 1, Garment 1"
                    value={assignedClasses}
                    onChange={(e) => setAssignedClasses(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Subject(s) Taught</label>
                <input
                  type="text"
                  placeholder="e.g. Garment Making & Design"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2c] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#0b4d2c] hover:bg-[#083a21] text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Register to School Firestore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
