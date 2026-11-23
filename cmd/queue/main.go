package main

import (
	"fmt"
)

type Queue []int

func (q *Queue) take() (int, bool) {
	if len(*q) == 0 {
		return 0, false
	}
	v := (*q)[0]
	*q = (*q)[1:]
	return v, true
}

func main() {
	queue := Queue{3, 8}
	value, ok := queue.take()
	fmt.Println("first", value, ok, "remaining", queue)
}
