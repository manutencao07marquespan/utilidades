'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { labAnalysisSchema, type LabAnalysisInput, collectionPointLabels } from '@/lib/validations/laboratorio'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface AnalysisFormProps {
  onSubmit: (data: LabAnalysisInput) => void
  isLoading?: boolean
  defaultValues?: Partial<LabAnalysisInput>
}

export function AnalysisForm({ onSubmit, isLoading, defaultValues }: AnalysisFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LabAnalysisInput>({
    resolver: zodResolver(labAnalysisSchema),
    defaultValues: {
      analysis_date: new Date(),
      shift: 'A',
      ...defaultValues,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Análise</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="analysis_date">Data</Label>
              <Input
                id="analysis_date"
                type="date"
                {...register('analysis_date', { valueAsDate: true })}
              />
              {errors.analysis_date && (
                <p className="text-sm text-red-500">{errors.analysis_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Turno</Label>
              <Select
                value={watch('shift')}
                onValueChange={(value) => setValue('shift', value as 'A' | 'B' | 'C')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Turno A</SelectItem>
                  <SelectItem value="B">Turno B</SelectItem>
                  <SelectItem value="C">Turno C</SelectItem>
                </SelectContent>
              </Select>
              {errors.shift && (
                <p className="text-sm text-red-500">{errors.shift.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collection_point">Ponto de Coleta</Label>
              <Select
                value={watch('collection_point')}
                onValueChange={(value) => setValue('collection_point', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ponto" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(collectionPointLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.collection_point && (
                <p className="text-sm text-red-500">{errors.collection_point.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ph">pH</Label>
              <Input
                id="ph"
                type="number"
                step="0.01"
                placeholder="Ex: 7.2"
                {...register('ph', { valueAsNumber: true })}
              />
              {errors.ph && (
                <p className="text-sm text-red-500">{errors.ph.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="turbidity">Turbidez (NTU)</Label>
              <Input
                id="turbidity"
                type="number"
                step="0.01"
                placeholder="Ex: 15"
                {...register('turbidity', { valueAsNumber: true })}
              />
              {errors.turbidity && (
                <p className="text-sm text-red-500">{errors.turbidity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="Ex: 25.5"
                {...register('temperature', { valueAsNumber: true })}
              />
              {errors.temperature && (
                <p className="text-sm text-red-500">{errors.temperature.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="decantation_efficiency">Eficiência de Decantação (%)</Label>
              <Input
                id="decantation_efficiency"
                type="number"
                step="0.01"
                placeholder="Ex: 95.5"
                {...register('decantation_efficiency', { valueAsNumber: true })}
              />
              {errors.decantation_efficiency && (
                <p className="text-sm text-red-500">{errors.decantation_efficiency.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              placeholder="Observações adicionais..."
              {...register('observations')}
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Análise'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
