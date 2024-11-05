import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FiAlertCircle } from 'react-icons/fi'
import { supabase } from '@/supabase'
import Topbar from '@/components/Topbar'

type EventType = {
  id: string
  title: string
  description: string
  startDateTime: string
  endDateTime: string
}

type TicketType = {
  id: string
  name: string
  price: number
  capacity: number
  description: string
}

type FormItemType = {
  id: string
  type: string
  label: string
  required: boolean
  placeholder: string
}

type FormData = {
  name: string
  email: string
  ticketId: string
}

type Props = {
  event: EventType
  tickets: TicketType[]
  formItems: FormItemType[]
  onSubmit?: (data: FormData) => Promise<void>
}

const RegistrationForm: React.FC<Props> = ({ event, tickets, formItems, onSubmit }) => {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    ticketId: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) {
      newErrors.name = '氏名は必須項目です'
    }

    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須項目です'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください'
    }

    if (!formData.ticketId) {
      newErrors.ticketId = 'チケットを選択してください'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(formData)
      } else {
        const { error } = await supabase
          .from('registrations')
          .insert({
            event_id: event.id,
            ticket_id: formData.ticketId,
            participant_info: {
              name: formData.name,
              email: formData.email
            }
          })

        if (error) throw error
      }

      router.push(`/events/${event.id}/registration/complete`)
    } catch (error) {
      setSubmitError('登録に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const selectedTicket = tickets.find(ticket => ticket.id === formData.ticketId)

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">{event.title}</h1>
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">参加登録フォーム</h2>
          
          {submitError && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 flex items-center">
              <FiAlertCircle className="mr-2" />
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  チケット種別
                </label>
                <select
                  name="ticketId"
                  value={formData.ticketId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">選択してください</option>
                  {tickets.map(ticket => (
                    <option key={ticket.id} value={ticket.id}>
                      {ticket.name} - {ticket.price}円
                    </option>
                  ))}
                </select>
                {errors.ticketId && (
                  <p className="text-sm text-red-600 mt-1">{errors.ticketId}</p>
                )}
              </div>

              {formItems.map(item => (
                <div key={item.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {item.label}
                  </label>
                  <input
                    type={item.type}
                    name={item.type === 'email' ? 'email' : 'name'}
                    placeholder={item.placeholder}
                    value={item.type === 'email' ? formData.email : formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {errors[item.type === 'email' ? 'email' : 'name'] && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors[item.type === 'email' ? 'email' : 'name']}
                    </p>
                  )}
                </div>
              ))}

              {selectedTicket && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">選択中のチケット</h3>
                  <p className="text-gray-700">{selectedTicket.name}</p>
                  <p className="text-gray-700">{selectedTicket.price}円</p>
                  <p className="text-sm text-gray-500 mt-1">{selectedTicket.description}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium
                  ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isSubmitting ? '送信中...' : '申し込む'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default RegistrationForm