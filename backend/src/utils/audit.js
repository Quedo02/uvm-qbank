import { AuditLog } from '../models/index.js';

export async function audit({ actorId, entity, entityId, action, before=null, after=null, meta=null }) {
  try {
    await AuditLog.create({
      actor_id: actorId, entity, entity_id: entityId, action, before, after, meta
    });
  } catch (e) {
    console.error('Audit error:', e.message);
  }
}
