package main

import (
	"fmt"
)

func main() {
	values := make([]int, 2, 4)
	beforeCapacity := cap(values)
	fmt.Println("before", len(values), beforeCapacity)
	values = append(values, 7, 8)
	fmt.Println("after length", len(values), "grew", cap(values) > beforeCapacity)
	fmt.Println("values", values)
}
