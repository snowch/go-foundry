// Commands travel as files, never as source text typed into the guest shell.
export const quote = value => "'" + value.replaceAll("'", "'\\''") + "'";
export const workspace = '/root/work/go-foundry';
export const archiveLimit = 32 * 1024 * 1024;
export function validateJob(data) {
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(data.id || '') || typeof data.command !== 'string' || data.command.length > 8000) throw Error('Invalid run request.');
  if (data.source !== undefined && (typeof data.source !== 'string' || new TextEncoder().encode(data.source).length > 1048576 || typeof data.path !== 'string' || !data.path.startsWith(workspace + '/') || !/^[a-zA-Z0-9_./-]+$/.test(data.path) || data.path.split('/').includes('..') || !data.path.endsWith('.go'))) throw Error('Invalid editor transfer.');
}
export function jobScript(data) {
  validateJob(data);
  const stem = '/exchange/job-' + data.id;
  return `#!/bin/sh
export FOUNDRY_STATUS_FILE=${quote(stem + '.phase')}
# Finite file output; interactive input is available in the optional terminal.
(cd ${quote(workspace)} && ${data.source === undefined ? '' : 'cp ' + quote(stem + '.source') + ' ' + quote(data.path) + ' && '}( ${data.command}\n)) </dev/null >${quote(stem + '.output')} 2>&1
job_code=$?
printf 'saving' >${quote(stem + '.phase')}
tar czf ${quote(stem + '.archive')} --exclude='go-foundry/.bin' --exclude='go-foundry/.go-cache' --exclude='go-foundry/.go-path' -C /root/work go-foundry
printf '%s' "$?" >${quote(stem + '.saved')}
printf '%s' "$job_code" >${quote(stem + '.exit')}
`;
}
export function cancelScript(id) {
  validateJob({id, command: ''});
  const stem = '/exchange/job-' + id;
  // Freeze parents before finding children: the Go helper starts separate process
  // groups, so signalling only the shell's process group leaves compilers alive.
  return `#!/bin/sh
stop_tree() {
  kill -STOP "$1" 2>/dev/null || return
  for child in $(ps -o pid,ppid | awk -v parent="$1" '$2 == parent {print $1}'); do stop_tree "$child"; done
  kill -KILL "$1" 2>/dev/null
}
if ! test -f ${quote(stem + '.exit')}; then
  stop_tree "$(cat ${quote(stem + '.pid')})"
  printf 'saving' >${quote(stem + '.phase')}
  tar czf ${quote(stem + '.archive')} --exclude='go-foundry/.bin' --exclude='go-foundry/.go-cache' --exclude='go-foundry/.go-path' -C /root/work go-foundry
  printf '%s' "$?" >${quote(stem + '.saved')}
  printf '130' >${quote(stem + '.exit')}
fi
`;
}
