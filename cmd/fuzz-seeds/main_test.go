package main

import (
	"strings"
	"testing"
)

func FuzzTrim(f *testing.F) {
	f.Add("  Ada ")
	f.Add("")
	f.Fuzz(func(t *testing.T, text string) {
		once := strings.TrimSpace(text)
		if twice := strings.TrimSpace(once); twice != once {
			t.Fatalf("not idempotent: %q %q", once, twice)
		}
	})
}
