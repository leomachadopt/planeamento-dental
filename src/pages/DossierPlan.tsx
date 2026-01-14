import { useParams } from 'react-router-dom'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import InitiativesManager from '@/components/dossier/entities/InitiativesManager'

export default function DossierPlan() {
  const { dossierId } = useParams<{ dossierId: string }>()

  if (!dossierId) {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="PLAN"
      entityBlocks={<InitiativesManager dossierId={dossierId} />}
    />
  )
}

