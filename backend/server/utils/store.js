const mongoose = require('mongoose')

const state = {
  members: [],
  payments: [],
  posts: [],
  admins: [],
  resources: [],
  chapters: [],
  leaders: [],
  projects: []
}

function isDbConnected() {
  return mongoose.connection.readyState === 1
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getState() {
  return state
}

function addAdmin(admin) {
  state.admins.push(admin)
  return admin
}

function findAdminByEmail(email) {
  return state.admins.find((item) => item.email === email) || null
}

function upsertMember(member) {
  const existingIndex = state.members.findIndex((item) => item.email === member.email)
  if (existingIndex >= 0) {
    state.members[existingIndex] = { ...state.members[existingIndex], ...member }
    return state.members[existingIndex]
  }
  state.members.push(member)
  return member
}

function listMembers() {
  return state.members
}

function upsertPayment(payment) {
  const existingIndex = state.payments.findIndex((item) => item._id === payment._id || item.id === payment.id)
  if (existingIndex >= 0) {
    state.payments[existingIndex] = { ...state.payments[existingIndex], ...payment }
    return state.payments[existingIndex]
  }
  state.payments.push(payment)
  return payment
}

function listPayments() {
  return state.payments
}

function addPost(post) {
  state.posts.unshift(post)
  return post
}

function listPosts() {
  return state.posts
}

function upsertResource(resource) {
  const existingIndex = state.resources.findIndex((item) => item.id === resource.id)
  if (existingIndex >= 0) {
    state.resources[existingIndex] = { ...state.resources[existingIndex], ...resource }
    return state.resources[existingIndex]
  }
  state.resources.unshift(resource)
  return resource
}

function listResources() {
  return state.resources
}

function removeResource(resourceId) {
  state.resources = state.resources.filter((item) => item.id !== resourceId)
}

function upsertChapter(chapter) {
  const existingIndex = state.chapters.findIndex((item) => item.id === chapter.id)
  if (existingIndex >= 0) {
    state.chapters[existingIndex] = { ...state.chapters[existingIndex], ...chapter }
    return state.chapters[existingIndex]
  }
  state.chapters.push(chapter)
  return chapter
}

function listChapters() {
  return state.chapters
}

function removeChapter(chapterId) {
  state.chapters = state.chapters.filter((item) => item.id !== chapterId)
}

function upsertLeader(leader) {
  const existingIndex = state.leaders.findIndex((item) => item.id === leader.id)
  if (existingIndex >= 0) {
    state.leaders[existingIndex] = { ...state.leaders[existingIndex], ...leader }
    return state.leaders[existingIndex]
  }
  state.leaders.push(leader)
  return leader
}

function listLeaders() {
  return state.leaders
}

function removeLeader(leaderId) {
  state.leaders = state.leaders.filter((item) => item.id !== leaderId)
}

function upsertProject(project) {
  const existingIndex = state.projects.findIndex((item) => item.id === project.id)
  if (existingIndex >= 0) {
    state.projects[existingIndex] = { ...state.projects[existingIndex], ...project }
    return state.projects[existingIndex]
  }
  state.projects.push(project)
  return project
}

function listProjects() {
  return state.projects
}

function removeProject(projectId) {
  state.projects = state.projects.filter((item) => item.id !== projectId)
}

module.exports = {
  isDbConnected,
  clone,
  getState,
  addAdmin,
  findAdminByEmail,
  upsertMember,
  listMembers,
  upsertPayment,
  listPayments,
  addPost,
  listPosts,
  upsertResource,
  listResources,
  removeResource,
  upsertChapter,
  listChapters,
  removeChapter,
  upsertLeader,
  listLeaders,
  removeLeader,
  upsertProject,
  listProjects,
  removeProject
}
