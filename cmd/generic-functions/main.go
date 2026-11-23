package main

import (
	"fmt"
)

func add[T int | int64](left, right T) T { return left + right }

func main() {
	fmt.Println("int", add(2, 3))
	var left int64 = 4
	var right int64 = 5
	fmt.Println("int64", add(left, right))
}
