import { useParams } from 'react-router-dom'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import CustomerSegmentsBlock from '@/components/dossier/entities/CustomerSegmentsBlock'
import ValuePropositionsBlock from '@/components/dossier/entities/ValuePropositionsBlock'

export default function DossierIdentity() {
  const { dossierId } = useParams<{ dossierId: string }>()

  if (!dossierId) {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="IDENTITY"
      entityBlocks={
        <>
          <CustomerSegmentsBlock dossierId={dossierId} />
          <ValuePropositionsBlock dossierId={dossierId} />
        </>
      }
    />
  )
}
