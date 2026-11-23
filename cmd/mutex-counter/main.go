package main

import (
	"fmt"
	"sync"
)

func main() {
	var lock sync.Mutex
	var group sync.WaitGroup
	count := 0
	for range 2 {
		group.Add(1)
		go func() {
			defer group.Done()
			for range 100 {
				lock.Lock()
				count++
				lock.Unlock()
			}
		}()
	}
	group.Wait()
	fmt.Println("count", count)
}
