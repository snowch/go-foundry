package store

import (
	"errors"
	"testing"
)

func TestCopyOnWriteAndTransactionRollback(t *testing.T) {
	db := empty()
	db, err := db.Insert(Row{ID: 7, Name: "Ada", Score: 42})
	if err != nil {
		t.Fatal(err)
	}
	changed, err := db.Update(Row{ID: 7, Name: "Ada", Score: 60})
	if err != nil {
		t.Fatal(err)
	}
	if db.Rows[0].Score != 42 || changed.Rows[0].Score != 60 {
		t.Fatal("update changed original")
	}
	removed, err := db.Delete(7)
	if err != nil || len(removed.Rows) != 0 || len(db.Rows) != 1 {
		t.Fatal("delete changed original", err)
	}
	for _, fail := range []bool{false, true} {
		next, err := db.Transaction(func(work Snapshot) (Snapshot, error) {
			work.Rows[0].Score = 70
			if fail {
				return work, errors.New("later action failed")
			}
			return work, nil
		})
		if db.Rows[0].Score != 42 {
			t.Fatal("callback mutated input")
		}
		if fail && (err == nil || next.Rows[0].Score != 42) {
			t.Fatal("rollback published candidate")
		}
		if !fail && (err != nil || next.Rows[0].Score != 70) {
			t.Fatal("valid commit failed")
		}
	}
	invalid, err := db.Transaction(func(work Snapshot) (Snapshot, error) { work.Rows[0].Score = 101; return work, nil })
	if err == nil || invalid.Rows[0].Score != 42 {
		t.Fatal("invalid transaction committed")
	}
}

func TestUpdateDeleteBoundaryErrors(t *testing.T) {
	db := empty()
	if _, err := db.Update(Row{ID: 7, Name: "Ada", Score: 42}); !errors.Is(err, ErrMissing) {
		t.Fatal(err)
	}
	if _, err := db.Delete(7); !errors.Is(err, ErrMissing) {
		t.Fatal(err)
	}
	db, err := db.Insert(Row{ID: 7, Name: "Ada", Score: 42})
	if err != nil {
		t.Fatal(err)
	}
	db.Generation = ^uint64(0)
	if _, err := db.Update(Row{ID: 7, Name: "Ada", Score: 60}); err == nil {
		t.Fatal("generation overflow")
	}
	if _, err := db.Delete(7); err == nil {
		t.Fatal("generation overflow")
	}
}
