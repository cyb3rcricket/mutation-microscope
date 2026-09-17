# Scientific Provenance Classification

Mutation Microscope classifies scientific data by how directly it can be traced to its original source.

Every scientific value should use one of the following evidence classes.

## `live_api`

Returned directly from an AlphaGenome API request.

Use this only when the value was retrieved programmatically from the API and preserved with retrieval metadata.

Expected metadata:

* source
* scorer, when applicable
* biosample, when applicable
* retrievedAt

## `atlas`

Returned directly from AlphaGenome Atlas.

Use this only for values explicitly retrieved from Atlas, such as confirmed Atlas-specific variant-impact data.

## `published_exact`

An exact value, coordinate, sequence, or result explicitly reported in a cited publication, official AlphaGenome example, or authoritative genomic reference.

The source should be specific enough for another person to locate the original value.

## `derived`

Calculated or transformed from one or more traceable source values.

Examples include:

* ALT − REF calculations
* percentile conversion
* normalization
* deterministic downsampling
* derived summary statistics

The transformation must be documented.

## `reconstructed`

Recreated or approximated from a published figure, plot, screenshot, narrative description, or other source that does not provide the exact displayed values directly.

Reconstructed data may represent a genuine published result, but the displayed numerical values are not claimed to be exact source values.

Reconstructed data is not automatically illustrative.

## `illustrative`

Synthetic or intentionally constructed data used to explain a concept, demonstrate interface behavior, or provide an educational control.

Illustrative values must never be presented as direct model output or exact published results.

---

## Important distinction

`reconstructed` and `illustrative` are not the same.

A reconstructed visualization may approximate a real published AlphaGenome result.

Illustrative data is intentionally synthetic and exists primarily for explanation or demonstration.

---

## General rule

If the repository cannot demonstrate that a value is exact, it must not be labeled as exact.

When evidence is uncertain, use the more conservative classification.
