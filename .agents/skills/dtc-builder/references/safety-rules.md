# Safety rules for critical operations and browser hand-off (R1 expanded)

## 1. Critical decisions — never decide for the user

- Store name, theme, color, pricing, listing order — **present options and let the user choose**, do not act
- Any paid action (theme purchase, Shopify Payments enrollment, .com registration) requires a clear cost statement + explicit user approval before execution
- If the user is not responding, **do not** proceed with "default values"

## 2. Irreversible operations require explicit confirmation

Any action that is **irreversible** or has store-wide impact must pause for explicit user approval:

- Delete a product / collection / theme
- Switch the active theme (changes to the old theme will be lost)
- Modify the checkout flow
- Switch the default currency **after** orders/payouts have started (first-time setup during initial store config is fine)
- Close / disable the store

## 3. Browser hand-off — let the user act first

For any browser-based interaction (admin login, payment binding, KYC upload, PayPal enrollment), **always ask first**:

> "Do you want to do this yourself, or should I take over?"

- **User chooses self-serve** → agent provides screenshots + field values, **does not touch keyboard/mouse**
- **User chooses hand-off** → agent screenshots every step for the user, and at critical checkpoints (after entering a password / before submitting a payment) **stops and waits for user confirmation**
