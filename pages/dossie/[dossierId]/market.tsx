import { useRouter } from 'next/router'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import CompetitorsManager from '@/components/dossier/entities/CompetitorsManager'

export default function DossierMarket() {
  const router = useRouter()
  const { dossierId } = router.query

  if (!dossierId || typeof dossierId !== 'string') {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="MARKET"
      entityBlocks={<CompetitorsManager dossierId={dossierId} />}
    />
  )
}

