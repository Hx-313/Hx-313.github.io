import os

from playwright.sync_api import expect, sync_playwright


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        port = os.environ.get("PORT", "5173")
        page.goto(f"http://127.0.0.1:{port}", wait_until="networkidle")
        page.wait_for_timeout(11_000)

        header = page.locator(".site-header")
        expect(header).to_be_visible()
        position = header.evaluate("element => getComputedStyle(element).position")
        assert position == "sticky", f"expected sticky header, got {position}"
        overflow = page.evaluate("() => document.documentElement.scrollWidth - window.innerWidth")
        assert overflow <= 1, f"horizontal overflow is {overflow}px"
        expect(page.locator(".signal-board")).to_be_visible()
        browser.close()


if __name__ == "__main__":
    main()
