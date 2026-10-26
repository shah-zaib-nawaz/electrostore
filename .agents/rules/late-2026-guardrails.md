# Late-2026 Stack Guardrails (STRICT ENFORCEMENT)
1. **Next.js 16.3.6+ & React 19.2+**: 
   - NEVER create `middleware.ts`. Always use `src/proxy.ts` exporting `proxy()`.
   - NEVER use `unstable_cache` or route segment `export const revalidate`. Always use `"use cache"`, `cacheLife()`, and `cacheTag()` from `next/cache`.
   - React Compiler is active: NEVER write manual `useMemo` or `useCallback` unless profiling proves a compiler bailout.
   - Use `after()` from `next/server` for non-blocking side effects (embeddings, telemetry).
2. **Zod v4.6.7+**:
   - Use `z.compile(Schema)` for high-throughput Server Actions, env parsing, and bulk imports.
   - Use native `z.toJSONSchema()` when needed.
3. **Mongoose 9.11.2+ & MongoDB 8.0+/9.0**:
   - NEVER merge vector and lexical results in JavaScript. Always use MongoDB's native `$rankFusion` aggregation stage combining `$vectorSearch` (weight: 0.7) and `$search` (weight: 0.3).
4. **Better Auth 1.7.7+**:
   - Rely on native non-blocking `node:crypto` scrypt and built-in OTel spans via `src/instrumentation.ts`.
5. **Vercel AI SDK v7.0.138+ & OpenAI GPT-5.4**:
   - Default model: `openai('gpt-5.4')` with `providerOptions: { openai: { reasoningEffort: 'low' | 'medium' } }`. Fast routing: `openai('gpt-5.4-nano')`. Embeddings: `openai.embedding('text-embedding-3-large')` (3072 dims).
   - Enable `resume: true` in `useChat()`. Use native stream citations and approved tool-call gates for state-mutating tools (`addToCart`, `initiateOrderCancellation`).
6. **React Email v6.11 & Next-Cloudinary v6.19.3**:
   - Import all email primitives from the unified `react-email` package (NEVER `@react-email/components`).
   - Always use signed uploads for admin media via `<CldUploadWidget signatureEndpoint="/api/cloudinary/sign">`.
