'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Home() {
  const [businessName, setBusinessName] = useState('')
  const [businessSlug, setBusinessSlug] = useState('')
  const [currentBusiness, setCurrentBusiness] = useState<any>(null)

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [appointmentDate, setAppointmentDate] = useState('')
  const [selectedService, setSelectedService] = useState('')

  const bookingLink = currentBusiness
    ? `https://stackblitz-starters-4mmn4n6l.vercel.app/randevu?business=${currentBusiness.slug}`
    : 'Önce işletme oluştur'

  const getServices = async (businessId = currentBusiness?.id) => {
    if (!businessId) return

    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('id', { ascending: false })

    setServices(data || [])
  }

  const getAppointments = async (businessId = currentBusiness?.id) => {
    if (!businessId) return

    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .order('id', { ascending: false })

    setAppointments(data || [])
  }

  const createBusiness = async () => {
    if (!businessName || !businessSlug) {
      alert('İşletme adı ve link adı gir')
      return
    }

    const cleanSlug = businessSlug
      .toLowerCase()
      .trim()
      .replaceAll(' ', '-')
      .replaceAll('ı', 'i')
      .replaceAll('ğ', 'g')
      .replaceAll('ü', 'u')
      .replaceAll('ş', 's')
      .replaceAll('ö', 'o')
      .replaceAll('ç', 'c')

    const { data, error } = await supabase
      .from('businesses')
      .insert([
        {
          business_name: businessName,
          slug: cleanSlug,
          plan: 'free',
        },
      ])
      .select()
      .single()

    if (error) {
      alert(error.message)
    } else {
      setCurrentBusiness(data)
      setBusinessName('')
      setBusinessSlug('')
      alert('İşletme oluşturuldu 🚀')
    }
  }

  const findService = (serviceId: string) => {
    return services.find((service) => String(service.id) === String(serviceId))
  }

  const addService = async () => {
    if (!currentBusiness) {
      alert('Önce işletme oluştur')
      return
    }

    if (!name || !price || !duration) {
      alert('Hizmet adı, fiyat ve süre gir')
      return
    }

    const { error } = await supabase.from('services').insert([
      {
        name,
        price,
        duration,
        business_id: currentBusiness.id,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      setName('')
      setPrice('')
      setDuration('')
      getServices(currentBusiness.id)
      alert('Hizmet eklendi 💅')
    }
  }

  const addAppointment = async () => {
    if (!currentBusiness) {
      alert('Önce işletme oluştur')
      return
    }

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
        business_id: currentBusiness.id,
      },
    ])

    if (error) {
      alert(error.message)
    } else {
      setClientName('')
      setClientPhone('')
      setAppointmentDate('')
      setSelectedService('')
      getAppointments(currentBusiness.id)
      alert('Randevu oluşturuldu ✅')
    }
  }

  const copyBookingLink = () => {
    if (!currentBusiness) {
      alert('Önce işletme oluştur')
      return
    }

    navigator.clipboard.writeText(bookingLink)
    alert('Link kopyalandı ✅')
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
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <div>
            <p style={styles.badge}>Beauty SaaS MVP</p>
            <h1 style={styles.title}>RandevuPro 💅</h1>
            <p style={styles.subtitle}>
              Her işletmeye özel randevu linki, hizmet yönetimi ve WhatsApp hatırlatma paneli.
            </p>
          </div>

          <div style={styles.statBox}>
            <b>{appointments.length}</b>
            <span>Randevu</span>
          </div>
        </header>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>İşletme Oluştur</h2>

          <input
            style={styles.input}
            placeholder="İşletme adı örn: Ayşe Nail Studio"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Link adı örn: ayse-nail"
            value={businessSlug}
            onChange={(e) => setBusinessSlug(e.target.value)}
          />

          <button style={styles.primaryButton} onClick={createBusiness}>
            İşletme Oluştur
          </button>

          {currentBusiness && (
            <div style={styles.successBox}>
              <b>{currentBusiness.business_name}</b>
              <p>Plan: {currentBusiness.plan}</p>
            </div>
          )}
        </section>

        <section style={styles.linkCard}>
          <div>
            <h2 style={{ ...styles.cardTitle, color: 'white' }}>Paylaşılacak Randevu Linki</h2>
            <p style={{ color: '#ddd' }}>Bu linki Instagram bio’ya veya WhatsApp’a koy.</p>
          </div>

          <input style={styles.input} readOnly value={bookingLink} />

          <button style={styles.whiteButton} onClick={copyBookingLink}>
            Linki Kopyala
          </button>
        </section>

        <div style={styles.grid}>
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Hizmet Ekle</h2>

            <input
              style={styles.input}
              placeholder="Örn: Protez tırnak"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Fiyat örn: 1200"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Süre dk örn: 120"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />

            <button style={styles.primaryButton} onClick={addService}>
              Hizmet Ekle
            </button>
          </section>

          <section style={styles.card}>
            <h2 style={styles.cardTitle}>Randevu Oluştur</h2>

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
              placeholder="Müşteri adı"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Telefon örn: 5551234567"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
            />

            <input
              style={styles.input}
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />

            <button style={styles.primaryButton} onClick={addAppointment}>
              Randevu Oluştur
            </button>
          </section>
        </div>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Hizmetler</h2>

          {!currentBusiness && <p style={styles.muted}>Önce işletme oluştur.</p>}

          {currentBusiness && services.length === 0 && (
            <p style={styles.muted}>Bu işletmeye henüz hizmet eklenmedi.</p>
          )}

          <div style={styles.listGrid}>
            {services.map((service) => (
              <div key={service.id} style={styles.serviceItem}>
                <b>{service.name}</b>
                <span>{service.price} TL</span>
                <small>{service.duration} dk</small>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Randevular</h2>

          {!currentBusiness && <p style={styles.muted}>Önce işletme oluştur.</p>}

          {currentBusiness && appointments.length === 0 && (
            <p style={styles.muted}>Bu işletmeye henüz randevu yok.</p>
          )}

          <div style={styles.appointmentList}>
            {appointments.map((appointment) => {
              const service = findService(appointment.service_id)

              return (
                <div key={appointment.id} style={styles.appointmentItem}>
                  <div>
                    <b>{appointment.client_name}</b>
                    <p style={styles.muted}>📞 {appointment.client_phone}</p>
                    <p style={styles.muted}>🗓️ {appointment.appointment_date}</p>
                    <p style={styles.muted}>
                      💅 {service ? `${service.name} - ${service.price} TL` : 'Hizmet bulunamadı'}
                    </p>
                  </div>

                  <button
                    style={styles.whatsappButton}
                    onClick={() => sendWhatsAppReminder(appointment)}
                  >
                    WhatsApp
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}

const styles: any = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff7fb 0%, #f4f0ff 45%, #eef7ff 100%)',
    color: '#151515',
    fontFamily: 'Arial, sans-serif',
    padding: 20,
  },
  wrapper: {
    maxWidth: 980,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    display: 'inline-block',
    background: '#111',
    color: 'white',
    padding: '7px 12px',
    borderRadius: 999,
    fontSize: 13,
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    margin: 0,
    color: '#111',
  },
  subtitle: {
    color: '#555',
    maxWidth: 560,
    lineHeight: 1.5,
  },
  statBox: {
    background: 'white',
    borderRadius: 20,
    padding: 18,
    minWidth: 110,
    textAlign: 'center',
    boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
    display: 'flex',
    flexDirection: 'column',
    color: '#111',
  },
  linkCard: {
    background: '#111',
    color: 'white',
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    boxShadow: '0 14px 35px rgba(0,0,0,0.14)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 18,
  },
  card: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    boxShadow: '0 14px 35px rgba(0,0,0,0.08)',
    color: '#111',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: 12,
    color: '#111',
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
  primaryButton: {
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
  whiteButton: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    border: 'none',
    background: 'white',
    color: '#111',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 700,
  },
  whatsappButton: {
    padding: '11px 14px',
    borderRadius: 14,
    border: 'none',
    background: '#25D366',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },
  muted: {
    color: '#666',
    margin: '5px 0',
  },
  successBox: {
    marginTop: 12,
    background: '#ecfff3',
    border: '1px solid #baf7ce',
    borderRadius: 14,
    padding: 12,
    color: '#111',
  },
  listGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
  },
  serviceItem: {
    border: '1px solid #eee',
    borderRadius: 18,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: 'white',
    color: '#111',
  },
  appointmentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  appointmentItem: {
    border: '1px solid #eee',
    borderRadius: 18,
    padding: 16,
    background: 'white',
    color: '#111',
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
}