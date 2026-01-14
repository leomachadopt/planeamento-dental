import { useParams } from 'react-router-dom'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import ServiceCategoriesManager from '@/components/dossier/entities/ServiceCategoriesManager'
import ServicesManager from '@/components/dossier/entities/ServicesManager'

export default function DossierOffer() {
  const { dossierId } = useParams<{ dossierId: string }>()

  if (!dossierId) {
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

