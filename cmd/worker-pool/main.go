package main

import (
	"fmt"
	"sort"
	"sync"
)

func main() {
	jobs, results := make(chan int), make(chan int)
	var group sync.WaitGroup
	for range 2 {
		group.Add(1)
		go func() {
			defer group.Done()
			for value := range jobs {
				results <- value * value
			}
		}()
	}
	go func() {
		for value := 1; value <= 4; value++ {
			jobs <- value
		}
		close(jobs)
		group.Wait()
		close(results)
	}()
	var values []int
	for result := range results {
		values = append(values, result)
	}
	sort.Ints(values)
	fmt.Println(values)
}
