"""餐食计划 UI 冒烟测试：验证页面和按钮渲染正常。"""
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path('/tmp/meal-screenshots')
OUT.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1360, 'height': 900})
    console_logs = []
    page_errors = []
    page.on('console', lambda m: console_logs.append(f'[{m.type}] {m.text}'))
    page.on('pageerror', lambda exc: page_errors.append(str(exc)))

    page.goto('http://localhost:5173/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1500)
    page.screenshot(path=str(OUT / '01-home.png'), full_page=False)

    # 查找导航按钮（4 个 tab）
    nav_buttons = page.locator('nav button').all()
    labels = [b.inner_text().strip() for b in nav_buttons]
    print('NAV TABS:', labels)
    assert len(labels) >= 4, 'should have at least 4 nav tabs'
    assert any('计划' in l for l in labels), 'today planner missing'
    assert any('食材' in l for l in labels), 'inventory missing'
    assert any('食谱' in l for l in labels),   'recipes missing'
    assert any('偏好' in l for l in labels), 'preferences missing'

    # 偏好设置
    btn = page.locator('nav button').nth(3)
    btn.evaluate('el => { el.scrollIntoView && el.scrollIntoView({block:"center"}); el.dispatchEvent(new Event("click", {bubbles:true})); }')
    page.wait_for_timeout(1200)
    page.screenshot(path=str(OUT / '05-preferences.png'), full_page=True)
    body = page.inner_text('body')
    assert '飞书 Base 云同步' in body, 'Lark sync card not rendered'
    assert 'XbkRb7vtvaQRNEs4wdscugTjnge' in body, 'base token not rendered'
    assert '上传到飞书 Base' in body
    assert '从飞书 Base 恢复' in body

    # 打开上传模态
    page.click('button:has-text("上传到飞书 Base")')
    page.wait_for_timeout(1200)
    page.screenshot(path=str(OUT / '06-upload-modal.png'), full_page=True)
    assert 'sync-payload.json' in page.inner_text('body')
    page.keyboard.press('Escape')
    page.wait_for_timeout(400)

    # 打开恢复模态
    page.click('button:has-text("从飞书 Base 恢复")')
    page.wait_for_timeout(1200)
    page.screenshot(path=str(OUT / '07-restore-modal.png'), full_page=True)
    assert '解析并预览恢复' in page.inner_text('body')
    page.keyboard.press('Escape')
    page.wait_for_timeout(400)

    page.close()
    browser.close()

    for m in page_errors:
        print('[PAGEERR]', m)
    # 只打印 warn 以上的 console
    for m in console_logs:
        if any(k in m for k in ['[warning]', '[error]']):
            print(m)
    print('ALL OK')
    if page_errors:
        raise SystemExit(2)
