from pathlib import Path


def main() -> None:
    visual = Path("src/modules/home/presentation/hero/HeroVisual.jsx").read_text()
    styles = Path("src/modules/home/presentation/hero/hero.css").read_text()

    assert "100K+ DOWNLOADS" in visual
    assert "PRODUCT SYSTEM" not in visual
    assert ".artifact--petcare { top: 17%;" in styles
    assert ".artifact--epos { top: 0%;" in styles


if __name__ == "__main__":
    main()
