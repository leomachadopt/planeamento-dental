import { useParams } from 'react-router-dom'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import CompetitorsManager from '@/components/dossier/entities/CompetitorsManager'

export default function DossierMarket() {
  const { dossierId } = useParams<{ dossierId: string }>()

  if (!dossierId) {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="MARKET"
      entityBlocks={<CompetitorsManager dossierId={dossierId} />}
    />
  )
}

