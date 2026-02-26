'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bike, Calendar, Users, TrendingUp } from 'lucide-react'

interface Stats {
  totalBookings: number
  totalUsers: number
  activeUsers: number
  totalBikes: number
  availableBikes: number
  totalRevenue: number
  recentBookings: number
  statusCounts: Record<string, number>
  popularBikes: Array<{
    id: string
    name: string
    nameEn: string
    image: string
    bookingCount: number
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalBikes: 0,
    availableBikes: 0,
    totalRevenue: 0,
    recentBookings: 0,
    statusCounts: {},
    popularBikes: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')

      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: '总预订数',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: '总收入 (¥)',
      value: stats.totalRevenue.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: '活跃用户',
      value: stats.activeUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: '可租车型',
      value: stats.availableBikes,
      icon: Bike,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">数据概览</h1>
        <p className="mt-2 text-muted-foreground">
          欢迎回来！这是您的运营数据概览。
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Booking Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>预订状态概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.statusCounts.pending || 0}</p>
              <p className="text-sm text-muted-foreground">待确认</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.statusCounts.confirmed || 0}</p>
              <p className="text-sm text-muted-foreground">已确认</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.statusCounts.active || 0}</p>
              <p className="text-sm text-muted-foreground">使用中</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.statusCounts.completed || 0}</p>
              <p className="text-sm text-muted-foreground">已完成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.statusCounts.cancelled || 0}</p>
              <p className="text-sm text-muted-foreground">已取消</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/bikes/new" className="block text-sm text-primary hover:underline">
              + 添加新车型
            </Link>
            <Link href="/admin/bookings?status=pending" className="block text-sm text-primary hover:underline">
              查看待处理预订 ({stats.statusCounts.pending || 0})
            </Link>
            <Link href="/admin/users" className="block text-sm text-primary hover:underline">
              管理用户
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近7天</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.recentBookings}</p>
            <p className="text-sm text-muted-foreground">新预订</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-foreground">运行正常</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Bikes */}
      {stats.popularBikes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>热门车型排行</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularBikes.map((bike, index) => (
                <Link
                  key={bike.id}
                  href={`/admin/bikes/${bike.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div
                    className="h-12 w-12 rounded bg-cover bg-center"
                    style={{ backgroundImage: `url(${bike.image})` }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{bike.name}</p>
                    <p className="text-sm text-muted-foreground">{bike.nameEn}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{bike.bookingCount}</p>
                    <p className="text-xs text-muted-foreground">次预订</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
