'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface PHData {
  date: string
  ph: number
  turbidity: number
  point: string
}

interface PHTurbidityChartProps {
  data: PHData[]
}

export function PHTurbidityChart({ data }: PHTurbidityChartProps) {
  // Group data by collection point
  const points = [...new Set(data.map((d) => d.point))]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Tendência de pH e Turbidez
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="ph" orientation="left" domain={[0, 14]} />
              <YAxis yAxisId="turbidity" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="ph"
                type="monotone"
                dataKey="ph"
                name="pH"
                stroke="#1A3A5A"
                strokeWidth={2}
                dot={{ fill: '#1A3A5A' }}
              />
              <Line
                yAxisId="turbidity"
                type="monotone"
                dataKey="turbidity"
                name="Turbidez (NTU)"
                stroke="#28A745"
                strokeWidth={2}
                dot={{ fill: '#28A745' }}
              />
              {/* pH reference lines */}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#1A3A5A] mr-2" />
            <span>pH</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-[#28A745] mr-2" />
            <span>Turbidez</span>
          </div>
          <div className="text-muted-foreground text-xs">
            Faixa ideal pH: 6.0 - 9.0
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
