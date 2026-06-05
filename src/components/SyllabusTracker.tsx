import React, { useState } from 'react';
import { CourseTrack, TopicTrack } from '../types';
import { Plus, CheckCircle, Circle, BookOpen, Trash2, Edit3, Award, FileText, CheckSquare } from 'lucide-react';

interface SyllabusTrackerProps {
  courses: CourseTrack[];
  onUpdateCourses: (updated: CourseTrack[]) => void;
}

export default function SyllabusTracker({ courses, onUpdateCourses }: SyllabusTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newTargetGrade, setNewTargetGrade] = useState('A');
  const [newTopicsRaw, setNewTopicsRaw] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseTrack | null>(courses[0] || null);

  // Initialize with excellent deafults if none exist
  const handleAddNewCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    const parsedTopics: TopicTrack[] = newTopicsRaw
      .split(',')
      .map((t, index) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: t.trim() || `Mada ya ${index + 1}`,
        status: 'Not Started'
      }))
      .filter(t => t.name.length > 0);

    const newCourse: CourseTrack = {
      id: Math.random().toString(36).substr(2, 9),
      code: newCode.toUpperCase().trim(),
      name: newName.trim(),
      targetGrade: newTargetGrade,
      topics: parsedTopics.length > 0 ? parsedTopics : [
        { id: 't1', name: 'Utangulizi', status: 'In Progress' },
        { id: 't2', name: 'Mada Kuu ya Kwanza', status: 'Not Started' }
      ]
    };

    const updated = [...courses, newCourse];
    onUpdateCourses(updated);
    setSelectedCourse(newCourse);

    // Reset Form
    setNewCode('');
    setNewName('');
    setNewTargetGrade('A');
    setNewTopicsRaw('');
    setShowAddModal(false);
  };

  const handleToggleTopicStatus = (courseId: string, topicId: string) => {
    const updated = courses.map(course => {
      if (course.id !== courseId) return course;
      const updatedTopics = course.topics.map(topic => {
        if (topic.id !== topicId) return topic;
        let nextStatus: 'Not Started' | 'In Progress' | 'Complete' = 'Not Started';
        if (topic.status === 'Not Started') nextStatus = 'In Progress';
        else if (topic.status === 'In Progress') nextStatus = 'Complete';
        return { ...topic, status: nextStatus };
      });
      return { ...course, topics: updatedTopics };
    });
    onUpdateCourses(updated);
    // Sync current cursor selection
    const updatedSelected = updated.find(c => c.id === selectedCourse?.id);
    if (updatedSelected) {
      setSelectedCourse(updatedSelected);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    const updated = courses.filter(c => c.id !== courseId);
    onUpdateCourses(updated);
    if (selectedCourse?.id === courseId) {
      setSelectedCourse(updated[0] || null);
    }
  };

  const handleUpdateNotes = (courseId: string, notes: string) => {
    const updated = courses.map(course => {
      if (course.id !== courseId) return course;
      return { ...course, notes };
    });
    onUpdateCourses(updated);
  };

  // Helper stats
  const calculateProgress = (course: CourseTrack) => {
    if (course.topics.length === 0) return 0;
    const completed = course.topics.filter(t => t.status === 'Complete').length;
    return Math.round((completed / course.topics.length) * 100);
  };

  return (
    <div id="syllabus-tracker-workspace" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-black/5 shadow-sm">
        <div>
          <h2 className="text-lg font-serif italic text-[#1A1A1A] font-bold">Kifuatilia Maendeleo (Academic Tracker)</h2>
          <p className="text-xs text-black/55">
            Track your semester subjects, topic-by-topic progress levels, and target grades below.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C15B32] hover:bg-[#1A1A1A] text-white text-xs font-bold rounded-sm shadow-sm transition-all uppercase tracking-wide shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Sajili Somo Jipya (Add Subject)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column list of subjects */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-[#F5F2ED] border border-black/5 p-4 rounded-sm">
            <h3 className="text-[10px] font-mono uppercase text-black/40 font-bold mb-3 tracking-widest">Somo la Muhula (Course Electives)</h3>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {courses.length === 0 ? (
                <div className="text-center py-8 text-xs text-black/40 italic">
                  No courses registered. Click the button above to add topics.
                </div>
              ) : (
                courses.map(course => {
                  const percent = calculateProgress(course);
                  const isSelected = selectedCourse?.id === course.id;
                  return (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course)}
                      className={`p-3.5 border rounded-sm text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white border-[#C15B32] shadow-sm'
                          : 'bg-[#FCFAF7]/80 hover:bg-[#FCFAF7] border-black/5 hover:border-black/10'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-[#C15B32] font-semibold tracking-wider">
                            {course.code}
                          </span>
                          <h4 className="text-xs font-bold text-black font-sans line-clamp-1">{course.name}</h4>
                        </div>
                        <span className="text-[10px] bg-black/5 text-[#1A1A1A] font-mono font-bold px-2 py-0.5 rounded-sm shrink-0">
                          Target: {course.targetGrade}
                        </span>
                      </div>

                      {/* Progress slider bar representation */}
                      <div className="mt-3.5 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-black/50">
                          <span>Syllabus Covered</span>
                          <span className="font-mono font-bold">{percent}%</span>
                        </div>
                        <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#C15B32] h-full transition-all duration-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column course inspection and topics breakdown */}
        <div className="lg:col-span-7">
          {selectedCourse ? (
            <div className="bg-white rounded-sm border border-black/5 overflow-hidden shadow-sm">
              <div className="bg-[#F5F2ED] p-5 border-b border-black/5 flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-[#C15B32]/10 text-[#C15B32] px-2 py-0.5 rounded-sm font-semibold tracking-wider">
                      {selectedCourse.code}
                    </span>
                    <span className="text-xs text-black/55 font-serif italic">Grade Goal: {selectedCourse.targetGrade}</span>
                  </div>
                  <h3 className="text-sm font-bold text-black font-serif italic mt-1">{selectedCourse.name}</h3>
                </div>

                <button
                  onClick={() => handleDeleteCourse(selectedCourse.id)}
                  className="text-black/35 hover:text-red-600 p-1.5 hover:bg-black/5 rounded-sm transition-all cursor-pointer"
                  title="Remove Course"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Course study details and topics checklists nested */}
              <div className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <CheckSquare className="h-4 w-4 text-[#C15B32]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-mono">Topics Cover Tracker</h4>
                  </div>
                  <p className="text-[10px] text-black/50 mb-3">
                    Click adjacent checks to update study level: <span className="font-semibold text-gray-500">Not Started</span> → <span className="font-semibold text-blue-500">In Progress</span> → <span className="font-semibold text-green-600 font-bold">Complete</span>.
                  </p>

                  <div className="space-y-2">
                    {selectedCourse.topics.length === 0 ? (
                      <div className="text-xs text-black/40 italic py-4">No topics assigned for this module.</div>
                    ) : (
                      selectedCourse.topics.map(topic => {
                        const isComplete = topic.status === 'Complete';
                        const isInProgress = topic.status === 'In Progress';
                        return (
                          <div
                            key={topic.id}
                            onClick={() => handleToggleTopicStatus(selectedCourse.id, topic.id)}
                            className={`flex items-center justify-between p-3 border rounded-sm transition-all cursor-pointer ${
                              isComplete
                                ? 'bg-green-50/50 border-green-100/60'
                                : isInProgress
                                ? 'bg-amber-50/35 border-amber-100/60'
                                : 'bg-transparent border-black/5 hover:border-black/10'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isComplete ? (
                                <CheckCircle className="h-4 w-4 text-green-600 shrink-0 fill-green-50" />
                              ) : isInProgress ? (
                                <Circle className="h-4 w-4 text-amber-500 shrink-0 fill-amber-100 animate-pulse" />
                              ) : (
                                <Circle className="h-4 w-4 text-black/30 shrink-0" />
                              )}
                              <span className={`text-xs ${isComplete ? 'line-through text-black/40' : 'text-black/85 font-medium'}`}>
                                {topic.name}
                              </span>
                            </div>

                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide ${
                                isComplete
                                  ? 'bg-green-100 text-green-700'
                                  : isInProgress
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-black/5 text-black/45'
                              }`}
                            >
                              {topic.status}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-black/10 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-black/50" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/60 font-mono">Daftari la Msomi (Study Notes)</h4>
                  </div>
                  <textarea
                    placeholder="Andika muhtasari wako, fomula, au dondoo za muhula huu hapa..."
                    value={selectedCourse.notes || ''}
                    onChange={(e) => handleUpdateNotes(selectedCourse.id, e.target.value)}
                    className="w-full h-24 p-2.5 bg-[#FCFAF7] border border-black/10 rounded-sm text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C15B32]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col justify-center items-center text-center bg-white border border-black/5 rounded-sm p-8 text-black/45 font-serif italic text-xs">
              Mambo vipi! Tafadhali nenda kushoto na uchague somo unalotaka kufuatilia.
            </div>
          )}
        </div>
      </div>

      {/* Add subject interactive modal Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#FCFAF7] border border-black/20 w-full max-w-md p-6 rounded-md shadow-lg space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-serif italic font-bold text-[#1A1A1A]">Sajili Somo Jipya (Add Subject)</h3>
                <p className="text-[10px] text-black/55">Create database indicators for and configure subject objectives</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-black/40 hover:text-[#1A1A1A] text-sm font-bold font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewCourse} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-black/75">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS101"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-black/75">Target Grade</label>
                  <select
                    value={newTargetGrade}
                    onChange={e => setNewTargetGrade(e.target.value)}
                    className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                  >
                    <option value="A">Grade A (Best)</option>
                    <option value="B+">Grade B+</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black/75">Course Full Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Database Systems Normalization"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black/75">Topics list (Comma separated)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Memory allocation, Stack vs Heap, Object pointers, Memory leaking"
                  value={newTopicsRaw}
                  onChange={e => setNewTopicsRaw(e.target.value)}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                />
                <span className="text-[9px] text-black/40 block leading-tight">
                  Enter key modules for the semester. Split using commas so the app populates them.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C15B32] hover:bg-[#1A1A1A] text-white font-bold rounded-sm transition-all"
                >
                  Sajili Somo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
