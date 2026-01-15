import { useRouter } from 'next/router'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import StrategicChoicesManager from '@/components/dossier/entities/StrategicChoicesManager'

export default function DossierStrategy() {
  const router = useRouter()
  const { dossierId } = router.query

  if (!dossierId || typeof dossierId !== 'string') {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="STRATEGY"
      entityBlocks={<StrategicChoicesManager dossierId={dossierId} />}
    />
  )
}

