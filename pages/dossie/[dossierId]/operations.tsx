import { useRouter } from 'next/router'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import RolesManager from '@/components/dossier/entities/RolesManager'
import TeamMembersManager from '@/components/dossier/entities/TeamMembersManager'
import CapacitiesManager from '@/components/dossier/entities/CapacitiesManager'

export default function DossierOperations() {
  const router = useRouter()
  const { dossierId } = router.query

  if (!dossierId || typeof dossierId !== 'string') {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="OPERATIONS"
      entityBlocks={
        <>
          <RolesManager />
          <TeamMembersManager dossierId={dossierId} />
          <CapacitiesManager dossierId={dossierId} />
        </>
      }
    />
  )
}

