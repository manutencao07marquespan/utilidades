'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PageHeader } from '@/components/shared/page-header'
import { AnalysisForm } from '@/components/laboratorio/analysis-form'
import type { LabAnalysisInput } from '@/lib/validations/laboratorio'
import { toast } from 'sonner'

export default function NovaAnalisePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(data: LabAnalysisInput) {
    setLoading(true)

    const { error } = await supabase.from('lab_analyses').insert({
      analysis_date: data.analysis_date.toISOString().split('T')[0],
      shift: data.shift,
      collection_point: data.collection_point,
      ph: data.ph,
      turbidity: data.turbidity,
      temperature: data.temperature,
      decantation_efficiency: data.decantation_efficiency,
      observations: data.observations,
    })

    if (error) {
      toast.error('Erro ao salvar análise')
      console.error(error)
    } else {
      toast.success('Análise salva com sucesso')
      router.push('/laboratorio')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nova Análise"
        description="Registrar nova análise de qualidade"
      />
      <AnalysisForm onSubmit={onSubmit} isLoading={loading} />
    </div>
  )
}
