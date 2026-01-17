import { useRouter } from 'next/router'
import DossierSectionPage from '@/components/dossier/DossierSectionPage'

export default function DossierPeople() {
  const router = useRouter()
  const { dossierId } = router.query

  if (!dossierId || typeof dossierId !== 'string') {
    return null
  }

  return (
    <DossierSectionPage
      sectionCode="PEOPLE"
    />
  )
}
