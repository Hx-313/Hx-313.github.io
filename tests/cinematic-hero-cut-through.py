import os

from playwright.sync_api import expect, sync_playwright


def assert_rendered_layers(page, require_opening=True) -> None:
    state = page.evaluate(
        """
        () => {
          const isRendered = (element) => {
            if (!element) return false;
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== 'none'
              && style.visibility !== 'hidden'
              && Number(style.opacity) > 0.01
              && rect.width > 0
              && rect.height > 0;
          };
          const opening = document.querySelector('.opening');
          const experience = document.querySelector('.site-experience');
          return {
            opening: isRendered(opening),
            experience: isRendered(experience),
            openingOpacity: opening ? Number(getComputedStyle(opening).opacity) : 0,
            experienceOpacity: experience ? Number(getComputedStyle(experience).opacity) : 0,
          };
        }
        """
    )
    if require_opening:
        assert state["opening"], f"opening layer is not rendered: {state}"
    assert state["experience"], f"site layer is not rendered: {state}"


def assert_ready(page, opening, experience) -> None:
    expect(opening).to_have_count(0, timeout=2_000)
    expect(experience).to_have_class("site-experience is-ready", timeout=500)
    expect(experience).to_have_attribute("aria-hidden", "false")
    assert experience.get_attribute("inert") is None
    assert_rendered_layers(page, require_opening=False)


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        port = os.environ.get("PORT", "4321")
        base_url = f"http://127.0.0.1:{port}"

        page.goto(base_url, wait_until="networkidle")
        opening = page.locator(".opening")
        experience = page.locator(".site-experience")

        expect(opening).to_be_visible(timeout=2_000)
        expect(experience).to_have_attribute("aria-hidden", "true")
        expect(experience).to_have_class("site-experience is-handoff", timeout=11_600)
        expect(opening).to_be_visible()
        assert_rendered_layers(page)
        assert_ready(page, opening, experience)

        page.goto(base_url, wait_until="networkidle")
        opening = page.locator(".opening")
        experience = page.locator(".site-experience")
        expect(opening).to_be_visible(timeout=2_000)
        expect(experience).to_have_attribute("inert", "")

        page.locator(".space-skip-btn").click()
        expect(experience).to_have_class("site-experience is-handoff", timeout=700)
        expect(experience).to_have_attribute("inert", "")
        assert experience.get_attribute("aria-hidden") == "true"
        assert_ready(page, opening, experience)
        browser.close()


if __name__ == "__main__":
    main()
