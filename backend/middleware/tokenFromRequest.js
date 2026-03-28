/** Parse Authorization: Bearer <token> (case-insensitive), trim whitespace. */
function tokenFromRequest(req) {
  const raw = req.header('Authorization') || req.header('authorization') || '';
  if (typeof raw !== 'string') return '';
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return (m ? m[1] : raw).trim();
}

module.exports = tokenFromRequest;
