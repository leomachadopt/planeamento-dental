import { useState, useMemo, useEffect } from 'react'
import { useStrategyStore, ConfigInicial } from '@/stores/useStrategyStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Check,
  Settings2,
  MapPin,
  Users,
  Building2,
  Target,
  MessageSquare,
  Rocket,
  Plus,
  Minus,
  Stethoscope,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// --- Constants & Data ---

const DENTAL_CLINIC_TYPES = [
  'Clínica Generalista',
  'Clínica de Especialidades',
  'Consultório Privado',
  'Grupo Dentário',
  'Franquia Odontológica',
  'Hospital Dentário',
  'Clínica de Ortodontia',
  'Clínica de Implantologia',
  'Clínica de Estética',
  'Odontopediatria',
]

// Mapping identities to specific dental niches/specialties
const DENTAL_NICHES_MAP: Record<string, string[]> = {
  'Clínica Generalista': [
    'Medicina Dentária Geral',
    'Prevenção e Higiene Oral',
    'Prótese Dentária',
    'Cirurgia Oral Menor',
  ],
  'Clínica de Especialidades': [
    'Reabilitação Oral',
    'Implantologia Avançada',
    'Ortodontia',
    'Periodontia',
    'Endodontia',
    'Harmonização Orofacial',
  ],
  'Consultório Privado': [
    'Medicina Dentária Geral',
    'Atendimento Personalizado',
    'Estética Dentária',
    'Prótese sobre Implante',
  ],
  'Grupo Dentário': [
    'Multidisciplinar',
    'Implantologia',
    'Ortodontia',
    'Todas as Especialidades',
  ],
  'Franquia Odontológica': [
    'Ortodontia (Alinhadores)',
    'Implantologia',
    'Branqueamento e Estética',
    'Clínica Geral',
  ],
  'Clínica de Ortodontia': [
    'Ortodontia Fixa',
    'Alinhadores Invisíveis',
    'Ortopedia Facial',
    'Ortodontia Lingual',
  ],
  'Clínica de Implantologia': [
    'Carga Imediata',
    'All-on-4 / All-on-6',
    'Enxertos Ósseos',
    'Implantes Zigomáticos',
  ],
  'Clínica de Estética': [
    'Facetas e Lentes',
    'Harmonização Orofacial',
    'Branqueamento Dentário',
    'Design do Sorriso',
  ],
  Odontopediatria: [
    'Odontopediatria',
    'Ortodontia Preventiva',
    'Sedação Consciente',
    'Pacientes Especiais',
  ],
}

// Generic dental specialties fallback
const ALL_DENTAL_SPECIALTIES = [
  'Medicina Dentária Geral',
  'Implantologia',
  'Ortodontia',
  'Endodontia',
  'Periodontia',
  'Odontopediatria',
  'Cirurgia Oral',
  'Prótese Dentária',
  'Estética Dentária',
  'Harmonização Orofacial',
  'Oclusão e ATM',
  'Higiene Oral',
]

// Distritos e Regiões Autónomas de Portugal
const PORTUGAL_DISTRICTS = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
]

const DENTAL_GOALS_OPTIONS = [
  'Aumentar Faturação em Implantes',
  'Reduzir Taxa de No-shows (Faltas)',
  'Aumentar Taxa de Aceitação de Orçamentos',
  'Atrair Mais Pacientes Particulares',
  'Fidelização de Pacientes (Recorrência)',
  'Otimizar Ocupação dos Gabinetes',
  'Aumentar Ticket Médio por Consulta',
  'Expansão de Carteira de Seguros',
  'Digitalizar Processos (Paperless)',
  'Melhorar Reputação Online (Reviews)',
  'Lançar Harmonização Orofacial',
  'Expansão Física (Novas Cadeiras)',
]

const STAGE_OPTIONS = [
  'Iniciante (Consultório Novo)',
  'Em Crescimento (Expansão)',
  'Consolidada (Estável)',
  'Em Reestruturação (Crise)',
  'Transição de Gestão',
]

const STEPS_CONFIG = [
  {
    id: 'identity',
    title: 'Tipo de Clínica',
    description: 'Escolha a opção que mais parece com a sua. Isso define comparações e metas sugeridas.',
    icon: Settings2,
    category: 'Identidade',
  },
  {
    id: 'name',
    title: 'Identificação',
    description: 'Como você quer que o relatório se refira à clínica (nome oficial).',
    icon: Settings2,
    category: 'Identidade',
  },
  {
    id: 'location',
    title: 'Localização da Clínica',
    description: 'Onde fica a unidade principal?',
    icon: MapPin,
    category: 'Identidade',
  },
  {
    id: 'niche',
    title: 'Serviço Principal (o que mais vende)',
    description: 'Escolha o tratamento/serviço que mais representa sua clínica hoje.',
    icon: Stethoscope,
    category: 'Contexto',
  },
  {
    id: 'stage',
    title: 'Estágio Atual',
    description: 'Em que momento o negócio se encontra?',
    icon: Building2,
    category: 'Contexto',
  },
  {
    id: 'staff',
    title: 'Equipa (quantas pessoas por função)',
    description: 'Não precisa preencher nomes agora — só quantidades e funções.',
    icon: Users,
    category: 'Contexto',
  },
  {
    id: 'goals',
    title: 'Prioridades para 2026',
    description: 'Escolha até 3. Pense: o que mais destrava crescimento/resultado nos próximos 12 meses?',
    icon: Rocket,
    category: 'Estratégia',
  },
  {
    id: 'tone',
    title: 'Comunicação',
    description: 'Tom de voz para os relatórios estratégicos.',
    icon: MessageSquare,
    category: 'Estratégia',
  },
]

// Descrições dos tipos de clínica para tooltips
const CLINIC_TYPE_DESCRIPTIONS: Record<string, string> = {
  'Clínica Generalista': 'Vários profissionais, mix de serviços e gestão de equipa',
  'Clínica de Especialidades': 'Vários profissionais, mix de serviços e gestão de equipa',
  'Consultório Privado': '1 profissional principal, estrutura menor, agenda centrada no titular',
  'Grupo Dentário': 'Múltiplas unidades ou profissionais associados, gestão centralizada',
  'Franquia Odontológica': 'Unidade de rede, processos padronizados, marca compartilhada',
  'Hospital Dentário': 'Estrutura maior, múltiplas especialidades, atendimento hospitalar',
  'Clínica de Ortodontia': 'Foco em ortodontia, alinhadores e correção dentária',
  'Clínica de Implantologia': 'Especializada em implantes, reabilitação oral avançada',
  'Clínica de Estética': 'Foco em estética dental, harmonização e design do sorriso',
  'Odontopediatria': 'Especializada em atendimento infantil e pacientes especiais',
}

// Descrições dos estágios
const STAGE_DESCRIPTIONS: Record<string, string> = {
  'Iniciante (Consultório Novo)': 'agenda ainda instável, foco em captação',
  'Em Crescimento (Expansão)': 'mais procura, precisa de escala e processos',
  'Consolidada (Estável)': 'opera bem, foco em eficiência e margem',
  'Em Reestruturação (Crise)': 'queda/pressão, foco em ajustes rápidos',
  'Transição de Gestão': 'mudança de gestor/sócio/equipa',
}

// Categorias de objetivos
const GOALS_BY_CATEGORY = {
  Receita: [
    'Aumentar Faturação em Implantes',
    'Aumentar Ticket Médio por Consulta',
    'Atrair Mais Pacientes Particulares',
    'Expansão de Carteira de Seguros',
    'Lançar Harmonização Orofacial',
    'Expansão Física (Novas Cadeiras)',
  ],
  'Eficiência/Operação': [
    'Reduzir Taxa de No-shows (Faltas)',
    'Otimizar Ocupação dos Gabinetes',
    'Digitalizar Processos (Paperless)',
  ],
  'Marketing/Pacientes': [
    'Aumentar Taxa de Aceitação de Orçamentos',
    'Fidelização de Pacientes (Recorrência)',
    'Melhorar Reputação Online (Reviews)',
  ],
  'Qualidade/Equipe': [],
}

type StaffRole = 'secretaries' | 'specialists' | 'managers'
interface StaffMember {
  id: string
  name: string
  role: string
}

export default function SetupWizard() {
  const { setConfigInicial, config_inicial: savedConfig } = useStrategyStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  // -- FORM STATES --
  const [identityTypes, setIdentityTypes] = useState<string[]>([])
  const [customBusinessModel, setCustomBusinessModel] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [country, setCountry] = useState('Portugal') // Default to Portugal
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [niche, setNiche] = useState('')
  const [secondaryNiches, setSecondaryNiches] = useState<string[]>([])
  const [nicheUnknown, setNicheUnknown] = useState(false)
  const [stage, setStage] = useState('')

  // Staff State
  const [staffCounts, setStaffCounts] = useState<Record<StaffRole, number>>({
    secretaries: 0,
    specialists: 0,
    managers: 0,
  })
  const [staffMembers, setStaffMembers] = useState<
    Record<StaffRole, StaffMember[]>
  >({
    secretaries: [],
    specialists: [],
    managers: [],
  })

  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [tone, setTone] = useState('')
  const [hasMarketing, setHasMarketing] = useState<boolean | null>(null)
  const [hasFinancial, setHasFinancial] = useState<boolean | null>(null)

  // -- INITIALIZATION --
  useEffect(() => {
    // Basic init if saved data exists
    if (savedConfig.nome_clinica) setClinicName(savedConfig.nome_clinica)
    if (savedConfig.tipo_clinica) {
      const tipos = savedConfig.tipo_clinica.split(', ')
      const tiposPadrao: string[] = []
      const tiposCustomizados: string[] = []
      
      tipos.forEach((tipo) => {
        if (DENTAL_CLINIC_TYPES.includes(tipo)) {
          tiposPadrao.push(tipo)
        } else {
          tiposCustomizados.push(tipo)
        }
      })
      
      if (tiposPadrao.length > 0) {
        setIdentityTypes(tiposPadrao)
      }
      
      if (tiposCustomizados.length > 0) {
        setIdentityTypes((prev) => [...prev, 'Outro'])
        setCustomBusinessModel(tiposCustomizados.join(', '))
      }
    }
    if (savedConfig.estagio_clinica) setStage(savedConfig.estagio_clinica)
    if (savedConfig.objetivo_geral_2026)
      setSelectedGoals(savedConfig.objetivo_geral_2026.split(', '))
    if (savedConfig.tom_linguagem) setTone(savedConfig.tom_linguagem)

    // Improved Location parsing
    if (savedConfig.localizacao) {
      const parts = savedConfig.localizacao.split(', ')
      if (parts.length >= 2) {
        const countryPart = parts[parts.length - 1]
        if (countryPart === 'Portugal' || countryPart === 'Brasil') {
          setCountry(countryPart)
          setCity(parts[0])
          if (parts.length === 3) {
            setDistrict(parts[1])
          }
        } else {
          setCity(savedConfig.localizacao)
        }
      } else {
        setCity(savedConfig.localizacao)
      }
    }

    // Parse niche (principal + secundários)
    if (savedConfig.publico_principal) {
      if (savedConfig.publico_principal.includes('A definir')) {
        setNicheUnknown(true)
      } else if (savedConfig.publico_principal.includes('(Principal)')) {
        const parts = savedConfig.publico_principal.split(' (Principal)')
        setNiche(parts[0])
        if (parts[1] && parts[1].includes('(Secundários)')) {
          const secondaryPart = parts[1].replace('; ', '').replace(' (Secundários)', '')
          setSecondaryNiches(secondaryPart.split(', ').filter((n) => n.trim()))
        }
      } else {
        setNiche(savedConfig.publico_principal)
      }
    }
  }, [savedConfig])

  // -- HANDLERS --

  const handleNext = () => {
    // Validation
    if (currentStep === 0) {
      if (identityTypes.length === 0) {
        toast.error('Selecione pelo menos um modelo de negócio.')
        return
      }
      // Se "Outro" estiver selecionado, verificar se o campo foi preenchido
      if (identityTypes.includes('Outro') && !customBusinessModel.trim()) {
        toast.error('Por favor, preencha o modelo de negócio personalizado.')
        return
      }
    }
    if (currentStep === 1 && !clinicName.trim()) {
      toast.error('O nome da clínica é obrigatório.')
      return
    }
    if (currentStep === 2) {
      if (!country || !city.trim()) {
        toast.error('Preencha o país e a cidade.')
        return
      }
      if (country === 'Portugal' && !district) {
        toast.error('Selecione o distrito ou região.')
        return
      }
    }
    if (currentStep === 3) {
      if (nicheUnknown) {
        // Se selecionou "Não sei", pode avançar
      } else if (!niche) {
        toast.error('Selecione uma área de foco clínico.')
        return
      }
    }
    if (currentStep === 4 && !stage) {
      toast.error('Selecione o estágio do negócio.')
      return
    }
    if (currentStep === 6 && selectedGoals.length === 0) {
      toast.error('Selecione pelo menos um objetivo estratégico.')
      return
    }
    if (currentStep === 7 && !tone) {
      toast.error('Selecione o tom de linguagem.')
      return
    }

    if (currentStep < STEPS_CONFIG.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      finishWizard()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  const finishWizard = () => {
    // Compile Staff String
    const staffParts: string[] = []
    
    Object.entries(staffMembers).forEach(([role, members]) => {
      if (members.length > 0) {
        const functions = members.map((m) => m.role).filter((r) => r.trim()).join(', ')
        const count = members.length
        const label =
          role === 'secretaries'
            ? 'Receção/Atendimento'
            : role === 'specialists'
              ? 'Dentistas'
              : 'Gestão/Coordenação'
        if (functions) {
          staffParts.push(`${count} ${label}: ${functions}`)
        } else {
          staffParts.push(`${count} ${label}`)
        }
      }
    })

    if (hasMarketing !== null) {
      staffParts.push(`Marketing: ${hasMarketing ? 'Sim' : 'Não'}`)
    }
    if (hasFinancial !== null) {
      staffParts.push(`Financeiro: ${hasFinancial ? 'Sim' : 'Não'}`)
    }

    const staffString = staffParts.join('; ') || 'Equipa não detalhada'

    // Se "Outro" estiver selecionado, substituir por seu valor customizado
    const tipoClinicaFinal = identityTypes
      .map((type) => (type === 'Outro' ? customBusinessModel : type))
      .filter((type) => type.trim() !== '')
      .join(', ')

    // Compile niche string
    let nicheFinal = niche
    if (nicheUnknown) {
      nicheFinal = 'A definir (sugerir com base em estágio e equipa)'
    } else if (secondaryNiches.length > 0) {
      nicheFinal = `${niche} (Principal); ${secondaryNiches.join(', ')} (Secundários)`
    }

    // Compile location string
    let locationFinal = city
    if (district) {
      locationFinal = `${city}, ${district}`
    }
    locationFinal = `${locationFinal}, ${country}`

    const finalConfig: ConfigInicial = {
      tipo_clinica: tipoClinicaFinal,
      nome_clinica: clinicName,
      localizacao: locationFinal,
      publico_principal: nicheFinal,
      estagio_clinica: stage as any,
      gestores_principais: staffString,
      objetivo_geral_2026: selectedGoals.join(', '),
      tamanho_relatorio: 'resumido_20',
      tom_linguagem: tone as any,
    }

    setConfigInicial(finalConfig)
    setIsCompleted(true)
    toast.success('Configuração da Clínica Dentária concluída!')
  }

  // Identity Logic
  const toggleIdentity = (type: string) => {
    if (type === 'Outro') {
      // Se clicar em "Outro", adiciona ou remove
      setIdentityTypes((prev) => {
        if (prev.includes('Outro')) {
          // Se estava selecionado, remove e limpa o campo
          setCustomBusinessModel('')
          return prev.filter((t) => t !== 'Outro')
        } else {
          // Se não estava selecionado, adiciona
          return [...prev, 'Outro']
        }
      })
    } else {
      // Para outros tipos, comportamento normal
      setIdentityTypes((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
      )
    }
  }

  // Niche Logic - Filter based on identity
  const availableNiches = useMemo(() => {
    if (identityTypes.length === 0) return ALL_DENTAL_SPECIALTIES

    const options = new Set<string>()
    identityTypes.forEach((type) => {
      const related = DENTAL_NICHES_MAP[type]
      if (related) {
        related.forEach((n) => options.add(n))
      }
    })

    // If no specific map found, return generic list, otherwise return mapped + generic unique
    return options.size > 0 ? Array.from(options) : ALL_DENTAL_SPECIALTIES
  }, [identityTypes])

  // Staff Logic
  const updateStaffCount = (role: StaffRole, delta: number) => {
    const current = staffCounts[role]
    const newCount = Math.max(0, current + delta)
    setStaffCounts((prev) => ({ ...prev, [role]: newCount }))

    setStaffMembers((prev) => {
      const currentList = prev[role]
      if (newCount > currentList.length) {
        // Add
        const toAdd = newCount - currentList.length
        let defaultRole = ''
        if (role === 'secretaries') defaultRole = 'Assistente Dentária'
        if (role === 'specialists') defaultRole = 'Médico Dentista'
        if (role === 'managers') defaultRole = 'Diretor Clínico'

        const newItems = Array.from({ length: toAdd }).map(() => ({
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          role: defaultRole,
        }))
        return { ...prev, [role]: [...currentList, ...newItems] }
      } else if (newCount < currentList.length) {
        // Remove from end
        return { ...prev, [role]: currentList.slice(0, newCount) }
      }
      return prev
    })
  }

  const updateStaffMember = (
    role: StaffRole,
    index: number,
    field: 'name' | 'role',
    val: string,
  ) => {
    setStaffMembers((prev) => {
      const newList = [...prev[role]]
      newList[index] = { ...newList[index], [field]: val }
      return { ...prev, [role]: newList }
    })
  }

  // Goals Logic
  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goal)) return prev.filter((g) => g !== goal)
      if (prev.length >= 3) {
        toast.warning('Máximo de 3 objetivos permitido.')
        return prev
      }
      return [...prev, goal]
    })
  }

  // Suggest goals based on stage, niche, and staff
  const suggestGoals = () => {
    const suggestions: string[] = []
    
    // Receita - sempre sugerir um
    if (stage.includes('Iniciante') || stage.includes('Crescimento')) {
      suggestions.push('Atrair Mais Pacientes Particulares')
    } else {
      suggestions.push('Aumentar Ticket Médio por Consulta')
    }
    
    // Eficiência - baseado em estágio
    if (stage.includes('Crescimento') || stage.includes('Consolidada')) {
      suggestions.push('Otimizar Ocupação dos Gabinetes')
    } else {
      suggestions.push('Reduzir Taxa de No-shows (Faltas)')
    }
    
    // Marketing/Pacientes - baseado em staff
    if (!hasMarketing) {
      suggestions.push('Melhorar Reputação Online (Reviews)')
    } else {
      suggestions.push('Fidelização de Pacientes (Recorrência)')
    }
    
    // Limitar a 3
    setSelectedGoals(suggestions.slice(0, 3))
    toast.success('3 prioridades sugeridas com base no seu perfil!')
  }

  const stepData = STEPS_CONFIG[currentStep]
  const progress = ((currentStep + 1) / STEPS_CONFIG.length) * 100

  // -- RENDER COMPLETION --
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in p-4">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle2 className="size-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
          Tudo Pronto!
        </h1>
        <p className="text-slate-500 mb-8 text-center max-w-md">
          Configuração finalizada. O sistema agora possui os dados da sua
          clínica para gerar a estratégia.
        </p>
        <Button onClick={() => (window.location.href = '/')}>
          Ir para Dashboard
        </Button>
      </div>
    )
  }

  // -- RENDER WIZARD --
  return (
    <div className="container max-w-3xl mx-auto py-10 px-4 min-h-[80vh] flex flex-col justify-center">
      <div className="mb-8 space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-50">
              {stepData.category}
            </Badge>
          </div>
          <span>
            Passo {currentStep + 1} de {STEPS_CONFIG.length}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="border-t-4 border-t-teal-500 shadow-lg animate-fade-in-up transition-all duration-300">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-100 p-2 rounded-lg">
              <stepData.icon className="size-6 text-teal-700" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl text-slate-800">
              {stepData.title}
            </CardTitle>
          </div>
          <CardDescription className="text-base sm:text-lg pl-[3.25rem]">
            {stepData.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 pb-8 pl-[3.25rem] pr-6">
          {/* STEP 1: IDENTITY (Dental) */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {DENTAL_CLINIC_TYPES.map((type) => {
                    const description = CLINIC_TYPE_DESCRIPTIONS[type] || ''
                    return (
                      <Tooltip key={type}>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={identityTypes.includes(type) ? 'default' : 'outline'}
                            className={cn(
                              'text-base py-2 px-4 cursor-pointer hover:bg-slate-100 transition-colors',
                              identityTypes.includes(type) &&
                                'bg-teal-600 hover:bg-teal-700 text-white',
                            )}
                            onClick={() => toggleIdentity(type)}
                          >
                            {type}
                          </Badge>
                        </TooltipTrigger>
                        {description && (
                          <TooltipContent>
                            <p className="max-w-xs">{description}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    )
                  })}
                  <Badge
                    variant={identityTypes.includes('Outro') ? 'default' : 'outline'}
                    className={cn(
                      'text-base py-2 px-4 cursor-pointer hover:bg-slate-100 transition-colors',
                      identityTypes.includes('Outro') &&
                        'bg-teal-600 hover:bg-teal-700 text-white',
                    )}
                    onClick={() => toggleIdentity('Outro')}
                  >
                    Outro
                  </Badge>
                </div>
              </TooltipProvider>
              
              {identityTypes.includes('Outro') && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="custom-business-model">Se for outro, descreva em 1 frase</Label>
                  <Input
                    id="custom-business-model"
                    autoFocus
                    value={customBusinessModel}
                    onChange={(e) => setCustomBusinessModel(e.target.value)}
                    placeholder="Ex.: Clínica móvel; clínica universitária; clínica com foco em convénios; etc."
                    className="text-lg h-12"
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  />
                </div>
              )}
              
              <p className="text-sm text-slate-500 mt-4">
                Se estiver em dúvida, escolha a que representa a maior parte do seu faturamento.
              </p>
            </div>
          )}

          {/* STEP 2: NAME */}
          {currentStep === 1 && (
            <Input
              autoFocus
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Ex.: Clínica Kids Funchal"
              className="text-lg h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          )}

          {/* STEP 3: LOCATION (Portugal Focus) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>País</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione o país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Portugal">Portugal</SelectItem>
                      <SelectItem value="Brasil">Brasil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {country === 'Portugal' && (
                  <>
                    <div className="space-y-2 animate-fade-in">
                      <Label>Cidade/Concelho</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Digite o nome da cidade ou concelho..."
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2 animate-fade-in">
                      <Label>Distrito/Região</Label>
                      <Select value={district} onValueChange={setDistrict}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Selecione o distrito ou região" />
                        </SelectTrigger>
                        <SelectContent>
                          {PORTUGAL_DISTRICTS.map((dist) => (
                            <SelectItem key={dist} value={dist}>
                              {dist}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {country !== 'Portugal' && (
                  <div className="space-y-2">
                    <Label>Cidade/Concelho</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Digite sua cidade..."
                      className="h-11"
                    />
                  </div>
                )}
              </div>
              
              <p className="text-sm text-slate-500">
                Se atende em mais de uma cidade, coloque a principal (onde está a maior parte da agenda).
              </p>
            </div>
          )}

          {/* STEP 4: NICHE (Specialties) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <RadioGroup
                value={nicheUnknown ? 'unknown' : niche || ''}
                onValueChange={(value) => {
                  if (value === 'unknown') {
                    setNicheUnknown(true)
                    setNiche('')
                    setSecondaryNiches([])
                  } else {
                    setNicheUnknown(false)
                    setNiche(value)
                    // Remove da lista de secundários se estiver lá
                    setSecondaryNiches((prev) => prev.filter((n) => n !== value))
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <div>
                    <Label className="text-base font-semibold">Serviço Principal</Label>
                    <p className="text-sm text-slate-500 mt-1">
                      Escolha o tratamento/serviço que mais representa sua clínica hoje.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {availableNiches.map((n) => (
                      <Label
                        key={n}
                        className={cn(
                          'flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-all',
                          niche === n && !nicheUnknown
                            ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                            : 'border-slate-200',
                        )}
                      >
                        <RadioGroupItem value={n} id={n} />
                        <span className="font-medium text-slate-700">{n}</span>
                      </Label>
                    ))}
                  </div>
                </div>

                {niche && !nicheUnknown && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <Label className="text-base font-semibold">Serviços Secundários (opcional, até 2)</Label>
                      <p className="text-sm text-slate-500 mt-1">
                        Outros tratamentos importantes para sua clínica.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableNiches
                        .filter((n) => n !== niche)
                        .map((n) => {
                          const isSelected = secondaryNiches.includes(n)
                          return (
                            <Badge
                              key={n}
                              variant={isSelected ? 'default' : 'outline'}
                              className={cn(
                                'text-sm py-2 px-4 cursor-pointer hover:bg-slate-100 transition-all',
                                isSelected &&
                                  'bg-teal-600 hover:bg-teal-700 text-white',
                                !isSelected && secondaryNiches.length >= 2 &&
                                  'opacity-50 cursor-not-allowed',
                              )}
                              onClick={() => {
                                if (isSelected) {
                                  setSecondaryNiches((prev) => prev.filter((s) => s !== n))
                                } else if (secondaryNiches.length < 2) {
                                  setSecondaryNiches((prev) => [...prev, n])
                                }
                              }}
                            >
                              {n}
                              {isSelected && <Check className="ml-2 size-3" />}
                            </Badge>
                          )
                        })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Label
                    className={cn(
                      'flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-all',
                      nicheUnknown
                        ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                        : 'border-slate-200',
                    )}
                  >
                    <RadioGroupItem value="unknown" id="unknown" />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">
                        Não sei — sugerir com base no meu estágio e equipa
                      </span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <p className="text-sm text-slate-500">
                Se ainda não tem um foco, escolha o que você quer crescer em 2026.
              </p>
            </div>
          )}

          {/* STEP 5: STAGE */}
          {currentStep === 4 && (
            <RadioGroup
              value={stage}
              onValueChange={setStage}
              className="grid gap-3"
            >
              {STAGE_OPTIONS.map((opt) => {
                const description = STAGE_DESCRIPTIONS[opt] || ''
                return (
                  <Label
                    key={opt}
                    className={cn(
                      'flex items-start space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-slate-50',
                      stage === opt
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200',
                    )}
                  >
                    <RadioGroupItem value={opt} id={opt} className="mt-1" />
                    <div className="flex flex-col">
                      <span className="text-lg font-medium text-slate-700">
                        {opt}
                      </span>
                      {description && (
                        <span className="text-sm text-slate-500 mt-1">
                          {description}
                        </span>
                      )}
                    </div>
                  </Label>
                )
              })}
            </RadioGroup>
          )}

          {/* STEP 6: STAFF (Dental Roles) */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Counters */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'secretaries', label: 'Receção/Atendimento' },
                  { id: 'specialists', label: 'Dentistas' },
                  { id: 'managers', label: 'Gestão/Coordenação' },
                ].map((role) => (
                  <div key={role.id} className="text-center space-y-2">
                    <Label>{role.label}</Label>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateStaffCount(role.id as StaffRole, -1)
                        }
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-lg">
                        {staffCounts[role.id as StaffRole]}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateStaffCount(role.id as StaffRole, 1)
                        }
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Funções-chave */}
              {Object.entries(staffMembers).map(([role, members]) => {
                if (members.length === 0) return null
                const label =
                  role === 'secretaries'
                    ? 'Receção/Atendimento'
                    : role === 'managers'
                      ? 'Gestão/Coordenação'
                      : 'Dentistas (por especialidade)'
                return (
                  <div key={role} className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase text-slate-500 border-b pb-1">
                      {label}
                    </h4>
                    {members.map((member, idx) => (
                      <div key={member.id} className="flex gap-2">
                        <Input
                          placeholder="Função (Ex: Higienista, Ortodontista, Assistente)"
                          value={member.role}
                          onChange={(e) =>
                            updateStaffMember(
                              role as StaffRole,
                              idx,
                              'role',
                              e.target.value,
                            )
                          }
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                )
              })}

              {/* Campos opcionais */}
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Tem alguém dedicado a marketing?</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={hasMarketing === true ? 'default' : 'outline'}
                      className={cn(
                        'flex-1',
                        hasMarketing === true && 'bg-teal-600 hover:bg-teal-700',
                      )}
                      onClick={() => setHasMarketing(true)}
                    >
                      Sim
                    </Button>
                    <Button
                      variant={hasMarketing === false ? 'default' : 'outline'}
                      className={cn(
                        'flex-1',
                        hasMarketing === false && 'bg-teal-600 hover:bg-teal-700',
                      )}
                      onClick={() => setHasMarketing(false)}
                    >
                      Não
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tem alguém dedicado a financeiro?</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={hasFinancial === true ? 'default' : 'outline'}
                      className={cn(
                        'flex-1',
                        hasFinancial === true && 'bg-teal-600 hover:bg-teal-700',
                      )}
                      onClick={() => setHasFinancial(true)}
                    >
                      Sim
                    </Button>
                    <Button
                      variant={hasFinancial === false ? 'default' : 'outline'}
                      className={cn(
                        'flex-1',
                        hasFinancial === false && 'bg-teal-600 hover:bg-teal-700',
                      )}
                      onClick={() => setHasFinancial(false)}
                    >
                      Não
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: GOALS (Dental) */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                    <span>Selecione até 3 prioridades</span>
                    <span
                      className={cn(
                        selectedGoals.length === 3
                          ? 'text-red-500 font-bold'
                          : 'text-teal-600',
                      )}
                    >
                      {selectedGoals.length}/3
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={suggestGoals}
                    className="mb-4"
                  >
                    Sugerir 3 prioridades
                  </Button>
                </div>
              </div>

              {Object.entries(GOALS_BY_CATEGORY).map(([category, goals]) => {
                if (goals.length === 0) return null
                return (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold text-sm text-slate-700 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {goals.map((goal) => (
                        <Badge
                          key={goal}
                          variant={
                            selectedGoals.includes(goal) ? 'default' : 'outline'
                          }
                          className={cn(
                            'text-sm py-3 px-4 cursor-pointer hover:bg-slate-100 transition-all border-slate-200',
                            selectedGoals.includes(goal) &&
                              'bg-teal-600 hover:bg-teal-700 text-white border-teal-600',
                          )}
                          onClick={() => toggleGoal(goal)}
                        >
                          {goal}
                          {selectedGoals.includes(goal) && (
                            <Check className="ml-2 size-3" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })}

              <p className="text-sm text-slate-500 pt-2 border-t">
                Se estiver em dúvida, escolha 1 de cada: (1) Receita, (2) Eficiência, (3) Paciente/Marketing.
              </p>
            </div>
          )}

          {/* STEP 8: TONE */}
          {currentStep === 7 && (
            <RadioGroup
              value={tone}
              onValueChange={setTone}
              className="grid gap-3"
            >
              {[
                {
                  value: 'formal',
                  label: 'Formal (Institucional)',
                  desc: 'Comunicação clínica, séria e corporativa.',
                  example: "Ex.: 'Recomenda-se implementar…'",
                },
                {
                  value: 'intermediario',
                  label: 'Profissional Acessível',
                  desc: 'Equilíbrio entre técnica e proximidade.',
                  example: "Ex.: 'Para melhorar a agenda, sugerimos…'",
                },
                {
                  value: 'informal',
                  label: 'Próximo (Humanizado)',
                  desc: 'Foco total na empatia e acolhimento.',
                  example: "Ex.: 'Vamos cuidar da experiência do paciente…'",
                },
              ].map((opt) => (
                <Label
                  key={opt.value}
                  className={cn(
                    'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-slate-50',
                    tone === opt.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200',
                  )}
                >
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-slate-700">
                      {opt.label}
                    </span>
                    <span className="text-sm text-slate-500">{opt.desc}</span>
                    <span className="text-xs text-slate-400 italic mt-1">
                      {opt.example}
                    </span>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-slate-50/50 p-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={cn('text-slate-500', currentStep === 0 && 'invisible')}
          >
            <ChevronLeft className="mr-2 size-4" /> Voltar
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            className="bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200/50 pl-6 pr-4"
          >
            {currentStep === STEPS_CONFIG.length - 1 ? 'Finalizar' : 'Próximo'}
            <ChevronRight className="ml-2 size-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
