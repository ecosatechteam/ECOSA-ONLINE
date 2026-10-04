import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isValidPhoneNumber } from 'react-phone-number-input'
import PhoneNumberInput from '../components/PhoneNumberInput'
import {
  addPost,
  addResource,
  addHeroSlide,
  confirmPayment,
  deleteChapter,
  deleteHeroSlide,
  deleteLeader,
  deletePost,
  deleteProject,
  deleteResource,
  getAllMembers,
  getChapters,
  getLeaders,
  getPayments,
  getHeroSlides,
  getPosts,
  getProjects,
  getResources,
  saveMember,
  updateMember,
  saveChapter,
  saveLeader,
  saveProject,
  adminLogout,
  recordManualPayment,
  syncBuiltInHeroSlides,
  updateHeroSlide,
} from '../services/mockService'
import { builtInHeroSlides } from '../utils/heroSlides'

function formatDate(value?: string) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  return isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function isPaymentConfirmed(payment: any) {
  return String(payment.status || '').toLowerCase() === 'paid' || payment.paid === true
}

const START_YEAR = 2002
const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, index) => CURRENT_YEAR - index)

type MemberFormValues = {
  name: string
  email: string
  phone: string
  gender: string
  employment: string
  chapter: string
  yearFrom: string
  yearTo: string
  hasBusiness: boolean
  businessName: string
  businessDescription: string
}

function createEmptyMemberForm(): MemberFormValues {
  return {
    name: '',
    email: '',
    phone: '',
    gender: '',
    employment: '',
    chapter: '',
    yearFrom: '',
    yearTo: '',
    hasBusiness: false,
    businessName: '',
    businessDescription: '',
  }
}

function getYearsAtECI(yearsAtECI = '') {
  const match = String(yearsAtECI).match(/^(\d{4})(?:-(\d{4}))?$/)
  return {
    yearFrom: match?.[1] || '',
    yearTo: match?.[2] || '',
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [members, setMembers] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [chapters, setChapters] = useState<any[]>([])
  const [leaders, setLeaders] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [heroSlides, setHeroSlides] = useState<any[]>([])
  const [heroSlideFile, setHeroSlideFile] = useState<File | null>(null)
  const [uploadingHeroSlide, setUploadingHeroSlide] = useState(false)
  const [removingHeroSlideId, setRemovingHeroSlideId] = useState('')
  const [reviewingPaymentId, setReviewingPaymentId] = useState('')
  const [recordingPayment, setRecordingPayment] = useState(false)
  const [manualPayment, setManualPayment] = useState({
    memberEmail: '',
    amount: '20000',
    purpose: 'Alumni Dues',
    method: 'cash',
    reference: '',
    paidAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
  })
  const [activePanel, setActivePanel] = useState<'members' | 'payments' | 'chapters' | 'leaders' | 'projects' | 'resources' | 'updates' | 'hero-slides' | null>(null)
  const [memberFilter, setMemberFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const [showMemberForm, setShowMemberForm] = useState(false)
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
  const [savingMember, setSavingMember] = useState(false)
  const [savingChapter, setSavingChapter] = useState(false)
  const [savingLeader, setSavingLeader] = useState(false)
  const [savingProject, setSavingProject] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState('')
  const [viewingMemberId, setViewingMemberId] = useState('')
  const [savingMemberEdit, setSavingMemberEdit] = useState(false)
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
  const [memberForm, setMemberForm] = useState<MemberFormValues>(createEmptyMemberForm)
  const [memberEditForm, setMemberEditForm] = useState<MemberFormValues>(createEmptyMemberForm)

  async function loadData() {
    await syncBuiltInHeroSlides(builtInHeroSlides)
    const [memberData, paymentData, postData, resourceData, chapterData, heroSlideState] = await Promise.all([
      getAllMembers(),
      getPayments(),
      getPosts(),
      getResources(),
      getChapters(),
      getHeroSlides(true),
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
    setHeroSlides(heroSlideState.slides || [])
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
  const visiblePayments = paymentFilter === 'pending' ? payments.filter((payment) => !isPaymentConfirmed(payment)) : paymentFilter === 'paid' ? payments.filter(isPaymentConfirmed) : payments
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

  const handleRecordManualPayment = async (event: React.FormEvent) => {
    event.preventDefault()
    const member = members.find((item) => String(item.email || '').toLowerCase() === manualPayment.memberEmail.toLowerCase())
    const amount = Number(manualPayment.amount)
    if (!member) {
      alert('Select a member before recording the payment')
      return
    }
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      alert('Enter a valid whole-number amount')
      return
    }
    setRecordingPayment(true)
    try {
      await recordManualPayment({
        memberEmail: member.email,
        amount,
        purpose: manualPayment.purpose,
        method: manualPayment.method,
        reference: manualPayment.reference.trim(),
        paidAt: manualPayment.paidAt,
      })
      setManualPayment((current) => ({
        ...current,
        memberEmail: '',
        amount: '20000',
        reference: '',
        paidAt: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
      }))
      await loadData()
      alert('Member payment recorded')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to record the payment')
    } finally {
      setRecordingPayment(false)
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

  const getMemberPaymentHistory = (member: any) => {
    const memberKeys = [member.id, member._id, member.membershipNumber]
      .filter(Boolean)
      .map(String)
    const memberEmail = String(member.email || '').toLowerCase()
    return payments.filter((payment) => {
      const paymentKeys = [payment.memberId, payment.member?._id, payment.member?.id, payment.membershipNumber]
        .filter(Boolean)
        .map(String)
      const paymentEmail = String(payment.email || payment.memberEmail || payment.member?.email || '').toLowerCase()
      return paymentKeys.some((key) => memberKeys.includes(key))
        || Boolean(memberEmail && paymentEmail === memberEmail)
        || Boolean(memberKeys.includes(String(payment.id || '').replace(/^pay_/, '')))
    }).sort((a, b) => new Date(b.createdAt || b.confirmedAt || b.at || 0).getTime() - new Date(a.createdAt || a.confirmedAt || a.at || 0).getTime())
  }

  const handleMemberSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!memberForm.name || !memberForm.email || !memberForm.chapter) {
      alert('Add the member name, email, and chapter')
      return
    }

    setSavingMember(true)
    try {
      await saveMember({
        id: `member-${Date.now()}`,
        name: memberForm.name,
        email: memberForm.email,
        phone: memberForm.phone,
        gender: memberForm.gender,
        chapter: memberForm.chapter,
        yearsAtECI: memberForm.yearFrom && memberForm.yearTo
          ? `${memberForm.yearFrom}-${memberForm.yearTo}`
          : memberForm.yearFrom || memberForm.yearTo || '',
        employment: memberForm.employment,
        hasBusiness: memberForm.hasBusiness,
        businessName: memberForm.hasBusiness ? memberForm.businessName : undefined,
        businessDescription: memberForm.hasBusiness ? memberForm.businessDescription : undefined,
        paymentStatus: 'pending',
        registeredAt: new Date().toISOString(),
      } as any)
      setMemberForm({ name: '', email: '', phone: '', gender: '', employment: '', chapter: '', yearFrom: '', yearTo: '', hasBusiness: false, businessName: '', businessDescription: '' })
      setShowMemberForm(false)
      await loadData()
      alert('Member registered successfully')
    } finally {
      setSavingMember(false)
    }
  }

  const startMemberEdit = (member: any) => {
    const { yearFrom, yearTo } = getYearsAtECI(member.yearsAtECI)
    setMemberEditForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      gender: member.gender || '',
      employment: member.employment || '',
      chapter: member.chapter || '',
      yearFrom,
      yearTo,
      hasBusiness: Boolean(member.hasBusiness || member.businessName || member.business),
      businessName: member.businessName || '',
      businessDescription: member.businessDescription || '',
    })
    setShowMemberForm(false)
    setEditingMemberId(String(member.id || member._id || member.membershipNumber || member.email))
  }

  const handleMemberEditSubmit = async (event: React.FormEvent, member: any) => {
    event.preventDefault()
    if (!memberEditForm.name.trim() || !memberEditForm.email.trim() || !memberEditForm.chapter || !memberEditForm.gender) {
      alert('Add the member name, email, gender, and chapter')
      return
    }
    if (memberEditForm.phone && !isValidPhoneNumber(memberEditForm.phone)) {
      alert('Choose a country code and enter a valid phone number')
      return
    }

    const memberId = String(member.id || member._id || member.membershipNumber || member.email)
    setSavingMemberEdit(true)
    try {
      await updateMember(memberId, {
        originalEmail: member.email || '',
        member: {
          name: memberEditForm.name.trim(),
          email: memberEditForm.email.trim(),
          phone: memberEditForm.phone,
          gender: memberEditForm.gender,
          chapter: memberEditForm.chapter,
          yearsAtECI: memberEditForm.yearFrom && memberEditForm.yearTo
            ? `${memberEditForm.yearFrom}-${memberEditForm.yearTo}`
            : memberEditForm.yearFrom || memberEditForm.yearTo || '',
          employment: memberEditForm.employment,
          hasBusiness: memberEditForm.hasBusiness,
          businessName: memberEditForm.hasBusiness ? memberEditForm.businessName : '',
          businessDescription: memberEditForm.hasBusiness ? memberEditForm.businessDescription : '',
        },
      })
      setEditingMemberId('')
      setMemberEditForm(createEmptyMemberForm())
      await loadData()
      alert('Member information updated successfully')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not update member information. Please try again.')
    } finally {
      setSavingMemberEdit(false)
    }
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

  const handleHeroSlideSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!heroSlideFile) {
      alert('Choose a photo to add to the homepage hero')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(heroSlideFile.type)) {
      alert('Choose a JPEG, PNG, WebP, or AVIF photo')
      return
    }
    if (heroSlideFile.size > 5 * 1024 * 1024) {
      alert('Photo must be 5 MB or smaller')
      return
    }

    setUploadingHeroSlide(true)
    try {
      await addHeroSlide(heroSlideFile)
      setHeroSlideFile(null)
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to add hero photo')
    } finally {
      setUploadingHeroSlide(false)
    }
  }

  const handleDeleteHeroSlide = async (slideId: string) => {
    if (!confirm('Remove this photo from the homepage hero?')) return
    setRemovingHeroSlideId(slideId)
    try {
      await deleteHeroSlide(slideId)
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to remove hero photo')
    } finally {
      setRemovingHeroSlideId('')
    }
  }

  const handleHeroSlideActiveChange = async (slideId: string, active: boolean) => {
    try {
      await updateHeroSlide(slideId, active)
      await loadData()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update hero photo')
    }
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
    'hero-slides': { title: 'Manage hero photos', description: 'Add or remove the photos shown in the homepage hero slideshow.' },
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
          <button type="button" className="btn secondary" onClick={() => { adminLogout(); navigate('/admin/login', { replace: true }) }}>Log out</button>
          <button type="button" className={`btn${activePanel === 'members' ? ' secondary' : ''}`} onClick={() => setActivePanel('members')}>Review members</button>
          <button type="button" className={`btn${activePanel === 'payments' ? ' secondary' : ''}`} onClick={() => setActivePanel('payments')}>Confirm payments</button>
          <button type="button" className={`btn${activePanel === 'chapters' ? ' secondary' : ''}`} onClick={() => setActivePanel('chapters')}>Manage chapters</button>
          <button type="button" className={`btn${activePanel === 'leaders' ? ' secondary' : ''}`} onClick={() => setActivePanel('leaders')}>Manage leaders</button>
          <button type="button" className={`btn${activePanel === 'projects' ? ' secondary' : ''}`} onClick={() => setActivePanel('projects')}>Manage projects</button>
          <button type="button" className={`btn${activePanel === 'resources' ? ' secondary' : ''}`} onClick={() => setActivePanel('resources')}>Manage resources</button>
          <button type="button" className={`btn${activePanel === 'updates' ? ' secondary' : ''}`} onClick={() => setActivePanel('updates')}>Publish update</button>
          <button type="button" className={`btn${activePanel === 'hero-slides' ? ' secondary' : ''}`} onClick={() => setActivePanel('hero-slides')}>Manage hero photos</button>
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
              <button type="button" className={`field-btn${activePanel === 'hero-slides' ? ' active' : ''}`} onClick={() => setActivePanel('hero-slides')}>Hero photos</button>
            </div>
          </div>

          {activePanel === 'members' && (
            <div>
              <div className="dashboard-toolbar" style={{ marginBottom: 12 }}>
                <button type="button" className={`field-btn${memberFilter === 'all' && !showMemberForm ? ' active' : ''}`} onClick={() => { setMemberFilter('all'); setShowMemberForm(false); setEditingMemberId(''); setViewingMemberId('') }}>All</button>
                <button type="button" className={`field-btn${memberFilter === 'pending' && !showMemberForm ? ' active' : ''}`} onClick={() => { setMemberFilter('pending'); setShowMemberForm(false); setEditingMemberId(''); setViewingMemberId('') }}>Pending</button>
                <button type="button" className={`field-btn${memberFilter === 'paid' && !showMemberForm ? ' active' : ''}`} onClick={() => { setMemberFilter('paid'); setShowMemberForm(false); setEditingMemberId(''); setViewingMemberId('') }}>Paid</button>
                <button type="button" className={`field-btn${showMemberForm ? ' active' : ''}`} onClick={() => { setShowMemberForm(true); setEditingMemberId(''); setViewingMemberId('') }}>Register</button>
              </div>
              {showMemberForm && (
                <form className="dashboard-card dashboard-member-form" onSubmit={handleMemberSubmit}>
                  <div className="dashboard-section-head">
                    <div>
                      <h4>Register a member</h4>
                      <p className="muted">Add an alumni record directly to the directory for payment review.</p>
                    </div>
                  </div>
                  <div className="dashboard-inline-row">
                    <div>
                      <label htmlFor="dashboard-member-name">Name</label>
                      <input id="dashboard-member-name" value={memberForm.name} onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })} required />
                    </div>
                    <div>
                      <label htmlFor="dashboard-member-email">Email</label>
                      <input id="dashboard-member-email" type="email" value={memberForm.email} onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })} required />
                    </div>
                    <div>
                      <label htmlFor="dashboard-member-phone">Phone (select country code first)</label>
                      <PhoneNumberInput id="dashboard-member-phone" value={memberForm.phone} onChange={(phone) => setMemberForm({ ...memberForm, phone })} />
                    </div>
                    <div>
                      <label htmlFor="dashboard-member-gender">Gender</label>
                      <select id="dashboard-member-gender" value={memberForm.gender} onChange={(event) => setMemberForm({ ...memberForm, gender: event.target.value })} required>
                        <option value="">Select gender</option>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="dashboard-member-chapter">Chapter</label>
                      <select id="dashboard-member-chapter" value={memberForm.chapter} onChange={(event) => setMemberForm({ ...memberForm, chapter: event.target.value })} required>
                        <option value="">Select chapter</option>
                        {chapters.map((chapter) => <option key={chapter.id || chapter.name} value={chapter.name}>{chapter.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label>Years at ECI</label>
                      <div className="dashboard-inline-row dashboard-year-fields">
                        <select aria-label="Year from" value={memberForm.yearFrom} onChange={(event) => setMemberForm({ ...memberForm, yearFrom: event.target.value })}>
                          <option value="">From</option>
                          {YEAR_OPTIONS.map((year) => <option key={`from-${year}`} value={year}>{year}</option>)}
                        </select>
                        <select aria-label="Year to" value={memberForm.yearTo} onChange={(event) => setMemberForm({ ...memberForm, yearTo: event.target.value })}>
                          <option value="">To</option>
                          {YEAR_OPTIONS.map((year) => <option key={`to-${year}`} value={year}>{year}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="dashboard-member-employment">Profession/Career</label>
                      <input id="dashboard-member-employment" value={memberForm.employment} onChange={(event) => setMemberForm({ ...memberForm, employment: event.target.value })} />
                    </div>
                  </div>
                  <label className="dashboard-checkbox-label" htmlFor="dashboard-member-has-business">
                    <input id="dashboard-member-has-business" type="checkbox" checked={memberForm.hasBusiness} onChange={(event) => setMemberForm({ ...memberForm, hasBusiness: event.target.checked })} />
                    I own a business
                  </label>
                  {memberForm.hasBusiness && (
                    <div className="dashboard-inline-row">
                      <div>
                        <label htmlFor="dashboard-member-business-name">Business Name</label>
                        <input id="dashboard-member-business-name" value={memberForm.businessName} onChange={(event) => setMemberForm({ ...memberForm, businessName: event.target.value })} />
                      </div>
                      <div>
                        <label htmlFor="dashboard-member-business-description">What does your business do?</label>
                        <input id="dashboard-member-business-description" value={memberForm.businessDescription} onChange={(event) => setMemberForm({ ...memberForm, businessDescription: event.target.value })} />
                      </div>
                    </div>
                  )}
                  <div className="actions">
                    <button className="btn" type="submit" disabled={savingMember}>{savingMember ? 'Saving member...' : 'Register member'}</button>
                  </div>
                </form>
              )}
              {editingMemberId && (() => {
                const editingMember = members.find((member) => String(member.id || member._id || member.membershipNumber || member.email) === editingMemberId)
                if (!editingMember) return null
                const chapterOptions = [...new Set([memberEditForm.chapter, ...chapters.map((chapter) => chapter.name)].filter(Boolean))]
                return (
                  <form className="dashboard-card dashboard-member-form" onSubmit={(event) => handleMemberEditSubmit(event, editingMember)}>
                    <div className="dashboard-section-head">
                      <div>
                        <h4>Edit member information</h4>
                        <p className="muted">Update the same details collected during member registration. Payment status and membership number will be preserved.</p>
                      </div>
                    </div>
                    <div className="dashboard-inline-row">
                      <div>
                        <label htmlFor="edit-member-name">Name</label>
                        <input id="edit-member-name" value={memberEditForm.name} onChange={(event) => setMemberEditForm({ ...memberEditForm, name: event.target.value })} required />
                      </div>
                      <div>
                        <label htmlFor="edit-member-email">Email</label>
                        <input id="edit-member-email" type="email" value={memberEditForm.email} onChange={(event) => setMemberEditForm({ ...memberEditForm, email: event.target.value })} required />
                      </div>
                      <div>
                        <label htmlFor="edit-member-phone">Phone (select country code first)</label>
                        <PhoneNumberInput id="edit-member-phone" value={memberEditForm.phone} onChange={(phone) => setMemberEditForm({ ...memberEditForm, phone })} />
                      </div>
                      <div>
                        <label htmlFor="edit-member-gender">Gender</label>
                        <select id="edit-member-gender" value={memberEditForm.gender} onChange={(event) => setMemberEditForm({ ...memberEditForm, gender: event.target.value })} required>
                          <option value="">Select gender</option>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="edit-member-chapter">Chapter</label>
                        <select id="edit-member-chapter" value={memberEditForm.chapter} onChange={(event) => setMemberEditForm({ ...memberEditForm, chapter: event.target.value })} required>
                          <option value="">Select chapter</option>
                          {chapterOptions.map((chapter) => <option key={chapter} value={chapter}>{chapter}</option>)}
                        </select>
                      </div>
                      <div>
                        <label>Years at ECI</label>
                        <div className="dashboard-inline-row dashboard-year-fields">
                          <select aria-label="Edit years at ECI from" value={memberEditForm.yearFrom} onChange={(event) => setMemberEditForm({ ...memberEditForm, yearFrom: event.target.value })}>
                            <option value="">From</option>
                            {YEAR_OPTIONS.map((year) => <option key={`edit-from-${year}`} value={year}>{year}</option>)}
                          </select>
                          <select aria-label="Edit years at ECI to" value={memberEditForm.yearTo} onChange={(event) => setMemberEditForm({ ...memberEditForm, yearTo: event.target.value })}>
                            <option value="">To</option>
                            {YEAR_OPTIONS.map((year) => <option key={`edit-to-${year}`} value={year}>{year}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label htmlFor="edit-member-employment">Profession/Career</label>
                        <input id="edit-member-employment" value={memberEditForm.employment} onChange={(event) => setMemberEditForm({ ...memberEditForm, employment: event.target.value })} />
                      </div>
                    </div>
                    <label className="dashboard-checkbox-label" htmlFor="edit-member-has-business">
                      <input id="edit-member-has-business" type="checkbox" checked={memberEditForm.hasBusiness} onChange={(event) => setMemberEditForm({ ...memberEditForm, hasBusiness: event.target.checked })} />
                      I own a business
                    </label>
                    {memberEditForm.hasBusiness && (
                      <div className="dashboard-inline-row">
                        <div>
                          <label htmlFor="edit-member-business-name">Business Name</label>
                          <input id="edit-member-business-name" value={memberEditForm.businessName} onChange={(event) => setMemberEditForm({ ...memberEditForm, businessName: event.target.value })} />
                        </div>
                        <div>
                          <label htmlFor="edit-member-business-description">What does your business do?</label>
                          <input id="edit-member-business-description" value={memberEditForm.businessDescription} onChange={(event) => setMemberEditForm({ ...memberEditForm, businessDescription: event.target.value })} />
                        </div>
                      </div>
                    )}
                    <div className="actions">
                      <button className="btn" type="submit" disabled={savingMemberEdit}>{savingMemberEdit ? 'Saving changes...' : 'Save member details'}</button>
                      <button className="btn secondary" type="button" disabled={savingMemberEdit} onClick={() => { setEditingMemberId(''); setMemberEditForm(createEmptyMemberForm()) }}>Cancel</button>
                    </div>
                  </form>
                )
              })()}
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
                      <React.Fragment key={member.id || member.email}>
                      <tr>
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
                            <button className="btn secondary" type="button" onClick={() => { setViewingMemberId(viewingMemberId === String(member.id || member._id || member.membershipNumber || member.email) ? '' : String(member.id || member._id || member.membershipNumber || member.email)); setEditingMemberId('') }}>
                              {viewingMemberId === String(member.id || member._id || member.membershipNumber || member.email) ? 'Hide details' : 'View details'}
                            </button>
                            <button className="btn secondary" type="button" onClick={() => startMemberEdit(member)}>
                              Edit
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
                      {viewingMemberId === String(member.id || member._id || member.membershipNumber || member.email) && (
                        <tr>
                          <td colSpan={6}>
                            <section className="card dashboard-member-details" aria-label={`${member.name || 'Member'} complete details`}>
                              <h4>Complete member information</h4>
                              <dl className="dashboard-member-details-grid">
                                {[
                                  ['Name', member.name],
                                  ['Email', member.email],
                                  ['Phone', member.phone],
                                  ['Gender', member.gender],
                                  ['Chapter', member.chapter],
                                  ['Location', member.location || member.chapter],
                                  ['Status', member.paymentStatus],
                                  ['Membership No.', member.membershipNumber],
                                  ['Years at ECI', member.yearsAtECI],
                                  ['Profession/Career', member.employment],
                                  ['Owns a business', member.hasBusiness ? 'Yes' : 'No'],
                                  ['Business Name', member.businessName || member.business],
                                  ['Business Description', member.businessDescription],
                                  ['Registered', formatDate(member.registeredAt || member.createdAt)],
                                  ['Confirmed', formatDate(member.confirmedAt)],
                                ].map(([label, value]) => (
                                  <div key={label}>
                                    <dt>{label}</dt>
                                    <dd>{value === true ? 'Yes' : value === false ? 'No' : value || 'Not provided'}</dd>
                                  </div>
                                ))}
                              </dl>
                              <h4>Payment history</h4>
                              {getMemberPaymentHistory(member).length === 0 ? (
                                <p className="muted">No payment records found for this member.</p>
                              ) : (
                                <div className="dashboard-table-wrap">
                                  <table className="dashboard-table">
                                    <thead>
                                      <tr>
                                        <th>Date</th>
                                        <th>Purpose</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Reference</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {getMemberPaymentHistory(member).map((payment) => (
                                        <tr key={payment._id || payment.id || payment.txRef}>
                                          <td>{formatDate(payment.createdAt || payment.confirmedAt || payment.at)}</td>
                                          <td>{payment.purpose || 'Membership'}</td>
                                          <td>{payment.currency || 'UGX'} {Number(payment.amount || 0).toLocaleString()}</td>
                                          <td>{payment.method || 'Not provided'}</td>
                                          <td>{String(payment.status || (payment.paid ? 'paid' : 'pending')).toUpperCase()}</td>
                                          <td>{payment.gatewayReference || payment.txRef || payment.reference || 'Not provided'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </section>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePanel === 'payments' && (
            <div>
              <form className="dashboard-form dashboard-manual-payment-form" onSubmit={handleRecordManualPayment}>
                <div>
                  <h4>Record a member payment</h4>
                  <p className="muted">Record a payment received outside the website. Membership dues will also update the member's membership status.</p>
                </div>
                <div className="dashboard-inline-row">
                  <div>
                    <label htmlFor="manual-payment-member">Member</label>
                    <select
                      id="manual-payment-member"
                      value={manualPayment.memberEmail}
                      onChange={(event) => setManualPayment({ ...manualPayment, memberEmail: event.target.value })}
                      required
                    >
                      <option value="">Select a member</option>
                      {members.filter((member) => member.email).map((member) => (
                        <option key={member.email} value={member.email}>
                          {member.name || 'Unnamed member'} ({member.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="manual-payment-amount">Amount (UGX)</label>
                    <input id="manual-payment-amount" type="number" min="1" step="1" value={manualPayment.amount} onChange={(event) => setManualPayment({ ...manualPayment, amount: event.target.value })} required />
                  </div>
                  <div>
                    <label htmlFor="manual-payment-purpose">Purpose</label>
                    <input id="manual-payment-purpose" value={manualPayment.purpose} onChange={(event) => setManualPayment({ ...manualPayment, purpose: event.target.value })} maxLength={100} required />
                  </div>
                </div>
                <div className="dashboard-inline-row">
                  <div>
                    <label htmlFor="manual-payment-method">Payment method</label>
                    <select id="manual-payment-method" value={manualPayment.method} onChange={(event) => setManualPayment({ ...manualPayment, method: event.target.value })}>
                      <option value="cash">Cash</option>
                      <option value="bank">Bank transfer</option>
                      <option value="mobile">Mobile money</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="manual-payment-reference">Receipt / transaction reference (optional)</label>
                    <input id="manual-payment-reference" value={manualPayment.reference} onChange={(event) => setManualPayment({ ...manualPayment, reference: event.target.value })} maxLength={200} />
                  </div>
                  <div>
                    <label htmlFor="manual-payment-date">Payment date</label>
                    <input id="manual-payment-date" type="date" value={manualPayment.paidAt} onChange={(event) => setManualPayment({ ...manualPayment, paidAt: event.target.value })} required />
                  </div>
                </div>
                <div className="dashboard-actions">
                  <button className="btn" type="submit" disabled={recordingPayment || !members.length}>
                    {recordingPayment ? 'Recording payment...' : 'Record confirmed payment'}
                  </button>
                </div>
              </form>

              <div className="dashboard-list" style={{ marginTop: 16 }}>
              <div className="dashboard-toolbar" style={{ marginBottom: 12 }}>
                <button type="button" className={`field-btn${paymentFilter === 'pending' ? ' active' : ''}`} onClick={() => setPaymentFilter('pending')}>Pending</button>
                <button type="button" className={`field-btn${paymentFilter === 'paid' ? ' active' : ''}`} onClick={() => setPaymentFilter('paid')}>Paid</button>
                <button type="button" className={`field-btn${paymentFilter === 'all' ? ' active' : ''}`} onClick={() => setPaymentFilter('all')}>All</button>
              </div>
              {visiblePayments.length === 0 ? (
                <div className="dashboard-empty">No payment records in this view.</div>
              ) : visiblePayments.map((payment) => {
                const id = String(payment._id || payment.id)
                const confirmed = isPaymentConfirmed(payment)
                const reviewing = reviewingPaymentId === id
                return (
                  <div key={id} className="dashboard-list-item dashboard-payment-review-item">
                    <div>
                      <strong>{payment.memberName || payment.name || 'Unknown member'}</strong>
                      <div>{payment.purpose || 'Membership'} • {payment.currency || 'UGX'} {Number(payment.amount || 0).toLocaleString()}</div>
                      <div className="dashboard-list-meta">{payment.email || 'No email'} • {formatDate(payment.createdAt || payment.confirmedAt || payment.at)}</div>
                    </div>
                    <div className="dashboard-actions">
                      <span className={`dashboard-chip ${confirmed ? 'success' : 'warn'}`}>{confirmed ? 'CONFIRMED' : 'PENDING'}</span>
                      {confirmed && (
                        <button
                          className="btn secondary"
                          type="button"
                          aria-expanded={reviewing}
                          onClick={() => setReviewingPaymentId(reviewing ? '' : id)}
                        >
                          {reviewing ? 'Close review' : 'Review'}
                        </button>
                      )}
                      {!confirmed && (
                        <button className="btn" type="button" onClick={() => handleConfirmPayment(payment)} disabled={busyPaymentId === id}>
                          {busyPaymentId === id ? 'Confirming...' : 'Confirm payment'}
                        </button>
                      )}
                    </div>
                    {confirmed && reviewing && (
                      <section className="card dashboard-member-details" aria-label={`Payment review for ${payment.memberName || payment.name || 'member'}`}>
                        <h4>Confirmed payment details</h4>
                        <dl className="dashboard-member-details-grid">
                          {[
                            ['Member', payment.memberName || payment.name],
                            ['Email', payment.email],
                            ['Phone', payment.phone],
                            ['Purpose', payment.purpose],
                            ['Amount', `${payment.currency || 'UGX'} ${Number(payment.amount || 0).toLocaleString()}`],
                            ['Method', payment.method],
                            ['Status', payment.status || (payment.paid ? 'paid' : 'pending')],
                            ['Transaction reference', payment.txRef],
                            ['Gateway reference', payment.gatewayReference || payment.reference],
                            ['Paid on', formatDate(payment.confirmedAt)],
                            ['Recorded on', formatDate(payment.createdAt || payment.at)],
                          ].map(([label, value]) => (
                            <div key={label}>
                              <dt>{label}</dt>
                              <dd>{value || 'Not provided'}</dd>
                            </div>
                          ))}
                        </dl>
                        {payment.receiptUrl && <a className="btn secondary" href={payment.receiptUrl} target="_blank" rel="noreferrer">View receipt</a>}
                      </section>
                    )}
                  </div>
                )
              })}
              </div>
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

          {activePanel === 'hero-slides' && (
            <>
              <form className="dashboard-form" onSubmit={handleHeroSlideSubmit}>
                <div>
                  <label htmlFor="hero-slide-file">Photo (JPEG, PNG, WebP, or AVIF; max 5 MB)</label>
                  <input
                    id="hero-slide-file"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    onChange={(event) => setHeroSlideFile(event.target.files?.[0] || null)}
                  />
                </div>
                <div className="dashboard-actions">
                  <button className="btn" type="submit" disabled={!heroSlideFile || uploadingHeroSlide}>
                    {uploadingHeroSlide ? 'Adding photo...' : 'Add hero photo'}
                  </button>
                </div>
              </form>

              <div className="dashboard-list" style={{ marginTop: 16 }}>
                {heroSlides.length === 0 ? (
                  <div className="dashboard-empty">No custom hero photos uploaded. The homepage will use its built-in slides.</div>
                ) : heroSlides.map((slide) => (
                  <div key={slide.id} className="dashboard-list-item">
                    <div className="dashboard-hero-slide-item">
                      <img src={slide.imageUrl} alt={slide.name || 'Homepage hero slide'} />
                      <div>
                        <strong>{slide.name || 'Homepage hero photo'}</strong>
                        <div className="dashboard-list-meta">
                          {slide.source === 'builtin' ? 'Built-in slide' : `Added ${formatDate(slide.uploadedAt)}`}
                          {slide.active === false ? ' • Hidden from slideshow' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="dashboard-actions">
                      {slide.source === 'builtin' ? (
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => handleHeroSlideActiveChange(slide.id, slide.active === false)}
                        >
                          {slide.active === false ? 'Restore photo' : 'Hide photo'}
                        </button>
                      ) : (
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => handleDeleteHeroSlide(slide.id)}
                          disabled={removingHeroSlideId === slide.id}
                        >
                          {removingHeroSlideId === slide.id ? 'Removing...' : 'Remove photo'}
                        </button>
                      )}
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
