'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function RandevuPage() {
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const slug = params.get('business')

    if (slug) {
      getBusiness(slug)
    }
  }, [])

  const getBusiness = async (slug: string) => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      alert('İşletme bulunamadı')
      return
    }

    setBusiness(data)
    getServices(data.id)
  }

  const getServices = async (businessId: number) => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('id', { ascending: false })

    setServices(data || [])
  }

  const createAppointment = async () => {
    if (!business) return alert('İşletme bulunamadı')

    if (!selectedService || !clientName || !clientPhone || !appointmentDate) {
      alert('Lütfen tüm alanları doldurun')
      return
    }

    const { error } = await supabase.from('appointments').insert([
      {
        business_id: business.id,
        service_id: selectedService,
        client_name: clientName,
        client_phone: clientPhone,
        appointment_date: appointmentDate,
      },
    ])

    if (error) {
      alert(error.message)
      return
    }

    alert('Randevunuz oluşturuldu ✅')

    setSelectedService('')
    setClientName('')
    setClientPhone('')
    setAppointmentDate('')
  }

  if (!business) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>RandevuPro 💅</h1>
          <p style={styles.text}>İşletme yükleniyor...</p>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{business.business_name}</h1>

        <p style={styles.text}>
          Hizmet seç, bilgilerini gir, randevunu oluştur.
        </p>

        <select
          style={styles.input}
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
          style={styles.input}
          placeholder="Ad Soyad"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Telefon"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
        />

        <input
          style={styles.input}
          type="datetime-local"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
        />

        <button style={styles.button} onClick={createAppointment}>
          Randevu Oluştur
        </button>
      </div>
    </main>
  )
}

const styles: any = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff7fb 0%, #f4f0ff 45%, #eef7ff 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    fontFamily: 'Arial',
    color: '#111',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    background: 'white',
    borderRadius: 24,
    padding: 28,
    boxShadow: '0 14px 35px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 34,
    marginBottom: 8,
    color: '#111',
  },
  text: {
    color: '#666',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 14,
    marginBottom: 12,
    borderRadius: 14,
    border: '1px solid #ddd',
    fontSize: 15,
    color: '#111',
    background: 'white',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    border: 'none',
    background: '#111',
    color: 'white',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 700,
  },
}