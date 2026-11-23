package main

import (
	"fmt"
)

func main() {
	values := make(chan int)
	go func() { values <- 7 }()
	fmt.Println("received", <-values)
}
