package main

import "testing"

func TestSquares(t *testing.T) {
	for _, test := range []struct {
		name   string
		values []int
		want   int
	}{
		{"empty", nil, 0},
		{"one", []int{5}, 25},
		{"duplicates and negative", []int{-2, 2, 3}, 17},
	} {
		t.Run(test.name, func(t *testing.T) {
			count, total := squares(test.values)
			if count != len(test.values) || total != test.want {
				t.Fatalf("received=%d sum=%d; want received=%d sum=%d", count, total, len(test.values), test.want)
			}
		})
	}
}
