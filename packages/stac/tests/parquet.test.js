import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { gzipSync } from "node:zlib";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { createEodashCollection } from "../src/index.js";
import { serveUrls, stacCollection } from "../../../tests/support/stac.js";

/**
 * A real mirror, small enough to commit: three items in one row group, written
 * newest first. Reading it over http is the whole point of this reader, so it
 * is served rather than handed over as a buffer — a buffer would exercise
 * neither the range reads nor the byte offsets that made it break against
 * GitHub Pages.
 */
const FIXTURE = await readFile(
  new URL(
    "../../../tests/support/assets/stormtracker.parquet",
    import.meta.url,
  ),
);

/** Stands in for the app's axios instance, which the reader reads through. */
const client = { get: vi.fn() };

/**
 * The mirror as a host serves it: ranges answered against the file's real
 * length, a HEAD answered with the gzipped one the way GitHub Pages does.
 * Every range handed out is recorded, so a test can ask what a read cost.
 *
 * @param {Buffer} bytes
 */
const startMirrorHost = async (bytes) => {
  const gzipped = gzipSync(bytes);
  /** @type {number[]} */
  const transfers = [];
  let failing = false;
  const server = createServer((request, response) => {
    if (failing) {
      response.writeHead(500);
      return response.end();
    }
    if (request.method === "HEAD") {
      response.writeHead(200, {
        "content-encoding": "gzip",
        "content-length": String(gzipped.length),
      });
      return response.end();
    }
    const [from, to] = (request.headers.range ?? "")
      .replace("bytes=", "")
      .split("-");
    const start = Number(from);
    const end = to ? Number(to) : bytes.length - 1;
    transfers.push(end - start + 1);
    response.writeHead(206, {
      "content-range": `bytes ${start}-${end}/${bytes.length}`,
      "content-length": String(end - start + 1),
    });
    response.end(bytes.subarray(start, end + 1));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = /** @type {import("node:net").AddressInfo} */ (
    server.address()
  );
  return {
    url: `http://127.0.0.1:${port}`,
    transfers,
    transferred: () => transfers.reduce((total, bytes) => total + bytes, 0),
    /** @param {boolean} value answer everything with a 500 while set */
    setFailing: (value) => {
      failing = value;
    },
    close: () => new Promise((resolve) => server.close(() => resolve(null))),
  };
};

/** @type {Awaited<ReturnType<typeof startMirrorHost>>} */
let host;

describe("parquet collection", () => {
  beforeAll(async () => {
    host = await startMirrorHost(FIXTURE);
  });

  afterAll(() => host.close());

  beforeEach(() => {
    client.get.mockReset();
    host.transfers.length = 0;
    host.setFailing(false);
  });

  /**
   * A collection stating no items of its own, so anything the reader answers
   * came out of the mirror. The href is relative, the way a catalog writes it.
   */
  const mirrorCollection = () => {
    const url = `${host.url}/collection.json`;
    serveUrls(client, {
      [url]: stacCollection({
        id: "storm",
        assets: {
          mirror: {
            href: "items.parquet",
            type: "application/vnd.apache.parquet",
            roles: ["collection-mirror"],
          },
        },
        extent: {
          spatial: { bbox: [[-180, -90, 180, 90]] },
          temporal: {
            interval: [
              ["2024-07-31T23:59:59.999Z", "2026-01-31T23:59:59.999Z"],
            ],
          },
        },
      }),
    });
    return createEodashCollection(url, { client });
  };

  test("a failed read is not remembered, so the next one retries", async () => {
    const col = await mirrorCollection();
    host.setFailing(true);

    await expect(col.getDates()).rejects.toThrow();
    host.setFailing(false);

    expect(await col.getDates()).toHaveLength(3);
  });

  test("is dispatched to by the mirror asset alone, with no flag from the caller", async () => {
    expect((await mirrorCollection()).kind).toBe("parquet");
  });

  test("getDates returns every item's datetime, oldest first", async () => {
    const col = await mirrorCollection();

    const dates = await col.getDates();

    // the mirror is written newest first, so this is a sort and not row order
    expect(dates.map((date) => date.toISOString())).toEqual([
      "2024-08-01T00:00:00.000Z",
      "2025-01-31T23:59:59.999Z",
      "2025-07-31T23:59:59.999Z",
    ]);
  });

  test("getItem resolves the datetime to that item, whatever row it sits on", async () => {
    const col = await mirrorCollection();

    const item = await col.getItem(new Date("2024-09-01T00:00:00Z"));

    // the oldest datetime is the mirror's last row, so the row a datetime was
    // read from has to travel with it
    expect(item?.id).toBe("2025-1");
    // a timestamp column decodes to a Date, unlike a catalog's RFC 3339 string
    expect(new Date(item?.properties.datetime ?? "").toISOString()).toBe(
      "2024-08-01T00:00:00.000Z",
    );
    expect(item?.assets).toBeTruthy();
  });

  // the fixture is written newest first, so file order would fail this
  test("getItems is ordered oldest first", async () => {
    const col = await mirrorCollection();

    const items = await col.getItems();

    expect(items.map((item) => item.id)).toEqual([
      "2025-1",
      "2025-7",
      "2026-1",
    ]);
  });

  test("getTemporalExtent comes from the collection's own extent", async () => {
    const col = await mirrorCollection();

    expect(await col.getTemporalExtent()).toEqual({
      start: new Date("2024-07-31T23:59:59.999Z"),
      end: new Date("2026-01-31T23:59:59.999Z"),
    });
  });

  describe("what it pulls off the wire", () => {
    test("getDates transfers the datetime column, not every column", async () => {
      const col = await mirrorCollection();

      await col.getDates();

      // opening the mirror reads its footer, which spans this fixture whole —
      // it is smaller than the window hyparquet is given. What a read costs on
      // top of that is the column data it asked for.
      expect(host.transferred() - FIXTURE.length).toBeLessThan(
        FIXTURE.length / 10,
      );
    });

    test("a second getItem transfers nothing", async () => {
      const col = await mirrorCollection();
      await col.getItem(new Date("2025-06-01T00:00:00Z"));
      host.transfers.length = 0;

      await col.getItem(new Date("2024-09-01T00:00:00Z"));

      expect(host.transfers).toHaveLength(0);
    });

    test("getItems does not re-read the mirror after getItem", async () => {
      const col = await mirrorCollection();
      await col.getItem();
      host.transfers.length = 0;

      const items = await col.getItems();

      expect(items).toHaveLength(3);
      expect(host.transfers).toHaveLength(0);
    });

    test("the mirror size comes from a range, which the host's gzip cannot distort", async () => {
      // the fixture host lies the way GitHub Pages does: it gzips, so a HEAD
      // reports the compressed length and a footer read sized by it would land
      // in the middle of the file
      const head = await fetch(`${host.url}/items.parquet`, { method: "HEAD" });
      expect(Number(head.headers.get("content-length"))).toBeLessThan(
        FIXTURE.length,
      );

      const col = await mirrorCollection();

      expect(await col.getDates()).toHaveLength(3);
    });
  });
});

/**
 * The one test left on the network: what is characterized here is the host's
 * behaviour, which no local server can be evidence for. Everything else about
 * this reader is pinned against the fixture above.
 */
describe("a mirror published on GitHub Pages", () => {
  const COLLECTION_URL =
    "https://eoxhub-workspaces.github.io/eoxhub-test-catalog/catalog/N2_CO2_mean/N2_CO2_mean/collection.json";
  const MIRROR_URL = COLLECTION_URL.replace("collection.json", "items.parquet");

  /** The mirror as published: 2496 items, 313kB, one row group. */
  const MIRROR_BYTES = 312988;

  test("reports a compressed length on HEAD, and its real one on a range", async () => {
    const head = await fetch(MIRROR_URL, { method: "HEAD" });
    const ranged = await fetch(MIRROR_URL, { headers: { Range: "bytes=0-0" } });
    const total = Number(
      ranged.headers.get("content-range")?.split("/").at(-1),
    );

    expect(total).toBe(MIRROR_BYTES);
    expect(Number(head.headers.get("content-length"))).toBeLessThan(total);
    // and the reader still opens it
    const col = await createEodashCollection(COLLECTION_URL);
    expect(await col.getDates()).toHaveLength(2496);
  });
});
