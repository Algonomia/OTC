## Overview

The Obligation Due Dates API provides programmatic access to transfer pricing obligation data across jurisdictions worldwide.

It exposes endpoints to query obligation lines, manage sources, submit values, and rate existing data.

---

## Authentication

API endpoint is https://opentaxcalendar.com/back/api
All protected endpoints require an **API key** passed via the `x-api-key` HTTP header.

### How to obtain an API key

1. **Sign in** to the platform using your LinkedIn account.
2. Navigate to your **profile settings**.
3. Go to the **API Keys** section.
4. Click **Create a new key** and set an expiration date.
5. Copy the generated key — it will only be shown once.

### Usage

Include the key in every request header:

```
x-api-key: your-api-key-here
```

### Key lifecycle

| Action | Description |
|--------|-------------|
| **Create** | Generate a new key with a custom expiration date |
| **Revoke** | Delete one or multiple keys at any time |
| **Expiration** | Keys automatically expire at the date set during creation |

> API keys grant the same permissions as your user account. Keep them secret and rotate them regularly.

---

## Core concepts

### Obligations

An obligation is a transfer pricing compliance requirement identified by its **type** and **jurisdiction** (ISO 3166-1 alpha-2 country code).

Available obligation types:

| ID | Description |
|----|-------------|
| `MasterFile` | Master File documentation |
| `LocalFile` | Local File documentation |
| `CbCR` | Country-by-Country Report |
| `PublicCbCR` | Public Country-by-Country Report |
| `CbCRNotification` | CbCR Notification |
| `AnnualTPForm` | Annual Transfer Pricing Form |
| `GIR` | Globe Information Return |
| `GIRNotification` | GIR Notification |
| `QDMTT` | Qualified Domestic Minimum Top-up Tax |
| `CIT` | Corporate Income Tax |
| `TPDocOther` | Other TP Documentation |
| `AnnualAPAReport` | Annual APA Report |
| `PEAuxiliaryCalculation` | PE Auxiliary Calculation |
| `ContemporaneousTPDocumentation` | Contemporaneous TP Documentation |
| `USSec6662Documentation` | US Section 6662 Documentation |
| `MasterFileNotification` | Master File Notification |
| `SITDisclosure` | SIT Disclosure |
| `RelatedPartyDisclosure` | Related Party Disclosure |
| `SpecialItemReport` | Special Item Report |

### Indicators

Each obligation has a set of **indicators** describing specific attributes:

| ID | Description |
|----|-------------|
| `IsObligationInPlace` | Whether the obligation exists |
| `ScopeOfObligation` | Scope and applicability |
| `FilingResponsibility` | Who is responsible for filing |
| `ParentFilingExemption` | Parent filing exemption rules |
| `ApplicableEntityTypes` | Entity types subject to the obligation |
| `SubmissionMethod` | How to submit (electronic, paper, etc.) |
| `SubmissionURL` | Submission portal URL |
| `LocalLanguage` | Required filing language |
| `EnglishAccepted` | Whether English is accepted |
| `Penalty` | Penalty for non-compliance |
| `Threshold` | Revenue/transaction threshold |
| `DeadlineFiling` | Filing deadline |
| `DeadlinePreparation` | Preparation deadline |
| `DeadlineExtension` | Extension rules |

### Sources

Sources are the references backing the data (official publications, legal texts, regulatory documents). They can be either **file uploads** or **URL links**, and go through a validation workflow including malware scanning and admin review.

### Values & Ratings

Users can **suggest values** for any indicator on any obligation-jurisdiction pair. Each suggestion goes through an **admin validation** workflow. Other users can **rate** existing values to build consensus on data quality.

---

## Roles & Permissions

| Role | Capabilities |
|------|-------------|
| **User** | Query data, suggest values, rate data, manage own API keys |
| **Trusted User** | Same as User, but suggested values are auto-accepted |
| **Admin** | All of the above + validate/reject sources and values |

---

## Error handling

All endpoints return standard HTTP status codes:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request — invalid input or validation failure |
| `401` | Unauthorized — missing or invalid API key |
| `500` | Internal server error |

Error responses include a `message` field describing the issue.
