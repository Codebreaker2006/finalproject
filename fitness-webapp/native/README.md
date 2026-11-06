# `native/` — the original C++ source

`fitness.h` and `fitness.cpp` here are your original files with one minimal
addition: `User::serialize()` / `User::deserialize()`, so a `User`'s state
can be turned into a single comma-separated string and back — enough to
save it somewhere (a file, a database row) instead of only living in
memory for one run of the program. Everything else is untouched.

## Why the webapp doesn't run this file directly

Vercel's servers run JavaScript/TypeScript (via Next.js), not C++. There's
no change to this C++ that makes Vercel execute it directly — the two
realistic options are:

1. **Port the logic** to TypeScript and keep this file as the reference
   implementation. That's what this project does: `src/lib/fitness.ts` is
   a line-for-line port of the enums and the three calculator classes
   (`BMIcalculatorMetric`, `BMIcalculatorImperial`, `IdealWeightCalculator`).
   If you change a formula here, change it there too.

2. **Compile to WebAssembly** with Emscripten and call it from the
   browser/Node. This is possible but adds a real build step (installing
   the Emscripten SDK, writing bindings, bundling the `.wasm` file) for no
   behavior difference here, since the logic is tiny and arithmetic-only.
   Option 1 was simpler and gives identical results, so that's what's
   wired up. If you'd rather go the WASM route, this file's formulas are
   simple enough to bind with `embind` with very little extra work.

The `serialize()`/`deserialize()` pair maps directly onto the webapp's
`Profile` database table (see `prisma/schema.prisma`) — same seven
enum-backed fields plus weight and height.
