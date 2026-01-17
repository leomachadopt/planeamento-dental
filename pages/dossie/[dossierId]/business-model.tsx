import DossierSectionPage from '@/components/dossier/DossierSectionPage'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Building2 } from 'lucide-react'

export default function DossierBusinessModel() {
  return (
    <DossierSectionPage
      sectionCode="BUSINESS_MODEL"
      entityBlocks={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              Entidades do Modelo de Negócio
            </CardTitle>
            <CardDescription>
              Blocos de entidades para esta seção serão implementados em breve
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 text-center py-4">
              Em construção
            </p>
          </CardContent>
        </Card>
      }
    />
  )
}

