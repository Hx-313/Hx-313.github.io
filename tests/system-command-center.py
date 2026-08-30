from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path('test-artifacts')
OUT.mkdir(exist_ok=True)


def set_story_progress(page, progress):
    page.locator('#client-story').evaluate(
        """(section, value) => {
            document.documentElement.style.scrollBehavior = 'auto';
            const sectionTop = window.scrollY + section.getBoundingClientRect().top;
            const scrollDistance = section.offsetHeight - window.innerHeight;
            window.scrollTo(0, sectionTop + scrollDistance * value);
            window.dispatchEvent(new Event('scroll'));
        }""",
        progress,
    )
    page.wait_for_timeout(450)


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
    assert page.locator('.client-story__rail, .client-story__marker').count() == 0
    set_story_progress(page, 0.45)
    assert page.get_by_role('heading', name="You don't need another app.").is_visible()
    set_story_progress(page, 0.55)
    assert page.get_by_text('You need the right system.', exact=True).is_visible()
    set_story_progress(page, 0.95)
    proof_link = page.get_by_role('link', name='Enter Command Center')
    assert proof_link.get_attribute('href') == '#command-center'
    proof_link.click()
    page.wait_for_timeout(500)
    assert page.get_by_role('heading', name='/// System command center').is_visible()
    assert page.get_by_role('heading', name='WOS').is_visible()
    page.get_by_role('button', name='Dietify').click()
    assert page.get_by_role('heading', name='Dietify').is_visible()
    page.get_by_role('button', name='Light').click()
    assert page.locator('html[data-theme="light"]').count() == 1
    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    mobile.goto('http://127.0.0.1:4173')
    mobile.wait_for_load_state('networkidle')
    mobile.wait_for_timeout(900)
    set_story_progress(mobile, 0.55)
    mobile.screenshot(path=str(OUT / 'command-center-mobile.png'), full_page=True)
    assert mobile.locator('body').evaluate('(el) => el.scrollWidth <= window.innerWidth + 1')
    assert mobile.locator('.client-story__rail, .client-story__marker').count() == 0
    assert mobile.get_by_text('You need the right system.', exact=True).is_visible()

    reduced_context = browser.new_context(
        reduced_motion='reduce',
        viewport={"width": 768, "height": 1024},
    )
    reduced_page = reduced_context.new_page()
    reduced_page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
    reduced_page.goto('http://127.0.0.1:4173')
    reduced_page.wait_for_load_state('networkidle')
    reduced_page.wait_for_timeout(900)
    set_story_progress(reduced_page, 0.55)
    reduced_page.screenshot(path=str(OUT / 'client-story-tablet-reduced-motion.png'), full_page=True)
    assert reduced_page.locator('.client-story__beat').count() == 5
    assert reduced_page.locator('.client-story__rail, .client-story__marker').count() == 0
    assert reduced_page.get_by_text('You need the right system.', exact=True).is_visible()
    assert reduced_page.locator('.client-story__beat.is-active .client-story__line--statement').evaluate(
        "(element) => getComputedStyle(element).transitionDuration === '0s'"
    )
    assert reduced_page.locator('body').evaluate('(el) => el.scrollWidth <= window.innerWidth + 1')
    reduced_context.close()
    assert not errors, errors
    browser.close()
