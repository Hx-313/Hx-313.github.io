import os

from playwright.sync_api import expect, sync_playwright


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        port = os.environ.get("PORT", "4321")
        page.goto(f"http://127.0.0.1:{port}", wait_until="networkidle")

        opening = page.locator(".opening")
        experience = page.locator(".site-experience")

        expect(opening).to_be_visible(timeout=2_000)
        page.wait_for_timeout(7_000)

        expect(experience).to_have_class("site-experience is-revealed")
        expect(opening).to_be_visible()

        transition_ms = page.locator(".opening").evaluate(
            "element => parseFloat(getComputedStyle(element).transitionDuration) * 1000"
        )
        assert transition_ms <= 320, f"opening transition is {transition_ms}ms"

        page.wait_for_timeout(450)
        expect(opening).to_have_count(0)
        browser.close()


if __name__ == "__main__":
    main()
