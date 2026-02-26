'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bike, Calendar, Users, TrendingUp } from 'lucide-react'

interface Stats {
  totalBookings: number
  totalRevenue: number
  activeUsers: number
  availableBikes: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    availableBikes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch actual stats from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalBookings: 156,
        totalRevenue: 45680,
        activeUsers: 89,
        availableBikes: 24,
      })
      setLoading(false)
    }, 500)
  }, [])

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

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/admin/bikes/new" className="block text-sm text-primary hover:underline">
              + 添加新车型
            </a>
            <a href="/admin/bookings?status=pending" className="block text-sm text-primary hover:underline">
              查看待处理预订
            </a>
            <a href="/admin/users" className="block text-sm text-primary hover:underline">
              管理用户
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              功能开发中...
            </p>
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
    </div>
  )
}
