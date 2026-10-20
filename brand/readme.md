# CaseFusion brand assets

The CaseFusion marks, owned by Ona Insights. The GPLv3 licence of the code does not grant rights to the name or these
marks.

## App icon

Two interlocking rounded squares in white on a rounded tile. **Yellow is the default**; red, green and teal are
acceptable variations (for example to tell environments or implementations apart).

| File                         | Use                                                    |
| ---------------------------- | ------------------------------------------------------ |
| `casefusion-icon.svg`        | Default icon: yellow tile `#ffc342`                    |
| `casefusion-icon-red.svg`    | Variation: red tile `#eb675b`                          |
| `casefusion-icon-green.svg`  | Variation: green tile `#83ce4f`                        |
| `casefusion-icon-teal.svg`   | Variation: teal tile `#30b2b4`                         |
| `casefusion-icon.png`        | Default icon, 512 × 512, for places that need a raster |
| `casefusion-glyph-white.svg` | Glyph only, white, for use on a coloured background    |
| `casefusion-glyph.svg`       | Glyph only, charcoal `#4e4e50`, for light backgrounds  |

The SVGs are flat vectors traced from the original artwork in `source/`; the tile colours are sampled from it. The
originals have a slight gradient and shadow, which the flat versions drop so they stay crisp at favicon sizes.

## Wordmark

"CaseFusion" as one word with no space, no symbol, no icon, no tagline:

- Typeface: Mulish Light. "Case" upright in dark charcoal `#4e4e50`; "Fusion" follows with no gap, in Mulish Light
  Italic, in warm sunshine yellow `#ffc342`.
- Capital C and capital F, all other letters lowercase. Letter-spacing slightly tight (−1.5 %), baseline aligned across
  both halves.
- Flat: no shadow, gradient, outline, texture or 3D, no extra words or decorative elements. Calm, modern, editorial.
- On a plain white background, large and centred, in a wide landscape composition when used on its own.

| File                            | Use                                                                   |
| ------------------------------- | --------------------------------------------------------------------- |
| `casefusion-wordmark.svg`       | Wordmark, tight bounds, transparent background                        |
| `casefusion-wordmark-white.svg` | Wordmark centred on white, 2.5 : 1 landscape                          |
| `casefusion-wordmark.png`       | Same as above, 2400 × 960                                             |
| `casefusion-wordmark-dark.svg`  | For dark backgrounds only: "Case" in `#f2f2f2`, "Fusion" stays yellow |

The wordmark SVGs are the actual Mulish glyph outlines converted to paths, so they need no font installed. Mulish is
licensed under the SIL Open Font License 1.1.

## Colours

| Name     | Hex       |
| -------- | --------- |
| Yellow   | `#ffc342` |
| Charcoal | `#4e4e50` |
| Red      | `#eb675b` |
| Green    | `#83ce4f` |
| Teal     | `#30b2b4` |

## Where the app uses them

- Module bar, sign-in page and share page: the white glyph on the project colour, which defaults to yellow
  (`DEFAULT_BRAND_COLOR` in `app/src/constants.ts`) when the project has no colour of its own.
- Favicon: `app/public/favicon.ico` (yellow icon) before the app loads, then a generated icon in the project colour
  (`app/src/utils/set-favicon.ts`).
- Emails: `app/public/img/casefusion-white.png` (white glyph) on the project colour.
- Settings footer: the glyph as the `directus` custom icon (name kept for compatibility).

## Source

`source/` holds the original artwork as supplied (2752 × 1536 JPEG): the four icon colours and the wordmark.
