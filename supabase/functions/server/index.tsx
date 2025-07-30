import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js'
import * as kv from './kv_store.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

// Kullanıcı kaydı
app.post('/make-server-dde4baf5/signup', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    if (!username || !password) {
      return c.json({ error: 'Kullanıcı adı ve şifre gereklidir' }, 400)
    }

    // Kullanıcı adının daha önce alınıp alınmadığını kontrol et
    const existingUser = await kv.get(`user:${username.toLowerCase()}`)
    if (existingUser) {
      return c.json({ error: 'Bu kullanıcı adı zaten alınmış' }, 400)
    }

    // Supabase ile kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `${username.toLowerCase()}@multiplication-game.local`,
      password: password,
      user_metadata: { 
        username: username,
        display_name: username 
      },
      email_confirm: true // Email sunucusu olmadığı için otomatik onaylama
    })

    if (authError) {
      console.log('Supabase auth error:', authError)
      return c.json({ error: 'Kullanıcı kaydı sırasında hata oluştu' }, 500)
    }

    // Kullanıcı bilgilerini KV store'a kaydet
    const userData = {
      id: authData.user.id,
      username: username,
      created_at: new Date().toISOString(),
      total_games: 0,
      total_score: 0
    }

    await kv.set(`user:${username.toLowerCase()}`, userData)
    await kv.set(`user_id:${authData.user.id}`, username)

    return c.json({ 
      success: true, 
      user: { 
        id: authData.user.id, 
        username: username 
      } 
    })

  } catch (error) {
    console.log('Signup error:', error)
    return c.json({ error: 'Sunucu hatası' }, 500)
  }
})

// Kullanıcı girişi
app.post('/make-server-dde4baf5/signin', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    if (!username || password === undefined) {
      return c.json({ error: 'Kullanıcı adı ve şifre gereklidir' }, 400)
    }

    // Kullanıcının var olup olmadığını kontrol et
    const userData = await kv.get(`user:${username.toLowerCase()}`)
    if (!userData) {
      return c.json({ error: 'Kullanıcı bulunamadı' }, 404)
    }

    // Supabase ile giriş yap
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: `${username.toLowerCase()}@multiplication-game.local`,
      password: password
    })

    if (authError) {
      console.log('Signin error:', authError)
      return c.json({ error: 'Kullanıcı adı veya şifre hatalı' }, 401)
    }

    return c.json({ 
      success: true,
      user: {
        id: authData.user.id,
        username: userData.username
      },
      access_token: authData.session.access_token
    })

  } catch (error) {
    console.log('Signin server error:', error)
    return c.json({ error: 'Sunucu hatası' }, 500)
  }
})

// Skor kaydetme
app.post('/make-server-dde4baf5/save-score', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Yetkilendirme gerekli' }, 401)
    }

    // Kullanıcıyı doğrula
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    if (userError || !user) {
      return c.json({ error: 'Geçersiz oturum' }, 401)
    }

    const { score, table, totalTime } = await c.req.json()
    
    if (score === undefined || !table || !totalTime) {
      return c.json({ error: 'Eksik skor verileri' }, 400)
    }

    // Kullanıcı adını al
    const username = await kv.get(`user_id:${user.id}`)
    if (!username) {
      return c.json({ error: 'Kullanıcı bilgisi bulunamadı' }, 404)
    }

    // Skor verisini oluştur
    const scoreData = {
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      username: username,
      score: score,
      table: table,
      total_time: totalTime,
      date: new Date().toISOString()
    }

    // Skoru kaydet
    await kv.set(`score:${scoreData.id}`, scoreData)
    
    // Kullanıcı skorlarına ekle
    const userScoresKey = `user_scores:${user.id}`
    const userScores = await kv.get(userScoresKey) || []
    userScores.push(scoreData.id)
    await kv.set(userScoresKey, userScores)

    // Kullanıcı istatistiklerini güncelle
    const userData = await kv.get(`user:${username.toLowerCase()}`)
    if (userData) {
      userData.total_games = (userData.total_games || 0) + 1
      userData.total_score = (userData.total_score || 0) + score
      userData.last_game = new Date().toISOString()
      await kv.set(`user:${username.toLowerCase()}`, userData)
    }

    return c.json({ success: true, scoreId: scoreData.id })

  } catch (error) {
    console.log('Save score error:', error)
    return c.json({ error: 'Skor kaydedilirken hata oluştu' }, 500)
  }
})

// Skorları getirme
app.get('/make-server-dde4baf5/scores', async (c) => {
  try {
    const difficulty = c.req.query('difficulty') || 'all'
    
    // Tüm skorları al
    const allScoreKeys = await kv.getByPrefix('score:')
    const scores = allScoreKeys || []

    // Zorluk seviyesine göre filtrele
    let filteredScores = scores
    if (difficulty !== 'all') {
      const difficultyTables = {
        'easy': [2, 5, 10],
        'medium': [3, 4, 6], 
        'hard': [7, 8, 9]
      }
      
      const tables = difficultyTables[difficulty] || []
      filteredScores = scores.filter(score => tables.includes(score.table))
    }

    // Skorlara göre sırala (yüksek skor, düşük süre)
    filteredScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.total_time - b.total_time
    })

    // En iyi 20 skoru al
    const topScores = filteredScores.slice(0, 20)

    return c.json({ scores: topScores })

  } catch (error) {
    console.log('Get scores error:', error)
    return c.json({ error: 'Skorlar getirilirken hata oluştu' }, 500)
  }
})

// Kullanıcı profili
app.get('/make-server-dde4baf5/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Yetkilendirme gerekli' }, 401)
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    if (userError || !user) {
      return c.json({ error: 'Geçersiz oturum' }, 401)
    }

    const username = await kv.get(`user_id:${user.id}`)
    if (!username) {
      return c.json({ error: 'Kullanıcı bulunamadı' }, 404)
    }

    const userData = await kv.get(`user:${username.toLowerCase()}`)
    if (!userData) {
      return c.json({ error: 'Kullanıcı verileri bulunamadı' }, 404)
    }

    // Kullanıcının skorlarını al
    const userScoresKey = `user_scores:${user.id}`
    const userScoreIds = await kv.get(userScoresKey) || []
    
    let userScores = []
    for (const scoreId of userScoreIds) {
      const score = await kv.get(`score:${scoreId}`)
      if (score) userScores.push(score)
    }

    // Skorları sırala
    userScores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.total_time - b.total_time
    })

    return c.json({
      user: {
        id: user.id,
        username: userData.username,
        total_games: userData.total_games || 0,
        total_score: userData.total_score || 0,
        created_at: userData.created_at,
        last_game: userData.last_game
      },
      scores: userScores.slice(0, 10) // Son 10 oyun
    })

  } catch (error) {
    console.log('Profile error:', error)
    return c.json({ error: 'Profil bilgileri alınırken hata oluştu' }, 500)
  }
})

// Oturum kontrolü
app.get('/make-server-dde4baf5/check-session', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ valid: false }, 200)
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    
    if (error || !user) {
      return c.json({ valid: false }, 200)
    }

    const username = await kv.get(`user_id:${user.id}`)
    
    return c.json({ 
      valid: true, 
      user: { 
        id: user.id, 
        username: username 
      } 
    })

  } catch (error) {
    console.log('Check session error:', error)
    return c.json({ valid: false }, 500)
  }
})

// Hesap silme
app.delete('/make-server-dde4baf5/delete-account', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1]
    
    if (!accessToken) {
      return c.json({ error: 'Yetkilendirme gerekli' }, 401)
    }

    // Kullanıcıyı doğrula
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    if (userError || !user) {
      return c.json({ error: 'Geçersiz oturum' }, 401)
    }

    // Kullanıcı adını al
    const username = await kv.get(`user_id:${user.id}`)
    if (!username) {
      return c.json({ error: 'Kullanıcı bilgisi bulunamadı' }, 404)
    }

    // Kullanıcının skorlarını sil
    const userScoresKey = `user_scores:${user.id}`
    const userScoreIds = await kv.get(userScoresKey) || []
    
    // Her skoru tek tek sil
    for (const scoreId of userScoreIds) {
      await kv.del(`score:${scoreId}`)
    }
    
    // Kullanıcı skor listesini sil
    await kv.del(userScoresKey)
    
    // Kullanıcı verilerini sil
    await kv.del(`user:${username.toLowerCase()}`)
    await kv.del(`user_id:${user.id}`)

    // Supabase Auth'tan kullanıcıyı sil
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.log('Supabase user delete error:', deleteError)
      // Veriler zaten silindiği için devam et
    }

    return c.json({ success: true, message: 'Hesap başarıyla silindi' })

  } catch (error) {
    console.log('Delete account error:', error)
    return c.json({ error: 'Hesap silinirken hata oluştu' }, 500)
  }
})

Deno.serve(app.fetch)