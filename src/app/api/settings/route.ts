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

    if (!settings) {
      settings = await db.settings.create({
        data: {
          websiteName: body.websiteName || 'GroceryHub',
          slogan: body.slogan || null,
          logoUrl: body.logoUrl || null,
          faviconUrl: body.faviconUrl || null,
          bannerImages: body.bannerImages ? JSON.stringify(body.bannerImages) : null,
          insideDhakaDelivery: body.insideDhakaDelivery ?? 60,
          outsideDhakaDelivery: body.outsideDhakaDelivery ?? 120,
          freeDeliveryMin: body.freeDeliveryMin ?? 1000,
          universalDelivery: body.universalDelivery ?? 0,
          useUniversalDelivery: body.useUniversalDelivery ?? false,
          whatsappNumber: body.whatsappNumber || null,
          phoneNumber: body.phoneNumber || null,
          facebookUrl: body.facebookUrl || null,
          messengerUsername: body.messengerUsername || null,
          aboutUs: body.aboutUs || null,
          termsConditions: body.termsConditions || null,
          refundPolicy: body.refundPolicy || null,
          privacyPolicy: body.privacyPolicy || null
        }
      })
    } else {
      // Update existing settings
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          websiteName: body.websiteName ?? settings.websiteName,
          slogan: body.slogan !== undefined ? body.slogan : settings.slogan,
          logoUrl: body.logoUrl !== undefined ? body.logoUrl : settings.logoUrl,
          faviconUrl: body.faviconUrl !== undefined ? body.faviconUrl : settings.faviconUrl,
          bannerImages: body.bannerImages !== undefined 
            ? (body.bannerImages ? JSON.stringify(body.bannerImages) : null)
            : settings.bannerImages,
          insideDhakaDelivery: body.insideDhakaDelivery ?? settings.insideDhakaDelivery,
          outsideDhakaDelivery: body.outsideDhakaDelivery ?? settings.outsideDhakaDelivery,
          freeDeliveryMin: body.freeDeliveryMin ?? settings.freeDeliveryMin,
          universalDelivery: body.universalDelivery ?? settings.universalDelivery,
          useUniversalDelivery: body.useUniversalDelivery ?? settings.useUniversalDelivery,
          whatsappNumber: body.whatsappNumber !== undefined ? body.whatsappNumber : settings.whatsappNumber,
          phoneNumber: body.phoneNumber !== undefined ? body.phoneNumber : settings.phoneNumber,
          facebookUrl: body.facebookUrl !== undefined ? body.facebookUrl : settings.facebookUrl,
          messengerUsername: body.messengerUsername !== undefined ? body.messengerUsername : settings.messengerUsername,
          aboutUs: body.aboutUs !== undefined ? body.aboutUs : settings.aboutUs,
          termsConditions: body.termsConditions !== undefined ? body.termsConditions : settings.termsConditions,
          refundPolicy: body.refundPolicy !== undefined ? body.refundPolicy : settings.refundPolicy,
          privacyPolicy: body.privacyPolicy !== undefined ? body.privacyPolicy : settings.privacyPolicy
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
