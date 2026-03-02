import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch settings
export async function GET() {
  try {
    // Get the first (and only) settings record
    let settings = await db.settings.findFirst()

    // If no settings exist, create default one
    if (!settings) {
      settings = await db.settings.create({
        data: {
          websiteName: 'GroceryHub',
          slogan: 'Freshness at your door',
          logoUrl: null,
          faviconUrl: null,
          bannerImages: null,
          insideDhakaDelivery: 60,
          outsideDhakaDelivery: 120,
          freeDeliveryMin: 1000,
          universalDelivery: 0,
          useUniversalDelivery: false,
          whatsappNumber: null,
          phoneNumber: null,
          facebookUrl: null,
          messengerUsername: null,
          aboutUs: null,
          termsConditions: null,
          refundPolicy: null,
          privacyPolicy: null
        }
      })
    }

    // Parse banner images from JSON
    const bannerImages = settings.bannerImages 
      ? JSON.parse(settings.bannerImages) 
      : []

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        websiteName: settings.websiteName,
        slogan: settings.slogan || '',
        logoUrl: settings.logoUrl || '',
        faviconUrl: settings.faviconUrl || '',
        bannerImages,
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
      }
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT - Update settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get existing settings or create new one
    let settings = await db.settings.findFirst()

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

    if (!settings) {
      settings = await db.settings.create({
        data: {
          websiteName: body.websiteName || 'GroceryHub',
          slogan: toNull(body.slogan),
          logoUrl: toNull(body.logoUrl),
          faviconUrl: toNull(body.faviconUrl),
          bannerImages: body.bannerImages && body.bannerImages.length > 0 ? JSON.stringify(body.bannerImages) : null,
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
      })
    } else {
      // Update existing settings
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          websiteName: body.websiteName ?? settings.websiteName,
          slogan: body.slogan !== undefined ? toNull(body.slogan) : settings.slogan,
          logoUrl: body.logoUrl !== undefined ? toNull(body.logoUrl) : settings.logoUrl,
          faviconUrl: body.faviconUrl !== undefined ? toNull(body.faviconUrl) : settings.faviconUrl,
          bannerImages: body.bannerImages !== undefined 
            ? (body.bannerImages && body.bannerImages.length > 0 ? JSON.stringify(body.bannerImages) : null)
            : settings.bannerImages,
          insideDhakaDelivery: body.insideDhakaDelivery !== undefined ? toNumber(body.insideDhakaDelivery, settings.insideDhakaDelivery) : settings.insideDhakaDelivery,
          outsideDhakaDelivery: body.outsideDhakaDelivery !== undefined ? toNumber(body.outsideDhakaDelivery, settings.outsideDhakaDelivery) : settings.outsideDhakaDelivery,
          freeDeliveryMin: body.freeDeliveryMin !== undefined ? toNumber(body.freeDeliveryMin, settings.freeDeliveryMin) : settings.freeDeliveryMin,
          universalDelivery: body.universalDelivery !== undefined ? toNumber(body.universalDelivery, settings.universalDelivery) : settings.universalDelivery,
          useUniversalDelivery: body.useUniversalDelivery !== undefined ? body.useUniversalDelivery === true : settings.useUniversalDelivery,
          whatsappNumber: body.whatsappNumber !== undefined ? toNull(body.whatsappNumber) : settings.whatsappNumber,
          phoneNumber: body.phoneNumber !== undefined ? toNull(body.phoneNumber) : settings.phoneNumber,
          facebookUrl: body.facebookUrl !== undefined ? toNull(body.facebookUrl) : settings.facebookUrl,
          messengerUsername: body.messengerUsername !== undefined ? toNull(body.messengerUsername) : settings.messengerUsername,
          aboutUs: body.aboutUs !== undefined ? toNull(body.aboutUs) : settings.aboutUs,
          termsConditions: body.termsConditions !== undefined ? toNull(body.termsConditions) : settings.termsConditions,
          refundPolicy: body.refundPolicy !== undefined ? toNull(body.refundPolicy) : settings.refundPolicy,
          privacyPolicy: body.privacyPolicy !== undefined ? toNull(body.privacyPolicy) : settings.privacyPolicy
        }
      })
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
