package main

import (
	"fmt"
)

func makeCounter() func() int {
	count := 0
	return func() int { count++; return count }
}

func main() {
	next := makeCounter()
	first := next()
	second := next()
	fmt.Println("first", first, "second", second)
	other := makeCounter()
	fmt.Println("other", other())
}
