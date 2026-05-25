import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const docType = formData.get('doc_type') as string

    if (!file) return NextResponse.json({ error: 'Keine Datei' }, { status: 400 })

    // PDF مش مدعوم في Claude Vision
    if (file.type === 'application/pdf') {
      return NextResponse.json({ error: 'PDF wird nicht unterstützt. Bitte laden Sie ein Foto (JPG oder PNG) hoch.' }, { status: 400 })
    }

    // تأكد إن الـ media type صح
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Nur Bilder (JPG, PNG, WEBP) werden unterstützt.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
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
      ]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Fehler' }, { status: 500 })
  }
}