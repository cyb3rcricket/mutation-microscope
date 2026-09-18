# Visual assets

| File | Purpose | Size |
| --- | --- | --- |
| `preview.png` | README dashboard screenshot of the live observatory UI | representative crop of the real app |
| `social-preview.png` | GitHub repository **Social preview** image | 1280×640 |

The production Open Graph image is `public/og-image.png` (1200×630), served at `https://mutation-microscope.vercel.app/og-image.png`.

## GitHub repository description and topics

The GitHub description and topics cannot be set from this environment (`gh repo edit` returns 403). After merge, from a token with `repo` administration scope:

```bash
gh repo edit cyb3rcricket/mutation-microscope \
  --description "Interactive multi-scale genomic observatory for Google DeepMind AlphaGenome variant-effect predictions with semantic zoom, REF/ALT visualization, and field-level scientific provenance." \
  --add-topic alphagenome \
  --add-topic genomics \
  --add-topic bioinformatics \
  --add-topic variant-effect-prediction \
  --add-topic applied-ai \
  --add-topic data-visualization \
  --add-topic react \
  --add-topic typescript
```

Do **not** change `--homepage`; it is already `https://mutation-microscope.vercel.app`.

## GitHub Social Preview (manual upload)

GitHub does not expose a stable public API for repository social-preview images. After merging:

1. Open [repository Settings → General](https://github.com/cyb3rcricket/mutation-microscope/settings).
2. Scroll to **Social preview**.
3. Upload `docs/assets/social-preview.png`.
4. Confirm the preview shows the Mutation Microscope observatory dashboard (not a generated Open Graph card).
