import assert from "node:assert/strict"
import test from "node:test"

import { probeProductStorefront } from "./probe_product_storefront.mjs"

function response({ status, url, redirected = false, cancel }) {
  return {
    status,
    url,
    redirected,
    body: cancel ? { cancel } : null,
  }
}

test("uses one redirect-following HEAD request without downloading the body", async () => {
  const calls = []
  const result = await probeProductStorefront({
    store: "example.myshopify.com",
    input: { handle: "canvas-tote" },
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return response({
        status: 200,
        url: "https://shop.example.com/products/canvas-tote",
        redirected: true,
      })
    },
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0].options.method, "HEAD")
  assert.equal(calls[0].options.redirect, "follow")
  assert.equal(result.probe.httpStatus, 200)
  assert.equal(result.probe.finalUrl, "https://shop.example.com/products/canvas-tote")
  assert.equal(result.probe.reachable, true)
  assert.equal(result.probe.contentVerified, false)
  assert.equal(result.probe.fullBodyDownloaded, false)
})

test("falls back once to a bounded GET and cancels its body when HEAD is blocked", async () => {
  const calls = []
  let cancelled = false
  const result = await probeProductStorefront({
    store: "example.myshopify.com",
    input: { handle: "canvas-tote" },
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      if (options.method === "HEAD") return response({ status: 405, url })
      return response({
        status: 200,
        url,
        cancel: async () => {
          cancelled = true
        },
      })
    },
  })

  assert.equal(calls.length, 2)
  assert.equal(calls[0].options.method, "HEAD")
  assert.equal(calls[1].options.method, "GET")
  assert.equal(calls[1].options.headers.Range, "bytes=0-0")
  assert.equal(cancelled, true)
  assert.equal(result.probe.method, "GET")
  assert.equal(result.probe.reachable, true)
  assert.equal(result.attempts.length, 2)
})

test("rejects handles that can escape the Product URL path segment", async () => {
  await assert.rejects(
    probeProductStorefront({
      store: "example.myshopify.com",
      input: { handle: "canvas/tote" },
      fetchImpl: async () => {
        throw new Error("must not execute")
      },
    }),
    /one Product URL path segment/,
  )
})
