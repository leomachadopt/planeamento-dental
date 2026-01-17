import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '@/lib/api-shared/auth'
import pool from '@/lib/api-shared/db'

interface TextSegment {
  text: string
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'list-item' | 'separator'
  isBold?: boolean
}

// Função para parsear markdown em segmentos estruturados
function parseMarkdownToSegments(markdown: string): TextSegment[] {
  const segments: TextSegment[] = []
  const lines = markdown.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) {
      // Linha vazia - adiciona separador para espaçamento
      if (segments.length > 0 && segments[segments.length - 1].type !== 'separator') {
        segments.push({ text: '', type: 'separator' })
      }
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      segments.push({ text: line.replace(/^###\s+/, ''), type: 'h3' })
    } else if (line.startsWith('## ')) {
      segments.push({ text: line.replace(/^##\s+/, ''), type: 'h2' })
    } else if (line.startsWith('# ')) {
      segments.push({ text: line.replace(/^#\s+/, ''), type: 'h1' })
    }
    // Listas
    else if (line.match(/^\s*[-*+]\s+/)) {
      const text = line.replace(/^\s*[-*+]\s+/, '')
      segments.push({ text: `• ${cleanInlineMarkdown(text)}`, type: 'list-item' })
    }
    else if (line.match(/^\s*\d+\.\s+/)) {
      const text = line.replace(/^\s*\d+\.\s+/, '')
      const num = line.match(/^\s*(\d+)\./)?.[1] || '1'
      segments.push({ text: `${num}. ${cleanInlineMarkdown(text)}`, type: 'list-item' })
    }
    // Parágrafos
    else {
      segments.push({ text: cleanInlineMarkdown(line), type: 'paragraph' })
    }
  }

  return segments
}

// Limpar formatação inline do markdown
function cleanInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
    .replace(/`(.+?)`/g, '$1') // Code
    .trim()
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  return authenticateToken(req as AuthRequest, res, async () => {
    try {
      const { method } = req
      const authReq = req as AuthRequest
      const user = authReq.user!
      const dossierId = req.query.id as string
      const format = (req.query.format as string) || 'pdf'

      if (!dossierId) {
        return res.status(400).json({ error: 'ID do dossiê é obrigatório' })
      }

      if (method !== 'GET') {
        return res.status(405).json({ error: 'Método não permitido' })
      }

      // Validar acesso ao dossiê
      const dossierResult = await pool.query(
        'SELECT clinic_id FROM dossiers WHERE id = $1',
        [dossierId],
      )

      if (dossierResult.rows.length === 0) {
        return res.status(404).json({ error: 'Dossiê não encontrado' })
      }

      const clinicId = dossierResult.rows[0].clinic_id

      if (user.role !== 'admin' && user.clinicId !== clinicId) {
        return res.status(403).json({ error: 'Acesso negado a este dossiê' })
      }

      // Buscar último relatório final
      const reportResult = await pool.query(
        `SELECT ar.*, d.title as dossier_title, c.clinic_name
         FROM ai_reports ar
         JOIN dossiers d ON d.id = ar.dossier_id
         JOIN clinics c ON c.id = ar.clinic_id
         WHERE ar.dossier_id = $1 AND ar.section_code = 'FINAL_REPORT'
         ORDER BY ar.created_at DESC 
         LIMIT 1`,
        [dossierId],
      )

      if (reportResult.rows.length === 0) {
        return res.status(404).json({ error: 'Relatório final ainda não gerado' })
      }

      const report = reportResult.rows[0]

      if (format === 'pdf') {
        // Criar PDF usando jsPDF
        const { jsPDF: JSPDF } = await import('jspdf')
        const doc = new JSPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        })

        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const marginLeft = 25
        const marginRight = 25
        const marginTop = 30
        const marginBottom = 25
        const maxWidth = pageWidth - marginLeft - marginRight
        let yPosition = marginTop

        // Configurações de tipografia - fontes maiores para boa legibilidade
        const typography = {
          h1: { size: 24, lineHeight: 12, spaceBefore: 14, spaceAfter: 8, font: 'bold' as const },
          h2: { size: 20, lineHeight: 10, spaceBefore: 12, spaceAfter: 6, font: 'bold' as const },
          h3: { size: 16, lineHeight: 9, spaceBefore: 10, spaceAfter: 5, font: 'bold' as const },
          paragraph: { size: 14, lineHeight: 7, spaceBefore: 0, spaceAfter: 5, font: 'normal' as const },
          'list-item': { size: 14, lineHeight: 7, spaceBefore: 0, spaceAfter: 3, font: 'normal' as const },
          separator: { size: 14, lineHeight: 6, spaceBefore: 0, spaceAfter: 0, font: 'normal' as const },
        }

        // Função para adicionar nova página se necessário
        const checkPageBreak = (requiredHeight: number) => {
          if (yPosition + requiredHeight > pageHeight - marginBottom) {
            doc.addPage()
            yPosition = marginTop
            return true
          }
          return false
        }

        // Função auxiliar para adicionar texto com quebra de linha
        const addText = (text: string, style: keyof typeof typography, indent: number = 0) => {
          const config = typography[style]

          // Espaço antes
          if (config.spaceBefore > 0) {
            checkPageBreak(config.spaceBefore)
            yPosition += config.spaceBefore
          }

          doc.setFontSize(config.size)
          doc.setFont('helvetica', config.font)

          const effectiveMaxWidth = maxWidth - indent
          const lines = doc.splitTextToSize(text, effectiveMaxWidth)

          for (const line of lines) {
            checkPageBreak(config.lineHeight)
            doc.text(line, marginLeft + indent, yPosition)
            yPosition += config.lineHeight
          }

          // Espaço depois
          if (config.spaceAfter > 0) {
            yPosition += config.spaceAfter
          }
        }

        // =====================
        // CAPA DO DOCUMENTO
        // =====================

        // Título da clínica (centralizado no topo)
        yPosition = 70
        doc.setFontSize(36)
        doc.setFont('helvetica', 'bold')
        const clinicName = report.clinic_name || 'Clínica'
        doc.text(clinicName, pageWidth / 2, yPosition, { align: 'center' })

        // Linha decorativa
        yPosition += 18
        doc.setDrawColor(0, 128, 128) // Teal color
        doc.setLineWidth(1)
        doc.line(marginLeft + 20, yPosition, pageWidth - marginRight - 20, yPosition)

        // Título do dossiê
        yPosition += 25
        doc.setFontSize(26)
        doc.setFont('helvetica', 'normal')
        const dossierTitle = report.dossier_title || 'Dossiê Estratégico'
        doc.text(dossierTitle, pageWidth / 2, yPosition, { align: 'center' })

        // Subtítulo
        yPosition += 30
        doc.setFontSize(22)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 128, 128) // Teal color
        doc.text('Relatório Estratégico Consolidado', pageWidth / 2, yPosition, { align: 'center' })
        doc.setTextColor(0, 0, 0) // Reset to black

        // Data de geração (no rodapé da capa)
        yPosition = pageHeight - 50
        doc.setFontSize(14)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(100, 100, 100)
        const date = new Date(report.created_at).toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
        doc.text(`Documento gerado em ${date}`, pageWidth / 2, yPosition, { align: 'center' })
        doc.setTextColor(0, 0, 0) // Reset to black

        // =====================
        // CONTEÚDO DO RELATÓRIO
        // =====================
        doc.addPage()
        yPosition = marginTop

        // Parsear markdown em segmentos
        const segments = parseMarkdownToSegments(report.report_markdown)

        for (const segment of segments) {
          if (segment.type === 'separator') {
            yPosition += typography.separator.lineHeight
            continue
          }

          const indent = segment.type === 'list-item' ? 5 : 0
          addText(segment.text, segment.type, indent)
        }

        // =====================
        // NUMERAÇÃO DE PÁGINAS
        // =====================
        const totalPages = doc.internal.pages.length - 1
        for (let i = 2; i <= totalPages; i++) { // Começa da página 2 (depois da capa)
          doc.setPage(i)
          doc.setFontSize(11)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(120, 120, 120)
          doc.text(
            `${i - 1} / ${totalPages - 1}`,
            pageWidth / 2,
            pageHeight - 15,
            { align: 'center' }
          )
        }

        // Retornar PDF
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="relatorio-final-${dossierId}.pdf"`)
        return res.status(200).send(pdfBuffer)
      } else {
        return res.status(400).json({ error: 'Formato não suportado. Use format=pdf' })
      }
    } catch (error: any) {
      console.error('Erro na exportação do relatório final:', error)
      return res.status(500).json({ error: error.message })
    }
  })
}

