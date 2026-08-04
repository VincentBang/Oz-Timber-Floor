# Ecommerce Decision Record

## Decision

The static migration remains enquiry-led: catalogue browsing, product/range enquiries, stock checks and supply-only or supply-plus-install requests are supported. Checkout, cart, payment, instant pricing and automated quote logic are not included.

## Why

The current repository contains a catalogue and enquiry model, not evidence that rebuilding WooCommerce checkout is commercially necessary. Adding it would introduce payment, stock, tax, pricing, fulfilment and customer-account risk without an approved business case.

## Information required before reopening checkout scope

- Online-order count and checkout revenue for the last 12 months.
- Active paid campaigns, product feeds or retargeting journeys that land on cart or checkout URLs.
- Saved customer checkout links or customer-account dependencies.
- Inventory, pricing, tax, fulfilment and refund ownership.
- Any supplier restrictions that affect online sale or displayed pricing.

## Revisit trigger

Vincent or the accountable business owner must provide the evidence above and approve a separate scoped checkout decision. Until then, preserve legacy URLs with relevant redirects but do not recreate payment flow.
