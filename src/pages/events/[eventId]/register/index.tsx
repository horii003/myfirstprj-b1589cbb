import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FaTicketAlt, FaUser, FaEnvelope } from 'react-icons/fa'
import Topbar from '@/components/Topbar'
import { supabase } from '@/supabase'

export default function Register() {
  const router = useRouter()
  const { eventId } = router.query

  const [event, setEvent] = useState<any>(null)
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    ticketId: '',
    name: '',
    email: ''
  })

  const [formErrors, setFormErrors] = useState({
    ticketId: '',
    name: '',
    email: ''
  })

  useEffect(() => {
    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const fetchEventData = async () => {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (eventError) throw eventError

      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)

      if (ticketError) throw ticketError

      setEvent(eventData)
      setTickets(ticketData)
      setLoading(false)
    } catch (err) {
      setError('データの取得に失敗しました')
      setLoading(false)
    }
  }

  const validateForm = () => {
    let isValid = true
    const errors = {
      ticketId: '',
      name: '',
      email: ''
    }

    if (!formData.ticketId) {
      errors.ticketId = 'チケットを選択してください'
      isValid = false
    }

    if (!formData.name) {
      errors.name = '氏名を入力してください'
      isValid = false
    }

    if (!formData.email) {
      errors.email = 'メールアドレスを入力してください'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = '有効なメールアドレスを入力してください'
      isValid = false
    }

    setFormErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: eventId,
            ticket_id: formData.ticketId,
            participant_info: {
              name: formData.name,
              email: formData.email
            },
            status: 'pending'
          }
        ])

      if (error) throw error

      router.push(`/events/${eventId}/register/complete`)
    } catch (err) {
      setError('登録に失敗しました。もう一度お試しください。')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen h-full bg-gray-50">
        <Topbar />
        <div className="flex justify-center items-center p-8">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">{event?.title}</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ticket">
                チケット種別
              </label>
              <div className="relative">
                <select
                  id="ticket"
                  className="w-full p-3 border rounded-lg appearance-none focus:outline-none focus:border-blue-500"
                  value={formData.ticketId}
                  onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
                >
                  <option value="">選択してください</option>
                  {tickets.map((ticket) => (
                    <option 
                      key={ticket.id} 
                      value={ticket.id}
                      disabled={ticket.remainingCount === 0}
                    >
                      {ticket.name} - ¥{ticket.price}
                      {ticket.remainingCount === 0 ? ' (売り切れ)' : ''}
                    </option>
                  ))}
                </select>
                <FaTicketAlt className="absolute right-3 top-3 text-gray-400" />
              </div>
              {formErrors.ticketId && (
                <p className="text-red-500 text-sm mt-1">{formErrors.ticketId}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                氏名
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  className="w-full p-3 border rounded-lg appearance-none focus:outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <FaUser className="absolute right-3 top-3 text-gray-400" />
              </div>
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                メールアドレス
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="w-full p-3 border rounded-lg appearance-none focus:outline-none focus:border-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <FaEnvelope className="absolute right-3 top-3 text-gray-400" />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
            >
              参加登録する
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}