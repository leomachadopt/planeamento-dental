import type { VercelRequest, VercelResponse } from '@vercel/node'
import { authenticateToken, AuthRequest } from '../../../../_shared/auth.js'
import pool from '../../../../_shared/db.js'

// Função simples para converter markdown básico para texto
function markdownToText(markdown: string): string {
  return markdown
    .replace(/^#+\s+(.+)$/gm, '$1') // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links
    .replace(/`(.+?)`/g, '$1') // Code
    .replace(/^\s*[-*+]\s+/gm, '• ') // Lists
    .replace(/^\s*\d+\.\s+/gm, '') // Numbered lists
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
        const margin = 20
        const maxWidth = pageWidth - 2 * margin
        let yPosition = margin

        // Função para adicionar nova página se necessário
        const checkPageBreak = (requiredHeight: number) => {
          if (yPosition + requiredHeight > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
            return true
          }
          return false
        }

        // Capa
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        const clinicName = report.clinic_name || 'Clínica'
        const titleWidth = doc.getTextWidth(clinicName)
        doc.text(clinicName, (pageWidth - titleWidth) / 2, yPosition)
        yPosition += 15

        doc.setFontSize(18)
        doc.setFont('helvetica', 'normal')
        const dossierTitle = report.dossier_title || 'Dossiê'
        const subtitleWidth = doc.getTextWidth(dossierTitle)
        doc.text(dossierTitle, (pageWidth - subtitleWidth) / 2, yPosition)
        yPosition += 10

        doc.setFontSize(16)
        doc.text('Relatório Estratégico Consolidado', (pageWidth - doc.getTextWidth('Relatório Estratégico Consolidado')) / 2, yPosition)
        yPosition += 15

        doc.setFontSize(12)
        doc.setFont('helvetica', 'italic')
        const date = new Date(report.created_at).toLocaleDateString('pt-PT')
        doc.text(`Gerado em: ${date}`, (pageWidth - doc.getTextWidth(`Gerado em: ${date}`)) / 2, yPosition)
        yPosition = pageHeight - 30

        // Nova página para conteúdo
        doc.addPage()
        yPosition = margin

        // Converter markdown para texto e dividir em linhas
        const text = markdownToText(report.report_markdown)
        const lines = doc.splitTextToSize(text, maxWidth)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')

        for (const line of lines) {
          checkPageBreak(7)
          doc.text(line, margin, yPosition)
          yPosition += 7
        }

        // Adicionar numeração de páginas
        const totalPages = doc.internal.pages.length - 1
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i)
          doc.setFontSize(10)
          doc.text(
            `Página ${i} de ${totalPages}`,
            pageWidth - margin - doc.getTextWidth(`Página ${i} de ${totalPages}`),
            pageHeight - 10,
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

