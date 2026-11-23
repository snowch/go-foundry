package store

import "errors"

// Update returns a new snapshot without changing the original rows.
func (db Snapshot) Update(row Row) (Snapshot, error) {
	if err := row.validate(); err != nil {
		return Snapshot{}, err
	}
	if _, found := db.Get(row.ID); !found {
		return Snapshot{}, ErrMissing
	}
	if db.Generation == ^uint64(0) {
		return Snapshot{}, errors.New("generation overflow")
	}
	next := Snapshot{Format: db.Format, Generation: db.Generation + 1, Rows: append([]Row{}, db.Rows...)}
	for i := range next.Rows {
		if next.Rows[i].ID == row.ID {
			next.Rows[i] = row
			break
		}
	}
	return next, nil
}

// Delete returns a new snapshot with the requested existing row removed.
func (db Snapshot) Delete(id uint64) (Snapshot, error) {
	if _, found := db.Get(id); !found {
		return Snapshot{}, ErrMissing
	}
	if db.Generation == ^uint64(0) {
		return Snapshot{}, errors.New("generation overflow")
	}
	next := Snapshot{Format: db.Format, Generation: db.Generation + 1, Rows: []Row{}}
	for _, row := range db.Rows {
		if row.ID != id {
			next.Rows = append(next.Rows, row)
		}
	}
	return next, nil
}

// Transaction publishes the returned candidate only when all edits and validation
// succeed. It clones the input first so a callback cannot mutate the old rows.
func (db Snapshot) Transaction(edit func(Snapshot) (Snapshot, error)) (Snapshot, error) {
	candidate := Snapshot{Format: db.Format, Generation: db.Generation, Rows: append([]Row{}, db.Rows...)}
	candidate, err := edit(candidate)
	if err != nil {
		return db, err
	}
	if err = candidate.validate(); err != nil {
		return db, err
	}
	return candidate, nil
}
