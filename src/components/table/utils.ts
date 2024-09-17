export function emptyRows(page: number, rowsPerPage: number, arrayLength: number) {
  return page ? Math.max(0, (1 + page) * rowsPerPage - arrayLength) : 0
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  // Handle null cases
  if (a[orderBy] === null) {
    return 1
  }
  if (b[orderBy] === null) {
    return -1
  }

  // Handle undefined cases
  if (a[orderBy] === undefined && b[orderBy] === undefined) {
    return 0
  }
  if (a[orderBy] === undefined) {
    return 1
  }
  if (b[orderBy] === undefined) {
    return -1
  }

  // normal cases
  if (a[orderBy] === null) {
    return 1
  }
  if (b[orderBy] === null) {
    return -1
  }
  if (b[orderBy] < a[orderBy]) {
    return -1
  }
  if (b[orderBy] > a[orderBy]) {
    return 1
  }
  return 0
}

export function getComparator<Key extends keyof any>(
  order: 'asc' | 'desc',
  orderBy: Key
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}
