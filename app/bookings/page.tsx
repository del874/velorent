'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { getBookings, cancelBooking } from '@/lib/api';
import { Booking } from '@/types';

type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: '待确认', className: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: '已确认', className: 'bg-blue-100 text-blue-800' },
  active: { label: '使用中', className: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', className: 'bg-gray-100 text-gray-800' },
  cancelled: { label: '已取消', className: 'bg-red-100 text-red-800' },
};

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function fetchBookings() {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const data = await getBookings({ userId: user.userId });
        setBookings(data);
      } catch (err) {
        setError('无法加载预订记录');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [user, authLoading, router]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('确定要取消这个预订吗？')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      await cancelBooking(bookingId);

      // Update local state
      setBookings(bookings.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled' as BookingStatus }
          : booking
      ));
    } catch (err: any) {
      alert(err.message || '取消预订失败');
    } finally {
      setCancellingId(null);
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

  if (authLoading || loading) {
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

  if (error && bookings.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">加载失败</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/bikes')}>返回车型列表</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-10">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">我的预订</h1>
            <p className="text-muted-foreground">查看和管理您的所有预订记录</p>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mb-4 text-6xl">📋</div>
                <h2 className="mb-2 text-xl font-bold text-foreground">暂无预订记录</h2>
                <p className="mb-6 text-muted-foreground">您还没有任何预订，快去选择心仪的车型吧！</p>
                <Button onClick={() => router.push('/bikes')} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  浏览车型
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => {
                const status = booking.status as BookingStatus;
                const config = statusConfig[status];
                const canCancel = ['pending', 'confirmed'].includes(status);

                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent
                      className="p-6"
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                    >
                      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        {/* Left: Bike Info */}
                        <div className="flex-1">
                          <div className="mb-4 flex items-start gap-4">
                            <div
                              className="h-24 w-32 flex-shrink-0 rounded-lg bg-cover bg-center"
                              style={{ backgroundImage: `url(${booking.bike.image})` }}
                            />
                            <div className="flex-1">
                              <div className="mb-2 flex items-center gap-2">
                                <h3 className="text-xl font-bold text-foreground">{booking.bike.name}</h3>
                                <Badge className={config.className}>{config.label}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{booking.bike.description}</p>
                              <p className="mt-2 text-xs text-primary">点击查看详情 →</p>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <span className="text-sm text-muted-foreground">取车时间</span>
                              <p className="font-medium text-foreground">{formatDate(booking.startDate)}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">还车时间</span>
                              <p className="font-medium text-foreground">{formatDate(booking.endDate)}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">租赁时长</span>
                              <p className="font-medium text-foreground">{calculateDuration(booking.startDate, booking.endDate)}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">取车地点</span>
                              <p className="font-medium text-foreground">{booking.pickupLocation}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">联系人</span>
                              <p className="font-medium text-foreground">{booking.customerName}</p>
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">联系电话</span>
                              <p className="font-medium text-foreground">{booking.customerPhone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Right: Price & Actions */}
                        <div className="flex flex-col items-end gap-4 md:min-w-[200px]">
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">总价</span>
                            <p className="text-2xl font-bold text-primary">¥{booking.totalPrice}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/bikes/${booking.bike.id}`);
                              }}
                            >
                              再次预订
                            </Button>
                            {canCancel && (
                              <Button
                                variant="destructive"
                                size="default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelBooking(booking.id);
                                }}
                                disabled={cancellingId === booking.id}
                              >
                                {cancellingId === booking.id ? '取消中...' : '取消预订'}
                              </Button>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground text-right">
                            预订时间: {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
