package main

import (
	"fmt"
)

func capAt(value, limit int) int {
	if value > limit {
		return limit
	}
	return value
}

func main() {
	fmt.Println("low", capAt(-2, 5), "middle", capAt(3, 5), "high", capAt(8, 5))
}
