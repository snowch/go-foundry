package main

import "testing"

func double(value int) int { return value * 2 }
func TestDouble(t *testing.T) {
	got := double(3)
	want := 6
	if got != want {
		t.Fatalf("got %d want %d", got, want)
	}
}
