import { useState, useMemo } from 'react'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Check,
  ChevronsUpDown,
  Settings2,
  MapPin,
  Users,
  Building2,
  Target,
  MessageSquare,
  Rocket,
  Plus,
  Minus,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// --- Constants & Data ---

const CLINIC_TYPES = [
  'Fisioterapia',
  'Odontologia',
  'Clínica Geral',
  'Psicologia',
  'Nutrição',
  'Estética',
  'Pilates',
  'Multidisciplinar',
  'Dermatologia',
  'Pediatria',
  'Outro',
]

const NICHES_MAP: Record<string, string[]> = {
  Fisioterapia: [
    'Traumatologia',
    'Esportiva',
    'Neurologia',
    'Respiratória',
    'Pélvica',
    'Geriatria',
    'Osteopatia',
  ],
  Odontologia: [
    'Ortodontia',
    'Implantodontia',
    'Estética',
    'Endodontia',
    'Odontopediatria',
    'Harmonização Facial',
  ],
  'Clínica Geral': [
    'Medicina da Família',
    'Check-up Executivo',
    'Preventiva',
    'Atendimento Popular',
  ],
  Psicologia: [
    'TCC',
    'Psicanálise',
    'Comportamental',
    'Infantil',
    'Terapia de Casal',
    'Neuropsicologia',
  ],
  Nutrição: [
    'Esportiva',
    'Emagrecimento',
    'Clínica',
    'Comportamental',
    'Materno-Infantil',
  ],
  Estética: [
    'Facial',
    'Corporal',
    'Biomédica',
    'Laser',
    'Injetáveis',
    'Pré e Pós Operatório',
  ],
  Pilates: ['Solo', 'Aparelhos', 'Reabilitação', 'Fitness', 'Gestantes'],
  Multidisciplinar: [
    'Saúde Integrativa',
    'Dor Crônica',
    'Bem-estar',
    'Emagrecimento',
  ],
  Outro: ['Especialidades Diversas', 'Nicho Específico', 'Consultório Isolado'],
}

const CITIES_BRAZIL = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Brasília, DF',
  'Curitiba, PR',
  'Porto Alegre, RS',
  'Salvador, BA',
  'Recife, PE',
  'Fortaleza, CE',
  'Goiânia, GO',
  'Campinas, SP',
  'Florianópolis, SC',
  'Manaus, AM',
  'Belém, PA',
  'Vitória, ES',
]

const CITIES_PORTUGAL = [
  'Lisboa, Lisboa',
  'Porto, Porto',
  'Braga, Braga',
  'Coimbra, Coimbra',
  'Setúbal, Setúbal',
  'Aveiro, Aveiro',
  'Faro, Faro',
  'Viseu, Viseu',
  'Leiria, Leiria',
  'Funchal, Madeira',
]

const GOALS_OPTIONS = [
  'Crescer faturamento',
  'Organizar processos internos',
  'Expandir unidades',
  'Melhorar experiência do paciente',
  'Aumentar lucro líquido',
  'Construir autoridade digital',
  'Reter pacientes atuais',
  'Profissionalizar a gestão',
  'Lançar novos serviços',
]

const STAGE_OPTIONS = [
  'Iniciante',
  'Em Crescimento',
  'Consolidada',
  'Em Crise',
  'Outro',
]

const STEPS_CONFIG = [
  {
    id: 'identity',
    title: 'Identidade da Clínica',
    description: 'Selecione as categorias que melhor representam sua atuação.',
    icon: Settings2,
    category: 'Identidade',
  },
  {
    id: 'name',
    title: 'Nome da Clínica',
    description: 'Como ela é conhecida no mercado.',
    icon: Settings2,
    category: 'Identidade',
  },
  {
    id: 'location',
    title: 'Localização',
    description: 'Onde a clínica está situada?',
    icon: MapPin,
    category: 'Identidade',
  },
  {
    id: 'niche',
    title: 'Nicho de Atuação',
    description: 'Qual é o foco principal dos seus atendimentos?',
    icon: Target,
    category: 'Contexto',
  },
  {
    id: 'stage',
    title: 'Estágio do Negócio',
    description: 'Em qual momento a clínica se encontra?',
    icon: Building2,
    category: 'Contexto',
  },
  {
    id: 'staff',
    title: 'Composição da Equipe',
    description: 'Quem faz parte do time atualmente?',
    icon: Users,
    category: 'Contexto',
  },
  {
    id: 'goals',
    title: 'Objetivos Estratégicos',
    description: 'Quais são as prioridades para 2026? (Máx. 3)',
    icon: Rocket,
    category: 'Estratégia',
  },
  {
    id: 'tone',
    title: 'Tom de Linguagem',
    description: 'Como devemos nos comunicar nos relatórios?',
    icon: MessageSquare,
    category: 'Estratégia',
  },
]

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
  const [clinicName, setClinicName] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [openCityCombo, setOpenCityCombo] = useState(false)
  const [niche, setNiche] = useState('')
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

  // -- INITIALIZATION --
  useMemo(() => {
    if (savedConfig.nome_clinica) setClinicName(savedConfig.nome_clinica)
    if (savedConfig.tipo_clinica)
      setIdentityTypes(savedConfig.tipo_clinica.split(', '))
    if (savedConfig.estagio_clinica) setStage(savedConfig.estagio_clinica)
    if (savedConfig.objetivo_geral_2026)
      setSelectedGoals(savedConfig.objetivo_geral_2026.split(', '))
    if (savedConfig.tom_linguagem) setTone(savedConfig.tom_linguagem)
    if (savedConfig.localizacao) {
      const parts = savedConfig.localizacao.split(', ')
      if (parts.length > 1) {
        const potentialCountry = parts[parts.length - 1]
        if (['Brasil', 'Portugal'].includes(potentialCountry)) {
          setCountry(potentialCountry)
          setCity(parts.slice(0, -1).join(', '))
        } else {
          setCity(savedConfig.localizacao)
        }
      } else {
        setCity(savedConfig.localizacao)
      }
    }
    // Note: Parsing complex staff string back to state is complex, skipping for MVP simplicity (assuming wizard is for setup)
  }, []) // Run once on mount

  // -- HANDLERS --

  const handleNext = () => {
    // Validation
    if (currentStep === 0 && identityTypes.length === 0) {
      toast.error('Selecione pelo menos um tipo de clínica.')
      return
    }
    if (currentStep === 1 && !clinicName.trim()) {
      toast.error('O nome da clínica é obrigatório.')
      return
    }
    if (currentStep === 2 && (!country || !city)) {
      toast.error('Selecione o país e a cidade.')
      return
    }
    if (currentStep === 3 && !niche) {
      toast.error('Selecione um nicho de atuação.')
      return
    }
    if (currentStep === 4 && !stage) {
      toast.error('Selecione o estágio do negócio.')
      return
    }
    if (currentStep === 6 && selectedGoals.length === 0) {
      toast.error('Selecione pelo menos um objetivo.')
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
    const staffString = Object.entries(staffMembers)
      .filter(([_, members]) => members.length > 0)
      .map(([role, members]) => {
        const details = members.map((m) => `${m.name} (${m.role})`).join(', ')
        const count = members.length
        const label =
          role === 'secretaries'
            ? 'Secretárias'
            : role === 'specialists'
              ? 'Especialistas'
              : 'Gestores'
        return `${count} ${label}: ${details}`
      })
      .join('; ')

    const finalConfig: ConfigInicial = {
      tipo_clinica: identityTypes.join(', '),
      nome_clinica: clinicName,
      localizacao: `${city}, ${country}`,
      publico_principal: niche,
      estagio_clinica: stage as any,
      gestores_principais: staffString || 'Equipe não detalhada',
      objetivo_geral_2026: selectedGoals.join(', '),
      tamanho_relatorio: 'resumido_20', // Defaulting as step was removed
      tom_linguagem: tone as any,
    }

    setConfigInicial(finalConfig)
    setIsCompleted(true)
    toast.success('Configuração concluída com sucesso!')
  }

  // Identity Logic
  const toggleIdentity = (type: string) => {
    setIdentityTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  // Location Logic
  const currentCities =
    country === 'Brasil'
      ? CITIES_BRAZIL
      : country === 'Portugal'
        ? CITIES_PORTUGAL
        : []

  // Niche Logic
  const availableNiches = useMemo(() => {
    const options = new Set<string>()
    if (identityTypes.length === 0) {
      Object.values(NICHES_MAP)
        .flat()
        .forEach((n) => options.add(n))
    } else {
      identityTypes.forEach((type) => {
        const niches = NICHES_MAP[type] || NICHES_MAP['Outro']
        niches.forEach((n) => options.add(n))
      })
    }
    return Array.from(options)
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
        const newItems = Array.from({ length: toAdd }).map(() => ({
          id: Math.random().toString(36).substr(2, 9),
          name: '',
          role:
            role === 'secretaries'
              ? 'Secretária'
              : role === 'managers'
                ? 'Gerente'
                : 'Especialista',
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
        toast.warning('Máximo de 3 objetivos atingido.')
        return prev
      }
      return [...prev, goal]
    })
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
          Configuração finalizada. O sistema agora possui os dados necessários
          para gerar sua estratégia.
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
          {/* STEP 1: IDENTITY */}
          {currentStep === 0 && (
            <div className="flex flex-wrap gap-2">
              {CLINIC_TYPES.map((type) => (
                <Badge
                  key={type}
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
              ))}
            </div>
          )}

          {/* STEP 2: NAME */}
          {currentStep === 1 && (
            <Input
              autoFocus
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Ex: Clínica Vida Plena"
              className="text-lg h-12"
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            />
          )}

          {/* STEP 3: LOCATION */}
          {currentStep === 2 && (
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>País</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brasil">Brasil</SelectItem>
                    <SelectItem value="Portugal">Portugal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {country && (
                <div className="space-y-2 animate-fade-in">
                  <Label>
                    {country === 'Brasil' ? 'Cidade' : 'Concelho/Distrito'}
                  </Label>
                  <Popover open={openCityCombo} onOpenChange={setOpenCityCombo}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCityCombo}
                        className="w-full justify-between h-11"
                      >
                        {city || 'Selecione ou digite...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar cidade..." />
                        <CommandList>
                          <CommandEmpty>
                            Nenhuma cidade encontrada.
                          </CommandEmpty>
                          <CommandGroup>
                            {currentCities.map((c) => (
                              <CommandItem
                                key={c}
                                value={c}
                                onSelect={(currentValue) => {
                                  setCity(currentValue)
                                  setOpenCityCombo(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    city === c ? 'opacity-100' : 'opacity-0',
                                  )}
                                />
                                {c}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    *Lista de sugestões baseada nas principais cidades.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: NICHE (Conditional) */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-sm text-slate-500 mb-2">
                Opções baseadas em: <strong>{identityTypes.join(', ')}</strong>
              </div>
              <RadioGroup
                value={niche}
                onValueChange={setNiche}
                className="grid sm:grid-cols-2 gap-3"
              >
                {availableNiches.map((n) => (
                  <Label
                    key={n}
                    className={cn(
                      'flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-slate-50 transition-all',
                      niche === n
                        ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                        : 'border-slate-200',
                    )}
                  >
                    <RadioGroupItem value={n} id={n} />
                    <span className="font-medium text-slate-700">{n}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* STEP 5: STAGE */}
          {currentStep === 4 && (
            <RadioGroup
              value={stage}
              onValueChange={setStage}
              className="grid gap-3"
            >
              {STAGE_OPTIONS.map((opt) => (
                <Label
                  key={opt}
                  className={cn(
                    'flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-slate-50',
                    stage === opt
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200',
                  )}
                >
                  <RadioGroupItem value={opt} id={opt} />
                  <span className="text-lg font-medium text-slate-700">
                    {opt}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          )}

          {/* STEP 6: STAFF (Dynamic) */}
          {currentStep === 5 && (
            <div className="space-y-8">
              {/* Counters */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'secretaries', label: 'Secretárias' },
                  { id: 'specialists', label: 'Especialistas' },
                  { id: 'managers', label: 'Gestores' },
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

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {Object.entries(staffMembers).map(([role, members]) => {
                  if (members.length === 0) return null
                  const label =
                    role === 'secretaries'
                      ? 'Secretárias'
                      : role === 'managers'
                        ? 'Gestores'
                        : 'Especialistas'
                  return (
                    <div key={role} className="space-y-3">
                      <h4 className="font-semibold text-sm uppercase text-slate-500 border-b pb-1">
                        {label}
                      </h4>
                      {members.map((member, idx) => (
                        <div key={member.id} className="flex gap-2">
                          <Input
                            placeholder={`Nome da ${label.slice(0, -1)}`}
                            value={member.name}
                            onChange={(e) =>
                              updateStaffMember(
                                role as StaffRole,
                                idx,
                                'name',
                                e.target.value,
                              )
                            }
                            className="flex-1"
                          />
                          <Input
                            placeholder="Cargo/Função"
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
              </div>
            </div>
          )}

          {/* STEP 7: GOALS */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-slate-500">
                <span>Selecione até 3 opções</span>
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
              <div className="flex flex-wrap gap-2">
                {GOALS_OPTIONS.map((goal) => (
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
                  label: 'Formal',
                  desc: 'Corporativo e técnico',
                },
                {
                  value: 'intermediario',
                  label: 'Intermediário',
                  desc: 'Profissional mas acessível',
                },
                {
                  value: 'informal',
                  label: 'Informal',
                  desc: 'Próximo e motivacional',
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
