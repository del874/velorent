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
import { ArrowLeft, Calendar, Mail, Phone } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: string
  createdAt: string
  updatedAt: string
  bookings: Array<{
    id: string
    startDate: string
    endDate: string
    totalPrice: number
    status: string
    bike: {
      id: string
      name: string
      nameEn: string
      image: string
    }
  }>
  _count: {
    bookings: number
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

export default function AdminUserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch user')

      const data = await response.json()
      setUser(data.user)
      setName(data.user.name || '')
      setPhone(data.user.phone || '')
      setRole(data.user.role)
    } catch (error) {
      console.error('Error fetching user:', error)
      setMessage('加载用户失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!user) return

    try {
      setUpdating(true)
      setMessage('')

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, role }),
      })

      if (!response.ok) throw new Error('Failed to update user')

      const data = await response.json()
      setUser(data.user)
      setMessage('更新成功')

      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error updating user:', error)
      setMessage('更新失败，请重试')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!confirm('确定要删除这个用户吗？此操作不可撤销。')) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete user')

      alert('用户已删除')
      router.push('/admin/users')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(error.message || '删除失败，请重试')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">用户不存在</p>
        <Link href="/admin/users">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">用户详情</h1>
          <p className="mt-2 text-muted-foreground">
            用户 ID: {user.id}
          </p>
        </div>
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
        {/* Left Column - User Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input id="email" value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={updating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">电话</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={updating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Select value={role} onValueChange={setRole} disabled={updating}>
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">普通用户</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>注册时间: {formatDate(user.createdAt)}</p>
                <p>更新时间: {formatDate(user.updatedAt)}</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex-1"
                >
                  {updating ? '保存中...' : '保存更改'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>统计信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{user._count.bookings}</p>
                  <p className="text-sm text-muted-foreground">总预订数</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-green-600">
                    {user.bookings.filter(b => b.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">已完成</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Bookings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                最近预订
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.bookings.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">暂无预订记录</p>
              ) : (
                <div className="space-y-4">
                  {user.bookings.slice(0, 10).map((booking) => {
                    const statusInfo = statusConfig[booking.status as BookingStatus]
                    return (
                      <Link
                        key={booking.id}
                        href={`/admin/bookings/${booking.id}`}
                        className="block"
                      >
                        <div className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="h-12 w-12 rounded bg-cover bg-center flex-shrink-0"
                                style={{ backgroundImage: `url(${booking.bike.image})` }}
                              />
                              <div>
                                <p className="font-medium text-foreground">{booking.bike.name}</p>
                                <p className="text-sm text-muted-foreground">{booking.bike.nameEn}</p>
                              </div>
                            </div>
                            <Badge className={statusInfo.className}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {formatDate(booking.startDate)}
                            </span>
                            <span className="font-semibold text-primary">
                              ¥{booking.totalPrice}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link href="/admin/users" className="flex-1">
          <Button variant="outline" className="w-full" disabled={updating}>
            返回列表
          </Button>
        </Link>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={updating}
        >
          删除用户
        </Button>
      </div>
    </div>
  )
}
