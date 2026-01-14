import { useParams } from 'react-router-dom'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import RolesManager from '@/components/dossier/entities/RolesManager'
import TeamMembersManager from '@/components/dossier/entities/TeamMembersManager'
import CapacitiesManager from '@/components/dossier/entities/CapacitiesManager'

export default function DossierOperations() {
  const { dossierId } = useParams<{ dossierId: string }>()

  if (!dossierId) {
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

