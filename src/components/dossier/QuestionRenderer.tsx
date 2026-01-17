import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Question } from '@/services/dossierService'

interface QuestionRendererProps {
  question: Question
  answer: {
    valueText?: string
    valueNumber?: number
    valueJson?: any
  }
  onChange: (value: any) => void
}

export default function QuestionRenderer({
  question,
  answer,
  onChange,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'textarea':
      // Placeholder customizado para perguntas específicas
      let placeholder = question.help_text || ''
      if (question.code === 'IDENTITY_REASON') {
        placeholder = 'Escreva aqui, com suas próprias palavras, por que sua clínica existe e que transformação real ela gera na vida dos pacientes…'
      } else if (question.code === 'IDENTITY_RECOGNITION_GOAL') {
        placeholder = 'Escreva aqui, com suas próprias palavras, como você quer que sua clínica seja conhecida e lembrada daqui a 3 anos…'
      }
      
      return (
        <Textarea
          value={answer.valueText || ''}
          onChange={(e) =>
            onChange({
              ...answer,
              valueText: e.target.value,
            })
          }
          placeholder={placeholder}
          className="min-h-[100px]"
        />
      )

    case 'single_select':
      return (
        <RadioGroup
          value={answer.valueText || ''}
          onValueChange={(value) =>
            onChange({
              ...answer,
              valueText: value,
            })
          }
        >
          {question.options?.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.id} />
              <Label htmlFor={option.id} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )

    default:
      return (
        <Input
          value={answer.valueText || ''}
          onChange={(e) =>
            onChange({
              ...answer,
              valueText: e.target.value,
            })
          }
          placeholder={question.help_text}
        />
      )
  }
}


