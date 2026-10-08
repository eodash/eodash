## Packaging and startup

1. it("installs the packed tarball in an empty directory and answers tools/list"): pack.test.js only lists the files from npm pack --dry-run. Nothing installs and runs the package, so an import from outside the package (such as metadata/widget-parser.js:22) can't be caught.
2. it("throws a clear error at startup when data/*.json is missing"): the guard at helpers.js:63 is never exercised.
3. it("buildMetadata fails when widgets/, the store files or templates/ are missing"): the empty-metadata guard in generate-metadata.js is never exercised.
4. it("runs the suite against freshly generated metadata, not a stale data/ cache"): tests/setup.js only generates data/ when it's missing, so a leftover local cache is used without anyone noticing.

## Example and template content (agents are told these are "verified working examples")

5. it("validates every collection and indicator example against the full eodash schema")
6. it("compiles every jsonform and rasterform example schema with ajv")
7. it("references only existing widgets in templates/configs and scaffold configs"): the existing drift test (mcp-server.test.js:270) checks only the repo's templates/*.js, not the MCP's own templates/.

## Validator

8. it("validates against the bundled schema without network access"): validator.test.js downloads the live schemas today.
9. it("rejects a collection that only the full schema catches"), for example a wrongly shaped Resources entry. The current valid: true cases pass against either the full or the minimal schema, so they don't prove which one was used.

## generate_map_from_stac and @eodash/stac

10. it("renders the selected item for its own collection and the item nearest its date for every other collection"): this replaces indicator.test.js:225, which pins the current bug.
11. it("does not mutate the base layer array passed to normalizeBaseLayers")
12. it("fetches dates once per reader in getMapConfig"): today it fetches twice, which doubles the requests for API collections.
13. it("treats a STAC API URL without a .json suffix as an API") and it("treats a static catalog URL without .json as static when api is passed")
14. it("builds the same map with an axios-style client returning { data }"): the probe at stac-map.js:315 only works with fetch, and the tests pass by luck.

## Protocol and server

15. it("returns an isError result for invalid tool arguments"): only the unknown-widget case is tested, not zod rejecting bad input.
16. it("rejects POST / with a foreign Origin header"): this fails today (CORS *, no Origin check). It's the test for finding 11.

## Metadata extraction

17. it("lists exactly the exports of core/client/store/{states,actions,stac}.js"): the current metadata test only checks that the lists aren't empty, so a renamed or removed store export goes unnoticed.
18. it("never reports a stac store action as a store read"): the hardcoded action list in store-interactions.js:108-121 is already missing two actions.
