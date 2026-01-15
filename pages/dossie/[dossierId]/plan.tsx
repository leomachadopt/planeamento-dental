import { useRouter } from 'next/router'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import InitiativesManager from '@/components/dossier/entities/InitiativesManager'

export default function DossierPlan() {
  const router = useRouter()
  const { dossierId } = router.query

  if (!dossierId || typeof dossierId !== 'string') {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="PLAN"
      entityBlocks={<InitiativesManager dossierId={dossierId} />}
    />
  )
}

