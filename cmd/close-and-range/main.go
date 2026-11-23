package main

import (
	"fmt"
)

func main() {
	jobs := make(chan int)
	go func() {
		defer close(jobs)
		for value := 1; value <= 3; value++ {
			jobs <- value
		}
	}()
	sum := 0
	for value := range jobs {
		sum += value
	}
	fmt.Println("sum", sum)
}
