import { useRouter } from 'next/router'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import ServiceCategoriesManager from '@/components/dossier/entities/ServiceCategoriesManager'
import ServicesManager from '@/components/dossier/entities/ServicesManager'

export default function DossierOffer() {
  const router = useRouter()
  const { dossierId } = router.query

  if (!dossierId || typeof dossierId !== 'string') {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="OFFER"
      entityBlocks={
        <>
          <ServiceCategoriesManager dossierId={dossierId} />
          <ServicesManager dossierId={dossierId} />
        </>
      }
    />
  )
}

