'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { locations } from '@/data/bikes';
import { useStore } from '@/context/store-context';
import { useAuth } from '@/context/auth-context';
import { getBike, createBooking } from '@/lib/api';
import { Bike } from '@/types';

export default function BikeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { cart, addToCart, updateCartDates, updateCartLocation, clearCart } = useStore();
  const { user } = useAuth();
  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchBike() {
      try {
        setLoading(true);
        setError(null);
        const id = params.id as string;
        const data = await getBike(id);
        setBike(data);
      } catch (err) {
        setError('Failed to load bike details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBike();
  }, [params.id]);

  // Calculate total price
  const calculateTotal = () => {
    if (!bike || !startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const hours = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)));
    return bike.price * hours;
  };

  const totalPrice = calculateTotal();

  const handleConfirmBooking = async () => {
    // Check if user is logged in
    if (!user) {
      alert('请先登录后再进行预订');
      router.push('/login');
      return;
    }

    if (!bike || !startDate || !endDate || !pickupLocation || !customerName || !customerEmail || !customerPhone) {
      alert('请填写所有必填信息');
      return;
    }

    try {
      setSubmitting(true);
      await createBooking({
        bikeId: bike.id,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        pickupLocation,
        returnLocation: pickupLocation,
        customerName,
        customerEmail,
        customerPhone,
        totalPrice,
        userId: user.userId,
      });

      alert(`预订成功！\n\n车型: ${bike.name}\n取车时间: ${startDate}\n还车时间: ${endDate}\n取车地点: ${pickupLocation}\n总价: ¥${totalPrice}`);

      clearCart();
      router.push('/bikes');
    } catch (err: any) {
      alert(err.message || '预订失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading bike details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !bike) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">未找到该车型</h1>
            <Link href="/bikes" className="mt-4 inline-block text-primary hover:underline">
              返回车型列表
            </Link>
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
          <div className="mb-6">
            <Link href="/bikes" className="text-sm text-muted-foreground hover:text-primary">
              ← 返回车型列表
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Bike Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div
                    className="mb-6 h-64 w-full rounded-xl bg-cover bg-center md:h-96"
                    style={{ backgroundImage: `url(${bike.image})` }}
                  />

                  <div className="mb-6">
                    <h1 className="mb-2 text-3xl font-bold text-foreground">{bike.name}</h1>
                    <p className="text-lg text-muted-foreground">{bike.nameEn}</p>
                    <p className="mt-2 text-muted-foreground">{bike.description}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h2 className="mb-3 text-xl font-bold text-foreground">车辆特点</h2>
                    <div className="flex flex-wrap gap-2">
                      {bike.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="mb-6">
                    <h2 className="mb-3 text-xl font-bold text-foreground">规格参数</h2>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4">
                      <div>
                        <span className="text-sm text-muted-foreground">车架材质</span>
                        <p className="font-medium text-foreground">{bike.specifications.frame}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">变速系统</span>
                        <p className="font-medium text-foreground">{bike.specifications.gears}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">重量</span>
                        <p className="font-medium text-foreground">{bike.specifications.weight}</p>
                      </div>
                      {bike.specifications.range && (
                        <div>
                          <span className="text-sm text-muted-foreground">续航里程</span>
                          <p className="font-medium text-foreground">{bike.specifications.range}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-3xl font-bold text-primary">¥{bike.price}</span>
                        <span className="text-muted-foreground">
                          /{bike.priceUnit === 'hour' ? '小时' : '天'}
                        </span>
                      </div>
                      <Button
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => {
                          addToCart(bike);
                          document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        立即预订
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6" id="booking-form">
                  <h2 className="mb-6 text-xl font-bold text-foreground">预订详情</h2>

                  <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                    {/* Start Date */}
                    <div className="space-y-2">
                      <Label htmlFor="startDate">
                        起始日期 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          if (cart) updateCartDates(new Date(e.target.value), new Date(endDate));
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                      <Label htmlFor="endDate">
                        结束日期 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          if (cart) updateCartDates(new Date(startDate), new Date(e.target.value));
                        }}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    {/* Pickup Location */}
                    <div className="space-y-2">
                      <Label htmlFor="location">
                        取车地点 <span className="text-destructive">*</span>
                      </Label>
                      <select
                        id="location"
                        value={pickupLocation}
                        onChange={(e) => {
                          setPickupLocation(e.target.value);
                          if (cart) updateCartLocation(e.target.value);
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        required
                      >
                        <option value="">选择取车地点</option>
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Customer Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        姓名 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="请输入您的姓名"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                    </div>

                    {/* Customer Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        邮箱 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        required
                      />
                    </div>

                    {/* Customer Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        电话 <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="请输入您的电话号码"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                      />
                    </div>

                    {/* Total Price */}
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-muted-foreground">总计</span>
                        <span className="text-2xl font-bold text-primary">¥{totalPrice}</span>
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <Button
                      type="button"
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      size="lg"
                      onClick={handleConfirmBooking}
                      disabled={submitting}
                    >
                      {submitting ? '提交中...' : `确认预订 ¥${totalPrice}`}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      点击确认即表示您同意我们的服务条款和隐私政策
                    </p>
                  </form>
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
