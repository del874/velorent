'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Calendar, MapPin, User, Bike, CreditCard } from 'lucide-react'

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
  updatedAt: string
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

type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: '待确认', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', className: 'bg-blue-100 text-blue-800' },
  active: { label: '使用中', className: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', className: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '已取消', className: 'bg-red-100 text-red-800' },
}

export default function AdminBookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchBooking()
  }, [params.id])

  const fetchBooking = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/bookings/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch booking')

      const data = await response.json()
      setBooking(data.booking)
      setNotes(data.booking.notes || '')
    } catch (error) {
      console.error('Error fetching booking:', error)
      setMessage('加载预订失败')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!booking) return

    try {
      setUpdating(true)
      setMessage('')

      const response = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      const data = await response.json()
      setBooking(data.booking)
      setMessage('状态更新成功')

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating status:', error)
      setMessage('更新失败，请重试')
    } finally {
      setUpdating(false)
    }
  }

  const handleNotesSave = async () => {
    if (!booking) return

    try {
      setUpdating(true)
      setMessage('')

      const response = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) throw new Error('Failed to update notes')

      const data = await response.json()
      setBooking(data.booking)
      setMessage('备注保存成功')

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating notes:', error)
      setMessage('保存失败，请重试')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!booking) return
    if (!confirm('确定要删除这个预订吗？此操作不可撤销。')) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete booking')

      alert('预订已删除')
      router.push('/admin/bookings')
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('删除失败，请重试')
    } finally {
      setUpdating(false)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">预订不存在</p>
        <Link href="/admin/bookings">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    )
  }

  const statusInfo = statusConfig[booking.status as BookingStatus]
  const duration = calculateDuration(booking.startDate, booking.endDate)

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/bookings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">预订详情</h1>
            <p className="mt-2 text-muted-foreground">
              预订号: {booking.id}
            </p>
          </div>
        </div>
        <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-3 ${
            message.includes('成功')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                客户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">姓名</Label>
                <p className="font-medium">{booking.customerName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">邮箱</Label>
                <p className="font-medium">{booking.customerEmail}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">电话</Label>
                <p className="font-medium">{booking.customerPhone}</p>
              </div>
              {booking.user && (
                <div className="pt-3 border-t">
                  <Label className="text-muted-foreground">关联账号</Label>
                  <p className="font-medium">{booking.user.name || booking.user.email}</p>
                  <p className="text-sm text-muted-foreground">{booking.user.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bike Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bike className="h-5 w-5" />
                车型信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div
                  className="h-24 w-24 rounded-lg bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${booking.bike.image})` }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{booking.bike.name}</h3>
                  <p className="text-muted-foreground">{booking.bike.nameEn}</p>
                  <p className="mt-2 text-primary font-semibold">
                    ¥{booking.bike.price}/{booking.bike.priceUnit === 'hour' ? '小时' : '天'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                预订详情
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">开始时间</Label>
                  <p className="font-medium">{formatDate(booking.startDate)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">结束时间</Label>
                  <p className="font-medium">{formatDate(booking.endDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">租用时长</Label>
                  <p className="font-medium">{duration} 小时</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">总价</Label>
                  <p className="font-semibold text-lg text-primary">¥{booking.totalPrice}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <Label className="text-muted-foreground">取车地点</Label>
                    <p className="font-medium">{booking.pickupLocation}</p>
                  </div>
                </div>
                {booking.returnLocation && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <Label className="text-muted-foreground">还车地点</Label>
                      <p className="font-medium">{booking.returnLocation}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>创建时间: {formatDate(booking.createdAt)}</p>
                <p>更新时间: {formatDate(booking.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>状态管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">更改状态</Label>
                <Select
                  value={booking.status}
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待确认</SelectItem>
                    <SelectItem value="confirmed">已确认</SelectItem>
                    <SelectItem value="active">使用中</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">备注</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="添加备注..."
                  disabled={updating}
                />
                <Button
                  onClick={handleNotesSave}
                  disabled={updating}
                  className="mt-2"
                  variant="outline"
                  size="sm"
                >
                  保存备注
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/admin/bookings" className="flex-1">
          <Button variant="outline" className="w-full" disabled={updating}>
            返回列表
          </Button>
        </Link>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={updating}
        >
          删除预订
        </Button>
      </div>
    </div>
  )
}
