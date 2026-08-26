from playwright.sync_api import sync_playwright


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
    page.goto("http://localhost:5173/")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(1000)

    assert page.get_by_text("Product constellation").is_visible()
    assert page.get_by_role("button", name="Select WOS, Restaurant technology project").get_attribute("aria-pressed") == "true"
    assert page.locator('a[href="https://onlineorder.pk/wos/admin"]').count() == 1
    assert page.locator('a[href="https://onlineorder.pk/epos"]').count() == 2
    assert page.locator('a[href="https://westcoastcoffee.pk/"]').count() == 2
    assert not errors, errors

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto("http://localhost:5173/")
    mobile.wait_for_load_state("networkidle")
    mobile.wait_for_timeout(1000)
    assert mobile.locator("body").evaluate("el => el.scrollWidth <= window.innerWidth + 1")
    browser.close()
