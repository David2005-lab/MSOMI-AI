import React, { useState, useEffect } from 'react';
import { StudyGroup, GroupPost, StudentProfile } from '../types';
import { Users, Plus, Send, Search, MessageSquare, LogIn, LogOut, Heart, Sparkles, Star, Wifi, ArrowRight, BookOpen, Check } from 'lucide-react';

interface StudyGroupsProps {
  profile: StudentProfile;
  groups: StudyGroup[];
  onUpdateGroups: (updated: StudyGroup[]) => void;
}

// Simulated dynamic peer responders database for "real dynamic group" feel
const PEER_REPLIES = [
  "Wow, hili wazo ni dhabiti sana! Nimeongeza hii dondoo kwenye Syllabus Tracker yangu.",
  "Kumbuka pia lecturer alisema hili suala litatoka kwenye Mazoezi Drills mwishoni mwa wiki.",
  "Asante kwa kushare! Mimi hapa ninafanya mapitio ya mtihani ujao kwa kutumia Saa ya Msomi timer hapa.",
  "Nimegundua formula hii inatusaidia kuokoa muda mwingi sana. Tuendelee kukaza!",
  "Great contribution. Nani yuko tayari kwa keshokutwa tufanye group video call tujipime kwa pamoja?"
];

const COHORT_NAMES = ["Amina Hassan", "Gabriel Mwangi", "Neema Mosha", "Salum Juma", "Mwajuma Hassan"];

export default function StudyGroups({ profile, groups, onUpdateGroups }: StudyGroupsProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(groups[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isTypingPeer, setIsTypingPeer] = useState<string | null>(null);

  // Group creation form variables
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupSubject, setNewGroupSubject] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  const activeGroup = groups.find(g => g.id === selectedGroupId) || null;

  const handleToggleJoin = (groupId: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      const willJoin = !g.isJoined;
      return {
        ...g,
        isJoined: willJoin,
        membersCount: willJoin ? g.membersCount + 1 : Math.max(0, g.membersCount - 1)
      };
    });
    onUpdateGroups(updated);
  };

  const handleSendPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !selectedGroupId) return;

    const userPostContent = newPostContent.trim();
    const newPost: GroupPost = {
      id: "p-" + Math.random().toString(36).substr(2, 9),
      authorName: profile.name,
      content: userPostContent,
      timestamp: 'Sasa hivi',
      likesCount: 0
    };

    // Update with user post first
    const withUserPost = groups.map(g => {
      if (g.id !== selectedGroupId) return g;
      return {
        ...g,
        posts: [newPost, ...g.posts]
      };
    });
    onUpdateGroups(withUserPost);
    setNewPostContent('');

    // Trigger Classmate Peer Auto-Reply simulation after 1.8 seconds to feel incredibly "online & live!"
    const randomPeer = COHORT_NAMES[Math.floor(Math.random() * COHORT_NAMES.length)];
    setIsTypingPeer(randomPeer);

    setTimeout(() => {
      const replyContent = PEER_REPLIES[Math.floor(Math.random() * PEER_REPLIES.length)];
      const peerPost: GroupPost = {
        id: "p-peer-" + Math.random().toString(36).substr(2, 9),
        authorName: randomPeer,
        content: `Mambo vipi @${profile.name}! ${replyContent}`,
        timestamp: 'Sasa hivi',
        likesCount: 1
      };

      const withPeerPost = withUserPost.map(g => {
        if (g.id !== selectedGroupId) return g;
        return {
          ...g,
          posts: [peerPost, ...g.posts]
        };
      });

      onUpdateGroups(withPeerPost);
      setIsTypingPeer(null);
    }, 2000);
  };

  const handleLikePost = (groupId: string, postId: string) => {
    const updated = groups.map(g => {
      if (g.id !== groupId) return g;
      const updatedPosts = g.posts.map(p => {
        if (p.id !== postId) return p;
        return { ...p, likesCount: p.likesCount + 1 };
      });
      return { ...g, posts: updatedPosts };
    });
    onUpdateGroups(updated);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupSubject.trim()) return;

    const newGroup: StudyGroup = {
      id: Math.random().toString(36).substr(2, 9),
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || 'Kikundi cha kupanga mikakati ya kushinda masomo na mitihani mbali mbali.',
      subject: newGroupSubject.trim(),
      membersCount: 1, // creator is the first user
      isJoined: true,
      createdBy: profile.name,
      posts: [
        {
          id: 'p-init',
          authorName: profile.name,
          content: `Karibuni kwenye kikundi kipya cha ${newGroupName}! Hapa tunaweza kushiriki mawazo, kudondosha vitabu/notes dondoo, na kusaidiana kujiandaa na mitihani. Hakikisha tunaheshimu miiko ya uandishi wa masomo yetu!`,
          timestamp: 'Sasa hivi',
          likesCount: 1
        }
      ]
    };

    const updated = [newGroup, ...groups];
    onUpdateGroups(updated);
    setSelectedGroupId(newGroup.id);
    
    // Reset Form
    setNewGroupName('');
    setNewGroupSubject('');
    setNewGroupDesc('');
    setShowCreateModal(false);
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="study-groups-view" className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-black/5 shadow-sm">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-green-600">Dynamic Online Hub Live</span>
          </div>
          <h2 className="text-lg font-serif italic text-[#1A1A1A] font-bold">Vikundi vya Msomi (Study Seminar Groups)</h2>
          <p className="text-xs text-black/55">
            Coordinate with real and simulated students dynamically. Ask questions, post templates, and share academic milestones.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C15B32] hover:bg-[#1A1A1A] text-white text-xs font-bold rounded-sm shadow-sm transition-all uppercase tracking-wide shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Anzisha Kikundi (Create Group)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Search & Groups Catalogue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#F5F2ED] border border-black/5 p-4 rounded-sm space-y-3 shadow-xs">
            <h3 className="text-[10px] font-mono uppercase text-black/50 font-bold tracking-widest">Tafuta Vikundi (Find Seminars)</h3>
            <div className="relative text-xs">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-black/40" />
              <input
                type="text"
                placeholder="Business, Programming, Maths, Engineering..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-black/10 rounded-sm text-xs text-[#1A1A1A] focus:outline-none focus:border-[#C15B32]"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredGroups.length === 0 ? (
              <div className="p-8 text-center text-xs text-black/40 bg-[#F5F2ED] border border-black/5 rounded-sm italic">
                Hakuna kikundi kulingana na utafutaji wako kwa sasa. Click the create button to start.
              </div>
            ) : (
              filteredGroups.map(g => {
                const isSelected = selectedGroupId === g.id;
                return (
                  <div
                    key={g.id}
                    className={`p-4 border rounded-sm text-left transition-all ${
                      isSelected
                        ? 'bg-white border-[#C15B32] shadow-sm'
                        : 'bg-[#F2EFEA]/45 hover:bg-[#F2EFEA]/80 border-black/5'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="cursor-pointer flex-1" onClick={() => setSelectedGroupId(g.id)}>
                        <span className="text-[9px] font-mono text-[#C15B32] font-semibold tracking-wider uppercase">
                          {g.subject}
                        </span>
                        <h4 className="text-xs font-bold text-[#1A1A1A] hover:underline font-sans">{g.name}</h4>
                        <p className="text-[11px] text-black/55 mt-1 line-clamp-2 leading-relaxed">{g.description}</p>
                      </div>

                      <button
                        onClick={() => handleToggleJoin(g.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-sm uppercase tracking-wide transition-all cursor-pointer border ${
                          g.isJoined
                            ? 'bg-black/5 text-black/55 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border-transparent'
                            : 'bg-[#C15B32] text-white hover:bg-black border-transparent'
                        }`}
                      >
                        {g.isJoined ? 'Joined' : 'Join'}
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[10px] text-black/40 font-mono">
                      <span className="flex items-center gap-1 font-bold text-black/60">
                        <Users className="h-3 w-3 text-[#C15B32]" /> {g.membersCount} wanachama
                      </span>
                      {g.isJoined && (
                        <span className="text-[#C15B32] font-semibold flex items-center gap-0.5">
                          ✓ Online Cohort
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center/Right Side: Group Discussion Forum & Share Module */}
        <div className="lg:col-span-5">
          {activeGroup ? (
            <div className="bg-white rounded-sm border border-black/5 overflow-hidden shadow-sm flex flex-col justify-between min-h-[500px]">
              
              {/* Group Panel Header */}
              <div className="bg-[#F5F2ED] p-4 border-b border-black/5 flex justify-between items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono bg-[#C15B32]/10 text-[#C15B32] px-2 py-0.5 rounded-sm font-semibold tracking-wider uppercase">
                      {activeGroup.subject}
                    </span>
                    <span className="text-[10px] text-black/40 font-mono">{activeGroup.membersCount} wasomi active</span>
                  </div>
                  <h3 className="text-sm font-bold text-black font-serif italic mt-1">{activeGroup.name}</h3>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleToggleJoin(activeGroup.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-[10px] uppercase tracking-wide font-bold rounded-sm border transition-all cursor-pointer shadow-xs ${
                      activeGroup.isJoined
                        ? 'bg-transparent border-red-200 text-red-600 hover:bg-red-50'
                        : 'bg-[#C15B32] border-transparent text-white hover:bg-black'
                    }`}
                  >
                    {activeGroup.isJoined ? (
                      <>
                        <LogOut className="h-3 w-3" /> Leave
                      </>
                    ) : (
                      <>
                        <LogIn className="h-3 w-3" /> Join
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Forum Messages Feed list */}
              <div className="p-4 space-y-4 max-h-[380px] overflow-y-auto flex-1">
                {!activeGroup.isJoined ? (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-3">
                    <div className="p-3 bg-[#C15B32]/5 text-[#C15B32] rounded-full">
                      <Users className="h-5 w-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-black font-sans">Mjadala Umefungwa (Join to View Cohort)</h4>
                      <p className="text-[11px] text-black/50 max-w-xs mx-auto mt-1 leading-normal">
                        Mambo vipi! Tafadhali bonyeza kitufe cha &quot;Join Group&quot; ili kushiriki notes, maswali na kujadiliana na wasomi wenzako moja kwa moja!
                      </p>
                    </div>
                  </div>
                ) : activeGroup.posts.length === 0 ? (
                  <div className="text-center py-12 text-xs text-black/40 italic font-mono uppercase tracking-wider">
                    Kikundi hakina posts kwa sasa. Kuwa wa kwanza kuandika notes dondoo hapa!
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeGroup.posts.map(post => {
                      const isOwner = post.authorName === profile.name;
                      return (
                        <div key={post.id} className="p-3 bg-[#FCFAF7] border border-black/5 rounded-sm space-y-1.5 shadow-2xs">
                          <div className="flex justify-between items-start text-[10px] text-black/55">
                            <span className="font-bold text-[#1A1A1A] font-sans flex items-center gap-1 bg-[#F5F2ED] px-1.5 py-0.5 rounded-sm">
                              👤 {post.authorName} {isOwner && <span className="text-xs text-[#C15B32] font-extrabold font-mono ml-1">★ WEWE</span>}
                            </span>
                            <span className="font-mono text-[9px] text-black/40">{post.timestamp}</span>
                          </div>

                          <p className="text-xs text-black/85 leading-relaxed font-sans whitespace-pre-wrap">
                            {post.content}
                          </p>

                          <div className="pt-2 border-t border-black/[0.04] flex justify-end gap-2.5">
                            <button
                              onClick={() => handleLikePost(activeGroup.id, post.id)}
                              className="text-[9px] font-mono text-[#C15B32] hover:underline flex items-center gap-1 cursor-pointer bg-white border border-black/5 px-1.5 py-0.2 rounded"
                            >
                              <Heart className="h-2.5 w-2.5 fill-current text-[#C15B32]" /> Upendo ({post.likesCount})
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Simulated Peer Typing indicator */}
                {isTypingPeer && (
                  <div className="flex items-center gap-2 text-[10px] text-black/40 font-mono italic animate-pulse">
                    <span className="h-1.5 w-1.5 bg-[#C15B32] rounded-full animate-ping"></span>
                    <span>{isTypingPeer} anaandika dondoo sasa hivi...</span>
                  </div>
                )}
              </div>

              {/* Message Write/Share Panel */}
              {activeGroup.isJoined && (
                <div className="p-3 border-t border-black/10 bg-[#F5F2ED]/40">
                  <form onSubmit={handleSendPost} className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={newPostContent}
                      onChange={e => setNewPostContent(e.target.value)}
                      placeholder="Uliza swali, dondosha nukuu za mtihani, au dokezo la somo..."
                      className="flex-1 py-2 px-3 bg-white border border-black/10 rounded-sm text-black text-xs focus:outline-none focus:border-[#C15B32]"
                    />
                    
                    <button
                      type="submit"
                      disabled={!newPostContent.trim() || isTypingPeer !== null}
                      className="bg-[#C15B32] hover:bg-[#1A1A1A] text-white disabled:opacity-50 px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="h-3.5 w-3.5" /> Post
                    </button>
                  </form>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col justify-center items-center text-center bg-white border border-black/5 rounded-sm p-8 text-black/45 font-serif italic text-xs shadow-xs">
              Mambo vipi! Tafadhali chagua kikundi ulichojiunga nacho upande wa kushoto ili kusoma chati ghafi za kozi hiyo.
            </div>
          )}
        </div>

        {/* Right Side: Dyn Classmates Roster with Online Status */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-black/10 p-4 rounded-sm space-y-4 shadow-sm">
            <h3 className="text-[10px] font-mono uppercase text-[#C15B32] font-black tracking-widest border-b border-[#C15B32]/10 pb-2 flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-green-500 animate-pulse" /> Wasomi Online Sasa
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="font-bold text-black">{profile.name} <span className="text-[9px] text-[#C15B32] font-mono">(WEWE)</span></span>
                </div>
                <span className="text-[9px] font-mono text-black/50">Online</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-black/80">Amina Hassan</span>
                </div>
                <span className="text-[9px] font-mono text-green-600 font-bold">Kusoma RDBMS</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-black/80">Gabriel Mwangi</span>
                </div>
                <span className="text-[9px] font-mono text-green-600 font-bold">Maths Drills</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-black/80">Neema Mosha</span>
                </div>
                <span className="text-[9px] font-mono text-[#C15B32] font-bold">In Active Timer</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span className="text-black/50 italic">Dr. Juma (Lecturer)</span>
                </div>
                <span className="text-[9px] font-mono text-black/40">Away</span>
              </div>
            </div>

            <div className="pt-2 border-t border-black/5 text-[10px] text-black/55 leading-relaxed bg-[#F5F2ED]/50 p-2 rounded-sm space-y-1">
              <p className="font-bold text-black font-sans">Kwanini uandikie hapa?</p>
              <p>Mabadiliko yoyote unayoyaandika hapa ni live na simulizi zinakuwezesha kuwasiliana haraka kama upo chuoni.</p>
            </div>
          </div>
        </div>

      </div>

      {/* Construct Custom Group Dialog Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FCFAF7] border border-black/20 w-full max-w-md p-6 rounded-md shadow-lg space-y-4 text-left">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-serif italic font-bold text-[#1A1A1A]">Anzisha Kikundi Jipya (Create Cohort)</h3>
                <p className="text-[10px] text-black/55">Create a subject-based department on the digital seminar deck</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-black/40 hover:text-[#1A1A1A] text-sm font-bold font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-black/75">Group Name (Kikundi Kuu) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tanzania Agriculture IoT Research Group"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black/75">Subject & Course Area *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agribusiness, Engineering"
                  value={newGroupSubject}
                  onChange={e => setNewGroupSubject(e.target.value)}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-black/75">Brief Description (Madhumuni ya Kikundi) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Eleza kwanini umeanzisha kikundi hiki na dondoo gani zitaandikwa humu..."
                  value={newGroupDesc}
                  onChange={e => setNewGroupDesc(e.target.value)}
                  className="w-full p-2 bg-white border border-black/10 rounded-sm focus:outline-none focus:border-[#C15B32]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-sm transition-all font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C15B32] hover:bg-[#1A1A1A] text-white font-bold rounded-sm transition-all"
                >
                  Unda Kikundi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
