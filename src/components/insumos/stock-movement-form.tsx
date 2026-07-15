'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ArrowUpDown } from 'lucide-react'

interface Product {
  id: string
  name: string
  unit: string
  current_stock: number
}

interface StockMovementFormProps {
  onSuccess?: () => void
}

export function StockMovementForm({ onSuccess }: StockMovementFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    product_id: '',
    movement_type: 'entry',
    quantity: '',
    unit_price: '',
    reason: '',
    reference_document: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data } = await supabase
      .from('products')
      .select('id, name, unit, current_stock')
      .eq('is_active', true)
      .order('name')

    if (data) {
      setProducts(data as Product[])
    }
  }

  const selectedProduct = products.find(p => p.id === formData.product_id)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const user = (await supabase.auth.getUser()).data.user

      // Create stock movement
      const { error: movementError } = await supabase.from('stock_movements').insert({
        product_id: formData.product_id,
        movement_type: formData.movement_type,
        quantity: parseFloat(formData.quantity),
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        reason: formData.reason || null,
        reference_document: formData.reference_document || null,
        performed_by: user?.id,
        movement_date: new Date().toISOString(),
      })

      if (movementError) throw movementError

      // Update product stock
      const quantity = parseFloat(formData.quantity)
      let newStock = selectedProduct?.current_stock || 0

      if (formData.movement_type === 'entry') {
        newStock += quantity
      } else if (formData.movement_type === 'exit') {
        newStock -= quantity
      } else {
        // adjustment
        newStock = quantity
      }

      const { error: updateError } = await supabase
        .from('products')
        .update({ current_stock: Math.max(0, newStock) })
        .eq('id', formData.product_id)

      if (updateError) throw updateError

      setSuccess('Movimentação registrada com sucesso!')
      setFormData({
        product_id: '',
        movement_type: 'entry',
        quantity: '',
        unit_price: '',
        reason: '',
        reference_document: '',
      })
      fetchProducts() // Refresh stock levels
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar movimentação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-[#FFC107]" />
          Movimentação de Estoque
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="bg-[#DC3545]/10 border-[#DC3545]/30 text-[#DC3545]">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-[#28A745]/10 border-[#28A745]/30 text-[#28A745]">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_id">Produto *</Label>
              <select
                id="product_id"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="">Selecione o produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Estoque: {product.current_stock} {product.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="movement_type">Tipo *</Label>
              <select
                id="movement_type"
                value={formData.movement_type}
                onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus-visible:border-[#28A745] focus-visible:ring-[#28A745]/30"
              >
                <option value="entry">Entrada</option>
                <option value="exit">Saída</option>
                <option value="adjustment">Ajuste</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade * {selectedProduct && `(${selectedProduct.unit})`}</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit_price">Preço Unitário (R$)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_document">Documento Ref.</Label>
              <Input
                id="reference_document"
                value={formData.reference_document}
                onChange={(e) => setFormData({ ...formData, reference_document: e.target.value })}
                placeholder="NF, OS, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Motivo da movimentação"
              />
            </div>
          </div>

          {/* Preview do estoque */}
          {selectedProduct && formData.quantity && (
            <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground">Estoque atual: <span className="font-medium text-foreground">{selectedProduct.current_stock} {selectedProduct.unit}</span></p>
              <p className="text-sm text-muted-foreground">
                Estoque após: <span className={`font-medium ${
                  formData.movement_type === 'entry' ? 'text-[#28A745]' :
                  formData.movement_type === 'exit' ? 'text-[#DC3545]' :
                  'text-[#FFC107]'
                }`}>
                  {formData.movement_type === 'entry'
                    ? selectedProduct.current_stock + parseFloat(formData.quantity || '0')
                    : formData.movement_type === 'exit'
                    ? Math.max(0, selectedProduct.current_stock - parseFloat(formData.quantity || '0'))
                    : parseFloat(formData.quantity || '0')
                  } {selectedProduct.unit}
                </span>
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !formData.product_id}
            className="btn-gradient-green text-white border-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Registrar Movimentação'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
