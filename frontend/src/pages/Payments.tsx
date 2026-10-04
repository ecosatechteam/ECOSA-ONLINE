import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { createPaymentCheckout, verifyPayment } from '../services/mockService'
import PhoneNumberInput from '../components/PhoneNumberInput'

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
  const [submitting,setSubmitting]=useState(false)
  const [paymentMessage,setPaymentMessage]=useState('')
  const [paymentError,setPaymentError]=useState('')
  const [paymentConfirmed,setPaymentConfirmed]=useState(false)

  useEffect(() => {
    const status = searchParams.get('status')
    const transactionId = searchParams.get('transaction_id')
    const txRef = searchParams.get('tx_ref')
    if (!status) return
    if (status !== 'successful' || !transactionId || !txRef) {
      setPaymentMessage('Payment was not completed. You can try again below.')
      return
    }

    let active = true
    setPaymentMessage('Verifying your payment securely...')
    verifyPayment(transactionId, txRef)
      .then((result: { status: string }) => {
        if (active) {
          setPaymentConfirmed(result.status === 'paid')
          setPaymentMessage(result.status === 'paid'
            ? 'Payment confirmed. Your alumni membership will be updated shortly.'
            : 'Payment is still processing. Your membership will update after confirmation.')
        }
      })
      .catch((error: Error) => {
        if (active) {
          setPaymentMessage('')
          setPaymentError(error.message || 'We could not verify the payment yet. Please contact ECOSA before paying again.')
        }
      })
    return () => { active = false }
  }, [searchParams])

  const submit = async (e:React.FormEvent)=>{
    e.preventDefault()
    setPaymentError('')
    if(!name.trim() || !email.trim() || !amount) {
      setPaymentError('Provide your name, email, and amount.')
      return
    }
    if(!Number.isSafeInteger(Number(amount)) || Number(amount) <= 0) {
      setPaymentError('Enter a whole-number amount greater than zero.')
      return
    }
    if(method==='mobile' && (!phone.trim() || !isValidPhoneNumber(phone))) {
      setPaymentError('Choose a country code and enter a valid phone number for mobile money.')
      return
    }

    setSubmitting(true)
    try {
      const result = await createPaymentCheckout({
        memberName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        purpose,
        amount: Number(amount),
        method,
      })
      if (typeof result?.checkoutUrl !== 'string') {
        throw new Error('The payment provider did not return a checkout link.')
      }
      window.location.assign(result.checkoutUrl)
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'Could not start checkout. Please try again.')
      setSubmitting(false)
    }
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
        {paymentMessage && <p role="status" className="muted">{paymentMessage}</p>}
        {paymentError && <p role="alert" style={{ color: '#b42318' }}>{paymentError}</p>}
        {!paymentConfirmed && <form onSubmit={submit} className="dashboard-form">
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required />
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required />
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
          <input type="number" min="1" step="1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="20000" required />

          <label style={{marginTop:8}}>Select payment method</label>
          <div className="payment-options">
            <button type="button" className={`field-btn payment-option${method==='mobile' ? ' active' : ''}`} onClick={()=>setMethod('mobile')}>
              <img className="payment-option-logo" src="/mtn-or-airtel.JPG" alt="MTN or Airtel" />
            </button>
            <button type="button" className={`field-btn payment-option${method==='card' ? ' active' : ''}`} onClick={()=>setMethod('card')}>
              <img className="payment-option-logo" src="/visa-or-mastercard.JPG" alt="Visa or Mastercard" />
            </button>
          </div>

          <label htmlFor="payment-phone">Phone {method === 'mobile' ? '(select country code first)' : '(optional)'}</label>
          <PhoneNumberInput id="payment-phone" value={phone} onChange={setPhone} required={method === 'mobile'} />

          <div className="actions"><button className="btn" disabled={submitting}>{submitting ? 'Connecting to Flutterwave...' : method==='card' ? 'Pay with Card' : 'Pay with Mobile Money'}</button></div>
        </form>}
        <p style={{color:'#6b7280',marginTop:12}}>Payments will record your alumni details and update the alumni directory automatically.</p>
      </div>
    </div>
  )
}
