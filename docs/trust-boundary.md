# What a passing receipt means

The reference implementation checks consistency among supplied material, policy, timestamps, check records and artifact bytes. Its output always includes `semantically_validated: false`.

An accepted record does **not** establish:

- Who created it, or whether a person/model actually reviewed anything.
- Whether declared inspected-item counts are truthful.
- Whether tests were run or their reported output was fabricated.
- Whether the material is the complete Git diff or the intended revision.
- Whether the code is correct, safe, useful or ready to merge.

The `forged-but-consistent` case is intentionally accepted and remains a required test. A producer that can replace both a receipt and its artifacts can make matching hashes. Signatures, trusted execution and independent evidence collection address different parts of that problem; this lab implements none of those mechanisms.

## Format and file handling

This is a local teaching format, not EvidenceGate, in-toto or SLSA conformance. Material and policy digests cover exact bytes. Receipts are parsed as JSON. Policy values and check identities are validated by `src/evidence.mjs`.

The file CLI limits each input to 512 KiB and combined material, policy and artifact bytes to 8 MiB. Artifact IDs are plain filenames, not paths. Artifact real paths must remain inside the supplied artifact directory. Missing referenced files become failed findings. Invalid JSON, inaccessible input, path escape and invalid invocation produce an input error and exit code 2.

These bounds reduce accidental mistakes in this CLI. They do not make it a sandbox for hostile concurrent filesystem writers. Use a controlled local fixture directory. The library API expects caller-supplied byte buffers and does not implement the CLI's filesystem bounds.

## Reporting

Keep three evidence types separate: code exists; code was executed; another person obtained a useful result. Synthetic tests establish only the second for their stated inputs. No case is a real user testimonial. Never turn “17 expected outcomes matched” into a detection rate for real-world reviews.
