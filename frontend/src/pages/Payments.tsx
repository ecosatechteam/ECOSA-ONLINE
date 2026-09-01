import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addPayment } from '../services/mockService'

const purposeOptions = ['Alumni Dues', 'Insurance', 'Sacco', 'Project Donation', 'Event Ticket'] as const
type Purpose = typeof purposeOptions[number]

export default function Payments(){
  const [searchParams] = useSearchParams()
  const requestedPurpose = searchParams.get('purpose')
  const initialPurpose: Purpose = purposeOptions.includes(requestedPurpose as Purpose) ? (requestedPurpose as Purpose) : 'Alumni Dues'
  const initialAmount = searchParams.get('amount') || '20000'

  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [phone,setPhone]=useState('')
  const [years,setYears]=useState('')
  const [amount,setAmount]=useState(initialAmount)
  const [purpose,setPurpose]=useState<Purpose>(initialPurpose)
  const [method,setMethod]=useState<'mobile'|'card'>('mobile')

  const submit = async (e:React.FormEvent)=>{
    e.preventDefault()
    if(!name||!email||!amount) return alert('Provide name, email and amount')
    if(method==='mobile' && !phone) return alert('Enter phone number')

    const payment = {
      memberName: name,
      email,
      phone,
      purpose,
      amount: Number(amount),
      currency: 'UGX',
      method,
      status: 'pending',
    }

    await addPayment(payment)

    if(method === 'card'){
      try {
        const base = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
        const res = await fetch(`${base}/api/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Math.round(Number(amount)), currency: 'ugx' }),
        })
        const data = await res.json()
        if (data?.url) {
          window.location.href = data.url
          return
        }
      } catch (err) {
        console.warn('Card checkout initiation failed', err)
      }
    }

    alert(method === 'mobile'
      ? 'Mobile money initiated. Please complete payment on your phone. Your alumni record will be confirmed after payment success.'
      : 'Card payment initiated. Please complete the checkout. Your alumni record will be confirmed after payment success.')

    setAmount('20000')
    setPhone('')
    setYears('')
  }

  return (
    <div className="page-stack">
      <section className="card section-hero">
        <div>
          <span className="eyebrow">Payments</span>
          <h1 style={{ margin: '10px 0 8px' }}>Alumni dues and support payments</h1>
          <p className="muted" style={{ margin: 0, maxWidth: '74ch', lineHeight: 1.8 }}>
            Pay your ECOSA alumni dues or donate to support alumni initiatives. Alumni are listed automatically only after payment confirmation.
          </p>
        </div>
        <div className="hero-metric" style={{ minWidth: 220 }}>
          <strong>Secure</strong>
          <span>Mobile money or card checkout</span>
        </div>
      </section>

      <div className="card">
        <form onSubmit={submit} className="dashboard-form">
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} />
          <label>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} />
          <label>Phone</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} />
          <label>Years at ECI</label>
          <input value={years} onChange={e=>setYears(e.target.value)} placeholder="e.g. 2008-2012" />
          <label>Payment purpose</label>
          <select value={purpose} onChange={e=>setPurpose(e.target.value as any)}>
            <option value="Alumni Dues">Alumni Dues</option>
            <option value="Insurance">Insurance</option>
            <option value="Sacco">Sacco</option>
            <option value="Project Donation">Project Donation</option>
            <option value="Event Ticket">Event Ticket</option>
          </select>
          <label>Amount (UGX)</label>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="20000" />

          <label style={{marginTop:8}}>Select payment method</label>
          <div className="payment-options">
            <button type="button" className={`field-btn payment-option${method==='mobile' ? ' active' : ''}`} onClick={()=>setMethod('mobile')}>
              <img className="payment-option-logo" src="/mtn-or-airtel.JPG" alt="MTN or Airtel" />
            </button>
            <button type="button" className={`field-btn payment-option${method==='card' ? ' active' : ''}`} onClick={()=>setMethod('card')}>
              <img className="payment-option-logo" src="/visa-or-mastercard.JPG" alt="Visa or Mastercard" />
            </button>
          </div>

          {method==='mobile' && (
            <div>
              <label>Phone (international format, e.g. 2567xxxxxxx)</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} />
            </div>
          )}

          <div className="actions"><button className="btn">{method==='card' ? 'Pay with Card' : `Pay with ${method.toUpperCase()}`}</button></div>
        </form>
        <p style={{color:'#6b7280',marginTop:12}}>Payments will record your alumni details and update the alumni directory automatically.</p>
      </div>
    </div>
  )
}
