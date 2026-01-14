import { useParams } from 'react-router-dom'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import StrategicChoicesManager from '@/components/dossier/entities/StrategicChoicesManager'

export default function DossierStrategy() {
  const { dossierId } = useParams<{ dossierId: string }>()

  if (!dossierId) {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="STRATEGY"
      entityBlocks={<StrategicChoicesManager dossierId={dossierId} />}
    />
  )
}

