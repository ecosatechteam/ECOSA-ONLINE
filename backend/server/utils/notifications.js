const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const nodemailer = require('nodemailer')

const mailTransport = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null

function generateReceiptPdf(member, payment) {
  const fileName = `receipt_${payment._id || Date.now()}.pdf`
  const filePath = path.join(__dirname, '..', 'uploads', fileName)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })

  const doc = new PDFDocument({ margin: 40 })
  doc.pipe(fs.createWriteStream(filePath))
  doc.fontSize(20).text('ECOSA Receipt', { align: 'center' })
  doc.moveDown()
  doc.fontSize(12)
  doc.text(`Member: ${member.name}`)
  doc.text(`Email: ${member.email}`)
  doc.text(`Purpose: ${payment.purpose}`)
  doc.text(`Amount: ${payment.amount} ${payment.currency}`)
  doc.text(`Method: ${payment.method}`)
  doc.text(`Status: ${payment.status}`)
  doc.text(`Alumni Number: ${member.membershipNumber || 'Pending'}`)
  doc.end()

  return { filePath, fileName }
}

async function sendSms(phone, message) {
  if (!phone) return { ok: false, reason: 'No phone provided' }
  console.log(`[SMS] to ${phone}: ${message}`)
  return { ok: true }
}

async function sendWhatsApp(phone, message) {
  if (!phone) return { ok: false, reason: 'No phone provided' }
  console.log(`[WhatsApp] to ${phone}: ${message}`)
  return { ok: true }
}

async function sendEmail(to, subject, html) {
  if (!mailTransport) {
    console.warn(`[Email not sent: SMTP is not configured] to ${to}: ${subject}`)
    return { ok: false, reason: 'SMTP is not configured' }
  }

  await mailTransport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  })
  return { ok: true }
}

module.exports = {
  generateReceiptPdf,
  sendSms,
  sendWhatsApp,
  sendEmail
}
