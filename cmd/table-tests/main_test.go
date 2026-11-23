package main

import "testing"

func clamp(value int) int {
	if value < 0 {
		return 0
	}
	if value > 10 {
		return 10
	}
	return value
}
func TestClamp(t *testing.T) {
	cases := []struct {
		name        string
		input, want int
	}{
		{"low", -1, 0},
		{"middle", 5, 5},
		{"high", 11, 10},
	}
	for _, test := range cases {
		t.Run(test.name, func(t *testing.T) {
			if got := clamp(test.input); got != test.want {
				t.Fatalf("got %d want %d", got, test.want)
			}
		})
	}
}
