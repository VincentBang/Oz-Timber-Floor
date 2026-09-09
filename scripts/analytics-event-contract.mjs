import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("assets/site.js", "utf8");
const pendingKey = "oz-pending-quote-submit";
const now = 1_800_000_000_000;

// Execute the real page script with an inert DOM and in-memory sessionStorage.
// No form submission, network request or analytics configuration is performed.
function page({ pathname = "/contact/", search = "", storage = new Map(), at = now, collector = true } = {}) {
  const events = [];
  const listeners = new Map();
  const select = { value: "", addEventListener() {} };
  const form = {
    addEventListener(name, listener) { listeners.set(name, listener); },
    getAttribute() { return null; },
    setAttribute() {},
  };
  let ready;
  const document = {
    addEventListener(name, listener) { if (name === "DOMContentLoaded") ready = listener; },
    querySelector(selector) { return pathname === "/contact/" && selector === "#enquiryType" ? select : null; },
    querySelectorAll(selector) { return pathname === "/contact/" && selector === "[data-contact-form]" ? [form] : []; },
    getElementById() { return null; },
    createElement() { throw new Error("Analytics must not load a runtime or create a tag in this fixture"); },
  };
  const window = {
    OZ_TIMBER_FLOOR_CONTACT: { formName: "oz-flooring-enquiry", analytics: { ga4MeasurementId: null } },
    location: { pathname, search, href: `http://localhost${pathname}${search}`, origin: "http://localhost" },
    sessionStorage: {
      getItem(key) { return storage.get(key) ?? null; },
      setItem(key, value) { storage.set(key, String(value)); },
      removeItem(key) { storage.delete(key); },
    },
  };
  if (collector) window.gtag = (...args) => events.push(JSON.parse(JSON.stringify(args)));
  vm.runInNewContext(source, { document, window, URLSearchParams, URL, Date: class extends Date { static now() { return at; } } });
  assert.equal(typeof ready, "function");
  ready();
  return { events, storage, select, submit: () => listeners.get("submit")() };
}

const contact = page({ search: "?enquiry=stock&category=Engineered+timber&product=Private+product+notes&range=Private+range+notes&utm_source=private-campaign&gclid=private-id" });
contact.select.value = "supply-install";
contact.submit();
assert.equal(contact.events.length, 0, "Submitting must not emit a success event");
const marker = JSON.parse(contact.storage.get(pendingKey));
assert.equal(marker.timestamp, now);
assert.deepEqual(marker.context, {
  enquiry_type: "supply-install",
  category: "Engineered timber",
  has_product_context: true,
  has_range_context: true,
  utm_source_present: true,
  utm_medium_present: false,
  utm_campaign_present: false,
  gclid_present: true,
  fbclid_present: false,
});
assert.doesNotMatch(contact.storage.get(pendingKey), /private/i, "Submission marker must omit raw product, range and attribution values");

const thanks = page({ pathname: "/thank-you/", storage: contact.storage, at: now + 5000 });
assert.equal(thanks.events.length, 1);
assert.deepEqual(thanks.events[0], ["event", "quote_submit", {
  ...marker.context,
  page_path: "/thank-you/",
  source_page: "/contact/",
  event_category: "lead",
  lead_event_state: "confirmed_thank_you",
  form_name: "oz-flooring-enquiry",
}]);
assert.equal(thanks.storage.has(pendingKey), false, "Successful navigation must consume the marker");
assert.equal(page({ pathname: "/thank-you/", storage: thanks.storage }).events.length, 0, "Reload must not duplicate success");
assert.equal(page({ pathname: "/thank-you/" }).events.length, 0, "Direct thank-you visit must not report success");

for (const invalid of [
  "not-json", "null", "[]", String(now),
  JSON.stringify({ timestamp: now }),
  JSON.stringify({ timestamp: String(now), context: marker.context }),
  JSON.stringify({ timestamp: now, context: [] }),
  JSON.stringify({ timestamp: now + 1, context: marker.context }),
  JSON.stringify({ timestamp: now - 10 * 60 * 1000 - 1, context: marker.context }),
]) {
  const result = page({ pathname: "/thank-you/", storage: new Map([[pendingKey, invalid]]) });
  assert.equal(result.events.length, 0, `Invalid or expired marker must not report success: ${invalid}`);
  assert.equal(result.storage.has(pendingKey), false, "Invalid marker must also be consumed");
}

const untrustedContext = {
  ...marker.context,
  enquiry_type: "private@example.com",
  category: "private product notes",
  has_product_context: "private-name",
  email: "private@example.com",
  source_page: "/private-address/",
};
const sanitized = page({ pathname: "/thank-you/", storage: new Map([[pendingKey, JSON.stringify({ timestamp: now, context: untrustedContext })]]) });
assert.equal(sanitized.events[0][2].enquiry_type, "");
assert.equal(sanitized.events[0][2].category, "");
assert.equal(sanitized.events[0][2].has_product_context, false);
assert.doesNotMatch(JSON.stringify(sanitized.events), /private/i, "Re-read context must be allowlisted again");

const idle = page({ pathname: "/products/", storage: new Map([[pendingKey, JSON.stringify(marker)]]) });
assert.equal(idle.events.length, 0, "Only the thank-you route can report success");
assert.equal(idle.storage.has(pendingKey), true);
assert.equal(page({ pathname: "/thank-you/", storage: idle.storage, collector: false }).events.length, 0, "Unconfigured GA4 remains inactive");

console.log("ANALYTICS CONTRACT PASS behavioral=context-preserved,once-only,expiry,malformed,allowlist,no-submit-success,no-live-GA4");
