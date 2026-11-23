package main

import (
	"path/filepath"
	"testing"
)

func TestUsageAndMissingFile(t *testing.T) {
	if run(nil) == nil {
		t.Fatal("missing arguments accepted")
	}
	path := filepath.Join(t.TempDir(), "people.gdb")
	if run([]string{path, "get", "1"}) == nil {
		t.Fatal("missing id accepted")
	}
	if err := run([]string{path, "insert", "1", "Ada", "42"}); err != nil {
		t.Fatal(err)
	}
	if err := run([]string{path, "get", "1"}); err != nil {
		t.Fatal(err)
	}
	if run([]string{path, "insert", "1", "Lin", "75"}) == nil {
		t.Fatal("duplicate accepted")
	}
}
