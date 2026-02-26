'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Edit, Trash2, Power } from 'lucide-react'

interface Bike {
  id: string
  name: string
  nameEn: string
  type: string
  brand: string
  price: number
  priceUnit: string
  image: string
  available: boolean
  createdAt: string
}

interface BikesResponse {
  bikes: Bike[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const bikeTypes = [
  'electric',
  'road',
  'city',
  'mountain',
  'folding',
  'cargo',
]

const bikeBrands = ['Velo', 'TrailBlazer', 'EcoRide']

export default function AdminBikesPage() {
  const router = useRouter()
  const [bikes, setBikes] = useState<Bike[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [typeFilter, setTypeFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchBikes()
  }, [page, typeFilter, brandFilter, searchQuery])

  const fetchBikes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })

      if (typeFilter) params.append('type', typeFilter)
      if (brandFilter) params.append('brand', brandFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/admin/bikes?${params}`)
      if (!response.ok) throw new Error('Failed to fetch bikes')

      const data: BikesResponse = await response.json()
      setBikes(data.bikes)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch (error) {
      console.error('Error fetching bikes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAvailable = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/bikes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentStatus }),
      })

      if (!response.ok) throw new Error('Failed to update bike')

      fetchBikes()
    } catch (error) {
      console.error('Error toggling availability:', error)
      alert('更新失败，请重试')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个车型吗？此操作不可撤销。')) {
      return
    }

    try {
      setDeleting(true)
      setDeleteId(id)

      const response = await fetch(`/api/admin/bikes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete bike')
      }

      fetchBikes()
    } catch (error: any) {
      console.error('Error deleting bike:', error)
      alert(error.message || '删除失败，请重试')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">车型管理</h1>
          <p className="mt-2 text-muted-foreground">
            共 {total} 个车型
          </p>
        </div>
        <Link href="/admin/bikes/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            添加车型
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索车型..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={(value) => { setTypeFilter(value); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="车型类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部类型</SelectItem>
                {bikeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Brand Filter */}
            <Select value={brandFilter} onValueChange={(value) => { setBrandFilter(value); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="品牌" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部品牌</SelectItem>
                {bikeBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setTypeFilter('')
                setBrandFilter('')
                setSearchQuery('')
                setPage(1)
              }}
              disabled={!typeFilter && !brandFilter && !searchQuery}
            >
              清除筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bikes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : bikes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">暂无车型数据</p>
            <Link href="/admin/bikes/new" className="mt-4 inline-block">
              <Button>添加第一个车型</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bikes.map((bike) => (
            <Card key={bike.id} className="overflow-hidden">
              <div
                className="h-48 w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${bike.image})` }}
              />
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{bike.name}</h3>
                    <p className="text-sm text-muted-foreground">{bike.nameEn}</p>
                  </div>
                  <Badge variant={bike.available ? 'default' : 'secondary'}>
                    {bike.available ? '可租' : '已下架'}
                  </Badge>
                </div>

                <div className="mb-4 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">类型:</span>
                    <span className="font-medium">{bike.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">品牌:</span>
                    <span className="font-medium">{bike.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">价格:</span>
                    <span className="font-medium text-primary">
                      ¥{bike.price}/{bike.priceUnit === 'hour' ? '小时' : '天'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/bikes/${bike.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      编辑
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailable(bike.id, bike.available)}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(bike.id)}
                    disabled={deleting && deleteId === bike.id}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  )
}
