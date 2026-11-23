package main

import (
	"fmt"
)

func main() {
	values := make(chan int, 2)
	values <- 4
	values <- 8
	fmt.Println("queued", len(values), "capacity", cap(values))
	fmt.Println("first", <-values)
	fmt.Println("remaining", len(values))
}
