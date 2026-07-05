# Problem Statement — Proxima Gov

## Context

Lok Sabha constituencies span hundreds of millions of citizens, yet most residents have **no structured digital channel** to report local development needs or track whether their Member of Parliament acted on them. MPLADS and related schemes fund roads, schools, and health infrastructure — but visibility and accountability remain fragmented.

## Core Problems

1. **Citizen disconnection** — Residents cannot see MPLADS work, submit constituency-scoped issues, or verify completion.
2. **Wrong-channel grievances** — Passport, police, income-tax, and personal job pleas reach MP offices without triage, wasting executive time.
3. **No closed-loop accountability** — Complaints lack stages, photo evidence, citizen verification, and measurable impact.
4. **MP operational blind spots** — MPs lack a single dashboard for pending approvals, delays, and constituency-specific execution.
5. **Trust deficit** — Opaque processes reduce confidence in digital governance initiatives.

## Our Solution

Proxima Gov delivers **dual portals** (citizen + MP) with:

- OTP citizen auth and constituency-scoped MP PIN login
- **AI jurisdiction triage** before issues reach the MP dashboard
- Full **lifecycle tracking** from submission → MP approval → contractor work → photo progress → citizen verification → impact analysis
- **Public transparency** dashboard and FAQ for judges and citizens
- SQLite / MongoDB persistence for demo and production paths

## Success Criteria

| Stakeholder | Outcome |
|-------------|---------|
| Citizen | Submit eligible community issues, track status, verify completed work |
| MP | Approve triaged issues, upload progress photos, act on delays |
| Public / judges | Audit transparency data and understand the governance loop |
| Platform | Secure, tested, accessible, and aligned with Digital India / Lok Sabha mandate |

See also: [README.md](README.md) · [LIFECYCLE.md](LIFECYCLE.md) · [ARCHITECTURE.md](ARCHITECTURE.md)