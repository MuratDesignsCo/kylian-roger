import { gqlRequest } from '@/lib/graphql/client'
import { CONTACT_QUERY } from '@/lib/graphql/queries'
import type { ContactPage, ContactInfoBlock, Award, BtsImage, MediaKitButton } from '@/lib/types'

interface ContactResponse {
  contact: {
    page: ContactPage
    infoBlocks: ContactInfoBlock[]
    awards: Award[]
    btsImages: BtsImage[]
    mediaKitButtons: MediaKitButton[]
  }
}

export async function getContactData() {
  try {
    const data = await gqlRequest<ContactResponse>(CONTACT_QUERY)
    return {
      page: data.contact.page as ContactPage | null,
      infoBlocks: data.contact.infoBlocks,
      awards: data.contact.awards,
      btsImages: data.contact.btsImages,
      mediaKitButtons: data.contact.mediaKitButtons,
    }
  } catch {
    return {
      page: null,
      infoBlocks: [],
      awards: [],
      btsImages: [],
      mediaKitButtons: [],
    }
  }
}
