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
import { Search, Eye, Calendar } from 'lucide-react'

interface Booking {
  id: string
  startDate: string
  endDate: string
  pickupLocation: string
  returnLocation: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  totalPrice: number
  status: string
  notes: string | null
  createdAt: string
  bike: {
    id: string
    name: string
    nameEn: string
    image: string
    price: number
    priceUnit: string
  }
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
  } | null
}

interface BookingsResponse {
  bookings: Booking[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: '待确认', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', className: 'bg-blue-100 text-blue-800' },
  active: { label: '使用中', className: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', className: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '已取消', className: 'bg-red-100 text-red-800' },
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [page, statusFilter, searchQuery])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      })

      if (statusFilter) params.append('status', statusFilter)
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/admin/bookings?${params}`)
      if (!response.ok) throw new Error('Failed to fetch bookings')

      const data: BookingsResponse = await response.json()
      setBookings(data.bookings)
      setTotalPages(data.pagination.totalPages)
      setTotal(data.pagination.total)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
    return hours
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">预订管理</h1>
        <p className="mt-2 text-muted-foreground">
          共 {total} 个预订
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索客户姓名、电话..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1) }}>
              <SelectTrigger>
                <SelectValue placeholder="预订状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="pending">待确认</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
                <SelectItem value="active">使用中</SelectItem>
                <SelectItem value="completed">已完成</SelectItem>
                <SelectItem value="cancelled">已取消</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={() => {
                setStatusFilter('')
                setSearchQuery('')
                setPage(1)
              }}
              disabled={!statusFilter && !searchQuery}
            >
              清除筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">暂无预订数据</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const statusInfo = statusConfig[booking.status as BookingStatus]
            const duration = calculateDuration(booking.startDate, booking.endDate)

            return (
              <Card key={booking.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="mb-4 flex items-center gap-4">
                        <Badge className={statusInfo.className}>
                          {statusInfo.label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          预订号: {booking.id.slice(0, 8)}...
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(booking.createdAt)}
                        </span>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Customer Info */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">客户信息</h3>
                          <div className="space-y-1 text-sm">
                            <p className="text-foreground">{booking.customerName}</p>
                            <p className="text-muted-foreground">{booking.customerEmail}</p>
                            <p className="text-muted-foreground">{booking.customerPhone}</p>
                            {booking.user && (
                              <p className="text-xs text-muted-foreground">
                                账号: {booking.user.name || booking.user.email}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bike Info */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">车型信息</h3>
                          <div className="flex items-start gap-3">
                            <div
                              className="h-16 w-16 rounded bg-cover bg-center flex-shrink-0"
                              style={{ backgroundImage: `url(${booking.bike.image})` }}
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{booking.bike.name}</p>
                              <p className="text-sm text-muted-foreground">{booking.bike.nameEn}</p>
                              <p className="text-sm text-primary">
                                ¥{booking.bike.price}/{booking.bike.priceUnit === 'hour' ? '小时' : '天'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">预订详情</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">取车:</span>
                              <span className="text-foreground">{formatDate(booking.startDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">还车:</span>
                              <span className="text-foreground">{formatDate(booking.endDate)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">时长:</span>
                              <span className="text-foreground">{duration} 小时</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">地点:</span>
                              <span className="text-foreground">{booking.pickupLocation}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">总价:</span>
                              <span className="font-semibold text-primary">¥{booking.totalPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {booking.notes && (
                        <div className="mt-4 p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">备注: </span>
                            {booking.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      <Link href={`/admin/bookings/${booking.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          查看
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
