'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'

const bikeTypes = [
  { value: 'electric', label: '电动自行车' },
  { value: 'road', label: '公路车' },
  { value: 'city', label: '城市车' },
  { value: 'mountain', label: '山地车' },
  { value: 'folding', label: '折叠车' },
  { value: 'cargo', label: '载货车' },
]

const bikeBrands = ['Velo', 'TrailBlazer', 'EcoRide']

export default function BikeFormPage() {
  const router = useRouter()
  const params = useParams()
  const isEditing = !!params.id

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEditing)

  // Form state
  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [type, setType] = useState('')
  const [brand, setBrand] = useState('')
  const [price, setPrice] = useState('')
  const [priceUnit, setPriceUnit] = useState('hour')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [features, setFeatures] = useState('')
  const [frame, setFrame] = useState('')
  const [gears, setGears] = useState('')
  const [weight, setWeight] = useState('')
  const [range, setRange] = useState('')
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    if (isEditing) {
      fetchBike()
    }
  }, [params.id])

  const fetchBike = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch(`/api/admin/bikes/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch bike')

      const data = await response.json()
      const bike = data.bike

      setName(bike.name)
      setNameEn(bike.nameEn)
      setType(bike.type)
      setBrand(bike.brand)
      setPrice(bike.price.toString())
      setPriceUnit(bike.priceUnit)
      setImage(bike.image)
      setDescription(bike.description || '')
      setFeatures(Array.isArray(bike.features) ? bike.features.join(', ') : bike.features || '')

      // Parse specifications
      if (bike.specifications) {
        const specs = typeof bike.specifications === 'string'
          ? JSON.parse(bike.specifications)
          : bike.specifications
        setFrame(specs.frame || '')
        setGears(specs.gears || '')
        setWeight(specs.weight || '')
        setRange(specs.range || '')
      }

      setAvailable(bike.available)
    } catch (error) {
      console.error('Error fetching bike:', error)
      alert('加载车型失败')
      router.push('/admin/bikes')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !nameEn || !type || !brand || !price || !image) {
      alert('请填写所有必填字段')
      return
    }

    try {
      setLoading(true)

      const featuresArray = features
        .split(',')
        .map((f) => f.trim())
        .filter((f) => f)

      const specifications: any = {}
      if (frame) specifications.frame = frame
      if (gears) specifications.gears = gears
      if (weight) specifications.weight = weight
      if (range) specifications.range = range

      const payload = {
        name,
        nameEn,
        type,
        brand,
        price: parseInt(price),
        priceUnit,
        image,
        description,
        features: featuresArray,
        specifications,
        available,
      }

      const url = isEditing ? `/api/admin/bikes/${params.id}` : '/api/admin/bikes'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save bike')
      }

      router.push('/admin/bikes')
    } catch (error: any) {
      console.error('Error saving bike:', error)
      alert(error.message || '保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/bikes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? '编辑车型' : '添加车型'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isEditing ? '修改车型信息' : '创建新的车型'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  中文名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="城市巡游者 E-1"
                  required
                />
              </div>

              {/* Name English */}
              <div className="space-y-2">
                <Label htmlFor="nameEn">
                  英文名称 <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nameEn"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="City Cruiser E-1"
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  车型类型 <span className="text-destructive">*</span>
                </Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {bikeTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">
                  品牌 <span className="text-destructive">*</span>
                </Label>
                <Select value={brand} onValueChange={setBrand} required>
                  <SelectTrigger id="brand">
                    <SelectValue placeholder="选择品牌" />
                  </SelectTrigger>
                  <SelectContent>
                    {bikeBrands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  价格 <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="50"
                    required
                    min="0"
                  />
                  <Select value={priceUnit} onValueChange={setPriceUnit}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hour">元/小时</SelectItem>
                      <SelectItem value="day">元/天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Image */}
              <div className="space-y-2">
                <Label htmlFor="image">
                  图片 URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/bike.jpg"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="电动助力 • 60km 续航"
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label htmlFor="features">特点（逗号分隔）</Label>
              <Input
                id="features"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="电动助力, 60km续航, 舒适座椅"
              />
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>规格参数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="frame">车架材质</Label>
                <Input
                  id="frame"
                  value={frame}
                  onChange={(e) => setFrame(e.target.value)}
                  placeholder="铝合金"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gears">变速系统</Label>
                <Input
                  id="gears"
                  value={gears}
                  onChange={(e) => setGears(e.target.value)}
                  placeholder="7速"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">重量</Label>
                <Input
                  id="weight"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="18kg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="range">续航里程</Label>
                <Input
                  id="range"
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  placeholder="60km"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="available" className="cursor-pointer">
                立即上架（可租用）
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? '保存中...' : isEditing ? '保存更改' : '创建车型'}
          </Button>
          <Link href="/admin/bikes">
            <Button type="button" variant="outline" disabled={loading}>
              取消
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
