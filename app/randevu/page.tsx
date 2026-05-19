'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function RandevuPage() {
  const [services, setServices] = useState<any[]>([])
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [selectedService, setSelectedService] = useState('')

  const getServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: false })

    setServices(data || [])
  }

  useEffect(() => {
    getServices()
  }, [])

  const addAppointment = async () => {
    if (!selectedService || !clientName || !clientPhone || !appointmentDate) {
      alert('Lütfen tüm alanları doldurun')
      return
    }

    const { error } = await supabase.from('appointments').insert([
      {
        client_name: clientName,
        client_phone: clientPhone,
        appointment_date: appointmentDate,
        service_id: selectedService,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      alert('Randevunuz oluşturuldu ✅')
      setClientName('')
      setClientPhone('')
      setAppointmentDate('')
      setSelectedService('')
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f7f7fb',
        padding: 20,
        fontFamily: 'Arial',
      }}
    >
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>Randevu Al 💅</h1>
        <p style={{ color: '#666' }}>Hizmet seç, bilgilerini gir, randevunu oluştur.</p>

        <section style={cardStyle}>
          <h2>Randevu Bilgileri</h2>

          <select
            style={inputStyle}
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
          >
            <option value="">Hizmet seç</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.price} TL
              </option>
            ))}
          </select>

          <input
            style={inputStyle}
            placeholder="Ad Soyad"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Telefon"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
          />

          <input
            style={inputStyle}
            type="datetime-local"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />

          <button style={buttonStyle} onClick={addAppointment}>
            Randevu Oluştur
          </button>
        </section>
      </div>
    </main>
  )
}

const cardStyle = {
  background: 'white',
  padding: 18,
  borderRadius: 16,
  marginBottom: 18,
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
}

const inputStyle = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 10,
  border: '1px solid #ddd',
  fontSize: 15,
}

const buttonStyle = {
  width: '100%',
  padding: 13,
  borderRadius: 10,
  border: 'none',
  background: '#111',
  color: 'white',
  fontSize: 16,
  cursor: 'pointer',
}