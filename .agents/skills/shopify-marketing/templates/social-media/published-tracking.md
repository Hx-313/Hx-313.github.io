# Published Posts Tracker

> Optional for user-initiated manual campaigns. Scheduled patrol actions do not retain remote IDs/permalinks; their outcome is written to the daily report.

## Campaign

- **Date**: {YYYY-MM-DD HH:mm TZ}
- **Store**: {shop_domain}
- **Product**: {title} ({handle})
- **Storefront URL**: {url}
- **Theme/Angle**: {pain-point used | template type}

## Instagram

- **Status**: ✅ Published / ❌ Failed
- **Permalink (when returned)**: {https://instagram.com/p/... | unavailable}
- **Caption file**: caption_ig.txt
- **Image used**: marketing_images/{filename}.png
- **Hashtags count**: {n}

## Twitter/X

- **Status**: ✅ Published / ❌ Failed
- **Permalink (when returned)**: {https://x.com/{user}/status/{tweet_id} | unavailable}
- **Imgur page URL**: https://imgur.com/{id}
- **Tweet copy file**: tweet_x.txt

## Issues / Notes
- {anything that needed troubleshooting — Imgur retries, IG container errors, etc.}

## Follow-up
- [ ] User notified with publish outcomes and any returned permalinks
- [ ] User given Like/Comment/RT engagement window suggestion (post + 30min, +2hr, +24hr)
- [ ] Performance review scheduled (T+7 days)
