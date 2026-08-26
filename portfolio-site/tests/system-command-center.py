from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path('test-artifacts')
OUT.mkdir(exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    page.goto('http://127.0.0.1:4173')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(900)
    page.screenshot(path=str(OUT / 'command-center-desktop.png'), full_page=True)
    assert page.get_by_role('heading', name='A mindset').is_visible()
    assert page.get_by_role('heading', name='/// System command center').is_visible()
    assert page.get_by_role('heading', name='WOS').is_visible()
    page.get_by_role('button', name='Dietify').click()
    assert page.get_by_role('heading', name='Dietify').is_visible()
    page.get_by_role('button', name='Light').click()
    assert page.locator('html[data-theme="light"]').count() == 1
    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto('http://127.0.0.1:4173')
    mobile.wait_for_load_state('networkidle')
    mobile.wait_for_timeout(900)
    mobile.screenshot(path=str(OUT / 'command-center-mobile.png'), full_page=True)
    assert mobile.locator('body').evaluate('(el) => el.scrollWidth <= window.innerWidth + 1')
    assert not errors, errors
    browser.close()
