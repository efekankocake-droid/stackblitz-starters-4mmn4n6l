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
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: false })

    if (error) alert(error.message)
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
    <main style={pageStyle}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={titleStyle}>Randevu Al 💅</h1>
        <p style={descStyle}>Hizmet seç, bilgilerini gir, randevunu oluştur.</p>

        <section style={cardStyle}>
          <h2 style={sectionTitle}>Randevu Bilgileri</h2>

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

const pageStyle = {
  minHeight: '100vh',
  background: '#f7f7fb',
  padding: 20,
  fontFamily: 'Arial',
  color: '#111',
}

const titleStyle = {
  fontSize: 32,
  marginBottom: 4,
  color: '#111',
}

const descStyle = {
  color: '#555',
}

const cardStyle = {
  background: 'white',
  padding: 18,
  borderRadius: 16,
  marginTop: 18,
  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
}

const sectionTitle = {
  color: '#111',
}

const inputStyle = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 10,
  border: '1px solid #ddd',
  fontSize: 15,
  color: '#111',
  background: 'white',
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