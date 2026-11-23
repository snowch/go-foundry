package main

import (
	"context"
	"fmt"
)

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	values, done := make(chan int), make(chan struct{})
	go func() {
		defer close(done)
		defer close(values)
		for value := 1; ; value++ {
			select {
			case values <- value:
			case <-ctx.Done():
				return
			}
		}
	}()
	fmt.Println("first", <-values)
	cancel()
	<-done
	fmt.Println("producer stopped")
}
