// ── Default quota sets ──────────────────────────────────────────────────────
// Determines which quotas should be auto-created for a college based on its
// type (government / private / deemed) and, for government colleges, whether
// it's a Central or State institution (govt_subcategory).
//
// Rules:
// - Government + Central: All India Quota = UR, EWS, OBC, SC, ST (no state quota)
// - Government + State:    All India Quota = UR, EWS, OBC, SC, ST
//                           + State Quota   = GEN, EWS, OBC, SC, ST
// - Private / Deemed:      All India Quota = GEN, MGT, NRI
//                           + State Quota   = UR, EWS, OBC, SC, ST, MGT
//                           (subcategory does not apply)

const GOVT_CENTRAL_AIQ = ['UR', 'EWS', 'OBC', 'SC', 'ST']
const GOVT_STATE_AIQ = ['UR', 'EWS', 'OBC', 'SC', 'ST']
const GOVT_STATE_STATEQ = ['GEN', 'EWS', 'OBC', 'SC', 'ST']
const PRIVATE_AIQ = ['GEN', 'MGT', 'NRI']
const PRIVATE_STATEQ = ['UR', 'EWS', 'OBC', 'SC', 'ST', 'MGT']

// Returns an array of { name, quota_type } objects for the default quotas.
// govt_subcategory: 'central' | 'state' | null (only relevant when type === 'government')
export function getDefaultQuotas(type, govtSubcategory) {
  if (type === 'government') {
    if (govtSubcategory === 'state') {
      return [
        ...GOVT_STATE_AIQ.map(name => ({ name, quota_type: 'all_india' })),
        ...GOVT_STATE_STATEQ.map(name => ({ name, quota_type: 'state' })),
      ]
    }
    // default to 'central' if unset
    return GOVT_CENTRAL_AIQ.map(name => ({ name, quota_type: 'all_india' }))
  }

  // private / deemed — always both sets, subcategory not applicable
  return [
    ...PRIVATE_AIQ.map(name => ({ name, quota_type: 'all_india' })),
    ...PRIVATE_STATEQ.map(name => ({ name, quota_type: 'state' })),
  ]
}
