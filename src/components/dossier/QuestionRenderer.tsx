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
      return (
        <Textarea
          value={answer.valueText || ''}
          onChange={(e) =>
            onChange({
              ...answer,
              valueText: e.target.value,
            })
          }
          placeholder={question.help_text}
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

