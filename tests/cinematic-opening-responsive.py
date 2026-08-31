import os

from playwright.sync_api import expect, sync_playwright


VIEWPORTS = ((1440, 900), (1024, 768), (768, 1024), (390, 844))


def assert_no_horizontal_overflow(page) -> None:
    overflow = page.evaluate(
        "() => document.documentElement.scrollWidth - window.innerWidth"
    )
    assert overflow <= 1, f"horizontal overflow is {overflow}px"


def assert_skip_is_visible(page) -> None:
    skip = page.locator(".space-skip-btn")
    expect(skip).to_be_visible(timeout=2_000)
    expect(skip).to_be_in_viewport()


def assert_mobile_projection_is_safe(page) -> None:
    projection = page.locator(
        '[data-opening-mobile-stage] [data-opening-mobile-projection="aero"] '
        '[data-opening-projection]'
    )
    expect(projection).to_be_visible(timeout=1_500)
    expect(projection).to_be_in_viewport()

    bounds = projection.bounding_box()
    assert bounds is not None, "mobile projection should have a layout box"
    assert bounds["width"] <= 358, f"mobile projection is too wide: {bounds}"
    assert bounds["x"] >= -1, f"mobile projection clips left: {bounds}"
    assert bounds["x"] + bounds["width"] <= page.viewport_size["width"] + 1, (
        f"mobile projection clips right: {bounds}"
    )
    assert page.locator(
        '[data-opening-mobile-stage] [data-opening-mobile-projection="aero"] '
        '.opening-projection-copy'
    ).inner_text() == "PRODUCTS NEED\nMOMENTUM."


def assert_reduced_motion_lifecycle(browser, base_url: str) -> None:
    context = browser.new_context(
        reduced_motion="reduce", viewport={"width": 1280, "height": 800}
    )
    page = context.new_page()
    page.goto(base_url, wait_until="networkidle")

    opening = page.locator(".opening")
    experience = page.locator(".site-experience")
    expect(opening).to_have_attribute("data-motion", "reduced", timeout=2_000)
    assert_no_horizontal_overflow(page)

    live_region = page.locator("[data-opening-live]")
    expect(live_region).to_have_text("IDEAS NEED STRUCTURE.", timeout=1_000)
    expect(live_region).to_have_text("PRODUCTS NEED MOMENTUM.", timeout=1_000)
    expect(live_region).to_have_text("MOMENTUM NEEDS CONVICTION.", timeout=1_000)

    expect(opening).to_have_count(0, timeout=1_000)
    expect(experience).to_have_class("site-experience is-ready", timeout=500)
    expect(experience).to_have_attribute("aria-hidden", "false")
    assert experience.get_attribute("inert") is None
    assert_no_horizontal_overflow(page)
    context.close()


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        port = os.environ.get("PORT", "4321")
        base_url = f"http://127.0.0.1:{port}"

        for width, height in VIEWPORTS:
            page.set_viewport_size({"width": width, "height": height})
            page.goto(base_url, wait_until="networkidle")
            expect(page.locator(".opening")).to_be_visible(timeout=2_000)
            assert_skip_is_visible(page)
            assert_no_horizontal_overflow(page)

        page.set_viewport_size({"width": 390, "height": 844})
        page.goto(base_url, wait_until="networkidle")
        expect(page.locator(".opening")).to_be_visible(timeout=2_000)
        page.wait_for_timeout(5_300)
        assert_mobile_projection_is_safe(page)
        assert_no_horizontal_overflow(page)

        page.locator(".space-skip-btn").click()
        expect(page.locator(".site-experience")).to_have_class(
            "site-experience is-handoff", timeout=700
        )
        expect(page.locator(".opening")).to_have_count(0, timeout=1_000)
        expect(page.locator(".site-experience")).to_have_class(
            "site-experience is-ready", timeout=1_000
        )

        assert_reduced_motion_lifecycle(browser, base_url)
        browser.close()


if __name__ == "__main__":
    main()
