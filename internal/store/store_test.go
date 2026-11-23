package store

import (
	"bytes"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestSaveReopenAndSort(t *testing.T) {
	path := filepath.Join(t.TempDir(), "people.gdb")
	db, err := Open(path)
	if err != nil {
		t.Fatal(err)
	}
	for _, row := range []Row{{2, "Lin", 75}, {1, "Ada", 42}} {
		db, err = db.Insert(row)
		if err != nil {
			t.Fatal(err)
		}
	}
	if err = Save(path, db); err != nil {
		t.Fatal(err)
	}
	reopened, err := Open(path)
	if err != nil {
		t.Fatal(err)
	}
	if reopened.Generation != 2 || len(reopened.Rows) != 2 || reopened.Rows[0].ID != 1 {
		t.Fatalf("wrong snapshot: %+v", reopened)
	}
	row, found := reopened.Get(2)
	if !found || row.Name != "Lin" {
		t.Fatalf("wrong lookup: %+v %v", row, found)
	}
	if _, found = reopened.Get(3); found {
		t.Fatal("missing key was reported present")
	}
}

func TestRejectionPreservesMemoryAndFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "people.gdb")
	db := empty()
	db, err := db.Insert(Row{1, "Ada", 42})
	if err != nil {
		t.Fatal(err)
	}
	if err = Save(path, db); err != nil {
		t.Fatal(err)
	}
	before, _ := os.ReadFile(path)
	if _, err = db.Insert(Row{1, "Duplicate", 50}); !errors.Is(err, ErrDuplicate) {
		t.Fatalf("expected duplicate: %v", err)
	}
	for _, row := range []Row{{2, "Bad", 101}, {2, "", 50}, {2, strings.Repeat("é", 17), 50}, {2147483648, "Bad", 50}} {
		if _, err = db.Insert(row); err == nil {
			t.Fatalf("accepted invalid row: %+v", row)
		}
	}
	after, _ := os.ReadFile(path)
	if !bytes.Equal(before, after) || len(db.Rows) != 1 {
		t.Fatal("rejection changed previous state")
	}
}

func TestCorruptionDoesNotCreateEmptyReplacement(t *testing.T) {
	path := filepath.Join(t.TempDir(), "people.gdb")
	db, _ := empty().Insert(Row{1, "Ada", 42})
	if err := Save(path, db); err != nil {
		t.Fatal(err)
	}
	data, _ := os.ReadFile(path)
	damaged := bytes.Replace(data, []byte(`"score":42`), []byte(`"score":43`), 1)
	if err := os.WriteFile(path, damaged, 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := Open(path); err == nil {
		t.Fatal("accepted corruption")
	}
	after, _ := os.ReadFile(path)
	if !bytes.Equal(after, damaged) {
		t.Fatal("opening corruption overwrote the file")
	}
}

func TestInvalidSnapshotDoesNotReplaceFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "people.gdb")
	good, _ := empty().Insert(Row{1, "Ada", 42})
	if err := Save(path, good); err != nil {
		t.Fatal(err)
	}
	before, _ := os.ReadFile(path)
	bad := good
	bad.Rows = []Row{{1, "Ada", 42}, {1, "Lin", 50}}
	if err := Save(path, bad); err == nil {
		t.Fatal("accepted duplicate snapshot")
	}
	after, _ := os.ReadFile(path)
	if !bytes.Equal(before, after) {
		t.Fatal("failed save replaced valid file")
	}
}
