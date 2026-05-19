'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Home() {
  const bookingLink =
    'https://stackblitzstarters4mmn4n6l-5wmw--3000--4c73681d.local-corp.webcontainer.io/randevu'

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [selectedService, setSelectedService] = useState('')

  const getServices = async () => {
    const { data } = await supabase.from('services').select('*').order('id', { ascending: false })
    setServices(data || [])
  }

  const getAppointments = async () => {
    const { data } = await supabase.from('appointments').select('*').order('id', { ascending: false })
    setAppointments(data || [])
  }

  useEffect(() => {
    getServices()
    getAppointments()
  }, [])

  const findService = (serviceId: string) => {
    return services.find((service) => String(service.id) === String(serviceId))
  }

  const addService = async () => {
    if (!name || !price || !duration) {
      alert('Hizmet adı, fiyat ve süre gir')
      return
    }

    const { error } = await supabase.from('services').insert([{ name, price, duration }])

    if (error) {
      alert(error.message)
    } else {
      alert('Hizmet eklendi 💅')
      setName('')
      setPrice('')
      setDuration('')
      getServices()
    }
  }

  const addAppointment = async () => {
    if (!selectedService || !clientName || !clientPhone || !appointmentDate) {
      alert('Tüm randevu alanlarını doldur')
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
      alert('Randevu oluşturuldu ✅')
      setClientName('')
      setClientPhone('')
      setAppointmentDate('')
      setSelectedService('')
      getAppointments()
    }
  }

  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingLink)
    alert('Randevu linki kopyalandı ✅')
  }

  const sendWhatsAppReminder = (appointment: any) => {
    const service = findService(appointment.service_id)

    const message = `Merhaba ${appointment.client_name} 🌸 Randevunuzu hatırlatmak isteriz. Tarih/Saat: ${appointment.appointment_date}. Hizmet: ${
      service ? service.name : 'Seçilen hizmet'
    }. Görüşmek üzere 💅`

    const phone = appointment.client_phone.replace(/\D/g, '')
    window.open(`https://wa.me/90${phone}?text=${encodeURIComponent(message)}`, '_blank')
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
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>GlowApp 💅</h1>
        <p style={{ marginTop: 0, color: '#666' }}>
          Nail & güzellik uzmanları için mini randevu sistemi
        </p>

        <section style={cardStyle}>
          <h2>Paylaşılacak Randevu Linki</h2>

          <input style={inputStyle} readOnly value={bookingLink} />

          <button style={buttonStyle} onClick={copyBookingLink}>
            Linki Kopyala
          </button>
        </section>

        <section style={cardStyle}>
          <h2>Hizmet Ekle</h2>

          <input style={inputStyle} placeholder="Hizmet adı" value={name} onChange={(e) => setName(e.target.value)} />
          <input style={inputStyle} placeholder="Fiyat" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input style={inputStyle} placeholder="Süre dk" value={duration} onChange={(e) => setDuration(e.target.value)} />

          <button style={buttonStyle} onClick={addService}>Hizmet Ekle</button>
        </section>

        <section style={cardStyle}>
          <h2>Hizmetler</h2>

          {services.length === 0 && <p>Henüz hizmet yok.</p>}

          {services.map((service) => (
            <div key={service.id} style={listItemStyle}>
              <b>{service.name}</b>
              <p style={{ margin: '6px 0 0' }}>{service.price} TL - {service.duration} dk</p>
            </div>
          ))}
        </section>

        <section style={cardStyle}>
          <h2>Randevu Al</h2>

          <select style={inputStyle} value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
            <option value="">Hizmet seç</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.price} TL
              </option>
            ))}
          </select>

          <input style={inputStyle} placeholder="Müşteri adı" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <input style={inputStyle} placeholder="Telefon örn: 5551234567" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
          <input style={inputStyle} type="datetime-local" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />

          <button style={buttonStyle} onClick={addAppointment}>Randevu Oluştur</button>
        </section>

        <section style={cardStyle}>
          <h2>Randevular</h2>

          {appointments.length === 0 && <p>Henüz randevu yok.</p>}

          {appointments.map((appointment) => {
            const service = findService(appointment.service_id)

            return (
              <div key={appointment.id} style={listItemStyle}>
                <b>{appointment.client_name}</b>
                <p style={{ margin: '6px 0' }}>📞 {appointment.client_phone}</p>
                <p style={{ margin: '6px 0' }}>🗓️ {appointment.appointment_date}</p>
                <p style={{ margin: '6px 0' }}>
                  💅 {service ? `${service.name} - ${service.price} TL` : 'Hizmet bulunamadı'}
                </p>

                <button style={smallButtonStyle} onClick={() => sendWhatsAppReminder(appointment)}>
                  WhatsApp Hatırlatma Gönder
                </button>
              </div>
            )
          })}
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

const smallButtonStyle = {
  padding: 10,
  borderRadius: 10,
  border: 'none',
  background: '#25D366',
  color: 'white',
  cursor: 'pointer',
}

const listItemStyle = {
  border: '1px solid #eee',
  padding: 12,
  borderRadius: 12,
  marginBottom: 10,
}