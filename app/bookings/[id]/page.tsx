'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getBooking, cancelBooking } from '@/lib/api';
import { Booking } from '@/types';
import { useAuth } from '@/context/auth-context';

type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

const statusConfig: Record<BookingStatus, { label: string; className: string; icon: string }> = {
  pending: { label: '待确认', className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
  confirmed: { label: '已确认', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: '✅' },
  active: { label: '使用中', className: 'bg-green-100 text-green-800 border-green-200', icon: '🚴' },
  completed: { label: '已完成', className: 'bg-gray-100 text-gray-800 border-gray-200', icon: '✓' },
  cancelled: { label: '已取消', className: 'bg-red-100 text-red-800 border-red-200', icon: '✕' },
};

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);

  // Check if this is a new booking confirmation
  useEffect(() => {
    if (router.query?.confirmed === 'true') {
      setJustConfirmed(true);
    }
  }, [router.query]);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchBooking() {
      if (!params.id) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getBooking(params.id as string);

        // Verify booking belongs to current user
        if (data.userId && data.userId !== user.userId) {
          setError('无权查看此预订');
          return;
        }

        setBooking(data);
      } catch (err: any) {
        setError(err.message || '无法加载预订详情');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [params.id, user, router]);

  const handleCancelBooking = async () => {
    if (!booking) return;

    if (!confirm('确定要取消这个预订吗？')) {
      return;
    }

    try {
      setCancelling(true);
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
    } catch (err: any) {
      alert(err.message || '取消预订失败');
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    if (hours < 24) {
      return `${hours} 小时`;
    }
    return `${Math.round(hours / 24)} 天`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-4 text-6xl">❌</div>
            <h1 className="mb-4 text-2xl font-bold text-foreground">加载失败</h1>
            <p className="mb-6 text-muted-foreground">{error || '未找到预订记录'}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push('/bookings')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                我的预订
              </Button>
              <Button variant="outline" onClick={() => router.push('/bikes')}>
                浏览车型
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = booking.status as BookingStatus;
  const config = statusConfig[status];
  const canCancel = ['pending', 'confirmed'].includes(status);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-10">
          {/* Success Message */}
          {justConfirmed && (
            <div className="mb-8 rounded-lg bg-green-50 border border-green-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 text-4xl">🎉</div>
                <div className="flex-1">
                  <h2 className="mb-2 text-xl font-bold text-green-900">预订成功！</h2>
                  <p className="text-green-700">
                    感谢您的预订。我们已收到您的订单，预订确认号是 <span className="font-mono font-bold">{booking.id.slice(0, 8)}</span>
                  </p>
                  <p className="mt-2 text-sm text-green-600">
                    请在预订时间到达取车地点，出示您的身份证件即可取车。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <div className="mb-6">
            <Link href="/bookings" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              ← 返回我的预订
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Booking Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-foreground">预订详情</h2>
                    <Badge className={`text-sm px-4 py-2 ${config.className}`}>
                      <span className="mr-1">{config.icon}</span>
                      {config.label}
                    </Badge>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">预订号</span>
                        <p className="font-mono font-medium">{booking.id.slice(0, 8)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">下单时间</span>
                        <p className="font-medium">{formatDate(booking.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bike Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold text-foreground">车型信息</h3>
                  <div className="flex gap-6">
                    <div
                      className="h-40 w-56 flex-shrink-0 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${booking.bike.image})` }}
                    />
                    <div className="flex-1">
                      <h4 className="mb-2 text-xl font-bold text-foreground">{booking.bike.name}</h4>
                      <p className="mb-3 text-sm text-muted-foreground">{booking.bike.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.bike.features?.slice(0, 4).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rental Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold text-foreground">租赁信息</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">取车时间</span>
                        <p className="font-medium text-foreground">{formatDate(booking.startDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">还车时间</span>
                        <p className="font-medium text-foreground">{formatDate(booking.endDate)}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm text-muted-foreground">租赁时长</span>
                        <p className="font-medium text-foreground">{calculateDuration(booking.startDate, booking.endDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">取车地点</span>
                        <p className="font-medium text-foreground">{booking.pickupLocation}</p>
                      </div>
                      {booking.returnLocation && booking.returnLocation !== booking.pickupLocation && (
                        <div>
                          <span className="text-sm text-muted-foreground">还车地点</span>
                          <p className="font-medium text-foreground">{booking.returnLocation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-bold text-foreground">联系人信息</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <span className="text-sm text-muted-foreground">姓名</span>
                      <p className="font-medium text-foreground">{booking.customerName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">邮箱</span>
                      <p className="font-medium text-foreground">{booking.customerEmail}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">电话</span>
                      <p className="font-medium text-foreground">{booking.customerPhone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Price Summary & Actions */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h3 className="mb-6 text-lg font-bold text-foreground">价格明细</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">车型单价</span>
                      <span className="font-medium">¥{booking.bike.price} /{booking.bike.priceUnit === 'hour' ? '小时' : '天'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">租赁时长</span>
                      <span className="font-medium">{calculateDuration(booking.startDate, booking.endDate)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">总计</span>
                        <span className="text-2xl font-bold text-primary">¥{booking.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Link href={`/bikes/${booking.bike.id}`} className="block">
                      <Button variant="outline" className="w-full" size="lg">
                        再次预订此车型
                      </Button>
                    </Link>

                    {canCancel && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        size="lg"
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                      >
                        {cancelling ? '取消中...' : '取消预订'}
                      </Button>
                    )}

                    <Link href="/bookings" className="block">
                      <Button variant="ghost" className="w-full" size="lg">
                        查看我的所有预订
                      </Button>
                    </Link>
                  </div>

                  {/* Help Text */}
                  <div className="mt-6 rounded-lg bg-muted/50 p-4 text-sm">
                    <p className="text-muted-foreground">
                      <strong>需要帮助？</strong>
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      如需修改或取消预订，请联系客服或访问我的预订页面。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
