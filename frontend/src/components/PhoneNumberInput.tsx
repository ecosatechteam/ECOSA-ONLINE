import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

type PhoneNumberInputProps = {
  id: string
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export default function PhoneNumberInput({ id, value, onChange, required = false }: PhoneNumberInputProps) {
  return (
    <PhoneInput
      id={id}
      className="phone-number-input"
      defaultCountry="UG"
      international
      countryCallingCodeEditable={false}
      value={value || undefined}
      onChange={(phoneNumber) => onChange(phoneNumber || '')}
      countrySelectProps={{ 'aria-label': 'Select country calling code' }}
      numberInputProps={{ id, autoComplete: 'tel', required }}
    />
  )
}
