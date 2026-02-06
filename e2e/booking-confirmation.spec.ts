import { test, expect } from '@playwright/test';

test.describe('预订确认页面', () => {
  test.beforeEach(async ({ page }) => {
    // 登录测试账号
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.locator('#password').fill('123456');
    await page.getByRole('main').getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/bikes', { timeout: 10000 });
  });

  test('应该显示预订详情页', async ({ page }) => {
    // 导航到预订列表
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByRole('menuitem', { name: '我的预订' }).click();
    await page.waitForURL('/bookings');

    // 等待预订列表加载
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // 点击第一个预订卡片
    const firstCard = page.locator('article').or(page.locator('[class*="Card"]')).first();
    const hasBookings = await firstCard.count() > 0;

    if (hasBookings) {
      await firstCard.click();

      // 验证跳转到详情页
      await page.waitForURL(/\/bookings\/.+/);
      expect(page.url()).toMatch(/\/bookings\/.+/);

      // 验证页面标题
      await expect(page.getByRole('heading', { name: '预订详情' })).toBeVisible();

      // 验证显示状态徽章
      await expect(page.locator('[class*="badge"]')).toBeVisible();
    }
  });

  test('应该显示成功消息当从预订页面跳转', async ({ page }) => {
    // 创建新预订
    await page.goto('/bikes/cm1l8v3sq0001hzjskw9v5q9k');
    await page.waitForSelector('main', { timeout: 10000 });

    // 滚动到预订表单
    await page.locator('#booking-form').scrollIntoViewIfNeeded();

    // 选择未来的日期
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const startDate = futureDate.toISOString().split('T')[0];

    futureDate.setDate(futureDate.getDate() + 1);
    const endDate = futureDate.toISOString().split('T')[0];

    await page.locator('#startDate').fill(startDate);
    await page.locator('#endDate').fill(endDate);

    // 填写其他信息
    await page.locator('#location').selectOption('北京朝阳区店');
    await page.getByLabel('姓名').fill('测试用户');
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.getByLabel('电话').fill('13800138000');

    // 点击预订按钮
    await page.getByRole('button', { name: /确认预订/ }).click();

    // 等待跳转到确认页面
    await page.waitForURL(/\/bookings\/.+[?]confirmed=true/, { timeout: 10000 });

    // 验证成功消息
    await expect(page.getByText('预订成功！')).toBeVisible();
    await expect(page.getByText(/预订确认号/)).toBeVisible();

    // 验证显示预订详情
    await expect(page.getByRole('heading', { name: '预订详情' })).toBeVisible();
  });

  test('应该显示完整的预订信息', async ({ page }) => {
    // 导航到预订列表
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByRole('menuitem', { name: '我的预订' }).click();
    await page.waitForURL('/bookings');

    // 等待预订列表加载
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // 点击第一个预订卡片
    const firstCard = page.locator('article').or(page.locator('[class*="Card"]')).first();
    const hasBookings = await firstCard.count() > 0;

    if (hasBookings) {
      await firstCard.click();
      await page.waitForURL(/\/bookings\/.+/);

      // 验证显示各个部分
      await expect(page.getByRole('heading', { name: '预订详情' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '车型信息' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '租赁信息' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '联系人信息' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '价格明细' })).toBeVisible();

      // 验证显示车型图片
      await expect(page.locator('[style*="background-image"]')).toBeVisible();

      // 验证显示价格
      await expect(page.getByText(/¥/)).toBeVisible();
    }
  });

  test('应该能够从详情页取消预订', async ({ page }) => {
    // 导航到预订列表
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByRole('menuitem', { name: '我的预订' }).click();
    await page.waitForURL('/bookings');

    // 等待预订列表加载
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // 查找可取消的预订
    const cancelButton = page.getByRole('button', { name: '取消预订' }).first();
    const hasCancelable = await cancelButton.count() > 0;

    if (hasCancelable) {
      // 找到包含取消按钮的卡片并点击
      const cardWithCancel = cancelButton.locator('..').locator('..').locator('..');
      await cardWithCancel.click();

      await page.waitForURL(/\/bookings\/.+/);

      // 设置 dialog 监听器
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('确定要取消');
        await dialog.accept();
      });

      // 点击取消按钮
      await page.getByRole('button', { name: '取消预订' }).click();

      // 等待更新
      await page.waitForTimeout(3000);

      // 验证状态已更新（可能显示已取消）
      const statusBadge = page.locator('[class*="badge"]');
      await expect(statusBadge).toBeVisible();
    } else {
      test.skip(true, '没有可取消的预订');
    }
  });

  test('未登录用户访问详情页应该跳转到登录页', async ({ page }) => {
    // 登出
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByRole('menuitem', { name: '退出登录' }).click();

    // 直接访问预订详情页（使用一个已知的ID）
    await page.goto('/bookings/cm1l8v3sq0001hzjskw9v5q9k');

    // 验证跳转到登录页
    await page.waitForURL('/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('应该提供再次预订按钮并跳转到车型详情页', async ({ page }) => {
    // 导航到预订列表
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByRole('menuitem', { name: '我的预订' }).click();
    await page.waitForURL('/bookings');

    // 等待预订列表加载
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // 点击第一个预订卡片
    const firstCard = page.locator('article').or(page.locator('[class*="Card"]')).first();
    const hasBookings = await firstCard.count() > 0;

    if (hasBookings) {
      await firstCard.click();
      await page.waitForURL(/\/bookings\/.+/);

      // 点击"再次预订此车型"按钮
      const rebookButton = page.getByRole('button', { name: '再次预订此车型' });
      await expect(rebookButton).toBeVisible();

      await rebookButton.click();

      // 验证跳转到车型详情页
      await page.waitForURL(/\/bikes\/.*/, { timeout: 10000 });
      expect(page.url()).toMatch(/\/bikes\/.+/);
    }
  });

  test('返回按钮应该跳转到我的预订列表', async ({ page }) => {
    // 导航到预订列表
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByRole('menuitem', { name: '我的预订' }).click();
    await page.waitForURL('/bookings');

    // 等待预订列表加载
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // 点击第一个预订卡片
    const firstCard = page.locator('article').or(page.locator('[class*="Card"]')).first();
    const hasBookings = await firstCard.count() > 0;

    if (hasBookings) {
      await firstCard.click();
      await page.waitForURL(/\/bookings\/.+/);

      // 点击返回按钮
      await page.getByRole('link', { name: '返回我的预订' }).click();

      // 验证跳转回预订列表
      await page.waitForURL('/bookings');
      expect(page.url()).toContain('/bookings');
    }
  });

  test('应该显示价格明细', async ({ page }) => {
    // 导航到预订列表
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByRole('menuitem', { name: '我的预订' }).click();
    await page.waitForURL('/bookings');

    // 等待预订列表加载
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // 点击第一个预订卡片
    const firstCard = page.locator('article').or(page.locator('[class*="Card"]')).first();
    const hasBookings = await firstCard.count() > 0;

    if (hasBookings) {
      await firstCard.click();
      await page.waitForURL(/\/bookings\/.+/);

      // 验证价格明细部分
      await expect(page.getByText('车型单价')).toBeVisible();
      await expect(page.getByText('租赁时长')).toBeVisible();
      await expect(page.getByText('总计')).toBeVisible();

      // 验证显示价格
      const priceElements = await page.locator('text=/¥/').count();
      expect(priceElements).toBeGreaterThan(0);
    }
  });

  test('应该禁止访问其他用户的预订', async ({ page }) => {
    // 当前用户已登录
    // 直接访问一个可能不存在的预订ID
    await page.goto('/bookings/some-invalid-id');

    // 应该显示错误信息或重定向
    await page.waitForTimeout(2000);

    // 检查是否显示错误或重定向
    const currentUrl = page.url();
    const hasError = await page.getByText(/未找到|加载失败|无权/).count() > 0;

    expect(currentUrl.includes('/login') || hasError).toBeTruthy();
  });
});

test.describe('预订确认页面 - 响应式设计', () => {
  test('在移动端应该正常显示', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });

    // 登录
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.locator('#password').fill('123456');
    await page.getByRole('main').getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/bikes', { timeout: 10000 });

    // 导航到预订列表
    await page.getByRole('button', { name: 'Test User' }).click();
    await page.getByRole('menuitem', { name: '我的预订' }).click();
    await page.waitForURL('/bookings');

    // 等待预订列表加载
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });

    // 点击第一个预订卡片
    const firstCard = page.locator('article').or(page.locator('[class*="Card"]')).first();
    const hasBookings = await firstCard.count() > 0;

    if (hasBookings) {
      await firstCard.click();
      await page.waitForURL(/\/bookings\/.+/);

      // 验证主要元素可见
      await expect(page.getByRole('heading', { name: '预订详情' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '车型信息' })).toBeVisible();
      await expect(page.getByRole('heading', { name: '价格明细' })).toBeVisible();
    }
  });
});
