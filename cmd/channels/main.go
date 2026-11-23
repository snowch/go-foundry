package main

import (
	"fmt"
	"sync"
)

// Each worker receives an independent job. The WaitGroup lets one closer wait
// until every sender is finished before closing results.
func squares(values []int) (int, int) {
	jobs := make(chan int)
	results := make(chan int)
	var workers sync.WaitGroup
	for range 2 {
		workers.Go(func() {
			for value := range jobs {
				results <- value * value
			}
		})
	}
	go func() {
		for _, value := range values {
			jobs <- value
		}
		close(jobs)
	}()
	go func() {
		workers.Wait()
		close(results)
	}()
	count, total := 0, 0
	for result := range results {
		count++
		total += result
	}
	return count, total
}

func main() {
	count, total := squares([]int{2, 3, 4})
	fmt.Println("received", count)
	fmt.Println("sum", total)
}
