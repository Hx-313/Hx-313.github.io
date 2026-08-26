import os

from playwright.sync_api import expect, sync_playwright


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        port = os.environ.get("PORT", "5173")
        page.goto(f"http://127.0.0.1:{port}", wait_until="networkidle")
        page.wait_for_timeout(11_000)

        expect(page.locator(".hero .hero-actions")).to_have_count(0)
        expect(page.locator(".artifact-stage")).to_be_visible()
        expect(page.locator(".artifact-stage img")).to_have_attribute("alt", "ePOS product interface")
        expect(page.locator(".hero-cta-rail")).to_be_visible()
        overflow = page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
        assert overflow <= 1, f"horizontal overflow is {overflow}px"
        browser.close()


if __name__ == "__main__":
    main()
