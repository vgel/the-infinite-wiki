code for the infinite wiki

it's still quite janky but it does work. very quickly hacked together pls don't judge

## TODO:

- less stupid wiki markup parser / renderer
- rip out vercel/ai for a plain streaming connection
  - then, make store.ts not suck
  - (update: store.ts sucks a bit less now)
- handle case where user clicks off the page during generation gracefully
  - minimal -- don't brick the sesion
  - more complete -- could keep a partial page in history to generate the new page, then once new page is generated, swap back to continue generating previous page based on _new_ page--this should keep everything consistent
  - above will be easier once vercel/ai is gone
- generate TOC and then section by section (possibly in parallel)
