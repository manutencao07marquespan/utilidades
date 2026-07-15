'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusIndicator } from '@/components/shared/status-indicator'
import { collectionPointLabels } from '@/lib/validations/laboratorio'

interface Analysis {
  id: string
  analysis_date: string
  shift: string
  collection_point: string
  ph: number | null
  turbidity: number | null
  temperature: number | null
  decantation_efficiency: number | null
}

interface AnalysisTableProps {
  data: Analysis[]
}

function getPHStatus(ph: number | null) {
  if (ph === null) return 'inactive'
  if (ph >= 6 && ph <= 9) return 'ok'
  return 'critical'
}

function getPHStatusLabel(ph: number | null) {
  if (ph === null) return 'Não informado'
  if (ph >= 6 && ph <= 9) return 'Normal'
  return 'Fora da faixa'
}

export function AnalysisTable({ data }: AnalysisTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Turno</TableHead>
            <TableHead>Ponto</TableHead>
            <TableHead>pH</TableHead>
            <TableHead>Turbidez</TableHead>
            <TableHead>Temp.</TableHead>
            <TableHead>Decant.</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                Nenhuma análise encontrada
              </TableCell>
            </TableRow>
          ) : (
            data.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell>
                  {new Date(analysis.analysis_date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>Turno {analysis.shift}</TableCell>
                <TableCell>
                  {collectionPointLabels[analysis.collection_point] || analysis.collection_point}
                </TableCell>
                <TableCell>{analysis.ph?.toFixed(2) ?? '-'}</TableCell>
                <TableCell>{analysis.turbidity?.toFixed(1) ?? '-'} NTU</TableCell>
                <TableCell>{analysis.temperature?.toFixed(1) ?? '-'} °C</TableCell>
                <TableCell>{analysis.decantation_efficiency?.toFixed(1) ?? '-'}%</TableCell>
                <TableCell>
                  <StatusIndicator
                    variant={getPHStatus(analysis.ph) as any}
                    label={getPHStatusLabel(analysis.ph)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
