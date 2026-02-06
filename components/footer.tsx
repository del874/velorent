import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 px-4 py-12 mt-20 md:px-10">
      <div className="mx-auto max-w-[1280px] flex flex-col justify-between gap-10 md:flex-row">
        <div className="max-w-xs">
          <div className="mb-4 flex items-center gap-3 text-primary">
            <span className="text-2xl">🚴</span>
            <h2 className="text-xl font-bold text-foreground">VeloRent</h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            自2021年起，致力于让城市交通更清洁、更健康、更有趣。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-foreground">公司</h4>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              关于我们
            </Link>
            <Link href="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              加入我们
            </Link>
            <Link href="/news" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              新闻动态
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-foreground">产品</h4>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              价格
            </Link>
            <Link href="/locations" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              站点分布
            </Link>
            <Link href="/app" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              下载App
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold text-foreground">支持</h4>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              帮助中心
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              联系我们
            </Link>
            <Link href="/safety" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              安全保障
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-[1280px] flex flex-col justify-between items-center gap-4 border-t pt-8 sm:flex-row">
        <p className="text-xs text-muted-foreground">© 2024 VeloRent Inc. 保留所有权利。</p>
        <div className="flex gap-6">
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <span className="text-lg">🌐</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <span className="text-lg">💬</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
