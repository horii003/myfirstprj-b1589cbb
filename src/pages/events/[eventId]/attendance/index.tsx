import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Topbar from '@/components/Topbar'
import { supabase } from '@/supabase'
import { FaQrcode, FaSearch, FaFileExport } from 'react-icons/fa'
import { Html5QrcodeScanner } from 'html5-qrcode'

type Participant = {
  id: string
  name: string
  email: string
  status: string
}

type Attendance = {
  participantId: string
  status: string
  note: string
}

export default function Attendance() {
  const router = useRouter()
  const { eventId } = router.query
  const [participants, setParticipants] = useState<Participant[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showQrReader, setShowQrReader] = useState(false)
  const [error, setError] = useState('')
  const [selectedParticipant, setSelectedParticipant] = useState<string>('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (eventId) {
      fetchData()
    }
  }, [eventId])

  const fetchData = async () => {
    try {
      const { data: participantsData, error: participantsError } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId)

      if (participantsError) throw participantsError

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('event_id', eventId)

      if (attendanceError) throw attendanceError

      setParticipants(participantsData)
      setAttendance(attendanceData)
    } catch (error) {
      setError('データの取得に失敗しました')
    }
  }

  useEffect(() => {
    if (showQrReader) {
      const html5QrcodeScanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      html5QrcodeScanner.render(onScanSuccess, onScanFailure)

      return () => {
        html5QrcodeScanner.clear()
      }
    }
  }, [showQrReader])

  const onScanSuccess = (decodedText: string) => {
    setSelectedParticipant(decodedText)
    setShowQrReader(false)
  }

  const onScanFailure = (error: any) => {
    console.error(error)
  }

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          participant_id: selectedParticipant,
          event_id: eventId,
          status,
          note
        })

      if (error) throw error

      const newAttendance = {
        participantId: selectedParticipant,
        status,
        note
      }

      setAttendance([...attendance, newAttendance])
      setSelectedParticipant('')
      setNote('')
      setStatus('')
    } catch (error) {
      setError('エラーが発生しました')
    }
  }

  const handleExportCsv = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/attendance/export`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'attendance.csv'
      a.click()
    } catch (error) {
      setError('CSVのエクスポートに失敗しました')
    }
  }

  const filteredParticipants = participants.filter(participant =>
    participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const attendanceCount = attendance.filter(a => a.status === '出席').length
  const absenceCount = attendance.filter(a => a.status === '欠席').length

  return (
    <div className="min-h-screen h-full bg-gray-50">
      <Topbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">出欠確認</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between mb-4">
            <div className="flex gap-4">
              <button
                onClick={() => setShowQrReader(!showQrReader)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
              >
                <FaQrcode />
                QRコード読取
              </button>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
              >
                <FaFileExport />
                CSVエクスポート
              </button>
            </div>
            <div className="flex items-center gap-2">
              <FaSearch className="text-gray-400" />
              <input
                type="text"
                placeholder="参加者検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded p-2"
              />
            </div>
          </div>

          {showQrReader && (
            <div id="qr-reader" data-testid="qr-reader" className="mb-4" />
          )}

          <div className="mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">出欠状態</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border rounded p-2"
                  aria-label="出欠状態"
                >
                  <option value="">選択してください</option>
                  <option value="出席">出席</option>
                  <option value="欠席">欠席</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">備考</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border rounded p-2"
                  aria-label="備考"
                />
              </div>
            </div>
            <button
              onClick={handleSubmit}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              保存
            </button>
          </div>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4 flex gap-4">
            <div>出席者数: {attendanceCount}</div>
            <div>欠席者数: {absenceCount}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">名前</th>
                  <th className="p-3 text-left">メール</th>
                  <th className="p-3 text-left">状態</th>
                  <th className="p-3 text-left">備考</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((participant) => (
                  <tr key={participant.id} className="border-b">
                    <td className="p-3">{participant.name}</td>
                    <td className="p-3">{participant.email}</td>
                    <td className="p-3">
                      {attendance.find(a => a.participantId === participant.id)?.status || '未確認'}
                    </td>
                    <td className="p-3">
                      {attendance.find(a => a.participantId === participant.id)?.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}