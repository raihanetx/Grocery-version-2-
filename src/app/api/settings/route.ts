import { NextRequest, NextResponse } from 'next/server'

// Default settings to return if database is not available
const defaultSettings = {
  id: 'default',
  websiteName: 'GroceryHub',
  slogan: 'Freshness at your door',
  logoUrl: '',
  faviconUrl: '',
  bannerImages: [
    'https://i.postimg.cc/zfN3dyGV/Whisk-785426d5b3a55ac9f384abb1c653efdedr.jpg',
    'https://i.postimg.cc/QCFMB50H/Whisk-186f0227f2203638e6f4806f9343b15cdr.jpg',
    'https://i.postimg.cc/0jzN6mcM/Whisk-21cf4f35609655e91844ef8ae3c7f4c9dr.jpg'
  ],
  insideDhakaDelivery: 60,
  outsideDhakaDelivery: 120,
  freeDeliveryMin: 1000,
  universalDelivery: 0,
  useUniversalDelivery: false,
  whatsappNumber: '',
  phoneNumber: '',
  facebookUrl: '',
  messengerUsername: '',
  aboutUs: '',
  termsConditions: '',
  refundPolicy: '',
  privacyPolicy: ''
}

// GET - Fetch settings
export async function GET() {
  try {
    // Import db only when needed
    const { db } = await import('@/lib/db')
    
    // Get the first (and only) settings record with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    try {
      const { data: settings, error } = await db
        .from('Settings')
        .select('*')
        .limit(1)
        .single()

      clearTimeout(timeoutId)

      if (error && error.code === 'PGRST116') {
        // No settings exist, return defaults
        return NextResponse.json({
          success: true,
          settings: defaultSettings
        })
      }

      if (error) {
        console.error('Supabase error:', error)
        return NextResponse.json({
          success: true,
          settings: defaultSettings
        })
      }

      // Parse banner images from JSON string if it's a string
      let bannerImages = defaultSettings.bannerImages
      if (settings?.bannerImages) {
        try {
          bannerImages = typeof settings.bannerImages === 'string' 
            ? JSON.parse(settings.bannerImages) 
            : settings.bannerImages
        } catch {
          bannerImages = defaultSettings.bannerImages
        }
      }

      return NextResponse.json({
        success: true,
        settings: {
          id: settings.id,
          websiteName: settings.websiteName || defaultSettings.websiteName,
          slogan: settings.slogan || defaultSettings.slogan,
          logoUrl: settings.logoUrl || defaultSettings.logoUrl,
          faviconUrl: settings.faviconUrl || defaultSettings.faviconUrl,
          bannerImages,
          insideDhakaDelivery: settings.insideDhakaDelivery ?? defaultSettings.insideDhakaDelivery,
          outsideDhakaDelivery: settings.outsideDhakaDelivery ?? defaultSettings.outsideDhakaDelivery,
          freeDeliveryMin: settings.freeDeliveryMin ?? defaultSettings.freeDeliveryMin,
          universalDelivery: settings.universalDelivery ?? defaultSettings.universalDelivery,
          useUniversalDelivery: settings.useUniversalDelivery ?? defaultSettings.useUniversalDelivery,
          whatsappNumber: settings.whatsappNumber || defaultSettings.whatsappNumber,
          phoneNumber: settings.phoneNumber || defaultSettings.phoneNumber,
          facebookUrl: settings.facebookUrl || defaultSettings.facebookUrl,
          messengerUsername: settings.messengerUsername || defaultSettings.messengerUsername,
          aboutUs: settings.aboutUs || defaultSettings.aboutUs,
          termsConditions: settings.termsConditions || defaultSettings.termsConditions,
          refundPolicy: settings.refundPolicy || defaultSettings.refundPolicy,
          privacyPolicy: settings.privacyPolicy || defaultSettings.privacyPolicy
        }
      })
    } catch (dbError) {
      clearTimeout(timeoutId)
      console.error('Database connection error:', dbError)
      return NextResponse.json({
        success: true,
        settings: defaultSettings
      })
    }
  } catch (error) {
    console.error('Error in settings API:', error)
    return NextResponse.json({
      success: true,
      settings: defaultSettings
    })
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { db } = await import('@/lib/db')
    
    // Helper to handle empty strings
    const toNull = (value: string | null | undefined) => {
      if (value === '' || value === undefined) return null
      return value || null
    }

    // Helper to handle numbers
    const toNumber = (value: number | string | undefined | null, defaultValue: number) => {
      if (value === undefined || value === null || value === '') return defaultValue
      const num = typeof value === 'string' ? parseFloat(value) : value
      return isNaN(num) ? defaultValue : num
    }

    const settingsData = {
      websiteName: body.websiteName || 'GroceryHub',
      slogan: toNull(body.slogan),
      logoUrl: toNull(body.logoUrl),
      faviconUrl: toNull(body.faviconUrl),
      bannerImages: body.bannerImages && body.bannerImages.length > 0 
        ? JSON.stringify(body.bannerImages) 
        : null,
      insideDhakaDelivery: toNumber(body.insideDhakaDelivery, 60),
      outsideDhakaDelivery: toNumber(body.outsideDhakaDelivery, 120),
      freeDeliveryMin: toNumber(body.freeDeliveryMin, 1000),
      universalDelivery: toNumber(body.universalDelivery, 0),
      useUniversalDelivery: body.useUniversalDelivery === true,
      whatsappNumber: toNull(body.whatsappNumber),
      phoneNumber: toNull(body.phoneNumber),
      facebookUrl: toNull(body.facebookUrl),
      messengerUsername: toNull(body.messengerUsername),
      aboutUs: toNull(body.aboutUs),
      termsConditions: toNull(body.termsConditions),
      refundPolicy: toNull(body.refundPolicy),
      privacyPolicy: toNull(body.privacyPolicy)
    }

    // Get existing settings
    const { data: existingSettings, error: fetchError } = await db
      .from('Settings')
      .select('*')
      .limit(1)
      .single()

    let settings

    if (fetchError && fetchError.code === 'PGRST116') {
      // Create new settings
      const { data: newSettings, error: createError } = await db
        .from('Settings')
        .insert(settingsData)
        .select()
        .single()

      if (createError) {
        console.error('Error creating settings:', createError)
        throw createError
      }
      settings = newSettings
    } else if (fetchError) {
      console.error('Error fetching settings:', fetchError)
      throw fetchError
    } else {
      // Update existing settings
      const { data: updatedSettings, error: updateError } = await db
        .from('Settings')
        .update(settingsData)
        .eq('id', existingSettings.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating settings:', updateError)
        throw updateError
      }
      settings = updatedSettings
    }

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        websiteName: settings.websiteName,
        slogan: settings.slogan || '',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        bannerImages: settings.bannerImages ? JSON.parse(settings.bannerImages) : [],
        insideDhakaDelivery: settings.insideDhakaDelivery,
        outsideDhakaDelivery: settings.outsideDhakaDelivery,
        freeDeliveryMin: settings.freeDeliveryMin,
        universalDelivery: settings.universalDelivery,
        useUniversalDelivery: settings.useUniversalDelivery,
        whatsappNumber: settings.whatsappNumber || '',
        phoneNumber: settings.phoneNumber || '',
        facebookUrl: settings.facebookUrl || '',
        messengerUsername: settings.messengerUsername || '',
        aboutUs: settings.aboutUs || '',
        termsConditions: settings.termsConditions || '',
        refundPolicy: settings.refundPolicy || '',
        privacyPolicy: settings.privacyPolicy || ''
      },
      message: 'Settings saved successfully!'
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
