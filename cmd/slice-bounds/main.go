package main

import (
	"fmt"
)

func main() {
	values := []int{2, 4, 6, 8}
	middle := values[1:3]
	fmt.Println("len", len(middle), "values", middle)
}
