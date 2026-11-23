package main

import (
	"errors"
	"testing"
)

type NameSource interface{ Name() (string, error) }
type fakeSource struct {
	value  string
	failed bool
}

func (f fakeSource) Name() (string, error) {
	if f.failed {
		return "", errors.New("synthetic failure")
	}
	return f.value, nil
}
func loadLabel(source NameSource) string {
	value, err := source.Name()
	if err != nil {
		return "unavailable"
	}
	return "loaded " + value
}
func TestLoadLabel(t *testing.T) {
	if got := loadLabel(fakeSource{value: "Ada"}); got != "loaded Ada" {
		t.Fatalf("unexpected label %q", got)
	}
}
