import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const docType = formData.get('doc_type') as string

    if (!file) return NextResponse.json({ error: 'Keine Datei' }, { status: 400 })

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    let content: any[]

    if (file.type === 'application/pdf') {
      content = [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: base64
          }
        },
        {
          type: 'text',
          text: `Dies ist ein Dokument vom Typ: ${docType}.
Bitte extrahiere folgende Informationen und antworte NUR mit einem JSON-Objekt ohne Markdown:
{
  "expiry_date": "YYYY-MM-DD oder null",
  "issue_date": "YYYY-MM-DD oder null",
  "document_number": "Nummer oder null",
  "full_name": "Name oder null"
}
Wenn ein Wert nicht gefunden wird, setze null.`
        }
      ]
    } else {
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
      content = [
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: base64 }
        },
        {
          type: 'text',
          text: `Dies ist ein Dokument vom Typ: ${docType}.
Bitte extrahiere folgende Informationen und antworte NUR mit einem JSON-Objekt ohne Markdown:
{
  "expiry_date": "YYYY-MM-DD oder null",
  "issue_date": "YYYY-MM-DD oder null",
  "document_number": "Nummer oder null",
  "full_name": "Name oder null"
}
Wenn ein Wert nicht gefunden wird, setze null.`
        }
      ]
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Fehler' }, { status: 500 })
  }
}