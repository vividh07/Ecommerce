/** After logout, RequireAuth must not stash the previous protected path as `from`. */
let skipAuthFrom = false;

export function markSkipAuthFrom() {
  skipAuthFrom = true;
}

export function shouldSkipAuthFrom() {
  return skipAuthFrom;
}

export function clearSkipAuthFrom() {
  skipAuthFrom = false;
}
