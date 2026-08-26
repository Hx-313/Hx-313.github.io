# Gate decision log (`_decisions.md`)

> Written by `dtc-builder` skill | every gate must capture the user's verbatim reply

---

## G1 · Store English brand name

- **Asked at**: YYYY-MM-DD HH:MM
- **Agent recommendation**: A) ___ / B) ___ / C) user-defined
- **User reply**: "{verbatim}"
- **Final decision**: `xxxxx` (used for the myshopify URL)

## G2 · Primary product category

- **Asked at**: YYYY-MM-DD HH:MM
- **User reply**: "{verbatim}"
- **Final decision**: `apparel | home | beauty | electronics | food | outdoor | pet`

## G3 · Payment method

- **Asked at**: YYYY-MM-DD HH:MM
- **Agent recommendation** (by geography):
  - US-domestic seller (US LLC + US bank) → **Shopify Payments + PayPal**
  - Canada-domestic (Canadian Business Number + CA bank) → **Shopify Payments Canada + PayPal** (+ Wise for receiving USD without conversion fees)
  - UK/EU → **Stripe + Klarna + PayPal**
  - China cross-border → **PayPal + Stripe (via overseas entity) + Wise / PingPong / Airwallex** for collection
- **User reply**: "{verbatim}"
- **Final decision**: ☐ Shopify Payments ☐ Stripe ☐ PayPal ☐ Klarna ☐ Wise ☐ PingPong ☐ Airwallex ☐ other ___

## G4 · Billing currency

- **User reply**: "{verbatim}"
- **Final decision**: USD only / Multi-currency

## G5 · Theme

- **Agent recommendation**: Dawn (free)
- **User reply**: "{verbatim}"
- **Final decision**: `Dawn | Sense | other`

## G6 · Product retail price

- **Agent's initial price**:
  - Product 1: \$X (compare_at \$Y)
  - Product 2: ...
- **User adjustment**: "{verbatim}"
- **Final price**:
  - Product 1: \$X.XX (compare_at \$Y.YY)
  - ...

## G7 · Refund policy

- **Agent recommendation**: 30 days; under \$30 = refund without return; over \$30 = return to US warehouse
- **User reply**: "{verbatim}"
- **Final policy**:

## G8 · Shipping plan

- **Agent recommendation**: free shipping over \$50 / \$6.99 standard / Yanwen USPS 14-day
- **User reply**: "{verbatim}"
- **Final plan**:

## G9 · Launch confirmation

- **Pre-launch screenshots sent**: ☐ Home ☐ Product detail ☐ Cart
- **User reply**: "{verbatim}"
- **Final decision**: ☐ Go live ☐ More edits

---

## Self-check

- [ ] All 9 gates captured a verbatim user quote?
- [ ] No gate is in "agent decided unilaterally" state?
