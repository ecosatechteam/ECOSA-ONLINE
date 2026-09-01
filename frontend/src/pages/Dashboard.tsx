import React, { useEffect, useState } from 'react'
import {
  addPost,
  addResource,
  confirmPayment,
  deleteChapter,
  deleteLeader,
  deletePost,
  deleteProject,
  deleteResource,
  getAllMembers,
  getChapters,
  getLeaders,
  getPayments,
  getPosts,
  getProjects,
  getResources,
  saveMember,
  saveChapter,
  saveLeader,
  saveProject,
} from '../services/mockService'

function formatDate(value?: string) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Dashboard() {
  const [members, setMembers] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [leaders, setLeaders] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [activePanel, setActivePanel] = useState<'members' | 'payments' | 'chapters' | 'leaders' | 'projects' | 'resources' | 'updates' | null>(null)
  const [memberFilter, setMemberFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid'>('pending')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [updateType, setUpdateType] = useState<'announcement' | 'event' | 'job'>('announcement')
  const [updateMediaFile, setUpdateMediaFile] = useState<File | null>(null)
  const [updateMedia, setUpdateMedia] = useState<any>(null)
  const [actionAmount, setActionAmount] = useState('50000')
  const [jobApplyUrl, setJobApplyUrl] = useState('/contact')
  const [jobCompany, setJobCompany] = useState('')
  const [busyPaymentId, setBusyPaymentId] = useState('')
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceType, setResourceType] = useState('other')
  const [resourceFile, setResourceFile] = useState<File | null>(null)
  const [savingResource, setSavingResource] = useState(false)
  const [savingChapter, setSavingChapter] = useState(false)
  const [savingLeader, setSavingLeader] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [chapterForm, setChapterForm] = useState({
    id: '',
    name: '',
    chairperson: '',
    members: '0',
    description: '',
    location: '',
    status: 'Active',
  })
  const [leaderForm, setLeaderForm] = useState({
    id: '',
    name: '',
    role: '',
    regime: 'current',
    bio: '',
  })
  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    description: '',
    status: 'Ongoing',
    featured: false,
  })

  async function loadData() {
    const [memberData, paymentData, postData, resourceData, chapterData] = await Promise.all([
      getAllMembers(),
      getPayments(),
      getPosts(),
      getResources(),
      getChapters(),
    ])
    const [leaderData, projectData] = await Promise.all([
      getLeaders(),
      getProjects(),
    ])

    setMembers(memberData || [])
    setPayments(paymentData || [])
    setPosts(postData || [])
    setResources(resourceData || [])
    setChapters(chapterData || [])
    setLeaders(leaderData || [])
    setProjects(projectData || [])
  }

  useEffect(() => {
    let mounted = true
    loadData().then(() => {
      if (!mounted) return
    })
    return () => {
      mounted = false
    }
  }, [])

  const pendingMembers = members.filter((member) => (member.paymentStatus || '').toLowerCase() !== 'paid')
  const paidMembers = members.filter((member) => (member.paymentStatus || '').toLowerCase() === 'paid')
  const visibleMembers = memberFilter === 'pending' ? pendingMembers : memberFilter === 'paid' ? paidMembers : members
  const visiblePayments = paymentFilter === 'pending' ? payments.filter((payment) => (payment.status || 'pending') !== 'paid') : paymentFilter === 'paid' ? payments.filter((payment) => (payment.status || '') === 'paid') : payments
  const headlinePlaceholder =
    updateType === 'event'
      ? 'ECOSA Annual General Meeting'
      : updateType === 'job'
        ? 'Communications Officer Vacancy'
        : 'Official ECOSA Announcement'

  const publishUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return alert('Enter a title for the update')
    if ((updateType === 'announcement' || updateType === 'job') && !body) return alert('Enter a message for the update')
    if (updateType === 'event' && !body) return alert('Enter event details')
    if (updateType === 'job' && !jobCompany) return alert('Enter the hiring company')

    const postId = Date.now().toString()
    const basePost: any = {
      id: postId,
      type: updateType,
      title,
      content: body,
      author: 'ECOSA Admin',
      createdAt: new Date().toISOString(),
      isPublished: true,
    }

    if (updateMedia) {
      basePost.media = updateMedia
    }

    if (updateType === 'event') {
      basePost.eventType = 'register'
      basePost.actionLabel = 'Register'
      basePost.registerUrl = `/payments?purpose=Event+Ticket&amount=${encodeURIComponent(actionAmount || '50000')}`
      basePost.amount = Number(actionAmount || 0)
    }

    if (updateType === 'job') {
      basePost.company = jobCompany
      basePost.applyUrl = jobApplyUrl
      basePost.actionLabel = 'Apply now'
    }

    await addPost(basePost)

    setTitle('')
    setBody('')
    setUpdateType('announcement')
    setUpdateMediaFile(null)
    setUpdateMedia(null)
    setActionAmount('50000')
    setJobApplyUrl('/contact')
    setJobCompany('')
    await loadData()
    alert('Update published')
  }

  const handleUpdateMediaChange = async (file: File | null) => {
    setUpdateMediaFile(file)
    if (!file) {
      setUpdateMedia(null)
      return
    }

    const content = await readFileAsDataUrl(file)
    setUpdateMedia({
      kind: file.type.startsWith('video/') ? 'video' : 'image',
      data: content,
      name: file.name,
      mime: file.type,
    })
  }

  const handleConfirmPayment = async (payment: any) => {
    const paymentId = String(payment._id || payment.id)
    if (!paymentId) return
    setBusyPaymentId(paymentId)
    try {
      await confirmPayment(paymentId, 'Manual review by ECOSA Admin')
      await loadData()
    } finally {
      setBusyPaymentId('')
    }
  }

  const handleMemberStatusChange = async (member: any, status: 'paid' | 'pending') => {
    const updatedMember = {
      ...member,
      paymentStatus: status,
      confirmedAt: status === 'paid' ? member.confirmedAt || new Date().toISOString() : member.confirmedAt,
      membershipNumber:
        status === 'paid'
          ? member.membershipNumber || `EC-${Date.now().toString().slice(-6)}`
          : member.membershipNumber,
    }

    await saveMember(updatedMember)
    await loadData()
  }

  const resetChapterForm = () => {
    setChapterForm({
      id: '',
      name: '',
      chairperson: '',
      members: '0',
      description: '',
      location: '',
      status: 'Active',
    })
  }

  const editChapter = (chapter: any) => {
    setChapterForm({
      id: chapter.id,
      name: chapter.name || '',
      chairperson: chapter.chairperson || '',
      members: String(chapter.members ?? 0),
      description: chapter.description || '',
      location: chapter.location || '',
      status: chapter.status || 'Active',
    })
  }

  const handleChapterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chapterForm.name || !chapterForm.description) {
      alert('Add an alumni chapter name and description')
      return
    }

    setSavingChapter(true)
    try {
      await saveChapter({
        id: chapterForm.id,
        name: chapterForm.name,
        chairperson: chapterForm.chairperson,
        members: Number(chapterForm.members || 0),
        description: chapterForm.description,
        location: chapterForm.location,
        status: chapterForm.status,
      })
      await loadData()
      resetChapterForm()
    } finally {
      setSavingChapter(false)
    }
  }

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Delete this alumni chapter?')) return
    await deleteChapter(chapterId)
    await loadData()
  }

  const resetLeaderForm = () => {
    setLeaderForm({
      id: '',
      name: '',
      role: '',
      regime: 'current',
      bio: '',
    })
  }

  const editLeader = (leader: any) => {
    setLeaderForm({
      id: leader.id,
      name: leader.name || '',
      role: leader.role || '',
      regime: leader.regime || 'current',
      bio: leader.bio || '',
    })
  }

  const handleLeaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaderForm.name || !leaderForm.role) {
      alert('Add a leadership name and role')
      return
    }

    setSavingLeader(true)
    try {
      await saveLeader({ ...leaderForm })
      await loadData()
      resetLeaderForm()
    } finally {
      setSavingLeader(false)
    }
  }

  const handleDeleteLeader = async (leaderId: string) => {
    if (!confirm('Delete this leadership entry?')) return
    await deleteLeader(leaderId)
    await loadData()
  }

  const resetProjectForm = () => {
    setProjectForm({
      id: '',
      title: '',
      description: '',
      status: 'Ongoing',
      featured: false,
    })
  }

  const editProject = (project: any) => {
    setProjectForm({
      id: project.id,
      title: project.title || '',
      description: project.description || '',
      status: project.status || 'Ongoing',
      featured: Boolean(project.featured),
    })
  }

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectForm.title || !projectForm.description) {
      alert('Add an initiative title and description')
      return
    }

    setSavingProject(true)
    try {
      await saveProject({ ...projectForm })
      await loadData()
      resetProjectForm()
    } finally {
      setSavingProject(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Delete this initiative?')) return
    await deleteProject(projectId)
    await loadData()
  }

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })

  const handleResourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resourceFile) {
      alert('Choose a file to upload')
      return
    }

    setSavingResource(true)
    try {
      const content = await readFileAsDataUrl(resourceFile)
      await addResource({
        id: `res_${Date.now()}`,
        name: resourceTitle || resourceFile.name,
        filename: resourceFile.name,
        mime: resourceFile.type,
        type: resourceType,
        content,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'ECOSA Admin',
      })
      setResourceTitle('')
      setResourceType('other')
      setResourceFile(null)
      await loadData()
    } finally {
      setSavingResource(false)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Delete this resource?')) return
    await deleteResource(resourceId)
    await loadData()
  }

  const handleDeleteUpdate = async (postId: string) => {
    if (!confirm('Delete this update?')) return
    await deletePost(postId)
    await loadData()
  }

  const stats = [
    { label: 'Members', value: members.length },
    { label: 'Pending reviews', value: pendingMembers.length },
    { label: 'Payments', value: payments.length },
    { label: 'Published updates', value: posts.length },
    { label: 'Leadership', value: leaders.length },
    { label: 'Initiatives', value: projects.length },
    { label: 'Resources', value: resources.length },
    { label: 'Chapters', value: chapters.length },
  ]

  const panelMeta = {
    members: { title: 'Review members', description: 'Check registrations, chapter assignment, and payment status before confirming a record.' },
    payments: { title: 'Confirm payments', description: 'Approve successful payments to move a member into the verified directory.' },
    chapters: { title: 'Manage chapters', description: 'Create or update chapter profiles that appear on the public chapters page.' },
    leaders: { title: 'Manage leaders', description: 'Update the leadership roster shown on the public leaders page.' },
    projects: { title: 'Manage projects', description: 'Update the active initiative list shown on the public projects page.' },
    resources: { title: 'Manage resources', description: 'Upload official documents and remove outdated files from the shared resource library.' },
    updates: { title: 'Publish updates', description: 'Post announcements, events, and jobs for the community feed.' },
  } as const

  const activeMeta = activePanel ? panelMeta[activePanel] : null

  return (
    <div className="dashboard-shell dashboard-grid">
      <div className="card dashboard-hero">
        <div>
          <h3>ECOSA Admin Workspace</h3>
          <p>Review members, confirm payments, manage chapters and resources, and publish official updates from one control center.</p>
        </div>
        <div className="dashboard-hero-actions">
          <button type="button" className={`btn${activePanel === 'members' ? ' secondary' : ''}`} onClick={() => setActivePanel('members')}>Review members</button>
          <button type="button" className={`btn${activePanel === 'payments' ? ' secondary' : ''}`} onClick={() => setActivePanel('payments')}>Confirm payments</button>
          <button type="button" className={`btn${activePanel === 'chapters' ? ' secondary' : ''}`} onClick={() => setActivePanel('chapters')}>Manage chapters</button>
          <button type="button" className={`btn${activePanel === 'leaders' ? ' secondary' : ''}`} onClick={() => setActivePanel('leaders')}>Manage leaders</button>
          <button type="button" className={`btn${activePanel === 'projects' ? ' secondary' : ''}`} onClick={() => setActivePanel('projects')}>Manage projects</button>
          <button type="button" className={`btn${activePanel === 'resources' ? ' secondary' : ''}`} onClick={() => setActivePanel('resources')}>Manage resources</button>
          <button type="button" className={`btn${activePanel === 'updates' ? ' secondary' : ''}`} onClick={() => setActivePanel('updates')}>Publish update</button>
          {activePanel && <button type="button" className="btn secondary" onClick={() => setActivePanel(null)}>Back to overview</button>}
        </div>
      </div>

      {!activePanel && (
        <>
          <div className="dashboard-stats">
            {stats.map((item) => (
              <div key={item.label} className="card dashboard-stat">
                <span>{item.value}</span>
                <div>{item.label}</div>
              </div>
            ))}
          </div>

          <div className="card dashboard-empty" style={{ minHeight: '42vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 8px' }}>Choose a section</h4>
              <p className="muted" style={{ margin: 0 }}>Click one of the buttons above to open that workspace across the dashboard.</p>
            </div>
          </div>
        </>
      )}

      {activePanel && activeMeta && (
        <section className="card dashboard-section dashboard-panel-full">
          <div className="dashboard-section-head">
            <div>
              <h4>{activeMeta.title}</h4>
              <p className="muted">{activeMeta.description}</p>
            </div>
            <div className="dashboard-toolbar">
              <button type="button" className={`field-btn${activePanel === 'members' ? ' active' : ''}`} onClick={() => setActivePanel('members')}>Members</button>
              <button type="button" className={`field-btn${activePanel === 'payments' ? ' active' : ''}`} onClick={() => setActivePanel('payments')}>Payments</button>
              <button type="button" className={`field-btn${activePanel === 'chapters' ? ' active' : ''}`} onClick={() => setActivePanel('chapters')}>Chapters</button>
              <button type="button" className={`field-btn${activePanel === 'leaders' ? ' active' : ''}`} onClick={() => setActivePanel('leaders')}>Leaders</button>
              <button type="button" className={`field-btn${activePanel === 'projects' ? ' active' : ''}`} onClick={() => setActivePanel('projects')}>Projects</button>
              <button type="button" className={`field-btn${activePanel === 'resources' ? ' active' : ''}`} onClick={() => setActivePanel('resources')}>Resources</button>
              <button type="button" className={`field-btn${activePanel === 'updates' ? ' active' : ''}`} onClick={() => setActivePanel('updates')}>Updates</button>
            </div>
          </div>

          {activePanel === 'members' && (
            <div>
              <div className="dashboard-toolbar" style={{ marginBottom: 12 }}>
                <button type="button" className={`field-btn${memberFilter === 'all' ? ' active' : ''}`} onClick={() => setMemberFilter('all')}>All</button>
                <button type="button" className={`field-btn${memberFilter === 'pending' ? ' active' : ''}`} onClick={() => setMemberFilter('pending')}>Pending</button>
                <button type="button" className={`field-btn${memberFilter === 'paid' ? ' active' : ''}`} onClick={() => setMemberFilter('paid')}>Paid</button>
              </div>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Chapter</th>
                      <th>Status</th>
                      <th>Membership No.</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMembers.length === 0 ? (
                      <tr>
                        <td colSpan={6}><div className="dashboard-empty">No members in this view.</div></td>
                      </tr>
                    ) : visibleMembers.map((member) => (
                      <tr key={member.id || member.email}>
                        <td>
                          <strong>{member.name || 'Unnamed member'}</strong>
                          <div className="dashboard-list-meta">Registered {formatDate(member.registeredAt)}</div>
                        </td>
                        <td>{member.email || 'No email provided'}</td>
                        <td>{member.chapter || 'Not assigned'}</td>
                        <td>
                          <span className={`dashboard-chip ${(member.paymentStatus || '').toLowerCase() === 'paid' ? 'success' : 'warn'}`}>
                            {(member.paymentStatus || 'pending').toUpperCase()}
                          </span>
                        </td>
                        <td>{member.membershipNumber || 'Pending approval'}</td>
                        <td>
                          <div className="dashboard-actions">
                            <button className="btn secondary" type="button" onClick={() => window.location.assign(`/members/${encodeURIComponent(member.id)}`)}>
                              View
                            </button>
                            {(member.paymentStatus || '').toLowerCase() === 'paid' ? (
                              <button className="btn secondary" type="button" onClick={() => handleMemberStatusChange(member, 'pending')}>
                                Mark pending
                              </button>
                            ) : (
                              <button className="btn" type="button" onClick={() => handleMemberStatusChange(member, 'paid')}>
                                Mark paid
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePanel === 'payments' && (
            <div className="dashboard-list">
              <div className="dashboard-toolbar" style={{ marginBottom: 12 }}>
                <button type="button" className={`field-btn${paymentFilter === 'pending' ? ' active' : ''}`} onClick={() => setPaymentFilter('pending')}>Pending</button>
                <button type="button" className={`field-btn${paymentFilter === 'paid' ? ' active' : ''}`} onClick={() => setPaymentFilter('paid')}>Paid</button>
                <button type="button" className={`field-btn${paymentFilter === 'all' ? ' active' : ''}`} onClick={() => setPaymentFilter('all')}>All</button>
              </div>
              {visiblePayments.length === 0 ? (
                <div className="dashboard-empty">No payment records in this view.</div>
              ) : visiblePayments.map((payment) => {
                const id = String(payment._id || payment.id)
                const confirmed = (payment.status || '').toLowerCase() === 'paid'
                return (
                  <div key={id} className="dashboard-list-item">
                    <div>
                      <strong>{payment.memberName || payment.name || 'Unknown member'}</strong>
                      <div>{payment.purpose || 'Membership'} • {payment.currency || 'UGX'} {Number(payment.amount || 0).toLocaleString()}</div>
                      <div className="dashboard-list-meta">{payment.email || 'No email'} • {formatDate(payment.createdAt || payment.confirmedAt || payment.at)}</div>
                    </div>
                    <div className="dashboard-actions">
                      <span className={`dashboard-chip ${confirmed ? 'success' : 'warn'}`}>{confirmed ? 'CONFIRMED' : 'PENDING'}</span>
                      {!confirmed && (
                        <button className="btn" type="button" onClick={() => handleConfirmPayment(payment)} disabled={busyPaymentId === id}>
                          {busyPaymentId === id ? 'Confirming...' : 'Confirm payment'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activePanel === 'chapters' && (
            <>
              <form className="dashboard-form" onSubmit={handleChapterSubmit}>
                <div className="dashboard-inline-row">
                  <div>
                    <label>Chapter name</label>
                    <input value={chapterForm.name} onChange={(e) => setChapterForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Kampala" />
                  </div>
                  <div>
                    <label>Chairperson</label>
                    <input value={chapterForm.chairperson} onChange={(e) => setChapterForm((prev) => ({ ...prev, chairperson: e.target.value }))} placeholder="TBA" />
                  </div>
                  <div>
                    <label>Members</label>
                    <input value={chapterForm.members} onChange={(e) => setChapterForm((prev) => ({ ...prev, members: e.target.value }))} type="number" min="0" />
                  </div>
                  <div>
                    <label>Status</label>
                    <select value={chapterForm.status} onChange={(e) => setChapterForm((prev) => ({ ...prev, status: e.target.value }))}>
                      <option value="Active">Active</option>
                      <option value="Planned">Planned</option>
                      <option value="Dormant">Dormant</option>
                    </select>
                  </div>
                </div>

                <div className="dashboard-inline-row">
                  <div>
                    <label>Location</label>
                    <input value={chapterForm.location} onChange={(e) => setChapterForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Uganda / International" />
                  </div>
                  <div>
                    <label>Reference id</label>
                    <input value={chapterForm.id} onChange={(e) => setChapterForm((prev) => ({ ...prev, id: e.target.value }))} placeholder="Optional for new entries" />
                  </div>
                </div>

                <div>
                  <label>Description</label>
                  <textarea value={chapterForm.description} onChange={(e) => setChapterForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe the chapter focus, location, and community goals." />
                </div>

                <div className="dashboard-actions">
                  <button type="submit" className="btn" disabled={savingChapter}>{savingChapter ? 'Saving...' : 'Save chapter'}</button>
                  <button type="button" className="btn secondary" onClick={resetChapterForm}>Clear</button>
                </div>
              </form>

              <div className="dashboard-list" style={{ marginTop: 16 }}>
                {chapters.length === 0 ? (
                  <div className="dashboard-empty">No chapters saved yet.</div>
                ) : chapters.map((chapter) => (
                  <div key={chapter.id} className="dashboard-list-item">
                    <div>
                      <strong>{chapter.name}</strong>
                      <div>{chapter.description}</div>
                      <div className="dashboard-list-meta">Chairperson: {chapter.chairperson || 'TBA'} • Members: {chapter.members || 0} • Status: {chapter.status || 'Active'}</div>
                    </div>
                    <div className="dashboard-actions">
                      <button className="btn secondary" type="button" onClick={() => editChapter(chapter)}>Edit</button>
                      <button className="btn secondary" type="button" onClick={() => handleDeleteChapter(chapter.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activePanel === 'leaders' && (
            <>
              <form className="dashboard-form" onSubmit={handleLeaderSubmit}>
                <div className="dashboard-inline-row">
                  <div>
                    <label>Leadership name</label>
                    <input value={leaderForm.name} onChange={(e) => setLeaderForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Agaba Francis" />
                  </div>
                  <div>
                    <label>Role</label>
                    <input value={leaderForm.role} onChange={(e) => setLeaderForm((prev) => ({ ...prev, role: e.target.value }))} placeholder="Secretary" />
                  </div>
                  <div>
                    <label>Regime</label>
                    <select value={leaderForm.regime} onChange={(e) => setLeaderForm((prev) => ({ ...prev, regime: e.target.value }))}>
                      <option value="current">Current</option>
                      <option value="interim">Interim</option>
                      <option value="past">Past</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>Bio</label>
                  <textarea value={leaderForm.bio} onChange={(e) => setLeaderForm((prev) => ({ ...prev, bio: e.target.value }))} placeholder="Short profile shown on the public leaders page." />
                </div>

                <div className="dashboard-actions">
                  <button type="submit" className="btn" disabled={savingLeader}>{savingLeader ? 'Saving...' : 'Save leader'}</button>
                  <button type="button" className="btn secondary" onClick={resetLeaderForm}>Clear</button>
                </div>
              </form>

              <div className="dashboard-list" style={{ marginTop: 16 }}>
                {leaders.length === 0 ? (
                  <div className="dashboard-empty">No leaders saved yet.</div>
                ) : leaders.map((leader) => (
                  <div key={leader.id} className="dashboard-list-item">
                    <div>
                      <strong>{leader.name}</strong>
                      <div>{leader.role}</div>
                      <div className="dashboard-list-meta">Regime: {leader.regime || 'current'}</div>
                      {leader.bio && <div>{leader.bio}</div>}
                    </div>
                    <div className="dashboard-actions">
                      <button className="btn secondary" type="button" onClick={() => editLeader(leader)}>Edit</button>
                      <button className="btn secondary" type="button" onClick={() => handleDeleteLeader(leader.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activePanel === 'projects' && (
            <>
              <form className="dashboard-form" onSubmit={handleProjectSubmit}>
                <div className="dashboard-inline-row">
                  <div>
                    <label>Initiative title</label>
                    <input value={projectForm.title} onChange={(e) => setProjectForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="ECOSA SACCO" />
                  </div>
                  <div>
                    <label>Status</label>
                    <select value={projectForm.status} onChange={(e) => setProjectForm((prev) => ({ ...prev, status: e.target.value }))}>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Planned">Planned</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label>Featured</label>
                    <select value={projectForm.featured ? 'yes' : 'no'} onChange={(e) => setProjectForm((prev) => ({ ...prev, featured: e.target.value === 'yes' }))}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>Description</label>
                  <textarea value={projectForm.description} onChange={(e) => setProjectForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Describe the project, its purpose, and its current stage." />
                </div>

                <div className="dashboard-actions">
                  <button type="submit" className="btn" disabled={savingProject}>{savingProject ? 'Saving...' : 'Save project'}</button>
                  <button type="button" className="btn secondary" onClick={resetProjectForm}>Clear</button>
                </div>
              </form>

              <div className="dashboard-list" style={{ marginTop: 16 }}>
                {projects.length === 0 ? (
                  <div className="dashboard-empty">No initiatives saved yet.</div>
                ) : projects.map((project) => (
                  <div key={project.id} className="dashboard-list-item">
                    <div>
                      <strong>{project.title}</strong>
                      <div>{project.description}</div>
                      <div className="dashboard-list-meta">Status: {project.status || 'Ongoing'} • {project.featured ? 'Featured' : 'Standard'}</div>
                    </div>
                    <div className="dashboard-actions">
                      <button className="btn secondary" type="button" onClick={() => editProject(project)}>Edit</button>
                      <button className="btn secondary" type="button" onClick={() => handleDeleteProject(project.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activePanel === 'resources' && (
            <>
              <form className="dashboard-form" onSubmit={handleResourceSubmit}>
                <div className="dashboard-inline-row">
                  <div>
                    <label>Document title</label>
                    <input value={resourceTitle} onChange={(e) => setResourceTitle(e.target.value)} placeholder="Constitution PDF" />
                  </div>
                  <div>
                    <label>Type</label>
                    <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}>
                      <option value="constitution">Constitution</option>
                      <option value="registration">Registration Certificate</option>
                      <option value="bank">Bank Account Details</option>
                      <option value="handover">Handover Files</option>
                      <option value="other">Other Documents</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label>File</label>
                  <input type="file" onChange={(e) => setResourceFile(e.target.files?.[0] || null)} />
                </div>

                <div className="dashboard-actions">
                  <button type="submit" className="btn" disabled={savingResource}>{savingResource ? 'Uploading...' : 'Upload resource'}</button>
                </div>
              </form>

              <div className="dashboard-list" style={{ marginTop: 16 }}>
                {resources.length === 0 ? (
                  <div className="dashboard-empty">No resources uploaded yet.</div>
                ) : resources.map((resource) => (
                  <div key={resource.id} className="dashboard-list-item">
                    <div>
                      <strong>{resource.name}</strong>
                      <div>{resource.type}</div>
                      <div className="dashboard-list-meta">Uploaded {formatDate(resource.uploadedAt)} by {resource.uploadedBy || 'ECOSA leadership'}</div>
                    </div>
                    <div className="dashboard-actions">
                      <a className="btn secondary" href={resource.content} download={resource.filename}>Download</a>
                      <button className="btn secondary" type="button" onClick={() => handleDeleteResource(resource.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activePanel === 'updates' && (
            <>
              <form className="dashboard-form" onSubmit={publishUpdate}>
                <div className="dashboard-inline-row">
                  <div>
                    <label>Update type</label>
                    <select value={updateType} onChange={(e) => setUpdateType(e.target.value as any)}>
                      <option value="announcement">Announcement</option>
                      <option value="event">Event</option>
                      <option value="job">Job</option>
                    </select>
                  </div>
                  <div>
                    <label>Headline</label>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={headlinePlaceholder} />
                  </div>
                </div>

                <div className="dashboard-inline-row">
                  <div>
                    <label>Media file</label>
                    <input type="file" accept="image/*,video/*" onChange={(e) => handleUpdateMediaChange(e.target.files?.[0] || null)} />
                  </div>
                </div>

                <div>
                  <label>Message / description</label>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder={updateType === 'event' ? 'Add the event details, venue, and date.' : updateType === 'job' ? 'Add the job description and requirements.' : 'Write the announcement details here.'} />
                </div>

                {updateType === 'event' && (
                  <div className="dashboard-inline-row">
                    <div>
                      <label>Registration fee (UGX)</label>
                      <input value={actionAmount} onChange={(e) => setActionAmount(e.target.value)} placeholder="50000" />
                    </div>
                    <div>
                      <label>Registration target</label>
                      <input value="Payment page" disabled />
                    </div>
                  </div>
                )}

                {updateType === 'job' && (
                  <div className="dashboard-inline-row">
                    <div>
                      <label>Company / employer</label>
                      <input value={jobCompany} onChange={(e) => setJobCompany(e.target.value)} placeholder="TUAN Creations" />
                    </div>
                    <div>
                      <label>Apply link</label>
                      <input value={jobApplyUrl} onChange={(e) => setJobApplyUrl(e.target.value)} placeholder="/contact" />
                    </div>
                  </div>
                )}
                <div className="dashboard-actions">
                  <button className="btn" type="submit">Publish update</button>
                </div>
              </form>

              <div className="dashboard-list" style={{ marginTop: 16 }}>
                {posts.length === 0 ? (
                  <div className="dashboard-empty">No updates published yet.</div>
                ) : posts.map((post) => (
                  <div key={post.id} className="dashboard-list-item">
                    <div>
                      <strong>{post.title || post.question || post.content}</strong>
                      <div className="dashboard-list-meta">{(post.type || 'announcement').toUpperCase()} • Published {formatDate(post.createdAt)}</div>
                    </div>
                    <div className="dashboard-actions">
                      <div className="dashboard-chip">LIVE</div>
                      <button className="btn secondary" type="button" onClick={() => handleDeleteUpdate(post.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
