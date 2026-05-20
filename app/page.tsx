'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [businessName, setBusinessName] = useState('')
  const [businessSlug, setBusinessSlug] = useState('')
  const [business, setBusiness] = useState<any>(null)

  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState('')
  const [serviceDuration, setServiceDuration] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) getBusiness(data.session.user)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) getBusiness(session.user)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Kayıt oluşturuldu ✅')
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setBusiness(null)
    setServices([])
    setAppointments([])
  }

  const getBusiness = async (user: any) => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (data) {
      setBusiness(data)
      getServices(data.id)
      getAppointments(data.id)
    }
  }

  const createBusiness = async () => {
    if (!businessName || !businessSlug) return alert('İşletme adı ve link adı gir')

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
      .insert([{
        business_name: businessName,
        slug: cleanSlug,
        owner_id: session.user.id,
        owner_email: session.user.email,
        plan: 'free',
      }])
      .select()
      .single()

    if (error) return alert(error.message)

    setBusiness(data)
    setBusinessName('')
    setBusinessSlug('')
    alert('İşletme oluşturuldu 🚀')
  }

  const getServices = async (businessId: number) => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('id', { ascending: false })

    setServices(data || [])
  }

  const getAppointments = async (businessId: number) => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('business_id', businessId)
      .order('id', { ascending: false })

    setAppointments(data || [])
  }

  const addService = async () => {
    if (!business) return alert('Önce işletme oluştur')
    if (!serviceName || !servicePrice || !serviceDuration) return alert('Hizmet bilgilerini doldur')

    const { error } = await supabase.from('services').insert([{
      name: serviceName,
      price: servicePrice,
      duration: serviceDuration,
      business_id: business.id,
    }])

    if (error) return alert(error.message)

    setServiceName('')
    setServicePrice('')
    setServiceDuration('')
    getServices(business.id)
    alert('Hizmet eklendi 💅')
  }

  const findService = (serviceId: string) => {
    return services.find((service) => String(service.id) === String(serviceId))
  }

  const sendWhatsApp = (appointment: any) => {
    const service = findService(appointment.service_id)
    const message = `Merhaba ${appointment.client_name} 🌸 Randevunuzu hatırlatmak isteriz. Tarih/Saat: ${appointment.appointment_date}. Hizmet: ${service ? service.name : 'Hizmet'}. Görüşmek üzere 💅`
    const phone = appointment.client_phone.replace(/\D/g, '')
    window.open(`https://wa.me/90${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (!session) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>RandevuPro 🚀</h1>
          <p style={styles.text}>Giriş yap veya kayıt ol</p>

          <input style={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} placeholder="Şifre" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button style={styles.button} onClick={signIn}>Giriş Yap</button>
          <button style={styles.secondaryButton} onClick={signUp}>Kayıt Ol</button>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <h1 style={styles.title}>RandevuPro 💅</h1>
          <p style={styles.text}>Hoş geldin: {session.user.email}</p>

          {!business ? (
            <>
              <h2 style={styles.sectionTitle}>İşletmeni Oluştur</h2>

              <input style={styles.input} placeholder="İşletme adı" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              <input style={styles.input} placeholder="Link adı örn: ayse-nail" value={businessSlug} onChange={(e) => setBusinessSlug(e.target.value)} />

              <button style={styles.button} onClick={createBusiness}>İşletme Oluştur</button>
            </>
          ) : (
            <>
              <div style={styles.businessBox}>
                <h2 style={styles.sectionTitle}>{business.business_name}</h2>
                <p style={styles.text}>Plan: {business.plan}</p>
                <p style={styles.linkBox}>
                  https://stackblitz-starters-4mmn4n6l.vercel.app/randevu?business={business.slug}
                </p>
              </div>

              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Hizmet Ekle</h2>

                <input style={styles.input} placeholder="Hizmet adı" value={serviceName} onChange={(e) => setServiceName(e.target.value)} />
                <input style={styles.input} placeholder="Fiyat" value={servicePrice} onChange={(e) => setServicePrice(e.target.value)} />
                <input style={styles.input} placeholder="Süre dk" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)} />

                <button style={styles.button} onClick={addService}>Hizmet Ekle</button>
              </section>

              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Hizmetler</h2>

                {services.length === 0 && <p style={styles.text}>Henüz hizmet yok.</p>}

                {services.map((service) => (
                  <div key={service.id} style={styles.item}>
                    <b>{service.name}</b>
                    <p>{service.price} TL - {service.duration} dk</p>
                  </div>
                ))}
              </section>

              <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Randevular</h2>

                {appointments.length === 0 && <p style={styles.text}>Henüz randevu yok.</p>}

                {appointments.map((appointment) => {
                  const service = findService(appointment.service_id)

                  return (
                    <div key={appointment.id} style={styles.item}>
                      <b>{appointment.client_name}</b>
                      <p>📞 {appointment.client_phone}</p>
                      <p>🗓️ {appointment.appointment_date}</p>
                      <p>💅 {service ? `${service.name} - ${service.price} TL` : 'Hizmet bulunamadı'}</p>

                      <button style={styles.whatsappButton} onClick={() => sendWhatsApp(appointment)}>
                        WhatsApp Hatırlatma
                      </button>
                    </div>
                  )
                })}
              </section>
            </>
          )}

          <button style={styles.logoutButton} onClick={signOut}>Çıkış Yap</button>
        </div>
      </div>
    </main>
  )
}

const styles: any = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #fff7fb 0%, #f4f0ff 45%, #eef7ff 100%)',
    padding: 20,
    fontFamily: 'Arial',
    color: '#111',
  },
  wrapper: {
    maxWidth: 760,
    margin: '0 auto',
  },
  card: {
    background: 'white',
    borderRadius: 24,
    padding: 28,
    boxShadow: '0 14px 35px rgba(0,0,0,0.08)',
  },
  title: {
    fontSize: 38,
    marginBottom: 8,
    color: '#111',
  },
  sectionTitle: {
    color: '#111',
    marginBottom: 12,
  },
  text: {
    color: '#666',
    marginBottom: 16,
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
    marginBottom: 10,
    fontWeight: 700,
  },
  secondaryButton: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    border: '1px solid #111',
    background: 'white',
    color: '#111',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 700,
  },
  logoutButton: {
    width: '100%',
    padding: 14,
    borderRadius: 14,
    border: '1px solid #111',
    background: 'white',
    color: '#111',
    fontSize: 16,
    cursor: 'pointer',
    marginTop: 15,
  },
  businessBox: {
    background: '#f7f7fb',
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
  },
  linkBox: {
    wordBreak: 'break-all',
    background: 'white',
    padding: 12,
    borderRadius: 12,
    color: '#111',
    border: '1px solid #eee',
  },
  section: {
    marginTop: 24,
  },
  item: {
    background: '#fafafa',
    border: '1px solid #eee',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  whatsappButton: {
    padding: 10,
    borderRadius: 10,
    border: 'none',
    background: '#25D366',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 700,
  },
}