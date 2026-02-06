import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { bikes } from '@/data/bikes';

export default function HomePage() {
  const featuredBikes = bikes.slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[1280px] px-4 py-8 md:px-10 lg:px-20">
          {/* Hero Section */}
          <div className="@container">
            <div className="flex flex-col items-center gap-6 py-10 @[480px]:gap-12 @[864px]:flex-row">
              <div
                className="w-full rounded-xl bg-cover bg-center shadow-xl @[480px]:h-auto @[480px]:min-w-[400px] @[864px]:w-1/2"
                style={{
                  aspectRatio: '16/10',
                  backgroundImage: 'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80)',
                }}
              />

              <div className="flex w-full flex-col gap-8 @[480px]:min-w-[400px] @[864px]:w-1/2 @[864px]:justify-center">
                <div className="flex flex-col gap-4 text-left">
                  <h1 className="text-4xl font-black leading-tight tracking-tight text-foreground @[480px]:text-6xl">
                    随心而行，畅游城市
                  </h1>
                  <p className="text-base leading-relaxed text-muted-foreground @[480px]:text-lg">
                    随时随地租赁最适合您的自行车。享受经济、环保且便捷的出行方式。立即开启您的城市探险，无需承担维护压力。
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 rounded-xl border bg-card p-2 shadow-sm md:flex-row">
                    <div className="flex h-12 flex-1 items-center px-4">
                      <span className="mr-3 text-muted-foreground">📍</span>
                      <Input
                        type="text"
                        placeholder="选择城市"
                        className="w-full border-none bg-transparent p-0 focus-visible:ring-0"
                      />
                    </div>
                    <div className="hidden h-8 w-px bg-border self-center md:block" />
                    <div className="flex h-12 flex-1 items-center px-4">
                      <span className="mr-3 text-muted-foreground">📅</span>
                      <Input
                        type="date"
                        placeholder="起始日期"
                        className="w-full border-none bg-transparent p-0 focus-visible:ring-0"
                      />
                    </div>
                    <div className="hidden h-8 w-px bg-border self-center md:block" />
                    <div className="flex h-12 flex-1 items-center px-4">
                      <span className="mr-3 text-muted-foreground">📆</span>
                      <Input
                        type="date"
                        placeholder="结束日期"
                        className="w-full border-none bg-transparent p-0 focus-visible:ring-0"
                      />
                    </div>
                    <Button className="h-12 whitespace-nowrap bg-primary text-primary-foreground hover:brightness-105">
                      立即租赁
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mt-20 text-center">
            <h2 className="pb-2 text-3xl font-bold leading-tight text-foreground">如何运作</h2>
            <div className="mx-auto h-1 w-16 rounded-full bg-primary" />
          </div>

          <div className="grid grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center gap-6 rounded-xl border bg-card p-8 text-center transition-colors hover:border-primary">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="text-3xl">🚴</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold leading-tight text-foreground">1. 选择单车</h3>
                <p className="text-base leading-normal text-muted-foreground">
                  从我们丰富的城市车、公路车或电助力单车中，挑选最适合您的坐骑。
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 rounded-xl border bg-card p-8 text-center transition-colors hover:border-primary">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="text-3xl">📱</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold leading-tight text-foreground">2. 扫码开锁</h3>
                <p className="text-base leading-normal text-muted-foreground">
                  通过手机应用查看附近站点，扫描车身二维码即可瞬间解锁出发。
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 rounded-xl border bg-card p-8 text-center transition-colors hover:border-primary">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                <span className="text-3xl">🌆</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold leading-tight text-foreground">3. 尽情骑行</h3>
                <p className="text-base leading-normal text-muted-foreground">
                  以自己的节奏探索城市美景，完成后可将单车归还至任意指定站点。
                </p>
              </div>
            </div>
          </div>

          {/* Featured Bikes Section */}
          <div className="mt-20">
            <div className="flex justify-between items-end pb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">热门车型推荐</h2>
                <p className="text-muted-foreground">为您推荐最适合城市穿梭的精选单车</p>
              </div>
              <Link href="/bikes" className="text-sm font-bold text-primary hover:underline">
                查看全部车型 →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredBikes.map((bike) => (
                <div
                  key={bike.id}
                  className="group overflow-hidden rounded-xl border bg-card"
                >
                  <div
                    className="h-48 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${bike.image})` }}
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-foreground">{bike.name}</h4>
                    <p className="text-sm text-muted-foreground">{bike.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="font-bold text-primary">
                        ¥{bike.price}/{bike.priceUnit === 'hour' ? '小时' : '天'}
                      </span>
                      <Link href={`/bikes/${bike.id}`}>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
