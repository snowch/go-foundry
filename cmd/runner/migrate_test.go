package main

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
)

func TestLegacyHelperMigrationPreservesEdits(t *testing.T) {
	for _, fixture := range []string{"legacy_runner.go", "intro_runner.go"} {
		original, err := os.ReadFile(filepath.Join("testdata", fixture))
		if err != nil {
			t.Fatal(err)
		}
		for _, edited := range []bool{false, true} {
			root := t.TempDir()
			path := filepath.Join(root, "cmd", "runner", "main.go")
			if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
				t.Fatal(err)
			}
			input := original
			if edited {
				input = append(append([]byte{}, original...), []byte("\n// my edit\n")...)
			}
			if err := os.WriteFile(path, input, 0644); err != nil {
				t.Fatal(err)
			}
			migrateLegacyHelper(root)
			result, err := os.ReadFile(path)
			if err != nil {
				t.Fatal(err)
			}
			if edited && string(result) != string(input) {
				t.Fatal("learner edit changed")
			}
			if !edited && !bytes.Equal(result, canonicalHelper) {
				t.Fatal("stock helper did not migrate")
			}
		}
	}
}
