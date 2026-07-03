// Central registry of activity-log action strings so controllers never hand-type
// literals that could drift from the i18n keys the frontend expects.
const ACTIONS = {
  TABLE_OPEN: 'table.open',
  TABLE_CLOSE: 'table.close',
  TABLE_RELEASE: 'table.release',
  ORDER_CREATE: 'order.create',
  ORDER_ITEM_READY: 'order.item.ready',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_ITEM_DELIVERED: 'order.item.delivered',
  ORDER_SEND_TO_CASHIER: 'order.sendToCashier',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_PARTIAL: 'payment.partial',
  VIRTUAL_TABLE_CREATE: 'virtualTable.create',
  VIRTUAL_TABLE_DEACTIVATE: 'virtualTable.deactivate',
  ROLE_CREATE: 'role.create',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  ROLE_PERMISSIONS_UPDATED: 'role.permissionsUpdated',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
};

const TRACE_TYPES = ['order', 'tableSession', 'table', 'virtualTable', 'role', 'user'];

// Fixed per traceType — the collapsed feed row always renders the same
// headline template regardless of which action started/last touched the trace.
const TRACE_HEADLINE_KEYS = {
  order: 'log.trace.order',
  tableSession: 'log.trace.tableSession',
  table: 'log.trace.table',
  virtualTable: 'log.trace.virtualTable',
  role: 'log.trace.role',
  user: 'log.trace.user',
};

module.exports = { ACTIONS, TRACE_TYPES, TRACE_HEADLINE_KEYS };
