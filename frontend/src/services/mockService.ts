export type Member = {
  id: string
  name: string
  email: string
  phone?: string
  universities?: string[]
  employment?: string
  business?: string
  hasBusiness?: boolean
  businessName?: string
  businessDescription?: string
  location?: string
  yearsAtECI?: string
  membershipNumber?: string
  registeredAt?: string
  chapter?: string
  isAdmin?: boolean
}

export type Chapter = {
  id: string
  name: string
  description: string
  chairperson?: string
  members?: number
  location?: string
  status?: string
}

const SESS_KEY = 'ecosa_session'
const CHAPTERS_KEY = 'ecosa_chapters'
const DEFAULT_CHAPTERS: Chapter[] = [
  { id: 'chap_kampala', name: 'Kampala', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Kampala Chapter brings together ECOSA members living and working in Kampala and the surrounding areas.' },
  { id: 'chap_ibanda', name: 'Ibanda', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Ibanda Chapter serves members residing in Ibanda District and neighboring areas.' },
  { id: 'chap_mbarara', name: 'Mbarara', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Mbarara Chapter connects alumni living and working in Western Uganda.' },
  { id: 'chap_fort_portal', name: 'Fort Portal', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Fort Portal Chapter promotes networking and collaboration among alumni in the Tooro region.' },
  { id: 'chap_gulu', name: 'Gulu', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Gulu Chapter brings together alumni living in Northern Uganda.' },
  { id: 'chap_jinja', name: 'Jinja', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Jinja Chapter supports alumni in Busoga and Eastern Uganda.' },
  { id: 'chap_kabale', name: 'Kabale', chairperson: 'TBA', members: 0, status: 'Active', description: 'The Kabale Chapter represents alumni living in the Kigezi region.' },
  { id: 'chap_uae', name: 'UAE', chairperson: 'TBA', members: 0, status: 'Planned', description: 'The UAE Chapter brings together ECOSA members living and working in the United Arab Emirates.' },
  { id: 'chap_usa', name: 'USA', chairperson: 'TBA', members: 0, status: 'Planned', description: 'The USA Chapter connects ECOSA members across the United States.' },
]

async function api(path: string, opts?: any) {
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'
  try {
    const res = await fetch(base + path, opts)
    if (res.ok) return res.json()
    throw new Error('API error')
  } catch (e) {
    return Promise.reject(e)
  }
}

// session helpers
export function getSession() {
  return JSON.parse(localStorage.getItem(SESS_KEY) || 'null')
}
export function logout() {
  localStorage.removeItem(SESS_KEY)
}

// Auth
export async function authLogin(email: string, password?: string) {
  try {
    const res = await api('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem(SESS_KEY, JSON.stringify({ email }))
    return res
  } catch (e) {
    const members = JSON.parse(localStorage.getItem('ecosa_members') || '[]')
    const m = members.find((x: any) => x.email === email && (password ? x.password === password : true))
    if (m) {
      localStorage.setItem(SESS_KEY, JSON.stringify({ email }))
      return m
    }
    return Promise.reject(e)
  }
}

export async function authLogout() {
  try {
    await api('/auth/logout', { method: 'POST' })
    logout()
  } catch (e) {
    logout()
  }
}

export async function authRegister(name: string, email: string, password: string, yearsAtECI?: string) {
  try {
    const res = await api('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, yearsAtECI }),
    })
    localStorage.setItem(SESS_KEY, JSON.stringify({ email }))
    return res
  } catch (err) {
    const list = JSON.parse(localStorage.getItem('ecosa_members') || '[]')
    const existing = list.find((x: any) => x.email === email)
    const m = { id: Date.now().toString(), name, email, password, yearsAtECI }
    if (existing) Object.assign(existing, m)
    else list.push(m)
    localStorage.setItem('ecosa_members', JSON.stringify(list))
    localStorage.setItem(SESS_KEY, JSON.stringify({ email }))
    return m
  }
}

export async function getChapters() {
  try {
    return await api('/chapters')
  } catch {
    return readChapters()
  }
}

export async function saveChapter(chapter: Chapter) {
  try {
    const method = chapter.id ? 'PUT' : 'POST'
    const url = chapter.id ? `/chapters/${encodeURIComponent(chapter.id)}` : '/chapters'
    return await api(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chapter),
    })
  } catch {
    const chapters = read(CHAPTERS_KEY)
    const next = { ...chapter, id: chapter.id || `chap_${Date.now()}`, members: Number(chapter.members || 0) }
    const index = chapters.findIndex((item: any) => item.id === next.id)
    if (index >= 0) chapters[index] = { ...chapters[index], ...next }
    else chapters.unshift(next)
    write(CHAPTERS_KEY, chapters)
    return next
  }
}

export async function deleteChapter(chapterId: string) {
  try {
    return await api(`/chapters/${encodeURIComponent(chapterId)}`, { method: 'DELETE' })
  } catch {
    const chapters = read(CHAPTERS_KEY)
    write(CHAPTERS_KEY, chapters.filter((item: any) => item.id !== chapterId))
    return { ok: true }
  }
}

export async function getLeaders(regime?: string) {
  try {
    const url = regime ? `/leaders?regime=${encodeURIComponent(regime)}` : '/leaders'
    return await api(url)
  } catch {
    const leaders = readLeaders().map((leader: any) => ({ ...leader, regime: leader.regime || 'current' }))
    if (!regime || regime === 'current') return leaders.filter((leader: any) => (leader.regime || 'current') === 'current')
    return leaders.filter((leader: any) => String(leader.regime || '').toLowerCase().includes(String(regime).toLowerCase()))
  }
}

export async function saveLeader(leader: any) {
  try {
    const method = leader.id ? 'PUT' : 'POST'
    const url = leader.id ? `/leaders/${encodeURIComponent(leader.id)}` : '/leaders'
    return await api(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leader),
    })
  } catch {
    const leaders = read('ecosa_leaders')
    const next = { ...leader, id: leader.id || `leader_${Date.now()}`, regime: leader.regime || 'current' }
    const index = leaders.findIndex((item: any) => item.id === next.id)
    if (index >= 0) leaders[index] = { ...leaders[index], ...next }
    else leaders.unshift(next)
    write('ecosa_leaders', leaders)
    return next
  }
}

export async function deleteLeader(leaderId: string) {
  try {
    return await api(`/leaders/${encodeURIComponent(leaderId)}`, { method: 'DELETE' })
  } catch {
    const leaders = read('ecosa_leaders')
    write('ecosa_leaders', leaders.filter((item: any) => item.id !== leaderId))
    return { ok: true }
  }
}

export async function getProjects() {
  try {
    return await api('/projects')
  } catch {
    return readProjects()
  }
}

export async function saveProject(project: any) {
  try {
    const method = project.id ? 'PUT' : 'POST'
    const url = project.id ? `/projects/${encodeURIComponent(project.id)}` : '/projects'
    return await api(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    })
  } catch {
    const projects = read('ecosa_projects')
    const next = { ...project, id: project.id || `proj_${Date.now()}`, featured: Boolean(project.featured) }
    const index = projects.findIndex((item: any) => item.id === next.id)
    if (index >= 0) projects[index] = { ...projects[index], ...next }
    else projects.unshift(next)
    write('ecosa_projects', projects)
    return next
  }
}

export async function deleteProject(projectId: string) {
  try {
    return await api(`/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' })
  } catch {
    const projects = read('ecosa_projects')
    write('ecosa_projects', projects.filter((item: any) => item.id !== projectId))
    return { ok: true }
  }
}

// Generic helpers for local storage fallback
function read(key: string) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    localStorage.removeItem(key)
    return []
  }
}
function write(key: string, val: any) {
  localStorage.setItem(key, JSON.stringify(val))
}

function readChapters() {
  const chapters = read(CHAPTERS_KEY)
  return chapters.length ? chapters : DEFAULT_CHAPTERS
}

function readLeaders() {
  const leaders = read('ecosa_leaders')
  return leaders.length
    ? leaders
    : [
        { id: 'l_chair', name: 'Omuteeganda Adson', role: 'Chair (Interim)', regime: 'current', bio: 'Leads the interim ECOSA executive and oversees administrative coordination.' },
        { id: 'l_secretary', name: 'Agaba Francis', role: 'Secretary (Interim)', regime: 'current', bio: 'Coordinates correspondence, records, and executive follow-up.' },
        { id: 'l_treasurer', name: 'Evas Turinawe', role: 'Treasurer (Interim)', regime: 'current', bio: 'Oversees member finances, payments, and financial reporting.' },
        { id: 'l_outreach', name: 'Benard Mugumya', role: 'Outreach Lead', regime: 'current', bio: 'Connects members, chapters, and external partners across the association.' },
      ]
}

function readProjects() {
  const projects = read('ecosa_projects')
  return projects.length
    ? projects
    : [
        { id: 'proj_sacco', title: 'ECOSA SACCO', description: 'A member-owned savings and credit cooperative helping alumni save, access loans, and build financial security together.', status: 'Ongoing', featured: true },
        { id: 'proj_insurance', title: 'ECOSA Medical Insurance', description: 'Affordable group medical cover for alumni and their families, providing access to quality healthcare when it matters most.', status: 'Ongoing', featured: true },
      ]
}

function readPosts() {
  const posts = read('ecosa_posts')
  if (posts.length) return posts
  return [
    {
      id: 'p_seed_event',
      type: 'event',
      author: 'Behangana Keneth',
      title: 'ECOSA Networking Dinner',
      content: 'You\'re invited — ECOSA Networking Dinner. Reconnect and build partnerships. The event will happen on Friday 27th November, 2026. Tickets: UGX 50,000 — register to secure your seat. Venue: SKYz Hotel Naguru.',
      media: '/sample-event1.svg',
      createdAt: new Date().toISOString(),
      comments: [],
      likes: [],
      shares: 0,
      rsvps: [],
      eventType: 'register',
      actionLabel: 'Register',
      registerUrl: '/payments?purpose=Event+Ticket&amount=50000',
    },
  ]
}

// Members
export async function getMembers() {
  try {
    const result = await api('/members')
    if (Array.isArray(result) && result.length) return result
    return read('ecosa_members').filter((m: any) => m.paymentStatus === 'paid' || m.membershipNumber)
  } catch {
    return read('ecosa_members').filter((m: any) => m.paymentStatus === 'paid' || m.membershipNumber)
  }
}

export async function getAllMembers() {
  try {
    const result = await api('/members?all=true')
    if (Array.isArray(result) && result.length) return result
    return read('ecosa_members')
  } catch {
    return read('ecosa_members')
  }
}
export async function saveMember(m: Member) {
  try {
    return await api('/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    })
  } catch {
    const list = read('ecosa_members')
    const existing = list.find((x: any) => x.email === m.email)
    if (existing) Object.assign(existing, m)
    else list.push(m)
    write('ecosa_members', list)
    return m
  }
}

export async function confirmPayment(paymentId: string, reference?: string) {
  try {
    return await api(`/payments/${encodeURIComponent(paymentId)}/confirm`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference }),
    })
  } catch {
    const payments = read('ecosa_payments')
    const index = payments.findIndex((item: any) => String(item._id || item.id) === String(paymentId))
    if (index < 0) throw new Error('Payment not found')

    const now = new Date().toISOString()
    const updatedPayment = {
      ...payments[index],
      status: 'paid',
      paid: true,
      confirmedAt: now,
      gatewayReference: reference || payments[index].gatewayReference || `manual-${Date.now()}`,
    }
    payments[index] = updatedPayment
    write('ecosa_payments', payments)

    const members = read('ecosa_members')
    const email = String(updatedPayment.email || updatedPayment.memberEmail || updatedPayment.member?.email || '').toLowerCase()
    let member = members.find((item: any) => (item.email || '').toLowerCase() === email)
    if (!member) {
      member = {
        id: updatedPayment.memberId || updatedPayment.id || `mem_${Date.now()}`,
        name: updatedPayment.memberName || updatedPayment.member?.name || '',
        email,
        phone: updatedPayment.phone || updatedPayment.member?.phone || '',
        paymentStatus: 'paid',
        membershipNumber: `EC-${Date.now().toString().slice(-6)}`,
        registeredAt: now,
      }
      members.unshift(member)
    } else {
      member.paymentStatus = 'paid'
      member.membershipNumber = member.membershipNumber || `EC-${Date.now().toString().slice(-6)}`
      member.registeredAt = member.registeredAt || now
    }
    write('ecosa_members', members)

    return updatedPayment
  }
}

export async function registerMember(m: any) {
  if (!m.id) m.id = Date.now().toString()
  if (!m.membershipNumber) m.membershipNumber = `EC-${Date.now()}`
  if (!m.registeredAt) m.registeredAt = new Date().toISOString()
  try {
    return await api('/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(m),
    })
  } catch {
    const list = read('ecosa_members')
    const existing = list.find((x: any) => x.email === m.email)
    if (existing) Object.assign(existing, { ...existing, ...m })
    else list.push(m)
    write('ecosa_members', list)
    return m
  }
}

export async function findMemberByEmail(email: string) {
  const members = await getMembers()
  return members.find((x: any) => x.email === email)
}

export async function login(email: string) {
  const m = await findMemberByEmail(email)
  if (m) localStorage.setItem(SESS_KEY, JSON.stringify({ email }))
  return m
}

// Payments
export async function addPayment(payment: any) {
  try {
    const payload = {
      member: {
        name: payment.memberName || payment.name || '',
        email: payment.email || '',
        phone: payment.phone || '',
      },
      payment: {
        purpose: payment.purpose || 'Membership',
        amount: Number(payment.amount || 0),
        currency: payment.currency || 'UGX',
        method: payment.method || 'mpesa',
        phone: payment.phone || ''
      }
    }

    const res = await api('/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res
  } catch {
    const list = read('ecosa_payments')
    list.push(payment)
    write('ecosa_payments', list)
    return payment
  }
}
export async function getPayments() {
  try {
    const result = await api('/payments')
    if (Array.isArray(result) && result.length) return result
    return read('ecosa_payments')
  } catch {
    return read('ecosa_payments')
  }
}

// Jobs
export async function addJob(job: any) {
  try {
    await api('/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    })
  } catch {
    const list = read('ecosa_jobs')
    const exists = list.find((j: any) => j.id === job.id || (j.title === job.title && j.desc === job.desc && j.poster === job.poster))
    if (!exists) {
      list.push(job)
      write('ecosa_jobs', list)
    }
  }
}

export async function getJobs() {
  try {
    return await api('/jobs')
  } catch {
    return readPosts()
    const seen = new Set<string>()
    return readPosts()
    for (const j of raw) {
      const key = j.id || `${j.title}:::${j.desc}:::${j.poster}`
      if (!seen.has(key)) {
        seen.add(key)
        out.push(j)
      }
    }
    return out
  }
}

// Posts & Polls
export async function getPosts() {
  try {
    const result = await api('/posts')
    if (Array.isArray(result) && result.length) return result
    return readPosts()
  } catch {
    return readPosts()
  }
}
export async function addPost(post: any) {
  try {
    return await api('/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post),
    })
  } catch {
    const list = read('ecosa_posts')
    list.unshift(post)
    write('ecosa_posts', list)
    return post
  }
}

export async function deletePost(postId: string) {
  try {
    return await api(`/posts/${encodeURIComponent(postId)}`, { method: 'DELETE' })
  } catch {
    const list = read('ecosa_posts')
    write('ecosa_posts', list.filter((post: any) => String(post.id) !== String(postId)))
    return { ok: true }
  }
}

export async function addPollVote(pollId: string, optionIndex: number, voterEmail: string) {
  try {
    await api('/poll-votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionIndex, voterEmail }),
    })
  } catch {
    const list = read('ecosa_poll_votes')
    list.push({ pollId, optionIndex, voterEmail, at: new Date().toISOString() })
    write('ecosa_poll_votes', list)
  }
}
export async function getPollVotes() {
  try {
    return await api('/poll-votes')
  } catch {
    return read('ecosa_poll_votes')
  }
}

export async function getLeaderVotes() {
  try {
    return await api('/leader-votes')
  } catch {
    return read('ecosa_leader_votes')
  }
}
export async function voteLeader(leaderId: string, voterEmail: string) {
  try {
    return await api('/leader-votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaderId, voterEmail }),
    })
  } catch {
    const list = read('ecosa_leader_votes')
    list.push({ leaderId, voterEmail, at: new Date().toISOString() })
    write('ecosa_leader_votes', list)
    return { ok: true }
  }
}

// Initialize sample data from recent minutes if storage is empty
;(function initMockData() {
  try {
    // Set the official member roster provided by the user
    const members = [
      { id: 'EC-001', name: 'Agaba Francis' },
      { id: 'EC-002', name: 'Benard Mugumya' },
      { id: 'EC-003', name: 'Harriet Kyomugisha' },
      { id: 'EC-004', name: 'Kizito Mwebaze' },
      { id: 'EC-005', name: 'Evas Turinawe' },
      { id: 'EC-006', name: 'Henry Tumusiime' },
      { id: 'EC-007', name: 'Keneth Behangana' },
      { id: 'EC-008', name: 'Atuhe Roman' },
      { id: 'EC-009', name: 'Noel Mjitu' },
      { id: 'EC-010', name: 'Nyakarungi Grace' },
      { id: 'EC-011', name: 'Muhwezi Moses' },
      { id: 'EC-012', name: 'Kakuru Benard' },
      { id: 'EC-013', name: 'Africano' },
      { id: 'EC-014', name: 'Dorothy Asiimwe' },
      { id: 'EC-015', name: 'Ndeeba Stephenson' },
      { id: 'EC-016', name: 'Ayebare Sperio Ssalongo' }
    ].map(m => ({ ...m, membershipNumber: m.id, isAdmin: ['EC-001','EC-002'].includes(m.id) }))
    write('ecosa_members', members)

    // Seed payments: mark membership fee (UGX 20,000) as recorded for these members
    const now = new Date().toISOString()
    const payments = members.map(m => ({
      id: `pay_${m.membershipNumber}`,
      memberId: m.id,
      memberName: m.name,
      amount: 20000,
      currency: 'UGX',
      method: 'bank',
      reference: 'Centenary A/C 3100111822 (ECOSA)',
      paid: true,
      at: now
    }))
    write('ecosa_payments', payments)

    // Add Centenary bank account as a resource
    const bankText = `Centenary Bank\nAccount Name: ECOSA\nAccount Number: 3100111822\nPlease use your membership name as reference.`
    const bankRes = {
      id: 'res_centenary_1',
      name: 'Centenary Bank Account - ECOSA',
      filename: 'centenary-account.txt',
      mime: 'text/plain',
      type: 'bank',
      content: 'data:text/plain;charset=utf-8,' + encodeURIComponent(bankText),
      uploadedAt: now,
      uploadedBy: 'Agaba Francis'
    }
    write('ecosa_resources', [bankRes])

    // Single canonical post by Behangana Keneth
    const posts = [
      {
        id: `p_${Date.now()}_1`,
        type: 'event',
        author: 'Behangana Keneth',
        title: 'ECOSA Networking Dinner',
        content: 'You\'re invited — ECOSA Networking Dinner. Reconnect and build partnerships. The event will happen on Friday 27th November, 2026. Tickets: UGX 50,000 — register to secure your seat. Venue: SKYz Hotel Naguru.',
        media: '/sample-event1.svg',
        createdAt: now,
        comments: [],
        likes: [],
        shares: 0,
        rsvps: [],
        eventType: 'register',
        actionLabel: 'Register',
        registerUrl: '/payments?purpose=Event+Ticket&amount=50000'
      }
    ]
    // replace any existing posts with the single canonical post
    write('ecosa_posts', posts)

    // Seed sample jobs
    const jobs = [
      {
        id: `j_${Date.now()}_1`,
        title: 'Software Engineer',
        company: 'TUAN Creations',
        desc: 'Full-stack engineer needed for web and mobile projects. Experience with React/Node required.',
        poster: 'Keneth Behangana',
        media: '/sample-job1.svg',
        postedAt: now
      },
      {
        id: `j_${Date.now()}_2`,
        title: 'Marketing Officer',
        company: 'Grandee Online',
        desc: 'Digital marketing role focusing on social media campaigns and client outreach.',
        poster: 'Keneth Behangana',
        postedAt: now
      }
    ]
    const existingJobs = read('ecosa_jobs')
    write('ecosa_jobs', [...jobs, ...existingJobs])

    // sanitize existing members: remove emails for privacy
    try {
      const existingRaw = localStorage.getItem('ecosa_members')
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw || '[]')
        let changed = false
        for (const m of parsed) {
          if (m && m.email) { delete m.email; changed = true }
        }
        if (changed) write('ecosa_members', parsed)
      }
    } catch (e) {}

    if (!localStorage.getItem('ecosa_leaders')) {
      const leaders = [
        { id: 'l_chair', name: 'Omuteeganda Adson', role: 'Chair (Interim)', regime: 'interim' },
        { id: 'l_secretary', name: 'Agaba Francis', role: 'Secretary (Interim)', regime: 'interim' },
        { id: 'l_treasurer', name: 'Evas Turinawe', role: 'Treasurer (Interim)', regime: 'interim' },
        { id: 'l_outreach', name: 'Benard Mugumya', role: 'Outreach Lead', regime: 'interim' }
      ]
      write('ecosa_leaders', leaders)
    }

    if (!localStorage.getItem('ecosa_posts')) {
      const now = new Date().toISOString()
      const posts = [
        {
          id: `p_${Date.now()}_1`,
          type: 'event',
          author: 'Behangana Keneth',
          title: 'ECOSA Networking Dinner',
          content: 'You\'re invited — ECOSA Networking Dinner. Reconnect and build partnerships. The event will happen on Friday 27th November, 2026. Tickets: UGX 50,000 — register to secure your seat. Venue: SKYz Hotel Naguru.',
          media: '/sample-event1.svg',
          createdAt: now,
          comments: [],
          likes: [],
          shares: 0,
          rsvps: [],
          eventType: 'register',
          actionLabel: 'Register',
          registerUrl: '/payments?purpose=Event+Ticket&amount=50000'
        }
      ]
      write('ecosa_posts', posts)
    }

    if (!localStorage.getItem(CHAPTERS_KEY)) {
      write(CHAPTERS_KEY, DEFAULT_CHAPTERS)
    }
  } catch (e) {
    // ignore localStorage errors in non-browser environments
    // console.warn('initMockData failed', e)
  }
})()

// Resources (documents/files)
export async function getResources() {
  try {
    return await api('/resources')
  } catch {
    return read('ecosa_resources')
  }
}

export async function addResource(resource: any) {
  try {
    return await api('/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource),
    })
  } catch {
    const list = read('ecosa_resources')
    list.unshift(resource)
    write('ecosa_resources', list)
    return resource
  }
}

export async function deleteResource(resourceId: string) {
  try {
    return await api(`/resources/${encodeURIComponent(resourceId)}`, { method: 'DELETE' })
  } catch {
    const list = read('ecosa_resources')
    const out = list.filter((r: any) => r.id !== resourceId)
    write('ecosa_resources', out)
    return { ok: true }
  }
}

// Social interactions: comments, likes, shares (localStorage-backed)
export async function addComment(postId: string, commenter: string, text: string) {
  try { await api(`/posts/${postId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ commenter, text }) }) } catch {
    const posts = read('ecosa_posts')
    const p = posts.find((x: any) => x.id === postId)
    if (p) {
      p.comments = p.comments || []
      p.comments.push({ id: `c_${Date.now()}`, commenter, text, at: new Date().toISOString() })
      write('ecosa_posts', posts)
    }
  }
}

export async function toggleLike(postId: string, username: string) {
  try { await api(`/posts/${postId}/like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username }) }) } catch {
    const posts = read('ecosa_posts')
    const p = posts.find((x: any) => x.id === postId)
    if (p) {
      p.likes = p.likes || []
      const idx = p.likes.indexOf(username)
      if (idx >= 0) p.likes.splice(idx, 1)
      else p.likes.push(username)
      write('ecosa_posts', posts)
      return { likes: p.likes }
    }
    return { likes: [] }
  }
}

export async function sharePost(postId: string, sharer: string) {
  try { await api(`/posts/${postId}/share`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sharer }) }) } catch {
    const posts = read('ecosa_posts')
    const p = posts.find((x: any) => x.id === postId)
    if (p) {
      const shared = { id: `p_share_${Date.now()}`, author: sharer, title: `Shared: ${p.title || ''}`, body: p.content || p.body || '', media: p.media || null, sharedFrom: postId, createdAt: new Date().toISOString(), comments: [], likes: [], shares: 0 }
      posts.unshift(shared)
      // increment counter on original
      p.shares = (p.shares || 0) + 1
      write('ecosa_posts', posts)
      return shared
    }
    return null
  }
}

// RSVP: Interested / Going (localStorage-backed)
export async function addRsvp(postId: string, username: string, status: 'interested' | 'going') {
  try {
    await api(`/posts/${postId}/rsvp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, status }) })
  } catch {
    const posts = read('ecosa_posts')
    const p = posts.find((x: any) => x.id === postId)
    if (p) {
      p.rsvps = p.rsvps || []
      // remove any existing rsvp by user
      const existing = p.rsvps.find((r: any) => r.user === username)
      if (existing) {
        existing.status = status
        existing.at = new Date().toISOString()
      } else {
        p.rsvps.push({ id: `r_${Date.now()}`, user: username, status, at: new Date().toISOString() })
      }
      write('ecosa_posts', posts)
      return { ok: true, rsvps: p.rsvps }
    }
    return { ok: false }
  }
}
