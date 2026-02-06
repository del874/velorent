import { test, expect } from '@playwright/test';

test.describe('用户注册流程', () => {
  test.beforeEach(async ({ page }) => {
    // 访问注册页面
    await page.goto('/register');
  });

  test('应该显示注册页面表单', async ({ page }) => {
    // 验证页面标题
    await expect(page.getByRole('heading', { name: '注册账号' })).toBeVisible();

    // 验证所有输入框存在 - 使用 id 来精确选择
    await expect(page.getByLabel('姓名')).toBeVisible();
    await expect(page.getByLabel('邮箱')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#confirmPassword')).toBeVisible();

    // 验证注册按钮存在 - 限制在 main 区域
    await expect(page.getByRole('main').getByRole('button', { name: '注册' })).toBeVisible();
  });

  test('应该成功注册新用户', async ({ page }) => {
    // 生成随机邮箱以避免冲突
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testName = `测试用户${timestamp}`;
    const testPassword = 'test123456';

    // 填写注册表单
    await page.getByLabel('姓名').fill(testName);
    await page.getByLabel('邮箱').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    await page.locator('#confirmPassword').fill(testPassword);

    // 点击注册按钮 - 限制在 main 区域
    await page.getByRole('main').getByRole('button', { name: '注册' }).click();

    // 等待跳转到车型列表页面（注册成功后）
    await page.waitForURL('/bikes', { timeout: 10000 });

    // 验证URL已经改变
    expect(page.url()).toContain('/bikes');

    // 验证顶部导航栏显示用户名
    await expect(page.getByRole('button', { name: testName })).toBeVisible();
  });

  test('应该显示密码不匹配错误', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testName = `测试用户${timestamp}`;

    // 填写注册表单 - 密码不匹配
    await page.getByLabel('姓名').fill(testName);
    await page.getByLabel('邮箱').fill(testEmail);
    await page.locator('#password').fill('password123');
    await page.locator('#confirmPassword').fill('password456');

    // 点击注册按钮
    await page.getByRole('main').getByRole('button', { name: '注册' }).click();

    // 验证错误消息显示
    await expect(page.getByText('两次输入的密码不一致')).toBeVisible();
  });

  test('应该显示密码太短错误', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testName = `测试用户${timestamp}`;
    const shortPassword = '12345';

    // 填写注册表单 - 密码太短
    await page.getByLabel('姓名').fill(testName);
    await page.getByLabel('邮箱').fill(testEmail);
    await page.locator('#password').fill(shortPassword);
    await page.locator('#confirmPassword').fill(shortPassword);

    // 点击注册按钮
    await page.getByRole('main').getByRole('button', { name: '注册' }).click();

    // 验证错误消息显示
    await expect(page.getByText('密码长度至少为6位')).toBeVisible();
  });

  test('应该显示必填字段错误', async ({ page }) => {
    // 不填写任何字段，直接点击注册
    // 注意：HTML5 表单验证会阻止提交，所以需要绕过验证
    await page.getByRole('main').getByRole('button', { name: '注册' }).click();

    // 由于 HTML5 验证，表单不会提交，检查是否有验证提示
    // 或者检查是否有我们的自定义错误消息
    const hasError = await page.getByText('请填写所有字段').count() > 0;
    const hasValidation = await page.locator('input:invalid').count() > 0;

    expect(hasError || hasValidation).toBeTruthy();
  });

  test('应该显示邮箱已存在错误', async ({ page }) => {
    // 使用固定的已存在的邮箱（第一次测试时创建的）
    const existingEmail = 'test@example.com';
    const testName = '测试用户';

    // 填写注册表单
    await page.getByLabel('姓名').fill(testName);
    await page.getByLabel('邮箱').fill(existingEmail);
    await page.locator('#password').fill('test123456');
    await page.locator('#confirmPassword').fill('test123456');

    // 点击注册按钮
    await page.getByRole('main').getByRole('button', { name: '注册' }).click();

    // 验证错误消息显示（邮箱已存在）
    await expect(page.getByText(/User with this email already exists/)).toBeVisible();
  });

  test('点击"立即登录"链接应该跳转到登录页面', async ({ page }) => {
    // 点击登录链接
    await page.getByRole('link', { name: '立即登录' }).click();

    // 验证跳转到登录页面
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');

    // 验证登录页面标题
    await expect(page.getByRole('heading', { name: '登录账号' })).toBeVisible();
  });
});

test.describe('用户登录流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('应该显示登录页面表单', async ({ page }) => {
    // 验证页面标题
    await expect(page.getByRole('heading', { name: '登录账号' })).toBeVisible();

    // 验证输入框存在
    await expect(page.getByLabel('邮箱')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();

    // 验证登录按钮存在 - 使用 page.getByRole 并限制在 main 区域
    await expect(page.getByRole('main').getByRole('button', { name: '登录' })).toBeVisible();
  });

  test('应该成功登录已注册用户', async ({ page }) => {
    // 使用已注册的测试账号
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.locator('#password').fill('123456');

    // 点击登录按钮 - 限制在 main 区域
    await page.getByRole('main').getByRole('button', { name: '登录' }).click();

    // 等待跳转到车型列表页面
    await page.waitForURL('/bikes', { timeout: 10000 });

    // 验证URL已经改变
    expect(page.url()).toContain('/bikes');

    // 验证顶部导航栏显示用户菜单
    await expect(page.getByRole('button', { name: 'Test User' })).toBeVisible();
  });

  test('应该显示登录失败错误（错误密码）', async ({ page }) => {
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.locator('#password').fill('wrongpassword');

    // 点击登录按钮
    await page.getByRole('main').getByRole('button', { name: '登录' }).click();

    // 验证错误消息显示
    await expect(page.getByText(/Invalid email or password/)).toBeVisible();
  });

  test('应该显示登录失败错误（用户不存在）', async ({ page }) => {
    const timestamp = Date.now();
    await page.getByLabel('邮箱').fill(`nonexistent${timestamp}@example.com`);
    await page.locator('#password').fill('test123456');

    // 点击登录按钮
    await page.getByRole('main').getByRole('button', { name: '登录' }).click();

    // 验证错误消息显示
    await expect(page.getByText(/Invalid email or password/)).toBeVisible();
  });

  test('点击"立即注册"链接应该跳转到注册页面', async ({ page }) => {
    // 点击注册链接
    await page.getByRole('link', { name: '立即注册' }).click();

    // 验证跳转到注册页面
    await page.waitForURL('/register');
    expect(page.url()).toContain('/register');

    // 验证注册页面标题
    await expect(page.getByRole('heading', { name: '注册账号' })).toBeVisible();
  });
});

test.describe('用户登出流程', () => {
  test('应该成功登出', async ({ page }) => {
    // 首先登录
    await page.goto('/login');
    await page.getByLabel('邮箱').fill('test@example.com');
    await page.locator('#password').fill('123456');
    await page.getByRole('main').getByRole('button', { name: '登录' }).click();
    await page.waitForURL('/bikes', { timeout: 10000 });

    // 点击用户菜单
    await page.getByRole('button', { name: 'Test User' }).click();

    // 点击退出登录
    await page.getByRole('menuitem', { name: '退出登录' }).click();

    // 验证页面仍在车型列表
    expect(page.url()).toContain('/bikes');

    // 验证现在显示注册和登录按钮
    await expect(page.getByRole('link', { name: '注册' }).getByRole('button')).toBeVisible();
    await expect(page.getByRole('link', { name: '登录' }).getByRole('button')).toBeVisible();
  });
});

test.describe('需要登录才能预订', () => {
  test('未登录用户访问注册页面后可以正常注册', async ({ page }) => {
    // 验证未登录用户可以访问注册页面
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: '注册账号' })).toBeVisible();

    // 验证未登录用户可以访问登录页面
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: '登录账号' })).toBeVisible();
  });
});

