package main

import (
	"fmt"
	"sync"
)

func double(value int) int { return value * 2 }

func main() {
	var group sync.WaitGroup
	group.Add(1)
	go func() { defer group.Done(); fmt.Println("worker", double(3)) }()
	group.Wait()
	fmt.Println("done")
}
