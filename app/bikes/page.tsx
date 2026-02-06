'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { bikeTypes, brands } from '@/data/bikes';
import { useStore } from '@/context/store-context';
import { getBikes } from '@/lib/api';
import { Bike, BikeType } from '@/types';

export default function BikesPage() {
  const { searchQuery, setSearchQuery, filters, setFilters, addToCart } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bikesPerPage = 6;

  // Fetch bikes from API
  useEffect(() => {
    async function fetchBikes() {
      try {
        setLoading(true);
        setError(null);
        const data = await getBikes({
          search: searchQuery || undefined,
          type: filters.types.length > 0 ? filters.types[0] : undefined,
          brand: filters.brands.length > 0 ? filters.brands[0] : undefined,
          minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          maxPrice: filters.priceRange[1] < 100 ? filters.priceRange[1] : undefined,
        });
        setBikes(data);
      } catch (err) {
        setError('Failed to load bikes. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBikes();
  }, [searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(bikes.length / bikesPerPage);
  const startIndex = (currentPage - 1) * bikesPerPage;
  const endIndex = startIndex + bikesPerPage;
  const currentBikes = bikes.slice(startIndex, endIndex);

  const handleTypeToggle = (type: BikeType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    setFilters({ ...filters, types: newTypes });
    setCurrentPage(1);
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    setFilters({ ...filters, brands: newBrands });
    setCurrentPage(1);
  };

  const handleRentNow = (bike: Bike) => {
    addToCart(bike);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading bikes...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button
              className="mt-4"
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
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
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">车型选择</h1>
            <p className="text-muted-foreground">浏览我们的自行车系列，找到最适合您的车型</p>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 rounded-xl border bg-card p-6">
                <h2 className="mb-4 font-bold text-foreground">筛选</h2>

                {/* Search */}
                <div className="mb-6">
                  <Label className="mb-2 text-sm font-medium">搜索</Label>
                  <Input
                    type="text"
                    placeholder="搜索车型..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* Bike Types */}
                <div className="mb-6">
                  <Label className="mb-3 text-sm font-medium">车型</Label>
                  <div className="space-y-2">
                    {bikeTypes.map((type) => (
                      <div key={type.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={type.value}
                          checked={filters.types.includes(type.value as BikeType)}
                          onCheckedChange={() => handleTypeToggle(type.value as BikeType)}
                        />
                        <Label htmlFor={type.value} className="text-sm font-normal cursor-pointer">
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <Label className="mb-3 text-sm font-medium">价格范围 (¥/小时)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.priceRange[0]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceRange: [Number(e.target.value), filters.priceRange[1]],
                        })
                      }
                      className="h-9"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={filters.priceRange[1]}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          priceRange: [filters.priceRange[0], Number(e.target.value)],
                        })
                      }
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <Label className="mb-3 text-sm font-medium">品牌</Label>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={filters.brands.includes(brand)}
                          onCheckedChange={() => handleBrandToggle(brand)}
                        />
                        <Label htmlFor={brand} className="text-sm font-normal cursor-pointer">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFilters({ types: [], priceRange: [0, 100], brands: [] });
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                >
                  清除筛选
                </Button>
              </div>
            </aside>

            {/* Bike Grid */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="mb-4 text-sm text-muted-foreground">
                找到 {bikes.length} 款车型
              </div>

              {/* Bike Cards */}
              {currentBikes.length === 0 ? (
                <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-dashed">
                  <p className="text-muted-foreground">没有找到匹配的车型</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {currentBikes.map((bike) => (
                    <div key={bike.id} className="overflow-hidden rounded-xl border bg-card">
                      <div
                        className="h-48 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${bike.image})` }}
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-foreground">{bike.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{bike.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {bike.features.slice(0, 3).map((feature, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <span className="text-xl font-bold text-primary">
                            ¥{bike.price}
                            <span className="text-sm font-normal text-muted-foreground">
                              /{bike.priceUnit === 'hour' ? '小时' : '天'}
                            </span>
                          </span>
                          <div className="flex gap-2">
                            <Link href={`/bikes/${bike.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                查看详情
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => handleRentNow(bike)}
                            >
                              立即租用
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ←
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    第 {currentPage} 页，共 {totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    →
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
